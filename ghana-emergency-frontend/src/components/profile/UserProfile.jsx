import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { userService } from '../../services/userService';

const UserProfile = () => {
    const { user, logout } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await userService.getProfile();
                setProfile(data);
                setFormData({
                    name: data.name || user?.name || '',
                    email: data.email || user?.email || '',
                    phone: data.phone || '',
                });
            } catch (error) {
                console.error("Profile Fetch Error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setUpdating(true);
        try {
            await userService.updateProfile(formData);
            alert('Security clearance credentials updated successfully.');
        } catch (error) {
            console.error("Update Error:", error);
            alert('Failed to update node credentials.');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return (
        <div className="flex h-screen w-full items-center justify-center bg-background-light dark:bg-background-dark">
            <span className="material-symbols-outlined text-4xl text-primary animate-spin">refresh</span>
        </div>
    );

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark p-8 lg:p-20 font-display transition-colors">
            <header className="max-w-4xl mx-auto mb-16 flex items-center justify-between">
                <div>
                   <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic underline decoration-primary/30 decoration-4 underline-offset-12">Operator Profile</h2>
                   <p className="text-slate-500 text-xs font-bold tracking-widest uppercase mt-4">Node: {user?.role || 'SYSTEM_ADMIN'} / ID: {user?.id || 'GH-001'}</p>
                </div>
                <button 
                    onClick={() => window.history.back()}
                    className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-all p-4 bg-white dark:bg-slate-900 rounded-[28px] shadow-sm border border-slate-100 dark:border-slate-800"
                >
                    <span className="material-symbols-outlined text-lg">arrow_back</span>
                    Exit Vault
                </button>
            </header>

            <main className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Left Side: Identity */}
                <aside className="lg:col-span-1 space-y-8">
                    <div className="bg-white dark:bg-slate-900 rounded-[56px] p-10 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                             <span className="material-symbols-outlined text-[100px]">verified_user</span>
                        </div>
                        
                        <div className="w-24 h-24 rounded-[36px] bg-primary/10 flex items-center justify-center text-primary font-black text-4xl mb-8 border border-primary/20 shadow-inner">
                             {formData.name?.[0] || 'O'}
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic">{formData.name}</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-10 italic">NCDC Certified Operator</p>
                        
                        <div className="space-y-6 pt-8 border-t border-slate-100 dark:border-slate-800">
                             <div className="flex justify-between items-center opacity-70">
                                 <span className="text-[10px] font-black uppercase tracking-widest">Clearance</span>
                                 <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Tier 1</span>
                             </div>
                             <div className="flex justify-between items-center opacity-70">
                                 <span className="text-[10px] font-black uppercase tracking-widest">Duty Status</span>
                                 <span className="text-[10px] font-black uppercase tracking-widest text-primary">Active</span>
                             </div>
                        </div>
                    </div>

                    <button 
                        onClick={logout}
                        className="w-full py-5 bg-rose-500 text-white rounded-[32px] text-[10px] font-black tracking-[0.3em] uppercase italic flex items-center justify-center gap-4 hover:bg-rose-600 transition-all shadow-xl shadow-rose-500/20"
                    >
                        <span className="material-symbols-outlined text-lg">logout</span>
                        Retire Authority
                    </button>
                </aside>

                {/* Right Side: Configuration */}
                <section className="lg:col-span-2">
                    <form onSubmit={handleUpdate} className="bg-white dark:bg-slate-900 rounded-[64px] p-12 lg:p-16 border border-slate-200 dark:border-slate-800 shadow-sm space-y-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic px-2">Display Identity</label>
                                <input 
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800/80 rounded-[28px] px-8 py-5 text-sm font-bold text-slate-900 dark:text-white focus:border-primary outline-none transition-all shadow-inner"
                                    required
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic px-2">Secure Link (Email)</label>
                                <input 
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800/80 rounded-[28px] px-8 py-5 text-sm font-bold text-slate-900 dark:text-white focus:border-primary outline-none transition-all shadow-inner"
                                    required
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic px-2">Telecom Link</label>
                                <input 
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800/80 rounded-[28px] px-8 py-5 text-sm font-bold text-slate-900 dark:text-white focus:border-primary outline-none transition-all shadow-inner"
                                    placeholder="+233 XX XXX XXXX"
                                />
                            </div>
                        </div>

                        <div className="pt-12 border-t border-slate-100 dark:border-slate-800">
                             <div className="flex items-center gap-4 mb-10">
                                 <span className="material-symbols-outlined text-primary">key</span>
                                 <h4 className="text-lg font-black text-slate-900 dark:text-white tracking-tight uppercase italic underline decoration-blue-500/20 underline-offset-4">Security Protocol Update</h4>
                             </div>
                             
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-3 opacity-60 pointer-events-none">
                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic px-2">Access Key Override</label>
                                    <input 
                                        type="password"
                                        placeholder="••••••••••••"
                                        className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-[28px] px-8 py-5 text-sm font-bold text-slate-900 dark:text-white"
                                    />
                                </div>
                                <div className="flex items-center">
                                     <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed italic pr-4">Manual credential override requires Sector Authority approval. Multi-regional sync will be temporarily throttled during re-entry.</p>
                                </div>
                             </div>
                        </div>

                        <button 
                            type="submit"
                            disabled={updating}
                            className={`w-full py-6 mt-16 bg-slate-900 dark:bg-slate-800 text-white rounded-[32px] text-[10px] font-black tracking-[0.3em] uppercase italic flex items-center justify-center gap-4 transition-all shadow-2xl hover:bg-primary ${updating ? 'opacity-50' : 'hover:-translate-y-1'}`}
                        >
                            {updating ? <span className="material-symbols-outlined animate-spin">refresh</span> : 'Synchronize Node Metadata'}
                        </button>
                    </form>
                </section>
            </main>
        </div>
    );
};

export default UserProfile;
