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
        <div id="eco-journey" className="max-w-4xl mx-auto px-4 md:px-6 mb-12 md:mb-20 mt-8 md:mt-12 scroll-mt-32">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-morphism p-6 md:p-10 rounded-[32px] md:rounded-[48px] relative overflow-hidden shadow-2xl"
            >
                {/* Background Decorations */}
                <div className="absolute top-0 right-0 p-6 md:p-12 opacity-5 pointer-events-none">
                    <Leaf className="w-48 h-48 md:w-64 md:h-64 text-eco-600 rotate-12" />
                </div>

                <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 relative z-10">
                    <div className="relative">
                        <motion.div
                            key={stats.badge_icon}
                            initial={{ scale: 0.5, rotate: -20, opacity: 0 }}
                            animate={{ scale: 1, rotate: 0, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 260, damping: 20 }}
                            className="text-7xl sm:text-9xl md:text-[160px] cursor-default select-none filter drop-shadow-2xl"
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
                                    <Zap className="absolute text-yellow-500 w-16 h-16 md:w-24 md:h-24 blur-sm" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="flex-1 w-full text-center md:text-left">
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 md:gap-4 mb-4">
                            <span className="px-4 py-1.5 md:px-5 md:py-2 bg-eco-600 text-white text-[10px] md:text-xs font-black uppercase tracking-[2px] md:tracking-[4px] rounded-full italic">Level {currentLevel}</span>
                            <span className="flex items-center gap-2 text-orange-500 font-bold text-xs md:text-sm uppercase tracking-widest">
                                <TrendingUp className="w-3.5 h-3.5 md:w-4 md:h-4" /> {stats.eco_streak} Day Streak
                            </span>
                        </div>

                        <h2 className="text-4xl md:text-6xl font-black text-clay-900 dark:text-white mb-4 md:mb-6 tracking-tighter uppercase italic leading-tight">
                            {stats.badge_name}
                        </h2>

                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between items-end mb-2 md:mb-3">
                                    <span className="text-[10px] md:text-sm font-black text-clay-400 uppercase tracking-widest">Growth Progress</span>
                                    <span className="text-xl md:text-2xl font-black text-clay-900 dark:text-white italic">{Math.round(progress)}%</span>
                                </div>
                                <div className="h-4 md:h-6 w-full bg-clay-100 dark:bg-white/10 rounded-full overflow-hidden border-2 border-white dark:border-white/5 shadow-inner">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        className="h-full bg-gradient-to-r from-eco-500 via-eco-400 to-green-300 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                                    />
                                </div>
                                {nextLevelData && (
                                    <p className="mt-3 md:mt-4 text-[10px] md:text-base text-clay-500 dark:text-gray-400 font-bold italic">
                                        Only <span className="text-eco-600">{nextLevelData.min_points - stats.points}</span> more points to become a <span className="uppercase text-clay-700 dark:text-white">{nextLevelData.name}</span>
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4 md:gap-6 pt-2 md:pt-4">
                                <div className="bg-white/40 dark:bg-white/5 p-4 md:p-5 rounded-2xl md:rounded-3xl border border-white/50 dark:border-white/5 shadow-sm">
                                    <div className="text-[8px] md:text-[10px] font-black text-clay-400 uppercase tracking-widest mb-1">Impact Score</div>
                                    <div className="text-xl md:text-3xl font-black text-clay-900 dark:text-white italic tracking-tighter">{stats.points}</div>
                                </div>
                                <div className="bg-white/40 dark:bg-white/5 p-4 md:p-5 rounded-2xl md:rounded-3xl border border-white/50 dark:border-white/5 shadow-sm">
                                    <div className="text-[8px] md:text-[10px] font-black text-clay-400 uppercase tracking-widest mb-1">Eco Swaps</div>
                                    <div className="text-xl md:text-3xl font-black text-clay-900 dark:text-white italic tracking-tighter">{stats.eco_swaps_count}</div>
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
                            className="mt-8 md:mt-12 p-6 md:p-8 bg-eco-600 rounded-2xl md:rounded-[32px] text-white text-center shadow-xl"
                        >
                            <h4 className="text-xl md:text-2xl font-black uppercase italic mb-1 md:mb-2 tracking-tight">Evolution Complete! 🎊</h4>
                            <p className="font-bold text-eco-50 opacity-90 italic text-base md:text-lg leading-snug">Your actions are restoring the planet. You've grown into a {stats.badge_name}!</p>
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
