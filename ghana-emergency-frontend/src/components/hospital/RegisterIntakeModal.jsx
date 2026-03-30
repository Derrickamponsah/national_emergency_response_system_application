import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { incidentService } from '../../services/incidentService';

const RegisterIntakeModal = ({ isOpen, onClose }) => {
    const [form, setForm] = useState({ 
        name: '', 
        age: '', 
        gender: 'M', 
        complaint: '', 
        priority: 'STANDARD', 
        contactName: '', 
        contactPhone: '', 
        allergies: '', 
        bloodType: '' 
    });
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Map UI priority to Backend Severity enum
            const priorityMap = {
                'CRITICAL': 'CRITICAL',
                'URGENT': 'HIGH',
                'STANDARD': 'MEDIUM',
                'NON_URGENT': 'LOW'
            };

            // Log as a medical incident
            await incidentService.create({
                citizen_name: form.name,
                citizen_phone: form.contactPhone || 'N/A',
                incident_type: 'MEDICAL',
                location_description: 'Hospital Intake Desk',
                notes: `Complaint: ${form.complaint}. Allergies: ${form.allergies}. Blood: ${form.bloodType}`,
                severity: priorityMap[form.priority] || 'MEDIUM',
                latitude: 5.5391, // Default to Korle-Bu for intake
                longitude: -0.2265
            });

            setSubmitted(true);
            setTimeout(() => { 
                setSubmitted(false); 
                onClose(); 
                setForm({ name: '', age: '', gender: 'M', complaint: '', priority: 'STANDARD', contactName: '', contactPhone: '', allergies: '', bloodType: '' }); 
            }, 2000);
        } catch (error) {
            console.error("Failed to register intake:", error);
            alert("Failed to sync intake with command center. Please check network.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
                <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} onClick={e => e.stopPropagation()} className="bg-white dark:bg-slate-900 rounded-[32px] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800">
                    <div className="p-8">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">Register Intake</h2>
                                <p className="text-xs text-slate-500 font-bold tracking-widest uppercase mt-1">New Patient Registration</p>
                            </div>
                            <button onClick={onClose} className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {submitted ? (
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16">
                                <span className="material-symbols-outlined text-6xl text-emerald-500 mb-4">check_circle</span>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white">Patient Registered</h3>
                                <p className="text-sm text-slate-500 mt-2">Triage queue updated</p>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Full Name *</label>
                                        <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-medical-main/30" placeholder="Patient name" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Age *</label>
                                            <input required type="number" min="0" max="150" value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-medical-main/30" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Gender *</label>
                                            <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-medical-main/30">
                                                <option value="M">Male</option>
                                                <option value="F">Female</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Chief Complaint *</label>
                                    <textarea required rows={3} value={form.complaint} onChange={e => setForm({ ...form, complaint: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-medical-main/30 resize-none" placeholder="Describe presenting symptoms" />
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block">Triage Priority *</label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {[{ v: 'CRITICAL', c: 'bg-rose-500' }, { v: 'URGENT', c: 'bg-amber-500' }, { v: 'STANDARD', c: 'bg-blue-500' }, { v: 'NON_URGENT', c: 'bg-slate-400' }].map(p => (
                                            <button type="button" key={p.v} onClick={() => setForm({ ...form, priority: p.v })} className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border-2 ${form.priority === p.v ? `${p.c} text-white border-transparent shadow-lg` : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'}`}>
                                                {p.v.replace('_', ' ')}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Blood Type</label>
                                        <select value={form.bloodType} onChange={e => setForm({ ...form, bloodType: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-medical-main/30">
                                            <option value="">Unknown</option>
                                            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(b => <option key={b} value={b}>{b}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Known Allergies</label>
                                        <input value={form.allergies} onChange={e => setForm({ ...form, allergies: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-medical-main/30" placeholder="e.g. Penicillin" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Emergency Contact</label>
                                        <input value={form.contactName} onChange={e => setForm({ ...form, contactName: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-medical-main/30" placeholder="Contact name" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Contact Phone</label>
                                        <input value={form.contactPhone} onChange={e => setForm({ ...form, contactPhone: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-medical-main/30" placeholder="+233..." />
                                    </div>
                                </div>

                                <button type="submit" className="w-full py-4 bg-medical-main hover:bg-teal-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-teal-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3">
                                    <span className="material-symbols-outlined">person_add</span>
                                    Register Patient
                                </button>
                            </form>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default RegisterIntakeModal;
