const express = require('express');
const IncidentController = require('../controllers/incidentController');
const ResponderController = require('../controllers/responderController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const incidentFilterMiddleware = require('../middleware/incidentFilterMiddleware');

const router = express.Router();

// ============================================
// INCIDENT ROUTES
// ============================================

/**
 * @route POST /incidents
 * @desc Create a new incident (SYSTEM_ADMIN ONLY)
 * @header Authorization: Bearer <token>
 * @body {citizen_name, citizen_phone, incident_type, latitude, longitude, location_description, notes}
 * @returns {incident_id, status, assigned_unit}
 * @access SYSTEM_ADMIN
 */
router.post('/', authMiddleware, roleMiddleware(['SYSTEM_ADMIN']), IncidentController.createIncident);

/**
 * @route GET /incidents/open
 * @desc List open incidents (role-filtered)
 * @header Authorization: Bearer <token>
 * @query {type, limit, offset}
 * @returns {incidents[], count}
 * @access SYSTEM_ADMIN (all), HOSPITAL_ADMIN (medical), FIRE_ADMIN (fire), POLICE_ADMIN (crime/accidents)
 */
router.get('/open', authMiddleware, incidentFilterMiddleware, IncidentController.getOpenIncidents);

/**
 * @route GET /incidents/:id
 * @desc Get incident details (role-filtered)
 * @header Authorization: Bearer <token>
 * @returns {full incident object}
 * @access SYSTEM_ADMIN (all), role-specific admins (allowed types)
 */
router.get('/:id', authMiddleware, incidentFilterMiddleware, IncidentController.getIncident);

/**
 * @route PUT /incidents/:id/status
 * @desc Update incident status (SYSTEM_ADMIN ONLY)
 * @header Authorization: Bearer <token>
 * @body {status: CREATED|DISPATCHED|IN_PROGRESS|RESOLVED}
 * @returns {incident_id, status}
 * @access SYSTEM_ADMIN
 */
router.put('/:id/status', authMiddleware, roleMiddleware(['SYSTEM_ADMIN']), IncidentController.updateIncidentStatus);

/**
 * @route PUT /incidents/:id/assign
 * @desc Assign responder to incident (SYSTEM_ADMIN ONLY)
 * @header Authorization: Bearer <token>
 * @body {unit_id, unit_type}
 * @returns {incident_id, assigned_unit}
 * @access SYSTEM_ADMIN
 */
router.put('/:id/assign', authMiddleware, roleMiddleware(['SYSTEM_ADMIN']), IncidentController.assignResponder);

/**
 * @route PUT /incidents/:id
 * @desc Full update of incident (SYSTEM_ADMIN ONLY)
 * @access SYSTEM_ADMIN
 */
router.put('/:id', authMiddleware, roleMiddleware(['SYSTEM_ADMIN']), IncidentController.updateIncident);

/**
 * @route DELETE /incidents/:id
 * @desc Permanent deletion of incident (SYSTEM_ADMIN ONLY)
 * @access SYSTEM_ADMIN
 */
router.delete('/:id', authMiddleware, roleMiddleware(['SYSTEM_ADMIN']), IncidentController.deleteIncident);

// ============================================
// RESPONDER ROUTES
// ============================================

/**
 * @route POST /responders
 * @desc Register a new responder (SYSTEM_ADMIN ONLY)
 * @header Authorization: Bearer <token>
 * @body {name, responder_type, latitude, longitude}
 * @returns {responder_id, name, type}
 * @access SYSTEM_ADMIN
 */
router.post('/responders', authMiddleware, roleMiddleware(['SYSTEM_ADMIN']), ResponderController.registerResponder);

/**
 * @route GET /responders
 * @desc List all available responders
 * @header Authorization: Bearer <token>
 * @query {type}
 * @returns {responders[]}
 * @access All authenticated users
 */
router.get('/responders', authMiddleware, ResponderController.getResponders);

/**
 * @route PUT /responders/:id/availability
 * @desc Update responder availability (SYSTEM_ADMIN ONLY)
 * @header Authorization: Bearer <token>
 * @body {is_available: true|false}
 * @returns {responder_id, is_available}
 * @access SYSTEM_ADMIN
 */
router.put('/responders/:id/availability', authMiddleware, roleMiddleware(['SYSTEM_ADMIN']), ResponderController.updateAvailability);

module.exports = router;
