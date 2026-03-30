import React, { useState } from 'react';
import { motion } from 'framer-motion';
import LiveMap from '../shared/LiveMap';

const PatrolMap = ({ policeUnits = [] }) => {
    const [filter, setFilter] = useState('ALL');
    const mockUnits = policeUnits.length > 0 ? policeUnits : [
        { id: 1, registrationNumber: 'GP-PAT-001', status: 'EN_ROUTE', driverName: 'Sgt. Kwame Asare', zone: 'Zone A - Cantonments', latitude: 5.5781, longitude: -0.1812 },
        { id: 2, registrationNumber: 'GP-PAT-002', status: 'IDLE', driverName: 'Off. Ama Boateng', zone: 'Zone B - Osu', latitude: 5.5551, longitude: -0.1820 },
        { id: 3, registrationNumber: 'GP-PAT-003', status: 'ON_SCENE', driverName: 'Insp. Yaw Frimpong', zone: 'Zone C - Labadi', latitude: 5.5631, longitude: -0.1550 },
        { id: 4, registrationNumber: 'GP-TAC-001', status: 'EN_ROUTE', driverName: 'Cpl. Nana Osei', zone: 'Zone A - Airport', latitude: 5.6051, longitude: -0.1718 },
        { id: 5, registrationNumber: 'GP-PAT-004', status: 'IDLE', driverName: 'Off. Efua Mensah', zone: 'Zone D - Dansoman', latitude: 5.5341, longitude: -0.2451 },
    ];

    const filtered = filter === 'ALL' ? mockUnits : mockUnits.filter(u => u.status === filter);
    const markers = mockUnits.map(u => ({ id: u.id, lat: u.latitude, lng: u.longitude, type: 'POLICE', title: u.registrationNumber, description: u.zone, color: u.status === 'EN_ROUTE' ? 'amber' : u.status === 'ON_SCENE' ? 'rose' : 'blue', status: u.status }));

    return (
        <div>
            <header className="mb-12">
                <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">Patrol Map</h2>
                <div className="flex items-center gap-2 mt-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" /><p className="text-slate-500 text-xs font-bold tracking-widest uppercase">Live Patrol Unit Tracking</p></div>
            </header>
            <div className="flex flex-wrap gap-3 mb-8">
                {['ALL', 'IDLE', 'EN_ROUTE', 'ON_SCENE'].map(f => (
                    <button key={f} onClick={() => setFilter(f)} className={`px-5 py-2.5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all ${filter === f ? 'bg-police-main text-white shadow-lg' : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'}`}>{f.replace('_', ' ')}</button>
                ))}
            </div>
            <div className="h-[400px] w-full rounded-[32px] overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl mb-10"><LiveMap markers={markers} /></div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.map((u, i) => (
                    <motion.div key={u.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="bg-white dark:bg-slate-900 p-7 rounded-[28px] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center"><span className="material-symbols-outlined text-2xl text-police-main">local_police</span></div>
                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${u.status === 'IDLE' ? 'bg-emerald-50 text-emerald-600' : u.status === 'EN_ROUTE' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'}`}>{u.status}</span>
                        </div>
                        <h4 className="font-black text-lg text-slate-900 dark:text-white tracking-tight">{u.registrationNumber}</h4>
                        <p className="text-xs text-slate-500 font-bold mb-1">{u.driverName}</p>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{u.zone}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
export default PatrolMap;
