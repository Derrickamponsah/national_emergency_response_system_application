import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import { SERVICES } from '../../services/api';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false,
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState('');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
        setApiError('');
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
        if (!formData.password) newErrors.password = 'Password is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        setApiError('');

        try {
            const response = await axios.post(`${SERVICES.AUTH}/auth/login`, {
                email: formData.email,
                password: formData.password,
            });

            const { access_token, user } = response.data;

            // ✅ FIX: Store token reliably
            if (!access_token) throw new Error('No token received from server');
            localStorage.setItem('token', access_token); // now guaranteed

            // Update global auth context
            login(access_token, user.role, user);

            // Remember email if requested
            if (formData.rememberMe) {
                localStorage.setItem('remembered_email', formData.email);
            } else {
                localStorage.removeItem('remembered_email');
            }

            // Redirect based on role
            const roleRoutes = {
                SYSTEM_ADMIN: '/',
                HOSPITAL_ADMIN: '/hospital',
                POLICE_ADMIN: '/police',
                FIRE_ADMIN: '/fire',
            };

            navigate(roleRoutes[user.role] || '/');

        } catch (error) {
            console.error('Login error:', error);
            if (error.response) {
                setApiError(error.response.data.error || error.response.data.message || 'Login failed');
            } else if (error.request) {
                setApiError('Cannot connect to server. Please check your connection.');
            } else {
                setApiError('An unexpected error occurred. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    // ✅ Pre-fill remembered email
    useEffect(() => {
        const rememberedEmail = localStorage.getItem('remembered_email');
        if (rememberedEmail) {
            setFormData(prev => ({ ...prev, email: rememberedEmail, rememberMe: true }));
        }
    }, []);

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex flex-col font-display">
            <div className="layout-container flex h-full grow flex-col">
                {/* Header */}
                <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 md:px-20 py-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary rounded-lg text-white">
                            <span className="material-symbols-outlined text-2xl">account_balance</span>
                        </div>
                        <div>
                            <h1 className="text-primary dark:text-slate-100 text-xl font-black uppercase tracking-tight">
                                Ghana Emergency Response System
                            </h1>
                            <p className="text-[10px] font-bold text-primary/60 dark:text-primary/40 leading-none">
                                Emergency Management Division
                            </p>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600 dark:text-slate-400">
                        <a className="hover:text-primary" href="#">
                            System Status: <span className="text-emerald-500">Operational</span>
                        </a>
                        <a className="hover:text-primary text-slate-400" href="#">Help Desk</a>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 flex items-center justify-center p-6 bg-slate-50 dark:bg-background-dark relative overflow-hidden">
                    <div
                        className="absolute inset-0 opacity-[0.03] pointer-events-none"
                        style={{
                            backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBurYXwFs0KKe_THT4E5Zje-mqrB8NWXpyz-5qBOTV1iz1P_C9iLgmYy-QleM16NWb7bN9BCUpnuK7iLtUTMmPqh9vOBSh_gqvOSnyerAA67bUy9E-H7FzjTO5TFcgSl2npg5SURTm9Aj9zwTpnMJPlMFtjY0TbKHhJ_Oz49CHj0NIl0JP-blDFJm0DxVG5hPa-jcSf2_QzO7Hl4P32oYxjd7iC6vaiqMCWX-z60Ou0OCI5VBtxTtBblhp51oZ8fC31btO-qHw9ics")'
                        }}
                    />

                    <div className="w-full max-w-[480px] bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10">
                        <div className="p-8 md:p-12">
                            <div className="mb-10">
                                <h2 className="text-slate-900 dark:text-slate-100 text-3xl font-black leading-tight tracking-tight">
                                    Personnel Login
                                </h2>
                                <div className="h-1 w-12 bg-primary mt-2"></div>
                                <p className="text-slate-500 dark:text-slate-400 text-sm mt-4 font-medium uppercase tracking-wider">
                                    Secure Access Point
                                </p>
                            </div>

                            {apiError && (
                                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
                                    <span className="material-symbols-outlined text-red-500 text-xl">error</span>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-red-800 dark:text-red-200">
                                            Authentication Failed
                                        </p>
                                        <p className="text-xs text-red-600 dark:text-red-300 mt-1">
                                            {apiError}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-widest px-1">
                                        Email Address
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors">
                                                mail
                                            </span>
                                        </div>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className={`block w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border ${errors.email
                                                ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500'
                                                : 'border-slate-200 dark:border-slate-700 focus:ring-primary/20 focus:border-primary'
                                                } rounded-lg focus:ring-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 transition-all outline-none`}
                                            placeholder="name@ghana911.gov.gh"
                                            disabled={loading}
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="text-xs text-red-500 px-1 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-sm">warning</span>
                                            {errors.email}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-widest px-1">
                                        Security Credentials
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors">
                                                lock
                                            </span>
                                        </div>
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className={`block w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border ${errors.password
                                                ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500'
                                                : 'border-slate-200 dark:border-slate-700 focus:ring-primary/20 focus:border-primary'
                                                } rounded-lg focus:ring-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 transition-all outline-none`}
                                            placeholder="Enter account password"
                                            disabled={loading}
                                        />
                                    </div>
                                    {errors.password && (
                                        <p className="text-xs text-red-500 px-1 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-sm">warning</span>
                                            {errors.password}
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center justify-between py-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="rememberMe"
                                            checked={formData.rememberMe}
                                            onChange={handleChange}
                                            className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
                                            disabled={loading}
                                        />
                                        <span className="text-sm text-slate-600 dark:text-slate-400">
                                            Remember Station
                                        </span>
                                    </label>
                                    <Link to="/forgot-password" className="text-sm font-semibold text-primary hover:underline">
                                        Reset Credentials
                                    </Link>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex items-center justify-center gap-3 bg-primary hover:bg-primary/90 text-white font-bold py-4 px-6 rounded-lg transition-all shadow-lg shadow-primary/20 group disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                            <span>AUTHENTICATING...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>AUTHORIZE ACCESS</span>
                                            <span className="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform">
                                                verified_user
                                            </span>
                                        </>
                                    )}
                                </button>

                                <div className="text-center pt-4">
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        New personnel?{' '}
                                        <Link
                                            to="/register"
                                            className="font-semibold text-primary hover:underline"
                                        >
                                            Request Access Credentials
                                        </Link>
                                    </p>
                                </div>
                            </form>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-800/50 p-6 border-t border-slate-200 dark:border-slate-800 flex items-center gap-4">
                            <span className="material-symbols-outlined text-amber-500 animate-pulse">info</span>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                                UNAUTHORIZED ACCESS IS PROHIBITED. All activity is logged and monitored under federal cybersecurity directive 44-B.
                            </p>
                        </div>
                    </div>
                </main>

                <footer className="bg-primary h-12 flex items-center overflow-hidden border-t-4 border-amber-500">
                    <div className="bg-amber-500 px-6 h-full flex items-center font-black text-primary text-xs tracking-tighter shrink-0 z-20">
                        EMERGENCY BROADCAST
                    </div>
                    <div className="ticker-scroll whitespace-nowrap text-white font-medium text-sm flex gap-12 items-center">
                        <span className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-red-500"></span>
                            SEVERE WEATHER ALERT: COASTAL REGION SECTOR 4 - EVACUATION ADVISORY IN EFFECT
                        </span>
                        <span className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                            RESOURCE DEPLOYMENT: MULTI-AGENCY DRILL SCHEDULED FOR 14:00 EST
                        </span>
                        <span className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-blue-400"></span>
                            SYSTEM UPDATE: CLOUD INFRASTRUCTURE UPGRADED TO NODE V12.4
                        </span>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default Login;