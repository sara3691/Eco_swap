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
        <div className="p-4 md:p-12 max-w-7xl mx-auto space-y-8 md:space-y-12">
            {/* Header / Profile Summary */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-8">
                <div>
                    <h1 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter text-clay-900 dark:text-white leading-tight">
                        Your <span className="eco-text-gradient">Impact.</span>
                    </h1>
                    <p className="text-clay-500 dark:text-clay-400 font-bold text-base md:text-lg mt-2 flex flex-wrap items-center gap-2">
                        Welcome back, {data.user.name} <span className="text-eco-600 font-black">@{data.user.username}</span>
                    </p>
                </div>
                <div className="flex items-center gap-4 md:gap-6 bg-white/40 dark:bg-white/5 backdrop-blur-xl p-4 md:p-6 rounded-2xl md:rounded-[32px] border border-clay-100 dark:border-white/10 shadow-xl w-full md:w-auto">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl md:rounded-2xl bg-gradient-to-br from-eco-500 to-eco-700 flex items-center justify-center text-3xl md:text-4xl shadow-lg ring-4 ring-eco-500/20 shrink-0">
                        {data.stats.badge_icon}
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-clay-400 uppercase tracking-[2px] md:tracking-[4px]">Badge Level</div>
                        <div className="text-xl md:text-2xl font-black italic uppercase text-clay-900 dark:text-white tracking-tight">{data.stats.badge_name}</div>
                        <div className="text-eco-600 font-bold text-xs md:text-sm">Level {data.stats.eco_level}</div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <StatCard 
                    icon={<Search className="w-4 h-4 md:w-5 md:h-5" />} 
                    label="Total Searches" 
                    value={data.stats.total_searches} 
                    color="text-blue-500"
                />
                <StatCard 
                    icon={<Leaf className="w-4 h-4 md:w-5 md:h-5" />} 
                    label="Eco Transformation" 
                    value={`${data.stats.eco_transformation_score.toFixed(1)}%`}
                    color="text-eco-600"
                />
                <StatCard 
                    icon={<Award className="w-4 h-4 md:w-5 md:h-5" />} 
                    label="Impact Score" 
                    value={data.stats.points} 
                    color="text-orange-500"
                />
                <StatCard 
                    icon={<Zap className="w-4 h-4 md:w-5 md:h-5" />} 
                    label="Eco Swaps" 
                    value={data.stats.eco_swaps_count} 
                    color="text-purple-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
                {/* Recent Searches & Sessions */}
                <div className="lg:col-span-2 space-y-8 md:space-y-12">
                    {/* Searches Section */}
                    <section className="glass-morphism rounded-[32px] md:rounded-[48px] overflow-hidden border-clay-100 dark:border-white/5 bg-white/40 dark:bg-white/5 shadow-2xl">
                        <div className="p-6 md:p-10 border-b border-clay-100 dark:border-white/5 flex justify-between items-center">
                            <h3 className="text-xl md:text-2xl font-black italic uppercase tracking-tight flex items-center gap-3 text-clay-900 dark:text-white">
                                <History className="w-5 h-5 md:w-6 md:h-6 text-eco-600" /> Recent Activity
                            </h3>
                            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[2px] md:tracking-[3px] text-clay-400">Recent</span>
                        </div>
                        <div className="divide-y divide-clay-100 dark:divide-white/5 px-2">
                            {data.recent_searches.map((search, i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="p-5 md:p-8 hover:bg-white/40 dark:hover:bg-white/5 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group"
                                >
                                    <div className="flex-1">
                                        <div className="text-base md:text-lg font-black text-clay-900 dark:text-white mb-1 group-hover:text-eco-600 transition-colors uppercase italic leading-tight">{search.search_query}</div>
                                        <div className="flex items-center gap-2 text-clay-500 font-bold text-[10px] md:text-xs uppercase tracking-widest">
                                            <span className="text-eco-600 shrink-0">Swap:</span> {search.eco_alternative_suggested}
                                        </div>
                                    </div>
                                    <div className="text-right sm:shrink-0">
                                        <div className="text-[10px] font-black text-clay-400 uppercase tracking-widest flex items-center gap-2">
                                            <Clock className="w-3 h-3" />
                                            {new Date(search.timestamp).toLocaleDateString()}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </section>

                    {/* Login History */}
                    <section className="glass-morphism rounded-[32px] md:rounded-[48px] overflow-hidden border-clay-100 dark:border-white/5 bg-white/40 dark:bg-white/5 shadow-2xl">
                        <div className="p-6 md:p-10 border-b border-clay-100 dark:border-white/5">
                            <h3 className="text-xl md:text-2xl font-black italic uppercase tracking-tight flex items-center gap-3 text-clay-900 dark:text-white">
                                <BarChart3 className="w-5 h-5 md:w-6 md:h-6 text-orange-500" /> Sessions
                            </h3>
                        </div>
                        <div className="p-4 md:p-10 overflow-x-auto">
                            <table className="w-full text-left min-w-[500px]">
                                <thead>
                                    <tr className="text-[9px] md:text-[10px] font-black uppercase tracking-[2px] md:tracking-[4px] text-clay-400 border-b border-clay-100 dark:border-white/5 pb-4">
                                        <th className="pb-4 md:pb-6">Login</th>
                                        <th className="pb-4 md:pb-6">Logout</th>
                                        <th className="pb-4 md:pb-6 text-right">Duration</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-clay-100 dark:divide-white/5">
                                    {data.login_history.map((login, i) => (
                                        <tr key={i} className="text-xs md:text-sm font-bold text-clay-900 dark:text-white">
                                            <td className="py-4 md:py-6">{new Date(login.login_time).toLocaleString()}</td>
                                            <td className="py-4 md:py-6">{login.logout_time ? new Date(login.logout_time).toLocaleString() : 'Active'}</td>
                                            <td className="py-4 md:py-6 text-right font-black italic text-eco-600">
                                                {login.session_duration ? `${Math.floor(login.session_duration/60)}m` : '--'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>

                {/* Impact Summary Sidebar */}
                <div className="space-y-6 md:space-y-8">
                    <div className="bg-gradient-to-br from-eco-600 to-eco-800 rounded-[32px] md:rounded-[48px] p-8 md:p-10 text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all" />
                        <h4 className="text-lg md:text-xl font-black italic uppercase tracking-tight mb-6 md:mb-8">Lifetime Savings</h4>
                        
                        <div className="space-y-6 md:space-y-8">
                            <ImpactItem icon={<Wind />} label="CO2 Save" value={`${data.impact.co2_saved}kg`} />
                            <ImpactItem icon={<Trash2 />} label="Plastic Save" value={`${data.impact.plastic_saved}g`} />
                            <ImpactItem icon={<Droplets />} label="Water Save" value={`${data.impact.water_saved}L`} />
                        </div>
                    </div>

                    <div className="glass-morphism rounded-[32px] md:rounded-[48px] p-8 md:p-10 bg-white/40 dark:bg-white/5 border-clay-100 dark:border-white/5">
                        <h4 className="text-base md:text-lg font-black italic uppercase tracking-tight mb-4 md:mb-6 text-clay-900 dark:text-white">Pro Tip</h4>
                        <p className="text-xs md:text-sm text-clay-500 dark:text-clay-400 font-medium leading-relaxed italic">
                            "Searching for 'reusable' or 'bamboo' directly increases your Eco Transformation Score faster!" 🌿
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon, label, value, color }) => (
    <div className="glass-morphism p-5 md:p-8 rounded-2xl md:rounded-[40px] bg-white dark:bg-white/5 border-clay-100 dark:border-white/5 flex flex-col items-start gap-3 md:gap-4 hover:border-eco-200 dark:hover:border-white/10 transition-all group">
        <div className={`p-3 md:p-4 rounded-xl md:rounded-2xl bg-white dark:bg-black/20 shadow-sm ${color} group-hover:scale-110 transition-transform`}>
            {icon}
        </div>
        <div>
            <div className="text-[9px] md:text-[10px] font-black text-clay-400 uppercase tracking-[2px] md:tracking-[3px]">{label}</div>
            <div className="text-2xl md:text-3xl font-black italic text-clay-900 dark:text-white tracking-tight">{value}</div>
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
