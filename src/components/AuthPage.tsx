import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { GoldButton } from './UnityUI';
import { Eye, EyeOff, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';

export function AuthPage() {
  const { mainPassword, setPortalAccess, adminLogin } = useAuth();
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [strength, setStrength] = useState(0);

  useEffect(() => {
    setStrength(Math.min(4, Math.floor(password.length / 2)));
    setError(false);
  }, [password]);

  const handleLogin = async () => {
    if (!password) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    
    if (password === mainPassword) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f5c842', '#ffe680', '#ffffff']
      });
      setTimeout(() => setPortalAccess(true), 1500);
    } else {
      setError(true);
      setPassword('');
      setLoading(false);
      setTimeout(() => setError(false), 3000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="glass-card w-full max-w-md rounded-3xl p-10 relative overflow-hidden"
      >
        {/* Top Gold Bar */}
        <div className="absolute top-0 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent"></div>
        
        {/* Admin Login Button */}
        <button 
          onClick={adminLogin}
          className="absolute top-4 right-4 flex items-center gap-1.5 text-[10px] font-black text-gold/60 uppercase tracking-widest hover:text-gold transition-colors"
        >
          <ShieldAlert className="w-3 h-3" /> Admin Login
        </button>

        <div className="text-center mb-10">
          <div className="w-20 h-20 mx-auto mb-6 relative">
            <div className="absolute inset-0 border border-gold/30 rounded-full animate-[spin_10s_linear_infinite]" style={{ borderStyle: 'dashed' }}></div>
            <div className="absolute inset-3 bg-gold rounded-full flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(245,200,66,0.4)]">
              🎓
            </div>
          </div>
          <p className="text-[10px] font-black tracking-[4px] uppercase text-gold/70 mb-2">E-Learning Platform</p>
          <h1 className="font-cinzel text-3xl font-bold tracking-tight text-white mb-2">Unity Earning</h1>
          <p className="text-sm text-muted">Seat Booking System • Secure Access</p>
        </div>

        {error && (
          <motion.div
            initial={{ x: -10 }}
            animate={{ x: [0, -10, 10, -10, 0] }}
            className="flex items-center gap-3 p-4 mb-6 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-sm"
          >
            <span>🔒</span> Incorrect password. Please try again.
          </motion.div>
        )}

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-muted">Access Password</label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                placeholder="Enter your password"
                className="w-full bg-navy/70 border-1.5 border-navy-border rounded-xl py-4 pl-5 pr-14 text-white font-nunito tracking-[3px] focus:border-gold focus:outline-none transition-all duration-300"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-gold transition-colors"
              >
                {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
              <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] bg-gold transition-all duration-500 ${password ? 'w-[calc(100%-24px)]' : 'w-0'}`}></div>
            </div>
          </div>

          <div className={`flex gap-1 transition-opacity duration-300 ${password.length > 0 ? 'opacity-100' : 'opacity-0'}`}>
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`flex-1 h-[3px] rounded-full transition-colors duration-400 ${i < strength ? 'bg-gold' : 'bg-navy-border'}`}
              ></div>
            ))}
          </div>

          <GoldButton onClick={handleLogin} loading={loading}>
            ENTER PORTAL
          </GoldButton>

          <p className="text-center text-[11px] text-muted/60 mt-6 tracking-wide">
            🔐 Authorized personnel only • Unity Earning 2025
          </p>
        </div>
      </motion.div>
    </div>
  );
}
