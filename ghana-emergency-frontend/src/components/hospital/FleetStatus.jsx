import React, { useState } from 'react';
import { motion } from 'framer-motion';
import StatusBadge from '../shared/StatusBadge';
import LiveMap from '../shared/LiveMap';
import ManageVehicleModal from '../shared/ManageVehicleModal';

const FleetStatus = ({ vehicles = [] }) => {
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filter, setFilter] = useState('ALL');

    const mockVehicles = vehicles.length > 0 ? vehicles : [
        { id: 1, registrationNumber: 'GR-AMB-001', type: 'AMBULANCE', status: 'IDLE', driverName: 'Kwame Asante', fuelLevel: 85, mileage: 12400, latitude: 5.5571, longitude: -0.2012 },
        { id: 2, registrationNumber: 'GR-AMB-002', type: 'AMBULANCE', status: 'EN_ROUTE', driverName: 'Ama Serwaa', fuelLevel: 62, mileage: 34200, latitude: 5.5391, longitude: -0.2265 },
        { id: 3, registrationNumber: 'GR-AMB-003', type: 'AMBULANCE', status: 'ON_SCENE', driverName: 'Yaw Boateng', fuelLevel: 45, mileage: 56800, latitude: 5.5493, longitude: -0.2185 },
        { id: 4, registrationNumber: 'GR-AMB-004', type: 'AMBULANCE', status: 'MAINTENANCE', driverName: 'N/A', fuelLevel: 20, mileage: 78100, latitude: 5.5571, longitude: -0.2012 },
        { id: 5, registrationNumber: 'GR-AMB-005', type: 'AMBULANCE', status: 'IDLE', driverName: 'Efua Mensah', fuelLevel: 92, mileage: 8900, latitude: 5.5610, longitude: -0.1950 },
    ];

    const filtered = filter === 'ALL' ? mockVehicles : mockVehicles.filter(v => v.status === filter);
    const statusCounts = { ALL: mockVehicles.length, IDLE: mockVehicles.filter(v => v.status === 'IDLE').length, EN_ROUTE: mockVehicles.filter(v => v.status === 'EN_ROUTE').length, ON_SCENE: mockVehicles.filter(v => v.status === 'ON_SCENE').length, MAINTENANCE: mockVehicles.filter(v => v.status === 'MAINTENANCE').length };

    const mapMarkers = mockVehicles.map(v => ({ id: v.id, lat: v.latitude, lng: v.longitude, type: 'AMBULANCE', title: v.registrationNumber, description: v.driverName, color: v.status === 'EN_ROUTE' ? 'amber' : v.status === 'ON_SCENE' ? 'rose' : 'teal', status: v.status }));

    return (
        <div>
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">Fleet Status</h2>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <p className="text-slate-500 text-xs font-bold tracking-widest uppercase">Real-Time Ambulance Tracking</p>
                    </div>
                </div>
                <button 
                  onClick={() => { setSelectedVehicle(null); setIsModalOpen(true); }}
                  className="px-8 py-4 bg-medical-main text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-teal-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                >
                  <span className="material-symbols-outlined text-lg">add_circle</span>
                  Register New Ambulance
                </button>
            </header>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-3 mb-10">
                {['ALL', 'IDLE', 'EN_ROUTE', 'ON_SCENE', 'MAINTENANCE'].map(f => (
                    <button key={f} onClick={() => setFilter(f)} className={`px-5 py-2.5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all ${filter === f ? 'bg-medical-main text-white shadow-lg shadow-teal-500/20' : 'bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-50 border border-slate-200 dark:border-slate-700'}`}>
                        {f.replace('_', ' ')} ({statusCounts[f]})
                    </button>
                ))}
            </div>

            {/* Map */}
            <div className="h-[350px] w-full rounded-[32px] overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl mb-10">
                <LiveMap markers={mapMarkers} />
            </div>

            {/* Vehicle Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.map((v, i) => (
                    <motion.div key={v.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="bg-white dark:bg-slate-900 p-7 rounded-[28px] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group">
                        <div className="flex justify-between items-start mb-5">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-2xl text-medical-main">ambulance</span>
                                </div>
                                <div>
                                    <h4 className="font-black text-lg text-slate-900 dark:text-white tracking-tight leading-none">{v.registrationNumber}</h4>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Personnel: {v.driver_name || v.driverName || 'Unassigned'}</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <StatusBadge status={v.status} />
                                <button 
                                    onClick={() => { setSelectedVehicle(v); setIsModalOpen(true); }}
                                    className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-medical-main hover:bg-teal-50 dark:hover:bg-teal-900/10 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <span className="material-symbols-outlined text-lg">edit</span>
                                </button>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-400 font-bold uppercase tracking-wider">Fuel</span>
                                <span className={`font-black ${(v.fuel_level || v.fuelLevel || 100) < 30 ? 'text-rose-500' : (v.fuel_level || v.fuelLevel || 100) < 60 ? 'text-amber-500' : 'text-emerald-500'}`}>{(v.fuel_level || v.fuelLevel || 100)}%</span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full transition-all ${(v.fuel_level || v.fuelLevel || 100) < 30 ? 'bg-rose-500' : (v.fuel_level || v.fuelLevel || 100) < 60 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${(v.fuel_level || v.fuelLevel || 100)}%` }} />
                            </div>
                            <div className="flex justify-between text-xs pt-2">
                                <span className="text-slate-400 font-bold uppercase tracking-wider">Mileage</span>
                                <span className="font-black text-slate-700 dark:text-slate-300">{(v.mileage || Math.floor(Math.random() * 50000) + 5000).toLocaleString()} km</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <ManageVehicleModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                vehicle={selectedVehicle} 
                fixedType="AMBULANCE" 
                onRefresh={() => window.location.reload()} // Quick hack to refresh data, ideally should use state/context
            />
        </div>
    );
};

export default FleetStatus;
