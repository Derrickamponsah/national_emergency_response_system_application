import axios from 'axios';

// Service Base URLs from Environment or Defaults
export const SERVICES = {
    AUTH: import.meta.env.VITE_AUTH_API_URL || 'http://localhost:3001',
    INCIDENT: import.meta.env.VITE_INCIDENT_API_URL || 'http://localhost:3002',
    DISPATCH: import.meta.env.VITE_DISPATCH_API_URL || 'http://localhost:3003',
    ANALYTICS: import.meta.env.VITE_ANALYTICS_API_URL || 'http://localhost:3004',
};

// Create axios instance
const api = axios.create({
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Add Authorization header
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token'); // must match key used in Login.jsx
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // If no full URL is provided, default to INCIDENT service
        if (!config.url.startsWith('http')) {
            config.url = `${SERVICES.INCIDENT}${config.url}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: handle token expiry
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Only clear on actual 401 or 403 errors
        if (error.response?.status === 401 || error.response?.status === 403) {
            console.warn('Invalid or expired token detected');
            localStorage.removeItem('token');
            localStorage.removeItem('user_role');
            localStorage.removeItem('user_data');
            // Optional: you can redirect manually when needed
            // window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;