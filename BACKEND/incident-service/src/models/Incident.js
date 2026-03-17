const prisma = require('../db');

class Incident {
    static async create(citizenName, citizenPhone, incidentType, latitude, longitude, locationDescription, notes, createdBy) {
        try {
            const incident = await prisma.incident.create({
                data: {
                    title: `${incidentType} - ${locationDescription || 'Unknown Location'}`,
                    description: notes || null,
                    type: incidentType,
                    location: locationDescription || 'Unknown',
                    latitude: latitude,
                    longitude: longitude,
                    reporterName: citizenName,
                    reporterPhone: citizenPhone,
                    createdBy: createdBy || null,
                    status: 'CREATED',
                },
            });

            return {
                incident_id: incident.incidentId,
                title: incident.title,
                description: incident.description,
                type: incident.type,
                location: incident.location,
                region: incident.region,
                latitude: incident.latitude,
                longitude: incident.longitude,
                severity: incident.severity,
                status: incident.status,
                reporter_name: incident.reporterName,
                reporter_phone: incident.reporterPhone,
                created_by: incident.createdBy,
                created_at: incident.createdAt,
                updated_at: incident.updatedAt,
            };
        } catch (err) {
            console.error('❌ Incident creation error:', err);
            throw new Error(`Incident creation failed: ${err.message}`);
        }
    }

    static async findById(incidentId) {
        try {
            const incident = await prisma.incident.findUnique({
                where: { incidentId },
                include: { assignedResponder: true },
            });

            if (!incident) return null;

            return {
                incident_id: incident.incidentId,
                title: incident.title,
                description: incident.description,
                type: incident.type,
                location: incident.location,
                region: incident.region,
                latitude: incident.latitude,
                longitude: incident.longitude,
                severity: incident.severity,
                status: incident.status,
                assigned_responder_id: incident.assignedResponderId,
                reporter_name: incident.reporterName,
                reporter_phone: incident.reporterPhone,
                created_by: incident.createdBy,
                created_at: incident.createdAt,
                updated_at: incident.updatedAt,
                resolved_at: incident.resolvedAt,
                assigned_responder: incident.assignedResponder ? {
                    responder_id: incident.assignedResponder.responderId,
                    name: incident.assignedResponder.name,
                    type: incident.assignedResponder.type,
                } : null,
            };
        } catch (err) {
            console.error('❌ Find incident error:', err);
            throw new Error(`Failed to find incident: ${err.message}`);
        }
    }

    static async getOpenIncidents(limit = 50, offset = 0, incidentType = null) {
        try {
            const where = {
                status: { not: 'RESOLVED' },
            };

            if (incidentType) {
                where.type = incidentType;
            }

            const incidents = await prisma.incident.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: offset,
                include: { assignedResponder: true },
            });

            return incidents.map(incident => ({
                incident_id: incident.incidentId,
                title: incident.title,
                description: incident.description,
                type: incident.type,
                location: incident.location,
                region: incident.region,
                latitude: incident.latitude,
                longitude: incident.longitude,
                severity: incident.severity,
                status: incident.status,
                assigned_responder_id: incident.assignedResponderId,
                reporter_name: incident.reporterName,
                reporter_phone: incident.reporterPhone,
                created_at: incident.createdAt,
                updated_at: incident.updatedAt,
            }));
        } catch (err) {
            console.error('❌ Get open incidents error:', err);
            throw new Error(`Failed to fetch open incidents: ${err.message}`);
        }
    }

    static async updateStatus(incidentId, status) {
        try {
            const data = { status };
            if (status === 'RESOLVED') {
                data.resolvedAt = new Date();
            }

            const incident = await prisma.incident.update({
                where: { incidentId },
                data,
            });

            return {
                incident_id: incident.incidentId,
                title: incident.title,
                status: incident.status,
                updated_at: incident.updatedAt,
                resolved_at: incident.resolvedAt,
            };
        } catch (err) {
            console.error('❌ Update incident status error:', err);
            if (err.code === 'P2025') return null; // Record not found
            throw new Error(`Failed to update incident: ${err.message}`);
        }
    }

    static async assignResponder(incidentId, responderId, responderType) {
        try {
            const incident = await prisma.incident.update({
                where: { incidentId },
                data: {
                    assignedResponderId: responderId,
                    status: 'DISPATCHED',
                },
            });

            // Also create a link in the junction table
            await prisma.incidentResponder.upsert({
                where: {
                    incidentId_responderId: {
                        incidentId: incidentId,
                        responderId: responderId,
                    },
                },
                update: {},
                create: {
                    incidentId: incidentId,
                    responderId: responderId,
                },
            });

            return {
                incident_id: incident.incidentId,
                title: incident.title,
                status: incident.status,
                assigned_responder_id: incident.assignedResponderId,
                updated_at: incident.updatedAt,
            };
        } catch (err) {
            console.error('❌ Assign responder error:', err);
            if (err.code === 'P2025') return null;
            throw new Error(`Failed to assign responder: ${err.message}`);
        }
    }

    static async resolveIncident(incidentId) {
        try {
            const incident = await prisma.incident.update({
                where: { incidentId },
                data: {
                    status: 'RESOLVED',
                    resolvedAt: new Date(),
                },
            });

            return {
                incident_id: incident.incidentId,
                title: incident.title,
                status: incident.status,
                resolved_at: incident.resolvedAt,
                updated_at: incident.updatedAt,
            };
        } catch (err) {
            console.error('❌ Resolve incident error:', err);
            if (err.code === 'P2025') return null;
            throw new Error(`Failed to resolve incident: ${err.message}`);
        }
    }
}

module.exports = Incident;
