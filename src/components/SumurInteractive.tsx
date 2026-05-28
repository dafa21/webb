import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Minus, Droplet, Database, Waves, Wrench, Droplets } from 'lucide-react';
import { Program } from '../App';

interface SumurInteractiveProps {
  onAddToCart: (program: Program, amount: string) => void;
}

const ITEMS = [
  { id: 'pipa', name: 'Pipa Air', price: 50000, icon: Waves, color: 'text-sky-500', bg: 'bg-sky-100 dark:bg-sky-900/30' },
  { id: 'keran', name: 'Keran Air', price: 25000, icon: Droplet, color: 'text-teal-500', bg: 'bg-teal-100 dark:bg-teal-900/30' },
  { id: 'toren', name: 'Toren Air', price: 150000, icon: Database, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30' },
  { id: 'pompa', name: 'Pompa Air', price: 200000, icon: Wrench, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
];

const PIPA_EMOJIS = ['🚰', '🔧', '💦', '🌊'];
const KERAN_EMOJIS = ['🚰', '💧', '🪣', '✨'];
const TOREN_EMOJIS = ['🛢️', '💧', '🏗️', '🌊'];
const POMPA_EMOJIS = ['⚙️', '⚡', '💦', '🚿'];

export const SumurInteractive: React.FC<SumurInteractiveProps> = ({ onAddToCart }) => {
  const [counts, setCounts] = useState<Record<string, number>>({
    pipa: 0,
    keran: 0,
    toren: 0,
    pompa: 0,
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
    pipa: [
      "Jazakumullahu khairan. Semoga setiap tetes air yang mengalir menjadi amal jariyah yang tak terputus untuk Anda. Aamiin.",
      "Barakallahu fiikum. Ya Allah, mudahkanlah rezeki donatur kami sebagaimana mengalirnya air ini. Aamiin.",
    ],
    keran: [
      "Jazakumullahu ahsanal jaza. Semoga kebaikan ini menyucikan harta dan jiwa Anda. Aamiin.",
      "Barakallahu laka fi ahlika wa malika. Semoga setiap wudhu dari air ini membawa keberkahan bagi Anda. Aamiin.",
    ],
    toren: [
      "Allahumma barik lahum. Semoga Allah melimpahkan rahmat-Nya seperti wadah air yang selalu penuh ini. Aamiin.",
      "Jazakumullahu khairan. Semoga Allah memberikan Anda kesegaran telaga Kautsar di surga kelak. Aamiin.",
    ],
    pompa: [
      "Barakallahu fiikum. Ya Allah, berikanlah kekuatan dan kesehatan bagi hamba-Mu yang dermawan ini. Aamiin.",
      "Jazakumullahu jannatal firdaus. Semoga pahala terus memancar sebagaimana air yang diangkat oleh pompa ini. Aamiin.",
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
      id: 9997,
      title: "Sumur Air Kehidupan",
      category: "Kesehatan & Lingkungan",
      description: "Pembangunan sumur air bersih untuk daerah yang mengalami krisis air kemarau panjang.",
      image: "https://images.unsplash.com/photo-1541888087799-a56767280aa3?auto=format&fit=crop&q=80&w=800",
      collected: 120000000,
      target: 300000000,
      donors: 854
    };

    onAddToCart(program, totalAmount.toString());
    
    setCounts({
      pipa: 0,
      keran: 0,
      toren: 0,
      pompa: 0,
    });
  };

  return (
    <div className="w-full max-w-xl mx-auto py-10 px-4 md:px-8 bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 dark:border-slate-700/50 text-center relative my-12 overflow-hidden snap-center shrink-0">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -z-10 -translate-x-1/2 translate-y-1/2"></div>

      <div className="mb-10 text-center flex flex-col items-center w-full">
        <span className="bg-sky-500/10 text-sky-600 dark:text-sky-500 font-bold px-3 py-1 text-[10px] md:text-xs rounded-full uppercase tracking-widest mb-3">Air Bersih Pelosok</span>
        <h2 className="text-2xl md:text-3xl font-serif font-black text-slate-900 dark:text-white mb-3">Sumur Kehidupan</h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm max-w-sm mb-6">Alirkan pahala tiada henti dengan mengalirkan air bersih untuk saudara kita di daerah krisis air.</p>
        
        {/* Progress Bar Donasi */}
        <div className="w-full max-w-[280px] bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50">
          <div className="flex justify-between items-end mb-2.5">
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              Terkumpul
            </span>
            <span className="text-sm font-black text-sky-500">
              Rp {new Intl.NumberFormat('id-ID').format(120000000)}
            </span>
          </div>
          <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden relative shadow-inner">
            <motion.div 
              initial={{ width: 0 }}
              whileInView={{ width: '40%' }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-sky-400 to-blue-500 rounded-full shadow-[0_0_10px_rgba(14,165,233,0.5)]"
            />
          </div>
          <div className="mt-2 text-right">
            <span className="text-[9px] text-slate-400">dari target Rp 300.000.000</span>
          </div>
        </div>
      </div>

      <div className="relative w-full max-w-[360px] md:max-w-[400px] mx-auto h-[320px] flex items-center justify-center mt-2 md:mt-4">
        
        {/* Center Canvas */}
        <div className="absolute z-10 flex flex-col items-center pointer-events-none scale-[0.85] sm:scale-100">
          <div className="relative w-48 h-48 mt-4 flex items-end justify-center">
             
             {/* Base Land */}
             <div className="absolute bottom-4 w-56 h-8 border-t-4 border-amber-800/10 bg-[#e0cdb6] dark:bg-[#524434] rounded-t-xl z-20">
               {/* Water stream inside ground */}
               <div className={`absolute left-1/2 -translate-x-1/2 bottom-0 w-8 h-full bg-sky-400/30 transition-all duration-700 ${counts.pompa > 0 ? 'opacity-100' : 'opacity-0'}`}></div>
             </div>
             
             {/* Pipa (Underground to surface) */}
             <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 w-4 h-24 bg-slate-300 dark:bg-slate-600 border-x-2 border-slate-400 dark:border-slate-700 z-10 transition-all duration-700 origin-bottom ${counts.pipa > 0 ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0'}`}>
               <div className="absolute top-0 w-full h-[2px] bg-slate-400"></div>
             </div>

             {/* Toren Air (Water Tank) */}
             <div className={`absolute bottom-28 w-24 h-28 bg-orange-400 border-4 border-slate-800 rounded-lg z-30 flex items-end overflow-hidden shadow-lg transition-all duration-700 delay-200 origin-bottom ${counts.toren > 0 ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0'}`}>
                {/* Tank cap */}
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-12 h-3 bg-slate-800 rounded-b-sm"></div>
                {/* Tank Ribs */}
                <div className="w-full h-full flex flex-col justify-evenly opacity-30">
                  <div className="w-full h-1 bg-slate-900"></div>
                  <div className="w-full h-1 bg-slate-900"></div>
                  <div className="w-full h-1 bg-slate-900"></div>
                  <div className="w-full h-1 bg-slate-900"></div>
                </div>
                {/* Water Level inside tank */}
                <motion.div 
                  initial={{ height: '0%' }}
                  animate={{ height: totalAmount > 0 ? (counts.pompa > 0 ? '80%' : '30%') : '0%' }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                  className="absolute bottom-0 left-0 w-full bg-cyan-400/80 -z-10"
                ></motion.div>
             </div>

             {/* Keran & Splash */}
             <div className={`absolute bottom-20 left-1/2 ml-7 w-8 h-4 bg-slate-400 border-y-2 border-r-2 border-slate-600 rounded-r-md z-20 flex items-center transition-all duration-500 delay-300 origin-left ${counts.keran > 0 ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'}`}>
                <div className="absolute right-1 -bottom-2 w-2 h-4 bg-slate-500 rounded-b-sm"></div>
                
                {/* Water pouring */}
                {counts.keran > 0 && totalAmount > 200000 && (
                   <motion.div 
                     initial={{ height: 0 }}
                     animate={{ height: 40 }}
                     className="absolute -bottom-[42px] right-1.5 w-1.5 bg-cyan-400/80 rounded-full blur-[1px]"
                   />
                )}
             </div>

             {/* Pompa Air */}
             <div className={`absolute bottom-12 -left-6 w-14 h-10 bg-blue-500 border-2 border-slate-800 rounded-md z-30 transition-all duration-500 origin-bottom ${counts.pompa > 0 && counts.pipa > 0 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
                <div className="absolute -top-2 left-2 w-4 h-3 bg-slate-600 rounded-t-sm"></div>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-slate-600 rounded-full -mr-2"></div>
                {/* Pompa active vibration */}
                {counts.pompa > 0 && (
                  <motion.div 
                    animate={{ x: [-1, 1, -1] }} 
                    transition={{ repeat: Infinity, duration: 0.1 }} 
                    className="w-full h-full text-white/50 text-[10px] flex items-center justify-center font-bold"
                  >
                    ⚡
                  </motion.div>
                )}
             </div>

             {/* Initial State Box */}
             <div className={`absolute bottom-12 w-32 h-20 border-2 border-dashed border-sky-300 dark:border-sky-700/50 flex flex-col items-center justify-center rounded-lg transition-all duration-500 z-0 ${totalAmount > 0 ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`}>
                <Droplets className="w-5 h-5 text-sky-400 mb-1" />
                <span className="text-sky-500/80 text-[10px] font-bold uppercase tracking-widest text-center px-2">Bangun<br/>Sumur</span>
             </div>

             {/* Items that appear floating around */}
             <AnimatePresence>
               {counts.pipa > 0 && (
                 <motion.div key="pipa-wrap" className="absolute left-0 bottom-4 z-40 drop-shadow-lg flex flex-col items-center">
                   {Array.from({ length: Math.min(counts.pipa, 3) }).map((_, i) => (
                     <motion.div 
                       key={`pipa-${i}`}
                       initial={{ scale: 0, opacity: 0, y: 10, rotate: -20 + i * 5 }} 
                       animate={{ scale: 1, opacity: 1, y: 0, rotate: i === 0 ? 0 : (i === 1 ? -15 : 15) }} 
                       exit={{ scale: 0, opacity: 0 }}
                       transition={{ type: "spring", stiffness: 300, damping: 15 }}
                       className={`text-[32px] sm:text-4xl ${i > 0 ? '-mt-5 z-10' : ''}`}
                       style={{ zIndex: 10 - i }}
                     >
                       {PIPA_EMOJIS[i % PIPA_EMOJIS.length]}
                     </motion.div>
                   ))}
                 </motion.div>
               )}
               
               {counts.keran > 0 && (
                 <motion.div key="keran-wrap" className="absolute right-4 bottom-10 z-40 drop-shadow-lg flex flex-col items-center">
                   {Array.from({ length: Math.min(counts.keran, 3) }).map((_, i) => (
                     <motion.div 
                       key={`keran-${i}`}
                       initial={{ scale: 0, opacity: 0, y: 10, rotate: 10 }} 
                       animate={{ scale: 1, opacity: 1, y: 0, rotate: i === 0 ? 15 : (i === 1 ? 5 : 25) }} 
                       exit={{ scale: 0, opacity: 0 }}
                       transition={{ type: "spring", stiffness: 300, damping: 15 }}
                       className={`text-[28px] sm:text-3xl ${i > 0 ? '-mt-4 z-10' : ''}`}
                       style={{ zIndex: 10 - i }}
                     >
                       {KERAN_EMOJIS[i % KERAN_EMOJIS.length]}
                     </motion.div>
                   ))}
                 </motion.div>
               )}

               {counts.toren > 0 && (
                 <motion.div key="toren-wrap" className="absolute left-1/2 -translate-x-1/2 top-4 z-50 drop-shadow-lg flex flex-row items-center">
                   {Array.from({ length: Math.min(counts.toren, 2) }).map((_, i) => (
                     <motion.div 
                       key={`toren-${i}`}
                       initial={{ scale: 0, opacity: 0, y: -20, rotate: 20 - i * 5 }} 
                       animate={{ scale: 1, opacity: 1, y: 0, rotate: i === 0 ? 0 : (i === 1 ? 15 : -15) }} 
                       exit={{ scale: 0, opacity: 0 }} 
                       transition={{ type: "spring", stiffness: 300, damping: 15 }}
                       className={`text-[32px] sm:text-4xl ${i > 0 ? '-ml-3 z-10' : ''}`}
                       style={{ zIndex: 10 - i }}
                     >
                       {TOREN_EMOJIS[i % TOREN_EMOJIS.length]}
                     </motion.div>
                   ))}
                 </motion.div>
               )}
               {counts.pompa > 0 && (
                 <motion.div key="pompa-wrap" className="absolute left-1/4 bottom-14 z-40 drop-shadow-lg flex flex-col items-center justify-center">
                   {Array.from({ length: Math.min(counts.pompa, 2) }).map((_, i) => (
                     <motion.div 
                       key={`pompa-${i}`}
                       initial={{ scale: 0, opacity: 0, x: -20 }} 
                       animate={{ scale: 1, opacity: 1, x: 0 }} 
                       exit={{ scale: 0, opacity: 0 }} 
                       transition={{ type: "spring", stiffness: 300, damping: 15, delay: i * 0.1 }}
                       className={`text-[28px] sm:text-3xl ${i > 0 ? '-mt-5 scale-90 z-10' : 'z-10'}`}
                       style={{ zIndex: 10 - i }}
                     >
                       {POMPA_EMOJIS[i % POMPA_EMOJIS.length]}
                     </motion.div>
                   ))}
                 </motion.div>
               )}
             </AnimatePresence>
          </div>
        </div>
        
        {/* The 4 floating items */}
        <div className="absolute top-0 left-0 z-20">
           <ItemControl item={ITEMS[0]} count={counts.pipa} onAdd={() => updateCount('pipa', 1)} onSub={() => updateCount('pipa', -1)} onRipple={createRipple} />
        </div>
        <div className="absolute top-2 right-0 z-20">
           <ItemControl item={ITEMS[1]} count={counts.keran} onAdd={() => updateCount('keran', 1)} onSub={() => updateCount('keran', -1)} onRipple={createRipple} />
        </div>
        <div className="absolute bottom-4 left-0 z-20">
           <ItemControl item={ITEMS[2]} count={counts.toren} onAdd={() => updateCount('toren', 1)} onSub={() => updateCount('toren', -1)} onRipple={createRipple} />
        </div>
        <div className="absolute bottom-2 right-0 z-20">
           <ItemControl item={ITEMS[3]} count={counts.pompa} onAdd={() => updateCount('pompa', 1)} onSub={() => updateCount('pompa', -1)} onRipple={createRipple} />
        </div>
      </div>

      {/* Total and Action */}
      <div className="mt-6 flex flex-col items-center">
         <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Nilai Kebaikan Anda</div>
         <div className="text-3xl font-black text-sky-500 mb-6 drop-shadow-sm flex items-center gap-1">
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
            className={`w-full max-w-[300px] py-4 rounded-full font-bold flex items-center justify-center gap-2 transition-all duration-300 relative overflow-hidden ${totalAmount > 0 ? 'bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-500 hover:to-blue-600 text-white shadow-lg shadow-sky-500/30 transform hover:-translate-y-1' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'}`}
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
           <Droplets className="w-5 h-5" /> 
           {totalAmount > 0 ? 'Alirkan Kebaikan' : 'Pilih Material Sumur'}
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
       <div className={`w-14 h-14 md:w-16 md:h-16 rounded-full ${item.bg} shadow-sm border border-white/50 dark:border-slate-600 flex items-center justify-center relative transition-transform ${count > 0 ? 'scale-105 ring-2 ring-sky-500/20' : ''}`}>
         <item.icon className={`w-5 h-5 md:w-6 md:h-6 ${item.color}`} />
         {count > 0 && (
           <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1 -right-1 bg-sky-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black border-2 border-white dark:border-slate-800 shadow-sm">{count}</motion.span>
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
           className="w-6 h-6 rounded-full bg-sky-50 dark:bg-sky-900/30 flex items-center justify-center text-sky-600 dark:text-sky-400 hover:bg-sky-100 transition-colors relative overflow-hidden"
         >
           <AnimatePresence>
            {localRipples.map(ripple => (
              <motion.span
                key={ripple.id}
                initial={{ scale: 0, opacity: 0.5 }}
                animate={{ scale: 4, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute bg-sky-400/30 rounded-full pointer-events-none"
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
