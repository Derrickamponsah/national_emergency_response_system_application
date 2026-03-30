import React, { useState } from 'react';
import ManageVehicleModal from '../shared/ManageVehicleModal';

const FireNodeSettings = () => {
    const [config, setConfig] = useState({ stationName: 'Makola Fire Station', nodeId: 'GH-FIRE-MKL-001', region: 'Greater Accra', sector: 'Makola Sector Hub', totalTrucks: 12, activeCrew: 8, hydrantCount: 42, contactPhone: '+233 30 266 3333', contactEmail: 'ops@ghanafire.gov.gh', autoDispatch: true, hydrantAlerts: true, gearAlerts: true, thermalSync: false, responseRadius: 25 });
    const [saved, setSaved] = useState(false);
    const [isFleetModalOpen, setIsFleetModalOpen] = useState(false);
    const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

    return (
        <div>
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">Node Settings</h2>
                    <div className="flex items-center gap-2 mt-2"><span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" /><p className="text-slate-500 text-xs font-bold tracking-widest uppercase">Fire Station Configuration</p></div>
                </div>
                <button onClick={handleSave} className={`px-8 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${saved ? 'bg-emerald-500 text-white' : 'bg-fire-main hover:bg-orange-700 text-white shadow-lg shadow-orange-500/20'}`}>
                    <span className="material-symbols-outlined text-sm">{saved ? 'check' : 'save'}</span>{saved ? 'Saved!' : 'Save Changes'}
                </button>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-slate-900 rounded-[28px] border border-slate-200 dark:border-slate-800 p-8">
                    <h3 className="font-black text-lg text-slate-900 dark:text-white uppercase tracking-tight mb-6 flex items-center gap-3"><span className="material-symbols-outlined text-fire-main">local_fire_department</span>Station Info</h3>
                    <div className="space-y-5">
                        {[{ l: 'Station Name', k: 'stationName' }, { l: 'Node ID', k: 'nodeId', d: true }, { l: 'Region', k: 'region' }, { l: 'Sector', k: 'sector' }].map(f => (
                            <div key={f.k}><label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">{f.l}</label><input value={config[f.k]} disabled={f.d} onChange={e => setConfig({ ...config, [f.k]: e.target.value })} className={`w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-fire-main/30 ${f.d ? 'opacity-60 cursor-not-allowed' : ''}`} /></div>
                        ))}
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-[28px] border border-slate-200 dark:border-slate-800 p-8">
                    <h3 className="font-black text-lg text-slate-900 dark:text-white uppercase tracking-tight mb-6 flex items-center gap-3"><span className="material-symbols-outlined text-amber-500">fire_truck</span>Capacity</h3>
                    <div className="space-y-5">
                        {[{ l: 'Total Trucks', k: 'totalTrucks' }, { l: 'Active Crews', k: 'activeCrew' }, { l: 'Hydrant Points', k: 'hydrantCount' }].map(f => (
                            <div key={f.k}><label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">{f.l}</label><input type="number" value={config[f.k]} onChange={e => setConfig({ ...config, [f.k]: parseInt(e.target.value) || 0 })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-fire-main/30" /></div>
                        ))}
                        <div><label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Response Radius (km)</label><input type="range" min="5" max="50" value={config.responseRadius} onChange={e => setConfig({ ...config, responseRadius: parseInt(e.target.value) })} className="w-full accent-fire-main" /><p className="text-xs font-bold text-slate-500 mt-1">{config.responseRadius} km</p></div>
                        <button 
                            onClick={() => setIsFleetModalOpen(true)}
                            className="w-full py-3 mt-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-fire-main hover:border-fire-main/40 transition-all flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-lg">settings_suggest</span>
                            Manage Fire Fleet Registry
                        </button>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-[28px] border border-slate-200 dark:border-slate-800 p-8">
                    <h3 className="font-black text-lg text-slate-900 dark:text-white uppercase tracking-tight mb-6 flex items-center gap-3"><span className="material-symbols-outlined text-blue-500">call</span>Contact</h3>
                    <div className="space-y-5">
                        <div><label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Emergency Phone</label><input value={config.contactPhone} onChange={e => setConfig({ ...config, contactPhone: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-fire-main/30" /></div>
                        <div><label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Ops Email</label><input value={config.contactEmail} onChange={e => setConfig({ ...config, contactEmail: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-fire-main/30" /></div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-[28px] border border-slate-200 dark:border-slate-800 p-8">
                    <h3 className="font-black text-lg text-slate-900 dark:text-white uppercase tracking-tight mb-6 flex items-center gap-3"><span className="material-symbols-outlined text-emerald-500">toggle_on</span>Features</h3>
                    <div className="space-y-6">
                        {[{ l: 'Auto-Dispatch', k: 'autoDispatch', d: 'Auto-assign nearest fire unit' }, { l: 'Hydrant Pressure Alerts', k: 'hydrantAlerts', d: 'Alert when pressure drops below safe level' }, { l: 'Low Gear Alerts', k: 'gearAlerts', d: 'Notify when equipment is below minimum' }, { l: 'Thermal Camera Sync', k: 'thermalSync', d: 'Connect to onboard thermal feeds' }].map(t => (
                            <div key={t.k} className="flex items-center justify-between">
                                <div><p className="font-bold text-sm text-slate-900 dark:text-white">{t.l}</p><p className="text-xs text-slate-400">{t.d}</p></div>
                                <button onClick={() => setConfig({ ...config, [t.k]: !config[t.k] })} className={`w-12 h-7 rounded-full transition-all relative ${config[t.k] ? 'bg-fire-main' : 'bg-slate-300 dark:bg-slate-600'}`}><span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-all ${config[t.k] ? 'left-6' : 'left-1'}`} /></button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <ManageVehicleModal 
                isOpen={isFleetModalOpen} 
                onClose={() => setIsFleetModalOpen(false)} 
                fixedType="FIRE_TRUCK" 
            />
        </div>
    );
};
export default FireNodeSettings;
