import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, Map as MapIcon, Loader2, Search, Crosshair } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icons by using CDN URLs
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom Mosque Icon
const mosqueIcon = L.divIcon({
  html: `<div class="w-8 h-8 bg-emerald-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M12,2L4.5,11H7V21H11V15H13V21H17V11H19.5L12,2M12,4.33L16.22,9.5H15V19H14V13H10V19H9V9.5H7.78L12,4.33Z" />
          </svg>
        </div>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

interface Mosque {
  id: number;
  lat: number;
  lon: number;
  name: string;
  address?: string;
}

// Map sub-components
const MapEvents = ({ onMoveEnd }: { onMoveEnd: (lat: number, lng: number) => void }) => {
  useMapEvents({
    dragend: (e) => {
      const center = e.target.getCenter();
      onMoveEnd(center.lat, center.lng);
    },
    zoomend: (e) => {
      const center = e.target.getCenter();
      onMoveEnd(center.lat, center.lng);
    }
  });
  return null;
};

const FlyToButton = ({ location }: { location: [number, number] | null }) => {
  const map = useMap();
  return (
    <button 
      onClick={() => {
        if (location) map.flyTo(location, 15);
      }}
      className="absolute bottom-6 right-6 z-[1000] w-12 h-12 bg-white dark:bg-slate-900 rounded-full shadow-2xl flex items-center justify-center text-emerald-500 border border-slate-100 dark:border-slate-800 transition-transform active:scale-95"
    >
      <Crosshair className="w-6 h-6" />
    </button>
  );
};

const MapCenterer = ({ coords }: { coords: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    if (coords && coords.length === 2) {
      map.flyTo(coords, 14, { duration: 1.5 });
    }
  }, [coords[0], coords[1], map]);
  return null;
};

export const MasjidLocator: React.FC = () => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchStatus, setSearchStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchingCity, setIsSearchingCity] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc: [number, number] = [position.coords.latitude, position.coords.longitude];
          setUserLocation(loc);
          searchMosques(loc[0], loc[1]);
        },
        async () => {
          // Fallback to IP geolocation
          try {
            const res = await fetch('https://get.geojs.io/v1/ip/geo.json');
            const data = await res.json();
            if (data && data.latitude && data.longitude) {
              const loc: [number, number] = [parseFloat(data.latitude), parseFloat(data.longitude)];
              setUserLocation(loc);
              searchMosques(loc[0], loc[1]);
              setSearchStatus('GPS diblokir. Menggunakan lokasi Internet (kurang akurat).');
              return;
            }
          } catch (e) {}

          setSearchStatus('Akses GPS ditolak, gunakan kotak pencarian.');
          const loc: [number, number] = [-6.2088, 106.8456]; // Jakarta
          setUserLocation(loc);
          searchMosques(loc[0], loc[1]);
        },
        { enableHighAccuracy: true, timeout: 30000, maximumAge: 10000 }
      );
    }
  }, []);

  const handleRequestGPS = () => {
    if (navigator.geolocation) {
      setSearchStatus('Mendapatkan lokasi GPS yang akurat...');
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc: [number, number] = [position.coords.latitude, position.coords.longitude];
          setUserLocation(loc);
          searchMosques(loc[0], loc[1]);
        },
        async (error) => {
          console.error("GPS Error:", error);
          
          try {
            const res = await fetch('https://get.geojs.io/v1/ip/geo.json');
            const data = await res.json();
            if (data && data.latitude && data.longitude) {
              const loc: [number, number] = [parseFloat(data.latitude), parseFloat(data.longitude)];
              setUserLocation(loc);
              searchMosques(loc[0], loc[1]);
              setSearchStatus('GPS gagal. Menggunakan lokasi Internet. Buka di tab baru untuk GPS akurat.');
              return;
            }
          } catch (e) {}

          setSearchStatus('Gagal mendapatkan lokasi. Pastikan izin aktif atau buka di Tab Baru.');
          setIsLoading(false);
        },
        { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 } // Force get new location
      );
    } else {
      setSearchStatus('Browser tidak mendukung lokasi GPS');
    }
  };

  const handleCitySearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearchingCity(true);
    try {
      const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ' Indonesia')}`);
      const data = await resp.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const newLoc: [number, number] = [parseFloat(lat), parseFloat(lon)];
        setUserLocation(newLoc);
        searchMosques(newLoc[0], newLoc[1]);
      } else {
        setSearchStatus('Kota tidak ditemukan');
      }
    } catch (err) {
      console.error("City search error:", err);
    } finally {
      setIsSearchingCity(false);
    }
  };

  const searchMosques = React.useCallback(async (lat: number, lon: number) => {
    setIsLoading(true);
    setSearchStatus('Mencari masjid... ');
    
    // Overpass API Query for Mosques within 5km
    const radius = 5000;
    const query = `
      [out:json];
      node["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lon});
      out body;
    `;
    
    try {
      const queryUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
      const endpoints = [
        queryUrl,
        `https://api.allorigins.win/raw?url=${encodeURIComponent(queryUrl)}`,
        `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(queryUrl)}`
      ];

      let data = null;
      let errors: unknown[] = [];

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint);
          
          if (!response.ok) {
            errors.push(new Error(`API error: ${response.status}`));
            continue;
          }

          const text = await response.text();
          if (!text.startsWith('{')) {
            errors.push(new Error('API return is not JSON. Rate limited?'));
            continue;
          }

          data = JSON.parse(text);
          break; // Successfully fetched
        } catch (e) {
          errors.push(e);
        }
      }

      if (!data) {
        console.error('All Overpass API endpoints failed:', errors);
        throw errors[errors.length - 1] || new Error('Failed to fetch from all Overpass API endpoints');
      }
      
      const foundMosques = (data.elements || []).map((el: any) => ({
        id: el.id,
        lat: el.lat,
        lon: el.lon,
        name: el.tags?.name || 'Masjid Tanpa Nama',
        address: el.tags?.['addr:street'] || el.tags?.['addr:full'] || 'Alamat tidak tersedia'
      }));
      
      setMosques(foundMosques);
      setSearchStatus(foundMosques.length > 0 ? `Ditemukan ${foundMosques.length} masjid` : 'Tidak ditemukan masjid di sekitar sini');
    } catch (error) {
      console.error("Overpass error:", error);
      setSearchStatus('Gagal memuat data masjid');
    } finally {
      setIsLoading(false);
    }
  }, []);



  return (
    <div className="w-full h-full min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col pt-24 md:pt-32 px-4 md:px-8 max-w-7xl mx-auto pb-24">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-emerald-500 rounded-3xl flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white shrink-0">
                <MapIcon className="w-7 h-7" />
            </div>
            <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white leading-none mb-2">Cari Masjid</h1>
                <div className="flex items-center gap-2">
                  <div className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-md border border-emerald-200/50 dark:border-emerald-800/50 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Free Open Source Maps
                  </div>
                </div>
            </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <button
            onClick={handleRequestGPS}
            disabled={isLoading}
            className="w-full sm:w-auto px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-2 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50"
          >
            <Crosshair className="w-4 h-4 text-emerald-500" />
            <span className="hidden sm:inline">Gunakan GPS</span>
            <span className="sm:hidden">Gunakan GPS Saat Ini</span>
          </button>
          
          <form onSubmit={handleCitySearch} className="relative w-full sm:w-[300px]">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
             <input 
               type="text" 
               placeholder="Cari Kota (cth: Bandung, Aceh...)" 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full pl-10 pr-24 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all shadow-sm"
             />
             <button 
               type="submit" 
               disabled={isSearchingCity}
               className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all disabled:opacity-50"
             >
               {isSearchingCity ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Cari'}
             </button>
          </form>

          <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-5 py-3 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm shrink-0">
            {isLoading ? <Loader2 className="w-3.5 h-3.5 text-emerald-500 animate-spin" /> : <MapPin className="w-4 h-4 text-emerald-500" />}
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{searchStatus}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl relative min-h-[500px]">
        {userLocation && (
          <MapContainer 
            center={userLocation} 
            zoom={14} 
            className="w-full h-[500px] md:h-[600px] lg:h-full z-10"
            style={{ width: '100%', minHeight: '500px', height: '100%', zIndex: 1 }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <MapEvents onMoveEnd={searchMosques} />
            <FlyToButton location={userLocation} />
            <MapCenterer coords={userLocation} />
            
            {/* User Location Marker */}
            <Marker position={userLocation}>
              <Popup>
                <div className="text-center font-bold">Lokasi Anda</div>
              </Popup>
            </Marker>

            {/* Mosque Markers */}
            {mosques.map((mosque) => (
              <Marker 
                key={mosque.id} 
                position={[mosque.lat, mosque.lon]} 
                icon={mosqueIcon}
              >
                <Popup className="custom-popup">
                  <div className="p-2 min-w-[150px]">
                    <h3 className="font-black text-slate-900 mb-1">{mosque.name}</h3>
                    <p className="text-[10px] text-slate-500 mb-3">{mosque.address}</p>
                    <a 
                      href={`https://www.google.com/maps/dir/?api=1&destination=${mosque.lat},${mosque.lon}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider hover:bg-emerald-700 transition-colors"
                    >
                      <Navigation className="w-3 h-3" /> Navigasi
                    </a>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-emerald-50 dark:bg-emerald-900/10 p-6 rounded-[2rem] border border-emerald-100 dark:border-emerald-900/30">
          <h4 className="font-black text-emerald-900 dark:text-emerald-400 text-xs uppercase tracking-widest mb-2">Mengapa Tanpa Key?</h4>
          <p className="text-xs text-emerald-700 dark:text-emerald-500/80 leading-relaxed font-medium">Kami menggunakan OpenStreetMap & Overpass API yang sepenuhnya gratis dan terbuka untuk komunitas.</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-[2rem] border border-blue-100 dark:border-blue-900/30">
          <h4 className="font-black text-blue-900 dark:text-blue-400 text-xs uppercase tracking-widest mb-2">Automatisasi</h4>
          <p className="text-xs text-blue-700 dark:text-blue-500/80 leading-relaxed font-medium">Geser peta untuk mencari masjid di area baru secara otomatis.</p>
        </div>
        <div className="bg-slate-100 dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800">
          <h4 className="font-black text-slate-600 dark:text-slate-400 text-xs uppercase tracking-widest mb-2">Data Terbuka</h4>
          <p className="text-xs text-slate-500 dark:text-slate-500/80 leading-relaxed font-medium">Data masjid bersumber dari relawan komunitas di seluruh dunia melalui OpenStreetMap.</p>
        </div>
      </div>
    </div>
  );
};
