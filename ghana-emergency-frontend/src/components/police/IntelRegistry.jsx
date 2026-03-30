import React, { useState } from 'react';
import { motion } from 'framer-motion';

const IntelRegistry = () => {
    const [search, setSearch] = useState('');
    const records = [
        { id: 'INT-001', subject: 'Suspect Alpha-7', category: 'ROBBERY', threat: 'HIGH', region: 'Accra Central', lastSeen: '2026-03-27', notes: 'Armed robbery suspect, known to operate near Makola area. Last seen on CCTV near market entrance.', status: 'ACTIVE' },
        { id: 'INT-002', subject: 'Vehicle GR-2845-22', category: 'STOLEN_VEHICLE', threat: 'MEDIUM', region: 'East Legon', lastSeen: '2026-03-26', notes: 'White Toyota Camry reported stolen from residential compound. Registration plates may be changed.', status: 'ACTIVE' },
        { id: 'INT-003', subject: 'Network Echo-9', category: 'FRAUD', threat: 'HIGH', region: 'Spintex Area', lastSeen: '2026-03-25', notes: 'Cybercrime ring targeting mobile money users. Estimated 15 members operating across 3 regions.', status: 'UNDER_INVESTIGATION' },
        { id: 'INT-004', subject: 'Incident Ref-442', category: 'DOMESTIC', threat: 'LOW', region: 'Dansoman', lastSeen: '2026-03-27', notes: 'Domestic dispute resolved by community liaison officer. Follow-up required in 48 hours.', status: 'RESOLVED' },
        { id: 'INT-005', subject: 'Suspect Bravo-3', category: 'NARCOTICS', threat: 'HIGH', region: 'Tema Port', lastSeen: '2026-03-24', notes: 'Drug trafficking suspect linked to port operations. Interpol notification pending.', status: 'ACTIVE' },
    ];

    const threatColors = { HIGH: 'bg-rose-500', MEDIUM: 'bg-amber-500', LOW: 'bg-emerald-500' };
    const statusColors = { ACTIVE: 'bg-rose-50 text-rose-600', UNDER_INVESTIGATION: 'bg-amber-50 text-amber-600', RESOLVED: 'bg-emerald-50 text-emerald-600' };
    const filtered = records.filter(r => !search || r.subject.toLowerCase().includes(search.toLowerCase()) || r.category.toLowerCase().includes(search.toLowerCase()) || r.region.toLowerCase().includes(search.toLowerCase()));

    return (
        <div>
            <header className="mb-12">
                <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">Intel Registry</h2>
                <div className="flex items-center gap-2 mt-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" /><p className="text-slate-500 text-xs font-bold tracking-widest uppercase">Classified Intelligence Database</p></div>
            </header>
            <div className="mb-8">
                <div className="relative max-w-md">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search subjects, categories, regions..." className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-police-main/30" />
                </div>
            </div>
            <div className="space-y-5">
                {filtered.map((r, i) => (
                    <motion.div key={r.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="bg-white dark:bg-slate-900 p-7 rounded-[28px] border border-slate-100 dark:border-slate-800 hover:shadow-xl transition-all">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${threatColors[r.threat]}`} />
                                <h4 className="font-black text-slate-900 dark:text-white">{r.subject}</h4>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{r.id}</span>
                            </div>
                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${statusColors[r.status]}`}>{r.status.replace('_', ' ')}</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{r.notes}</p>
                        <div className="flex flex-wrap gap-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                            <span>Category: {r.category.replace('_', ' ')}</span><span>•</span><span>Region: {r.region}</span><span>•</span><span>Threat: {r.threat}</span><span>•</span><span>Last Seen: {r.lastSeen}</span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
export default IntelRegistry;
