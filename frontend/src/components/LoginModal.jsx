import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Sparkles, ArrowRight, Loader2, User, Mail, Lock, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

const LoginModal = ({ onLogin }) => {
    const [mode, setMode] = useState('login'); // 'login' or 'signup'
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        name: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validate = () => {
        if (!formData.email || !formData.password) return 'Email and password are required.';
        if (mode === 'signup' && !formData.username) return 'Username is required.';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) return 'Invalid email address.';
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const err = validate();
        if (err) {
            setError(err);
            return;
        }

        setLoading(true);
        setError('');
        try {
            const endpoint = mode === 'login' ? '/login' : '/signup';
            const response = await axios.post(`http://localhost:5000${endpoint}`, formData);
            
            if (mode === 'signup') {
                setSuccess(true);
                setTimeout(() => {
                    setMode('login');
                    setSuccess(false);
                }, 2000);
            } else {
                const { user, stats } = response.data;
                localStorage.setItem('ecoswap_user', JSON.stringify({ ...user, ...stats }));
                onLogin({ ...user, ...stats });
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Authentication failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            >
                <div className="absolute inset-0 bg-clay-950/80 backdrop-blur-md" />

                <motion.div
                    initial={{ scale: 0.85, opacity: 0, y: 40 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    className="relative w-full max-w-md z-10"
                >
                    <div className="bg-white dark:bg-clay-900 rounded-[40px] overflow-hidden shadow-[0_32px_80px_-12px_rgba(0,0,0,0.5)] border border-white/20">
                        {/* Header */}
                        <div className="relative bg-gradient-to-br from-eco-600 via-eco-500 to-eco-700 p-8 text-center">
                            <motion.div
                                animate={{ rotate: [0, 5, -5, 0] }}
                                transition={{ duration: 4, repeat: Infinity }}
                                className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-4"
                            >
                                <Leaf className="w-8 h-8 text-white" />
                            </motion.div>
                            <h2 className="text-2xl font-black text-white italic uppercase tracking-tight">
                                {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                            </h2>
                            <p className="text-white/70 text-sm font-medium">
                                {mode === 'login' ? 'Continue your eco journey' : 'Join the swap revolution'}
                            </p>
                        </div>

                        {/* Form */}
                        <div className="p-8">
                            {success ? (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.9 }} 
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center py-10"
                                >
                                    <CheckCircle2 className="w-16 h-16 text-eco-500 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold dark:text-white mb-2">Account Created!</h3>
                                    <p className="text-clay-500 dark:text-clay-400">Please login with your credentials.</p>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {mode === 'signup' && (
                                        <>
                                            <div className="relative">
                                                <User className="absolute left-4 top-4 w-5 h-5 text-clay-400" />
                                                <input
                                                    name="username"
                                                    value={formData.username}
                                                    onChange={handleChange}
                                                    placeholder="Username"
                                                    className="w-full bg-clay-50 dark:bg-white/5 border border-clay-200 dark:border-white/10 rounded-2xl pl-12 pr-5 py-3.5 text-sm font-bold focus:outline-none focus:border-eco-400 transition-all dark:text-white"
                                                />
                                            </div>
                                            <div className="relative">
                                                <Sparkles className="absolute left-4 top-4 w-5 h-5 text-clay-400" />
                                                <input
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    placeholder="Full Name (Optional)"
                                                    className="w-full bg-clay-50 dark:bg-white/5 border border-clay-200 dark:border-white/10 rounded-2xl pl-12 pr-5 py-3.5 text-sm font-bold focus:outline-none focus:border-eco-400 transition-all dark:text-white"
                                                />
                                            </div>
                                        </>
                                    )}
                                    
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-4 w-5 h-5 text-clay-400" />
                                        <input
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="Email Address"
                                            className="w-full bg-clay-50 dark:bg-white/5 border border-clay-200 dark:border-white/10 rounded-2xl pl-12 pr-5 py-3.5 text-sm font-bold focus:outline-none focus:border-eco-400 transition-all dark:text-white"
                                        />
                                    </div>

                                    <div className="relative">
                                        <Lock className="absolute left-4 top-4 w-5 h-5 text-clay-400" />
                                        <input
                                            name="password"
                                            type="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="Password"
                                            className="w-full bg-clay-50 dark:bg-white/5 border border-clay-200 dark:border-white/10 rounded-2xl pl-12 pr-5 py-3.5 text-sm font-bold focus:outline-none focus:border-eco-400 transition-all dark:text-white"
                                        />
                                    </div>

                                    {error && (
                                        <p className="text-red-500 text-xs font-bold text-center">{error}</p>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2 group"
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" /> {mode === 'login' ? 'Login Now' : 'Create Account'}</>}
                                    </button>

                                    <div className="text-center pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                                            className="text-xs font-black uppercase tracking-widest text-clay-400 hover:text-eco-600 transition-colors"
                                        >
                                            {mode === 'login' ? "New here? Join Now" : "Already have an account? Login"}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default LoginModal;
