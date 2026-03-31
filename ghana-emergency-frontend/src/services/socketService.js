import { io } from 'socket.io-client';
import { SERVICES } from './api';

// Use a dedicated socket URL env var if provided, otherwise fall back to the
// incident service (which is where the Socket.io gateway typically lives)
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || SERVICES.INCIDENT;

class SocketService {
    constructor() {
        this.socket = null;
    }

    // ─── Connection ────────────────────────────────────────────────────────────

    isConnected() {
        return this.socket?.connected ?? false;
    }

    connect(token) {
        // Guard: don't stack connections
        if (this.socket) return;

        this.socket = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket', 'polling'],
            reconnectionAttempts: 5,
            reconnectionDelay: 2000,
        });

        this.socket.on('connect', () => {
            console.log('✅ Socket connected to Incident Mesh');
        });

        this.socket.on('connect_error', (error) => {
            console.error('❌ Socket handshake failed:', error.message);
        });

        this.socket.on('disconnect', (reason) => {
            console.warn('⚠️ Socket disconnected:', reason);
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.removeAllListeners();
            this.socket.disconnect();
            this.socket = null;
        }
    }

    // ─── Subscriptions ─────────────────────────────────────────────────────────
    // Each subscribe method removes any existing listener for that event first
    // to prevent duplicate handlers stacking on remount.

    subscribeToIncidents(callback) {
        if (!this.socket) return;
        this.socket.off('incident_update');
        this.socket.on('incident_update', callback);
    }

    unsubscribeFromIncidents() {
        this.socket?.off('incident_update');
    }

    subscribeToFleet(callback) {
        if (!this.socket) return;
        this.socket.off('vehicle_update');
        this.socket.on('vehicle_update', callback);
    }

    unsubscribeFromFleet() {
        this.socket?.off('vehicle_update');
    }

    // ─── Dispatch emission with acknowledgement ─────────────────────────────────
    // Returns a Promise so callers can await confirmation or catch errors.
    // The server must call the ack callback: ack({ success: true }) or ack({ error: '...' })

    emitDispatch(incidentId, vehicleId) {
        return new Promise((resolve, reject) => {
            if (!this.socket || !this.isConnected()) {
                return reject(new Error('Socket not connected'));
            }

            const timeout = setTimeout(() => {
                reject(new Error('Dispatch acknowledgement timed out'));
            }, 8000);

            this.socket.emit(
                'dispatch_unit',
                { incidentId, vehicleId },
                (response) => {
                    clearTimeout(timeout);
                    if (response?.error) {
                        reject(new Error(response.error));
                    } else {
                        resolve(response);
                    }
                }
            );
        });
    }
}

export const socketService = new SocketService();