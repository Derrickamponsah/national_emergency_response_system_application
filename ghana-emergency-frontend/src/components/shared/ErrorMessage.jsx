import React from 'react';
import { motion } from 'framer-motion';

const ErrorMessage = ({ message, onRetry }) => {
    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900 rounded-[48px] border border-accent-red/20 shadow-2xl shadow-accent-red/5 max-w-md mx-auto text-center font-display relative overflow-hidden"
        >
            <div className="bg-accent-red/10 p-6 rounded-[32px] mb-8 shadow-inner">
                <span className="material-symbols-outlined text-accent-red text-4xl animate-pulse">lock_person</span>
            </div>
            
            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter mb-3 leading-none underline decoration-accent-red/20 underline-offset-8">Auth Node Failure</h3>
            <p className="text-slate-500 font-medium text-sm leading-relaxed mb-10 italic">
               {message || "The central synchronization relay is currently unreachable. Verification failed."}
            </p>

            <button 
                onClick={onRetry}
                className="w-full bg-accent-red hover:bg-rose-700 text-white font-bold py-4 rounded-3xl shadow-xl shadow-accent-red/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3 hover:translate-y-[-2px]"
            >
                Initialize Re-sync
                <span className="material-symbols-outlined">sync</span>
            </button>
            
            <footer className="mt-8 text-[10px] font-black uppercase tracking-widest text-slate-400 opacity-50">
               NCDC Protocol 412 - Sector Sync Timeout
            </footer>

            {/* Background pattern */}
            <div className="absolute top-0 right-0 p-8 opacity-5 -rotate-12">
               <span className="material-symbols-outlined text-[120px]">security_update_warning</span>
            </div>
        </motion.div>
    );
};

export default ErrorMessage;
