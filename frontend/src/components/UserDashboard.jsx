import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    Search, 
    Leaf, 
    Zap, 
    History, 
    Clock, 
    Award, 
    BarChart3, 
    ArrowUpRight,
    Droplets,
    Wind,
    Trash2
} from 'lucide-react';
import axios from 'axios';

const UserDashboard = ({ userId }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const response = await axios.get(`https://eco-swap-thci.onrender.com/user/dashboard/${userId}`);
                setData(response.data);
            } catch (err) {
                console.error("Dashboard fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        if (userId) fetchDashboard();
    }, [userId]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[600px]">
            <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
                <Leaf className="w-12 h-12 text-eco-500" />
            </motion.div>
        </div>
    );

    if (!data) return <div className="text-center py-20 text-clay-500 font-bold uppercase tracking-widest">No data available</div>;

    return (
        <div className="p-6 md:p-12 max-w-7xl mx-auto space-y-12">
            {/* Header / Profile Summary */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                <div>
                    <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-clay-900 dark:text-white">
                        Your <span className="eco-text-gradient">Impact.</span>
                    </h1>
                    <p className="text-clay-500 dark:text-clay-400 font-bold text-lg mt-2 flex items-center gap-2">
                        Welcome back, {data.user.name} <span className="text-eco-600 font-black">@{data.user.username}</span>
                    </p>
                </div>
                <div className="flex items-center gap-6 bg-white/40 dark:bg-white/5 backdrop-blur-xl p-6 rounded-[32px] border border-clay-100 dark:border-white/10 shadow-xl">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-eco-500 to-eco-700 flex items-center justify-center text-4xl shadow-lg ring-4 ring-eco-500/20">
                        {data.stats.badge_icon}
                    </div>
                    <div>
                        <div className="text-xs font-black text-clay-400 uppercase tracking-[4px]">Badge Level</div>
                        <div className="text-2xl font-black italic uppercase text-clay-900 dark:text-white tracking-tight">{data.stats.badge_name}</div>
                        <div className="text-eco-600 font-bold text-sm">Level {data.stats.eco_level}</div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    icon={<Search className="w-5 h-5" />} 
                    label="Total Searches" 
                    value={data.stats.total_searches} 
                    color="text-blue-500"
                />
                <StatCard 
                    icon={<Leaf className="w-5 h-5" />} 
                    label="Eco Transformation" 
                    value={`${data.stats.eco_transformation_score.toFixed(1)}%`}
                    color="text-eco-600"
                />
                <StatCard 
                    icon={<Award className="w-5 h-5" />} 
                    label="Impact Score" 
                    value={data.stats.points} 
                    color="text-orange-500"
                />
                <StatCard 
                    icon={<Zap className="w-5 h-5" />} 
                    label="Eco Swaps" 
                    value={data.stats.eco_swaps_count} 
                    color="text-purple-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Recent Searches & Sessions */}
                <div className="lg:col-span-2 space-y-12">
                    {/* Searches Section */}
                    <section className="glass-morphism rounded-[48px] overflow-hidden border-clay-100 dark:border-white/5 bg-white/40 dark:bg-white/5 shadow-2xl">
                        <div className="p-10 border-b border-clay-100 dark:border-white/5 flex justify-between items-center">
                            <h3 className="text-2xl font-black italic uppercase tracking-tight flex items-center gap-3 text-clay-900 dark:text-white">
                                <History className="w-6 h-6 text-eco-600" /> Recent Activity
                            </h3>
                            <span className="text-[10px] font-black uppercase tracking-[3px] text-clay-400">Last 5 Searches</span>
                        </div>
                        <div className="divide-y divide-clay-100 dark:divide-white/5">
                            {data.recent_searches.map((search, i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="p-8 hover:bg-white/40 dark:hover:bg-white/5 transition-all flex justify-between items-center group"
                                >
                                    <div>
                                        <div className="text-lg font-black text-clay-900 dark:text-white mb-1 group-hover:text-eco-600 transition-colors uppercase italic">{search.search_query}</div>
                                        <div className="flex items-center gap-2 text-clay-500 font-bold text-xs uppercase tracking-widest">
                                            <span className="text-eco-600">Swap Idea:</span> {search.eco_alternative_suggested}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-black text-clay-400 uppercase tracking-widest flex items-center gap-2">
                                            <Clock className="w-3 h-3" />
                                            {new Date(search.timestamp).toLocaleDateString()}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </section>

                    {/* Login History */}
                    <section className="glass-morphism rounded-[48px] overflow-hidden border-clay-100 dark:border-white/5 bg-white/40 dark:bg-white/5">
                        <div className="p-10 border-b border-clay-100 dark:border-white/5">
                            <h3 className="text-2xl font-black italic uppercase tracking-tight flex items-center gap-3 text-clay-900 dark:text-white">
                                <BarChart3 className="w-6 h-6 text-orange-500" /> Session History
                            </h3>
                        </div>
                        <div className="p-10 overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-[10px] font-black uppercase tracking-[4px] text-clay-400 border-b border-clay-100 dark:border-white/5 pb-4">
                                        <th className="pb-6">Login Time</th>
                                        <th className="pb-6">Logout Time</th>
                                        <th className="pb-6 text-right">Duration</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-clay-100 dark:divide-white/5">
                                    {data.login_history.map((login, i) => (
                                        <tr key={i} className="text-sm font-bold text-clay-900 dark:text-white">
                                            <td className="py-6">{new Date(login.login_time).toLocaleString()}</td>
                                            <td className="py-6">{login.logout_time ? new Date(login.logout_time).toLocaleString() : 'Active'}</td>
                                            <td className="py-6 text-right font-black italic text-eco-600">
                                                {login.session_duration ? `${Math.floor(login.session_duration/60)}m ${login.session_duration%60}s` : '--'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>

                {/* Impact Summary Sidebar */}
                <div className="space-y-8">
                    <div className="bg-gradient-to-br from-eco-600 to-eco-800 rounded-[48px] p-10 text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all" />
                        <h4 className="text-xl font-black italic uppercase tracking-tight mb-8">Lifetime Savings</h4>
                        
                        <div className="space-y-8">
                            <ImpactItem icon={<Wind />} label="CO2 Reduced" value={`${data.impact.co2_saved} kg`} />
                            <ImpactItem icon={<Trash2 />} label="Plastic Saved" value={`${data.impact.plastic_saved} g`} />
                            <ImpactItem icon={<Droplets />} label="Water Conserved" value={`${data.impact.water_saved} L`} />
                        </div>
                    </div>

                    <div className="glass-morphism rounded-[48px] p-10 bg-white/40 dark:bg-white/5 border-clay-100 dark:border-white/5">
                        <h4 className="text-lg font-black italic uppercase tracking-tight mb-6 text-clay-900 dark:text-white">Pro Tip</h4>
                        <p className="text-clay-500 dark:text-clay-400 text-sm font-medium leading-relaxed italic">
                            "Searching for 'reusable' or 'bamboo' directly increases your Eco Transformation Score faster!" 🌿
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon, label, value, color }) => (
    <div className="glass-morphism p-8 rounded-[40px] bg-white dark:bg-white/5 border-clay-100 dark:border-white/5 flex flex-col items-start gap-4 hover:border-eco-200 dark:hover:border-white/10 transition-all group">
        <div className={`p-4 rounded-2xl bg-white dark:bg-black/20 shadow-sm ${color} group-hover:scale-110 transition-transform`}>
            {icon}
        </div>
        <div>
            <div className="text-[10px] font-black text-clay-400 uppercase tracking-[3px]">{label}</div>
            <div className="text-3xl font-black italic text-clay-900 dark:text-white tracking-tight">{value}</div>
        </div>
    </div>
);

const ImpactItem = ({ icon, label, value }) => (
    <div className="flex items-center gap-6">
        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white/80">
            {React.cloneElement(icon, { size: 24 })}
        </div>
        <div>
            <div className="text-[10px] font-bold text-white/60 uppercase tracking-widest">{label}</div>
            <div className="text-2xl font-black italic tracking-tight">{value}</div>
        </div>
    </div>
);

export default UserDashboard;
