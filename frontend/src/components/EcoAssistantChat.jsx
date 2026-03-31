import React, { useState, useEffect, useRef } from 'react';
import { Send, X, Minus, MessageSquare, Sparkles, User, Leaf } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const EcoAssistantChat = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState(() => {
        const saved = sessionStorage.getItem('eco-chat-history');
        return saved ? JSON.parse(saved) : [
            { id: 1, type: 'ai', text: "Ask me anything — I will help you choose eco-friendly products. 🌱" }
        ];
    });
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        // Show welcome tooltip after a short delay if it's the first time
        const hasSeenTooltip = localStorage.getItem('eco-assistant-tooltip');
        if (!hasSeenTooltip) {
            const timer = setTimeout(() => setShowTooltip(true), 3000);
            return () => clearTimeout(timer);
        }
    }, []);

    useEffect(() => {
        sessionStorage.setItem('eco-chat-history', JSON.stringify(messages));
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = { id: Date.now(), type: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);
        setShowTooltip(false);
        localStorage.setItem('eco-assistant-tooltip', 'true');

        try {
            const response = await axios.post('https://eco-swap-thci.onrender.com/chatbot', { message: input });
            const aiMsg = { id: Date.now() + 1, type: 'ai', text: response.data.reply };
            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            console.error('Chatbot error:', error);
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                type: 'ai',
                text: "I'm having a bit of trouble connecting to my eco-brain. Please try again later! 🌎"
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleChat = () => {
        if (showTooltip) {
            setShowTooltip(false);
            localStorage.setItem('eco-assistant-tooltip', 'true');
        }
        setIsOpen(!isOpen);
        setIsMinimized(false);
    };

    return (
        <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-[1000] flex flex-col items-end">
            {/* Welcome Tooltip */}
            <AnimatePresence>
                {showTooltip && !isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        className="bg-white dark:bg-clay-800 text-clay-900 dark:text-white px-4 py-3 rounded-2xl shadow-xl border border-eco-200 dark:border-eco-800 mb-4 mr-2 relative max-w-[200px]"
                    >
                        <div className="text-xs font-black uppercase tracking-widest text-eco-600 mb-1">Eco Assistant</div>
                        <p className="text-sm font-medium">Need help picking green products? Ask me! 🌿</p>
                        <button
                            onClick={() => setShowTooltip(false)}
                            className="absolute -top-2 -right-2 bg-clay-100 dark:bg-clay-700 rounded-full p-1 shadow-md"
                        >
                            <X className="w-3 h-3" />
                        </button>
                        <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white dark:bg-clay-800 border-r border-b border-eco-200 dark:border-eco-800 rotate-45" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9, transformOrigin: 'bottom right' }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            height: isMinimized ? '60px' : (window.innerWidth < 640 ? '80vh' : '500px')
                        }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        className={`w-[calc(100vw-32px)] sm:w-[380px] bg-emerald-50 dark:bg-emerald-950 rounded-[28px] md:rounded-[32px] shadow-2xl border-2 border-emerald-500 overflow-hidden mb-4 flex flex-col transition-all duration-300`}
                    >
                        {/* Header */}
                        <div className="bg-emerald-600 p-4 flex items-center justify-between text-white shrink-0 shadow-md relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center border border-white/30">
                                    <Leaf className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-black text-sm uppercase tracking-wider italic">🌱 Eco Assistant</h3>
                                    {!isMinimized && (
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                                            <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-50">AI Expert Online</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setIsMinimized(!isMinimized)}
                                    className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Chat Area */}
                        {!isMinimized && (
                            <>
                                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-emerald-50/50 dark:bg-emerald-950/50">
                                    {messages.map((m) => (
                                        <motion.div
                                            key={m.id}
                                            initial={{ opacity: 0, x: m.type === 'ai' ? -10 : 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className={`flex ${m.type === 'ai' ? 'justify-start' : 'justify-end'}`}
                                        >
                                            <div className={`flex gap-3 max-w-[85%] ${m.type === 'ai' ? 'flex-row' : 'flex-row-reverse'}`}>
                                                <div className={`w-8 h-8 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${m.type === 'ai' ? 'bg-eco-100 text-eco-600' : 'bg-clay-800 text-white'
                                                    }`}>
                                                    {m.type === 'ai' ? <Sparkles className="w-4 h-4" /> : <User className="w-4 h-4" />}
                                                </div>
                                                <div className={`p-4 rounded-3xl text-sm font-medium shadow-sm border ${m.type === 'ai'
                                                    ? 'bg-emerald-100 border-emerald-200 text-emerald-900 rounded-tl-none'
                                                    : 'bg-white border-clay-200 text-clay-900 rounded-tr-none'
                                                    }`}>
                                                    {m.text}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}

                                    {isLoading && (
                                        <div className="flex justify-start">
                                            <div className="flex gap-3 max-w-[85%]">
                                                <div className="w-8 h-8 rounded-2xl bg-eco-100 text-eco-600 flex items-center justify-center shrink-0">
                                                    <Sparkles className="w-4 h-4" />
                                                </div>
                                                <div className="bg-white dark:bg-white/5 border border-clay-100 dark:border-white/10 p-4 rounded-3xl rounded-tl-none">
                                                    <div className="flex gap-1">
                                                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-eco-400 rounded-full" />
                                                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-eco-500 rounded-full" />
                                                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-eco-600 rounded-full" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input Area */}
                                <form onSubmit={handleSend} className="p-4 bg-white dark:bg-emerald-900 border-t-2 border-emerald-500">
                                    <div className="relative flex items-center">
                                        <input
                                            type="text"
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            placeholder="Ask about materials, brands..."
                                            className="w-full bg-emerald-50 dark:bg-white/5 border border-emerald-200 dark:border-white/10 rounded-2xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors text-emerald-900 dark:text-white placeholder:text-emerald-500 dark:placeholder:text-white/40"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!input.trim() || isLoading}
                                            className="absolute right-2 p-2 bg-eco-600 text-white rounded-xl hover:bg-eco-700 transition-colors disabled:opacity-50 disabled:grayscale"
                                        >
                                            <Send className="w-4 h-4" />
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Button */}
            <motion.button
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleChat}
                className="w-14 h-14 md:w-16 md:h-16 rounded-[20px] md:rounded-[24px] bg-white dark:bg-clay-800 shadow-[0_20px_50px_rgba(22,163,74,0.3)] border-2 border-eco-500/20 dark:border-white/10 flex items-center justify-center pointer-events-auto overflow-hidden group relative"
                style={{ zIndex: 9999 }}
            >
                <img
                    src="/chatbot.gif"
                    alt="Eco Assistant Chatbot"
                    className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                />
                <div className="absolute inset-0 bg-eco-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.button>
        </div>
    );
};

export default EcoAssistantChat;
