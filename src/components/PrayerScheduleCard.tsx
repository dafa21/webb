import React from 'react';

interface PrayerScheduleCardProps {
  jadwal: any;
  sholatList: { name: string; key: string; icon: React.ElementType }[];
  nextPrayerName?: string;
}

export const PrayerScheduleCard: React.FC<PrayerScheduleCardProps> = ({ jadwal, sholatList, nextPrayerName }) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-700">
       <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-100 dark:border-slate-700">
         <h3 className="font-black text-slate-800 dark:text-white">Jadwal Hari Ini</h3>
         <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">{jadwal?.tanggal}</span>
       </div>
       
       <div className="grid grid-cols-2 gap-3">
         {sholatList.map((s) => (
           <div 
            key={s.key} 
            className={`flex items-center justify-between p-3 rounded-2xl border ${nextPrayerName === s.key ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-slate-100 dark:border-slate-700'}`}
           >
             <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${nextPrayerName === s.key ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                  <s.icon className="w-4 h-4" />
                </div>
                <span className={`text-sm font-bold capitalize ${nextPrayerName === s.key ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300'}`}>{s.name}</span>
             </div>
             <span className={`text-sm font-black ${nextPrayerName === s.key ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
               {jadwal?.[s.key] || '--:--'}
             </span>
           </div>
         ))}
       </div>
       <p className="text-center text-[10px] text-slate-400 mt-4 font-medium uppercase tracking-widest">
         Waktu ditarik secara Real-time dari Kementerian Agama RI
       </p>
    </div>
  );
};
