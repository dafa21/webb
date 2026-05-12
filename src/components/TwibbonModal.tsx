import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, Heart } from 'lucide-react';
import * as htmlToImage from 'html-to-image';

interface Program {
  id: string | number;
  title: string;
  category: string;
  image: string;
}

interface TwibbonModalProps {
  isOpen: boolean;
  onClose: () => void;
  program: Program;
  donorName: string;
}

export const TwibbonModal: React.FC<TwibbonModalProps> = ({ isOpen, onClose, program, donorName }) => {
  const twibbonRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!twibbonRef.current) return;
    try {
      setIsDownloading(true);
      // Wait for any animations and images to settle
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const dataUrl = await htmlToImage.toPng(twibbonRef.current, { 
        quality: 1, 
        pixelRatio: 3,
        cacheBust: true,
      });
      
      const link = document.createElement('a');
      link.download = `SobatBaik-${program.title.replace(/\s+/g, '-')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to generate image', err);
      alert('Gagal membuat gambar, silakan coba lagi.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 pb-safe">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl w-full max-w-sm shrink-0 overflow-hidden relative z-10 flex flex-col border border-slate-200/50 dark:border-slate-700/50"
          >
            {/* Header */}
            <div className="px-5 py-4 flex justify-between items-center bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-[15px]">Bagikan Kebaikan</h3>
              <button 
                onClick={onClose}
                className="w-7 h-7 flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg hover:brightness-110 active:scale-95"
                aria-label="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 md:p-5 flex flex-col items-center custom-scrollbar overflow-y-auto max-h-[80vh] bg-slate-50 dark:bg-slate-900/50">
              
              {/* THE TWIBBON TO BE CAPTURED (PREMIUM DESIGN) */}
              <div className="w-full relative shadow-lg rounded-3xl overflow-hidden bg-white ring-1 ring-slate-200/50">
                <div 
                  ref={twibbonRef}
                  className="w-full aspect-[4/5] relative flex flex-col overflow-hidden"
                  style={{ backgroundColor: '#1799dc' }}
                >
                  {/* Decorative Background */}
                  <div className="absolute top-0 right-0 w-[120%] h-[120%] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent -translate-y-1/4 translate-x-1/4"></div>
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-slate-900/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4"></div>
                  
                  {/* Real Content */}
                  <div className="relative z-10 p-5 md:p-6 flex flex-col h-full">
                    
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                      <div className="bg-white/95 backdrop-blur shadow-sm px-2.5 py-1.5 rounded-lg flex items-center gap-2 border border-white/20">
                         <img src="/logo-kecil (1).png" alt="Logo" className="h-6 w-auto object-contain dark:brightness-0 dark:invert" />
                      </div>
                      
                      <div className="bg-emerald-400 text-emerald-950 px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                         <Heart className="w-3 h-3 fill-emerald-950" />
                         <span className="text-[9px] md:text-[10px] font-bold">Orang Baik</span>
                      </div>
                    </div>

                    {/* Headline */}
                    <div className="mb-auto flex flex-col items-start px-1">
                      <div className="bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-md text-white text-[8px] md:text-[9px] font-bold tracking-widest uppercase mb-3 border border-white/20">
                        Bismillah, Tuntas!
                      </div>
                      <h2 className="text-white font-black text-[28px] md:text-[32px] leading-[1.1] tracking-tight drop-shadow-md">
                        Alhamdulillah,<br/>Saya Sudah<br/>Berdonasi!
                      </h2>
                    </div>

                    {/* Program Card */}
                    <div className="bg-white rounded-[20px] p-2.5 md:p-3 shadow-2xl flex flex-col mt-4 relative z-20">
                       <div className="w-full h-28 md:h-32 rounded-[14px] overflow-hidden relative mb-2.5 shrink-0">
                          <img 
                            src={program.image}
                            crossOrigin="anonymous"
                            alt="Program"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                          <div className="absolute bottom-2 left-2 flex flex-col">
                             <div className="bg-[#f29f05] text-white px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider mb-1 w-fit shadow-sm">
                               {program.category}
                             </div>
                             <p className="font-extrabold text-white text-[12px] md:text-[13px] leading-snug line-clamp-2 px-0.5 drop-shadow-md">
                               {program.title}
                             </p>
                          </div>
                       </div>
                       
                       <div className="bg-slate-50 border border-slate-100 rounded-xl p-2 md:p-2.5 flex justify-between items-center">
                         <div className="flex flex-col">
                           <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Donatur</span>
                           <span className="text-[#1799dc] font-black text-[11px] md:text-[12px] line-clamp-1">{donorName || 'Hamba Allah'}</span>
                         </div>
                         <Heart className="w-5 h-5 text-rose-400 fill-rose-100 shrink-0" />
                       </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-4 text-center flex items-center justify-between bg-white/10 backdrop-blur-md p-2.5 md:p-3 rounded-[16px] border border-white/20">
                      <p className="text-white text-[9px] md:text-[10px] font-medium text-left leading-snug opacity-90">
                        Ikut ambil bagian dalam<br/>kebaikan ini sekarang!
                      </p>
                      <div className="bg-white text-[#1799dc] py-1.5 px-3 rounded-lg text-[9px] md:text-[10px] font-black shadow-sm">
                        laznasdewandakwah.or.id
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Download Action Area */}
              <div className="w-full mt-6">
                <button 
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="w-full bg-[#1799dc] hover:bg-[#1380b8] text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-[#1799dc]/30 flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 disabled:opacity-75 disabled:cursor-not-allowed disabled:transform-none transition-all duration-300 hover:scale-105 hover:shadow-lg hover:brightness-110 active:scale-95"
                >
                  {isDownloading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                      Menyimpan Gambar...
                    </span>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Unduh & Bagikan
                    </>
                  )}
                </button>
                <p className="text-[10px] text-slate-500 font-medium mt-3 text-center leading-relaxed">
                  Semakin banyak yang melihat, makin banyak kebaikan yang tersebar.
                </p>
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};


