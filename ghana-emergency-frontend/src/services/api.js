import axios from 'axios';

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

// Request interceptor: attach token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        // Prepend service URLs
        if (!config.url.startsWith('http')) {
            if (config.url.startsWith('/dispatch')) {
                config.url = `${SERVICES.DISPATCH}${config.url.replace('/dispatch', '')}`;
            } else if (config.url.startsWith('/analytics')) {
                config.url = `${SERVICES.ANALYTICS}${config.url.replace('/analytics', '')}`;
            } else if (config.url.startsWith('/auth')) {
                config.url = `${SERVICES.AUTH}${config.url}`;
            } else {
                config.url = `${SERVICES.INCIDENT}${config.url}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor: logout only if token exists
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const token = localStorage.getItem('token');

        if ((status === 401 || status === 403) && token) {
            // Token exists but server rejects it (invalid/expired)
            localStorage.removeItem('token');
            localStorage.removeItem('user_role');
            localStorage.removeItem('user_data');
            window.location.href = '/login';
        }

        return Promise.reject(error);
    }
);

export default api;