import api, { SERVICES } from './api';

export const incidentService = {
    // Get all incidents (with optional filters)
    getAll: async (params = {}) => {
        const response = await api.get('/incidents/open', { params });
        return response.data.incidents || [];
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
        const response = await api.put(`/incidents/${id}/status`, { status });
        return response.data;
    },

    // Full Update of an incident (Administrator Power)
    update: async (id, data) => {
        const response = await api.put(`/incidents/${id}`, data);
        return response.data;
    },

    // Dispatch a unit to an incident
    dispatchUnit: async (incidentId, unitData) => {
        const response = await api.put(`/incidents/${incidentId}/assign`, unitData);
        return response.data;
    },

    // Delete an incident (Administrator Power)
    delete: async (id) => {
        const response = await api.delete(`/incidents/${id}`);
        return response.data;
    }
};
