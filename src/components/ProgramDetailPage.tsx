import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Info, Users, Clock, ArrowRight, Share2, UserCircle, ShoppingBag, Heart } from 'lucide-react';
import { EXTENDED_PROGRAMS, Program } from '../App';

import { DaiInteractive } from './DaiInteractive';
import { MasjidInteractive } from './MasjidInteractive';
import { SumurInteractive } from './SumurInteractive';
import { PendidikanInteractive } from './PendidikanInteractive';
import { QuranInteractive } from './QuranInteractive';
import { PanganInteractive } from './PanganInteractive';
import { PohonKebaikanInteractive } from './PohonKebaikanInteractive';

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
      <div className="relative h-[40vh] md:h-[50vh] w-full bg-slate-200 shrink-0">

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
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
        
        <div className="absolute bottom-6 left-4 right-4 md:left-8 md:right-8 z-10">
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
        {/* Progress Bar & Stats */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 md:p-6 shadow-sm border border-slate-100 dark:border-slate-700/50 mb-6 relative z-30 -mt-10">
           <div className="flex justify-between items-center mb-3">
             <span className="text-sm font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
               <Info className="w-4 h-4 text-[#1799dc]" /> Kebaikan Terkumpul
             </span>
             <span className="text-[#1799dc] font-black text-lg">{Math.round(progressPercentage)}% Terisi</span>
           </div>
           
           <div className="w-full bg-slate-100 dark:bg-slate-700/50 rounded-full h-3 mb-4 overflow-hidden shadow-inner">
             <div 
               className="bg-[#1799dc] h-full rounded-full relative overflow-hidden" 
               style={{ width: `${progressPercentage}%` }}
             >
               <div className="absolute top-0 bottom-0 left-0 right-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-[progress_1s_linear_infinite]"></div>
             </div>
           </div>
           
           <div className="flex justify-between items-center text-sm gap-2 mt-1">
             <div className="min-w-0">
               <span className="text-slate-500 dark:text-slate-400 block text-xs truncate">Terkumpul</span>
               <span className="font-bold text-slate-800 dark:text-white text-sm md:text-base truncate block">Rp {new Intl.NumberFormat('id-ID').format(program.collected)}</span>
             </div>
             <div className="text-right min-w-0">
               <span className="text-slate-500 dark:text-slate-400 block text-xs truncate">Target</span>
               <span className="font-bold text-slate-800 dark:text-white text-sm md:text-base truncate block">Rp {new Intl.NumberFormat('id-ID').format(program.target)}</span>
             </div>
           </div>
           
           <div className="border-t border-slate-100 dark:border-slate-700 mt-4 pt-4 flex flex-wrap gap-4">
              <div className="flex items-center gap-2 min-w-[120px]">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-[#1799dc] flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="block text-xs text-slate-500 font-medium truncate">Donatur</span>
                  <span className="font-bold text-sm text-slate-800 dark:text-white truncate block">{program.donors} Orang</span>
                </div>
              </div>
              <div className="flex items-center gap-2 min-w-[120px]">
                <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="block text-xs text-slate-500 font-medium truncate">Sisa Waktu</span>
                  <span className="font-bold text-sm text-slate-800 dark:text-white truncate block">90 Hari</span>
                </div>
              </div>
           </div>
        </div>

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

                {/* Interactive Simulasi Kebaikan Component */}
                <div className="my-8 -mx-4 md:mx-0">
                  {program.title.toLowerCase().includes('masjid') ? (
                    <MasjidInteractive onAddToCart={onAddToCart} />
                  ) : program.title.toLowerCase().includes('air') || program.title.toLowerCase().includes('sumur') ? (
                    <SumurInteractive onAddToCart={onAddToCart} />
                  ) : program.title.toLowerCase().includes('quran') || program.title.toLowerCase().includes('qur\'an') ? (
                    <QuranInteractive onAddToCart={onAddToCart} />
                  ) : program.title.toLowerCase().includes('pangan') || program.title.toLowerCase().includes('makanan') ? (
                    <PanganInteractive onAddToCart={onAddToCart} />
                  ) : program.title.toLowerCase().includes('beasiswa') || program.title.toLowerCase().includes('pendidikan') ? (
                    <PendidikanInteractive onAddToCart={onAddToCart} />
                  ) : program.title.toLowerCase().includes('dai') || program.title.toLowerCase().includes('dakwah') ? (
                    <DaiInteractive onAddToCart={onAddToCart} />
                  ) : (
                    <PohonKebaikanInteractive totalDonation={program.collected} />
                  )}
                </div>

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
