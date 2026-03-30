/**
 * Vehicle Filter Middleware
 * Restricts vehicle access based on user role
 */

const vehicleFilterMiddleware = (req, res, next) => {
    try {
        const userRole = req.userRole;

        if (!userRole) {
            return res.status(401).json({
                error: 'User role not found in request',
                code: 'NO_ROLE'
            });
        }

        // Set vehicle type filters based on role
        if (userRole === 'SYSTEM_ADMIN') {
            // System admin sees all vehicles
            req.vehicleTypeFilter = null;
        } else if (userRole === 'HOSPITAL_ADMIN') {
            // Hospital admin sees only ambulances
            req.vehicleTypeFilter = 'AMBULANCE';
        } else if (userRole === 'FIRE_ADMIN') {
            // Fire admin sees only fire trucks
            req.vehicleTypeFilter = 'FIRE_TRUCK';
        } else if (userRole === 'POLICE_ADMIN') {
            // Police admin sees only police cars
            req.vehicleTypeFilter = 'POLICE_CAR';
        } else {
            return res.status(403).json({
                error: 'Unknown user role',
                code: 'INVALID_ROLE',
                user_role: userRole
            });
        }

        console.log(`✅ Vehicle filter applied for role: ${userRole}`, req.vehicleTypeFilter ? `(type: ${req.vehicleTypeFilter})` : '(all types)');
        next();
    } catch (err) {
        console.error('❌ Vehicle filter middleware error:', err);
        return res.status(500).json({
            error: 'Authorization filter error',
            code: 'FILTER_ERROR'
        });
    }
};

module.exports = vehicleFilterMiddleware;
