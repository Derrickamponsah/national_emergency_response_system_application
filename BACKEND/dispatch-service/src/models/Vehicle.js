const { getDB } = require('../db');

class Vehicle {
    /**
     * Register a new vehicle in the system
     */
    static async register(data) {
        try {
            const prisma = getDB();

            const vehicle = await prisma.vehicle.create({
                data: {
                    registrationNumber: data.registrationNumber,
                    type: data.type,
                    region: data.region,
                    capacity: data.capacity || 4,
                    driverName: data.driverName || 'Unassigned',
                    driverPhone: data.driverPhone || 'N/A',
                    status: 'IDLE',
                    currentLatitude: data.latitude !== undefined ? parseFloat(data.latitude) : 0.0,
                    currentLongitude: data.longitude !== undefined ? parseFloat(data.longitude) : 0.0,
                    fuelLevel: 100,
                    isActive: true
                },
            });

            console.log(`✅ Vehicle registered: ${vehicle.vehicleId}`);
            return {
                vehicle_id: vehicle.vehicleId,
                registration_number: vehicle.registrationNumber,
                type: vehicle.type,
                region: vehicle.region,
                status: vehicle.status,
                driver_name: vehicle.driverName,
                created_at: vehicle.createdAt,
            };
        } catch (err) {
            console.error('❌ Vehicle registration error:', err);
            throw new Error(`Vehicle registration failed: ${err.message}`);
        }
    }

    /**
     * Find a vehicle by ID
     */
    static async findById(vehicle_id) {
        try {
            const prisma = getDB();

            const vehicle = await prisma.vehicle.findUnique({
                where: { vehicleId: vehicle_id },
            });

            if (!vehicle) return null;

            return {
                vehicle_id: vehicle.vehicleId,
                registration_number: vehicle.registrationNumber,
                type: vehicle.type,
                driver_name: vehicle.driverName,
                driver_phone: vehicle.driverPhone,
                current_location: {
                    latitude: vehicle.currentLatitude || 0,
                    longitude: vehicle.currentLongitude || 0,
                },
                status: vehicle.status,
                fuel_level: vehicle.fuelLevel,
                region: vehicle.region,
                is_active: vehicle.isActive,
                last_seen: vehicle.updatedAt,
            };
        } catch (err) {
            console.error('❌ Find vehicle error:', err);
            throw new Error(`Failed to find vehicle: ${err.message}`);
        }
    }

    /**
     * Update vehicle GPS location
     */
    static async updateLocation(vehicle_id, latitude, longitude, speed_kmh = 0) {
        try {
            const prisma = getDB();

            // Update vehicle current location
            await prisma.vehicle.update({
                where: { vehicleId: vehicle_id },
                data: {
                    currentLatitude: latitude,
                    currentLongitude: longitude,
                },
            });

            // Store in location history for tracking
            await prisma.locationHistory.create({
                data: {
                    vehicleId: vehicle_id,
                    latitude: latitude,
                    longitude: longitude,
                    speed: speed_kmh,
                },
            });

            console.log(`✅ Location updated for vehicle: ${vehicle_id}`);
            return { success: true };
        } catch (err) {
            console.error('❌ Update location error:', err);
            throw new Error(`Failed to update location: ${err.message}`);
        }
    }

    /**
     * Get all vehicles with optional status filter
     */
    static async getAllVehicles(status = null) {
        try {
            const prisma = getDB();

            const where = { isActive: true };
            if (status) {
                where.status = status;
            }

            const vehicles = await prisma.vehicle.findMany({
                where,
                orderBy: { updatedAt: 'desc' },
            });

            return vehicles.map(vehicle => ({
                vehicle_id: vehicle.vehicleId,
                registration_number: vehicle.registrationNumber,
                type: vehicle.type,
                driver_name: vehicle.driverName,
                driver_phone: vehicle.driverPhone,
                current_location: {
                    latitude: vehicle.currentLatitude || 0,
                    longitude: vehicle.currentLongitude || 0,
                },
                status: vehicle.status,
                fuel_level: vehicle.fuelLevel,
                region: vehicle.region,
                is_active: vehicle.isActive,
                last_seen: vehicle.updatedAt,
            }));
        } catch (err) {
            console.error('❌ Get all vehicles error:', err);
            throw new Error(`Failed to fetch vehicles: ${err.message}`);
        }
    }

    /**
     * Get location history for a vehicle
     */
    static async getLocationHistory(vehicle_id, limit = 100) {
        try {
            const prisma = getDB();

            const history = await prisma.locationHistory.findMany({
                where: { vehicleId: vehicle_id },
                orderBy: { recordedAt: 'desc' },
                take: limit,
            });

            return history.map(record => ({
                recorded_at: record.recordedAt,
                latitude: record.latitude,
                longitude: record.longitude,
                speed_kmh: record.speed || 0,
                heading: record.heading,
                accuracy: record.accuracy,
            }));
        } catch (err) {
            console.error('❌ Get location history error:', err);
            throw new Error(`Failed to fetch location history: ${err.message}`);
        }
    }

    /**
     * Update vehicle status
     */
    static async updateStatus(vehicle_id, status) {
        try {
            const prisma = getDB();

            const vehicle = await prisma.vehicle.update({
                where: { vehicleId: vehicle_id },
                data: { status },
            });

            return !!vehicle;
        } catch (err) {
            console.error('❌ Update vehicle status error:', err);
            if (err.code === 'P2025') return false;
            throw new Error(`Failed to update vehicle status: ${err.message}`);
        }
    }

    /**
     * Assign an incident to a vehicle
     */
    static async assignIncident(vehicle_id, incident_id) {
        try {
            const prisma = getDB();

            // Create assignment record
            await prisma.vehicleAssignment.create({
                data: {
                    vehicleId: vehicle_id,
                    incidentId: incident_id,
                    status: 'ASSIGNED',
                },
            });

            // Update vehicle status to DISPATCHED
            await prisma.vehicle.update({
                where: { vehicleId: vehicle_id },
                data: { status: 'DISPATCHED' },
            });

            console.log(`✅ Incident ${incident_id} assigned to vehicle ${vehicle_id}`);
            return { success: true };
        } catch (err) {
            console.error('❌ Assign incident error:', err);
            throw new Error(`Failed to assign incident: ${err.message}`);
        }
    }
    /**
     * Update vehicle details (admin)
     */
    static async update(vehicle_id, data) {
        try {
            const prisma = getDB();

            const vehicle = await prisma.vehicle.update({
                where: { vehicleId: vehicle_id },
                data: {
                    registrationNumber: data.registrationNumber,
                    type: data.type,
                    region: data.region,
                    capacity: data.capacity,
                    driverName: data.driverName,
                    driverPhone: data.driverPhone,
                    status: data.status,
                    isActive: data.isActive !== undefined ? data.isActive : true,
                    ...(data.latitude !== undefined && { currentLatitude: parseFloat(data.latitude) }),
                    ...(data.longitude !== undefined && { currentLongitude: parseFloat(data.longitude) })
                },
            });

            return !!vehicle;
        } catch (err) {
            console.error('❌ Update vehicle error:', err);
            if (err.code === 'P2025') return false;
            throw new Error(`Failed to update vehicle: ${err.message}`);
        }
    }

    /**
     * Delete vehicle (admin)
     */
    static async delete(vehicle_id) {
        try {
            const prisma = getDB();

            await prisma.vehicle.delete({
                where: { vehicleId: vehicle_id },
            });

            return true;
        } catch (err) {
            console.error('❌ Delete vehicle error:', err);
            if (err.code === 'P2025') return false;
            throw new Error(`Failed to delete vehicle: ${err.message}`);
        }
    }
}

module.exports = Vehicle;
