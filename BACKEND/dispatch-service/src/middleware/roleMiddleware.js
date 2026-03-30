const roleMiddleware = (allowedRoles = []) => {
    return (req, res, next) => {
        try {
            const userRole = req.userRole;

            if (!userRole) {
                return res.status(401).json({
                    error: 'User role not found in request',
                    code: 'NO_ROLE'
                });
            }

            if (!Array.isArray(allowedRoles) || allowedRoles.length === 0) {
                // If no roles specified, allow all authenticated users
                return next();
            }

            if (!allowedRoles.includes(userRole)) {
                return res.status(403).json({
                    error: 'Access denied - insufficient permissions',
                    code: 'FORBIDDEN',
                    required_roles: allowedRoles,
                    user_role: userRole
                });
            }

            next();
        } catch (err) {
            console.error('❌ Role middleware error:', err);
            return res.status(500).json({
                error: 'Authentication error',
                code: 'AUTH_ERROR'
            });
        }
    };
};

module.exports = roleMiddleware;
