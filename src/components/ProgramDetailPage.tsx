import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Info, Users, Clock, ArrowRight, Share2, UserCircle, ShoppingBag, Heart } from 'lucide-react';
import { EXTENDED_PROGRAMS, Program } from '../App';

const formatCurrencyForm = (val: string) => {
  if (!val) return '';
  const numberString = val.replace(/\D/g, '');
  if (!numberString) return '';
  return new Intl.NumberFormat('id-ID').format(Number(numberString)).replace(/,/g, '.');
};

export const ProgramDetailPage = ({ 
  onQuickDonate, 
  onAddToCart,
  cartItemCount = 0,
  onOpenCart
}: { 
  onQuickDonate: (p: Program, amt: string) => void;
  onAddToCart: (p: Program, amt: string) => void;
  cartItemCount?: number;
  onOpenCart?: () => void;
}) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const program = EXTENDED_PROGRAMS.find(p => p.id === Number(id));

  const [activeTab, setActiveTab] = useState('tentang');
  const [localDonationAmount, setLocalDonationAmount] = useState('50.000');

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrencyForm(e.target.value);
    setLocalDonationAmount(formatted);
  };
  
  // Animation for recent donors in this program tab
  const [donaturList, setDonaturList] = useState([
    { id: 1, name: "Ahmad Rizal", action: "berdonasi Rp 100.000", time: "Baru saja" },
    { id: 2, name: "Keluarga Haris", action: "berdonasi Rp 250.000", time: "1 menit yang lalu" },
    { id: 3, name: "Hamba Allah", action: "berdonasi Rp 10.000", time: "3 menit yang lalu" },
  ]);

  useEffect(() => {
    const NAMES = ["Budi S.", "Keluarga Yanto", "Siti Aisyah", "Dian P.", "Hamba Allah", "Rizky Firmansyah", "Andi T.", "Ibu Rina"];
    const AMOUNTS = ["Rp 25.000", "Rp 50.000", "Rp 100.000", "Rp 500.000", "Rp 1.000.000", "Rp 150.000"];
    
    const intervalTimer = setInterval(() => {
      setDonaturList(prev => {
        const newDonatur = {
          id: Date.now(),
          name: NAMES[Math.floor(Math.random() * NAMES.length)],
          action: `berdonasi ${AMOUNTS[Math.floor(Math.random() * AMOUNTS.length)]}`,
          time: "Baru saja"
        };
        const updatedList = [newDonatur, ...prev].map((d, index) => {
          if (index > 0 && d.time === "Baru saja") return { ...d, time: "1 menit yang lalu" };
          if (index > 1 && d.time === "1 menit yang lalu") return { ...d, time: "3 menit yang lalu" };
          return d;
        });
        return updatedList.slice(0, 5); // Keep max 5
      });
    }, 6000);

    return () => clearInterval(intervalTimer);
  }, []);


  if (!program) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Program Tidak Ditemukan</h2>
          <p className="text-slate-500 mb-6">Program yang Anda cari tidak tersedia atau telah dihapus.</p>
          <button 
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-[#1799dc] text-white rounded-full font-bold hover:bg-[#1588c4] transition-colors"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  const progressPercentage = Math.min((program.collected / program.target) * 100, 100);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 flex justify-center overflow-x-hidden">
      <div className="w-full min-w-0 max-w-[480px] relative bg-white dark:bg-slate-900 shadow-2xl md:border-x border-slate-200 dark:border-slate-800 flex flex-col pb-36 md:pb-40 min-h-screen overflow-x-hidden">
      {/* Floating Header Actions */}
      <div 
        className="absolute top-0 left-0 right-0 z-50 transition-all duration-300 pointer-events-none px-4 md:px-6 flex justify-between"
        style={{ paddingTop: 'calc(1.5rem + env(safe-area-inset-top, 0px))' }}
      >
        <button 
          onClick={() => {
            navigate('/donasi');
            window.scrollTo(0,0);
          }}
          className="pointer-events-auto w-10 h-10 md:w-11 md:h-11 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/50 transition-all border border-white/20 shadow-sm hover:scale-105 active:scale-95"
        >
          <ChevronLeft className="w-6 h-6 md:w-7 md:h-7 pr-0.5" />
        </button>
        
        <div className="flex gap-2">
          {/* Cart Button */}
          <button 
            onClick={onOpenCart}
            className="pointer-events-auto w-10 h-10 md:w-11 md:h-11 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/50 transition-all border border-white/20 shadow-sm relative hover:scale-105 active:scale-95"
          >
            <ShoppingBag className="w-5 h-5 md:w-5 md:h-5" />
            {cartItemCount && cartItemCount > 0 ? (
              <span className="absolute -top-1 -right-1 bg-[#1799dc] text-white text-[10px] w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center font-bold shadow-sm">
                {cartItemCount}
              </span>
            ) : null}
          </button>
          
          {/* Share Button */}
          <button 
            onClick={async () => {
              if (navigator.share) {
                try {
                  await navigator.share({
                    title: program.title,
                    text: program.description,
                    url: window.location.href,
                  });
                } catch (error) {
                  console.log('Error sharing', error);
                }
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert("Link berhasil disalin!");
              }
            }}
            className="pointer-events-auto w-10 h-10 md:w-11 md:h-11 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/50 transition-all border border-white/20 shadow-sm hover:scale-105 active:scale-95"
          >
            <Share2 className="w-5 h-5 md:w-5 md:h-5 pr-0.5" />
          </button>
        </div>
      </div>

      {/* Header Image Section */}
      <div className="relative h-[45vh] md:h-[55vh] w-full bg-slate-200 shrink-0">

        {program.video ? (
          <video 
            src={program.video}
            autoPlay
            loop
            muted
            playsInline
            poster={program.image}
            className="w-full h-full object-cover" 
          />
        ) : (
          <img src={program.image} className="w-full h-full object-cover" alt={program.title} />
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90"></div>
        
        <div className="absolute bottom-24 left-4 right-4 md:left-8 md:right-8 z-10">
          <div className="flex gap-2 mb-3">
             <div className="bg-[#1799dc] text-white text-[10px] font-bold px-2.5 py-1 rounded-sm uppercase tracking-wider">
               {program.category.toUpperCase()}
             </div>
             {program.urgent && (
               <div className="bg-red-500/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-sm shadow-sm uppercase tracking-wider items-center flex gap-1">
                 <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span> MENDESAK
               </div>
             )}
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold text-white leading-tight drop-shadow-md">
            {program.title}
          </h1>
        </div>
      </div>

      {/* Floating Donatur Transaction Animation (Removed) */}

      <div className="w-full min-w-0 max-w-full mx-auto px-4 mt-6">
        {/* Premium Animated Progress & Stats Box */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          className="relative z-30 -mt-12 mb-6 px-4"
        >
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl p-4 md:p-5 shadow-[0_15px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_15px_40px_rgba(0,0,0,0.4)] border border-white dark:border-slate-700/50 overflow-hidden relative">
            {/* Background glowing decorations */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#1799dc]/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#f29f05]/10 rounded-full blur-3xl pointer-events-none"></div>
            
            {/* Header info */}
            <div className="flex justify-between items-center mb-4 relative z-10 border-b border-slate-100 dark:border-slate-800/50 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-slate-800 flex items-center justify-center">
                  <Heart className="w-4 h-4 text-[#1799dc]" style={{ animation: 'glow-pulse 2s ease-in-out infinite' }} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] md:text-sm font-extrabold text-slate-800 dark:text-slate-200 tracking-tight leading-tight">Jejak Kebaikan</span>
                  <span className="text-[9px] md:text-[10px] font-medium text-[#1799dc] dark:text-blue-400">Setiap rupiah menjadi saksi amal Anda</span>
                </div>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-md border border-emerald-100 dark:border-emerald-800/50 flex items-center gap-1 shadow-sm">
                 <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
                 <span className="text-[8px] md:text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Amanah</span>
              </div>
            </div>
            
            {/* Main amounts with animated text and Infographic */}
            <div className="flex justify-between items-center mb-5 relative z-10 px-1">
              <div className="flex flex-col">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.5 }}
                  className="flex items-start gap-1 mb-1"
                >
                  <span className="text-sm md:text-base text-[#1799dc] font-black mt-1">Rp</span>
                  <span className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white tracking-tighter" style={{ backgroundImage: 'linear-gradient(90deg, #1799dc, #2db2f5, #1799dc)', backgroundSize: '200% auto', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'text-shimmer 3s linear infinite' }}>
                    {new Intl.NumberFormat('id-ID').format(program.collected)}
                  </span>
                </motion.div>
                <motion.span 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                  className="text-[10px] md:text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-md inline-block w-fit mt-0.5"
                >
                  Ikhtiar Bersama: <strong className="text-slate-700 dark:text-slate-300 font-bold">Rp {new Intl.NumberFormat('id-ID').format(program.target)}</strong>
                </motion.span>
              </div>

              {/* Circular Progress Infographic Diagram */}
              <motion.div 
                initial={{ scale: 0, y: 15 }}
                animate={{ scale: 1, y: [0, -4, 0] }}
                transition={{ 
                  scale: { duration: 0.8, type: "spring", delay: 0.3 },
                  y: { repeat: Infinity, duration: 4, ease: "easeInOut", delay: 1 }
                }}
                className="relative w-[60px] h-[60px] md:w-[70px] md:h-[70px] shrink-0"
              >
                {/* Breathing Glowing Aura */}
                <motion.div 
                  className="absolute inset-0 rounded-full bg-[#1799dc]/30 blur-md"
                  animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0.8, 0.4] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                />
                <svg className="w-full h-full -rotate-90 relative z-10" viewBox="0 0 36 36">
                  {/* Background Track */}
                  <path
                    className="text-white dark:text-slate-800"
                    strokeWidth="3"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Animated Progress Ring */}
                  <motion.path
                    className="text-[#1799dc]"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    initial={{ strokeDasharray: "0, 100" }}
                    animate={{ strokeDasharray: `${progressPercentage}, 100` }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    style={{ filter: 'drop-shadow(0px 0px 3px rgba(23,153,220,0.6))' }}
                  />
                </svg>
                {/* Center Percentage */}
                <div className="absolute inset-0 flex items-center justify-center flex-col rotate-0 z-20">
                  <span className="text-xs md:text-sm font-black text-[#1799dc] drop-shadow-sm">{Math.round(progressPercentage)}%</span>
                </div>
              </motion.div>
            </div>
            
            {/* Grid Stats (Compact Horizontal Layout) */}
            <div className="grid grid-cols-2 gap-3 relative z-10">
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                whileHover={{ scale: 1.02, y: -2 }}
                className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-2.5 md:p-3 border border-slate-100 dark:border-slate-700/50 shadow-sm flex items-center gap-2.5 transition-all cursor-default"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100/50 dark:bg-slate-700 flex items-center justify-center shrink-0">
                  <Users className="w-3.5 h-3.5 text-[#1799dc]" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="block text-[8px] md:text-[9px] text-[#1799dc] font-bold uppercase tracking-wider mb-0.5">Pahlawan Kebaikan</span>
                  <span className="font-black text-xs md:text-sm text-slate-800 dark:text-white leading-none truncate block">
                    {program.donors} <span className="text-[8px] font-medium text-slate-400 lowercase">orang</span>
                  </span>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
                whileHover={{ scale: 1.02, y: -2 }}
                className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-2.5 md:p-3 border border-slate-100 dark:border-slate-700/50 shadow-sm flex items-center gap-2.5 transition-all cursor-default"
              >
                <div className="w-8 h-8 rounded-full bg-orange-100/50 dark:bg-slate-700 flex items-center justify-center shrink-0">
                  <Clock className="w-3.5 h-3.5 text-[#f29f05]" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="block text-[8px] md:text-[9px] text-[#f29f05] font-bold uppercase tracking-wider mb-0.5">Peluang Beramal</span>
                  <span className="font-black text-xs md:text-sm text-slate-800 dark:text-white leading-none truncate block">
                    90 <span className="text-[8px] font-medium text-slate-400 lowercase">hari</span>
                  </span>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Content Tabs */}
        <div className="flex w-full gap-4 md:gap-6 border-b border-slate-200 dark:border-slate-700 mb-6 overflow-x-auto hide-scrollbar">
           {['tentang', 'kabar', 'donatur'].map(tab => (
             <button
               key={tab}
               onClick={() => setActiveTab(tab)}
               className={`pb-3 font-semibold text-sm capitalize whitespace-nowrap shrink-0 transition-colors relative ${
                 activeTab === tab 
                 ? 'text-[#1799dc]' 
                 : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
               }`}
             >
               {tab === 'tentang' ? 'Tentang Program' : tab === 'kabar' ? 'Kabar Terbaru' : 'Donatur Terbaru'}
               {activeTab === tab && (
                 <motion.div layoutId="detail-tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1799dc] rounded-t-full" />
               )}
             </button>
           ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[40vh]">
          {activeTab === 'tentang' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-6">
              <div className="prose prose-slate dark:prose-invert max-w-none text-sm md:text-base leading-relaxed text-slate-700 dark:text-slate-300">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 italic text-slate-600 dark:text-slate-400 mb-6 text-center text-sm shadow-sm">
                  "Sesungguhnya kami memberi makanan kepadamu hanyalah untuk mengharapkan keridhaan Allah..."
                </div>
                
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                  <Info className="w-5 h-5 text-[#1799dc]" /> Tentang Program
                </h3>
                
                <p>
                  {program.description}
                </p>

                <p className="mt-4">
                  Kondisi geografis yang menantang dan infrastruktur yang terbatas seringkali menjadi penghalang bagi masuknya bantuan secara merata. Oleh karena itu, tim relawan lapangan kami telah memetakan dengan cermat titik-titik krusial yang paling membutuhkan. Mereka adalah keluarga prasejahtera, janda rentah, anak yatim dhuafa, kaum disabilitas, hingga para santri di pelosok negeri.
                </p>
                
                <img 
                  src={program.image} 
                  alt="Ilustrasi program" 
                  className="w-full h-[200px] object-cover rounded-xl my-6" 
                />
                
                <p>
                  Setiap donasi yang Anda berikan adalah wujud nyata kepedulian yang sanggup merubah hidup mereka. Mari kita ciptakan perubahan positif bersama, memberikan secercah harapan di tengah keterbatasan mereka.
                </p>
                
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3 mt-8">
                  <div className="w-5 h-5 rounded-full border-2 border-[#1799dc] flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-[#1799dc]"></div>
                  </div> 
                  Spesifikasi Program
                </h3>
                <ul className="list-disc pl-5 space-y-2 mt-4 marker:text-[#1799dc]">
                  <li>Bantuan didistribusikan ke daerah prioritas 3T (Tertinggal, Terdepan, dan Terluar).</li>
                  <li>Monitoring dan pelaporan secara berkala kepada para donatur melalui sistem online.</li>
                  <li>Laporan akan dikirim via email/WA donatur.</li>
                </ul>

                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3 mt-8">
                  <Users className="w-5 h-5 text-green-500" /> Penerima Manfaat
                </h3>
                <ul className="list-disc pl-5 space-y-2 mt-4 marker:text-green-500 mb-8">
                  <li>Masyarakat prasejahtera di <strong>Berbagai Pelosok Nusantara</strong>.</li>
                  <li>Santri di pelosok / daerah minim donatur.</li>
                  <li>Keluarga yatim & dhuafa setempat.</li>
                </ul>
                
                {/* Penggerak Kebaikan Section */}
                <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-700/50">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-lg">
                      Penggerak Kebaikan
                    </h3>
                    <button className="text-xs font-semibold text-[#1799dc] hover:underline">8 Fundraiser</button>
                  </div>
                  
                  <div className="flex overflow-x-auto hide-scrollbar gap-3 pb-2 -mx-4 px-4 md:mx-0 md:px-0">
                    {[
                      { name: 'Ust. Abdul Somad', amt: '25 Ekor', percent: 83, img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=64&h=64' },
                      { name: 'Relawan Beraksi', amt: '45 Ekor', percent: 90, img: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=64&h=64' },
                      { name: 'Penyalur Daerah', amt: '15 Ekor', percent: 100, img: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=64&h=64' }
                    ].map((fr, idx) => (
                      <div key={idx} className="min-w-[140px] bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-3 rounded-xl shadow-sm hover:shadow-md transition-shadow shrink-0">
                        <div className="flex items-center gap-2 mb-2">
                           <img src={fr.img} alt={fr.name} className="w-8 h-8 rounded-full object-cover" />
                           <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-tight line-clamp-2">{fr.name}</p>
                        </div>
                        <div className="flex justify-between text-[10px] items-end mb-1 mt-3">
                           <span className="text-slate-500 font-medium">{fr.amt}</span>
                           <span className="text-[#1799dc] font-bold">{fr.percent}%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                           <div className="bg-[#1799dc] h-full rounded-full" style={{ width: `${fr.percent}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'kabar' && (
             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
               {[1, 2].map((i) => (
                  <div key={i} className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-xl p-4 flex gap-4">
                    <img src={program.image} className="w-20 h-20 rounded-lg object-cover" alt="Update" />
                    <div>
                      <div className="text-[10px] uppercase font-bold text-[#1799dc] tracking-wider mb-1">
                        {i === 1 ? 'Update Terbaru' : 'Berita'}
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1 leading-tight">
                        Penyaluran Tahap {i} Terselesaikan
                      </h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1.5">
                        <Clock className="w-3 h-3" /> {i * 2} hari lalu
                      </p>
                    </div>
                  </div>
               ))}
               <button className="w-full py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                 Lihat Semua Kabar
               </button>
             </motion.div>
          )}

          {activeTab === 'donatur' && (
             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
               <AnimatePresence mode="popLayout">
                 {donaturList.map((donor) => (
                    <motion.div 
                      key={donor.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9, y: -20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 20 }}
                      transition={{ duration: 0.4, type: "spring" }}
                      className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-xl p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center text-green-500 font-bold shrink-0">
                          {donor.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                            {donor.name}
                          </h4>
                          <p className="text-xs text-slate-500">{donor.action}</p>
                        </div>
                      </div>
                      <span className="text-xs text-slate-400 bg-slate-50 dark:bg-slate-700 px-2 py-1 rounded">{donor.time}</span>
                    </motion.div>
                 ))}
               </AnimatePresence>
               <button className="w-full py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                 Lihat Semua Donatur
               </button>
             </motion.div>
          )}
        </div>
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-800/50 p-3 px-4 z-[100] shadow-[0_-5px_30px_rgba(0,0,0,0.08)]" style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}>
        <div className="w-full mx-auto flex flex-col gap-3">
          <div className="flex justify-between items-center gap-1.5 sm:gap-2">
            {[ '50.000', '100.000'].map(amt => (
                <button
                    key={amt}
                    onClick={() => setLocalDonationAmount(amt)}
                    className={`flex-1 py-1.5 px-0.5 sm:px-1 text-[11px] sm:text-xs font-bold rounded-lg border transition-all truncate ${localDonationAmount === amt ? 'border-[#1799dc] bg-[#1799dc]/10 text-[#1799dc]' : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800'}`}
                >
                    {amt}
                </button>
            ))}
            <div className="flex-[1.3] flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden focus-within:border-[#1799dc] focus-within:ring-1 focus-within:ring-[#1799dc] transition-all">
                <span className="pl-1.5 sm:pl-2 text-[10px] text-slate-400 font-bold shrink-0">Rp</span>
                <input 
                    type="text" 
                    value={localDonationAmount}
                    onChange={handleAmountChange}
                    placeholder="Lain"
                    className="w-full py-1.5 pl-1 pr-1.5 sm:pr-2 text-[11px] sm:text-xs font-bold outline-none bg-transparent text-slate-900 dark:text-white transition-all text-right min-w-0"
                />
            </div>
          </div>
          
          <div className="flex gap-2">
             <button 
                 onClick={() => onAddToCart(program, localDonationAmount)}
                 className="flex-1 py-2 px-1 sm:px-2 rounded-full border-2 border-[#1799dc] text-[#1799dc] font-bold text-[11px] sm:text-xs flex items-center justify-center gap-1 hover:bg-[#1799dc]/5 transition-colors leading-tight"
             >
                <ShoppingBag className="w-3.5 h-3.5 shrink-0" /> <span className="line-clamp-1">Titip Kebaikan</span>
             </button>
             <button 
                onClick={() => onQuickDonate(program, localDonationAmount)}
                className="flex-[1.2] bg-gradient-to-r from-[#1799dc] to-[#2db2f5] hover:from-[#1588c4] hover:to-[#22a1de] text-white font-bold py-2 px-1 sm:px-2 rounded-full transition-all shadow-md shadow-[#1799dc]/30 flex items-center justify-center gap-1 transform active:scale-95 text-[11px] sm:text-xs leading-tight"
             >
               <Heart className="w-3.5 h-3.5 fill-white shrink-0" /> <span className="line-clamp-1">Hadirkan Senyum</span>
             </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};
