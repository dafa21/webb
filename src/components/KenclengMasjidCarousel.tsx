import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MOSQUES, MosqueCard } from './MosqueProfiles';

interface Props {
  onAddToCart: (program: any, amount: string) => void;
  onQuickDonate: (program: any, amount: string) => void;
  onOpenDetail: (mosque: any) => void;
}

export const KenclengMasjidCarousel: React.FC<Props> = ({ onAddToCart, onQuickDonate, onOpenDetail }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Show first 6 featured/top mosques
  const featuredMosques = MOSQUES.slice(0, 6);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300; // arbitrary scroll chunk
      scrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full relative px-4 md:px-0 mx-auto max-w-6xl">
      <div 
        ref={scrollRef}
        className="flex gap-4 md:gap-6 pb-8 pt-4 overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-smooth"
      >
        {featuredMosques.map((mosque, idx) => (
          <div key={mosque.id} className="w-[280px] md:w-[320px] shrink-0 snap-center">
            <MosqueCard 
              mosque={mosque} 
              idx={idx} 
              onAddToCart={onAddToCart} 
              onQuickDonate={onQuickDonate} 
              onOpenDetail={onOpenDetail} 
            />
          </div>
        ))}
      </div>

      {/* Desktop Navigation Arrows */}
      <button 
        onClick={() => scroll('left')}
        className="hidden md:flex absolute top-[40%] -left-6 w-12 h-12 bg-white dark:bg-slate-800 rounded-full items-center justify-center shadow-xl border border-slate-100 dark:border-slate-700 z-10 transition-transform hover:scale-110"
      >
        <ChevronLeft className="w-6 h-6 text-slate-600 dark:text-slate-300" />
      </button>
      <button 
        onClick={() => scroll('right')}
        className="hidden md:flex absolute top-[40%] -right-6 w-12 h-12 bg-white dark:bg-slate-800 rounded-full items-center justify-center shadow-xl border border-slate-100 dark:border-slate-700 z-10 transition-transform hover:scale-110"
      >
        <ChevronRight className="w-6 h-6 text-slate-600 dark:text-slate-300" />
      </button>
    </div>
  );
};
