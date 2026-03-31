import React, { createContext, useContext, useState, useEffect } from 'react';
import { socketService } from '../services/socketService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // ✅ Lazy initializers run synchronously on first render — token is
    // never null when ProtectedRoute first checks it, so no redirect flash
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

    useEffect(() => {
        // Socket reconnect on page reload
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            try {
                socketService.connect(storedToken);
            } catch (error) {
                console.error('Socket connect failed:', error);
            }
        }
        // ✅ loading=false AFTER state already hydrated — no race condition
        setLoading(false);

        return () => socketService.disconnect();
    }, []);

    const _clearStorage = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user_role');
        localStorage.removeItem('user_data');
    };

    const login = (accessToken, userRole, userData) => {
        // Storage is already written by Login.jsx before calling this
        // Just sync React state
        setToken(accessToken);
        setRole(userRole);
        setUser(userData);
        socketService.connect(accessToken);
    };

    const logout = () => {
        _clearStorage();
        setToken(null);
        setRole(null);
        setUser(null);
        socketService.disconnect();
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            role,
            loading,
            login,
            logout,
            isAuthenticated: !!token && !!user, // ✅ Exposed so Login.jsx redirect works
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};