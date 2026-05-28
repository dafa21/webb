import React, { useState, useEffect, useRef } from 'react';
import { Volume2, RefreshCw, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WordData {
  id: string;
  arabic: string;
  audioUrl?: string;
  translation?: string;
  transliteration?: string;
}

export default function HijaiyahWordsVisualizer() {
  const [words, setWords] = useState<WordData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fetchWords = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://api.quran.com/api/v4/verses/by_chapter/112?words=true&word_fields=text_uthmani');
      const data = await response.json();
      
      const extractedWords: WordData[] = [];
      data.verses.forEach((verse: any) => {
        verse.words.forEach((word: any) => {
          if (word.char_type_name === 'word') {
             extractedWords.push({
               id: word.id.toString(),
               arabic: word.text_uthmani,
               audioUrl: word.audio_url ? `https://audio.qurancdn.com/${word.audio_url}` : undefined,
               translation: word.translation?.text,
               transliteration: word.transliteration?.text,
             });
          }
        });
      });
      
      setWords(extractedWords);
    } catch (error) {
      console.error("Gagal mengambil data ayat:", error);
      // Fallback
      setWords([
        { id: "1", arabic: "قُلْ" },
        { id: "2", arabic: "هُوَ" },
        { id: "3", arabic: "ٱللَّهُ" },
        { id: "4", arabic: "أَحَدٌ" }
      ]);
    } finally {
      setIsLoading(false);
      setCurrentIndex(0);
    }
  };

  useEffect(() => {
    fetchWords();
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const handlePlayAudio = () => {
    if (isPlaying || words.length === 0) return;
    setIsPlaying(true);
    
    if (audioRef.current) {
      audioRef.current.pause();
    }

    const currentWord = words[currentIndex];
    
    if (currentWord.audioUrl) {
      const audio = new Audio(currentWord.audioUrl);
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
      <div className="w-full max-w-3xl mx-auto flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 min-h-[300px]">
        <RefreshCw className="w-8 h-8 text-[#1799dc] animate-spin mb-4" />
        <p className="text-slate-500 font-medium animate-pulse">Mengambil data kata dari API...</p>
      </div>
    );
  }

  if (words.length === 0) return null;

  const currentWord = words[currentIndex];

  return (
    <div className="w-full max-w-3xl mx-auto animate-fade-in flex flex-col items-center">
      <div className="w-full bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col pt-6 md:pt-8 px-6 pb-6 relative">
        
        <div className="absolute top-4 left-4 text-xs font-bold px-3 py-1.5 bg-[#1799dc]/10 text-[#1799dc] rounded-full flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5" />
          Tingkat 2: Huruf Sambung
        </div>

        <div className="absolute top-4 right-4 text-[10px] font-bold px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 rounded-full shadow-sm">
          {currentIndex + 1} / {words.length}
        </div>

        <div className="flex flex-col items-center justify-center mt-6">
           <div className="flex justify-center items-center h-40 md:h-48 w-full">
             <AnimatePresence mode="wait">
               <motion.div 
                 key={currentWord.id}
                 initial={{ scale: 0.9, opacity: 0, y: 10 }}
                 animate={{ scale: 1, opacity: 1, y: 0 }}
                 exit={{ scale: 0.9, opacity: 0, y: -10 }}
                 className="text-[80px] md:text-[100px] font-arabic leading-normal text-slate-800 dark:text-slate-100 drop-shadow-sm text-center px-4 break-words max-w-full"
                 dir="rtl"
               >
                 {currentWord.arabic}
               </motion.div>
             </AnimatePresence>
           </div>
           
           <button 
             onClick={handlePlayAudio}
             className={`mt-4 w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all shadow-md ${isPlaying ? 'bg-[#1799dc] text-white shadow-[#1799dc]/40 scale-105' : 'bg-white dark:bg-slate-700 border-2 border-[#1799dc] text-[#1799dc] hover:bg-[#1799dc] hover:text-white dark:border-[#38bdf8] dark:text-[#38bdf8] dark:hover:bg-[#38bdf8] dark:hover:text-slate-900'}`}
             aria-label="Play pronunciation"
           >
              <Volume2 className="w-6 h-6 md:w-8 md:h-8" />
           </button>
        </div>
      </div>

      {/* Horizontal List Selector */}
      <div className="w-full mt-4 pb-2 overflow-x-auto scrollbar-hide flex gap-2 px-1 snap-x select-none" dir="rtl">
         {words.map((word, idx) => (
           <button
             key={word.id}
             onClick={() => setCurrentIndex(idx)}
             className={`flex-shrink-0 snap-center px-6 py-4 rounded-xl flex flex-col items-center justify-center gap-1 transition-all duration-200 min-h-[80px] min-w-[80px] ${
               currentIndex === idx 
                 ? 'bg-[#1799dc] text-white shadow-md scale-105 border-transparent z-10' 
                 : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-[#1799dc]/40 hover:bg-slate-50 dark:hover:bg-slate-700'
             }`}
           >
             <span className="font-arabic text-3xl md:text-4xl">{word.arabic}</span>
           </button>
         ))}
      </div>
    </div>
  );
}
