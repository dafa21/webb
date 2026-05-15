import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Minus, BookOpen, Shirt, Briefcase, GraduationCap, School } from 'lucide-react';
import { Program } from '../App';

interface PendidikanInteractiveProps {
  onAddToCart: (program: Program, amount: string) => void;
}

const ITEMS = [
  { id: 'buku', name: 'Buku & Alat', price: 50000, icon: BookOpen, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  { id: 'tas', name: 'Tas Sekolah', price: 75000, icon: Briefcase, color: 'text-rose-500', bg: 'bg-rose-100 dark:bg-rose-900/30' },
  { id: 'seragam', name: 'Seragam', price: 100000, icon: Shirt, color: 'text-sky-500', bg: 'bg-sky-100 dark:bg-sky-900/30' },
  { id: 'spp', name: 'Beasiswa', price: 200000, icon: GraduationCap, color: 'text-indigo-500', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
];

const BUKU_EMOJIS = ['📚', '✏️', '📝', '📏'];
const TAS_EMOJIS = ['🎒', '💼', '🎒', '✨'];
const SERAGAM_EMOJIS = ['👕', '👔', '👖', '👟'];
const SPP_EMOJIS = ['🎓', '🏫', '💡', '🌟'];

export const PendidikanInteractive: React.FC<PendidikanInteractiveProps> = ({ onAddToCart }) => {
  const [counts, setCounts] = useState<Record<string, number>>({
    buku: 0,
    tas: 0,
    seragam: 0,
    spp: 0,
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
    buku: [
      "Jazakumullahu khairan. Semoga setiap huruf yang mereka pelajari mengalirkan pahala untuk Anda. Aamiin.",
      "Barakallahu fiikum. Ya Allah, terangkanlah jalan ilmu bagi donatur kami sebagaimana mereka menerangi generasi ini. Aamiin.",
    ],
    tas: [
      "Jazakumullahu ahsanal jaza. Semoga kebaikan ini meringankan beban Anda di dunia dan akhirat. Aamiin.",
      "Barakallahu laka fi ahlika wa malika. Semoga setiap bekal ilmu yang dibawa memberatkan timbangan amal Anda. Aamiin.",
    ],
    seragam: [
      "Allahumma barik lahum. Semoga Allah memakaikan Anda pakaian kemuliaan di surga kelak. Aamiin.",
      "Jazakumullahu khairan. Semoga wibawa dan kehormatan selalu dijaga oleh Allah untuk Anda dan keluarga. Aamiin.",
    ],
    spp: [
      "Barakallahu fiikum. Ya Allah, mudahkanlah segala urusan hamba-Mu yang memastikan masa depan yatim ini. Aamiin.",
      "Jazakumullahu jannatal firdaus. Semoga derajat Anda diangkat melalui setiap ilmu yang diamalkan oleh mereka. Aamiin.",
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
      id: 9996,
      title: "Beasiswa Yatim & Dhuafa",
      category: "Pendidikan",
      description: "Bantuan pendidikan, seragam, sekolah dan beasiswa untuk anak yatim dan dhuafa di pelosok nusantara.",
      image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800",
      collected: 85000000,
      target: 200000000,
      donors: 420
    };

    onAddToCart(program, totalAmount.toString());
    
    setCounts({
      buku: 0,
      tas: 0,
      seragam: 0,
      spp: 0,
    });
  };

  return (
    <div className="w-full max-w-xl mx-auto py-10 px-4 md:px-8 bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 dark:border-slate-700/50 text-center relative my-12 overflow-hidden snap-center shrink-0">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -z-10 -translate-x-1/2 translate-y-1/2"></div>

      <div className="mb-10 text-center flex flex-col items-center w-full">
        <span className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-500 font-bold px-3 py-1 text-[10px] md:text-xs rounded-full uppercase tracking-widest mb-3">Generasi Gemilang</span>
        <h2 className="text-2xl md:text-3xl font-serif font-black text-slate-900 dark:text-white mb-3">Beasiswa Yatim Pelosok</h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm max-w-sm mb-6">Cerahkan masa depan mereka. Sedekah Anda adalah langkah nyata mewujudkan mimpi anak pelosok negeri.</p>
        
        {/* Progress Bar Donasi */}
        <div className="w-full max-w-[280px] bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50">
          <div className="flex justify-between items-end mb-2.5">
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              Terkumpul
            </span>
            <span className="text-sm font-black text-indigo-500">
              Rp {new Intl.NumberFormat('id-ID').format(85000000)}
            </span>
          </div>
          <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden relative shadow-inner">
            <motion.div 
              initial={{ width: 0 }}
              whileInView={{ width: '42.5%' }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"
            />
          </div>
          <div className="mt-2 text-right">
            <span className="text-[9px] text-slate-400">dari target Rp 200.000.000</span>
          </div>
        </div>
      </div>

      <div className="relative w-full max-w-[360px] md:max-w-[400px] mx-auto h-[320px] flex items-center justify-center mt-2 md:mt-4">
        
        {/* Center Canvas */}
        <div className="absolute z-10 flex flex-col items-center pointer-events-none scale-[0.85] sm:scale-100">
          <div className="relative w-48 h-56 mt-4 flex items-end justify-center">
             
             {/* School Background (Appears with SPP) */}
             <div className={`absolute bottom-4 w-52 h-40 bg-slate-100 dark:bg-slate-700/50 border-4 border-slate-300 dark:border-slate-600 rounded-t-2xl -z-10 flex flex-col items-center justify-end overflow-hidden transition-all duration-700 origin-bottom ${counts.spp > 0 ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
                {/* School Clock / Window */}
                <div className="absolute top-4 w-8 h-8 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 flex items-center justify-center">
                  <div className="w-1 h-3 bg-slate-400 origin-bottom translate-y-[-2px] rotate-45"></div>
                  <div className="absolute w-1 h-2 bg-slate-500 origin-bottom translate-y-[-2px] rotate-[120deg]"></div>
                </div>
                {/* School Doors */}
                <div className="flex gap-2">
                   <div className="w-10 h-16 border-t-2 border-x-2 border-slate-300 dark:border-slate-600 rounded-t-lg bg-white/50 dark:bg-slate-800/50"></div>
                   <div className="w-10 h-16 border-t-2 border-x-2 border-slate-300 dark:border-slate-600 rounded-t-lg bg-white/50 dark:bg-slate-800/50"></div>
                </div>
             </div>

              {/* Student Silhouette / Base */}
             <div className="relative w-28 h-36 flex flex-col items-center z-10">
               
               {/* Graduation Cap (Appears with SPP) */}
               <div className={`absolute -top-7 left-1/2 w-16 h-12 -translate-x-1/2 flex flex-col items-center justify-end z-30 transition-transform duration-500 origin-bottom ${counts.spp > 0 ? 'scale-100' : 'scale-0'}`}>
                 {/* Cap Top */}
                 <div className="absolute top-0 w-14 h-14 bg-indigo-700 border-[3px] border-slate-800 rotate-45 scale-y-50 z-20"></div>
                 {/* Cap Base */}
                 <div className="w-10 h-6 bg-indigo-600 border-[3px] border-slate-800 border-t-0 z-10 translate-y-[-12px]"></div>
                 {/* Tassel */}
                 <div className="absolute top-5 right-1 w-1 h-6 bg-amber-400 z-30 origin-top rotate-12"></div>
                 <div className="absolute top-10 -right-1.5 w-3 h-4 bg-amber-400 z-30 rotate-12 flex items-end">
                   <div className="w-full h-1 bg-slate-800/20"></div>
                 </div>
               </div>

               {/* Head Container */}
               <div className="relative mt-1 z-20">
                 {/* Ears */}
                 <div className="absolute top-7 -left-1.5 w-3 h-3.5 bg-[#ffebd4] dark:bg-[#dcae8a] border-[2.5px] border-slate-800 rounded-l-full z-10"></div>
                 <div className="absolute top-7 -right-1.5 w-3 h-3.5 bg-[#ffebd4] dark:bg-[#dcae8a] border-[2.5px] border-slate-800 rounded-r-full z-10"></div>
                 
                 {/* Head */}
                 <div className="w-16 h-16 bg-[#ffebd4] dark:bg-[#dcae8a] border-[3px] border-slate-800 rounded-full z-20 shadow-sm relative flex justify-center">
                   {/* Hair */}
                   <div className="absolute -top-[1px] w-[58px] left-1/2 -translate-x-1/2 h-7 bg-slate-800 rounded-t-full border-b-[3px] border-slate-800 z-30"></div>
                   <div className="absolute top-5 left-1 w-3 h-3 bg-slate-800 rounded-br-full -rotate-[20deg] border-b-[3px] border-slate-800 z-30"></div>
                   <div className="absolute top-5 right-1 w-3 h-3 bg-slate-800 rounded-bl-full rotate-[20deg] border-b-[3px] border-slate-800 z-30"></div>
                   
                   {/* Cowlick */}
                   <div className={`absolute -top-3 left-1/2 w-2 h-4 border-l-[3px] border-t-[3px] border-slate-800 rounded-tl-full rotate-12 transition-opacity duration-300 z-20 ${counts.spp > 0 ? 'opacity-0' : 'opacity-100'}`}></div>

                   {/* Eyes */}
                   <div className="absolute top-[34px] left-3.5 w-1.5 h-3 bg-slate-800 rounded-full z-30"></div>
                   <div className="absolute top-[34px] right-3.5 w-1.5 h-3 bg-slate-800 rounded-full z-30"></div>
                   
                   {/* Blush */}
                   <div className="absolute top-[40px] left-1 w-3 h-1.5 bg-rose-400 rounded-full opacity-60 z-30 -rotate-6"></div>
                   <div className="absolute top-[40px] right-1 w-3 h-1.5 bg-rose-400 rounded-full opacity-60 z-30 rotate-6"></div>

                   {/* Smile (Happy open mouth) */}
                   <div className="absolute top-[40px] left-1/2 -translate-x-1/2 w-4 h-3 bg-rose-500 border-[2.5px] border-slate-800 rounded-b-full z-30 overflow-hidden">
                     {/* Tongue */}
                     <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-1.5 bg-rose-300 rounded-t-full"></div>
                   </div>
                 </div>
               </div>
               
               {/* Body Container */}
               <div className="relative z-10 w-[90px] flex justify-center mt-[-4px]">
                 
                 {/* Backpack behind body */}
                 <div className={`absolute top-2 left-1/2 -translate-x-1/2 w-[76px] h-20 bg-rose-500 border-[3px] border-slate-800 rounded-2xl transition-all duration-300 -z-20 ${counts.tas > 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-90 translate-y-2'}`}>
                    {/* Top handle loop */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-4 border-[3px] border-slate-800 rounded-t-[8px] -z-30"></div>
                 </div>

                 {/* Arms */}
                 <div className={`absolute top-2 -left-1 w-5 h-[4.5rem] border-[3px] border-slate-800 rounded-full -z-10 origin-top rotate-[20deg] transition-colors duration-500 ${counts.seragam > 0 ? 'bg-white' : 'bg-slate-300 dark:bg-slate-600'}`}>
                   {/* Hand / Cuff */}
                   <div className="absolute bottom-0 left-0 w-full h-3 border-t-[3px] border-slate-800 bg-[#ffebd4] dark:bg-[#dcae8a] rounded-b-full"></div>
                 </div>
                 <div className={`absolute top-2 -right-1 w-5 h-[4.5rem] border-[3px] border-slate-800 rounded-full -z-10 origin-top -rotate-[20deg] transition-colors duration-500 ${counts.seragam > 0 ? 'bg-white' : 'bg-slate-300 dark:bg-slate-600'}`}>
                   {/* Hand / Cuff */}
                   <div className="absolute bottom-0 left-0 w-full h-3 border-t-[3px] border-slate-800 bg-[#ffebd4] dark:bg-[#dcae8a] rounded-b-full"></div>
                 </div>

                 {/* Body (Shirt) */}
                 <div className={`w-[60px] h-[64px] border-[3px] border-slate-800 rounded-t-[2rem] rounded-b-md relative overflow-hidden transition-colors duration-500 ${counts.seragam > 0 ? 'bg-white' : 'bg-slate-300 dark:bg-slate-600'}`}>
                   {counts.seragam > 0 && (
                     <>
                       {/* Tie or Collar */}
                       <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-slate-800"></div>
                       <div className="absolute top-2 left-1/2 -translate-x-1/2 w-3.5 h-10 bg-red-500 rounded-b-sm border-[2.5px] border-slate-800 shadow-[inset_-1px_0_0_rgba(0,0,0,0.1)] z-10"></div>
                       {/* Pocket */}
                       <div className="absolute top-6 right-2 w-3 h-4 border-[2.5px] border-slate-800 rounded-b-md"></div>
                     </>
                   )}

                   {/* Backpack Straps */}
                   <div className={`absolute top-0 w-full h-full flex justify-between px-2 pointer-events-none transition-opacity duration-300 z-20 ${counts.tas > 0 ? 'opacity-100' : 'opacity-0'}`}>
                      <div className="w-3 h-full bg-rose-500 border-x-[2.5px] border-slate-800 relative">
                        {/* Buckle */}
                        <div className="absolute top-8 -left-[2.5px] w-[13px] h-2.5 border-[2.5px] border-slate-800 bg-slate-300 rounded-sm"></div>
                      </div>
                      <div className="w-3 h-full bg-rose-500 border-x-[2.5px] border-slate-800 relative">
                        {/* Buckle */}
                        <div className="absolute top-8 -left-[2.5px] w-[13px] h-2.5 border-[2.5px] border-slate-800 bg-slate-300 rounded-sm"></div>
                      </div>
                   </div>
                 </div>
               </div>
             </div>

             {/* Stack of Books (Appears with Buku) */}
             <div className={`absolute bottom-0 -right-6 flex flex-col items-center justify-end z-20 transition-all duration-500 ${counts.buku > 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-50 translate-y-4'}`}>
                <div className="w-16 h-4 bg-emerald-400 border-2 border-slate-800 rounded-sm -mb-1 rotate-[-2deg] flex items-center px-1"><div className="w-full h-1 bg-white/50"></div></div>
                <div className="w-14 h-4 bg-amber-400 border-2 border-slate-800 rounded-sm -mb-1 rotate-[3deg] flex items-center px-1"><div className="w-full h-1 bg-white/50"></div></div>
                <div className="w-12 h-5 bg-sky-400 border-2 border-slate-800 rounded-sm rotate-[-5deg] relative">
                  <div className="absolute top-1/2 -translate-y-1/2 w-full h-[2px] bg-slate-800 border-y-[1px] border-white"></div>
                </div>
             </div>

             {/* Graduate Diploma (Appears with SPP) */}
             {counts.spp > 0 && (
               <motion.div 
                 initial={{ scale: 0, opacity: 0, rotate: -45 }}
                 animate={{ scale: 1, opacity: 1, rotate: 15 }}
                 transition={{ type: "spring", delay: 0.5 }}
                 className="absolute top-16 -right-2 w-4 h-12 bg-[#ffeebb] border-2 border-slate-800 rounded-sm z-30"
               >
                 <div className="absolute top-1/2 -translate-y-1/2 -left-1 w-6 h-2 bg-red-500 border-2 border-slate-800 rounded-sm"></div>
               </motion.div>
             )}

             {/* Initial State Box */}
             <div className={`absolute bottom-20 w-32 h-10 border-2 border-dashed border-slate-400 dark:border-slate-600 flex items-center justify-center rounded-lg transition-all duration-500 z-0 ${totalAmount > 0 ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`}>
                <span className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                  Mulai Bekali
                </span>
             </div>

             {/* Items that appear floating around */}
             <AnimatePresence>
               {counts.buku > 0 && (
                 <motion.div key="buku-wrap" className="absolute -left-6 bottom-4 z-40 drop-shadow-lg flex flex-col items-center">
                   {Array.from({ length: Math.min(counts.buku, 3) }).map((_, i) => (
                     <motion.div 
                       key={`buku-${i}`}
                       initial={{ scale: 0, opacity: 0, y: 10, rotate: -20 + i * 5 }} 
                       animate={{ scale: 1, opacity: 1, y: 0, rotate: i === 0 ? 0 : (i === 1 ? -15 : 15) }} 
                       exit={{ scale: 0, opacity: 0 }}
                       transition={{ type: "spring", stiffness: 300, damping: 15 }}
                       className={`text-[32px] sm:text-4xl ${i > 0 ? '-mt-5 z-10' : ''}`}
                       style={{ zIndex: 10 - i }}
                     >
                       {BUKU_EMOJIS[i % BUKU_EMOJIS.length]}
                     </motion.div>
                   ))}
                 </motion.div>
               )}
               
               {counts.tas > 0 && (
                 <motion.div key="tas-wrap" className="absolute left-6 -top-2 z-40 drop-shadow-lg flex flex-col items-center">
                   {Array.from({ length: Math.min(counts.tas, 2) }).map((_, i) => (
                     <motion.div 
                       key={`tas-${i}`}
                       initial={{ scale: 0, opacity: 0, y: 10, rotate: 10 }} 
                       animate={{ scale: 1, opacity: 1, y: 0, rotate: i === 0 ? 15 : (i === 1 ? 5 : 25) }} 
                       exit={{ scale: 0, opacity: 0 }}
                       transition={{ type: "spring", stiffness: 300, damping: 15 }}
                       className={`text-[28px] sm:text-3xl ${i > 0 ? '-mt-4 z-10' : ''}`}
                       style={{ zIndex: 10 - i }}
                     >
                       {TAS_EMOJIS[i % TAS_EMOJIS.length]}
                     </motion.div>
                   ))}
                 </motion.div>
               )}

               {counts.seragam > 0 && (
                 <motion.div key="seragam-wrap" className="absolute right-6 top-8 z-50 drop-shadow-lg flex flex-col items-center">
                   {Array.from({ length: Math.min(counts.seragam, 2) }).map((_, i) => (
                     <motion.div 
                       key={`seragam-${i}`}
                       initial={{ scale: 0, opacity: 0, y: -20, rotate: 20 - i * 5 }} 
                       animate={{ scale: 1, opacity: 1, y: 0, rotate: i === 0 ? 0 : (i === 1 ? 15 : -15) }} 
                       exit={{ scale: 0, opacity: 0 }} 
                       transition={{ type: "spring", stiffness: 300, damping: 15 }}
                       className={`text-[32px] sm:text-4xl ${i > 0 ? '-mt-3 z-10' : ''}`}
                       style={{ zIndex: 10 - i }}
                     >
                       {SERAGAM_EMOJIS[i % SERAGAM_EMOJIS.length]}
                     </motion.div>
                   ))}
                 </motion.div>
               )}
               {counts.spp > 0 && (
                 <motion.div key="spp-wrap" className="absolute -right-8 bottom-20 z-40 drop-shadow-lg flex flex-col items-center justify-center">
                   {Array.from({ length: Math.min(counts.spp, 2) }).map((_, i) => (
                     <motion.div 
                       key={`spp-${i}`}
                       initial={{ scale: 0, opacity: 0, x: -20 }} 
                       animate={{ scale: 1, opacity: 1, x: 0 }} 
                       exit={{ scale: 0, opacity: 0 }} 
                       transition={{ type: "spring", stiffness: 300, damping: 15, delay: i * 0.1 }}
                       className={`text-[28px] sm:text-3xl ${i > 0 ? '-mt-5 scale-90 z-10' : 'z-10'}`}
                       style={{ zIndex: 10 - i }}
                     >
                       {SPP_EMOJIS[i % SPP_EMOJIS.length]}
                     </motion.div>
                   ))}
                 </motion.div>
               )}
             </AnimatePresence>
          </div>
        </div>
        
        {/* The 4 floating items */}
        <div className="absolute top-0 left-0 z-20">
           <ItemControl item={ITEMS[0]} count={counts.buku} onAdd={() => updateCount('buku', 1)} onSub={() => updateCount('buku', -1)} onRipple={createRipple} />
        </div>
        <div className="absolute top-2 right-0 z-20">
           <ItemControl item={ITEMS[1]} count={counts.tas} onAdd={() => updateCount('tas', 1)} onSub={() => updateCount('tas', -1)} onRipple={createRipple} />
        </div>
        <div className="absolute bottom-4 left-0 z-20">
           <ItemControl item={ITEMS[2]} count={counts.seragam} onAdd={() => updateCount('seragam', 1)} onSub={() => updateCount('seragam', -1)} onRipple={createRipple} />
        </div>
        <div className="absolute bottom-2 right-0 z-20">
           <ItemControl item={ITEMS[3]} count={counts.spp} onAdd={() => updateCount('spp', 1)} onSub={() => updateCount('spp', -1)} onRipple={createRipple} />
        </div>
      </div>

      {/* Total and Action */}
      <div className="mt-6 flex flex-col items-center">
         <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Nilai Pendidikan</div>
         <div className="text-3xl font-black text-indigo-500 mb-6 drop-shadow-sm flex items-center gap-1">
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
            className={`w-full max-w-[300px] py-4 rounded-full font-bold flex items-center justify-center gap-2 transition-all duration-300 relative overflow-hidden ${totalAmount > 0 ? 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/30 transform hover:-translate-y-1' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'}`}
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
           <School className="w-5 h-5" /> 
           {totalAmount > 0 ? 'Salurkan Beasiswa' : 'Pilih Bekal Sekolah'}
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
       <div className={`w-14 h-14 md:w-16 md:h-16 rounded-full ${item.bg} shadow-sm border border-white/50 dark:border-slate-600 flex items-center justify-center relative transition-transform ${count > 0 ? 'scale-105 ring-2 ring-indigo-500/20' : ''}`}>
         <item.icon className={`w-5 h-5 md:w-6 md:h-6 ${item.color}`} />
         {count > 0 && (
           <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1 -right-1 bg-indigo-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black border-2 border-white dark:border-slate-800 shadow-sm">{count}</motion.span>
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
           className="w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors relative overflow-hidden"
         >
           <AnimatePresence>
            {localRipples.map(ripple => (
              <motion.span
                key={ripple.id}
                initial={{ scale: 0, opacity: 0.5 }}
                animate={{ scale: 4, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute bg-indigo-400/30 rounded-full pointer-events-none"
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
