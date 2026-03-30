import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import LiveMap from '../shared/LiveMap';
import StatusBadge from '../shared/StatusBadge';
import DispatchNotification from '../shared/DispatchNotification';
import { useDispatchNotification } from '../../hooks/useDispatchNotification';
import { incidentService } from '../../services/incidentService';
import { vehicleService } from '../../services/vehicleService';
import { socketService } from '../../services/socketService';

import ResponseMap from '../fire/ResponseMap';
import DispatchLogs from '../fire/DispatchLogs';
import GearInventory from '../fire/GearInventory';
import FireNodeSettings from '../fire/FireNodeSettings';
import AddIncidentModal from '../shared/AddIncidentModal';

const FireAdminDashboard = () => {
    const { logout, user } = useAuth();
    const { notification, showNotification, hideNotification } = useDispatchNotification();
    const [activeTab, setActiveTab] = useState('Hydrant Flow');
    const [incidents, setIncidents] = useState([]);
    const [fireVehicles, setFireVehicles] = useState([]);
    const [loading, setLoading] = useState(true);

    const formatIncident = (inc) => ({
        id: inc.incident_id || inc.id,
        incident_type: inc.type || inc.incident_type,
        location_description: inc.location || inc.location_description,
        status: inc.status,
        latitude: parseFloat(inc.latitude) || 5.6037,
        longitude: parseFloat(inc.longitude) || -0.1870
    });

    const formatVehicle = (veh) => ({
        id: veh.vehicleId || veh.id || 'N/A',
        type: veh.type || 'FIRE_TRUCK',
        registrationNumber: veh.registration_number || veh.registrationNumber || 'UNKNOWN',
        latitude: parseFloat(veh?.current_location?.latitude || veh.currentLatitude || veh.latitude) || 5.6037,
        longitude: parseFloat(veh?.current_location?.longitude || veh.currentLongitude || veh.longitude) || -0.1870,
        status: veh.status || 'UNAVAILABLE'
    });

    const fetchData = async () => {
        try {
            const [incidentData, vehicleData] = await Promise.allSettled([incidentService.getAll({ type: 'FIRE' }), vehicleService.getAll({ type: 'FIRE_TRUCK' })]);
            if (incidentData.status === 'fulfilled') setIncidents(incidentData.value.filter(inc => inc.incident_type === 'FIRE').map(formatIncident));
            if (vehicleData.status === 'fulfilled') setFireVehicles(vehicleData.value.filter(veh => veh.type === 'FIRE_TRUCK').map(formatVehicle));
        } catch (error) {
            console.error("Fire Node Sync Error:", error);
            setIncidents([{ id: 5, incident_type: 'FIRE', location_description: 'Makola Market Sector B', status: 'IN_PROGRESS', latitude: 5.5451, longitude: -0.2035 }, { id: 6, incident_type: 'FIRE', location_description: 'Agbogbloshie Node', status: 'REPORTED', latitude: 5.5503, longitude: -0.2115 }].map(formatIncident));
        } finally { setLoading(false); }
    };

    useEffect(() => {
        fetchData();
        socketService.subscribeToIncidents((update) => {
            if (update.incident_type === 'FIRE') {
                setIncidents(prev => {
                    const i = prev.findIndex(x => x.id === update.id);
                    if (i !== -1) {
                        const n = [...prev];
                        n[i] = formatIncident(update);
                        return n;
                    }
                    return [formatIncident(update), ...prev];
                });
            }
        });
        socketService.subscribeToFleet((update) => {
            if (update.type === 'FIRE_TRUCK') {
                setFireVehicles(prev => {
                    const i = prev.findIndex(x => x.id === update.id);
                    if (i !== -1) {
                        const n = [...prev];
                        n[i] = formatVehicle(update);
                        return n;
                    }
                    return [...prev, formatVehicle(update)];
                });
            }
        });
    }, []);

    const handleDispatch = async (incidentId) => {
        // Dispatch is now handled solely by System Administrator
        console.log('Dispatch is restricted to System Administrator');
    };

    const mapMarkers = [...incidents.map(inc => ({ id: inc.id, lat: parseFloat(inc.latitude), lng: parseFloat(inc.longitude), type: 'INCIDENT', title: `Fire: ${inc.id}`, description: inc.location_description, color: 'orange', status: inc.status })), ...fireVehicles.map(veh => ({ id: veh.id, lat: parseFloat(veh.latitude), lng: parseFloat(veh.longitude), type: 'FIRE_TRUCK', title: veh.registrationNumber, description: 'Thermal Sync Active', color: 'orange', status: veh.status }))];
    const stats = [
        { label: 'Idle Trucks', value: '12', icon: 'fire_truck', color: 'text-fire-main bg-orange-50 dark:bg-orange-900/20' },
        { label: 'Water Reserve', value: '94%', icon: 'water_drop', color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' },
        { label: 'Pump Pressure', value: '14 bar', icon: 'speed', color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20' },
        { label: 'Active Teams', value: '08', icon: 'engineering', color: 'text-primary bg-blue-50 dark:bg-blue-900/20' },
    ];

    const sidebarItems = [
        { icon: 'map', label: 'Response Map' },
        { icon: 'history_edu', label: 'Dispatch Logs' },
        { icon: 'inventory', label: 'Gear Inventory' },
        { icon: 'settings', label: 'Node Settings' },
    ];

    const HydrantFlowView = () => (
        <>
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16 px-4">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none truncate md:max-w-xl">Fire Ops Feed</h2>
                    <div className="flex items-center gap-2 mt-3 overflow-hidden"><span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" /><p className="text-slate-500 text-xs font-bold tracking-widest uppercase">Emergency Readiness Level: HIGH</p></div>
                </div>
                <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-500 flex items-center gap-2 border border-slate-100 dark:border-slate-800 uppercase italic">
                        <span className="material-symbols-outlined text-sm">visibility</span>
                        Monitoring Mode
                    </div>
                </div>
            </header>
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                {stats.map((stat, i) => (
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={i} className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all relative group overflow-hidden">
                        <div className={`${stat.color} mb-6 w-14 h-14 rounded-2xl flex items-center justify-center`}><span className="material-symbols-outlined text-3xl">{stat.icon}</span></div>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em]">{stat.label}</p>
                        <h4 className="text-4xl font-black mt-2 text-slate-900 dark:text-white tracking-tighter">{stat.value}</h4>
                    </motion.div>
                ))}
            </section>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 px-4 mb-20">
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic underline decoration-fire-main/30 underline-offset-8">Thermal Response Map</h3>
                    <div className="h-[550px] w-full shadow-2xl shadow-fire-main/10 rounded-[48px] overflow-hidden border-4 border-white dark:border-slate-800"><LiveMap markers={mapMarkers} className="brightness-110 contrast-110" /></div>
                </div>
                <div className="flex flex-col gap-6">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic underline decoration-blue-500/30 underline-offset-8">Hydrant Mesh</h3>
                    <div className="bg-white dark:bg-slate-900 rounded-[48px] p-10 border border-slate-200 dark:border-slate-800 shadow-sm flex-1 space-y-10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform"><span className="material-symbols-outlined text-[100px]">pumping_station</span></div>
                        {[{ label: 'Makola Main', pressure: '12.4 bar', status: 'STABLE' }, { label: 'Independence Sq', pressure: '14.2 bar', status: 'STABLE' }, { label: 'Cantonments Node', pressure: '08.9 bar', status: 'LOW' }, { label: 'Ridge Hospital Ext', pressure: '11.1 bar', status: 'STABLE' }].map((hydrant, i) => (
                            <div key={i} className="flex justify-between items-center relative z-10">
                                <div className="flex flex-col"><span className="text-sm font-bold text-slate-900 dark:text-white">{hydrant.label}</span><span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{hydrant.pressure}</span></div>
                                <div className={`w-2 h-2 rounded-full ${hydrant.status === 'STABLE' ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'}`} />
                            </div>
                        ))}
                        <button onClick={() => setActiveTab('Dispatch Logs')} className="w-full py-5 border-t border-slate-100 dark:border-slate-800 text-[10px] font-black tracking-[0.2em] text-slate-400 hover:text-fire-main transition-all uppercase flex items-center justify-center gap-3 italic mt-12"><span className="material-symbols-outlined text-lg">water_damage</span>Full Hydrant Protocol</button>
                    </div>
                </div>
            </div>

            <div className="px-4 pb-20">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic underline decoration-orange-500/30 underline-offset-8 mb-10 text-center md:text-left">Active Response Feed</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {incidents.slice(0, 6).map((inc, i) => (
                        <motion.div key={inc.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} className="bg-white dark:bg-slate-900/60 p-8 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-sm group hover:border-fire-main/40 transition-all relative">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 rounded-2xl bg-orange-50 dark:bg-orange-900/20 text-fire-main">
                                    <span className="material-symbols-outlined text-2xl">local_fire_department</span>
                                </div>
                                <StatusBadge status={inc.status} />
                            </div>
                            <h4 className="font-black text-slate-900 dark:text-white truncate mb-2">{inc.location_description}</h4>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-6 italic">Sector Makola • Sector Priority 1</p>

                            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                                {inc.status === 'REPORTED' || inc.status === 'CREATED' ? (
                                    <div className="w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all bg-slate-100 dark:bg-slate-800 text-slate-500 italic">
                                        <span className="material-symbols-outlined text-lg animate-pulse">hourglass_empty</span>
                                        Awaiting System Dispatch
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic">Unit Assigned & On Scene</span>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                    {incidents.length === 0 && (
                        <div className="col-span-full py-12 text-center bg-slate-50 dark:bg-slate-800/30 rounded-[40px] border-2 border-dashed border-slate-200 dark:border-slate-800 italic text-slate-400 font-bold">
                            No active fire incidents in sector.
                        </div>
                    )}
                </div>
            </div>
        </>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'Response Map': return <ResponseMap fireVehicles={fireVehicles} />;
            case 'Dispatch Logs': return <DispatchLogs incidents={incidents} />;
            case 'Gear Inventory': return <GearInventory />;
            case 'Node Settings': return <FireNodeSettings />;
            default: return <HydrantFlowView />;
        }
    };

    return (
        <div className="flex h-screen w-full bg-background-light dark:bg-background-dark overflow-hidden font-display">
            {/* Dispatch Notification */}
            {notification && (
                <DispatchNotification
                    isVisible={true}
                    status={notification.status === 'SUCCESS' ? 'success' : 'failure'}
                    message={notification.message}
                    vehicleInfo={{
                        reg: notification.vehicleReg,
                        baseStation: notification.baseStation,
                        location: notification.location
                    }}
                    onClose={hideNotification}
                />
            )}

            <aside className="w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col p-6 shadow-xl z-20">
                <div className="flex items-center gap-3 mb-10 px-2 mt-4">
                    <div className="w-12 h-12 rounded-xl bg-fire-main flex items-center justify-center shadow-lg shadow-orange-500/20"><span className="material-symbols-outlined text-white text-3xl">local_fire_department</span></div>
                    <div><h1 className="font-bold text-xl text-slate-900 dark:text-white leading-tight">Fire Command</h1><p className="text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase italic">Makola Sector Hub</p></div>
                </div>
                <nav className="flex-1 space-y-2">
                    {sidebarItems.map((item, i) => (
                        <button key={i} onClick={() => setActiveTab(item.label)} className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all group ${activeTab === item.label ? 'bg-fire-main text-white shadow-xl shadow-orange-900/40 translate-x-1' : 'text-slate-500 hover:text-fire-main hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                            <span className="material-symbols-outlined text-[24px]">{item.icon}</span>
                            <span className="text-sm font-bold tracking-tight">{item.label}</span>
                        </button>
                    ))}
                </nav>
                <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-[24px] mb-4 flex items-center gap-4 border border-slate-200/50 dark:border-slate-800">
                        <div className="w-10 h-10 rounded-full bg-fire-main/10 flex items-center justify-center text-fire-main font-bold">{user?.name?.[0] || 'C'}</div>
                        <div className="flex-1 overflow-hidden"><p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.name || 'Chief Lartey'}</p><p className="text-[10px] text-slate-500 uppercase font-black truncate tracking-widest">{user?.role || 'FIRE_ADMIN'}</p></div>
                    </div>
                    <button onClick={logout} className="w-full flex items-center justify-center gap-3 px-4 py-4 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-2xl transition-all font-bold text-sm tracking-widest uppercase italic border border-rose-500/10"><span className="material-symbols-outlined text-xl">logout</span>Retire authority</button>
                </div>
            </aside>
            <main className="flex-1 overflow-y-auto p-8 lg:p-12 relative custom-scrollbar bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-orange-50/5 via-transparent to-transparent">
                {renderContent()}
            </main>

        </div>
    );
};

export default FireAdminDashboard;