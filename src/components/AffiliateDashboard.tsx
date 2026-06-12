import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Copy, TrendingUp, Users, Wallet, Share2, CheckCircle2, AlertCircle, Activity,
  MessageCircle, MousePointerClick, Target, BarChart3, PieChart as PieChartIcon,
  Award, Gift, Facebook, Twitter, Send, Trophy, History, BookOpen, ChevronRight,
  ChevronLeft, Flame, Medal, Star, Check, Lock, ArrowDownRight, ArrowUpRight,
  CreditCard, Building, Image as ImageIcon, QrCode, Download, Zap, BellRing, Filter,
  Network, Dices, Puzzle, Code, PartyPopper, Coins
} from "lucide-react";
import { db } from "../firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { EXTENDED_PROGRAMS, formatCurrency } from "../App";
import { Link } from "react-router-dom";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

interface DashboardStats {
  totalClicks: number;
  totalDonations: number;
  totalEarnings: number;
  activeCampaigns: number;
}

const generateChartData = () => {
  const data = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    data.push({
      date: d.toLocaleDateString("id-ID", { weekday: "short" }),
      clicks: Math.floor(Math.random() * 50) + 10,
      komisi: Math.floor(Math.random() * 500000) + 50000,
    });
  }
  return data;
};

const chartData = generateChartData();

const trafficData = [
  { name: 'WhatsApp', value: 45, color: '#25D366' },
  { name: 'Facebook', value: 25, color: '#1877F2' },
  { name: 'Twitter (X)', value: 15, color: '#000000' },
  { name: 'Telegram', value: 15, color: '#0088cc' },
];

const mockRecentDonors = [
  { name: "Ahmad S***", amount: 500000, time: "1 jam yang lalu", program: "Air Bersih untuk Pelosok" },
  { name: "Hamba Allah", amount: 150000, time: "3 jam yang lalu", program: "Beasiswa Tahfidz" },
  { name: "Budi Santoso", amount: 1000000, time: "Hari ini", program: "Darurat Pangan Gaza" },
  { name: "Siti Aisyah", amount: 250000, time: "Kemarin", program: "Tebar Qurban Pelosok" },
];

const leaderboardData = [
  { rank: 1, name: "Hamba Allah", earnings: 32500000, avatar: "👑" },
  { rank: 2, name: "Budi Santoso", earnings: 15200000, avatar: "🔥" },
  { rank: 3, name: "Ahmad Z.", earnings: 8400000, avatar: "⭐" },
];

const mockWithdrawals = [
  { date: "10 Jun 2026", amount: 2500000, bank: "BCA", status: "Berhasil" },
  { date: "02 Jun 2026", amount: 1000000, bank: "Mandiri", status: "Berhasil" },
  { date: "15 Mei 2026", amount: 1500000, bank: "BCA", status: "Berhasil" },
];

const copywritingTemplates = [
  {
    title: "Gaya Santai (Untuk Teman WA)",
    text: "Hai teman-teman! 🌟 Lagi ada program kebaikan nih dari LAZNAS Dewan Dakwah. Yuk sisihkan sedikit rezeki kita buat bantu saudara kita yang membutuhkan. Rp 50.000 aja udah sangat berarti loh! 🙏\n\nLangsung donasi lewat link ini ya: [LINK_AFFILIATE]"
  },
  {
    title: "Gaya Formal (Grup Alumni/Keluarga)",
    text: "Assalamu'alaikum Warahmatullahi Wabarakatuh.\n\nBapak/Ibu dan saudara sekalian, mari bersama-sama meraih pahala jariyah melalui program kebaikan LAZNAS Dewan Dakwah. Donasi Anda akan disalurkan secara transparan dan tepat sasaran.\n\nKlik tautan berikut untuk berpartisipasi: [LINK_AFFILIATE]\n\nJazakumullah Khairan Katsiran."
  },
  {
    title: "Status Singkat (Twitter/IG Story)",
    text: "Sedekah hari ini bikin hati tenang! ❤️ Yuk bantu program mulia dari LAZNAS Dewan Dakwah. Donasi mulai Rp 10rb udah bisa ikutan. Klik link ini ya gaes 👉 [LINK_AFFILIATE] #OrangBaik #Sedekah"
  }
];

export const AffiliateDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalClicks: 0,
    totalDonations: 0,
    totalEarnings: 0,
    activeCampaigns: 0,
  });
  const [copiedId, setCopiedId] = useState<number | string | null>(null);
  const [affiliateCode, setAffiliateCode] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [userPhone, setUserPhone] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'misi' | 'dompet' | 'marketing' | 'edukasi' | 'qurban' | 'jaringan' | 'rewards'>('dashboard');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; 

  // Withdraw State
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawBank, setWithdrawBank] = useState("");
  const [withdrawAccount, setWithdrawAccount] = useState("");
  
  // Marketing Kit State
  const [selectedPosterProgram, setSelectedPosterProgram] = useState<any>(EXTENDED_PROGRAMS?.[0] || null);

  // Live Notification State
  const [liveToast, setLiveToast] = useState<{message: string, type: 'withdraw' | 'donation'} | null>(null);

  // Reward Points State
  const [points] = useState(1250);

  // Qurban Patungan State
  const qurbanProgress = 5; // Fake 5 out of 7

  const topCampaigns = React.useMemo(() => {
    return (EXTENDED_PROGRAMS || []).slice(0, 3).map((p) => ({
      ...p,
      clicks: Math.floor(Math.random() * 100) + 20,
    }));
  }, []);

  const totalPages = Math.ceil((EXTENDED_PROGRAMS?.length || 0) / itemsPerPage);
  const currentCampaigns = (EXTENDED_PROGRAMS || []).slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    const fetchAffiliateData = async () => {
      const phone = localStorage.getItem("app_user_phone");
      setUserPhone(phone);
      
      if (phone) {
        const code = phone.substring(phone.length - 6).toUpperCase();
        setAffiliateCode(code);

        try {
          const clicksQuery = query(collection(db, "affiliate_clicks"), where("affiliateCode", "==", code));
          const clicksSnapshot = await getDocs(clicksQuery);
          
          const earningsQuery = query(collection(db, "affiliate_earnings"), where("affiliateCode", "==", code), orderBy("createdAt", "desc"));
          const earningsSnapshot = await getDocs(earningsQuery);

          let earnings = 0;
          let donationsCount = earningsSnapshot.size;

          earningsSnapshot.forEach((doc) => {
            const data = doc.data();
            earnings += data.commission || 0;
          });

          // Fake big numbers
          setStats({
            totalClicks: clicksSnapshot.size || 14502,
            totalDonations: donationsCount || 342,
            totalEarnings: earnings || 7500000,
            activeCampaigns: EXTENDED_PROGRAMS?.length || 0,
          });
        } catch (error) {
          console.error("Error fetching affiliate data", error);
        }
      }
      setIsLoading(false);
    };

    fetchAffiliateData();

    // Crazy Live Notification Logic
    const notifications = [
      { message: "Budi Santoso baru saja mencairkan Rp 1.500.000! 💸", type: 'withdraw' as const },
      { message: "Hamba Allah berdonasi Rp 500.000 dari link Siti Aisyah! 🔥", type: 'donation' as const },
      { message: "Ahmad Z. baru saja naik ke Level Platinum! 🏆", type: 'withdraw' as const },
      { message: "Donasi Rp 100.000 berhasil masuk via WhatsApp! 🟢", type: 'donation' as const }
    ];

    const interval = setInterval(() => {
      const randomNotif = notifications[Math.floor(Math.random() * notifications.length)];
      setLiveToast(randomNotif);
      setTimeout(() => setLiveToast(null), 5000);
    }, 15000); // Every 15 seconds show a popup

    return () => clearInterval(interval);
  }, []);

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getShareUrl = (programId: number) => {
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}#/program/${programId}?ref=${affiliateCode}`;
  };

  const generateShareMessage = (program: any, platform: 'wa' | 'twitter' | 'telegram') => {
    const url = getShareUrl(program.id);
    let title = program.title.toLowerCase();
    
    let opening = `Assalamu'alaikum Warahmatullahi Wabarakatuh.\n\nBapak/Ibu Sahabat Dermawan yang dirahmati Allah,`;
    let body = `Mari bersama-sama kita wujudkan harapan saudara-saudara kita melalui program *${program.title}*. Sedikit kepedulian dari kita, adalah senyuman bahagia bagi mereka.`;
    
    if (title.includes('gaza') || title.includes('palestina')) {
      body = `Duka Palestina adalah duka kita bersama. Saat ini saudara kita di Gaza sangat membutuhkan uluran tangan dan bantuan darurat. Mari kirimkan pelukan terhangat kita melalui doa dan sedekah terbaik untuk program *${program.title}*.`;
    } else if (title.includes('qurban') || title.includes('sapi')) {
      body = `Momen Idul Adha sebentar lagi tiba. Jangan biarkan saudara kita di pelosok nusantara terlewat dari kebahagiaan menyantap hidangan istimewa. Mari tunaikan ibadah qurban Anda tahun ini melalui program *${program.title}*.`;
    } else if (title.includes('air') || title.includes('sumur')) {
      body = `Setetes air adalah awal dari kehidupan. Mari alirkan pahala jariyah yang tak pernah terputus dengan membantu saudara kita yang mengalami kekeringan ekstrem melalui program *${program.title}*.`;
    } else if (title.includes('yatim') || title.includes('tahfidz') || title.includes('beasiswa') || title.includes('pendidikan')) {
      body = `Senyum anak yatim dan para pejuang Al-Quran adalah penyejuk hati kita. Mari dukung langkah mulia mereka dalam menuntut ilmu dengan berpartisipasi di program *${program.title}*.`;
    }

    let closing = `\n\nSalurkan infak, sedekah, atau zakat terbaik Anda dengan aman, mudah, dan transparan melalui tautan resmi LAZNAS Dewan Dakwah berikut:\n👉 ${url}\n\n_"Perumpamaan orang yang menginfakkan hartanya di jalan Allah seperti sebutir biji yang menumbuhkan tujuh tangkai, pada setiap tangkai ada seratus biji."_ (QS. Al-Baqarah: 261)\n\nJazakumullah Khairan Katsiran.\nSemoga Allah senantiasa memberkahi harta dan keluarga Anda. Aamiin Ya Rabbal 'Alamin. 🤲`;

    if (platform === 'twitter') {
      return `Sahabat Dermawan, mari wujudkan kepedulian untuk program ${program.title}. Salurkan donasi terbaik Anda dengan mudah & aman melalui LAZNAS Dewan Dakwah: ${url}`;
    }

    return `${opening}\n\n${body}${closing}`;
  };

  const handleShareWA = (program: any) => {
    const text = generateShareMessage(program, 'wa');
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleShareFB = (program: any) => {
    const url = getShareUrl(program.id);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  };

  const handleShareTwitter = (program: any) => {
    const text = generateShareMessage(program, 'twitter');
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleShareTelegram = (program: any) => {
    const text = generateShareMessage(program, 'telegram');
    const url = getShareUrl(program.id);
    window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawAmount || !withdrawBank || !withdrawAccount) {
      alert("Harap lengkapi semua data pencairan.");
      return;
    }
    alert(`Permintaan pencairan Rp ${withdrawAmount} ke ${withdrawBank} sedang diproses! Dana akan masuk 1x24 jam.`);
    setWithdrawAmount("");
    setWithdrawAccount("");
  };

  // Removed spin handle

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!userPhone) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-6">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl text-center max-w-md w-full border border-slate-100 dark:border-slate-700">
          <AlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Silakan Login</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Anda harus masuk ke akun Anda untuk mengakses Dashboard Affiliate.
          </p>
          <Link to="/auth" className="inline-block bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 px-8 rounded-xl transition-all">
            Login Sekarang
          </Link>
        </div>
      </div>
    );
  }

  // Gamification Logic
  let level = "Bronze";
  let nextLevel = "Silver";
  let target = 1000000;
  let levelColor = "text-amber-700 bg-amber-100 border-amber-300";
  
  if (stats.totalEarnings >= 10000000) {
    level = "Diamond";
    nextLevel = "Max Level";
    target = 10000000;
    levelColor = "text-cyan-700 bg-cyan-100 border-cyan-400";
  } else if (stats.totalEarnings >= 5000000) {
    level = "Platinum";
    nextLevel = "Diamond";
    target = 10000000;
    levelColor = "text-slate-800 bg-slate-200 border-slate-400";
  } else if (stats.totalEarnings >= 2500000) {
    level = "Gold";
    nextLevel = "Platinum";
    target = 5000000;
    levelColor = "text-yellow-700 bg-yellow-100 border-yellow-400";
  } else if (stats.totalEarnings >= 1000000) {
    level = "Silver";
    nextLevel = "Gold";
    target = 2500000;
    levelColor = "text-slate-600 bg-slate-100 border-slate-300";
  }
  
  const progressPercentage = Math.min((stats.totalEarnings / target) * 100, 100);
  const conversionRate = stats.totalClicks > 0 ? ((stats.totalDonations / stats.totalClicks) * 100).toFixed(1) : 0;

  const AffiliateProgramCard = ({ p }: { p: any }) => (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2, ease: "easeOut" } }}
      className="bg-white dark:bg-slate-800 rounded-[16px] md:rounded-[24px] overflow-hidden shadow-sm hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col border border-slate-100 dark:border-slate-700 h-full group"
    >
      <div className="relative aspect-[4/3] shrink-0 overflow-hidden">
        <img
          src={p.image}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          alt={p.title}
        />
        <div className="absolute top-2 right-2 flex gap-1 z-10">
          {p.collected >= p.target ? (
            <div className="bg-emerald-500/90 backdrop-blur-sm text-white text-[7px] md:text-[8px] font-bold px-1.5 md:px-2 py-0.5 rounded-full shadow-lg shadow-emerald-500/20 uppercase tracking-widest flex items-center gap-1 border border-emerald-400/30">
              <CheckCircle2 className="w-2.5 h-2.5 md:w-3 md:h-3 text-white" /> Selesai
            </div>
          ) : (
            p.urgent && (
              <div className="bg-red-500/90 backdrop-blur-sm text-white text-[7px] md:text-[8px] font-bold px-1.5 md:px-2 py-0.5 rounded-full shadow-lg shadow-red-500/20 uppercase tracking-widest flex items-center gap-1 border border-red-400/30">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span> Mendesak
              </div>
            )
          )}
        </div>
      </div>

      <div className="p-3 md:p-5 flex-1 flex flex-col bg-white dark:bg-slate-800">
        <div className="flex justify-between items-center mb-1.5 md:mb-2">
          <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-primary-500 bg-primary-50 dark:bg-primary-500/10 px-2 py-0.5 md:px-2.5 md:py-1 rounded-full">
            {p.category}
          </span>
        </div>

        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-[10px] md:text-sm leading-snug mb-1.5 md:mb-2 line-clamp-2">
          {p.title}
        </h3>

        <div className="mb-2.5 md:mb-4 mt-auto">
          <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1 md:h-1.5 mb-1 md:mb-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-primary-500 to-blue-400 h-full rounded-full"
              style={{
                width: `${Math.min((p.collected / p.target) * 100, 100)}%`,
              }}
            ></div>
          </div>
          <div className="flex justify-between items-center text-[8px] md:text-[10px]">
            <span className="text-slate-500 font-medium">
              Terkumpul <strong className="text-slate-700 dark:text-slate-300">{formatCurrency(p.collected)}</strong>
            </span>
            <span className="text-primary-500 font-bold hidden sm:inline">
              {Math.round((p.collected / p.target) * 100)}%
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
          <button
            onClick={() => handleShareWA(p)}
            className="w-full flex items-center justify-center gap-1.5 md:gap-2 bg-[#25D366] hover:bg-[#1DA851] text-white font-bold py-1.5 md:py-2.5 rounded-lg md:rounded-xl transition-all text-[9px] md:text-sm shadow-sm md:shadow-md shadow-[#25D366]/20 mb-1.5 md:mb-2"
          >
            <MessageCircle className="w-3 h-3 md:w-4 md:h-4" /> <span className="hidden sm:inline">Share via </span>WhatsApp
          </button>
          
          <div className="flex gap-1.5 md:gap-2">
            <button onClick={() => handleShareFB(p)} className="flex-1 bg-[#1877F2]/10 hover:bg-[#1877F2]/20 text-[#1877F2] rounded-lg md:rounded-xl flex items-center justify-center py-1.5 md:py-2 transition-colors">
              <Facebook className="w-3 h-3 md:w-4 md:h-4" />
            </button>
            <button onClick={() => handleShareTwitter(p)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white rounded-lg md:rounded-xl flex items-center justify-center py-1.5 md:py-2 transition-colors">
              <Twitter className="w-3 h-3 md:w-4 md:h-4" />
            </button>
            <button onClick={() => handleShareTelegram(p)} className="flex-1 bg-[#0088cc]/10 hover:bg-[#0088cc]/20 text-[#0088cc] rounded-lg md:rounded-xl flex items-center justify-center py-1.5 md:py-2 transition-colors">
              <Send className="w-3 h-3 md:w-4 md:h-4" />
            </button>
            <button 
              onClick={() => handleCopyText(getShareUrl(p.id), p.id.toString())}
              className={`flex-1 rounded-lg md:rounded-xl flex items-center justify-center py-1.5 md:py-2 transition-colors border ${
                copiedId === p.id.toString()
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                  : 'bg-primary-50 border-primary-100 text-primary-600 hover:bg-primary-100'
              }`}
            >
              {copiedId === p.id.toString() ? <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4" /> : <Copy className="w-3 h-3 md:w-4 md:h-4" />}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-36 pt-20 relative overflow-hidden">
      
      {/* Crazy Live Notification Toast */}
      <AnimatePresence>
        {liveToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-50 pointer-events-none"
          >
            <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border backdrop-blur-md ${
              liveToast.type === 'withdraw' 
                ? 'bg-amber-500/90 border-amber-400 text-white'
                : 'bg-emerald-500/90 border-emerald-400 text-white'
            }`}>
              {liveToast.type === 'withdraw' ? <Wallet className="w-5 h-5" /> : <BellRing className="w-5 h-5" />}
              <span className="text-sm font-bold">{liveToast.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Section */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 pb-8 pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-100 dark:border-emerald-500/20">
                  <Activity className="w-3.5 h-3.5" /> Akun Aktif
                </div>
                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black border ${levelColor}`}>
                  <Trophy className="w-3.5 h-3.5" /> Level Mitra: {level}
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black bg-purple-100 text-purple-700 border border-purple-300">
                  <Coins className="w-3.5 h-3.5" /> {points} Poin Kebaikan
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white flex items-center gap-3 mb-2">
                Dashboard Affiliate <span className="text-primary-500">ULTIMATE</span>
              </h1>
              
              {/* Gamification Progress */}
              {level !== "Diamond" && (
                <div className="mt-4 max-w-md">
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-xs font-bold text-slate-500">Progress ke {nextLevel}</span>
                    <span className="text-xs font-bold text-primary-600">Sisa {formatCurrency(target - stats.totalEarnings)} lagi!</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-amber-400 to-amber-500 h-full rounded-full transition-all duration-1000" style={{ width: `${progressPercentage}%` }}></div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
              <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Kode Reff Anda:</span>
              <div className="bg-white dark:bg-slate-800 px-5 py-2.5 rounded-2xl text-primary-600 font-black tracking-widest shadow-md border border-slate-200 dark:border-slate-700 flex items-center gap-3 text-lg">
                {affiliateCode}
                <button onClick={() => handleCopyText(`${window.location.origin + window.location.pathname}#/?ref=${affiliateCode}`, 'general')} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-primary-500">
                  {copiedId === 'general' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Navigation Tabs (Scrollable on mobile) */}
        <div className="flex overflow-x-auto pb-4 mb-4 md:mb-8 hide-scrollbar">
          <div className="flex space-x-2 bg-slate-200/50 dark:bg-slate-800/50 p-1.5 rounded-2xl w-max">
            <button onClick={() => setActiveTab('dashboard')} className={`px-4 md:px-5 py-2.5 rounded-xl font-bold text-xs md:text-sm flex items-center gap-2 transition-all shrink-0 ${activeTab === 'dashboard' ? 'bg-white dark:bg-slate-700 text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
              <BarChart3 className="w-4 h-4" /> Analitik
            </button>
            <button onClick={() => setActiveTab('qurban')} className={`px-4 md:px-5 py-2.5 rounded-xl font-bold text-xs md:text-sm flex items-center gap-2 transition-all shrink-0 ${activeTab === 'qurban' ? 'bg-white dark:bg-slate-700 text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
              <Puzzle className="w-4 h-4" /> Patungan Qurban <span className="bg-rose-500 text-white text-[8px] px-1.5 py-0.5 rounded-full ml-1">HOT</span>
            </button>
            <button onClick={() => setActiveTab('jaringan')} className={`px-4 md:px-5 py-2.5 rounded-xl font-bold text-xs md:text-sm flex items-center gap-2 transition-all shrink-0 ${activeTab === 'jaringan' ? 'bg-white dark:bg-slate-700 text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
              <Network className="w-4 h-4" /> Jaringan
            </button>
            <button onClick={() => setActiveTab('rewards')} className={`px-4 md:px-5 py-2.5 rounded-xl font-bold text-xs md:text-sm flex items-center gap-2 transition-all shrink-0 ${activeTab === 'rewards' ? 'bg-white dark:bg-slate-700 text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
              <Gift className="w-4 h-4" /> Tukar Poin <span className="bg-amber-500 text-white text-[8px] px-1.5 py-0.5 rounded-full ml-1">REWARDS</span>
            </button>
            <button onClick={() => setActiveTab('dompet')} className={`px-4 md:px-5 py-2.5 rounded-xl font-bold text-xs md:text-sm flex items-center gap-2 transition-all shrink-0 ${activeTab === 'dompet' ? 'bg-white dark:bg-slate-700 text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
              <Wallet className="w-4 h-4" /> Tarik Dana
            </button>
            <button onClick={() => setActiveTab('misi')} className={`px-4 md:px-5 py-2.5 rounded-xl font-bold text-xs md:text-sm flex items-center gap-2 transition-all shrink-0 ${activeTab === 'misi' ? 'bg-white dark:bg-slate-700 text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
              <Flame className="w-4 h-4" /> Misi & Peringkat
            </button>
            <button onClick={() => setActiveTab('marketing')} className={`px-4 md:px-5 py-2.5 rounded-xl font-bold text-xs md:text-sm flex items-center gap-2 transition-all shrink-0 ${activeTab === 'marketing' ? 'bg-white dark:bg-slate-700 text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
              <ImageIcon className="w-4 h-4" /> Marketing Kit
            </button>
            <button onClick={() => setActiveTab('edukasi')} className={`px-4 md:px-5 py-2.5 rounded-xl font-bold text-xs md:text-sm flex items-center gap-2 transition-all shrink-0 ${activeTab === 'edukasi' ? 'bg-white dark:bg-slate-700 text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
              <BookOpen className="w-4 h-4" /> Panduan
            </button>
          </div>
        </div>

        {/* Tab 1: DASHBOARD ANALITIK */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Crazy Feature: Flash Event Banner */}
            <div className="bg-gradient-to-r from-rose-500 via-rose-600 to-orange-500 rounded-3xl p-6 text-white shadow-lg shadow-rose-500/20 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')] opacity-10"></div>
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/20 rounded-full blur-2xl"></div>
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shrink-0 backdrop-blur-sm">
                  <Zap className="w-6 h-6 text-yellow-300 fill-yellow-300 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xl font-black mb-1">EVENT JUMAT BERKAH: Booster Aktif! 🔥</h3>
                  <p className="text-rose-100 text-sm">Semua donasi yang masuk hari ini akan memberikan Anda **10% Komisi** (Normal 5%).</p>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 px-6 py-3 rounded-xl font-black text-lg shrink-0 relative z-10">
                Sisa Waktu: 12:45:00
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
              {[
                { label: "Total Pendapatan", value: formatCurrency(stats.totalEarnings), icon: Wallet, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10", trend: "+12.5%" },
                { label: "Total Donatur", value: stats.totalDonations.toString(), icon: Users, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10", trend: "+4.2%" },
                { label: "Total Klik", value: stats.totalClicks.toString(), icon: MousePointerClick, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-500/10", trend: "+24.1%" },
                { label: "Tingkat Konversi", value: `${conversionRate}%`, icon: Target, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-500/10", trend: "+1.2%" },
                { label: "Link Aktif", value: stats.activeCampaigns.toString(), icon: Share2, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-500/10", trend: "0%" },
              ].map((stat, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group hover:border-primary-500/30 transition-all flex flex-col justify-between h-full">
                  <div className={`absolute -right-6 -top-6 w-24 h-24 ${stat.bg} rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity`}></div>
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className={`p-2.5 md:p-3 rounded-xl md:rounded-2xl ${stat.bg} ${stat.color}`}>
                      <stat.icon className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div className="flex items-center gap-1 text-[9px] md:text-[10px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-full">
                      <TrendingUp className="w-3 h-3" /> {stat.trend}
                    </div>
                  </div>
                  <div className="relative z-10">
                    <p className="text-[10px] md:text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">{stat.label}</p>
                    <h3 className="text-sm sm:text-lg md:text-2xl font-black text-slate-900 dark:text-white truncate">{stat.value}</h3>
                  </div>
                </div>
              ))}
            </div>

            {/* Campaign List Grid with Pagination */}
            <div className="pt-8 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-6 md:mb-8">
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                    Pilih Campaign Spesifik
                  </h2>
                </div>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 mb-8">
                {currentCampaigns.map((program) => (
                  <AffiliateProgramCard key={program.id} p={program} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 md:gap-4 mt-8 pb-8">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 disabled:opacity-50">
                    <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                  <div className="text-xs md:text-sm font-bold text-slate-600 dark:text-slate-300">
                    Halaman {currentPage} dari {totalPages}
                  </div>
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 disabled:opacity-50">
                    <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab: QURBAN SQUAD (Puzzle) */}
        {activeTab === 'qurban' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 md:p-12 text-white shadow-xl relative overflow-hidden">
              <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/4"></div>
              
              <div className="grid md:grid-cols-2 gap-8 items-center relative z-10">
                <div>
                  <div className="bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-bold w-max mb-4">✨ EVENT KHUSUS QURBAN ✨</div>
                  <h2 className="text-3xl md:text-5xl font-black mb-4 leading-tight">Qurban Squad <br/>Patungan Sapi</h2>
                  <p className="text-indigo-100 text-lg mb-8">
                    Harga 1 Sapi = Rp 21 Juta (7 Orang). Susah cari 1 donatur? Cari 7 orang yang mau patungan! Lengkapi puzzle sapi Anda dan dapatkan <strong>BONUS KAMBING GRATIS!</strong>
                  </p>
                  
                  <button className="bg-white text-indigo-700 font-black px-6 py-4 rounded-xl shadow-lg hover:scale-105 transition-transform flex items-center gap-2">
                    <Copy className="w-5 h-5" /> Salin Link Patungan Sapi
                  </button>
                </div>

                <div className="flex flex-col items-center justify-center">
                  <div className="w-56 h-56 md:w-80 md:h-80 relative scale-90 md:scale-100">
                    {/* Fake Cow Puzzle Visualization using Grid of rounded divs for simplicity */}
                    <div className="absolute inset-0 bg-white/10 rounded-full border-4 border-dashed border-white/30 animate-[spin_60s_linear_infinite]"></div>
                    <div className="absolute inset-4 flex flex-wrap content-center justify-center gap-1 md:gap-2">
                      {[1,2,3,4,5,6,7].map((piece) => (
                        <div key={piece} className={`w-14 h-14 md:w-24 md:h-24 rounded-2xl flex items-center justify-center text-2xl md:text-3xl font-black shadow-lg transition-all duration-500
                          ${piece <= qurbanProgress ? 'bg-emerald-400 text-white scale-110 rotate-3' : 'bg-white/20 text-white/50 border border-white/20'}`}>
                          {piece <= qurbanProgress ? '✓' : piece}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 md:mt-8 text-center">
                    <div className="text-xl md:text-2xl font-black text-white mb-1">{qurbanProgress} / 7 Puzzel Terkumpul</div>
                    <div className="text-indigo-200 text-xs md:text-sm">2 Orang lagi menuju Sapi utuh! Ayo kejar!</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: JARINGAN (Multi-Tier) */}
        {activeTab === 'jaringan' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-700 text-center max-w-4xl mx-auto">
              <Network className="w-16 h-16 text-blue-500 mx-auto mb-6" />
              <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-4">Sistem Pasukan (Downline)</h2>
              <p className="text-slate-500 mb-8 max-w-2xl mx-auto">
                Ajak teman Anda menjadi mitra Affiliate LAZNAS melalui link pendaftaran khusus Anda. Anda akan mendapatkan **Passive Income 1%** dari total donasi yang berhasil dikumpulkan oleh pasukan Anda seumur hidup!
              </p>

              <div className="overflow-x-auto pb-6 -mx-6 px-6 md:mx-0 md:px-0 custom-scrollbar">
                <div className="flex flex-col items-center min-w-[500px]">
                  {/* You */}
                  <div className="bg-blue-500 text-white p-3 md:p-4 rounded-2xl shadow-lg w-40 md:w-48 mb-6 relative z-10 border-4 border-white dark:border-slate-800">
                    <div className="font-black text-base md:text-lg">ANDA</div>
                    <div className="text-[10px] md:text-xs text-blue-100">Leader</div>
                  </div>
                  
                  {/* Lines */}
                  <div className="w-px h-8 bg-slate-300 dark:bg-slate-600 -mt-6 mb-0"></div>
                  <div className="w-full max-w-sm md:max-w-md h-px bg-slate-300 dark:bg-slate-600"></div>
                  
                  {/* Downlines */}
                  <div className="flex justify-between w-full max-w-[400px] md:max-w-lg mt-0">
                    {[
                      { name: "Budi", val: "Rp 120k", act: "Aktif" },
                      { name: "Aisyah", val: "Rp 85k", act: "Aktif" },
                      { name: "Rizky", val: "Rp 0", act: "Pasif" }
                    ].map((sub, i) => (
                      <div key={i} className="flex flex-col items-center">
                        <div className="w-px h-6 bg-slate-300 dark:bg-slate-600"></div>
                        <div className={`p-3 md:p-4 rounded-2xl shadow-sm w-28 md:w-32 border ${sub.act === 'Aktif' ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800' : 'bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700'}`}>
                          <div className="font-bold text-slate-800 dark:text-white text-xs md:text-sm">{sub.name}</div>
                          <div className="text-[10px] md:text-xs text-emerald-600 font-bold mt-1">+{sub.val}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-12 bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row items-center justify-between gap-4 text-left">
                <div>
                  <div className="text-sm text-slate-500 font-bold">Total Pasif Income dari Pasukan</div>
                  <div className="text-3xl font-black text-emerald-500">Rp 205.000</div>
                </div>
                <button className="bg-slate-800 dark:bg-white text-white dark:text-slate-900 font-bold px-6 py-3 rounded-xl flex items-center gap-2">
                  <Copy className="w-4 h-4" /> Salin Link Rekrutmen
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab: REWARDS (Tukar Poin) */}
        {activeTab === 'rewards' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-3xl p-6 md:p-10 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-black mb-2 flex items-center gap-2"><Gift className="w-8 h-8" /> Katalog Rewards</h2>
                <p className="text-amber-100 max-w-md text-sm md:text-base">Kumpulkan Poin Kebaikan dari setiap klik dan donasi yang masuk. Tukarkan dengan hadiah menarik!</p>
              </div>
              <div className="bg-white/20 backdrop-blur-md px-8 py-6 rounded-2xl border border-white/30 text-center w-full md:w-auto shrink-0">
                <div className="text-amber-100 font-bold text-sm mb-1">Poin Anda Saat Ini</div>
                <div className="text-4xl font-black">{points} <span className="text-xl">Pts</span></div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: "Voucher Diskon Qurban", desc: "Potongan harga Rp 50.000 untuk pembelian Sapi/Kambing.", cost: 500, img: "https://images.unsplash.com/photo-1541535881962-3bb380b08458?q=80&w=400&auto=format&fit=crop" },
                { title: "Tambahan Saldo 100k", desc: "Saldo komisi akan langsung ditambahkan ke dompet Anda.", cost: 1200, img: "https://images.unsplash.com/photo-1580519542036-ed47f3e42214?q=80&w=400&auto=format&fit=crop" },
                { title: "Kaos Polo Relawan", desc: "Merchandise eksklusif LAZNAS Dewan Dakwah dikirim ke rumah.", cost: 2500, img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=400&auto=format&fit=crop" },
              ].map((r, i) => (
                <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow group flex flex-col">
                  <div className="h-40 overflow-hidden relative">
                    <img src={r.img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <Coins className="w-3 h-3 text-yellow-400" /> {r.cost} Pts
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-2">{r.title}</h3>
                    <p className="text-sm text-slate-500 flex-1 mb-4">{r.desc}</p>
                    <button className={`w-full py-2.5 rounded-xl font-bold transition-all ${points >= r.cost ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed'}`}>
                      {points >= r.cost ? 'Tukar Poin' : 'Poin Tidak Cukup'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab: DOMPET */}
        {activeTab === 'dompet' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Wallet Summary */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
                  <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                  <div className="absolute right-0 bottom-0 opacity-10">
                    <Wallet className="w-32 h-32 -mb-8 -mr-8" />
                  </div>
                  <div className="relative z-10">
                    <div className="text-emerald-100 font-bold mb-1 text-sm flex items-center gap-2">
                      Saldo Bisa Ditarik <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div className="text-3xl md:text-4xl font-black mb-8">{formatCurrency(stats.totalEarnings)}</div>
                    
                    <div className="grid grid-cols-2 gap-4 border-t border-white/20 pt-6">
                      <div>
                        <div className="text-emerald-100 text-xs mb-1">Saldo Tertahan</div>
                        <div className="font-bold">Rp 250.000</div>
                      </div>
                      <div>
                        <div className="text-emerald-100 text-xs mb-1">Total Ditarik</div>
                        <div className="font-bold">Rp 5.000.000</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Withdrawal */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-700">
                  <h3 className="text-xl font-black text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                    <ArrowDownRight className="w-5 h-5 text-primary-500" /> Tarik Komisi
                  </h3>
                  <form onSubmit={handleWithdrawSubmit} className="space-y-5">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Pilih Bank / E-Wallet</label>
                      <div className="relative">
                        <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <select 
                          value={withdrawBank}
                          onChange={(e) => setWithdrawBank(e.target.value)}
                          className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-medium appearance-none"
                        >
                          <option value="">Pilih Tujuan Pencairan...</option>
                          <option value="BCA">BCA</option>
                          <option value="Mandiri">Mandiri</option>
                          <option value="BNI">BNI</option>
                          <option value="GoPay">GoPay</option>
                          <option value="OVO">OVO</option>
                          <option value="DANA">DANA</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Nomor Rekening / HP</label>
                      <div className="relative">
                        <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input 
                          type="text" 
                          placeholder="Contoh: 1234567890"
                          value={withdrawAccount}
                          onChange={(e) => setWithdrawAccount(e.target.value)}
                          className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-medium"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Nominal Penarikan</label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">Rp</div>
                        <input 
                          type="number" 
                          placeholder="Min. 50.000"
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-bold text-lg"
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-2">Biaya admin transfer ditanggung mitra (Rp 2.500 - Rp 6.500).</p>
                    </div>
                    <button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white font-black py-4 rounded-xl shadow-lg shadow-primary-500/30 transition-all active:scale-95">
                      Tarik Dana Sekarang
                    </button>
                  </form>
                </div>
              </div>

              {/* Withdraw History */}
              <div className="lg:col-span-2">
                <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm h-full">
                  <h3 className="text-xl font-black text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                    <History className="w-5 h-5 text-slate-500" /> Riwayat Pencairan
                  </h3>
                  
                  <div className="space-y-4">
                    {mockWithdrawals.map((w, i) => (
                      <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-4 mb-3 sm:mb-0">
                          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                            <ArrowUpRight className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="font-black text-slate-800 dark:text-white text-lg">{formatCurrency(w.amount)}</div>
                            <div className="text-sm text-slate-500 font-medium">Tujuan: Bank {w.bank}</div>
                          </div>
                        </div>
                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                          <div className="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 mb-1 sm:mb-2">
                            <CheckCircle2 className="w-3 h-3" /> {w.status}
                          </div>
                          <div className="text-xs text-slate-400 font-medium">{w.date}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: MARKETING KIT (Studio Push The Limit) */}
        {activeTab === 'marketing' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                  <ImageIcon className="w-8 h-8 text-purple-500" /> Studio Marketing
                </h2>
                <p className="text-slate-500 mt-2">Buat poster promosi otomatis atau pasang Widget ke blog Anda!</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Studio Controls */}
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-slate-800 dark:text-white mb-4">1. Pilih Campaign untuk dibuatkan Poster</h3>
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {EXTENDED_PROGRAMS.slice(0,10).map(p => (
                    <div 
                      key={p.id}
                      onClick={() => setSelectedPosterProgram(p)}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border-2 ${
                        selectedPosterProgram?.id === p.id ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-transparent bg-slate-50 dark:bg-slate-900 hover:border-slate-200 dark:hover:border-slate-700'
                      }`}
                    >
                      <img src={p.image} className="w-12 h-12 rounded-lg object-cover" alt="" />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm text-slate-800 dark:text-white truncate">{p.title}</div>
                        <div className="text-xs text-slate-500">{p.category}</div>
                      </div>
                      {selectedPosterProgram?.id === p.id && <CheckCircle2 className="w-5 h-5 text-primary-500 shrink-0" />}
                    </div>
                  ))}
                </div>
                
                <h3 className="font-bold text-slate-800 dark:text-white mb-4 mt-8">2. Aksi Poster</h3>
                <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black py-4 rounded-xl shadow-lg shadow-purple-500/30 transition-all flex items-center justify-center gap-2">
                  <Download className="w-5 h-5" /> Download Poster PNG
                </button>
              </div>

              {/* Live Preview (Fake generated poster) */}
              <div className="flex items-center justify-center bg-slate-100 dark:bg-slate-900 rounded-3xl p-6 md:p-10 border border-slate-200 dark:border-slate-800 relative">
                {selectedPosterProgram && (
                  <div className="w-full max-w-sm aspect-[3/4] bg-white rounded-[2rem] shadow-2xl overflow-hidden relative group">
                    <img src={selectedPosterProgram.image} className="absolute inset-0 w-full h-[65%] object-cover" alt="Poster Image" />
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent top-[30%]"></div>
                    
                    <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
                      <div className="bg-primary-500 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full w-max mb-3">
                        {selectedPosterProgram.category}
                      </div>
                      <h2 className="text-xl md:text-2xl font-black text-slate-900 leading-tight mb-4 line-clamp-3">
                        {selectedPosterProgram.title}
                      </h2>
                      
                      <div className="flex items-center justify-between border-t-2 border-slate-100 pt-4 mt-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                            <img src="https://i.pravatar.cc/100?img=11" alt="Avatar" />
                          </div>
                          <div>
                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Direkomendasikan Oleh</div>
                            <div className="font-black text-slate-800 text-sm">{userPhone?.slice(0,8)}***</div>
                          </div>
                        </div>
                        
                        <div className="w-16 h-16 bg-white rounded-xl shadow-md border border-slate-100 flex items-center justify-center flex-col gap-1 p-1">
                          <QrCode className="w-full h-full text-slate-800" />
                          <div className="text-[6px] font-black text-center text-slate-400">SCAN ME</div>
                        </div>
                      </div>
                    </div>

                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg">
                      <span className="w-4 h-4 rounded bg-primary-500 block"></span>
                      <span className="font-black text-xs text-slate-800">LAZNAS Dewan Dakwah</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Crazy Feature: HTML Widget Generator */}
            <div className="bg-slate-900 rounded-3xl p-8 md:p-10 shadow-xl text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-10">
                <Code className="w-48 h-48" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <Code className="w-6 h-6 text-primary-400" />
                  <h3 className="text-2xl font-black">HTML Widget Embed (Blogger/Web)</h3>
                </div>
                <p className="text-slate-400 mb-6 max-w-2xl">Pasang "Live Donation Counter" di website atau blog Anda. Jika ada pengunjung website Anda yang berdonasi lewat widget ini, komisi otomatis masuk ke akun Anda!</p>
                
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl mb-4 font-mono text-sm text-emerald-400 overflow-x-auto">
                  {`<iframe src="https://simba.laznas.org/widget/camp/1?ref=${affiliateCode}" width="100%" height="300" frameborder="0" style="border-radius:12px;"></iframe>`}
                </div>
                <button className="bg-white/10 hover:bg-white/20 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors">
                  <Copy className="w-4 h-4" /> Salin Kode HTML
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab: MISI & PERINGKAT */}
        {activeTab === 'misi' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Leaderboard */}
              <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl p-1 shadow-xl">
                <div className="bg-white dark:bg-slate-800 rounded-[22px] h-full p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Trophy className="w-8 h-8 text-amber-500" />
                    <div>
                      <h2 className="text-xl font-black text-slate-800 dark:text-white">Papan Peringkat</h2>
                      <p className="text-xs text-slate-500">Top 3 Mitra bulan ini.</p>
                    </div>
                  </div>

                  <div className="space-y-4 relative">
                    <div className="absolute left-6 top-10 bottom-10 w-0.5 bg-slate-100 dark:bg-slate-700 -z-10"></div>
                    {leaderboardData.map((lb, idx) => (
                      <div key={idx} className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm relative z-10">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-white shrink-0 shadow-md ${
                          idx === 0 ? 'bg-amber-400 ring-4 ring-amber-100' :
                          idx === 1 ? 'bg-slate-400 ring-4 ring-slate-100' :
                          'bg-orange-400 ring-4 ring-orange-100'
                        }`}>
                          {lb.rank}
                        </div>
                        <div className="flex-1 flex justify-between items-center">
                          <div>
                            <div className="font-bold text-slate-800 dark:text-white text-sm md:text-base flex items-center gap-1">
                              {lb.name} <span className="text-lg">{lb.avatar}</span>
                            </div>
                          </div>
                          <div className="font-black text-emerald-500 text-sm md:text-lg">
                            {formatCurrency(lb.earnings)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Daily Quests & Badges */}
              <div className="space-y-8">
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3 mb-6">
                    <Target className="w-6 h-6 text-rose-500" />
                    <h2 className="text-xl font-black text-slate-800 dark:text-white">Misi Harian</h2>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between bg-rose-50 dark:bg-rose-900/20 p-4 rounded-2xl border border-rose-100 dark:border-rose-900/30">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-rose-100 dark:bg-rose-800 rounded-full flex items-center justify-center shrink-0">
                          <Share2 className="w-4 h-4 text-rose-600 dark:text-rose-300" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 dark:text-white text-sm">Bagikan 5 Link Spesifik</div>
                          <div className="w-full bg-rose-200 dark:bg-rose-800 h-1.5 rounded-full mt-2 mb-1">
                            <div className="bg-rose-500 h-full rounded-full" style={{width: '20%'}}></div>
                          </div>
                          <div className="text-[10px] text-slate-500 font-bold">Progress: 1/5</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: EDUKASI / PANDUAN */}
        {activeTab === 'edukasi' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            <div>
              <h3 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                <Copy className="w-6 h-6 text-primary-500" />
                Template Teks Siap Pakai
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                {copywritingTemplates.map((template, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 flex flex-col shadow-sm">
                    <h4 className="font-bold text-slate-800 dark:text-white mb-4 pb-4 border-b border-slate-100 dark:border-slate-700 text-sm md:text-base">
                      {template.title}
                    </h4>
                    <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap flex-1 mb-6">
                      {template.text}
                    </p>
                    <button 
                      onClick={() => handleCopyText(template.text, `template-${idx}`)}
                      className={`w-full py-3 rounded-xl font-bold text-xs md:text-sm flex items-center justify-center gap-2 transition-all ${
                        copiedId === `template-${idx}`
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                          : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
                      }`}
                    >
                      {copiedId === `template-${idx}` ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copiedId === `template-${idx}` ? 'Teks Tersalin!' : 'Salin Teks'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
};
