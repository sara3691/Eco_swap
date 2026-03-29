import React, { useState } from 'react';
import { Search, Loader2, Sparkles, Globe, ShieldCheck, Zap, Leaf, Recycle, Wind, Droplets } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

const Hero = ({ onAnalyze, userId }) => {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        try {
            const response = await axios.post('http://localhost:5000/analyze-product', { 
                product: query,
                user_id: userId 
            });
            onAnalyze(response.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative pt-32 pb-24 flex flex-col items-center overflow-hidden min-h-[95vh] justify-center">
            {/* Background Image - Clean & Modern */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2560&auto=format&fit=crop"
                    alt="Pristine Forest Background"
                    className="w-full h-full object-cover"
                />
                {/* 1. Dark Gradient & Vignette for Visual Focus */}
                <div className="absolute inset-0 bg-gradient-to-t from-clay-950/90 via-clay-900/40 to-transparent z-[5]" />
                <div className="absolute inset-0 bg-black/40 z-[5]" />
            </div>

            {/* Background Decorations - Minimal & Sharp */}
            <div className="absolute inset-0 eco-hero-pattern z-10 opacity-10" />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-6xl mx-auto px-6 relative z-30 flex flex-col items-center"
            >
                {/* 3. HERO CONTENT CONTAINER (Glassmorphism Card) */}
                <div className="bg-white/5 backdrop-blur-[5px] border border-white/10 p-10 md:p-16 rounded-[64px] shadow-2xl flex flex-col items-center text-center w-full">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/95 dark:bg-clay-800/90 backdrop-blur-xl shadow-2xl border border-white/50 dark:border-white/10 text-eco-700 dark:text-eco-400 text-[13px] font-black uppercase tracking-[4px] mb-12 shadow-eco-500/10"
                    >
                        <Sparkles className="w-4 h-4 text-orange-400 animate-pulse" /> AI Sustainable Shopping
                    </motion.div>

                    {/* 2. Heading Improvements: Pure White & Shadow */}
                    <h1 className="text-7xl md:text-[140px] font-black mb-10 leading-[0.85] tracking-[-0.05em] text-white drop-shadow-[0_15px_35px_rgba(0,0,0,0.6)]">
                        EcoSwap <br />
                        <span className="eco-text-gradient italic">for the Planet.</span>
                    </h1>

                    <p className="text-white/90 text-xl md:text-2xl max-w-3xl mx-auto mb-16 leading-relaxed font-extrabold drop-shadow-lg">
                        The world's smartest way to reuse, share, and recycle. <br className="hidden md:block" />
                        Spot greenwashing instantly and switch to planet-positive alternatives.
                    </p>

                    <motion.form
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        onSubmit={handleSearch}
                        className="w-full max-w-4xl relative"
                    >
                        <div className="relative flex items-center bg-white backdrop-blur-2xl border-4 border-white/20 rounded-[40px] p-3 pl-10 focus-within:ring-4 focus-within:ring-eco-500/20 transition-all duration-700 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.4)]">
                            <Search className="w-8 h-8 mr-6 text-clay-400" />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="What are you buying today?..."
                                className="bg-transparent border-none outline-none text-2xl flex-1 font-black placeholder:text-clay-400"
                                style={{ color: '#1c1917' }}
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary flex items-center gap-3 group min-w-[180px] justify-center py-5 text-lg"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin w-6 h-6" />
                                ) : (
                                    <>
                                        Analyze <Zap className="w-5 h-5 fill-white group-hover:scale-125 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.form>
                </div>

                <div className="mt-16 flex flex-wrap justify-center gap-10 md:gap-16">
                    <FeatureBadge icon={<Leaf className="w-5 h-5" />} label="Sustainable Living" light />
                    <FeatureBadge icon={<Globe className="w-5 h-5" />} label="Carbon Analysis" light />
                    <FeatureBadge icon={<Wind className="w-5 h-5" />} label="Eco-Friendly" light />
                </div>
            </motion.div>
        </div>
    );
};

const FeatureBadge = ({ icon, label, light }) => (
    <div className={`flex items-center gap-3 text-base font-black ${light ? 'text-white' : 'text-clay-500'} hover:text-eco-400 transition-all cursor-default group hover:-translate-y-1`}>
        <div className="p-3 bg-white rounded-2xl shadow-lg border border-clay-50 group-hover:border-eco-200 transition-all group-hover:shadow-eco-100">
            {icon}
        </div>
        {label}
    </div>
);

export default Hero;


