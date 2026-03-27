import React, { createContext, useContext, useState, useEffect } from 'react';
import { socketService } from '../services/socketService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('access_token'));
    const [role, setRole] = useState(localStorage.getItem('user_role'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifySession = async () => {
            const storedToken = localStorage.getItem('access_token');
            const storedRole = localStorage.getItem('user_role');
            const storedUserData = localStorage.getItem('user_data');

            if (storedToken) {
                try {
                    setToken(storedToken);
                    setRole(storedRole);
                    setUser(storedUserData ? JSON.parse(storedUserData) : { role: storedRole });
                    
                    // Initialize Real-time Mesh
                    socketService.connect(storedToken);
                } catch (error) {
                    logout();
                }
            }
            setLoading(false);
        };
        verifySession();

        return () => socketService.disconnect();
    }, []);

    const login = (accessToken, userRole, userData) => {
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('user_role', userRole);
        localStorage.setItem('user_data', JSON.stringify(userData));
        setToken(accessToken);
        setRole(userRole);
        setUser(userData);
        
        // Connect to Real-time Mesh
        socketService.connect(accessToken);
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_role');
        localStorage.removeItem('user_data');
        setToken(null);
        setRole(null);
        setUser(null);
        
        // Disconnect from Mesh
        socketService.disconnect();
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, token, role, loading, login, logout }}>
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
