import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Plus, Minus, Book, Package, Shirt, Fuel } from 'lucide-react';
import { Program } from '../App';

interface DaiInteractiveProps {
  onAddToCart: (program: Program, amount: string) => void;
}

const ITEMS = [
  { id: 'food', name: 'Sembako', price: 100000, icon: Package, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  { id: 'clothes', name: 'Pakaian', price: 150000, icon: Shirt, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  { id: 'transport', name: 'Transport', price: 50000, icon: Fuel, color: 'text-rose-500', bg: 'bg-rose-100 dark:bg-rose-900/30' },
  { id: 'kit', name: 'Kit Dakwah', price: 75000, icon: Book, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
];

const FOOD_EMOJIS = ['🥘', '🍱', '🍚', '🍲'];
const CLOTHES_EMOJIS = ['👕', '🧥', '👖', '🧦'];
const KIT_EMOJIS = ['📚', '📖', '📗', '🗞️'];
const TRANSPORT_EMOJIS = ['🛵', '🚤', '🛶', '🚲'];

export const DaiInteractive: React.FC<DaiInteractiveProps> = ({ onAddToCart }) => {
  const [counts, setCounts] = useState<Record<string, number>>({
    food: 0,
    kit: 0,
    transport: 0,
    clothes: 0,
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
    food: [
      "Jazakumullahu khairan. Semoga Allah selalu melimpahkan rezeki yang berkah dan thayyib untuk Anda sekeluarga. Aamiin yaa robbal 'alamiin.",
      "Barakallahu laka fi ahlika wa malika. Ya Allah, jadikanlah hidangan ini saksi kebaikan hamba-Mu di yaumil hisab. Aamiin.",
      "Allahumma barik lahum fii maa rozaqtahum. Semoga kebaikan ini melapangkan rezeki dan menjauhkan Anda dari segala marabahaya. Aamiin.",
    ],
    clothes: [
      "Barakallahu fiikum. Ya Allah, gantilah pakaian saudaraku ini dengan sutra kemuliaan di surga kelak. Aamiin.",
      "Jazakumullahu ahsanal jaza. Semoga kebaikan ini menjadi peneduh dan pelindung Anda di hari akhir. Aamiin yaa Mujiibassailiin.",
      "Allahummas turnaa bi sitrikal jamiil. Semoga Allah senantiasa menutupi aib dan menjaga kehormatan hamba-Nya yang dermawan ini. Aamiin.",
    ],
    transport: [
      "Jazakumullahu khairan katsiran. Semoga setiap putaran roda dakwah ini, menjadi pelancar bagi urusan dunia dan akhirat Anda. Aamiin.",
      "Sallamallahu ahlakum wa malakum. Ya Allah, mudahkanlah setiap langkah kaki donatur kami menuju keridhaan-Mu. Aamiin.",
      "Barakallahu fiikum. Semoga Allah melapangkan jalan Anda menuju surga-Nya, sebagaimana Anda melancarkan langkah para dai. Aamiin.",
    ],
    kit: [
      "Barakallahu laka fi ahlika wa malika. Semoga setiap huruf yang memancarkan hidayah, mengalirkan pahala jariyah tak terputus untuk Anda. Aamiin.",
      "Yassirallahu umuurakum. Ya Allah, anugerahkanlah ilmu yang bermanfaat dan keberkahan yang tiada henti bagi hamba-Mu ini. Aamiin.",
      "Jazakumullahu jannatal firdaus. Semoga sedekah jariyah ini menjadi lentera penerang di kehidupan dunia dan akhirat kelak. Aamiin yaa robbal 'alamiin.",
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
    
    const daiProgram: Program = {
      id: 9999, // Unique ID
      title: "Bekal Dai Pelosok",
      category: "Pendidikan & Dakwah",
      description: "Dukungan bekal untuk para Dai yang mengabdi berdakwah di pelosok Nusantara.",
      image: "https://images.unsplash.com/photo-1511883497918-090c88bc6110?auto=format&fit=crop&q=80&w=800",
      collected: 10000000,
      target: 50000000,
      donors: 150
    };

    onAddToCart(daiProgram, totalAmount.toString());
    
    setCounts({
      food: 0,
      kit: 0,
      transport: 0,
      clothes: 0,
    });
  };

  return (
    <div className="w-full max-w-xl mx-auto py-10 px-4 md:px-8 bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 dark:border-slate-700/50 text-center relative my-12 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#1799dc]/5 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -z-10 -translate-x-1/2 translate-y-1/2"></div>

      <div className="mb-10 text-center flex flex-col items-center">
        <span className="bg-[#1799dc]/10 text-[#1799dc] font-bold px-3 py-1 text-[10px] md:text-xs rounded-full uppercase tracking-widest mb-3">Jejak Dakwah Nusantara</span>
        <h2 className="text-2xl md:text-3xl font-serif font-black text-slate-900 dark:text-white mb-3">Temani Dai ke Pelosok</h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm max-w-sm">Ribuan kilometer mereka tempuh demi membawa cahaya Islam. Mari ringankan langkah mereka dengan bekal kebaikan dari Anda.</p>
      </div>

      <div className="relative w-full max-w-[360px] md:max-w-[400px] mx-auto h-[320px] flex items-center justify-center mt-2 md:mt-4">
        
        {/* Center Avatar */}
        <div className="absolute z-10 flex flex-col items-center pointer-events-none scale-[0.85] sm:scale-100">
          <div className="relative w-32 h-44 mt-4">
             {/* Cap (Peci) */}
             <div className={`absolute top-1 left-1/2 -translate-x-1/2 w-[72px] h-7 bg-slate-800 border-[3px] border-slate-900 dark:border-slate-800 rounded-t-[12px] z-[35] transition-all duration-500 ${counts.clothes > 0 ? 'scale-100 opacity-100' : 'scale-75 opacity-0 -translate-y-4'}`}></div>

             {/* Head */}
             <div className="absolute top-5 left-1/2 -translate-x-1/2 w-20 h-20 bg-[#fce5d8] border-[3px] border-slate-900 dark:border-slate-800 rounded-[35px] z-20 flex flex-col items-center justify-center overflow-hidden shadow-[inset_0_-4px_8px_rgba(0,0,0,0.05)]">
               {/* Hair if no cap */}
               <div className={`absolute -top-1 left-1/2 -translate-x-1/2 w-[120%] h-10 bg-slate-900 dark:bg-slate-900 rounded-b-[20px] transition-all duration-500 ${counts.clothes > 0 ? 'opacity-0 scale-y-50' : 'opacity-100 scale-100'} origin-top z-30`}></div>
               
               <div className="absolute top-[32px] flex gap-[18px] z-30">
                 {/* Eyes */}
                 <div className="w-2.5 h-3 overflow-hidden relative flex items-center justify-center">
                    <div className={`w-2.5 h-3.5 bg-slate-900 dark:bg-slate-800 rounded-full transition-transform duration-300 ${totalAmount > 0 ? 'translate-y-0' : 'translate-y-[2px]'}`}></div>
                 </div>
                 <div className="w-2.5 h-3 overflow-hidden relative flex items-center justify-center">
                    <div className={`w-2.5 h-3.5 bg-slate-900 dark:bg-slate-800 rounded-full transition-transform duration-300 ${totalAmount > 0 ? 'translate-y-0' : 'translate-y-[2px]'}`}></div>
                 </div>
               </div>
               
               {/* Smile */}
               <div className={`absolute top-[48px] border-slate-900 dark:border-slate-800 transition-all duration-300 z-30 ${totalAmount > 0 ? 'w-5 h-3.5 rounded-b-[10px] border-b-[3px] border-x-[3px]' : 'w-3 h-1 border-b-[3px] rounded-full'}`}></div>
               
               {/* Blush */}
               <div className={`absolute top-[42px] -left-1 w-3 h-1.5 bg-rose-400 rounded-full blur-[2px] transition-opacity ${totalAmount > 0 ? 'opacity-80' : 'opacity-0'}`}></div>
               <div className={`absolute top-[42px] -right-1 w-3 h-1.5 bg-rose-400 rounded-full blur-[2px] transition-opacity ${totalAmount > 0 ? 'opacity-80' : 'opacity-0'}`}></div>
             </div>

             {/* Ears */}
             <div className="absolute top-[48px] left-[18px] w-3 h-4 bg-[#fce5d8] border-[3px] border-slate-900 dark:border-slate-800 rounded-l-full z-10"></div>
             <div className="absolute top-[48px] right-[18px] w-3 h-4 bg-[#fce5d8] border-[3px] border-slate-900 dark:border-slate-800 rounded-r-full z-10"></div>

             {/* Body */}
             <div className={`absolute top-[92px] left-1/2 -translate-x-1/2 w-24 h-20 rounded-t-[30px] border-[3px] border-slate-900 dark:border-slate-800 z-10 flex flex-col items-center overflow-hidden transition-all duration-500 shadow-[inset_0_-10px_10px_rgba(0,0,0,0.05)] ${counts.clothes > 0 ? 'bg-white' : 'bg-slate-200 dark:bg-slate-700'}`}>
               {/* Collar Detail */}
               <div className={`absolute -top-1 w-full h-8 flex justify-center transition-all duration-500 ${counts.clothes > 0 ? 'opacity-100' : 'opacity-0'}`}>
                 <div className="w-0 h-0 border-l-[15px] border-r-[15px] border-t-[20px] border-l-transparent border-r-transparent border-t-[#fce5d8] z-20"></div>
                 {/* Collar outline */}
                 <div className="absolute top-0 w-0 h-0 border-l-[18px] border-r-[18px] border-t-[24px] border-l-transparent border-r-transparent border-t-slate-900 dark:border-t-slate-800 z-10"></div>
               </div>
               
               {/* Tie/Line */}
               <div className={`absolute top-4 w-[3px] h-full bg-slate-900 dark:bg-slate-800 transition-all duration-500 delay-100 z-30 ${counts.clothes > 0 ? 'opacity-100' : 'opacity-0'}`}></div>
             </div>

             {/* Items that appear on Avatar */}
             <AnimatePresence>
               {counts.food > 0 && (
                 <motion.div key="food-wrap" className="absolute -left-6 bottom-4 z-30 drop-shadow-xl saturate-150 flex flex-col items-center">
                   {Array.from({ length: Math.min(counts.food, 3) }).map((_, i) => (
                     <motion.div 
                       key={`food-${i}`}
                       initial={{ scale: 0, opacity: 0, y: 10, rotate: -20 + i * 5 }} 
                       animate={{ scale: 1, opacity: 1, y: 0, rotate: i === 0 ? 0 : (i === 1 ? -15 : 15) }} 
                       exit={{ scale: 0, opacity: 0 }}
                       transition={{ type: "spring", stiffness: 300, damping: 15 }}
                       className={`text-[32px] sm:text-4xl ${i > 0 ? '-mt-6' : ''}`}
                       style={{ zIndex: 10 - i }}
                     >
                       {FOOD_EMOJIS[i % FOOD_EMOJIS.length]}
                     </motion.div>
                   ))}
                   {counts.food > 3 && (
                     <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-3 -right-3 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white shadow-sm z-50">
                       +{counts.food - 3}
                     </motion.div>
                   )}
                 </motion.div>
               )}
               
               {counts.clothes > 1 && (
                 <motion.div key="clothes-wrap" className="absolute -top-4 -right-2 z-30 drop-shadow-xl saturate-150 flex flex-col items-center">
                   {Array.from({ length: Math.min(counts.clothes - 1, 3) }).map((_, i) => (
                     <motion.div 
                       key={`clothes-${i}`}
                       initial={{ scale: 0, opacity: 0, y: 10, rotate: 10 }} 
                       animate={{ scale: 1, opacity: 1, y: 0, rotate: i === 0 ? 15 : (i === 1 ? 5 : 25) }} 
                       exit={{ scale: 0, opacity: 0 }}
                       transition={{ type: "spring", stiffness: 300, damping: 15 }}
                       className={`text-[24px] sm:text-3xl ${i > 0 ? '-mt-4' : ''}`}
                       style={{ zIndex: 10 - i }}
                     >
                       {CLOTHES_EMOJIS[i % CLOTHES_EMOJIS.length]}
                     </motion.div>
                   ))}
                   {counts.clothes > 4 && (
                     <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-3 -right-3 bg-[#1799dc] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white shadow-sm z-50">
                       +{counts.clothes - 4}
                     </motion.div>
                   )}
                 </motion.div>
               )}

               {counts.kit > 0 && (
                 <motion.div key="kit-wrap" className="absolute -right-4 bottom-8 z-30 drop-shadow-xl saturate-150 flex flex-col items-center">
                   {Array.from({ length: Math.min(counts.kit, 3) }).map((_, i) => (
                     <motion.div 
                       key={`kit-${i}`}
                       initial={{ scale: 0, opacity: 0, y: -10, rotate: 20 - i * 5 }} 
                       animate={{ scale: 1, opacity: 1, y: 0, rotate: i === 0 ? 0 : (i === 1 ? 15 : -15) }} 
                       exit={{ scale: 0, opacity: 0 }} 
                       transition={{ type: "spring", stiffness: 300, damping: 15 }}
                       className={`text-[32px] sm:text-4xl ${i > 0 ? '-mt-5' : ''}`}
                       style={{ zIndex: 10 - i }}
                     >
                       {KIT_EMOJIS[i % KIT_EMOJIS.length]}
                     </motion.div>
                   ))}
                   {counts.kit > 3 && (
                     <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-3 -right-3 bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white shadow-sm z-50">
                       +{counts.kit - 3}
                     </motion.div>
                   )}
                 </motion.div>
               )}
               {counts.transport > 0 && (
                 <motion.div key="transport-wrap" className="absolute left-1/2 -translate-x-1/2 -bottom-2 z-40 drop-shadow-xl saturate-150 flex flex-row items-center justify-center">
                   {Array.from({ length: Math.min(counts.transport, 3) }).map((_, i) => (
                     <motion.div 
                       key={`transport-${i}`}
                       initial={{ scale: 0, opacity: 0, x: -20 }} 
                       animate={{ scale: 1, opacity: 1, x: 0 }} 
                       exit={{ scale: 0, opacity: 0 }} 
                       transition={{ type: "spring", stiffness: 300, damping: 15, delay: i * 0.1 }}
                       className={`text-[40px] sm:text-5xl ${i > 0 ? '-ml-5 scale-90' : 'z-10'}`}
                       style={{ zIndex: 10 - i }}
                     >
                       {TRANSPORT_EMOJIS[i % TRANSPORT_EMOJIS.length]}
                     </motion.div>
                   ))}
                   {counts.transport > 3 && (
                     <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-2 -right-4 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white shadow-sm z-50">
                       +{counts.transport - 3}
                     </motion.div>
                   )}
                 </motion.div>
               )}
             </AnimatePresence>
          </div>
        </div>
        
        {/* The 4 floating items */}
        <div className="absolute top-0 left-0 z-20">
           <ItemControl item={ITEMS[0]} count={counts.food} onAdd={() => updateCount('food', 1)} onSub={() => updateCount('food', -1)} onRipple={createRipple} />
        </div>
        <div className="absolute top-0 right-0 z-20">
           <ItemControl item={ITEMS[1]} count={counts.clothes} onAdd={() => updateCount('clothes', 1)} onSub={() => updateCount('clothes', -1)} onRipple={createRipple} />
        </div>
        <div className="absolute bottom-4 left-0 z-20">
           <ItemControl item={ITEMS[2]} count={counts.transport} onAdd={() => updateCount('transport', 1)} onSub={() => updateCount('transport', -1)} onRipple={createRipple} />
        </div>
        <div className="absolute bottom-4 right-0 z-20">
           <ItemControl item={ITEMS[3]} count={counts.kit} onAdd={() => updateCount('kit', 1)} onSub={() => updateCount('kit', -1)} onRipple={createRipple} />
        </div>
      </div>

      {/* Total and Action */}
      <div className="mt-6 flex flex-col items-center">
         <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Nilai Kebaikan Anda</div>
         <div className="text-3xl font-black text-[#1799dc] mb-6 drop-shadow-sm flex items-center gap-1">
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
            className={`w-full max-w-[300px] py-4 rounded-full font-bold flex items-center justify-center gap-2 transition-all duration-300 relative overflow-hidden ${totalAmount > 0 ? 'bg-gradient-to-r from-[#1799dc] to-[#2db2f5] hover:from-[#1588c4] hover:to-[#22a1de] text-white shadow-lg shadow-[#1799dc]/30 transform hover:-translate-y-1' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'}`}
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
           {totalAmount > 0 ? 'Titipkan Bekal Kebaikan' : 'Pilih Bekal Untuk Dai'}
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
       <div className={`w-14 h-14 md:w-16 md:h-16 rounded-full ${item.bg} shadow-sm border border-white/50 dark:border-slate-600 flex items-center justify-center relative transition-transform ${count > 0 ? 'scale-105 ring-2 ring-[#1799dc]/20' : ''}`}>
         <item.icon className={`w-5 h-5 md:w-6 md:h-6 ${item.color}`} />
         {count > 0 && (
           <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black border-2 border-white dark:border-slate-800 shadow-sm">{count}</motion.span>
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
