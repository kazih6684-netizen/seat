import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { AuthPage } from './components/AuthPage';
import { BookingForm } from './components/BookingForm';
import { UnityAdmin } from './components/UnityAdmin';
import { UnityHistory } from './components/UnityHistory';
import { Background } from './components/UnityUI';
import { History as HistoryIcon, Home, ShieldAlert, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const { isPortalAccess, isAdmin, loading, adminLogin, logout } = useAuth();
  const [activeUserTab, setActiveUserTab] = useState<'form' | 'history'>('form');
  const [unlockedMember, setUnlockedMember] = useState<any>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-4 border-gold/20 border-t-gold rounded-full animate-spin shadow-[0_0_30px_rgba(245,200,66,0.3)]"></div>
          <p className="font-cinzel text-gold text-lg font-bold tracking-[4px] animate-pulse">Unity Earning</p>
        </div>
      </div>
    );
  }

  // Admin View
  if (isAdmin) {
    return (
      <>
        <Background />
        <UnityAdmin />
      </>
    );
  }

  // Access Portal Login
  if (!isPortalAccess) {
    return (
      <>
        <Background />
        <AuthPage />
      </>
    );
  }

  const handleLogout = () => {
    setUnlockedMember(null);
    logout();
  };

  // User Portal
  return (
    <div className="min-h-screen relative font-nunito flex flex-col">
      <Background />
      
      {/* User Header */}
      <header className="fixed top-0 left-0 right-0 z-40 px-6 py-4 flex justify-between items-center glass-card border-b border-white/5">
          <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gold rounded-xl flex items-center justify-center text-navy-mid font-cinzel font-black shadow-lg">U</div>
              <h1 className="font-cinzel text-xl font-bold text-white tracking-tight hidden md:block">Unity Earning</h1>
          </div>

          <div className="flex items-center gap-3">
              <button 
                onClick={adminLogin}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gold/10 text-gold text-[10px] font-black uppercase tracking-widest border border-gold/20 hover:bg-gold hover:text-navy-mid transition-all"
              >
                <ShieldAlert className="w-3.5 h-3.5" /> Admin Portal
              </button>
              <button 
                onClick={handleLogout}
                className="p-2.5 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all shadow-lg"
              >
                <LogOut className="w-4 h-4" />
              </button>
          </div>
      </header>

      <main className="flex-1 pt-24 pb-32 overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeUserTab}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            {activeUserTab === 'form' ? (
              <BookingForm 
                onUnlock={(member) => setUnlockedMember(member)} 
                initialMember={unlockedMember}
              />
            ) : (
              <UnityHistory memberName={unlockedMember?.name} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating Bottom Nav */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 w-full max-w-sm px-6">
        <nav className="glass-card flex items-center gap-1 p-1.5 rounded-[2rem] border border-white/10 shadow-2xl">
          <button
            onClick={() => setActiveUserTab('form')}
            className={`
              flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full font-bold text-[13px] transition-all duration-500
              ${activeUserTab === 'form' ? 'gold-gradient text-navy-mid shadow-lg' : 'text-muted hover:text-white hover:bg-white/5'}
            `}
          >
            <Home className="w-4 h-4" /> Booking
          </button>
          
          <AnimatePresence>
            {unlockedMember && (
              <motion.button
                initial={{ opacity: 0, x: 20, width: 0 }}
                animate={{ opacity: 1, x: 0, width: 'auto' }}
                exit={{ opacity: 0, x: 20, width: 0 }}
                onClick={() => setActiveUserTab('history')}
                className={`
                  flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full font-bold text-[13px] transition-all duration-500 overflow-hidden whitespace-nowrap
                  ${activeUserTab === 'history' ? 'gold-gradient text-navy-mid shadow-lg' : 'text-muted hover:text-white hover:bg-white/5'}
                `}
              >
                <HistoryIcon className="w-4 h-4" /> My History
              </motion.button>
            )}
          </AnimatePresence>
        </nav>
      </div>
    </div>
  );
}
