import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, MapPin, Loader2, AlertCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PrayerCountdownCard } from './PrayerCountdownCard';
import { PrayerScheduleCard } from './PrayerScheduleCard';
import { QiblaCompassCard } from './QiblaCompassCard';

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
    let lastUpdate = 0;
    const handleOrientation = (e: DeviceOrientationEvent) => {
      // Throttle updates slightly to reduce React renders (e.g., 30fps max)
      const now = Date.now();
      if (now - lastUpdate < 32) return;
      lastUpdate = now;

      let heading = 0;
      if ((e as any).webkitCompassHeading) {
        // iOS
        heading = (e as any).webkitCompassHeading;
      } else if (e.alpha !== null) {
        // Android
        heading = 360 - e.alpha; 
      }

      setCompassHeading(prev => {
        if (prev === 0) return heading; // initial
        let diff = heading - prev;
        // Adjust diff for wrap-around
        if (diff > 180) diff -= 360;
        else if (diff < -180) diff += 360;
        
        // Exponential moving average for smoothness
        const smoothed = prev + diff * 0.2;
        return (smoothed + 360) % 360;
      });
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
             // Permission granted, the existing event listener in useEffect will now start receiving data.
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
            onClick={() => navigate('/')} 
            className="w-10 h-10 flex flex-col items-center justify-center bg-white/20 backdrop-blur-md rounded-full mt-4 hover:bg-white/30 transition-colors shadow-sm cursor-pointer z-50 pointer-events-auto"
          >
            <ChevronLeft className="w-6 h-6" />
          </motion.button>
          <div className="flex flex-col items-end mt-4 z-50">
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
            
            <PrayerCountdownCard nextPrayer={nextPrayer} />

            <PrayerScheduleCard 
              jadwal={jadwal} 
              sholatList={sholatList} 
              nextPrayerName={nextPrayer?.name} 
            />

            <QiblaCompassCard 
              qiblaDegree={qiblaDegree} 
              compassHeading={compassHeading} 
              requestCompassPermission={requestCompassPermission} 
            />

          </div>
        )}
      </div>
    </div>
  );
}
