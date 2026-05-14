import React from 'react';
import { Compass, Navigation } from 'lucide-react';
import { motion } from 'motion/react';

interface QiblaCompassCardProps {
  qiblaDegree: number | null;
  compassHeading: number;
  requestCompassPermission: () => void;
}

export const QiblaCompassCard: React.FC<QiblaCompassCardProps> = ({ 
  qiblaDegree, 
  compassHeading, 
  requestCompassPermission 
}) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 text-center relative overflow-hidden">
       <h3 className="font-black text-slate-800 dark:text-white mb-2 flex items-center justify-center gap-2">
         <Compass className="w-5 h-5 text-emerald-500" /> Kompas Kiblat
       </h3>
       
       {typeof (DeviceOrientationEvent as any).requestPermission === 'function' && (
         <button onClick={requestCompassPermission} className="text-xs bg-slate-100 dark:bg-slate-700 px-4 py-1.5 rounded-full mb-4 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
           Izinkan Sensor Kompas
         </button>
       )}
       
       <div className="text-sm text-slate-500 dark:text-slate-400 mb-8">
         Posisi Ka'bah (Kiblat) berada pada <span className="font-black text-emerald-600 dark:text-emerald-400">{qiblaDegree ? qiblaDegree.toFixed(1) : '...'}°</span> dari Utara Sejati.
       </div>

       <div className="relative w-64 h-64 mx-auto my-4">
         {/* The Compass Base / Outer Ring */}
         <div 
           className="absolute inset-0 rounded-full bg-slate-50 dark:bg-slate-800/50 shadow-[inset_0_2px_15px_-3px_rgba(0,0,0,0.1)] border-[8px] border-slate-100 dark:border-slate-700 flex items-center justify-center transition-transform duration-300 shadow-xl"
           style={{ transform: `rotate(${-compassHeading}deg)` }}
         >
            {/* Tick marks (every 30 degrees) */}
            {Array.from({ length: 12 }).map((_, i) => (
              <div 
                key={i} 
                className="absolute w-full h-full flex justify-center pointer-events-none"
                style={{ transform: `rotate(${i * 30}deg)` }}
              >
                <div className={`w-1 origin-top ${i % 3 === 0 ? 'h-3 bg-slate-300 dark:bg-slate-500 mt-1' : 'h-1.5 bg-slate-200 dark:bg-slate-600 mt-1.5'} rounded-full`}></div>
              </div>
            ))}

            {/* Compass Text Directions (counter-rotated to stay upright) */}
            <div className="absolute top-4 flex justify-center w-full z-10">
               <span className="font-black text-lg text-red-500 drop-shadow-sm" style={{ transform: `rotate(${compassHeading}deg)` }}>U</span>
            </div>
            <div className="absolute bottom-4 flex justify-center w-full z-10">
               <span className="font-black text-lg text-slate-500 drop-shadow-sm" style={{ transform: `rotate(${compassHeading}deg)` }}>S</span>
            </div>
            <div className="absolute right-4 flex items-center h-full z-10">
               <span className="font-black text-lg text-slate-500 drop-shadow-sm" style={{ transform: `rotate(${compassHeading}deg)` }}>T</span>
            </div>
            <div className="absolute left-4 flex items-center h-full z-10">
               <span className="font-black text-lg text-slate-500 drop-shadow-sm" style={{ transform: `rotate(${compassHeading}deg)` }}>B</span>
            </div>
            
            {/* Kiblat Arrow / Target */}
            {qiblaDegree !== null && (
              <div 
                className="absolute inset-0 transition-transform duration-500 ease-out z-20 pointer-events-none"
                style={{ transform: `rotate(${qiblaDegree}deg)` }}
              >
                 <div className="absolute -top-3 w-full flex flex-col items-center">
                   {/* The Kaaba Icon / Pointer */}
                   <div className="bg-emerald-500 font-bold text-white shadow-emerald-500/50 rounded-lg p-2 shadow-xl border-2 border-white dark:border-slate-800 flex items-center justify-center relative">
                     <Navigation className="w-5 h-5" fill="currentColor" />
                   </div>
                   {/* Line stretching down to the center */}
                   <div className="w-1 h-28 bg-gradient-to-b from-emerald-500 to-transparent -mt-2"></div>
                 </div>
              </div>
            )}
         </div>
         
         {/* Static phone alignment indicator (Center needle) */}
         <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none drop-shadow-lg z-30">
            {/* Phone's Forward indicator */}
            <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[16px] border-l-transparent border-r-transparent border-b-slate-800 dark:border-b-white -mt-16 mb-2"></div>
            {/* Center Axis */}
            <div className="w-4 h-4 bg-slate-800 dark:bg-white rounded-full border-2 border-emerald-500 flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
            </div>
         </div>
       </div>
       
       <p className="text-[11px] text-slate-500 mt-8 leading-relaxed px-4">
         Arahkan ujung atas HP ke tanda hijau (<span className="font-semibold text-emerald-600">Kiblat</span>).<br/><span className="text-slate-400">Pastikan Anda menjauh dari benda magnetik. Kalibrasi kompas dengan gerakan angka 8 jika tidak akurat.</span>
       </p>
    </div>
  );
};
