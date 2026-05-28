import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TamanJariyahBanner: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="w-full max-w-5xl mx-auto py-16 px-4">
      <div 
        className="relative overflow-hidden rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 shadow-2xl group cursor-pointer border border-[#1799dc]/20"
        onClick={() => {
          navigate("/taman-jariyah");
          window.scrollTo(0, 0);
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-[#0f172a] -z-10" />
        
        {/* Animated Background Elements */}
        <motion.div 
          className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/20 rounded-full blur-[80px]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div 
          className="absolute top-20 left-20 w-4 h-4 bg-yellow-400/80 blur-[2px] rounded-full"
          animate={{ y: [0, -20, 0], x: [0, 10, 0], opacity: [0, 1, 0] }}
          transition={{ duration: 3, repeat: Infinity, delay: 1 }}
        />
        <motion.div 
          className="absolute bottom-10 right-40 w-3 h-3 bg-white/80 blur-[1px] rounded-full"
          animate={{ y: [0, -30, 0], x: [0, -15, 0], opacity: [0, 1, 0] }}
          transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
        />

        <div className="flex flex-col md:flex-row items-center justify-between z-10 relative">
          <div className="md:w-3/5 text-center md:text-left mb-8 md:mb-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold uppercase tracking-widest mb-4 border border-emerald-500/30">
              <Sparkles className="w-4 h-4" /> Fitur Eksklusif (Gamifikasi)
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight mb-4 tracking-tight">
              Masuki <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-[#1799dc]">Taman Jariyah</span>
            </h2>
            <p className="text-slate-300 mb-8 max-w-lg mx-auto md:mx-0 leading-relaxed font-medium">
              Setiap donasimu adalah tetesan air yang menumbuhkan Pohon Kebaikan di Surga. Rasakan kebahagiaan merawat tanaman jariyahmu setiap hari. Yuk, sirami benih kebaikanmu sekarang!
            </p>
            <button className="bg-gradient-to-r from-emerald-500 to-[#1799dc] hover:from-emerald-400 hover:to-[#1aa8f0] text-white px-8 py-4 rounded-2xl font-bold tracking-wider transition-all shadow-[0_10px_30px_rgba(23,153,220,0.4)] group-hover:scale-105 active:scale-95 flex items-center gap-3 w-full sm:w-auto justify-center md:justify-start">
              Mainkan Sekarang <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <div className="md:w-2/5 flex justify-center items-center relative">
            <div className="w-48 h-48 md:w-64 md:h-64 rounded-full bg-white/5 border-2 border-white/10 flex items-center justify-center relative backdrop-blur-sm z-10 shadow-[0_0_50px_rgba(16,185,129,0.3)]">
              <motion.div 
                className="text-[100px] md:text-[130px] filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
                animate={{ rotate: [-2, 2, -2], scale: [1, 1.02, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                🌳
              </motion.div>
            </div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(23,153,220,0.4)_0%,transparent_70%)]" />
          </div>
        </div>
      </div>
    </div>
  );
};
