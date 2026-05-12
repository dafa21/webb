import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Program } from '../App';
import { DaiInteractive } from './DaiInteractive';
import { MasjidInteractive } from './MasjidInteractive';

interface Props {
  onAddToCart: (program: Program, amount: string) => void;
}

export const InteractiveDonationCarousel: React.FC<Props> = ({ onAddToCart }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const slides = ['dai', 'masjid'];
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
      
      {/* Container */}
      <div className="w-full overflow-hidden relative pb-10">
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex pb-8 pt-4 md:pt-0 overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-smooth"
        >
          <div className="w-full shrink-0 flex items-center justify-center md:px-4 snap-center">
             <DaiInteractive onAddToCart={onAddToCart} />
          </div>
          <div className="w-full shrink-0 flex items-center justify-center md:px-4 snap-center">
             <MasjidInteractive onAddToCart={onAddToCart} />
          </div>
        </div>

        {/* Tab Indicators & Navigation */}
        <div className="absolute bottom-0 left-0 w-full flex flex-col items-center justify-center gap-3 pointer-events-none">
           <div className="flex bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm p-1 rounded-full border border-slate-200/50 dark:border-slate-700/50 pointer-events-auto">
             <button 
               onClick={() => scrollTo(0)}
               className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${activeIndex === 0 ? 'bg-[#1799dc] text-white shadow-md shadow-[#1799dc]/20' : 'text-slate-500 hover:text-slate-700'}`}
             >
               Bekal Dai
             </button>
             <button 
               onClick={() => scrollTo(1)}
               className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${activeIndex === 1 ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'text-slate-500 hover:text-slate-700'}`}
             >
               Bangun Masjid
             </button>
           </div>
        </div>

        {/* Desktop Navigation Arrows */}
        <button 
          onClick={() => scrollTo(Math.max(0, activeIndex - 1))}
          className={`hidden md:flex absolute top-1/2 -left-4 -translate-y-1/2 w-10 h-10 bg-white dark:bg-slate-800 rounded-full items-center justify-center shadow-lg border border-slate-100 dark:border-slate-700 z-10 transition-opacity ${activeIndex === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100 hover:scale-110'}`}
        >
          <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
        </button>
        <button 
          onClick={() => scrollTo(Math.min(slides.length - 1, activeIndex + 1))}
          className={`hidden md:flex absolute top-1/2 -right-4 -translate-y-1/2 w-10 h-10 bg-white dark:bg-slate-800 rounded-full items-center justify-center shadow-lg border border-slate-100 dark:border-slate-700 z-10 transition-opacity ${activeIndex === slides.length - 1 ? 'opacity-0 pointer-events-none' : 'opacity-100 hover:scale-110'}`}
        >
           <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-300" />
        </button>
      </div>

    </div>
  );
};
