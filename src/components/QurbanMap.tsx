import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, ZoomControl, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, X, MapPin, Filter, Users } from 'lucide-react';

// Fix for default Leaflet marker icons not loading in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const createCustomIcon = (type: 'goat' | 'cow' | 'both') => {
  const color = '#10b981'; // Emerald
  let emoji = '🐏';
  if (type === 'cow') emoji = '🐄';
  if (type === 'both') emoji = '🐏🐄';

  return new L.DivIcon({
    className: 'custom-marker-icon',
    html: `<div class="marker-pin-wrapper group" style="color: ${color}">
             <div class="marker-pulse" style="background-color: ${color}"></div>
             <div class="marker-pin" style="background-color: ${color};">
                <span class="text-sm shadow-sm" style="${type === 'both' ? 'font-size: 10px;' : 'font-size: 16px;'} line-height: 1;">${emoji}</span>
             </div>
           </div>`,
    iconSize: [44, 44],
    iconAnchor: [22, 44],
    popupAnchor: [0, -38],
  });
};

interface QurbanLocation {
  id: number;
  name: string;
  coordinates: [number, number];
  goatCount: number;
  cowCount: number;
  familyHelped: number;
  description: string;
  year: number;
}

const locations: QurbanLocation[] = [
  {
    id: 1,
    name: 'Desa Sukamaju, Garut',
    coordinates: [-7.2144, 107.9009],
    goatCount: 25,
    cowCount: 0,
    familyHelped: 150,
    description: 'Penyaluran qurban di wilayah pelosok Garut yang mayoritas warganya adalah petani gurem.',
    year: 2024,
  },
  {
    id: 2,
    name: 'Kampung Mualaf, Mentawai',
    coordinates: [-1.4300, 98.9222],
    goatCount: 15,
    cowCount: 5,
    familyHelped: 200,
    description: 'Sebaran qurban untuk saudara-saudara mualaf di Kepulauan Mentawai.',
    year: 2024,
  },
  {
    id: 3,
    name: 'Desa Kekeringan, TTS NTT',
    coordinates: [-9.8706, 124.3218],
    goatCount: 40,
    cowCount: 10,
    familyHelped: 450,
    description: 'Membahagiakan warga di wilayah krisis air dan rawan pangan di Timor Tengah Selatan.',
    year: 2023,
  },
  {
    id: 4,
    name: 'Pengungsian Gaza, Palestina',
    coordinates: [31.5017, 34.4668],
    goatCount: 0,
    cowCount: 50,
    familyHelped: 2500,
    description: 'Penyaluran qurban darurat bagi keluarga pengungsi di Jalur Gaza.',
    year: 2024,
  },
  {
    id: 5,
    name: 'Dusun Terisolir, Nias',
    coordinates: [1.3283, 97.4385],
    goatCount: 20,
    cowCount: 2,
    familyHelped: 120,
    description: 'Menembus jalur sulit untuk menyalurkan daging qurban ke pelosok Nias Utara.',
    year: 2023,
  },
  {
    id: 6,
    name: 'Perbatasan Entikong, Kalbar',
    coordinates: [0.9388, 110.3547],
    goatCount: 15,
    cowCount: 3,
    familyHelped: 180,
    description: 'Membawa kebahagiaan qurban ke tapal batas negara di Entikong, Kalimantan Barat.',
    year: 2024,
  },
  {
    id: 7,
    name: 'Pulau Buru, Maluku',
    coordinates: [-3.3039, 126.7029],
    goatCount: 35,
    cowCount: 5,
    familyHelped: 300,
    description: 'Distribusi qurban untuk masyarakat di Pulau Buru, menebar senyum di Maluku.',
    year: 2022,
  },
  {
    id: 8,
    name: 'Desa Adat Bayan, Lombok',
    coordinates: [-8.2588, 116.4239],
    goatCount: 50,
    cowCount: 7,
    familyHelped: 400,
    description: 'Merayakan hari raya qurban bersama masyarakat adat Bayan, Nusa Tenggara Barat.',
    year: 2024,
  },
  {
    id: 9,
    name: 'Korban Erupsi Semeru, Lumajang',
    coordinates: [-8.1333, 113.2238],
    goatCount: 20,
    cowCount: 15,
    familyHelped: 500,
    description: 'Penyaluran daging qurban untuk warga penyintas erupsi Gunung Semeru.',
    year: 2022,
  },
  {
    id: 10,
    name: 'Pedalaman Asmat, Papua',
    coordinates: [-5.5398, 138.1384],
    goatCount: 0,
    cowCount: 8,
    familyHelped: 450,
    description: 'Menebar kebahagiaan Idul Adha untuk saudara di pelosok Kabupaten Asmat, Papua Selatan.',
    year: 2023,
  },
  {
    id: 11,
    name: 'Pesantren Tahfidz, Aceh',
    coordinates: [5.1476, 97.1044],
    goatCount: 30,
    cowCount: 5,
    familyHelped: 600,
    description: 'Qurban khusus untuk para santri penghafal Al-Quran di Lhokseumawe, Aceh.',
    year: 2024,
  },
  {
    id: 12,
    name: 'Desa Pesisir, Sulawesi Tenggara',
    coordinates: [-4.6368, 122.9555],
    goatCount: 25,
    cowCount: 2,
    familyHelped: 160,
    description: 'Penyaluran amanah qurban di desa nelayan pesisir Kabupaten Muna.',
    year: 2023,
  }
];

const MapUpdater = ({ locations }: { locations: QurbanLocation[] }) => {
  const map = useMap();
  const locationsIdString = JSON.stringify(locations.map(l => l.id));
  
  useEffect(() => {
    if (locations.length > 0) {
      const bounds = L.latLngBounds(locations.map(loc => loc.coordinates as [number, number]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 8, duration: 0.5 });
    }
  }, [map, locationsIdString]); // Only refit bounds when the filtered locations actually change by id
  return null;
};

export const QurbanMap: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLoc, setSelectedLoc] = useState<QurbanLocation | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const filteredLocations = locations.filter(loc => selectedYear === 'all' || loc.year === selectedYear);
  const years = Array.from(new Set(locations.map(loc => loc.year))).sort((a, b) => b - a);

  // Compute overall stats for selected year(s)
  const totalGoats = filteredLocations.reduce((sum, loc) => sum + loc.goatCount, 0);
  const totalCows = filteredLocations.reduce((sum, loc) => sum + loc.cowCount, 0);
  const totalFamilies = filteredLocations.reduce((sum, loc) => sum + loc.familyHelped, 0);
  const totalDonors = totalGoats + (totalCows * 7);

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Dashboard Top Stats */}
      <div className="flex flex-col md:flex-row gap-5 md:items-center justify-between bg-white dark:bg-slate-800/80 p-3 sm:p-4 rounded-[2rem] border border-slate-200/60 dark:border-slate-700/60 shadow-sm w-full mx-auto">
        
        {/* Year Filter Control */}
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/50 p-2 pr-4 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 w-full md:w-[220px] shrink-0">
          <div className="bg-white dark:bg-slate-800 p-2 sm:p-2.5 rounded-xl text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-100 dark:border-slate-700">
            <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="relative flex-1">
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mb-0.5">Penyaluran</p>
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="bg-transparent text-slate-800 dark:text-white font-extrabold text-sm sm:text-base focus:outline-none w-full appearance-none pr-6 cursor-pointer"
            >
              <option value="all">Semua Tahun</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <div className="absolute right-0 bottom-0 pointer-events-none text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>
        </div>

        {/* Global Summary Stats */}
        <div className="flex flex-wrap md:flex-nowrap items-center gap-y-4 gap-x-6 sm:gap-x-8 px-2 sm:px-4 w-full md:w-auto">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-bold mb-1 flex items-center gap-1.5"><span className="text-[14px]">🐏</span> Kambing</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 leading-none">{totalGoats}</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase">Ekor</span>
            </div>
          </div>
          
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-bold mb-1 flex items-center gap-1.5"><span className="text-[14px]">🐄</span> Sapi</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 leading-none">{totalCows}</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase">Ekor</span>
            </div>
          </div>

          <div className="w-px h-10 bg-slate-200 dark:bg-slate-700 hidden md:block"></div>

          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-bold mb-1 flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-blue-500/80" /> Donatur</span>
            <span className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 leading-none">{totalDonors.toLocaleString('id-ID')}</span>
          </div>

          <div className="w-px h-10 bg-slate-200 dark:bg-slate-700 hidden lg:block"></div>

          <div className="flex flex-col bg-emerald-50 dark:bg-emerald-500/10 px-3 py-2 -mx-3 -my-2 md:m-0 md:py-0 md:px-0 md:bg-transparent rounded-xl">
            <span className="text-[10px] uppercase tracking-widest text-emerald-600 dark:text-emerald-500 font-bold mb-1">Keluarga Dibantu</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 leading-none">{totalFamilies.toLocaleString('id-ID')}</span>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="w-full h-[450px] lg:h-[600px] rounded-[2rem] overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-xl relative z-0 bg-slate-100 dark:bg-slate-900">
        <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              className="mb-4"
            >
              <Loader2 className="w-10 h-10 text-emerald-500" />
            </motion.div>
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="text-sm font-medium text-slate-500 dark:text-slate-400"
            >
              Memuat data sebaran Qurban...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      <style>
        {`
          .marker-pin-wrapper { position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; }
          .marker-pulse { position: absolute; width: 100%; height: 100%; border-radius: 50%; opacity: 0; will-change: transform, opacity; animation: smooth-pulse 3s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
          .marker-pin { position: relative; z-index: 10; width: 36px; height: 36px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.15); transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s ease, border-color 0.3s ease; }
          .marker-pin-wrapper:hover .marker-pin { transform: scale(1.15) translateY(-4px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.2), 0 0 12px currentColor; border-color: #fff; }
          .marker-pin-wrapper:hover .marker-pulse { animation-play-state: paused; opacity: 0; }
          @keyframes smooth-pulse { 0% { transform: scale(0.8); opacity: 0.5; } 100% { transform: scale(2.2); opacity: 0; } }
          .custom-marker-icon.leaflet-div-icon { background: transparent; border: none; }
        `}
      </style>

      <MapContainer 
        center={[-1.0, 117.0]}
        zoom={5} 
        scrollWheelZoom={true}
        className="w-full h-full z-0 font-sans cursor-pointer focus:outline-none"
      >
        <ZoomControl position="bottomright" />
        <TileLayer
          attribution='&amp;copy; &lt;a href="https://carto.com/attributions"&gt;CARTO&lt;/a&gt;'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={19}
        />
        
        <MapUpdater locations={filteredLocations} />
        
        {filteredLocations.map((loc) => {
          let type: 'goat' | 'cow' | 'both' = 'goat';
          if (loc.cowCount > 0 && loc.goatCount === 0) type = 'cow';
          else if (loc.cowCount > 0 && loc.goatCount > 0) type = 'both';

          return (
            <Marker 
              key={loc.id} 
              position={loc.coordinates}
              icon={createCustomIcon(type)}
              eventHandlers={{
                click: () => setSelectedLoc(loc)
              }}
            />
          );
        })}
      </MapContainer>

      <AnimatePresence>
        {selectedLoc && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:w-[320px] z-[2000] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-[2rem] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.15)] border border-slate-200/60 dark:border-slate-700/60 flex flex-col"
          >
            <motion.button whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.1 }} 
              onClick={() => setSelectedLoc(null)}
              className="absolute top-4 right-4 z-10 p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </motion.button>
            <div className="p-5">
              
              <div className="mb-4 pr-8">
                <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full w-fit mb-2 flex items-center gap-1 border border-emerald-200/50 dark:border-emerald-500/20">
                  <MapPin className="w-2.5 h-2.5" /> Area Realisasi
                </span>
                <h3 className="font-bold text-lg text-slate-800 dark:text-white leading-tight mt-2.5">
                  {selectedLoc.name}
                </h3>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed mt-1.5">
                  {selectedLoc.description}
                </p>
              </div>

              <div className="flex gap-2 mb-2">
                <div className="flex-1 flex flex-col gap-0.5 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <span className="text-[9px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-bold ml-1">Kambing</span>
                  <div className="flex items-baseline gap-1 bg-white dark:bg-slate-800 py-1 px-2 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                    <span className="text-lg font-black text-slate-800 dark:text-slate-200 leading-none">{selectedLoc.goatCount}</span>
                    <span className="text-[8px] font-bold text-slate-400 uppercase">Ekor</span>
                  </div>
                </div>
                
                <div className="flex-1 flex flex-col gap-0.5 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <span className="text-[9px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-bold ml-1">Sapi</span>
                  <div className="flex items-baseline gap-1 bg-white dark:bg-slate-800 py-1 px-2 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                    <span className="text-lg font-black text-slate-800 dark:text-slate-200 leading-none">{selectedLoc.cowCount}</span>
                    <span className="text-[8px] font-bold text-slate-400 uppercase">Ekor</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between gap-2 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-3 rounded-2xl border border-emerald-100/50 dark:border-emerald-500/20 mt-1">
                <span className="text-[9px] uppercase tracking-widest text-emerald-700 dark:text-emerald-500 font-bold">Keluarga Dibantu</span>
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 leading-none">{selectedLoc.familyHelped}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </div>
  );
};

