import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../../contexts/NotificationContext';

const NotificationOverlay = () => {
    const { notifications } = useNotifications();

    return (
        <div className="fixed top-8 right-8 z-[100] w-full max-w-sm flex flex-col gap-4 pointer-events-none">
            <AnimatePresence>
                {notifications.map((notif) => (
                    <motion.div 
                        key={notif.id}
                        initial={{ opacity: 0, x: 100, scale: 0.9, rotate: 2 }}
                        animate={{ opacity: 1, x: 0, scale: 1, rotate: 0 }}
                        exit={{ opacity: 0, x: 100, scale: 0.9, rotate: -2 }}
                        className={`pointer-events-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-6 rounded-[32px] border-l-8 shadow-2xl ${
                            notif.type === 'EMERGENCY' ? 'border-rose-500 shadow-rose-500/10' : 'border-primary shadow-primary/10'
                        } border border-slate-200 dark:border-slate-800 flex items-start gap-5`}
                    >
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                            notif.type === 'EMERGENCY' ? 'bg-rose-50 text-rose-500 dark:bg-rose-900/20' : 'bg-blue-50 text-primary dark:bg-blue-900/20'
                        }`}>
                            <span className="material-symbols-outlined font-black text-2xl">{notif.icon}</span>
                        </div>

                        <div className="flex-1">
                            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight italic">{notif.title}</h4>
                            <p className="text-xs text-slate-500 font-bold mt-1 leading-relaxed opacity-80">{notif.message}</p>
                            
                            <div className="mt-3 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Sector Authority Ping</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default NotificationOverlay;
