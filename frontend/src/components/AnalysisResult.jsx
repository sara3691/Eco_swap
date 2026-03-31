import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Trash2, CheckCircle, AlertOctagon, TrendingDown,
    Thermometer, Info, ArrowRight, Share2
} from 'lucide-react';

const AnalysisResult = ({ data }) => {
    if (!data) return null;

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-eco-600 dark:text-eco-400';
        if (score >= 50) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    };

    const scoreColor = getScoreColor(data.sustainability_score);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-6xl mx-auto mb-12 md:mb-20 relative px-4 md:px-6"
        >
            <div className="absolute inset-0 bg-eco-500/5 blur-[100px] rounded-full -z-10" />

            <div className="glass-morphism rounded-[32px] md:rounded-[40px] overflow-hidden shadow-xl">
                <div className="flex flex-col lg:flex-row">

                    {/* Image Section */}
                    <div className="lg:w-2/5 p-6 md:p-8 flex items-center justify-center bg-clay-50/80 dark:bg-white/5 border-b lg:border-b-0 lg:border-r border-clay-100 dark:border-white/5">
                        <div className="relative group w-full max-w-sm lg:max-w-none">
                            <div className="absolute inset-0 bg-eco-500/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                            <img
                                src={data.image_url}
                                alt={data.product_name}
                                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1000&auto=format&fit=crop'; }}
                                className="relative z-10 rounded-[24px] md:rounded-[32px] object-cover w-full aspect-square shadow-2xl transform group-hover:scale-[1.02] transition-transform duration-700"
                            />
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="lg:w-3/5 p-6 md:p-12 lg:p-16 flex flex-col justify-center">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 md:gap-8 mb-8 md:mb-12">
                            <div className="w-full sm:w-auto">
                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-eco-500/10 text-[10px] md:text-[11px] font-black uppercase tracking-[2px] md:tracking-[3px] text-eco-600 dark:text-eco-400 mb-3 md:mb-4 border border-eco-500/20">
                                    <Info className="w-3 h-3" /> {data.category} Analysis
                                </span>
                                <h2 className="text-3xl md:text-5xl font-black text-clay-900 dark:text-white tracking-tight mb-2 uppercase italic leading-tight">{data.product_name}</h2>
                                <div className="flex flex-wrap items-center gap-3 md:gap-4 text-clay-500 dark:text-gray-400 font-bold text-sm">
                                    <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-eco-500" /> AI Verified</span>
                                    <span className="hidden sm:block w-1.5 h-1.5 bg-clay-300 dark:bg-white/10 rounded-full" />
                                    <span>LCA Analysis V2.1</span>
                                </div>
                            </div>

                            <div className="relative inline-block text-center pt-2 self-center sm:self-start">
                                <svg className="w-20 h-20 md:w-24 md:h-24 transform -rotate-90">
                                    <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-clay-200 dark:text-white/10" />
                                    <circle
                                        cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="6" fill="transparent"
                                        strokeDasharray={213}
                                        strokeDashoffset={213 - (213 * data.sustainability_score) / 100}
                                        strokeLinecap="round"
                                        className={`${scoreColor} transition-all duration-1000`}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className={`text-xl md:text-2xl font-black ${scoreColor}`}>{data.sustainability_score}</span>
                                    <span className="text-[7px] md:text-[8px] font-black text-clay-400 dark:text-gray-500 tracking-[1px]">ECO SCORE</span>
                                </div>
                            </div>
                        </div>

                        <p className="text-clay-600 dark:text-gray-300 text-base md:text-lg leading-relaxed mb-8 md:mb-12 font-medium">
                            {data.eco_summary}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-8 md:mb-12">
                            <StatBox
                                icon={<Thermometer className="text-eco-500" />}
                                label="Carbon Footprint"
                                value={`${data.estimated_carbon_kg} kg CO2e`}
                                sub="Below industry average"
                            />
                            <StatBox
                                icon={<CheckCircle className="text-eco-500" />}
                                label="Primary Material"
                                value={data.primary_material}
                                sub="Verified Sourcing"
                            />
                        </div>

                        {data.greenwashing_detected ? (
                            <motion.div
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                className="bg-red-500/10 border border-red-500/20 p-5 md:p-6 rounded-2xl md:rounded-3xl flex items-start gap-4"
                            >
                                <div className="bg-red-500/20 p-2.5 md:p-3 rounded-xl md:rounded-2xl">
                                    <AlertOctagon className="text-red-500 w-5 h-5 md:w-6 md:h-6 shrink-0" />
                                </div>
                                <div>
                                    <h4 className="text-red-500 dark:text-red-400 text-base md:text-lg font-black uppercase italic tracking-wider">Greenwashing Warning</h4>
                                    <p className="text-sm md:text-base text-red-700 dark:text-red-300/60 font-medium mt-1">
                                        Misleading environmental claims detected. High synthetic content contradicts "Eco" branding.
                                    </p>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={() => document.getElementById('alternatives-section')?.scrollIntoView({ behavior: 'smooth' })}
                                    className="flex-1 btn-primary py-4 rounded-2xl flex items-center justify-center gap-3 text-sm md:text-base"
                                >
                                    Eco Swap <ArrowRight className="w-5 h-5" />
                                </button>
                                <button className="p-4 bg-clay-100 dark:bg-white/5 border border-clay-200 dark:border-white/10 rounded-2xl hover:bg-clay-200 dark:hover:bg-white/10 transition-all text-clay-600 dark:text-white flex items-center justify-center">
                                    <Share2 className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const StatBox = ({ icon, label, value, sub }) => (
    <div className="p-5 md:p-6 bg-clay-50 dark:bg-white/5 rounded-2xl md:rounded-[24px] border border-clay-200 dark:border-white/5 hover:border-eco-300 dark:hover:border-white/10 transition-all group">
        <div className="flex items-center gap-3 text-[10px] md:text-sm text-clay-500 dark:text-gray-400 font-bold mb-2 md:mb-3 uppercase tracking-widest leading-none">
            <div className="p-1.5 md:p-2 bg-eco-500/10 rounded-lg md:rounded-xl group-hover:bg-eco-500/15 transition-all">
                {React.cloneElement(icon, { size: 16 })}
            </div>
            {label}
        </div>
        <div className="text-xl md:text-2xl font-black text-clay-900 dark:text-white mb-1">{value}</div>
        <div className="text-[9px] md:text-[10px] font-bold text-clay-400 dark:text-gray-500 uppercase tracking-widest">{sub}</div>
    </div>
);


export default AnalysisResult;
