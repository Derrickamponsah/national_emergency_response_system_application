import api, { SERVICES } from './api';

export const vehicleService = {
    // Get all vehicles in the fleet
    getAll: async (params = {}) => {
        const response = await api.get(`${SERVICES.DISPATCH}/vehicles`, { params });
        return response.data;
    },

    // Register a new vehicle
    register: async (data) => {
        const response = await api.post(`${SERVICES.DISPATCH}/vehicles/register`, data);
        return response.data;
    },

    // Update vehicle live location
    updateLocation: async (id, { latitude, longitude, speed_kmh }) => {
        const response = await api.put(`${SERVICES.DISPATCH}/vehicles/${id}/location`, {
            latitude,
            longitude,
            speed_kmh
        });
        return response.data;
    },

    // Get specific vehicle status and location
    getStatus: async (id) => {
        const response = await api.get(`${SERVICES.DISPATCH}/vehicles/${id}/location`);
        return response.data;
    }
};
