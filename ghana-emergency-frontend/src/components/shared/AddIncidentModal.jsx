import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { incidentService } from '../../services/incidentService';
import { useDispatchHistory } from '../../contexts/DispatchHistoryContext'; // ✅ ADDED

const AddIncidentModal = ({ isOpen, onClose, fixedType = null }) => {
    const { addDispatch } = useDispatchHistory(); // ✅ ADDED

    const [formData, setFormData] = useState({
        citizen_name: '',
        citizen_phone: '',
        incident_type: fixedType || 'MEDICAL',
        location_description: '',
        notes: '',
        latitude: '5.6037',
        longitude: '-0.1870',
        severity: 'MEDIUM'
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitResult, setSubmitResult] = useState(null);
    const [geoStatus, setGeoStatus] = useState('idle');

    useEffect(() => {
        if (isOpen) {
            detectLocation();
            if (fixedType) {
                setFormData(prev => ({ ...prev, incident_type: fixedType }));
            }
        }
    }, [isOpen, fixedType]);

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
                    latitude: position.coords.latitude.toFixed(6),
                    longitude: position.coords.longitude.toFixed(6)
                }));
                setGeoStatus('success');
            },
            (error) => {
                setGeoStatus('error');
            },
            { enableHighAccuracy: true, timeout: 5000 }
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitResult(null);

        try {
            const payload = {
                ...formData,
                latitude: parseFloat(formData.latitude),
                longitude: parseFloat(formData.longitude)
            };
            const result = await incidentService.create(payload);

            // ✅ ADDED: write to context so AllDispatchedIncidents displays this log
            addDispatch({
                incidentId: result.incident?.incident_id || `INC-${Date.now()}`,
                type: fixedType || formData.incident_type,
                location: formData.location_description,
                status: 'SUCCESS',
                dispatchedVehicle: result.incident?.assigned_vehicle || 'Auto-Assigned',
                baseStation: result.incident?.base_station || 'Central HQ',
                estimatedArrival: result.incident?.eta || '~8-12 mins',
                dispatchedAt: new Date(),
                severity: formData.severity,
                callerName: formData.citizen_name,
            });

            setSubmitResult({ type: 'success', message: 'Incident logged successfully!' });
            setTimeout(() => {
                onClose();
                setSubmitResult(null);
            }, 2000);
        } catch (error) {
            console.error('Failed to log incident:', error);

            // ✅ ADDED: log failed dispatches so they appear in the log too
            addDispatch({
                incidentId: `INC-FAILED-${Date.now()}`,
                type: fixedType || formData.incident_type,
                location: formData.location_description,
                status: 'FAILED',
                dispatchedVehicle: 'N/A',
                baseStation: 'N/A',
                estimatedArrival: 'N/A',
                dispatchedAt: new Date(),
                severity: formData.severity,
                callerName: formData.citizen_name,
            });

            setSubmitResult({ type: 'error', message: 'Failed to log incident.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="bg-white dark:bg-slate-900 rounded-[32px] w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="p-8">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">
                                    Log {fixedType || 'New'} Incident
                                </h2>
                                <p className="text-xs text-slate-500 font-bold tracking-widest uppercase mt-1">
                                    Direct Command Registry
                                </p>
                            </div>
                            <button onClick={onClose} className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {submitResult && (
                            <div className={`mb-6 p-4 rounded-2xl text-sm font-bold flex items-center gap-3 ${submitResult.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                                }`}>
                                <span className="material-symbols-outlined uppercase">
                                    {submitResult.type === 'success' ? 'check_circle' : 'error'}
                                </span>
                                {submitResult.message}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Reporter Name</label>
                                    <input
                                        required
                                        value={formData.citizen_name}
                                        onChange={e => setFormData({ ...formData, citizen_name: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                                        placeholder="Full name"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Contact Phone</label>
                                    <input
                                        required
                                        value={formData.citizen_phone}
                                        onChange={e => setFormData({ ...formData, citizen_phone: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                                        placeholder="+233..."
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Location Description</label>
                                <input
                                    required
                                    value={formData.location_description}
                                    onChange={e => setFormData({ ...formData, location_description: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                                    placeholder="Nearest landmark..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Latitude</label>
                                    <input
                                        required
                                        value={formData.latitude}
                                        onChange={e => setFormData({ ...formData, latitude: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Longitude</label>
                                    <input
                                        required
                                        value={formData.longitude}
                                        onChange={e => setFormData({ ...formData, longitude: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                                    />
                                </div>
                            </div>

                            {!fixedType && (
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Incident Type</label>
                                    <select
                                        value={formData.incident_type}
                                        onChange={e => setFormData({ ...formData, incident_type: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold"
                                    >
                                        <option value="MEDICAL">Medical</option>
                                        <option value="FIRE">Fire</option>
                                        <option value="CRIME">Crime / Security</option>
                                        <option value="ACCIDENT">Road Accident</option>
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Priority Level</label>
                                <select
                                    value={formData.severity}
                                    onChange={e => setFormData({ ...formData, severity: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold shadow-inner"
                                >
                                    <option value="CRITICAL">Critical (Life Threat)</option>
                                    <option value="HIGH">High (Urgent)</option>
                                    <option value="MEDIUM">Medium (Standard)</option>
                                    <option value="LOW">Low (Routine)</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Additional Intel</label>
                                <textarea
                                    rows={2}
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold resize-none outline-none"
                                    placeholder="Optional notes..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 mt-4 ${fixedType === 'POLICE' ? 'bg-police-main text-white shadow-blue-500/20' :
                                        fixedType === 'FIRE' ? 'bg-fire-main text-white shadow-orange-500/20' :
                                            'bg-medical-main text-white shadow-teal-500/20'
                                    }`}
                            >
                                <span className={`material-symbols-outlined ${isSubmitting ? 'animate-spin' : ''}`}>
                                    {isSubmitting ? 'sync' : 'gavel'}
                                </span>
                                {isSubmitting ? 'Syncing...' : 'Authorize Registry'}
                            </button>
                        </form>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default AddIncidentModal;