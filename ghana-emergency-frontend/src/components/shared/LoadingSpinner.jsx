import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = () => {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-background-light dark:bg-background-dark gap-6">
            <motion.div 
                animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 90, 180, 270, 360],
                    borderRadius: ["20%", "50%", "20%"]
                }}
                transition={{ 
                    duration: 3, 
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="bg-primary/10 p-6 rounded-3xl shadow-2xl shadow-primary/5 flex items-center justify-center border border-primary/10"
            >
                <span className="material-symbols-outlined text-primary text-5xl animate-pulse">emergency</span>
            </motion.div>
            <div className="flex flex-col items-center gap-2">
                <p className="text-slate-900 dark:text-white font-black animate-pulse tracking-[0.3em] uppercase text-[10px] italic">Synchronizing Command Hub</p>
                <div className="w-48 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ left: "-100%" }}
                        animate={{ left: "100%" }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="relative h-full w-1/2 bg-primary shadow-[0_0_10px_rgba(34,26,127,0.5)]"
                    />
                </div>
            </div>
        </div>
    );
};

export default LoadingSpinner;
