// ============================================
// SOCKET SERVER (INCIDENT MESH)
// ============================================
const { Server } = require('socket.io');
const socketAuthMiddleware = require('../middleware/socketAuthMiddleware');

let io;

function initSocketServer(httpServer) {
    io = new Server(httpServer, {
        cors: {
            origin: "*", // allow frontend access
            methods: ["GET", "POST"]
        }
    });

    // Apply authentication middleware
    io.use(socketAuthMiddleware);

    io.on('connection', (socket) => {
        console.log(`🔌 Client connected to Secure Incident Mesh: ${socket.id} | User: ${socket.userEmail} | Role: ${socket.userRole}`);
        
        socket.on('disconnect', () => {
            console.log(`🔌 Client disconnected: ${socket.id}`);
        });
    });

    console.log('✅ Socket.IO Server initialized for Mesh Sync (with role-based authorization)');
    return io;
}

function getIO() {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
}

module.exports = { initSocketServer, getIO };
