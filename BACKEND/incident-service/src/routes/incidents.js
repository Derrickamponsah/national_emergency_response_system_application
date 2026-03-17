const express = require('express');
const IncidentController = require('../controllers/incidentController');
const ResponderController = require('../controllers/responderController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// ============================================
// INCIDENT ROUTES
// ============================================

/**
 * @route POST /incidents
 * @desc Create a new incident
 * @header Authorization: Bearer <token>
 * @body {citizen_name, citizen_phone, incident_type, latitude, longitude, location_description, notes}
 * @returns {incident_id, status, assigned_unit}
 */
router.post('/', authMiddleware, IncidentController.createIncident);

/**
 * @route GET /incidents/:id
 * @desc Get incident details
 * @header Authorization: Bearer <token>
 * @returns {full incident object}
 */
router.get('/:id', authMiddleware, IncidentController.getIncident);

/**
 * @route GET /incidents/open
 * @desc List all open incidents
 * @header Authorization: Bearer <token>
 * @query {type, limit, offset}
 * @returns {incidents[], count}
 */
router.get('/open', authMiddleware, IncidentController.getOpenIncidents);

/**
 * @route PUT /incidents/:id/status
 * @desc Update incident status
 * @header Authorization: Bearer <token>
 * @body {status: CREATED|DISPATCHED|IN_PROGRESS|RESOLVED}
 * @returns {incident_id, status}
 */
router.put('/:id/status', authMiddleware, IncidentController.updateIncidentStatus);

/**
 * @route PUT /incidents/:id/assign
 * @desc Assign responder to incident
 * @header Authorization: Bearer <token>
 * @body {unit_id, unit_type}
 * @returns {incident_id, assigned_unit}
 */
router.put('/:id/assign', authMiddleware, IncidentController.assignResponder);

// ============================================
// RESPONDER ROUTES
// ============================================

/**
 * @route POST /responders
 * @desc Register a new responder
 * @header Authorization: Bearer <token>
 * @body {name, responder_type, latitude, longitude}
 * @returns {responder_id, name, type}
 */
router.post('/responders', authMiddleware, ResponderController.registerResponder);

/**
 * @route GET /responders
 * @desc List all available responders
 * @header Authorization: Bearer <token>
 * @query {type}
 * @returns {responders[]}
 */
router.get('/responders', authMiddleware, ResponderController.getResponders);

/**
 * @route PUT /responders/:id/availability
 * @desc Update responder availability
 * @header Authorization: Bearer <token>
 * @body {is_available: true|false}
 * @returns {responder_id, is_available}
 */
router.put('/responders/:id/availability', authMiddleware, ResponderController.updateAvailability);

module.exports = router;
