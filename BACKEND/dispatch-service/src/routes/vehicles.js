const express = require('express');
const VehicleController = require('../controllers/vehicleController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// ============================================
// VEHICLE ROUTES
// ============================================

/**
 * @route POST /vehicles/register
 * @desc Register a new emergency vehicle
 * @header Authorization: Bearer <token>
 * @body {responder_id, responder_type, driver_user_id}
 * @returns {vehicle_id}
 */
router.post('/register', authMiddleware, VehicleController.registerVehicle);

/**
 * @route GET /vehicles
 * @desc List all vehicles and current status
 * @header Authorization: Bearer <token>
 * @query {status}
 * @returns {vehicles[]}
 */
router.get('/', authMiddleware, VehicleController.getVehicles);

/**
 * @route GET /vehicles/:id/location
 * @desc Get the current location of a vehicle
 * @header Authorization: Bearer <token>
 * @returns {vehicle_id, current_location, status}
 */
router.get('/:id/location', authMiddleware, VehicleController.getCurrentLocation);

/**
 * @route PUT /vehicles/:id/location
 * @desc Update the GPS location of a vehicle
 * @header Authorization: Bearer <token>
 * @body {latitude, longitude, speed_kmh}
 * @returns {success}
 */
router.put('/:id/location', authMiddleware, VehicleController.updateLocation);

/**
 * @route GET /vehicles/:id/history
 * @desc Get historical GPS trail for a vehicle
 * @header Authorization: Bearer <token>
 * @query {limit}
 * @returns {history[]}
 */
router.get('/:id/history', authMiddleware, VehicleController.getLocationHistory);

module.exports = router;
