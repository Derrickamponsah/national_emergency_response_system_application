import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useDispatchHistory } from '../../contexts/DispatchHistoryContext';

const AllDispatchedIncidents = ({ adminRole = 'SYSTEM_ADMIN' }) => {
    const { getDispatches } = useDispatchHistory();
    const [filter, setFilter] = useState('ALL');

    // Get filtered incidents from context
    const filtered = getDispatches(filter);

    const getTypeIcon = (type) => {
        const icons = {
            MEDICAL: 'local_hospital',
            FIRE: 'fire_truck',
            CRIME: 'local_police',
            POLICE: 'local_police',
            ROAD_ACCIDENT: 'directions_car',
        };
        return icons[type] || 'emergency';
    };

    const getTypeColor = (type) => {
        const colors = {
            MEDICAL: 'blue',
            FIRE: 'orange',
            CRIME: 'indigo',
            POLICE: 'indigo',
            ROAD_ACCIDENT: 'amber',
        };
        return colors[type] || 'slate';
    };

    const getStatusBadge = (status) => {
        const configs = {
            SUCCESS: {
                bg: 'bg-emerald-50 dark:bg-emerald-900/20',
                text: 'text-emerald-700 dark:text-emerald-300',
                icon: 'check_circle',
                label: 'Success',
            },
            WAITING: {
                bg: 'bg-amber-50 dark:bg-amber-900/20',
                text: 'text-amber-700 dark:text-amber-300',
                icon: 'schedule',
                label: 'Waiting',
            },
            FAILED: {
                bg: 'bg-rose-50 dark:bg-rose-900/20',
                text: 'text-rose-700 dark:text-rose-300',
                icon: 'cancel',
                label: 'Failed',
            },
        };
        return configs[status] || configs.WAITING;
    };

    const timeAgo = (date) => {
        if (!date) return 'Just now';
        const d = date instanceof Date ? date : new Date(date);
        const minutes = Math.floor((Date.now() - d.getTime()) / 60000);
        if (minutes < 1) return 'Just now';
        if (minutes === 1) return '1 min ago';
        return `${minutes} mins ago`;
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic mb-2">
                    Dispatch Log
                </h2>
                <p className="text-xs text-slate-500 font-bold tracking-widest uppercase">
                    All incidents dispatched by administrator • Real-time tracking
                </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
                {['ALL', 'SUCCESS', 'WAITING', 'FAILED'].map((status) => (
                    <motion.button
                        key={status}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setFilter(status)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all ${
                            filter === status
                                ? 'bg-primary text-white shadow-lg'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-primary/50'
                        }`}
                    >
                        {status}
                    </motion.button>
                ))}
            </div>

            {/* Incidents List */}
            <div className="space-y-3">
                {filtered.length > 0 ? (
                    filtered.map((incident, i) => {
                        const statusConfig = getStatusBadge(incident.status);
                        const incidentType = incident.type || incident.incidentType || 'UNKNOWN';
                        const typeColor = getTypeColor(incidentType);

                        return (
                            <motion.div
                                key={incident.id || i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.08 }}
                                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all overflow-hidden"
                            >
                                <div className="p-5 space-y-4">
                                    {/* Header */}
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-3 flex-1 min-w-0">
                                            <div
                                                className={`w-12 h-12 rounded-xl bg-${typeColor}-100 dark:bg-${typeColor}-900/20 flex items-center justify-center shrink-0`}
                                            >
                                                <span className={`material-symbols-outlined text-${typeColor}-600`}>
                                                    {getTypeIcon(incidentType)}
                                                </span>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                    <h3 className="font-black text-sm text-slate-900 dark:text-white">
                                                        {incident.incidentId || incident.id}
                                                    </h3>
                                                    <span className="text-xs font-bold text-slate-500">•</span>
                                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                                                        {String(incidentType).replace(/_/g, ' ')}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                                                    {incident.location}
                                                </p>
                                            </div>
                                        </div>

                                        <div
                                            className={`px-3 py-1.5 rounded-lg ${statusConfig.bg} flex items-center gap-1.5 whitespace-nowrap shrink-0`}
                                        >
                                            <span className={`material-symbols-outlined text-xs ${statusConfig.text}`}>
                                                {statusConfig.icon}
                                            </span>
                                            <span className={`text-xs font-bold uppercase tracking-wide ${statusConfig.text}`}>
                                                {statusConfig.label}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Details Grid */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                                        <div>
                                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Vehicle</p>
                                            <div className="flex items-center gap-1.5">
                                                <span className="material-symbols-outlined text-sm text-primary">directions_car</span>
                                                <span className="font-bold text-sm text-slate-900 dark:text-white">
                                                    {incident.dispatchedVehicle || 'N/A'}
                                                </span>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Base Station</p>
                                            <div className="flex items-center gap-1.5">
                                                <span className="material-symbols-outlined text-sm text-primary">location_city</span>
                                                <span className="font-bold text-sm text-slate-900 dark:text-white">
                                                    {incident.baseStation || 'N/A'}
                                                </span>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">ETA</p>
                                            <div className="flex items-center gap-1.5">
                                                <span className="material-symbols-outlined text-sm text-primary">schedule</span>
                                                <span className="font-bold text-sm text-slate-900 dark:text-white">
                                                    {incident.estimatedArrival || '~8-12 mins'}
                                                </span>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Dispatched</p>
                                            <div className="flex items-center gap-1.5">
                                                <span className="material-symbols-outlined text-sm text-slate-400">schedule</span>
                                                <span className="font-bold text-sm text-slate-600 dark:text-slate-300">
                                                    {timeAgo(incident.dispatchedAt)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Live Tracking Preview */}
                                    {incident.status === 'SUCCESS' && (
                                        <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">
                                            <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                                                <span className="material-symbols-outlined text-sm animate-pulse">location_on</span>
                                                <span>Live tracking: En route from {incident.baseStation} to destination</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })
                ) : (
                    <div className="text-center py-12">
                        <span className="material-symbols-outlined text-5xl text-slate-300 mb-3 block">inbox</span>
                        <p className="text-slate-500 font-bold">No incidents dispatched yet</p>
                    </div>
                )}
            </div>

            {/* Summary Stats */}
            {filtered.length > 0 && (
                <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
                    <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl">
                        <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                            {filtered.filter((i) => i.status === 'SUCCESS').length}
                        </div>
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-1">Successful</p>
                    </div>
                    <div className="text-center p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl">
                        <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
                            {filtered.filter((i) => i.status === 'WAITING').length}
                        </div>
                        <p className="text-xs text-amber-600 dark:text-amber-400 font-bold mt-1">Waiting</p>
                    </div>
                    <div className="text-center p-4 bg-rose-50 dark:bg-rose-900/10 rounded-xl">
                        <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
                            {filtered.filter((i) => i.status === 'FAILED').length}
                        </div>
                        <p className="text-xs text-rose-600 dark:text-rose-400 font-bold mt-1">Failed</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AllDispatchedIncidents;
