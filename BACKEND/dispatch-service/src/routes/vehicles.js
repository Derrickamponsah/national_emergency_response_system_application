const express = require('express');
const VehicleController = require('../controllers/vehicleController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const vehicleFilterMiddleware = require('../middleware/vehicleFilterMiddleware');

const router = express.Router();

// ============================================
// VEHICLE ROUTES
// ============================================

/**
 * @route POST /vehicles/register
 * @desc Register a new emergency vehicle (SYSTEM_ADMIN ONLY)
 * @header Authorization: Bearer <token>
 * @body {responder_id, responder_type, driver_user_id}
 * @returns {vehicle_id}
 * @access SYSTEM_ADMIN
 */
router.post('/register', authMiddleware, roleMiddleware(['SYSTEM_ADMIN']), VehicleController.registerVehicle);

/**
 * @route GET /vehicles
 * @desc List vehicles (role-filtered)
 * @header Authorization: Bearer <token>
 * @query {status}
 * @returns {vehicles[]}
 * @access SYSTEM_ADMIN (all), HOSPITAL_ADMIN (ambulances), FIRE_ADMIN (fire trucks), POLICE_ADMIN (police cars)
 */
router.get('/', authMiddleware, vehicleFilterMiddleware, VehicleController.getVehicles);

/**
 * @route PUT /vehicles/:id
 * @desc Update vehicle details (SYSTEM_ADMIN ONLY)
 * @access SYSTEM_ADMIN
 */
router.put('/:id', authMiddleware, roleMiddleware(['SYSTEM_ADMIN']), VehicleController.updateVehicle);

/**
 * @route DELETE /vehicles/:id
 * @desc Delete a vehicle (SYSTEM_ADMIN ONLY)
 * @access SYSTEM_ADMIN
 */
router.delete('/:id', authMiddleware, roleMiddleware(['SYSTEM_ADMIN']), VehicleController.deleteVehicle);

/**
 * @route GET /vehicles/:id/location
 * @desc Get the current location of a vehicle (role-filtered)
 * @header Authorization: Bearer <token>
 * @returns {vehicle_id, current_location, status}
 * @access Role-restricted by vehicle type
 */
router.get('/:id/location', authMiddleware, vehicleFilterMiddleware, VehicleController.getCurrentLocation);

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
 * @desc Get historical GPS trail for a vehicle (role-filtered)
 * @header Authorization: Bearer <token>
 * @query {limit}
 * @returns {history[]}
 * @access Role-restricted by vehicle type
 */
router.get('/:id/history', authMiddleware, vehicleFilterMiddleware, VehicleController.getLocationHistory);

module.exports = router;
