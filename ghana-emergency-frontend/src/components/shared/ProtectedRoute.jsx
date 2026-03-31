import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';

/**
 * Decode the JWT payload without verifying the signature.
 * We only need the `exp` claim to check client-side expiry.
 * The server always performs real verification on every request.
 */
const getTokenExpiry = (token) => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp ? payload.exp * 1000 : null; // convert to ms
    } catch {
        return null;
    }
};

const isTokenExpired = (token) => {
    const expiry = getTokenExpiry(token);
    if (!expiry) return false; // can't determine — let the server decide
    return Date.now() >= expiry;
};

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, token, loading, logout } = useAuth();
    const location = useLocation();

    if (loading) {
        return <LoadingSpinner />;
    }

    // No token at all → go to login
    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Token present but expired → clear it and redirect
    if (isTokenExpired(token)) {
        logout();
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Token valid but RBAC check fails → unauthorized page
    if (allowedRoles && allowedRoles.length > 0) {
        if (!user || !allowedRoles.includes(user.role)) {
            return <Navigate to="/unauthorized" replace />;
        }
    }

    return children;
};

export default ProtectedRoute;