import api, { SERVICES } from './api';

export const vehicleService = {
    // Get all vehicles in the fleet
    getAll: async (params = {}) => {
        // Backend returns { vehicles: [], count: 0 }
        const response = await api.get(`${SERVICES.DISPATCH}/vehicles`, { params });
        return response.data.vehicles || [];
    },

    // Register a new vehicle
    register: async (data) => {
        const response = await api.post(`${SERVICES.DISPATCH}/vehicles/register`, data);
        return response.data;
    },

    // Update vehicle details (admin power)
    update: async (id, data) => {
        const response = await api.put(`${SERVICES.DISPATCH}/vehicles/${id}`, data);
        return response.data;
    },

    // Delete a vehicle (admin power)
    delete: async (id) => {
        const response = await api.delete(`${SERVICES.DISPATCH}/vehicles/${id}`);
        return response.data;
    },

    // Update vehicle live location
    updateLocation: async (id, locData) => {
        const response = await api.put(`${SERVICES.DISPATCH}/vehicles/${id}/location`, locData);
        return response.data;
    },

    // Get specific vehicle status and location
    getStatus: async (id) => {
        const response = await api.get(`${SERVICES.DISPATCH}/vehicles/${id}/location`);
        return response.data;
    }
};
