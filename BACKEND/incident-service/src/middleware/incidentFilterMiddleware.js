/**
 * Incident Filter Middleware
 * Restricts incident access based on user role
 */

const incidentFilterMiddleware = (req, res, next) => {
    try {
        const userRole = req.userRole;

        if (!userRole) {
            return res.status(401).json({
                error: 'User role not found in request',
                code: 'NO_ROLE'
            });
        }

        // Set incident type filters based on role
        if (userRole === 'SYSTEM_ADMIN') {
            // System admin sees all incident types
            req.incidentTypeFilter = null;
        } else if (userRole === 'HOSPITAL_ADMIN') {
            // Hospital admin sees only medical incidents
            req.incidentTypeFilter = ['MEDICAL'];
        } else if (userRole === 'FIRE_ADMIN') {
            // Fire admin sees only fire incidents
            req.incidentTypeFilter = ['FIRE'];
        } else if (userRole === 'POLICE_ADMIN') {
            // Police admin sees crime and road accidents
            req.incidentTypeFilter = ['CRIME', 'ROAD_ACCIDENT'];
        } else {
            return res.status(403).json({
                error: 'Unknown user role',
                code: 'INVALID_ROLE',
                user_role: userRole
            });
        }

        console.log(`✅ Incident filter applied for role: ${userRole}`, req.incidentTypeFilter ? `(types: ${req.incidentTypeFilter.join(', ')})` : '(all types)');
        next();
    } catch (err) {
        console.error('❌ Incident filter middleware error:', err);
        return res.status(500).json({
            error: 'Authorization filter error',
            code: 'FILTER_ERROR'
        });
    }
};

module.exports = incidentFilterMiddleware;
