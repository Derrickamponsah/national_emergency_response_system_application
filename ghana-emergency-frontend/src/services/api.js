import axios from 'axios';

// Service Base URLs from Environment or Defaults
export const SERVICES = {
    AUTH: import.meta.env.VITE_AUTH_API_URL || 'http://localhost:3001',
    INCIDENT: import.meta.env.VITE_INCIDENT_API_URL || 'http://localhost:3002',
    DISPATCH: import.meta.env.VITE_DISPATCH_API_URL || 'http://localhost:3003',
    ANALYTICS: import.meta.env.VITE_ANALYTICS_API_URL || 'http://localhost:3004',
};

const api = axios.create({
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor for Auth
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        // If no full URL is provided, prepend the default (Incident as default or handle specifically)
        if (!config.url.startsWith('http')) {
            // Default to Incident service if not specified
            config.url = `${SERVICES.INCIDENT}${config.url}`;
        }
        
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor for Token Expiry
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Potential refresh token logic here
            // For now, clear and redirect to login if unauthorized
            localStorage.removeItem('access_token');
            localStorage.removeItem('user_role');
            localStorage.removeItem('user_data');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
