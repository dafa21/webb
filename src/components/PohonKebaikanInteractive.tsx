import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Info, Sprout, TreePine, Trees, TreeDeciduous, RefreshCw } from 'lucide-react';

interface PohonKebaikanProps {
  totalDonation: number;
}

export const PohonKebaikanInteractive: React.FC<PohonKebaikanProps> = ({ totalDonation: initialDonation }) => {
  // Let the user simulate the growth by clicking to add fake donations, or use the true one
  const [simulatedScore, setSimulatedScore] = useState(initialDonation);
  const [level, setLevel] = useState(0);
  const [pulse, setPulse] = useState(0);

  // Stages based on amount
  const stages = [
    { name: "Benih Niat", amount: 0, desc: "Awal mula sebuah kebaikan ditanamkan.", icon: <Sprout className="w-4 h-4" /> },
    { name: "Tunas Kebaikan", amount: 500000, desc: "Kebaikan mulai tumbuh berdampak.", icon: <Sprout className="w-4 h-4" /> },
    { name: "Pohon Harapan", amount: 1500000, desc: "Memberi naungan bagi sesama.", icon: <TreePine className="w-4 h-4" /> },
    { name: "Pohon Rimbun", amount: 5000000, desc: "Kebaikan merambat lebat.", icon: <Trees className="w-4 h-4" /> },
    { name: "Pohon Berbuah", amount: 10000000, desc: "Pahala jariyah yang berbuah berkah tiada henti.", icon: <TreeDeciduous className="w-4 h-4" /> },
  ];

  useEffect(() => {
    let currentLevel = 0;
    for (let i = 0; i < stages.length; i++) {
       if (simulatedScore >= stages[i].amount) {
           currentLevel = i;
       }
    }
    setLevel(currentLevel);
  }, [simulatedScore]);

  const simulateAdd = () => {
     setSimulatedScore(prev => prev + 1000000);
     setPulse(p => p + 1);
  };
  
  const resetSimulation = () => {
     setSimulatedScore(initialDonation);
     setPulse(p => p + 1);
  };

  const Fruit = ({ delay, top, left, right, bottom, size }: any) => (
      <motion.div 
         initial={{ scale: 0 }} 
         animate={{ scale: 1 }} 
         transition={{ delay, type: "spring", bounce: 0.6 }} 
         className="absolute bg-orange-500 border-[2.5px] border-orange-700 rounded-full shadow-sm z-30"
         style={{ top, left, right, bottom, width: size, height: size }}
      >
         <div className="absolute top-[15%] right-[20%] w-[35%] h-[30%] bg-white/50 rounded-full"></div>
      </motion.div>
  );

  const TreeGraphics = () => {
    return (
      <div className="relative w-48 h-56 flex flex-col items-center justify-end z-10 select-none pb-4">
         {/* Ground/Dirt */}
         <div className="absolute bottom-4 w-36 h-6 bg-[#6b472a] rounded-full border-b-[4px] border-[#4a311d] z-20">
            <div className="absolute top-1 left-6 w-4 h-1 bg-[#4a311d] rounded-full opacity-50"></div>
            <div className="absolute top-2 right-8 w-2 h-1 bg-[#4a311d] rounded-full opacity-50"></div>
            <div className="absolute top-2.5 left-1/2 w-5 h-1 md:h-1.5 bg-[#4a311d] rounded-full opacity-50"></div>
         </div>
         {/* Grass tufts on ground */}
         <div className="absolute bottom-8 left-8 flex items-end z-30">
            <div className="w-1 h-3 bg-emerald-500 rounded-full rotate-[-20deg] origin-bottom"></div>
            <div className="w-1.5 h-4 bg-emerald-600 rounded-full"></div>
         </div>
         <div className="absolute bottom-7 right-10 flex items-end z-30">
            <div className="w-1.5 h-3 bg-emerald-500 rounded-full"></div>
            <div className="w-1 h-2 bg-emerald-600 rounded-full rotate-[20deg] origin-bottom"></div>
         </div>

         {/* The Tree object */}
         <div className="absolute bottom-6 flex flex-col items-center justify-end z-10 w-full origin-bottom">
            {pulse > 0 && (
               <motion.div 
                  key={pulse}
                  initial={{ scale: 0.5, opacity: 0.8 }}
                  animate={{ scale: 2.5, opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="absolute bottom-0 z-0 w-24 h-24 bg-emerald-400 rounded-full blur-[15px] pointer-events-none"
               ></motion.div>
            )}
            
            <AnimatePresence>
              {level === 0 && (
                <motion.div 
                  key="seed"
                  initial={{ scale: 0, opacity: 0 }} 
                  animate={{ scale: 1, opacity: 1 }} 
                  exit={{ scale: 0, opacity: 0, transition: { duration: 0.2 } }}
                  className="absolute bottom-0 flex justify-center w-full z-10"
                >
                  <div className="w-5 h-4 bg-[#c78b4a] border-[2.5px] border-[#7a4e21] rounded-full shadow-inner relative mb-1">
                     <div className="absolute top-0 right-1 w-1.5 h-1 bg-white/40 rounded-full"></div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* The Tree (Level 1+) */}
            <motion.div
               className="flex flex-col items-center z-10 origin-bottom relative w-full"
               initial={false}
               animate={{ opacity: level > 0 ? 1 : 0, y: level > 0 ? 0 : 20 }}
               transition={{ duration: 0.3 }}
            >
               {/* Canopy Container */}
               <div className="relative z-20 flex items-end justify-center w-full origin-bottom">
                  
                  {/* Sprout Leaves (Level 1) */}
                  <AnimatePresence>
                    {level === 1 && (
                       <motion.div 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="absolute bottom-0 flex gap-0.5 pointer-events-none"
                       >
                          <motion.div initial={{ rotate: 0 }} animate={{ rotate: -25 }} className="w-4 h-4 bg-emerald-400 border-[1.5px] border-emerald-600 rounded-tl-full rounded-br-full origin-bottom-right"></motion.div>
                          <motion.div initial={{ rotate: 0 }} animate={{ rotate: 25 }} className="w-4 h-4 bg-emerald-500 border-[1.5px] border-emerald-600 rounded-tr-full rounded-bl-full origin-bottom-left mt-1"></motion.div>
                       </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Tree Canopy (Level 2+) */}
                  <motion.div 
                    initial={false}
                    animate={{ 
                       width: level >= 2 ? (level === 2 ? 72 : level === 3 ? 104 : 136) : 0, 
                       height: level >= 2 ? (level === 2 ? 72 : level === 3 ? 104 : 136) : 0,
                       borderWidth: level >= 2 ? (level === 2 ? 3.5 : level === 3 ? 4.5 : 5) : 0,
                       opacity: level >= 2 ? 1 : 0,
                       marginBottom: level >= 2 ? (level === 2 ? -12 : level === 3 ? -16 : -24) : 0
                    }}
                    className="bg-emerald-500 border-emerald-700/50 rounded-full shadow-xl relative origin-bottom flex items-center justify-center pointer-events-none"
                    transition={{ type: "spring", bounce: 0.4, duration: 0.9 }}
                  >
                     {/* Inner decorative leaves */}
                     <motion.div 
                       initial={false}
                       animate={{
                         width: level >= 3 ? (level === 3 ? 64 : 80) : 0,
                         height: level >= 3 ? (level === 3 ? 64 : 80) : 0,
                         opacity: level >= 3 ? 1 : 0,
                       }}
                       className="absolute -top-3 -left-3 bg-emerald-400 border-[4px] border-emerald-700/40 rounded-full shadow-inner overflow-hidden"
                       transition={{ type: "spring", bounce: 0.3 }}
                     >
                        <div className="absolute top-2 left-3 w-5 h-2.5 bg-white/40 rounded-full -rotate-12"></div>
                     </motion.div>

                     {/* Level 4 extra leaf cluster */}
                     <motion.div 
                       initial={false}
                       animate={{
                         width: level >= 4 ? 64 : 0,
                         height: level >= 4 ? 64 : 0,
                         opacity: level >= 4 ? 1 : 0
                       }}
                       className="absolute bottom-1 -right-3 bg-emerald-600 border-[4px] border-emerald-700/40 rounded-full shadow-inner"
                       transition={{ type: "spring", bounce: 0.3 }}
                     ></motion.div>

                     {/* Fruits (Level 4+) */}
                     <AnimatePresence>
                        {level >= 4 && (
                           <>
                             <Fruit delay={0.4} top="15%" left="25%" size={22} />
                             <Fruit delay={0.6} top="40%" right="5%" size={24} />
                             <Fruit delay={0.8} bottom="20%" left="25%" size={24} />
                             <Fruit delay={1.0} top="35%" left="-2%" size={18} />
                           </>
                        )}
                     </AnimatePresence>
                  </motion.div>
               </div>

               {/* Trunk */}
               <motion.div 
                  initial={false}
                  animate={{
                     height: level === 0 ? 0 : level === 1 ? 28 : level === 2 ? 48 : level === 3 ? 72 : 96,
                     width: level === 0 ? 0 : level === 1 ? 6 : level === 2 ? 14 : level === 3 ? 24 : 32,
                     backgroundColor: level <= 1 ? '#10b981' : '#8c5a2b',
                     borderColor: level <= 1 ? '#047857' : '#5e3816',
                     borderLeftWidth: level === 0 ? 0 : level === 1 ? 1.5 : level === 2 ? 3.5 : level === 3 ? 4.5 : 5,
                     borderRightWidth: level === 0 ? 0 : level === 1 ? 1.5 : level === 2 ? 3.5 : level === 3 ? 4.5 : 5,
                  }}
                  className="rounded-t-sm origin-bottom z-10 relative flex justify-center overflow-hidden"
                  transition={{ type: "spring", bounce: 0.4, duration: 0.9 }}
               >
                  {/* Branches (appear level 4) */}
                  <AnimatePresence>
                     {level >= 4 && (
                        <>
                          <motion.div 
                             initial={{ scale: 0 }} 
                             animate={{ scale: 1 }} 
                             transition={{ delay: 0.2, type: "spring" }}
                             className="absolute top-3 -left-[14px] w-4 h-8 bg-[#8c5a2b] border-l-[5px] border-t-[5px] border-[#5e3816] rounded-tl-xl transform -rotate-[25deg] z-0 origin-bottom-right"
                          ></motion.div>
                          <motion.div 
                             initial={{ scale: 0 }} 
                             animate={{ scale: 1 }} 
                             transition={{ delay: 0.3, type: "spring" }}
                             className="absolute top-8 -right-[14px] w-4 h-6 bg-[#8c5a2b] border-r-[5px] border-t-[5px] border-[#5e3816] rounded-tr-xl transform rotate-[25deg] z-0 origin-bottom-left"
                          ></motion.div>
                        </>
                     )}
                  </AnimatePresence>
                  
                  {/* Trunk Details (Level 2+) */}
                  <motion.div
                     initial={false}
                     animate={{ opacity: level >= 2 ? 1 : 0 }}
                     className="absolute inset-0 flex flex-col items-center pt-2 pointer-events-none"
                  >
                     <div className="w-[2px] md:w-[3px] h-[30%] bg-[#5e3816]/30 rounded-full mb-1"></div>
                     <div className="w-[2px] h-[20%] bg-[#5e3816]/30 rounded-full mt-2 self-end mr-1"></div>
                  </motion.div>
               </motion.div>
            </motion.div>
         </div>

         {/* Soft glowing background when max level */}
         {level >= 4 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} transition={{ duration: 1 }} className="absolute bottom-12 w-40 h-40 bg-emerald-400 blur-[40px] mix-blend-screen rounded-full z-0 opacity-40"></motion.div>
         )}

         {/* Particles rising */}
         <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl z-0">
             {simulatedScore > 0 && Array.from({ length: 3 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ y: 200, x: 20 * i, opacity: 0, scale: 0 }}
                  animate={{ y: -50, opacity: [0, 0.5, 0], scale: [0.5, 1, 0.5] }}
                  transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.8, ease: "linear" }}
                  className="absolute bottom-0 w-2 h-2 bg-emerald-300 rounded-full blur-[1px]"
                  style={{ left: `${30 + (i * 20)}%` }}
                />
             ))}
         </div>
      </div>
    );
  };

  const nextStage = stages[Math.min(level + 1, stages.length - 1)];
  const isMaxLevel = level === stages.length - 1;
  const progressToNext = isMaxLevel ? 100 : Math.min(((simulatedScore - stages[level].amount) / (nextStage.amount - stages[level].amount)) * 100, 100);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col h-full relative">
       {/* Background graphic */}
       <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 z-0 pointer-events-none"></div>
       
       <div className="p-6 flex flex-col h-full z-10 relative">
          <div className="flex justify-between items-start mb-2">
            <div>
               <h3 className="font-bold text-slate-800 dark:text-white text-lg flex items-center gap-2 mb-1">
                 Pohon Kebaikan
                 <Sparkles className="w-4 h-4 text-emerald-500" />
               </h3>
               <p className="text-sm text-slate-500 dark:text-slate-400">Jejak jariyah hijau Anda.</p>
            </div>
            
            <div className={`px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 font-bold text-[10px] uppercase tracking-widest flex items-center gap-1.5 border border-emerald-100 dark:border-emerald-800`}>
              {stages[level].icon}
              {stages[level].name}
            </div>
          </div>

          <div className="flex-1 flex flex-col md:flex-row items-center justify-between gap-6 mt-4">
             {/* Left - Graphic */}
             <div className="flex-shrink-0 bg-gradient-to-t from-emerald-50 to-white dark:from-slate-900/50 dark:to-slate-800 rounded-2xl w-full md:w-auto flex justify-center py-4 border border-emerald-100/50 dark:border-slate-700">
                <TreeGraphics />
             </div>

             {/* Right - Stats */}
             <div className="flex-1 w-full space-y-4">
                 <p className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed italic">"{stages[level].desc}"</p>
                 
                 <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                    <div className="flex justify-between items-end mb-2">
                       <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Akumulasi Sedekah</p>
                       <p className="text-lg font-black text-emerald-600">
                          Rp {new Intl.NumberFormat('id-ID').format(simulatedScore)}
                       </p>
                    </div>

                    {!isMaxLevel && (
                    <>
                    <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mt-3 mb-2">
                       <motion.div 
                         initial={{ width: 0 }} 
                         animate={{ width: `${progressToNext}%` }} 
                         className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                       />
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium truncate">
                       Kurang <span className="font-bold text-slate-600 dark:text-slate-300">Rp {new Intl.NumberFormat('id-ID').format(nextStage.amount - simulatedScore)}</span> untuk tumbuh jadi {nextStage.name}
                    </p>
                    </>
                    )}
                 </div>

                 <div className="flex gap-2">
                    <button 
                      onClick={simulateAdd}
                      className="flex-1 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 text-emerald-600 font-bold text-xs transition-colors border border-emerald-200 dark:border-emerald-800 flex items-center justify-center gap-1"
                    >
                      <Sprout className="w-3.5 h-3.5" /> Pupuk (+1 Juta)
                    </button>
                    {simulatedScore !== initialDonation && (
                    <button 
                      onClick={resetSimulation}
                      className="w-10 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-500 transition-colors shrink-0"
                      title="Reset ke nilai asli"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                    )}
                 </div>
             </div>
          </div>
       </div>
    </div>
  );
};
