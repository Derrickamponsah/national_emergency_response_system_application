import React, { createContext, useContext, useState, useCallback } from 'react';

/**
 * DispatchHistoryContext - Global state management for dispatch logs
 * Allows components to add, update, and track dispatched incidents in real-time
 */
const DispatchHistoryContext = createContext();

export const DispatchHistoryProvider = ({ children }) => {
    const [dispatchHistory, setDispatchHistory] = useState([]);

    // Add a new dispatch to history
    const addDispatch = useCallback((dispatch) => {
        const newDispatch = {
            id: `DISP-${Date.now()}`,
            timestamp: new Date(),
            status: 'WAITING',
            ...dispatch
        };

        setDispatchHistory(prev => [newDispatch, ...prev]);
        return newDispatch;
    }, []);

    // Update dispatch status
    const updateDispatchStatus = useCallback((dispatchId, status) => {
        setDispatchHistory(prev =>
            prev.map(d =>
                d.id === dispatchId
                    ? { ...d, status, updatedAt: new Date() }
                    : d
            )
        );
    }, []);

    // Update dispatch with tracking info
    const updateDispatchTracking = useCallback((dispatchId, trackingInfo) => {
        setDispatchHistory(prev =>
            prev.map(d =>
                d.id === dispatchId
                    ? {
                        ...d,
                        tracking: trackingInfo,
                        status: 'SUCCESS',
                        arrivedAt: new Date()
                    }
                    : d
            )
        );
    }, []);

    // Mark dispatch as failed
    const markDispatchFailed = useCallback((dispatchId, reason) => {
        setDispatchHistory(prev =>
            prev.map(d =>
                d.id === dispatchId
                    ? {
                        ...d,
                        status: 'FAILED',
                        failureReason: reason,
                        failedAt: new Date()
                    }
                    : d
            )
        );
    }, []);

    // Get all dispatches
    const getDispatches = useCallback((filter = 'ALL') => {
        if (filter === 'ALL') return dispatchHistory;
        return dispatchHistory.filter(d => d.status === filter);
    }, [dispatchHistory]);

    // Get dispatch by incident ID
    const getDispatchByIncident = useCallback((incidentId) => {
        return dispatchHistory.find(d => d.incidentId === incidentId);
    }, [dispatchHistory]);

    // Clear old dispatches (keep last 100)
    const clearOldDispatches = useCallback(() => {
        setDispatchHistory(prev => prev.slice(0, 100));
    }, []);

    // Clear all history
    const clearAll = useCallback(() => {
        setDispatchHistory([]);
    }, []);

    const value = {
        dispatchHistory,
        addDispatch,
        updateDispatchStatus,
        updateDispatchTracking,
        markDispatchFailed,
        getDispatches,
        getDispatchByIncident,
        clearOldDispatches,
        clearAll
    };

    return (
        <DispatchHistoryContext.Provider value={value}>
            {children}
        </DispatchHistoryContext.Provider>
    );
};

/**
 * useDispatchHistory - Hook to access dispatch history context
 */
export const useDispatchHistory = () => {
    const context = useContext(DispatchHistoryContext);
    if (!context) {
        throw new Error('useDispatchHistory must be used within DispatchHistoryProvider');
    }
    return context;
};

export default DispatchHistoryContext;
