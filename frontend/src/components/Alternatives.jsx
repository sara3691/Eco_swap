import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Leaf, ArrowUpRight, Send, CheckCircle2, ShoppingBag, Star, ExternalLink } from 'lucide-react';

const Alternatives = ({ category = 'General', productName = '', onSwap, userId }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [suggestForm, setSuggestForm] = useState({ name: '', link: '' });
    const [submitted, setSubmitted] = useState(false);
    const [isAnalysisComplete, setIsAnalysisComplete] = useState(false);
    const [source, setSource] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        // Reset state when category or productName changes
        setItems([]);
        setLoading(true);
        setIsAnalysisComplete(false);
        setSubmitted(false);
        setSource('');
        setMessage('');

        // Delayed reveal effect (2 second delay per spec)
        const timer = setTimeout(() => {
            setIsAnalysisComplete(true);
            fetchItems();
        }, 2000);

        return () => clearTimeout(timer);
    }, [category, productName]);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const response = await axios.get('https://eco-swap-thci.onrender.com/alternatives', {
                params: {
                    category: category,
                    product: productName,
                    user_id: userId
                }
            });
            const data = response.data;
            const alts = data.alternatives || [];
            setItems(alts);
            setSource(data.source || '');
            setMessage(data.message || '');
        } catch (err) {
            console.error("Fetch Alternatives Error:", err);
            // Retry once on failure
            try {
                const retry = await axios.get('https://eco-swap-thci.onrender.com/alternatives', {
                    params: { category: category, product: productName, user_id: userId }
                });
                setItems(retry.data.alternatives || []);
                setSource(retry.data.source || '');
                setMessage(retry.data.message || '🌱 Showing recommended eco swaps while AI learns.');
            } catch (retryErr) {
                console.error("Retry also failed:", retryErr);
                setItems([]);
                setMessage('🌱 Showing recommended eco swaps while AI learns.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSwap = (itemName) => {
        if (onSwap) {
            onSwap(productName || category, itemName);
        }
    };

    const handleSuggest = async (e) => {
        e.preventDefault();
        try {
            await axios.post('https://eco-swap-thci.onrender.com/suggest', {
                product_name: productName || category,
                suggested_name: suggestForm.name,
                suggested_link: suggestForm.link
            });
            setSubmitted(true);
            setSuggestForm({ name: '', link: '' });
        } catch (err) {
            console.error(err);
            alert('Failed to send suggestion.');
        }
    };

    const getScoreColor = (score) => {
        if (score >= 90) return 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10';
        if (score >= 80) return 'text-green-400 border-green-400/30 bg-green-400/10';
        if (score >= 70) return 'text-lime-400 border-lime-400/30 bg-lime-400/10';
        return 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10';
    };

    const formatPrice = (item) => {
        // Priority: price_display → price with ₹ → fallback
        if (item.price_display) return item.price_display;
        if (item.price) return `₹${Math.round(item.price)}`;
        return '₹499';
    };

    const getBuyLink = (item) => {
        // Priority: product_link → Amazon search → #
        if (item.product_link && item.product_link !== '#' && !item.product_link.includes('example.com')) {
            return item.product_link;
        }
        const query = (item.name || 'eco product').replace(/ /g, '+');
        return `https://www.amazon.in/s?k=${query}`;
    };

    return (
        <div className="page-bg-container">
            {/* Background Image */}
            <img
                src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2560&auto=format&fit=crop"
                alt="Green Nature"
                className="page-bg-image"
            />
            <div className="page-bg-overlay" />

            <div className="relative z-10 py-12 md:py-24 px-4 md:px-6 max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-8 mb-10 md:16">
                    <div>
                        {!isAnalysisComplete ? (
                            <div className="flex items-center gap-4 md:gap-6 bg-white/10 backdrop-blur-md p-4 md:p-6 rounded-2xl md:rounded-3xl border border-white/20 shadow-2xl w-full">
                                <div className="w-8 h-8 md:w-10 md:h-10 border-4 border-eco-500 border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(34,197,94,0.4)]" />
                                <h2 className="text-xl md:text-3xl font-black tracking-tight italic eco-text-gradient">
                                    AI is finding better eco alternatives...
                                </h2>
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ type: "spring", stiffness: 100 }}
                            >
                                <h2 className="text-3xl md:text-6xl font-black mb-3 md:mb-4 tracking-tighter text-white dark:text-white drop-shadow-2xl italic uppercase">
                                    🌱 Eco Alternative <br />
                                    <span className="eco-text-gradient">Recommended.</span>
                                </h2>
                                <p className="text-white dark:text-white/90 text-lg md:text-2xl font-bold max-w-xl italic drop-shadow-md">
                                    Planet-positive alternatives curated for your journey.
                                </p>
                                {message && (
                                    <p className="text-eco-300 text-xs md:text-sm font-bold mt-2 md:mt-3 italic">
                                        {message}
                                    </p>
                                )}
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Product Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-20 px-2 md:px-0">
                    {!isAnalysisComplete || loading ? (
                        // Skeleton loading cards
                        [1, 2, 3].map(i => (
                            <div key={i} className="h-[480px] md:h-[520px] glass-morphism rounded-[32px] md:rounded-[40px] relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-clay-200/30 dark:via-white/5 to-transparent -translate-x-full animate-shimmer" />
                                <div className="p-6 md:p-8 h-full flex flex-col">
                                    <div className="h-40 md:h-52 bg-clay-200 dark:bg-white/5 rounded-2xl mb-4 md:mb-6" />
                                    <div className="h-6 md:h-8 bg-clay-200 dark:bg-white/5 rounded-lg w-3/4 mb-3" />
                                    <div className="h-4 bg-clay-200 dark:bg-white/5 rounded-lg w-1/2 mb-3" />
                                    <div className="h-4 md:h-6 bg-clay-200 dark:bg-white/5 rounded-lg w-1/3 mb-6" />
                                    <div className="mt-auto h-12 md:h-14 bg-clay-200 dark:bg-white/5 rounded-xl" />
                                </div>
                            </div>
                        ))
                    ) : (
                        <AnimatePresence>
                            {items.map((item, index) => (
                                <motion.div
                                    key={item.id || index}
                                    initial={{ opacity: 0, scale: 0.9, y: 30 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    transition={{
                                        duration: 0.6,
                                        delay: index * 0.15,
                                        ease: "easeOut"
                                    }}
                                    className="glass-morphism rounded-[32px] md:rounded-[40px] flex flex-col hover:-translate-y-4 hover:shadow-3xl hover:shadow-eco-500/10 transition-all duration-500 group overflow-hidden border-white/5"
                                >
                                    {/* Product Image */}
                                    <div className="h-48 md:h-64 bg-white flex items-center justify-center p-4 relative overflow-hidden border-b border-clay-100 dark:border-white/5">
                                        <div className="absolute inset-0 bg-eco-500/[0.02] dark:bg-black/[0.05]" />
                                        <img
                                            src={item.image_url || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=400&auto=format&fit=crop'}
                                            alt={item.name}
                                            className="w-full h-full object-contain group-hover:scale-[1.05] transition-transform duration-700 relative z-10"
                                            loading="lazy"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=400&auto=format&fit=crop';
                                            }}
                                        />
                                        {/* Eco Tag */}
                                        <div className="absolute top-3 left-3 md:top-4 md:left-4 backdrop-blur-md px-2.5 py-1 md:px-3 md:py-1.5 rounded-full text-[8px] md:text-[10px] font-black tracking-[1px] md:tracking-[2px] border shadow-sm z-20 text-eco-400 border-eco-400/30 bg-eco-400/10">
                                            🌱 ECO ALTERNATIVE
                                        </div>
                                        {/* Sustainability Score Badge */}
                                        {item.sustainability_score && (
                                            <div className={`absolute top-3 right-3 md:top-4 md:right-4 backdrop-blur-md px-2.5 py-1 md:px-3 md:py-1.5 rounded-full text-[8px] md:text-[10px] font-black tracking-[1px] md:tracking-[2px] border shadow-sm z-20 ${getScoreColor(item.sustainability_score)}`}>
                                                {item.sustainability_score}%
                                            </div>
                                        )}
                                    </div>

                                    {/* Card Content */}
                                    <div className="p-6 md:p-8 flex-1 flex flex-col">
                                        {/* Product Name */}
                                        <div className="mb-2 md:mb-3">
                                            <h3 className="font-black text-lg md:text-xl text-clay-900 dark:text-white leading-tight mb-1">
                                                {item.name}
                                            </h3>
                                            <p className="text-[10px] font-bold text-clay-500 dark:text-gray-400 uppercase tracking-[1px] md:tracking-[2px]">
                                                {item.material || item.reason}
                                            </p>
                                        </div>

                                        {/* Price in ₹ */}
                                        <div className="mb-2">
                                            <span className="text-2xl md:text-3xl font-black tracking-tight text-clay-900 dark:text-white">
                                                {formatPrice(item)}
                                            </span>
                                            <span className="text-[10px] text-clay-400 ml-2 font-bold uppercase tracking-wider">
                                                INR
                                            </span>
                                        </div>

                                        {/* Source & Rating */}
                                        <div className="flex items-center gap-3 mb-4 md:mb-6">
                                            {item.source && (
                                                <span className="text-[9px] md:text-[10px] font-black text-clay-400 dark:text-clay-500 uppercase tracking-[1px] md:tracking-[2px]">
                                                    via {item.source}
                                                </span>
                                            )}
                                            {item.rating && (
                                                <div className="flex items-center gap-1">
                                                    <Star className="w-2.5 h-2.5 md:w-3 md:h-3 text-yellow-400 fill-yellow-400" />
                                                    <span className="text-[9px] md:text-[10px] font-black text-clay-500">{item.rating}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Buy Now Button */}
                                        <div className="mt-auto flex flex-col gap-2 md:gap-3">
                                            <a
                                                href={getBuyLink(item)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full btn-primary !py-3.5 md:!py-4 text-xs md:text-sm font-black uppercase tracking-widest flex items-center justify-center gap-2 group/btn"
                                                onClick={() => handleSwap(item.name)}
                                            >
                                                <ShoppingBag className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                                Buy Now
                                                <ExternalLink className="w-3 h-3 md:w-3.5 md:h-3.5 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-0.5 transition-transform" />
                                            </a>
                                            <p className="text-[8px] md:text-[10px] text-center font-bold text-gray-400 uppercase tracking-widest">
                                                🌱 Earn +20 Impact Points on Purchase
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>

                {/* Suggestion Form (only if no items after loading) */}
                {items.length === 0 && !loading && isAnalysisComplete && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-3xl mx-auto glass-morphism p-6 md:p-12 rounded-[32px] md:rounded-[48px] border-eco-500/20 relative overflow-hidden bg-white/60 dark:bg-black/40 backdrop-blur-2xl"
                    >
                        <div className="absolute top-0 right-0 p-4 md:p-8 opacity-5">
                            <Send className="w-16 h-16 md:w-32 md:h-32 text-eco-400" />
                        </div>

                        <div className="relative z-10 text-center">
                            <h3 className="text-2xl md:text-3xl font-black mb-3 md:mb-4 italic uppercase tracking-tight text-clay-900 dark:text-white text-center">
                                Can't find what you need?
                            </h3>
                            <p className="text-sm md:text-base text-clay-600 dark:text-white/80 font-medium mb-8 md:mb-10 drop-shadow-sm px-2">
                                Help us grow! Suggest an eco-friendly alternative for <span className="text-eco-400">"{productName || category}"</span> and earn extra impact points.
                            </p>

                            {submitted ? (
                                <div className="bg-eco-500/10 border border-eco-500/20 p-6 md:p-8 rounded-2xl md:rounded-3xl flex items-center gap-3 md:gap-4 justify-center text-left">
                                    <CheckCircle2 className="text-eco-400 w-6 h-6 md:w-8 md:h-8 shrink-0" />
                                    <div>
                                        <h4 className="text-eco-400 font-black uppercase text-sm md:text-base">Thank you, Hero!</h4>
                                        <p className="text-clay-500 dark:text-white/60 text-xs md:text-sm">Our team will verify your suggestion immediately.</p>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleSuggest} className="space-y-3 md:space-y-4 max-w-md mx-auto">
                                    <input
                                        type="text"
                                        required
                                        placeholder="Product Name (e.g. Bamboo Toothbrush)"
                                        value={suggestForm.name}
                                        onChange={(e) => setSuggestForm({ ...suggestForm, name: e.target.value })}
                                        className="input-glass w-full text-sm md:text-base text-clay-900 dark:text-white placeholder:text-clay-300 dark:placeholder:text-white/40"
                                    />
                                    <input
                                        type="url"
                                        placeholder="Product Link (optional)"
                                        value={suggestForm.link}
                                        onChange={(e) => setSuggestForm({ ...suggestForm, link: e.target.value })}
                                        className="input-glass w-full text-sm md:text-base text-clay-900 dark:text-white placeholder:text-clay-300 dark:placeholder:text-white/40"
                                    />
                                    <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 md:py-4">
                                        Submit Suggestion <Send className="w-4 h-4" />
                                    </button>
                                </form>
                            )}
                        </div>
                    </motion.div>
                )}

            </div>
        </div>
    );
};

export default Alternatives;
