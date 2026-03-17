const prisma = require('../db');

class Analytics {
    static async recordIncidentEvent(incidentId, eventType, incidentType, region, latitude, longitude, responderType = null, responseTime = null, resolutionTime = null) {
        try {
            const event = await prisma.incidentEvent.create({
                data: {
                    incidentId,
                    incidentType,
                    location: `${latitude}, ${longitude}`,
                    region: region || null,
                    severity: 'MEDIUM',
                    responseTimeSeconds: responseTime || 0,
                    resolutionTimeSeconds: resolutionTime || 0,
                    status: eventType === 'RESOLVED' ? 'RESOLVED' :
                        eventType === 'DISPATCHED' ? 'RESPONSE_INITIATED' :
                            eventType === 'IN_PROGRESS' ? 'IN_PROGRESS' : 'REPORTED',
                },
            });

            return {
                event_id: event.eventId,
                incident_id: event.incidentId,
                incident_type: event.incidentType,
                status: event.status,
                created_at: event.createdAt,
            };
        } catch (err) {
            console.error('❌ Record incident event error:', err);
            throw new Error(`Failed to record event: ${err.message}`);
        }
    }

    static async getAverageResponseTimes(fromDate = null, toDate = null, incidentType = null, region = null) {
        try {
            const where = {
                responseTimeSeconds: { not: null },
            };

            if (fromDate) where.createdAt = { ...(where.createdAt || {}), gte: new Date(fromDate) };
            if (toDate) where.createdAt = { ...(where.createdAt || {}), lte: new Date(toDate) };
            if (incidentType) where.incidentType = incidentType;
            if (region) where.region = region;

            const result = await prisma.incidentEvent.aggregate({
                where,
                _avg: {
                    responseTimeSeconds: true,
                },
            });

            return {
                avg_response_time: result._avg.responseTimeSeconds,
            };
        } catch (err) {
            console.error('❌ Get response times error:', err);
            throw new Error(`Failed to fetch response times: ${err.message}`);
        }
    }

    static async getIncidentsByRegion(fromDate = null, toDate = null) {
        try {
            const where = {
                status: 'REPORTED',
            };

            if (fromDate) where.createdAt = { ...(where.createdAt || {}), gte: new Date(fromDate) };
            if (toDate) where.createdAt = { ...(where.createdAt || {}), lte: new Date(toDate) };

            const results = await prisma.incidentEvent.groupBy({
                by: ['region', 'incidentType'],
                where,
                _count: {
                    _all: true,
                },
                orderBy: {
                    _count: {
                        region: 'desc',
                    },
                },
            });

            return results.map(r => ({
                region: r.region,
                incident_type: r.incidentType,
                count: r._count._all,
            }));
        } catch (err) {
            console.error('❌ Get incidents by region error:', err);
            throw new Error(`Failed to fetch incidents by region: ${err.message}`);
        }
    }

    static async getResourceUtilization(fromDate = null, toDate = null) {
        try {
            const where = {};

            if (fromDate) where.createdAt = { ...(where.createdAt || {}), gte: new Date(fromDate) };
            if (toDate) where.createdAt = { ...(where.createdAt || {}), lte: new Date(toDate) };

            // Use resource utilization table
            const results = await prisma.resourceUtilization.findMany({
                where: fromDate || toDate ? {
                    recordedAt: {
                        ...(fromDate ? { gte: new Date(fromDate) } : {}),
                        ...(toDate ? { lte: new Date(toDate) } : {}),
                    },
                } : {},
                orderBy: { recordedAt: 'desc' },
            });

            return results.map(r => ({
                resource_type: r.resourceType,
                total_resources: r.totalResources,
                busy_resources: r.busyResources,
                idle_resources: r.idleResources,
                utilization_percentage: r.utilizationPercentage ? parseFloat(r.utilizationPercentage) : 0,
                region: r.region,
                date_recorded: r.dateRecorded,
            }));
        } catch (err) {
            console.error('❌ Get resource utilization error:', err);
            throw new Error(`Failed to fetch resource utilization: ${err.message}`);
        }
    }

    static async getDailySummary(date) {
        try {
            const targetDate = new Date(date);
            targetDate.setHours(0, 0, 0, 0);

            const summary = await prisma.dailySummary.findUnique({
                where: { summaryDate: targetDate },
            });

            if (!summary) return {};

            return {
                date: summary.summaryDate,
                total_incidents: summary.totalIncidents,
                medical_incidents: summary.medicalIncidents,
                fire_incidents: summary.fireIncidents,
                crime_incidents: summary.crimeIncidents,
                road_incidents: summary.roadIncidents,
                critical_incidents: summary.criticalIncidents,
                high_priority_incidents: summary.highPriorityIncidents,
                avg_response_time: summary.avgResponseTimeSeconds,
                avg_resolution_time: summary.avgResolutionTimeSeconds,
                total_responders_deployed: summary.totalRespondersDeployed,
                total_vehicles_deployed: summary.totalVehiclesDeployed,
            };
        } catch (err) {
            console.error('❌ Get daily summary error:', err);
            throw new Error(`Failed to fetch daily summary: ${err.message}`);
        }
    }
}

module.exports = Analytics;
