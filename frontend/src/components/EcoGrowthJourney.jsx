import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, TrendingUp, Calendar, Zap } from 'lucide-react';

const BADGE_LEVELS = [
    { level: 1, name: "Seed", icon: "🌱", min_points: 0 },
    { level: 2, name: "Sprout", icon: "🍃", min_points: 50 },
    { level: 3, name: "Growing Plant", icon: "🌿", min_points: 100 },
    { level: 4, name: "Flowering Plant", icon: "🌻", min_points: 300 },
    { level: 5, name: "Fruiting Plant", icon: "🍓", min_points: 700 },
    { level: 6, name: "Tree", icon: "🌳", min_points: 1200 },
    { level: 7, name: "Forest", icon: "⛰️", min_points: 2000 },
    { level: 8, name: "Jungle Ecosystem", icon: "🏞", min_points: 3500 },
    { level: 9, name: "Green World", icon: "🌎", min_points: 5000 },
];

const EcoGrowthJourney = ({ stats, onUpdate }) => {
    const [prevLevel, setPrevLevel] = useState(stats?.eco_level || 1);
    const [showEvolution, setShowEvolution] = useState(false);

    useEffect(() => {
        if (stats && stats.eco_level > prevLevel) {
            setShowEvolution(true);
            setTimeout(() => {
                setShowEvolution(false);
                setPrevLevel(stats.eco_level);
            }, 5000);
        }
    }, [stats, prevLevel]);

    if (!stats) return null;

    const currentLevel = stats.eco_level || 1;
    const nextLevelData = BADGE_LEVELS.find(l => l.level === currentLevel + 1);
    const currentLevelData = BADGE_LEVELS.find(l => l.level === currentLevel) || BADGE_LEVELS[0];

    const progress = nextLevelData
        ? Math.min(100, ((stats.points - currentLevelData.min_points) / (nextLevelData.min_points - currentLevelData.min_points)) * 100)
        : 100;

    return (
        <div id="eco-journey" className="max-w-4xl mx-auto px-6 mb-20 mt-12 scroll-mt-32">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-morphism p-10 rounded-[48px] relative overflow-hidden shadow-2xl shadow-eco-200/5"
            >
                {/* Background Decorations */}
                <div Name="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                    <Leaf className="w-64 h-64 text-eco-600 rotate-12" />
                </div>

                <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
                    <div className="relative">
                        <motion.div
                            key={stats.badge_icon}
                            initial={{ scale: 0.5, rotate: -20, opacity: 0 }}
                            animate={{ scale: 1, rotate: 0, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 260, damping: 20 }}
                            className="text-9xl md:text-[160px] cursor-default select-none filter drop-shadow-2xl"
                        >
                            {stats.badge_icon}
                        </motion.div>

                        <AnimatePresence>
                            {showEvolution && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1.2 }}
                                    exit={{ opacity: 0, scale: 1.5 }}
                                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                                >
                                    <div className="w-full h-full bg-eco-400/20 rounded-full blur-3xl animate-pulse" />
                                    <Zap className="absolute text-yellow-500 w-24 h-24 blur-sm" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="flex-1 w-full text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                            <span className="px-5 py-2 bg-eco-600 text-white text-xs font-black uppercase tracking-[4px] rounded-full italic">Level {currentLevel}</span>
                            <span className="flex items-center gap-2 text-orange-500 font-bold text-sm uppercase tracking-widest">
                                <TrendingUp className="w-4 h-4" /> {stats.eco_streak} Day Streak
                            </span>
                        </div>

                        <h2 className="text-5xl md:text-6xl font-black text-clay-900 dark:text-white mb-6 tracking-tighter uppercase italic">
                            {stats.badge_name}
                        </h2>

                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between items-end mb-3">
                                    <span className="text-sm font-black text-clay-400 uppercase tracking-widest">Growth Progress</span>
                                    <span className="text-2xl font-black text-clay-900 italic">{Math.round(progress)}%</span>
                                </div>
                                <div className="h-6 w-full bg-clay-100 rounded-full overflow-hidden border-2 border-white shadow-inner">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        className="h-full bg-gradient-to-r from-eco-500 via-eco-400 to-green-300 rounded-full"
                                    />
                                </div>
                                {nextLevelData && (
                                    <p className="mt-4 text-clay-500 font-bold italic">
                                        Only <span className="text-eco-600">{nextLevelData.min_points - stats.points}</span> more points to become a <span className="uppercase text-clay-700">{nextLevelData.name}</span>
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-6 pt-4">
                                <div className="bg-white/40 p-5 rounded-3xl border border-white/50">
                                    <div className="text-[10px] font-black text-clay-400 uppercase tracking-widest mb-1">Impact Score</div>
                                    <div className="text-3xl font-black text-clay-900 italic tracking-tighter">{stats.points}</div>
                                </div>
                                <div className="bg-white/40 p-5 rounded-3xl border border-white/50">
                                    <div className="text-[10px] font-black text-clay-400 uppercase tracking-widest mb-1">Eco Swaps</div>
                                    <div className="text-3xl font-black text-clay-900 italic tracking-tighter">{stats.eco_swaps_count}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Motivational Message */}
                <AnimatePresence>
                    {showEvolution && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="mt-12 p-8 bg-eco-600 rounded-[32px] text-white text-center shadow-xl shadow-eco-600/30"
                        >
                            <h4 className="text-2xl font-black uppercase italic mb-2 tracking-tight">Evolution Complete! 🎊</h4>
                            <p className="font-bold text-eco-50 opacity-90 italic text-lg">Your actions are restoring the planet. You've grown into a {stats.badge_name}!</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Evolution Timeline Preview */}
            <div className="mt-12 flex justify-between gap-2 overflow-x-auto pb-4 px-2 no-scrollbar">
                {BADGE_LEVELS.map((level) => (
                    <div
                        key={level.level}
                        className={`flex flex-col items-center min-w-[80px] transition-all duration-500 ${level.level <= currentLevel ? 'opacity-100 scale-110' : 'opacity-30 grayscale'}`}
                    >
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm mb-2 ${level.level === currentLevel ? 'bg-white border-2 border-eco-500 animate-bounce' : 'bg-white/40'}`}>
                            {level.icon}
                        </div>
                        <span className="text-[8px] font-black uppercase tracking-widest text-clay-600 text-center">{level.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EcoGrowthJourney;
