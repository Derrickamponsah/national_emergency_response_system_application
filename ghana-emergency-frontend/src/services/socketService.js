import { io } from 'socket.io-client';
import { SERVICES } from './api';

class SocketService {
    constructor() {
        this.socket = null;
    }

    connect(token) {
        if (this.socket) return;

        this.socket = io(SERVICES.INCIDENT, {
            auth: { token },
            transports: ['websocket', 'polling']
        });

        this.socket.on('connect', () => {
            console.log('✅ Connected to Secure Incident Mesh');
        });

        this.socket.on('connect_error', (error) => {
            console.error('❌ Mesh Handshake Failed:', error.message);
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    // Subscribe to specific incident updates
    subscribeToIncidents(callback) {
        if (!this.socket) return;
        this.socket.on('incident_update', callback);
    }

    // Subscribe to fleet movement
    subscribeToFleet(callback) {
        if (!this.socket) return;
        this.socket.on('vehicle_update', callback);
    }

    // Emit dispatch action
    emitDispatch(incidentId, vehicleId) {
        if (!this.socket) return;
        this.socket.emit('dispatch_unit', { incidentId, vehicleId });
    }
}

export const socketService = new SocketService();
