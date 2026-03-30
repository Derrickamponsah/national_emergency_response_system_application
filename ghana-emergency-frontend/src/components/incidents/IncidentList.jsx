import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import StatusBadge from '../shared/StatusBadge';
import { incidentService } from '../../services/incidentService';
import { socketService } from '../../services/socketService';

const IncidentList = () => {
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const data = await incidentService.getAll();
            setIncidents(data.map(inc => ({
                id: inc.incident_id || inc.id,
                type: inc.incident_type || inc.type,
                status: inc.status,
                location: inc.location_description || inc.location,
                time: new Date(inc.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                reporter: inc.reporter_name || 'Anonymous'
            })));
        } catch (error) {
            console.error('Failed to fetch incidents:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        socketService.subscribeToIncidents((update) => {
            setIncidents(prev => {
                const index = prev.findIndex(i => i.id === (update.incident_id || update.id));
                const formatted = {
                    id: update.incident_id || update.id,
                    type: update.incident_type || update.type,
                    status: update.status,
                    location: update.location_description || update.location,
                    time: 'Now',
                    reporter: update.reporter_name || 'Anonymous'
                };
                if (index !== -1) {
                    const next = [...prev];
                    next[index] = formatted;
                    return next;
                }
                return [formatted, ...prev];
            });
        });
    }, []);

    const getIncidentIcon = (type) => {
        switch (type) {
            case 'FIRE': return 'local_fire_department';
            case 'MEDICAL': return 'medical_services';
            case 'CRIME': return 'policy';
            case 'ROAD_ACCIDENT': return 'car_crash';
            case 'ACCIDENT': return 'car_crash';
            default: return 'report';
        }
    };

    const getIncidentColor = (type) => {
        switch (type) {
            case 'FIRE': return 'text-orange-500 bg-orange-50 dark:bg-orange-900/20';
            case 'MEDICAL': return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20';
            case 'CRIME': return 'text-red-500 bg-red-50 dark:bg-red-900/20';
            case 'ACCIDENT': 
            case 'ROAD_ACCIDENT': return 'text-amber-500 bg-amber-50 dark:bg-amber-900/20';
            default: return 'text-slate-500 bg-slate-50 dark:bg-slate-900/20';
        }
    };

    if (loading) return <div className="py-20 text-center font-bold tracking-widest animate-pulse">SYNCING DATA NODES...</div>;

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
                {incidents.length === 0 ? (
                    <div className="py-20 text-center text-slate-400 italic font-medium">No active incidents in queue.</div>
                ) : incidents.map((incident, i) => (
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
                                        <h4 className="font-bold text-sm text-slate-900 dark:text-white italic tracking-tight">{incident.type}</h4>
                                        <span className="text-[10px] text-slate-400 font-medium">#{String(incident.id).substring(0,6)}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-[11px] text-slate-500">
                                        <div className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[14px]">location_on</span>
                                            {incident.location}
                                        </div>
                                        <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-800 pl-3 ml-1">
                                            <span className="material-symbols-outlined text-[14px]">person</span>
                                            {incident.reporter}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <StatusBadge status={incident.status} />
                                <span className="text-[10px] font-bold text-slate-400">{incident.time}</span>
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
