import React from 'react';
import { motion } from 'framer-motion';
import StatusBadge from '../shared/StatusBadge';

const IncidentList = () => {
    // Mock data for initial rendering
    const incidents = [
        { id: '1', type: 'MEDICAL', status: 'DISPATCHED', location: 'Ind. Square, Accra', time: '5m ago', reporter: 'Sam' },
        { id: '2', type: 'FIRE', status: 'IN_PROGRESS', location: 'Makola Market', time: '12m ago', reporter: 'Jane' },
        { id: '3', type: 'CRIME', status: 'CREATED', location: 'Osu Oxford St.', time: '1m ago', reporter: 'Yaw' },
        { id: '4', type: 'ACCIDENT', status: 'RESOLVED', location: 'Legon Bypass', time: '45m ago', reporter: 'Kofi' },
    ];

    const getIncidentIcon = (type) => {
        switch (type) {
            case 'FIRE': return 'local_fire_department';
            case 'MEDICAL': return 'medical_services';
            case 'CRIME': return 'policy';
            case 'ACCIDENT': return 'car_crash';
            default: return 'report';
        }
    };

    const getIncidentColor = (type) => {
        switch (type) {
            case 'FIRE': return 'text-orange-500 bg-orange-50 dark:bg-orange-900/20';
            case 'MEDICAL': return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20';
            case 'CRIME': return 'text-red-500 bg-red-50 dark:bg-red-900/20';
            case 'ACCIDENT': return 'text-amber-500 bg-amber-50 dark:bg-amber-900/20';
            default: return 'text-slate-500 bg-slate-50 dark:bg-slate-900/20';
        }
    };

    return (
        <div className="flex flex-col h-full space-y-4">
            <div className="flex items-center justify-between mb-2 px-1">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-xl">
                        list_alt
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Active Queue</h3>
                </div>
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-[10px] font-bold text-slate-500 dark:text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    LIVE SYNC
                </div>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {incidents.map((incident, i) => (
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={incident.id} 
                        className="bg-white dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary/30 transition-all cursor-pointer group shadow-sm hover:shadow-md"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 ${getIncidentColor(incident.type)}`}>
                                    <span className="material-symbols-outlined text-xl">
                                        {getIncidentIcon(incident.type)}
                                    </span>
                                </div>
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{incident.type}</h4>
                                        <span className="text-[10px] text-slate-400 font-medium">#{incident.id}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-[11px] text-slate-500">
                                        <div className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[14px]">location_on</span>
                                            {incident.location}
                                        </div>
                                        <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-800 pl-3 ml-1">
                                            <span className="material-symbols-outlined text-[14px]">schedule</span>
                                            {incident.time}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <StatusBadge status={incident.status} />
                                <span className="material-symbols-outlined text-slate-300 dark:text-slate-700 group-hover:text-primary transition-colors">
                                    chevron_right
                                </span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <button className="w-full py-3 text-[11px] font-bold text-slate-400 hover:text-primary transition-colors border-t border-slate-100 dark:border-slate-800 mt-2 flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-sm">download</span>
                EXPORT INCIDENT LOGS
            </button>
        </div>
    );
};

export default IncidentList;
