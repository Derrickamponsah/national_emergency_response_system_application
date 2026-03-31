import React, { createContext, useContext, useState, useEffect } from 'react';
import { socketService } from '../services/socketService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifySession = () => {
            const storedToken = localStorage.getItem('token');
            const storedRole = localStorage.getItem('user_role');
            const storedUserData = localStorage.getItem('user_data');

            if (storedToken && storedRole) {
                try {
                    const parsedUser = storedUserData
                        ? JSON.parse(storedUserData)
                        : { role: storedRole };

                    setToken(storedToken);
                    setRole(storedRole);
                    setUser(parsedUser);

                    // Reconnect socket on page reload
                    socketService.connect(storedToken);
                } catch (error) {
                    // Corrupted storage — clear and start fresh
                    console.error('Session restore failed:', error);
                    _clearStorage();
                }
            }

            setLoading(false);
        };

        verifySession();

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