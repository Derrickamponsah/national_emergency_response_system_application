import React, { useState } from 'react';
import { motion } from 'framer-motion';

const SecurityLogs = ({ incidents = [] }) => {
    const [filter, setFilter] = useState('ALL');

    const incidentLogs = incidents.map(inc => ({
        id: inc.id,
        type: inc.status === 'RESOLVED' ? 'POST-OPS' : 'INCIDENT',
        officer: 'Sector Node Alpha',
        location: inc.location_description,
        time: new Date(inc.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        details: inc.description || 'Live Security Incident Logged',
        severity: inc.severity || 'MEDIUM'
    }));

    const logs = incidentLogs.length > 0 ? incidentLogs : [
        { id: 'LOG-001', type: 'ARREST', officer: 'Sgt. Kwame Asare', location: 'Cantonments Junction', time: '22:45', details: 'Suspect apprehended for armed robbery attempt', severity: 'HIGH' },
        { id: 'LOG-003', type: 'INCIDENT', officer: 'Insp. Yaw Frimpong', location: 'Labadi Beach Road', time: '22:15', details: 'Road traffic accident, 2 vehicles involved', severity: 'MEDIUM' },
    ];

    const severityColors = { HIGH: 'bg-rose-50 text-rose-600 dark:bg-rose-900/20', MEDIUM: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20', LOW: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' };
    const typeIcons = { ARREST: 'handshake', PATROL: 'directions_walk', INCIDENT: 'warning', ALERT: 'notification_important', CHECKPOINT: 'verified_user' };
    const filtered = filter === 'ALL' ? logs : logs.filter(l => l.severity === filter);

    return (
        <div>
            <header className="mb-12">
                <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">Security Logs</h2>
                <div className="flex items-center gap-2 mt-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /><p className="text-slate-500 text-xs font-bold tracking-widest uppercase">Activity & Incident Log Feed</p></div>
            </header>
            <div className="flex flex-wrap gap-3 mb-8">
                {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map(f => (
                    <button key={f} onClick={() => setFilter(f)} className={`px-5 py-2.5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all ${filter === f ? 'bg-police-main text-white shadow-lg' : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'}`}>{f}</button>
                ))}
            </div>
            <div className="space-y-4">
                {filtered.map((log, i) => (
                    <motion.div key={log.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }} className="bg-white dark:bg-slate-900 p-6 rounded-[24px] border border-slate-100 dark:border-slate-800 hover:shadow-lg transition-all flex items-start gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0"><span className="material-symbols-outlined text-police-main">{typeIcons[log.type] || 'description'}</span></div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                                <h4 className="font-black text-sm text-slate-900 dark:text-white">{log.type}</h4>
                                <span className={`px-2 py-0.5 rounded text-[9px] font-black ${severityColors[log.severity]}`}>{log.severity}</span>
                                <span className="text-[10px] text-slate-400 font-bold ml-auto">{log.time}</span>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{log.details}</p>
                            <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                <span>{log.officer}</span><span>•</span><span>{log.location}</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
export default SecurityLogs;
