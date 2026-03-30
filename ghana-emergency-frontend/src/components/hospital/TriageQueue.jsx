import React, { useState } from 'react';
import { motion } from 'framer-motion';
import StatusBadge from '../shared/StatusBadge';

const TriageQueue = ({ incidents = [] }) => {
    const [selectedPriority, setSelectedPriority] = useState('ALL');

    const mappedPatients = incidents.map(inc => ({
        id: `GH-${inc.id.substring(0, 4)}`,
        name: inc.citizen_name || 'Anonymous',
        age: 'N/A', // Not tracked in basic incident
        gender: 'N/A',
        complaint: inc.notes || inc.description || 'No complaint details provided',
        priority: inc.severity || 'MEDIUM',
        waitTime: 'NEW',
        vitals: { bp: 'N/A', hr: 'N/A', temp: 'N/A', spo2: 'N/A' },
        arrivedAt: new Date(inc.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: inc.status
    }));

    const patients = mappedPatients.length > 0 ? mappedPatients : [
        { id: 'TRG-001', name: 'Kwabena Adjei', age: 45, gender: 'M', complaint: 'Severe chest pain, shortness of breath', priority: 'CRITICAL', waitTime: '2 min', vitals: { bp: '180/110', hr: 120, temp: 37.2, spo2: 88 }, arrivedAt: '22:41' },
    ];

    const priorityColors = { CRITICAL: 'bg-rose-500', HIGH: 'bg-amber-500', MEDIUM: 'bg-blue-500', LOW: 'bg-slate-400', URGENT: 'bg-amber-500', STANDARD: 'bg-blue-500', NON_URGENT: 'bg-slate-400' };
    const priorityBg = { CRITICAL: 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800', HIGH: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800', MEDIUM: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800', LOW: 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700', URGENT: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800', STANDARD: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800', NON_URGENT: 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700' };

    const filtered = selectedPriority === 'ALL' ? patients : patients.filter(p => p.priority === selectedPriority);
    const counts = { ALL: patients.length, CRITICAL: patients.filter(p => p.priority === 'CRITICAL').length, HIGH: patients.filter(p => p.priority === 'HIGH' || p.priority === 'URGENT').length, MEDIUM: patients.filter(p => p.priority === 'MEDIUM' || p.priority === 'STANDARD').length, LOW: patients.filter(p => p.priority === 'LOW' || p.priority === 'NON_URGENT').length };

    return (
        <div>
            <header className="mb-12">
                <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">Triage Queue</h2>
                <div className="flex items-center gap-2 mt-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                    <p className="text-slate-500 text-xs font-bold tracking-widest uppercase">Patient Priority Management</p>
                </div>
            </header>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                {[{ label: 'Critical', count: counts.CRITICAL, color: 'text-rose-500 bg-rose-50 dark:bg-rose-900/20' }, { label: 'High', count: counts.HIGH, color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20' }, { label: 'Medium', count: counts.MEDIUM, color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' }, { label: 'Low', count: counts.LOW, color: 'text-slate-400 bg-slate-50 dark:bg-slate-800' }].map((c, i) => (
                    <div key={i} className={`${c.color} p-6 rounded-[24px] text-center`}>
                        <p className="text-3xl font-black">{c.count}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest mt-1 opacity-70">{c.label}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-8">
                {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(p => (
                    <button key={p} onClick={() => setSelectedPriority(p)} className={`px-5 py-2.5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all ${selectedPriority === p ? 'bg-medical-main text-white shadow-lg' : 'bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-50 border border-slate-200 dark:border-slate-700'}`}>
                        {p.replace('_', ' ')} ({counts[p] || 0})
                    </button>
                ))}
            </div>

            {/* Patient Queue */}
            <div className="space-y-4">
                {filtered.map((p, i) => (
                    <motion.div key={p.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className={`p-6 rounded-[24px] border ${priorityBg[p.priority] || priorityBg.MEDIUM} hover:shadow-lg transition-all`}>
                        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                            <div className={`w-3 h-3 rounded-full ${priorityColors[p.priority] || priorityColors.MEDIUM} shrink-0 animate-pulse`} />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-1">
                                    <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tight italic">{p.name}</h4>
                                    <span className="text-[10px] font-bold text-slate-400 tracking-widest">{p.id} • {p.status}</span>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">{p.complaint}</p>
                            </div>
                            <div className="text-right shrink-0">
                                <p className="text-xs font-black text-slate-400 tracking-tighter">WAIT: {p.waitTime}</p>
                                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest opacity-60 italic">{p.arrivedAt}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
                {filtered.length === 0 && (
                    <div className="py-20 text-center text-slate-400 font-black uppercase tracking-[0.3em] italic border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[32px]">
                        Grid Node Clear: No Patients in Queue
                    </div>
                )}
            </div>
        </div>
    );
};

export default TriageQueue;
