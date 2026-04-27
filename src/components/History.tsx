import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Booking } from '../types';
import { OperationType, handleFirestoreError, cn } from '../lib/utils';
import { Clock, CheckCircle2, XCircle, ChevronRight, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function History() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'bookings'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bs: Booking[] = [];
      snapshot.forEach((doc) => {
        bs.push({ id: doc.id, ...doc.data() } as Booking);
      });
      setBookings(bs);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'bookings');
    });

    return () => unsubscribe();
  }, [user]);

  const approvedCount = bookings.filter(b => b.status === 'approved').length;

  return (
    <div className="max-w-4xl mx-auto p-4 py-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">বুকিং হিস্টোরি</h2>
          <p className="text-slate-500">আপনার করা সকল বুকিং রিকোয়েস্টের তালিকা</p>
        </div>
        <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full font-bold border border-green-100">
          <CheckCircle2 className="w-5 h-5" />
          {approvedCount}টি সিট কনফার্ম হয়েছে
        </div>
      </div>

      <div className="space-y-4">
        {bookings.map((booking) => (
          <motion.div
            key={booking.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => setSelectedBooking(booking)}
            className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow cursor-pointer flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center",
                booking.status === 'approved' ? "bg-green-100 text-green-600" :
                booking.status === 'rejected' ? "bg-red-100 text-red-600" :
                "bg-amber-100 text-amber-600"
              )}>
                {booking.status === 'approved' ? <CheckCircle2 className="w-6 h-6" /> :
                 booking.status === 'rejected' ? <XCircle className="w-6 h-6" /> :
                 <Clock className="w-6 h-6" />}
              </div>
              <div>
                <h4 className="font-bold text-slate-900">{booking.selectedMemberName}</h4>
                <p className="text-sm text-slate-500">৳{booking.amount} • {booking.paymentMethod}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className={cn(
                "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                booking.status === 'approved' ? "bg-green-100 text-green-700" :
                booking.status === 'rejected' ? "bg-red-100 text-red-700" :
                "bg-amber-100 text-amber-700"
              )}>
                {booking.status === 'approved' ? 'অ্যাপ্রুভড' :
                 booking.status === 'rejected' ? 'রিজেক্টেড' : 'পেন্ডিং'}
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300" />
            </div>
          </motion.div>
        ))}

        {bookings.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <div className="bg-slate-50 w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4">
              <Info className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium tracking-tight uppercase text-xs">কোনো বুকিং পাওয়া যায়নি</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end md:items-center justify-center p-4"
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-white w-full max-w-lg rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden p-6 space-y-6"
            >
              <div className="flex justify-between items-center border-b pb-4">
                <h3 className="text-xl font-black text-slate-900">বিস্তারিত তথ্য</h3>
                <button onClick={() => setSelectedBooking(null)} className="p-2 hover:bg-slate-100 rounded-full">
                  <XCircle className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-slate-500">স্টেটাস</span>
                  <span className={cn(
                    "font-bold",
                    selectedBooking.status === 'approved' ? "text-green-600" :
                    selectedBooking.status === 'rejected' ? "text-red-600" : "text-amber-600"
                  )}>
                    {selectedBooking.status === 'approved' ? 'অ্যাপ্রুভড' :
                     selectedBooking.status === 'rejected' ? 'রিজেক্টেড' : 'পেন্ডিং'}
                  </span>
                </div>
                {selectedBooking.adminNote && (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">এডমিন নোট</p>
                    <p className="text-slate-700">{selectedBooking.adminNote}</p>
                  </div>
                )}
                <div className="flex justify-between border-b pb-2">
                  <span className="text-slate-500">টিম সদস্য</span>
                  <span className="font-bold">{selectedBooking.selectedMemberName}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-slate-500">টাকার পরিমাণ</span>
                  <span className="font-bold">৳{selectedBooking.amount}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-slate-500">পেমেন্ট মেথড</span>
                  <span className="font-bold">{selectedBooking.paymentMethod}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-slate-500">হোয়াটসঅ্যাপ</span>
                  <span className="font-bold">{selectedBooking.whatsapp}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">লাস্ট ডিজিট</span>
                  <span className="font-bold">{selectedBooking.lastDigit}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedBooking(null)}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold active:scale-95 transition-transform"
              >
                বন্ধ করুন
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
