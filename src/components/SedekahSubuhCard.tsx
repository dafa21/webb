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
    setIsAnimating(true);
    
    // Simulate animation timing before adding to cart
    setTimeout(() => {
      onAddToCart({
        id: 'subuh-1',
        title: 'Sedekah Subuh Rutin',
        price: amount,
        type: 'Sedekah',
        image: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&q=80&w=300'
      });
      setIsAnimating(false);
      setShowSuccess(true);
      setStreak(prev => prev + 1);
      
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1000);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] mb-8 border border-slate-100 dark:border-slate-700/50">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 dark:bg-yellow-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-sky-500/5 dark:bg-sky-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4"></div>
      
      <div className="relative p-6 z-10">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sun className="w-6 h-6 text-yellow-500 drop-shadow-sm" />
              <h3 className="font-black text-lg text-slate-900 dark:text-white">
                Sedekah Subuh
              </h3>
            </div>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 max-w-[220px] leading-relaxed mt-1">
              "Dua malaikat turun setiap pagi, yang satu mendoakan orang yang berinfak..."
            </p>
          </div>
          
          <div className="flex items-center gap-1.5 bg-orange-50 dark:bg-orange-500/10 px-3 py-1.5 rounded-full border border-orange-100 dark:border-orange-500/20">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="font-bold text-sm text-orange-600 dark:text-orange-400">{streak} Hari</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {showSuccess ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center border border-emerald-100 dark:border-emerald-500/20"
            >
              <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mb-4 text-emerald-600 dark:text-emerald-400 shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-lg mb-2 text-emerald-800 dark:text-emerald-300">Alhamdulillah!</h4>
              <p className="text-sm text-emerald-600 dark:text-emerald-400/90 leading-relaxed">Sedekah subuh Anda telah tercatat. Semoga malaikat mendoakan keberkahan untuk Anda hari ini.</p>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Amount Selection */}
              <div className="flex gap-2">
                {predefinedAmounts.map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setAmount(amt)}
                    className={`flex-1 py-3 px-1 rounded-2xl text-[13px] sm:text-sm font-bold transition-all duration-300 border ${
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
                  placeholder="Niatkan untuk (Diri sendiri, Orang tua...)"
                  value={intention}
                  onChange={(e) => setIntention(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 transition-all font-medium"
                />
              </div>

              {/* Action Button */}
              <button
                onClick={handleDonate}
                disabled={isAnimating}
                className="w-full relative overflow-hidden bg-sky-500 hover:bg-sky-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-sky-500/20 transition-all active:scale-[0.98] disabled:opacity-80 disabled:cursor-not-allowed group flex items-center justify-center gap-2"
              >
                {isAnimating ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  >
                    <Coins className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <>
                    <Coins className="w-5 h-5" />
                    <span>Tunaikan Sedekah Subuh</span>
                  </>
                )}

                {/* Animation Overlay */}
                <AnimatePresence>
                  {isAnimating && (
                    <motion.div 
                      key="coin"
                      initial={{ y: -50, opacity: 0, scale: 0.5 }}
                      animate={{ y: 0, opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.5 }}
                      transition={{ duration: 0.5 }}
                      className="absolute inset-0 flex items-center justify-center bg-sky-400 z-20"
                    >
                      <Sparkles className="w-6 h-6 text-white" />
                      <span className="ml-2 font-black text-white">Bismillah...</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
