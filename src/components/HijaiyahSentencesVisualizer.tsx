import React, { useState, useEffect, useRef } from 'react';
import { Volume2, RefreshCw, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SentenceData {
  id: string;
  arabic: string;
  audioUrl?: string;
  numberInSurah: number;
}

export default function HijaiyahSentencesVisualizer() {
  const [sentences, setSentences] = useState<SentenceData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fetchSentences = async () => {
    setIsLoading(true);
    try {
      // Mengambil Surah Al-Ikhlas (112)
      const response = await fetch('https://api.alquran.cloud/v1/surah/112/ar.alafasy');
      const data = await response.json();
      
      if (data.code === 200) {
        const extractedSentences: SentenceData[] = data.data.ayahs.map((ayah: any) => ({
           id: ayah.number.toString(),
           arabic: ayah.text,
           audioUrl: ayah.audio,
           numberInSurah: ayah.numberInSurah
        }));
        
        setSentences(extractedSentences);
      }
    } catch (error) {
      console.error("Gagal mengambil data ayat:", error);
      // Fallback
      setSentences([
        { id: "1", arabic: "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ قُلْ هُوَ ٱللَّهُ أَحَدٌ", numberInSurah: 1 },
        { id: "2", arabic: "ٱللَّهُ ٱلصَّمَدُ", numberInSurah: 2 },
        { id: "3", arabic: "لَمْ يَلِدْ وَلَمْ يُولَدْ", numberInSurah: 3 },
        { id: "4", arabic: "وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ", numberInSurah: 4 }
      ]);
    } finally {
      setIsLoading(false);
      setCurrentIndex(0);
    }
  };

  useEffect(() => {
    fetchSentences();
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const handlePlayAudio = () => {
    if (isPlaying || sentences.length === 0) return;
    setIsPlaying(true);
    
    if (audioRef.current) {
      audioRef.current.pause();
    }

    const currentSentence = sentences[currentIndex];
    
    if (currentSentence.audioUrl) {
      const audio = new Audio(currentSentence.audioUrl);
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
    } else {
       setIsPlaying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 min-h-[300px]">
        <RefreshCw className="w-8 h-8 text-[#1799dc] animate-spin mb-4" />
        <p className="text-slate-500 font-medium animate-pulse">Mengambil data kalimat dari API...</p>
      </div>
    );
  }

  if (sentences.length === 0) return null;

  const currentSentence = sentences[currentIndex];

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in flex flex-col items-center">
      <div className="w-full bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col pt-6 md:pt-8 px-6 pb-6 relative min-h-[320px]">
        
        <div className="absolute top-4 left-4 text-xs font-bold px-3 py-1.5 bg-[#1799dc]/10 text-[#1799dc] rounded-full flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5" />
          Tingkat 3: Kalimat (Ayat)
        </div>

        <div className="absolute top-4 right-4 text-[10px] font-bold px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 rounded-full shadow-sm">
          Ayat {currentSentence.numberInSurah}
        </div>

        <div className="flex flex-col items-center justify-center mt-12 flex-grow">
           <div className="flex justify-center items-center w-full min-h-[160px] py-4">
             <AnimatePresence mode="wait">
               <motion.div 
                 key={currentSentence.id}
                 initial={{ scale: 0.95, opacity: 0, y: 10 }}
                 animate={{ scale: 1, opacity: 1, y: 0 }}
                 exit={{ scale: 0.95, opacity: 0, y: -10 }}
                 transition={{ duration: 0.3 }}
                 className="text-[40px] md:text-[60px] lg:text-[70px] font-arabic leading-loose text-slate-800 dark:text-slate-100 drop-shadow-sm text-center px-4 break-words w-full"
                 dir="rtl"
               >
                 {currentSentence.arabic}
               </motion.div>
             </AnimatePresence>
           </div>
           
           <button 
             onClick={handlePlayAudio}
             className={`mt-8 w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all shadow-md ${isPlaying ? 'bg-[#1799dc] text-white shadow-[#1799dc]/40 scale-105' : 'bg-white dark:bg-slate-700 border-2 border-[#1799dc] text-[#1799dc] hover:bg-[#1799dc] hover:text-white dark:border-[#38bdf8] dark:text-[#38bdf8] dark:hover:bg-[#38bdf8] dark:hover:text-slate-900'}`}
             aria-label="Play pronunciation"
           >
              <Volume2 className="w-6 h-6 md:w-8 md:h-8" />
           </button>
        </div>
      </div>

      {/* Horizontal List Selector */}
      <div className="w-full mt-4 pb-2 overflow-x-auto scrollbar-hide flex gap-2 px-1 snap-x select-none" dir="ltr">
         {sentences.map((sentence, idx) => (
           <button
             key={sentence.id}
             onClick={() => setCurrentIndex(idx)}
             className={`flex-shrink-0 snap-center px-6 py-4 rounded-xl flex flex-col items-center justify-center gap-1 transition-all duration-200 min-w-[120px] ${
               currentIndex === idx 
                 ? 'bg-[#1799dc] text-white shadow-md scale-105 border-transparent z-10' 
                 : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-[#1799dc]/40 hover:bg-slate-50 dark:hover:bg-slate-700'
             }`}
           >
             <span className="font-bold">Ayat {sentence.numberInSurah}</span>
             <span className="text-xs opacity-70 truncate w-full text-center max-w-[100px]" dir="rtl">{sentence.arabic}</span>
           </button>
         ))}
      </div>
    </div>
  );
}
