import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Minus, ShoppingBag, Fish, Coffee, Utensils, Wheat } from 'lucide-react';
import { Program } from '../App';

interface PanganInteractiveProps {
  onAddToCart: (program: Program, amount: string) => void;
}

const ITEMS = [
  { id: 'beras', name: 'Beras & Karbo', price: 75000, icon: Wheat, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  { id: 'minyak', name: 'Minyak Goreng', price: 40000, icon: Coffee, color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
  { id: 'lauk', name: 'Lauk & Sarden', price: 35000, icon: Fish, color: 'text-rose-500', bg: 'bg-rose-100 dark:bg-rose-900/30' },
  { id: 'gula', name: 'Gula & Teh', price: 25000, icon: Utensils, color: 'text-slate-500', bg: 'bg-slate-100 dark:bg-slate-900/30' },
];

const BERAS_EMOJIS = ['🍚', '🌾', '🌾', '🍚'];
const MINYAK_EMOJIS = ['🫙', '🍳', '🍯', '✨'];
const LAUK_EMOJIS = ['🐟', '🥫', '🍳', '🥫'];
const GULA_EMOJIS = ['🍵', '☕', '🧂', '🍬'];

export const PanganInteractive: React.FC<PanganInteractiveProps> = ({ onAddToCart }) => {
  const [counts, setCounts] = useState<Record<string, number>>({
    beras: 0,
    minyak: 0,
    lauk: 0,
    gula: 0,
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
    beras: [
      "Jazakumullahu khairan. Semoga setiap bulir beras ini menjadi penguat fisik mereka dalam beribadah. Aamiin.",
    ],
    minyak: [
      "Barakallahu fiikum. Ya Allah, luaskanlah rezeki donatur kami sebagaimana mereka meluaskan kebahagiaan dhuafa ini. Aamiin.",
    ],
    lauk: [
      "Jazakumullahu ahsanal jaza. Semoga kebaikan ini menolak bala dan membawa keberkahan pada harta Anda. Aamiin.",
    ],
    gula: [
      "Allahumma barik lahum. Semoga Allah maniskan kehidupan Anda di dunia dan akhirat kelak. Aamiin.",
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
      id: 9994,
      title: "Paket Pangan Dhuafa",
      category: "Kemanusiaan",
      description: "Penyaluran bingkisan sembako dan kebutuhan pangan pokok untuk keluarga dhuafa dan lansia prasejahtera.",
      image: "https://images.unsplash.com/photo-1593113565694-c6f108bc4dc1?auto=format&fit=crop&q=80&w=800",
      collected: 45000000,
      target: 100000000,
      donors: 312
    };

    onAddToCart(program, totalAmount.toString());
    
    setCounts({
      beras: 0,
      minyak: 0,
      lauk: 0,
      gula: 0,
    });
  };

  return (
    <div className="w-full max-w-xl mx-auto py-10 px-4 md:px-8 bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 dark:border-slate-700/50 text-center relative my-12 overflow-hidden snap-center shrink-0">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl -z-10 -translate-x-1/2 translate-y-1/2"></div>

      <div className="mb-10 text-center flex flex-col items-center w-full">
        <span className="bg-orange-500/10 text-orange-600 dark:text-orange-500 font-bold px-3 py-1 text-[10px] md:text-xs rounded-full uppercase tracking-widest mb-3">Ketahanan Pangan</span>
        <h2 className="text-2xl md:text-3xl font-serif font-black text-slate-900 dark:text-white mb-3">Paket Pangan Dhuafa</h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm max-w-sm mb-6">Jangan biarkan saudara kita kelaparan. Hadirkan senyum di meja makan mereka dengan paket sembako.</p>
        
        {/* Progress Bar Donasi */}
        <div className="w-full max-w-[280px] bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50">
          <div className="flex justify-between items-end mb-2.5">
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              Terkumpul
            </span>
            <span className="text-sm font-black text-orange-500">
              Rp {new Intl.NumberFormat('id-ID').format(45000000)}
            </span>
          </div>
          <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden relative shadow-inner">
            <motion.div 
              initial={{ width: 0 }}
              whileInView={{ width: '45%' }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-400 to-rose-500 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.5)]"
            />
          </div>
          <div className="mt-2 text-right">
            <span className="text-[9px] text-slate-400">dari target Rp 100.000.000</span>
          </div>
        </div>
      </div>

      <div className="relative w-full max-w-[360px] md:max-w-[400px] mx-auto h-[320px] flex items-center justify-center mt-2 md:mt-4">
        
        {/* Center Canvas */}
        <div className="absolute z-10 flex flex-col items-center pointer-events-none scale-[0.85] sm:scale-100">
          <div className="relative w-48 h-56 mt-4 flex items-end justify-center">
             
             {/* Box/Basket Base */}
             <div className="relative w-36 h-28 z-10 flex justify-center">
               
               {/* Back Box Wall */}
               <div className={`absolute bottom-0 w-32 h-24 bg-[#c2966a] border-[3px] border-slate-800 rounded-md z-0 transition-opacity duration-300 ${totalAmount > 0 ? 'opacity-100' : 'opacity-0'}`}></div>

               {/* Groceries inside the box */}
               <div className="absolute bottom-4 flex items-end justify-center w-full z-10">
                 
                 {/* Beras */}
                 <div className={`w-14 h-20 bg-slate-100 border-[3px] border-slate-800 rounded-t-xl rounded-b-md mx-[-5px] rotate-[-5deg] flex flex-col items-center justify-start pt-2 transition-transform duration-500 origin-bottom ${counts.beras > 0 ? 'scale-100' : 'scale-0'}`}>
                   <div className="w-8 h-8 rounded-full border-2 border-emerald-500/30 flex items-center justify-center">
                     <span className="text-[10px]">🌾</span>
                   </div>
                   <div className="w-8 h-[3px] bg-slate-300 mt-2 rounded-full"></div>
                 </div>

                 {/* Minyak */}
                 <div className={`w-10 h-16 bg-yellow-400 border-[3px] border-slate-800 rounded-b-md mx-[-5px] rotate-[8deg] flex flex-col items-center transition-transform duration-500 origin-bottom ${counts.minyak > 0 ? 'scale-100' : 'scale-0'}`}>
                   <div className="w-6 h-3 bg-yellow-600 border-b-[3px] border-slate-800 rounded-t-sm"></div>
                   <div className="w-full h-full p-1 opacity-60">
                     <div className="w-full h-full border-2 border-yellow-200/50 rounded-sm"></div>
                   </div>
                 </div>

                 {/* Lauk/Sarden */}
                 <div className={`flex flex-col z-20 mx-[-5px] rotate-[3deg] transition-transform duration-500 origin-bottom ${counts.lauk > 0 ? 'scale-100' : 'scale-0'}`}>
                   <div className="w-10 h-7 bg-rose-500 border-[3px] border-slate-800 rounded-md mb-1 relative overflow-hidden">
                     <div className="absolute top-1 left-1 w-4 h-2 bg-white/30 rounded-full"></div>
                   </div>
                   <div className="w-10 h-7 bg-indigo-500 border-[3px] border-slate-800 rounded-md relative overflow-hidden">
                     <div className="absolute top-1 left-1 w-4 h-2 bg-white/30 rounded-full"></div>
                   </div>
                 </div>

                 {/* Gula/Teh Box */}
                 <div className={`w-10 h-12 bg-sky-300 border-[3px] border-slate-800 rounded-sm mx-[-5px] rotate-[-12deg] flex flex-col items-center justify-center transition-transform duration-500 origin-bottom ${counts.gula > 0 ? 'scale-100' : 'scale-0'}`}>
                   <div className="w-4 h-4 bg-sky-100 rounded-full border-[1.5px] border-slate-800"></div>
                 </div>
               </div>

               {/* Front Box Wall */}
               <div className={`absolute bottom-0 w-36 h-12 bg-[#cca47a] border-[3px] border-slate-800 rounded-md z-20 flex flex-col justify-center gap-1 px-3 transition-opacity duration-300 ${totalAmount > 0 ? 'opacity-100' : 'opacity-0'}`}>
                 <div className="w-full h-[2px] bg-[#a87a4c]"></div>
                 <div className="w-full h-[2px] bg-[#a87a4c]"></div>
                 {/* Care label */}
                 <div className="absolute -top-3 right-4 w-10 h-6 bg-white border-[2.5px] border-slate-800 rounded-sm rotate-[10deg] flex items-center justify-center font-bold text-[8px]">CARE</div>
               </div>

             </div>

             {/* Initial State Box */}
             <div className={`absolute bottom-8 w-32 h-10 border-2 border-dashed border-slate-400 dark:border-slate-600 flex items-center justify-center rounded-lg transition-all duration-500 z-0 ${totalAmount > 0 ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`}>
                <span className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                  Mulai Susun
                </span>
             </div>

             {/* Floating Items */}
             <AnimatePresence>
               {counts.beras > 0 && (
                 <motion.div key="beras-wrap" className="absolute -left-6 top-1/2 z-40 drop-shadow-lg flex flex-col items-center">
                   {Array.from({ length: Math.min(counts.beras, 2) }).map((_, i) => (
                     <motion.div 
                       key={`beras-${i}`}
                       initial={{ scale: 0, opacity: 0, y: 10, rotate: -20 + i * 5 }} 
                       animate={{ scale: 1, opacity: 1, y: 0, rotate: i === 0 ? -15 : 15 }} 
                       exit={{ scale: 0, opacity: 0 }}
                       transition={{ type: "spring", stiffness: 300, damping: 15 }}
                       className={`text-[32px] sm:text-4xl ${i > 0 ? '-mt-5 z-10' : ''}`}
                       style={{ zIndex: 10 - i }}
                     >
                       {BERAS_EMOJIS[i % BERAS_EMOJIS.length]}
                     </motion.div>
                   ))}
                 </motion.div>
               )}
               
               {counts.minyak > 0 && (
                 <motion.div key="minyak-wrap" className="absolute left-1/4 -top-6 z-40 drop-shadow-lg flex flex-col items-center">
                   {Array.from({ length: Math.min(counts.minyak, 2) }).map((_, i) => (
                     <motion.div 
                       key={`minyak-${i}`}
                       initial={{ scale: 0, opacity: 0, y: 10, rotate: 10 }} 
                       animate={{ scale: 1, opacity: 1, y: 0, rotate: i === 0 ? 15 : -5 }} 
                       exit={{ scale: 0, opacity: 0 }}
                       transition={{ type: "spring", stiffness: 300, damping: 15 }}
                       className={`text-[28px] sm:text-3xl ${i > 0 ? '-mt-4 z-10' : ''}`}
                       style={{ zIndex: 10 - i }}
                     >
                       {MINYAK_EMOJIS[i % MINYAK_EMOJIS.length]}
                     </motion.div>
                   ))}
                 </motion.div>
               )}
               {counts.lauk > 0 && (
                 <motion.div key="lauk-wrap" className="absolute right-4 -top-2 z-40 drop-shadow-lg flex flex-col items-center">
                   {Array.from({ length: Math.min(counts.lauk, 2) }).map((_, i) => (
                     <motion.div 
                       key={`lauk-${i}`}
                       initial={{ scale: 0, opacity: 0, y: 10, rotate: 10 }} 
                       animate={{ scale: 1, opacity: 1, y: 0, rotate: i === 0 ? -10 : 25 }} 
                       exit={{ scale: 0, opacity: 0 }}
                       transition={{ type: "spring", stiffness: 300, damping: 15 }}
                       className={`text-[28px] sm:text-3xl ${i > 0 ? '-mt-4 z-10' : ''}`}
                       style={{ zIndex: 10 - i }}
                     >
                       {LAUK_EMOJIS[i % LAUK_EMOJIS.length]}
                     </motion.div>
                   ))}
                 </motion.div>
               )}
                {counts.gula > 0 && (
                 <motion.div key="gula-wrap" className="absolute -right-6 top-1/2 z-40 drop-shadow-lg flex flex-col items-center">
                   {Array.from({ length: Math.min(counts.gula, 2) }).map((_, i) => (
                     <motion.div 
                       key={`gula-${i}`}
                       initial={{ scale: 0, opacity: 0, y: 10, rotate: 10 }} 
                       animate={{ scale: 1, opacity: 1, y: 0, rotate: i === 0 ? 10 : -15 }} 
                       exit={{ scale: 0, opacity: 0 }}
                       transition={{ type: "spring", stiffness: 300, damping: 15 }}
                       className={`text-[28px] sm:text-3xl ${i > 0 ? '-mt-4 z-10' : ''}`}
                       style={{ zIndex: 10 - i }}
                     >
                       {GULA_EMOJIS[i % GULA_EMOJIS.length]}
                     </motion.div>
                   ))}
                 </motion.div>
               )}
             </AnimatePresence>
          </div>
        </div>
        
        {/* The 4 floating items */}
        <div className="absolute top-0 left-0 z-20">
           <ItemControl item={ITEMS[0]} count={counts.beras} onAdd={() => updateCount('beras', 1)} onSub={() => updateCount('beras', -1)} onRipple={createRipple} />
        </div>
        <div className="absolute top-2 right-0 z-20">
           <ItemControl item={ITEMS[1]} count={counts.minyak} onAdd={() => updateCount('minyak', 1)} onSub={() => updateCount('minyak', -1)} onRipple={createRipple} />
        </div>
        <div className="absolute bottom-4 left-0 z-20">
           <ItemControl item={ITEMS[2]} count={counts.lauk} onAdd={() => updateCount('lauk', 1)} onSub={() => updateCount('lauk', -1)} onRipple={createRipple} />
        </div>
        <div className="absolute bottom-2 right-0 z-20">
           <ItemControl item={ITEMS[3]} count={counts.gula} onAdd={() => updateCount('gula', 1)} onSub={() => updateCount('gula', -1)} onRipple={createRipple} />
        </div>
      </div>

      {/* Total and Action */}
      <div className="mt-6 flex flex-col items-center">
         <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Nilai Pangan</div>
         <div className="text-3xl font-black text-orange-500 mb-6 drop-shadow-sm flex items-center gap-1">
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
            className={`w-full max-w-[300px] py-4 rounded-full font-bold flex items-center justify-center gap-2 transition-all duration-300 relative overflow-hidden ${totalAmount > 0 ? 'bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 text-white shadow-lg shadow-orange-500/30 transform hover:-translate-y-1' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'}`}
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
           <ShoppingBag className="w-5 h-5" /> 
           {totalAmount > 0 ? 'Salurkan Paket Pangan' : 'Pilih Sembako'}
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
       <div className={`w-14 h-14 md:w-16 md:h-16 rounded-full ${item.bg} shadow-sm border border-white/50 dark:border-slate-600 flex items-center justify-center relative transition-transform ${count > 0 ? 'scale-105 ring-2 ring-orange-500/20' : ''}`}>
         <item.icon className={`w-5 h-5 md:w-6 md:h-6 ${item.color}`} />
         {count > 0 && (
           <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black border-2 border-white dark:border-slate-800 shadow-sm">{count}</motion.span>
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
           className="w-6 h-6 rounded-full bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 hover:bg-orange-100 transition-colors relative overflow-hidden"
         >
           <AnimatePresence>
            {localRipples.map(ripple => (
              <motion.span
                key={ripple.id}
                initial={{ scale: 0, opacity: 0.5 }}
                animate={{ scale: 4, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute bg-orange-400/30 rounded-full pointer-events-none"
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
