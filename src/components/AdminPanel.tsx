import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Booking, TeamMember, MemberType } from '../types';
import { OperationType, handleFirestoreError, cn } from '../lib/utils';
import { 
  Users, 
  ClipboardList, 
  Plus, 
  Trash2, 
  Check, 
  X, 
  AlertCircle, 
  UserPlus,
  ShieldCheck,
  UserCheck,
  Lock,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState<'requests' | 'members'>('requests');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [rejectNote, setRejectNote] = useState('');
  const [rejectingBooking, setRejectingBooking] = useState<Booking | null>(null);

  // New Member Form
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberType, setNewMemberType] = useState<MemberType>('leader');
  const [newMemberPassword, setNewMemberPassword] = useState('');

  useEffect(() => {
    // Bookings listener
    const bQuery = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
    const bUnsubscribe = onSnapshot(bQuery, (snapshot) => {
      const bs: Booking[] = [];
      snapshot.forEach((doc) => {
        bs.push({ id: doc.id, ...doc.data() } as Booking);
      });
      setBookings(bs);
    });

    // Members listener
    const mQuery = query(collection(db, 'team_members'));
    const mUnsubscribe = onSnapshot(mQuery, (snapshot) => {
      const ms: TeamMember[] = [];
      snapshot.forEach((doc) => {
        ms.push({ id: doc.id, ...doc.data() } as TeamMember);
      });
      setMembers(ms);
    });

    return () => {
      bUnsubscribe();
      mUnsubscribe();
    };
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await updateDoc(doc(db, 'bookings', id), {
        status: 'approved',
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `bookings/${id}`);
    }
  };

  const handleReject = async () => {
    if (!rejectingBooking) return;
    try {
      await updateDoc(doc(db, 'bookings', rejectingBooking.id), {
        status: 'rejected',
        adminNote: rejectNote,
        updatedAt: serverTimestamp()
      });
      setRejectingBooking(null);
      setRejectNote('');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `bookings/${rejectingBooking.id}`);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'team_members'), {
        name: newMemberName,
        type: newMemberType,
        password: newMemberPassword
      });
      setNewMemberName('');
      setNewMemberPassword('');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'team_members');
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (!confirm('আপনি কি নিশ্চিত যে এই মেম্বারকে ডিলিট করতে চান?')) return;
    try {
      await deleteDoc(doc(db, 'team_members', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `team_members/${id}`);
    }
  };

  const pendingBookings = bookings.filter(b => b.status === 'pending');

  return (
    <div className="max-w-6xl mx-auto p-4 py-8">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        <div className="flex border-b border-slate-100">
          <button
            onClick={() => setActiveTab('requests')}
            className={cn(
              "flex-1 py-5 font-black text-lg transition-all flex items-center justify-center gap-3",
              activeTab === 'requests' ? "bg-blue-600 text-white" : "hover:bg-slate-50 text-slate-400"
            )}
          >
            <ClipboardList className="w-6 h-6" />
            বুকিং রিকোয়েস্ট ({pendingBookings.length})
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={cn(
              "flex-1 py-5 font-black text-lg transition-all flex items-center justify-center gap-3",
              activeTab === 'members' ? "bg-blue-600 text-white" : "hover:bg-slate-50 text-slate-400"
            )}
          >
            <Users className="w-6 h-6" />
            মেম্বার ম্যানেজমেন্ট
          </button>
        </div>

        <div className="p-8">
          {activeTab === 'requests' ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                {pendingBookings.length > 0 ? (
                  pendingBookings.map((booking) => (
                    <motion.div
                      layout
                      key={booking.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex flex-col md:flex-row justify-between gap-6"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-black uppercase">পেন্ডিং</span>
                          <span className="text-xs text-slate-400 font-mono">{booking.id}</span>
                        </div>
                        <h3 className="text-xl font-black text-slate-900">{booking.userName}</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
                          <p><span className="font-bold text-slate-400">টিম মেম্বার:</span> {booking.selectedMemberName}</p>
                          <p><span className="font-bold text-slate-400">টাকার পরিমাণ:</span> ৳{booking.amount}</p>
                          <p><span className="font-bold text-slate-400">হোয়াটসঅ্যাপ:</span> {booking.whatsapp}</p>
                          <p><span className="font-bold text-slate-400">মেথড:</span> {booking.paymentMethod}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleApprove(booking.id)}
                          className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-green-500 text-white px-6 py-3 rounded-2xl font-bold hover:bg-green-600 active:scale-95 transition-all shadow-lg shadow-green-100"
                        >
                          <Check className="w-5 h-5" />
                          অ্যাপ্রুভ
                        </button>
                        <button
                          onClick={() => setRejectingBooking(booking)}
                          className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-red-500 text-white px-6 py-3 rounded-2xl font-bold hover:bg-red-600 active:scale-95 transition-all shadow-lg shadow-red-100"
                        >
                          <X className="w-5 h-5" />
                          রিজেক্ট
                        </button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                    <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 font-black tracking-tight uppercase">কোনো পেন্ডিং রিকোয়েস্ট নেই</p>
                  </div>
                )}
              </div>
              
              {/* History Section in Admin */}
              <div className="mt-12 pt-12 border-t border-slate-100">
                <h3 className="text-xl font-black text-slate-900 mb-6">সম্পন্ন রিকোয়েস্টের তালিকা</h3>
                <div className="space-y-3">
                  {bookings.filter(b => b.status !== 'pending').slice(0, 10).map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl text-sm">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center",
                          booking.status === 'approved' ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                        )}>
                          {booking.status === 'approved' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{booking.userName}</p>
                          <p className="text-xs text-slate-400">{booking.selectedMemberName} • ৳{booking.amount}</p>
                        </div>
                      </div>
                      <span className={cn(
                        "px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest",
                        booking.status === 'approved' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      )}>
                        {booking.status === 'approved' ? 'অ্যাপ্রুভড' : 'রিজেক্টেড'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Add Member Form */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                    <UserPlus className="w-6 h-6 text-blue-600" /> নতুন মেম্বার অ্যাড
                  </h3>
                  <form onSubmit={handleAddMember} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">নাম</label>
                      <input
                        required
                        type="text"
                        className="w-full px-4 py-3 bg-white border-transparent focus:border-blue-500 focus:ring-0 rounded-xl transition-all outline-none"
                        placeholder="মেম্বারের নাম"
                        value={newMemberName}
                        onChange={(e) => setNewMemberName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">টাইপ</label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setNewMemberType('leader')}
                          className={cn(
                            "flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 border-2 transition-all",
                            newMemberType === 'leader' ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-slate-100 text-slate-500"
                          )}
                        >
                          <ShieldCheck className="w-4 h-4" />
                          লিডার
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewMemberType('trainer')}
                          className={cn(
                            "flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 border-2 transition-all",
                            newMemberType === 'trainer' ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-slate-100 text-slate-500"
                          )}
                        >
                          <UserCheck className="w-4 h-4" />
                          ট্রেইনার
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">পাসওয়ার্ড (৪-ডিজিট)</label>
                      <input
                        required
                        type="password"
                        maxLength={4}
                        className="w-full px-4 py-3 bg-white border-transparent focus:border-blue-500 focus:ring-0 rounded-xl transition-all outline-none"
                        placeholder="৪ অক্ষরের পিন"
                        value={newMemberPassword}
                        onChange={(e) => setNewMemberPassword(e.target.value)}
                      />
                    </div>
                    <button className="w-full bg-slate-900 text-white py-4 rounded-xl font-black text-lg active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2">
                      <Plus className="w-5 h-5" />
                      অ্যাড করুন
                    </button>
                  </form>
                </div>
              </div>

              {/* Members List */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-xl font-black text-slate-900 mb-6">বর্তমান মেম্বার তালিকা</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {members.map((member) => (
                    <motion.div
                      layout
                      key={member.id}
                      className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center",
                          member.type === 'leader' ? "bg-blue-100 text-blue-600" : "bg-amber-100 text-amber-600"
                        )}>
                          {member.type === 'leader' ? <ShieldCheck className="w-6 h-6" /> : <UserCheck className="w-6 h-6" />}
                        </div>
                        <div>
                          <h4 className="font-black text-slate-900">{member.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={cn(
                              "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md",
                              member.type === 'leader' ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"
                            )}>
                              {member.type === 'leader' ? 'লিডার' : 'ট্রেইনার'}
                            </span>
                            <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-mono flex items-center gap-1">
                                <Lock className="w-2.5 h-2.5" /> {member.password}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteMember(member.id)}
                        className="p-3 text-red-500 hover:bg-red-50 rounded-2xl transition-colors active:scale-90"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {rejectingBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 space-y-6"
            >
              <div className="text-center">
                <div className="bg-red-100 w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4 text-red-600">
                    <MessageSquare className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-slate-900">রিজেকশন নোট</h3>
                <p className="text-slate-500 mt-2">কেন রিজেক্ট করছেন তা লিখে দিন (ঐচ্ছিক)</p>
              </div>

              <textarea
                autoFocus
                className="w-full p-4 bg-slate-50 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all h-32 resize-none"
                placeholder="যেমন: পেমেন্ট সঠিক নয়..."
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
              />

              <div className="flex gap-4">
                <button
                  onClick={() => setRejectingBooking(null)}
                  className="flex-1 bg-slate-100 py-4 rounded-xl font-bold text-slate-500"
                >
                  বন্ধ করুন
                </button>
                <button
                  onClick={handleReject}
                  className="flex-1 bg-red-500 text-white py-4 rounded-xl font-bold shadow-lg shadow-red-100"
                >
                  সাবমিট করুন
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
