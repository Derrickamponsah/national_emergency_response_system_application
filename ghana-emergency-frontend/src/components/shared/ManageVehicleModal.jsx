import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { vehicleService } from '../../services/vehicleService';

const ManageVehicleModal = ({ isOpen, onClose, vehicle = null, fixedType = null, onRefresh }) => {
    const isEdit = !!vehicle;
    const [form, setForm] = useState({
        registrationNumber: '',
        type: fixedType || 'AMBULANCE',
        status: 'IDLE',
        driverName: '',
        fuelLevel: 100,
        latitude: 5.6037,
        longitude: -0.1870
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (vehicle) {
            setForm({
                registrationNumber: vehicle.registrationNumber || '',
                type: vehicle.type || fixedType || 'AMBULANCE',
                status: vehicle.status || 'IDLE',
                driverName: vehicle.driverName || '',
                fuelLevel: vehicle.fuelLevel || 100,
                latitude: vehicle.latitude || 5.6037,
                longitude: vehicle.longitude || -0.1870
            });
        } else {
            setForm({
                registrationNumber: '',
                type: fixedType || 'AMBULANCE',
                status: 'IDLE',
                driverName: '',
                fuelLevel: 100,
                latitude: 5.6037,
                longitude: -0.1870
            });
        }
    }, [vehicle, fixedType, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isEdit) {
                await vehicleService.update(vehicle.id, form);
            } else {
                await vehicleService.register(form);
            }
            onRefresh && onRefresh();
            onClose();
        } catch (error) {
            console.error('Failed to save vehicle:', error);
            alert('Failed to save vehicle. Check backend connection.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to decommission this vehicle? This action cannot be undone.')) return;
        setLoading(true);
        try {
            await vehicleService.delete(vehicle.id);
            onRefresh && onRefresh();
            onClose();
        } catch (error) {
            console.error('Failed to delete vehicle:', error);
            alert('Failed to delete vehicle.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={onClose}>
                <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white dark:bg-slate-900 rounded-[32px] w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden" onClick={e => e.stopPropagation()}>
                    <div className="p-8">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">
                                    {isEdit ? 'Update Asset' : 'Register Asset'}
                                </h2>
                                <p className="text-xs text-slate-500 font-bold tracking-widest uppercase mt-1">Fleet Management Command</p>
                            </div>
                            <button onClick={onClose} className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Reg Number *</label>
                                    <input required value={form.registrationNumber} onChange={e => setForm({ ...form, registrationNumber: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none" placeholder="e.g. GR-902-23" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Status</label>
                                    <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold">
                                        <option value="IDLE">Idle / Standby</option>
                                        <option value="PATROLLING">Patrolling</option>
                                        <option value="EN_ROUTE">En route</option>
                                        <option value="ON_SCENE">On Scene</option>
                                        <option value="MAINTENANCE">Maintenance</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Driver Name</label>
                                    <input value={form.driverName} onChange={e => setForm({ ...form, driverName: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold outline-none" placeholder="Assigned personnel" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Asset Type</label>
                                    <select disabled={!!fixedType} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold">
                                        <option value="AMBULANCE">Ambulance</option>
                                        <option value="FIRE_TRUCK">Fire Truck</option>
                                        <option value="POLICE">Police Unit</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Latitude</label>
                                    <input required type="number" step="0.000001" value={form.latitude} onChange={e => setForm({ ...form, latitude: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Longitude</label>
                                    <input required type="number" step="0.000001" value={form.longitude} onChange={e => setForm({ ...form, longitude: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold" />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                {isEdit && (
                                    <button type="button" onClick={handleDelete} disabled={loading} className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center shadow-lg shadow-rose-500/10">
                                        <span className="material-symbols-outlined">delete_forever</span>
                                    </button>
                                )}
                                <button type="submit" disabled={loading} className={`flex-1 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 ${
                                    fixedType === 'POLICE' ? 'bg-police-main text-white' :
                                    fixedType === 'FIRE_TRUCK' ? 'bg-fire-main text-white' :
                                    'bg-medical-main text-white'
                                }`}>
                                    <span className={`material-symbols-outlined ${loading ? 'animate-spin' : ''}`}>
                                        {loading ? 'sync' : 'save'}
                                    </span>
                                    {isEdit ? 'Sync Changes' : 'Commence Commissioning'}
                                </button>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ManageVehicleModal;
