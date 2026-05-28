import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sun, Coins, Flame, HeartHandshake, Sparkles, CheckCircle2 } from 'lucide-react';

interface SedekahSubuhCardProps {
  onAddToCart: (item: any) => void;
}

export const SedekahSubuhCard: React.FC<SedekahSubuhCardProps> = ({ onAddToCart }) => {
  const [amount, setAmount] = useState<number>(10000);
  const [intention, setIntention] = useState<string>('');
  const [streak, setStreak] = useState<number>(4); // Dummy data for demonstration
  const [isAnimating, setIsAnimating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const predefinedAmounts = [10000, 25000, 50000];

  const handleDonate = () => {
    // "Donasi Sekarang" logic might go directly to a payment page or open a modal,
    // For now, let's just trigger success animation.
    setIsAnimating(true);
    setTimeout(() => {
      setIsAnimating(false);
      setShowSuccess(true);
      setStreak(prev => prev + 1);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1000);
  };

  const handleAddToCart = () => {
    onAddToCart({
      id: `subuh-${Date.now()}`,
      title: 'Sedekah Subuh Rutin',
      price: amount,
      type: 'Sedekah',
      image: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&q=80&w=300'
    });
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="relative overflow-hidden rounded-[2rem] bg-white dark:bg-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 dark:border-slate-700/50 mb-8 col-span-full">
      <div className="flex flex-col md:flex-row">
        {/* Illustration Section */}
        <div className="md:w-2/5 relative h-48 md:h-auto bg-slate-100 dark:bg-slate-900 overflow-hidden shrink-0">
          <img 
            src="https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&q=80&w=800" 
            alt="Sedekah Subuh"
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
            <div className="text-white">
              <div className="flex items-center gap-2 mb-1">
                <Sun className="w-5 h-5 text-yellow-400" />
                <span className="text-sm font-bold tracking-widest uppercase">Sedekah Subuh</span>
              </div>
              <p className="text-xs text-white/80 font-medium">Rutinkan kebaikan di awal hari</p>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 md:p-8 flex-1 flex flex-col justify-center">
          <div className="flex justify-between items-start mb-6">
            <div className="max-w-xs">
              <h3 className="font-serif font-black text-2xl text-slate-900 dark:text-white mb-2 leading-tight">
                Keberkahan Maksimal di Pagi Hari
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                "Dua malaikat turun setiap pagi, yang satu mendoakan orang yang berinfak agar hartanya diganti..."
              </p>
            </div>
            
            <div className="flex items-center gap-1.5 bg-orange-50 dark:bg-orange-500/10 px-3 py-1.5 rounded-full border border-orange-100 dark:border-orange-500/20 shrink-0">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="font-bold text-xs text-orange-600 dark:text-orange-400">{streak} Hari</span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {showSuccess ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center border border-emerald-100 dark:border-emerald-500/20 my-auto"
              >
                <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mb-4 text-emerald-600 dark:text-emerald-400 shadow-inner">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-lg mb-2 text-emerald-800 dark:text-emerald-300">Alhamdulillah!</h4>
                <p className="text-sm text-emerald-600 dark:text-emerald-400/90 leading-relaxed font-medium">Niat baik Anda telah tercatat. Semoga diberkahi sepanjang hari.</p>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-5 mt-auto"
              >
                {/* Amount Selection */}
                <div className="flex gap-3">
                  {predefinedAmounts.map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setAmount(amt)}
                      className={`flex-1 py-3 px-2 rounded-[1.25rem] text-sm font-bold transition-all duration-300 border ${
                        amount === amt 
                          ? 'bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-500/30 shadow-[0_0_15px_rgba(14,165,233,0.1)]' 
                          : 'bg-white dark:bg-slate-900/50 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      Rp {(amt/1000)}k
                    </button>
                  ))}
                </div>

                {/* Intention Input */}
                <div className="relative">
                  <HeartHandshake className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Niat (Diri sendiri, Orang tua...)"
                    value={intention}
                    onChange={(e) => setIntention(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 transition-all font-medium"
                  />
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={handleDonate}
                    disabled={isAnimating}
                    className="relative overflow-hidden bg-sky-500 hover:bg-sky-600 text-white font-black py-3.5 px-4 rounded-2xl shadow-lg shadow-sky-500/20 transition-all active:scale-[0.98] disabled:opacity-80 disabled:cursor-not-allowed group flex items-center justify-center gap-2"
                  >
                    {isAnimating ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                        <Coins className="w-4 h-4" />
                      </motion.div>
                    ) : (
                      <>
                        <Coins className="w-4 h-4" />
                        <span className="text-sm">Donasi Sekarang</span>
                      </>
                    )}

                    {/* Animation Overlay */}
                    <AnimatePresence>
                      {isAnimating && (
                        <motion.div 
                          initial={{ y: -50, opacity: 0, scale: 0.5 }}
                          animate={{ y: 0, opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 1.5 }}
                          transition={{ duration: 0.5 }}
                          className="absolute inset-0 flex items-center justify-center bg-sky-400 z-20"
                        >
                          <Sparkles className="w-5 h-5 text-white" />
                          <span className="ml-2 font-black text-white text-sm">Bismillah...</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>

                  <button
                    onClick={handleAddToCart}
                    className="flex items-center justify-center gap-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold py-3.5 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all active:scale-[0.98]"
                  >
                    <HeartHandshake className="w-4 h-4" />
                    <span className="text-sm">Ke Kantung Kebaikan</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
