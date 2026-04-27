import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy, updateDoc, doc, deleteDoc, addDoc, serverTimestamp, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Booking, TeamMember } from '../types';
import { 
  Users, 
  History as HistoryIcon, 
  Settings as SettingsIcon, 
  LogOut,
  Bell,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  Lock,
  UserPlus,
  ShieldCheck,
  TrendingUp,
  LayoutDashboard,
  Navigation,
  ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UnityInvoice } from './UnityInvoice';
import { GoldButton } from './UnityUI';

type Tab = 'requests' | 'history' | 'leads' | 'trainers' | 'settings';

export function UnityAdmin() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  // Settings state
  const [mainPass, setMainPass] = useState('');
  const [seatRate, setSeatRate] = useState('');
  
  const [confirmData, setConfirmData] = useState<{ id: string, type: 'confirm_seat' | 'delete' } | null>(null);
  
  useEffect(() => {
    // Check for notification permission on mount
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Bookings listener - Ascending order (Oldest first)
    const qb = query(collection(db, 'bookings'), orderBy('createdAt', 'asc'));
    let initialLoad = true;

    const unsubB = onSnapshot(qb, (snap) => {
      const bs: Booking[] = [];
      
      snap.docChanges().forEach((change) => {
        if (change.type === 'added' && !initialLoad) {
          const data = change.doc.data() as Booking;
          // Trigger Notification
          if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            new Notification('New Booking Request!', {
              body: `${data.userName} has requested a seat (Counselor: ${data.selectedMemberName})`,
              icon: 'https://cdn-icons-png.flaticon.com/512/3119/3119338.png'
            });
            // Play notification sound
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
            audio.play().catch(e => console.log('Audio overlap/block:', e));
          }
        }
      });

      snap.forEach(d => bs.push({ id: d.id, ...d.data() } as Booking));
      setBookings(bs);
      setLoading(false);
      initialLoad = false;
    });

    // Members listener
    const qm = query(collection(db, 'team_members'));
    const unsubM = onSnapshot(qm, (snap) => {
      const ms: TeamMember[] = [];
      snap.forEach(d => ms.push({ id: d.id, ...d.data() } as TeamMember));
      setMembers(ms);
    });

    // Settings listener
    const unsubS = onSnapshot(doc(db, 'configs', 'settings'), (snap) => {
      if (snap.exists()) {
        setMainPass(snap.data().mainPassword || '');
        setSeatRate(snap.data().seatRate || '');
      }
    });

    return () => {
      unsubB();
      unsubM();
      unsubS();
    };
  }, []);

  const updateStatus = async (id: string, status: string, note = '') => {
    try {
      await updateDoc(doc(db, 'bookings', id), { 
        status, 
        adminNote: note,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  const processConfirm = async () => {
    if (!confirmData) return;
    
    if (confirmData.type === 'confirm_seat') {
      await updateStatus(confirmData.id, 'confirmed');
    } else if (confirmData.type === 'delete') {
      await deleteDoc(doc(db, 'bookings', confirmData.id));
    }
    
    setConfirmData(null);
  };

  const filterByDate = (bookingList: Booking[]) => {
    if (!selectedDate) return bookingList;
    return bookingList.filter(b => {
      const d = b.createdAt instanceof Date ? b.createdAt : (b.createdAt as any).toDate ? (b.createdAt as any).toDate() : new Date(b.createdAt as any);
      return d.toISOString().split('T')[0] === selectedDate;
    });
  };

  const filteredBookings = filterByDate(bookings);
  const pendingByDate = filteredBookings.filter(b => b.status === 'pending');
  const historyByDate = filteredBookings.filter(b => b.status !== 'pending');
  const pendingCountTotal = bookings.filter(b => b.status === 'pending').length;

    return (
    <div className="min-h-screen bg-navy flex flex-col md:flex-row font-nunito">
        {/* Sidebar / Menu Hub */}
        <AnimatePresence>
            {(!activeTab || window.innerWidth >= 768) && (
                <motion.aside
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -100, opacity: 0 }}
                    className={`w-full md:w-80 glass-card border-r border-white/5 md:h-screen ${activeTab ? 'hidden md:flex' : 'flex'} sticky top-0 z-20 flex-col p-6 shadow-2xl`}
                >
                    <div className="flex items-center gap-3 mb-10 pl-2">
                        <div className="w-12 h-12 bg-gold rounded-2xl flex items-center justify-center text-navy-mid shadow-lg font-cinzel font-black text-xl">U</div>
                        <div>
                           <h2 className="font-cinzel text-xl font-bold text-white tracking-tight">Unity Admin</h2>
                           <p className="text-[10px] text-gold/60 font-black tracking-[3px] uppercase">Control Panel</p>
                        </div>
                    </div>

                    <nav className="flex-1 space-y-3">
                        <SidebarItem 
                            active={activeTab === 'requests'} 
                            onClick={() => setActiveTab('requests')}
                            icon={<Bell className="w-6 h-6" />}
                            label="Requests"
                            badge={pendingCountTotal > 0 ? pendingCountTotal : undefined}
                        />
                        <SidebarItem 
                            active={activeTab === 'history'} 
                            onClick={() => setActiveTab('history')}
                            icon={<HistoryIcon className="w-6 h-6" />}
                            label="History"
                        />
                        <SidebarItem 
                            active={activeTab === 'leads'} 
                            onClick={() => setActiveTab('leads')}
                            icon={<Users className="w-6 h-6" />}
                            label="Team Leaders"
                        />
                        <SidebarItem 
                            active={activeTab === 'trainers'} 
                            onClick={() => setActiveTab('trainers')}
                            icon={<TrendingUp className="w-6 h-6" />}
                            label="Team Trainers"
                        />
                        <SidebarItem 
                            active={activeTab === 'settings'} 
                            onClick={() => setActiveTab('settings')}
                            icon={<SettingsIcon className="w-6 h-6" />}
                            label="Global Settings"
                        />
                    </nav>

                    <button 
                        onClick={logout}
                        className="mt-auto flex items-center gap-3 p-5 text-red-500/60 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all duration-300 font-bold text-sm border border-transparent hover:border-red-500/20"
                    >
                        <LogOut className="w-5 h-5" /> Logout Session
                    </button>
                </motion.aside>
            )}
        </AnimatePresence>

        {/* Main Content */}
        <div className={`flex-1 flex flex-col h-screen ${activeTab ? 'flex' : 'hidden md:flex'}`}>
            <header className="px-4 py-3 md:px-10 md:py-8 flex justify-between items-center bg-navy/80 backdrop-blur-md sticky top-0 z-30 border-b border-white/5">
                <div className="flex items-center gap-2">
                    {activeTab && (
                        <button 
                            onClick={() => setActiveTab(null)}
                            className="md:hidden p-2 bg-white/5 rounded-xl text-gold"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                    )}
                    <h1 className="font-cinzel text-base md:text-3xl font-bold text-white tracking-tight uppercase">
                        {!activeTab ? 'Dashboard' :
                         activeTab === 'requests' ? 'Requests' : 
                         activeTab === 'history' ? 'History' :
                         activeTab === 'leads' ? 'Leaders' :
                         activeTab === 'trainers' ? 'Trainers' : 'Settings'}
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    {(activeTab === 'requests' || activeTab === 'history') && (
                        <div className="relative">
                            <input 
                                type="date"
                                className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[10px] text-white outline-none focus:border-gold transition-all w-28"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                            />
                        </div>
                    )}
                    <div className="w-8 h-8 rounded-lg gold-gradient border border-white/10 shadow-lg p-0.5">
                        <div className="w-full h-full rounded-[6px] bg-navy flex items-center justify-center text-gold font-bold text-[10px] uppercase">
                            {user?.email?.[0]}
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 p-4 md:p-10 overflow-y-auto">
                <AnimatePresence mode="wait">
                    {!activeTab ? (
                        <motion.div
                            key="dashboard"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            <MenuCard 
                                icon={<Bell className="w-8 h-8" />}
                                label="Pending Requests"
                                sub="Verify new bookings"
                                color="gold"
                                badge={pendingCountTotal > 0 ? pendingCountTotal : undefined}
                                onClick={() => setActiveTab('requests')}
                            />
                            <MenuCard 
                                icon={<HistoryIcon className="w-8 h-8" />}
                                label="All History"
                                sub="Record of all transactions"
                                color="blue"
                                onClick={() => setActiveTab('history')}
                            />
                            <MenuCard 
                                icon={<Users className="w-8 h-8" />}
                                label="Team Leaders"
                                sub="Manage leader accounts"
                                color="green"
                                onClick={() => setActiveTab('leads')}
                            />
                            <MenuCard 
                                icon={<TrendingUp className="w-8 h-8" />}
                                label="Team Trainers"
                                sub="Manage trainer accounts"
                                color="purple"
                                onClick={() => setActiveTab('trainers')}
                            />
                            <MenuCard 
                                icon={<SettingsIcon className="w-8 h-8" />}
                                label="Global Settings"
                                sub="Passwords & Pricing"
                                color="muted"
                                onClick={() => setActiveTab('settings')}
                            />
                        </motion.div>
                    ) : (
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="min-h-full"
                        >
                            {activeTab === 'requests' && (
                                <BookingList 
                                    bookings={pendingByDate} 
                                    actions 
                                    onUpdate={updateStatus} 
                                    onSelect={setSelectedBooking}
                                />
                            )}

                            {activeTab === 'history' && (
                                <BookingList 
                                    bookings={historyByDate} 
                                    onUpdate={updateStatus}
                                    onConfirmRequest={(id: string) => setConfirmData({ id, type: 'confirm_seat' })}
                                    onDeleteRequest={(id: string) => setConfirmData({ id, type: 'delete' })}
                                    onSelect={setSelectedBooking}
                                />
                            )}

                            {activeTab === 'leads' && (
                                <MemberManagement type="leader" members={members.filter(m => m.type === 'leader')} />
                            )}

                            {activeTab === 'trainers' && (
                                <MemberManagement type="trainer" members={members.filter(m => m.type === 'trainer')} />
                            )}

                            {activeTab === 'settings' && (
                                <SettingsPanel mainPass={mainPass} seatRate={seatRate} />
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>

        <AnimatePresence>
            {selectedBooking && (
                <UnityInvoice 
                    booking={selectedBooking} 
                    onClose={() => setSelectedBooking(null)} 
                />
            )}
        </AnimatePresence>

        <AnimatePresence>
            {confirmData && (
                <ConfirmModal 
                    type={confirmData.type}
                    onConfirm={processConfirm}
                    onCancel={() => setConfirmData(null)}
                />
            )}
        </AnimatePresence>
    </div>
  );
}

function SidebarItem({ active, onClick, icon, label, badge }: any) {
    return (
        <button
            onClick={onClick}
            className={`
                w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 group
                ${active ? 'bg-gold text-navy-mid font-black shadow-lg shadow-gold/20' : 'text-muted hover:text-white hover:bg-white/5'}
            `}
        >
            <div className="flex items-center gap-4">
                {icon}
                <span className="text-sm tracking-wide">{label}</span>
            </div>
            {badge && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] items-center ${active ? 'bg-navy-mid text-gold' : 'bg-gold text-navy-mid'}`}>{badge}</span>
            )}
        </button>
    );
}

function MenuCard({ icon, label, sub, onClick, color, badge }: any) {
    const colors: any = {
        gold: 'text-gold bg-gold/10 border-gold/20 hover:border-gold',
        blue: 'text-blue-400 bg-blue-400/10 border-blue-400/20 hover:border-blue-400',
        green: 'text-green-400 bg-green-400/10 border-green-400/20 hover:border-green-400',
        purple: 'text-purple-400 bg-purple-400/10 border-purple-400/20 hover:border-purple-400',
        muted: 'text-muted bg-white/5 border-white/10 hover:border-white/40'
    };

    return (
        <button 
            onClick={onClick}
            className={`glass-card p-8 rounded-[2.5rem] border-2 text-left group transition-all duration-500 relative overflow-hidden ${colors[color] || colors.muted}`}
        >
            <div className="relative z-10">
                <div className="mb-6 inline-block p-4 rounded-2xl bg-white/5 group-hover:scale-110 transition-transform">
                    {icon}
                </div>
                <h3 className="text-xl font-cinzel font-bold text-white mb-2 group-hover:text-gold transition-colors">{label}</h3>
                <p className="text-xs text-muted font-medium opacity-60">{sub}</p>
            </div>
            
            {badge && (
                <div className="absolute top-6 right-6 w-6 h-6 bg-red-500 text-white text-[10px] font-black flex items-center justify-center rounded-full animate-pulse shadow-lg shadow-red-500/20">
                    {badge}
                </div>
            )}

            <div className="absolute -bottom-4 -right-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                {React.cloneElement(icon as React.ReactElement, { size: 120 })}
            </div>
        </button>
    );
}

function BookingList({ bookings, actions, onUpdate, onConfirmRequest, onDeleteRequest, onSelect }: any) {
    const formatDateTime = (date: any) => {
        if (!date) return '---';
        const d = date instanceof Date ? date : (date.toDate ? date.toDate() : new Date(date));
        return d.toLocaleString('en-US', { 
            day: 'numeric', 
            month: 'short', 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });
    };

    if (bookings.length === 0) return (
        <div className="flex flex-col items-center justify-center py-20 glass-card rounded-[2rem] border-dashed border-white/10 mx-2">
            <LayoutDashboard className="w-12 h-12 text-muted/20 mb-4" />
            <p className="text-muted italic text-sm">কোন রের্কড পাওয়া যায়নি।</p>
        </div>
    );

    return (
        <div className="space-y-3 px-1">
            {bookings.map((b: Booking) => (
                <div key={b.id} className="glass-card p-4 rounded-[2rem] border border-white/5 flex flex-col gap-4 hover:border-gold/20 transition-all">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex flex-1 gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold border border-gold/10 shrink-0">
                                 <Navigation className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                    <h3 className="text-white font-black text-[20px] md:text-3xl uppercase tracking-tight truncate leading-tight">{b.selectedMemberName}</h3>
                                    <div className="flex flex-col items-end gap-1 shrink-0">
                                        <div className={`text-[6px] md:text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest ${b.status === 'pending' ? 'bg-gold/10 text-gold' : b.status === 'approved' || b.status === 'confirmed' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                            {b.status}
                                        </div>
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onSelect(b);
                                            }}
                                            className="p-1.5 bg-white/5 text-gold hover:bg-gold hover:text-navy-mid rounded-lg transition-all border border-white/10 shadow-lg"
                                            title="View Invoice"
                                        >
                                            <Bell className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <p className="text-gold font-bold text-sm truncate pr-2 mb-2">{b.userName} • ক্যান্ডিডেট</p>
                                    <div className="flex items-center gap-2 mt-0.5 opacity-30">
                                        <HistoryIcon className="w-2.5 h-2.5 text-white" />
                                        <span className="text-[9px] font-bold text-white truncate">{formatDateTime(b.createdAt)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            {onDeleteRequest && (
                                <button 
                                    onClick={() => onDeleteRequest(b.id)}
                                    className="p-2.5 bg-red-500/5 text-red-500/30 hover:text-red-500 rounded-xl transition-colors border border-red-500/10"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 bg-white/[0.02] p-3 rounded-2xl border border-white/5">
                         <div className="space-y-0.5">
                            <p className="text-[7px] text-muted uppercase font-black tracking-widest opacity-40">Trx ID</p>
                            <p className="text-[9px] text-white font-bold flex items-center gap-1"><ShieldCheck className="w-2.5 h-2.5 text-gold/60" /> {b.userId}</p>
                         </div>
                         <div className="text-right space-y-0.5">
                            <p className="text-[7px] text-muted uppercase font-black tracking-widest opacity-40">Fee Details</p>
                            <p className="text-[10px] text-gold font-black">৳{b.amount} • {b.paymentMethod}</p>
                         </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {actions ? (
                            <>
                                <button 
                                    onClick={() => onUpdate(b.id, 'approved')}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-500/10 text-green-500 hover:bg-green-500 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all hover:text-white border border-green-500/20"
                                >
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                                </button>
                                <button 
                                    onClick={() => onUpdate(b.id, 'rejected')}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-500/10 text-red-500 hover:bg-red-500 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all hover:text-white border border-red-500/20"
                                >
                                    <XCircle className="w-3.5 h-3.5" /> Reject
                                </button>
                            </>
                        ) : (
                            b.status === 'approved' && (
                                <button 
                                   onClick={() => onConfirmRequest(b.id)}
                                   className="w-full flex items-center justify-center gap-3 py-5 gold-gradient text-navy-mid text-[14px] font-black uppercase tracking-widest rounded-[1.5rem] transition-all shadow-xl active:scale-95 border-none outline-none ring-1 ring-gold/20"
                               >
                                   <CheckCircle2 className="w-5 h-5" /> Confirm Seat
                                </button>
                            )
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

function ConfirmModal({ type, onConfirm, onCancel }: any) {
    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-navy/90 backdrop-blur-sm"
        >
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-sm glass-card border border-white/10 p-8 rounded-[2.5rem] text-center shadow-2xl"
            >
                <div className={`w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center ${type === 'delete' ? 'bg-red-500/10 text-red-500' : 'bg-gold/10 text-gold'}`}>
                    {type === 'delete' ? <Trash2 className="w-8 h-8" /> : <CheckCircle2 className="w-8 h-8" />}
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2">
                    {type === 'delete' ? 'পেমেন্ট ডিলিট?' : 'সীট কনফার্ম?'}
                </h3>
                <p className="text-sm text-white/50 mb-8 leading-relaxed">
                    {type === 'delete' 
                        ? 'আপনি কি নিশ্চিত যে এই রের্কডটি চিরস্থায়ীভাবে মুছে ফেলতে চান?' 
                        : 'আপনি কি এই ক্যান্ডিডেটের সীটটি কনফার্ম করতে চান? পেমেন্ট ভেরিফাই হয়েছে কি?'}
                </p>

                <div className="flex flex-col gap-4">
                    <button 
                        onClick={onConfirm}
                        className={`w-full py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-2xl ${
                            type === 'delete' ? 'bg-red-500 text-white shadow-red-500/30' : 'gold-gradient text-navy-mid shadow-gold/30'
                        }`}
                    >
                        {type === 'delete' ? 'হ্যাঁ, ডিলিট করুন' : 'হ্যাঁ, কনফার্ম করুন'}
                    </button>
                    <button 
                        onClick={onCancel}
                        className="w-full py-4 text-white/30 font-bold hover:text-white transition-colors text-xs uppercase tracking-widest"
                    >
                        না, ফিরে যান
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

function MemberManagement({ type, members }: any) {
    const [name, setName] = useState('');
    const [pass, setPass] = useState('');
    const [adding, setAdding] = useState(false);
    const [editingMember, setEditingMember] = useState<any>(null);
    const [newPass, setNewPass] = useState('');

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setAdding(true);
        await addDoc(collection(db, 'team_members'), {
            name,
            password: pass,
            type,
            createdAt: serverTimestamp()
        });
        setName('');
        setPass('');
        setAdding(false);
    };

    const handleUpdatePin = async (id: string) => {
        if (newPass.length !== 4) return alert('পিন অবশ্যই ৪ ডিজিটের হতে হবে।');
        await updateDoc(doc(db, 'team_members', id), {
            password: newPass
        });
        setEditingMember(null);
        setNewPass('');
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-1">
                <div className="glass-card p-8 rounded-[2rem] border border-white/5 sticky top-10">
                    <h3 className="font-cinzel text-xl font-bold text-white mb-6 flex items-center gap-3">
                        <UserPlus className="text-gold w-6 h-6" /> Add New {type === 'leader' ? 'Leader' : 'Trainer'}
                    </h3>
                    <form onSubmit={handleAdd} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-muted tracking-widest">Full Name</label>
                            <input 
                                required
                                className="w-full bg-navy/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold outline-none"
                                value={name}
                                onChange={e => setName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-muted tracking-widest">Pin (4 Digits)</label>
                            <input 
                                required
                                maxLength={4}
                                className="w-full bg-navy/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold outline-none tracking-widest"
                                value={pass}
                                onChange={e => setPass(e.target.value)}
                            />
                        </div>
                        <GoldButton type="submit" loading={adding} className="mt-4">
                            ADD TO LIST
                        </GoldButton>
                    </form>
                </div>
            </div>

            <div className="lg:col-span-2 space-y-4">
                {members.map((m: any) => (
                    <div key={m.id} className="glass-card p-5 rounded-2xl border border-white/5 flex flex-col gap-4 group">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold font-bold">
                                    {m.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-white font-bold">{m.name}</p>
                                    <p className="text-[10px] text-gold font-black tracking-widest uppercase">PIN: {m.password}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => {
                                        setEditingMember(m);
                                        setNewPass(m.password);
                                    }}
                                    className="p-3 text-gold/40 hover:text-gold hover:bg-gold/10 rounded-xl transition-all"
                                >
                                    <Lock className="w-5 h-5" />
                                </button>
                                <button 
                                    onClick={async () => {
                                        if(confirm('Are you sure you want to delete this member?')) {
                                            await deleteDoc(doc(db, 'team_members', m.id));
                                        }
                                    }}
                                    className="p-3 text-red-500/30 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {editingMember?.id === m.id && (
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                className="bg-white/5 border-t border-white/5 pt-4 flex items-center gap-3"
                            >
                                <input 
                                    maxLength={4}
                                    className="flex-1 bg-navy/50 border border-white/10 rounded-lg px-3 py-2 text-white text-xs outline-none focus:border-gold"
                                    placeholder="New 4-digit PIN"
                                    value={newPass}
                                    onChange={e => setNewPass(e.target.value)}
                                />
                                <button 
                                    onClick={() => handleUpdatePin(m.id)}
                                    className="px-4 py-2 bg-gold text-navy-mid font-black text-[10px] rounded-lg tracking-widest"
                                >
                                    SAVE
                                </button>
                                <button 
                                    onClick={() => setEditingMember(null)}
                                    className="px-4 py-2 bg-white/10 text-white/40 text-[10px] font-black rounded-lg"
                                >
                                    CANCEL
                                </button>
                            </motion.div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

function SettingsPanel({ mainPass, seatRate }: any) {
    const [mp, setMp] = useState(mainPass);
    const [sr, setSr] = useState(seatRate);
    const [updating, setUpdating] = useState(false);

    const updateSettings = async () => {
        setUpdating(true);
        await setDoc(doc(db, 'configs', 'settings'), {
            mainPassword: mp,
            seatRate: sr
        }, { merge: true });
        setUpdating(false);
        alert('Settings updated successfully!');
    };

    return (
        <div className="max-w-xl mx-auto space-y-8 py-10">
            <div className="glass-card p-10 rounded-[2.5rem] border border-white/5 space-y-8">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl mx-auto mb-4 flex items-center justify-center border border-white/10 uppercase font-black text-gold">Cfg</div>
                    <h3 className="font-cinzel text-2xl font-bold text-white">Security & Pricing</h3>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-muted tracking-widest flex items-center gap-2">
                            <Lock className="w-3.5 h-3.5" /> Main Portal Password
                        </label>
                        <input 
                            className="w-full bg-navy/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:border-gold outline-none font-bold"
                            value={mp}
                            onChange={e => setMp(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-muted tracking-widest flex items-center gap-2">
                            <TrendingUp className="w-3.5 h-3.5" /> Seat Booking Rate (৳)
                        </label>
                        <input 
                            className="w-full bg-navy/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:border-gold outline-none font-bold"
                            value={sr}
                            onChange={e => setSr(e.target.value)}
                        />
                    </div>
                </div>

                <GoldButton loading={updating} onClick={updateSettings}>
                    UPDATE GLOBAL CONFIG
                </GoldButton>
            </div>
        </div>
    );
}
