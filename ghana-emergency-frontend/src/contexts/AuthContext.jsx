import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { socketService } from '../services/socketService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // Lazy initialisers — synchronous on first render so ProtectedRoute
    // never sees null when it checks token on the very first paint
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [role, setRole] = useState(() => localStorage.getItem('user_role'));
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem('user_data');
        const storedRole = localStorage.getItem('user_role');
        if (!stored && !storedRole) return null;
        try {
            return stored ? JSON.parse(stored) : { role: storedRole };
        } catch {
            return null;
        }
    });
    const [loading, setLoading] = useState(true);

    // Stable navigate ref — set by the root router component via setNavigate()
    // so we can navigate without a hard reload from outside React components
    const navigateRef = useRef(null);
    const setNavigate = (fn) => { navigateRef.current = fn; };

    useEffect(() => {
        // Reconnect socket on page reload if a token already exists
        const storedToken = localStorage.getItem('token');
        if (storedToken && !socketService.isConnected()) {
            try { socketService.connect(storedToken); } catch (e) {
                console.error('Socket reconnect failed:', e);
            }
        }
        setLoading(false);

        // Listen for the custom event dispatched by api.js on 401
        // This avoids window.location.href (hard reload) entirely
        const handleForceLogout = () => _performLogout(false);
        window.addEventListener('auth:logout', handleForceLogout);
        return () => {
            window.removeEventListener('auth:logout', handleForceLogout);
            socketService.disconnect();
        };
    }, []);

    const _writeStorage = (accessToken, userRole, userData) => {
        localStorage.setItem('token', accessToken);
        localStorage.setItem('user_role', userRole);
        localStorage.setItem('user_data', JSON.stringify(userData));
    };

    const _clearStorage = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user_role');
        localStorage.removeItem('user_data');
    };

    // login() is the single place that writes storage AND syncs React state.
    // Login.jsx must NOT write to localStorage itself — call this instead.
    const login = (accessToken, userRole, userData) => {
        _writeStorage(accessToken, userRole, userData);
        setToken(accessToken);
        setRole(userRole);
        setUser(userData);
        // Guard against double-connect (page-load reconnect may have run first)
        if (!socketService.isConnected()) {
            socketService.connect(accessToken);
        }
    };

    const _performLogout = (navigate = true) => {
        _clearStorage();
        setToken(null);
        setRole(null);
        setUser(null);
        socketService.disconnect();
        if (navigate && navigateRef.current) {
            navigateRef.current('/login', { replace: true });
        } else if (navigate) {
            // Fallback only if navigate ref not yet registered
            window.location.replace('/login');
        }
    };

    const logout = () => _performLogout(true);

    return (
        <AuthContext.Provider value={{
            user,
            token,
            role,
            loading,
            login,
            logout,
            setNavigate,
            isAuthenticated: !!token && !!user,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};