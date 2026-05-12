import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Confetti from 'react-confetti';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Copy, Tent, ArrowRight, Wallet, Banknote, CreditCard, MapPin, Globe, AlertTriangle, CheckCircle2, Search, Heart, Loader2, PackageSearch, Scissors, FileText, Mountain, Users, HeartHandshake, ChevronDown, Map as MapIcon, Milestone, Baby, Palmtree, Waves, Trees, Flame, Compass, ShieldCheck, Award, Anchor, ClipboardCheck, Truck, Scale, SearchCheck, Star, Gift, BadgeCheck, Check, Sparkles, Info, X, Newspaper, Calendar, Clock, Image, ShoppingBag } from 'lucide-react';
import { PAYMENT_METHODS } from '../App';

// Fix for default Leaflet marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const formatCurrencyForm = (val: string) => {
  if (!val) return '';
  const numberString = val.replace(/\D/g, '');
  if (!numberString) return '';
  return new Intl.NumberFormat('id-ID').format(Number(numberString)).replace(/,/g, '.');
};

const QURBAN_PROGRAMS = [
  // Kambing - Pelosok
  {
    id: 'kambing_ntt',
    title: 'Kambing NTT (Kupang Tengah)',
    category: 'Qurban Kambing',
    location: 'Nusa Tenggara Timur',
    region: 'pelosok',
    price: 2500000,
    type: 'kambing',
    quota: 150,
    filled: 124,
    image: 'https://images.unsplash.com/photo-1543329711-d9a6021e513a?auto=format&fit=crop&q=80&w=800',
    icon: <Mountain className="w-4 h-4" />,
    desc: 'Distribusi daging qurban untuk mualaf dan warga pelosok di Kupang.'
  },
  {
    id: 'kambing_papua',
    title: 'Kambing Papua (Merauke)',
    category: 'Qurban Kambing',
    location: 'Papua Selatan',
    region: 'pelosok',
    price: 3200000,
    type: 'kambing',
    quota: 100,
    filled: 45,
    image: 'https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&q=80&w=800',
    icon: <Palmtree className="w-4 h-4" />,
    desc: 'Menjangkau wilayah paling timur Indonesia di perbatasan Merauke.'
  },
  {
    id: 'kambing_mentawai',
    title: 'Kambing Mentawai',
    category: 'Qurban Kambing',
    location: 'Kep. Mentawai',
    region: 'pelosok',
    price: 2700000,
    type: 'kambing',
    quota: 80,
    filled: 32,
    image: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&q=80&w=800',
    icon: <Waves className="w-4 h-4" />,
    desc: 'Penyaluran untuk masyarakat pedalaman di Kepulauan Mentawai.'
  },
  {
    id: 'kambing_kalimantan',
    title: 'Kambing Pedalaman Kalbar',
    category: 'Qurban Kambing',
    location: 'Sambas, Kalbar',
    region: 'pelosok',
    price: 2600000,
    type: 'kambing',
    quota: 120,
    filled: 88,
    image: 'https://images.unsplash.com/photo-1552554620-6d84f8841f39?auto=format&fit=crop&q=80&w=800',
    icon: <Trees className="w-4 h-4" />,
    desc: 'Amanah qurban untuk warga di tepian sungai Kapuas dan perbatasan.'
  },
  {
    id: 'kambing_maluku',
    title: 'Kambing Maluku (P. Seram)',
    category: 'Qurban Kambing',
    location: 'Maluku Utara',
    region: 'pelosok',
    price: 2800000,
    type: 'kambing',
    quota: 90,
    filled: 67,
    image: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&q=80&w=800',
    icon: <Anchor className="w-4 h-4" />,
    desc: 'Bantu ringankan beban warga di pesisir Pulau Seram.'
  },
  {
    id: 'kambing_sulteng',
    title: 'Kambing Sulteng (Sigi)',
    category: 'Qurban Kambing',
    location: 'Sigi, Sulteng',
    region: 'pelosok',
    price: 2400000,
    type: 'kambing',
    quota: 110,
    filled: 54,
    image: 'https://images.unsplash.com/photo-1559526323-cb2f2fe2591b?auto=format&fit=crop&q=80&w=800',
    icon: <Tent className="w-4 h-4" />,
    desc: 'Penyaluran untuk penyintas bencana di pelosok Sigi.'
  },

  // Kambing - Luar Negeri
  {
    id: 'kambing_gaza',
    title: 'Kambing untuk Gaza',
    category: 'Qurban Kambing',
    location: 'Gaza, Palestina',
    region: 'luar_negeri',
    price: 4500000,
    type: 'kambing',
    quota: 500,
    filled: 420,
    image: 'https://images.unsplash.com/photo-1593465492429-052ff81e01af?auto=format&fit=crop&q=80&w=800',
    icon: <Globe className="w-4 h-4" />,
    desc: 'Pasokan protein mendesak untuk warga Gaza yang sedang diuji.'
  },
  {
    id: 'kambing_yaman',
    title: 'Kambing untuk Yaman',
    category: 'Qurban Kambing',
    location: 'Sanaa, Yaman',
    region: 'luar_negeri',
    price: 3500000,
    type: 'kambing',
    quota: 200,
    filled: 112,
    image: 'https://images.unsplash.com/photo-1590012314607-cda9d9b6a2a1?auto=format&fit=crop&q=80&w=800',
    icon: <Flame className="w-4 h-4" />,
    desc: 'Bantu ringankan krisis pangan di Yaman melalui qurban Anda.'
  },
  {
    id: 'kambing_rohingya',
    title: 'Kambing untuk Rohingya',
    category: 'Qurban Kambing',
    location: 'Cox\'s Bazar',
    region: 'luar_negeri',
    price: 2900000,
    type: 'kambing',
    quota: 300,
    filled: 245,
    image: 'https://images.unsplash.com/photo-1543329711-d9a6021e513a?auto=format&fit=crop&q=80&w=800',
    icon: <Users className="w-4 h-4" />,
    desc: 'Hadirkan senyum pengungsi Rohingya di kamp penampungan.'
  },
  {
    id: 'kambing_suriah',
    title: 'Kambing untuk Suriah',
    category: 'Qurban Kambing',
    location: 'Idlib, Suriah',
    region: 'luar_negeri',
    price: 3800000,
    type: 'kambing',
    quota: 250,
    filled: 189,
    image: 'https://images.unsplash.com/photo-1593465492429-052ff81e01af?auto=format&fit=crop&q=80&w=800',
    icon: <HeartHandshake className="w-4 h-4" />,
    desc: 'Bantu warga Suriah yang bertahan di tengah konflik berkepanjangan.'
  },
  
  // Sapi 1/7 - Pelosok
  {
    id: 'sapi_1_7_ntt',
    title: '1/7 Sapi NTT',
    category: 'Sapi Patungan',
    location: 'Kupang, NTT',
    region: 'pelosok',
    price: 2100000,
    type: 'sapi_1_7',
    quota: 140, // 20 ekor
    filled: 112,
    image: 'https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?auto=format&fit=crop&q=80&w=800',
    icon: <Users className="w-4 h-4" />,
    desc: 'Patungan sapi untuk mualaf pedalaman di NTT.'
  },
  {
    id: 'sapi_1_7_papua',
    title: '1/7 Sapi Papua',
    category: 'Sapi Patungan',
    location: 'Merauke, Papua',
    region: 'pelosok',
    price: 2400000,
    type: 'sapi_1_7',
    quota: 70, // 10 ekor
    filled: 35,
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800',
    icon: <Compass className="w-4 h-4" />,
    desc: 'Hadirkan kebahagiaan daging sapi di pelosok Papua.'
  },
  {
    id: 'sapi_1_7_maluku',
    title: '1/7 Sapi Maluku',
    category: 'Sapi Patungan',
    location: 'Pulau Seram',
    region: 'pelosok',
    price: 2200000,
    type: 'sapi_1_7',
    quota: 49, // 7 ekor
    filled: 28,
    image: 'https://images.unsplash.com/photo-1559526323-cb2f2fe2591b?auto=format&fit=crop&q=80&w=800',
    icon: <Anchor className="w-4 h-4" />,
    desc: 'Berikan paket daging sapi utuk warga pesisir Maluku.'
  },
  {
    id: 'sapi_1_7_mentawai',
    title: '1/7 Sapi Mentawai',
    category: 'Sapi Patungan',
    location: 'Tuo Pejat',
    region: 'pelosok',
    price: 2300000,
    type: 'sapi_1_7',
    quota: 35, // 5 ekor
    filled: 14,
    image: 'https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?auto=format&fit=crop&q=80&w=800',
    icon: <Waves className="w-4 h-4" />,
    desc: 'Sapi untuk pelosok pedalaman Kepulauan Mentawai.'
  },
  {
    id: 'sapi_1_7_sulawesi',
    title: '1/7 Sapi Sulteng',
    category: 'Sapi Patungan',
    location: 'Kab. Sigi',
    region: 'pelosok',
    price: 2150000,
    type: 'sapi_1_7',
    quota: 56, // 8 ekor
    filled: 42,
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800',
    icon: <Tent className="w-4 h-4" />,
    desc: 'Bantu pemulihan gizi warga penyintas bencana di Sulteng.'
  },

  // Sapi 1/7 - Luar Negeri
  {
    id: 'sapi_1_7_gaza',
    title: '1/7 Sapi Gaza',
    category: 'Sapi Patungan',
    location: 'Gaza, Palestina',
    region: 'luar_negeri',
    price: 3800000,
    type: 'sapi_1_7',
    quota: 280, // 40 ekor
    filled: 210,
    image: 'https://images.unsplash.com/photo-1444491741275-3747c03c9964?auto=format&fit=crop&q=80&w=800',
    icon: <ShieldCheck className="w-4 h-4" />,
    desc: 'Patungan sapi jumbo untuk membantu pengungsi di Gaza.'
  },
  {
    id: 'sapi_1_7_afghanistan',
    title: '1/7 Sapi Afghanistan',
    category: 'Sapi Patungan',
    location: 'Kabul, Afghan',
    region: 'luar_negeri',
    price: 2900000,
    type: 'sapi_1_7',
    quota: 105, // 15 ekor
    filled: 77,
    image: 'https://images.unsplash.com/photo-1593465492429-052ff81e01af?auto=format&fit=crop&q=80&w=800',
    icon: <Globe className="w-4 h-4" />,
    desc: 'Patungan sapi untuk warga kurang mampu di pelosok Afghanistan.'
  },
  {
    id: 'sapi_1_7_somalia',
    title: '1/7 Sapi Somalia',
    category: 'Sapi Patungan',
    location: 'Mogadishu',
    region: 'luar_negeri',
    price: 2600000,
    type: 'sapi_1_7',
    quota: 70, // 10 ekor
    filled: 63,
    image: 'https://images.unsplash.com/photo-1590012314607-cda9d9b6a2a1?auto=format&fit=crop&q=80&w=800',
    icon: <Flame className="w-4 h-4" />,
    desc: 'Patungan sapi untuk mengatasi kerawanan pangan di Tanduk Afrika.'
  },

  // Sapi Utuh - Pelosok
  {
    id: 'sapi_utuh_ntt',
    title: 'Sapi Utuh NTT',
    category: 'Sapi Utuh',
    location: 'Kupang, NTT',
    region: 'pelosok',
    price: 14700000,
    type: 'sapi_utuh',
    quota: 20,
    filled: 12,
    image: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&q=80&w=800',
    icon: <Tent className="w-4 h-4" />,
    desc: 'Satu sapi utuh atas nama keluarga untuk warga pelosok NTT.'
  },
  {
    id: 'sapi_utuh_papua',
    title: 'Sapi Utuh Papua Merauke',
    category: 'Sapi Utuh',
    location: 'Merauke, Papua',
    region: 'pelosok',
    price: 16800000,
    type: 'sapi_utuh',
    quota: 10,
    filled: 4,
    image: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&q=80&w=800',
    icon: <Compass className="w-4 h-4" />,
    desc: 'Penyembelihan 1 sapi utuh di wilayah perbatasan Indonesia-PNG.'
  },
  {
    id: 'sapi_utuh_mentawai',
    title: 'Sapi Utuh Mentawai',
    category: 'Sapi Utuh',
    location: 'Kep. Mentawai',
    region: 'pelosok',
    price: 15500000,
    type: 'sapi_utuh',
    quota: 5,
    filled: 2,
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800',
    icon: <Waves className="w-4 h-4" />,
    desc: 'Qurban sapi utuh untuk mualaf pedalaman di Kepulauan Mentawai.'
  },

  // Sapi Utuh - Luar Negeri
  {
    id: 'sapi_utuh_gaza',
    title: 'Sapi Utuh Gaza Premium',
    category: 'Sapi Utuh',
    location: 'Gaza, Palestina',
    region: 'luar_negeri',
    price: 28500000,
    type: 'sapi_utuh',
    quota: 50,
    filled: 38,
    image: 'https://images.unsplash.com/photo-1593465492429-052ff81e01af?auto=format&fit=crop&q=80&w=800',
    icon: <Award className="w-4 h-4" />,
    desc: 'Qurban sapi kualitas terbaik untuk warga Gaza yang gigih.'
  },
  {
    id: 'sapi_utuh_suriah',
    title: 'Sapi Utuh Suriah',
    category: 'Sapi Utuh',
    location: 'Idlib, Suriah',
    region: 'luar_negeri',
    price: 26500000,
    type: 'sapi_utuh',
    quota: 15,
    filled: 11,
    image: 'https://images.unsplash.com/photo-1444491741275-3747c03c9964?auto=format&fit=crop&q=80&w=800',
    icon: <HeartHandshake className="w-4 h-4" />,
    desc: 'Bersama warga Suriah merayakan hari raya dengan daging sapi segar.'
  },

  // Additional Pelosok Programs to reach 10+
  {
    id: 'kambing_banten',
    title: 'Kambing Banten Kidul',
    category: 'Qurban Kambing',
    location: 'Lebak, Banten',
    region: 'pelosok',
    price: 2200000,
    type: 'kambing',
    quota: 85,
    filled: 34,
    image: 'https://images.unsplash.com/photo-1543329711-d9a6021e513a?auto=format&fit=crop&q=80&w=800',
    icon: <Users className="w-4 h-4" />,
    desc: 'Pemberdayaan peternak lokal di pelosok Banten Selatan.'
  },
  {
    id: 'sapi_1_7_lombok',
    title: '1/7 Sapi Lombok',
    category: 'Sapi Patungan',
    location: 'Sembalun, NTB',
    region: 'pelosok',
    price: 2250000,
    type: 'sapi_1_7',
    quota: 63,
    filled: 49,
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800',
    icon: <Tent className="w-4 h-4" />,
    desc: 'Patungan sapi untuk warga lereng Rinjani yang membutuhkan.'
  },
  {
    id: 'sapi_utuh_sulteng',
    title: 'Sapi Utuh Sulteng',
    category: 'Sapi Utuh',
    location: 'Donggala, Sulteng',
    region: 'pelosok',
    price: 15200000,
    type: 'sapi_utuh',
    quota: 15,
    filled: 6,
    image: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&q=80&w=800',
    icon: <Anchor className="w-4 h-4" />,
    desc: 'Satu sapi utuh untuk sejahterakan masyarakat pesisir Donggala.'
  },

  // Additional Luar Negeri Programs to reach 10+
  {
    id: 'kambing_chad',
    title: 'Kambing untuk Chad',
    category: 'Qurban Kambing',
    location: 'N\'Djamena, Chad',
    region: 'luar_negeri',
    price: 2400000,
    type: 'kambing',
    quota: 150,
    filled: 88,
    image: 'https://images.unsplash.com/photo-1590012314607-cda9d9b6a2a1?auto=format&fit=crop&q=80&w=800',
    icon: <Globe className="w-4 h-4" />,
    desc: 'Hadirkan daging qurban di salah satu negara paling membutuhkan di Afrika.'
  },
  {
    id: 'sapi_1_7_sudan',
    title: '1/7 Sapi Sudan',
    category: 'Sapi Patungan',
    location: 'Khartoum, Sudan',
    region: 'luar_negeri',
    price: 2700000,
    type: 'sapi_1_7',
    quota: 77,
    filled: 45,
    image: 'https://images.unsplash.com/photo-1444491741275-3747c03c9964?auto=format&fit=crop&q=80&w=800',
    icon: <HeartHandshake className="w-4 h-4" />,
    desc: 'Bantu krisis pangan warga Sudan melalui patungan sapi qurban.'
  },
  {
    id: 'sapi_utuh_uganda',
    title: 'Sapi Utuh Uganda',
    category: 'Sapi Utuh',
    location: 'Kampala, Uganda',
    region: 'luar_negeri',
    price: 18500000,
    type: 'sapi_utuh',
    quota: 12,
    filled: 7,
    image: 'https://images.unsplash.com/photo-1593465492429-052ff81e01af?auto=format&fit=crop&q=80&w=800',
    icon: <Globe className="w-4 h-4" />,
    desc: 'Qurban sapi utuh untuk komunitas muslim minoritas di Uganda.'
  }
];

const ANIMAL_TYPES = [
  { 
    id: 'kambing', 
    label: 'Kambing', 
    desc: '1 Ekor', 
    icon: '🐑',
    bannerImage: 'https://images.unsplash.com/photo-1543329711-d9a6021e513a?auto=format&fit=crop&q=80&w=1200',
    bannerTitle: 'Satu Kambing, Beribu Kebaikan',
    bannerDesc: 'Tunaikan ibadah qurban kambing Anda. Daging akan didistribusikan ke pelosok yang membentang dari ujung timur hingga barat.'
  },
  { 
    id: 'sapi_1_7', 
    label: 'Sapi (1/7)', 
    desc: 'Patungan', 
    icon: '🐄',
    bannerImage: 'https://images.unsplash.com/photo-1593465492429-052ff81e01af?auto=format&fit=crop&q=80&w=1200',
    bannerTitle: 'Patungan Ringan, Berkah Bersama',
    bannerDesc: 'Mari bergabung dengan 6 orang baik lainnya untuk berkurban 1 ekor sapi yang tangguh, memperluas jangkauan manfaat ke mereka yang membutuhkan.'
  },
  { 
    id: 'sapi_utuh', 
    label: 'Sapi Utuh', 
    desc: '1 Ekor Sapi', 
    icon: '🐂',
    bannerImage: 'https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?auto=format&fit=crop&q=80&w=1200',
    bannerTitle: 'Kebaikan Maksimal dengan Sapi Utuh',
    bannerDesc: 'Berikan pengorbanan terbaik. Satu sapi utuh atas nama Anda dan keluarga, menghadirkan senyum dan gizi untuk banyak kepala keluarga.'
  }
];

const JOURNEY_STAGES = [
  { id: 'pemilihan', title: 'Ikhtiar Terbaik', desc: 'Bismillah, kami memilihkan hewan qurban terbaik, sehat dan tanpa cacat, dari peternak amanah sebagai wujud cinta tertinggi.', icon: Star },
  { id: 'perawatan', title: 'Kasih Sayang & Doa', desc: 'Setiap butir pakan adalah doa. Hewan qurban Anda dirawat dengan penuh kasih, menjaga kesucian amanah yang telah Anda titipkan.', icon: Heart },
  { id: 'berat', title: 'Detail Berat & Kondisi', desc: 'Hewan qurban Anda telah ditimbang secara teliti. Berat aktual: 280-320 Kg (Sapi) / 25-30 Kg (Kambing), dalam kondisi sangat prima.', icon: Scale },
  { id: 'penyembelihan', title: 'Tugas Mulia Terlaksana', desc: 'Saat belati menyentuh, nama Anda bergema di langit sebagai saksi pengorbanan suci demi mengharap ridha-Nya semata.', icon: Scissors },
  { id: 'distribusi', title: 'Senyum di Pelosok', desc: 'Daging qurban Anda telah dikemas dengan standar kebersihan tinggi dan sedang dibagikan kepada keluarga pra-sejahtera. Senyum mereka adalah saksi bisu kebaikan Anda.', icon: Gift },
  { id: 'laporan', title: 'Amanah Tuntas & Berkah', desc: 'Alhamdulillah, seluruh rincian laporan qurban Anda telah tersedia dan amanah disalurkan 100% kepada yang berhak. Semoga berkah berkelanjutan untuk Anda.', icon: BadgeCheck, detailedLocation: 'Desa Oebelo, Kec. Kupang Tengah, Kab. Kupang, NTT' }
];

const HERO_IMAGES = [
  {
    url: '/hero_1.webp',
    fallback: 'https://images.unsplash.com/photo-1594913366159-1832ffef4511?q=80&w=1200&auto=format&fit=crop',
    title: 'Qurban Terluas Hingga Pelosok',
    subtitle: 'Menjangkau wilayah terluar Nusantara untuk kebahagiaan sesama.'
  },
  {
    url: '/hero_2.webp',
    fallback: 'https://images.unsplash.com/photo-1543329711-d9a6021e513a?q=80&w=1200&auto=format&fit=crop',
    title: 'Amanah & Profesional',
    subtitle: 'Dikelola sesuai syariat dengan laporan real-time yang transparan.'
  },
  {
    url: '/hero_3.webp',
    fallback: 'https://images.unsplash.com/photo-1511210115598-632519782ce8?q=80&w=1200&auto=format&fit=crop',
    title: 'Hewan Qurban Berkualitas',
    subtitle: 'Pilihan hewan terbaik, sehat, dan memenuhi kriteria qurban.'
  },
  {
    url: '/hero_4.webp',
    fallback: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=80&w=1200&auto=format&fit=crop',
    title: 'Wujudkan Senyum Saudara Kita',
    subtitle: 'Berikan daging qurban bergizi untuk ribuan keluarga pra-sejahtera.'
  },
  {
    url: '/hero_5.webp',
    fallback: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop',
    title: 'Berbagi Berkah di Hari Raya',
    subtitle: 'Jalankan ibadah qurban lebih praktis dengan kemudahan transaksi digital.'
  }
];

export const QurbanPage = ({ onAddToCart }: { onAddToCart?: (p: any, amt: string) => void }) => {
  const [pageTab, setPageTab] = useState<'tunaikan' | 'lacak' | 'dampak' | 'tabungan'>('tunaikan');

  // Hero Slider State
  const [currentHero, setCurrentHero] = useState(0);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHero((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Global Journey Auto-Player State
  const [globalJourneyStep, setGlobalJourneyStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setGlobalJourneyStep((prev) => (prev + 1) % JOURNEY_STAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Qurban State
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState('kambing');
  const [selectedRegion, setSelectedRegion] = useState<'pelosok' | 'luar_negeri'>('pelosok');
  const [selectedProgram, setSelectedProgram] = useState(QURBAN_PROGRAMS[0]);
  const [qurbanQty, setQurbanQty] = useState(1);
  const [qurbanFor, setQurbanFor] = useState('');

  const [liveDonors, setLiveDonors] = useState([
    { id: 1, name: 'Hamba Allah', item: '1', time: '12 menit lalu' },
    { id: 2, name: 'Achmad Suyatno', item: '2', time: '1 jam lalu' },
    { id: 3, name: 'Keluarga Bpk. Ibrahim', item: '1', time: '3 jam lalu' },
  ]);

  useEffect(() => {
    if (!isDetailModalOpen) return;
    const interval = setInterval(() => {
      const newNames = ['Hamba Allah', 'Muhammad Fazil', 'Keluarga Ibu Siti', 'Anonim', 'Ahmad Rizal', 'Budi Santoso', 'Keluarga Haris'];
      const randomName = newNames[Math.floor(Math.random() * newNames.length)];
      const randomQty = Math.floor(Math.random() * 2) + 1;
      
      const newDonor = {
        id: Date.now(),
        name: randomName,
        item: randomQty.toString(),
        time: 'Baru saja'
      };

      setLiveDonors(prev => {
        const next = [newDonor, ...prev];
        if (next.length > 3) next.pop(); // Keep only 3
        return next;
      });
    }, 4500);
    return () => clearInterval(interval);
  }, [isDetailModalOpen]);

  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isPaymentInstructionModalOpen, setIsPaymentInstructionModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [extraPrograms, setExtraPrograms] = useState<{id: string, price: number}[]>([]);

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState('');
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [isForParent, setIsForParent] = useState(false);
  const [doa, setDoa] = useState('');
  const [paymentSearchQuery, setPaymentSearchQuery] = useState('');

  // Journey Step State (for search)
  const [searchQuery, setSearchQuery] = useState('');
  const [searchStatus, setSearchStatus] = useState<'idle' | 'loading' | 'found' | 'not_found'>('idle');
  const [journeyStep, setJourneyStep] = useState(0);

  // Impact State
  const [impactSearchQuery, setImpactSearchQuery] = useState('');
  const [impactSearchStatus, setImpactSearchStatus] = useState<'idle' | 'loading' | 'found'>('idle');
  const [impactData, setImpactData] = useState<any>(null);
  const [selectedImpactYear, setSelectedImpactYear] = useState('2025');

  // Tabungan State
  const [tabunganTarget, setTabunganTarget] = useState(2500000);
  const [tabunganMonths, setTabunganMonths] = useState(12);

  const AVAILABLE_YEARS = ['2025', '2024', '2023', '2022'];

  const getImpactDataForYear = (name: string, year: string) => {
    // Mock data based on year
    const data: Record<string, any> = {
      '2025': {
        program: 'Qurban Sapi Pelosok',
        familiesHelped: 120,
        childrenHelped: 350,
        location: 'Kab. Kupang, NTT',
        village: 'Desa Oebelo, Kec. Kupang Tengah',
        totalKg: '280 kg (Sapi Hidup)',
        distributor: 'Laznas Dewan Da\'wah NTT',
        coordinates: [-10.1772, 123.6077],
        description: 'Setiap potongan daging yang Anda titipkan telah menyambung nafas kebahagiaan bagi mereka yang jarang menyentuh kelezatan gizi. Senyum anak-anak di pelosok NTT adalah saksi bisu kemuliaan hati Anda.'
      },
      '2024': {
        program: 'Qurban Kambing Pelosok',
        familiesHelped: 45,
        childrenHelped: 120,
        location: 'Merauke, Papua Selatan',
        village: 'Distrik Sota, Merauke',
        totalKg: '30 kg (Kambing Hidup)',
        distributor: 'Laznas Dewan Da\'wah Papua',
        coordinates: [-8.4833, 140.4000],
        description: 'Qurban Anda di tahun 2024 telah menjangkau saudara kita di perbatasan paling timur Nusantara. Terima kasih telah menjaga amanah ini.'
      },
      '2023': {
        program: 'Sapi Patungan (1/7)',
        familiesHelped: 85,
        childrenHelped: 210,
        location: 'Sambas, Kalimantan Barat',
        village: 'Desa Temajuk, Sambas',
        totalKg: '260 kg (Sapi Hidup)',
        distributor: 'Laznas Dewan Da\'wah Kalbar',
        coordinates: [1.3667, 108.9667],
        description: 'Tahun 2023 menjadi saksi kedermawanan Anda bagi masyarakat pesisir Sambas. Semoga berkah berlimpah.'
      },
      '2022': {
        program: 'Qurban Kambing Pelosok',
        familiesHelped: 38,
        childrenHelped: 95,
        location: 'Kep. Mentawai, Sumbar',
        village: 'Pulau Siberut, Mentawai',
        totalKg: '28 kg (Kambing Hidup)',
        distributor: 'Laznas Dewan Da\'wah Sumbar',
        coordinates: [-1.3833, 98.9333],
        description: 'Jejak kebaikan Anda di tahun 2022 masih dirasakan oleh warga pedalaman Mentawai. Terima kasih pejuang qurban.'
      }
    };
    
    const yearData = data[year] || data['2025'];
    return {
      name,
      year,
      ...yearData
    };
  };

  const handleImpactSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!impactSearchQuery.trim()) return;

    setImpactSearchStatus('loading');
    
    // Simulate API call for impact data
    setTimeout(() => {
      setImpactData(getImpactDataForYear(impactSearchQuery, selectedImpactYear));
      setImpactSearchStatus('found');
    }, 1500);
  };

  useEffect(() => {
    if (impactSearchStatus === 'found' && impactSearchQuery) {
      setImpactData(getImpactDataForYear(impactSearchQuery, selectedImpactYear));
    }
  }, [selectedImpactYear]);

  const calculateQurbanTotal = () => {
    return selectedProgram.price * qurbanQty;
  };

  const calculateGrandTotal = () => {
    const qurban = calculateQurbanTotal();
    const extra = extraPrograms.reduce((acc, curr) => acc + curr.price, 0);
    return qurban + extra;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCheckoutModalOpen(true);
  };

  const handleFinalCheckout = () => {
    setIsCheckoutModalOpen(false);
    setIsPaymentInstructionModalOpen(true);
  };

  const handleCompletePayment = () => {
    setIsPaymentInstructionModalOpen(false);
    setIsSuccessModalOpen(true);
  };

  const handleCloseSuccess = () => {
    setIsSuccessModalOpen(false);
    setIsDetailModalOpen(false);
    // Reset state here if needed
    setQurbanQty(1);
    setQurbanFor('');
    setDonorName('');
    setDonorEmail('');
    setDonorPhone('');
    setIsForParent(false);
    setPaymentMethod('');
    setExtraPrograms([]);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setSearchStatus('loading');
    setJourneyStep(0);
    
    setTimeout(() => {
      setSearchStatus('found');
    }, 1500);
  };

  // Simulate milestone animation
  useEffect(() => {
    if (searchStatus === 'found') {
      // We want to reach the final completed state to show full progress
      const targetStep = JOURNEY_STAGES.length; 
      setJourneyStep(0);
      
      const interval = setInterval(() => {
        setJourneyStep(prev => {
          const next = prev + 1;
          if (next >= targetStep) {
            clearInterval(interval);
            return targetStep;
          }
          return next;
        });
      }, 3000); // 3 seconds per step for a steady, meaningful progression
      return () => clearInterval(interval);
    }
  }, [searchStatus, searchQuery]);

  return (
    <div className="bg-[#eaf4fc] dark:bg-slate-900 min-h-[85vh] lg:min-h-screen pt-32 pb-24 transition-colors duration-300">
      {/* Hero Section */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 mb-12">
        <div className="relative h-[200px] md:h-[300px] lg:h-[400px] w-full overflow-hidden rounded-[2rem] shadow-2xl border border-white/40 dark:border-slate-800 ring-1 ring-slate-100 dark:ring-slate-800">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentHero}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 1.5, ease: [0.43, 0.13, 0.23, 0.96] }}
              className="absolute inset-0"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent z-10" />
              <img 
                src={imageErrors[currentHero] ? HERO_IMAGES[currentHero].fallback : HERO_IMAGES[currentHero].url} 
                alt={HERO_IMAGES[currentHero].title}
                className="w-full h-full object-cover"
                onError={() => setImageErrors(prev => ({ ...prev, [currentHero]: true }))}
                referrerPolicy="no-referrer"
              />
              
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="max-w-xl"
                >
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-3">
                    <span className="flex h-1.5 w-1.5 rounded-full bg-[#1799dc] animate-pulse" />
                    <span className="text-[9px] md:text-[10px] font-bold text-white uppercase tracking-[0.1em]">Qurban Berkah Bersama LAZNAS</span>
                  </div>
                  <h1 className="text-xl md:text-3xl lg:text-4xl font-black text-white mb-2 tracking-tight drop-shadow-lg">
                    {HERO_IMAGES[currentHero].title}
                  </h1>
                  <p className="text-slate-100 text-[10px] md:text-sm font-medium max-w-lg mx-auto leading-relaxed drop-shadow-md opacity-90">
                    {HERO_IMAGES[currentHero].subtitle}
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Progress Indicators */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
            {HERO_IMAGES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentHero(idx)}
                className={`h-1.5 rounded-full transition-all duration-700 ease-in-out shadow-sm ${currentHero === idx ? 'w-10 bg-[#1799dc]' : 'w-2 bg-white/30 hover:bg-white/50'}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-6">

        {/* Top Tabs */}
        <div className="flex justify-center mb-10">
          <div className="bg-white dark:bg-slate-800 p-1 rounded-2xl md:rounded-full shadow-lg border border-slate-100 dark:border-slate-700 grid grid-cols-4 gap-1 w-full md:w-auto">
            <button 
              onClick={() => setPageTab('tunaikan')}
              className={`px-2 md:px-6 py-2.5 rounded-xl md:rounded-full font-bold text-[10px] md:text-sm transition-all duration-300 ${pageTab === 'tunaikan' ? 'bg-[#1799dc] text-white shadow-md' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
            >
              Tunaikan
            </button>
            <button 
              onClick={() => setPageTab('tabungan')}
              className={`px-2 md:px-6 py-2.5 rounded-xl md:rounded-full font-bold text-[10px] md:text-sm transition-all duration-300 flex items-center justify-center gap-1.5 ${pageTab === 'tabungan' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400'}`}
            >
              <Sparkles className="w-3.5 h-3.5 hidden sm:block" /> Tabungan
            </button>
            <button 
              onClick={() => { setPageTab('lacak'); setSearchStatus('idle'); setSearchQuery(''); }}
              className={`px-2 md:px-6 py-2.5 rounded-xl md:rounded-full font-bold text-[10px] md:text-sm transition-all duration-300 ${pageTab === 'lacak' ? 'bg-[#1799dc] text-white shadow-md' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
            >
              Lacak
            </button>
            <button 
              onClick={() => setPageTab('dampak')}
              className={`px-2 md:px-6 py-2.5 rounded-xl md:rounded-full font-bold text-[10px] md:text-sm transition-all duration-300 flex items-center justify-center gap-1.5 ${pageTab === 'dampak' ? 'bg-[#1799dc] text-white shadow-md' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
            >
              <Heart className="w-3.5 h-3.5 hidden sm:block" /> Dampak
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {pageTab === 'tunaikan' && (
            <motion.div
              key="tunaikan"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden"
            >
              <div className="p-4 md:p-6 text-slate-900 dark:text-white">
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Phase 1: Donor & Animal Selection */}
                  <div className="grid lg:grid-cols-2 gap-6">
                    {/* Identity Column */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-2 p-1">
                        <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-[#1799dc] flex items-center justify-center text-[10px] font-black">1</div>
                        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Identitas Penunaian</h3>
                      </div>
                      
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Nama Lengkap</label>
                          <input required type="text" value={donorName} onChange={e => setDonorName(e.target.value)} placeholder="Nama Anda" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 outline-none text-sm font-black shadow-sm focus:border-blue-400" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">WhatsApp/Kontak</label>
                          <input type="text" value={donorPhone} onChange={e => setDonorPhone(e.target.value)} placeholder="08xxxx" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 outline-none text-sm font-bold shadow-sm" />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Niat Qurban Diatasnamakan</label>
                        <div className="relative group">
                          <input 
                            type="text" 
                            value={isForParent ? 'Orang Tua Tercinta' : qurbanFor}
                            onChange={(e) => { if(!isForParent) setQurbanFor(e.target.value); }}
                            readOnly={isForParent}
                            placeholder="Contoh: Hamba Allah"
                            className={`w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 outline-none text-sm font-black shadow-sm transition-all ${isForParent ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300' : 'focus:border-blue-400'}`}
                          />
                          <Users className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                        </div>
                        <button type="button" onClick={() => setIsForParent(!isForParent)} className={`text-[10px] font-bold flex items-center gap-1.5 mt-1 transition-colors ${isForParent ? 'text-emerald-500' : 'text-slate-400 hover:text-emerald-500'}`}>
                          <Heart className={`w-3.5 h-3.5 ${isForParent ? 'fill-current' : ''}`} /> 
                          {isForParent ? 'Persembahan Mulia Untuk Orang Tua' : 'Pilih sebagai hadiah untuk Orang Tua'}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-2 p-1">
                        <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-[#1799dc] flex items-center justify-center text-[10px] font-black">2</div>
                        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Pilihan Qurban & Wilayah</h3>
                      </div>

                      {/* Animal Selection - More Compact */}
                      <div className="flex bg-slate-100/50 dark:bg-slate-900/50 p-1 rounded-2xl border border-slate-200 dark:border-slate-800">
                        {ANIMAL_TYPES.map(animal => (
                          <button 
                            type="button" 
                            key={animal.id}
                            onClick={() => {
                              setSelectedAnimal(animal.id);
                              const defaultProgram = QURBAN_PROGRAMS.find(p => p.type === animal.id && p.region === selectedRegion);
                              if (defaultProgram) setSelectedProgram(defaultProgram);
                            }}
                            className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all ${selectedAnimal === animal.id ? 'bg-white dark:bg-slate-800 text-[#1799dc] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                          >
                            <span className="text-xl mb-0.5">{animal.icon}</span>
                            <span className="text-[9px] font-black uppercase tracking-tight leading-none text-center">{animal.label}</span>
                          </button>
                        ))}
                      </div>

                      {/* Wilayah Penyaluran - Compact Selector */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Wilayah Penyaluran</label>
                        <div className="relative">
                          <div className="flex gap-2">
                            {/* Fast Region Switcher */}
                            <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
                               <button 
                                 type="button"
                                 onClick={() => {
                                   setSelectedRegion('pelosok');
                                   const defaultProg = QURBAN_PROGRAMS.find(p => p.type === selectedAnimal && p.region === 'pelosok');
                                   if (defaultProg) setSelectedProgram(defaultProg);
                                 }}
                                 className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${selectedRegion === 'pelosok' ? 'bg-white dark:bg-slate-800 text-[#1799dc] shadow-sm' : 'text-slate-400'}`}
                               >
                                 Lokal
                               </button>
                               <button 
                                 type="button"
                                 onClick={() => {
                                   setSelectedRegion('luar_negeri');
                                   const defaultProg = QURBAN_PROGRAMS.find(p => p.type === selectedAnimal && p.region === 'luar_negeri');
                                   if (defaultProg) setSelectedProgram(defaultProg);
                                 }}
                                 className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${selectedRegion === 'luar_negeri' ? 'bg-white dark:bg-slate-800 text-[#1799dc] shadow-sm' : 'text-slate-400'}`}
                               >
                                 Global
                               </button>
                            </div>

                            {/* Location Dropdown Trigger */}
                            <button 
                              type="button" 
                              onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
                              className="flex-1 flex items-center justify-between px-3 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:border-[#1799dc] transition-all group min-w-0"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <MapPin className="w-3.5 h-3.5 text-[#1799dc] shrink-0" />
                                <span className="text-xs font-black text-slate-800 dark:text-white truncate">{selectedProgram.location}</span>
                              </div>
                              <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isLocationDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>
                          </div>

                          <AnimatePresence>
                            {isLocationDropdownOpen && (
                              <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsLocationDropdownOpen(false)} />
                                <motion.div 
                                  initial={{ opacity: 0, y: 5 }} 
                                  animate={{ opacity: 1, y: 8 }} 
                                  exit={{ opacity: 0, y: 5 }} 
                                  className="absolute top-full left-0 right-0 z-50 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-2xl overflow-hidden max-h-[300px] overflow-y-auto"
                                >
                                  <div className="bg-slate-50 dark:bg-slate-900/80 px-4 py-2 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] sticky top-0 z-10 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                    <span>Pilih Titik Distribusi</span>
                                    <span className="text-[#1799dc]">{selectedRegion === 'pelosok' ? '📍 Pelosok' : '🌐 Global'}</span>
                                  </div>
                                  
                                  {QURBAN_PROGRAMS.filter(p => p.type === selectedAnimal && p.region === selectedRegion).map(prog => {
                                    const progress = (prog.filled / prog.quota) * 100;
                                    return (
                                      <div
                                        key={prog.id} 
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter' || e.key === ' ') {
                                            setSelectedProgram(prog); setIsLocationDropdownOpen(false);
                                          }
                                        }}
                                        onClick={() => { setSelectedProgram(prog); setIsLocationDropdownOpen(false); }} 
                                        className={`w-full p-3 text-left flex flex-col gap-2 hover:bg-slate-50 dark:hover:bg-slate-750 transition-all border-b last:border-0 border-slate-50 dark:border-slate-800 cursor-pointer ${selectedProgram.id === prog.id ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                                      >
                                        <div className="flex justify-between items-center">
                                          <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-[#1799dc] flex items-center justify-center text-sm">
                                               {prog.icon}
                                            </div>
                                            <div>
                                              <p className={`text-xs font-black truncate max-w-[120px] md:max-w-none ${selectedProgram.id === prog.id ? 'text-[#1799dc]' : 'text-slate-800 dark:text-white'}`}>{prog.title}</p>
                                              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{prog.location}</p>
                                            </div>
                                          </div>
                                          <div className="text-right flex flex-col items-end gap-1">
                                            <p className="text-xs font-black text-slate-900 dark:text-white">Rp {formatCurrencyForm(prog.price.toString())}</p>
                                            <button 
                                              type="button"
                                              onClick={(e) => { 
                                                e.stopPropagation(); 
                                                setSelectedProgram(prog); 
                                                setIsLocationDropdownOpen(false);
                                                setIsDetailModalOpen(true);
                                              }}
                                              className="text-[9px] font-bold text-blue-500 hover:text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md"
                                            >
                                              Lihat Detail
                                            </button>
                                          </div>
                                        </div>
                                        <div className="space-y-1">
                                          <div className="h-1 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                            <motion.div 
                                              initial={{ width: 0 }}
                                              animate={{ width: `${progress}%` }}
                                              className={`h-full rounded-full ${progress > 90 ? 'bg-red-500' : 'bg-[#1799dc]'}`} 
                                            />
                                          </div>
                                          <div className="flex justify-between text-[7px] font-black uppercase text-slate-400">
                                            <span>Sisa Kuota: {prog.quota - prog.filled}</span>
                                            <span className={progress > 90 ? 'text-red-500' : 'text-[#1799dc]'}>{Math.round(progress)}% Terisi</span>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </motion.div>
                              </>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      <button 
                        type="button" 
                        onClick={() => setIsDetailModalOpen(true)}
                        className="mt-3 w-full py-2 bg-blue-50/50 dark:bg-blue-900/10 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-[#1799dc] rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 border border-blue-100 dark:border-blue-900/50"
                      >
                         <Info className="w-3.5 h-3.5" /> Lihat Detail Program
                      </button>

                      {/* Puzzle Kebaikan Section for Sapi Patungan */}
                      <AnimatePresence mode="wait">
                        {selectedAnimal === 'sapi_1_7' && (
                          <motion.div 
                            key={`puzzle-sapi-${selectedProgram.id}`}
                            initial={{ opacity: 0, scale: 0.98, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            className="bg-white dark:bg-slate-900/80 p-5 rounded-[2rem] border border-blue-50 dark:border-blue-900/30 shadow-xl shadow-blue-500/10 relative mb-4 overflow-hidden"
                          >
                            {/* Ambient Light Effects */}
                            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-blue-50/50 dark:from-blue-900/20 to-transparent pointer-events-none" />
                            <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-100/30 dark:bg-blue-900/20 rounded-full blur-3xl pointer-events-none" />

                            <div className="flex items-center justify-between mb-5 md:mb-6 relative z-10">
                              <div className="flex items-center gap-3 md:gap-4">
                                <div className="relative">
                                  <motion.div 
                                    animate={{ 
                                      scale: [1, 1.15, 1],
                                      rotate: [0, 5, -5, 0]
                                    }}
                                    transition={{ duration: 4, repeat: Infinity }}
                                    className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-gradient-to-br from-blue-500 to-[#1799dc] flex items-center justify-center shadow-lg shadow-blue-500/30 text-white"
                                  >
                                    <Sparkles className="w-5 h-5" />
                                  </motion.div>
                                  <motion.div 
                                    animate={{ opacity: [0, 1, 0] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="absolute -top-1 -right-1 w-3 h-3 bg-orange-400 rounded-full border-2 border-white dark:border-slate-800 shadow-sm"
                                  />
                                </div>
                                <div className="text-left">
                                  <h3 className="text-sm md:text-base font-black uppercase tracking-tight text-slate-800 dark:text-white leading-tight">Mosaik Kebaikan</h3>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">1 dari 7 Bagian Sapi</p>
                                  </div>
                                </div>
                              </div>
                              <motion.div 
                                whileHover={{ scale: 1.05 }}
                                className="bg-orange-50 dark:bg-orange-950/40 px-3 py-1.5 rounded-xl border border-orange-100 dark:border-orange-900/30 flex flex-col items-end shadow-sm"
                              >
                                <span className="text-[8px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-[0.1em] leading-none mb-0.5">Potensi</span>
                                <span className="text-[10px] font-black text-slate-700 dark:text-slate-200 leading-none tracking-tight">Pahala Abadi</span>
                              </motion.div>
                            </div>

                            {/* Realistic Cow Assembly - High-Fidelity Jigsaw Style */}
                            <div className="relative aspect-[16/9] mb-6 bg-slate-50/50 dark:bg-slate-950/50 rounded-[2.5rem] border border-blue-50/30 dark:border-blue-900/20 flex items-center justify-center overflow-hidden group shadow-inner">
                              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(23,153,220,0.08)_0%,transparent_70%)]" />
                              
                              <motion.div 
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 1.2, ease: "circOut" }}
                                className="w-full h-full relative"
                              >
                                {/* High-Fidelity Jigsaw Cow Implementation */}
                                <div className="absolute inset-0 p-4">
                                  <svg viewBox="0 0 400 240" className="w-full h-full">
                                    <defs>
                                      {/* Define the main image pattern */}
                                      <pattern id="cowPattern" patternUnits="userSpaceOnUse" width="400" height="240">
                                        <image 
                                          href="https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&q=80&w=800" 
                                          x="0" y="0" width="400" height="240"
                                          preserveAspectRatio="xMidYMid slice"
                                        />
                                      </pattern>
                                      
                                      {/* Glow effect for the user's piece */}
                                      <filter id="pieceGlow" x="-20%" y="-20%" width="140%" height="140%">
                                        <feGaussianBlur stdDeviation="3" result="blur" />
                                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                      </filter>
                                    </defs>

                                    {/* Base Background Shadow */}
                                    <path 
                                      d="M80,120 C80,80 120,60 180,60 C240,60 300,40 340,60 C370,80 380,120 380,140 C380,180 340,200 300,200 L280,200 L285,220 L255,220 L250,200 L150,200 L145,220 L115,220 L120,200 C90,200 80,160 80,120 Z" 
                                      fill="#f1f5f9" 
                                      className="dark:fill-slate-800"
                                    />

                                    {/* Jigsaw Pieces Wrapper */}
                                    <motion.g
                                      animate={{ 
                                        scale: ((selectedProgram.filled % 7) || 7) === 7 ? [1, 1.02, 1] : 1,
                                      }}
                                      transition={{ 
                                        duration: 3, 
                                        repeat: ((selectedProgram.filled % 7) || 7) === 7 ? Infinity : 0,
                                        repeatType: "reverse" 
                                      }}
                                    >
                                      {[
                                        { id: 0, d: "M80,120 C80,80 120,60 150,60 L200,130 L100,150 Z", x: -60, y: -40, rot: -15, cx: 120, cy: 100 },
                                        { id: 1, d: "M150,60 C200,60 250,40 280,50 L300,120 L200,130 Z", x: 0, y: -70, rot: 5, cx: 200, cy: 80 },
                                        { id: 2, d: "M280,50 C310,45 340,60 340,60 L380,140 L300,120 Z", x: 60, y: -30, rot: 20, cx: 320, cy: 90 },
                                        { id: 3, d: "M100,150 L200,130 L250,200 L120,200 C90,200 80,180 100,150 Z", x: -40, y: 50, rot: -5, cx: 150, cy: 170 }, 
                                        { id: 4, d: "M200,130 L300,120 L280,200 L250,200 Z", x: 0, y: 0, rot: 0, cx: 250, cy: 150 }, 
                                        { id: 5, d: "M300,120 L380,140 C380,180 340,200 300,200 L280,200 Z", x: 50, y: 60, rot: 15, cx: 330, cy: 160 },
                                        { id: 6, d: "M145,220 L115,220 L120,200 L150,200 Z M285,220 L255,220 L250,200 L280,200 Z", x: 0, y: 40, rot: 0, cx: 200, cy: 210 }
                                      ].map((piece, i) => {
                                        const progressNumber = (selectedProgram.filled % 7) === 0 && selectedProgram.filled > 0 ? 7 : (selectedProgram.filled % 7);
                                        const isFilled = i < progressNumber;
                                        const isUserPiece = i === (progressNumber - 1);
                                        const isComplete = progressNumber === 7;

                                        return (
                                          <g key={`${piece.id}-${selectedProgram.id}`}>
                                            <motion.path
                                              d={piece.d}
                                              initial={{ 
                                                x: piece.x, 
                                                y: piece.y, 
                                                opacity: 0,
                                                scale: 0.8,
                                                rotate: piece.rot
                                              }}
                                              animate={{ 
                                                x: isFilled ? 0 : piece.x, 
                                                y: isFilled ? 0 : piece.y, 
                                                opacity: isFilled ? 1 : 0.15,
                                                scale: isFilled ? (isUserPiece ? [1, 1.05, 1] : 1) : 0.8,
                                                rotate: isFilled ? 0 : piece.rot,
                                                filter: isUserPiece && isFilled ? "url(#pieceGlow)" : "none",
                                              }}
                                              whileHover={isFilled ? { 
                                                scale: 1.05,
                                                transition: { duration: 0.3 }
                                              } : {}}
                                              transition={{ 
                                                type: "spring",
                                                damping: 12,
                                                stiffness: 100,
                                                delay: isFilled ? i * 0.12 : 0,
                                                scale: isUserPiece && isFilled ? {
                                                  duration: 2,
                                                  repeat: Infinity,
                                                  repeatType: "reverse"
                                                } : { type: "spring" }
                                              }}
                                              fill={isFilled ? "url(#cowPattern)" : "#cbd5e1"}
                                              stroke={isUserPiece && isFilled ? "#1799dc" : "white"}
                                              strokeWidth={isUserPiece && isFilled ? "2.5" : "1"}
                                              strokeLinejoin="round"
                                              className="transition-colors duration-500"
                                            />
                                            {/* Flash Overlay when completed */}
                                            {isComplete && (
                                              <motion.path
                                                d={piece.d}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: [0, 0.4, 0] }}
                                                transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
                                                fill="white"
                                                pointerEvents="none"
                                              />
                                            )}
                                          </g>
                                        );
                                      })}
                                    </motion.g>
                                  </svg>
                                </div>

                                {/* Floating Label for User's Part */}
                                <AnimatePresence>
                                  {((selectedProgram.filled % 7) !== 0 || selectedProgram.filled === 0) && (
                                    <motion.div
                                      key={`user-label-${selectedProgram.id}`}
                                      initial={{ scale: 0, opacity: 0, y: 10 }}
                                      animate={{ 
                                        scale: 1, 
                                        opacity: 1, 
                                        y: [0, -4, 0],
                                      }}
                                      exit={{ scale: 0.5, opacity: 0 }}
                                      transition={{ 
                                        delay: 1.2, 
                                        type: "spring",
                                        y: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
                                      }}
                                      className="absolute bottom-1/4 left-1/2 -translate-x-1/2 pointer-events-none z-30"
                                    >
                                      <div className="bg-blue-600/90 text-white text-[8px] font-black px-3 py-1.5 rounded-full shadow-lg shadow-blue-500/20 backdrop-blur-md flex items-center gap-1.5 border border-blue-400/50">
                                        <Sparkles className="w-2.5 h-2.5 text-blue-200" />
                                        BAGIAN ANDA
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>

                                {/* Full Cow Completion Badge - Minimal & Non-obstructive */}
                                <AnimatePresence>
                                  {(selectedProgram.filled % 7 === 0 && selectedProgram.filled > 0) && (
                                    <motion.div
                                      initial={{ opacity: 0, scale: 0.5, y: -20 }}
                                      animate={{ opacity: 1, scale: 1, y: 0 }}
                                      className="absolute top-4 right-4 z-40"
                                    >
                                      <div className="bg-emerald-500/90 backdrop-blur-md text-white px-3 py-1.5 rounded-full shadow-lg border border-emerald-400/50 flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                                          <CheckCircle2 className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-tight">Sapi Sempurna!</span>
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </motion.div>

                              {/* Live Progress Info Chip */}
                              <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 2.2 }}
                                className="absolute bottom-5 right-5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl px-4 py-3 rounded-2xl border border-blue-100/50 dark:border-blue-900/50 shadow-2xl flex flex-col items-center gap-1 min-w-[70px]"
                              >
                                <div className="p-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                                  <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <span className="text-sm font-black text-slate-800 dark:text-white leading-none">{(selectedProgram.filled % 7) === 0 && selectedProgram.filled > 0 ? 7 : (selectedProgram.filled % 7)}/7</span>
                                <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest">Sahabat</span>
                              </motion.div>

                              {/* Floating Aura for Location */}
                              <div className="absolute top-5 left-5">
                                <motion.div 
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 2.4 }}
                                  className="bg-slate-950/40 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 flex items-center gap-2"
                                >
                                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                  <span className="text-[9px] font-black text-white uppercase tracking-widest">{selectedProgram.location}</span>
                                </motion.div>
                              </div>
                            </div>

                            {/* Emotional Text & Prayers - Compact */}
                            <div className="space-y-5">
                              <div>
                                <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed text-center px-2">
                                  "Sedekah terbaik adalah yang paling <span className="text-[#1799dc] font-black underline decoration-blue-200 underline-offset-4 decoration-2">bermanfaat bagi sesama</span>." 
                                  <span className="text-[10px] mt-1.5 block text-slate-400 italic font-normal">Kepingan niat Anda di {selectedProgram.location} hadirkan senyum bahagia warga pelosok.</span>
                                </p>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <motion.div 
                                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(16, 185, 129, 0.08)' }}
                                  className="bg-emerald-50/40 dark:bg-emerald-950/10 p-3 rounded-2xl border border-emerald-100/50 dark:border-emerald-900/20 shadow-sm transition-all"
                                >
                                  <div className="flex items-center gap-2 mb-1">
                                    <div className="w-6 h-6 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm">
                                      <Heart className="w-3 h-3 text-emerald-500 fill-emerald-500" />
                                    </div>
                                    <p className="text-[8px] font-black text-emerald-600 uppercase tracking-tighter">Penerima Manfaat</p>
                                  </div>
                                  <p className="text-[10px] font-bold text-slate-700 dark:text-slate-200 line-clamp-1">{selectedProgram.location}</p>
                                </motion.div>
                                <motion.div 
                                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(59, 130, 246, 0.08)' }}
                                  className="bg-blue-50/40 dark:bg-blue-950/10 p-3 rounded-2xl border border-blue-100/50 dark:border-blue-900/20 shadow-sm transition-all"
                                >
                                  <div className="flex items-center gap-2 mb-1">
                                    <div className="w-6 h-6 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm">
                                      <Users className="w-3 h-3 text-blue-500" />
                                    </div>
                                    <p className="text-[8px] font-black text-blue-600 uppercase tracking-tighter">Solidaritas</p>
                                  </div>
                                  <p className="text-[10px] font-bold text-slate-700 dark:text-slate-200 line-clamp-1">Bersama {selectedProgram.filled % 7 || 6} Donatur Lain</p>
                                </motion.div>
                              </div>

                              {/* Progress bar compact */}
                              <div className="relative pt-1 px-1">
                                <div className="flex justify-between items-center mb-2">
                                  <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Puzzle Progress</span>
                                  </div>
                                  <span className="text-[10px] font-black text-[#1799dc]">{Math.round((((selectedProgram.filled % 7) || 4) / 7) * 100)}% Menyatu</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.round((((selectedProgram.filled % 7) || 4) / 7) * 100)}%` }}
                                    transition={{ duration: 2, ease: "circOut" }}
                                    className="h-full rounded-full bg-gradient-to-r from-blue-400 via-[#1799dc] to-emerald-400 shadow-inner relative" 
                                  >
                                    <motion.div 
                                      animate={{ x: ['-200%', '200%'] }}
                                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                                    />
                                  </motion.div>
                                </div>
                                <div className="mt-4 flex flex-wrap justify-center gap-4">
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Sahabat Lain</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.5)]" />
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Bagian Anda</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700" />
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Mari Lengkapi</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>


                      <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-xl border border-slate-100 dark:border-slate-800 shadow-inner mt-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Jumlah Qurban</label>
                        <div className="flex items-center gap-2 flex-1">
                          <button type="button" onClick={() => setQurbanQty(Math.max(1, qurbanQty - 1))} className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 font-black shadow-sm">-</button>
                          <div className="flex-1 text-center font-black text-slate-800 dark:text-white">{qurbanQty}</div>
                          <button type="button" onClick={() => setQurbanQty(qurbanQty + 1)} className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 font-black shadow-sm">+</button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Phase 2: Payment Prominent */}
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-[#1799dc] flex items-center justify-center text-[10px] font-black">3</div>
                        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Metode Pembayaran</h3>
                      </div>
                      <div className="relative max-w-[140px]">
                        <Search className="absolute left-2.5 top-2 w-3 h-3 text-slate-400" />
                        <input type="text" placeholder="Cari bank..." value={paymentSearchQuery} onChange={e => setPaymentSearchQuery(e.target.value)} className="w-full pl-7 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full text-[10px] font-bold outline-none focus:border-blue-400 transition-all shadow-sm" />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                      {PAYMENT_METHODS.filter(m => m.name.toLowerCase().includes(paymentSearchQuery.toLowerCase())).slice(0, 12).map(method => (
                        <button 
                          key={method.id} 
                          type="button" 
                          onClick={() => setPaymentMethod(method.id)}
                          className={`p-2 rounded-xl border flex flex-col items-center gap-1 group transition-all relative ${paymentMethod === method.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 ring-1 ring-blue-500/30 shadow-md' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-300'}`}
                        >
                          <div className={`w-11 h-7 flex items-center justify-center transition-all ${paymentMethod === method.id ? 'scale-110' : 'grayscale group-hover:grayscale-0'}`}>
                            <img src={method.icon} alt={method.name} className="max-w-full max-h-full object-contain" />
                          </div>
                          <span className={`text-[8px] font-black truncate max-w-full leading-none uppercase tracking-tighter ${paymentMethod === method.id ? 'text-blue-600 font-bold' : 'text-slate-400'}`}>{method.name}</span>
                          {paymentMethod === method.id && (
                            <div className="absolute top-0 right-0 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-800">
                               <div className="w-1 h-1 bg-white rounded-full" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Footer & Submit */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between px-2">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 text-blue-500 flex items-center justify-center shadow-lg border border-slate-100 dark:border-slate-700">
                            <Wallet className="w-6 h-6" />
                          </div>
                          <div className="text-left">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Donasi</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">Rp {formatCurrencyForm(calculateQurbanTotal().toString())}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Rincian Amanah</p>
                          <p className="text-xs font-black text-slate-700 dark:text-white px-2 py-1 bg-slate-100 dark:bg-slate-900 rounded-lg">
                            {qurbanQty} {selectedProgram.type === 'sapi_1_7' ? 'Bagian Sapi' : 'Ekor Kambing'}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (onAddToCart) {
                              onAddToCart(selectedProgram, calculateQurbanTotal().toString());
                              setIsDetailModalOpen(false);
                            }
                          }}
                          className="w-16 md:w-20 py-4 bg-white dark:bg-slate-800 border-2 border-[#1799dc] text-[#1799dc] hover:bg-blue-50 dark:hover:bg-blue-900/20 active:scale-[0.98] transition-all rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/10 hover:shadow-[#1799dc]/30"
                          title="Masukkan Kantung Kebaikan"
                        >
                          <ShoppingBag className="w-5 h-5 md:w-6 md:h-6" />
                        </button>
                        <button 
                          type="submit"
                          disabled={!paymentMethod || calculateQurbanTotal() === 0 || !donorName}
                          className="flex-1 py-4 bg-[#1799dc] hover:bg-[#1588c4] active:scale-[0.98] disabled:opacity-40 transition-all text-white rounded-2xl font-black text-base md:text-lg flex flex-col items-center justify-center shadow-xl shadow-blue-500/20 group"
                        >
                          <span className="flex items-center gap-2">Tunaikan Qurban Sekarang <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></span>
                          <span className="text-[10px] opacity-70 uppercase tracking-[0.3em] mt-0.5">Selesaikan Checkout Aman</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
          
          {pageTab === 'tabungan' && (
            <motion.div
              key="tabungan"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden"
            >
              <div className="p-6 md:p-10 lg:p-12">
                <div className="text-center mb-10">
                  <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-3">Mulai Tabungan Qurban</h2>
                  <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto text-sm md:text-base leading-relaxed">Persiapkan ibadah qurban Anda tahun depan lebih awal. Sisihkan sedikit demi sedikit melalui autodebet atau pengingat pintar, dan raih kemudahan berqurban tanpa beban berat.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                  <div className="space-y-6">
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                      <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4 border-b border-slate-200 dark:border-slate-700 pb-3">Simulasi Tabungan</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1 mb-1.5">Target Qurban</label>
                          <select 
                            value={tabunganTarget}
                            onChange={(e) => setTabunganTarget(Number(e.target.value))}
                            className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 outline-none text-sm font-bold shadow-sm focus:border-emerald-400 dark:text-white"
                          >
                            <option value={2500000}>Kambing (Satu Ekor) - Rp 2.500.000</option>
                            <option value={2100000}>Sapi (1/7 Bagian) - Rp 2.100.000</option>
                            <option value={18000000}>Sapi (Utuh) - Rp 18.000.000</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1 mb-1.5">Periode Tabungan (Bulan)</label>
                          <div className="flex bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-1">
                            {[3, 6, 9, 12].map(m => (
                              <button 
                                key={m} 
                                type="button" 
                                onClick={() => setTabunganMonths(m)}
                                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${m === tabunganMonths ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                              >
                                {m} Bln
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="pt-2">
                           <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 border border-emerald-100 dark:border-emerald-800/50 flex flex-col items-center justify-center text-center">
                             <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">Setoran Per Bulan</p>
                             <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300">Rp {formatCurrencyForm(Math.floor(tabunganTarget / tabunganMonths).toString())}</p>
                             <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 mt-1">~ Rp {formatCurrencyForm(Math.floor(tabunganTarget / tabunganMonths / 30).toString())} / hari</p>
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-4">
                       <h3 className="text-lg font-black text-slate-900 dark:text-white">Keuntungan Menabung Qurban</h3>
                       <ul className="space-y-3">
                         <li className="flex items-start gap-3">
                           <div className="mt-0.5 w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center shrink-0">
                             <Check className="w-3 h-3 font-bold" />
                           </div>
                           <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed"><strong className="text-slate-900 dark:text-white font-bold">Ringan dan Terencana.</strong> Sisihkan dana sedikit demi sedikit tanpa memberatkan pengeluaran saat Idul Adha.</p>
                         </li>
                         <li className="flex items-start gap-3">
                           <div className="mt-0.5 w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center shrink-0">
                             <Check className="w-3 h-3 font-bold" />
                           </div>
                           <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed"><strong className="text-slate-900 dark:text-white font-bold">Autodebet Pintar.</strong> Tersedia opsi autodebet harian, mingguan, atau bulanan langsung dari rekening atau e-wallet Anda.</p>
                         </li>
                         <li className="flex items-start gap-3">
                           <div className="mt-0.5 w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center shrink-0">
                             <Check className="w-3 h-3 font-bold" />
                           </div>
                           <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed"><strong className="text-slate-900 dark:text-white font-bold">Prioritas Hewan Terbaik.</strong> Nasabah tabungan qurban mendapatkan prioritas alokasi hewan terbaik jauh-jauh hari.</p>
                         </li>
                       </ul>
                    </div>

                    <button 
                      onClick={() => alert('Fitur Registrasi Tabungan Qurban segera hadir!')}
                      className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] transition-all text-white rounded-2xl font-black text-base flex flex-col items-center justify-center shadow-xl shadow-emerald-500/20 group mt-4"
                    >
                      <span className="flex items-center gap-2">Mulai Tabungan Sekarang <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {pageTab === 'lacak' && (
            <motion.div
              key="lacak"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden"
            >
              <div className="p-5 md:p-8 relative overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-blue-500/5 to-transparent rounded-full blur-3xl pointer-events-none -translate-y-1/2 -translate-x-1/2"></div>
                
                <div className="max-w-2xl mx-auto text-center relative z-10">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 text-[#1799dc] rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/10 border border-blue-100 dark:border-blue-800"
                  >
                    <MapIcon className="w-7 h-7" />
                  </motion.div>
                  
                  <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-1">
                    Menelusuri Amanah Anda
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mb-6 italic">Setiap langkah qurban Anda adalah perjalanan menuju keberkahan yang tiada putus.</p>
                  
                  <form onSubmit={handleSearch} className="relative mb-8 max-w-md mx-auto">
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Nama / No. Invoice..."
                      className="w-full pl-5 pr-[85px] py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full focus:ring-2 focus:ring-[#1799dc]/20 focus:border-[#1799dc] outline-none text-slate-800 dark:text-slate-200 font-medium text-sm shadow-inner"
                    />
                    <button 
                      type="submit"
                      disabled={searchStatus === 'loading'}
                      className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-[#1799dc] hover:bg-[#1588c4] text-white font-bold rounded-full transition-all flex items-center gap-2 shadow-lg shadow-[#1799dc]/20 text-xs"
                    >
                      {searchStatus === 'loading' ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Lacak'}
                    </button>
                  </form>
                </div>
 
                <AnimatePresence mode="wait">
                  {searchStatus === 'found' && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="max-w-xl mx-auto space-y-6"
                    >
                      <div className="bg-gradient-to-r from-[#1799dc]/5 to-transparent dark:from-[#1799dc]/10 dark:to-transparent border border-slate-100 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-4">
                        <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700 shrink-0">
                          <Heart className="w-6 h-6 text-red-500 fill-current" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Pequrban Terdaftar</p>
                          <h4 className="font-black text-slate-800 dark:text-white text-base md:text-lg leading-tight break-words">A/n {searchQuery}</h4>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                               <CheckCircle2 className="w-3 h-3" /> Qurban Sapi • Sebar Pelosok NTT
                            </p>
                            <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded">
                               <Milestone className="w-3 h-3" /> Berat Hewan: 280-320 Kg
                            </p>
                          </div>
                        </div>
                      </div>
 
                      <div className="relative space-y-0">
                        <div className="absolute top-5 bottom-10 left-[19px] w-[2px] bg-slate-100 dark:bg-slate-800 z-0">
                           <motion.div 
                             className="w-full bg-gradient-to-b from-[#1799dc] via-blue-300 to-[#1799dc] rounded-full" 
                             initial={{ height: '0%' }}
                             animate={{ 
                               height: `${Math.min(100, (journeyStep / (JOURNEY_STAGES.length - 1)) * 100)}%`,
                               backgroundPosition: ['0% 0%', '0% 200%']
                             }}
                             transition={{ 
                               height: { duration: 1.5, ease: "easeInOut" },
                               backgroundPosition: { duration: 3, repeat: Infinity, ease: "linear" }
                             }}
                             style={{ backgroundSize: '100% 200%' }}
                           />
                        </div>
                        
                        <div className="space-y-6">
                          {JOURNEY_STAGES.map((stage, idx) => {
                            const isCompleted = journeyStep > idx;
                            const isCurrent = journeyStep === idx;
                            const isUpcoming = journeyStep < idx;
                            const StageIcon = stage.icon;
                            
                            return (
                               <motion.div
                                 key={stage.id} 
                                 initial={{ opacity: 0, x: -10 }}
                                 animate={{ 
                                   opacity: isUpcoming ? 0.3 : 1, 
                                   x: 0,
                                   scale: isCurrent ? 1.02 : 1
                                 }}
                                 transition={{ 
                                    duration: 0.8, 
                                    delay: 0.1,
                                    ease: "easeOut"
                                 }}
                                 className={`relative flex gap-4 transition-all duration-1000`}
                               >
                                  <div className="relative z-10 shrink-0">
                                    <motion.div 
                                      initial={false}
                                      animate={{ 
                                        backgroundColor: isUpcoming ? 'rgba(255,255,255,0)' : (isCompleted ? '#10b981' : '#1799dc'),
                                        borderColor: isUpcoming ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? '#1e293b' : '#f1f5f9') : (isCompleted ? '#10b981' : '#1799dc'),
                                        scale: isCurrent ? 1.15 : 1
                                      }}
                                      className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 shadow-sm transition-all duration-1000
                                      ${isUpcoming ? 'bg-white dark:bg-slate-950 text-slate-200 dark:text-slate-800' : 'text-white shadow-lg shadow-blue-500/20'}`}
                                    >
                                      {isCompleted ? <Check className="w-5 h-5 transition-transform duration-500 scale-110" /> : <StageIcon className={`w-4 h-4 transition-colors duration-700 ${(isUpcoming) ? 'text-slate-200 dark:text-slate-800' : 'text-white'}`} />}
                                    </motion.div>
                                    {isCurrent && (
                                       <motion.div 
                                         layoutId="active-glow"
                                         className="absolute -inset-3 rounded-2xl bg-[#1799dc]/10 z-[-1]"
                                         initial={{ scale: 0.8, opacity: 0 }}
                                         animate={{ 
                                           scale: [1, 1.2, 1],
                                           opacity: [0.5, 0.2, 0.5] 
                                         }}
                                         transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                       />
                                    )}
                                  </div>
                                  
                                  <div className="flex-1 min-w-0 pt-0.5">
                                     <div className="flex items-center gap-2 mb-0.5">
                                        <h5 className={`font-black text-[12px] md:text-sm tracking-tight transition-colors duration-1000 leading-tight ${isCurrent ? 'text-[#1799dc]' : (isUpcoming ? 'text-slate-400 dark:text-slate-700' : 'text-emerald-500 font-bold')}`}>
                                          {stage.title}
                                        </h5>
                                        {isCurrent && (
                                           <span className="flex h-1.5 w-1.5 rounded-full bg-[#1799dc] animate-pulse" />
                                        )}
                                        {isCompleted && (
                                           <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                        )}
                                     </div>
                                     <AnimatePresence mode="wait">
                                        {(isCurrent || isCompleted) && (
                                          <motion.div 
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            transition={{ duration: 0.8, ease: "easeOut" }}
                                            className="overflow-hidden"
                                          >
                                            <p className={`text-[10px] md:text-[11px] leading-relaxed font-medium italic ${isUpcoming ? 'text-slate-300 dark:text-slate-800' : (isCompleted ? 'text-emerald-600/70 dark:text-emerald-400/70' : 'text-slate-500 dark:text-slate-400')}`}>
                                                {stage.desc.replace(/Anda/g, searchQuery).replace(/anda/g, searchQuery)}
                                                {stage.id === 'laporan' && (isCurrent || isCompleted) && (
                                                  <motion.span 
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="block mt-1.5 not-italic font-black text-[#1799dc] text-[9px] md:text-[10px] bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1 rounded-lg inline-flex items-center gap-1.5 border border-blue-100/50 dark:border-blue-800/30"
                                                  >
                                                    <MapPin className="w-3 h-3 text-red-500 animate-bounce" /> {stage.detailedLocation}
                                                  </motion.span>
                                                )}
                                            </p>
                                          </motion.div>
                                        )}
                                     </AnimatePresence>
                                  </div>
                               </motion.div>
                            );
                          })}
                        </div>
                      </div>
 
                      {journeyStep >= JOURNEY_STAGES.length - 1 && (
                         <motion.div
                           initial={{ opacity: 0, y: 10 }}
                           animate={{ opacity: 1, y: 0 }}
                           className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800 p-4 rounded-2xl flex items-center gap-3"
                         >
                            <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center text-emerald-500 shadow-sm shrink-0">
                               <HeartHandshake className="w-5 h-5" />
                            </div>
                            <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 leading-tight">
                               Tugas mulia {searchQuery} telah tuntas. Senyum mereka adalah saksi bisu kebaikan {searchQuery} di hari perhitungan kelak. Jazakumullahu Khairan.
                            </p>
                         </motion.div>
                      )}
                    </motion.div>
                  )}
 
                  {searchStatus === 'idle' && (
                    <div className="py-10 px-6 bg-slate-50/50 dark:bg-slate-900/30 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-800 text-center max-w-sm mx-auto">
                      <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300 dark:text-slate-600 shadow-sm">
                         <Search className="w-6 h-6" />
                      </div>
                      <p className="text-slate-400 dark:text-slate-500 text-[11px] font-medium italic">
                        "Setiap amanah punya ceritanya sendiri. Cari nama Anda untuk melihat bagaimana qurban Anda membawa bahagia."
                      </p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {pageTab === 'dampak' && (
            <motion.div
              key="dampak"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden"
            >
              <div className="p-5 md:p-8 relative overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#1799dc]/10 to-transparent rounded-full blur-3xl mix-blend-multiply dark:mix-blend-lighten pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
                
                <div className="max-w-3xl mx-auto text-center relative z-10">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/10 border border-emerald-100 dark:border-emerald-800"
                  >
                    <Heart className="w-7 h-7 fill-current" />
                  </motion.div>
                  
                  <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-1">
                    Jejak Cinta & Kebaikan
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mb-4">Penasaran dengan senyum yang Anda ukir? Masukkan nama untuk menelusurinya.</p>
                  
                  {/* Year Selection */}
                  <div className="flex justify-center gap-2 mb-6">
                    {AVAILABLE_YEARS.map(year => (
                      <button
                        key={year}
                        onClick={() => setSelectedImpactYear(year)}
                        className={`px-4 py-1.5 rounded-full text-[10px] font-bold transition-all border ${selectedImpactYear === year ? 'bg-[#1799dc] text-white border-[#1799dc] shadow-md shadow-[#1799dc]/20' : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-800 hover:border-blue-300'}`}
                      >
                        {year}
                      </button>
                    ))}
                  </div>

                  <form onSubmit={handleImpactSearch} className="relative mb-8 max-w-md mx-auto">
                    <input 
                      type="text" 
                      value={impactSearchQuery}
                      onChange={(e) => setImpactSearchQuery(e.target.value)}
                      placeholder="Cari Nama Pequrban..."
                      className="w-full pl-5 pr-[85px] py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full focus:ring-2 focus:ring-[#1799dc]/20 focus:border-[#1799dc] outline-none text-slate-800 dark:text-slate-200 font-medium text-sm shadow-inner"
                    />
                    <button 
                      type="submit"
                      disabled={impactSearchStatus === 'loading'}
                      className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-[#1799dc] hover:bg-[#1588c4] text-white font-bold rounded-full transition-all flex items-center gap-2 shadow-lg shadow-[#1799dc]/20 text-xs"
                    >
                      {impactSearchStatus === 'loading' ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Search className="w-3 h-3" /> Cek Dampak</>}
                    </button>
                  </form>

                  <AnimatePresence mode="wait">
                    {impactSearchStatus === 'found' && impactData && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="space-y-5 text-left"
                      >
                        <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-900/50 dark:to-slate-900 rounded-[2rem] p-5 md:p-7 border border-slate-100 dark:border-slate-800 shadow-xl relative overflow-hidden">
                           <div className="absolute -top-10 -right-10 p-4 opacity-[0.03] pointer-events-none">
                             <Milestone className="w-48 h-48 text-[#1799dc]" />
                           </div>
                           
                           <div className="relative z-10">
                             <div className="flex flex-wrap items-center gap-2 mb-3">
                               <span className="px-2.5 py-0.5 bg-[#1799dc]/10 text-[#1799dc] text-[9px] font-black rounded-full uppercase tracking-wider">Arsip Qurban {impactData.year}</span>
                               <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-black rounded-full uppercase tracking-wider flex items-center gap-1">
                                 <CheckCircle2 className="w-2.5 h-2.5" /> Amanah Tertunaikan
                               </span>
                             </div>
                             
                             <h3 className="text-lg md:text-xl font-black text-slate-800 dark:text-white mb-3 leading-tight">
                               "Alhamdulillah, Bapak/Ibu {impactData.name}. Qurban Anda telah menyentuh relung hati terdalam mereka."
                             </h3>
                             
                             <div className="flex gap-4 mb-4 p-3 bg-white/50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                                <div className="flex-1 text-center border-r border-slate-100 dark:border-slate-700/50">
                                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Membantu</p>
                                   <p className="text-xl font-black text-[#1799dc]">{impactData.familiesHelped}+ <span className="text-[10px] text-slate-400 font-bold">Keluarga</span></p>
                                </div>
                                <div className="flex-1 text-center">
                                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Membahagiakan</p>
                                   <p className="text-xl font-black text-pink-500">{impactData.childrenHelped}+ <span className="text-[10px] text-slate-400 font-bold">Anak</span></p>
                                </div>
                             </div>

                             <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium italic mb-5 pl-3 border-l-2 border-emerald-400">
                               "{impactData.description}"
                             </p>
                             
                             <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4">
                               <div className="bg-white/40 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50 flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-[#1799dc] shrink-0">
                                   <MapIcon className="w-4 h-4" />
                                 </div>
                                 <div className="min-w-0">
                                   <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Kabupaten</p>
                                   <p className="text-[11px] font-black text-slate-700 dark:text-slate-300 whitespace-normal leading-tight">{impactData.location}</p>
                                 </div>
                               </div>
                               <div className="bg-white/40 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50 flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-500 shrink-0">
                                   <MapPin className="w-4 h-4" />
                                 </div>
                                 <div className="min-w-0">
                                   <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Titik Desa</p>
                                   <p className="text-[11px] font-black text-slate-700 dark:text-slate-300 whitespace-normal leading-tight">{impactData.village}</p>
                                 </div>
                               </div>
                               <div className="bg-white/40 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50 flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-500 shrink-0">
                                   <CheckCircle2 className="w-4 h-4" />
                                 </div>
                                 <div className="min-w-0">
                                   <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Berat Hewan</p>
                                   <p className="text-[11px] font-black text-slate-700 dark:text-slate-300 whitespace-normal leading-tight">{impactData.totalKg}</p>
                                 </div>
                               </div>
                               <div className="bg-white/40 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50 flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-500 shrink-0">
                                   <Tent className="w-4 h-4" />
                                 </div>
                                 <div className="min-w-0">
                                   <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Program</p>
                                   <p className="text-[11px] font-black text-slate-700 dark:text-slate-300 whitespace-normal leading-tight">{impactData.program}</p>
                                 </div>
                               </div>
                             </div>
                             
                             <div className="bg-white/40 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                                  <Users className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Disalurkan Melalui</p>
                                  <p className="text-[11px] font-black text-slate-700 dark:text-slate-300">{impactData.distributor}</p>
                                </div>
                             </div>
                           </div>
                        </div>

                        {/* Coordinate Map Section */}
                        <div className="space-y-2">
                           <div className="flex items-center justify-between px-1">
                             <h4 className="text-[10px] font-black text-slate-500 dark:text-slate-400 flex items-center gap-1.5 uppercase tracking-[0.2em]">
                               <MapPin className="w-3 h-3 text-red-500" /> Lokasi Distribusi
                             </h4>
                             <span className="text-[8px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{impactData.coordinates[0].toFixed(4)}, {impactData.coordinates[1].toFixed(4)}</span>
                           </div>
                           
                           <div className="h-[180px] md:h-[220px] w-full rounded-2xl overflow-hidden shadow-lg border-2 border-white dark:border-slate-700 relative z-0">
                             <MapContainer 
                               center={impactData.coordinates} 
                               zoom={10} 
                               style={{ height: '100%', width: '100%' }}
                               scrollWheelZoom={false}
                             >
                               <TileLayer
                                 url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                 attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                               />
                               <Marker position={impactData.coordinates}>
                                 <Popup>
                                   <div className="text-center p-1">
                                     <p className="font-bold text-[10px]">{impactData.location}</p>
                                     <p className="text-[8px] text-slate-500 italic">"Terima kasih atas qurbannya!"</p>
                                   </div>
                                 </Popup>
                               </Marker>
                             </MapContainer>
                           </div>
                        </div>
                        
                        <button 
                          onClick={() => {
                              setPageTab('tunaikan');
                              window.scrollTo({ top: 100, behavior: 'smooth' });
                          }}
                          className="w-full px-6 py-3.5 bg-gradient-to-r from-[#1799dc] to-[#1588c4] hover:to-[#1799dc] text-white font-black rounded-2xl transition-all duration-300 shadow-xl shadow-[#1799dc]/20 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] text-sm"
                        >
                          Lanjutkan Kebaikan Anda Tahun Ini <ArrowRight className="w-4 h-4" />
                        </button>
                      </motion.div>
                    )}

                    {impactSearchStatus === 'idle' && (
                      <div className="py-8 px-5 bg-slate-50/50 dark:bg-slate-900/30 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                        <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300 dark:text-slate-600 shadow-sm">
                           <MapIcon className="w-6 h-6" />
                        </div>
                        <p className="text-slate-400 dark:text-slate-500 text-[11px] font-medium italic max-w-sm mx-auto">
                          "Daging qurban yang Anda titipkan telah berubah menjadi butiran energi bagi mereka yang merindu. Mari telusuri jejak senyum tersebut."
                        </p>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Journey Info Section */}
        <div className="mt-24">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-4">Bagaimana Qurban Anda Diproses?</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-sm md:text-base">Mulai dari pemilihan hewan yang sesuai syariat hingga laporan pendistribusian transparan untuk Anda.</p>
          </div>
          
          <div className="relative">
             {/* Connecting Horizontal Line Background */}
             <div className="absolute top-[28px] md:top-[34px] left-[12.5%] right-[12.5%] h-[4px] bg-slate-200 dark:bg-slate-700 z-0 overflow-hidden rounded-full">
               <motion.div 
                 className="h-full bg-gradient-to-r from-[#1799dc] to-blue-400" 
                 initial={{ width: '0%' }}
                 animate={{ width: `${(globalJourneyStep / (JOURNEY_STAGES.length - 1)) * 100}%` }}
                 transition={{ type: "spring", stiffness: 50, damping: 15 }}
               />
             </div>
             
             <div className="flex justify-between relative z-10 w-full mb-12">
               {JOURNEY_STAGES.map((stage, idx) => {
                 const isCompleted = globalJourneyStep >= idx;
                 const isCurrent = globalJourneyStep === idx;
                 const StageIcon = stage.icon;

                 return (
                   <div key={stage.id} className="flex flex-col items-center gap-4 w-1/4 relative group">
                       <motion.div 
                         initial={false}
                         animate={{ 
                           scale: isCurrent ? 1.15 : (isCompleted ? 1 : 0.95),
                           backgroundColor: isCompleted ? '#1799dc' : '#ffffff',
                           borderColor: isCompleted ? '#1799dc' : '#e2e8f0',
                         }}
                         transition={{ type: "spring", stiffness: 200, damping: 20 }}
                         className={`w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center shrink-0 border-[3px] md:border-[4px] z-10 relative
                           ${!isCompleted ? 'dark:bg-slate-800 dark:border-slate-700' : 'shadow-lg shadow-[#1799dc]/20'}`}
                       >
                         {isCompleted ? (
                           <StageIcon className="w-5 h-5 md:w-7 md:h-7 text-white" />
                         ) : (
                           <StageIcon className="w-5 h-5 md:w-7 md:h-7 text-slate-300 dark:text-slate-500" />
                         )}
                       </motion.div>
                       
                       <div className="text-center transition-all duration-300 transform w-full px-1" style={{ opacity: isCurrent ? 1 : 0.7 }}>
                         <div className={`text-[9px] sm:text-xs font-bold mb-0.5 md:mb-1 ${isCompleted ? 'text-[#1799dc]' : 'text-slate-400'}`}>Tahap {idx + 1}</div>
                         <h4 className={`font-bold text-[10px] sm:text-sm md:text-base mb-1 md:mb-2 leading-tight ${isCurrent ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>{stage.title}</h4>
                         <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 hidden md:block max-w-[150px] mx-auto leading-relaxed">
                           {stage.desc}
                         </p>
                       </div>
                   </div>
                 );
               })}
             </div>
          </div>
        </div>

      </div>

      {/* Checkout Selection Modal */}
      <AnimatePresence>
        {isCheckoutModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCheckoutModalOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 transition-all"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] md:w-[500px] bg-white dark:bg-slate-900 rounded-3xl z-50 overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-4 md:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 z-10">
                <div>
                  <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white">Rincian Amanah Anda</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Selesaikan & Sempurnakan</p>
                </div>
                <button 
                  onClick={() => setIsCheckoutModalOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                
                {/* User Info */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/30 space-y-3">
                  <div>
                    <h4 className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" /> Pequrban
                    </h4>
                    <p className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                      {isForParent ? 'Orang Tua Tercinta' : (qurbanFor || donorName || 'Hamba Allah')}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-blue-200/50 dark:border-blue-800/50 flex justify-between items-center">
                    <div>
                      <p className="text-[9px] font-black uppercase text-blue-600/70 dark:text-blue-400/70 tracking-wider mb-0.5">Donatur / Kontak</p>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{donorName || 'Hamba Allah'}</p>
                    </div>
                    {donorPhone && <p className="text-xs text-slate-500 font-medium">{donorPhone}</p>}
                  </div>
                </div>

                {/* Main Qurban Info */}
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-emerald-500" /> Item Qurban
                  </h4>
                  <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-50/30 dark:from-emerald-900/10 dark:to-teal-900/5 p-4 rounded-xl border border-emerald-100/50 dark:border-emerald-800/30 shadow-sm flex items-center gap-3">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Scale className="w-16 h-16 text-emerald-600" />
                    </div>
                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 shrink-0 border border-emerald-200 dark:border-emerald-800/50">
                      {selectedProgram.icon}
                    </div>
                    <div className="flex-1 min-w-0 relative z-10">
                      <p className="text-sm font-black text-slate-900 dark:text-white mb-0.5 line-clamp-1">{selectedProgram.title}</p>
                      <p className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-500"/> {selectedProgram.location} &bull; {qurbanQty} {selectedProgram.type === 'sapi_1_7' ? 'Bagian' : 'Ekor'}
                      </p>
                    </div>
                    <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 relative z-10 whitespace-nowrap">Rp {formatCurrencyForm(calculateQurbanTotal().toString())}</p>
                  </div>
                </div>

                {/* Additional Programs (Upsell) */}
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-rose-500" /> Sempurnakan Sedekah Anda
                  </h4>
                  <p className="text-[10px] text-slate-500 mb-3 italic">Pilih program kebaikan tambahan untuk disalurkan bersamaan.</p>
                  
                  <div className="space-y-3">
                    {[
                      { id: 'infaq_beras', name: 'Infaq Beras Santri', defaultPrice: 50000, img: 'https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?auto=format&fit=crop&w=200&q=80', desc: 'Peduli gizi santri pelosok' },
                      { id: 'sedekah_makan', name: 'Sedekah Makan Yatim', defaultPrice: 25000, img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=200&q=80', desc: 'Bahagia dengan sekotak nasi' },
                      { id: 'operasional', name: 'Infaq Dakwah', defaultPrice: 10000, img: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&w=200&q=80', desc: 'Dukung da\'i ke pedalaman' }
                    ].map(prog => {
                      const extraProg = extraPrograms.find(ep => ep.id === prog.id);
                      const isSelected = !!extraProg;
                      const currentPrice = isSelected ? extraProg.price : prog.defaultPrice;

                      return (
                        <div 
                          key={prog.id}
                          className={`relative overflow-hidden rounded-2xl border transition-all ${
                            isSelected 
                              ? 'bg-blue-50/50 dark:bg-blue-900/10 border-[#1799dc] ring-1 ring-[#1799dc]/20' 
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                          }`}
                        >
                          <div 
                            className="flex items-center gap-3 p-3 cursor-pointer"
                            onClick={() => {
                              if (isSelected) {
                                setExtraPrograms(prev => prev.filter(ep => ep.id !== prog.id));
                              } else {
                                setExtraPrograms(prev => [...prev, { id: prog.id, price: prog.defaultPrice }]);
                              }
                            }}
                          >
                            <div className="w-14 h-14 shrink-0 rounded-xl overflow-hidden relative">
                              <img src={prog.img} alt={prog.name} className="w-full h-full object-cover" />
                              <div className={`absolute inset-0 flex items-center justify-center transition-colors ${isSelected ? 'bg-[#1799dc]/80' : 'bg-black/20 group-hover:bg-black/10'}`}>
                                {isSelected ? <Check className="w-6 h-6 text-white drop-shadow-sm" /> : <div className="w-5 h-5 rounded-full border-2 border-white/80" />}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-black truncate mb-0.5 ${isSelected ? 'text-[#1799dc]' : 'text-slate-800 dark:text-slate-200'}`}>{prog.name}</p>
                              <p className="text-[10px] text-slate-500 font-medium truncate mb-1">{prog.desc}</p>
                              <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Rp {formatCurrencyForm(currentPrice.toString())}</p>
                            </div>
                          </div>

                          {/* Editable Amount if Active */}
                          {isSelected && (
                            <div className="px-3 pb-3 pt-1 border-t border-blue-100 dark:border-blue-900/30 bg-blue-50/50 dark:bg-transparent">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Nominal Khusus: Rp</span>
                                <input 
                                  type="number"
                                  value={currentPrice || ''}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value) || 0;
                                    setExtraPrograms(prev => prev.map(p => p.id === prog.id ? { ...p, price: val } : p));
                                  }}
                                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-black text-slate-900 dark:text-white outline-none focus:border-[#1799dc] focus:ring-1 focus:ring-[#1799dc]"
                                  placeholder="0"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

              </div>
              
              {/* Footer */}
              <div className="p-4 md:p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 rounded-b-3xl">
                <div className="flex justify-between items-end gap-4 mb-4">
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-0.5">Total Keseluruhan</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">Rp {formatCurrencyForm(calculateGrandTotal().toString())}</p>
                  </div>
                </div>
                <button 
                  onClick={handleFinalCheckout}
                  className="w-full py-4 bg-[#1799dc] hover:bg-[#1588c4] active:scale-[0.98] transition-all text-white rounded-2xl font-black text-base shadow-xl shadow-blue-500/20 flex flex-col justify-center items-center gap-0.5 group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                  <span className="flex items-center gap-2 relative z-10">
                    Bismillah, Sempurnakan Niat Baik Ini <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <span className="text-[10px] font-medium opacity-80 relative z-10 normal-case tracking-normal">Semoga Allah menerima amal ibadah Anda</span>
                </button>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Payment Instruction Modal */}
      <AnimatePresence>
        {isPaymentInstructionModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 transition-all"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] md:w-[400px] bg-white dark:bg-slate-900 rounded-3xl z-50 overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]"
            >
              <div className="p-6 text-center space-y-6 overflow-y-auto">
                <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mx-auto mb-2 border border-blue-100 dark:border-blue-800/30">
                  <Wallet className="w-8 h-8 text-[#1799dc]" />
                </div>
                
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Selesaikan Pembayaran</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Silakan transfer tepat sesuai nominal berikut ke metode pembayaran yang Anda pilih.
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 space-y-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Pembayaran</p>
                    <p className="text-2xl font-black text-[#1799dc]">Rp {formatCurrencyForm(calculateGrandTotal().toString())}</p>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Menunggu Pembayaran Via</p>
                    <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div className="w-12 h-8 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded">
                        {(() => {
                           const method = PAYMENT_METHODS.find(m => m.id === paymentMethod);
                           return method ? <img src={method.icon} alt={method.name} className="max-h-full max-w-full object-contain p-1" /> : <Wallet className="w-5 h-5 text-slate-400" />
                        })()}
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        {paymentMethod.includes('qris') ? (
                           <p className="text-sm font-black text-slate-900 dark:text-white truncate">QRIS</p>
                        ) : paymentMethod.includes('dana') || paymentMethod.includes('linkaja') ? (
                           <p className="text-sm font-black text-slate-900 dark:text-white truncate">{PAYMENT_METHODS.find(m => m.id === paymentMethod)?.name || paymentMethod}</p>
                        ) : (
                           <>
                             <p className="text-sm font-black text-slate-900 dark:text-white truncate space-x-2">
                               <span className="font-mono">8273 4910 2381</span>
                             </p>
                             <p className="text-[10px] text-slate-500 font-medium truncate">{PAYMENT_METHODS.find(m => m.id === paymentMethod)?.name || paymentMethod}</p>
                           </>
                        )}
                      </div>
                      {!paymentMethod.includes('qris') && (
                        <button className="text-[#1799dc] p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                          <Copy className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Cara Pembayaran */}
                <div className="text-left mt-6">
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-[#1799dc]" /> Cara Pembayaran
                  </h4>
                  <div className="space-y-3">
                    {paymentMethod.includes('qris') ? (
                      <ol className="list-decimal pl-4 space-y-1.5 text-[11px] font-medium text-slate-600 dark:text-slate-400">
                        <li>Buka aplikasi m-banking atau e-wallet Anda.</li>
                        <li>Pilih menu <strong>Scan QR</strong>.</li>
                        <li>Arahkan kamera ke kode QRIS, atau upload gambar QR dari galeri.</li>
                        <li>Periksa detail pembayaran: Pastikan nama <strong>LAZNAS DEWAN DA'WAH</strong> dan nominal sesuai.</li>
                        <li>Masukkan PIN untuk menyelesaikan pembayaran.</li>
                      </ol>
                    ) : paymentMethod.includes('dana') || paymentMethod.includes('linkaja') ? (
                      <ol className="list-decimal pl-4 space-y-1.5 text-[11px] font-medium text-slate-600 dark:text-slate-400">
                        <li>Buka aplikasi e-wallet Anda.</li>
                        <li>Pilih menu <strong>Bayar/Pay</strong>.</li>
                        <li>Masukkan nomor tujuan atau scan kode bayar.</li>
                        <li>Akan muncul konfirmasi pembayaran sejumlah <strong>Rp {formatCurrencyForm(calculateGrandTotal().toString())}</strong>.</li>
                        <li>Masukkan PIN e-wallet Anda untuk konfirmasi.</li>
                      </ol>
                    ) : (
                      <ol className="list-decimal pl-4 space-y-1.5 text-[11px] font-medium text-slate-600 dark:text-slate-400">
                        <li>Buka aplikasi m-banking atau ATM bank Anda.</li>
                        <li>Pilih menu <strong>Transfer &gt; Virtual Account</strong>.</li>
                        <li>Masukkan nomor Virtual Account: <strong className="font-mono">8273 4910 2381</strong>.</li>
                        <li>Akan muncul konfirmasi pembayaran sejumlah <strong>Rp {formatCurrencyForm(calculateGrandTotal().toString())}</strong>.</li>
                        <li>Masukkan PIN/Password untuk menyelesaikan pembayaran.</li>
                      </ol>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button 
                    onClick={handleCompletePayment}
                    className="w-full py-4 bg-[#1799dc] hover:bg-[#1588c4] active:scale-[0.98] transition-all text-white rounded-2xl font-black text-base shadow-xl shadow-blue-500/20"
                  >
                    Saya Sudah Transfer
                  </button>
                  <button 
                    onClick={() => {
                      setIsPaymentInstructionModalOpen(false);
                      setIsCheckoutModalOpen(true);
                    }}
                    className="w-full py-3 mt-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-bold text-sm transition-colors"
                  >
                    Ubah Metode Pembayaran
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Success Modal & Toast */}
      <AnimatePresence>
        {isSuccessModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm pointer-events-auto"
              onClick={handleCloseSuccess}
            />

            <Confetti
              width={window.innerWidth}
              height={window.innerHeight}
              recycle={false}
              numberOfPieces={400}
              gravity={0.15}
              className="!pointer-events-none z-50"
            />

            {/* Top Toast Notification */}
            <motion.div
              initial={{ opacity: 0, y: -100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -100 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="fixed top-4 left-4 right-4 sm:left-auto sm:right-auto sm:w-[400px] z-50 pointer-events-auto"
            >
              <div className="bg-emerald-500 rounded-2xl p-4 flex items-start gap-4 shadow-xl shadow-emerald-500/20">
                <div className="w-6 h-6 shrink-0 bg-white/20 rounded-full flex items-center justify-center mt-0.5">
                  <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                </div>
                <div className="flex-1 text-white">
                  <h4 className="font-bold text-sm tracking-wide">Diterima!</h4>
                  <p className="text-xs font-medium opacity-90 mt-0.5">Jazakumullah Khairan Katsiran.</p>
                </div>
                <button onClick={handleCloseSuccess} className="opacity-80 hover:opacity-100 transition-opacity">
                   <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </motion.div>

            {/* Main Modal */}
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300, delay: 0.1 }}
              className="relative w-full sm:w-[500px] bg-white dark:bg-slate-900 rounded-t-[32px] sm:rounded-[32px] overflow-hidden flex flex-col pointer-events-auto shadow-2xl max-h-[92vh]"
            >
              <div className="flex-1 overflow-y-auto w-full pb-4 pt-6 px-5 sm:px-8">
                
                {/* Animated Checkmark Circle */}
                <div className="flex items-center justify-center mx-auto mb-4">
                  <div className="relative w-20 h-20 flex items-center justify-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ ease: "linear", duration: 10, repeat: Infinity }}
                      className="absolute inset-0 rounded-full border-2 border-dashed border-emerald-400/50"
                    />
                    <div className="absolute top-0 right-0 -mr-1 -mt-1 text-amber-400">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Sparkles className="w-4 h-4 fill-amber-400" />
                      </motion.div>
                    </div>
                    <div className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
                      >
                        <Check className="w-7 h-7 text-white stroke-[3.5]" />
                      </motion.div>
                    </div>
                  </div>
                </div>

                <div className="text-center mb-4 space-y-1">
                  <h2 className="text-xl sm:text-2xl font-black text-emerald-600">Alhamdulillah!</h2>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">Jazakumullah Khairan {donorName || 'Sahabat Baik'}</h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed italic max-w-sm mx-auto mt-2">
                    "Terima kasih telah menitipkan pelita harapan. Ketulusan Sahabat hari ini adalah aliran kebahagiaan bagi mereka yang menanti, dan semoga menjadi doa-doa yang melangit."
                  </p>
                </div>

                <div className="text-center bg-emerald-50/50 dark:bg-emerald-900/10 py-3 px-4 rounded-xl border border-emerald-100 dark:border-emerald-900/30 text-[10px] font-medium text-emerald-700 dark:text-emerald-400 italic mb-4 shadow-sm">
                  "{isForParent ? 'Doa untuk orang tua: Ya Allah, ampunilah dosa mereka, sayangilah mereka sebagaimana mereka menyayangiku di waktu kecil.' : 'Sedekah itu memadamkan panasnya kubur bagi pelakunya, dan setiap mukmin akan bernaung di bawah naungan sedekahnya pada hari kiamat.'} <br className="hidden sm:block" /> (HR. Thabrani)"
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden mb-4">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />
                  <div className="flex justify-between items-center mb-1 pl-2.5">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Nominal Donasi</p>
                    <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[8px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="w-3 h-3" /> Berhasil
                    </span>
                  </div>
                  <div className="text-left pl-2.5 mb-3">
                    <p className="text-2xl font-black text-slate-900 dark:text-white leading-none tracking-tight">Rp {formatCurrencyForm(calculateGrandTotal().toString())}</p>
                  </div>
                  <div className="border-t border-dashed border-slate-200 dark:border-slate-700 pt-3 pl-2.5 flex justify-between items-center text-[9px] text-slate-400 font-mono">
                    <span>Reference ID</span>
                    <span className="font-bold text-slate-500 dark:text-slate-300">#{Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-2">
                  <button className="py-2.5 px-3 bg-amber-500 hover:bg-amber-600 transition-colors rounded-xl font-bold text-white text-[11px] flex items-center justify-center gap-2 shadow-sm">
                    <HeartHandshake className="w-3.5 h-3.5" /> Ajak Kebaikan
                  </button>
                  <button className="py-2.5 px-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors rounded-xl font-bold text-slate-700 dark:text-white text-[11px] flex items-center justify-center gap-2 shadow-sm">
                    <FileText className="w-3.5 h-3.5" /> Unduh Resi
                  </button>
                </div>
              </div>
              
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-center w-full shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
                <button 
                  onClick={handleCloseSuccess}
                  className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 active:scale-[0.98] transition-all text-white rounded-xl font-black text-sm shadow-md shadow-amber-500/20"
                >
                  Kembali Menebar Kebaikan
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isDetailModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDetailModalOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 transition-all"
            />
            <motion.div
              initial={{ opacity: 0, y: "100%", scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: "100%", scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[600px] bg-white dark:bg-slate-900 md:rounded-3xl rounded-t-3xl z-50 overflow-hidden flex flex-col md:max-h-[85vh] max-h-[90vh] shadow-2xl border border-slate-200 dark:border-slate-800"
            >
              {/* Modal Header */}
              <div className="relative h-48 md:h-64 shrink-0 bg-slate-100 dark:bg-slate-800 overflow-hidden group">
                <img 
                  src={selectedProgram.type.includes('sapi') ? "https://images.unsplash.com/photo-1546453629-b65fb7bb0336?w=800&q=80" : "https://images.unsplash.com/photo-1484557985045-edf25e08da73?w=800&q=80"}
                  alt={selectedProgram.title} 
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                <button 
                  onClick={() => setIsDetailModalOpen(false)}
                  className="absolute top-4 right-4 w-8 h-8 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-[#1799dc] text-[9px] font-black uppercase tracking-wider rounded-md">
                      {selectedProgram.category}
                    </span>
                    <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-slate-200">
                      <MapPin className="w-3 h-3" /> {selectedProgram.location}
                    </span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-black leading-tight mb-1">{selectedProgram.title}</h3>
                </div>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                {/* Progress Bar */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mb-3 italic leading-relaxed text-center px-2">
                    "Sesungguhnya kami memberi makanan kepadamu hanyalah untuk mengharapkan keridhaan Allah..."
                  </p>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase flex items-center gap-1.5"><Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20" /> Kebaikan Terkumpul</span>
                    <span className="text-sm font-black text-[#1799dc]">{Math.round((selectedProgram.filled / selectedProgram.quota) * 100)}% Terisi</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(selectedProgram.filled / selectedProgram.quota) * 100}%` }}
                      transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                      className="h-full bg-gradient-to-r from-[#1799dc] to-blue-400 rounded-full relative overflow-hidden" 
                    >
                      <div className="absolute inset-0 bg-white/20 w-full animate-pulse"></div>
                    </motion.div>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-500">
                    <span>Terkumpul: {selectedProgram.filled} {selectedProgram.type === 'sapi_1_7' ? 'Bagian' : 'Ekor'}</span>
                    <span>Target: {selectedProgram.quota} {selectedProgram.type === 'sapi_1_7' ? 'Bagian' : 'Ekor'}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-[#1799dc]" /> Tentang Program
                  </h4>
                  <div className="space-y-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed text-justify">
                    <p>
                      Program qurban di {selectedProgram.location} ini bukan sekadar rutinitas ibadah tahunan, melainkan sebuah misi kemanusiaan yang mendalam. Setiap tahunnya, masih banyak saudara-saudara kita di wilayah pelosok dan pedalaman yang jarang sekali, bahkan mungkin tidak pernah sama sekali, menikmati hidangan daging yang layak. Melalui program ini, kita berupaya menghapus kesenjangan tersebut.
                    </p>
                    <p>
                      Kondisi geografis yang menantang dan infrastruktur yang terbatas seringkali menjadi penghalang bagi masuknya bantuan secara merata. Oleh karena itu, tim relawan lapangan kami telah memetakan dengan cermat titik-titik krusial yang paling membutuhkan. Mereka adalah keluarga prasejahtera, janda renta, yatim dhuafa, kaum disabilitas, hingga para santri di pelosok negeri.
                    </p>
                    <img 
                      src="https://images.unsplash.com/photo-1549558549-415fe4c37b60?w=800&q=80" 
                      alt="Ilustrasi Distribusi" 
                      className="w-full h-32 md:h-48 object-cover rounded-xl mt-4 mb-4"
                    />
                    <p>
                      Proses pemilihan hewan dilakukan dengan syariat yang ketat. Hewan-hewan qurban yang kami sediakan dipelihara oleh para peternak lokal. Hal ini dilakukan bukan hanya untuk memastikan pasokan yang sehat, cacat maupun cukup umur, tetapi juga sebagai upaya untuk menggerakkan roda ekonomi kerakyatan di tingkat pedesaan yang selama ini kesulitan mencari pasaran yang adil.
                    </p>
                    <p>
                      Begitu banyak keberkahan yang tercipta dari satu ekor hewan qurban Anda. Aliran kebahagiaan ini dimulai dari senyum sang peternak yang hasil jerih payahnya terbayarkan, berlanjut pada semangat para relawan di jalan Allah, hingga akhirnya bermuara pada air mata kebahagiaan warga penerima manfaat saat menyantap hidangan qurban bersama keluarga tercinta.
                    </p>
                    <p>
                      Penyembelihan tidak akan dipusatkan pada satu titik besar yang justru tidak efisien. Sebaliknya, proses penyembelihan dan pendistribusian dilakukan di titik sasaran untuk efektivitas, menjaga kesegaran daging, dan menghindari kerumunan serta antrean yang menyusahkan para penerima manfaat. Kami ingin mereka menyambut rezeki ini dengan bermartabat.
                    </p>
                    <img 
                      src="https://images.unsplash.com/photo-1484557985045-edf25e08da73?w=800&q=80" 
                      alt="Kegiatan Qurban" 
                      className="w-full h-32 md:h-48 object-cover rounded-xl mt-4 mb-4"
                    />
                    <p>
                      Dalam hal akuntabilitas dan transparansi (laporan implementasi), Laznas Dewan Da'wah selalu berupaya menjadi lembaga yang profesional dan amanah. Setelah proses pendistribusian selesai, kami akan langsung menyusun laporan komprehensif yang berisi dokumentasi foto, titik lokasi spesifik, dan kesimpulan. 
                    </p>
                    <p>
                      Laporan ini nantinya akan dikirimkan langsung ke nomor WhatsApp dan email pribadi Anda yang terdaftar pada saat melakukan transaksi qurban. Semuanya akan terdata dan dikomunikasikan sedini mungkin agar ibadah qurban Anda membawa ketenangan hati.
                    </p>
                    <p>
                      Mari bergandengan tangan, salurkan qurban terbaik Anda bersama kami tahun ini. Tidak ada sesuatu yang dapat menghalangi kita untuk berbagi meskipun jarak membentang luas. Sekecil apapun kebaikan yang disalurkan, akan menjadi saksi di yaumil akhir, serta menjadi wasilah keberkahan umur, harta, dan keselamatan di dunia maupun akhirat.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Spesifikasi */}
                  <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                     <h4 className="text-[10px] font-black text-[#1799dc] uppercase tracking-widest flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Spesifikasi</h4>
                     <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                       <li className="flex items-start gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 mt-1.5 shrink-0" />
                         Hewan sehat, tidak cacat & cukup umur.
                       </li>
                       <li className="flex items-start gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 mt-1.5 shrink-0" />
                         Berat: {selectedProgram.type.includes('sapi') ? '280 - 320 Kg' : '22 - 27 Kg'}.
                       </li>
                       <li className="flex items-start gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 mt-1.5 shrink-0" />
                         Laporan akan dikirim via email/WA.
                       </li>
                     </ul>
                  </div>

                  {/* Penerima Manfaat */}
                  <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                     <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Penerima Manfaat</h4>
                     <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                       <li className="flex items-start gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-emerald-200 dark:bg-emerald-800 mt-1.5 shrink-0" />
                         Masyarakat prasejahtera di <b>{selectedProgram.location}</b>.
                       </li>
                       <li className="flex items-start gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-emerald-200 dark:bg-emerald-800 mt-1.5 shrink-0" />
                         Santri di pelosok / daerah minim donatur.
                       </li>
                       <li className="flex items-start gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-emerald-200 dark:bg-emerald-800 mt-1.5 shrink-0" />
                         Keluarga yatim & dhuafa setempat.
                       </li>
                     </ul>
                  </div>
                </div>

                {/* Kabar Terbaru / Artikel */}
                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><Newspaper className="w-4 h-4 text-[#1799dc]" /> Kabar Terbaru</span>
                    <span className="text-[9px] text-slate-400 font-bold normal-case cursor-pointer hover:text-[#1799dc] flex items-center gap-1">Semua Kabar <ArrowRight className="w-3 h-3" /></span>
                  </h4>
                  <div className="space-y-3">
                    {[
                      {
                        title: `Distribusi Qurban ${new Date().getFullYear() - 1} di ${selectedProgram.location}`,
                        date: '2 Hari lalu',
                        img: selectedProgram.type.includes('sapi') ? "https://images.unsplash.com/photo-1546453629-b65fb7bb0336?w=200&q=80" : "https://images.unsplash.com/photo-1484557985045-edf25e08da73?w=200&q=80",
                        type: 'Update'
                      },
                      {
                        title: 'Antusiasme Warga Menyambut Idul Adha Bersama Laznas',
                        date: '1 Minggu lalu',
                        img: "https://images.unsplash.com/photo-1549558549-415fe4c37b60?w=200&q=80",
                        type: 'Berita'
                      }
                    ].map((news, i) => (
                      <div key={i} className="flex gap-3 items-center group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 p-2 -mx-2 rounded-xl transition-colors">
                        <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 relative">
                          <img src={news.img} alt={news.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="inline-block px-1.5 py-0.5 rounded text-[8px] font-black bg-blue-50 text-[#1799dc] dark:bg-blue-900/30 mb-1.5 uppercase tracking-wider">{news.type}</span>
                          <p className="text-xs font-bold text-slate-800 dark:text-white line-clamp-2 leading-snug group-hover:text-[#1799dc] transition-colors">{news.title}</p>
                          <div className="flex items-center gap-1 mt-1.5 text-[9px] text-slate-400 font-bold">
                            <Clock className="w-3 h-3" /> {news.date}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fundraiser/Affiliate Section */}
                <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center justify-between">
                    Penggerak Kebaikan
                    <span className="text-[9px] font-bold text-blue-500 normal-case bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">8 Fundraiser</span>
                  </h4>
                  <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar snap-x">
                    {[
                      { name: 'Ust. Abdul Somad', tgt: 30, achieved: 25, img: 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
                      { name: 'Relawan Beraksi', tgt: 50, achieved: 45, img: 'https://images.unsplash.com/photo-1584999734482-0361aecad844?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
                      { name: 'Pemuda Hijrah', tgt: 20, achieved: 15, img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
                    ].map((f, i) => (
                      <div key={i} className="flex-none w-[140px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-3 snap-start relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-blue-100/50 dark:bg-blue-900/20 rounded-bl-full pointer-events-none" />
                        <div className="flex items-center gap-2 mb-3 relative z-10">
                           <img src={f.img} alt={f.name} className="w-8 h-8 rounded-full object-cover ring-2 ring-white dark:ring-slate-800 shadow-sm" />
                           <p className="text-[10px] font-black text-slate-700 dark:text-slate-200 line-clamp-2 leading-tight">{f.name}</p>
                        </div>
                        <div className="relative z-10 h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-1.5">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(f.achieved/f.tgt)*100}%` }} />
                        </div>
                        <p className="text-[9px] text-slate-500 font-bold relative z-10 flex justify-between">
                          <span>{f.achieved} {selectedProgram.type === 'sapi_1_7' ? 'Bagian' : 'Ekor'}</span>
                          <span className="text-emerald-500">{Math.round((f.achieved/f.tgt)*100)}%</span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Donatur Terbaru */}
                <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center justify-between">
                    Donatur Terbaru
                    <span className="text-[10px] text-[#1799dc] font-bold normal-case cursor-pointer hover:underline">Lihat Semua</span>
                  </h4>
                  <div className="space-y-2 relative">
                    <AnimatePresence mode="popLayout">
                      {liveDonors.map((d) => (
                        <motion.div 
                          key={d.id}
                          layout
                          initial={{ opacity: 0, x: -30, scale: 0.95 }}
                          animate={{ opacity: 1, x: 0, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                          transition={{ type: "spring", stiffness: 350, damping: 25, mass: 0.8 }}
                          className="flex items-center gap-3 bg-white dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm hover:border-[#1799dc]/30 transition-colors"
                        >
                          <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex flex-col items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-800/30">
                            <Heart className="w-4 h-4 text-emerald-500 fill-emerald-500/20 mb-0.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-slate-800 dark:text-white truncate">{d.name}</p>
                            <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                              Berqurban <span className="font-bold text-slate-700 dark:text-slate-300">{d.item} {selectedProgram.type === 'sapi_1_7' ? 'Bagian Sapi' : 'Ekor Kambing'}</span>
                            </p>
                          </div>
                          <div className="shrink-0 text-right">
                            <span className="text-[9px] text-slate-400 font-bold block">{d.time}</span>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Program Aktif Lainnya */}
                <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800 pb-2">
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center justify-between">
                    Program Menarik Lainnya
                  </h4>
                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                     {QURBAN_PROGRAMS.filter(p => p.id !== selectedProgram.id).slice(0, 2).map(prog => (
                        <div 
                           key={prog.id} 
                           className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-2xl cursor-pointer hover:border-[#1799dc] hover:shadow-lg hover:shadow-blue-500/10 transition-all group overflow-hidden flex flex-col" 
                           onClick={() => setSelectedProgram(prog)}
                        >
                          <div className="relative h-24 sm:h-28 overflow-hidden">
                            <img 
                              src={prog.type.includes('sapi') ? "https://images.unsplash.com/photo-1546453629-b65fb7bb0336?w=400&q=80" : "https://images.unsplash.com/photo-1484557985045-edf25e08da73?w=400&q=80"}
                              alt={prog.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                            <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end">
                              <div className="w-6 h-6 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center text-xs shadow-sm ring-1 ring-white/30 text-white">
                                {prog.icon}
                              </div>
                              <span className="text-[8px] font-black bg-[#1799dc] text-white px-2 py-0.5 rounded-md uppercase tracking-wider shadow-sm">{prog.region === 'pelosok' ? 'Lokal' : 'Global'}</span>
                            </div>
                          </div>
                          <div className="p-3 flex-1 flex flex-col justify-between">
                            <p className="text-[10px] md:text-xs font-black text-slate-800 dark:text-white line-clamp-2 leading-snug mb-2 group-hover:text-[#1799dc] transition-colors">{prog.title}</p>
                            <div>
                               <p className="text-[8px] text-slate-400 font-bold uppercase mb-0.5 tracking-wider">Harga per {prog.type === 'sapi_1_7' ? 'Bagian' : 'Ekor'}</p>
                               <p className="text-xs md:text-sm font-black text-slate-900 dark:text-white">Rp {formatCurrencyForm(prog.price.toString())}</p>
                            </div>
                          </div>
                        </div>
                     ))}
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="shrink-0 p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Harga {selectedProgram.type === 'sapi_1_7' ? 'Per Bagian' : 'Ekor'}</p>
                  <p className="text-xl font-black text-[#1799dc]">Rp {formatCurrencyForm(selectedProgram.price.toString())}</p>
                </div>
                <button 
                  onClick={() => setIsDetailModalOpen(false)}
                  className="px-6 py-3 bg-[#1799dc] hover:bg-[#1588c4] transition-colors rounded-xl text-white font-black text-sm shadow-lg shadow-[#1799dc]/20"
                >
                  Pilih Program Ini
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};

