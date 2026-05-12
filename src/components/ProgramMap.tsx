import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, ZoomControl, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Filter, X, ChevronDown, MapPin, Grid2X2, Check } from 'lucide-react';

// Fix for default Leaflet marker icons not loading in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Category Icons (SVG Strings)
const icons = {
  Dakwah: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M3 11l18-5v12L3 14v-3z"></path><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"></path></svg>`,
  Infrastruktur: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M3 21h18"></path><path d="M9 8h1"></path><path d="M9 12h1"></path><path d="M9 16h1"></path><path d="M14 8h1"></path><path d="M14 12h1"></path><path d="M14 16h1"></path><path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"></path></svg>`,
  'Air Bersih': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"></path></svg>`,
  Kemanusiaan: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg>`,
  Pendidikan: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>`,
  'Layanan Zakat': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><circle cx="8" cy="8" r="6"></circle><path d="M18.09 10.37A6 6 0 1 1 10.34 18"></path><path d="M7 6h1v4"></path><path d="M16.71 13.88l.7.71-2.82 2.82"></path></svg>`,
  Default: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`
};

const getIconColor = (category: string) => {
  switch(category) {
    case 'Dakwah Pedalaman': return '#8b5cf6'; // Violet
    case 'Infrastruktur': return '#f97316'; // Orange
    case 'Air Bersih': return '#0ea5e9'; // Sky
    case 'Kemanusiaan': return '#ef4444'; // Red
    case 'Pendidikan': return '#10b981'; // Emerald
    case 'Layanan Zakat': return '#f59e0b'; // Amber
    default: return '#1799dc'; // Primary
  }
};

const getSvgForCategory = (category: string) => {
  if (category.includes('Dakwah')) return icons.Dakwah;
  if (category.includes('Infrastruktur')) return icons.Infrastruktur;
  if (category.includes('Air')) return icons['Air Bersih'];
  if (category.includes('Kemanusiaan')) return icons.Kemanusiaan;
  if (category.includes('Pendidikan')) return icons.Pendidikan;
  if (category.includes('Zakat')) return icons['Layanan Zakat'];
  return icons.Default;
}

const createCustomIcon = (category: string) => {
  const color = getIconColor(category);
  const svg = getSvgForCategory(category);
  
  return new L.DivIcon({
    className: 'custom-marker-icon',
    html: `<div class="marker-pin-wrapper group" style="color: ${color}">
             <div class="marker-pulse" style="background-color: ${color}"></div>
             <div class="marker-pin" style="background-color: ${color};">
                ${svg}
             </div>
           </div>`,
    iconSize: [44, 44],
    iconAnchor: [22, 44],
    popupAnchor: [0, -38],
  });
};

interface ProgramLocation {
  id: number;
  name: string;
  category: string;
  coordinates: [number, number];
  locationName: string;
  beneficiaries: string;
  description: string;
  image: string;
  progress?: number;
  targetAmount?: string;
  status: string;
  startDate: string;
  pic: string;
}

const locations: ProgramLocation[] = [
  {
    id: 1,
    name: "Bina Da'i Mentawai",
    category: 'Dakwah Pedalaman',
    coordinates: [-1.4300, 98.9222],
    locationName: 'Kepulauan Mentawai, Sumbar',
    beneficiaries: "35 Da'i",
    description: "Pembinaan dan dukungan biaya hidup untuk Da'i yang bertugas di pedalaman Mentawai.",
    progress: 85,
    targetAmount: 'Rp 150.000.000',
    image: 'https://images.unsplash.com/photo-1593113524586-13a863ecdd93?auto=format&fit=crop&q=80&w=400&h=200',
    status: 'Sedang Berlangsung',
    startDate: '12 Jan 2024',
    pic: 'Ust. Ahmad Ridwan'
  },
  {
    id: 2,
    name: 'Masjid Mualaf Nias',
    category: 'Infrastruktur',
    coordinates: [1.3283, 97.4385],
    locationName: 'Nias, Sumatera Utara',
    beneficiaries: '120 Keluarga',
    description: 'Pembangunan masjid pertama untuk komunitas mualaf di pelosok Nias.',
    progress: 60,
    targetAmount: 'Rp 400.000.000',
    image: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&q=80&w=400&h=200',
    status: 'Sedang Berlangsung',
    startDate: '05 Mar 2024',
    pic: 'Budi Santoso'
  },
  {
    id: 3,
    name: 'Sumur Bor NTT',
    category: 'Air Bersih',
    coordinates: [-9.8706, 124.3218],
    locationName: 'TTS, Nusa Tenggara Timur',
    beneficiaries: '450 Jiwa',
    description: 'Pembangunan fasilitas air bersih untuk desa krisis air di Timor Tengah Selatan.',
    progress: 100,
    targetAmount: 'Rp 75.000.000',
    image: 'https://images.unsplash.com/photo-1588616578788-d65fa31e13fa?auto=format&fit=crop&q=80&w=400&h=200',
    status: 'Selesai',
    startDate: '20 Nov 2023',
    pic: 'Arif Hidayat'
  },
  {
    id: 4,
    name: 'Pangan Gaza',
    category: 'Kemanusiaan',
    coordinates: [31.5017, 34.4668],
    locationName: 'Jalur Gaza, Palestina',
    beneficiaries: '5.000 Keluarga',
    description: 'Penyaluran bantuan pangan dan medis darurat untuk warga terdampak konflik.',
    progress: 95,
    targetAmount: 'Rp 2.000.000.000',
    image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=400&h=200',
    status: 'Sedang Berlangsung',
    startDate: '10 Okt 2023',
    pic: 'Relawan Laznas'
  },
  {
    id: 5,
    name: 'Beasiswa Tahfidz Garut',
    category: 'Pendidikan',
    coordinates: [-7.2144, 107.9009],
    locationName: 'Garut, Jawa Barat',
    beneficiaries: '50 Santri',
    description: 'Beasiswa penuh untuk santri yatim dan dhuafa penghafal Al-Quran.',
    progress: 75,
    targetAmount: 'Rp 120.000.000',
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=400&h=200',
    status: 'Sedang Berlangsung',
    startDate: '01 Jul 2023',
    pic: 'Ust. Dedi Mulyadi'
  },
  {
    id: 6,
    name: 'Pusat Distribusi Jakarta',
    category: 'Layanan Zakat',
    coordinates: [-6.1843, 106.8451],
    locationName: 'Jakarta Pusat, DKI',
    beneficiaries: '10.000 Jiwa/Thn',
    description: 'Titik pusat pelayanan dan penyaluran zakat kepada mustahik di wilayah Jabodetabek.',
    progress: 100,
    targetAmount: 'Rp 500.000.000',
    image: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&q=80&w=400&h=200',
    status: 'Selesai',
    startDate: '15 Feb 2023',
    pic: 'Iwan Falsah'
  },
  {
    id: 7,
    name: 'Asrama Yatim Sorong',
    category: 'Pendidikan',
    coordinates: [-0.8812, 131.2954],
    locationName: 'Sorong, Papua Barat Daya',
    beneficiaries: '80 Anak Panti Asuhan',
    description: 'Pembangunan asrama dan penyediaan fasilitas belajar untuk anak-anak yatim.',
    progress: 45,
    targetAmount: 'Rp 800.000.000',
    image: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&q=80&w=400&h=200',
    status: 'Sedang Berlangsung',
    startDate: '10 Mei 2024',
    pic: 'Yusuf Mansyur'
  },
  {
    id: 8,
    name: 'Motor Dakwah Kalteng',
    category: 'Dakwah Pedalaman',
    coordinates: [-2.2083, 113.9160],
    locationName: 'Palangka Raya, Kalteng',
    beneficiaries: "15 Da'i",
    description: 'Pengadaan armada transportasi bagi Da\'i untuk menembus pedalaman Kalimantan Tengah.',
    progress: 30,
    targetAmount: 'Rp 300.000.000',
    image: 'https://images.unsplash.com/photo-1593113524586-13a863ecdd93?auto=format&fit=crop&q=80&w=400&h=200',
    status: 'Sedang Berlangsung',
    startDate: '25 Apr 2024',
    pic: 'Hasan Basri'
  },
  {
    id: 9,
    name: 'Sedekah Pangan Ambon',
    category: 'Kemanusiaan',
    coordinates: [-3.6958, 128.1833],
    locationName: 'Ambon, Maluku',
    beneficiaries: '350 Keluarga',
    description: 'Distribusi paket sembako untuk keluarga nelayan prasejahtera di pesisir.',
    progress: 88,
    targetAmount: 'Rp 50.000.000',
    image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=400&h=200',
    status: 'Sedang Berlangsung',
    startDate: '01 Mar 2024',
    pic: 'Lukman Hakim'
  },
  {
    id: 10,
    name: 'Bantuan Nelayan Aceh',
    category: 'Infrastruktur',
    coordinates: [5.5500, 95.3167],
    locationName: 'Banda Aceh, NAD',
    beneficiaries: '25 Kelompok Nelayan',
    description: 'Penyediaan perahu dan alat tangkap ikan untuk meningkatkan kesejahteraan nelayan.',
    progress: 55,
    targetAmount: 'Rp 250.000.000',
    image: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&q=80&w=400&h=200',
    status: 'Sedang Berlangsung',
    startDate: '12 Feb 2024',
    pic: 'Fadil Jaidi'
  },
  {
    id: 11,
    name: 'Puskesmas Keliling Banten',
    category: 'Layanan Zakat',
    coordinates: [-6.4385, 106.1362],
    locationName: 'Pandeglang, Banten',
    beneficiaries: '1.200 Pasien/Thn',
    description: 'Layanan kesehatan gratis yang menjangkau desa-desa terpencil di wilayah Banten Selatan.',
    progress: 92,
    targetAmount: 'Rp 600.000.000',
    image: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&q=80&w=400&h=200',
    status: 'Sedang Berlangsung',
    startDate: '05 Jan 2024',
    pic: 'Dr. Tirta'
  },
  {
    id: 12,
    name: 'Sumur Bor Lombok',
    category: 'Air Bersih',
    coordinates: [-8.5833, 116.1167],
    locationName: 'Lombok, NTB',
    beneficiaries: '350 Jiwa',
    description: 'Pengadaan sumber air bersih layak konsumsi bagi warga terdampak krisis kekeringan panjang.',
    progress: 100,
    targetAmount: 'Rp 50.000.000',
    image: 'https://images.unsplash.com/photo-1588616578788-d65fa31e13fa?auto=format&fit=crop&q=80&w=400&h=200',
    status: 'Selesai',
    startDate: '18 Agu 2023',
    pic: 'Andi Suwiryo'
  },
  {
    id: 13,
    name: 'Jembatan Pelosok Sulsel',
    category: 'Infrastruktur',
    coordinates: [-5.1476, 119.4327],
    locationName: 'Maros, Sulawesi Selatan',
    beneficiaries: '3 Desa Terhubung',
    description: 'Membangun jembatan penghubung desa agar akses ekonomi dan pendidikan warga kembali lancar.',
    progress: 40,
    targetAmount: 'Rp 350.000.000',
    image: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&q=80&w=400&h=200',
    status: 'Sedang Berlangsung',
    startDate: '10 Apr 2024',
    pic: 'Ilham Akbar'
  },
  {
    id: 14,
    name: 'Bantuan Pangan Suriah',
    category: 'Kemanusiaan',
    coordinates: [34.8021, 38.9968],
    locationName: 'Idlib, Suriah',
    beneficiaries: '2.500 Pengungsi',
    description: 'Pengiriman bantuan pangan dan perlengkapan musim dingin untuk kamp pengungsian Suriah.',
    progress: 80,
    targetAmount: 'Rp 1.000.000.000',
    image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=400&h=200',
    status: 'Sedang Berlangsung',
    startDate: '01 Nov 2023',
    pic: 'Relawan Kemanusiaan'
  },
  {
    id: 15,
    name: 'Sekolah Darurat Gempa Cianjur',
    category: 'Pendidikan',
    coordinates: [-6.8166, 107.1416],
    locationName: 'Cianjur, Jawa Barat',
    beneficiaries: '200 Siswa',
    description: 'Pemulihan kegiatan belajar mengajar lewat sekolah darurat tanggap bencana di Cianjur.',
    progress: 100,
    targetAmount: 'Rp 200.000.000',
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=400&h=200',
    status: 'Selesai',
    startDate: '22 Nov 2022',
    pic: 'Rina Nose'
  }
];

const MapUpdater = ({ locations, activeCategories, activeProvinces }: { locations: ProgramLocation[], activeCategories: string[], activeProvinces: string[] }) => {
  const map = useMap();
  useEffect(() => {
    if (locations.length > 0) {
      const bounds = L.latLngBounds(locations.map(loc => loc.coordinates as [number, number]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 8, duration: 0.5 });
    }
  }, [activeCategories, activeProvinces, map]); // Only update bounds when category or province changes
  return null;
};

export const ProgramMap: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [activeProvinces, setActiveProvinces] = useState<string[]>([]);
  const [selectedLoc, setSelectedLoc] = useState<ProgramLocation | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilterTab, setActiveFilterTab] = useState<'kategori' | 'lokasi'>('kategori');

  const categories = ['Dakwah Pedalaman', 'Infrastruktur', 'Air Bersih', 'Kemanusiaan', 'Pendidikan', 'Layanan Zakat'];

  const provincesMap = new Set<string>();
  locations.forEach(loc => {
    const parts = loc.locationName.split(',');
    if (parts.length > 1) {
      provincesMap.add(parts[parts.length - 1].trim());
    } else {
      provincesMap.add(loc.locationName.trim());
    }
  });
  const provinces = Array.from(provincesMap).sort();

  const filteredLocations = locations.filter(loc => {
    const matchCategory = activeCategories.length === 0 || activeCategories.includes(loc.category);
    const parts = loc.locationName.split(',');
    const itemProv = parts.length > 1 ? parts[parts.length - 1].trim() : loc.locationName.trim();
    const matchProvince = activeProvinces.length === 0 || activeProvinces.includes(itemProv);
    return matchCategory && matchProvince;
  });

  useEffect(() => {
    // Simulate fetching map data or initializing map
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (selectedLoc) {
      const matchCategory = activeCategories.length === 0 || activeCategories.includes(selectedLoc.category);
      const parts = selectedLoc.locationName.split(',');
      const itemProv = parts.length > 1 ? parts[parts.length - 1].trim() : selectedLoc.locationName.trim();
      const matchProvince = activeProvinces.length === 0 || activeProvinces.includes(itemProv);
      
      if (!matchCategory || !matchProvince) {
        setSelectedLoc(null);
      }
    }
  }, [activeCategories, activeProvinces, selectedLoc]);

  return (
    <div className="w-full h-[450px] md:h-[600px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-xl relative z-0 bg-slate-100 dark:bg-slate-800">
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
              <Loader2 className="w-10 h-10 text-primary-500" />
            </motion.div>
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="text-sm font-medium text-slate-500 dark:text-slate-400"
            >
              Memuat data sebaran program...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
      <style>
        {`
          /* Marker Styles */
          .marker-pin-wrapper {
            position: relative;
            width: 44px;
            height: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .marker-pulse {
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            opacity: 0;
            will-change: transform, opacity;
            animation: smooth-pulse 3s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          }
          .marker-pin {
            position: relative;
            z-index: 10;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            border: 2px solid white;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.15);
            transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s ease, border-color 0.3s ease;
            will-change: transform;
          }
          .marker-pin-wrapper:hover .marker-pin {
            transform: scale(1.15) translateY(-4px);
            box-shadow: 0 10px 15px -3px rgba(0,0,0,0.2), 0 0 12px currentColor;
            border-color: #fff;
          }
          .marker-pin-wrapper:hover .marker-pulse {
            animation-play-state: paused;
            opacity: 0;
          }
          .marker-pin svg {
            color: white;
            width: 18px;
            height: 18px;
          }
          @keyframes smooth-pulse {
            0% { transform: scale(0.8); opacity: 0.5; }
            100% { transform: scale(2.2); opacity: 0; }
          }
          
          /* Leaflet DivIcon default reset */
          .custom-marker-icon {
            animation: marker-drop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
            transform-origin: bottom center;
            will-change: transform;
          }
          
          @keyframes marker-drop {
            0% { transform: translateY(-20px) scale(0.9); opacity: 0; }
            100% { transform: translateY(0) scale(1); opacity: 1; }
          }

          .custom-marker-icon.leaflet-div-icon {
            background: transparent;
            border: none;
          }

          /* Popup Styles */
          .leaflet-popup-custom .leaflet-popup-content-wrapper {
            padding: 0;
            border-radius: 1.25rem;
            overflow: hidden;
            box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
            border: 1px solid rgba(255,255,255,0.8);
          }
          .leaflet-popup-custom .leaflet-popup-content {
            margin: 0;
            width: 270px !important;
          }
          @media (min-width: 640px) {
            .leaflet-popup-custom .leaflet-popup-content {
              width: 290px !important;
            }
          }
          .leaflet-popup-custom .leaflet-popup-tip-container {
            margin-top: -1px;
            overflow: visible;
          }
          .leaflet-popup-custom .leaflet-popup-tip {
            width: 18px;
            height: 18px;
            background: white;
            box-shadow: 2px 2px 5px rgba(0,0,0,0.05);
          }

          /* Customizing the default leaflet close button inside our popup */
          .leaflet-popup-custom .leaflet-popup-close-button {
            color: white !important;
            text-shadow: 0 1px 2px rgba(0,0,0,0.5) !important;
            margin-top: 10px !important;
            margin-right: 10px !important;
            background: rgba(0,0,0,0.3) !important;
            border-radius: 50% !important;
            width: 26px !important;
            height: 26px !important;
            line-height: 26px !important;
            text-align: center !important;
            padding: 0 !important;
            font-weight: normal !important;
            backdrop-filter: blur(4px);
            transition: all 0.2s ease !important;
          }
          .leaflet-popup-custom .leaflet-popup-close-button:hover {
            background: rgba(0,0,0,0.6) !important;
            transform: scale(1.1);
          }

          /* Hide scrollbar for category filter */
          .scrollbar-none::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-none {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;  /* Firefox */
          }
        `}
      </style>

      {/* Filter Button */}
      <div className="absolute top-4 left-4 z-[1000]">
        <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.05 }} 
          onClick={() => setIsFilterOpen(true)}
          className="transition-all duration-300 flex items-center gap-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-full font-bold text-sm shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-200/50 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all hover:scale-105 active:scale-95"
        >
          <Filter className="w-4 h-4 text-primary-500 dark:text-primary-400" />
          Filter Program
          {(activeCategories.length > 0 || activeProvinces.length > 0) && (
            <span className="flex items-center justify-center w-5 h-5 ml-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-[10px] rounded-full">
              {activeCategories.length + activeProvinces.length}
            </span>
          )}
        </motion.button>
      </div>

      {/* Filter Modal Panel */}
      <AnimatePresence>
        {isFilterOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterOpen(false)}
              className="absolute inset-0 z-[1001] bg-slate-900/40 dark:bg-slate-900/60 backdrop-blur-sm rounded-2xl transition-all duration-300"
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} />
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="absolute top-16 left-4 right-4 sm:left-4 sm:right-auto sm:w-80 z-[1002] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl dark:shadow-black/50 border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col max-h-[70%] sm:max-h-[80%]"
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Filter className="w-4 h-4 text-primary-500 dark:text-primary-400" /> Filter
                </h3>
                <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.05 }} 
                  onClick={() => setIsFilterOpen(false)}
                  className="transition-all duration-300 p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400 transition-colors transition-all duration-300 hover:scale-105 hover:shadow-lg hover:brightness-110 active:scale-95"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
              
              <div className="flex px-4 pt-3 border-b border-slate-100 dark:border-slate-800 gap-4 text-sm font-semibold relative">
                <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.05 }} 
                  onClick={() => setActiveFilterTab('kategori')}
                  className={`transition-all duration-300 pb-3 border-b-2 transition-colors flex flex-1 justify-center items-center gap-2 relative z-10 ${activeFilterTab === 'kategori' ? 'border-primary-500 dark:border-primary-400 text-primary-600 dark:text-primary-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'} transition-all duration-300 hover:scale-105 hover:shadow-lg hover:brightness-110 active:scale-95`}>
                  <Grid2X2 className="w-4 h-4" /> Kategori
                  {activeCategories.length > 0 && <span className="absolute -top-1 right-2 w-2 h-2 bg-primary-500 rounded-full" />}
                </motion.button>
                <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.05 }} 
                  onClick={() => setActiveFilterTab('lokasi')}
                  className={`transition-all duration-300 pb-3 border-b-2 transition-colors flex flex-1 justify-center items-center gap-2 relative z-10 ${activeFilterTab === 'lokasi' ? 'border-primary-500 dark:border-primary-400 text-primary-600 dark:text-primary-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'} transition-all duration-300 hover:scale-105 hover:shadow-lg hover:brightness-110 active:scale-95`}>
                  <MapPin className="w-4 h-4" /> Lokasi
                  {activeProvinces.length > 0 && <span className="absolute -top-1 right-2 w-2 h-2 bg-primary-500 rounded-full" />}
                </motion.button>
              </div>

              <div className="overflow-y-auto p-4 custom-scrollbar bg-white dark:bg-slate-900 flex-1 min-h-[220px]">
                {activeFilterTab === 'kategori' ? (
                  <div className="flex flex-col gap-1.5">
                    {categories.map(cat => {
                      const isActive = activeCategories.includes(cat);
                      return (
                        <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.05 }} 
                          key={cat}
                          onClick={() => {
                            if (isActive) {
                              setActiveCategories(prev => prev.filter(c => c !== cat));
                            } else {
                              setActiveCategories(prev => [...prev, cat]);
                            }
                          }}
                          className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-sm font-medium transition-all ${
                            isActive 
                              ? 'bg-primary-50 dark:bg-primary-500/20 text-primary-700 dark:text-primary-400 ring-1 ring-primary-500/30' 
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                          } transition-all duration-300 hover:scale-105 hover:shadow-lg hover:brightness-110 active:scale-95`}>
                          {cat}
                          {isActive && <Check className="w-4 h-4 text-primary-500 dark:text-primary-400" />}
                        </motion.button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {provinces.map(prov => {
                      const isActive = activeProvinces.includes(prov);
                      return (
                        <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.05 }} 
                          key={prov}
                          onClick={() => {
                            if (isActive) {
                              setActiveProvinces(prev => prev.filter(p => p !== prov));
                            } else {
                              setActiveProvinces(prev => [...prev, prov]);
                            }
                          }}
                          className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-sm font-medium transition-all ${
                            isActive 
                              ? 'bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 ring-1 ring-slate-800/30 dark:ring-slate-100/30' 
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                          } transition-all duration-300 hover:scale-105 hover:shadow-lg hover:brightness-110 active:scale-95`}>
                          {prov}
                          {isActive && <Check className="w-4 h-4 text-white dark:text-slate-900" />}
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </div>
              
              <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/80 flex gap-2">
                <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.05 }} 
                  onClick={() => {
                    setActiveCategories([]);
                    setActiveProvinces([]);
                  }}
                  className="transition-all duration-300 px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors transition-all duration-300 hover:scale-105 hover:shadow-lg hover:brightness-110 active:scale-95"
                >
                  Reset
                </motion.button>
                <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.05 }} 
                  onClick={() => setIsFilterOpen(false)}
                  className="transition-all duration-300 flex-1 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white rounded-xl py-2 font-bold text-sm transition-all shadow-md shadow-primary-500/20 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:brightness-110 active:scale-95"
                >
                  Terapkan Filter
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <MapContainer 
        center={[-1.0, 117.0]} // Adjusted center slightly east to fit Papua better
        zoom={5} 
        scrollWheelZoom={false}
        zoomControl={false} // We will add it manually for better position
        className="w-full h-full z-0 font-sans"
      >
        <ZoomControl position="bottomright" />
        <TileLayer
          attribution='&copy; <motion.a href="https://carto.com/attributions" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="transition-all duration-300">CARTO</motion.a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={19}
        />
        
        <MapUpdater locations={filteredLocations} activeCategories={activeCategories} activeProvinces={activeProvinces} />
        
        {filteredLocations.map((loc) => {
          const iconMarker = createCustomIcon(loc.category);
          return (
            <Marker 
              key={loc.id} 
              position={loc.coordinates}
              icon={iconMarker}
              eventHandlers={{
                click: () => {
                  setSelectedLoc(loc);
                }
              }}
            />
          );
        })}
      </MapContainer>

      {/* Selected Location Details Card (Mobile Bottom Sheet / Desktop Floating Card) */}
      <AnimatePresence>
        {selectedLoc && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute bottom-0 left-0 right-0 rounded-t-2xl sm:rounded-2xl sm:bottom-auto sm:left-auto sm:right-4 sm:top-20 sm:w-[320px] z-[2000] bg-white shadow-2xl overflow-hidden border-t sm:border border-slate-100 flex flex-col max-h-[85%] sm:max-h-[min(600px,80vh)]"
          >
            <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.05 }} 
              onClick={() => setSelectedLoc(null)}
              className="transition-all duration-300 absolute top-2 right-2 sm:top-3 sm:right-3 z-10 p-1.5 sm:p-2 bg-black/30 hover:bg-black/50 text-white rounded-full backdrop-blur-sm transition-colors transition-all duration-300 hover:scale-105 hover:shadow-lg hover:brightness-110 active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </motion.button>
            <div className="overflow-y-auto no-scrollbar flex-1">
              <div className="h-24 sm:h-36 w-full relative shrink-0">
                <img src={selectedLoc.image} alt={selectedLoc.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-3 sm:p-4">
                  <span className="text-[9px] sm:text-[10px] font-bold text-white bg-transparent px-2 py-0.5 rounded-full w-fit mb-1 border border-white/40 uppercase tracking-widest backdrop-blur-sm">
                    {selectedLoc.category}
                  </span>
                  <h3 className="font-extrabold text-base sm:text-xl text-white m-0 leading-tight drop-shadow-lg flex items-center gap-2">
                    <span 
                      className="inline-flex items-center justify-center p-1.5 rounded-full shrink-0 bg-white/20 backdrop-blur-md"
                      style={{ color: getIconColor(selectedLoc.category) }}
                      dangerouslySetInnerHTML={{ __html: getSvgForCategory(selectedLoc.category) }}
                    />
                    {selectedLoc.name}
                  </h3>
                </div>
              </div>

              <div className="p-3 sm:p-4 flex flex-col gap-2 sm:gap-3.5">
                <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-[12px] font-medium text-slate-600 bg-slate-50 px-2 py-1.5 sm:px-2.5 sm:py-2 rounded-lg border border-slate-100">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 shrink-0"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                  <span className="truncate">{selectedLoc.locationName}</span>
                </div>

                <p className="text-[11px] sm:text-[13px] text-slate-600 leading-relaxed m-0 line-clamp-2 md:line-clamp-3">{selectedLoc.description}</p>
                
                {/* Additional Info Grid */}
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Status</span>
                    <span className={`text-[11px] font-semibold w-fit px-2 py-0.5 rounded border ${
                      selectedLoc.status === 'Selesai' 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                        : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                    }`}>
                      {selectedLoc.status}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Mulai</span>
                    <span className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 shrink-0"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                      {selectedLoc.startDate}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5 col-span-2">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Penanggung Jawab</span>
                    <span className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 shrink-0"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      {selectedLoc.pic}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:gap-2.5 mt-1">
                  <div className="flex flex-col gap-0.5 sm:gap-1 text-[11px] sm:text-[13px] font-semibold text-primary-700 bg-primary-50/50 px-2 py-1.5 sm:px-3 sm:py-2.5 rounded-xl border border-primary-100">
                    <span className="text-[8px] sm:text-[9px] uppercase tracking-wider text-primary-500 font-bold flex items-center gap-1 sm:gap-1.5">
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                      Penerima
                    </span>
                    {selectedLoc.beneficiaries}
                  </div>
                  
                  {selectedLoc.targetAmount && (
                  <div className="flex flex-col gap-0.5 sm:gap-1 text-[11px] sm:text-[13px] font-semibold text-emerald-700 bg-emerald-50/50 px-2 py-1.5 sm:px-3 sm:py-2.5 rounded-xl border border-emerald-100">
                     <span className="text-[8px] sm:text-[9px] uppercase tracking-wider text-emerald-500 font-bold flex items-center gap-1 sm:gap-1.5">
                       <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                       Target Dana
                     </span>
                     {selectedLoc.targetAmount}
                  </div>
                  )}
                </div>
                
                {selectedLoc.progress !== undefined && (
                  <div className="flex flex-col gap-1 sm:gap-1.5 bg-white p-1 rounded-xl">
                    <div className="flex justify-between text-[10px] sm:text-[11px] font-extrabold items-end">
                      <span className="text-slate-500 uppercase tracking-widest">Terkumpul</span>
                      <span className="text-[#f29f05] text-[12px] sm:text-[13px] leading-none">{selectedLoc.progress}%</span>
                    </div>
                    <div className="h-1.5 sm:h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#f29f05] to-[#f5b845] rounded-full" 
                        style={{ width: `${selectedLoc.progress}%` }}
                      />
                    </div>
                  </div>
                )}
                
                <motion.button className="transition-all duration-300 w-full mt-1 py-2 sm:py-3 bg-[#f29f05] hover:bg-[#d98f04] text-white text-[13px] sm:text-[14px] font-bold rounded-xl transition-all shadow-md shadow-[#f29f05]/20 flex items-center justify-center gap-1.5 sm:gap-2 hover:-translate-y-0.5 transition-all duration-300 hover:shadow-lg" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}>
                   <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="sm:w-4 sm:h-4"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
                  Dukung Program
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
