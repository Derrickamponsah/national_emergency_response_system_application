const Incident = require('../models/Incident');
const Responder = require('../models/Responder');
const { findNearestResponder } = require('../utils/haversine');
const { connectRabbitMQ, publishEvent } = require('../utils/rabbit');
require('dotenv').config();

// Connect to RabbitMQ immediately
connectRabbitMQ();


class IncidentController {
    static async createIncident(req, res) {
        try {
            const { citizen_name, citizen_phone, incident_type, latitude, longitude, location_description, notes } = req.body;

            // Validate required fields
            if (!citizen_name || !citizen_phone || !incident_type || latitude === undefined || longitude === undefined) {
                return res.status(400).json({
                    error: 'Missing required fields',
                    code: 'MISSING_FIELDS'
                });
            }

            // Normalize incident type to match Prisma Enum
            let normalizedType = incident_type;
            if (incident_type === 'ACCIDENT') normalizedType = 'ROAD_ACCIDENT';
            if (incident_type === 'SECURITY' || incident_type === 'POLICE') normalizedType = 'CRIME';

            // Create incident
            const incident = await Incident.create(
                citizen_name,
                citizen_phone,
                normalizedType,
                latitude,
                longitude,
                location_description,
                notes,
                req.userId,
                req.body.severity || 'MEDIUM'
            );

            // Find nearest responder based on incident type
            let responderType = normalizedType === 'MEDICAL' ? 'HOSPITAL' :
                normalizedType === 'FIRE' ? 'FIRE_STATION' :
                    normalizedType === 'CRIME' ? 'POLICE' : 
                        normalizedType === 'ROAD_ACCIDENT' ? 'POLICE' : null;

            if (responderType) {
                const responders = await Responder.getAvailableResponders(responderType);
                const nearest = findNearestResponder(latitude, longitude, responders);

                if (nearest) {
                    // Assign the responder
                    await Incident.assignResponder(incident.incident_id, nearest.responder_id, responderType);
                    console.log(`✅ Incident created and assigned to nearest responder: ${nearest.name} (${nearest.distance}km away)`);
                } else {
                    console.log(`⚠️  Incident created but no available responder found for type: ${responderType}`);
                }
            }

            // ============================================
            // RABBITMQ EVENT PUBLISHING
            // ============================================
            const eventPayload = {
                incident_id: incident.incident_id,
                title: incident.title,
                type: incident.type,
                latitude: latitude,
                longitude: longitude,
                location: incident.location,
                severity: incident.severity,
                reporter_name: incident.reporter_name,
                reporter_phone: incident.reporter_phone,
                notes: incident.description,
                assigned_responder_id: incident.assigned_responder_id || null,
                timestamp: incident.created_at
            };

            await publishEvent('incident.created', eventPayload);

            // ============================================
            // SOCKET.IO REAL-TIME BROADCAST TO FRONTEND
            // ============================================
            try {
                const { getIO } = require('../utils/socket');
                const { broadcastIncidentUpdate } = require('../utils/socketRoleHelper');
                const io = getIO();
                
                // Format correctly for the frontend expecting standard incident shape
                const incidentUpdate = {
                    id: incident.incident_id,
                    incident_id: incident.incident_id,
                    type: incident.type,
                    incident_type: incident.type,
                    location_description: incident.location,
                    location: incident.location,
                    status: incident.status,
                    latitude: incident.latitude,
                    longitude: incident.longitude,
                    // Extra frontend fields
                    title: incident.title,
                    description: incident.description,
                    color: incident.type === 'FIRE' ? 'orange' : incident.type === 'MEDICAL' ? 'blue' : 'rose'
                };
                
                // Use role-based broadcasting
                broadcastIncidentUpdate(io, incidentUpdate);
            } catch (socketErr) {
                console.warn(`⚠️ Socket broadcast failed (often expected in testing if not initialized):`, socketErr.message);
            }

            return res.status(201).json({
                message: 'Incident created successfully',
                incident: incident
            });

        } catch (err) {
            console.error('❌ Create incident error:', err);
            return res.status(500).json({
                error: 'Failed to create incident',
                code: 'CREATE_ERROR'
            });
        }
    }

    static async getIncident(req, res) {
        try {
            const { id } = req.params;
            const incident = await Incident.findById(id);

            if (!incident) {
                return res.status(404).json({
                    error: 'Incident not found',
                    code: 'NOT_FOUND'
                });
            }

            // Check role-based access
            if (req.incidentTypeFilter && !req.incidentTypeFilter.includes(incident.type)) {
                return res.status(403).json({
                    error: 'Access denied - incident type not allowed for your role',
                    code: 'FORBIDDEN',
                    incident_type: incident.type,
                    allowed_types: req.incidentTypeFilter
                });
            }

            return res.json(incident);
        } catch (err) {
            console.error('❌ Get incident error:', err);
            return res.status(500).json({
                error: 'Failed to fetch incident',
                code: 'FETCH_ERROR'
            });
        }
    }

    static async getOpenIncidents(req, res) {
        try {
            const { limit = 50, offset = 0, type } = req.query;
            
            // Determine which incident types to fetch based on role
            let queryType = type;
            if (req.incidentTypeFilter) {
                // If role has restrictions, use them
                if (type && !req.incidentTypeFilter.includes(type)) {
                    // User requested a type outside their allowed types
                    return res.json({
                        incidents: [],
                        count: 0,
                        limit: parseInt(limit),
                        offset: parseInt(offset),
                        filtered: true,
                        reason: `Type '${type}' not allowed for role`
                    });
                }
                // If no specific type requested, fetch from allowed types
                queryType = req.incidentTypeFilter.length === 1 ? req.incidentTypeFilter[0] : null;
            }
            
            const incidents = await Incident.getOpenIncidents(parseInt(limit), parseInt(offset), queryType);
            
            // Additional filter if multiple types allowed (for Police)
            let filteredIncidents = incidents;
            if (req.incidentTypeFilter && Array.isArray(req.incidentTypeFilter) && req.incidentTypeFilter.length > 1) {
                filteredIncidents = incidents.filter(inc => req.incidentTypeFilter.includes(inc.type));
            }

            return res.json({
                incidents: filteredIncidents,
                count: filteredIncidents.length,
                limit: parseInt(limit),
                offset: parseInt(offset)
            });
        } catch (err) {
            console.error('❌ Get open incidents error:', err);
            return res.status(500).json({
                error: 'Failed to fetch open incidents',
                code: 'FETCH_ERROR'
            });
        }
    }

    static async updateIncidentStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            const validStatuses = ['CREATED', 'DISPATCHED', 'IN_PROGRESS', 'RESOLVED'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
                    code: 'INVALID_STATUS'
                });
            }

            const incident = await Incident.updateStatus(id, status);

            if (!incident) {
                return res.status(404).json({
                    error: 'Incident not found',
                    code: 'NOT_FOUND'
                });
            }

            console.log(`✅ Incident ${id} status updated to ${status}`);
            return res.json({
                message: 'Incident status updated',
                incident: incident
            });
        } catch (err) {
            console.error('❌ Update incident status error:', err);
            return res.status(500).json({
                error: 'Failed to update incident',
                code: 'UPDATE_ERROR'
            });
        }
    }

    static async assignResponder(req, res) {
        try {
            const { id } = req.params;
            const { unit_id, unit_type } = req.body;

            if (!unit_id || !unit_type) {
                return res.status(400).json({
                    error: 'unit_id and unit_type are required',
                    code: 'MISSING_FIELDS'
                });
            }

            const incident = await Incident.assignResponder(id, unit_id, unit_type);

            if (!incident) {
                return res.status(404).json({
                    error: 'Incident not found',
                    code: 'NOT_FOUND'
                });
            }

            console.log(`✅ Responder assigned to incident ${id}`);
            return res.json({
                message: 'Responder assigned',
                incident: incident
            });
        } catch (err) {
            console.error('❌ Assign responder error:', err);
            return res.status(500).json({
                error: 'Failed to assign responder',
                code: 'ASSIGN_ERROR'
            });
        }
    }
    static async deleteIncident(req, res) {
        try {
            const { id } = req.params;
            const success = await Incident.delete(id);

            if (!success) {
                return res.status(404).json({
                    error: 'Incident not found',
                    code: 'NOT_FOUND'
                });
            }

            return res.json({
                message: 'Incident deleted successfully'
            });
        } catch (err) {
            console.error('❌ Delete incident error:', err);
            return res.status(500).json({
                error: 'Failed to delete incident',
                code: 'DELETE_ERROR'
            });
        }
    }

    static async updateIncident(req, res) {
        try {
            const { id } = req.params;
            const updated = await Incident.updateFull(id, req.body);

            if (!updated) {
                return res.status(404).json({
                    error: 'Incident not found',
                    code: 'NOT_FOUND'
                });
            }

            return res.json({
                message: 'Incident updated successfully',
                incident: updated
            });
        } catch (err) {
            console.error('❌ Update incident error:', err);
            return res.status(500).json({
                error: 'Failed to update incident',
                code: 'UPDATE_ERROR'
            });
        }
    }
}

module.exports = IncidentController;
