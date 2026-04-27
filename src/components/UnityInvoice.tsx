import React, { useRef } from 'react';
import { Booking } from '../types';
import { motion } from 'motion/react';
import { 
  X, 
  CheckCircle, 
  Download, 
  User, 
  Shield, 
  Smartphone,
  Navigation
} from 'lucide-react';

interface Props {
  booking: Omit<Booking, 'id'> & { id: string };
  onClose: () => void;
}

export const UnityInvoice: React.FC<Props> = ({ booking, onClose }) => {
  const invoiceRef = useRef<HTMLDivElement>(null);

  const formatDate = (date: any) => {
    if (!date) return '---';
    const d = date instanceof Date ? date : (date.toDate ? date.toDate() : new Date(date));
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 bg-navy/98 backdrop-blur-2xl overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        className="relative w-full max-w-[320px] my-auto"
      >
        <button 
          onClick={onClose}
          className="absolute -top-12 right-0 text-white/40 hover:text-gold transition-colors flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em]"
        >
          CLOSE <X className="w-4 h-4" />
        </button>

        <div 
          ref={invoiceRef}
          className="bg-[#0a0f1d] rounded-[2rem] border border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden relative flex flex-col"
        >
          {/* Professional Header */}
          <div className="relative h-28 bg-[#0d1425] flex flex-col items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-gold/10 to-transparent"></div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-10 h-10 bg-gold rounded-[1rem] flex items-center justify-center text-navy-mid shadow-[0_8px_25px_rgba(245,200,66,0.3)] mb-2.5">
                <CheckCircle className="w-5 h-5" />
              </div>
              <p className="text-[8px] text-gold font-black uppercase tracking-[0.5em] mb-1">Unity Earning</p>
              <h1 className="font-cinzel text-lg font-black text-white tracking-[0.15em] leading-none uppercase">
                SEAT <span className="text-gold">BOOKING</span>
              </h1>
              {booking.status === 'confirmed' && (
                <div className="mt-2 px-3 py-0.5 bg-green-500/20 border border-green-500/30 rounded-full">
                  <p className="text-[7px] text-green-400 font-black uppercase tracking-[0.2em]">Confirmed by Admin</p>
                </div>
              )}
            </div>
          </div>

          {/* Essential Info Block */}
          <div className="px-6 pt-6 pb-8 space-y-4">
            <div className="flex justify-between items-end border-b border-white/10 pb-4">
              <div className="space-y-1">
                <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest opacity-60">Ref ID</p>
                <p className="text-[11px] font-black text-gold font-mono uppercase tracking-tight">#{booking.userId}</p>
              </div>
              <div className="text-right space-y-1">
                <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest opacity-60">Issue Date</p>
                <p className="text-[10px] text-white font-bold opacity-90">{formatDate(booking.createdAt)}</p>
              </div>
            </div>

            <div className="space-y-3">
              {/* Applicant */}
              <div className="flex items-center gap-4 p-4 bg-white/[0.03] rounded-2xl border border-white/5">
                <div className="w-9 h-9 rounded-xl bg-gold/10 flex items-center justify-center text-gold border border-gold/10">
                   <User className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest opacity-60">Candidate</p>
                  <p className="text-[11px] font-black text-white uppercase line-clamp-1">{booking.userName}</p>
                </div>
              </div>

              {/* Counselor */}
              <div className="flex items-center gap-4 p-4 bg-gold/[0.05] rounded-2xl border border-gold/20">
                <div className="w-9 h-9 rounded-xl bg-gold/20 flex items-center justify-center text-gold shadow-[0_0_15px_rgba(245,200,66,0.1)]">
                   <Navigation className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-[8px] text-gold font-black uppercase tracking-widest opacity-80">Counselor</p>
                  <p className="text-[11px] font-black text-white uppercase line-clamp-1">{booking.selectedMemberName}</p>
                </div>
              </div>

              {/* Grid Data */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-white/[0.03] rounded-2xl border border-white/5">
                  <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest opacity-60 mb-1">Fee</p>
                  <p className="text-base font-black text-white tracking-widest">৳{booking.amount}</p>
                </div>
                <div className="p-4 bg-white/[0.03] rounded-2xl border border-white/5">
                  <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest opacity-60 mb-1">{booking.paymentMethod}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-black text-gold uppercase tracking-widest">{booking.lastDigit}</p>
                    <div className="flex items-center gap-1 opacity-40">
                      <Shield className="w-2.5 h-2.5 text-white" />
                      <p className="text-[7px] font-black text-white uppercase">Safe</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* WhatsApp */}
              <div className="px-4 py-3 bg-white/[0.02] rounded-2xl border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                   <Smartphone className="w-4 h-4 text-gold/40" />
                   <p className="text-[11px] font-bold text-white/90">{booking.whatsapp}</p>
                </div>
                <div className="flex items-center gap-1.5 opacity-30">
                   <Shield className="w-3 h-3 text-gold" />
                   <p className="text-[7px] font-black uppercase tracking-widest text-white">Security Check</p>
                </div>
              </div>
            </div>

            <div className="pt-3 flex flex-col items-center">
              <p className="text-[7px] text-white/10 text-center font-bold uppercase tracking-[0.3em]">
                Official Digital Receipt • Unity Earning Platform
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="p-4 bg-black/60 border-t border-white/10 flex gap-3">
            <button 
               onClick={onClose}
               className="flex-[0.4] py-4 rounded-2xl bg-white/5 text-white/30 font-black text-[9px] tracking-widest uppercase transition-all hover:bg-white/10 hover:text-white active:scale-95"
             >
               Close
             </button>
             <button 
               className="flex-1 py-4 rounded-2xl gold-gradient text-navy-mid font-black text-[10px] tracking-widest uppercase shadow-2xl flex items-center justify-center gap-2 active:scale-95 transition-all"
               onClick={() => window.print()}
             >
               <Download className="w-4 h-4" /> Save Receipt
             </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
