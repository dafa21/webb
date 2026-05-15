import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface MakhrajVisualizerProps {
  highlight: string;
}

const MakhrajVisualizer: React.FC<MakhrajVisualizerProps> = ({ highlight }) => {
  // Determine which parts to highlight based on makhrajArea
  const hParts = {
    nasal: highlight.includes('nasal'),
    lips: highlight.includes('lips') || highlight.includes('lip-teeth') || highlight.includes('lips-round'),
    teethTop: highlight.includes('teeth') || highlight.includes('lip-teeth'),
    teethBottom: highlight.includes('tip-lower'),
    gumTop: highlight.includes('gum') || highlight.includes('tip-side'),
    palateHard: highlight.includes('mid-tongue') || highlight.includes('back-tongue-mid'),
    palateSoft: highlight.includes('back-tongue-top'),
    tongueTip: highlight.includes('tip'),
    tongueMid: highlight.includes('mid-tongue'),
    tongueBack: highlight.includes('back-tongue'),
    tongueSide: highlight.includes('side-tongue'),
    throatTop: highlight === 'top-throat',
    throatMid: highlight === 'mid-throat',
    throatBottom: highlight === 'bottom-throat',
    jauf: highlight === 'jauf',
    thick: highlight.includes('thick')
  };

  return (
    <div className="relative w-full aspect-square max-w-sm mx-auto rounded-3xl overflow-hidden flex items-center justify-center p-2">
      <svg 
        viewBox="0 0 500 500" 
        className="w-full h-full drop-shadow-sm"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <radialGradient id="highlight-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.8" />
            <stop offset="60%" stopColor="#0ea5e9" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
          </radialGradient>
          <filter id="shadow">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.05" />
          </filter>
        </defs>

        {/* --- ANATOMY BACKGROUND --- */}
        <g className="text-amber-100/50 dark:text-slate-700/50" fill="currentColor">
          {/* Main head silhouette */}
          <path d="M 220 20 
                   C 140 20 100 80 100 130 
                   C 100 160 110 180 80 200 
                   C 70 205 70 215 80 220 
                   C 95 230 110 230 100 240 
                   C 90 250 90 260 100 270 
                   C 110 280 120 280 120 300 
                   C 120 320 100 350 110 380 
                   C 130 440 180 480 220 480 
                   L 400 480 
                   C 420 400 420 320 400 250 
                   C 380 100 320 20 220 20 Z" />
        </g>

        {/* --- INTERNAL ANATOMY --- */}
        {/* Nasal Cavity (Al-Khaisyum) */}
        <path d="M 130 200 C 130 150 200 130 250 160 C 280 180 280 220 250 220 C 180 220 150 180 130 200 Z" 
              fill={hParts.nasal ? "#bae6fd" : "#f1f5f9"} 
              className="dark:fill-slate-800 transition-colors duration-500" />

        {/* Oral Cavity (Al-Jauf part) */}
        <path d="M 120 250 C 180 230 250 230 280 280 C 250 320 180 300 120 250 Z" 
              fill={hParts.jauf ? "#e0f2fe" : "#ffffff"} 
              className="dark:fill-slate-900 transition-colors duration-500" />
              
        {/* Throat Cavity (Al-Halq & Al-Jauf part) */}
        <path d="M 270 250 C 300 280 300 400 280 480 L 220 480 C 230 400 230 300 270 250 Z" 
              fill={hParts.jauf ? "#e0f2fe" : "#f8fafc"} 
              className="dark:fill-slate-800 transition-colors duration-500" />

        {/* Soft Palate & Uvula */}
        <path d="M 230 220 C 260 220 280 240 280 260 C 280 270 270 280 270 270 C 270 250 250 230 230 220 Z" 
              fill="#fb923c" opacity="0.6" stroke="#ea580c" strokeWidth="2" />

        {/* Hard Palate */}
        <path d="M 140 220 C 180 200 230 220 230 220" 
              fill="none" stroke="#f43f5e" strokeWidth="6" strokeLinecap="round" />
              
        {/* Gums (Alveolar Ridge) */}
        <path d="M 130 235 C 135 230 140 220 140 220" 
              fill="none" stroke="#e11d48" strokeWidth="8" strokeLinecap="round" />

        {/* Teeth Upper */}
        <path d="M 120 240 L 125 255 L 135 250 L 130 235 Z" 
              fill={hParts.teethTop ? "#38bdf8" : "#ffffff"} stroke="#cbd5e1" strokeWidth="2" strokeLinejoin="round" />
        
        {/* Teeth Lower */}
        <path d="M 115 270 L 120 255 L 130 260 L 125 275 Z" 
              fill={hParts.teethBottom ? "#38bdf8" : "#ffffff"} stroke="#cbd5e1" strokeWidth="2" strokeLinejoin="round" />

        {/* --- TONGUE (Al-Lisan) --- */}
        {/* Animated Tongue Path to visualize articulation */}
        <motion.path 
          animate={{
            d: hParts.tongueTip && hParts.gumTop ? "M 130 260 C 150 225 180 270 230 280 C 280 290 280 340 230 350 C 160 360 120 300 130 260 Z" // Tip up to gums
            : hParts.tongueTip && hParts.teethTop ? "M 120 250 C 150 225 180 270 230 280 C 280 290 280 340 230 350 C 160 360 120 300 120 250 Z" // Tip to edge of teeth
            : hParts.tongueTip && hParts.teethBottom ? "M 125 270 C 150 240 180 260 230 280 C 280 290 280 340 230 350 C 160 360 130 310 125 270 Z" // Tip down behind lower teeth
            : hParts.tongueMid ? "M 130 260 C 180 210 220 250 240 280 C 280 310 280 340 230 350 C 160 360 120 300 130 260 Z" // Mid tongue up
            : hParts.tongueBack ? "M 130 260 C 180 260 240 220 270 280 C 280 310 270 340 230 350 C 160 360 120 300 130 260 Z" // Back tongue up
            : hParts.thick ? "M 125 250 C 150 225 200 270 260 230 C 280 280 270 340 230 350 C 160 360 120 300 125 250 Z" // Thick (tip to gums + back raised)
            : "M 130 260 C 180 260 230 270 250 280 C 280 300 270 340 230 350 C 160 360 120 300 130 260 Z" // Neutral rest position
          }}
          transition={{ type: "spring", stiffness: 90, damping: 15 }}
          fill="#fda4af" 
          stroke="#f43f5e"
          strokeWidth="3"
        />

        {/* --- LIPS (Asy-Syafatain) --- */}
        {/* Upper Lip */}
        <motion.path 
          animate={{
            d: hParts.lips ? "M 100 240 C 95 245 105 250 115 245 C 105 235 100 240 100 240 Z" : "M 95 235 C 90 240 110 245 120 240 C 110 230 95 235 95 235 Z"
          }}
          fill="#fb7185" 
        />
        {/* Lower Lip */}
        <motion.path 
          animate={{
            d: hParts.lips ? "M 100 260 C 95 265 105 270 115 265 C 105 255 100 260 100 260 Z" : "M 90 260 C 85 265 105 270 115 265 C 105 250 90 260 90 260 Z"
          }}
          fill="#fb7185" 
        />


        {/* --- HIGHLIGHT ANIMATIONS --- */}
        <AnimatePresence>
          {/* Lips Glow */}
          {hParts.lips && (
            <motion.circle key="highlight-lips" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} cx="105" cy="250" r="35" fill="url(#highlight-glow)" />
          )}

          {/* Throat High / Top */}
          {hParts.throatTop && (
            <motion.circle key="highlight-throat-top" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} cx="280" cy="280" r="30" fill="url(#highlight-glow)" />
          )}

          {/* Throat Mid */}
          {hParts.throatMid && (
            <motion.circle key="highlight-throat-mid" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} cx="280" cy="340" r="30" fill="url(#highlight-glow)" />
          )}

          {/* Throat Bottom / Deep */}
          {hParts.throatBottom && (
            <motion.circle key="highlight-throat-bottom" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} cx="270" cy="400" r="30" fill="url(#highlight-glow)" />
          )}

          {/* Nasal Cavity Glow */}
          {hParts.nasal && (
            <motion.circle key="highlight-nasal" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} cx="190" cy="180" r="45" fill="url(#highlight-glow)" />
          )}

          {/* Tongue Tips & Palates */}
          {hParts.tongueTip && !hParts.teethBottom && (
            <motion.circle key="highlight-tongue-tip-up" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} cx="140" cy="245" r="25" fill="url(#highlight-glow)" />
          )}
          {hParts.tongueTip && hParts.teethBottom && (
            <motion.circle key="highlight-tongue-tip-down" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} cx="130" cy="270" r="25" fill="url(#highlight-glow)" />
          )}
          {hParts.tongueMid && (
            <motion.circle key="highlight-tongue-mid" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} cx="200" cy="235" r="30" fill="url(#highlight-glow)" />
          )}
          {hParts.tongueBack && (
            <motion.circle key="highlight-tongue-back" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} cx="250" cy="245" r="30" fill="url(#highlight-glow)" />
          )}
          {hParts.tongueSide && (
            <motion.circle key="highlight-tongue-side" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} cx="180" cy="260" r="35" fill="url(#highlight-glow)" />
          )}
          {hParts.jauf && (
             <motion.ellipse key="highlight-jauf" initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} exit={{ opacity: 0 }} cx="200" cy="270" rx="60" ry="30" fill="url(#highlight-glow)" />
          )}
        </AnimatePresence>

        {/* --- LABELS (Informational) --- */}
        <g className="text-[14px] font-medium text-slate-700 dark:text-slate-300 font-sans" fill="currentColor">
           {hParts.nasal && <text x="180" y="140">Al-Khaisyum (Rongga Hidung)</text>}
           {hParts.jauf && <text x="200" y="300">Al-Jauf (Rongga Mulut)</text>}
           {hParts.lips && <text x="10" y="255">Asy-Syafatain (Bibir)</text>}
           {(hParts.throatTop || hParts.throatMid || hParts.throatBottom) && <text x="310" y="340">Al-Halq (Tenggorokan)</text>}
           {(hParts.tongueTip || hParts.tongueMid || hParts.tongueBack || hParts.tongueSide) && <text x="160" y="330">Al-Lisan (Lidah)</text>}
           
           {/* Detailed Tooltips Based on Area */}
           {hParts.throatTop && <text x="320" y="280" className="text-sky-600 dark:text-sky-400 font-bold text-[12px]">Ujung Tenggorokan</text>}
           {hParts.throatMid && <text x="320" y="340" className="text-sky-600 dark:text-sky-400 font-bold text-[12px]">Tengah Tenggorokan</text>}
           {hParts.throatBottom && <text x="310" y="400" className="text-sky-600 dark:text-sky-400 font-bold text-[12px]">Pangkal Tenggorokan</text>}
        </g>
      </svg>
    </div>
  );
};

export default MakhrajVisualizer;
