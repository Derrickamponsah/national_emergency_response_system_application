import React, { useState } from 'react';
import { motion } from 'framer-motion';

const SupplyAudit = () => {
    const [category, setCategory] = useState('ALL');

    const supplies = [
        { id: 1, name: 'Surgical Gloves (Box)', category: 'PPE', stock: 245, minStock: 100, unit: 'boxes', lastRestocked: '2026-03-25', expiry: '2027-06-15' },
        { id: 2, name: 'IV Fluid (Normal Saline)', category: 'FLUIDS', stock: 38, minStock: 50, unit: 'bags', lastRestocked: '2026-03-20', expiry: '2027-01-10' },
        { id: 3, name: 'Oxygen Cylinders', category: 'CRITICAL', stock: 12, minStock: 20, unit: 'units', lastRestocked: '2026-03-22', expiry: 'N/A' },
        { id: 4, name: 'Morphine 10mg Vials', category: 'PHARMA', stock: 85, minStock: 30, unit: 'vials', lastRestocked: '2026-03-26', expiry: '2027-09-01' },
        { id: 5, name: 'Bandage Rolls (Sterile)', category: 'PPE', stock: 320, minStock: 100, unit: 'rolls', lastRestocked: '2026-03-24', expiry: '2028-03-01' },
        { id: 6, name: 'Blood Units (O+)', category: 'CRITICAL', stock: 8, minStock: 15, unit: 'units', lastRestocked: '2026-03-27', expiry: '2026-04-10' },
        { id: 7, name: 'Syringes (10ml)', category: 'CONSUMABLES', stock: 500, minStock: 200, unit: 'pcs', lastRestocked: '2026-03-23', expiry: '2028-01-01' },
        { id: 8, name: 'Defibrillator Pads', category: 'CRITICAL', stock: 6, minStock: 10, unit: 'sets', lastRestocked: '2026-03-18', expiry: '2027-05-20' },
    ];

    const categories = ['ALL', ...new Set(supplies.map(s => s.category))];
    const filtered = category === 'ALL' ? supplies : supplies.filter(s => s.category === category);
    const lowStock = supplies.filter(s => s.stock < s.minStock);

    return (
        <div>
            <header className="mb-12">
                <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">Supply Audit</h2>
                <div className="flex items-center gap-2 mt-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    <p className="text-slate-500 text-xs font-bold tracking-widest uppercase">Inventory & Restocking Monitor</p>
                </div>
            </header>

            {/* Alert Banner */}
            {lowStock.length > 0 && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-[24px] p-6 mb-10 flex items-center gap-4">
                    <span className="material-symbols-outlined text-rose-500 text-3xl">warning</span>
                    <div>
                        <p className="font-black text-rose-700 dark:text-rose-400 text-sm">{lowStock.length} items below minimum stock level</p>
                        <p className="text-xs text-rose-500">{lowStock.map(s => s.name).join(', ')}</p>
                    </div>
                </motion.div>
            )}

            {/* Summary Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                {[{ label: 'Total Items', value: supplies.length, icon: 'inventory_2', color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' }, { label: 'Low Stock', value: lowStock.length, icon: 'trending_down', color: 'text-rose-500 bg-rose-50 dark:bg-rose-900/20' }, { label: 'Categories', value: categories.length - 1, icon: 'category', color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20' }, { label: 'Adequate', value: supplies.length - lowStock.length, icon: 'check_circle', color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' }].map((s, i) => (
                    <div key={i} className={`${s.color} p-6 rounded-[24px] flex items-center gap-4`}>
                        <span className="material-symbols-outlined text-3xl">{s.icon}</span>
                        <div>
                            <p className="text-2xl font-black">{s.value}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-70">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-3 mb-8">
                {categories.map(c => (
                    <button key={c} onClick={() => setCategory(c)} className={`px-5 py-2.5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all ${category === c ? 'bg-medical-main text-white shadow-lg' : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'}`}>{c}</button>
                ))}
            </div>

            {/* Supply Table */}
            <div className="bg-white dark:bg-slate-900 rounded-[28px] border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-800">
                                {['Item', 'Category', 'Stock', 'Min Required', 'Status', 'Last Restocked'].map(h => (
                                    <th key={h} className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((s, i) => (
                                <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                    <td className="px-6 py-5 font-bold text-sm text-slate-900 dark:text-white">{s.name}</td>
                                    <td className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">{s.category}</td>
                                    <td className="px-6 py-5 font-black text-sm text-slate-900 dark:text-white">{s.stock} <span className="text-slate-400 text-xs font-normal">{s.unit}</span></td>
                                    <td className="px-6 py-5 text-sm text-slate-500">{s.minStock}</td>
                                    <td className="px-6 py-5">
                                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${s.stock >= s.minStock ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30' : 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 animate-pulse'}`}>
                                            {s.stock >= s.minStock ? 'ADEQUATE' : 'LOW STOCK'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-xs text-slate-400">{s.lastRestocked}</td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SupplyAudit;
