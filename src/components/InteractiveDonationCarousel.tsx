import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Users, Home, Droplets, GraduationCap, BookOpen, ShoppingBag } from 'lucide-react';
import { Program } from '../App';
import { DaiInteractive } from './DaiInteractive';
import { MasjidInteractive } from './MasjidInteractive';
import { SumurInteractive } from './SumurInteractive';
import { PendidikanInteractive } from './PendidikanInteractive';
import { QuranInteractive } from './QuranInteractive';
import { PanganInteractive } from './PanganInteractive';

interface Props {
  onAddToCart: (program: Program, amount: string) => void;
}

export const InteractiveDonationCarousel: React.FC<Props> = ({ onAddToCart }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const slides = ['dai', 'masjid', 'sumur', 'pendidikan', 'quran', 'pangan'];
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollLeft = scrollRef.current.scrollLeft;
      const width = scrollRef.current.offsetWidth;
      const index = Math.round(scrollLeft / width);
      if (index !== activeIndex) {
        setActiveIndex(index);
      }
    }
  };

  const scrollTo = (index: number) => {
    if (scrollRef.current) {
      const width = scrollRef.current.offsetWidth;
      scrollRef.current.scrollTo({
        left: width * index,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="w-full relative px-4 md:px-0 max-w-4xl mx-auto">
      
      {/* Top Navigation & Header */}
      <div className="w-full flex flex-col items-center justify-center mb-6">
        <div className="inline-block bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold px-3 py-1 text-[10px] md:text-xs rounded-full uppercase tracking-widest mb-3">
          Simulasi Kebaikan
        </div>
        <h3 className="text-2xl md:text-3xl font-serif font-black text-slate-900 dark:text-white mb-2 text-center">Pilih Program Kebaikan</h3>
        <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm text-center max-w-md mb-8">
          Tentukan program inspiratif pilihan Anda dan mulailah merangkai kebaikan secara interaktif.
        </p>
        
        <div className="flex bg-white dark:bg-slate-800 p-1.5 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm overflow-x-auto max-w-full no-scrollbar">
          <button 
            onClick={() => scrollTo(0)}
            className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${activeIndex === 0 ? 'bg-[#1799dc] text-white shadow-md shadow-[#1799dc]/20' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
          >
            <Users className="w-4 h-4" /> Bekal Dai
          </button>
          <button 
            onClick={() => scrollTo(1)}
            className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${activeIndex === 1 ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
          >
            <Home className="w-4 h-4" /> Bangun Masjid
          </button>
          <button 
            onClick={() => scrollTo(2)}
            className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${activeIndex === 2 ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
          >
            <Droplets className="w-4 h-4" /> Sumur Air
          </button>
          <button 
            onClick={() => scrollTo(3)}
            className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${activeIndex === 3 ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
          >
            <GraduationCap className="w-4 h-4" /> Beasiswa Yatim
          </button>
          <button 
            onClick={() => scrollTo(4)}
            className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${activeIndex === 4 ? 'bg-teal-500 text-white shadow-md shadow-teal-500/20' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
          >
            <BookOpen className="w-4 h-4" /> Wakaf Qur'an
          </button>
          <button 
            onClick={() => scrollTo(5)}
            className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${activeIndex === 5 ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
          >
            <ShoppingBag className="w-4 h-4" /> Paket Pangan
          </button>
        </div>
      </div>

      {/* Container */}
      <div className="w-full overflow-hidden relative">
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex pb-4 pt-4 md:pt-0 overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-smooth"
        >
          <div className="w-full shrink-0 flex items-center justify-center md:px-4 snap-center">
             <DaiInteractive onAddToCart={onAddToCart} />
          </div>
          <div className="w-full shrink-0 flex items-center justify-center md:px-4 snap-center">
             <MasjidInteractive onAddToCart={onAddToCart} />
          </div>
          <div className="w-full shrink-0 flex items-center justify-center md:px-4 snap-center">
             <SumurInteractive onAddToCart={onAddToCart} />
          </div>
          <div className="w-full shrink-0 flex items-center justify-center md:px-4 snap-center">
             <PendidikanInteractive onAddToCart={onAddToCart} />
          </div>
          <div className="w-full shrink-0 flex items-center justify-center md:px-4 snap-center">
             <QuranInteractive onAddToCart={onAddToCart} />
          </div>
          <div className="w-full shrink-0 flex items-center justify-center md:px-4 snap-center">
             <PanganInteractive onAddToCart={onAddToCart} />
          </div>
        </div>

        {/* Desktop Navigation Arrows */}
        <button 
          onClick={() => scrollTo(Math.max(0, activeIndex - 1))}
          className={`hidden md:flex absolute top-[150px] -left-4 w-10 h-10 bg-white dark:bg-slate-800 rounded-full items-center justify-center shadow-lg border border-slate-100 dark:border-slate-700 z-10 transition-opacity ${activeIndex === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100 hover:scale-110'}`}
        >
          <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
        </button>
        <button 
          onClick={() => scrollTo(Math.min(slides.length - 1, activeIndex + 1))}
          className={`hidden md:flex absolute top-[150px] -right-4 w-10 h-10 bg-white dark:bg-slate-800 rounded-full items-center justify-center shadow-lg border border-slate-100 dark:border-slate-700 z-10 transition-opacity ${activeIndex === slides.length - 1 ? 'opacity-0 pointer-events-none' : 'opacity-100 hover:scale-110'}`}
        >
           <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-300" />
        </button>
      </div>

    </div>
  );
};
