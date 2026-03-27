import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import StatusBadge from '../shared/StatusBadge';
import { useAuth } from '../../hooks/useAuth';
import LiveMap from '../shared/LiveMap';
import { incidentService } from '../../services/incidentService';
import { vehicleService } from '../../services/vehicleService';
import { socketService } from '../../services/socketService';

const PoliceAdminDashboard = () => {
    const { logout, user } = useAuth();
    const [incidents, setIncidents] = useState([]);
    const [policeUnits, setPoliceUnits] = useState([]);
    const [loading, setLoading] = useState(true);

    const formatIncident = (inc) => ({
        id: inc.id,
        incident_type: inc.incident_type,
        location_description: inc.location_description,
        status: inc.status,
        latitude: parseFloat(inc.latitude),
        longitude: parseFloat(inc.longitude)
    });

    const formatVehicle = (veh) => ({
        id: veh.id,
        type: veh.type,
        registrationNumber: veh.registrationNumber,
        latitude: parseFloat(veh.latitude),
        longitude: parseFloat(veh.longitude),
        status: veh.status
    });

    const fetchData = async () => {
        try {
            const [incidentData, vehicleData] = await Promise.allSettled([
                incidentService.getAll({ type: 'POLICE' }),
                vehicleService.getAll({ type: 'POLICE' })
            ]);

            if (incidentData.status === 'fulfilled') {
                setIncidents(incidentData.value.filter(inc => inc.incident_type === 'POLICE' || inc.incident_type === 'SECURITY').map(formatIncident));
            }

            if (vehicleData.status === 'fulfilled') {
                setPoliceUnits(vehicleData.value.filter(veh => veh.type === 'POLICE').map(formatVehicle));
            }
        } catch (error) {
            console.error("Police Node Sync Error:", error);
            // Fallback mock
            setIncidents([
                { id: 3, incident_type: 'POLICE', location_description: 'Accra Mall Intersection', status: 'IN_PROGRESS', latitude: 5.6191, longitude: -0.1765 },
                { id: 4, incident_type: 'POLICE', location_description: 'Spintex Road', status: 'REPORTED', latitude: 5.6293, longitude: -0.1585 }
            ].map(formatIncident));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();

        socketService.subscribeToIncidents((update) => {
            if (update.incident_type === 'POLICE' || update.incident_type === 'SECURITY') {
                setIncidents(prev => {
                    const index = prev.findIndex(i => i.id === update.id);
                    if (index !== -1) {
                        const next = [...prev];
                        next[index] = formatIncident(update);
                        return next;
                    }
                    return [...prev, formatIncident(update)];
                });
            }
        });

        socketService.subscribeToFleet((update) => {
            if (update.type === 'POLICE') {
                setPoliceUnits(prev => {
                    const index = prev.findIndex(v => v.id === update.id);
                    if (index !== -1) {
                        const next = [...prev];
                        next[index] = formatVehicle(update);
                        return next;
                    }
                    return [...prev, formatVehicle(update)];
                });
            }
        });
    }, []);

    const mapMarkers = [
        ...incidents.map(inc => ({
            id: inc.id,
            lat: parseFloat(inc.latitude),
            lng: parseFloat(inc.longitude),
            type: 'INCIDENT',
            title: `Security: ${inc.id}`,
            description: inc.location_description,
            color: 'rose',
            status: inc.status
        })),
        ...policeUnits.map(veh => ({
            id: veh.id,
            lat: parseFloat(veh.latitude),
            lng: parseFloat(veh.longitude),
            type: 'POLICE',
            title: veh.registrationNumber,
            description: 'Units in Perimeter',
            color: 'blue',
            status: veh.status
        }))
    ];

    const stats = [
        { label: 'Active Patrols', value: policeUnits.length || '34', icon: 'radio', color: 'text-police-main bg-blue-50 dark:bg-blue-900/20' },
        { label: 'Units Deployed', value: '12', icon: 'shield', color: 'text-primary bg-indigo-50 dark:bg-indigo-900/20' },
        { label: 'Unsolved Alerts', value: incidents.length || '07', icon: 'report_problem', color: 'text-rose-500 bg-rose-50 dark:bg-rose-900/20' },
        { label: 'Fleet Ready', value: '56', icon: 'local_taxi', color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' },
    ];

    return (
        <div className="flex h-screen w-full bg-background-light dark:bg-background-dark overflow-hidden font-display">
            {/* Police Sidebar */}
            <aside className="w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col p-6 shadow-xl z-20">
                <div className="flex items-center gap-3 mb-10 px-2 mt-4">
                    <div className="w-12 h-12 rounded-xl bg-police-main flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <span className="material-symbols-outlined text-white text-3xl">local_police</span>
                    </div>
                    <div>
                        <h1 className="font-bold text-xl text-slate-900 dark:text-white leading-tight">Accra Node</h1>
                        <p className="text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase italic">Command Sector 1</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-2">
                    {[
                        { icon: 'radio_button_checked', label: 'Radio Band 4', active: true },
                        { icon: 'map', label: 'Patrol Map' },
                        { icon: 'history_edu', label: 'Security Logs' },
                        { icon: 'fingerprint', label: 'Intel Registry' },
                        { icon: 'settings', label: 'Police Config' },
                    ].map((item, i) => (
                        <button 
                            key={i} 
                            className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all group ${
                                item.active 
                                ? 'bg-police-main text-white shadow-xl shadow-blue-900/40 translate-x-1' 
                                : 'text-slate-500 hover:text-police-main hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}
                        >
                            <span className="material-symbols-outlined text-[24px]">
                                {item.icon}
                            </span>
                            <span className="text-sm font-bold tracking-tight">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-[24px] mb-4 flex items-center gap-4 border border-slate-200/50 dark:border-slate-800 transition-all">
                        <div className="w-10 h-10 rounded-full bg-police-main/10 flex items-center justify-center text-police-main font-bold">
                            {user?.name?.[0] || 'O'}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.name || 'Officer Kwame'}</p>
                            <p className="text-[10px] text-slate-500 uppercase font-black truncate tracking-widest">{user?.role || 'POLICE_ADMIN'}</p>
                        </div>
                    </div>
                    <button 
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-3 px-4 py-4 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-2xl transition-all font-bold text-sm tracking-widest uppercase italic border border-rose-500/10"
                    >
                        <span className="material-symbols-outlined text-xl">logout</span>
                        Detach Duty
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto p-8 lg:p-12 relative custom-scrollbar bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-50/5 via-transparent to-transparent">
                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16 px-4">
                    <div>
                        <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none truncate md:max-w-xl">Public Security Feed</h2>
                        <div className="flex items-center gap-2 mt-3 overflow-hidden">
                           <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                           <p className="text-slate-500 text-xs font-bold tracking-widest uppercase">Region Greater Accra v.3.1.2 - Sector Sync Stable</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-500 flex items-center gap-2 border border-slate-100 dark:border-slate-800 italic uppercase">
                           <span className="material-symbols-outlined text-sm">radio</span>
                           Secure Band 4
                        </div>
                        <button className="px-8 py-3 bg-police-main hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/20 text-xs font-bold transition-all active:scale-95 flex items-center gap-2">
                           <span className="material-symbols-outlined text-sm">send</span>
                           Dispatch Unit
                        </button>
                    </div>
                </header>

                {/* Stats Grid */}
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                    {stats.map((stat, i) => (
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            key={i} 
                            className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all relative group overflow-hidden"
                        >
                            <div className={`${stat.color} mb-6 w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-12`}>
                                <span className="material-symbols-outlined text-3xl">
                                    {stat.icon}
                                </span>
                            </div>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em]">{stat.label}</p>
                            <h4 className="text-4xl font-black mt-2 text-slate-900 dark:text-white tracking-tighter">{stat.value}</h4>
                            
                            <div className="absolute top-0 right-0 w-1.5 h-full bg-police-main opacity-0 group-hover:opacity-100 transition-opacity" />
                        </motion.div>
                    ))}
                </section>

                {/* Interactive Modules */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 px-4 mb-20">
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic underline decoration-police-main/30 underline-offset-8">Unit Surveillance Perimeter</h3>
                        <div className="h-[550px] w-full shadow-2xl shadow-police-main/10 rounded-[48px] overflow-hidden border-4 border-white dark:border-slate-800">
                            <LiveMap markers={mapMarkers} className="grayscale-[0.5] contrast-125" />
                        </div>
                    </div>
                    
                    <div className="flex flex-col gap-6">
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic underline decoration-rose-500/30 underline-offset-8">Emergency Intel</h3>
                        <div className="bg-white dark:bg-slate-900 rounded-[48px] p-10 border border-slate-200 dark:border-slate-800 shadow-sm flex-1 space-y-8 relative overflow-hidden group">
                           <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-[100px]">security_update_warning</span>
                           </div>

                             {incidents.slice(0, 4).map((inc, i) => (
                                 <div key={i} className="flex flex-col gap-2 relative z-10 group/item">
                                     <div className="flex justify-between items-center">
                                         <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">{inc.status}</span>
                                         <span className="text-[10px] text-slate-400 font-bold">{4+i}m ago</span>
                                     </div>
                                     <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{inc.location_description}</p>
                                     <div className="flex items-center gap-2 mt-1">
                                         <span className="w-1 h-1 rounded-full bg-slate-300" />
                                         <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Sector Priority Alpha</span>
                                     </div>
                                     {i < 3 && <div className="mt-8 border-b border-slate-50 dark:border-slate-800/50" />}
                                 </div>
                             ))}
                             
                             <button className="w-full py-5 bg-police-main text-white rounded-2xl text-[10px] font-black tracking-[0.2em] shadow-xl shadow-blue-900/40 hover:translate-y-[-2px] transition-all uppercase flex items-center justify-center gap-3 italic">
                               <span className="material-symbols-outlined text-lg">description</span>
                               Generate Incident Report
                           </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PoliceAdminDashboard;