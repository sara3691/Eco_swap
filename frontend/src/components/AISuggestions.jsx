import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Leaf, Info, Loader2 } from 'lucide-react';
import axios from 'axios';

const AISuggestions = ({ productName }) => {
    const [suggestions, setSuggestions] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (!productName) return;
            setLoading(true);
            try {
                const response = await axios.post('https://eco-swap-thci.onrender.com/ai/recommend', {
                    product_name: productName
                });
                setSuggestions(response.data);
            } catch (err) {
                console.error("AI Suggestions Error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchSuggestions();
    }, [productName]);

    if (!productName) return null;

    return (
        <div className="max-w-6xl mx-auto mb-20 px-6">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-eco-500/10 rounded-2xl">
                    <Sparkles className="w-6 h-6 text-eco-500" />
                </div>
                <div>
                    <h3 className="text-3xl font-black italic uppercase tracking-tight text-clay-900 dark:text-white">
                        AI Eco-Friendly <span className="eco-text-gradient">Alternatives.</span>
                    </h3>
                    <p className="text-clay-500 font-medium italic">Smart recommendations to reduce your environmental footprint.</p>
                </div>
            </div>

            {loading ? (
                <div className="glass-morphism rounded-[40px] p-20 flex flex-col items-center justify-center">
                    <Loader2 className="w-12 h-12 text-eco-500 animate-spin mb-4" />
                    <p className="text-clay-500 dark:text-clay-400 font-black uppercase tracking-[4px] italic">AI is finding better eco alternatives...</p>
                </div>
            ) : suggestions && suggestions.alternatives?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {suggestions.alternatives.map((alt, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="glass-morphism p-8 rounded-[32px] border-white/40 hover:border-eco-500/30 transition-all group group bg-white/40 dark:bg-white/5"
                            >
                                <div className="flex items-start justify-between mb-6">
                                    <div className="p-4 bg-eco-500/10 rounded-2xl group-hover:bg-eco-500/20 transition-all">
                                        <Leaf className="w-6 h-6 text-eco-500" />
                                    </div>
                                    <span className="bg-clay-100 dark:bg-white/10 px-3 py-1 rounded-full text-[10px] font-black tracking-widest text-clay-500 dark:text-clay-400">
                                        REPLACEMENT
                                    </span>
                                </div>
                                <h4 className="text-2xl font-black text-clay-900 dark:text-white mb-3 italic uppercase tracking-tight">
                                    {alt.name}
                                </h4>
                                <p className="text-clay-500 dark:text-clay-400 font-medium leading-relaxed">
                                    {alt.reason}
                                </p>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            ) : (
                <div className="glass-morphism rounded-[40px] p-12 text-center">
                    <p className="text-clay-500 dark:text-clay-400 font-bold italic">Gathering smart eco swaps for your journey...</p>
                </div>
            )}
        </div>
    );
};

export default AISuggestions;
