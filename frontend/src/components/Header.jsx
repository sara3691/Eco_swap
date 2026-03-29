import React, { useState } from 'react';
import { Leaf, Award, LayoutGrid, MessageSquare, User, Menu, Moon, Sun, ChevronDown, Palette, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Header = ({ setPage, currentPage, theme, setTheme, userStats, currentUser, onLoginClick, onLogout }) => {
    const [themeOpen, setThemeOpen] = useState(false);
    const [prevLevel, setPrevLevel] = useState(userStats?.eco_level || 1);
    const [showGlow, setShowGlow] = useState(false);

    React.useEffect(() => {
        if (userStats && userStats.eco_level > prevLevel) {
            setShowGlow(true);
            setTimeout(() => setShowGlow(false), 3000);
            setPrevLevel(userStats.eco_level);
        }
    }, [userStats, prevLevel]);

    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="fixed top-0 left-0 right-0 z-50 px-6 py-6"
        >
            <div className="max-w-7xl mx-auto glass-morphism rounded-[32px] px-8 py-3.5 flex items-center justify-between border-white/40">
                <div
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={() => setPage('home')}
                >
                    <div className="bg-eco-100 dark:bg-eco-500/20 p-2.5 rounded-2xl group-hover:bg-eco-200 dark:group-hover:bg-eco-500/30 transition-all shadow-sm">
                        <Leaf className="text-eco-600 dark:text-eco-400 w-6 h-6" />
                    </div>
                    <span className="text-xl font-black tracking-tighter eco-text-gradient">ECOSWAP</span>
                </div>

                <nav className="hidden md:flex items-center gap-2">
                    <NavItem
                        onClick={() => setPage('home')}
                        active={currentPage === 'home'}
                        label="Home"
                    />
                    <NavItem
                        onClick={() => setPage('alternatives')}
                        active={currentPage === 'alternatives'}
                        label="Exchange"
                    />
                    {currentUser && (
                        <NavItem
                            onClick={() => setPage('history')}
                            active={currentPage === 'history'}
                            label="History"
                        />
                    )}
                    <NavItem
                        onClick={() => setPage('leaderboard')}
                        active={currentPage === 'leaderboard'}
                        label="Heroes"
                    />
                    <NavItem
                        onClick={() => setPage('reviews')}
                        active={currentPage === 'reviews'}
                        label="Community"
                    />
                </nav>

                <div className="flex items-center gap-3">
                    {/* Theme Switcher Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setThemeOpen(!themeOpen)}
                            className="flex items-center gap-2 bg-white/80 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 px-4 py-2.5 rounded-2xl border border-clay-100 dark:border-white/10 transition-all shadow-sm text-sm font-bold text-clay-900 dark:text-white"
                        >
                            <Palette className="w-4 h-4 text-eco-600 dark:text-eco-400" />
                            <span>Themes</span>
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${themeOpen ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {themeOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute top-full mt-3 right-0 w-40 glass-morphism p-2 rounded-2xl shadow-2xl z-50 border-white/40"
                                >
                                    <ThemeOption
                                        active={theme === 'light'}
                                        onClick={() => { setTheme('light'); setThemeOpen(false); }}
                                        icon={<Sun className="w-4 h-4" />}
                                        label="Light"
                                    />
                                    <ThemeOption
                                        active={theme === 'dark'}
                                        onClick={() => { setTheme('dark'); setThemeOpen(false); }}
                                        icon={<Moon className="w-4 h-4" />}
                                        label="Dark"
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Dynamic User Badge Pill */}
                    <AnimatePresence mode="wait">
                        {userStats && currentUser ? (
                            <div className="hidden sm:flex items-center gap-3">
                                <motion.div
                                    key={userStats.eco_level}
                                    initial={{ opacity: 0, scale: 0.9, x: 20 }}
                                    animate={{
                                        opacity: 1,
                                        scale: 1,
                                        x: 0,
                                        boxShadow: showGlow ? "0 0 20px rgba(34, 197, 94, 0.4)" : "none"
                                    }}
                                    className={`flex items-center gap-3 bg-white/60 dark:bg-white/5 border border-clay-100 dark:border-white/10 rounded-full pl-2 pr-4 py-1.5 transition-all hover:scale-105 hover:bg-white dark:hover:bg-white/10 cursor-pointer ${showGlow ? 'border-eco-500' : ''}`}
                                    onClick={() => document.getElementById('eco-journey')?.scrollIntoView({ behavior: 'smooth' })}
                                >
                                    <div className="w-10 h-10 rounded-full bg-white dark:bg-white/10 flex items-center justify-center text-xl shadow-sm">
                                        {userStats.badge_icon}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-clay-400 dark:text-clay-500 uppercase tracking-wider leading-none truncate max-w-[80px]">
                                            {currentUser.name || currentUser.username}
                                        </span>
                                        <span className="text-[10px] font-black text-eco-600 dark:text-eco-400 uppercase tracking-widest leading-none mt-0.5">
                                            {userStats.badge_name}
                                        </span>
                                        <span className="text-[11px] font-black text-clay-900 dark:text-white leading-tight tracking-tight mt-0.5">
                                            {userStats.points.toLocaleString()} PTS
                                        </span>
                                    </div>
                                </motion.div>
                                <button
                                    onClick={onLogout}
                                    className="px-4 py-2 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-100 dark:hover:bg-red-500/20 transition-all border border-red-100 dark:border-red-500/20 shadow-sm"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={onLoginClick}
                                className="hidden sm:flex items-center gap-2 px-6 py-2.5 bg-eco-600 text-white rounded-xl font-black text-sm uppercase tracking-widest hover:bg-eco-700 hover:shadow-lg hover:shadow-eco-600/30 transition-all hover:-translate-y-0.5 shadow-md"
                            >
                                <User className="w-4 h-4" /> Login
                            </button>
                        )}
                    </AnimatePresence>


                    <button className="md:hidden p-2.5 text-clay-900 dark:text-white">
                        <Menu className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </motion.header>
    );
};

const ThemeOption = ({ active, onClick, icon, label }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${active
            ? 'bg-eco-600 text-white shadow-lg shadow-eco-600/20'
            : 'text-clay-500 dark:text-clay-400 hover:bg-white/20 dark:hover:bg-white/5 hover:text-clay-900 dark:hover:text-white'
            }`}
    >
        {icon}
        {label}
    </button>
);

const NavItem = ({ onClick, active, label }) => (
    <button
        onClick={onClick}
        className={`relative flex items-center justify-center gap-2.5 px-6 py-2.5 rounded-2xl text-[14px] font-bold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eco-500 ${active
            ? 'text-eco-800 dark:text-eco-100'
            : 'text-clay-500 dark:text-clay-400 hover:text-clay-900 dark:hover:text-white hover:bg-clay-50/50 dark:hover:bg-white/5'
            }`}
    >
        {active && (
            <motion.div
                layoutId="activeNavIndicator"
                className="absolute inset-0 bg-eco-100 dark:bg-eco-500/20 border-b-[3px] border-eco-600 dark:border-eco-400 rounded-2xl shadow-sm"
                initial={false}
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
                style={{ zIndex: -1 }}
            />
        )}
        <span className="relative z-10">{label}</span>
    </button>
);

export default Header;
