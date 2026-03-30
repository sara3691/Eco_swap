import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Leaf, Droplets, Trash2, Wind,
    Trophy, Zap, Star, ArrowRight, MessageSquare,
    CheckCircle2, Flame, Award
} from 'lucide-react';
import axios from 'axios';

const EcoImpactCommunity = ({ userStats }) => {
    const [stats, setStats] = useState({
        total_swaps: 0,
        total_co2: 0,
        total_plastic_kg: 0,
        total_water_liters: 0
    });
    const [feed, setFeed] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCommunityData = async () => {
            try {
                const [statsRes, feedRes, leaderboardRes] = await Promise.all([
                    axios.get('https://eco-swap-thci.onrender.com/community/stats'),
                    axios.get('https://eco-swap-thci.onrender.com/community/feed'),
                    axios.get('https://eco-swap-thci.onrender.com/leaderboard')
                ]);
                setStats(statsRes.data);
                setFeed(feedRes.data);
                setLeaderboard(leaderboardRes.data.slice(0, 10));
            } catch (err) {
                console.error("Community Data Error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchCommunityData();
        const interval = setInterval(fetchCommunityData, 30000); // Update every 30s
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="page-bg-container">
            {/* Background Image - Aerial Forest */}
            <img
                src="https://images.unsplash.com/photo-1501854140801-50d01698950b?q=80&w=2560&auto=format&fit=crop"
                alt="Aerial Forest"
                className="page-bg-image"
            />
            <div className="page-bg-overlay" />

            <div className="relative z-10 py-24 px-6 max-w-7xl mx-auto space-y-20">
                {/* Header section */}
                <div className="text-center space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/95 dark:bg-clay-800/90 backdrop-blur-xl shadow-2xl border border-white/50 dark:border-white/10 text-eco-700 dark:text-eco-400 text-sm font-black uppercase tracking-[4px]"
                    >
                        <Users className="w-4 h-4" /> Live Community Impact
                    </motion.div>
                    <h2 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter text-white leading-none drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                        Healing the <br />
                        <span className="eco-text-gradient">World Together.</span>
                    </h2>
                    <p className="text-white/90 text-xl font-bold max-w-2xl mx-auto italic drop-shadow-md">
                        Join thousands of eco-warriors making real changes every day. Every swap counts.
                    </p>
                </div>

                {/* Impact Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <ImpactCard
                        icon={<RecycleIcon className="w-8 h-8 text-eco-500" />}
                        label="Total Swaps"
                        value={stats.total_swaps}
                        unit="Swaps"
                        color="eco"
                    />
                    <ImpactCard
                        icon={<Wind className="w-8 h-8 text-blue-500" />}
                        label="CO2 Reduced"
                        value={stats.total_co2}
                        unit="kg"
                        color="blue"
                    />
                    <ImpactCard
                        icon={<Trash2 className="w-8 h-8 text-orange-500" />}
                        label="Plastic Saved"
                        value={stats.total_plastic_kg}
                        unit="kg"
                        color="orange"
                    />
                    <ImpactCard
                        icon={<Droplets className="w-8 h-8 text-cyan-500" />}
                        label="Water Saved"
                        value={stats.total_water_liters}
                        unit="Liters"
                        color="cyan"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left: Challenges & User Status */}
                    <div className="space-y-12">
                        {/* User Mini Stats */}
                        <div className="glass-morphism p-10 rounded-[48px] bg-white/60 dark:bg-black/40 backdrop-blur-2xl border-white/20 space-y-8">
                            <div className="flex items-center gap-6">
                                <div className="text-6xl">{userStats?.badge_icon || '🌱'}</div>
                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-[4px] text-eco-600 dark:text-eco-400">Your Rank</h4>
                                    <p className="text-3xl font-black italic uppercase text-clay-900 dark:text-white">{userStats?.badge_name || 'Seed'}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/40 dark:bg-white/5 p-5 rounded-3xl">
                                    <p className="text-[10px] font-black uppercase text-clay-400">Total Points</p>
                                    <p className="text-2xl font-black text-clay-900 dark:text-white">{userStats?.points || 0}</p>
                                </div>
                                <div className="bg-white/40 dark:bg-white/5 p-5 rounded-3xl">
                                    <p className="text-[10px] font-black uppercase text-clay-400">Streak</p>
                                    <p className="text-2xl font-black text-orange-500 flex items-center gap-2">
                                        <Flame className="w-5 h-5" /> {userStats?.eco_streak || 0}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Challenges Section */}
                        <div className="space-y-6">
                            <h3 className="text-2xl font-black italic uppercase tracking-tight flex items-center gap-3 px-4 text-white dark:text-white drop-shadow-md">
                                <Zap className="w-6 h-6 text-orange-400" /> Active Challenges
                            </h3>
                            <ChallengeCard
                                title="Zero-Waste Weekend"
                                points="200"
                                progress={65}
                                tag="WEEKLY"
                            />
                            <ChallengeCard
                                title="Plastic-Free Hydration"
                                points="150"
                                progress={20}
                                tag="DAILY"
                            />
                        </div>
                    </div>

                    {/* Middle: Live Feed */}
                    <div className="lg:col-span-1 space-y-6">
                        <h3 className="text-2xl font-black italic uppercase tracking-tight flex items-center gap-3 px-4 text-white dark:text-white drop-shadow-md">
                            <MessageSquare className="w-6 h-6 text-eco-500" /> Live Activity
                        </h3>
                        <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
                            <AnimatePresence initial={false}>
                                {feed.map((log) => (
                                    <ActivityItem key={log.id} log={log} />
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Right: Leaderboard */}
                    <div className="space-y-6">
                        <h3 className="text-2xl font-black italic uppercase tracking-tight flex items-center gap-3 px-4 text-white dark:text-white drop-shadow-md">
                            <Trophy className="w-6 h-6 text-yellow-400" /> Top Contributors
                        </h3>
                        <div className="glass-morphism rounded-[48px] overflow-hidden bg-white/60 dark:bg-black/40 backdrop-blur-2xl border-white/20 divide-y divide-clay-100 dark:divide-white/5">
                            {leaderboard.map((user, i) => (
                                <LeaderRow key={user.username} user={user} rank={i + 1} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ImpactCard = ({ icon, label, value, unit, color }) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        const start = displayValue;
        const end = parseFloat(value);
        if (start === end) return;

        let startTime = null;
        const duration = 2000;

        const animate = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);
            const currentCount = progress * (end - start) + start;
            setDisplayValue(currentCount);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [value]);

    const colors = {
        eco: 'bg-eco-500/10 border-eco-500/20',
        blue: 'bg-blue-500/10 border-blue-500/20',
        orange: 'bg-orange-500/10 border-orange-500/20',
        cyan: 'bg-cyan-500/10 border-cyan-500/20',
    };

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className={`glass-morphism p-8 rounded-[40px] border-2 ${colors[color]} relative overflow-hidden bg-white/80 dark:bg-black/40 backdrop-blur-xl`}
        >
            <div className="absolute top-0 right-0 p-6 opacity-10 drop-shadow-2xl">
                {icon}
            </div>
            <div className="relative z-10 space-y-4">
                <div className="p-4 bg-white dark:bg-white/10 rounded-2xl w-fit shadow-sm">
                    {icon}
                </div>
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[3px] text-clay-400 dark:text-clay-300 mb-1">{label}</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-clay-900 dark:text-white italic">
                            {typeof value === 'number' && value % 1 !== 0
                                ? displayValue.toFixed(1)
                                : Math.floor(displayValue).toLocaleString()
                            }
                        </span>
                        <span className="text-sm font-black text-clay-500 dark:text-clay-400 uppercase italic opacity-60">{unit}</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const ChallengeCard = ({ title, points, progress, tag }) => (
    <div className="glass-morphism p-8 rounded-[40px] border-white/20 hover:border-orange-500/30 transition-all group cursor-pointer bg-white/60 dark:bg-black/40 backdrop-blur-2xl">
        <div className="flex justify-between items-start mb-6">
            <span className="px-3 py-1 bg-orange-400/20 text-orange-600 dark:text-orange-400 text-[9px] font-black rounded-lg uppercase tracking-widest">{tag}</span>
            <div className="flex items-center gap-1 text-orange-500 font-black">
                <Zap className="w-4 h-4 fill-orange-500" /> +{points}
            </div>
        </div>
        <h5 className="text-xl font-black text-clay-900 dark:text-white mb-6 leading-tight uppercase italic">{title}</h5>
        <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-black uppercase text-clay-400 dark:text-clay-300 tracking-widest">
                <span>Progress</span>
                <span>{progress}%</span>
            </div>
            <div className="h-3 w-full bg-clay-100 dark:bg-white/10 rounded-full overflow-hidden p-0.5">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full shadow-[0_0_10px_rgba(251,146,60,0.4)]"
                />
            </div>
        </div>
    </div>
);

const ActivityItem = ({ log }) => (
    <motion.div
        layout
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-morphism p-6 rounded-[32px] border-white/20 flex gap-4 bg-white/60 dark:bg-black/40 backdrop-blur-2xl"
    >
        <div className="w-12 h-12 rounded-2xl bg-white dark:bg-white/10 flex items-center justify-center text-xl shadow-sm italic dark:text-white">
            {log.badge_icon}
        </div>
        <div className="flex-1 space-y-2">
            <div className="flex justify-between items-start">
                <span className="text-[10px] font-black text-clay-400 dark:text-clay-300 uppercase tracking-widest">{log.username}</span>
                <span className="text-[9px] text-clay-400 font-medium italic">Just now</span>
            </div>
            <p className="text-sm font-bold text-clay-900 dark:text-white leading-snug">
                Swapped <span className="text-red-400 line-through decoration-2">{log.product_name}</span>
                <ArrowRight className="inline w-3 h-3 mx-1 text-clay-400" />
                <span className="text-eco-600 dark:text-eco-400 italic uppercase">{log.alternative_name}</span>
            </p>
            <div className="flex gap-3 pt-1">
                <ImpactTag icon={<Wind className="w-3 h-3" />} value={`-${log.co2_saved}kg`} />
                <ImpactTag icon={<Trash2 className="w-3 h-3" />} value={`-${log.plastic_saved}g`} />
            </div>
        </div>
    </motion.div>
);

const ImpactTag = ({ icon, value }) => (
    <span className="flex items-center gap-1.5 px-2 py-1 bg-clay-50 dark:bg-white/5 rounded-lg text-[9px] font-black text-clay-500 dark:text-clay-400 uppercase tracking-tight">
        {icon} {value}
    </span>
);

const LeaderRow = ({ user, rank }) => (
    <div className="flex items-center justify-between p-6 hover:bg-white/10 transition-all group cursor-pointer">
        <div className="flex items-center gap-4">
            <span className={`w-6 text-sm font-black ${rank <= 3 ? 'text-eco-500' : 'text-clay-300'} italic`}>{rank}</span>
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/10 flex items-center justify-center text-sm font-black text-clay-900 dark:text-white shadow-sm italic group-hover:rotate-6 transition-transform">
                {user.username.charAt(0)}
            </div>
            <div>
                <p className="text-sm font-black text-clay-900 dark:text-white flex items-center gap-2 uppercase tracking-tight">
                    {user.username} {rank === 1 && <Award className="w-3 h-3 text-yellow-400 fill-yellow-400" />}
                </p>
                <div className="flex items-center gap-2 text-[9px] font-black text-eco-600 dark:text-eco-400 uppercase tracking-widest">
                    <span>{user.badge_icon} LVL {user.eco_level}</span>
                </div>
            </div>
        </div>
        <div className="text-right">
            <p className="text-lg font-black text-clay-900 dark:text-white italic">{user.points.toLocaleString()}</p>
            <p className="text-[8px] font-black text-clay-400 uppercase tracking-widest">PTS</p>
        </div>
    </div>
);

const RecycleIcon = (props) => (
    <svg
        {...props}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M7 11l5-5 5 5" />
        <path d="M12 18V6" />
        <path d="M17 17l-5 5-5-5" />
    </svg>
);

export default EcoImpactCommunity;
