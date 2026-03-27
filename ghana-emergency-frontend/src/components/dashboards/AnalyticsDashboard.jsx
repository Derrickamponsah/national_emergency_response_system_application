import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { analyticsService } from '../../services/analyticsService';

const AnalyticsDashboard = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const [performance, setPerformance] = useState(null);
    const [regionsData, setRegionsData] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const fetchData = async () => {
        try {
            const [perfData, regData] = await Promise.allSettled([
                analyticsService.getResponseTimes(),
                analyticsService.getByRegion()
            ]);

            if (perfData.status === 'fulfilled') {
                setPerformance(perfData.value);
            }

            if (regData.status === 'fulfilled') {
                setRegionsData(regData.value);
            }
        } catch (error) {
            console.error("Analytics Sync Error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 60000); 
        return () => clearInterval(interval);
    }, []);

    const kpis = [
        { label: 'Avg. Response Time', value: performance?.avgResponseTime || '04:22', unit: 'min', change: '+12%', icon: 'schedule', color: 'text-primary' },
        { label: 'Daily Incidents', value: performance?.dailyTotal || '1,242', unit: 'total', change: '-5.2%', icon: 'emergency', color: 'text-rose-500' },
        { label: 'Fleet Efficiency', value: '98.5', unit: '%', change: '+0.8%', icon: 'local_shipping', color: 'text-emerald-500' },
        { label: 'Resolved Calls', value: performance?.resolvedCount || '892', unit: 'cases', change: '+2.4%', icon: 'task_alt', color: 'text-indigo-500' },
    ];

    const chartData = [40, 60, 45, 90, 70, 85, 55, 100, 75, 40];
    const regions = regionsData.length > 0 ? regionsData : [
        { name: 'Greater Accra', intensity: 90, color: 'from-rose-500 to-rose-300' },
        { name: 'Ashanti', intensity: 75, color: 'from-primary to-blue-300' },
        { name: 'Central', intensity: 60, color: 'from-primary to-blue-300' },
        { name: 'Western', intensity: 45, color: 'from-primary to-blue-300' },
    ];

    return (
        <div className="flex h-screen w-full bg-background-light dark:bg-background-dark overflow-hidden font-display transition-colors">
            {/* Sidebar */}
            <aside className="w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col p-8 shadow-xl z-20">
                <div className="flex items-center gap-4 mb-12 px-2 mt-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/30 rotate-3">
                        <span className="material-symbols-outlined text-white text-3xl font-black">shield_with_heart</span>
                    </div>
                    <div>
                        <h1 className="font-black text-2xl text-slate-900 dark:text-white leading-tight tracking-tighter uppercase italic">NCDC</h1>
                        <p className="text-[10px] font-black tracking-[0.3em] text-primary uppercase italic opacity-70">Strategic Command</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-3">
                    {[
                        { icon: 'grid_view', label: 'Command Hub', path: '/' },
                        { icon: 'emergency_share', label: 'Incident Control', path: '/incidents' },
                        { icon: 'analytics', label: 'Operational Intel', path: '/analytics', active: true },
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

                <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
                    <button 
                        onClick={() => navigate(-1)}
                        className="w-full flex items-center justify-center gap-4 px-4 py-5 text-slate-500 hover:text-primary transition-all font-black text-[10px] tracking-[0.3em] uppercase italic bg-slate-50 dark:bg-slate-800/50 rounded-[28px] border-2 border-transparent hover:border-primary/20"
                    >
                        <span className="material-symbols-outlined text-xl italic">arrow_back</span>
                        Back to Center
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto p-10 lg:p-16 relative custom-scrollbar bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent">
                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16 px-4">
                    <div>
                        <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none underline decoration-primary/20 decoration-8 underline-offset-12">Regional Intel</h2>
                        <div className="flex items-center gap-3 mt-6 overflow-hidden">
                           <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.8)]" />
                           <p className="text-slate-500 text-[10px] font-black tracking-[0.3em] uppercase italic opacity-70">Operational Sync Node: ACCRA-INTEL-01</p>
                        </div>
                    </div>
                </header>

                {/* KPI Cards Grid */}
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-20">
                    {kpis.map((stat, i) => (
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            key={i} 
                            className="bg-white dark:bg-slate-900 p-10 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all relative group overflow-hidden"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <div className={`w-16 h-16 rounded-[24px] bg-slate-50 dark:bg-slate-800 flex items-center justify-center ${stat.color} transition-transform group-hover:scale-110 group-hover:rotate-12`}>
                                    <span className="material-symbols-outlined text-4xl font-black">
                                        {stat.icon}
                                    </span>
                                </div>
                                <div className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] font-black tracking-tighter shadow-inner ${stat.change.startsWith('+') ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'text-rose-500 bg-rose-50 dark:bg-rose-900/20'}`}>
                                    {stat.change}
                                </div>
                            </div>
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-1 opacity-60 italic">{stat.label}</p>
                            <div className="flex items-baseline gap-2">
                                <h4 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter italic">{stat.value}</h4>
                                <span className="text-xs text-slate-400 font-bold uppercase italic opacity-50">{stat.unit}</span>
                            </div>
                        </motion.div>
                    ))}
                </section>

                {/* Charts and Data Visuals */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 px-4 mb-20">
                    {/* Activity Trend Chart */}
                    <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-12 lg:p-14 rounded-[64px] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between relative overflow-hidden group">
                         <div className="flex justify-between items-start mb-16 relative z-10">
                            <div>
                                <h4 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3 uppercase italic underline decoration-primary/30 underline-offset-8">
                                  Response Velocity
                                </h4>
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mt-3 italic opacity-60">Aggregate Strategic Data Throughput</p>
                            </div>
                        </div>

                        {/* Chart Area */}
                        <div className="flex items-end justify-between h-80 px-8 mb-10 relative z-10 border-b border-slate-50 dark:border-slate-800/80 pb-6">
                            {chartData.map((h, i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ height: 0 }}
                                    animate={{ height: `${h}%` }}
                                    transition={{ duration: 1.5, delay: i * 0.05 }}
                                    className="w-8 bg-gradient-to-t from-primary/90 to-blue-400 rounded-full shadow-[0_4px_25px_rgba(34,26,127,0.15)] group relative transition-all hover:scale-110 cursor-pointer"
                                >
                                    <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black px-4 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none tracking-widest whitespace-nowrap z-20 shadow-2xl skew-x-[-10deg]">
                                        VAL: {h}%
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <div className="flex justify-between text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] px-8 pt-8 italic opacity-40">
                            <span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span><span>SUN</span>
                        </div>
                    </div>

                    {/* Regional Intensity List */}
                    <div className="bg-white dark:bg-slate-900 p-12 lg:p-14 rounded-[64px] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:scale-110 transition-transform">
                             <span className="material-symbols-outlined text-[140px]">hub</span>
                        </div>
                        
                        <h4 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3 uppercase italic mb-12 relative z-10 underline decoration-rose-500/30 underline-offset-8">
                            Density Matrix
                        </h4>
                        
                        <div className="space-y-12 flex-1 relative z-10">
                            {regions.map((region, i) => (
                                <div key={i} className="space-y-5 group/item">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] items-center">
                                        <span className="text-slate-500 italic group-hover/item:text-primary transition-colors">#{i+1} {region.name}</span>
                                        <span className="text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800 shadow-inner">{region.intensity}%</span>
                                    </div>
                                    <div className="w-full h-5 bg-slate-50 dark:bg-slate-800/50 rounded-full overflow-hidden border border-slate-100 dark:border-slate-800 shadow-inner p-1">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${region.intensity}%` }}
                                            transition={{ duration: 2, delay: i * 0.2 }}
                                            className={`h-full rounded-full bg-gradient-to-r ${region.color || 'from-primary to-blue-400'} shadow-lg`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button 
                            onClick={() => navigate('/audit-logs')}
                            className="w-full py-6 mt-20 bg-slate-900 dark:bg-slate-800 text-white rounded-[32px] text-[10px] font-black tracking-[0.3em] uppercase italic flex items-center justify-center gap-4 hover:bg-primary transition-all shadow-2xl shadow-primary/20 relative z-10"
                        >
                            ANALYZE MASTER PACKETS
                            <span className="material-symbols-outlined text-lg font-black">arrow_forward</span>
                        </button>
                    </div>
                </div>

                {/* Intelligence Footnote */}
                <footer className="mt-20 px-4 pb-12 border-t border-slate-100 dark:border-slate-800 pt-12 flex flex-col md:flex-row justify-between items-center gap-8 opacity-60">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] italic text-slate-400">GH-OPERATIONS REGIONAL SYNC v.5.0.2 / MASTER NODE: ACTIVE</p>
                    <div className="flex gap-12">
                        <div className="flex items-center gap-4">
                             <span className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 italic">Clearance: LEVEL 4</span>
                        </div>
                        <div className="flex items-center gap-4">
                             <span className="w-2 h-2 bg-primary rounded-full shadow-[0_0_8px_rgba(34,26,127,0.5)]" />
                             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 italic">Grid: ACCRA-INTEL-01</span>
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    );
};

export default AnalyticsDashboard;