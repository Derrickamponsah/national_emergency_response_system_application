/**
 * Socket Authorization Middleware
 * Validates and tracks user roles for Socket.io connections
 */

const jwt = require('jsonwebtoken');
require('dotenv').config();

const socketAuthMiddleware = (socket, next) => {
    try {
        const token = socket.handshake.auth.token;

        if (!token) {
            console.warn(`⚠️ Socket connection attempted without token: ${socket.id}`);
            return next(new Error('Authentication token required'));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.userId;
            socket.userEmail = decoded.email;
            socket.userRole = decoded.role;

            console.log(`✅ Socket authenticated: ${socket.id} | Role: ${socket.userRole}`);
            next();
        } catch (err) {
            console.error(`❌ Token verification failed for socket ${socket.id}:`, err.message);
            return next(new Error('Invalid or expired token'));
        }
    } catch (err) {
        console.error(`❌ Socket auth middleware error:`, err);
        return next(new Error('Authentication failed'));
    }
};

module.exports = socketAuthMiddleware;
