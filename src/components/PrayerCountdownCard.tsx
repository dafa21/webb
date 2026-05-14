import React from 'react';
import { Clock } from 'lucide-react';

interface PrayerCountdownCardProps {
  nextPrayer: {
    name: string;
    hours: number;
    mins: number;
    time: string;
  } | null;
}

export const PrayerCountdownCard: React.FC<PrayerCountdownCardProps> = ({ nextPrayer }) => {
  if (!nextPrayer) return null;

  return (
    <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-3xl p-6 text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Clock className="w-32 h-32" />
      </div>
      <div className="relative z-10">
        <p className="text-emerald-100 font-medium text-sm mb-1">Panggilan Menuju Ilahi</p>
        <h2 className="text-3xl font-black capitalize mb-4">{nextPrayer.name}</h2>
        
        <div className="flex items-end gap-3 font-mono">
          <div className="flex flex-col">
            <span className="text-4xl font-black leading-none">{String(nextPrayer.hours).padStart(2, '0')}</span>
            <span className="text-[10px] uppercase tracking-widest text-emerald-200 mt-1">Jam</span>
          </div>
          <span className="text-4xl font-black leading-none pb-1">:</span>
          <div className="flex flex-col">
            <span className="text-4xl font-black leading-none">{String(nextPrayer.mins).padStart(2, '0')}</span>
            <span className="text-[10px] uppercase tracking-widest text-emerald-200 mt-1">Menit</span>
          </div>
          <div className="ml-auto flex flex-col items-end">
            <span className="text-sm font-bold text-emerald-100">Waktu {nextPrayer.name}</span>
            <span className="text-2xl font-black">{nextPrayer.time}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
