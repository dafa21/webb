import React, { useState, useEffect, useRef } from 'react';
import { arabicLetters } from '../data/arabicLetters';
import MakhrajVisualizer from './MakhrajVisualizer';
import { Volume2, Lightbulb } from 'lucide-react';
import { motion } from 'motion/react';

export default function LetterInteractiveVisualizer() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const currentLetter = arabicLetters[currentIndex];
  
  const handlePlayAudio = () => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    
    if (audioRef.current) {
        audioRef.current.pause();
    }

    // Gunakan audio bawaan atau fallback ke TTS jika tidak tersedia
    let audioUrl = currentLetter.audioUrl;
    
    if (!audioUrl) {
      // Fallback
      const textToSpeak = currentLetter.arabic + "َ";
      audioUrl = `https://translate.googleapis.com/translate_tts?client=gtx&ie=UTF-8&tl=ar&q=${encodeURIComponent(textToSpeak)}`;
    }
    
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    
    audio.onended = () => setIsPlaying(false);
    audio.onerror = (e) => {
       console.error("Audio playback gagal:", e);
       setIsPlaying(false);
    };
    
    audio.play().catch(e => {
        console.error("Audio playback gagal:", e);
        setIsPlaying(false);
    });
  };

  // Cleanup audio when component unmounts
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  return (
    <div className="w-full max-w-3xl mx-auto animate-fade-in flex flex-col items-center">
      <div className="w-full bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col md:flex-row">
        
        {/* Left/Top: Visualizer */}
        <div className="w-full md:w-5/12 p-4 flex flex-col items-center justify-center bg-emerald-50/50 dark:bg-emerald-900/10 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 relative min-h-[160px] md:min-h-0">
          <div className="absolute top-3 left-3 text-[10px] font-bold px-2 py-1 bg-[#1799dc]/10 text-[#1799dc] rounded-full shadow-sm flex items-center gap-1">
            Tingkat 1: Huruf
          </div>
          
          <div className="absolute top-3 right-3 text-[10px] font-bold px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 rounded-full shadow-sm">
            {currentIndex + 1} / {arabicLetters.length}
          </div>
          
          <div className="mt-4 w-full max-w-[120px] md:max-w-[140px]">
             <MakhrajVisualizer highlight={currentLetter.makhrajArea} />
          </div>
          
          <div className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100/50 dark:bg-emerald-800/30 px-3 py-1 rounded-full uppercase tracking-widest text-center mt-3">
            {currentLetter.makhrajCategory}
          </div>
        </div>

        {/* Right/Bottom: Letter & Info */}
        <div className="w-full md:w-7/12 p-4 md:p-5 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-2">
             <div className="flex flex-col">
               <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight uppercase">
                 {currentLetter.latin}
               </h2>
             </div>
             <button 
               onClick={handlePlayAudio}
               className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isPlaying ? 'bg-[#1799dc] text-white shadow-md shadow-[#1799dc]/30 scale-105' : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'}`}
               aria-label="Play pronunciation"
             >
                <Volume2 className="w-4 h-4" />
             </button>
          </div>
          
          <div className="flex justify-center items-center py-8 md:py-12 w-full min-h-[140px] md:min-h-[160px]">
             <motion.div 
               key={currentLetter.id}
               initial={{ scale: 0.9, opacity: 0, y: -5 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               className="text-[80px] md:text-[100px] font-arabic leading-normal text-[#1799dc] dark:text-[#38bdf8] drop-shadow-sm pb-4"
             >
               {currentLetter.arabic}
             </motion.div>
          </div>

          <div className="bg-slate-50 border-l-2 border-amber-400 dark:bg-slate-900/50 p-3 rounded-r-xl border-[0.5px] border-slate-100 dark:border-slate-700/50 mt-auto">
            <div className="flex gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] md:text-sm font-medium text-slate-700 dark:text-slate-300 leading-snug mb-1.5">
                  {currentLetter.description}
                </p>
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded inline-block">
                  Posisi: {currentLetter.positionDetails}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Horizontal List Selector below */}
      <div className="w-full mt-4 pb-2 overflow-x-auto scrollbar-hide flex gap-2 px-1 snap-x">
         {arabicLetters.map((letter, idx) => (
           <button
             key={letter.id}
             onClick={() => setCurrentIndex(idx)}
             className={`flex-shrink-0 snap-center w-14 h-16 md:w-16 md:h-16 rounded-xl flex flex-col items-center justify-center gap-1 transition-all duration-200 ${
               currentIndex === idx 
                 ? 'bg-[#1799dc] text-white shadow-sm scale-100 border-transparent z-10' 
                 : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-[#1799dc]/40 hover:bg-slate-50 dark:hover:bg-slate-800'
             }`}
           >
             <span className="font-arabic text-2xl md:text-3xl">{letter.arabic}</span>
             <span className={`text-[9px] md:text-[10px] font-semibold uppercase tracking-wider ${currentIndex === idx ? 'text-white/90' : 'text-slate-400 dark:text-slate-500'}`}>{letter.latin}</span>
           </button>
         ))}
      </div>
    </div>
  );
}
