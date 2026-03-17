const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                error: 'No authorization token provided',
                code: 'NO_TOKEN'
            });
        }

        const token = authHeader.substring(7); // Remove 'Bearer '

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.userId = decoded.userId;
            req.userEmail = decoded.email;
            req.userRole = decoded.role;
            next();
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(403).json({ 
                    error: 'Token has expired',
                    code: 'TOKEN_EXPIRED'
                });
            }
            return res.status(403).json({ 
                error: 'Invalid token',
                code: 'INVALID_TOKEN'
            });
        }
    } catch (err) {
        return res.status(500).json({ error: 'Authentication error' });
    }
};

module.exports = authMiddleware;
