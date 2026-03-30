/**
 * Role-Based Socket Event Broadcasting
 * Ensures only authorized users receive incident and vehicle updates
 */

/**
 * Check if user role has access to incident type
 * @param {string} userRole - The user's role
 * @param {string} incidentType - The incident type
 * @returns {boolean} true if user can view this incident type
 */
function canUserViewIncident(userRole, incidentType) {
    if (userRole === 'SYSTEM_ADMIN') {
        return true;
    }
    
    if (userRole === 'HOSPITAL_ADMIN' && incidentType === 'MEDICAL') {
        return true;
    }
    
    if (userRole === 'FIRE_ADMIN' && incidentType === 'FIRE') {
        return true;
    }
    
    if (userRole === 'POLICE_ADMIN' && ['CRIME', 'ROAD_ACCIDENT'].includes(incidentType)) {
        return true;
    }
    
    return false;
}

/**
 * Check if user role has access to vehicle type
 * @param {string} userRole - The user's role
 * @param {string} vehicleType - The vehicle type
 * @returns {boolean} true if user can view this vehicle type
 */
function canUserViewVehicle(userRole, vehicleType) {
    if (userRole === 'SYSTEM_ADMIN') {
        return true;
    }
    
    if (userRole === 'HOSPITAL_ADMIN' && vehicleType === 'AMBULANCE') {
        return true;
    }
    
    if (userRole === 'FIRE_ADMIN' && vehicleType === 'FIRE_TRUCK') {
        return true;
    }
    
    if (userRole === 'POLICE_ADMIN' && vehicleType === 'POLICE_CAR') {
        return true;
    }
    
    return false;
}

/**
 * Broadcast incident update to authorized users only
 * @param {object} io - Socket.io instance
 * @param {object} incident - The incident object with type field
 */
function broadcastIncidentUpdate(io, incident) {
    try {
        if (!io || !incident) {
            console.warn('❌ broadcastIncidentUpdate: Missing io or incident');
            return;
        }

        const clients = io.sockets.sockets;
        let authorizedCount = 0;

        clients.forEach((socket) => {
            if (!socket.userRole) {
                console.warn(`⚠️ Socket ${socket.id} has no user role`);
                return;
            }

            if (canUserViewIncident(socket.userRole, incident.type)) {
                socket.emit('incident_update', incident);
                authorizedCount++;
            }
        });

        console.log(`📡 Broadcast incident ${incident.incident_id || incident.id} to ${authorizedCount}/${clients.size} connected clients (Type: ${incident.type})`);
    } catch (err) {
        console.error('❌ Error broadcasting incident update:', err);
    }
}

/**
 * Broadcast vehicle location update to authorized users only
 * @param {object} io - Socket.io instance
 * @param {object} vehicle - The vehicle object with type field
 */
function broadcastVehicleUpdate(io, vehicle) {
    try {
        if (!io || !vehicle) {
            console.warn('❌ broadcastVehicleUpdate: Missing io or vehicle');
            return;
        }

        const clients = io.sockets.sockets;
        let authorizedCount = 0;

        clients.forEach((socket) => {
            if (!socket.userRole) {
                console.warn(`⚠️ Socket ${socket.id} has no user role`);
                return;
            }

            if (canUserViewVehicle(socket.userRole, vehicle.type)) {
                socket.emit('vehicle_update', vehicle);
                authorizedCount++;
            }
        });

        console.log(`📡 Broadcast vehicle ${vehicle.vehicle_id || vehicle.id} to ${authorizedCount}/${clients.size} connected clients (Type: ${vehicle.type})`);
    } catch (err) {
        console.error('❌ Error broadcasting vehicle update:', err);
    }
}

/**
 * Broadcast to a specific incident's authorized viewers
 * @param {object} io - Socket.io instance
 * @param {object} incident - The incident object
 * @param {string} eventName - The event name to broadcast
 * @param {object} data - The data to send
 */
function broadcastToIncidentViewers(io, incident, eventName, data) {
    try {
        if (!io || !incident) {
            console.warn('❌ broadcastToIncidentViewers: Missing io or incident');
            return;
        }

        const clients = io.sockets.sockets;
        let authorizedCount = 0;

        clients.forEach((socket) => {
            if (!socket.userRole) return;

            if (canUserViewIncident(socket.userRole, incident.type)) {
                socket.emit(eventName, data);
                authorizedCount++;
            }
        });

        console.log(`📡 Broadcast '${eventName}' to ${authorizedCount}/${clients.size} viewers for incident ${incident.id}`);
    } catch (err) {
        console.error(`❌ Error broadcasting to incident viewers:`, err);
    }
}

module.exports = {
    canUserViewIncident,
    canUserViewVehicle,
    broadcastIncidentUpdate,
    broadcastVehicleUpdate,
    broadcastToIncidentViewers
};
