const Responder = require('../models/Responder');
require('dotenv').config();

class ResponderController {
    static async registerResponder(req, res) {
        try {
            const { name, responder_type, latitude, longitude } = req.body;

            if (!name || !responder_type || latitude === undefined || longitude === undefined) {
                return res.status(400).json({ 
                    error: 'Missing required fields',
                    code: 'MISSING_FIELDS'
                });
            }

            const validTypes = ['POLICE_STATION', 'FIRE_STATION', 'HOSPITAL'];
            if (!validTypes.includes(responder_type)) {
                return res.status(400).json({ 
                    error: `Invalid responder_type. Must be one of: ${validTypes.join(', ')}`,
                    code: 'INVALID_TYPE'
                });
            }

            const responder = await Responder.create(name, responder_type, latitude, longitude);

            console.log(`✅ Responder registered: ${name} (${responder_type})`);
            return res.status(201).json({
                message: 'Responder registered successfully',
                responder: responder
            });
        } catch (err) {
            console.error('❌ Register responder error:', err);
            return res.status(500).json({ 
                error: 'Failed to register responder',
                code: 'REGISTER_ERROR'
            });
        }
    }

    static async getResponders(req, res) {
        try {
            const { type } = req.query;
            const responders = await Responder.getAvailableResponders(type);

            return res.json({
                responders: responders,
                count: responders.length
            });
        } catch (err) {
            console.error('❌ Get responders error:', err);
            return res.status(500).json({ 
                error: 'Failed to fetch responders',
                code: 'FETCH_ERROR'
            });
        }
    }

    static async updateAvailability(req, res) {
        try {
            const { id } = req.params;
            const { is_available } = req.body;

            if (is_available === undefined) {
                return res.status(400).json({ 
                    error: 'is_available field is required',
                    code: 'MISSING_FIELDS'
                });
            }

            const responder = await Responder.updateAvailability(id, is_available);

            if (!responder) {
                return res.status(404).json({ 
                    error: 'Responder not found',
                    code: 'NOT_FOUND'
                });
            }

            console.log(`✅ Responder ${id} availability updated to ${is_available}`);
            return res.json({
                message: 'Responder availability updated',
                responder: responder
            });
        } catch (err) {
            console.error('❌ Update availability error:', err);
            return res.status(500).json({ 
                error: 'Failed to update responder',
                code: 'UPDATE_ERROR'
            });
        }
    }
}

module.exports = ResponderController;
