import api, { SERVICES } from './api';

export const incidentService = {
    // Get all incidents (with optional filters)
    getAll: async (params = {}) => {
        const response = await api.get('/incidents', { params });
        return response.data;
    },

    // Get a specific incident
    getById: async (id) => {
        const response = await api.get(`/incidents/${id}`);
        return response.data;
    },

    // Create a new incident
    create: async (data) => {
        const response = await api.post('/incidents', data);
        return response.data;
    },

    // Update incident status
    updateStatus: async (id, status) => {
        const response = await api.patch(`/incidents/${id}/status`, { status });
        return response.data;
    },

    // Get open incidents specifically
    getOpen: async () => {
        const response = await api.get('/incidents/open');
        return response.data;
    },

    // Dispatch a unit to an incident
    dispatchUnit: async (incidentId, vehicleId) => {
        const response = await api.post(`/incidents/${incidentId}/dispatch`, { vehicleId });
        return response.data;
    }
};
