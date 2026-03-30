import { useState, useCallback, useRef } from 'react';

/**
 * useDispatchNotification - Custom hook to manage dispatch notifications
 * Handles showing/hiding notifications and managing queue
 */
export const useDispatchNotification = () => {
    const [notification, setNotification] = useState(null);
    const timeoutRef = useRef(null);

    const showNotification = useCallback((config = {}) => {
        // Clear existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        const {
            status = 'SUCCESS', // SUCCESS, FAILED
            vehicleReg = 'N/A',
            baseStation = 'N/A',
            location = 'Target Location',
            incidentType = 'MEDICAL',
            duration = 3000,
            message = status === 'SUCCESS' 
                ? 'Dispatch successful! Vehicle en route.' 
                : 'Dispatch failed. Please try again.'
        } = config;

        // Show notification
        setNotification({
            status,
            vehicleReg,
            baseStation,
            location,
            incidentType,
            message,
            timestamp: new Date()
        });

        // Auto-dismiss
        timeoutRef.current = setTimeout(() => {
            setNotification(null);
        }, duration);
    }, []);

    const hideNotification = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setNotification(null);
    }, []);

    return {
        notification,
        showNotification,
        hideNotification,
        isActive: notification !== null
    };
};

/**
 * useDispatchApi - Custom hook to handle dispatch API calls with notifications
 */
export const useDispatchApi = (onNotification) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const dispatchVehicle = useCallback(async (incidentId, vehicleId, destinationData = {}) => {
        try {
            setLoading(true);
            setError(null);

            // Call dispatch API
            const response = await fetch('/api/dispatch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    incidentId,
                    vehicleId,
                    ...destinationData
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Dispatch failed');
            }

            // Show success notification
            if (onNotification) {
                onNotification({
                    status: 'SUCCESS',
                    vehicleReg: data.vehicleRegistration || 'N/A',
                    baseStation: data.baseStation || 'N/A',
                    location: data.destination || 'Target Location',
                    incidentType: data.incidentType || 'MEDICAL',
                    message: `${data.vehicleType} dispatched successfully!`
                });
            }

            return { success: true, data };
        } catch (err) {
            setError(err.message);

            // Show error notification
            if (onNotification) {
                onNotification({
                    status: 'FAILED',
                    message: err.message,
                    duration: 4000
                });
            }

            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    }, [onNotification]);

    return {
        dispatchVehicle,
        loading,
        error
    };
};

/**
 * formatDispatchData - Utility to format dispatch payload
 */
export const formatDispatchData = (incident, vehicle, baseStation) => {
    return {
        incidentId: incident.id,
        incidentType: incident.type,
        location: incident.location,
        coordinates: incident.coordinates || { lat: incident.lat, lng: incident.lng },
        vehicleId: vehicle.id,
        vehicleType: vehicle.type,
        vehicleReg: vehicle.registration,
        baseStation: baseStation.name,
        baseStationCoords: { lat: baseStation.lat, lng: baseStation.lng },
        reportedBy: incident.reporter,
        priority: incident.severity || 'NORMAL',
        timestamp: new Date().toISOString()
    };
};

/**
 * calculateETA - Estimate time to arrival based on distance
 * @param {number} fromLat - Base station latitude
 * @param {number} fromLng - Base station longitude
 * @param {number} toLat - Incident latitude
 * @param {number} toLng - Incident longitude
 * @param {number} avgSpeed - Average speed in km/h (default 50)
 * @returns {number} ETA in minutes
 */
export const calculateETA = (fromLat, fromLng, toLat, toLng, avgSpeed = 50) => {
    // Haversine formula to calculate distance
    const R = 6371; // Earth's radius in km
    const dLat = (toLat - fromLat) * Math.PI / 180;
    const dLng = (toLng - fromLng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(fromLat * Math.PI / 180) * Math.cos(toLat * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    // Calculate time in minutes
    const timeHours = distance / avgSpeed;
    const timeMinutes = Math.round(timeHours * 60);

    return Math.max(1, timeMinutes); // Minimum 1 minute
};

/**
 * getDispatchStatus - Map vehicle status to dispatch status
 */
export const getDispatchStatus = (vehicleStatus) => {
    const statusMap = {
        'AVAILABLE': 'WAITING',
        'EN_ROUTE': 'SUCCESS',
        'ARRIVED': 'SUCCESS',
        'IN_SERVICE': 'SUCCESS',
        'DISABLED': 'FAILED'
    };
    return statusMap[vehicleStatus] || 'WAITING';
};

export default {
    useDispatchNotification,
    useDispatchApi,
    formatDispatchData,
    calculateETA,
    getDispatchStatus
};
