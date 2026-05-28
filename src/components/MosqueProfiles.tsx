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
  Share2,
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

export const MOSQUES = generateMosques();
const ITEMS_PER_PAGE = 12;

export const MosqueCard = ({ mosque, idx, onAddToCart, onQuickDonate, onOpenDetail }: { 
  mosque: any; 
  idx: number; 
  onAddToCart?: (p: any, amt: string) => void; 
  onQuickDonate?: (p: any, amt: string) => void; 
  onOpenDetail: (m: any) => void;
  key?: any;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  // Remove isFeatured to make size consistent
  const nominals = ["25.000", "50.000", "100.000"];
  const [selectedNominal, setSelectedNominal] = useState("50.000");

  const handleDonate = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onQuickDonate) {
      onQuickDonate({
        id: parseInt(mosque.id.replace('masjid-', '')) + 1000,
        title: `Kas Umum - ${mosque.name}`,
        category: "Masjid",
        image: mosque.image,
      }, selectedNominal);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart({
        id: parseInt(mosque.id.replace('masjid-', '')) + 1000,
        title: `Kas Umum - ${mosque.name}`,
        category: "Masjid",
        image: mosque.image,
      }, selectedNominal);
    }
  };

  return (
    <motion.div
      layout
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.6, delay: (idx % 8) * 0.05, ease: [0.22, 1, 0.36, 1] }}
      onClick={() => onOpenDetail(mosque)}
      className="group col-span-1 flex flex-col bg-slate-900 overflow-hidden cursor-pointer rounded-2xl transform-gpu transition-all duration-700 shadow-sm hover:shadow-xl"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <motion.div 
          animate={{ scale: isHovered ? 1.05 : 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="w-full h-full"
        >
          <img 
            src={mosque.image} 
            alt={mosque.name} 
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* Elegant Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent transition-opacity duration-500"></div>

        <div className="absolute top-4 left-4 flex gap-2">
          {mosque.isFeatured && (
             <div className="px-2.5 py-1 rounded-full bg-amber-500/90 backdrop-blur-md text-white text-[8px] font-bold tracking-[0.2em] uppercase flex items-center gap-1 shadow-lg">
                <Sparkles className="w-3 h-3" /> Rekomendasi
             </div>
          )}
          <div className="px-2 py-1 rounded-full bg-emerald-500/90 backdrop-blur-md text-white text-[8px] font-bold tracking-[0.2em] uppercase flex items-center gap-1 shadow-lg">
             <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Terverifikasi
          </div>
        </div>

        <div className="absolute top-4 right-4">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 backdrop-blur-md text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowRight className="w-4 h-4 -rotate-45" />
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
           <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-2 hover:bg-white/20 transition-colors">
             <MapPin className="w-3 h-3 text-emerald-300" />
             <span className="text-white/90 text-[8px] md:text-[9px] font-bold tracking-[0.2em] uppercase">
               {mosque.location}
             </span>
          </div>

          <h3 className="font-serif text-white leading-tight drop-shadow-md mb-2 line-clamp-2 text-xl md:text-2xl font-medium">
            {mosque.name}
          </h3>
          
           <div className="flex items-center gap-4 border-t border-white/20 pt-3 text-white/80 text-[10px] md:text-xs">
             <div className="flex items-center gap-1.5">
               <Users className="w-3.5 h-3.5 text-amber-300" />
               <span className="font-medium">{mosque.capacity.toLocaleString()}</span>
             </div>
             <div className="flex items-center gap-1.5">
               <Calendar className="w-3.5 h-3.5 text-blue-300" />
               <span className="font-medium">Est. {mosque.establishedYear}</span>
             </div>
           </div>
        </div>
      </div>

      {/* Quick Donation Section */}
      <div className="p-4 md:p-5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800" onClick={(e) => e.stopPropagation()}>
         <div className="flex justify-between items-center mb-3">
             <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <Heart className="w-3 h-3 text-amber-500" fill="currentColor" /> Donasi Cepat Kas
             </span>
         </div>
         <div className="flex gap-2 mb-3">
            {nominals.map(nom => (
               <button
                  key={nom}
                  onClick={() => setSelectedNominal(nom)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                     selectedNominal === nom 
                     ? "bg-amber-50 dark:bg-amber-500/10 border-amber-500 text-amber-700 dark:text-amber-400 shadow-sm" 
                     : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                  }`}
               >
                 {nom}
               </button>
            ))}
         </div>
         <div className="flex gap-2 mt-4 mt-auto">
            <button 
               onClick={handleAddToCart}
               className="w-10 h-10 flex-none rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
            >
               <ShoppingBag className="w-4 h-4" />
            </button>
            <button 
              onClick={handleDonate}
              className="flex-1 h-10 bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:-translate-y-0.5 shadow-md active:scale-95 transition-all"
            >
              Tunaikan Misi <Heart className="w-3.5 h-3.5 opacity-70" />
            </button>
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
        <div className="relative mb-16 md:mb-24 mt-4 md:mt-10 overflow-visible text-center">
          <div className="relative z-10 px-4 md:px-8 text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 mb-8 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]"
            >
              <Building2 className="w-3.5 h-3.5" /> Ensiklopedia Masjid Nusantara
            </motion.div>
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl lg:text-7xl font-serif font-medium text-slate-900 dark:text-slate-100 mb-8 leading-[1.1] tracking-tight"
            >
              Merangkai Peradaban
              <br />
              <span className="italic text-slate-500 dark:text-slate-400">Dari Mihrab ke Mihrab.</span>
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-slate-500 dark:text-slate-400 text-sm md:text-lg max-w-2xl mx-auto font-medium leading-relaxed"
            >
              Eksplorasi profil 30 masjid pilihan di penjuru negeri. Bersama
              ciptakan jejak kebaikan melalui program pemakmuran masjid secara
              langsung.
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="max-w-md mx-auto mt-12 relative group"
            >
              <div className="relative flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full p-2 shadow-[0_10px_30px_rgba(0,0,0,0.05)] transition-shadow group-focus-within:shadow-[0_10px_40px_rgba(0,0,0,0.1)]">
                <Search className="w-5 h-5 text-slate-400 ml-4" />
                <input
                  type="text"
                  placeholder="Cari nama masjid..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-slate-900 dark:text-slate-100 px-4 py-2 placeholder-slate-400 font-medium text-sm"
                />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Grid Cards - 2 Columns Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
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
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full h-[90vh] md:h-[85vh] md:max-w-4xl bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col z-10"
            >
              {/* Immersive Header Cover */}
              <div className="relative h-48 md:h-64 shrink-0">
                <img
                  src={selectedMosque.image}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
                
                <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
                   <button
                     className="w-10 h-10 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors border border-white/20 shadow-lg"
                     onClick={(e) => {
                       e.stopPropagation();
                       // Just a visual cue
                       const origText = e.currentTarget.innerHTML;
                       e.currentTarget.innerHTML = '<span class="text-[9px] font-bold tracking-widest uppercase">Tersalin</span>';
                       setTimeout(() => e.currentTarget.innerHTML = origText, 2000);
                     }}
                   >
                     <Share2 className="w-4 h-4" />
                   </button>
                   <button
                     onClick={() => setSelectedMosque(null)}
                     className="w-10 h-10 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors border border-white/20 shadow-lg"
                   >
                     <X className="w-5 h-5" />
                   </button>
                </div>

                <div className="absolute bottom-6 left-6 right-6 md:bottom-8 md:left-8">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#1799dc]/20 border border-[#1799dc]/50 text-cyan-100 text-[10px] font-bold rounded-lg uppercase tracking-widest mb-3 backdrop-blur-md">
                    <ShieldCheck className="w-3.5 h-3.5" /> Terverifikasi Laznas Dewan Da'wah
                  </div>
                  <h2 className="text-2xl md:text-4xl lg:text-5xl font-serif font-medium text-white mb-1.5 leading-[1.1] drop-shadow-md">
                    {selectedMosque.name}
                  </h2>
                  <p className="text-white/90 font-medium flex items-center gap-1.5 text-sm md:text-base">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" /> {selectedMosque.location}
                  </p>
                </div>
              </div>

              {/* Modal Content container */}
              <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
                {/* Elegant Navigation Topbar */}
                <div className="w-full border-b border-slate-200 dark:border-slate-800/50 bg-white dark:bg-slate-900 flex flex-col shrink-0">
                  <div className="px-4 md:px-8 pt-4 pb-0 flex flex-col">
                    <div className="flex items-center justify-between gap-4">
                      {/* Tabs List */}
                      <div className="overflow-x-auto no-scrollbar w-full">
                        <div className="flex items-center gap-2 pb-4">
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
                              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-[0.1em] transition-all whitespace-nowrap shrink-0 border border-slate-200 dark:border-slate-800 hover:shadow-sm ${
                                activeTab === tab.id
                                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-md"
                                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50"
                              }`}
                            >
                              <tab.icon className={`w-3.5 h-3.5 ${activeTab === tab.id ? "opacity-100" : "opacity-50"}`} />
                              {tab.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {/* Stats Box - Desktop Only */}
                      <div className="hidden md:flex flex-col items-end shrink-0 pb-4">
                        <p className="text-[9px] font-bold uppercase text-slate-500 mb-1 tracking-[0.15em]">Saldo Kas Berjalan</p>
                        <p className="text-lg font-serif text-emerald-600 dark:text-emerald-400 tracking-tight leading-none bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-lg">Rp {formatCurrencyForm(selectedMosque.cashBalance.toString())}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
                  <div className="max-w-3xl mx-auto">
                    <AnimatePresence mode="wait">
                      {activeTab === "overview" && (
                        <motion.div
                          key="overview"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="space-y-8"
                        >
                          <div className="grid md:grid-cols-12 gap-6 lg:gap-8 items-start">
                            <div className="md:col-span-7 space-y-6 md:space-y-8">
                              <div>
                                <h1 className="text-2xl md:text-3xl font-serif font-medium text-slate-900 dark:text-white mb-4 leading-tight">Mewujudkan Peradaban Qurani.</h1>
                                <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium text-sm">
                                  {selectedMosque.description} Saat ini kami aktif mengelola program pendidikan dan sosial untuk masyarakat di {selectedMosque.location}.
                                </p>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 md:p-5 bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-200 dark:border-slate-800/50 shadow-sm transition-all hover:shadow-md">
                                  <Users className="w-5 h-5 text-emerald-500 mb-2" />
                                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.15em] mb-1">Kapasitas Jamaah</p>
                                  <p className="text-xl font-serif text-slate-900 dark:text-white">{selectedMosque.capacity.toLocaleString()}</p>
                                </div>
                                <div className="p-4 md:p-5 bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-200 dark:border-slate-800/50 shadow-sm transition-all hover:shadow-md">
                                  <Calendar className="w-5 h-5 text-blue-500 mb-2" />
                                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.15em] mb-1">Tahun Berdiri</p>
                                  <p className="text-xl font-serif text-slate-900 dark:text-white">{selectedMosque.establishedYear}</p>
                                </div>
                                 <div className="md:hidden p-5 bg-slate-900 dark:bg-white rounded-[1.5rem] text-white dark:text-slate-900 shadow-xl col-span-2 flex items-center justify-between">
                                  <div>
                                     <p className="text-[9px] font-bold uppercase tracking-[0.15em] opacity-80 mb-0.5">Kas Masjid</p>
                                     <p className="text-lg font-serif">Rp {formatCurrencyForm(selectedMosque.cashBalance.toString())}</p>
                                  </div>
                                  <Wallet className="w-6 h-6 opacity-40" />
                                </div>
                              </div>

                              {/* Donasi Cepat Section */}
                              <div className="p-6 md:p-8 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800/50 shadow-xl shadow-slate-200/20 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 blur-3xl rounded-full -mr-8 -mt-8"></div>
                                
                                <div className="relative z-10">
                                  <div className="flex items-center gap-4 mb-6">
                                    <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700">
                                      <Heart className="w-4 h-4" />
                                    </div>
                                    <div>
                                      <h3 className="text-lg font-serif font-medium text-slate-900 dark:text-white mb-0.5">Donasi Cepat</h3>
                                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.15em]">Titipkan Kebaikan Sekarang</p>
                                    </div>
                                  </div>

                                    <div className="space-y-4">
                                      {/* Pilih Kantung */}
                                      <div>
                                        <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-[0.15em] mb-2.5">Pilih Kantung Kebaikan</label>
                                        <div className="grid grid-cols-1 gap-2.5">
                                          {kantungs.map((k) => (
                                            <button
                                              key={k.id}
                                              onClick={() => setSelectedKantung(k.id)}
                                              className={`flex items-center justify-between p-4 rounded-[1.5rem] border transition-all text-left ${
                                                selectedKantung === k.id
                                                  ? "bg-slate-900 border-slate-900 text-white shadow-lg"
                                                  : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400"
                                              }`}
                                            >
                                              <div className="flex flex-col">
                                                <span className="text-sm font-medium truncate max-w-[200px]">{k.title}</span>
                                                <span className={`text-[10px] uppercase tracking-widest mt-1 ${selectedKantung === k.id ? "text-white/70" : "text-slate-400"}`}>{k.desc}</span>
                                              </div>
                                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedKantung === k.id ? "border-white" : "border-slate-300 dark:border-slate-600"}`}>
                                                {selectedKantung === k.id && <div className="w-2 h-2 rounded-full bg-white" />}
                                              </div>
                                            </button>
                                          ))}
                                        </div>
                                      </div>

                                      {/* Pilih Nominal */}
                                      <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-3">Pilih Nominal</label>
                                        <div className="grid grid-cols-3 gap-2">
                                          {nominals.map((n) => (
                                            <button
                                              key={n}
                                              onClick={() => setQuickAmount(n)}
                                              className={`py-3 rounded-2xl text-[11px] font-bold tracking-wide border transition-all ${
                                                quickAmount === n
                                                  ? "bg-slate-900 border-slate-900 text-white"
                                                  : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                                              }`}
                                            >
                                              Rp {n}
                                            </button>
                                          ))}
                                        </div>
                                      </div>

                                      {/* Amount Input with Plus/Minus */}
                                      <div>
                                        <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-[0.15em] mb-2.5">Input Manual</label>
                                        <div className="flex items-center gap-2">
                                          <div className="relative flex-1 group">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                              <span className="text-slate-400 font-medium text-sm">Rp</span>
                                            </div>
                                            <input
                                              type="text"
                                              value={quickAmount}
                                              onChange={(e) => setQuickAmount(formatCurrencyForm(e.target.value))}
                                              onFocus={() => { if(nominals.includes(quickAmount)) setQuickAmount("") }}
                                              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none text-sm font-serif text-slate-900 dark:text-white transition-all shadow-inner"
                                              placeholder="0"
                                            />
                                          </div>
                                          <div className="flex flex-col gap-0.5 bg-slate-50 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
                                            <button 
                                              onClick={handleIncrement}
                                              className="w-6 h-6 rounded-lg bg-white dark:bg-slate-700 text-slate-900 flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                                            >
                                              <Plus className="w-3 h-3" />
                                            </button>
                                            <button 
                                              onClick={handleDecrement}
                                              className="w-6 h-6 rounded-lg bg-white dark:bg-slate-700 text-slate-900 flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                                            >
                                              <Minus className="w-3 h-3" />
                                          </button>
                                        </div>
                                      </div>
                                    </div>

                                      <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 text-right">
                                        <button 
                                          onClick={() => handleAction('cart')}
                                          className="flex-none w-12 h-12 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white flex items-center justify-center rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all border border-slate-200 dark:border-slate-700"
                                        >
                                          <ShoppingBag className="w-5 h-5" />
                                        </button>
                                        
                                        <button 
                                          onClick={() => handleAction('donate')}
                                          className="flex-1 h-12 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-[11px] uppercase tracking-widest rounded-xl shadow-md hover:shadow-lg hover:shadow-amber-500/20 hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-2"
                                        >
                                          Lanjut Donasi <ChevronRight className="w-4 h-4 text-white/70" />
                                        </button>
                                      </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="md:col-span-5 space-y-6">
                            <div className="bg-slate-900 rounded-[2rem] p-6 text-white relative overflow-hidden border border-slate-800 shadow-lg w-full">
                               <div className="relative z-10 space-y-6">
                                  <div className="flex items-center gap-4">
                                     <div className="w-12 h-12 rounded-full border border-amber-500/30 p-1">
                                        <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center">
                                           <Users className="w-5 h-5 text-amber-500" />
                                        </div>
                                     </div>
                                     <div>
                                        <p className="text-[9px] font-bold text-amber-300 uppercase tracking-[0.15em] mb-0.5">Imam Utama</p>
                                        <p className="text-lg font-serif text-white">{selectedMosque.imam}</p>
                                     </div>
                                  </div>
                                  
                                  <div className="space-y-3">
                                     <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em]">Khatib Jumat Bulan Ini</p>
                                     <div className="grid gap-2">
                                        {selectedMosque.khatibs.map((khatib: any, i: number) => (
                                           <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10 backdrop-blur-md">
                                              <span className="text-[11px] font-medium text-slate-200">{khatib.name}</span>
                                              <span className="text-[8px] font-bold text-slate-900 bg-amber-500 px-2.5 py-1 rounded-md uppercase tracking-widest">{khatib.date}</span>
                                           </div>
                                        ))}
                                     </div>
                                  </div>
                               </div>
                               <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-amber-500/10 blur-[60px] rounded-full" />
                            </div>
                            
                            {selectedMosque.campaigns.length > 0 && (
                               <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 text-slate-900 dark:text-white relative overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md cursor-pointer group" onClick={() => setActiveTab('campaigns')}>
                                  <div className="flex justify-between items-center mb-4">
                                     <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.15em] flex items-center gap-1.5"><Wallet className="w-3.5 h-3.5 text-emerald-500"/> Program Terbuka</p>
                                     <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                                  </div>
                                  <div className="flex gap-4 items-center">
                                     <div className="w-16 h-16 rounded-[1rem] overflow-hidden shrink-0 shadow-inner">
                                        <img src={selectedMosque.campaigns[0].image} className="w-full h-full object-cover" />
                                     </div>
                                     <div className="flex-1">
                                        <h4 className="text-[13px] font-serif leading-snug line-clamp-2 mb-2 group-hover:text-amber-600 transition-colors">{selectedMosque.campaigns[0].title}</h4>
                                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                           <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, (selectedMosque.campaigns[0].collected / selectedMosque.campaigns[0].target)*100)}%` }} />
                                        </div>
                                     </div>
                                  </div>
                               </div>
                            )}
                            </div>
                          </div>

                          <div className="pt-8 border-t border-slate-200 dark:border-slate-800/50">
                             <h4 className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.15em] mb-6">Fasilitas Masjid</h4>
                             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {selectedMosque.facilities.map((fac: string, i: number) => (
                                   <div key={i} className="flex flex-col items-center text-center gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800/50 shadow-sm transition-all hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md group">
                                      <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-slate-800 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:bg-amber-100 dark:group-hover:bg-slate-700 transition-all">
                                         <Sparkles className="w-4 h-4" />
                                      </div>
                                      <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{fac}</span>
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
                          className="grid grid-cols-1 md:grid-cols-2 gap-4"
                        >
                           {selectedMosque.studies.map((study: any, i: number) => (
                              <div key={i} className="bg-white dark:bg-slate-900 p-5 rounded-[1.5rem] border border-slate-200 dark:border-slate-800/50 shadow-sm hover:shadow-md transition-all group relative">
                                 <div className="flex justify-between items-start mb-4">
                                    <div className="w-10 h-10 rounded-[1rem] bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 font-serif flex items-center justify-center text-lg transition-all group-hover:bg-slate-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-slate-900">
                                       {i + 1}
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                       <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-md text-[8px] md:text-[9px] font-bold uppercase tracking-[0.15em]">{study.date}</span>
                                       <span className="text-slate-500 text-[9px] uppercase font-bold tracking-widest">{study.time}</span>
                                    </div>
                                 </div>
                                 <h3 className="text-lg font-serif text-slate-900 dark:text-white mb-4 leading-tight">{study.title}</h3>
                                 <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-slate-800 flex items-center justify-center shadow-sm">
                                       <Users className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <div>
                                       <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Pemateri</p>
                                       <p className="text-xs font-medium text-slate-800 dark:text-slate-200">{study.speaker}</p>
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
                               <div key={camp.id} className="group grid lg:grid-cols-12 items-stretch bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-200 dark:border-slate-800/50 overflow-hidden shadow-sm hover:shadow-md transition-all">
                                  <div className="lg:col-span-4 h-48 lg:h-auto relative overflow-hidden">
                                     <img src={camp.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                     <div className="absolute inset-0 bg-slate-900/10 transition-opacity group-hover:opacity-0" />
                                     <div className="absolute top-4 left-4">
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/80 backdrop-blur-md text-white rounded-lg text-[8px] md:text-[9px] font-bold uppercase tracking-widest">
                                           <div className="w-1 h-1 bg-amber-400 rounded-full animate-pulse" /> Mendesak
                                        </div>
                                     </div>
                                  </div>
                                  <div className="lg:col-span-8 p-6 md:p-8 flex flex-col justify-between space-y-4">
                                     <div>
                                        <h4 className="text-xl font-serif text-slate-900 dark:text-white mb-4 leading-tight group-hover:text-amber-600 transition-colors">{camp.title}</h4>
                                        <div className="grid grid-cols-2 gap-4 mb-3">
                                           <div>
                                              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.15em] mb-1">Terkumpul</p>
                                              <p className="text-lg font-serif text-slate-900 dark:text-white">Rp {formatCurrencyForm(camp.collected.toString())}</p>
                                           </div>
                                           <div className="text-right">
                                              <p className="text-[9px] font-bold text-amber-600 uppercase tracking-[0.15em] mb-1">Capaian</p>
                                              <p className="text-lg font-serif text-amber-600">{progress.toFixed(0)}%</p>
                                           </div>
                                        </div>
                                        <div className="relative h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full mb-1 overflow-hidden shadow-inner">
                                           <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full bg-amber-500 rounded-full" />
                                        </div>
                                     </div>
                                     <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Kekurangan: Rp {formatCurrencyForm((camp.target - camp.collected).toString())}</span>
                                        <button className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl text-[9px] uppercase tracking-[0.15em] shadow-sm active:scale-95 flex items-center justify-center gap-2 hover:bg-slate-800 transition-all">
                                           Tunaikan Sedekah <ArrowRight className="w-3 h-3 text-emerald-400" />
                                        </button>
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
                          className="space-y-6 md:space-y-8"
                        >
                           <div className="bg-slate-900 rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 text-white relative overflow-hidden border border-slate-800 shadow-lg">
                              <div className="relative z-10">
                                 <h3 className="text-xl md:text-2xl font-serif mb-2">Statistik Kas Masjid</h3>
                                 <p className="text-slate-400 text-[9px] font-bold uppercase tracking-[0.15em] mb-6">Histori 6 Bulan Terakhir</p>
                                 <div className="h-[200px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                       <AreaChart data={selectedMosque.impactData.growth}>
                                          <defs>
                                             <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                                             </linearGradient>
                                          </defs>
                                          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'serif' }} />
                                          <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '15px', padding: '10px 15px', color: '#fff', fontSize: '12px' }} separator=": Rp " />
                                          <Area type="monotone" dataKey="amount" stroke="#f59e0b" strokeWidth={2} fill="url(#areaGrad)" />
                                       </AreaChart>
                                    </ResponsiveContainer>
                                 </div>
                              </div>
                              <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 blur-[60px] rounded-full" />
                           </div>

                           <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                              <div className="p-6 md:p-8 bg-white dark:bg-slate-900 rounded-[1.5rem] md:rounded-[2rem] border border-slate-200 dark:border-slate-800/50 shadow-sm">
                                 <h4 className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.15em] mb-6">Penyaluran Dana</h4>
                                 <div className="h-[200px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                       <BarChart data={selectedMosque.impactData.disbursement}>
                                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'serif' }} />
                                          <RechartsTooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '12px' }} />
                                          <Bar dataKey="value" fill="#0f172a" radius={[8, 8, 0, 0]} barSize={24} />
                                       </BarChart>
                                    </ResponsiveContainer>
                                 </div>
                              </div>
                              <div className="p-6 md:p-8 bg-white dark:bg-slate-900 rounded-[1.5rem] md:rounded-[2rem] border border-slate-200 dark:border-slate-800/50 shadow-sm">
                                 <h4 className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.15em] mb-6 text-center">Penerima Manfaat</h4>
                                 <div className="h-[200px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                       <PieChart>
                                          <Pie data={selectedMosque.impactData.demographics} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                                             {selectedMosque.impactData.demographics.map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={["#0f172a", "#f59e0b", "#64748b", "#cbd5e1"][index % 4]} stroke="none" />
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
                          className="space-y-8"
                        >
                           <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
                              <div className="text-center md:text-left">
                                 <h3 className="text-2xl font-serif text-slate-900 dark:text-white mb-1.5 flex items-center justify-center md:justify-start gap-3">
                                    <Sparkles className="w-6 h-6 text-amber-500" /> Data Pequrban
                                 </h3>
                                 <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[8px] md:text-[9px]">Tahun 1447 Hijriah</p>
                              </div>
                              <div className="px-5 py-2.5 bg-slate-900 text-white rounded-xl shadow-md font-bold text-[9px] uppercase tracking-[0.15em]">
                                 {selectedMosque.qurbanDonors.length} Donatur Qurban
                              </div>
                           </div>

                           <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                              {selectedMosque.qurbanDonors.map((donor: any, i: number) => (
                                 <div key={i} className="group bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-500 dark:hover:border-slate-400 transition-all hover:shadow-sm">
                                    <p className="text-[8px] md:text-[9px] font-bold text-amber-600 uppercase mb-1.5 tracking-[0.15em]">{donor.type}</p>
                                    <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">{donor.name}</p>
                                 </div>
                              ))}
                           </div>
                           
                           <div className="p-6 md:p-8 bg-slate-50 dark:bg-slate-900 rounded-[1.5rem] md:rounded-[2rem] border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
                              <div>
                                 <h4 className="text-xl font-serif text-slate-900 dark:text-white mb-1">Daftar Pequrban?</h4>
                                 <p className="text-slate-500 text-[8px] md:text-[9px] font-bold uppercase tracking-[0.15em]">Tersedia kuota terbatas Idul Adha 1447H</p>
                              </div>
                              <button className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-[9px] uppercase tracking-[0.15em] shadow-md hover:-translate-y-0.5 active:scale-95 transition-all">
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
