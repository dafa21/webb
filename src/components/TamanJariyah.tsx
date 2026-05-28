import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Droplet, Sun, Wind, Sparkles, Heart, HandCoins, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TamanJariyah() {
  const navigate = useNavigate();
  const [waterLevel, setWaterLevel] = useState(0);
  const [level, setLevel] = useState(1);
  const [isWatering, setIsWatering] = useState(false);

  // Growth thresholds
  const maxWater = 100;
  
  useEffect(() => {
    if (waterLevel >= maxWater) {
      if (level < 5) {
        // Level up!
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f29f05', '#1799dc', '#10b981']
        });
        setLevel(l => l + 1);
        setWaterLevel(0);
      }
    }
  }, [waterLevel, level]);

  const handleWater = () => {
    setIsWatering(true);
    setTimeout(() => setIsWatering(false), 800);
    setWaterLevel(prev => Math.min(prev + 20, maxWater));
    
    // Mini confetti per click
    confetti({
      particleCount: 15,
      spread: 40,
      origin: { y: 0.7 },
      colors: ['#1799dc', '#38bdf8']
    });
  };

  const getTreeImage = () => {
    switch (level) {
      case 1: return "🌱";
      case 2: return "🌿";
      case 3: return "🪴";
      case 4: return "🌳";
      case 5: return "✨🌲✨";
      default: return "🌱";
    }
  };

  const getLevelName = () => {
    switch (level) {
      case 1: return "Benih Niat";
      case 2: return "Tunas Kebaikan";
      case 3: return "Pohon Harapan";
      case 4: return "Pohon Rindang";
      case 5: return "Pohon Jariyah Abadi";
      default: return "Benih Niat";
    }
  };

  return (
    <div className="fixed inset-0 z-[100] min-h-screen bg-slate-900 overflow-y-auto flex flex-col pt-safe pb-24">
      {/* Dynamic Background based on level */}
      <div className="absolute inset-0 z-0">
        <motion.div 
          className="absolute inset-0 opacity-40 mix-blend-screen"
          animate={{
            background: level === 5 
              ? 'radial-gradient(circle at 50% 50%, rgba(242, 159, 5, 0.4) 0%, rgba(15, 23, 42, 1) 70%)'
              : 'radial-gradient(circle at 50% 50%, rgba(23, 153, 220, 0.2) 0%, rgba(15, 23, 42, 1) 70%)'
          }}
          transition={{ duration: 2 }}
        />
        
        {/* Animated stars/particles for high levels */}
        {level >= 4 && (
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.1 }} />
        )}
      </div>

      {/* Header */}
      <div className="relative z-10 px-4 md:px-6 py-4 md:py-6 flex items-center justify-between">
        <button 
          onClick={() => navigate('/')}
          className="w-10 h-10 md:w-12 md:h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all flex-shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center flex-1 px-2">
          <h1 className="text-white font-serif font-black text-xl md:text-2xl tracking-tight drop-shadow-lg">Taman Jariyah</h1>
          <p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-widest mt-0.5 md:mt-1">Rawat Pohon Kebaikanmu</p>
        </div>
        <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-500/20 backdrop-blur-md rounded-full flex items-center justify-center border border-emerald-500/30 flex-shrink-0">
          <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-emerald-400" />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6">
        
        {/* The Tree */}
        <div className="relative flex items-center justify-center w-full max-w-sm aspect-square">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            key={level}
            className="text-[120px] md:text-[160px] filter drop-shadow-[0_0_30px_rgba(23,153,220,0.5)] z-20"
            whileHover={{ scale: 1.05, rotate: [-2, 2, 0] }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
          >
            {getTreeImage()}
          </motion.div>
          
          {/* Watering Animation */}
          <AnimatePresence>
            {isWatering && (
              <motion.div
                initial={{ opacity: 0, y: -50, x: -20 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                exit={{ opacity: 0, y: 50, scale: 0 }}
                className="absolute top-1/4 right-1/4 text-4xl z-30"
              >
                💦
              </motion.div>
            )}
          </AnimatePresence>

          {/* Magical Aura */}
          {level >= 3 && (
            <motion.div 
              className="absolute inset-0 bg-emerald-500/20 rounded-full blur-3xl -z-10"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3] 
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          )}
        </div>

        {/* Level Status Card */}
        <motion.div 
          className="w-full max-w-sm sm:max-w-md bg-white/10 backdrop-blur-xl rounded-3xl p-5 sm:p-6 border border-white/10 shadow-2xl mt-8 mx-auto"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex justify-between items-center mb-4 gap-2">
            <div className="flex-1">
              <p className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">Level {level}</p>
              <h3 className="text-white text-xl sm:text-2xl font-black leading-tight truncate">{getLevelName()}</h3>
            </div>
            {level === 5 ? (
              <div className="w-10 h-10 flex-shrink-0 bg-[#f29f05]/20 rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#f29f05]" />
              </div>
            ) : (
              <div className="text-slate-200 font-bold text-xs sm:text-sm bg-slate-800/60 px-3 py-1.5 rounded-full flex-shrink-0 border border-slate-700/50 shadow-inner">
                {waterLevel} / {maxWater}
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {level < 5 && (
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden mb-6 relative">
              <motion.div 
                className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-[#1799dc] to-[#38bdf8]"
                initial={{ width: 0 }}
                animate={{ width: `${(waterLevel / maxWater) * 100}%` }}
                transition={{ type: "spring", stiffness: 100 }}
              />
            </div>
          )}

          {level === 5 && (
            <p className="text-slate-300 text-sm mb-6 leading-relaxed">
              MasyaAllah! Pohon Jariyah Anda telah tumbuh sempurna. Pahala akan terus mengalir layaknya pohon rindang yang menaungi banyak orang.
            </p>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 sm:gap-4">
            <button 
              onClick={handleWater}
              disabled={level === 5}
              className={`flex flex-col items-center justify-center py-3 sm:py-4 px-2 rounded-2xl font-bold transition-all ${
                level === 5 
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                  : 'bg-[#1799dc] hover:bg-[#1281ba] text-white shadow-lg shadow-[#1799dc]/30 active:scale-95'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5 text-xs sm:text-base whitespace-nowrap">
                <Droplet className="w-4 h-4 sm:w-5 sm:h-5" /> Siram Air
              </div>
              <span className="text-[10px] sm:text-xs font-medium opacity-80 mt-0.5 hidden sm:block">(Simulasi)</span>
              <span className="text-[9px] font-medium opacity-80 mt-0.5 sm:hidden">(Simulasi)</span>
            </button>
            <button 
              onClick={() => navigate('/donasi')}
              className="flex flex-col items-center justify-center py-3 sm:py-4 px-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold transition-all shadow-lg shadow-emerald-500/30 active:scale-95"
            >
              <div className="flex items-center justify-center gap-1.5 text-xs sm:text-base whitespace-nowrap">
                <HandCoins className="w-4 h-4 sm:w-5 sm:h-5" /> Sedekah
              </div>
              <span className="text-[10px] sm:text-xs font-medium text-emerald-100 mt-0.5 hidden sm:block">(Aksi Nyata)</span>
              <span className="text-[9px] font-medium text-emerald-100 mt-0.5 sm:hidden">(Nyata)</span>
            </button>
          </div>
        </motion.div>
        
        <p className="text-slate-500 text-xs text-center mt-6 max-w-xs">
          "Setiap donasi yang Anda berikan ibarat menyiram benih kebaikan yang akan tumbuh menjadi pohon rindang di surga."
        </p>

      </div>
    </div>
  );
}
