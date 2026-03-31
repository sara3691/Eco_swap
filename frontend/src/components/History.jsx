import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History as HistoryIcon, Clock, Search, ArrowRight, Trash2, Loader2 } from 'lucide-react';
import axios from 'axios';

const History = ({ userId }) => {
    const [searchHistory, setSearchHistory] = useState([]);
    const [loginHistory, setLoginHistory] = useState([]);
    const [activeTab, setActiveTab] = useState('search');
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);

    const fetchHistory = async () => {
        try {
            const response = await axios.get(`https://eco-swap-thci.onrender.com/history/${userId}`);
            setSearchHistory(response.data.search_history || []);
            setLoginHistory(response.data.login_history || []);
        } catch (err) {
            console.error("History fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userId) fetchHistory();
    }, [userId]);

    const handleDelete = async (historyId) => {
        setDeletingId(historyId);
        try {
            await axios.delete(`https://eco-swap-thci.onrender.com/history/${historyId}`);
            setSearchHistory(prev => prev.filter(item => item.id !== historyId));
        } catch (err) {
            console.error("Error deleting history:", err);
            alert("Failed to delete history item.");
        } finally {
            setDeletingId(null);
        }
    };

    const formatDuration = (seconds) => {
        if (!seconds) return "Active Session";
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[600px] pt-32">
            <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
                <Loader2 className="w-12 h-12 text-eco-500" />
            </motion.div>
        </div>
    );

    return (
        <div className="page-bg-container">
            <div className="relative z-10 pt-24 md:pt-32 pb-16 md:pb-24 px-4 md:px-12 max-w-5xl mx-auto space-y-8 md:space-y-12">
                {/* Header */}
                <div className="flex flex-col items-center text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="glass-morphism rounded-[32px] md:rounded-[48px] overflow-hidden border-white/20 bg-white/60 dark:bg-black/40 shadow-2xl w-full"
                    >
                        <div className="p-6 md:p-10 border-b border-clay-100 dark:border-white/10 flex flex-col items-center gap-6">
                            <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4">
                                <HistoryIcon className="w-6 h-6 md:w-8 md:h-8 text-eco-600 dark:text-eco-400" />
                                <h1 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-clay-900 dark:text-white leading-tight">
                                    Your <span className="eco-text-gradient">Activity History</span>
                                </h1>
                            </div>
                            
                            {/* Tabs Selection */}
                            <div className="flex p-1 bg-clay-100/50 dark:bg-white/10 rounded-2xl w-full max-w-sm md:max-w-md">
                                <button 
                                    onClick={() => setActiveTab('search')}
                                    className={`flex-1 py-2.5 md:py-3 px-4 md:px-6 rounded-xl font-bold uppercase tracking-widest text-[10px] md:text-sm transition-all ${activeTab === 'search' ? 'bg-white dark:bg-clay-800 text-eco-600 shadow-lg scale-[1.02]' : 'text-clay-500 hover:text-clay-700'}`}
                                >
                                    Searches
                                </button>
                                <button 
                                    onClick={() => setActiveTab('login')}
                                    className={`flex-1 py-2.5 md:py-3 px-4 md:px-6 rounded-xl font-bold uppercase tracking-widest text-[10px] md:text-sm transition-all ${activeTab === 'login' ? 'bg-white dark:bg-clay-800 text-eco-600 shadow-lg scale-[1.02]' : 'text-clay-500 hover:text-clay-700'}`}
                                >
                                    Logins
                                </button>
                            </div>
                        </div>
                        
                        <div className="p-4 md:p-10">
                            <div className="divide-y divide-clay-100 dark:divide-white/10 text-left">
                                <AnimatePresence mode="wait">
                                    {activeTab === 'search' ? (
                                        <motion.div 
                                            key="search-list"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                        >
                                            {searchHistory.length === 0 ? (
                                                <div className="text-center py-20 text-clay-500 font-bold uppercase tracking-widest text-xs">
                                                    No search history available yet.
                                                </div>
                                            ) : (
                                                searchHistory.map((search, i) => (
                                                    <motion.div 
                                                        key={search.id || i}
                                                        layout
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        className="py-6 md:py-8 px-2 md:px-4 hover:bg-white/40 dark:hover:bg-white/5 transition-all flex flex-col md:flex-row justify-between items-start md:items-center group rounded-2xl relative gap-4"
                                                    >
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <Search className="w-4 h-4 text-clay-400 shrink-0" />
                                                                <span className="text-lg md:text-xl font-black text-clay-900 dark:text-white group-hover:text-eco-600 transition-colors uppercase italic leading-tight">
                                                                    {search.search_query}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-start gap-2 text-clay-500 font-bold text-[10px] md:text-sm uppercase tracking-widest pl-7">
                                                                <ArrowRight className="w-3 h-3 text-eco-600 shrink-0 mt-0.5" />
                                                                <span className="text-eco-600 shrink-0">AI Swap:</span> {search.eco_alternative_suggested}
                                                            </div>
                                                        </div>
                                                        <div className="text-right pl-7 md:pl-0 w-full md:w-auto flex flex-row md:flex-col justify-between md:justify-center items-center md:items-end gap-3">
                                                            <div className="text-[10px] md:text-xs font-black text-clay-400 uppercase tracking-widest flex items-center justify-start md:justify-end gap-2">
                                                                <Clock className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                                                {new Date(search.timestamp).toLocaleDateString(undefined, {
                                                                    month: 'short', day: 'numeric', 
                                                                    hour: '2-digit', minute:'2-digit'
                                                                })}
                                                            </div>
                                                            <button 
                                                                onClick={() => handleDelete(search.id)}
                                                                disabled={deletingId === search.id}
                                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 transition-all border border-red-100 dark:border-red-500/20 text-[9px] md:text-[10px] font-black uppercase tracking-widest"
                                                            >
                                                                {deletingId === search.id ? <Loader2 className="w-3 h-3 md:w-3.5 md:h-3.5 animate-spin" /> : <Trash2 className="w-3 h-3 md:w-3.5 md:h-3.5" />}
                                                                <span>Delete</span>
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                ))
                                            )}
                                        </motion.div>

                                    ) : (
                                        <motion.div 
                                            key="login-list"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                        >
                                            {loginHistory.length === 0 ? (
                                                <div className="text-center py-20 text-clay-500 font-bold uppercase tracking-widest">
                                                    No login history available yet.
                                                </div>
                                            ) : (
                                                loginHistory.map((login, i) => (
                                                    <motion.div 
                                                        key={login.id || i}
                                                        layout
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        className="py-8 px-4 hover:bg-white/40 dark:hover:bg-white/5 transition-all flex flex-col md:flex-row justify-between items-start md:items-center group rounded-2xl relative"
                                                    >
                                                        <div className="mb-4 md:mb-0">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <Clock className="w-4 h-4 text-eco-500" />
                                                                <span className="text-xl font-black text-clay-900 dark:text-white uppercase italic">
                                                                    Login: {new Date(login.login_time).toLocaleString()}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-clay-500 font-bold text-sm uppercase tracking-widest pl-7">
                                                                <span className="text-clay-400">Duration:</span> {formatDuration(login.session_duration)}
                                                            </div>
                                                        </div>
                                                        <div className="text-right pl-7 md:pl-0 w-full md:w-auto flex flex-col items-end">
                                                            {login.logout_time ? (
                                                                <div className="text-xs font-black text-clay-400 uppercase tracking-widest">
                                                                    Logout: {new Date(login.logout_time).toLocaleString()}
                                                                </div>
                                                            ) : (
                                                                <span className="px-3 py-1 bg-green-50 dark:bg-green-500/10 text-green-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100 dark:border-green-500/20 animate-pulse">
                                                                    Current Session
                                                                </span>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                ))
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default History;
