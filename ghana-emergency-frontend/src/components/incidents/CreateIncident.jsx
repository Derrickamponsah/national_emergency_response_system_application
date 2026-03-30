import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { INCIDENT_TYPES } from '../../utils/constants';
import { incidentService } from '../../services/incidentService';
import { useDispatchHistory } from '../../contexts/DispatchHistoryContext'; // ✅ ADDED

const CreateIncident = () => {
    const { addDispatch } = useDispatchHistory(); // ✅ ADDED

    const [formData, setFormData] = useState({
        citizen_name: '',
        citizen_phone: '',
        incident_type: 'MEDICAL',
        location_description: '',
        notes: '',
        latitude: '',
        longitude: '',
        severity: 'MEDIUM'
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitResult, setSubmitResult] = useState(null); // { type: 'success' | 'error', message }
    const [geoStatus, setGeoStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'

    // Auto-detect geolocation on mount
    useEffect(() => {
        detectLocation();
    }, []);

    const detectLocation = () => {
        if (!navigator.geolocation) {
            setGeoStatus('error');
            return;
        }
        setGeoStatus('loading');
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setFormData(prev => ({
                    ...prev,
                    latitude: position.coords.latitude.toFixed(4),
                    longitude: position.coords.longitude.toFixed(4)
                }));
                setGeoStatus('success');
            },
            (error) => {
                console.warn('Geolocation error:', error.message);
                // Fallback to Accra center coordinates
                setFormData(prev => ({
                    ...prev,
                    latitude: '5.6037',
                    longitude: '-0.1870'
                }));
                setGeoStatus('error');
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTypeSelect = (type) => {
        setFormData(prev => ({ ...prev, incident_type: type }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitResult(null);

        // Client-side validation
        if (!formData.citizen_name.trim() || !formData.citizen_phone.trim() || !formData.location_description.trim()) {
            setSubmitResult({ type: 'error', message: 'Caller Name, Contact ID, and Location are required.' });
            return;
        }
        if (!formData.latitude || !formData.longitude) {
            setSubmitResult({ type: 'error', message: 'GPS coordinates are required. Click "Detect GPS" or enter manually.' });
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                citizen_name: formData.citizen_name.trim(),
                citizen_phone: formData.citizen_phone.trim(),
                incident_type: formData.incident_type,
                location_description: formData.location_description.trim(),
                notes: formData.notes.trim(),
                latitude: parseFloat(formData.latitude),
                longitude: parseFloat(formData.longitude),
                severity: formData.severity
            };

            const result = await incidentService.create(payload);
            console.log('✅ Incident created:', result);

            // ✅ ADDED: write to context so AllDispatchedIncidents displays this log
            addDispatch({
                incidentId: result.incident?.incident_id || `INC-${Date.now()}`,
                type: formData.incident_type,
                location: formData.location_description.trim(),
                status: 'SUCCESS',
                dispatchedVehicle: result.incident?.assigned_vehicle || 'Auto-Assigned',
                baseStation: result.incident?.base_station || 'Central HQ',
                estimatedArrival: result.incident?.eta || '~8-12 mins',
                dispatchedAt: new Date(),
                severity: formData.severity,
                callerName: formData.citizen_name.trim(),
            });

            setSubmitResult({ type: 'success', message: `Incident dispatched successfully! ID: ${result.incident?.incident_id || 'N/A'}` });

            // Reset form after success
            setTimeout(() => {
                setFormData({
                    citizen_name: '',
                    citizen_phone: '',
                    incident_type: 'MEDICAL',
                    location_description: '',
                    notes: '',
                    latitude: formData.latitude,  // keep coordinates
                    longitude: formData.longitude
                });
                setSubmitResult(null);
            }, 3000);

        } catch (error) {
            console.error('❌ Dispatch failed:', error);
            const errorMsg = error.response?.data?.error || error.message || 'Failed to dispatch incident. Check backend connection.';

            // ✅ ADDED: log failed dispatches so they appear in the log too
            addDispatch({
                incidentId: `INC-FAILED-${Date.now()}`,
                type: formData.incident_type,
                location: formData.location_description.trim(),
                status: 'FAILED',
                dispatchedVehicle: 'N/A',
                baseStation: 'N/A',
                estimatedArrival: 'N/A',
                dispatchedAt: new Date(),
                severity: formData.severity,
                callerName: formData.citizen_name.trim(),
            });

            setSubmitResult({ type: 'error', message: errorMsg });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col h-full bg-white dark:bg-background-dark border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm overflow-hidden"
        >
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-accent-red/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-accent-red">
                        priority_high
                    </span>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">New Incident</h3>
                    <p className="text-xs text-slate-500 font-medium">Input critical event details below</p>
                </div>
            </div>

            {/* Result Banner */}
            {submitResult && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mb-4 p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${submitResult.type === 'success'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                >
                    <span className="material-symbols-outlined text-sm">
                        {submitResult.type === 'success' ? 'check_circle' : 'error'}
                    </span>
                    {submitResult.message}
                </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[11px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1.5 ml-1">
                            <span className="material-symbols-outlined text-[14px]">person</span>
                            Caller Name *
                        </label>
                        <input
                            type="text"
                            name="citizen_name"
                            value={formData.citizen_name}
                            onChange={handleChange}
                            placeholder="John Doe"
                            required
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[11px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1.5 ml-1">
                            <span className="material-symbols-outlined text-[14px]">phone</span>
                            Contact ID *
                        </label>
                        <input
                            type="text"
                            name="citizen_phone"
                            value={formData.citizen_phone}
                            onChange={handleChange}
                            placeholder="+233 24 123 4567"
                            required
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[11px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1.5 ml-1">
                        <span className="material-symbols-outlined text-[14px]">emergency</span>
                        Classification
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                        {INCIDENT_TYPES.map((type) => (
                            <button
                                key={type.value}
                                type="button"
                                className={`py-2 px-1 rounded-lg border text-[10px] font-bold transition-all transition-transform active:scale-95 ${formData.incident_type === type.value
                                        ? 'bg-primary border-primary text-white shadow-md'
                                        : 'bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-slate-800'
                                    }`}
                                onClick={() => handleTypeSelect(type.value)}
                            >
                                {type.value}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[11px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1.5 ml-1">
                        <span className="material-symbols-outlined text-[14px]">location_on</span>
                        Location Description *
                    </label>
                    <input
                        type="text"
                        name="location_description"
                        value={formData.location_description}
                        onChange={handleChange}
                        placeholder="e.g., Independence Square, Accra"
                        required
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all"
                    />
                </div>

                {/* GPS Coordinates */}
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <label className="text-[11px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1.5 ml-1">
                            <span className="material-symbols-outlined text-[14px]">my_location</span>
                            GPS Coordinates *
                        </label>
                        <button
                            type="button"
                            onClick={detectLocation}
                            className="text-[10px] font-bold text-primary hover:text-primary/80 flex items-center gap-1 transition-all"
                        >
                            <span className={`material-symbols-outlined text-[14px] ${geoStatus === 'loading' ? 'animate-spin' : ''}`}>
                                {geoStatus === 'loading' ? 'sync' : geoStatus === 'success' ? 'check_circle' : 'my_location'}
                            </span>
                            {geoStatus === 'loading' ? 'Detecting...' : geoStatus === 'success' ? 'GPS Locked' : 'Detect GPS'}
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <input
                            type="number"
                            step="0.0001"
                            name="latitude"
                            value={formData.latitude}
                            onChange={handleChange}
                            placeholder="5.6037"
                            required
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all"
                        />
                        <input
                            type="number"
                            step="0.0001"
                            name="longitude"
                            value={formData.longitude}
                            onChange={handleChange}
                            placeholder="-0.1870"
                            required
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all"
                        />
                    </div>
                    {geoStatus === 'error' && (
                        <p className="text-[10px] text-amber-500 font-bold ml-1">
                            ⚠ GPS unavailable — using Accra fallback. You can edit coordinates manually.
                        </p>
                    )}
                </div>

                <div className="space-y-1.5">
                    <label className="text-[11px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1.5 ml-1">
                        <span className="material-symbols-outlined text-[14px]">priority_high</span>
                        Protocol Priority
                    </label>
                    <select
                        name="severity"
                        value={formData.severity}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all shadow-inner"
                    >
                        <option value="CRITICAL">Critical / Life-Threatening</option>
                        <option value="HIGH">High / Urgent</option>
                        <option value="MEDIUM">Medium / Standard</option>
                        <option value="LOW">Low / Non-Urgent</option>
                    </select>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[11px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1.5 ml-1">
                        <span className="material-symbols-outlined text-[14px]">description</span>
                        Situational Intel
                    </label>
                    <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Provide essential details..."
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all resize-none"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:-translate-y-0.5 transition-all group mt-2 ${isSubmitting
                            ? 'bg-slate-400 cursor-not-allowed'
                            : 'bg-primary hover:bg-primary/90 text-white shadow-primary/20'
                        }`}
                >
                    <span className={`material-symbols-outlined ${isSubmitting ? 'animate-spin' : 'group-hover:animate-pulse'}`}>
                        {isSubmitting ? 'sync' : 'send'}
                    </span>
                    {isSubmitting ? 'Dispatching...' : 'Dispatch Logic'}
                </button>
            </form>
        </motion.div>
    );
};

export default CreateIncident;