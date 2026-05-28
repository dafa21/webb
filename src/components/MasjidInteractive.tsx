import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Plus, Minus, Home, Grid, Layers, Package, Cuboid, Box, ArrowUp } from 'lucide-react';
import { Program } from '../App';

interface MasjidInteractiveProps {
  onAddToCart: (program: Program, amount: string) => void;
}

const ITEMS = [
  { id: 'semen', name: 'Semen', price: 50000, icon: Package, color: 'text-slate-500', bg: 'bg-slate-100 dark:bg-slate-800' },
  { id: 'bata', name: 'Batu Bata', price: 100000, icon: Grid, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30' },
  { id: 'keramik', name: 'Keramik', price: 150000, icon: Box, color: 'text-sky-500', bg: 'bg-sky-100 dark:bg-sky-900/30' },
  { id: 'karpet', name: 'Karpet', price: 200000, icon: Layers, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
];

const SEMEN_EMOJIS = ['🧱', '📦', '🪨', '🏗️'];
const BATA_EMOJIS = ['🧱', '🧱', '🏗️', '🏠'];
const KERAMIK_EMOJIS = ['🔲', '⬜', '🔳', '✨'];
const KARPET_EMOJIS = ['📿', '🕌', '💚', '✨'];

export const MasjidInteractive: React.FC<MasjidInteractiveProps> = ({ onAddToCart }) => {
  const [counts, setCounts] = useState<Record<string, number>>({
    semen: 0,
    bata: 0,
    keramik: 0,
    karpet: 0,
  });

  const [ripples, setRipples] = useState<{ id: number; x: number; y: number; size: number }[]>([]);

  const createRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const newRipple = {
      id: Date.now(),
      x,
      y,
      size,
    };

    setRipples(prev => [...prev, newRipple]);
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 600);
  };

  const prayers: Record<string, string[]> = {
    semen: [
      "Jazakumullahu khairan. Semoga setiap butir semen ini mengokohkan bangunan surga untuk Anda kelak. Aamiin.",
      "Barakallahu fiikum. Ya Allah, kokohkanlah iman donatur kami sebagaimana kokohnya asas masjid ini. Aamiin.",
    ],
    bata: [
      "Jazakumullahu ahsanal jaza. Semoga Allah membangunkan untuk Anda sebuah istana di surga. Aamiin.",
      "Barakallahu laka fi ahlika wa malika. Semoga setiap bata yang tersusun menjadi saksi kebaikan di hari akhir. Aamiin.",
    ],
    keramik: [
      "Allahumma barik lahum. Semoga Allah melapangkan rezeki Anda seluas hamparan keramik masjid ini. Aamiin.",
      "Jazakumullahu khairan. Semoga tempat sujud ini menjadi saksi ketakwaan Anda di hadapan Allah. Aamiin.",
    ],
    karpet: [
      "Barakallahu fiikum. Ya Allah, berikanlah kenyamanan di dunia dan akhirat bagi hamba-Mu yang dermawan ini. Aamiin.",
      "Jazakumullahu jannatal firdaus. Semoga setiap doa yang dipanjatkan di atas sajadah ini, mengalirkan pahala jariyah untuk Anda. Aamiin.",
    ],
  };

  const playPrayer = (id: string, currentCount: number) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const list = prayers[id];
      const prayerText = list[currentCount % list.length];
      const utterance = new SpeechSynthesisUtterance(prayerText);
      utterance.lang = 'id-ID';
      utterance.rate = 0.85;
      utterance.pitch = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  const updateCount = (id: string, delta: number) => {
    if (delta > 0) {
      playPrayer(id, counts[id]);
    }
    setCounts(prev => ({
      ...prev,
      [id]: Math.max(0, prev[id] + delta)
    }));
  };

  const totalAmount = ITEMS.reduce((sum, item) => sum + (counts[item.id] * item.price), 0);

  const handleAdd = () => {
    if (totalAmount <= 0) return;
    
    const program: Program = {
      id: 9998,
      title: "Bangun Masjid Pelosok",
      category: "Infrastruktur",
      description: "Dukungan pembangunan masjid di daerah pedalaman agar masyarakat bisa beribadah dengan nyaman.",
      image: "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&q=80&w=800",
      collected: 150000000,
      target: 500000000,
      donors: 320
    };

    onAddToCart(program, totalAmount.toString());
    
    setCounts({
      semen: 0,
      bata: 0,
      keramik: 0,
      karpet: 0,
    });
  };

  return (
    <div className="w-full max-w-xl mx-auto py-10 px-4 md:px-8 bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 dark:border-slate-700/50 text-center relative my-12 overflow-hidden snap-center shrink-0">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -z-10 -translate-x-1/2 translate-y-1/2"></div>

      <div className="mb-10 text-center flex flex-col items-center w-full">
        <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 font-bold px-3 py-1 text-[10px] md:text-xs rounded-full uppercase tracking-widest mb-3">Rumah Allah di Pelosok</span>
        <h2 className="text-2xl md:text-3xl font-serif font-black text-slate-900 dark:text-white mb-3">Bangun Masjid Huda</h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm max-w-sm mb-6">Mari alirkan pahala tiada henti dengan membangun tempat sujud bagi saudara kita di pedalaman.</p>
        
        {/* Progress Bar Donasi */}
        <div className="w-full max-w-[280px] bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50">
          <div className="flex justify-between items-end mb-2.5">
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              Terkumpul
            </span>
            <span className="text-sm font-black text-emerald-500">
              Rp {new Intl.NumberFormat('id-ID').format(150000000)}
            </span>
          </div>
          <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden relative shadow-inner">
            <motion.div 
              initial={{ width: 0 }}
              whileInView={{ width: '30%' }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"
            />
          </div>
          <div className="mt-2 text-right">
            <span className="text-[9px] text-slate-400">dari target Rp 500.000.000</span>
          </div>
        </div>
      </div>

      <div className="relative w-full max-w-[360px] md:max-w-[400px] mx-auto h-[320px] flex items-center justify-center mt-2 md:mt-4">
        
        {/* Center Avatar / Masjid Illustration */}
        <div className="absolute z-10 flex flex-col items-center pointer-events-none scale-[0.85] sm:scale-100">
          <div className="relative w-48 h-48 mt-4 flex items-end justify-center">
             
             {/* Base Land */}
             <div className="absolute bottom-4 w-56 h-4 bg-slate-200 dark:bg-slate-700 rounded-full z-10"></div>
             
             {/* Masjid Structure Base */}
             <div className={`absolute bottom-6 w-32 h-20 bg-[#fef0dd] border-4 border-slate-800 rounded-sm z-20 flex flex-col items-center justify-end overflow-hidden transition-all duration-700 ${counts.bata > 0 || counts.semen > 0 ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0'} origin-bottom`}>
                
                {/* Door */}
                <div className={`w-8 h-12 border-4 border-b-0 border-slate-800 rounded-t-full transition-all duration-700 delay-300 ${counts.bata > 0 || counts.semen > 0 ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0'} origin-bottom ${counts.karpet > 0 ? 'bg-emerald-500' : 'bg-slate-800'}`}>
                   {counts.karpet > 0 && <div className="w-full h-full bg-emerald-400/20 shadow-[inset_0_4px_10px_rgba(0,0,0,0.1)]"></div>}
                </div>
                
                {/* Windows */}
                <div className="absolute bottom-4 left-3 w-5 h-6 bg-sky-200 border-4 border-slate-800 rounded-t-full flex items-center justify-center">
                  <div className="w-full h-full pb-2 shadow-[inset_0_2px_4px_rgba(255,255,255,0.8)] rounded-t-full"></div>
                </div>
                <div className="absolute bottom-4 right-3 w-5 h-6 bg-sky-200 border-4 border-slate-800 rounded-t-full flex items-center justify-center">
                  <div className="w-full h-full pb-2 shadow-[inset_0_2px_4px_rgba(255,255,255,0.8)] rounded-t-full"></div>
                </div>

                {/* Keramik Floor detail inside when karpet is added or keramik */}
                <div className={`absolute bottom-0 w-full h-3 transition-colors duration-500 ${counts.karpet > 0 ? 'bg-emerald-600' : counts.keramik > 0 ? 'bg-slate-300 border-t-2 border-slate-400' : 'bg-slate-300 border-t-2 border-dashed border-slate-400/50'}`}></div>
             </div>

             {/* Pillar / Minaret Left */}
             <div className={`absolute bottom-6 left-2 w-6 h-28 bg-[#fdf5ed] border-4 border-slate-800 z-15 transition-all duration-700 delay-100 origin-bottom flex flex-col items-center justify-end ${counts.semen > 0 || counts.bata > 0 ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0'}`}>
                {/* Minaret Dome */}
                <div className="absolute -top-6 w-8 h-8 bg-amber-400 border-4 border-slate-800 rounded-t-full shadow-[inset_-2px_-2px_0_rgba(0,0,0,0.15)] flex items-center justify-center">
                   <div className="absolute -top-3 w-1 h-3 bg-slate-800"></div>
                   <div className="absolute -top-4 text-[6px]">🌙</div>
                </div>
             </div>

             {/* Pillar / Minaret Right */}
             <div className={`absolute bottom-6 right-2 w-6 h-28 bg-[#fdf5ed] border-4 border-slate-800 z-15 transition-all duration-700 delay-200 origin-bottom flex flex-col items-center justify-end ${counts.semen > 0 || counts.bata > 0 ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0'}`}>
                {/* Minaret Dome */}
                <div className="absolute -top-6 w-8 h-8 bg-amber-400 border-4 border-slate-800 rounded-t-full shadow-[inset_-2px_-2px_0_rgba(0,0,0,0.15)] flex items-center justify-center">
                   <div className="absolute -top-3 w-1 h-3 bg-slate-800"></div>
                   <div className="absolute -top-4 text-[6px]">🌙</div>
                </div>
             </div>

             {/* Main Dome */}
             <div className={`absolute bottom-24 w-28 h-18 bg-emerald-500 border-4 border-slate-800 rounded-t-full z-30 flex items-center justify-center shadow-[inset_-6px_-6px_0_rgba(0,0,0,0.2)] transition-all duration-700 delay-500 origin-bottom ${counts.bata > 0 && counts.semen > 0 ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0'}`}>
                {/* Dome Ornament */}
                <div className="absolute -top-8 w-2 h-8 bg-slate-800"></div>
                <div className="absolute -top-11 text-xl flex items-center justify-center font-serif font-black text-amber-400 [text-shadow:0_2px_4px_rgba(0,0,0,0.5)] z-40">
                  ☪
                </div>
                {/* Dome patterns */}
                <div className="w-full h-full flex flex-col justify-end items-center pb-2 opacity-30 gap-1 rounded-t-full overflow-hidden">
                   <div className="w-20 h-10 border-t-2 border-white rounded-t-full mt-4"></div>
                </div>
             </div>

             {/* Initial State (Land Plot when nothing is bought) */}
             <div className={`absolute bottom-8 w-32 h-10 border-2 border-dashed border-slate-400 dark:border-slate-600 flex items-center justify-center rounded-lg transition-all duration-500 z-0 ${totalAmount > 0 ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`}>
                <span className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                  <Package className="w-3 h-3" /> Lahan Masjid
                </span>
             </div>

             {/* Items that appear floating around */}
             <AnimatePresence>
               {counts.semen > 0 && (
                 <motion.div key="semen-wrap" className="absolute -left-4 bottom-4 z-40 drop-shadow-lg flex flex-col items-center">
                   {Array.from({ length: Math.min(counts.semen, 3) }).map((_, i) => (
                     <motion.div 
                       key={`semen-${i}`}
                       initial={{ scale: 0, opacity: 0, y: 10, rotate: -20 + i * 5 }} 
                       animate={{ scale: 1, opacity: 1, y: 0, rotate: i === 0 ? 0 : (i === 1 ? -15 : 15) }} 
                       exit={{ scale: 0, opacity: 0 }}
                       transition={{ type: "spring", stiffness: 300, damping: 15 }}
                       className={`text-[32px] sm:text-4xl ${i > 0 ? '-mt-5' : ''}`}
                       style={{ zIndex: 10 - i }}
                     >
                       {SEMEN_EMOJIS[i % SEMEN_EMOJIS.length]}
                     </motion.div>
                   ))}
                 </motion.div>
               )}
               
               {counts.bata > 0 && (
                 <motion.div key="bata-wrap" className="absolute -right-2 bottom-8 z-40 drop-shadow-lg flex flex-col items-center">
                   {Array.from({ length: Math.min(counts.bata, 3) }).map((_, i) => (
                     <motion.div 
                       key={`bata-${i}`}
                       initial={{ scale: 0, opacity: 0, y: 10, rotate: 10 }} 
                       animate={{ scale: 1, opacity: 1, y: 0, rotate: i === 0 ? 15 : (i === 1 ? 5 : 25) }} 
                       exit={{ scale: 0, opacity: 0 }}
                       transition={{ type: "spring", stiffness: 300, damping: 15 }}
                       className={`text-[32px] sm:text-4xl ${i > 0 ? '-mt-4' : ''}`}
                       style={{ zIndex: 10 - i }}
                     >
                       {BATA_EMOJIS[i % BATA_EMOJIS.length]}
                     </motion.div>
                   ))}
                 </motion.div>
               )}

               {counts.keramik > 0 && (
                 <motion.div key="keramik-wrap" className="absolute left-1/2 -translate-x-1/2 -bottom-2 z-50 drop-shadow-lg flex flex-row items-center">
                   {Array.from({ length: Math.min(counts.keramik, 3) }).map((_, i) => (
                     <motion.div 
                       key={`keramik-${i}`}
                       initial={{ scale: 0, opacity: 0, x: -10, rotate: 20 - i * 5 }} 
                       animate={{ scale: 1, opacity: 1, x: 0, rotate: i === 0 ? 0 : (i === 1 ? 15 : -15) }} 
                       exit={{ scale: 0, opacity: 0 }} 
                       transition={{ type: "spring", stiffness: 300, damping: 15 }}
                       className={`text-[28px] sm:text-3xl ${i > 0 ? '-ml-4' : ''}`}
                       style={{ zIndex: 10 - i }}
                     >
                       {KERAMIK_EMOJIS[i % KERAMIK_EMOJIS.length]}
                     </motion.div>
                   ))}
                 </motion.div>
               )}
               {counts.karpet > 0 && (
                 <motion.div key="karpet-wrap" className="absolute right-0 bottom-16 z-40 drop-shadow-lg flex flex-col items-center justify-center">
                   {Array.from({ length: Math.min(counts.karpet, 2) }).map((_, i) => (
                     <motion.div 
                       key={`karpet-${i}`}
                       initial={{ scale: 0, opacity: 0, x: 20 }} 
                       animate={{ scale: 1, opacity: 1, x: 0 }} 
                       exit={{ scale: 0, opacity: 0 }} 
                       transition={{ type: "spring", stiffness: 300, damping: 15, delay: i * 0.1 }}
                       className={`text-[32px] sm:text-4xl ${i > 0 ? '-mt-5 scale-90' : 'z-10'}`}
                       style={{ zIndex: 10 - i }}
                     >
                       {KARPET_EMOJIS[i % KARPET_EMOJIS.length]}
                     </motion.div>
                   ))}
                 </motion.div>
               )}
             </AnimatePresence>
          </div>
        </div>
        
        {/* The 4 floating items */}
        <div className="absolute top-0 left-0 z-20">
           <ItemControl item={ITEMS[0]} count={counts.semen} onAdd={() => updateCount('semen', 1)} onSub={() => updateCount('semen', -1)} onRipple={createRipple} />
        </div>
        <div className="absolute top-0 right-0 z-20">
           <ItemControl item={ITEMS[1]} count={counts.bata} onAdd={() => updateCount('bata', 1)} onSub={() => updateCount('bata', -1)} onRipple={createRipple} />
        </div>
        <div className="absolute bottom-2 left-0 z-20">
           <ItemControl item={ITEMS[2]} count={counts.keramik} onAdd={() => updateCount('keramik', 1)} onSub={() => updateCount('keramik', -1)} onRipple={createRipple} />
        </div>
        <div className="absolute bottom-2 right-0 z-20">
           <ItemControl item={ITEMS[3]} count={counts.karpet} onAdd={() => updateCount('karpet', 1)} onSub={() => updateCount('karpet', -1)} onRipple={createRipple} />
        </div>
      </div>

      {/* Total and Action */}
      <div className="mt-6 flex flex-col items-center">
         <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Nilai Kebaikan Anda</div>
         <div className="text-3xl font-black text-emerald-500 mb-6 drop-shadow-sm flex items-center gap-1">
            <span className="text-lg text-slate-400 -mt-2">Rp</span>
            {new Intl.NumberFormat('id-ID').format(totalAmount)}
         </div>
         
         <motion.button 
            whileTap={{ scale: totalAmount > 0 ? 0.95 : 1 }}
            onClick={(e) => {
              if (totalAmount > 0) {
                createRipple(e);
                handleAdd();
              }
            }}
            disabled={totalAmount === 0}
            className={`w-full max-w-[300px] py-4 rounded-full font-bold flex items-center justify-center gap-2 transition-all duration-300 relative overflow-hidden ${totalAmount > 0 ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg shadow-emerald-500/30 transform hover:-translate-y-1' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'}`}
         >
           <AnimatePresence>
            {ripples.map(ripple => (
              <motion.span
                key={ripple.id}
                initial={{ scale: 0, opacity: 0.5 }}
                animate={{ scale: 4, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute bg-white/30 rounded-full pointer-events-none"
                style={{
                  width: ripple.size,
                  height: ripple.size,
                  left: ripple.x,
                  top: ripple.y,
                }}
              />
            ))}
           </AnimatePresence>
           <Home className="w-5 h-5" /> 
           {totalAmount > 0 ? 'Sedekahkan Bangunan' : 'Pilih Material Masjid'}
         </motion.button>
      </div>
    </div>
  );
};

const ItemControl = ({ item, count, onAdd, onSub, onRipple }: any) => {
  const [localRipples, setLocalRipples] = useState<{ id: number; x: number; y: number; size: number }[]>([]);

  const createLocalRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const newRipple = {
      id: Date.now(),
      x,
      y,
      size,
    };

    setLocalRipples(prev => [...prev, newRipple]);
    setTimeout(() => {
      setLocalRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 600);
  };

  return (
    <div className="flex flex-col items-center gap-2">
       {/* Icon/Image */}
       <div className={`w-14 h-14 md:w-16 md:h-16 rounded-full ${item.bg} shadow-sm border border-white/50 dark:border-slate-600 flex items-center justify-center relative transition-transform ${count > 0 ? 'scale-105 ring-2 ring-emerald-500/20' : ''}`}>
         <item.icon className={`w-5 h-5 md:w-6 md:h-6 ${item.color}`} />
         {count > 0 && (
           <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black border-2 border-white dark:border-slate-800 shadow-sm">{count}</motion.span>
         )}
       </div>
       {/* Controls */}
       <div className="bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 flex items-center p-1 shadow-sm mt-1 z-10 relative">
         <button 
           onClick={(e) => {
             if (count > 0) {
              createLocalRipple(e);
              onSub();
             }
           }} 
           disabled={count === 0} 
           className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors relative overflow-hidden ${count === 0 ? 'bg-transparent text-slate-300 cursor-not-allowed' : 'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600'}`}
         >
           <AnimatePresence>
            {localRipples.map(ripple => (
              <motion.span
                key={ripple.id}
                initial={{ scale: 0, opacity: 0.5 }}
                animate={{ scale: 4, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute bg-slate-400/20 rounded-full pointer-events-none"
                style={{
                  width: ripple.size,
                  height: ripple.size,
                  left: ripple.x,
                  top: ripple.y,
                }}
              />
            ))}
           </AnimatePresence>
           <Minus className="w-3 h-3" strokeWidth={3} />
         </button>
         <span className="w-6 text-center text-xs font-black text-slate-800 dark:text-slate-200">{count}</span>
         <button 
           onClick={(e) => {
             createLocalRipple(e);
             onAdd();
             onRipple(e);
           }} 
           className="w-6 h-6 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 transition-colors relative overflow-hidden"
         >
           <AnimatePresence>
            {localRipples.map(ripple => (
              <motion.span
                key={ripple.id}
                initial={{ scale: 0, opacity: 0.5 }}
                animate={{ scale: 4, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute bg-emerald-400/30 rounded-full pointer-events-none"
                style={{
                  width: ripple.size,
                  height: ripple.size,
                  left: ripple.x,
                  top: ripple.y,
                }}
              />
            ))}
           </AnimatePresence>
           <Plus className="w-3 h-3" strokeWidth={3} />
         </button>
       </div>
       {/* Name & Price */}
       <div className="text-center mt-0.5 relative z-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-2 rounded-full pb-1">
         <div className="text-[10px] md:text-xs font-bold text-slate-700 dark:text-slate-300 leading-tight">{item.name}</div>
         <div className="text-[9px] md:text-[10px] text-slate-500 font-medium">Rp {item.price / 1000}k</div>
       </div>
    </div>
  )
}
