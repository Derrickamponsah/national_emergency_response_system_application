import api, { SERVICES } from './api';

export const analyticsService = {
    // Get general response time performance
    getResponseTimes: async () => {
        const response = await api.get(`${SERVICES.ANALYTICS}/analytics/response-times`);
        return response.data;
    },

    // Get incident distribution by region
    getByRegion: async () => {
        const response = await api.get(`${SERVICES.ANALYTICS}/analytics/incidents-by-region`);
        return response.data;
    },

    // Get daily operation summaries for dashboards
    getOperationalSummary: async () => {
        const response = await api.get(`${SERVICES.ANALYTICS}/analytics/summary`);
        return response.data;
    }
};
