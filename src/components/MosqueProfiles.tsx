import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Building2,
  MapPin,
  Users,
  Calendar,
  ArrowRight,
  X,
  Heart,
  ShieldCheck,
  Banknote,
  Search,
  Compass,
  ChevronRight,
  Info,
  Wallet,
  BookOpen,
  Sparkles,
  TrendingUp,
  Plus,
  Minus,
  ShoppingBag,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { formatCurrencyForm } from "../App";

// Generate 100 detailed Mosques
const generateMosques = () => {
  const CITIES = [
    "Jakarta Selatan", "Bandung", "Surabaya", "Medan", "Makassar", 
    "Yogyakarta", "Semarang", "Palembang", "Balikpapan", "Malang", 
    "Padang", "Banda Aceh", "Pekanbaru", "Banjarmasin", "Mataram", "Kupang"
  ];
  const MODIFIERS = ["Agung", "Raya", "Jami", "Besar", "Pusat", "Kota"];
  const NAMES = [
    "Al-Ikhlas", "At-Taqwa", "Al-Huda", "Nurul Iman", "Al-Falah", 
    "Baiturrahman", "Al-Istiqomah", "Al-Muhajirin", "As-Salam", 
    "Al-Kautsar", "Al-Amien", "Al-Furqon", "Al-Azhar", "Ar-Rahiim", "Al-Munawwaroh"
  ];

  const IMAGES = [
    "https://images.unsplash.com/photo-1564758537544-77e8da928db8?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1542382156909-9ae37b3f56fd?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1551041777-ed277b8dd348?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1620015509787-8490a61d1ea1?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1567156972412-1698d2d609db?auto=format&fit=crop&q=80&w=800",
  ];

  const SCHOLARS = ["Ustadz Abdul Somad", "Ustadz Adi Hidayat", "Habib Umar bin Hafidz", "Ustadz Hanan Attaki", "Buya Yahya", "Ustadz Khalid Basalamah", "Ustadz Salim A. Fillah"];
  const DONORS = ["Hamba Allah", "Bpk. Ahmad Fauzi", "Ibu Siti Aminah", "Keluarga Bpk. Ibrahim", "H. Muhammad Yusuf", "Ibu Rina Wijaya", "Bpk. Bambang Hermawan"];

  return Array.from({ length: 100 }).map((_, i) => {
    const isFeatured = i < 8;
    const namePrefix = isFeatured ? "Masjid " + MODIFIERS[i % MODIFIERS.length] : "Masjid";
    const nameCore = NAMES[i % NAMES.length];
    const city = CITIES[i % CITIES.length];

    return {
      id: `masjid-${i + 1}`,
      name: `${namePrefix} ${nameCore}`,
      location: city,
      image: IMAGES[i % IMAGES.length],
      capacity: 500 + Math.floor(Math.random() * 5000),
      establishedYear: (1950 + Math.floor(Math.random() * 70)).toString(),
      cashBalance: 15000000 + Math.floor(Math.random() * 200000000),
      imam: SCHOLARS[i % SCHOLARS.length],
      khatibs: [
        { name: SCHOLARS[(i + 1) % SCHOLARS.length], date: "22 Mei 2026" },
        { name: SCHOLARS[(i + 2) % SCHOLARS.length], date: "29 Mei 2026" },
        { name: SCHOLARS[(i + 3) % SCHOLARS.length], date: "05 Jun 2026" },
      ],
      studies: [
        { title: "Tafsir Al-Qur'an", time: "Bakda Maghrib", date: "Setiap Senin", speaker: SCHOLARS[i % SCHOLARS.length] },
        { title: "Kajian Fikih Ibadah", time: "Bakda Isya", date: "Setiap Kamis", speaker: SCHOLARS[(i + 1) % SCHOLARS.length] },
        { title: "Kajian Hadits Arba'in", time: "Bakda Subuh", date: "Setiap Sabtu", speaker: SCHOLARS[(i + 2) % SCHOLARS.length] }
      ],
      qurbanDonors: Array.from({ length: 5 + Math.floor(Math.random() * 10) }).map((_, dIdx) => ({
        name: DONORS[dIdx % DONORS.length] + (dIdx > 5 ? ` ${dIdx}` : ""),
        type: Math.random() > 0.3 ? "Kambing" : "Sapi (1/7)"
      })),
      facilities: ["Ruang Shalat FULL AC", "Area Parkir Luas", "Perpustakaan Mini", "TPA/TPQ", "Aula Serbaguna"].slice(0, 3 + Math.random() * 2),
      description: `Wadah ibadah dan pusat peradaban Islam yang berkomitmen mencetak generasi Qurani di wilayah ${city}. Mengedepankan transparansi tata kelola masjid dan pelayanan jamaah yang prima.`,
      isFeatured,
      campaigns: Array.from({ length: 1 + Math.floor(Math.random() * 3) }).map((_, j) => {
        const targets = [50000000, 100000000, 25000000, 150000000];
        const target = targets[j % targets.length] * (1 + Math.random());
        return {
          id: `masjid-${i + 1}-camp-${j + 1}`,
          title: j === 0 ? `Pembangunan & Renovasi Kubah Masjid` : j === 1 ? `Pembebasan Lahan Parkir Jamaah` : `Operasional & Santunan Yatim Binaan`,
          target: Math.round(target / 10000) * 10000,
          collected: Math.round((target * (Math.random() * 0.8)) / 10000) * 10000,
          image: IMAGES[(i + j + 1) % IMAGES.length],
        };
      }),
      impactData: {
        disbursement: [
          { name: "Yatim", value: 45000000 + Math.random() * 20000000 },
          { name: "Dhuafa", value: 35000000 + Math.random() * 15000000 },
          { name: "Pendidikan", value: 25000000 + Math.random() * 10000000 },
          { name: "Kesehatan", value: 15000000 + Math.random() * 8000000 },
          { name: "Dakwah", value: 20000000 + Math.random() * 12000000 },
        ],
        demographics: [
          { name: "Anak-anak", value: 120 + Math.floor(Math.random() * 50) },
          { name: "Lansia", value: 80 + Math.floor(Math.random() * 30) },
          { name: "Pelajar", value: 65 + Math.floor(Math.random() * 40) },
          { name: "Janda", value: 45 + Math.floor(Math.random() * 20) },
        ],
        growth: Array.from({ length: 6 }).map((_, g) => ({
          month: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun"][g],
          amount: 20000000 + Math.random() * 50000000
        }))
      }
    };
  });
};

const MOSQUES = generateMosques();
const ITEMS_PER_PAGE = 12;

const MosqueCard = ({ mosque, idx, onAddToCart, onQuickDonate, onOpenDetail }: { 
  mosque: any; 
  idx: number; 
  onAddToCart?: (p: any, amt: string) => void; 
  onQuickDonate?: (p: any, amt: string) => void; 
  onOpenDetail: (m: any) => void;
  key?: any;
}) => {
  const [localAmount, setLocalAmount] = useState("50.000");
  const [selectedTarget, setSelectedTarget] = useState<string>("kas");
  const [isHovered, setIsHovered] = useState(false);
  
  const adjustAmount = (delta: number) => {
    const current = parseInt(localAmount.replace(/\D/g, "")) || 0;
    const next = Math.max(10000, current + delta);
    setLocalAmount(formatCurrencyForm(next.toString()));
  };

  const handleCardAction = (type: 'cart' | 'donate') => {
    let program: any;
    if (selectedTarget === "kas") {
      program = {
        id: parseInt(mosque.id.replace('masjid-', '')) + 1000,
        title: `Kas Umum - ${mosque.name}`,
        category: "Masjid",
        image: mosque.image,
        description: `Sedekah untuk operasional dan kemakmuran ${mosque.name}`,
        collected: mosque.cashBalance,
        target: mosque.cashBalance * 2,
        donors: 0
      };
    } else {
      const camp = mosque.campaigns.find((c: any) => c.id === selectedTarget);
      if (camp) {
        program = {
          ...camp,
          category: "Masjid",
          description: camp.title,
          donors: 0
        };
      }
    }

    if (program) {
      if (type === 'cart' && onAddToCart) {
        onAddToCart(program, localAmount.replace(/\D/g, ""));
      } else if (type === 'donate' && onQuickDonate) {
        onQuickDonate(program, localAmount);
      }
    }
  };

  const availableTargets = [
    { id: "kas", title: "Kas Masjid" },
    ...mosque.campaigns.slice(0, 2).map((c: any) => ({ id: c.id, title: c.title.split(' ').slice(0, 1).join(' ') }))
  ];

  return (
    <motion.div
      layout
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4, delay: (idx % 8) * 0.05 }}
      className="group relative bg-white dark:bg-slate-900 rounded-[2rem] p-1.5 
                 transform-gpu transition-all duration-500 hover:-translate-y-1.5
                 shadow-lg shadow-slate-200/40 dark:shadow-none
                 border border-slate-100 dark:border-slate-800"
    >
      <div 
        onClick={() => onOpenDetail(mosque)}
        className="relative h-40 md:h-44 rounded-[1.6rem] overflow-hidden cursor-pointer"
      >
        <img 
          src={mosque.image} 
          alt={mosque.name} 
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
        
        <div className="absolute bottom-4 left-4 right-4 focus-within:opacity-0 transition-opacity">
          <p className="text-emerald-300 font-black text-[7px] tracking-widest uppercase mb-1 drop-shadow-md">
            {mosque.location}
          </p>
          <h3 className="text-white font-black text-xs leading-tight line-clamp-1 drop-shadow-md">{mosque.name}</h3>
        </div>
        
        <div className="absolute top-3 right-3 bg-white/10 backdrop-blur-md rounded-xl p-1.5 border border-white/20 shadow-lg">
          <Info className="w-3.5 h-3.5 text-white" />
        </div>
      </div>

      <div className="p-3 pt-4">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-1 text-slate-400 text-[9px] font-black uppercase">
            <Users className="w-3 h-3 text-[#1799dc]" />
            {mosque.capacity.toLocaleString()}
          </div>
          <div className="flex -space-x-1.5">
            {mosque.campaigns.slice(0, 3).map((_, i) => (
              <div key={i} className="w-5 h-5 rounded-full bg-[#1799dc] border border-white dark:border-slate-900 flex items-center justify-center shadow-sm">
                <Heart className="w-2.5 h-2.5 fill-white text-white" />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {/* Target Slider-like Selector */}
          <div className="flex gap-1 overflow-x-auto pb-0.5 no-scrollbar scroll-smooth">
            {availableTargets.map((target) => (
              <button
                key={target.id}
                onClick={() => setSelectedTarget(target.id)}
                className={`flex-shrink-0 px-2.5 py-1.5 rounded-full text-[8px] font-black uppercase tracking-tighter border transition-all ${
                  selectedTarget === target.id
                    ? "bg-[#1799dc] border-[#1799dc] text-white shadow-sm"
                    : "bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400"
                }`}
              >
                {target.title}
              </button>
            ))}
          </div>

          {/* New Compact Amount Control */}
          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 rounded-2xl p-1 border border-slate-100 dark:border-slate-700 gap-1">
             <button 
              onClick={() => adjustAmount(-10000)}
              className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-700 text-slate-400 rounded-xl shadow-sm hover:text-[#1799dc] transition-all active:scale-90"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            
            <div className="flex-1 text-center group/input">
              <input
                type="text"
                value={`Rp ${localAmount}`}
                onChange={(e) => {
                  const val = e.target.value.replace('Rp ', '');
                  setLocalAmount(formatCurrencyForm(val));
                }}
                className="w-full bg-transparent border-none outline-none text-[11px] font-black text-slate-900 dark:text-white text-center focus:ring-0 p-0"
              />
            </div>

            <button 
              onClick={() => adjustAmount(10000)}
              className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-700 text-slate-400 rounded-xl shadow-sm hover:text-[#1799dc] transition-all active:scale-90"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => handleCardAction('cart')}
              className="w-10 h-10 bg-blue-50 dark:bg-slate-800 text-[#1799dc] flex items-center justify-center rounded-[1.2rem] shadow-sm active:scale-90 transition-all border border-blue-100 dark:border-slate-700 hover:bg-[#1799dc] hover:text-white"
            >
              <ShoppingBag className="w-5 h-5" />
            </button>
            <button 
              onClick={() => handleCardAction('donate')}
              className="flex-1 h-10 bg-gradient-to-r from-orange-400 to-amber-500 text-white rounded-[1.2rem] text-[9px] font-black uppercase tracking-wider shadow-lg shadow-orange-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
            >
              <Heart className="w-3.5 h-3.5 fill-white/20" /> Donasi
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const MosqueProfiles = ({ 
  onAddToCart, 
  onQuickDonate 
}: { 
  onAddToCart?: (p: any, amt: string) => void;
  onQuickDonate?: (p: any, amt: string) => void;
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMosque, setSelectedMosque] = useState<any | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("overview");
  const [quickAmount, setQuickAmount] = useState("50.000");
  const [selectedKantung, setSelectedKantung] = useState<string>("kas");

  const handleIncrement = () => {
    const current = parseInt(quickAmount.replace(/\D/g, "")) || 0;
    setQuickAmount(formatCurrencyForm((current + 10000).toString()));
  };

  const handleDecrement = () => {
    const current = parseInt(quickAmount.replace(/\D/g, "")) || 0;
    if (current <= 10000) return;
    setQuickAmount(formatCurrencyForm((current - 10000).toString()));
  };

  const handleAction = (actionType: 'cart' | 'donate') => {
    if (!selectedMosque) return;
    
    let programToDonate: any;
    if (selectedKantung === "kas") {
      programToDonate = {
        id: parseInt(selectedMosque.id.replace('masjid-', '')) + 1000,
        title: `Kas Umum - ${selectedMosque.name}`,
        category: "Masjid",
        image: selectedMosque.image,
        description: `Sedekah untuk operasional dan kemakmuran ${selectedMosque.name}`,
        collected: selectedMosque.cashBalance,
        target: selectedMosque.cashBalance * 2,
        donors: 0
      };
    } else {
      const camp = selectedMosque.campaigns.find((c: any) => c.id === selectedKantung);
      if (camp) {
        programToDonate = {
          ...camp,
          category: "Masjid",
          description: camp.title,
          donors: 0
        };
      }
    }

    if (programToDonate) {
      const rawAmount = quickAmount.replace(/\D/g, "");
      if (actionType === 'cart' && onAddToCart) {
        onAddToCart(programToDonate, rawAmount);
      } else if (actionType === 'donate' && onQuickDonate) {
        onQuickDonate(programToDonate, quickAmount);
      }
    }
  };

  const kantungs = selectedMosque ? [
    { id: "kas", title: "Kas Umum Masjid", desc: "Operasional & Kemakmuran" },
    ...selectedMosque.campaigns.map((c: any) => ({ id: c.id, title: c.title, desc: "Program Khusus" }))
  ] : [];

  const nominals = ["10.000", "25.000", "50.000", "100.000", "250.000", "500.000"];

  const filteredMosques = MOSQUES.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.location.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredMosques.length / ITEMS_PER_PAGE);
  const paginatedMosques = filteredMosques.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 400, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Profile Masjid */}
        <div className="relative mb-12 rounded-[2.5rem] overflow-hidden bg-gradient-to-r from-blue-900 to-indigo-900 shadow-2xl">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542382156909-9ae37b3f56fd?q=80&w=2000')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>

          <div className="relative z-10 px-8 py-16 md:py-24 text-center">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-6 text-white text-xs font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            >
              <Building2 className="w-4 h-4" /> Ensiklopedia Masjid Nusantara
            </motion.div>
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight drop-shadow-2xl"
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-cyan-200">
                Merangkai Peradaban
              </span>
              <br />
              Dari Mihrab ke Mihrab
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-slate-200 text-sm md:text-lg max-w-2xl mx-auto font-medium leading-relaxed drop-shadow-md"
            >
              Eksplorasi profil 30 masjid pilihan di penjuru negeri. Bersama
              ciptakan jejak kebaikan melalui program pemakmuran masjid secara
              langsung.
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="max-w-xl mx-auto mt-10 relative group"
            >
              <div className="absolute inset-0 bg-cyan-400/20 blur-xl rounded-full transition-all duration-300 group-hover:bg-cyan-400/30"></div>
              <div className="relative flex items-center bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-2 shadow-2xl">
                <Search className="w-5 h-5 text-white/70 ml-3" />
                <input
                  type="text"
                  placeholder="Cari nama atau kota masjid..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-white px-4 py-2 placeholder-white/50 font-medium"
                />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Grid 3D Cards - More Compact */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          <AnimatePresence mode="popLayout">
            {paginatedMosques.map((mosque, idx) => (
              <MosqueCard 
                key={mosque.id} 
                mosque={mosque} 
                idx={idx} 
                onAddToCart={onAddToCart}
                onQuickDonate={onQuickDonate}
                onOpenDetail={(m) => setSelectedMosque(m)}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Pagination UI */}
        {totalPages > 1 && (
          <div className="mt-16 flex items-center justify-center gap-2">
            <button 
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="w-10 h-10 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-[#1799dc] hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
            </button>
            
            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalPages }).map((_, i) => {
                const page = i + 1;
                // Only show current, first, last, and neighbors
                if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${
                        currentPage === page 
                          ? 'bg-[#1799dc] text-white shadow-lg shadow-blue-500/20' 
                          : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-[#1799dc]'
                      }`}
                    >
                      {page}
                    </button>
                  );
                } else if (page === currentPage - 2 || page === currentPage + 2) {
                  return <span key={page} className="text-slate-400">...</span>;
                }
                return null;
              })}
            </div>

            <button 
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="w-10 h-10 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-[#1799dc] hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Modal Detail Masjid & Program */}
      <AnimatePresence>
        {selectedMosque && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setSelectedMosque(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full h-full md:h-[85vh] md:max-w-[1000px] bg-white dark:bg-slate-900 md:rounded-[2rem] shadow-2xl overflow-hidden flex flex-col z-10 border border-slate-100 dark:border-slate-800"
            >
              {/* Modal Header Cover */}
              <div className="relative h-48 md:h-56 shrink-0">
                <img
                  src={selectedMosque.image}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
                <button
                  onClick={() => setSelectedMosque(null)}
                  className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors border border-white/20"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="absolute bottom-5 left-5 right-5">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#1799dc]/20 border border-[#1799dc]/50 text-cyan-100 text-[8px] font-black rounded-lg uppercase tracking-widest mb-2 backdrop-blur-md">
                    <ShieldCheck className="w-3 h-3" /> Terverifikasi Laznas Dewan Da'wah
                  </div>
                  <h2 className="text-2xl md:text-4xl font-black text-white mb-1 leading-tight drop-shadow-sm">
                    {selectedMosque.name}
                  </h2>
                  <p className="text-white/80 font-medium flex items-center gap-2 text-xs md:text-sm">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" /> {selectedMosque.location}
                  </p>
                </div>
              </div>

              {/* Modal Content container */}
              <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-white dark:bg-slate-950">
                {/* Navigation: Horizontal on Mobile, Sidebar on Desktop */}
                <div className="w-full md:w-64 border-b md:border-r border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0">
                  <div className="p-4 md:p-6 flex flex-col h-full">
                    <div className="mb-0 md:mb-8">
                      <h3 className="hidden md:block text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 px-4">Menu Informasi</h3>
                      
                      {/* Tabs List */}
                      <div className="overflow-x-auto md:overflow-y-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
                        <div className="flex md:flex-col gap-1 md:gap-1.5 pb-1 md:pb-0">
                          {[
                            { id: "overview", label: "Profil", icon: Info },
                            { id: "studies", label: "Kajian", icon: BookOpen },
                            { id: "campaigns", label: "Donasi", icon: Wallet },
                            { id: "transparency", label: "Dampak", icon: TrendingUp },
                            { id: "qurban", label: "Qurban", icon: Sparkles },
                          ].map((tab) => (
                            <button
                              key={tab.id}
                              onClick={() => setActiveTab(tab.id)}
                              className={`flex items-center gap-3 px-4 py-3 rounded-xl md:rounded-2xl text-[9px] md:text-[11px] font-bold uppercase tracking-widest transition-all whitespace-nowrap shrink-0 md:shrink border ${
                                activeTab === tab.id
                                  ? "bg-[#1799dc]/5 text-[#1799dc] border-[#1799dc]/20"
                                  : "text-slate-400 border-transparent hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/30"
                              }`}
                            >
                              <tab.icon className={`w-3.5 h-3.5 ${activeTab === tab.id ? "text-[#1799dc]" : "opacity-50"}`} />
                              {tab.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {/* Stats Box - Desktop Only */}
                    <div className="hidden md:block mt-auto pt-6 border-t border-slate-100 dark:border-slate-800">
                      <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-[1.5rem] border border-slate-100 dark:border-slate-800">
                        <p className="text-[8px] font-black uppercase text-slate-400 mb-2 tracking-widest">Saldo Kas</p>
                        <p className="text-base font-black text-[#1799dc] tracking-tight">Rp{formatCurrencyForm(selectedMosque.cashBalance.toString())}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto bg-slate-50/20 dark:bg-slate-950">
                  <div className="max-w-4xl mx-auto p-5 md:p-10 lg:p-12">
                    <AnimatePresence mode="wait">
                      {activeTab === "overview" && (
                        <motion.div
                          key="overview"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="space-y-10"
                        >
                          <div className="grid lg:grid-cols-5 gap-10 items-start">
                            <div className="lg:col-span-3 space-y-8">
                              <div>
                                <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-4 leading-tight tracking-tight">Mewujudkan Peradaban Qurani Berbasis Masjid.</h1>
                                <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium text-xs md:text-sm">
                                  {selectedMosque.description} Saat ini kami aktif mengelola program pendidikan dan sosial untuk masyarakat di {selectedMosque.location}.
                                </p>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                                  <Users className="w-5 h-5 text-blue-500 mb-3" />
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Kapasitas</p>
                                  <p className="text-base font-black text-slate-900 dark:text-white">{selectedMosque.capacity.toLocaleString()}</p>
                                </div>
                                <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                                  <Calendar className="w-5 h-5 text-emerald-500 mb-3" />
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Didirikan</p>
                                  <p className="text-base font-black text-slate-900 dark:text-white">{selectedMosque.establishedYear}</p>
                                </div>
                                 <div className="md:hidden p-5 bg-[#1799dc] rounded-3xl text-white shadow-lg shadow-blue-500/20 col-span-2 flex items-center justify-between">
                                  <div>
                                     <p className="text-[8px] font-black uppercase tracking-widest opacity-70 mb-0.5">Kas Masjid</p>
                                     <p className="text-base font-black">Rp{formatCurrencyForm(selectedMosque.cashBalance.toString())}</p>
                                  </div>
                                  <Wallet className="w-6 h-6 opacity-40" />
                                </div>
                              </div>

                              {/* Donasi Cepat Section */}
                              <div className="p-6 md:p-8 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 rounded-[2.5rem] border border-[#1799dc]/10 dark:border-white/5 shadow-xl shadow-blue-500/5 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#1799dc]/5 blur-3xl rounded-full -mr-10 -mt-10"></div>
                                
                                <div className="relative z-10">
                                  <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#1799dc] to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                                      <Heart className="w-5 h-5 fill-white/20" />
                                    </div>
                                    <div>
                                      <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">Donasi Cepat</h3>
                                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Titipkan Kebaikan Sekarang</p>
                                    </div>
                                  </div>

                                  <div className="space-y-6">
                                    {/* Pilih Kantung */}
                                    <div>
                                      <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Pilih Kantung Kebaikan</label>
                                      <div className="grid grid-cols-1 gap-2">
                                        {kantungs.map((k) => (
                                          <button
                                            key={k.id}
                                            onClick={() => setSelectedKantung(k.id)}
                                            className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all text-left ${
                                              selectedKantung === k.id
                                                ? "bg-[#1799dc] border-[#1799dc] text-white shadow-lg shadow-blue-500/20"
                                                : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-[#1799dc]/30"
                                            }`}
                                          >
                                            <div className="flex flex-col">
                                              <span className="text-[11px] font-black truncate max-w-[200px]">{k.title}</span>
                                              <span className={`text-[8px] font-bold uppercase tracking-wider ${selectedKantung === k.id ? "text-white/70" : "text-slate-400"}`}>{k.desc}</span>
                                            </div>
                                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedKantung === k.id ? "border-white" : "border-slate-200 dark:border-slate-700"}`}>
                                              {selectedKantung === k.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                            </div>
                                          </button>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Pilih Nominal */}
                                    <div>
                                      <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Pilih Nominal</label>
                                      <div className="grid grid-cols-3 gap-2">
                                        {nominals.map((n) => (
                                          <button
                                            key={n}
                                            onClick={() => setQuickAmount(n)}
                                            className={`py-2.5 rounded-xl text-[10px] font-black border transition-all ${
                                              quickAmount === n
                                                ? "bg-[#1799dc]/10 border-[#1799dc] text-[#1799dc]"
                                                : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                                            }`}
                                          >
                                            Rp{n}
                                          </button>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Amount Input with Plus/Minus */}
                                    <div>
                                      <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Input Manual</label>
                                      <div className="flex items-center gap-2">
                                        <div className="relative flex-1 group">
                                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <span className="text-slate-400 font-black text-[11px]">Rp</span>
                                          </div>
                                          <input
                                            type="text"
                                            value={quickAmount}
                                            onChange={(e) => setQuickAmount(formatCurrencyForm(e.target.value))}
                                            onFocus={() => { if(nominals.includes(quickAmount)) setQuickAmount("") }}
                                            className="w-full pl-10 pr-4 py-3.5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 focus:ring-2 focus:ring-[#1799dc]/20 focus:border-[#1799dc] outline-none text-sm font-black text-slate-900 dark:text-white transition-all shadow-inner"
                                            placeholder="0"
                                          />
                                        </div>
                                        <div className="flex flex-col gap-1 bg-blue-50/50 dark:bg-slate-800 p-1 rounded-2xl border border-blue-100 dark:border-slate-700">
                                          <button 
                                            onClick={handleIncrement}
                                            className="w-8 h-8 rounded-xl bg-white dark:bg-slate-700 text-[#1799dc] flex items-center justify-center hover:bg-[#1799dc] hover:text-white transition-all shadow-sm"
                                          >
                                            <Plus className="w-4 h-4" />
                                          </button>
                                          <button 
                                            onClick={handleDecrement}
                                            className="w-8 h-8 rounded-xl bg-white dark:bg-slate-700 text-[#1799dc] flex items-center justify-center hover:bg-[#1799dc] hover:text-white transition-all shadow-sm"
                                          >
                                            <Minus className="w-4 h-4" />
                                          </button>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-3 mt-4">
                                      <button 
                                        onClick={() => handleAction('cart')}
                                        className="w-14 h-14 bg-[#1799dc] text-white flex items-center justify-center rounded-2xl shadow-lg shadow-blue-500/20 active:scale-90 transition-all border border-[#1799dc]"
                                      >
                                        <ShoppingBag className="w-6 h-6" />
                                      </button>
                                      
                                      <button 
                                        onClick={() => handleAction('donate')}
                                        className="flex-1 py-4 bg-gradient-to-r from-orange-400 to-amber-500 text-white font-black rounded-[2rem] text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-orange-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                                      >
                                        <Heart className="w-5 h-5 fill-white/20" /> Donasi
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="lg:col-span-2 bg-slate-900 rounded-[2.5rem] p-7 text-white relative overflow-hidden border border-slate-800 w-full">
                               <div className="relative z-10 space-y-8">
                                  <div className="flex items-center gap-4">
                                     <div className="w-12 h-12 rounded-full border border-[#1799dc] p-1 shadow-[0_0_15px_rgba(23,153,220,0.2)]">
                                        <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center">
                                           <Users className="w-5 h-5 text-[#1799dc]" />
                                        </div>
                                     </div>
                                     <div>
                                        <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest opacity-60">Imam</p>
                                        <p className="text-base font-black">{selectedMosque.imam}</p>
                                     </div>
                                  </div>
                                  
                                  <div className="space-y-4">
                                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Khatib Jumat</p>
                                     <div className="grid gap-2.5">
                                        {selectedMosque.khatibs.map((khatib: any, i: number) => (
                                           <div key={i} className="flex items-center justify-between p-3.5 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-md">
                                              <span className="text-[11px] font-bold text-slate-200">{khatib.name}</span>
                                              <span className="text-[8px] font-black text-white bg-[#1799dc] px-2.5 py-1 rounded-lg uppercase tracking-widest">{khatib.date}</span>
                                           </div>
                                        ))}
                                     </div>
                                  </div>
                               </div>
                               <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-blue-500/10 blur-[60px] rounded-full" />
                            </div>
                          </div>

                          <div className="pt-10 border-t border-slate-100 dark:border-slate-800">
                             <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8">Fasilitas Masjid</h4>
                             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {selectedMosque.facilities.map((fac: string, i: number) => (
                                   <div key={i} className="flex flex-col items-center text-center gap-3 p-6 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:border-[#1799dc] group">
                                      <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-[#1799dc]/5 group-hover:text-[#1799dc] transition-all">
                                         <Sparkles className="w-4 h-4" />
                                      </div>
                                      <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-tight">{fac}</span>
                                   </div>
                                ))}
                             </div>
                          </div>
                        </motion.div>
                      )}


                      {activeTab === "studies" && (
                        <motion.div
                          key="studies"
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          className="grid grid-cols-1 md:grid-cols-2 gap-5"
                        >
                           {selectedMosque.studies.map((study: any, i: number) => (
                              <div key={i} className="bg-white dark:bg-slate-900 p-7 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all hover:border-[#1799dc] group relative">
                                 <div className="flex justify-between items-start mb-6">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 flex items-center justify-center font-black text-xl shadow-inner group-hover:bg-[#1799dc] group-hover:text-white transition-all">
                                       {i + 1}
                                    </div>
                                    <div className="flex flex-col items-end gap-1.5">
                                       <span className="px-3.5 py-1.5 bg-[#1799dc] text-white rounded-xl text-[8px] font-black uppercase tracking-widest shadow-md shadow-blue-500/10">{study.date}</span>
                                       <span className="px-3.5 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-xl text-[8px] font-black uppercase tracking-widest">{study.time}</span>
                                    </div>
                                 </div>
                                 <h3 className="text-lg font-black text-slate-900 dark:text-white mb-5 leading-tight">{study.title}</h3>
                                 <div className="flex items-center gap-3 p-3.5 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800/50">
                                    <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm">
                                       <Users className="w-3.5 h-3.5 text-[#1799dc]" />
                                    </div>
                                    <div>
                                       <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Pemateri</p>
                                       <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{study.speaker}</p>
                                    </div>
                                 </div>
                              </div>
                           ))}
                        </motion.div>
                      )}

                      {activeTab === "campaigns" && (
                        <motion.div
                          key="campaigns"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-6"
                        >
                           {selectedMosque.campaigns.map((camp: any) => {
                             const progress = Math.min(100, (camp.collected / camp.target) * 100);
                             return (
                               <div key={camp.id} className="group grid lg:grid-cols-12 items-stretch bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl transition-all">
                                  <div className="lg:col-span-4 h-56 lg:h-auto relative overflow-hidden">
                                     <img src={camp.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                     <div className="absolute top-6 left-6">
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white rounded-xl text-[8px] font-black uppercase tracking-widest">
                                           <div className="w-1 h-1 bg-white rounded-full animate-pulse" /> Urgent
                                        </div>
                                     </div>
                                  </div>
                                  <div className="lg:col-span-8 p-7 md:p-9 flex flex-col justify-between">
                                     <div>
                                        <h4 className="text-xl font-black text-slate-900 dark:text-white mb-6 leading-tight group-hover:text-[#1799dc] transition-colors">{camp.title}</h4>
                                        <div className="grid grid-cols-2 gap-6 mb-6">
                                           <div>
                                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Terkumpul</p>
                                              <p className="text-lg font-black text-slate-900 dark:text-white">Rp{formatCurrencyForm(camp.collected.toString())}</p>
                                           </div>
                                           <div className="text-right">
                                              <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">Capaian</p>
                                              <p className="text-lg font-black text-emerald-500">{progress.toFixed(0)}%</p>
                                           </div>
                                        </div>
                                        <div className="relative h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full mb-8 overflow-hidden p-0.5 shadow-inner">
                                           <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full" />
                                        </div>
                                     </div>
                                     <div className="flex flex-col sm:flex-row items-center gap-4">
                                        <button className="w-full sm:w-auto px-8 py-3.5 bg-[#1799dc] text-white font-black rounded-xl text-[9px] uppercase tracking-[0.2em] shadow-lg shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-2">
                                           Donasi Sekarang <ArrowRight className="w-3.5 h-3.5" />
                                        </button>
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Sisa: Rp{formatCurrencyForm((camp.target - camp.collected).toString())}</span>
                                     </div>
                                  </div>
                               </div>
                             );
                           })}
                        </motion.div>
                      )}

                      {activeTab === "transparency" && (
                        <motion.div
                          key="transparency"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="space-y-10"
                        >
                           <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-10 text-white relative overflow-hidden border border-slate-800 shadow-xl">
                              <div className="relative z-10">
                                 <h3 className="text-2xl font-black mb-2">Statistik Kas Masjid</h3>
                                 <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.3em] mb-10">Histori 6 Bulan Terakhir</p>
                                 <div className="h-[250px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                       <AreaChart data={selectedMosque.impactData.growth}>
                                          <defs>
                                             <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#1799dc" stopOpacity={0.5}/>
                                                <stop offset="95%" stopColor="#1799dc" stopOpacity={0}/>
                                             </linearGradient>
                                          </defs>
                                          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 9, fontWeight: 800 }} />
                                          <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '15px', padding: '10px 15px' }} />
                                          <Area type="monotone" dataKey="amount" stroke="#1799dc" strokeWidth={4} fill="url(#areaGrad)" />
                                       </AreaChart>
                                    </ResponsiveContainer>
                                 </div>
                              </div>
                              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full" />
                           </div>

                           <div className="grid md:grid-cols-2 gap-6">
                              <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                                 <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Penyaluran Dana</h4>
                                 <div className="h-[200px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                       <BarChart data={selectedMosque.impactData.disbursement}>
                                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 700 }} />
                                          <RechartsTooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                          <Bar dataKey="value" fill="#1799dc" radius={[10, 10, 0, 0]} barSize={28} />
                                       </BarChart>
                                    </ResponsiveContainer>
                                 </div>
                              </div>
                              <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                                 <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 text-center">Penerima Manfaat</h4>
                                 <div className="h-[200px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                       <PieChart>
                                          <Pie data={selectedMosque.impactData.demographics} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={10} dataKey="value">
                                             {selectedMosque.impactData.demographics.map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={["#1799dc", "#10b981", "#f59e0b", "#ef4444"][index % 4]} stroke="none" />
                                             ))}
                                          </Pie>
                                          <Legend iconSize={8} wrapperStyle={{ fontSize: '9px', fontWeight: 'bold' }} />
                                       </PieChart>
                                    </ResponsiveContainer>
                                 </div>
                              </div>
                           </div>
                        </motion.div>
                      )}

                      {activeTab === "qurban" && (
                        <motion.div
                          key="qurban"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-10"
                        >
                           <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-100 dark:border-slate-800">
                              <div className="text-center md:text-left">
                                 <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1 flex items-center justify-center md:justify-start gap-4">
                                    <Sparkles className="w-8 h-8 text-amber-500" /> Data Pequrban
                                 </h3>
                                 <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[8px]">Tahun 1447 Hijriah</p>
                              </div>
                              <div className="px-6 py-2.5 bg-[#1799dc] text-white rounded-xl shadow-lg shadow-blue-500/20 font-black text-[10px] uppercase tracking-widest">
                                 {selectedMosque.qurbanDonors.length} Donatur
                              </div>
                           </div>

                           <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                              {selectedMosque.qurbanDonors.map((donor: any, i: number) => (
                                 <div key={i} className="group bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 transition-all hover:border-[#1799dc]">
                                    <p className="text-[7px] font-black text-[#1799dc] uppercase mb-1 tracking-widest opacity-60 group-hover:opacity-100">{donor.type}</p>
                                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{donor.name}</p>
                                 </div>
                              ))}
                           </div>
                           
                           <div className="p-8 bg-blue-50 dark:bg-blue-900/10 rounded-[2.5rem] border border-blue-100 dark:border-blue-800/30 flex flex-col md:flex-row items-center justify-between gap-6">
                              <div>
                                 <h4 className="text-lg font-black text-slate-900 dark:text-white mb-0.5">Daftar Pequrban?</h4>
                                 <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">Tersedia kuota terbatas Idul Adha 1447H</p>
                              </div>
                              <button className="px-8 py-3 bg-[#1799dc] text-white font-black rounded-xl text-[9px] uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all">
                                 Hubungi Kami
                              </button>
                           </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
