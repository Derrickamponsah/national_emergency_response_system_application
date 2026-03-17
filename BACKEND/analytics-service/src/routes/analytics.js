const express = require('express');
const AnalyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// ============================================
// ANALYTICS ROUTES - All require authentication
// ============================================

/**
 * @route GET /analytics/response-times
 * @desc Get average incident response times
 * @header Authorization: Bearer <token>
 * @query {from, to, type, region}
 * @returns {average_response_time_seconds}
 */
router.get('/response-times', authMiddleware, AnalyticsController.getResponseTimes);

/**
 * @route GET /analytics/incidents-by-region
 * @desc Get incident count by region and type
 * @header Authorization: Bearer <token>
 * @query {from, to}
 * @returns {incidents_by_region[]}
 */
router.get('/incidents-by-region', authMiddleware, AnalyticsController.getIncidentsByRegion);

/**
 * @route GET /analytics/resource-utilization
 * @desc Get responder resource usage statistics
 * @header Authorization: Bearer <token>
 * @query {from, to}
 * @returns {resource_utilization[]}
 */
router.get('/resource-utilization', authMiddleware, AnalyticsController.getResourceUtilization);

/**
 * @route GET /analytics/daily-summary
 * @desc Get daily incident and resolution summary
 * @header Authorization: Bearer <token>
 * @query {date: YYYY-MM-DD}
 * @returns {daily_summary}
 */
router.get('/daily-summary', authMiddleware, AnalyticsController.getDailySummary);

module.exports = router;
