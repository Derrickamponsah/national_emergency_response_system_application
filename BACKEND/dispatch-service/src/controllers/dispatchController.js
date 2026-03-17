// ============================================
// DISPATCH CONTROLLER - DISPATCH SERVICE (HANDLING EVENTS)
// ============================================
const { prisma } = require('../db');

class DispatchController {
    /**
     * Entry point for incoming RabbitMQ events
     * @param {object} eventPayload - The event data from RabbitMQ
     */
    static async handleEvent(eventPayload) {
        try {
            const { event, data, timestamp } = eventPayload;

            console.log(`📡 Processing Event: ${event} for ${data.incident_id}`);

            switch (event) {
                case 'incident.created':
                    return await this.autoAssignVehicle(data);

                case 'incident.updated':
                    // Just update local tracking record if you want
                    return true;

                default:
                    console.warn(`⚠️ Unhandled Event Type: ${event}`);
                    return true; // Still Ack as we can't do anything with it
            }
        } catch (err) {
            console.error('❌ Error in DispatchController.handleEvent:', err);
            return false; // Result in nack/re-queue
        }
    }

    /**
     * Automatic vehicle assignment based on incident location and type
     * @param {object} incidentData - Incident data (lat, lon, etc.)
     */
    static async autoAssignVehicle(incidentData) {
        try {
            console.log('🚛 Looking for available vehicles...');

            // Logically map incident types to vehicle types
            const vehicleTypeMap = {
                'MEDICAL': 'AMBULANCE',
                'FIRE': 'FIRE_TRUCK',
                'CRIME': 'POLICE_CAR',
                'ROAD_ACCIDENT': 'AMBULANCE' // Or both fire/police but let's start simple
            };

            const requiredVehicleType = vehicleTypeMap[incidentData.type] || 'POLICE_CAR';

            // Find available vehicle of matching type
            const vehicle = await prisma.vehicle.findFirst({
                where: {
                    type: requiredVehicleType,
                    status: 'IDLE',
                    isActive: true
                }
            });

            if (!vehicle) {
                console.warn(`⚠️ No available ${requiredVehicleType} for incident ${incidentData.incident_id}. Placing in Pending.`);
                return true; // We ack but we couldn't assign one immediately
            }

            console.log(`✅ Automated Dispatch: Assigning ${vehicle.registrationNumber} to ${incidentData.incident_id}`);

            // Update Vehicle Status
            await prisma.vehicle.update({
                where: { vehicleId: vehicle.vehicleId },
                data: { status: 'DISPATCHED' }
            });

            // Create Vehicle Assignment record in Dispatch Service DB (MongoDB)
            // Note: MongoDB uses auto-generated ObjectIDs but we map them as strings in Prisma usually
            await prisma.vehicleAssignment.create({
                data: {
                    vehicleId: vehicle.vehicleId,
                    incidentId: incidentData.incident_id, // This is the PostgreSQL UUID from incident-service
                    assignmentType: 'DISPATCH',
                    status: 'ASSIGNED',
                    notes: `Autodispatched for ${incidentData.type} at ${incidentData.location}`,
                    assignedAt: new Date()
                }
            });

            console.log(`🎊 Dispatch successful for vehicle: ${vehicle.registrationNumber}`);
            return true;
        } catch (err) {
            console.error('❌ Error during auto-dispatch:', err);
            return false;
        }
    }
}

module.exports = DispatchController;
