const prisma = require('../db');

class Responder {
    static async create(name, responderType, latitude, longitude) {
        try {
            const responder = await prisma.responder.create({
                data: {
                    name,
                    email: `${name.toLowerCase().replace(/\s+/g, '.')}@responder.gov.gh`,
                    phone: 'N/A',
                    type: responderType,
                    location: name,
                    latitude: latitude,
                    longitude: longitude,
                    isActive: true,
                },
            });

            return {
                responder_id: responder.responderId,
                name: responder.name,
                responder_type: responder.type,
                latitude: responder.latitude,
                longitude: responder.longitude,
                is_available: responder.isActive,
                created_at: responder.createdAt,
            };
        } catch (err) {
            console.error('❌ Responder creation error:', err);
            throw new Error(`Responder creation failed: ${err.message}`);
        }
    }

    static async findById(responderId) {
        try {
            const responder = await prisma.responder.findUnique({
                where: { responderId },
            });

            if (!responder) return null;

            return {
                responder_id: responder.responderId,
                name: responder.name,
                responder_type: responder.type,
                latitude: responder.latitude ? parseFloat(responder.latitude) : null,
                longitude: responder.longitude ? parseFloat(responder.longitude) : null,
                is_available: responder.isActive,
                capacity: responder.capacity,
                region: responder.region,
                created_at: responder.createdAt,
            };
        } catch (err) {
            console.error('❌ Find responder error:', err);
            throw new Error(`Failed to find responder: ${err.message}`);
        }
    }

    static async getAvailableResponders(responderType = null) {
        try {
            const where = { isActive: true };

            if (responderType) {
                where.type = responderType;
            }

            const responders = await prisma.responder.findMany({
                where,
                orderBy: { createdAt: 'desc' },
            });

            return responders.map(responder => ({
                responder_id: responder.responderId,
                name: responder.name,
                responder_type: responder.type,
                latitude: responder.latitude ? parseFloat(responder.latitude) : null,
                longitude: responder.longitude ? parseFloat(responder.longitude) : null,
                is_available: responder.isActive,
                capacity: responder.capacity,
                region: responder.region,
                created_at: responder.createdAt,
            }));
        } catch (err) {
            console.error('❌ Get available responders error:', err);
            throw new Error(`Failed to fetch responders: ${err.message}`);
        }
    }

    static async updateAvailability(responderId, isAvailable) {
        try {
            const responder = await prisma.responder.update({
                where: { responderId },
                data: { isActive: isAvailable },
            });

            return {
                responder_id: responder.responderId,
                name: responder.name,
                is_available: responder.isActive,
                updated_at: responder.updatedAt,
            };
        } catch (err) {
            console.error('❌ Update responder availability error:', err);
            if (err.code === 'P2025') return null;
            throw new Error(`Failed to update responder: ${err.message}`);
        }
    }
}

module.exports = Responder;
