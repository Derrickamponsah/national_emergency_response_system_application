import React, { useState } from 'react';
import { motion } from 'framer-motion';
import LiveMap from '../shared/LiveMap';

const ResponseMap = ({ fireVehicles = [] }) => {
    const [filter, setFilter] = useState('ALL');
    const mockUnits = fireVehicles.length > 0 ? fireVehicles : [
        { id: 1, registrationNumber: 'GF-ENG-001', status: 'EN_ROUTE', crew: 'Engine Co. Alpha', zone: 'Makola Sector', latitude: 5.5451, longitude: -0.2035, type: 'Pumper' },
        { id: 2, registrationNumber: 'GF-LAD-001', status: 'IDLE', crew: 'Ladder Co. Bravo', zone: 'Ridge Station', latitude: 5.5601, longitude: -0.2005, type: 'Ladder' },
        { id: 3, registrationNumber: 'GF-ENG-002', status: 'ON_SCENE', crew: 'Engine Co. Charlie', zone: 'Agbogbloshie', latitude: 5.5503, longitude: -0.2115, type: 'Pumper' },
        { id: 4, registrationNumber: 'GF-RES-001', status: 'IDLE', crew: 'Rescue Co. Delta', zone: 'Airport Station', latitude: 5.5921, longitude: -0.1718, type: 'Rescue' },
        { id: 5, registrationNumber: 'GF-HAZ-001', status: 'MAINTENANCE', crew: 'HazMat Team', zone: 'Tema Station', latitude: 5.6691, longitude: -0.0167, type: 'HazMat' },
    ];
    const filtered = filter === 'ALL' ? mockUnits : mockUnits.filter(u => u.status === filter);
    const markers = mockUnits.map(u => ({ id: u.id, lat: u.latitude, lng: u.longitude, type: 'FIRE_TRUCK', title: u.registrationNumber, description: u.zone, color: u.status === 'EN_ROUTE' ? 'amber' : u.status === 'ON_SCENE' ? 'rose' : 'orange', status: u.status }));

    return (
        <div>
            <header className="mb-12">
                <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">Response Map</h2>
                <div className="flex items-center gap-2 mt-2"><span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" /><p className="text-slate-500 text-xs font-bold tracking-widest uppercase">Live Fire Unit Positions</p></div>
            </header>
            <div className="flex flex-wrap gap-3 mb-8">
                {['ALL', 'IDLE', 'EN_ROUTE', 'ON_SCENE', 'MAINTENANCE'].map(f => (
                    <button key={f} onClick={() => setFilter(f)} className={`px-5 py-2.5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all ${filter === f ? 'bg-fire-main text-white shadow-lg' : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'}`}>{f.replace('_', ' ')}</button>
                ))}
            </div>
            <div className="h-[400px] w-full rounded-[32px] overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl mb-10"><LiveMap markers={markers} /></div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.map((u, i) => (
                    <motion.div key={u.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="bg-white dark:bg-slate-900 p-7 rounded-[28px] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center"><span className="material-symbols-outlined text-2xl text-fire-main">fire_truck</span></div>
                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${u.status === 'IDLE' ? 'bg-emerald-50 text-emerald-600' : u.status === 'EN_ROUTE' ? 'bg-amber-50 text-amber-600' : u.status === 'ON_SCENE' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>{u.status}</span>
                        </div>
                        <h4 className="font-black text-lg text-slate-900 dark:text-white tracking-tight">{u.registrationNumber}</h4>
                        <p className="text-xs text-slate-500 font-bold mb-1">{u.crew}</p>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{u.type} • {u.zone}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
export default ResponseMap;
