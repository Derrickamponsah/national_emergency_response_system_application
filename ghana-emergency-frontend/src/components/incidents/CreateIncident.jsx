import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { INCIDENT_TYPES } from '../../utils/constants';

const CreateIncident = () => {
    const [formData, setFormData] = useState({
        citizen_name: '',
        citizen_phone: '',
        incident_type: 'MEDICAL',
        location: '',
        notes: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTypeSelect = (type) => {
        setFormData(prev => ({ ...prev, incident_type: type }));
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col h-full bg-white dark:bg-background-dark border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm overflow-hidden"
        >
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-accent-red/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-accent-red">
                        priority_high
                    </span>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">New Incident</h3>
                    <p className="text-xs text-slate-500 font-medium">Input critical event details below</p>
                </div>
            </div>

            <form className="space-y-5 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[11px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1.5 ml-1">
                            <span className="material-symbols-outlined text-[14px]">person</span>
                            Caller Name
                        </label>
                        <input 
                            type="text" 
                            name="citizen_name"
                            value={formData.citizen_name}
                            onChange={handleChange}
                            placeholder="John Doe" 
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[11px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1.5 ml-1">
                            <span className="material-symbols-outlined text-[14px]">phone</span>
                            Contact ID
                        </label>
                        <input 
                            type="text" 
                            name="citizen_phone"
                            value={formData.citizen_phone}
                            onChange={handleChange}
                            placeholder="+233..." 
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[11px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1.5 ml-1">
                        <span className="material-symbols-outlined text-[14px]">emergency</span>
                        Classification
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                        {INCIDENT_TYPES.map((type) => (
                            <button
                                key={type.value}
                                type="button"
                                className={`py-2 px-1 rounded-lg border text-[10px] font-bold transition-all transition-transform active:scale-95 ${
                                    formData.incident_type === type.value 
                                    ? 'bg-primary border-primary text-white shadow-md' 
                                    : 'bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-slate-800'
                                }`}
                                onClick={() => handleTypeSelect(type.value)}
                            >
                                {type.value}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[11px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1.5 ml-1">
                        <span className="material-symbols-outlined text-[14px]">location_on</span>
                        Geo-Descriptor
                    </label>
                    <input 
                        type="text" 
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="e.g., Independence Square, Accra" 
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-[11px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1.5 ml-1">
                        <span className="material-symbols-outlined text-[14px]">description</span>
                        Situational Intel
                    </label>
                    <textarea 
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows={3} 
                        placeholder="Provide essential details..." 
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all resize-none"
                    />
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all group mt-2"
                >
                    <span className="material-symbols-outlined group-hover:animate-pulse">send</span>
                    Dispatch Logic
                </button>
            </form>
        </motion.div>
    );
};

export default CreateIncident;
