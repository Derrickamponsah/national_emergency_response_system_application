import axios from 'axios';

export const SERVICES = {
    AUTH: import.meta.env.VITE_AUTH_API_URL || 'http://localhost:3001',
    INCIDENT: import.meta.env.VITE_INCIDENT_API_URL || 'http://localhost:3002',
    DISPATCH: import.meta.env.VITE_DISPATCH_API_URL || 'http://localhost:3003',
    ANALYTICS: import.meta.env.VITE_ANALYTICS_API_URL || 'http://localhost:3004',
};

const api = axios.create({
    headers: { 'Content-Type': 'application/json' },
});

// ─── Request interceptor: attach token + resolve service URL ─────────────────
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Only rewrite relative URLs — absolute URLs (e.g. from Login.jsx using
        // axios directly) are passed through unchanged
        if (!config.url.startsWith('http')) {
            if (config.url.startsWith('/auth')) {
                // Keep /auth prefix — backend expects /auth/login etc.
                config.url = `${SERVICES.AUTH}${config.url}`;
            } else if (config.url.startsWith('/dispatch')) {
                // Strip /dispatch prefix — backend route is just /units etc.
                config.url = `${SERVICES.DISPATCH}${config.url.replace('/dispatch', '')}`;
            } else if (config.url.startsWith('/analytics')) {
                config.url = `${SERVICES.ANALYTICS}${config.url.replace('/analytics', '')}`;
            } else {
                // Default → incident service
                config.url = `${SERVICES.INCIDENT}${config.url}`;
            }
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// ─── Response interceptor: only 401 means expired/invalid token ──────────────
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const token = localStorage.getItem('token');

        if (status === 401 && token) {
            // Token is present but server rejects it → it has expired or been revoked.
            // Clear storage then fire a custom event so AuthContext can call
            // navigate('/login') without a hard page reload.
            localStorage.removeItem('token');
            localStorage.removeItem('user_role');
            localStorage.removeItem('user_data');
            window.dispatchEvent(new Event('auth:logout'));
        }

        // 403 = authenticated but NOT authorised for this resource.
        // Do NOT log the user out — just let the calling component handle it.

        return Promise.reject(error);
    }
);

export default api;