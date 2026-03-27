import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { auditService } from '../../services/auditService';

const AuditLogPage = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const data = await auditService.getLogs({ type: filter === 'ALL' ? '' : filter });
            setLogs(data);
        } catch (error) {
            console.error("Audit Sync Error:", error);
            // Fallback mock
            setLogs([
                { id: 1, action: 'DISPATCH_UNIT', actor: 'Chief Lartey', timestamp: new Date().toISOString(), details: 'Unit 001 assigned to Sector A' },
                { id: 2, action: 'INCIDENT_CREATED', actor: 'NCDC_HUB', timestamp: new Date().toISOString(), details: 'Medical alert near Circle' },
                { id: 3, action: 'PROFILE_UPDATED', actor: 'Inspector Mensah', timestamp: new Date().toISOString(), details: 'Security credentials renewed' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleExportCSV = () => {
        const headers = ['Timestamp', 'Action', 'Operator', 'Details', 'Clearance'];
        const csvContent = [
            headers.join(','),
            ...logs.map(log => [
                new Date(log.timestamp).toLocaleString(),
                log.action,
                log.actor,
                `"${log.details.replace(/"/g, '""')}"`,
                'Level 4'
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `ncdc_audit_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    useEffect(() => {
        fetchLogs();
    }, [filter]);

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark p-8 lg:p-16 font-display transition-colors">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16 px-4">
                <div>
                   <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic underline decoration-primary/20 decoration-8 underline-offset-8">System Audit Trail</h2>
                   <p className="text-slate-500 text-xs font-bold tracking-widest uppercase mt-4">Immutable Operational Log Registry v.4.0.1</p>
                </div>
                
                <div className="flex items-center gap-6">
                    <button 
                        onClick={handleExportCSV}
                        className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-primary hover:bg-primary hover:text-white transition-all group"
                        title="Export Operational Packet"
                    >
                         <span className="material-symbols-outlined text-2xl font-black group-hover:rotate-12 transition-transform">download</span>
                    </button>
                    <div className="flex gap-4 p-2 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm">
                       {['ALL', 'DISPATCH', 'INCIDENT', 'SYSTEM'].map((f) => (
                           <button 
                               key={f}
                               onClick={() => setFilter(f)}
                               className={`px-6 py-3 rounded-[24px] text-[10px] font-black uppercase tracking-widest italic transition-all ${filter === f ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                           >
                               {f}
                           </button>
                       ))}
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto space-y-8">
                {loading ? (
                    <div className="py-40 flex flex-col items-center justify-center space-y-4 opacity-50">
                        <span className="material-symbols-outlined text-5xl animate-spin text-primary">sync</span>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em]">Querying Archive Nodes...</p>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-slate-900 rounded-[56px] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden p-10">
                         <div className="overflow-x-auto">
                             <table className="w-full text-left">
                                 <thead>
                                     <tr className="border-b border-slate-100 dark:border-slate-800">
                                         <th className="pb-8 text-[11px] font-black uppercase tracking-widest text-slate-400 px-6 italic">Timestamp</th>
                                         <th className="pb-8 text-[11px] font-black uppercase tracking-widest text-slate-400 px-6 italic">Sector Action</th>
                                         <th className="pb-8 text-[11px] font-black uppercase tracking-widest text-slate-400 px-6 italic">Operator</th>
                                         <th className="pb-8 text-[11px] font-black uppercase tracking-widest text-slate-400 px-6 italic">Details</th>
                                         <th className="pb-8 text-[11px] font-black uppercase tracking-widest text-slate-400 px-6 italic">Status</th>
                                     </tr>
                                 </thead>
                                 <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                     {logs.map((log) => (
                                         <tr key={log.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-all">
                                             <td className="py-8 px-6">
                                                 <div className="text-xs font-bold text-slate-900 dark:text-white">{new Date(log.timestamp).toLocaleTimeString()}</div>
                                                 <div className="text-[10px] text-slate-400 mt-1 font-black uppercase tracking-tighter">{new Date(log.timestamp).toLocaleDateString()}</div>
                                             </td>
                                             <td className="py-8 px-6">
                                                 <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-[10px] font-black text-slate-900 dark:text-white rounded-lg border border-slate-200 dark:border-slate-700 uppercase tracking-widest group-hover:bg-primary group-hover:text-white transition-all">
                                                     {log.action}
                                                 </span>
                                             </td>
                                             <td className="py-8 px-6 text-sm font-black text-slate-500 italic tracking-tighter group-hover:text-slate-900 dark:group-hover:text-white">{log.actor}</td>
                                             <td className="py-8 px-6 text-xs text-slate-400 font-medium max-w-xs truncate italic">{log.details}</td>
                                             <td className="py-8 px-6">
                                                 <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] block" />
                                             </td>
                                         </tr>
                                     ))}
                                 </tbody>
                             </table>
                         </div>

                         {logs.length === 0 && (
                             <div className="py-40 flex flex-col items-center justify-center space-y-4 opacity-50">
                                <span className="material-symbols-outlined text-6xl">cloud_off</span>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] italic">No Logs Found for Selected Filter</p>
                             </div>
                         )}
                    </div>
                )}

                <div className="flex justify-center pt-8">
                     <button className="px-12 py-5 bg-slate-900 dark:bg-slate-800 text-white rounded-[40px] text-[10px] font-black tracking-[0.3em] uppercase italic flex items-center justify-center gap-4 hover:bg-primary transition-all shadow-xl group">
                         LOAD ARCHIVED PACKETS
                         <span className="material-symbols-outlined text-lg group-hover:translate-y-1 transition-transform">expand_more</span>
                     </button>
                </div>
            </main>
        </div>
    );
};

export default AuditLogPage;
