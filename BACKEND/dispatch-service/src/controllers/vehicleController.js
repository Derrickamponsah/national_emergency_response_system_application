const Vehicle = require('../models/Vehicle');
require('dotenv').config();

class VehicleController {
    static async registerVehicle(req, res) {
        try {
            const { registrationNumber, type, region, capacity, driverName, driverPhone, latitude, longitude } = req.body;

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
                driverPhone,
                latitude,
                longitude
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

            // Apply role-based vehicle type filtering
            let filteredVehicles = vehicles;
            if (req.vehicleTypeFilter) {
                filteredVehicles = vehicles.filter(v => v.type === req.vehicleTypeFilter);
            }

            return res.json({
                vehicles: filteredVehicles,
                count: filteredVehicles.length,
                filtered: !!req.vehicleTypeFilter,
                filter_type: req.vehicleTypeFilter || null
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

            // Check role-based vehicle access
            if (req.vehicleTypeFilter && vehicle.type !== req.vehicleTypeFilter) {
                return res.status(403).json({
                    error: 'Access denied - vehicle type not allowed for your role',
                    code: 'FORBIDDEN',
                    vehicle_type: vehicle.type,
                    allowed_type: req.vehicleTypeFilter
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

            // First fetch vehicle to check role-based access
            const vehicle = await Vehicle.findById(id);
            if (!vehicle) {
                return res.status(404).json({
                    error: 'Vehicle not found',
                    code: 'NOT_FOUND'
                });
            }

            // Check role-based vehicle access
            if (req.vehicleTypeFilter && vehicle.type !== req.vehicleTypeFilter) {
                return res.status(403).json({
                    error: 'Access denied - vehicle type not allowed for your role',
                    code: 'FORBIDDEN',
                    vehicle_type: vehicle.type,
                    allowed_type: req.vehicleTypeFilter
                });
            }

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

    /**
     * Update vehicle details (admin)
     */
    static async updateVehicle(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            const success = await Vehicle.update(id, updateData);

            if (!success) {
                return res.status(404).json({
                    error: 'Vehicle not found or update failed',
                    code: 'UPDATE_FAILED'
                });
            }

            return res.json({
                message: 'Vehicle updated successfully'
            });
        } catch (err) {
            console.error('❌ Update vehicle error:', err);
            return res.status(500).json({
                error: 'Failed to update vehicle',
                code: 'UPDATE_ERROR'
            });
        }
    }

    /**
     * Delete vehicle (admin)
     */
    static async deleteVehicle(req, res) {
        try {
            const { id } = req.params;

            const success = await Vehicle.delete(id);

            if (!success) {
                return res.status(404).json({
                    error: 'Vehicle not found or delete failed',
                    code: 'DELETE_FAILED'
                });
            }

            return res.json({
                message: 'Vehicle deleted successfully'
            });
        } catch (err) {
            console.error('❌ Delete vehicle error:', err);
            return res.status(500).json({
                error: 'Failed to delete vehicle',
                code: 'DELETE_ERROR'
            });
        }
    }
}

module.exports = VehicleController;
