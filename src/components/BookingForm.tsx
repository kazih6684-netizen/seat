import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { SearchableDropdown } from './SearchableDropdown';
import { Booking, TeamMember, PaymentMethod } from '../types';
import { OperationType, handleFirestoreError } from '../lib/utils';
import { 
  CreditCard, 
  Phone, 
  Hash, 
  Lock, 
  Send,
  User,
  Banknote,
  Navigation,
  X,
  Search,
  Users,
  Shield,
  Smartphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UnityInvoice } from './UnityInvoice';
import { GoldButton } from './UnityUI';

interface Props {
  onUnlock?: (member: TeamMember) => void;
  initialMember?: TeamMember | null;
}

export function BookingForm({ onUnlock, initialMember }: Props) {
  const { user } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(initialMember || null);
  const [pinModal, setPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(!!initialMember);
  const [tab, setTab] = useState<'leader' | 'trainer'>('leader');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [userName, setUserName] = useState('');
  const [lastDigit, setLastDigit] = useState('');
  const [amount, setAmount] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bKash');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showInvoice, setShowInvoice] = useState<Booking | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'team_members'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ms: TeamMember[] = [];
      snapshot.forEach((doc) => {
        ms.push({ id: doc.id, ...doc.data() } as TeamMember);
      });
      setMembers(ms);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'team_members');
    });

    return () => unsubscribe();
  }, []);

  const filteredMembers = members.filter(m => 
    m.type === tab && 
    (searchQuery === '' || m.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleMemberSelect = (member: TeamMember) => {
    setSelectedMember(member);
    setPinModal(true);
    setPinInput('');
    setIsUnlocked(false);
  };

  const verifyPin = () => {
    if (selectedMember && pinInput === selectedMember.password) {
      setIsUnlocked(true);
      setPinModal(false);
      setError('');
      if (onUnlock) onUnlock(selectedMember);
    } else {
      setError('ভুল পাসওয়ার্ড! সঠিক পাসওয়ার্ড দিয়ে আবার চেষ্টা করুন।');
      setPinInput('');
      setTimeout(() => setError(''), 3000);
    }
  };

  const generateUEID = () => {
    return "UE-" + Math.floor(10000 + Math.random() * 90000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isUnlocked) return;
    setSubmitting(true);

    try {
      const ueId = generateUEID();
      const bookingData: Omit<Booking, 'id'> = {
        userId: ueId,
        userName: userName || '',
        selectedMemberName: selectedMember?.name || '',
        lastDigit,
        amount: Number(amount),
        whatsapp,
        paymentMethod,
        status: 'pending',
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'bookings'), {
        ...bookingData,
        authUid: user?.uid || null
      });
      
      setShowInvoice({ id: docRef.id, ...bookingData, createdAt: new Date() });
      
      // Reset
      setUserName('');
      setLastDigit('');
      setAmount('');
      setWhatsapp('');
      setIsUnlocked(false);
      setSelectedMember(null);
    } catch (err: any) {
      if (err.message.includes('permission') || err.message.includes('auth/')) {
        console.warn('Silent Auth/Permission issue:', err.message);
        // We still show the error if it's literally a rule failure, 
        // but we want to avoid showing technical "Anonymous Auth disabled" messages to users.
        if (!err.message.includes('permission')) {
            setError('পেমেন্ট ভেরিফিকেশনে ত্রুটি হয়েছে। আবার চেষ্টা করুন।');
        } else {
            handleFirestoreError(err, OperationType.CREATE, 'bookings');
        }
      } else {
        setError(err.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-[340px] mx-auto px-1 py-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card rounded-[1.8rem] p-0 relative overflow-hidden border border-white/5 shadow-2xl"
      >
        <div className="absolute top-0 left-0 w-full h-1 gold-gradient"></div>
        
        {/* Main Status / Branding */}
        <div className="flex flex-col items-center justify-center pt-6 pb-2 text-center">
            <div className="relative mb-3">
                <div className="absolute inset-0 bg-gold/20 blur-xl rounded-full"></div>
                <div className="relative w-11 h-11 bg-[#0f172a] border border-gold/30 rounded-xl flex items-center justify-center text-gold shadow-lg">
                    <Shield className="w-5 h-5" />
                </div>
            </div>
            <p className="text-[7px] font-black uppercase tracking-[0.4em] text-gold/60 mb-1">Official Enrollment</p>
            <h1 className="text-lg font-black text-white tracking-[0.05em] uppercase px-4 leading-tight">
                SEAT <span className="text-gold">BOOKING</span>
            </h1>
        </div>

        <div className="px-4 pb-6 space-y-5">
          {!selectedMember ? (
            <div className="space-y-6">
              {/* Luxury Category Toggles */}
              <div className="grid grid-cols-2 p-1 bg-white/[0.03] rounded-xl border border-white/5">
                <button 
                  onClick={() => setTab('leader')}
                  className={`flex items-center justify-center gap-2 py-3 rounded-lg font-black text-[8px] tracking-widest uppercase transition-all duration-300 ${tab === 'leader' ? 'gold-gradient text-navy-mid' : 'text-white/20'}`}
                >
                  <Navigation className="w-2.5 h-2.5" />
                  Leaders
                </button>
                <button 
                  onClick={() => setTab('trainer')}
                  className={`flex items-center justify-center gap-2 py-3 rounded-lg font-black text-[8px] tracking-widest uppercase transition-all duration-300 ${tab === 'trainer' ? 'gold-gradient text-navy-mid' : 'text-white/20'}`}
                >
                  <Users className="w-2.5 h-2.5" />
                  Trainers
                </button>
              </div>

              {/* Minimalist Professional Search */}
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/10 group-focus-within:text-gold" />
                <input 
                  type="text"
                  placeholder={`Find ${tab}...`}
                  className="w-full pl-10 pr-4 py-3.5 bg-white/[0.02] border border-white/5 rounded-xl focus:border-gold/20 outline-none text-[10px] font-bold text-white placeholder:text-white/10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Refined Counselor Selection Grid */}
              <div className="grid grid-cols-1 gap-2 max-h-[220px] overflow-y-auto pr-0.5">
                <AnimatePresence mode="popLayout">
                  {filteredMembers.map((m) => (
                    <motion.button
                      key={m.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={() => handleMemberSelect(m)}
                      className="group flex items-center gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:border-gold/30 hover:bg-gold/5 transition-all text-left"
                    >
                      <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-navy-mid transition-all">
                        <User className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[6px] text-gold/40 font-black tracking-widest uppercase">Verified Expert</p>
                        <p className="text-xs font-black text-white group-hover:text-gold transition-colors">{m.name}</p>
                      </div>
                      <Lock className="w-3 h-3 text-white/10 group-hover:text-gold" />
                    </motion.button>
                  ))}
                </AnimatePresence>
                {filteredMembers.length === 0 && (
                  <p className="text-center py-10 text-[9px] text-white/10 font-black uppercase tracking-widest">No results</p>
                )}
              </div>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {isUnlocked ? (
                <motion.form
                  key="form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onSubmit={handleSubmit}
                  className="space-y-3"
                >
                  <div className="p-3 bg-gold/5 border border-gold/20 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-gold/20 flex items-center justify-center text-gold">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-[6px] text-gold/60 font-black uppercase tracking-widest">Counselor</p>
                        <p className="text-[10px] font-black text-white">{selectedMember.name}</p>
                      </div>
                    </div>
                    <button 
                      type="button"
                      onClick={() => { setSelectedMember(null); setIsUnlocked(false); }}
                      className="text-white/20 hover:text-gold active:scale-90 transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    <div className="relative group">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/10 group-focus-within:text-gold" />
                      <input
                        required
                        type="text"
                        placeholder="Your Full Name"
                        className="w-full pl-10 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:border-gold/30 outline-none text-[10px] font-bold text-white uppercase placeholder:text-white/10"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="relative group">
                        <Banknote className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/10" />
                        <input
                          required
                          type="number"
                          placeholder="Amount"
                          className="w-full pl-10 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:border-gold/30 outline-none text-[10px] font-bold text-white"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                        />
                      </div>
                      <div className="relative group">
                        <Navigation className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/10" />
                        <input
                          required
                          type="text"
                          maxLength={4}
                          placeholder="Trx Digit"
                          className="w-full pl-10 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:border-gold/30 outline-none text-[10px] font-bold text-white font-mono"
                          value={lastDigit}
                          onChange={(e) => setLastDigit(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="relative group">
                      <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/10" />
                      <input
                        required
                        type="tel"
                        placeholder="WhatsApp Number"
                        className="w-full pl-10 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:border-gold/30 outline-none text-[10px] font-bold text-white"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-4 gap-1.5">
                      {['bKash', 'Nagad', 'Rocket', 'Cash'].map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setPaymentMethod(m as any)}
                          className={`py-2.5 rounded-lg border font-black text-[7px] tracking-tight uppercase transition-all ${paymentMethod === m ? 'border-gold bg-gold/10 text-gold' : 'border-white/5 bg-white/5 text-white/10'}`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  <GoldButton type="submit" loading={submitting} className="mt-2 py-3.5 rounded-xl text-[8px] tracking-[0.3em]">
                      RESERVE SEAT
                  </GoldButton>
                </motion.form>
              ) : (
                <div className="text-center py-10 px-4 bg-gold/[0.02] rounded-3xl border border-dashed border-gold/20">
                  <Lock className="w-10 h-10 text-gold/30 mx-auto mb-4" />
                  <p className="text-[10px] text-white font-black uppercase tracking-widest mb-6">Verification Required</p>
                  <button 
                    onClick={() => setPinModal(true)} 
                    className="w-full py-4 rounded-xl gold-gradient text-navy-mid font-black text-[9px] tracking-widest uppercase shadow-xl"
                  >
                    Enter Pin Code
                  </button>
                </div>
              )}
            </AnimatePresence>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {pinModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/95 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="glass-card w-full max-w-sm rounded-[2.5rem] p-8 text-center relative border-2 border-gold/40 shadow-[0_0_50px_rgba(245,200,66,0.15)]"
            >
              {/* Header Icon */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-gold rounded-full flex items-center justify-center text-navy-mid shadow-[0_0_30px_rgba(245,200,66,0.6)]">
                <Lock className="w-10 h-10" />
              </div>

              <div className="pt-8">
                <h3 className="font-cinzel text-2xl font-bold text-white mb-2">Member Unlock</h3>
                <p className="text-muted text-sm mb-8 leading-relaxed">
                  মেম্বার ভেরিফিকেশন। <span className="text-gold font-bold">{selectedMember?.name}</span> হিসেবে লগইন করতে আপনার <span className="text-white font-bold">৪-ডিজিট পিন</span> দিন।
                </p>
                
                <div className="space-y-6">
                  <div className="relative inline-block">
                    <input
                      autoFocus
                      type="password"
                      maxLength={4}
                      inputMode="numeric"
                      className="w-48 text-center text-4xl font-black bg-navy/50 border-2 border-navy-border rounded-2xl py-5 text-gold focus:border-gold outline-none tracking-[12px] shadow-inner transition-all"
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && verifyPin()}
                    />
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-gradient-to-r from-transparent via-gold/50 to-transparent"></div>
                  </div>
                  
                  <AnimatePresence>
                    {error && (
                      <motion.p 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-red-400 text-xs font-black tracking-wide bg-red-400/10 py-2 rounded-lg border border-red-400/20"
                      >
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>
                  
                  <div className="flex gap-4 pt-4">
                      <button 
                          onClick={() => { setPinModal(false); setSelectedMember(null); }}
                          className="flex-1 py-4 rounded-xl font-bold bg-white/5 text-muted hover:bg-white/10 transition-all border border-white/5"
                      >
                          বাতিল
                      </button>
                      <button 
                          onClick={verifyPin}
                          className="flex-1 py-4 rounded-xl font-bold gold-gradient text-navy-mid shadow-lg shadow-gold/20 hover:scale-[1.02] transition-all"
                      >
                          যাচাই করুন
                      </button>
                  </div>
                </div>
              </div>

              <p className="mt-8 text-[9px] text-muted uppercase tracking-[3px] font-black opacity-40">Secure Access Unity Earning</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showInvoice && (
          <UnityInvoice booking={showInvoice} onClose={() => setShowInvoice(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
