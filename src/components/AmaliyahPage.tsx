import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  Circle, 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  History, 
  Trophy, 
  Sparkles,
  Sun,
  Moon,
  CloudSun,
  CloudMoon,
  HandHeart,
  BookOpen,
  LayoutDashboard,
  Sunrise,
  Sunset,
  Heart,
  HeartPulse,
  Award,
  TrendingUp,
  LogIn,
  Loader2
} from 'lucide-react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  setDoc, 
  doc, 
  serverTimestamp,
  getDocs,
  limit
} from 'firebase/firestore';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { auth, db, OperationType, handleFirestoreError } from '../firebase';
import { signInAnonymously } from 'firebase/auth';

const DEEDS = [
  { id: 'shubuh', label: 'Shubuh', icon: <Sun className="w-5 h-5 text-amber-500" />, category: 'Wajib' },
  { id: 'dzuhur', label: 'Dzuhur', icon: <CloudSun className="w-5 h-5 text-yellow-500" />, category: 'Wajib' },
  { id: 'ashar', label: 'Ashar', icon: <CloudSun className="w-5 h-5 text-orange-500" />, category: 'Wajib' },
  { id: 'maghrib', label: 'Maghrib', icon: <CloudMoon className="w-5 h-5 text-indigo-500" />, category: 'Wajib' },
  { id: 'isya', label: 'Isya', icon: <Moon className="w-5 h-5 text-slate-500" />, category: 'Wajib' },
  
  { id: 'rawatib_shubuh', label: 'Qabliyah Shubuh', icon: <Sunrise className="w-5 h-5 text-amber-400" />, category: 'Rawatib' },
  { id: 'rawatib_dzuhur', label: 'Rawatib Dzuhur', icon: <Sun className="w-5 h-5 text-yellow-400" />, category: 'Rawatib' },
  { id: 'rawatib_maghrib', label: 'Ba\'diyah Maghrib', icon: <CloudMoon className="w-5 h-5 text-indigo-400" />, category: 'Rawatib' },
  { id: 'rawatib_isya', label: 'Ba\'diyah Isya', icon: <Moon className="w-5 h-5 text-slate-400" />, category: 'Rawatib' },
  
  { id: 'tahajjud', label: 'Tahajjud & Witir', icon: <Moon className="w-5 h-5 text-indigo-600" />, category: 'Sunnah' },
  { id: 'dhuha', label: 'Dhuha', icon: <Sun className="w-5 h-5 text-yellow-300" />, category: 'Sunnah' },
  
  { id: 'dzikir_pagi', label: 'Dzikir Pagi', icon: <Sunrise className="w-5 h-5 text-orange-400" />, category: 'Dzikir' },
  { id: 'dzikir_petang', label: 'Dzikir Petang', icon: <Sunset className="w-5 h-5 text-indigo-500" />, category: 'Dzikir' },
  { id: 'tilawah', label: 'Tilawah Qur\'an', icon: <BookOpen className="w-5 h-5 text-emerald-500" />, category: 'Qur\'an' },
  { id: 'tadabbur', label: 'Tadabbur/Kajian', icon: <Heart className="w-5 h-5 text-pink-500" />, category: 'Ilmu' },
  
  { id: 'sedekah', label: 'Sedekah Harian', icon: <HandHeart className="w-5 h-5 text-rose-500" />, category: 'Infaq' },
  { id: 'birrul_walidain', label: 'Birrul Walidain', icon: <HeartPulse className="w-5 h-5 text-red-500" />, category: 'Akhlak' },
];

export default function AmaliyahPage() {
  const [activeView, setActiveView] = useState<'today' | 'history' | 'stats'>('today');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [todayDeeds, setTodayDeeds] = useState<Record<string, boolean>>({});
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(auth.currentUser);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
      if (!u) {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleManualLogin = async () => {
    setLoading(true);
    try {
      await signInAnonymously(auth);
    } catch (error) {
      console.error("Login failed", error);
    } finally {
      setLoading(false);
    }
  };

  // Format date to YYYY-MM-DD
  const formatDate = (date: Date) => {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
  };

  const todayStr = formatDate(currentDate);

  // Subscribe to deeds for selected date
  useEffect(() => {
    if (!user) return;

    const docId = `${user.uid}_${todayStr}`;
    const docRef = doc(db, 'amaliyah_records', docId);

    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        setTodayDeeds(snapshot.data().deeds || {});
      } else {
        setTodayDeeds({});
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'amaliyah_records');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, todayStr]);

  // Fetch history for streak and history view
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'amaliyah_records'),
      where('userId', '==', user.uid),
      orderBy('date', 'desc'),
      limit(30)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const records = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setHistory(records);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'amaliyah_records');
    });

    return () => unsubscribe();
  }, [user]);

  const toggleDeed = async (deedId: string) => {
    if (!user) return;

    setSavingId(deedId);
    
    const currentDeeds = { ...todayDeeds };
    const isFirstTime = Object.keys(currentDeeds).length === 0;
    const isActivating = !currentDeeds[deedId];
    
    const newDeeds = {
      ...currentDeeds,
      [deedId]: isActivating
    };
    
    // Optimistic update
    setTodayDeeds(newDeeds);

    const docId = `${user.uid}_${todayStr}`;
    const docRef = doc(db, 'amaliyah_records', docId);

    try {
      const data: any = {
        userId: user.uid,
        date: todayStr,
        deeds: newDeeds,
        updatedAt: serverTimestamp(),
      };

      // Always include createdAt on write to ensure it exists, 
      // but rules will prevent it from changing if it already exists.
      // If we don't know if it's the first time for SURE (e.g. slow sync),
      // we can try to get the existing document first OR use a safer rule.
      if (isFirstTime) {
        data.createdAt = serverTimestamp();
      }

      await setDoc(docRef, data, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'amaliyah_records/' + docId);
      // Rollback on error
      setTodayDeeds(currentDeeds);
    } finally {
      setSavingId(null);
    }
  };

  const streakData = React.useMemo(() => {
    if (history.length === 0) return { current: 0, best: 0 };
    
    const sortedHistory = [...history].sort((a, b) => b.date.localeCompare(a.date));
    const realToday = formatDate(new Date());
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = formatDate(yesterday);
    
    // Helper to check if a day counts as "active"
    const isActive = (record: any) => {
        if (!record || !record.deeds) return false;
        return Object.values(record.deeds).some(v => v === true);
    };

    // Best Streak
    let best = 0;
    let tempStreak = 0;
    const ascHistory = [...history].sort((a, b) => a.date.localeCompare(b.date));
    if (ascHistory.length > 0) {
        let lastDate: Date | null = null;
        ascHistory.forEach(record => {
            if (isActive(record)) {
                const currentDate = new Date(record.date);
                if (lastDate) {
                    const diffDays = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
                    if (diffDays === 1) tempStreak++;
                    else if (diffDays > 1) tempStreak = 1;
                } else tempStreak = 1;
                lastDate = currentDate;
                best = Math.max(best, tempStreak);
            }
        });
    }

    // Current Streak
    let current = 0;
    const hasToday = sortedHistory.some(r => r.date === realToday && isActive(r));
    const hasYesterday = sortedHistory.some(r => r.date === yesterdayStr && isActive(r));
    
    if (hasToday || hasYesterday) {
        let checkDate = hasToday ? new Date() : yesterday;
        while (true) {
            const dateStr = formatDate(checkDate);
            const record = sortedHistory.find(r => r.date === dateStr);
            if (isActive(record)) {
                current++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else break;
            if (current > 1000) break;
        }
    }
    
    return { current, best };
  }, [history]);

  const calculateCompletion = (deeds: Record<string, boolean>) => {
    const checkedCount = Object.values(deeds).filter(Boolean).length;
    return Math.round((checkedCount / DEEDS.length) * 100);
  };

  const chartData = React.useMemo(() => {
    return [...history]
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-7)
      .map(record => ({
        date: new Date(record.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
        completion: calculateCompletion(record.deeds)
      }));
  }, [history]);

  const todayCompletion = calculateCompletion(todayDeeds);

  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-[#1799dc]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-xl text-center border border-slate-100 dark:border-slate-700"
        >
          <div className="w-20 h-20 bg-[#1799dc]/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <LayoutDashboard className="w-10 h-10 text-[#1799dc]" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-3">Mulai Amaliyah</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
            Silakan masuk untuk mulai mencatat amaliyah harian Anda secara pribadi dan aman.
          </p>
          <button 
            onClick={handleManualLogin}
            className="w-full h-14 bg-[#1799dc] text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-[#1799dc]/30 hover:bg-[#2db2f5] active:scale-95 transition-all"
          >
            <LogIn className="w-5 h-5" /> Mulai Sekarang
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-20 md:pt-28 pb-10 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Header Section */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">Ritual Harian</h1>
            <p className="text-slate-500 dark:text-slate-400">Optimize your daily spiritual routine.</p>
          </div>
          
          <div className="flex bg-white dark:bg-slate-800 rounded-2xl p-1 shadow-sm border border-slate-200 dark:border-slate-700 overflow-x-auto no-scrollbar">
            <button 
              onClick={() => setActiveView('today')}
              className={`whitespace-nowrap flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeView === 'today' ? 'bg-[#1799dc] text-white shadow-md shadow-[#1799dc]/20' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
            >
              <LayoutDashboard className="w-4 h-4" /> Today
            </button>
            <button 
              onClick={() => setActiveView('stats')}
              className={`whitespace-nowrap flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeView === 'stats' ? 'bg-[#1799dc] text-white shadow-md shadow-[#1799dc]/20' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
            >
              <TrendingUp className="w-4 h-4" /> Stats
            </button>
            <button 
              onClick={() => setActiveView('history')}
              className={`whitespace-nowrap flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeView === 'history' ? 'bg-[#1799dc] text-white shadow-md shadow-[#1799dc]/20' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
            >
              <History className="w-4 h-4" /> History
            </button>
          </div>
        </div>

        {/* Stats Summary Area */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Sparkles className="w-12 h-12 text-blue-600" />
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
                <Trophy className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Streak</span>
            </div>
            <div className="flex items-end justify-between">
              <div className="flex items-end gap-2">
                <span className="text-3xl font-black text-slate-800 dark:text-white">{streakData.current}</span>
                <span className="text-sm font-bold text-slate-500 mb-1">Hari</span>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tight">Best: {streakData.best}</p>
              </div>
            </div>
          </motion.div>

          {/* Completion Mini Chart Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Progress</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-black text-slate-800 dark:text-white">{todayCompletion}%</span>
              <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-700 rounded-full mb-2 overflow-hidden relative">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${todayCompletion}%` }}
                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                />
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="sm:col-span-2 lg:col-span-1 bg-gradient-to-br from-[#1799dc] to-[#2db2f5] p-6 rounded-3xl shadow-lg shadow-[#1799dc]/20 text-white"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold opacity-80 uppercase tracking-widest">Level</span>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xl font-black">Muhsin</p>
                <p className="text-[10px] opacity-80 font-bold uppercase">120 points to next level</p>
              </div>
              <Sparkles className="w-8 h-8 opacity-50" />
            </div>
          </motion.div>
        </div>

        {/* Main Content Area */}
        <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700">
          <AnimatePresence mode="wait">
            {activeView === 'today' ? (
              <motion.div 
                key="today"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                        const d = new Date(currentDate);
                        d.setDate(d.getDate() - 1);
                        setCurrentDate(d);
                      }}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors active:scale-95"
                    >
                      <ChevronLeft className="w-5 h-5 text-slate-500" />
                    </button>
                    <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700">
                      <CalendarIcon className="w-5 h-5 text-[#1799dc]" />
                      <span className="font-bold text-slate-700 dark:text-slate-200">
                        {currentDate.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}
                        {formatDate(currentDate) === formatDate(new Date()) && " (Today)"}
                      </span>
                    </div>
                    <button 
                      onClick={() => {
                        const d = new Date(currentDate);
                        d.setDate(d.getDate() + 1);
                        if (d <= new Date()) {
                          setCurrentDate(d);
                        }
                      }}
                      disabled={formatDate(currentDate) === formatDate(new Date())}
                      className={`p-2 rounded-full transition-colors ${formatDate(currentDate) === formatDate(new Date()) ? 'opacity-20 cursor-not-allowed' : 'hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95'}`}
                    >
                      <ChevronRight className="w-5 h-5 text-slate-500" />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-4">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-900/50 px-3 py-1.5 rounded-full border border-slate-100 dark:border-slate-800">
                      {Object.values(todayDeeds).filter(Boolean).length} / {DEEDS.length} TERLAKSANA
                    </span>
                    {formatDate(currentDate) !== formatDate(new Date()) && (
                      <button 
                        onClick={() => setCurrentDate(new Date())}
                        className="text-xs font-bold text-[#1799dc] hover:underline"
                      >
                        Hari Ini
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-8 border-b border-slate-100 dark:border-slate-700 mb-8">
                  {DEEDS.map((deed) => {
                    const isActive = todayDeeds[deed.id];
                    const isSaving = savingId === deed.id;
                    
                    return (
                      <motion.button
                        key={deed.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => toggleDeed(deed.id)}
                        className={`group flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
                          isActive 
                            ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-900/30' 
                            : 'bg-white dark:bg-slate-900/50 border-slate-100 dark:border-slate-700 hover:border-[#1799dc]/30'
                        }`}
                      >
                        <div className="flex items-center gap-4 z-10">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors shadow-sm ${isActive ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600' : 'bg-slate-50 dark:bg-slate-800 text-slate-500'}`}>
                            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : deed.icon}
                          </div>
                          <div className="text-left">
                            <h4 className={`font-bold transition-colors ${isActive ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-200'}`}>{deed.label}</h4>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-500 transition-colors">{deed.category}</span>
                          </div>
                        </div>
                        
                        <div className={`transition-all duration-500 z-10 ${isActive ? 'scale-110 text-emerald-500' : 'text-slate-200 dark:text-slate-700 group-hover:text-[#1799dc]/30'}`}>
                          {isActive ? <CheckCircle2 className="w-6 h-6 fill-emerald-50 dark:fill-emerald-900/20" /> : <Circle className="w-6 h-6" />}
                        </div>
                        
                        {isActive && (
                          <motion.div 
                            layoutId={`active-bg-${deed.id}`}
                            className="absolute inset-0 bg-emerald-500/5 dark:bg-emerald-500/10 pointer-events-none"
                          />
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/10 p-5 rounded-2xl border border-blue-100 dark:border-blue-900/30 flex items-start gap-4">
                  <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center flex-shrink-0 text-[#1799dc] shadow-sm">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-blue-900 dark:text-blue-300 text-sm mb-1">Istiqomah adalah Kunci</h5>
                    <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
                      "Amalan yang paling dicintai oleh Allah adalah amalan yang kontinyu sekalipun sedikit." (HR. Muslim). Cukup satu klik untuk mencatat perjalanan takwa Anda.
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : activeView === 'stats' ? (
              <motion.div 
                key="stats"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <h3 className="text-xl font-black text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-[#1799dc]" /> Analisis Mingguan
                </h3>

                <div className="h-[250px] w-full mb-8">
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#1799dc" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#1799dc" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#8884d820" />
                        <XAxis 
                          dataKey="date" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }}
                          dy={10}
                        />
                        <YAxis 
                          domain={[0, 100]} 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }}
                          tickFormatter={(val) => `${val}%`}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            borderRadius: '16px', 
                            border: 'none', 
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                            backgroundColor: '#fff',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="completion" 
                          stroke="#1799dc" 
                          strokeWidth={3} 
                          fillOpacity={1} 
                          fill="url(#colorComp)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                      <TrendingUp className="w-12 h-12 mb-3 opacity-10" />
                      <p className="text-sm font-bold">Data grafik belum tersedia</p>
                      <p className="text-[10px] uppercase font-black tracking-widest opacity-50">Isi amaliyah hari ini untuk melihat progres</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Rata-rata Pekan Ini</p>
                    <p className="text-2xl font-black text-slate-800 dark:text-white">
                      {chartData.length > 0 
                        ? Math.round(chartData.reduce((acc, curr) => acc + curr.completion, 0) / chartData.length) 
                        : 0}%
                    </p>
                  </div>
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Best Performance</p>
                    <p className="text-2xl font-black text-slate-800 dark:text-white">
                      {chartData.length > 0 
                        ? Math.max(...chartData.map(d => d.completion)) 
                        : 0}%
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="history"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <div className="space-y-4">
                  {history.length === 0 ? (
                    <div className="text-center py-20 text-slate-500">
                      <History className="w-12 h-12 mx-auto mb-4 opacity-10" />
                      <p>Belum ada riwayat amaliyah.</p>
                      <p className="text-xs">Mulai catat kebaikan Anda hari ini!</p>
                    </div>
                  ) : (
                    history.map((record) => {
                      const completion = calculateCompletion(record.deeds);
                      return (
                        <div 
                          key={record.id} 
                          onClick={() => {
                            setCurrentDate(new Date(record.date));
                            setActiveView('today');
                          }}
                          className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 hover:border-[#1799dc]/30 cursor-pointer group transition-all"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-[#1799dc] transition-colors">
                                {new Date(record.date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}
                              </span>
                              <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${completion === 100 ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                                {completion}% Terpenuhi
                              </span>
                            </div>
                            <div className="flex -space-x-2">
                              {DEEDS.filter(d => record.deeds[d.id]).slice(0, 5).map(d => (
                                <div key={d.id} className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-50 dark:border-slate-900 flex items-center justify-center shadow-sm" title={d.label}>
                                  <div className="scale-75">{d.icon}</div>
                                </div>
                              ))}
                              {Object.values(record.deeds).filter(Boolean).length > 5 && (
                                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-slate-50 dark:border-slate-900 flex items-center justify-center text-[10px] font-bold">
                                  +{Object.values(record.deeds).filter(Boolean).length - 5}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-500 rounded-full ${completion === 100 ? 'bg-emerald-500' : 'bg-[#1799dc]'}`}
                              style={{ width: `${completion}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
