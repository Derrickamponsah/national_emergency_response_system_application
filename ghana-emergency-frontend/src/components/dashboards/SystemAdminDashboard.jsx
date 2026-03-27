import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LiveMap from '../shared/LiveMap';
import { incidentService } from '../../services/incidentService';
import { vehicleService } from '../../services/vehicleService';
import { analyticsService } from '../../services/analyticsService';
import { socketService } from '../../services/socketService';

const SystemAdminDashboard = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const [incidents, setIncidents] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [stats, setStats] = useState([
        { label: 'Total Incidents', value: '...', icon: 'shield_alert', color: 'text-rose-500 bg-rose-50 dark:bg-rose-900/20' },
        { label: 'Active Units', value: '...', icon: 'local_shipping', color: 'text-primary bg-blue-50 dark:bg-blue-900/20' },
        { label: 'Staff Online', value: '...', icon: 'group', color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' },
        { label: 'System Uptime', value: '99.9%', icon: 'bolt', color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20' },
    ]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [incidentData, vehicleData, summaryData] = await Promise.allSettled([
                incidentService.getAll(),
                vehicleService.getAll(),
                analyticsService.getOperationalSummary()
            ]);

            if (incidentData.status === 'fulfilled') {
                setIncidents(incidentData.value.map(formatIncident));
            }

            if (vehicleData.status === 'fulfilled') {
                setVehicles(vehicleData.value.map(formatVehicle));
            }

            if (summaryData.status === 'fulfilled') {
                const summary = summaryData.value;
                setStats(prev => [
                    { ...prev[0], value: summary.totalIncidents || prev[0].value },
                    { ...prev[1], value: summary.activeVehicles || prev[1].value },
                    { ...prev[2], value: summary.onlineStaff || prev[2].value },
                    prev[3]
                ]);
            }
        } catch (error) {
            console.error("Dashboard Initial Sync Error:", error);
            setIncidents([
                { id: 1, lat: 5.6037, lng: -0.1870, type: 'INCIDENT', title: 'Medical Emergency', description: 'Independence Square', color: 'rose', status: 'REPORTED' },
                { id: 2, lat: 5.6145, lng: -0.2082, type: 'INCIDENT', title: 'Police Assistance', description: 'Osu Oxford Street', color: 'rose', status: 'IN_PROGRESS' }
            ]);
            setVehicles([
                { id: 101, lat: 5.5900, lng: -0.1700, type: 'AMBULANCE', title: 'AMB-001', description: 'Available', color: 'primary', status: 'IDLE' },
                { id: 102, lat: 5.6200, lng: -0.1900, type: 'POLICE', title: 'POL-042', description: 'Active Patrol', color: 'primary', status: 'ACTIVE' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const formatIncident = (inc) => ({
        id: inc.id,
        lat: parseFloat(inc.latitude),
        lng: parseFloat(inc.longitude),
        type: 'INCIDENT',
        title: inc.incident_type,
        description: inc.location_description,
        color: 'rose',
        status: inc.status
    });

    const formatVehicle = (veh) => ({
        id: veh.id,
        lat: parseFloat(veh.latitude),
        lng: parseFloat(veh.longitude),
        type: veh.type,
        title: veh.registrationNumber,
        description: `Driver: ${veh.driverName || 'N/A'}`,
        color: 'primary',
        status: veh.status
    });

    useEffect(() => {
        fetchData();

        socketService.subscribeToIncidents((update) => {
            setIncidents(prev => {
                const index = prev.findIndex(i => i.id === update.id);
                if (index !== -1) {
                    const newIncidents = [...prev];
                    newIncidents[index] = { ...newIncidents[index], ...formatIncident(update) };
                    return newIncidents;
                }
                return [...prev, formatIncident(update)];
            });
        });

        socketService.subscribeToFleet((update) => {
            setVehicles(prev => {
                const index = prev.findIndex(v => v.id === update.id);
                if (index !== -1) {
                    const newVehicles = [...prev];
                    newVehicles[index] = { ...newVehicles[index], ...formatVehicle(update) };
                    return newVehicles;
                }
                return [...prev, formatVehicle(update)];
            });
        });
    }, []);

    const handleDispatch = async (incidentId) => {
        const availableVehicle = vehicles.find(v => v.status === 'IDLE' || v.status === 'PATROLLING');
        if (!availableVehicle) {
            alert('No available units for prompt dispatch.');
            return;
        }

        try {
            await incidentService.dispatchUnit(incidentId, availableVehicle.id);
            console.log(`Unit ${availableVehicle.title} Dispatched to ${incidentId}`);
        } catch (error) {
            console.error('Dispatch failed:', error);
        }
    };

    const mapMarkers = [...incidents, ...vehicles];

    return (
        <div className="flex h-screen w-full bg-background-light dark:bg-background-dark overflow-hidden font-display transition-colors">
            {/* Sidebar */}
            <aside className="w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col p-8 shadow-xl z-20">
                <div className="flex items-center gap-4 mb-12 px-2 mt-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/30 rotate-3 group-hover:rotate-0 transition-transform">
                        <span className="material-symbols-outlined text-white text-3xl font-black">shield_with_heart</span>
                    </div>
                    <div>
                        <h1 className="font-black text-2xl text-slate-900 dark:text-white leading-tight tracking-tighter uppercase italic">NCDC</h1>
                        <p className="text-[10px] font-black tracking-[0.3em] text-primary uppercase italic opacity-70">Strategic Command</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-3">
                    {[
                        { icon: 'grid_view', label: 'Command Hub', path: '/', active: true },
                        { icon: 'emergency_share', label: 'Incident Control', path: '/incidents' },
                        { icon: 'analytics', label: 'Operational Intel', path: '/analytics' },
                        { icon: 'history_edu', label: 'Registry Logs', path: '/audit-logs' },
                        { icon: 'account_circle', label: 'Clearance Profile', path: '/profile' },
                    ].map((item, i) => (
                        <Link 
                            key={i} 
                            to={item.path}
                            className={`w-full flex items-center gap-5 px-6 py-4.5 rounded-[24px] transition-all group border-2 ${
                                item.active 
                                ? 'bg-primary border-primary text-white shadow-2xl shadow-primary/40 translate-x-2' 
                                : 'text-slate-500 border-transparent hover:border-slate-100 dark:hover:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                            }`}
                        >
                            <span className="material-symbols-outlined text-[24px]">
                                {item.icon}
                            </span>
                            <span className="text-xs font-black tracking-widest uppercase italic">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="mt-auto pt-8 border-t border-slate-100 dark:border-slate-800">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[32px] mb-6 flex items-center gap-5 border border-slate-200/50 dark:border-slate-800 shadow-inner group">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black border border-primary/20">
                            {user?.name?.[0] || 'O'}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-black text-slate-900 dark:text-white truncate uppercase italic">{user?.name || 'Operator'}</p>
                            <p className="text-[9px] text-slate-500 uppercase font-black truncate tracking-[0.2em] mt-0.5 opacity-60 italic">{user?.role || 'CLEARANCE_LVL_4'}</p>
                        </div>
                    </div>
                    <button 
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-4 px-4 py-5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-[28px] transition-all font-black text-[10px] tracking-[0.3em] uppercase italic border-2 border-rose-500/10 hover:border-rose-500/20 shadow-sm"
                    >
                        <span className="material-symbols-outlined text-xl">logout</span>
                        Terminate Authorization
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto p-10 lg:p-16 relative custom-scrollbar bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent">
                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-20 px-4">
                    <div>
                        <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none truncate md:max-w-2xl underline decoration-primary/20 decoration-8 underline-offset-12">System Oversight</h2>
                        <div className="flex items-center gap-3 mt-6 overflow-hidden">
                           <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.8)]" />
                           <p className="text-slate-500 text-[10px] font-black tracking-[0.3em] uppercase italic opacity-70">Grid Node: ACCRA-CENTRAL-01 / Status: Synchronized</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-5 bg-white dark:bg-slate-900 p-2.5 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-2xl">
                        <div className="px-8 py-4 bg-slate-50 dark:bg-slate-800 rounded-[24px] text-[10px] font-black text-slate-500 flex items-center gap-3 border border-slate-100 dark:border-slate-800 italic uppercase tracking-widest shadow-inner">
                           <span className="material-symbols-outlined text-lg">event</span>
                           {new Date().toLocaleDateString('gh-GH', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase()}
                        </div>
                        <button 
                            onClick={fetchData}
                            className="px-8 py-4 bg-primary hover:bg-primary/90 text-white rounded-[24px] shadow-2xl shadow-primary/30 text-[10px] font-black uppercase tracking-[0.2em] italic transition-all active:scale-95 flex items-center gap-3"
                        >
                           <span className="material-symbols-outlined text-lg font-black animate-spin-slow">refresh</span>
                           Sync Node
                        </button>
                    </div>
                </header>

                {/* Stats Grid */}
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-20">
                    {stats.map((stat, i) => (
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            key={i} 
                            className="bg-white dark:bg-slate-900 p-10 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all relative group overflow-hidden border-b-4 border-b-transparent hover:border-b-primary"
                        >
                            <div className={`${stat.color} mb-8 w-16 h-16 rounded-[24px] flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-12 shadow-inner border border-white/10`}>
                                <span className="material-symbols-outlined text-4xl">
                                    {stat.icon}
                                </span>
                            </div>
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] italic mb-1 opacity-60">{stat.label}</p>
                            <h4 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter italic">{stat.value}</h4>
                        </motion.div>
                    ))}
                </section>

                {/* Interactive Modules */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 px-4 mb-20">
                    <div className="lg:col-span-2 flex flex-col gap-8">
                        <div className="flex items-center justify-between">
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic underline decoration-primary/40 decoration-4 underline-offset-8">Live Fleet Geometry</h3>
                            <div className="flex gap-3">
                                <span className="px-5 py-2 bg-rose-50 dark:bg-rose-900/10 text-rose-500 text-[10px] font-black rounded-xl border border-rose-500/20 uppercase tracking-widest italic animate-pulse">Live Incidents</span>
                                <span className="px-5 py-2 bg-primary/5 dark:bg-primary/10 text-primary text-[10px] font-black rounded-xl border border-primary/20 uppercase tracking-widest italic">Unit Tracking</span>
                            </div>
                        </div>
                        <div className="h-[650px] w-full shadow-[0_32px_80px_rgba(34,26,127,0.12)] rounded-[64px] overflow-hidden border-8 border-white dark:border-slate-800 group relative">
                            <LiveMap markers={mapMarkers} className="brightness-110 contrast-110" />
                        </div>
                    </div>
                    
                    <div className="space-y-10">
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic underline decoration-emerald-500/40 decoration-4 underline-offset-8">Relay Health</h3>
                        <div className="bg-white dark:bg-slate-900 rounded-[64px] p-12 lg:p-14 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-full relative overflow-hidden group">
                           <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-[140px]">hub</span>
                           </div>

                           <div className="space-y-12 relative z-10">
                                {[
                                    { label: 'Auth Sub-System', node: 'Node-Auth-01', health: '99.9%', color: 'emerald' },
                                    { label: 'Incident Flow', node: 'Node-Inc-01', health: '99.8%', color: 'emerald' },
                                    { label: 'Fleet Sync', node: 'Node-Veh-01', health: '100%', color: 'emerald' },
                                    { label: 'Registry Arch', node: 'Node-Aud-01', health: '99.9%', color: 'emerald' },
                                    { label: 'Dispatch Bus', node: 'Node-Dsp-01', health: '98.5%', color: 'amber' }
                                ].map((service, i) => (
                                    <div key={i} className="flex items-center justify-between group/item">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-slate-900 dark:text-white tracking-tight uppercase italic">{service.label}</span>
                                            <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest opacity-70 group-hover/item:text-primary transition-colors italic">{service.node}</span>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="text-right hidden sm:block">
                                                <p className={`text-[10px] font-black text-${service.color}-500 uppercase italic tracking-widest`}>Resilient</p>
                                                <p className="text-[9px] text-slate-400 font-black mt-1 opacity-50 uppercase tracking-tighter">{service.health}</p>
                                            </div>
                                            <div className={`w-3.5 h-3.5 rounded-full bg-${service.color}-500 shadow-[0_0_15px_rgba(16,185,129,0.7)] animate-pulse`} />
                                        </div>
                                    </div>
                                ))}
                           </div>

                           <div className="mt-20 pt-12 border-t border-slate-100 dark:border-slate-800/80">
                               <Link to="/audit-logs" className="w-full py-6 bg-slate-900 dark:bg-slate-800 text-white rounded-[32px] text-[10px] font-black tracking-[0.3em] text-slate-200 hover:text-white hover:bg-primary transition-all uppercase flex items-center justify-center gap-4 italic shadow-2xl shadow-primary/10">
                                   <span className="material-symbols-outlined text-lg">history</span>
                                   View Audit Registry
                               </Link>
                           </div>
                        </div>
                    </div>
                </div>

                {/* Active Dispatch Queue */}
                <section className="px-4 mb-32">
                    <div className="flex items-center justify-between mb-12">
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic underline decoration-rose-500/40 decoration-4 underline-offset-8">Dispatch Priority Queue</h3>
                        <div className="flex items-center gap-4">
                             <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest italic text-slate-500">
                                Priority Alpha Units: {vehicles.filter(v => v.status === 'IDLE').length}
                             </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                        {incidents.filter(inc => inc.status === 'REPORTED').map((inc) => (
                            <motion.div 
                                key={inc.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white dark:bg-slate-900 p-10 rounded-[56px] border-2 border-rose-500/10 shadow-2xl shadow-rose-500/5 flex flex-col group hover:border-rose-500 transition-all relative overflow-hidden"
                            >
                                <div className="absolute -top-4 -right-4 w-24 h-24 bg-rose-500/5 rounded-full group-hover:scale-150 transition-transform" />
                                
                                <div className="flex justify-between items-start mb-10 relative z-10">
                                    <div className="w-14 h-14 rounded-[20px] bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center text-rose-500 border border-rose-100 dark:border-rose-800">
                                        <span className="material-symbols-outlined text-3xl font-black">emergency</span>
                                    </div>
                                    <span className="px-4 py-1.5 bg-rose-500 text-white text-[9px] font-black rounded-xl uppercase tracking-[0.2em] animate-pulse">Critical</span>
                                </div>
                                
                                <h4 className="font-black text-2xl text-slate-900 dark:text-white mb-3 uppercase italic leading-tight tracking-tight group-hover:text-rose-500 transition-colors">{inc.title}</h4>
                                <div className="flex items-start gap-3 text-xs font-bold text-slate-500 mb-12 italic opacity-80 h-12 overflow-hidden">
                                    <span className="material-symbols-outlined text-lg text-slate-400 shrink-0">location_on</span> {inc.description}
                                </div>

                                <button 
                                    onClick={() => handleDispatch(inc.id)}
                                    className="w-full py-5 mt-auto bg-slate-900 dark:bg-slate-800 text-white rounded-[28px] text-[10px] font-black tracking-[0.3em] uppercase italic flex items-center justify-center gap-4 hover:bg-rose-500 transition-all shadow-2xl shadow-rose-500/10 active:scale-95"
                                >
                                    <span className="material-symbols-outlined text-xl">local_shipping</span>
                                    Assign Protocol Unit
                                </button>
                            </motion.div>
                        ))}
                    </div>

                    {incidents.filter(inc => inc.status === 'REPORTED').length === 0 && (
                        <div className="w-full py-32 border-4 border-dashed border-slate-100 dark:border-slate-800/80 rounded-[64px] flex flex-col items-center justify-center text-slate-400 bg-white/50 dark:bg-slate-900/50">
                             <div className="w-24 h-24 rounded-full bg-emerald-50 dark:bg-emerald-900/10 flex items-center justify-center text-emerald-500 mb-8 border border-emerald-100 dark:border-emerald-800">
                                <span className="material-symbols-outlined text-5xl font-black">verified</span>
                             </div>
                             <p className="font-black text-xs uppercase tracking-[0.4em] italic opacity-60">Operational Grid Clear - Zero Alerts Pending</p>
                        </div>
                    )}
                </section>

                {/* Performance Footnote */}
                <footer className="mt-20 px-8 pb-12 flex flex-col md:flex-row justify-between items-center text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-12 gap-8">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] italic opacity-40">GHANA COMMAND GRID v.5.0.2 / SYNC: {new Date().toLocaleTimeString()}</p>
                    <div className="flex items-center gap-12">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 italic opacity-60">
                           <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" /> Latency: 38ms
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 italic opacity-60">
                           <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(34,26,127,0.5)]" /> Encrypted Mesh Active
                        </span>
                    </div>
                </footer>
            </main>
        </div>
    );
};

export default SystemAdminDashboard;