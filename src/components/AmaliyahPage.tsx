import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { GoogleGenAI } from "@google/genai";
import { 
  CheckCircle2, 
  Circle, 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown,
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
  Loader2,
  RefreshCcw,
  Leaf
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
  Area,
  PieChart,
  Pie,
  Cell,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend
} from 'recharts';
import { auth, db, OperationType, handleFirestoreError } from '../firebase';

const DEEDS = [
  { id: 'shubuh', label: 'Shubuh', icon: <Sun className="w-5 h-5 text-amber-500" />, category: 'Wajib' },
  { id: 'dzuhur', label: 'Dzuhur', icon: <Sun className="w-5 h-5 text-yellow-500" />, category: 'Wajib' },
  { id: 'ashar', label: 'Ashar', icon: <CloudSun className="w-5 h-5 text-orange-500" />, category: 'Wajib' },
  { id: 'maghrib', label: 'Maghrib', icon: <CloudMoon className="w-5 h-5 text-indigo-500" />, category: 'Wajib' },
  { id: 'isya', label: 'Isya', icon: <Moon className="w-5 h-5 text-slate-500" />, category: 'Wajib' },
  
  { id: 'qabliyah_shubuh', label: 'Qabliyah Shubuh', icon: <Sunrise className="w-5 h-5 text-amber-400" />, category: 'Rawatib' },
  { id: 'rawatib_dzuhur', label: 'Rawatib Dzuhur', icon: <Sun className="w-5 h-5 text-yellow-400" />, category: 'Rawatib' },
  { id: 'rawatib_maghrib', label: 'Ba\'diyah Maghrib', icon: <CloudMoon className="w-5 h-5 text-indigo-400" />, category: 'Rawatib' },
  { id: 'rawatib_isya', label: 'Ba\'diyah Isya', icon: <Moon className="w-5 h-5 text-slate-400" />, category: 'Rawatib' },
  
  { id: 'tahajjud', label: 'Tahajjud', icon: <Moon className="w-5 h-5 text-indigo-600" />, category: 'Sunnah' },
  { id: 'witir', label: 'Witir', icon: <Sparkles className="w-5 h-5 text-yellow-500" />, category: 'Sunnah' },
  { id: 'dhuha', label: 'Dhuha', icon: <Sun className="w-5 h-5 text-yellow-300" />, category: 'Sunnah' },
  
  { id: 'dzikir_pagi', label: 'Dzikir Pagi', icon: <Sunrise className="w-5 h-5 text-orange-400" />, category: 'Dzikir' },
  { id: 'dzikir_petang', label: 'Dzikir Petang', icon: <Sunset className="w-5 h-5 text-indigo-500" />, category: 'Dzikir' },
  { id: 'sholawat', label: 'Sholawat', icon: <Heart className="w-5 h-5 text-rose-500" />, category: 'Dzikir' },
  { id: 'istighfar', label: 'Istighfar', icon: <HeartPulse className="w-5 h-5 text-slate-400" />, category: 'Dzikir' },
  
  { id: 'tilawah', label: 'Tilawah Qur\'an', icon: <BookOpen className="w-5 h-5 text-emerald-500" />, category: 'Ilmu' },
  { id: 'sedekah', label: 'Sedekah', icon: <HandHeart className="w-5 h-5 text-rose-500" />, category: 'Amal' },
  { id: 'birrul_walidain', label: 'Berbakti Orang Tua', icon: <HeartPulse className="w-5 h-5 text-red-500" />, category: 'Akhlak' },
];

// Util helpers for optimized state calculations (preventing O(N) array allocations)
const getCompletedDeedsCount = (deeds: Record<string, boolean>): number => {
  let count = 0;
  for (const key in deeds) {
    if (deeds[key]) count++;
  }
  return count;
};

const getSpecificDeedsCount = (deeds: Record<string, boolean>, targetIds: string[]): number => {
  let count = 0;
  for (let i = 0; i < targetIds.length; i++) {
    if (deeds[targetIds[i]]) count++;
  }
  return count;
};

export default function AmaliyahPage() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<'today' | 'history' | 'stats'>('today');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [todayDeeds, setTodayDeeds] = useState<Record<string, boolean>>({});
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{uid: string} | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [historyCategoryFilter, setHistoryCategoryFilter] = useState<string>('Semua');
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);

  const [isPhoneLoginHovered, setIsPhoneLoginHovered] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  
  // Custom sync with localStorage instead of using Firebase Auth
  const getStoredPhone = () => localStorage.getItem('app_user_phone');
  
  useEffect(() => {
    // Check local storage instead of auth.onAuthStateChanged
    const storedPhone = getStoredPhone();
    if (storedPhone) {
      setUser({ uid: storedPhone } as any);
    }
    setLoading(false);
  }, []);

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneInput.trim()) return;
    
    setLoading(true);
    const formattedPhone = phoneInput.trim();
    localStorage.setItem('app_user_phone', formattedPhone);
    setUser({ uid: formattedPhone } as any);
    setLoading(false);
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
    const phone = localStorage.getItem('app_user_phone');
    const targetUid = phone || user.uid;

    const docId = `${targetUid}_${todayStr}`;
    const docRef = doc(db, 'amaliyah_records', docId);

    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        setTodayDeeds(snapshot.data().deeds || {});
      } else {
        setTodayDeeds({});
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'amaliyah_records/' + docId);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, todayStr]);

  // Fetch history for streak and history view
  useEffect(() => {
    if (!user) return;
    const phone = localStorage.getItem('app_user_phone');
    const targetUid = phone || user.uid;

    const q = query(
      collection(db, 'amaliyah_records'),
      where('userId', '==', targetUid),
      orderBy('date', 'desc'),
      limit(30)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const records = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setHistory(records);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'amaliyah_records/query:' + targetUid);
    });

    return () => unsubscribe();
  }, [user]);

  const toggleDeed = async (deedId: string) => {
    if (!user) return;
    const phone = localStorage.getItem('app_user_phone');
    const targetUid = phone || user.uid;

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

    const docId = `${targetUid}_${todayStr}`;
    const docRef = doc(db, 'amaliyah_records', docId);

    try {
      const data: any = {
        userId: targetUid,
        date: todayStr,
        deeds: newDeeds,
        updatedAt: serverTimestamp(),
      };

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

  const calculateCompletion = (deeds: Record<string, boolean>, categoryFilter: string = 'Semua') => {
    const relevantDeeds = categoryFilter === 'Semua' 
      ? DEEDS 
      : DEEDS.filter(d => d.category === categoryFilter);
    
    if (relevantDeeds.length === 0) return 0;
    
    const checkedCount = relevantDeeds.filter(d => deeds[d.id]).length;
    return Math.round((checkedCount / relevantDeeds.length) * 100);
  };

  const chartData = React.useMemo(() => {
    return [...history]
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-7)
      .map(record => ({
        date: new Date(record.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
        completion: calculateCompletion(record.deeds, selectedCategory)
      }));
  }, [history, selectedCategory]);

  const categoryDistributionData = React.useMemo(() => {
    const categories = Array.from(new Set(DEEDS.map(d => d.category)));
    
    // For today or last entry
    const currentDeeds = todayDeeds;
    
    return categories.map(cat => {
      const catDeeds = DEEDS.filter(d => d.category === cat);
      const completed = catDeeds.filter(d => currentDeeds[d.id]).length;
      return {
        subject: cat,
        A: Math.round((completed / catDeeds.length) * 100),
        fullMark: 100
      };
    });
  }, [todayDeeds]);

  const pieData = React.useMemo(() => {
    const totalDeeds = DEEDS.length;
    const completed = getCompletedDeedsCount(todayDeeds);
    const remaining = totalDeeds - completed;
    
    return [
      { name: 'Selesai', value: completed, color: '#10b981' },
      { name: 'Belum', value: remaining, color: '#e2e8f0' }
    ];
  }, [todayDeeds]);

  const categoryStats = React.useMemo(() => {
    const categories = Array.from(new Set(DEEDS.map(d => d.category)));
    return categories.map(cat => {
      const catDeeds = DEEDS.filter(d => d.category === cat);
      const completedCount = catDeeds.filter(d => todayDeeds[d.id]).length;
      return {
        name: cat,
        completed: completedCount,
        total: catDeeds.length,
        percentage: Math.round((completedCount / catDeeds.length) * 100)
      };
    });
  }, [todayDeeds]);

  const auraVisual = React.useMemo(() => {
    const stats = categoryStats;
    const colors: Record<string, string> = {
      'Wajib': 'rgba(14, 165, 233, 0.5)', // Blue
      'Sunnah': 'rgba(168, 85, 247, 0.5)', // Purple
      'Zikir': 'rgba(16, 185, 129, 0.5)',  // Green
      'Tilawah': 'rgba(245, 158, 11, 0.5)' // Amber
    };

    const activeColors = stats
      .filter(s => s.percentage > 0)
      .map(s => colors[s.name] || 'rgba(100, 116, 139, 0.2)');

    return activeColors.length > 0 ? activeColors : ['rgba(226, 232, 240, 0.2)'];
  }, [categoryStats]);

  const [aiMuhasabah, setAiMuhasabah] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [globalPrayers, setGlobalPrayers] = useState(128452);
  const [sendingPrayer, setSendingPrayer] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setGlobalPrayers(prev => prev + Math.floor(Math.random() * 3));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const sendPrayer = () => {
    setSendingPrayer(true);
    setTimeout(() => {
      setGlobalPrayers(prev => prev + 1);
      setSendingPrayer(false);
      confetti({
        particleCount: 40,
        spread: 70,
        origin: { y: 0.8 },
        colors: ['#0ea5e9', '#8b5cf6', '#10b981']
      });
    }, 800);
  };

  const getAiMuhasabah = async () => {
    if (history.length === 0 && getCompletedDeedsCount(todayDeeds) === 0) {
      setAiMuhasabah("Langkahkan kakimu hari ini dengan basmalah, maka setiap jejakmu akan menjadi saksi kebaikan.");
      return;
    }
    setIsAiLoading(true);
    try {
      const completionAvg = chartData.length > 0 
        ? Math.round(chartData.reduce((acc, curr) => acc + curr.completion, 0) / chartData.length)
        : 0;
      
      const prompt = `Analisis data spiritual berikut: Rata-rata keterisian amalan ${completionAvg}%. Kategori yang paling aktif saat ini berdasarkan distribusi radar: ${JSON.stringify(categoryDistributionData)}. Berikan 1 kalimat muhasabah (nasihat hati) yang sangat puitis, mendalam, dan memotivasi dalam bahasa Indonesia. Jangan pakai format markdown, langsung teks saja. Maksimal 20 kata.`;
      
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: prompt
      });
      setAiMuhasabah(response.text || "Jadikan setiap helai nafasmu sebagai zikir yang tak terputus kepada-Nya.");
    } catch (error) {
      console.error("AI Error:", error);
      setAiMuhasabah("Jadikan setiap helai nafasmu sebagai zikir yang tak terputus kepada-Nya.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const Garden = React.useMemo(() => {
    return ({ todayDeeds }: { todayDeeds: Record<string, boolean> }) => {
    // Determine completed specific deeds
    // Extract derived logic via helper for better performance
    const sholatCount = getSpecificDeedsCount(todayDeeds, ['shubuh', 'dzuhur', 'ashar', 'maghrib', 'isya']);
    const isSholatComplete = sholatCount === 5;
    
    const isDzikirComplete = todayDeeds['dzikir_pagi'] || todayDeeds['dzikir_petang'];
    const isTilawahComplete = todayDeeds['tilawah'];
    const isSedekahComplete = todayDeeds['sedekah'];
    
    // Growth metrics
    const treeScale = 0.5 + (sholatCount * 0.1); 
    const treeLeavesAndFruitsOpacity = sholatCount / 5;

    // Interaction states
    const [pulse, setPulse] = useState(false);
    const [floatingWords, setFloatingWords] = useState<{ id: number, text: string }[]>([]);
    const [orbs, setOrbs] = useState<number[]>([]);
    const [particles, setParticles] = useState<{ id: number, x: number, y: number, color: string }[]>([]);
    
    // Initialize lazily to prevent O(N) evaluation on every render
    const prevDeedsCount = useRef<number | null>(null);
    const completedSessionDeeds = useRef(0);

    const colors = ['#f5a623', '#0fd171', '#ff95ba', '#ff6b9e', '#3b82f6'];

    useEffect(() => {
        const currentCount = getCompletedDeedsCount(todayDeeds);
        
        // Only run the pulse effect if it's not the initial mount and a deed was added
        if (prevDeedsCount.current !== null && currentCount > prevDeedsCount.current) {
            // A deed was just added
            completedSessionDeeds.current += 1;
            const newId = Date.now();
            
            // Trigger Tree Pulse
            setPulse(true);
            setTimeout(() => setPulse(false), 800);

            // Floating Words Quotes
            const quotes = [
                "MashaAllah ✨", "Alhamdulillah 🌿", "Barakallah 🌟", 
                "Bertambah Cahaya 💡", "Tabungan Akhirat 🕊️", "Satu Kebaikan 🌸", 
                "Istiqomah 💫", "Pahala Berlipat 💎", "Senyum Malaikat 🍃"
            ];
            
            const newQuote = { id: newId, text: quotes[Math.floor(Math.random() * quotes.length)] };
            setFloatingWords(prev => [...prev, newQuote]);
            setTimeout(() => {
                setFloatingWords(prev => prev.filter(w => w.id !== newId));
            }, 3000);

            // Crazy Idea: A magical Light Orb flies from bottom of screen into the tree every time!
            setOrbs(prev => [...prev, newId]);
            setTimeout(() => {
                setOrbs(prev => prev.filter(id => id !== newId));
            }, 2500); // the orb takes about 2.5s to reach tree

            // Particle Explosion
            const newParticles = Array.from({ length: 15 }).map((_, i) => ({
                id: newId + i,
                x: (Math.random() - 0.5) * 300,
                y: (Math.random() - 0.5) * 300,
                color: colors[Math.floor(Math.random() * colors.length)]
            }));
            setParticles(prev => [...prev, ...newParticles]);
            setTimeout(() => {
                setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
            }, 2000);
        }
        prevDeedsCount.current = currentCount;
    }, [todayDeeds]);

    // Form stable random values out of render cycle to prevent glitching
    const memoizedWindParams = React.useMemo(() => {
        return [...Array(6)].map(() => ({
            y: Math.random() * 200,
            yTarget1: Math.random() * 200,
            yTarget2: Math.random() * 200 + 50,
            duration: 8 + Math.random() * 10,
            delay: Math.random() * 5
        }));
    }, []);

    const memoizedRainParams = React.useMemo(() => {
        // window.innerWidth isn't reliable here and changes, use percentages
        return [...Array(15)].map(() => ({
            x: Math.random() * 100, // percentage
            duration: 1 + Math.random(),
            delay: Math.random() * 2
        }));
    }, []);

    return (
      <div className="w-full h-64 md:h-80 bg-gradient-to-b from-sky-200/50 to-emerald-100/50 dark:from-cyan-950/30 dark:to-emerald-900/30 rounded-[2.5rem] mt-8 mb-8 relative overflow-hidden border border-white/40 dark:border-white/5 shadow-inner flex items-end justify-center">
        {/* Sky/Sun for Tilawah */}
        <AnimatePresence>
            {isTilawahComplete && (
                <motion.div 
                    key="sun-glow"
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute top-4 right-8 md:top-8 md:right-16 w-24 h-24 bg-amber-300 rounded-full blur-[30px] opacity-70 flex items-center justify-center pointer-events-none"
                >
                    <div className="w-12 h-12 bg-yellow-200 rounded-full blur-[10px]"></div>
                </motion.div>
            )}
        </AnimatePresence>

        {isTilawahComplete && (
            <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                className="absolute top-8 right-12 md:top-12 md:right-20 text-amber-400/50 dark:text-amber-300/30 pointer-events-none"
            >
                <Sun className="w-16 h-16" />
            </motion.div>
        )}

        {/* Wind / Dzikir */}
        {isDzikirComplete && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {memoizedWindParams.map((params, i) => (
                    <motion.div
                        key={`wind-${i}`}
                        initial={{ left: '-10%', y: params.y, opacity: 0 }}
                        animate={{ 
                            left: ['0%', '110%'], 
                            y: [params.yTarget1, params.yTarget2],
                            opacity: [0, 0.4, 0] 
                        }}
                        transition={{ duration: params.duration, repeat: Infinity, delay: params.delay }}
                        className="absolute w-4 h-1 bg-white dark:bg-emerald-200 rounded-full blur-[2px]"
                    />
                ))}
            </div>
        )}

        {/* Rain / Sedekah */}
        {isSedekahComplete && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden text-blue-400/30 dark:text-cyan-400/40">
                 {memoizedRainParams.map((params, i) => (
                    <motion.div
                        key={`rain-${i}`}
                        initial={{ y: -20, left: `${params.x}%` }}
                        animate={{ y: 500, opacity: [0, 0.7, 0] }}
                        transition={{ duration: params.duration, repeat: Infinity, ease: "linear", delay: params.delay }}
                        className="absolute w-0.5 h-3 bg-current rounded-full"
                    />
                ))}
            </div>
        )}

        {/* The Tree (Sholat) */}
        <motion.div 
            animate={{ 
                scale: pulse ? treeScale * 1.1 : treeScale,
                filter: pulse ? 'brightness(1.2)' : 'brightness(1)'
            }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="relative z-10 flex flex-col items-center origin-bottom transform-gpu"
            style={{ transformOrigin: 'bottom center' }}
        >
            {/* Tree Crown */}
            <motion.div 
                className="relative w-40 h-40 md:w-56 md:h-56 mb-[-30px] md:mb-[-40px]"
                animate={{ opacity: treeLeavesAndFruitsOpacity > 0 ? 1 : 0.3 }}
            >
                <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
                    <motion.path 
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.5 }}
                        d="M100 20 C40 20 10 70 30 120 C10 160 50 190 100 180 C150 190 190 160 170 120 C190 70 160 20 100 20 Z" 
                        className={`transition-colors duration-1000 ${isSholatComplete ? 'fill-[#0fd171] drop-shadow-lg' : (sholatCount > 0 ? 'fill-[#0fd171]/80 drop-shadow-md' : 'fill-slate-200 dark:fill-slate-800')}`}
                    />
                    
                    {/* Fruits or Flowers (Only if full Sholat) */}
                    <AnimatePresence>
                        {isSholatComplete && (
                            <motion.g key="fruits">
                                <motion.circle initial={{ scale: 0 }} animate={{ scale: 1 }} cx="70" cy="80" r="8" className="fill-[#ff6b9e]" />
                                <motion.circle initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }} cx="120" cy="60" r="10" className="fill-[#f5a623]" />
                                <motion.circle initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4 }} cx="140" cy="110" r="9" className="fill-[#ff95ba]" />
                                <motion.circle initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6 }} cx="60" cy="130" r="7" className="fill-[#f5a623]" />
                            </motion.g>
                        )}
                    </AnimatePresence>
                </svg>

                {/* Particle Explosion */}
                <AnimatePresence>
                    {particles.map(particle => (
                        <motion.div
                            key={particle.id}
                            initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                            animate={{ 
                                x: particle.x, 
                                y: particle.y, 
                                scale: [0, Math.random() * 1.5 + 0.5, 0], 
                                opacity: [1, 0.8, 0],
                                rotate: Math.random() * 360
                            }}
                            transition={{ duration: 1.5 + Math.random(), ease: "easeOut" }}
                            className="absolute top-1/2 left-1/2 w-3 h-3 rounded-full pointer-events-none z-50 mix-blend-screen"
                            style={{ backgroundColor: particle.color, boxShadow: `0 0 10px ${particle.color}` }}
                        />
                    ))}
                </AnimatePresence>

                {/* Floating Words on Tree */}
                <AnimatePresence>
                    {floatingWords.map((word) => (
                        <motion.div
                            key={word.id}
                            initial={{ opacity: 0, y: 50, scale: 0.5 }}
                            animate={{ opacity: 1, y: 0, scale: 1.2 }}
                            exit={{ opacity: 0, y: -40, scale: 0.8 }}
                            transition={{ duration: 2, ease: "easeOut" }}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap px-3 py-1 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-full text-sm font-black text-emerald-600 dark:text-emerald-400 shadow-2xl border border-emerald-200 dark:border-emerald-700 z-50 pointer-events-none"
                        >
                            {word.text}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>
            
            {/* Tree Trunk */}
            <div className="w-6 md:w-8 h-24 md:h-32 bg-gradient-to-t from-amber-900 to-amber-700 dark:from-slate-800 dark:to-amber-900/80 rounded-t-lg relative z-0">
                {/* Branch */}
                <div className="absolute top-6 -right-6 w-8 h-2 bg-amber-800 dark:bg-amber-900/80 -rotate-45 rounded-full z-[-1]"></div>
                <div className="absolute top-12 -left-5 w-7 h-2 bg-amber-800 dark:bg-amber-900/80 rotate-45 rounded-full z-[-1]"></div>
            </div>
        </motion.div>

        {/* Magical Orbs of Good Deeds (Ide Gila) */}
        <AnimatePresence>
            {orbs.map((orbId) => (
                <motion.div
                    key={orbId}
                    initial={{ left: '50%', bottom: '0px', opacity: 0, scale: 0 }}
                    animate={{ 
                        left: ['50%', '30%', '60%', '50%'],
                        bottom: ['0px', '40%', '60%', '80%'],
                        opacity: [0, 1, 1, 0],
                        scale: [0, 1.5, 1, 3]
                    }}
                    transition={{ duration: 2.5, ease: "easeInOut" }}
                    className="absolute z-50 pointer-events-none drop-shadow-2xl mix-blend-screen"
                >
                    {/* Glowing Aura around Orb */}
                    <div className="absolute inset-0 bg-yellow-300 rounded-full blur-[10px] opacity-80 scale-[3] animate-pulse"></div>
                    <div className="w-4 h-4 bg-white rounded-full shadow-[0_0_20px_#fde047]"></div>
                </motion.div>
            ))}
        </AnimatePresence>

        {/* Ground */}
        <div className="absolute bottom-0 left-0 right-0 h-6 md:h-8 bg-emerald-600/20 dark:bg-emerald-950/80 backdrop-blur-md z-20 shadow-[0_-10px_30px_rgba(16,185,129,0.2)]" />
        
        {/* Flower bed (Dzikir) */}
        <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 w-full max-w-sm flex justify-around z-30 px-10 pointer-events-none">
             <AnimatePresence>
                {todayDeeds['dzikir_pagi'] && (
                    <motion.div key="dzikir_pagi" initial={{ scale: 0, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0, opacity: 0 }} className="text-pink-400 dark:text-pink-500">
                        <Sparkles className="w-6 h-6 fill-current" />
                    </motion.div>
                )}
                {todayDeeds['dzikir_petang'] && (
                    <motion.div key="dzikir_petang" initial={{ scale: 0, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0, opacity: 0 }} className="text-indigo-400 dark:text-indigo-500">
                        <Sparkles className="w-6 h-6 fill-current" />
                    </motion.div>
                )}
             </AnimatePresence>
        </div>

        <div className="absolute top-4 left-6 max-w-xs text-slate-600 dark:text-slate-300 md:block hidden z-40 bg-white/40 dark:bg-slate-900/40 p-3 rounded-2xl backdrop-blur-sm shadow-sm border border-white/20 dark:border-white/5 pointer-events-none">
            <h3 className="font-serif font-bold text-sm mb-1 flex items-center gap-2">Taman Syurga <Leaf className="w-3 h-3 text-emerald-500" /></h3>
            <p className="text-[10px] leading-relaxed opacity-80 font-medium">
                Pohon tumbuh dengan sholat fardhu. Mentari bersinar dengan tilawah. Hujan rahmat turun dengan sedekah. Bunga merekah dengan dzikir.
            </p>
        </div>
      </div>
    );
  };
  }, []);

  const { totalPoints, levelName, pointsToNext } = React.useMemo(() => {
    const historyPast = history.filter(r => r.date !== todayStr);
    const pastDeedsCount = historyPast.reduce((acc, curr) => acc + Object.values(curr.deeds || {}).filter(Boolean).length, 0);
    const currentDeedsCount = getCompletedDeedsCount(todayDeeds);
    const points = (pastDeedsCount + currentDeedsCount) * 10;
    
    let level = 'Mubtadi (Pemula)';
    let nextLevelPoints = 500;
    
    if (points >= 5000) {
      level = 'Muhsin (Sempurna)';
      nextLevelPoints = points; // Max level
    } else if (points >= 2000) {
      level = 'Mukhlis (Ikhlas)';
      nextLevelPoints = 5000;
    } else if (points >= 500) {
      level = 'Istiqomah (Konsisten)';
      nextLevelPoints = 2000;
    }
    
    return {
      totalPoints: points,
      levelName: level,
      pointsToNext: points >= 5000 ? 0 : nextLevelPoints - points
    }
  }, [history, todayDeeds, todayStr]);

  const todayCompletion = calculateCompletion(todayDeeds);

  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
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
          <div className="w-20 h-20 bg-primary-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <LayoutDashboard className="w-10 h-10 text-primary-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-3">Mulai Amaliyah</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
            Masukkan nomor WA Anda untuk mulai mencatat amaliyah harian Anda secara pribadi dan aman.
          </p>
          <form onSubmit={handleManualLogin} className="space-y-4">
            <input
              type="tel"
              placeholder="Contoh: 081234567890"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              className="w-full h-14 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 outline-none focus:border-primary-500 transition-colors text-slate-800 dark:text-white font-medium"
              required
            />
            <motion.button 
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full h-14 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-primary-500/30 hover:from-primary-600 hover:to-primary-700 transition-all font-medium"
            >
              <LogIn className="w-5 h-5" /> Mulai Sekarang
            </motion.button>
          </form>
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
            <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">Amaliyah & Ibadah</h1>
            <p className="text-slate-500 dark:text-slate-400">Pusat aktivitas dan ibadah harian Anda.</p>
          </div>
          
          <div className="flex bg-white dark:bg-slate-800 rounded-2xl p-1 shadow-sm border border-slate-200 dark:border-slate-700 overflow-x-auto no-scrollbar">
            <button 
              onClick={() => setActiveView('today')}
              className={`whitespace-nowrap flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeView === 'today' ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
            >
              <LayoutDashboard className="w-4 h-4" /> Tracker
            </button>
            <button 
              onClick={() => setActiveView('stats')}
              className={`whitespace-nowrap flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeView === 'stats' ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
            >
              <TrendingUp className="w-4 h-4" /> Stats
            </button>
            <button 
              onClick={() => setActiveView('history')}
              className={`whitespace-nowrap flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeView === 'history' ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
            >
              <History className="w-4 h-4" /> History
            </button>
          </div>
        </div>

        {/* Hub/Menu Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 md:gap-3 mb-6 md:mb-8">
          {[
            { name: "Qur'an", icon: BookOpen, path: '/quran', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400' },
            { name: "Hadits", icon: BookOpen, path: '/quran?tab=hadits', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400' },
            { name: "Doa", icon: HandHeart, path: '/quran?tab=doa', color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400' },
            { name: "Dzikir", icon: HeartPulse, path: '/quran?tab=dzikir', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400' },
            { name: "Sholat", icon: CalendarIcon, path: '/sholat', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400' },
            { name: "Makhraj", icon: Sparkles, path: '/quran?tab=makhraj', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400' },
          ].map((item, index) => (
            <motion.button
              key={index}
              onClick={() => {
                navigate(item.path);
                window.scrollTo(0,0);
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center justify-center p-2.5 sm:p-4 bg-white dark:bg-slate-800 rounded-[1.25rem] shadow-sm border border-slate-100 dark:border-slate-700 gap-1.5 hover:shadow-md transition-all group"
            >
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-[0.8rem] flex items-center justify-center font-bold ${item.color} group-hover:scale-110 transition-transform`}>
                <item.icon className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <span className="text-[9px] sm:text-[10px] font-bold text-slate-600 dark:text-slate-300 text-center leading-tight whitespace-nowrap">{item.name}</span>
            </motion.button>
          ))}
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
            className="sm:col-span-2 lg:col-span-1 bg-gradient-to-br from-primary-500 to-primary-600 p-6 rounded-3xl shadow-lg shadow-primary-500/20 text-white"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold opacity-80 uppercase tracking-widest">Level</span>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xl font-black">{levelName}</p>
                <p className="text-[10px] opacity-80 font-bold uppercase">{pointsToNext > 0 ? `${pointsToNext} points to next level` : `${totalPoints} total points (Max)`}</p>
              </div>
              <Sparkles className="w-8 h-8 opacity-50" />
            </div>
          </motion.div>
        </div>

        <AnimatePresence mode="wait">
          {activeView === 'today' && (
            <motion.div
              key="garden"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-8"
            >
              <Garden todayDeeds={todayDeeds} />
            </motion.div>
          )}
        </AnimatePresence>

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
                <div className="flex items-center justify-between gap-3 mb-5 p-3 md:p-4 rounded-[1.5rem] bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1 md:gap-2">
                    <button 
                      onClick={() => {
                        const d = new Date(currentDate);
                        d.setDate(d.getDate() - 1);
                        setCurrentDate(d);
                      }}
                      className="p-1.5 md:p-2 hover:bg-white dark:hover:bg-slate-800 shadow-sm md:shadow-none hover:shadow-sm rounded-full transition-all active:scale-95 shrink-0 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                    >
                      <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                    
                    <div className="flex flex-col min-w-[100px] text-center md:text-left">
                       <span className="text-[9px] md:text-[10px] font-bold text-primary-500/80 uppercase tracking-widest hidden md:block">
                         {formatDate(currentDate) === formatDate(new Date()) ? 'Hari Ini' : currentDate.toLocaleDateString('id-ID', { weekday: 'long' })}
                       </span>
                       <span className="text-[10px] md:hidden font-bold text-primary-500/80 uppercase tracking-widest mb-0.5">
                         {formatDate(currentDate) === formatDate(new Date()) ? 'Hari Ini' : currentDate.toLocaleDateString('id-ID', { weekday: 'short' })}
                       </span>
                       <div className="flex items-center justify-center md:justify-start gap-1.5">
                         <CalendarIcon className="w-3 h-3 text-slate-400 hidden md:block" />
                         <span className="text-xs md:text-sm font-black text-slate-700 dark:text-slate-200">
                           {currentDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                         </span>
                       </div>
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
                      className={`p-1.5 md:p-2 rounded-full transition-all shrink-0 ${formatDate(currentDate) === formatDate(new Date()) ? 'opacity-20 cursor-not-allowed text-slate-300' : 'hover:bg-white dark:hover:bg-slate-800 shadow-sm md:shadow-none hover:shadow-sm active:scale-95 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'}`}
                    >
                      <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2 md:gap-4 shrink-0">
                    {formatDate(currentDate) !== formatDate(new Date()) && (
                      <button 
                        onClick={() => setCurrentDate(new Date())}
                        className="text-[9px] md:text-[10px] font-bold text-primary-600 hover:text-primary-700 transition-colors bg-primary-100 hover:bg-primary-200 px-2 py-1 md:px-3 md:py-1.5 rounded-lg active:scale-95"
                      >
                        Kembali
                      </button>
                    )}
                    <div className="text-right flex flex-col md:block">
                      <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Progress</span>
                      <div className="text-xs md:text-sm font-black text-primary-500 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-700 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                        {getCompletedDeedsCount(todayDeeds)} <span className="text-slate-300 dark:text-slate-600 font-normal mx-0.5">/</span> {DEEDS.length}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-6 pb-6 border-b border-slate-100 dark:border-slate-700 mb-6">
                  {Object.entries(
                    DEEDS.reduce((acc, deed) => {
                      if (!acc[deed.category]) acc[deed.category] = [];
                      acc[deed.category].push(deed);
                      return acc;
                    }, {} as Record<string, typeof DEEDS>)
                  ).map(([category, categoryDeeds]) => (
                    <div key={category} className="mb-2">
                       <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2 mb-3 flex items-center gap-3">
                        {category}
                        <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800"></div>
                      </h3>
                      <div className="bg-white dark:bg-slate-900/60 rounded-[1.25rem] border border-slate-100 dark:border-slate-800 shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden divide-y divide-slate-50 dark:divide-slate-800/50">
                        {categoryDeeds.map((deed) => {
                          const isActive = todayDeeds[deed.id];
                          const isSaving = savingId === deed.id;
                          
                          return (
                            <button
                              key={deed.id}
                              onClick={() => toggleDeed(deed.id)}
                              className={`group w-full flex items-center justify-between px-4 py-3 transition-colors duration-300 relative ${
                                isActive 
                                  ? 'bg-emerald-50/50 dark:bg-emerald-500/5 hover:bg-emerald-50 dark:hover:bg-emerald-500/10' 
                                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                              }`}
                            >
                              <div className="flex items-center gap-3.5 z-10 w-full">
                                <div className={`w-9 h-9 rounded-[0.6rem] flex items-center justify-center transition-all duration-300 shadow-sm ${isActive ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 scale-100' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 scale-95 group-hover:scale-100 group-hover:bg-white dark:group-hover:bg-slate-700'}`}>
                                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <div className="[&>svg]:w-4 [&>svg]:h-4">{deed.icon}</div>}
                                </div>
                                <div className="text-left flex-1">
                                  <h4 className={`text-sm font-bold transition-colors ${isActive ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-200'}`}>{deed.label}</h4>
                                </div>
                              </div>
                              
                              <div className={`transition-all duration-500 z-10 pl-3 ${isActive ? 'scale-110 text-emerald-500' : 'text-slate-200 dark:text-slate-700 group-hover:text-primary-400 dark:group-hover:text-primary-500/60'}`}>
                                {isActive ? <CheckCircle2 className="w-6 h-6 fill-emerald-50 dark:fill-emerald-900/20" /> : <Circle className="w-6 h-6" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/10 p-5 rounded-2xl border border-blue-100 dark:border-blue-900/30 flex items-start gap-4">
                  <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center flex-shrink-0 text-primary-500 shadow-sm">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-blue-900 dark:text-blue-300 text-sm mb-1">Istiqomah adalah Kunci</h5>
                    <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
                      "Amalan yang paling dicintai oleh Allah adalah amalan yang kontinyu sekalipun sedikit." (HR. Muslim). Cukup satu klik untuk mencatat perjalanan takwa Anda.
                    </p>
                  </div>
                </div>

                {/* Crazy Feature: Global Synergy */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-8 relative overflow-hidden p-8 rounded-[2.5rem] bg-gradient-to-tr from-emerald-600 to-emerald-400 text-white shadow-xl shadow-emerald-500/20"
                >
                  <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <HeartPulse className="w-5 h-5 text-white animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Global Synergy</span>
                      </div>
                      <h4 className="text-2xl font-black mb-1">{globalPrayers.toLocaleString()}</h4>
                      <p className="text-xs font-medium opacity-80">Doa digital telah dipanjatkan hari ini</p>
                    </div>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={sendPrayer}
                      disabled={sendingPrayer}
                      className="px-8 py-4 bg-white text-emerald-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-black/10 hover:shadow-emerald-500/20 transition-all flex items-center gap-3 disabled:opacity-50"
                    >
                      {sendingPrayer ? <Loader2 className="w-4 h-4 animate-spin text-emerald-500" /> : <HandHeart className="w-4 h-4" />}
                      Kirim Doa Digital
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            ) : activeView === 'stats' ? (
              <motion.div 
                key="stats"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                {/* Crazy Feature: Spiritual Aura & AI Muhasabah */}
                <div className="relative overflow-hidden rounded-[3rem] bg-slate-950 text-white p-8 md:p-12 group shadow-2xl shadow-black/40">
                  {/* Generative Aura Background */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {auraVisual.map((color, i) => (
                      <motion.div
                        key={i}
                        animate={{
                          scale: [1, 1.4, 1],
                          x: [0, 40, -40, 0],
                          y: [0, -40, 40, 0],
                          opacity: [0.2, 0.4, 0.2]
                        }}
                        transition={{
                          duration: 15 + i * 3,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                        className="absolute w-[400px] h-[400px] rounded-full blur-[120px]"
                        style={{ 
                          backgroundColor: color,
                          left: `${10 + i * 20}%`,
                          top: `${10 + i * 15}%`
                        }}
                      />
                    ))}
                  </div>

                  <div className="relative z-10 max-w-2xl">
                    <div className="flex items-center justify-between mb-10 md:mb-16">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">Global Presence</span>
                        </div>
                        <p className="text-[11px] font-bold text-slate-400 tracking-tight">
                          <span className="text-white font-black">{globalPrayers.toLocaleString()}</span> orang beramal bersama
                        </p>
                      </div>
                      <div className="w-14 h-14 rounded-2xl bg-white/5 backdrop-blur-xl flex items-center justify-center border border-white/10 shadow-inner">
                        <Sparkles className="w-6 h-6 text-primary-400 drop-shadow-[0_0_8px_rgba(14,165,233,0.5)]" />
                      </div>
                    </div>

                    <div className="mb-12 md:mb-20">
                      <h3 className="text-sm font-black text-primary-400 uppercase tracking-[0.4em] mb-6 opacity-80 flex items-center gap-3">
                        <div className="w-8 h-px bg-primary-500/30" />
                        AI Spirit Reflection
                      </h3>
                      <div className="min-h-[100px] md:min-h-[140px] flex items-center">
                        {aiMuhasabah ? (
                          <motion.p 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-2xl md:text-4xl font-black text-white italic leading-[1.3] tracking-tight drop-shadow-sm"
                          >
                            <span className="text-primary-500 mr-2 text-5xl md:text-7xl opacity-30 select-none">"</span>
                            {aiMuhasabah}
                            <span className="text-primary-500 ml-2 text-5xl md:text-7xl opacity-30 select-none">"</span>
                          </motion.p>
                        ) : (
                          <div className="space-y-4 w-full">
                            <div className="h-4 w-4/5 bg-white/5 rounded-full animate-pulse" />
                            <div className="h-4 w-3/5 bg-white/5 rounded-full animate-pulse" />
                            <div className="h-4 w-1/2 bg-white/5 rounded-full animate-pulse opacity-50" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                      <motion.button 
                        whileHover={{ scale: 1.05, backgroundColor: '#0ea5e9', color: '#fff' }}
                        whileTap={{ scale: 0.95 }}
                        onClick={getAiMuhasabah}
                        disabled={isAiLoading}
                        className="px-8 py-4 rounded-2xl bg-white text-slate-900 font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-black/40 flex items-center gap-3 disabled:opacity-50"
                      >
                        {isAiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
                        Minta Tips Langit
                      </motion.button>
                      <div className="flex -space-x-3 items-center ml-2">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center overflow-hidden">
                            <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800" />
                          </div>
                        ))}
                        <span className="ml-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Online Community</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-primary-500" /> Analisis Spiritual
                  </h3>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                    {['Semua', ...Array.from(new Set(DEEDS.map(d => d.category)))].map(cat => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`whitespace-nowrap px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${
                          selectedCategory === cat 
                            ? 'bg-primary-500 text-white border-primary-500 shadow-md shadow-primary-500/20' 
                            : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-100 dark:border-slate-800'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Progress Overview Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                  {/* Line/Area Chart */}
                  <div className="bg-slate-50 dark:bg-slate-900/30 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Progres Mingguan: {selectedCategory}</h4>
                    <div className="h-[220px] w-full">
                      {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData}>
                            <defs>
                              <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
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
                              stroke="#0ea5e9" 
                              strokeWidth={3} 
                              fillOpacity={1} 
                              fill="url(#colorComp)" 
                              animationDuration={1500}
                              animationEasing="ease-in-out"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400">
                          <TrendingUp className="w-12 h-12 mb-3 opacity-10" />
                          <p className="text-sm font-bold">Data grafik belum tersedia</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Distribution Diagram (Radar Chart) */}
                  <div className="bg-slate-50 dark:bg-slate-900/30 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Distribusi Kategori (Hari Ini)</h4>
                    <div className="h-[220px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={categoryDistributionData}>
                          <PolarGrid stroke="#e2e8f0" />
                          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fontWeight: 'bold', fill: '#64748b' }} />
                          <Radar
                            name="Pencapaian"
                            dataKey="A"
                            stroke="#8b5cf6"
                            fill="#8b5cf6"
                            fillOpacity={0.6}
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
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Additional Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                   {/* Breakdown by Category Status */}
                   <div className="bg-white dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Detail Hari Ini</h4>
                    <div className="space-y-4">
                      {categoryStats.map(stat => (
                        <div key={stat.name} className="flex flex-col gap-1">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-600 dark:text-slate-300">{stat.name}</span>
                            <span className="font-black text-slate-400 uppercase tracking-tighter">{stat.completed}/{stat.total}</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${stat.percentage}%` }}
                              className={`h-full rounded-full ${
                                stat.percentage === 100 ? 'bg-emerald-500' : 
                                stat.percentage >= 50 ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-700'
                              }`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Summary Cards */}
                  <div className="flex flex-col gap-4">
                    <div className="flex-1 p-6 rounded-3xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-4">
                      <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm">
                        <TrendingUp className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-0.5">Rata-rata {selectedCategory === 'Semua' ? 'Pekan Ini' : selectedCategory}</p>
                        <p className="text-3xl font-black text-slate-800 dark:text-white">
                          {chartData.length > 0 
                            ? Math.round(chartData.reduce((acc, curr) => acc + curr.completion, 0) / chartData.length) 
                            : 0}%
                        </p>
                      </div>
                    </div>
                    <div className="flex-1 p-6 rounded-3xl bg-primary-50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-900/30 flex items-center gap-4">
                      <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-primary-500 shadow-sm">
                        <Award className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-primary-600 dark:text-primary-400 uppercase tracking-widest mb-0.5">Pencapaian Tertinggi</p>
                        <p className="text-3xl font-black text-slate-800 dark:text-white">
                          {chartData.length > 0 
                            ? Math.max(...chartData.map(d => d.completion)) 
                            : 0}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Motivational Quote */}
                <div className="bg-slate-900 text-white p-6 rounded-3xl flex items-center justify-between gap-6 overflow-hidden relative">
                  <div className="relative z-10">
                    <p className="text-xs font-black text-primary-400 uppercase tracking-[0.2em] mb-2">Daily Motivation</p>
                    <p className="text-lg font-bold leading-tight">"Setiap kabaikan yang kamu lakukan adalah investasi untuk masa depanmu."</p>
                  </div>
                  <Sparkles className="w-12 h-12 text-primary-500/30 flex-shrink-0 relative z-10" />
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500 rounded-full blur-[80px] opacity-20 -mr-16 -mt-16"></div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="history"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                {/* History Filter Row */}
                <div className="flex items-center justify-between mb-10 gap-4 overflow-x-auto no-scrollbar pb-4 -mx-1 px-1">
                  <div className="flex gap-2.5">
                    {['Semua', ...Array.from(new Set(DEEDS.map(d => d.category)))].map(cat => (
                      <button
                        key={cat}
                        onClick={() => setHistoryCategoryFilter(cat)}
                        className={`whitespace-nowrap px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border-2 ${
                          historyCategoryFilter === cat 
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-900/20' 
                            : 'bg-white dark:bg-slate-900/50 text-slate-400 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {history.length === 0 ? (
                  <div className="text-center py-20 text-slate-500">
                    <History className="w-12 h-12 mx-auto mb-4 opacity-10" />
                    <p>Belum ada riwayat amaliyah.</p>
                    <p className="text-xs">Mulai catat kebaikan Anda hari ini!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {history
                      .filter(record => {
                        if (historyCategoryFilter === 'Semua') return true;
                        const catDeeds = DEEDS.filter(d => d.category === historyCategoryFilter);
                        return catDeeds.some(d => record.deeds[d.id]);
                      })
                      .map((record) => {
                        const completion = calculateCompletion(record.deeds, historyCategoryFilter);
                        const isExpanded = expandedHistoryId === record.id;
                        
                        const relevantDeeds = historyCategoryFilter === 'Semua' 
                          ? DEEDS 
                          : DEEDS.filter(d => d.category === historyCategoryFilter);
                        
                        const completedDeedsCount = relevantDeeds.filter(d => record.deeds[d.id]).length;

                        return (
                          <motion.div 
                            layout
                            key={record.id}
                            className="bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-700 overflow-hidden transition-all shadow-sm hover:shadow-md"
                          >
                            <div 
                              onClick={() => setExpandedHistoryId(isExpanded ? null : record.id)}
                              className="p-6 cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors"
                            >
                              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                                <div className="flex items-center gap-5">
                                  <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-md text-slate-400 shrink-0 border border-slate-50 dark:border-slate-700">
                                    <CalendarIcon className="w-6 h-6 text-primary-500" />
                                  </div>
                                  <div>
                                    <h4 className="font-black text-slate-800 dark:text-white text-xl tracking-tight leading-none mb-2">
                                      {new Date(record.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                                    </h4>
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className={`text-[9px] font-black uppercase tracking-[0.15em] px-2 py-1 rounded-md ${completion === 100 ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-primary-500 text-white shadow-lg shadow-primary-500/20'}`}>
                                        {completion}% {historyCategoryFilter}
                                      </span>
                                      <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                                        {completedDeedsCount} / {relevantDeeds.length} TERLAKSANA
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between md:justify-end gap-4">
                                  <div className="flex -space-x-1.5 overflow-hidden">
                                     {relevantDeeds.filter(d => record.deeds[d.id]).slice(0, 4).map(d => (
                                      <div key={d.id} className="w-7 h-7 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-50 dark:border-slate-900 flex items-center justify-center shadow-sm" title={d.label}>
                                        <div className="scale-75">{d.icon}</div>
                                      </div>
                                    ))}
                                    {completedDeedsCount > 4 && (
                                      <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-slate-50 dark:border-slate-900 flex items-center justify-center text-[8px] font-black">
                                        +{completedDeedsCount - 4}
                                      </div>
                                    )}
                                  </div>
                                  <motion.div 
                                    animate={{ rotate: isExpanded ? 180 : 0 }}
                                    className="text-slate-300 dark:text-slate-600"
                                  >
                                    <ChevronDown className="w-5 h-5" />
                                  </motion.div>
                                </div>
                              </div>

                              <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${completion}%` }}
                                  transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                                  className={`h-full rounded-full ${completion === 100 ? 'bg-emerald-500' : 'bg-primary-500'}`}
                                />
                              </div>
                            </div>

                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div 
                                  key="expanded-details"
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="px-6 pb-6"
                                >
                                  <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Detail Amaliyah</h5>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                      {relevantDeeds.map(deed => {
                                        const isDone = record.deeds[deed.id];
                                        return (
                                          <div 
                                            key={deed.id} 
                                            className={`flex items-center gap-2.5 p-2 rounded-xl border transition-colors ${
                                              isDone 
                                                ? 'bg-emerald-50/50 border-emerald-100 text-emerald-700 dark:bg-emerald-900/10 dark:border-emerald-900/20 dark:text-emerald-400' 
                                                : 'bg-white/30 border-slate-100 text-slate-400 opacity-40 dark:bg-slate-900/30 dark:border-slate-800 dark:text-slate-600'
                                            }`}
                                          >
                                            <div className="shrink-0 scale-75">
                                              {deed.icon}
                                            </div>
                                            <span className="text-[11px] font-bold truncate">{deed.label}</span>
                                            {isDone && <CheckCircle2 className="w-3.5 h-3.5 ml-auto text-emerald-500" />}
                                          </div>
                                        );
                                      })}
                                    </div>
                                    <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setCurrentDate(new Date(record.date));
                                          setActiveView('today');
                                        }}
                                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary-500 hover:text-primary-600 transition-all bg-primary-50 dark:bg-primary-900/10 px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-primary-500/10 active:scale-95"
                                      >
                                        <LayoutDashboard className="w-3.5 h-3.5" /> Lihat Detail Tanggal
                                      </button>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        );
                      })}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
