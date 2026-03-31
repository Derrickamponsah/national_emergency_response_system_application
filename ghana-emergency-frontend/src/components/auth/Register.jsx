import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { SERVICES } from '../../services/api';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: '',
        password: '',
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
        setApiError('');
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Full name is required';
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }
        if (!formData.role) newErrors.role = 'Please select a command role';
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        setApiError('');

        try {
            await axios.post(`${SERVICES.AUTH}/auth/register`, {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: formData.role,
            });

            // Redirect to login after successful registration
            navigate('/login');
        } catch (error) {
            console.error('Registration error:', error);
            if (error.response) {
                setApiError(error.response.data.error || error.response.data.message || 'Registration failed');
            } else if (error.request) {
                setApiError('Cannot connect to server. Please check your connection.');
            } else {
                setApiError('An unexpected error occurred. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full items-center justify-center p-6 bg-background-light dark:bg-background-dark overflow-hidden relative font-display">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent-red/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />

            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl shadow-primary/10 overflow-hidden relative z-10 grid grid-cols-1 md:grid-cols-2 border border-slate-100 dark:border-slate-800"
            >
                {/* Branding Sidebar */}
                <div className="bg-primary p-12 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 shadow-xl">
                            <span className="material-symbols-outlined text-4xl">shield_person</span>
                        </div>
                        <h1 className="text-4xl font-bold leading-tight mb-6">Join the Operational Network</h1>
                        <p className="text-primary-light text-sm leading-relaxed opacity-90 max-w-xs">
                            Register your command station. Access real-time dispatching, fleet management, and regional analytics across Ghana.
                        </p>
                    </div>

                    <div className="relative z-10 pt-12 border-t border-white/10 space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                                <span className="material-symbols-outlined text-sm">security</span>
                            </div>
                            <p className="text-xs text-white/60 font-medium leading-relaxed italic">
                                Registration is strictly restricted to authorized first responders and certified administrative units.
                            </p>
                        </div>
                        
                        <Link to="/login" className="inline-flex items-center gap-2 text-sm font-bold hover:gap-3 transition-all group">
                            <span className="material-symbols-outlined text-xl rotate-180">arrow_forward</span>
                            Back to Command Portal
                        </Link>
                    </div>

                    {/* Decorative pattern */}
                    <div className="absolute bottom-[-10%] right-[-10%] opacity-10 pointer-events-none">
                        <span className="material-symbols-outlined text-[300px]">emergency</span>
                    </div>
                </div>

                {/* Form Section */}
                <div className="p-12 lg:p-16">
                    <header className="mb-10 text-center md:text-left">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Create Account</h2>
                        <p className="text-slate-500 text-sm font-medium">Please enter your authorized credentials</p>
                    </header>

                    {apiError && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
                            <span className="material-symbols-outlined text-red-500 text-xl">error</span>
                            <p className="text-sm text-red-700 dark:text-red-300 font-medium">{apiError}</p>
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* Full Name */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Full Name</label>
                            <div className="relative group">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors text-xl">person</span>
                                <input 
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Admin Name" 
                                    disabled={loading}
                                    className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border ${errors.name ? 'border-red-500' : 'border-slate-100 dark:border-slate-800'} rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none text-sm font-medium placeholder:text-slate-400 text-slate-900 dark:text-white`}
                                />
                            </div>
                            {errors.name && <p className="text-xs text-red-500 px-1">{errors.name}</p>}
                        </div>

                        {/* Email */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Email Address</label>
                            <div className="relative group">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors text-xl">mail</span>
                                <input 
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="admin@gov.gh" 
                                    disabled={loading}
                                    className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border ${errors.email ? 'border-red-500' : 'border-slate-100 dark:border-slate-800'} rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none text-sm font-medium placeholder:text-slate-400 text-slate-900 dark:text-white`}
                                />
                            </div>
                            {errors.email && <p className="text-xs text-red-500 px-1">{errors.email}</p>}
                        </div>

                        {/* Station Role */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Station Role</label>
                            <div className="relative group">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors text-xl">account_tree</span>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    disabled={loading}
                                    className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border ${errors.role ? 'border-red-500' : 'border-slate-100 dark:border-slate-800'} rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none text-sm font-medium text-slate-400 appearance-none`}
                                >
                                    <option value="">Select Command Role</option>
                                    <option value="HOSPITAL_ADMIN">Hospital Admin</option>
                                    <option value="POLICE_ADMIN">Police Station Admin</option>
                                    <option value="FIRE_ADMIN">Fire Service Admin</option>
                                    <option value="SYSTEM_ADMIN">System Administrator</option>
                                </select>
                                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
                            </div>
                            {errors.role && <p className="text-xs text-red-500 px-1">{errors.role}</p>}
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Secure Password</label>
                            <div className="relative group">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors text-xl">lock</span>
                                <input 
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••" 
                                    disabled={loading}
                                    className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border ${errors.password ? 'border-red-500' : 'border-slate-100 dark:border-slate-800'} rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none text-sm font-medium placeholder:text-slate-400 text-slate-900 dark:text-white`}
                                />
                            </div>
                            {errors.password && <p className="text-xs text-red-500 px-1">{errors.password}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary/95 text-white font-bold py-4 rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3 mt-8 hover:translate-y-[-2px] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                    <span>ENROLLING...</span>
                                </>
                            ) : (
                                <>
                                    Initiate Enrollment
                                    <span className="material-symbols-outlined">how_to_reg</span>
                                </>
                            )}
                        </button>
                    </form>

                    <footer className="mt-8 text-center">
                        <p className="text-slate-500 text-sm font-medium italic">
                            Already part of the grid? <Link to="/login" className="text-primary font-bold hover:underline">Sign In</Link>
                        </p>
                    </footer>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;