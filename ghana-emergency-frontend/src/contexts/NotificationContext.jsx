import React, { createContext, useContext, useState, useEffect } from 'react';
import { socketService } from '../services/socketService';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    const addNotification = (notif) => {
        const id = Date.now();
        setNotifications(prev => [{ ...notif, id }, ...prev].slice(0, 5));
        
        // Auto-remove after 6s
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 6000);
    };

    useEffect(() => {
        // Listen to global socket events for high-priority alerts
        socketService.subscribeToIncidents((incident) => {
            if (incident.status === 'REPORTED') {
                addNotification({
                    title: 'New Emergency Alert',
                    message: `${incident.incident_type} reported at ${incident.location_description}`,
                    type: 'EMERGENCY',
                    icon: 'warning'
                });
            }
        });

        socketService.subscribeToFleet((vehicle) => {
            if (vehicle.status === 'DISPATCHED') {
                addNotification({
                    title: 'Unit En Route',
                    message: `Vehicle ${vehicle.registrationNumber} is responding to Sector ${vehicle.lastNode || 'Alpha'}`,
                    type: 'DISPATCH',
                    icon: 'local_shipping'
                });
            }
        });
    }, []);

    return (
        <NotificationContext.Provider value={{ notifications, addNotification }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);
