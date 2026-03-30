import React, { useState } from 'react';
import { motion } from 'framer-motion';

const DispatchLogs = ({ incidents = [] }) => {
    const [filter, setFilter] = useState('ALL');

    const incidentLogs = incidents.map(inc => ({
        id: inc.id,
        type: 'STRUCTURE_FIRE', // Default for fire dashboard
        crew: 'Sector Station 01',
        location: inc.location_description,
        time: new Date(inc.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        duration: inc.status === 'RESOLVED' ? 'Finalized' : 'Active',
        response: 'Instant',
        outcome: inc.status,
        severity: inc.severity || 'MEDIUM'
    }));

    const logs = incidentLogs.length > 0 ? incidentLogs : [
        { id: 'FD-001', type: 'STRUCTURE_FIRE', crew: 'Engine Co. Alpha', location: 'Makola Market Block C', time: '22:42', duration: '45 min', response: '4 min', outcome: 'CONTAINED', severity: 'HIGH' },
        { id: 'FD-002', type: 'VEHICLE_FIRE', crew: 'Engine Co. Charlie', location: 'N1 Highway Km 12', time: '21:15', duration: '20 min', response: '7 min', outcome: 'EXTINGUISHED', severity: 'MEDIUM' },
    ];
    const typeIcons = { STRUCTURE_FIRE: 'local_fire_department', VEHICLE_FIRE: 'directions_car', RESCUE: 'health_and_safety', HAZMAT: 'science', BRUSH_FIRE: 'park', FALSE_ALARM: 'notifications_off' };
    const outcomeColors = { CONTAINED: 'bg-amber-50 text-amber-600', EXTINGUISHED: 'bg-emerald-50 text-emerald-600', IN_PROGRESS: 'bg-rose-50 text-rose-600', RESOLVED: 'bg-blue-50 text-blue-600', CLEARED: 'bg-slate-100 text-slate-500' };
    const filtered = filter === 'ALL' ? logs : logs.filter(l => l.severity === filter);

    return (
        <div>
            <header className="mb-12">
                <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">Dispatch Logs</h2>
                <div className="flex items-center gap-2 mt-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /><p className="text-slate-500 text-xs font-bold tracking-widest uppercase">Fire Response History</p></div>
            </header>
            <div className="flex flex-wrap gap-3 mb-8">
                {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(f => (
                    <button key={f} onClick={() => setFilter(f)} className={`px-5 py-2.5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all ${filter === f ? 'bg-fire-main text-white shadow-lg' : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'}`}>{f}</button>
                ))}
            </div>
            <div className="space-y-4">
                {filtered.map((log, i) => (
                    <motion.div key={log.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }} className="bg-white dark:bg-slate-900 p-6 rounded-[24px] border border-slate-100 dark:border-slate-800 hover:shadow-lg transition-all flex items-start gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center shrink-0"><span className="material-symbols-outlined text-fire-main">{typeIcons[log.type] || 'description'}</span></div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1 flex-wrap">
                                <h4 className="font-black text-sm text-slate-900 dark:text-white">{log.type.replace(/_/g, ' ')}</h4>
                                <span className={`px-2 py-0.5 rounded text-[9px] font-black ${outcomeColors[log.outcome] || 'bg-slate-100 text-slate-500'}`}>{log.outcome.replace('_', ' ')}</span>
                                <span className="text-[10px] text-slate-400 font-bold ml-auto">{log.time}</span>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{log.location}</p>
                            <div className="flex flex-wrap gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                <span>{log.crew}</span><span>•</span><span>Response: {log.response}</span><span>•</span><span>Duration: {log.duration}</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
export default DispatchLogs;
