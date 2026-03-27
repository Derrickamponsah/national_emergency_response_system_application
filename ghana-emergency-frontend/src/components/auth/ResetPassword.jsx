import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const ResetPassword = () => {
    return (
        <div className="flex min-h-screen w-full items-center justify-center p-6 bg-background-light dark:bg-background-dark overflow-hidden relative font-display">
            {/* Background Decorative Elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 blur-[160px] rounded-full pointer-events-none" />

            <Link to="/login" className="absolute top-10 left-10 flex items-center gap-3 text-slate-500 hover:text-primary transition-all group font-bold text-sm">
                <span className="material-symbols-outlined transition-transform group-hover:-translate-x-1">arrow_back</span>
                Return to Login
            </Link>

            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-lg p-10 bg-white dark:bg-slate-900 rounded-[48px] shadow-2xl shadow-primary/10 border border-slate-100 dark:border-slate-800 relative z-10"
            >
                <div className="flex flex-col items-center mb-12 text-center">
                    <div className="bg-primary/5 p-6 rounded-[32px] mb-8 flex items-center justify-center shadow-inner">
                        <span className="material-symbols-outlined text-primary text-4xl">vpn_key</span>
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic mb-3 leading-none">Reset Credentials</h2>
                    <p className="text-slate-500 font-medium text-sm leading-relaxed max-w-xs italic">
                        Node verification successful. Set a strong departmental password.
                    </p>
                </div>

                <form className="space-y-8">
                    <div className="space-y-2 group">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">New Secure Pin</label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors text-xl">lock_open</span>
                            <input 
                                type="password" 
                                placeholder="••••••••" 
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-3xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none text-sm font-medium text-slate-900 dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="space-y-2 group">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Confirm Pin</label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors text-xl">verified_user</span>
                            <input 
                                type="password" 
                                placeholder="••••••••" 
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-3xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none text-sm font-medium text-slate-900 dark:text-white"
                            />
                        </div>
                    </div>

                    <button className="w-full bg-primary hover:bg-primary/95 text-white font-bold py-5 rounded-3xl shadow-xl shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3 hover:translate-y-[-2px]">
                        Sync New Credentials
                        <span className="material-symbols-outlined">sync_lock</span>
                    </button>
                    
                    <div className="flex items-start gap-4 p-5 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-3xl border border-emerald-100 dark:border-emerald-800/30">
                        <span className="material-symbols-outlined text-emerald-500 text-xl flex-shrink-0">gavel</span>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed italic">
                           Successful resets are logged on the central audit trail for security compliance and behavioral monitoring.
                        </p>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default ResetPassword;