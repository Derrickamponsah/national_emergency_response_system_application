import React from 'react';
import { motion } from 'framer-motion';

const DispatchNotification = ({ isVisible, status, message, vehicleInfo, onClose }) => {
    if (!isVisible) return null;

    const isSuccess = status === 'success';
    const isDuration = 3000;

    React.useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(onClose, isDuration);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    return (
        <motion.div
            initial={{ opacity: 0, y: -20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-50 rounded-2xl p-6 shadow-2xl backdrop-blur-lg ${
                isSuccess
                    ? 'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/30 dark:to-pink-900/30 border border-rose-200 dark:border-rose-800'
            } max-w-sm`}
        >
            <div className="flex items-start gap-4">
                <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                        isSuccess
                            ? 'bg-emerald-100 dark:bg-emerald-900/50'
                            : 'bg-rose-100 dark:bg-rose-900/50'
                    }`}
                >
                    <motion.span
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6 }}
                        className={`material-symbols-outlined text-xl ${
                            isSuccess ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                    >
                        {isSuccess ? 'check_circle' : 'error'}
                    </motion.span>
                </div>

                <div className="flex-1">
                    <h3
                        className={`font-black text-sm uppercase tracking-tight ${
                            isSuccess ? 'text-emerald-900 dark:text-emerald-100' : 'text-rose-900 dark:text-rose-100'
                        }`}
                    >
                        {isSuccess ? '✓ Dispatch Successful' : '✗ Dispatch Failed'}
                    </h3>
                    <p
                        className={`text-xs mt-1 ${
                            isSuccess ? 'text-emerald-700 dark:text-emerald-200' : 'text-rose-700 dark:text-rose-200'
                        }`}
                    >
                        {message}
                    </p>

                    {isSuccess && vehicleInfo && (
                        <div className="mt-3 pt-3 border-t border-emerald-200 dark:border-emerald-700 space-y-1">
                            <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-300 font-bold">
                                <span className="material-symbols-outlined text-sm">directions_car</span>
                                <span>{vehicleInfo.registration_number || 'Unit'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-300 font-bold">
                                <span className="material-symbols-outlined text-sm">location_on</span>
                                <span>En route from {vehicleInfo.base_station || 'Base'}</span>
                            </div>
                        </div>
                    )}
                </div>

                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    className={`shrink-0 text-2xl leading-none transition-colors ${
                        isSuccess
                            ? 'text-emerald-400 hover:text-emerald-600'
                            : 'text-rose-400 hover:text-rose-600'
                    }`}
                >
                    ×
                </motion.button>
            </div>

            {isSuccess && (
                <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 2.5, delay: 0.3 }}
                    className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-400 origin-left"
                />
            )}
        </motion.div>
    );
};

export default DispatchNotification;
