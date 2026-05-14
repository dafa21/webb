import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, MapPin, Compass, Clock, Map as MapIcon, Loader2, Navigation, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SholatPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState<string>('');
  
  const [locationName, setLocationName] = useState('Sedang mencari lokasi...');
  const [jadwal, setJadwal] = useState<any>(null);
  
  const [coords, setCoords] = useState<{lat: number, lng: number} | null>(null);
  const [qiblaDegree, setQiblaDegree] = useState<number | null>(null);
  const [compassHeading, setCompassHeading] = useState<number>(0);
  
  // Waktu & Hitung Mundur
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Kiblat Math Formula to Mecca
  function calculateQibla(lat: number, lng: number) {
    const QIBLA_LAT = 21.422487;
    const QIBLA_LNG = 39.826206;
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const toDeg = (rad: number) => (rad * 180) / Math.PI;

    const phiK = toRad(QIBLA_LAT);
    const lambdaK = toRad(QIBLA_LNG);
    const phi = toRad(lat);
    const lambda = toRad(lng);

    const y = Math.sin(lambdaK - lambda);
    const x = Math.cos(phi) * Math.tan(phiK) - Math.sin(phi) * Math.cos(lambdaK - lambda);
    let qibla = toDeg(Math.atan2(y, x));
    
    return (qibla + 360) % 360;
  }

  useEffect(() => {
    // 1. Get GPS
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setCoords({lat, lng});
          
          setQiblaDegree(calculateQibla(lat, lng));

          try {
            // Reverse Geocode
            const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=id`);
            const geoData = await geoRes.json();
            
            let cityRaw = geoData.city || geoData.locality || 'Jakarta';
            setLocationName(cityRaw + ', ' + geoData.principalSubdivision);
            
            // Format city for myquran API (remove Kota, Kab, etc for better search)
            let cityClean = cityRaw.replace(/kota|kabupaten|kab/gi, '').trim().toLowerCase();
            if (!cityClean) cityClean = 'jakarta';

            const cariRes = await fetch(`https://api.myquran.com/v2/sholat/kota/cari/${encodeURIComponent(cityClean)}`);
            const cariData = await cariRes.json();
            
            let idKota = '1301'; // Default Jakarta
            if (cariData.status && cariData.data && cariData.data.length > 0) {
              idKota = cariData.data[0].id;
              setLocationName(geoData.city ? geoData.city : cariData.data[0].lokasi);
            }

            // Get Jadwal
            const d = new Date();
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const date = String(d.getDate()).padStart(2, '0');

            const jadwalRes = await fetch(`https://api.myquran.com/v2/sholat/jadwal/${idKota}/${year}/${month}/${date}`);
            const jadwalData = await jadwalRes.json();
            
            if (jadwalData.status && jadwalData.data && jadwalData.data.jadwal) {
              setJadwal(jadwalData.data.jadwal);
            } else {
               setErrorStatus('Jadwal sholat tidak ditemukan dari server Kemenag.');
            }

          } catch (e) {
             setErrorStatus('Gagal mengambil data jadwal sholat (Jaringan error).');
          } finally {
             setLoading(false);
          }
        },
        (err) => {
          setErrorStatus('Akses Lokasi diblokir. Tidak dapat menentukan waktu sholat presisi.');
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    } else {
      setErrorStatus('Browser tidak mendukung lokasi.');
      setLoading(false);
    }
  }, []);

  // Device orientation
  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      let heading = 0;
      if (e.webkitCompassHeading) {
        // iOS
        heading = e.webkitCompassHeading;
      } else if (e.alpha !== null) {
        // Android
        // It's a bit tricky to get true north reliably without magnetometer fusion calibration on standard alpha
        heading = 360 - e.alpha; 
      }
      setCompassHeading(heading);
    };

    window.addEventListener('deviceorientationabsolute', handleOrientation as EventListener);
    // Fallback
    window.addEventListener('deviceorientation', handleOrientation as EventListener);

    return () => {
      window.removeEventListener('deviceorientationabsolute', handleOrientation as EventListener);
      window.removeEventListener('deviceorientation', handleOrientation as EventListener);
    };
  }, []);

  // Request permission for iOS 13+
  const requestCompassPermission = () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      (DeviceOrientationEvent as any).requestPermission()
        .then((permissionState: string) => {
          if (permissionState === 'granted') {
            window.addEventListener('deviceorientation', (e) => {
              if ((e as any).webkitCompassHeading) {
                setCompassHeading((e as any).webkitCompassHeading);
              }
            });
          }
        })
        .catch(console.error);
    }
  };

  const sholatList = [
    { name: 'Imsak', key: 'imsak', icon: Clock },
    { name: 'Subuh', key: 'subuh', icon: Clock },
    { name: 'Terbit', key: 'terbit', icon: Clock },
    { name: 'Dhuha', key: 'dhuha', icon: Clock },
    { name: 'Dzuhur', key: 'dzuhur', icon: Clock },
    { name: 'Ashar', key: 'ashar', icon: Clock },
    { name: 'Maghrib', key: 'maghrib', icon: Clock },
    { name: 'Isya', key: 'isya', icon: Clock },
  ];

  // Helper Countdown
  const getNextPrayer = () => {
    if (!jadwal) return null;
    const now = currentTime;
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    const order = ['subuh', 'terbit', 'dhuha', 'dzuhur', 'ashar', 'maghrib', 'isya'];
    
    for (let p of order) {
      if (jadwal[p]) {
        const [h, m] = jadwal[p].split(':');
        const pMins = parseInt(h) * 60 + parseInt(m);
        if (pMins > nowMinutes) {
          return { name: p, hours: Math.floor((pMins - nowMinutes) / 60), mins: (pMins - nowMinutes) % 60, time: jadwal[p] };
        }
      }
    }
    
    // Besok subuh
    if (jadwal.subuh) {
      const [h, m] = jadwal.subuh.split(':');
      const pMins = parseInt(h) * 60 + parseInt(m) + 24 * 60;
      return { name: 'subuh', hours: Math.floor((pMins - nowMinutes) / 60), mins: (pMins - nowMinutes) % 60, time: jadwal.subuh };
    }
    
    return null;
  };

  const nextPrayer = getNextPrayer();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
      <div className="bg-emerald-600 dark:bg-emerald-900 text-white rounded-b-3xl pt-safe-top sticky top-0 z-50">
        <div className="px-4 py-4 flex items-center justify-between">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(-1)} 
            className="w-10 h-10 flex flex-col items-center justify-center bg-white/20 backdrop-blur-md rounded-full mt-4"
          >
            <ChevronLeft className="w-6 h-6" />
          </motion.button>
          <div className="flex flex-col items-end mt-4">
            <h1 className="text-xl font-black tracking-tight">Waktu Sholat</h1>
            <div className="flex items-center gap-1 opacity-90 text-[11px] font-medium bg-black/20 px-2 py-0.5 rounded-full">
              <MapPin className="w-3 h-3" />
              <span>{locationName}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-6 py-6 md:py-8 max-w-lg mx-auto">
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-emerald-600 dark:text-emerald-400">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p className="font-bold text-sm">Menyelaraskan Lokasi & Waktu...</p>
            <p className="text-xs text-slate-500 mt-2">Sumber: API Bimas Islam Kemenag</p>
          </div>
        ) : errorStatus ? (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 p-6 rounded-3xl border border-red-100 flex flex-col items-center text-center">
            <AlertCircle className="w-10 h-10 mb-3" />
            <p className="font-bold">{errorStatus}</p>
            <button onClick={() => window.location.reload()} className="mt-4 bg-red-600 text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-red-700">Coba Lagi</button>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Countdown Card */}
            {nextPrayer && (
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
            )}

            {/* Jadwal Hari Ini */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-700">
               <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-100 dark:border-slate-700">
                 <h3 className="font-black text-slate-800 dark:text-white">Jadwal Hari Ini</h3>
                 <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">{jadwal?.tanggal}</span>
               </div>
               
               <div className="grid grid-cols-2 gap-3">
                 {sholatList.map((s) => (
                   <div 
                    key={s.key} 
                    className={`flex items-center justify-between p-3 rounded-2xl border ${nextPrayer?.name === s.key ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-slate-100 dark:border-slate-700'}`}
                   >
                     <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg ${nextPrayer?.name === s.key ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                          <s.icon className="w-4 h-4" />
                        </div>
                        <span className={`text-sm font-bold capitalize ${nextPrayer?.name === s.key ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300'}`}>{s.name}</span>
                     </div>
                     <span className={`text-sm font-black ${nextPrayer?.name === s.key ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                       {jadwal?.[s.key] || '--:--'}
                     </span>
                   </div>
                 ))}
               </div>
               <p className="text-center text-[10px] text-slate-400 mt-4 font-medium uppercase tracking-widest">
                 Waktu ditarik secara Real-time dari Kementerian Agama RI
               </p>
            </div>

            {/* Arah Kiblat */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 text-center relative overflow-hidden">
               <h3 className="font-black text-slate-800 dark:text-white mb-2 flex items-center justify-center gap-2">
                 <Compass className="w-5 h-5 text-emerald-500" /> Kompas Kiblat
               </h3>
               
               {typeof (DeviceOrientationEvent as any).requestPermission === 'function' && (
                 <button onClick={requestCompassPermission} className="text-xs bg-slate-100 px-3 py-1 rounded-full mb-4">
                   Izinkan Sensor Kompas
                 </button>
               )}
               
               <div className="text-sm text-slate-500 mb-6">
                 Posisi Ka'bah (Kiblat) berada pada <span className="font-black text-emerald-600">{qiblaDegree ? qiblaDegree.toFixed(1) : '...'}°</span> dari Utara Sejati.
               </div>

               <div className="relative w-48 h-48 mx-auto">
                 {/* The Compass Base */}
                 <div 
                   className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-slate-700 flex items-center justify-center transition-transform duration-300"
                   style={{ transform: `rotate(${-compassHeading}deg)` }}
                 >
                    {/* Tick marks */}
                    <div className="absolute top-2 font-black text-xs text-red-500">U</div>
                    <div className="absolute bottom-2 font-black text-xs text-slate-400">S</div>
                    <div className="absolute right-2 font-black text-xs text-slate-400">T</div>
                    <div className="absolute left-2 font-black text-xs text-slate-400">B</div>
                    
                    {/* Kiblat Arrow / Target */}
                    {qiblaDegree !== null && (
                      <div 
                        className="absolute inset-0 transition-transform duration-500 ease-out"
                        style={{ transform: `rotate(${qiblaDegree}deg)` }}
                      >
                         <div className="absolute -top-4 w-full flex justify-center">
                           <div className="bg-emerald-500 text-white rounded-full p-1.5 shadow-lg border-2 border-white">
                             <Navigation className="w-5 h-5" fill="currentColor" />
                           </div>
                         </div>
                      </div>
                    )}
                 </div>
                 {/* Static center needle indicating phone's top */}
                 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <div className="w-0.5 h-12 bg-emerald-500/50 mb-2"></div>
                    <div className="w-4 h-4 bg-slate-800 dark:bg-white rounded-full border-4 border-emerald-500 z-10 shadow-md"></div>
                    <div className="w-0.5 h-12 bg-transparent mt-2"></div>
                 </div>
               </div>
               
               <p className="text-[10px] text-slate-400 mt-6 leading-relaxed">
                 Pastikan Anda menjauh dari benda magnetik.<br/>
                 Kompas dapat tidak akurat pada beberapa perangkat jika belum dikalibrasi (bentuk angka 8).
               </p>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
