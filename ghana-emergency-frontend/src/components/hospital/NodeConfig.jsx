import React, { useState } from 'react';
import { motion } from 'framer-motion';

const NodeConfig = () => {
    const [config, setConfig] = useState({
        hospitalName: 'Korle-Bu Teaching Hospital',
        nodeId: 'GH-HOSP-KBU-001',
        region: 'Greater Accra',
        district: 'Accra Metropolitan',
        totalBeds: 182, icuBeds: 24, emergencyBeds: 36,
        contactPhone: '+233 30 266 5401',
        contactEmail: 'emergency@kfrlegacy.org',
        autoDispatch: true, triageAlerts: true, supplyAlerts: true, dutySync: true,
        dispatchRadius: 15,
        alertThreshold: 'HIGH',
    });
    const [saved, setSaved] = useState(false);

    const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

    return (
        <div>
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">Node Config</h2>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                        <p className="text-slate-500 text-xs font-bold tracking-widest uppercase">Hospital Node Settings</p>
                    </div>
                </div>
                <button onClick={handleSave} className={`px-8 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${saved ? 'bg-emerald-500 text-white' : 'bg-medical-main hover:bg-teal-700 text-white shadow-lg shadow-teal-500/20'}`}>
                    <span className="material-symbols-outlined text-sm">{saved ? 'check' : 'save'}</span>
                    {saved ? 'Saved!' : 'Save Changes'}
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* General Info */}
                <div className="bg-white dark:bg-slate-900 rounded-[28px] border border-slate-200 dark:border-slate-800 p-8">
                    <h3 className="font-black text-lg text-slate-900 dark:text-white uppercase tracking-tight mb-6 flex items-center gap-3">
                        <span className="material-symbols-outlined text-medical-main">local_hospital</span>General Information
                    </h3>
                    <div className="space-y-5">
                        {[{ label: 'Hospital Name', key: 'hospitalName' }, { label: 'Node ID', key: 'nodeId', disabled: true }, { label: 'Region', key: 'region' }, { label: 'District', key: 'district' }].map(f => (
                            <div key={f.key}>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">{f.label}</label>
                                <input value={config[f.key]} disabled={f.disabled} onChange={e => setConfig({ ...config, [f.key]: e.target.value })} className={`w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-medical-main/30 ${f.disabled ? 'opacity-60 cursor-not-allowed' : ''}`} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Capacity */}
                <div className="bg-white dark:bg-slate-900 rounded-[28px] border border-slate-200 dark:border-slate-800 p-8">
                    <h3 className="font-black text-lg text-slate-900 dark:text-white uppercase tracking-tight mb-6 flex items-center gap-3">
                        <span className="material-symbols-outlined text-amber-500">bed</span>Capacity Settings
                    </h3>
                    <div className="space-y-5">
                        {[{ label: 'Total Beds', key: 'totalBeds' }, { label: 'ICU Beds', key: 'icuBeds' }, { label: 'Emergency Beds', key: 'emergencyBeds' }].map(f => (
                            <div key={f.key}>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">{f.label}</label>
                                <input type="number" value={config[f.key]} onChange={e => setConfig({ ...config, [f.key]: parseInt(e.target.value) || 0 })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-medical-main/30" />
                            </div>
                        ))}
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Dispatch Radius (km)</label>
                            <input type="range" min="5" max="50" value={config.dispatchRadius} onChange={e => setConfig({ ...config, dispatchRadius: parseInt(e.target.value) })} className="w-full accent-medical-main" />
                            <p className="text-xs font-bold text-slate-500 mt-1">{config.dispatchRadius} km</p>
                        </div>
                    </div>
                </div>

                {/* Contact */}
                <div className="bg-white dark:bg-slate-900 rounded-[28px] border border-slate-200 dark:border-slate-800 p-8">
                    <h3 className="font-black text-lg text-slate-900 dark:text-white uppercase tracking-tight mb-6 flex items-center gap-3">
                        <span className="material-symbols-outlined text-blue-500">call</span>Contact Details
                    </h3>
                    <div className="space-y-5">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Emergency Phone</label>
                            <input value={config.contactPhone} onChange={e => setConfig({ ...config, contactPhone: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-medical-main/30" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Email</label>
                            <input value={config.contactEmail} onChange={e => setConfig({ ...config, contactEmail: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-medical-main/30" />
                        </div>
                    </div>
                </div>

                {/* Toggles */}
                <div className="bg-white dark:bg-slate-900 rounded-[28px] border border-slate-200 dark:border-slate-800 p-8">
                    <h3 className="font-black text-lg text-slate-900 dark:text-white uppercase tracking-tight mb-6 flex items-center gap-3">
                        <span className="material-symbols-outlined text-emerald-500">toggle_on</span>Feature Toggles
                    </h3>
                    <div className="space-y-6">
                        {[{ label: 'Auto-Dispatch Ambulances', key: 'autoDispatch', desc: 'Automatically assign nearest ambulance' }, { label: 'Triage Priority Alerts', key: 'triageAlerts', desc: 'Get notified for critical patients' }, { label: 'Low Supply Alerts', key: 'supplyAlerts', desc: 'Notify when stock is below minimum' }, { label: 'Duty Roster Sync', key: 'dutySync', desc: 'Auto-sync staff scheduling' }].map(t => (
                            <div key={t.key} className="flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-sm text-slate-900 dark:text-white">{t.label}</p>
                                    <p className="text-xs text-slate-400">{t.desc}</p>
                                </div>
                                <button onClick={() => setConfig({ ...config, [t.key]: !config[t.key] })} className={`w-12 h-7 rounded-full transition-all relative ${config[t.key] ? 'bg-medical-main' : 'bg-slate-300 dark:bg-slate-600'}`}>
                                    <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-all ${config[t.key] ? 'left-6' : 'left-1'}`} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NodeConfig;
