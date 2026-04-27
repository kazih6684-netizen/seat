import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { OperationType, handleFirestoreError } from '../lib/utils';
import { Booking } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, History as HistoryIcon, MapPin, Calendar, Clock, ChevronRight, Shield, XCircle, CheckCircle2 } from 'lucide-react';
import { UnityInvoice } from './UnityInvoice';

interface Props {
  memberName?: string;
}

export function UnityHistory({ memberName }: Props) {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (!memberName || !user) {
        setLoading(false);
        return;
    }

    const q = query(
      collection(db, 'bookings'),
      where('authUid', '==', user.uid),
      where('selectedMemberName', '==', memberName),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bs: Booking[] = [];
      snapshot.forEach((doc) => {
        bs.push({ id: doc.id, ...doc.data() } as Booking);
      });
      setBookings(bs);
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, 'bookings');
    });

    return () => unsubscribe();
  }, [memberName]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500/20 text-green-400 border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.2)]';
      case 'rejected': return 'bg-red-500/20 text-red-500 border-red-500/30';
      case 'confirmed': return 'bg-gold/20 text-gold border-gold/40 shadow-[0_0_20px_rgba(245,200,66,0.3)]';
      default: return 'bg-white/5 text-white/40 border-white/10';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved': return 'অনুমোদিত';
      case 'rejected': return 'বাতিল';
      case 'confirmed': return 'কনফার্ম';
      default: return 'পেন্ডিং';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-cinzel text-xl md:text-2xl font-bold text-white flex items-center gap-3">
            <HistoryIcon className="text-gold w-6 h-6" /> বুকিং হিস্ট্রি
          </h2>
          <p className="text-[10px] text-muted tracking-widest uppercase mt-1">আপনার সকল বুকিংয়ের আপডেট এখানে দেখুন</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-2 border-gold/30 border-t-gold rounded-full animate-spin"></div>
            <p className="text-muted text-sm font-bold tracking-widest">লোড হচ্ছে...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-24 glass-card rounded-3xl border-dashed border-white/10">
            <p className="text-muted italic">এখনো কোন বুকিং রের্কড পাওয়া যায়নি।</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {bookings.map((booking, idx) => (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={booking.id}
              onClick={() => setSelectedBooking(booking)}
              className="glass-card p-5 rounded-[1.8rem] border border-white/5 hover:border-gold/30 transition-all cursor-pointer group flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center border font-black shadow-inner transition-all ${getStatusStyle(booking.status)}`}>
                  {booking.status === 'pending' ? <Clock className="w-5 h-5 opacity-40" /> : 
                   booking.status === 'approved' ? <Shield className="w-5 h-5" /> : 
                   booking.status === 'rejected' ? <XCircle className="w-5 h-5" /> : 
                   <CheckCircle2 className="w-6 h-6 animate-pulse" />}
                   <span className="text-[7px] mt-1 uppercase tracking-tighter">{booking.status}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-black text-lg tracking-tight">৳{booking.amount}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-white/5 text-muted uppercase font-black border border-white/5">{booking.paymentMethod}</span>
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 text-[10px] text-muted font-bold tracking-wide uppercase opacity-60">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {booking.createdAt instanceof Date ? booking.createdAt.toLocaleDateString() : 'Today'}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> ID: {booking.userId}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                 <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[1px] border ${getStatusStyle(booking.status)}`}>
                    {getStatusLabel(booking.status)}
                 </div>
                 <ChevronRight className="w-5 h-5 text-muted group-hover:text-gold group-hover:translate-x-2 transition-all" />
              </div>
            </motion.div>
          ))}
        </div>
      )}


      <AnimatePresence>
        {selectedBooking && (
          <UnityInvoice 
            booking={selectedBooking} 
            onClose={() => setSelectedBooking(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
