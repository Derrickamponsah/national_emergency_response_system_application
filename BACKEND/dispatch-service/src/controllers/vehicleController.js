const Vehicle = require('../models/Vehicle');
require('dotenv').config();

class VehicleController {
    static async registerVehicle(req, res) {
        try {
            const { registrationNumber, type, region, capacity, driverName, driverPhone } = req.body;

            if (!registrationNumber || !type) {
                return res.status(400).json({
                    error: 'registrationNumber and type are required',
                    code: 'MISSING_FIELDS'
                });
            }

            const vehicle = await Vehicle.register({
                registrationNumber,
                type,
                region,
                capacity,
                driverName,
                driverPhone
            });

            console.log(`✅ Vehicle registered successfully`);
            return res.status(201).json({
                message: 'Vehicle registered successfully',
                vehicle: vehicle
            });
        } catch (err) {
            console.error('❌ Register vehicle error:', err);
            return res.status(500).json({
                error: 'Failed to register vehicle',
                code: 'REGISTER_ERROR'
            });
        }
    }

    static async updateLocation(req, res) {
        try {
            const { id } = req.params;
            const { latitude, longitude, speed_kmh } = req.body;

            if (latitude === undefined || longitude === undefined) {
                return res.status(400).json({
                    error: 'latitude and longitude are required',
                    code: 'MISSING_FIELDS'
                });
            }

            await Vehicle.updateLocation(id, latitude, longitude, speed_kmh || 0);

            return res.json({
                success: true,
                message: 'Location updated'
            });
        } catch (err) {
            console.error('❌ Update location error:', err);
            return res.status(500).json({
                error: 'Failed to update location',
                code: 'UPDATE_ERROR'
            });
        }
    }

    static async getVehicles(req, res) {
        try {
            const { status } = req.query;
            const vehicles = await Vehicle.getAllVehicles(status);

            return res.json({
                vehicles: vehicles,
                count: vehicles.length
            });
        } catch (err) {
            console.error('❌ Get vehicles error:', err);
            return res.status(500).json({
                error: 'Failed to fetch vehicles',
                code: 'FETCH_ERROR'
            });
        }
    }

    static async getCurrentLocation(req, res) {
        try {
            const { id } = req.params;
            const vehicle = await Vehicle.findById(id);

            if (!vehicle) {
                return res.status(404).json({
                    error: 'Vehicle not found',
                    code: 'NOT_FOUND'
                });
            }

            return res.json({
                vehicle_id: vehicle.vehicle_id,
                current_location: vehicle.current_location,
                last_seen: vehicle.last_seen,
                status: vehicle.status
            });
        } catch (err) {
            console.error('❌ Get current location error:', err);
            return res.status(500).json({
                error: 'Failed to fetch location',
                code: 'FETCH_ERROR'
            });
        }
    }

    static async getLocationHistory(req, res) {
        try {
            const { id } = req.params;
            const { limit = 100 } = req.query;

            const history = await Vehicle.getLocationHistory(id, parseInt(limit));

            return res.json({
                vehicle_id: id,
                history: history,
                count: history.length
            });
        } catch (err) {
            console.error('❌ Get location history error:', err);
            return res.status(500).json({
                error: 'Failed to fetch location history',
                code: 'FETCH_ERROR'
            });
        }
    }
}

module.exports = VehicleController;
