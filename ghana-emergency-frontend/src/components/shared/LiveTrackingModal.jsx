import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import LiveMap from './LiveMap';

/**
 * LiveTrackingModal - Shows real-time vehicle tracking from base station to incident
 */
const LiveTrackingModal = ({ 
    isOpen, 
    onClose, 
    vehicle, 
    incident, 
    baseStation 
}) => {
    const [progress, setProgress] = useState(0);
    const [animationComplete, setAnimationComplete] = useState(false);
    const [vehicleLocation, setVehicleLocation] = useState({
        lat: baseStation?.lat || 5.5391,
        lng: baseStation?.lng || -0.2265
    });

    if (!isOpen || !vehicle || !incident) return null;

    // Calculate distance using Haversine formula
    const calculateDistance = (lat1, lng1, lat2, lng2) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const distanceKm = calculateDistance(
        baseStation?.lat || 5.5391,
        baseStation?.lng || -0.2265,
        incident.lat || 5.6037,
        incident.lng || -0.1870
    );

    // ETA calculation (assuming 50 km/h average speed)
    const etaMinutes = Math.round((distanceKm / 50) * 60);

    // Interpolate vehicle position
    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                const newProgress = prev + 1;
                if (newProgress >= 100) {
                    setAnimationComplete(true);
                    return 100;
                }
                return newProgress;
            });
        }, 100);

        return () => clearInterval(interval);
    }, []);

    // Update vehicle location based on progress
    useEffect(() => {
        const baseLat = baseStation?.lat || 5.5391;
        const baseLng = baseStation?.lng || -0.2265;
        const targetLat = incident.lat || 5.6037;
        const targetLng = incident.lng || -0.1870;

        const newLat = baseLat + (targetLat - baseLat) * (progress / 100);
        const newLng = baseLng + (targetLng - baseLng) * (progress / 100);

        setVehicleLocation({ lat: newLat, lng: newLng });
    }, [progress]);

    const mapMarkers = [
        {
            id: 'base',
            lat: baseStation?.lat || 5.5391,
            lng: baseStation?.lng || -0.2265,
            type: 'BASE_STATION',
            title: baseStation?.name || 'Base Station',
            description: 'Starting Point',
            color: 'emerald',
            status: 'BASE'
        },
        {
            id: 'vehicle',
            lat: vehicleLocation.lat,
            lng: vehicleLocation.lng,
            type: 'VEHICLE',
            title: vehicle.title || 'Unit En Route',
            description: `${Math.round(progress)}% complete`,
            color: vehicle.color || 'blue',
            status: 'MOVING'
        },
        {
            id: 'incident',
            lat: incident.lat || 5.6037,
            lng: incident.lng || -0.1870,
            type: 'INCIDENT',
            title: incident.title || 'Incident Location',
            description: incident.description || 'Destination',
            color: 'rose',
            status: 'DESTINATION'
        }
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
            <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-primary to-primary/80 dark:from-slate-800 dark:to-slate-900 p-8 text-white">
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h2 className="text-3xl font-black uppercase tracking-tight italic mb-2">
                                Live Tracking
                            </h2>
                            <p className="text-sm opacity-90">
                                Vehicle en route to destination
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-2xl hover:scale-110 transition-transform"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-3">
                        <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                            <span>Progress</span>
                            <span>{progress}%</span>
                        </div>
                        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-white rounded-full"
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>
                    </div>
                </div>

                {/* Map Section */}
                <div className="p-8 bg-slate-50 dark:bg-slate-800/50">
                    <div className="h-[500px] w-full rounded-2xl overflow-hidden shadow-lg border-2 border-slate-100 dark:border-slate-700">
                        <LiveMap 
                            markers={mapMarkers}
                            center={{ lat: vehicleLocation.lat, lng: vehicleLocation.lng }}
                        />
                    </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                    {/* Base Station */}
                    <motion.div
                        whileHover={{ y: -2 }}
                        className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-emerald-600">
                                location_city
                            </span>
                            <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                                Base Station
                            </p>
                        </div>
                        <p className="font-black text-slate-900 dark:text-white">
                            {baseStation?.name || 'Starting Point'}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                            Lat: {(baseStation?.lat || 5.5391).toFixed(4)}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                            Lng: {(baseStation?.lng || -0.2265).toFixed(4)}
                        </p>
                    </motion.div>

                    {/* Vehicle Info */}
                    <motion.div
                        whileHover={{ y: -2 }}
                        className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-blue-600 animate-pulse">
                                directions_car
                            </span>
                            <p className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                                Vehicle
                            </p>
                        </div>
                        <p className="font-black text-slate-900 dark:text-white">
                            {vehicle.title}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                            Status: En Route
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                            Distance: {distanceKm.toFixed(2)} km
                        </p>
                    </motion.div>

                    {/* Destination */}
                    <motion.div
                        whileHover={{ y: -2 }}
                        className="p-4 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/50"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-rose-600">
                                location_on
                            </span>
                            <p className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">
                                Destination
                            </p>
                        </div>
                        <p className="font-black text-slate-900 dark:text-white truncate">
                            {incident.title}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                            ETA: ~{etaMinutes} minutes
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                            {incident.description}
                        </p>
                    </motion.div>
                </div>

                {/* Status Messages */}
                <div className="px-8 py-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
                    <div className="space-y-3">
                        <motion.div
                            animate={{ opacity: progress < 50 ? 1 : 0.5 }}
                            className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                        >
                            <span className="material-symbols-outlined text-blue-600">
                                directions_run
                            </span>
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                Vehicle dispatched and traveling to destination...
                            </span>
                        </motion.div>

                        {progress >= 50 && progress < 100 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"
                            >
                                <span className="material-symbols-outlined text-amber-600 animate-pulse">
                                    schedule
                                </span>
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                    Halfway there - ETA ~{Math.ceil(etaMinutes * (1 - progress/100))} minutes
                                </span>
                            </motion.div>
                        )}

                        {animationComplete && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800"
                            >
                                <span className="material-symbols-outlined text-emerald-600">
                                    check_circle
                                </span>
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                    Vehicle arrived at destination!
                                </span>
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-8 py-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-8 py-3 bg-slate-900 dark:bg-slate-800 text-white rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-slate-800 dark:hover:bg-slate-700 transition-all"
                    >
                        Close Tracking
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default LiveTrackingModal;
