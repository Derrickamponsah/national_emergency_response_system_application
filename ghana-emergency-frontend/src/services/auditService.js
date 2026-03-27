import api from './api';

export const auditService = {
    // Get system-wide audit logs
    getLogs: async (params = {}) => {
        const response = await api.get('/analytics/audit-logs', { params });
        return response.data;
    },

    // Get specific entity logs (e.g., for an incident)
    getEntityLogs: async (entityType, entityId) => {
        const response = await api.get(`/analytics/audit-logs/${entityType}/${entityId}`);
        return response.data;
    },

    // Generate exportable report
    exportReport: async (format = 'pdf') => {
        const response = await api.get(`/analytics/audit-logs/export?format=${format}`, {
            responseType: 'blob'
        });
        return response.data;
    }
};
