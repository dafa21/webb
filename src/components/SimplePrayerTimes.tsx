import React, { useState, useEffect } from 'react';

export const SimplePrayerTimes: React.FC = () => {
  const [timings, setTimings] = useState<Record<string, string> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTimings = async () => {
      try {
        // Menggunakan method=20 untuk Kemenag Indonesia
        const response = await fetch('https://api.aladhan.com/v1/timings?latitude=-6.2088&longitude=106.8456&method=20');
        const data = await response.json();
        
        if (data && data.data && data.data.timings) {
          const prayerTimes = {
            Imsyak: data.data.timings.Imsak,
            Subuh: data.data.timings.Fajr,
            Dzuhur: data.data.timings.Dhuhr,
            Ashar: data.data.timings.Asr,
            Maghrib: data.data.timings.Maghrib,
            Isya: data.data.timings.Isha,
          };
          
          // Tampilkan data di konsol sesuai permintaan
          console.log("Jadwal Sholat (Jakarta):", prayerTimes);
          setTimings(prayerTimes);
        }
      } catch (error) {
        console.error("Error fetching prayer times:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTimings();
  }, []);

  if (loading) {
    return <div className="p-4 text-center text-slate-500">Memuat jadwal sholat...</div>;
  }

  if (!timings) {
    return <div className="p-4 text-center text-red-500">Gagal memuat jadwal sholat.</div>;
  }

  return (
    <div className="p-6 bg-white dark:bg-slate-800 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700">
      <h3 className="text-xl font-serif font-black text-slate-900 dark:text-white mb-6">Jadwal Sholat Jakarta</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Object.entries(timings).map(([name, time]) => (
          <div key={name} className="flex flex-col bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{name}</span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{time}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-400 font-medium mt-6 text-center">
        *Cek konsol browser (F12) untuk melihat data yang diverifikasi dari API Aladhan.
      </p>
    </div>
  );
};
