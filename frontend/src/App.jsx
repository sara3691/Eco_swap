import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import AnalysisResult from './components/AnalysisResult';
import Alternatives from './components/Alternatives';
import EcoAssistantChat from './components/EcoAssistantChat';
import EcoGrowthJourney from './components/EcoGrowthJourney';
import EcoImpactCommunity from './components/EcoImpactCommunity';
import LoginModal from './components/LoginModal';
import History from './components/History';
import { Trophy, TrendingUp, TrendingDown, Users, Leaf, Star, Shield, ArrowDown, Layout } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

function App() {
  const [page, setPage] = useState('home');
  const [analysis, setAnalysis] = useState(null);
  const [theme, setTheme] = useState('light');
  const [userStats, setUserStats] = useState(null);
  const [toast, setToast] = useState(null);
  const [currentUser, setCurrentUser] = useState(null); // logged-in user
  const [showLogin, setShowLogin] = useState(false);

  // On mount: check localStorage for existing session
  useEffect(() => {
    const saved = localStorage.getItem('ecoswap_user');
    if (saved) {
      try {
        const user = JSON.parse(saved);
        setCurrentUser(user);
        fetchUserStats('daily', {}, user.id);
      } catch {
        localStorage.removeItem('ecoswap_user');
        setShowLogin(true);
      }
    } else {
      // First visit — show login after short delay
      setTimeout(() => setShowLogin(true), 800);
    }
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleLogin = (user) => {
    setCurrentUser(user);
    setShowLogin(false);
    setUserStats({
      points: user.points || 0,
      badge_name: user.badge_name || 'Seed',
      badge_icon: user.badge_icon || '🌱',
      eco_level: user.eco_level || 1,
      eco_swaps_count: user.eco_swaps_count || 0,
      eco_streak: user.eco_streak || 0,
    });
    fetchUserStats('daily', {}, user.id);
  };

   const handleLogout = async () => {
    if (currentUser?.session_id) {
      try {
        await axios.post('https://eco-swap-thci.onrender.com/logout', { session_id: currentUser.session_id });
      } catch (err) {
        console.error("Logout tracking error:", err);
      }
    }
    localStorage.removeItem('ecoswap_user');
    setCurrentUser(null);
    setUserStats(null);
    setAnalysis(null);
    setPage('home');
    setShowLogin(true);
  };

  const fetchUserStats = async (actionType = 'daily', extraData = {}, userId = null) => {
    const uid = userId || currentUser?.id;
    if (!uid) return;
    try {
      const response = await axios.post('https://eco-swap-thci.onrender.com/gamification/update', {
        user_id: uid,
        action_type: actionType,
        ...extraData
      });
      if (response.data.status === 'success') {
        if (response.data.level_upgraded) {
          setToast({ message: `🌱 Your impact is growing! You've evolved to ${response.data.stats.badge_name}!`, type: 'success' });
          setTimeout(() => setToast(null), 5000);
        }
        const newStats = response.data.stats;
        setUserStats(newStats);
        // Update localStorage too
        if (currentUser) {
          const updated = { ...currentUser, ...newStats };
          localStorage.setItem('ecoswap_user', JSON.stringify(updated));
          setCurrentUser(updated);
        }
      }
    } catch (err) {
      console.error("Fetch Stats Error:", err);
    }
  };

  useEffect(() => {
    if (currentUser) fetchUserStats();
  }, []);

  const renderPage = () => {
    switch (page) {
      case 'alternatives':
        return (
          <Alternatives
            category={analysis?.category || 'Clothing'}
            productName={analysis?.product_name || ''}
            userId={currentUser?.id}
            onSwap={(pName, aName) => fetchUserStats('swap', { product_name: pName, alternative_name: aName })}
          />
        );
      case 'history':
        return <History userId={currentUser?.id} />;
      case 'leaderboard':
        return <LeaderboardPage />;
      case 'reviews':
        return <EcoImpactCommunity userStats={userStats} />;
      default:
        return (
          <div className="pb-40">
            <Hero 
              userId={currentUser?.id}
              onAnalyze={(data) => {
                setAnalysis(data.analysis);
                // Update stats for completing an analysis
                fetchUserStats('analysis');
                document.getElementById('analysis-section')?.scrollIntoView({ behavior: 'smooth' });
              }} 
            />

            <EcoGrowthJourney stats={userStats} onUpdate={() => fetchUserStats('daily')} />

            <div id="analysis-section" className="scroll-mt-32">
              <AnimatePresence>
                {analysis && (
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -50 }}
                  >
                    <AnalysisResult data={analysis} />

                    {/* Eco Alternatives Section - shows after 2s delay with real prices, images & buy links */}
                    <div id="alternatives-section" className="mt-12">
                      <Alternatives
                        category={analysis.category}
                        productName={analysis.product_name}
                        userId={currentUser?.id}
                        onSwap={(pName, aName) => fetchUserStats('swap', { product_name: pName, alternative_name: aName })}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {!analysis && <HomeInfo />}
          </div>
        );
    }
  };

  return (
    <div className={`min-h-screen w-full relative bg-grad-system transition-colors duration-500 overflow-x-hidden ${theme}`}>
      {/* Login Modal — shown on first visit or after logout */}
      {showLogin && <LoginModal onLogin={handleLogin} />}

      <Header
        setPage={setPage}
        currentPage={page}
        theme={theme}
        setTheme={setTheme}
        userStats={userStats}
        currentUser={currentUser}
        onLoginClick={() => setShowLogin(true)}
        onLogout={handleLogout}
      />

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-12 left-1/2 z-[100] bg-eco-600 text-white px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-4 border border-white/20"
          >
            <div className="bg-white/20 p-2 rounded-xl">
              <Leaf className="w-5 h-5" />
            </div>
            <p className="font-black italic uppercase tracking-tight">{toast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="container mx-auto relative z-10">
        {renderPage()}
      </main>

      <footer className="border-t border-clay-100 dark:border-white/5 py-12 md:py-24 mt-12 md:mt-20 text-center relative overflow-hidden bg-white/40 dark:bg-black/40">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[600px] h-[200px] md:h-[300px] bg-eco-100/30 blur-[80px] md:blur-[100px] -z-10" />
        <div className="flex items-center justify-center gap-3 mb-6">
          <Leaf className="w-5 h-5 md:w-6 md:h-6 text-eco-600" /> <span className="font-black tracking-tighter text-xl md:text-2xl text-clay-900 dark:text-white italic uppercase">ECOSWAP</span>
        </div>
        <div className="flex flex-wrap justify-center gap-4 md:gap-8 mb-8 md:mb-12 text-clay-400 font-bold text-xs md:text-sm uppercase tracking-widest px-4">
          <a href="#" className="hover:text-eco-600 transition-colors">Exchange</a>
          <a href="#" className="hover:text-eco-600 transition-colors">Manifesto</a>
          <a href="#" className="hover:text-eco-600 transition-colors">Privacy</a>
        </div>
        <p className="text-clay-500 font-bold text-[9px] md:text-xs uppercase tracking-[2px] md:tracking-[3px] px-4">© 2026 EcoSwap AI Labs. All rights reserved.</p>
      </footer>

      <EcoAssistantChat />
    </div>
  );
}

const HomeInfo = () => (
  <motion.div
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 px-4 md:px-6 mt-12 md:mt-20"
  >
    <InfoCard
      icon={<Shield className="w-6 h-6 md:w-8 md:h-8 text-eco-600" />}
      title="Verified Data"
      desc="We use open-source LCA databases to provide the most accurate footprint estimations."
    />
    <InfoCard
      icon={<Star className="w-6 h-6 md:w-8 md:h-8 text-orange-400" />}
      title="Incentivized"
      desc="Earn badges and points for every sustainable choice you make through EcoSwap."
    />
    <InfoCard
      icon={<TrendingDown className="w-6 h-6 md:w-8 md:h-8 text-blue-400" />}
      title="Beat Greenwash"
      desc="Our AI identifies vague marketing terms and highlights the true material composition."
    />
  </motion.div>
);

const InfoCard = ({ icon, title, desc }) => (
  <div className="glass-morphism p-8 md:p-10 rounded-[32px] md:rounded-[40px] transition-all group bg-white/60 dark:bg-white/5 border-clay-100 dark:border-white/5 hover:border-eco-200 dark:hover:border-white/10 shadow-lg">
    <div className="mb-4 md:mb-6 group-hover:scale-110 transition-transform origin-left">{icon}</div>
    <h3 className="text-xl md:text-2xl font-black mb-3 md:mb-4 italic uppercase tracking-tight text-clay-900 dark:text-white leading-tight">{title}</h3>
    <p className="text-sm md:text-base text-clay-500 font-medium leading-relaxed">{desc}</p>
  </div>
);

const LeaderboardPage = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await axios.get('https://eco-swap-thci.onrender.com/leaderboard');
        setUsers(response.data.length > 0 ? response.data : [
          { username: 'EcoGuardian_42', points: 2850, badge: 'Earth Guardian', eco_swaps_count: 142 },
          { username: 'NatureSurfer', points: 1920, badge: 'Earth Guardian', eco_swaps_count: 96 },
          { username: 'GreenVibes', points: 1100, badge: 'Climate Hero', eco_swaps_count: 55 },
          { username: 'ReuseKing', points: 640, badge: 'Climate Hero', eco_swaps_count: 32 },
          { username: 'Seedling_X', points: 150, badge: 'Eco Warrior', eco_swaps_count: 7 }
        ]);
      } catch (err) {
        console.error(err);
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <div className="page-bg-container">
      {/* Background Section */}
      <img
        src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2560&auto=format&fit=crop"
        alt="Mountain Background"
        className="page-bg-image"
      />
      <div className="page-bg-overlay" />

      <div className="relative z-10 py-20 md:py-40 max-w-5xl mx-auto px-4 md:px-6">
        <div className="text-center mb-16 md:mb-24">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-block p-4 bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-[24px] md:rounded-[32px] mb-6 md:mb-8 border border-white/50 shadow-2xl"
          >
            <Trophy className="w-8 h-8 md:w-12 md:h-12 text-orange-400" />
          </motion.div>
          <h2 className="text-4xl md:text-8xl font-black mb-4 md:mb-6 tracking-tight uppercase italic text-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] leading-tight">
            Global <br /><span className="eco-text-gradient">Hall of Fame.</span>
          </h2>
          <p className="text-white/90 text-lg md:text-xl font-bold max-w-xl mx-auto italic drop-shadow-md px-2">
            The world's most dedicated sustainability champions.
          </p>
        </div>

        <div className="glass-morphism rounded-[32px] md:rounded-[48px] overflow-hidden border-white/20 divide-y divide-clay-100 dark:divide-white/5 bg-white/60 dark:bg-black/40 backdrop-blur-2xl shadow-3xl">
          {users.map((user, i) => (
            <motion.div
              key={user.username}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 md:p-10 hover:bg-white/40 dark:hover:bg-white/5 transition-all group gap-4"
            >
              <div className="flex items-center gap-6 md:gap-10">
                <span className={`text-2xl md:text-4xl font-black w-8 md:w-12 italic ${i < 3 ? 'text-eco-500' : 'text-clay-300 dark:text-clay-700'}`}>{i + 1}</span>
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-3xl bg-white dark:bg-white/10 border border-white/20 flex items-center justify-center text-xl md:text-2xl font-black text-clay-900 dark:text-white shadow-sm italic transition-transform group-hover:rotate-6">
                  {user.username.charAt(0)}
                </div>
                <div>
                  <h3 className="font-black text-xl md:text-2xl mb-1 flex items-center gap-2 md:gap-3 text-clay-900 dark:text-white group-hover:text-eco-600 transition-colors leading-tight">
                    {user.username} {i === 0 && <Star className="w-4 h-4 md:w-5 md:h-5 fill-yellow-400 text-yellow-400" />}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 md:gap-4">
                    <span className="text-lg">{user.badge_icon}</span>
                    <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[2px] md:tracking-[3px] text-eco-600 dark:text-eco-400">
                      {user.badge_name || user.badge}
                    </span>
                    <span className="hidden sm:block w-1 h-1 bg-clay-200 dark:bg-white/10 rounded-full" />
                    <span className="text-[8px] md:text-[10px] font-black text-clay-500 dark:text-clay-400 uppercase tracking-[2px] md:tracking-[3px]">{user.eco_swaps_count} Swaps</span>
                  </div>
                </div>
              </div>
              <div className="text-left sm:text-right w-full sm:w-auto pl-14 sm:pl-0">
                <div className="text-2xl md:text-4xl font-black text-clay-900 dark:text-white italic tracking-tight leading-none">{user.points.toLocaleString()}</div>
                <div className="text-[8px] md:text-[10px] font-black text-clay-400 uppercase tracking-[2px] md:tracking-[4px] mt-1">Impact Score</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};


export default App;
