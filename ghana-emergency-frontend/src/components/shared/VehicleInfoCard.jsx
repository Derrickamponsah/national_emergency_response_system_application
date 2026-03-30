import React from 'react';
import { motion } from 'framer-motion';
import { getIncidentVehicleMapping } from '../utils/vehicleTypeMapping';

/**
 * VehicleInfoCard component - Displays vehicle type based on incident type
 * Fixes the issue where all incidents were showing ambulance
 */
const VehicleInfoCard = ({
    incidentType,
    registrationNumber = 'N/A',
    baseStation = 'N/A',
    status = 'AVAILABLE',
    eta = '-- min',
    location = null,
    compact = false
}) => {
    const mapping = getIncidentVehicleMapping(incidentType);

    const statusColors = {
        AVAILABLE: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400', icon: 'check_circle' },
        EN_ROUTE: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400', icon: 'directions' },
        ARRIVED: { bg: 'bg-indigo-50 dark:bg-indigo-900/20', text: 'text-indigo-600 dark:text-indigo-400', icon: 'location_on' },
        DISABLED: { bg: 'bg-slate-50 dark:bg-slate-900/20', text: 'text-slate-600 dark:text-slate-400', icon: 'error' }
    };

    const statusConfig = statusColors[status] || statusColors.AVAILABLE;

    if (compact) {
        return (
            <motion.div
                whileHover={{ y: -4 }}
                className={`p-3 rounded-xl bg-${mapping.color}-50 dark:bg-${mapping.color}-900/20 border border-${mapping.color}-200 dark:border-${mapping.color}-800/50`}
            >
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-${mapping.color}-100 dark:bg-${mapping.color}-800 flex items-center justify-center`}>
                        <span className={`material-symbols-outlined text-${mapping.color}-600`}>
                            {mapping.icon}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className={`text-xs font-bold text-${mapping.color}-900 dark:text-${mapping.color}-100 tracking-widest uppercase`}>
                            {mapping.label}
                        </h4>
                        <p className={`text-xs text-${mapping.color}-700 dark:text-${mapping.color}-200`}>
                            {registrationNumber}
                        </p>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-5 rounded-2xl bg-gradient-to-br from-${mapping.color}-50 to-${mapping.color}-100 dark:from-${mapping.color}-900/20 dark:to-${mapping.color}-800/20 border border-${mapping.color}-200 dark:border-${mapping.color}-800/50`}
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-start gap-3">
                    <div className={`w-14 h-14 rounded-xl bg-${mapping.color}-100 dark:bg-${mapping.color}-800 flex items-center justify-center`}>
                        <span className={`material-symbols-outlined text-3xl text-${mapping.color}-600 dark:text-${mapping.color}-300`}>
                            {mapping.icon}
                        </span>
                    </div>
                    <div>
                        <h3 className={`text-lg font-black text-${mapping.color}-900 dark:text-${mapping.color}-100`}>
                            {mapping.label}
                        </h3>
                        <p className={`text-xs text-${mapping.color}-700 dark:text-${mapping.color}-200 font-bold mt-1`}>
                            {mapping.description}
                        </p>
                    </div>
                </div>
                <motion.div
                    className={`px-3 py-1 rounded-lg ${statusConfig.bg} flex items-center gap-1.5 whitespace-nowrap`}
                >
                    <span className={`material-symbols-outlined text-sm ${statusConfig.text}`}>
                        {statusConfig.icon}
                    </span>
                    <span className={`text-xs font-bold ${statusConfig.text}`}>
                        {status}
                    </span>
                </motion.div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                        Registration
                    </p>
                    <p className="text-sm font-black text-slate-900 dark:text-white">
                        {registrationNumber}
                    </p>
                </div>
                <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                        Base Station
                    </p>
                    <p className="text-sm font-black text-slate-900 dark:text-white">
                        {baseStation}
                    </p>
                </div>
            </div>

            {/* Services */}
            <div className="mb-4">
                <p className="text-xs text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider mb-2">
                    Services Available
                </p>
                <div className="flex flex-wrap gap-1.5">
                    {mapping.services.map((service, idx) => (
                        <span
                            key={idx}
                            className={`text-xs px-2.5 py-1.5 rounded-full bg-white dark:bg-slate-800 text-${mapping.color}-700 dark:text-${mapping.color}-300 font-bold border border-${mapping.color}-200 dark:border-${mapping.color}-700`}
                        >
                            {service}
                        </span>
                    ))}
                </div>
            </div>

            {/* ETA and Location */}
            <div className="grid grid-cols-2 gap-3">
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="p-3 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur border border-white/20 dark:border-slate-700/50"
                >
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">
                        ETA
                    </p>
                    <p className="text-lg font-black text-slate-900 dark:text-white">
                        {eta}
                    </p>
                </motion.div>
                {location && (
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="p-3 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur border border-white/20 dark:border-slate-700/50 flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-primary">location_on</span>
                        <div>
                            <p className="text-xs text-slate-500 font-bold">
                                Location
                            </p>
                            <p className="text-xs text-slate-900 dark:text-white font-bold truncate">
                                {typeof location === 'string' ? location : `${location.lat?.toFixed(3)}, ${location.lng?.toFixed(3)}`}
                            </p>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Secondary vehicle info for road accidents */}
            {mapping.secondaryType && (
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider mb-2">
                        Additional Support
                    </p>
                    <p className="text-sm text-slate-700 dark:text-slate-300 font-bold">
                        {mapping.secondaryLabel}
                    </p>
                </div>
            )}
        </motion.div>
    );
};

export default VehicleInfoCard;
