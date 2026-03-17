// ============================================
// ANALYTICS CONTROLLER - ANALYTICS SERVICE
// ============================================
const prisma = require('../db');

class AnalyticsController {
    /**
     * Entry point for incoming RabbitMQ events
     * @param {object} eventPayload - The event data from RabbitMQ
     */
    static async handleEvent(eventPayload) {
        try {
            const { event, data, timestamp } = eventPayload;

            console.log(`📡 Analytics Processing: ${event} for ${data.incident_id}`);

            switch (event) {
                case 'incident.created':
                    return await this.trackNewIncident(data);

                case 'incident.updated':
                    // Map to analytics update logic
                    return true;

                default:
                    return true;
            }
        } catch (err) {
            console.error('❌ Error in AnalyticsController.handleEvent:', err);
            return false;
        }
    }

    /**
     * Log new incident for historical analysis
     * @param {object} data - Detailed incident info
     */
    static async trackNewIncident(data) {
        try {
            console.log(`📊 Logging analytics event for ${data.type} in ${data.location}`);

            // Create an entry in incident_events (Analytics Database)
            await prisma.incidentEvent.create({
                data: {
                    incidentId: data.incident_id, // Map UUID
                    incidentType: data.type,
                    location: data.location,
                    region: data.region || 'Unknown',
                    severity: data.severity,
                    status: 'REPORTED',
                    createdAt: new Date(data.timestamp)
                }
            });

            console.log('✅ Analytics tracking complete.');
            return true;
        } catch (err) {
            console.error('❌ Analytics tracking error:', err);
            return false;
        }
    }
    /**
     * Get average response times
     */
    static async getResponseTimes(req, res) {
        try {
            const { type, region } = req.query;
            const where = {};
            if (type) where.incidentType = type;
            if (region) where.region = region;

            // Simple aggregation for proof of concept
            const events = await prisma.incidentEvent.findMany({ where });
            const avg = events.length > 0 ?
                events.reduce((acc, curr) => acc + curr.responseTimeSeconds, 0) / events.length : 0;

            return res.json({
                average_response_time_seconds: Math.round(avg),
                total_incidents_analyzed: events.length
            });
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }

    /**
     * Get incident counts by region
     */
    static async getIncidentsByRegion(req, res) {
        try {
            const groups = await prisma.incidentEvent.groupBy({
                by: ['region', 'incidentType'],
                _count: { _all: true }
            });
            return res.json(groups);
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }

    /**
     * Get resource utilization stats
     */
    static async getResourceUtilization(req, res) {
        try {
            const utils = await prisma.resourceUtilization.findMany({
                orderBy: { recordedAt: 'desc' },
                take: 10
            });
            return res.json(utils);
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }

    /**
     * Get daily summary
     */
    static async getDailySummary(req, res) {
        try {
            const { date } = req.query;
            const targetDate = date ? new Date(date) : new Date();
            targetDate.setHours(0, 0, 0, 0);

            const summary = await prisma.dailySummary.findFirst({
                where: { summaryDate: targetDate }
            });

            return res.json(summary || { message: 'No summary for this date' });
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }
}

module.exports = AnalyticsController;
