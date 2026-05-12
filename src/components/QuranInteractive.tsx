import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Minus, BookOpen, Book, AlignCenter, BookMarked, Library } from 'lucide-react';
import { Program } from '../App';

interface QuranInteractiveProps {
  onAddToCart: (program: Program, amount: string) => void;
}

const ITEMS = [
  { id: 'iqro', name: 'Buku Iqro', price: 15000, icon: Book, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30' },
  { id: 'quran', name: 'Al-Quran', price: 75000, icon: BookOpen, color: 'text-teal-500', bg: 'bg-teal-100 dark:bg-teal-900/30' },
  { id: 'rehal', name: 'Rehal Kayu', price: 50000, icon: AlignCenter, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  { id: 'rak', name: 'Rak Buku', price: 250000, icon: Library, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30' },
];

const IQRO_EMOJIS = ['📖', '💚', '✨', '📚'];
const QURAN_EMOJIS = ['📖', '🕌', '🕋', '✨'];
const REHAL_EMOJIS = ['🪵', '🪑', '📚', '🕌'];
const RAK_EMOJIS = ['🗄️', '📚', '🪑', '🏢'];

export const QuranInteractive: React.FC<QuranInteractiveProps> = ({ onAddToCart }) => {
  const [counts, setCounts] = useState<Record<string, number>>({
    iqro: 0,
    quran: 0,
    rehal: 0,
    rak: 0,
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
    iqro: [
      "Jazakumullahu khairan. Semoga setiap huruf hijaiyah yang mereka eja mengalirkan pahala untuk Anda. Aamiin.",
    ],
    quran: [
      "Barakallahu fiikum. Ratusan huruf dibaca setiap hari, semoga pahalanya tak terputus untuk Anda. Aamiin.",
    ],
    rehal: [
      "Jazakumullahu ahsanal jaza. Semoga kenyamanan mereka mengaji menjadi wasilah kelapangan rezeki Anda. Aamiin.",
    ],
    rak: [
      "Allahumma barik lahum. Semoga setiap Al-Quran yang terjaga rapi memberatkan timbangan amal Anda. Aamiin.",
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
      id: 9995,
      title: "Wakaf Al-Quran Pelosok",
      category: "Dakwah",
      description: "Tebar Al-Quran dan Iqro untuk santri di TPQ pedalaman nusantara yang masih kekurangan fasilitas ngaji.",
      image: "https://images.unsplash.com/photo-1608151240439-d3e70d4734b4?auto=format&fit=crop&q=80&w=800",
      collected: 105000000,
      target: 250000000,
      donors: 624
    };

    onAddToCart(program, totalAmount.toString());
    
    setCounts({
      iqro: 0,
      quran: 0,
      rehal: 0,
      rak: 0,
    });
  };

  return (
    <div className="w-full max-w-xl mx-auto py-10 px-4 md:px-8 bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 dark:border-slate-700/50 text-center relative my-12 overflow-hidden snap-center shrink-0">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-500/5 rounded-full blur-3xl -z-10 -translate-x-1/2 translate-y-1/2"></div>

      <div className="mb-10 text-center flex flex-col items-center w-full">
        <span className="bg-teal-500/10 text-teal-600 dark:text-teal-500 font-bold px-3 py-1 text-[10px] md:text-xs rounded-full uppercase tracking-widest mb-3">Cahaya Pedalaman</span>
        <h2 className="text-2xl md:text-3xl font-serif font-black text-slate-900 dark:text-white mb-3">Wakaf Mushaf Qur'an</h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm max-w-sm mb-6">Tebar hidayah melalui lembaran suci. Hadiahkan fasilitas mengaji untuk santri di tepian negeri.</p>
        
        {/* Progress Bar Donasi */}
        <div className="w-full max-w-[280px] bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50">
          <div className="flex justify-between items-end mb-2.5">
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              Terkumpul
            </span>
            <span className="text-sm font-black text-teal-500">
              Rp {new Intl.NumberFormat('id-ID').format(105000000)}
            </span>
          </div>
          <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden relative shadow-inner">
            <motion.div 
              initial={{ width: 0 }}
              whileInView={{ width: '42%' }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-teal-400 to-teal-600 rounded-full shadow-[0_0_10px_rgba(20,184,166,0.5)]"
            />
          </div>
          <div className="mt-2 text-right">
            <span className="text-[9px] text-slate-400">dari target Rp 250.000.000</span>
          </div>
        </div>
      </div>

      <div className="relative w-full max-w-[360px] md:max-w-[400px] mx-auto h-[320px] flex items-center justify-center mt-2 md:mt-4">
        
        {/* Center Canvas */}
        <div className="absolute z-10 flex flex-col items-center pointer-events-none scale-[0.85] sm:scale-100">
          <div className="relative w-48 h-56 mt-4 flex items-end justify-center">
             
             {/* Rak Buku (Appears with Rak) */}
             <div className={`absolute bottom-5 w-56 h-48 bg-[#9B6B43] border-[3.5px] border-slate-800 rounded-t-lg rounded-b-sm z-0 flex flex-col justify-evenly py-2 px-2 shadow-xl transition-all duration-700 origin-bottom ${counts.rak > 0 ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}>
                {/* Shelves */}
                <div className="w-full h-2 bg-[#6b472a] border-y-[2px] border-slate-800/50 mb-4 relative">
                   {/* Books on top shelf */}
                   <div className="absolute bottom-[2px] left-2 flex items-end">
                      <div className="w-4 h-12 bg-rose-500 border-2 border-slate-800 rounded-sm rounded-tr-md"></div>
                      <div className="w-3 h-10 bg-indigo-500 border-2 border-slate-800 rounded-sm ml-[-2px]"></div>
                      <div className="w-4 h-11 bg-teal-500 border-2 border-slate-800 rounded-sm ml-1 rotate-[10deg] origin-bottom-left"></div>
                   </div>
                   <div className="absolute bottom-[2px] right-4 flex items-end">
                      <div className="w-5 h-14 bg-amber-500 border-2 border-slate-800 rounded-sm rounded-tl-md -rotate-[5deg] origin-bottom-right"></div>
                      <div className="w-4 h-12 bg-green-600 border-2 border-slate-800 rounded-sm"></div>
                   </div>
                </div>
                <div className="w-full h-2 bg-[#6b472a] border-y-[2px] border-slate-800/50 mb-4 relative">
                   {/* Books on middle shelf */}
                   <div className="absolute bottom-[2px] left-4 flex items-end">
                      <div className="w-7 h-10 bg-slate-300 border-2 border-slate-800 rounded-sm"></div>
                      <div className="w-4 h-11 bg-sky-500 border-2 border-slate-800 rounded-sm ml-[-2px]"></div>
                      <div className="w-4 h-12 bg-rose-400 border-2 border-slate-800 rounded-sm ml-1 rotate-[15deg] origin-bottom-left"></div>
                   </div>
                   <div className="absolute bottom-[2px] right-2 flex items-end">
                      <div className="w-4 h-10 bg-teal-600 border-2 border-slate-800 rounded-sm rounded-tl-md -rotate-[12deg] origin-bottom-right"></div>
                      <div className="w-3 h-12 bg-indigo-600 border-2 border-slate-800 rounded-sm"></div>
                      <div className="w-5 h-11 bg-amber-500 border-2 border-slate-800 rounded-sm ml-[-2px]"></div>
                   </div>
                </div>
                <div className="w-full h-2 bg-[#6b472a] border-y-[2px] border-slate-800/50 mb-2 relative">
                   {/* Empty/Partial bottom shelf because table blocks it */}
                </div>
             </div>

             {/* Center Configuration */}
             <div className="relative w-56 h-40 flex flex-col items-center justify-end z-10 mb-5">
                 
                 {/* Stand-in table (Always present to anchor items) */}
                 <div className="absolute bottom-0 w-48 mx-auto flex flex-col items-center z-0">
                    <div className="w-full h-6 bg-slate-200 dark:bg-slate-700 border-[3px] border-slate-800 rounded-t-md shadow-sm relative">
                       {/* Table edge highlight */}
                       <div className="absolute top-0 right-0 w-full h-1 bg-white/40 rounded-t-md"></div>
                    </div>
                    {/* Table legs */}
                    <div className="flex justify-between w-40">
                       <div className="w-3 h-4 bg-slate-300 dark:bg-slate-600 border-x-[3px] border-slate-800"></div>
                       <div className="w-3 h-4 bg-slate-300 dark:bg-slate-600 border-x-[3px] border-slate-800"></div>
                    </div>
                 </div>

                 {/* Rehal */}
                 <div className={`absolute bottom-6 relative w-24 h-14 flex flex-col items-center justify-end z-10 transition-all duration-500 origin-bottom ${counts.rehal > 0 ? 'scale-100 opacity-100' : 'scale-50 opacity-0 translate-y-4'}`}>
                    {/* Rehal top crossed */}
                    <div className="absolute top-0 flex justify-center w-full z-10">
                       <div className="w-12 h-3 bg-amber-600 border-[2.5px] border-slate-800 rounded-sm transform rotate-[25deg] origin-bottom-right rounded-l-md -mr-0.5"></div>
                       <div className="w-12 h-3 bg-amber-700 border-[2.5px] border-slate-800 rounded-sm transform -rotate-[25deg] origin-bottom-left rounded-r-md -ml-0.5"></div>
                    </div>
                    {/* Rehal Legs */}
                    <div className="flex justify-between w-[4.5rem] mt-3">
                       <div className="w-3 h-6 bg-amber-800 border-[2.5px] border-slate-800 rounded-b-sm"></div>
                       <div className="w-3 h-6 bg-amber-800 border-[2.5px] border-slate-800 rounded-b-sm"></div>
                    </div>
                 </div>

                 {/* Open Quran placed on Rehal or Table */}
                 <div className={`absolute ${counts.rehal > 0 ? 'bottom-[4.5rem]' : 'bottom-[1.5rem]'} z-20 flex justify-center transition-all duration-500 origin-bottom ${counts.quran > 0 ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
                    <div className="relative flex">
                      {/* Left Page Group */}
                      <div className="w-16 h-10 bg-white border-[3px] border-slate-800 rounded-tl-md rounded-bl-sm transform skew-y-[15deg] origin-bottom-right flex justify-center items-center relative overflow-hidden shadow-[inset_-2px_-2px_6px_rgba(0,0,0,0.1)]">
                         <div className="w-12 h-7 bg-teal-600 border-[2px] border-slate-800 rounded-sm flex flex-col justify-center gap-1 p-1">
                           <div className="w-full h-0.5 bg-teal-300 rounded-full"></div>
                           <div className="w-full h-0.5 bg-teal-300 rounded-full"></div>
                         </div>
                         <div className="absolute top-0 left-0 w-full h-[3px] bg-slate-200"></div> {/* Page edges top */}
                      </div>
                      
                      {/* Center binding/spine */}
                      <div className="w-1 h-10 bg-slate-800 z-10 translate-y-[2px] rounded-b-sm"></div>
                      
                      {/* Right Page Group */}
                      <div className="w-16 h-10 bg-white border-[3px] border-slate-800 rounded-tr-md rounded-br-sm transform -skew-y-[15deg] origin-bottom-left flex justify-center items-center relative overflow-hidden shadow-[inset_2px_-2px_6px_rgba(0,0,0,0.1)]">
                         <div className="w-12 h-7 bg-teal-600 border-[2px] border-slate-800 rounded-sm flex flex-col justify-center gap-1 p-1">
                           <div className="w-full h-0.5 bg-teal-300 rounded-full"></div>
                           <div className="w-full h-0.5 bg-teal-300 rounded-full"></div>
                         </div>
                         {/* Bookmark */}
                         <div className="absolute top-[-2px] left-3 w-2 h-7 bg-amber-400 border-[2px] border-slate-800"></div>
                         <div className="absolute top-0 left-0 w-full h-[3px] bg-slate-200"></div> {/* Page edges top */}
                      </div>
                    </div>
                 </div>

                 {/* Stack of Iqro Books */}
                 <div className={`absolute bottom-6 left-2 flex flex-col items-center justify-end z-30 transition-all duration-500 origin-bottom ${counts.iqro > 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-50 translate-y-4'}`}>
                    <div className="w-14 h-3.5 bg-green-500 border-[2.5px] border-slate-800 rounded-sm -mb-[2px] relative z-10 flex items-center shadow-sm">
                       <div className="absolute top-0 left-1 w-1 h-full bg-slate-800/10"></div>
                       <div className="w-full h-[2px] bg-white/40 mt-auto mb-0.5 mx-1"></div>
                    </div>
                    <div className="w-14 h-3.5 bg-green-500 border-[2.5px] border-slate-800 rounded-sm -mb-[2px] rotate-[3deg] relative z-20 flex items-center bg-green-500 shadow-sm">
                       <div className="absolute top-0 left-1 w-1 h-full bg-slate-800/10"></div>
                       <div className="w-full h-[2px] bg-white/40 mt-auto mb-0.5 mx-1"></div>
                    </div>
                    <div className="w-14 h-4 bg-green-500 border-[2.5px] border-slate-800 rounded-sm flex items-center justify-center relative z-30 shadow-sm">
                       <div className="absolute top-0 left-1 w-1 h-full bg-slate-800/10"></div>
                       <span className="text-[7px] font-black text-slate-900 tracking-wider">IQRO</span>
                    </div>
                 </div>
             </div>

             {/* Initial State Box */}
             <div className={`absolute bottom-16 w-32 h-10 border-2 border-dashed border-slate-400 dark:border-slate-600 flex items-center justify-center rounded-lg transition-all duration-500 z-0 ${totalAmount > 0 ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`}>
                <span className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                  Mulai Wakaf
                </span>
             </div>

             {/* Floating Items */}
             <AnimatePresence>
               {counts.iqro > 0 && (
                 <motion.div key="iqro-wrap" className="absolute -left-10 top-1/2 z-40 drop-shadow-lg flex flex-col items-center">
                   {Array.from({ length: Math.min(counts.iqro, 2) }).map((_, i) => (
                     <motion.div 
                       key={`iqro-${i}`}
                       initial={{ scale: 0, opacity: 0, y: 10, rotate: -20 + i * 5 }} 
                       animate={{ scale: 1, opacity: 1, y: 0, rotate: i === 0 ? 0 : (i === 1 ? -15 : 15) }} 
                       exit={{ scale: 0, opacity: 0 }}
                       transition={{ type: "spring", stiffness: 300, damping: 15 }}
                       className={`text-[32px] sm:text-4xl ${i > 0 ? '-mt-5 z-10' : ''}`}
                       style={{ zIndex: 10 - i }}
                     >
                       {IQRO_EMOJIS[i % IQRO_EMOJIS.length]}
                     </motion.div>
                   ))}
                 </motion.div>
               )}
               
               {counts.quran > 0 && (
                 <motion.div key="quran-wrap" className="absolute -top-4 left-1/2 -translate-x-1/2 z-40 drop-shadow-lg flex flex-col items-center">
                   {Array.from({ length: Math.min(counts.quran, 2) }).map((_, i) => (
                     <motion.div 
                       key={`quran-${i}`}
                       initial={{ scale: 0, opacity: 0, y: 10, rotate: 10 }} 
                       animate={{ scale: 1, opacity: 1, y: 0, rotate: i === 0 ? 15 : (i === 1 ? -5 : 25) }} 
                       exit={{ scale: 0, opacity: 0 }}
                       transition={{ type: "spring", stiffness: 300, damping: 15 }}
                       className={`text-[28px] sm:text-3xl ${i > 0 ? '-mt-4 z-10' : ''}`}
                       style={{ zIndex: 10 - i }}
                     >
                       {QURAN_EMOJIS[i % QURAN_EMOJIS.length]}
                     </motion.div>
                   ))}
                 </motion.div>
               )}
             </AnimatePresence>
          </div>
        </div>
        
        {/* The 4 floating items */}
        <div className="absolute top-0 left-0 z-20">
           <ItemControl item={ITEMS[0]} count={counts.iqro} onAdd={() => updateCount('iqro', 1)} onSub={() => updateCount('iqro', -1)} onRipple={createRipple} />
        </div>
        <div className="absolute top-2 right-0 z-20">
           <ItemControl item={ITEMS[1]} count={counts.quran} onAdd={() => updateCount('quran', 1)} onSub={() => updateCount('quran', -1)} onRipple={createRipple} />
        </div>
        <div className="absolute bottom-4 left-0 z-20">
           <ItemControl item={ITEMS[2]} count={counts.rehal} onAdd={() => updateCount('rehal', 1)} onSub={() => updateCount('rehal', -1)} onRipple={createRipple} />
        </div>
        <div className="absolute bottom-2 right-0 z-20">
           <ItemControl item={ITEMS[3]} count={counts.rak} onAdd={() => updateCount('rak', 1)} onSub={() => updateCount('rak', -1)} onRipple={createRipple} />
        </div>
      </div>

      {/* Total and Action */}
      <div className="mt-6 flex flex-col items-center">
         <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Nilai Wakaf</div>
         <div className="text-3xl font-black text-teal-500 mb-6 drop-shadow-sm flex items-center gap-1">
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
            className={`w-full max-w-[300px] py-4 rounded-full font-bold flex items-center justify-center gap-2 transition-all duration-300 relative overflow-hidden ${totalAmount > 0 ? 'bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white shadow-lg shadow-teal-500/30 transform hover:-translate-y-1' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'}`}
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
           <BookMarked className="w-5 h-5" /> 
           {totalAmount > 0 ? 'Tunaikan Wakaf Qur\'an' : 'Pilih Paket Wakaf'}
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
       <div className={`w-14 h-14 md:w-16 md:h-16 rounded-full ${item.bg} shadow-sm border border-white/50 dark:border-slate-600 flex items-center justify-center relative transition-transform ${count > 0 ? 'scale-105 ring-2 ring-teal-500/20' : ''}`}>
         <item.icon className={`w-5 h-5 md:w-6 md:h-6 ${item.color}`} />
         {count > 0 && (
           <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1 -right-1 bg-teal-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black border-2 border-white dark:border-slate-800 shadow-sm">{count}</motion.span>
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
           className="w-6 h-6 rounded-full bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400 hover:bg-teal-100 transition-colors relative overflow-hidden"
         >
           <AnimatePresence>
            {localRipples.map(ripple => (
              <motion.span
                key={ripple.id}
                initial={{ scale: 0, opacity: 0.5 }}
                animate={{ scale: 4, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute bg-teal-400/30 rounded-full pointer-events-none"
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
