import React, { useState } from 'react';
import { motion } from 'framer-motion';

const GearInventory = () => {
    const [category, setCategory] = useState('ALL');
    const gear = [
        { id: 1, name: 'Fire Hoses (50m)', category: 'HOSES', stock: 24, minStock: 10, condition: 'GOOD', lastInspected: '2026-03-25' },
        { id: 2, name: 'SCBA Units', category: 'BREATHING', stock: 18, minStock: 15, condition: 'GOOD', lastInspected: '2026-03-20' },
        { id: 3, name: 'Turnout Gear Sets', category: 'PPE', stock: 32, minStock: 25, condition: 'GOOD', lastInspected: '2026-03-22' },
        { id: 4, name: 'Halligan Bars', category: 'TOOLS', stock: 8, minStock: 6, condition: 'FAIR', lastInspected: '2026-03-15' },
        { id: 5, name: 'Thermal Cameras', category: 'TECH', stock: 3, minStock: 4, condition: 'GOOD', lastInspected: '2026-03-26' },
        { id: 6, name: 'Foam Concentrate (L)', category: 'CHEMICALS', stock: 450, minStock: 500, condition: 'N/A', lastInspected: '2026-03-18' },
        { id: 7, name: 'Portable Pumps', category: 'EQUIPMENT', stock: 6, minStock: 4, condition: 'GOOD', lastInspected: '2026-03-24' },
        { id: 8, name: 'Rescue Rope (100m)', category: 'TOOLS', stock: 12, minStock: 8, condition: 'GOOD', lastInspected: '2026-03-21' },
    ];
    const categories = ['ALL', ...new Set(gear.map(g => g.category))];
    const filtered = category === 'ALL' ? gear : gear.filter(g => g.category === category);
    const low = gear.filter(g => g.stock < g.minStock);

    return (
        <div>
            <header className="mb-12">
                <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">Gear Inventory</h2>
                <div className="flex items-center gap-2 mt-2"><span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" /><p className="text-slate-500 text-xs font-bold tracking-widest uppercase">Equipment & Supplies Monitor</p></div>
            </header>
            {low.length > 0 && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-[24px] p-6 mb-10 flex items-center gap-4">
                    <span className="material-symbols-outlined text-rose-500 text-3xl">warning</span>
                    <div><p className="font-black text-rose-700 dark:text-rose-400 text-sm">{low.length} items below minimum</p><p className="text-xs text-rose-500">{low.map(g => g.name).join(', ')}</p></div>
                </motion.div>
            )}
            <div className="flex flex-wrap gap-3 mb-8">
                {categories.map(c => (
                    <button key={c} onClick={() => setCategory(c)} className={`px-5 py-2.5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all ${category === c ? 'bg-fire-main text-white shadow-lg' : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'}`}>{c}</button>
                ))}
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-[28px] border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead><tr className="border-b border-slate-100 dark:border-slate-800">{['Item', 'Category', 'Stock', 'Min', 'Condition', 'Status', 'Inspected'].map(h => (<th key={h} className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">{h}</th>))}</tr></thead>
                        <tbody>
                            {filtered.map((g, i) => (
                                <motion.tr key={g.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                                    <td className="px-6 py-5 font-bold text-sm text-slate-900 dark:text-white">{g.name}</td>
                                    <td className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">{g.category}</td>
                                    <td className="px-6 py-5 font-black text-sm text-slate-900 dark:text-white">{g.stock}</td>
                                    <td className="px-6 py-5 text-sm text-slate-500">{g.minStock}</td>
                                    <td className="px-6 py-5"><span className={`text-[10px] font-black uppercase ${g.condition === 'GOOD' ? 'text-emerald-500' : g.condition === 'FAIR' ? 'text-amber-500' : 'text-slate-400'}`}>{g.condition}</span></td>
                                    <td className="px-6 py-5"><span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${g.stock >= g.minStock ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600 animate-pulse'}`}>{g.stock >= g.minStock ? 'OK' : 'LOW'}</span></td>
                                    <td className="px-6 py-5 text-xs text-slate-400">{g.lastInspected}</td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
export default GearInventory;
