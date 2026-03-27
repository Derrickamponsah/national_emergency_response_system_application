import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import StatusBadge from '../shared/StatusBadge';
import { useAuth } from '../../hooks/useAuth';
import LiveMap from '../shared/LiveMap';
import { incidentService } from '../../services/incidentService';
import { vehicleService } from '../../services/vehicleService';
import { socketService } from '../../services/socketService';

const HospitalAdminDashboard = () => {
    const { logout, user } = useAuth();
    const [incidents, setIncidents] = useState([]);
    const [hospitalVehicles, setHospitalVehicles] = useState([]);
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
                incidentService.getAll({ type: 'MEDICAL' }),
                vehicleService.getAll({ type: 'AMBULANCE' })
            ]);

            if (incidentData.status === 'fulfilled') {
                setIncidents(incidentData.value.filter(inc => inc.incident_type === 'MEDICAL').map(formatIncident));
            }

            if (vehicleData.status === 'fulfilled') {
                setHospitalVehicles(vehicleData.value.filter(veh => veh.type === 'AMBULANCE').map(formatVehicle));
            }
        } catch (error) {
            console.error("Hospital Node Sync Error:", error);
            // Fallback mock data
            setIncidents([
                { id: 1, incident_type: 'MEDICAL', location_description: 'Korle-Bu Area', status: 'IN_PROGRESS', latitude: 5.5391, longitude: -0.2265 },
                { id: 2, incident_type: 'MEDICAL', location_description: 'Circle Interchange', status: 'REPORTED', latitude: 5.5593, longitude: -0.2085 }
            ].map(formatIncident));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();

        socketService.subscribeToIncidents((update) => {
            if (update.incident_type === 'MEDICAL') {
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
            if (update.type === 'AMBULANCE') {
                setHospitalVehicles(prev => {
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
            title: `Medical: ${inc.id}`,
            description: inc.location_description,
            color: 'rose',
            status: inc.status
        })),
        ...hospitalVehicles.map(veh => ({
            id: veh.id,
            lat: parseFloat(veh.latitude),
            lng: parseFloat(veh.longitude),
            type: 'AMBULANCE',
            title: veh.registrationNumber,
            description: 'En-route to Base',
            color: 'teal',
            status: veh.status
        }))
    ];

    const stats = [
        { label: 'Total Beds', value: '182', icon: 'bed', color: 'text-medical-main bg-teal-50 dark:bg-emerald-900/20' },
        { label: 'Available', value: '14', icon: 'check_circle', color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' },
        { label: 'Ambulances', value: hospitalVehicles.length || '0', icon: 'ambulance', color: 'text-primary bg-blue-50 dark:bg-blue-900/20' },
        { label: 'Staff Duty', value: '22', icon: 'medical_services', color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20' },
    ];

    return (
        <div className="flex h-screen w-full bg-background-light dark:bg-background-dark overflow-hidden">
            {/* Hospital Sidebar */}
            <aside className="w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col p-6 shadow-xl z-20">
                <div className="flex items-center gap-3 mb-10 px-2 mt-4">
                    <div className="w-12 h-12 rounded-xl bg-medical-main flex items-center justify-center shadow-lg shadow-teal-500/20">
                        <span className="material-symbols-outlined text-white text-3xl">local_hospital</span>
                    </div>
                    <div>
                        <h1 className="font-bold text-xl text-slate-900 dark:text-white leading-tight">Korle-Bu</h1>
                        <p className="text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase italic">Emergency Node</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-2">
                    {[
                        { icon: 'monitor_heart', label: 'Ward Flow', active: true },
                        { icon: 'ambulance', label: 'Fleet Status' },
                        { icon: 'assignment_turned_in', label: 'Triage Queue' },
                        { icon: 'inventory_2', label: 'Supply Audit' },
                        { icon: 'settings', label: 'Node Config' },
                    ].map((item, i) => (
                        <button 
                            key={i} 
                            className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all group ${
                                item.active 
                                ? 'bg-medical-main text-white shadow-xl shadow-teal-900/40 translate-x-1' 
                                : 'text-slate-500 hover:text-medical-main hover:bg-slate-50 dark:hover:bg-slate-800'
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
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-[24px] mb-4 flex items-center gap-4 border border-slate-200/50 dark:border-slate-800">
                        <div className="w-10 h-10 rounded-full bg-medical-main/10 flex items-center justify-center text-medical-main font-bold">
                            {user?.name?.[0] || 'D'}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.name || 'Dr. Mensah'}</p>
                            <p className="text-[10px] text-slate-500 uppercase font-black truncate tracking-widest">{user?.role || 'HOSPITAL_ADMIN'}</p>
                        </div>
                    </div>
                    <button 
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-3 px-4 py-4 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-2xl transition-all font-bold text-sm tracking-widest uppercase italic border border-rose-500/10"
                    >
                        <span className="material-symbols-outlined text-xl">logout</span>
                        Sign Out Authority
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto p-8 lg:p-12 relative custom-scrollbar bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-medical-main/5 via-transparent to-transparent">
                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16 px-4">
                    <div>
                        <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none truncate md:max-w-xl">Medical Command</h2>
                        <div className="flex items-center gap-2 mt-3 overflow-hidden">
                           <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                           <p className="text-slate-500 text-xs font-bold tracking-widest uppercase">Live Triage & Asset Synchronization</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <button className="px-8 py-3 bg-medical-main hover:bg-teal-700 text-white rounded-xl shadow-lg shadow-teal-500/20 text-xs font-bold transition-all active:scale-95 flex items-center gap-2">
                           <span className="material-symbols-outlined text-sm">add_box</span>
                           Register Intake
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
                            
                            <div className="absolute top-0 right-0 w-1.5 h-full bg-medical-main opacity-0 group-hover:opacity-100 transition-opacity" />
                        </motion.div>
                    ))}
                </section>

                {/* Interactive Modules */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 px-4 mb-16">
                    {/* Live Triage Map */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic underline decoration-teal-500/30 underline-offset-8">Catchment Visualization</h3>
                        </div>
                        <div className="h-[500px] w-full shadow-2xl shadow-medical-main/10 rounded-[48px] overflow-hidden border-4 border-white dark:border-slate-800">
                            <LiveMap markers={mapMarkers} className="grayscale-[0.2]" />
                        </div>
                    </div>

                    <div className="flex flex-col gap-6">
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic underline decoration-amber-500/30 underline-offset-8">Duty Roster Sync</h3>
                        <div className="bg-white dark:bg-slate-900 rounded-[48px] p-10 border border-slate-200 dark:border-slate-800 shadow-sm flex-1 relative overflow-hidden group">
                           <div className="space-y-8 relative z-10">
                              {[
                                  { name: 'Dr. Anita Okai', dept: 'Trauma Unit', status: 'ON_CALL' },
                                  { name: 'John Dowuona', dept: 'EMS Lead', status: 'ACTIVE' },
                                  { name: 'Sarah Mensah', dept: 'ICU Node', status: 'ACTIVE' },
                                  { name: 'Robert Quaynor', dept: 'Radiology', status: 'STANDBY' }
                              ].map((staff, i) => (
                                  <div key={i} className="flex justify-between items-center group/item">
                                      <div className="flex items-center gap-4">
                                          <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-400 text-xs">
                                              {staff.name[0]}
                                          </div>
                                          <div className="flex flex-col">
                                              <span className="text-sm font-bold text-slate-900 dark:text-white">{staff.name}</span>
                                              <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{staff.dept}</span>
                                          </div>
                                      </div>
                                      <div className={`text-[9px] font-black px-2 py-1 rounded-[4px] ${staff.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'} dark:bg-slate-800/50`}>
                                          {staff.status}
                                      </div>
                                  </div>
                              ))}
                           </div>
                           
                           <button className="w-full py-5 mt-12 bg-medical-main/5 dark:bg-slate-800 rounded-2xl text-[10px] font-black tracking-[0.2em] text-medical-main hover:bg-medical-main hover:text-white transition-all uppercase flex items-center justify-center gap-3 italic">
                               <span className="material-symbols-outlined text-lg">medical_services</span>
                               Audit Duty Logs
                           </button>
                        </div>
                    </div>
                </div>

                {/* Patient Queue Cards */}
                <div className="px-4 pb-16">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic underline decoration-rose-500/30 underline-offset-8 mb-10">Active Admissions Feed</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {incidents.slice(0, 6).map((inc, i) => (
                            <motion.div 
                                key={inc.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white dark:bg-slate-900/60 p-8 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-sm group hover:border-medical-main/40 hover:bg-white dark:hover:bg-slate-900 hover:shadow-2xl transition-all relative overflow-hidden"
                            >
                                <div className="flex justify-between items-start mb-8 relative z-10">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-100 dark:border-slate-700/50">
                                        <span className="material-symbols-outlined text-2xl text-medical-main">patient_list</span>
                                    </div>
                                    <StatusBadge status={inc.status} />
                                </div>
                                <h4 className="font-black text-lg text-slate-900 dark:text-white mb-2 uppercase tracking-tight">Case: GH-{inc.id*12}MK</h4>
                                <div className="flex flex-col gap-1 mb-6">
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 italic">
                                        <span className="material-symbols-outlined text-sm">location_on</span> {inc.location_description}
                                    </div>
                                </div>
                                
                                <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800/80">
                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        <span className="material-symbols-outlined text-[16px]">schedule</span> ACTIVE 42M
                                    </div>
                                    <button className="flex items-center gap-2 text-xs font-black italic tracking-widest text-medical-main hover:gap-3 transition-all group">
                                        VIEW TRIAGE
                                        <span className="material-symbols-outlined text-[20px] transition-transform">chevron_right</span>
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default HospitalAdminDashboard;