import axios from 'axios';

// Base URLs
export const SERVICES = {
    AUTH: import.meta.env.VITE_AUTH_API_URL || 'http://localhost:3001',
    INCIDENT: import.meta.env.VITE_INCIDENT_API_URL || 'http://localhost:3002',
    DISPATCH: import.meta.env.VITE_DISPATCH_API_URL || 'http://localhost:3003',
    ANALYTICS: import.meta.env.VITE_ANALYTICS_API_URL || 'http://localhost:3004',
};

// Create Axios instance
const api = axios.create({
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor: attach token to all requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token'); // single source of truth
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // If relative URL, prepend the correct service
        if (!config.url.startsWith('http')) {
            // Detect service from a prefix in the URL: e.g., "/dispatch", "/analytics"
            if (config.url.startsWith('/dispatch')) {
                config.url = `${SERVICES.DISPATCH}${config.url.replace('/dispatch', '')}`;
            } else if (config.url.startsWith('/analytics')) {
                config.url = `${SERVICES.ANALYTICS}${config.url.replace('/analytics', '')}`;
            } else if (config.url.startsWith('/auth')) {
                config.url = `${SERVICES.AUTH}${config.url}`;
            } else {
                // Default to INCIDENT
                config.url = `${SERVICES.INCIDENT}${config.url}`;
            }
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor: handle token expiration
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        if (status === 401 || status === 403) {
            // Logout user if token invalid or expired
            localStorage.removeItem('token');
            localStorage.removeItem('user_role');
            localStorage.removeItem('user_data');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;