import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { HandHeart, TrendingUp, HandCoins, Globe, BookOpen, Droplets, Sparkles } from "lucide-react";

const ACTIONS = [
  { text: "baru saja Sedekah Subuh Rp 50.000", icon: TrendingUp },
  { text: "mengkhatamkan Juz 30", icon: BookOpen },
  { text: "berdonasi untuk Air Bersih", icon: Droplets },
  { text: "menunaikan Zakat Penghasilan", icon: HandCoins },
  { text: "berqurban untuk Orang Tua", icon: HandHeart },
  { text: "ikut patungan Pembangunan Sumur", icon: Sparkles },
  { text: "berdonasi untuk Palestina Rp 500.000", icon: Globe },
];

const NAMES = ["Hamba Allah", "Ahmad", "Siti F.", "Keluarga Yanto", "Bapak Budi", "Ananda D.", "Fatimah", "Rizky", "Ibu Aminah", "Lukman"];

export default function LiveDonationToast() {
  const [activeActivity, setActiveActivity] = useState<any>(null);

  useEffect(() => {
    // Show first toast quickly
    setTimeout(() => {
        triggerRandomActivity();
    }, 2000);

    const interval = setInterval(() => {
      triggerRandomActivity();
    }, 8000); // Trigger every 8 seconds

    return () => clearInterval(interval);
  }, []);

  const triggerRandomActivity = () => {
    const randomAction = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
    const randomName = NAMES[Math.floor(Math.random() * NAMES.length)];
    
    setActiveActivity({
      action: randomAction,
      name: randomName,
      id: Date.now()
    });

    // Clear the toast after 5 seconds
    setTimeout(() => {
      setActiveActivity(null);
    }, 5000);
  }

  return (
    <AnimatePresence>
      {activeActivity && (
        <motion.div
          key={activeActivity.id}
          initial={{ opacity: 0, x: -20, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9, x: -20 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="fixed bottom-[96px] left-4 lg:bottom-10 lg:left-10 z-[60] pointer-events-none"
        >
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 shadow-[0_8px_30px_rgba(23,153,220,0.15)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] pl-1.5 pr-4 py-1.5 rounded-full flex items-center gap-3 w-max max-w-[calc(100vw-32px)]">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#1799dc] to-[#2db2f5] flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(23,153,220,0.4)] relative">
              <div className="absolute inset-0 rounded-full animate-ping bg-white/30" style={{ animationDuration: '3s' }} />
              <activeActivity.action.icon className="w-4 h-4 text-white relative z-10" />
            </div>
            <div className="flex flex-col text-left justify-center pb-0.5">
              <p className="text-[12px] text-slate-800 dark:text-slate-100 font-bold leading-tight">
                {activeActivity.name}
              </p>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium leading-tight mt-0.5 truncate max-w-[220px]">
                {activeActivity.action.text}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
