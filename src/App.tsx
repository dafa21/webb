/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Heart, Menu, X, ChevronRight, ChevronDown, Users, HandHeart, 
  MapPin, Facebook, Instagram, Youtube, UserCircle,
  TrendingUp, FileText, History as HistoryIcon,
  Globe, Tent, HandCoins, ShieldCheck, Sun, Moon, CheckCircle2, Award, Star, Milestone, Activity, Sunrise, HeartHandshake, Repeat,
  ArrowRight, PlayCircle, Phone, Mail, ShoppingBag, Bell, Image as ImageIcon, Search,
  Share2, Download, Sparkles, Calculator, Home, Wallet, Lock, Info, Component, ShoppingCart,
  Loader2, LayoutGrid, BookOpen, AlertCircle, CheckCircle, LayoutDashboard, Clock, Compass, FileCheck2
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { Routes, Route, useNavigate, useLocation, Navigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { collection, addDoc, query, where, getDocs, orderBy, onSnapshot, serverTimestamp, setDoc, doc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Chatbot } from './components/Chatbot';
import { ProgramMap } from './components/ProgramMap';
import { QurbanMap } from './components/QurbanMap';
import { TwibbonModal } from './components/TwibbonModal';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { ZakatPage } from './components/ZakatPage';
import { QurbanPage } from './components/QurbanPage';
import { ProgramDetailPage } from './components/ProgramDetailPage';
import { InteractiveDonationCarousel } from './components/InteractiveDonationCarousel';
import { PohonKebaikanInteractive } from './components/PohonKebaikanInteractive';
import QuranPage from './components/QuranPage';
import AmaliyahPage from './components/AmaliyahPage';
import { MasjidLocator } from './components/MasjidLocator';
import SholatPage from './components/SholatPage';
import DonationHistory from './components/DonationHistory';
import PengajuanBantuan from './components/PengajuanBantuan';

import { SedekahSubuhCard } from './components/SedekahSubuhCard';

// Types
export interface Program {
  id: number;
  title: string;
  category: string;
  image: string;
  video?: string;
  description: string;
  collected: number;
  target: number;
  donors: number;
  urgent?: boolean;
}

// Mock Data
const PROGRAMS: Program[] = [
  {
    id: 1,
    title: "Air Bersih untuk Pelosok Nusantara",
    category: "Sosial",
    description: "Bantu alirkan air bersih ke ribuan warga di pelosok Nusantara yang masih kesulitan mendapatkan akses air layak untuk kehidupan sehari-hari.",
    image: "https://images.unsplash.com/photo-1504711331083-9c895941bf81?q=80&w=800&auto=format&fit=crop",
    video: "https://www.w3schools.com/html/mov_bbb.mp4",
    collected: 750000000,
    target: 1000000000,
    donors: 1240,
    urgent: true
  },
  {
    id: 2,
    title: "Beasiswa Tahfidz Quran Yatim & Dhuafa",
    category: "Pendidikan",
    description: "Dukung para santri yatim dan dhuafa mewujudkan cita-citanya sebagai penghafal Al-Quran melalui beasiswa pendidikan berkelanjutan.",
    image: "https://images.unsplash.com/photo-1532372320572-cda25653a26d?q=80&w=800&auto=format&fit=crop",
    video: "https://www.w3schools.com/html/mov_bbb.mp4",
    collected: 450000000,
    target: 600000000,
    donors: 856
  },
  {
    id: 3,
    title: "Darurat Pangan Gaza, Palestina",
    category: "Kemanusiaan",
    description: "Salurkan bantuan pangan mendesak untuk saudara kita di Gaza yang saat ini mengalami krisis kemanusiaan parah akibat konflik. Sedekah sahabat adalah harapan mereka.",
    image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800&auto=format&fit=crop",
    video: "https://www.w3schools.com/html/mov_bbb.mp4",
    collected: 1200000000,
    target: 2000000000,
    donors: 3420,
    urgent: true
  },
  {
    id: 4,
    title: "Tebar Qurban Pelosok Nusantara",
    category: "Qurban",
    description: "Bahagiakan saudara di pelosok dengan kelezatan daging qurban. Titipkan qurban terbaikmu untuk mereka yang jarang menikmati daging selain saat Idul Adha.",
    image: "https://images.unsplash.com/photo-1625488427958-38a4d46c871c?q=80&w=800&auto=format&fit=crop",
    collected: 120000000,
    target: 500000000,
    donors: 45
  },
  {
    id: 5,
    title: "Pembangunan Sumur Desa Sukamaju",
    category: "Sosial",
    description: "Alhamdulillah sumur telah selesai dibangun dan air bersih sudah mengalir untuk warga Desa Sukamaju. Terima kasih orang baik!",
    image: "https://images.unsplash.com/photo-1590492804562-b91b5c92822a?q=80&w=800&auto=format&fit=crop",
    collected: 50000000,
    target: 50000000,
    donors: 312
  }
];

const CATEGORIES = [
  { name: 'Bayar Zakat', icon: HandCoins },
  { name: 'Bantu Palestina', icon: Globe },
  { name: 'Qurban', icon: Tent },
  { name: 'Infak', icon: TrendingUp },
];

export const EXTENDED_PROGRAMS: Program[] = Array.from({ length: 30 }).map((_, i) => ({
  ...PROGRAMS[i % PROGRAMS.length],
  id: 100 + i,
  title: `${PROGRAMS[i % PROGRAMS.length].title} #${i + 1}`
}));

const PROGRAM_KATEGORIS = [
  { title: "Infak Dunia Islam", image: "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&q=80&w=400&h=600" },
  { title: "Sedekah Subuh", image: "https://images.unsplash.com/photo-1511553677255-ba939e5537e0?auto=format&fit=crop&q=80&w=400&h=600" },
  { title: "Zakat", image: "https://images.unsplash.com/photo-1532372320572-cda25653a26d?auto=format&fit=crop&q=80&w=400&h=600" },
  { title: "Infaq Rutin", image: "https://images.unsplash.com/photo-1579621970588-a35d0e7ab9b6?auto=format&fit=crop&q=80&w=400&h=600" },
];

const STORIES = [
  { id: 1, image: "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&q=80&w=150&h=150" },
  { id: 2, image: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&q=80&w=150&h=150" },
  { id: 3, image: "https://images.unsplash.com/photo-1579621970588-a35d0e7ab9b6?auto=format&fit=crop&q=80&w=150&h=150" },
  { id: 4, image: "https://images.unsplash.com/photo-1511553677255-ba939e5537e0?auto=format&fit=crop&q=80&w=150&h=150" },
];

const MILESTONES = [
  { id: 1, name: 'Penyemai Kebaikan', amount: 0, icon: Sparkles, color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 2, name: 'Pejuang Senyum', amount: 1000000, icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50' },
  { id: 3, name: 'Pahlawan Pelosok', amount: 5000000, icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { id: 4, name: 'Sahabat Jannah', amount: 10000000, icon: Award, color: 'text-[#f29f05]', bg: 'bg-orange-50' },
];

const ZAKAT_MILESTONES = [
  { id: 1, name: 'Muzaki Pemula', amount: 0, icon: HandCoins, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { id: 2, name: 'Muzaki Istiqomah', amount: 2000000, icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-50' },
  { id: 3, name: 'Pilar Keadilan', amount: 10000000, icon: ShieldCheck, color: 'text-blue-500', bg: 'bg-blue-50' },
];

const DONATION_HISTORY = [
  {
    id: "TRX-10293",
    date: "12 Ramadhan 1447 H / 02 Mar 2026",
    program: "Air Bersih untuk Pelosok Nusantara",
    amount: 250000,
    status: "Berhasil",
    method: "Qris",
    impact: "Dana Anda difokuskan untuk pipanisasi sepanjang 1km di Desa Suka Maju yang mengalir ke 50 KK."
  },
  {
    id: "TRX-09821",
    date: "25 Sya'ban 1447 H / 14 Feb 2026",
    program: "Darurat Pangan Gaza, Palestina",
    amount: 500000,
    status: "Berhasil",
    method: "Bank Transfer",
    impact: "Telah disalurkan dalam bentuk 2 paket gandum dan susu bayi di pengungsian Rafah."
  },
  {
    id: "TRX-08211",
    date: "10 Rajab 1447 H / 01 Jan 2026",
    program: "Zakat Penghasilan",
    amount: 1500000,
    status: "Berhasil",
    method: "Virtual Account",
    impact: "Disalurkan untuk program pemberdayaan 3 mustahik binaan (Modal Usaha Ayam Petelur)."
  },
  {
    id: "TRX-11002",
    date: "14 Ramadhan 1447 H / 04 Mar 2026",
    program: "Sedekah Berbuka Puasa Yatim",
    amount: 150000,
    status: "Pending",
    method: "ShopeePay",
    impact: ""
  }
];

const SISTER_STORIES = [
  { 
    id: 1, 
    image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800&auto=format&fit=crop", 
    name: "Adik Hasan", 
    location: "Gaza, Palestina", 
    quote: "Terima kasih kakak-kakak dari Indonesia. Berkat makanan ini, adik-adikku tidak menangis kelaparan lagi malam ini.",
    program: "Darurat Pangan Gaza",
    date: "12 Ramadhan 1447 H"
  },
  { 
    id: 2, 
    image: "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?q=80&w=800&auto=format&fit=crop", 
    name: "Desa Suka Maju", 
    location: "NTT, Indonesia", 
    quote: "Bertahun-tahun kami harus berjalan 3 kilometer untuk air bersih. Kini air mengalir deras di desa kami. Alhamdulillah.",
    program: "Air Bersih Pelosok",
    date: "Awal Tahun 2026"
  },
  { 
    id: 3, 
    image: "https://images.unsplash.com/photo-1532372320572-cda25653a26d?q=80&w=800&auto=format&fit=crop", 
    name: "Santri Nurul Huda", 
    location: "Pelosok Jawa Barat", 
    quote: "Beasiswa ini membuat saya bisa terus menghafal Al-Quran tanpa membebani ibu yang berjuang sendiri.",
    program: "Beasiswa Tahfidz",
    date: "Tahun Ajaran Baru"
  }
];

const INFOGRAPHICS = {
  totalPenyaluran: [
    { label: "Pendidikan & Dakwah", percent: 45, color: "bg-emerald-500" },
    { label: "Kemanusiaan & Bencana", percent: 30, color: "bg-[#1799dc]" },
    { label: "Kesehatan & Sanitasi", percent: 15, color: "bg-[#f29f05]" },
    { label: "Pemberdayaan Ekonomi", percent: 10, color: "bg-purple-500" }
  ],
  demografi: [
    { label: "Anak Yatim & Dhuafa", count: "45.000+" },
    { label: "Keluarga Prasejahtera", count: "21.500+" },
    { label: "Guru Ngaji/Da'i", count: "5.200+" },
    { label: "Santri Pelosok", count: "12.800+" }
  ]
};

const GALLERY_ITEMS = [
  { id: 1, type: 'video', image: '1488521787991-ed7bbaae773c', span: 'col-span-2 row-span-2', title: "Keceriaan Anak-Anak Gaza", desc: "Berkat bantuan Anda, penyaluran pangan darurat telah sampai kepada mereka yang membutuhkan di pengungsian." },
  { id: 2, type: 'image', image: '1582213787181-42ba2c24efb4', span: 'col-span-1 row-span-1', title: "Pembangunan Sumur", desc: "Air bersih kembali mengalir di desa kekeringan." },
  { id: 3, type: 'image', image: '1593113565637-29d6bece142a', span: 'col-span-1 row-span-2', title: "Penyaluran Qurban", desc: "Pembagian daging qurban kepada masyarakat pedalaman." },
  { id: 4, type: 'image', image: '1532372320572-cda25653a26d', span: 'col-span-1 row-span-1', title: "Beasiswa Tahfidz", desc: "Para santri semakin semangat menghafal Al-Quran." },
  { id: 5, type: 'video', image: '1504711331083-9c895941bf81', span: 'col-span-2 row-span-1', title: "Semangat Belajar di Pelosok", desc: "Bantuan perlengkapan sekolah untuk anak-anak cerdas Nusantara." },
] as const;

const NOTIFICATIONS = [
  {
    id: 1,
    title: "Update Pipanisasi Suka Maju",
    message: "Alhamdulillah! Pipa sepanjang 1km yang Anda bantu danai kini mulai beroperasi. Warga Desa Suka Maju sangat bersyukur.",
    date: "2 hari yang lalu",
    read: false,
    programId: 1
  },
  {
    id: 2,
    title: "Penyaluran Zakat Berhasil",
    message: "Sebanyak tatusan Mustahik menerima manfaat Zakat Anda. Terima kasih!",
    date: "1 minggu yang lalu",
    read: true,
    programId: null
  }
];

const INITIAL_PRAYERS = [
  { id: 1, name: "Hamba Allah", message: "Semoga qurban tahun ini membawa keberkahan untuk kita semua. Aamiin.", timeAgo: "Baru saja", amins: 12 },
  { id: 2, name: "Budi Santoso", message: "Bismillah, sedikit rezeki untuk saudara kita di Palestina. Semoga Allah lindungi mereka.", timeAgo: "10 menit yang lalu", amins: 45 },
  { id: 3, name: "Keluarga Ahmad", message: "Semoga sumur air bersihnya cepat selesai dan bermanfaat bagi warga pelosok Jabar.", timeAgo: "1 jam yang lalu", amins: 8 },
  { id: 4, name: "Hamba Allah", message: "Niat zakat penghasilan bulan ini. Semoga mensucikan harta keluarga kami.", timeAgo: "2 jam yang lalu", amins: 24 },
  { id: 5, name: "Siti Rahmawati", message: "Ya Allah, jadikanlah sedekah ini sebagai jariyah untuk almarhum ayah hamba.", timeAgo: "5 jam yang lalu", amins: 132 },
  { id: 6, name: "Deni & Istri", message: "Semoga adik-adik santri tetap semangat menghafal Al-Quran yah!", timeAgo: "12 jam yang lalu", amins: 7 },
];

const QURBAN_LOCATIONS = [
  { id: 'pelosok', name: 'Pelosok Nusantara (Nusa Tenggara, Papua, Maluku)' },
  { id: 'bencana', name: 'Daerah Rawan Bencana & Krisis' },
  { id: 'tahfidz', name: 'Pesantren Tahfidz & Panti Asuhan' },
  { id: 'gaza', name: 'Gaza, Palestina (Program Bantuan Luar Negeri)' },
  { id: 'mualaf', name: 'Kampung Pembinaan Mualaf Pedalaman' }
];

const QURBAN_ANIMALS = [
  { id: 'kambing_standar', name: 'Kambing/Domba Standar (23-25 kg)' },
  { id: 'kambing_premium', name: 'Kambing/Domba Premium (26-28 kg)' },
  { id: 'sapi_patungan', name: '1/7 Sapi Patungan' },
  { id: 'sapi_utuh', name: '1 Sapi Utuh (250-300 kg)' }
];

const QURBAN_PROCESSING = [
  { id: 'daging_segar', name: 'Disalurkan Berupa Daging Segar' },
  { id: 'kornet', name: 'Diolah Menjadi Kornet/Rendang (Awet 1 Tahun)' }
];

export const PAYMENT_METHODS = [
  { id: 'gopay', name: 'GoPay', icon: 'https://raw.githubusercontent.com/Zyknn/paymentlogo/main/Payment%20Channel/E-Wallet/Gopay.svg', desc: 'Instan' },
  { id: 'shopeepay', name: 'ShopeePay', icon: 'https://raw.githubusercontent.com/Zyknn/paymentlogo/main/Payment%20Channel/E-Wallet/Shopee%20Pay.svg', desc: 'Instan' },
  { id: 'ovo', name: 'OVO', icon: 'https://raw.githubusercontent.com/Zyknn/paymentlogo/main/Payment%20Channel/E-Wallet/OVO.svg', desc: 'Instan' },
  { id: 'dana', name: 'DANA', icon: 'https://raw.githubusercontent.com/Zyknn/paymentlogo/main/Payment%20Channel/E-Wallet/DANA.svg', desc: 'Instan' },
  { id: 'linkaja', name: 'LinkAja', icon: 'https://raw.githubusercontent.com/Zyknn/paymentlogo/main/Payment%20Channel/E-Wallet/LinkAja.svg', desc: 'Instan' },
  { id: 'bca_va', name: 'BCA VA', icon: 'https://raw.githubusercontent.com/Zyknn/paymentlogo/main/Bank/Bank%20Logo/BCA.svg', desc: 'Virtual Account' },
  { id: 'mandiri_va', name: 'Mandiri VA', icon: 'https://raw.githubusercontent.com/Zyknn/paymentlogo/main/Bank/Bank%20Logo/Mandiri.svg', desc: 'Virtual Account' },
  { id: 'bri_va', name: 'BRI VA', icon: 'https://raw.githubusercontent.com/Zyknn/paymentlogo/main/Bank/Bank%20Logo/BRI.svg', desc: 'Virtual Account' },
  { id: 'bni_va', name: 'BNI VA', icon: 'https://raw.githubusercontent.com/Zyknn/paymentlogo/main/Bank/Bank%20Logo/BNI.svg', desc: 'Virtual Account' },
  { id: 'bsi_va', name: 'BSI VA', icon: 'https://raw.githubusercontent.com/Zyknn/paymentlogo/main/Bank/Bank%20Logo/BSI.svg', desc: 'Virtual Account' },
  { id: 'qris', name: 'QRIS', icon: 'https://raw.githubusercontent.com/Zyknn/paymentlogo/main/Payment%20Channel/Miscellaneous/QRIS.svg', desc: 'Semua E-Wallet' }
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount);
};

export const PAYMENT_INSTRUCTIONS: Record<string, { title: string; steps: string[]; note?: string }> = {
  gopay: {
    title: "Pembayaran via GoPay",
    steps: [
      "Klik tombol 'Bayar Sekarang' di bawah ini",
      "Aplikasi Gojek akan terbuka secara otomatis",
      "Periksa rincian pembayaran di aplikasi Gojek",
      "Klik 'Bayar' dan masukkan PIN GoPay Anda",
      "Kembali ke aplikasi ini setelah pembayaran berhasil"
    ],
    note: "Pastikan saldo GoPay Anda mencukupi sebelum melanjutkan."
  },
  shopeepay: {
    title: "Pembayaran via ShopeePay",
    steps: [
      "Klik tombol 'Bayar Sekarang' di bawah ini",
      "Anda akan diarahkan ke aplikasi Shopee",
      "Periksa rincian pembayaran pada halaman ShopeePay",
      "Klik 'Bayar Sekarang' dan masukkan PIN ShopeePay",
      "Tunggu hingga status pembayaran berhasil"
    ]
  },
  ovo: {
    title: "Pembayaran via OVO",
    steps: [
      "Klik tombol 'Bayar Sekarang' di bawah ini",
      "Masukkan nomor HP yang terdaftar di OVO (jika diminta)",
      "Buka aplikasi OVO dan cek notifikasi pembayaran",
      "Konfirmasi pembayaran di dalam aplikasi OVO",
      "Transaksi Anda akan diproses secara otomatis"
    ]
  },
  dana: {
    title: "Pembayaran via DANA",
    steps: [
      "Klik tombol 'Bayar Sekarang' di bawah ini",
      "Masukkan nomor HP DANA dan PIN Anda",
      "Masukkan kode OTP yang dikirimkan melalui SMS",
      "Konfirmasi pembayaran Anda",
      "Pembayaran Selesai"
    ]
  },
  linkaja: {
    title: "Pembayaran via LinkAja",
    steps: [
      "Klik tombol 'Bayar Sekarang' di bawah ini",
      "Masukkan nomor HP dan PIN LinkAja Anda",
      "Masukkan kode verifikasi yang Anda terima",
      "Konfirmasi pembayaran Anda",
      "Pembayaran Selesai"
    ]
  },
  bca_va: {
    title: "Pembayaran BCA Virtual Account",
    steps: [
      "Catat nomor Virtual Account yang muncul (setelah klik Bayar Sekarang)",
      "Buka m-BCA, pilih menu 'Transfer' > 'BCA Virtual Account'",
      "Masukkan nomor Virtual Account tersebut",
      "Pastikan nominal sesuai dan klik 'Send'",
      "Masukkan PIN m-BCA Anda"
    ],
    note: "Pembayaran akan terverifikasi otomatis dalam hitungan detik."
  },
  mandiri_va: {
    title: "Pembayaran Mandiri Virtual Account",
    steps: [
      "Catat nomor Virtual Account yang muncul",
      "Buka Livin' by Mandiri, pilih 'Bayar'",
      "Cari penyedia jasa sesuai instruksi atau masukkan nomor VA",
      "Masukkan nominal dan konfirmasi pembayaran",
      "Masukkan PIN Livin' Anda"
    ]
  },
  bri_va: {
    title: "Pembayaran BRI Virtual Account (BRIVA)",
    steps: [
      "Catat nomor BRIVA yang muncul",
      "Buka BRImo, pilih menu 'Pembayaran' > 'BRIVA'",
      "Masukkan nomor BRIVA tersebut",
      "Konfirmasi rincian pembayaran",
      "Masukkan PIN BRImo Anda"
    ]
  },
  bni_va: {
    title: "Pembayaran BNI Virtual Account",
    steps: [
      "Catat nomor Virtual Account yang muncul",
      "Buka BNI Mobile Banking, pilih 'Transfer' > 'Virtual Account Billing'",
      "Pilih tab 'Input Baru' dan masukkan nomor VA",
      "Konfirmasi nominal dan rincian",
      "Masukkan Password Transaksi Anda"
    ]
  },
  bsi_va: {
    title: "Pembayaran BSI Virtual Account",
    steps: [
      "Catat nomor Virtual Account yang muncul",
      "Buka BSI Mobile, pilih 'Bayar' > 'Lainya'",
      "Masukkan kode institusi atau nomor VA",
      "Pastikan data donasi sudah benar",
      "Masukkan PIN BSI Mobile Anda"
    ]
  },
  qris: {
    title: "Pembayaran via QRIS",
    steps: [
      "Klik tombol 'Bayar Sekarang' untuk menampilkan Kode QR",
      "Simpan atau Screenshot kode QR yang muncul",
      "Buka aplikasi E-Wallet (GoPay, DANA, OVO, dll) atau M-Banking",
      "Lakukan Scan/Pilih dari Galeri foto QR tadi",
      "Lakukan pembayaran sesuai nominal"
    ],
    note: "QRIS mendukung semua aplikasi pembayaran berlogo QRIS."
  }
};

const HERO_SLIDES = [
  {
    topText: "Hadirkan",
    bottomText: "SEJUTA SENYUMAN!",
    image: "/hero_dpn1.jpg",
  },
  {
    topText: "Terangi",
    bottomText: "PELOSOK NEGERI!",
    image: "/Hero_dpn2.jpg",
  },
  {
    topText: "Kuatkan",
    bottomText: "DAKWAH PEDALAMAN!",
    image: "/hero_dpn3.jpg",
  },
  {
    topText: "Bantuan",
    bottomText: "PENUH HARAPAN!",
    image: "/hero_dpn4.jpg",
  },
  {
    topText: "Menyulam",
    bottomText: "KEBAIKAN UMAT!",
    image: "/hero_dpn5.jpg",
  }
];

const formatCurrencyForm = (val: string) => {
  if (!val) return '';
  const numberString = val.replace(/\D/g, '');
  if (!numberString) return '';
  return new Intl.NumberFormat('id-ID').format(Number(numberString)).replace(/,/g, '.');
};

const ProgramCardSkeleton = () => (
    <div className="bg-white dark:bg-slate-800 rounded-[28px] overflow-hidden shadow-sm flex flex-col border border-slate-100 dark:border-slate-700 animate-pulse h-full transition-colors duration-300">
      <div className="relative aspect-[4/3] sm:aspect-[3/2] md:aspect-auto md:h-[160px] bg-slate-200 shrink-0"></div>
      <div className="px-5 pt-5 pb-6 md:px-6 md:pt-6 md:pb-7 flex-1 flex flex-col">
        <div className="h-2 w-1/3 bg-slate-200 rounded mb-2.5 mt-0.5"></div>
        <div className="h-4 bg-slate-200 rounded mb-2"></div>
        <div className="h-4 bg-slate-200 rounded w-2/3 mb-3"></div>
        
        <div className="flex flex-col gap-1 mb-2">
          <div className="h-3 w-full bg-slate-200 rounded mb-1"></div>
          <div className="h-3 w-5/6 bg-slate-200 rounded"></div>
        </div>

        <div className="mt-auto pt-2 grid gap-2.5">
          <div className="h-9 w-full bg-slate-200 rounded-full"></div>
          <div className="flex gap-2">
            <div className="h-9 flex-1 bg-slate-200 rounded-full"></div>
            <div className="w-[32px] h-9 bg-slate-200 rounded-full shrink-0"></div>
          </div>
        </div>
      </div>
    </div>
  );

  const ProgramCard: React.FC<{ p: Program, index: number, onQuickDonate: (p: any, amt: string) => void, onAddToCart: (p: any, amt: string) => void }> = ({ p, index, onQuickDonate, onAddToCart }) => {
    const [localDonationAmount, setLocalDonationAmount] = useState(p.category === 'Qurban' ? '2.500.000' : '100.000');
    const [isPulsing, setIsPulsing] = useState(false);

    const handleAmountChange = (newAmount: string) => {
      setLocalDonationAmount(newAmount);
      setIsPulsing(true);
      setTimeout(() => setIsPulsing(false), 200);
    };
  
    return (
      <motion.div 
        whileHover={{ scale: 1.01, y: -4, transition: { duration: 0.3, ease: "easeOut" } }}
        className="bg-white dark:bg-slate-800 rounded-[28px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 flex flex-col border border-slate-100 dark:border-slate-700 h-full"
      >
        <Link to={`/program/${p.id}`} className="block relative aspect-[4/3] sm:aspect-[3/2] md:aspect-auto md:h-[160px] shrink-0 outline-none">
          {p.video ? (
             <video 
               src={p.video}
               autoPlay
               loop
               muted
               playsInline
               poster={p.image}
               className="w-full h-full object-cover" 
             />
          ) : (
            <img src={p.image} className="w-full h-full object-cover" alt={p.title} />
          )}
          
          <div className="absolute top-2.5 right-2.5 flex gap-1.5 z-10">
            {p.video && (
              <div className="bg-black/40 backdrop-blur-md rounded-full px-2 py-0.5 flex items-center justify-center gap-1 border border-white/20 shadow-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                <span className="text-[7px] font-bold text-white uppercase tracking-wider">Live</span>
              </div>
            )}
            {p.collected >= p.target ? (
              <div className="bg-emerald-500/90 backdrop-blur-sm text-white text-[8px] font-bold px-2 py-0.5 rounded-full shadow-lg shadow-emerald-500/20 uppercase tracking-widest flex items-center gap-1 border border-emerald-400/30">
                <CheckCircle2 className="w-3 h-3 text-white" /> Selesai
              </div>
            ) : p.urgent && (
              <div className="bg-red-500/90 backdrop-blur-sm text-white text-[8px] font-bold px-2 py-0.5 rounded-full shadow-lg shadow-red-500/20 uppercase tracking-widest flex items-center gap-1 border border-red-400/30">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span> Mendesak
              </div>
            )}
          </div>
        </Link>
        
        <div className="px-3.5 pt-4 pb-4 md:px-5 md:pt-5 md:pb-6 flex-1 flex flex-col bg-white dark:bg-slate-800">
          <div className="flex justify-between items-center mb-1.5">
            <p className="text-[#1799dc] font-bold text-[10px] md:text-xs capitalize tracking-wide">
              {p.category}
            </p>
          </div>
          
          <Link to={`/program/${p.id}`} className="outline-none hover:text-[#1799dc] transition-colors">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-[13px] md:text-[16px] leading-snug mb-1.5 line-clamp-2">
              {p.title}
            </h3>
          </Link>

          <p className="text-slate-600 dark:text-slate-400 text-[11px] md:text-xs leading-relaxed line-clamp-2 mb-3 md:mb-4">
            {p.description}
          </p>

          <div className="mb-3">
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 md:h-2 mb-2 overflow-hidden">
              <div className="bg-[#1799dc] h-full rounded-full" style={{ width: `${Math.min((p.collected / p.target) * 100, 100)}%` }}></div>
            </div>
            <div className="flex justify-between items-center text-[9px] md:text-[10px]">
              <span className="text-slate-500 font-medium tracking-tight">Terkumpul <strong>Rp {new Intl.NumberFormat('id-ID').format(p.collected)}</strong></span>
              <span className="text-[#1799dc] font-bold">{Math.round((p.collected / p.target) * 100)}%</span>
            </div>
          </div>

          <div className="mt-auto pt-2 flex flex-col gap-1.5 md:gap-2">
            {p.collected >= p.target ? (
              <div className="flex flex-col gap-2 mt-2">
                <div className="w-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-center text-[10px] md:text-xs py-2 rounded-lg flex items-center justify-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" /> Target Terpenuhi
                </div>
                <Link to={`/program/${p.id}`} className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-bold text-center text-[11px] md:text-[13px] py-2 md:py-2.5 rounded-full transition-colors flex justify-center items-center h-8 md:h-10">
                  Lihat Detail
                </Link>
              </div>
            ) : (
              <>
                <motion.button whileTap={{ scale: 0.98 }} whileHover={{ scale: 1.02 }} 
                  onClick={() => setLocalDonationAmount(p.category === 'Qurban' ? '2.500.000' : '100.000')}
                  className="w-full bg-[#1799dc]/5 text-[#1799dc] hover:bg-[#1799dc]/10 font-bold text-[9px] md:text-xs py-1.5 md:py-2.5 rounded-full transition-colors active:scale-95 whitespace-nowrap overflow-hidden text-ellipsis px-1.5 md:px-2"
                >
                   {p.category === 'Qurban' ? 'Harga 1 Saham' : 'Paket Spesial'}
                </motion.button>

                <div className="flex gap-1 md:gap-2 h-7 md:h-10">
                  <div className="flex-1 flex items-center border border-slate-200 dark:border-slate-700 rounded-full overflow-hidden bg-slate-50/50 dark:bg-slate-900/50 focus-within:border-[#1799dc] focus-within:ring-1 focus-within:ring-[#1799dc] transition-all">
                    <span className="pl-2.5 md:pl-4 pr-1 md:pr-1.5 text-slate-400 font-bold text-[9px] md:text-[11px] select-none">Rp</span>
                    <motion.input 
                      type="text"
                      value={formatCurrencyForm(localDonationAmount)}
                      onChange={(e) => setLocalDonationAmount(e.target.value)}
                      animate={isPulsing ? { scale: 1.05, color: '#1799dc' } : { scale: 1 }}
                      transition={{ duration: 0.15 }}
                      className="w-full h-full bg-transparent outline-none pr-1 md:pr-3 text-[10px] md:text-sm font-bold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 min-w-0" 
                      placeholder="0"
                    />
                  </div>

                  <div className="flex flex-col w-[22px] md:w-[34px] border border-[#1799dc]/20 bg-[#1799dc]/5 rounded-full overflow-hidden shrink-0 text-[#1799dc]">
                    <motion.button whileTap={{ scale: 0.9 }}
                      className="flex-1 flex items-center justify-center hover:bg-[#1799dc]/10 font-black border-b border-[#1799dc]/10 text-[8px] md:text-xs leading-none"
                      onClick={() => {
                        const val = parseInt(localDonationAmount.replace(/\D/g, '') || '0');
                        handleAmountChange((val + 50000).toString());
                      }}
                    >+</motion.button>
                    <motion.button whileTap={{ scale: 0.9 }}
                      className="flex-1 flex items-center justify-center hover:bg-[#1799dc]/10 font-black text-[8px] md:text-xs leading-none"
                      onClick={() => {
                        const val = parseInt(localDonationAmount.replace(/\D/g, '') || '0');
                        if (val > 50000) handleAmountChange((val - 50000).toString());
                      }}
                    >-</motion.button>
                  </div>
                </div>

                <div className="flex gap-1.5 md:gap-2">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onAddToCart(p, localDonationAmount.replace(/\D/g, ''))}
                    className="w-8 h-8 md:w-10 md:h-10 shrink-0 bg-[#1799dc] hover:bg-[#1588c4] text-white flex items-center justify-center rounded-full shadow-sm transition-colors"
                    title="Masukkan ke Kantung Donasi"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 md:w-4 md:h-4 fill-white/20" />
                  </motion.button>

                  <motion.button 
                    whileTap={{ scale: 0.97 }} 
                    whileHover={{ scale: 1.02 }} 
                    onClick={() => onQuickDonate(p, localDonationAmount.replace(/\D/g, ''))}
                    className="flex-1 h-8 md:h-10 bg-gradient-to-r from-[#f29f05] to-[#f09a00] hover:from-[#d98f04] hover:to-[#df8f00] text-white font-extrabold text-[11px] md:text-[13px] rounded-full flex items-center justify-center gap-1 md:gap-1.5 shadow-[0_4px_14px_0_rgba(242,159,5,0.3)] active:scale-[0.98] transition-all whitespace-nowrap px-1 md:px-2"
                  >
                    <Heart className="w-3 h-3 md:w-4 md:h-4 fill-white/80 shrink-0" />
                    <span className="hidden sm:inline">Kebaikan Cepat</span>
                    <span className="sm:hidden">Donasi</span>
                  </motion.button>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

declare global {
  interface Window {
    snap: any;
  }
}

const LIVE_TRANSACTIONS = [
  { name: "Hamba Allah", action: "baru saja berqurban 1 Kambing untuk Orang Tua", time: "Baru saja", icon: "Tent" },
  { name: "Siti F.", action: "baru saja menyalurkan Sedekah Subuh Rp 50.000", time: "1 menit yang lalu", icon: "TrendingUp" },
  { name: "Bapak Budi", action: "ikut patungan Pembangunan Sumur", time: "2 menit yang lalu", icon: "Droplets" },
  { name: "Keluarga Yanto", action: "berdonasi untuk Palestina Rp 500.000", time: "3 menit yang lalu", icon: "Globe" },
  { name: "Hamba Allah", action: "baru saja menunaikan Zakat Penghasilan", time: "5 menit yang lalu", icon: "HandCoins" },
  { name: "Ananda D.", action: "berdonasi Beasiswa Tahfidz", time: "10 menit yang lalu", icon: "BookOpen" }
];

const DonasiPage = ({ onAddToCart, onQuickDonate }: { onAddToCart: (p: any, amt: string) => void, onQuickDonate: (p: any, amt: string) => void }) => {
  const [activeFilter, setActiveFilter] = useState('Semua');
  const [activeStatusFilter, setActiveStatusFilter] = useState('Semua');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAll, setShowAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const itemsPerPage = 6;

  const filters = [
    { id: 'Semua', icon: LayoutGrid },
    { id: 'Sosial', icon: Users },
    { id: 'Pendidikan', icon: BookOpen },
    { id: 'Kemanusiaan', icon: HandHeart },
    { id: 'Qurban', icon: Tent }
  ];
  
  const statusFilters = [
    { id: 'Semua', icon: LayoutGrid },
    { id: 'Aktif', icon: Activity },
    { id: 'Mendesak', icon: AlertCircle },
    { id: 'Selesai', icon: CheckCircle }
  ];

  const getProgramStatus = (p: any) => {
    if (p.collected >= p.target) return 'Selesai';
    if (p.urgent) return 'Mendesak';
    return 'Aktif';
  };
  
  const filteredPrograms = EXTENDED_PROGRAMS.filter(p => {
    const matchesCategory = activeFilter === 'Semua' ? true : p.category === activeFilter;
    const matchesStatus = activeStatusFilter === 'Semua' ? true : getProgramStatus(p) === activeStatusFilter;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = p.title.toLowerCase().includes(searchLower) || p.description.toLowerCase().includes(searchLower);
    return matchesCategory && matchesStatus && matchesSearch;
  });
  
  const totalPages = Math.ceil(filteredPrograms.length / itemsPerPage);
  const currentPrograms = showAll ? filteredPrograms : filteredPrograms.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleFilterClick = (f: string) => {
     setActiveFilter(f);
     setCurrentPage(1);
     setShowAll(false);
  };
  
  const handleStatusFilterClick = (f: string) => {
     setActiveStatusFilter(f);
     setCurrentPage(1);
     setShowAll(false);
  };

  return (
    <div className="pt-24 md:pt-32 pb-24 min-h-screen bg-[#eaf4fc]/40 dark:bg-slate-950 px-4 max-w-7xl mx-auto">
      <div className="mb-8 text-center max-w-2xl mx-auto">
         <h1 className="text-3xl md:text-4xl font-serif font-black text-slate-900 dark:text-white mb-4">Semua Program</h1>
         <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base leading-relaxed mb-6">
           Pilih ladang pahala Anda. Setiap donasi memberikan dampak nyata bagi mereka yang membutuhkan.
         </p>
         
         <div className="relative max-w-md mx-auto">
           <input
             type="text"
             placeholder="Cari program (contoh: beasiswa, palestina...)"
             value={searchQuery}
             onChange={(e) => {
               setSearchQuery(e.target.value);
               setCurrentPage(1);
             }}
             className="w-full pl-12 pr-5 py-3.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1799dc] focus:border-transparent transition-all shadow-sm"
           />
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
         </div>
      </div>

      <div className="flex flex-col gap-4 mb-8 md:mb-10">
         <div className="flex justify-center mb-2">
            <button
               onClick={() => setShowFilters(!showFilters)}
               className="flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full font-bold text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition"
            >
               <LayoutGrid className="w-4 h-4 text-[#1799dc]" />
               Filter Program {(activeFilter !== 'Semua' || activeStatusFilter !== 'Semua') && <span className="w-2 h-2 rounded-full bg-red-500"></span>}
               <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
         </div>
         <AnimatePresence>
            {showFilters && (
               <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-col gap-4 overflow-hidden"
               >
                  <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
                     {filters.map(filter => {
                       const Icon = filter.icon;
                       return (
                         <button
                           key={filter.id}
                           onClick={() => handleFilterClick(filter.id)}
                           className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm flex items-center gap-2 border ${
                             activeFilter === filter.id 
                             ? 'bg-[#1799dc] text-white border-[#1799dc] shadow-[#1799dc]/20' 
                             : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-[#1799dc]/5 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 hover:border-[#1799dc]/30'
                           }`}
                         >
                           <Icon className={`w-4 h-4 ${activeFilter === filter.id ? 'text-white' : 'text-[#1799dc]'}`} />
                           {filter.id}
                         </button>
                       );
                     })}
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 lg:pb-2">
                     {statusFilters.map(filter => {
                       const Icon = filter.icon;
                       return (
                         <button
                           key={`status-${filter.id}`}
                           onClick={() => handleStatusFilterClick(filter.id)}
                           className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm flex items-center gap-2 border ${
                             activeStatusFilter === filter.id 
                             ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 border-slate-800 dark:border-slate-200' 
                             : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700'
                           }`}
                         >
                           <Icon className={`w-4 h-4 ${activeStatusFilter === filter.id ? 'text-white dark:text-slate-900' : 'text-slate-500 dark:text-slate-400'}`} />
                           {filter.id}
                         </button>
                       );
                     })}
                  </div>
               </motion.div>
            )}
         </AnimatePresence>
      </div>

      {currentPrograms.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
           {currentPrograms.map((p, index) => (
              <ProgramCard 
                 key={p.id} 
                 p={p} 
                 index={index} 
                 onAddToCart={onAddToCart} 
                 onQuickDonate={onQuickDonate}
              />
           ))}
        </div>
      ) : (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
          Tidak ada program untuk kategori ini.
        </div>
      )}

      {totalPages > 1 && !showAll && (
        <div className="flex flex-col items-center gap-5 mt-6">
          <div className="flex justify-center items-center gap-2 md:gap-3">
             <button 
               onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
               disabled={currentPage === 1}
               className="w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#1799dc]/5 dark:hover:bg-slate-700 transition shadow-sm"
             >
               <ChevronRight className="w-5 h-5 md:w-5 md:h-5 rotate-180" />
             </button>
             
             <div className="flex gap-1.5 md:gap-2 flex-wrap justify-center">
               {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-9 h-9 md:w-10 md:h-10 shrink-0 rounded-full flex items-center justify-center font-bold text-xs md:text-sm transition-all ${
                      currentPage === i + 1
                      ? 'bg-[#1799dc] text-white shadow-md shadow-[#1799dc]/30 border-none'
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-[#1799dc]/5 hover:border-[#1799dc]/30 hover:text-[#1799dc] dark:hover:bg-slate-700 shadow-sm'
                    }`}
                  >
                    {i + 1}
                  </button>
               ))}
             </div>

             <button 
               onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
               disabled={currentPage === totalPages}
               className="w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#1799dc]/5 dark:hover:bg-slate-700 transition shadow-sm"
             >
               <ChevronRight className="w-5 h-5 md:w-5 md:h-5" />
             </button>
          </div>
          <div className="relative flex items-center justify-center w-full max-w-xs mt-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-700/60"></div>
            </div>
            <button 
              onClick={() => setShowAll(true)}
              className="relative px-6 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full text-[#1799dc] font-bold text-xs md:text-sm hover:bg-[#1799dc]/5 transition flex items-center gap-1.5 shadow-sm hover:shadow"
            >
              Lihat Semua Program ({filteredPrograms.length})
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
      
      {showAll && (
         <div className="flex justify-center mt-6">
            <button 
              onClick={() => {
                 setShowAll(false);
                 setCurrentPage(1);
              }}
              className="px-6 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full font-bold text-[#1799dc] shadow-sm hover:bg-slate-50 transition flex items-center gap-2"
            >
              Kembali ke Halaman Pertama
            </button>
         </div>
      )}
    </div>
  );
};

export default function App() {
  const handleDonationAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrencyForm(e.target.value);
    setDonationAmount(formatted);
  };

  const handleAddToCart = (p: Program, amt: string) => {
    setCartItems(prev => {
      const existingIndex = prev.findIndex(item => item.program.id === p.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex].amount = (parseInt(updated[existingIndex].amount) + parseInt(amt)).toString();
        return updated;
      }
      return [...prev, { id: p.id.toString(), program: p, amount: amt }];
    });
    setToastMessage(`Alhamdulillah, ${p.title} berhasil dititipkan ke Kantung Kebaikan!`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const navigate = useNavigate();
  const location = useLocation();
  const { scrollY } = useScroll();
  const heroImageY = useTransform(scrollY, [0, 800], [0, 150]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('Alhamdulillah, Donasi Anda Telah Diterima!');
  const [cartItems, setCartItems] = useState<{id: string, program: Program, amount: string}[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check local storage or system preference on initial load
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('darkMode');
      if (saved !== null) {
        return saved === 'true';
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  const getInitialLang = () => {
    const match = document.cookie.match(/googtrans=\/auto\/([a-zA-Z-]+)/) || document.cookie.match(/googtrans=\/id\/([a-zA-Z-]+)/);
    return match ? match[1] : 'id';
  };
  const [currentLang, setCurrentLang] = useState(getInitialLang());

  const LANGUAGES = [
    { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'zh-CN', name: '中文 (简体)', flag: '🇨🇳' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'ms', name: 'Melayu', flag: '🇲🇾' },
    { code: 'th', name: 'ไทย', flag: '🇹🇭' },
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  ];

  // Manual translations for key UI strings for better accuracy
  const T = {
    id: {
      hero_top: "Hadirkan",
      hero_bottom: "SEJUTA SENYUMAN!",
      hero2_top: "Terangi",
      hero2_bottom: "PELOSOK NEGERI!",
      hero3_top: "Kuatkan",
      hero3_bottom: "DAKWAH PEDALAMAN!",
      hero4_top: "Bantuan",
      hero4_bottom: "PENUH HARAPAN!",
      hero5_top: "Menyulam",
      hero5_bottom: "KEBAIKAN UMAT!",
      donate_now: "Donasi Sekarang",
      pilih_bahasa: "Pilih Bahasa",
      donasiku: "Donasiku",
      tentang: "Tentang",
      beranda: "Beranda",
      program: "Program",
      amaliyah: "Amaliyah",
      zakat: "Zakat",
      kuning: "Mudahnya Berbagi Kebaikan",
      login: "Masuk",
      profil: "Profil Saya",
      cari: "Cari fitur & program donasi...",
      menu: "Menu",
      notifikasi: "Notifikasi",
      layanan: "Layanan Kami",
      program_utama: "Program Utama",
      hubungi: "Hubungi Kami",
      hak_cipta: "Seluruh hak cipta dilindungi.",
      kalkulator: "Kalkulator Zakat"
    },
    en: {
      hero_top: "Bring Forth",
      hero_bottom: "A MILLION SMILES!",
      hero2_top: "Light Up",
      hero2_bottom: "THE CORNERS OF THE NATION!",
      hero3_top: "Strengthen",
      hero3_bottom: "RURAL DA'WAH!",
      hero4_top: "Help",
      hero4_bottom: "FULL OF HOPE!",
      hero5_top: "Weaving",
      hero5_bottom: "UMMAH'S GOODNESS!",
      donate_now: "Donate Now",
      pilih_bahasa: "Select Language",
      donasiku: "My Donation",
      tentang: "About",
      beranda: "Home",
      program: "Program",
      amaliyah: "Practice",
      zakat: "Zakat",
      kuning: "The Ease of Sharing Kindness",
      login: "Login",
      profil: "My Profile",
      cari: "Search features & donation programs...",
      menu: "Menu",
      notifikasi: "Notifications",
      layanan: "Our Services",
      program_utama: "Main Programs",
      hubungi: "Contact Us",
      hak_cipta: "All rights reserved.",
      kalkulator: "Zakat Calculator"
    },
    ar: {
      hero_top: "إجلب",
      hero_bottom: "مليون ابتسامة!",
      hero2_top: "أنر",
      hero2_bottom: "أطراف البلاد!",
      hero3_top: "قوّ",
      hero3_bottom: "الدعوة في المناطق النائية!",
      hero4_top: "مساعدة",
      hero4_bottom: "مليئة بالأمل!",
      hero5_top: "نسج",
      hero5_bottom: "خير الأمة!",
      donate_now: "تبرع الآن",
      pilih_bahasa: "اختر اللغة",
      donasiku: "تبرعاتي",
      tentang: "حول",
      beranda: "الصفحة الرئيسية",
      program: "البرنامج",
      amaliyah: "العمل",
      zakat: "الزكاة",
      kuning: "سهولة مشاركة اللطف",
      login: "تسجيل الدخول",
      profil: "ملفي الشخصي",
      cari: "ابحث عن الميزات وبرامج التبرع...",
      menu: "قائمة الطعام",
      notifikasi: "إشعارات",
      layanan: "خدماتنا",
      program_utama: "البرامج الرئيسية",
      hubungi: "اتصل بنا",
      hak_cipta: "جميع الحقوق محفوظة.",
      kalkulator: "حاسبة الزكاة"
    },
    es: {
      hero_top: "Trae",
      hero_bottom: "¡UN MILLÓN DE SONRISAS!",
      donate_now: "Donar Ahora",
      pilih_bahasa: "Seleccionar Idioma",
      donasiku: "Mi Donación",
      tentang: "Acerca de",
      beranda: "Inicio",
      program: "Programa",
      amaliyah: "Práctica",
      zakat: "Zakat",
      kuning: "La facilidad de compartir la bondad",
      login: "Iniciar sesión",
      profil: "Mi Perfil",
      cari: "Buscar funciones y programas de donación...",
      menu: "Menú",
      notifikasi: "Notificaciones"
    },
    "zh-CN": {
      hero_top: "带来",
      hero_bottom: "百万笑容！",
      donate_now: "立即捐款",
      pilih_bahasa: "选择语言",
      donasiku: "我的捐款",
      tentang: "关于",
      beranda: "首页",
      program: "项目",
      amaliyah: "实践",
      zakat: "天课",
      kuning: "轻松传递善意",
      login: "登录",
      profil: "我的个人资料",
      cari: "搜索功能和捐赠项目...",
      menu: "菜单",
      notifikasi: "通知"
    }
  };

  const t = (key: string) => {
    return (T as any)[currentLang]?.[key] || (T as any)['id']?.[key] || key;
  };

  const handleLanguageChange = (langCode: string) => {
    setCurrentLang(langCode);
    setIsLangMenuOpen(false);

    // Set cookies for Google Translate as fallback for dynamic content
    if (langCode === 'id') {
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
    } else {
      document.cookie = `googtrans=/id/${langCode}; path=/;`;
      document.cookie = `googtrans=/id/${langCode}; path=/; domain=${window.location.hostname};`;
      document.cookie = `googtrans=/id/${langCode}; path=/; domain=.${window.location.hostname};`;
    }

    const select = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
    if (select) {
      select.value = langCode;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      // Small Delay before reload to ensure Google Translate starts but we keep our UI
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } else {
      setTimeout(() => {
        window.location.reload();
      }, 300);
    }
  };

  const [prayers, setPrayers] = useState(INITIAL_PRAYERS);
  const [newPrayerMessage, setNewPrayerMessage] = useState('');
  const [isGeneratingPrayer, setIsGeneratingPrayer] = useState(false);
  const [donationAmount, setDonationAmount] = useState('100.000');
  const [isDonationSuccess, setIsDonationSuccess] = useState(false);
  const [showPaymentInstructions, setShowPaymentInstructions] = useState(false);

  useEffect(() => {
    if (isDonationSuccess && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const prayerText = "Alhamdulillah. Jazakumullahu Khairan Sahabat Dakwah. Semoga Allah memberikan pahala atas apa yang engkau berikan, dan memberikan keberkahan atas apa yang engkau simpan, serta menjadikannya sebagai pembersih bagimu. Aamiin yaa robbal 'aalamiin.";
      const utterance = new SpeechSynthesisUtterance(prayerText);
      utterance.lang = 'id-ID';
      utterance.rate = 0.85;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  }, [isDonationSuccess]);
  const [loadingPrograms, setLoadingPrograms] = useState(true);
  const [selectedProgramForDonation, setSelectedProgramForDonation] = useState<Program | null>(null);

  const [qurbanQty, setQurbanQty] = useState(1);
  const [qurbanName, setQurbanName] = useState('');
  const [qurbanLocation, setQurbanLocation] = useState('');
  const [qurbanAnimal, setQurbanAnimal] = useState('');
  const [qurbanProcessing, setQurbanProcessing] = useState('');
  const [qurbanForParents, setQurbanForParents] = useState(false);
  const [donorName, setDonorName] = useState(localStorage.getItem('app_user_name') || '');
  const [donorPhone, setDonorPhone] = useState(localStorage.getItem('app_user_phone') || '');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('shopeepay');
  const [paymentSearchQuery, setPaymentSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTwibbonModalOpen, setIsTwibbonModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileNameInput, setProfileNameInput] = useState(localStorage.getItem('app_user_name') || '');
  const [profilePhoneInput, setProfilePhoneInput] = useState(localStorage.getItem('app_user_phone') || '');

  const saveProfile = () => {
    localStorage.setItem('app_user_name', profileNameInput);
    localStorage.setItem('app_user_phone', profilePhoneInput);
    setDonorName(profileNameInput);
    setDonorPhone(profilePhoneInput);
    setIsProfileModalOpen(false);
    alert('Profil berhasil disimpan');
    window.location.reload(); // Reload to refresh contexts across app
  };

  const finishDonation = async () => {
    setIsDonationSuccess(true);
    setShowPaymentInstructions(false);
    setCartItems([]);
    
    if (selectedProgramForDonation && donorPhone) {
        const uid = donorPhone;
        localStorage.setItem('app_user_phone', donorPhone);
        if (donorName) {
          localStorage.setItem('app_user_name', donorName);
        }

        const valAmount = parseInt(donationAmount.replace(/\D/g, '')) || 0;
        
        const payload = {
            userId: uid,
            date: new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' }),
            program: selectedProgramForDonation.title,
            amount: valAmount,
            status: 'Berhasil',
            method: selectedPaymentMethod === 'shopeepay' ? 'ShopeePay' : 
                    selectedPaymentMethod === 'gopay' ? 'GoPay' : 
                    selectedPaymentMethod === 'bsi' ? 'BSI Virtual Account' : 
                    selectedPaymentMethod === 'bca' ? 'BCA Virtual Account' : selectedPaymentMethod,
            createdAt: serverTimestamp()
        };

        try {
            await addDoc(collection(db, 'users', uid, 'donations'), payload);
            
            // Simpan profil donatur
            await setDoc(doc(db, 'users', uid), {
                name: donorName || 'Hamba Allah',
                phone: donorPhone || '',
                updatedAt: serverTimestamp()
            }, { merge: true });
        } catch (error) {
            handleFirestoreError(error, OperationType.CREATE, `users/${uid}/donations`);
            // Fallback for UI if rules are not propagated
            setUserDonations((prev: any[]) => [{
                ...payload,
                id: 'mock-' + Date.now(),
                createdAt: { toDate: () => new Date() } // Mock timestamp
            }, ...prev]);
        }
    }

    if (newPrayerMessage.trim()) {
      const newPrayer = {
        id: Date.now(),
        name: donorName || 'Hamba Allah',
        message: newPrayerMessage.trim(),
        timeAgo: 'Baru saja',
        amins: 0
      };
      setPrayers(prev => [newPrayer, ...prev]);
      setNewPrayerMessage('');
    }

    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
    
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 2000, colors: ['#10b981', '#059669', '#f59e0b', '#fbbf24', '#fcd34d'] };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);
      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  };
  const [isZakatCalculatorOpen, setIsZakatCalculatorOpen] = useState(false);
  const [liveTransactionIndex, setLiveTransactionIndex] = useState(-1);
  const [showLiveTransaction, setShowLiveTransaction] = useState(false);
  const [historyTab, setHistoryTab] = useState('Semua');
  const [userDonations, setUserDonations] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    let unsubSnap = () => {};
    const savedPhone = localStorage.getItem('app_user_phone');
    setUser(savedPhone ? { uid: savedPhone } : null);
    
    if (savedPhone) {
      const q = query(
        collection(db, 'users', savedPhone, 'donations'), 
        orderBy('createdAt', 'desc')
      );
      unsubSnap = onSnapshot(q, (snapshot) => {
        const history: any[] = [];
        snapshot.forEach(doc => {
          history.push({ 
            id: doc.id, 
            ...doc.data(), 
            date: doc.data().date || new Date().toLocaleDateString('id-ID')
          });
        });
        setUserDonations(history);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, `users/${savedPhone}/donations`);
      });
    } else {
      setUserDonations([]);
    }
    
    return () => {
      unsubSnap();
    };
  }, []);
  const [impactTab, setImpactTab] = useState<'infografis' | 'peta' | 'peta_qurban' | 'galeri'>('infografis');
  const [selectedGalleryItem, setSelectedGalleryItem] = useState<typeof GALLERY_ITEMS[0] | null>(null);
  
  // Zakat Calculator Advanced States
  const [zakatTab, setZakatTab] = useState<'penghasilan' | 'maal' | 'perdagangan' | 'saham' | 'rikaz' | 'fidyah'>('penghasilan');
  const [goldPrice, setGoldPrice] = useState('1350000'); // default Rp 1.350.000 / gram
  const [isFetchingGold, setIsFetchingGold] = useState(false);
  const [fidyahDays, setFidyahDays] = useState('');
  const [fidyahRate, setFidyahRate] = useState('60000');
  const [fidyahType, setFidyahType] = useState<'fidyah' | 'kafarat'>('fidyah');

  const handleAamiin = (id: number) => {
    setPrayers(prev => prev.map(p => p.id === id ? { ...p, amins: p.amins + 1 } : p));
  };

  const handleGeneratePrayer = async () => {
    setIsGeneratingPrayer(true);
    try {
      const apiKey = process.env.GEMINI_API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("Gemini API key is missing");
      }
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: "Rangkaikan doa yang singkat (maks 2-3 kalimat), menyentuh, islami, dan tulus untuk penerima infak/sedekah dan kebaikan donatur. Bahasa Indonesia. Jangan pakai koma atau kutip berlebihan.",
      });
      if (response.text) {
        setNewPrayerMessage(response.text.replace(/["']/g, "").trim());
      }
    } catch (error) {
      console.error("Failed to generate prayer:", error);
    } finally {
      setIsGeneratingPrayer(false);
    }
  };

  // Penghasilan States
  const [zakatIncome, setZakatIncome] = useState('');
  const [zakatBonus, setZakatBonus] = useState('');

  // Maal States
  const [maalTabungan, setMaalTabungan] = useState('');
  const [maalEmas, setMaalEmas] = useState(''); 
  const [maalProperti, setMaalProperti] = useState(''); 
  const [maalHutang, setMaalHutang] = useState(''); 

  // Perdagangan States
  const [dagangModal, setDagangModal] = useState('');
  const [dagangUntung, setDagangUntung] = useState('');
  const [dagangPiutang, setDagangPiutang] = useState('');
  const [dagangHutang, setDagangHutang] = useState('');

  // Saham States
  const [sahamNilai, setSahamNilai] = useState('');
  const [sahamDividen, setSahamDividen] = useState('');

  // Rikaz States
  const [rikazNilai, setRikazNilai] = useState('');

  useEffect(() => {
    if (isZakatCalculatorOpen && !isFetchingGold) {
      setIsFetchingGold(true);
      // Hardcode gold price as the API is currently down causing Failed to fetch errors
      setGoldPrice('1350000');
      setIsFetchingGold(false);
    }
  }, [isZakatCalculatorOpen]);

  // Calculate Zakat
  const getZakatDetails = () => {
    const price = parseInt(goldPrice.replace(/\D/g, '')) || 1350000;
    const nisabTahun = price * 85; 
    const nisabBulan = nisabTahun / 12;

    let totalAsset = 0;
    let requiredNisab = nisabTahun;
    let zakatAmmount = 0;
    let isEligible = false;

    if (zakatTab === 'penghasilan') {
        const income = parseInt(zakatIncome.replace(/\D/g, '')) || 0;
        const bonus = parseInt(zakatBonus.replace(/\D/g, '')) || 0;
        totalAsset = income + bonus;
        requiredNisab = nisabBulan;
        isEligible = totalAsset >= requiredNisab;
        if (isEligible) zakatAmmount = totalAsset * 0.025;
    } else if (zakatTab === 'maal') {
        const t = parseInt(maalTabungan.replace(/\D/g, '')) || 0;
        const e = parseInt(maalEmas.replace(/\D/g, '')) || 0;
        const p = parseInt(maalProperti.replace(/\D/g, '')) || 0;
        const h = parseInt(maalHutang.replace(/\D/g, '')) || 0;
        totalAsset = t + e + p - h;
        requiredNisab = nisabTahun;
        isEligible = totalAsset >= requiredNisab;
        if (isEligible) zakatAmmount = totalAsset * 0.025;
    } else if (zakatTab === 'perdagangan') {
        const m = parseInt(dagangModal.replace(/\D/g, '')) || 0;
        const u = parseInt(dagangUntung.replace(/\D/g, '')) || 0;
        const p = parseInt(dagangPiutang.replace(/\D/g, '')) || 0;
        const h = parseInt(dagangHutang.replace(/\D/g, '')) || 0;
        totalAsset = m + u + p - h;
        requiredNisab = nisabTahun;
        isEligible = totalAsset >= requiredNisab;
        if (isEligible) zakatAmmount = totalAsset * 0.025;
    } else if (zakatTab === 'saham') {
        const s = parseInt(sahamNilai.replace(/\D/g, '')) || 0;
        const d = parseInt(sahamDividen.replace(/\D/g, '')) || 0;
        totalAsset = s + d;
        requiredNisab = nisabTahun;
        isEligible = totalAsset >= requiredNisab;
        if (isEligible) zakatAmmount = totalAsset * 0.025;
    } else if (zakatTab === 'rikaz') {
        const r = parseInt(rikazNilai.replace(/\D/g, '')) || 0;
        totalAsset = r;
        requiredNisab = 0;
        isEligible = totalAsset > 0;
        if (isEligible) zakatAmmount = totalAsset * 0.20;
    } else if (zakatTab === 'fidyah') {
        const days = parseInt(fidyahDays.replace(/\D/g, '')) || 0;
        const rate = parseInt(fidyahRate.replace(/\D/g, '')) || 0;
        totalAsset = days * rate;
        requiredNisab = 0;
        isEligible = totalAsset > 0;
        if (isEligible) zakatAmmount = totalAsset;
    }

    return { totalAsset, requiredNisab, isEligible, zakatAmmount };
  };

  const { totalAsset, requiredNisab, isEligible: isEligibleZakat, zakatAmmount: zakatToPay } = getZakatDetails();



  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  useEffect(() => {
    // Simulate fetching data
    const timer = setTimeout(() => {
      setLoadingPrograms(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(slideTimer);
  }, []);

  useEffect(() => {
    // Show first notification after 5 seconds
    const initialTimer = setTimeout(() => {
      setLiveTransactionIndex(0);
      setShowLiveTransaction(true);
      
      // Hide after 4 seconds
      setTimeout(() => setShowLiveTransaction(false), 4000);
    }, 5000);

    const intervalTimer = setInterval(() => {
      setLiveTransactionIndex(prev => {
        const next = (prev + 1) % LIVE_TRANSACTIONS.length;
        setShowLiveTransaction(true);
        setTimeout(() => setShowLiveTransaction(false), 4000);
        return next;
      });
    }, 12000); // Trigger every 12 seconds
    
    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalTimer);
    };
  }, []);

  useEffect(() => {
    // Initialize Google Translate only once
    const addGoogleTranslateScript = () => {
      if (document.getElementById('google-translate-script')) return;
      
      (window as any).googleTranslateElementInit = () => {
        new (window as any).google.translate.TranslateElement({
          pageLanguage: 'id',
          includedLanguages: 'en,es,ar,zh-CN,id,ja,ko,ms,my,th,vi,fr,de,tr',
          layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE
        }, 'google_translate_element');
      };
      
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    };
    addGoogleTranslateScript();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  
  return (
    <div className="min-h-screen font-sans">
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: "-50%", scale: 0.95 }}
            animate={{ opacity: 1, y: 0, x: "-50%", scale: 1 }}
            exit={{ opacity: 0, y: -30, x: "-50%", scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="fixed top-6 left-1/2 z-[150] w-full max-w-md px-4"
          >
            <div className="bg-emerald-500 rounded-xl shadow-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm leading-tight">{toastMessage}</h4>
                  <p className="text-emerald-100 text-xs mt-1">Jazakumullah Khairan Katsiran.</p>
                </div>
              </div>
              <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.05 }} onClick={() => setShowToast(false)} className="transition-all duration-300 text-white/80 hover:text-white transition-colors p-1 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:brightness-110 active:scale-95">
                <X className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      {!location.pathname.startsWith('/program/') && (
      <nav 
        aria-label="Navigasi Utama"
        className={`fixed left-0 right-0 z-50 transition-all duration-500 ease-in-out px-4 md:px-6 ${
          isScrolled ? 'top-2 md:top-4' : 'top-4 md:top-6'
        }`}
      >
        <div className={`max-w-7xl mx-auto flex items-center justify-between transition-all duration-500 ease-in-out rounded-full ${
          isScrolled 
            ? 'bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white/40 dark:border-slate-800/40 px-2.5 md:px-3 py-2 md:py-2.5' 
            : 'bg-transparent px-0 py-0'
        }`}>
          {/* Logo Pill */}
          <div 
            className={`${isSearchOpen ? 'hidden md:flex' : 'flex'} items-center gap-2 cursor-pointer group rounded-full transition-all duration-500 ease-out ${
              isScrolled 
                ? 'px-1.5'
                : 'bg-white dark:bg-slate-800 px-3 md:px-4 py-1.5 md:py-2 shadow-lg shadow-black/5 border border-white/40 dark:border-slate-700' 
            }`}
            onClick={() => {
              navigate('/');
              window.scrollTo(0,0);
            }}
          >
            <img src="/logo-kecil (1).png" alt="Logo" className={`h-7 md:h-8 object-contain transition-all duration-300 dark:brightness-0 dark:invert dark:drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]`} />
          </div>

          <div className={`${isSearchOpen ? 'w-full md:w-auto' : ''} flex items-center gap-1.5 md:gap-2`}>
            <div className={`relative ${isSearchOpen ? 'w-full flex-1' : ''}`}>
              {isSearchOpen ? (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: '100%' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="flex items-center gap-2 w-full"
                >
                  <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder={t('cari')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 shadow-sm transition-all text-slate-800 dark:text-slate-200`}
                      autoFocus
                    />
                    
                    {/* Global Search Dropdown */}
                    <AnimatePresence>
                      {searchQuery.trim().length > 0 && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute w-full mt-2 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-[100] max-h-[400px] overflow-y-auto"
                        >
                          {(() => {
                            const query = searchQuery.toLowerCase();
                            
                            const pages = [
                              { title: 'Al-Quran', path: '/quran', icon: BookOpen },
                              { title: 'Amaliyah', path: '/amaliyah', icon: Heart },
                              { title: 'Zakat', path: '/zakat', icon: HandCoins },
                              { title: 'Qurban', path: '/qurban', icon: Heart },
                              { title: 'Locator Masjid', path: '/mosques', icon: MapPin },
                              { title: 'Jadwal Sholat & Kiblat', path: '/sholat', icon: Compass },
                              { title: 'Pengajuan Bantuan', path: '/pengajuan-bantuan', icon: FileCheck2 },
                              { title: 'Riwayat Donasi', path: '/history', icon: HistoryIcon },
                            ].filter(p => p.title.toLowerCase().includes(query));

                            const progs = EXTENDED_PROGRAMS.filter(p => p.title.toLowerCase().includes(query) || p.category.toLowerCase().includes(query)).slice(0, 5);

                            if (pages.length === 0 && progs.length === 0) {
                              return <div className="p-4 text-center text-sm text-slate-500">Pencarian tidak ditemukan</div>;
                            }

                            return (
                              <div className="py-2">
                                {pages.length > 0 && (
                                  <div className="mb-2">
                                    <h4 className="px-4 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fitur Aplikasi</h4>
                                    {pages.map((p, i) => {
                                      const Icon = p.icon;
                                      return (
                                        <button 
                                          key={i}
                                          onClick={() => {
                                            navigate(p.path);
                                            setIsSearchOpen(false);
                                            setSearchQuery('');
                                            window.scrollTo(0,0);
                                          }}
                                          className="flex items-center w-full px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-left transition-colors"
                                        >
                                          <Icon className="w-4 h-4 mr-3 text-primary-500" />
                                          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{p.title}</span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}
                                
                                {progs.length > 0 && (
                                  <div>
                                    <h4 className="px-4 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Program Donasi</h4>
                                    {progs.map((p) => (
                                      <button 
                                        key={p.id}
                                        onClick={() => {
                                          navigate(`/program/${p.id}`);
                                          setIsSearchOpen(false);
                                          setSearchQuery('');
                                          window.scrollTo(0,0);
                                        }}
                                        className="flex items-center w-full px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-left transition-colors"
                                      >
                                        <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 mr-3">
                                          <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="overflow-hidden">
                                          <h5 className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{p.title}</h5>
                                          <p className="text-[10px] text-slate-500 capitalize">{p.category}</p>
                                        </div>
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.05 }}
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className={`transition-all duration-300 flex items-center justify-center rounded-full transition-all duration-300 w-8 h-8 md:w-9 md:h-9 shrink-0 hover:bg-black/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200`}
                    aria-label="Tutup pencarian"
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                </motion.div>
              ) : (
                <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.05 }}
                  onClick={() => setIsSearchOpen(true)}
                  aria-label="Buka pencarian"
                  className={`transition-all duration-300 relative flex items-center justify-center rounded-full transition-all duration-300 ${
                    isScrolled ? 'w-8 h-8 xl:w-9 xl:h-9 hover:bg-black/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200' : 'w-8 h-8 xl:w-9 xl:h-9 bg-white dark:bg-slate-800 shadow-lg shadow-black/5 border border-white/40 dark:border-slate-700 text-primary-500 hover:scale-105'
                  }`}
                >
                  <Search className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
                </motion.button>
              )}
            </div>

            {/* Native Google Translate Element (Hidden via CSS) */}
            <div id="google_translate_element" style={{ opacity: 0, position: 'absolute', zIndex: -1 }}></div>
            
            {/* Custom Language Selector */}
            <div className={`relative ${isSearchOpen ? 'hidden' : 'block'}`}>
              <motion.button 
                whileTap={{ scale: 0.95 }} 
                whileHover={{ scale: 1.05 }}
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className={`transition-all duration-300 relative flex items-center justify-center rounded-full overflow-hidden ${
                  isScrolled ? 'w-8 h-8 xl:w-9 xl:h-9 hover:bg-black/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200' : 'w-8 h-8 xl:w-9 xl:h-9 bg-white dark:bg-slate-800 shadow-lg shadow-black/5 border border-white/40 dark:border-slate-700 text-primary-500 hover:scale-105'
                }`}
                title="Pilih Bahasa / Change Language"
              >
                <Globe className="w-3.5 h-3.5 xl:w-4 xl:h-4 shrink-0" />
              </motion.button>

              <AnimatePresence>
                {isLangMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40 bg-transparent" 
                      onClick={() => setIsLangMenuOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50 py-2"
                    >
                      <div className="px-3 pb-2 mb-2 border-b border-slate-100 dark:border-slate-700">
                        <p className="text-[10px] font-black tracking-widest text-slate-400 dark:text-slate-500 uppercase">{t('pilih_bahasa')}</p>
                      </div>
                      <div className="max-h-[300px] overflow-y-auto px-1 scrollbar-hide">
                        {LANGUAGES.map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => handleLanguageChange(lang.code)}
                            className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-xl transition-colors ${
                              currentLang === lang.code 
                                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-bold' 
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                            }`}
                          >
                            <span className="text-base w-8 h-8 flex items-center justify-center bg-slate-100 dark:bg-slate-700 rounded-full shadow-sm">{lang.flag}</span>
                            <span className="flex-1 text-left">{lang.name}</span>
                            {currentLang === lang.code && <CheckCircle2 className="w-4 h-4" />}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Dark Mode Toggle - Hidden on desktop bar, available in menu */}
            <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.05 }}
              onClick={() => setIsDarkMode(!isDarkMode)}
              aria-label={isDarkMode ? "Beralih ke Mode Terang" : "Beralih ke Mode Gelap"}
              className={`transition-all duration-300 sm:hidden relative flex items-center justify-center rounded-full ${isSearchOpen ? 'hidden' : ''} ${
                isScrolled ? 'w-8 h-8 xl:w-9 xl:h-9 hover:bg-black/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200' : 'w-8 h-8 xl:w-9 xl:h-9 bg-white dark:bg-slate-800 shadow-lg shadow-black/5 border border-white/40 dark:border-slate-700 text-primary-500 hover:scale-105'
              }`}
            >
              {isDarkMode ? <Sun className="w-3.5 h-3.5 xl:w-4 xl:h-4" /> : <Moon className="w-3.5 h-3.5 xl:w-4 xl:h-4" />}
            </motion.button>

            {/* User Profile Button */}
            <motion.button 
              onClick={() => setIsProfileModalOpen(true)}
              aria-label="Profil User"
              title="Profil User"
              className={`transition-all duration-300 ${isSearchOpen ? 'hidden md:flex' : 'flex'} relative items-center justify-center rounded-full transition-all duration-300 ${ isScrolled ? 'w-8 h-8 xl:w-9 xl:h-9 hover:bg-black/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200' : 'w-8 h-8 xl:w-9 xl:h-9 bg-white dark:bg-slate-800 shadow-lg shadow-black/5 border border-white/40 dark:border-slate-700 text-primary-500 ' } transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95`} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <UserCircle className="w-3.5 h-3.5 xl:w-4 xl:h-4 flex-shrink-0" />
            </motion.button>

            {/* Shopping Bag / Kantung Donasi */}
            <motion.button 
              onClick={() => setIsCartOpen(true)}
              aria-label={`Kantung Kebaikan dengan ${cartItems.length} titipan`}
              title="Kantung Kebaikan"
              className={`transition-all duration-300 ${isSearchOpen ? 'hidden md:flex' : 'flex'} relative items-center justify-center rounded-full transition-all duration-300 ${ isScrolled ? 'w-8 h-8 xl:w-9 xl:h-9 hover:bg-black/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200' : 'w-8 h-8 xl:w-9 xl:h-9 bg-white dark:bg-slate-800 shadow-lg shadow-black/5 border border-white/40 dark:border-slate-700 text-primary-500 ' } transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95`} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <ShoppingBag className="w-3.5 h-3.5 xl:w-4 xl:h-4 flex-shrink-0" />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] xl:text-[9px] w-3.5 h-3.5 md:w-3.5 md:h-3.5 xl:w-4 xl:h-4 rounded-full flex items-center justify-center font-bold shadow-sm border border-white dark:border-slate-900 pointer-events-none">{cartItems.length}</span>
              )}
            </motion.button>

            {/* Donate Button */}
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                navigate('/donasi');
                window.scrollTo(0,0);
              }}
              className={`transition-all duration-300 hidden md:flex items-center justify-center gap-2 rounded-full font-bold text-[10px] xl:text-[12px] transition-all duration-300 ${
              isScrolled 
                ? 'bg-[#f29f05] text-white hover:bg-[#d98f04] px-3 xl:px-4 py-1.5 xl:py-2 shadow-md shadow-[#f29f05]/20' 
                : 'bg-[#f29f05] text-white hover:bg-[#d98f04] shadow-lg shadow-[#f29f05]/20 px-3 xl:px-4 py-1.5 xl:py-2 border border-[#f29f05]'
            } hover:scale-105 hover:shadow-lg hover:brightness-110 active:scale-95 whitespace-nowrap`}>
              {t('donate_now')}
            </motion.button>

            {/* Notifications Button - Hidden on desktop bar, available in menu */}
            <div className={`relative ${isSearchOpen ? 'hidden md:block' : ''} md:hidden`}>
              <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.05 }} 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                aria-label="Notifikasi"
                aria-expanded={notificationsOpen}
                aria-haspopup="true"
                aria-controls="notifications-dropdown"
                className={`hidden md:flex relative flex items-center justify-center rounded-full transition-all duration-300 ${
                  isScrolled ? 'w-8 h-8 xl:w-9 xl:h-9 hover:bg-black/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200' : 'w-8 h-8 xl:w-9 xl:h-9 bg-white dark:bg-slate-800 shadow-lg shadow-black/5 border border-white/40 dark:border-slate-700 text-primary-500 hover:scale-105'
                } transition-all duration-300 hover:scale-105 hover:shadow-lg hover:brightness-110 active:scale-95`}>
                <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500 ring-2 ring-white"></div>
                <Bell className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
              </motion.button>
              
              {/* Notifications Dropdown */}
              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div 
                    id="notifications-dropdown"
                    role="menu"
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-900/10 border border-slate-100 dark:border-slate-700 overflow-hidden z-50 origin-top-right transition-colors duration-300"
                  >
                    <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                      <h3 className="font-bold text-slate-800">Notifikasi Program</h3>
                      <motion.button className="transition-all duration-300 text-xs text-primary-600 font-semibold hover:underline transition-all duration-300 hover:shadow-lg" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}>Tandai sudah dibaca</motion.button>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                      {NOTIFICATIONS.map(notif => (
                        <div key={notif.id} className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 ${!notif.read ? 'bg-primary-50/30' : ''}`}>
                          <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!notif.read ? 'bg-primary-500' : 'bg-slate-300'}`}></div>
                          <div>
                            <h4 className={`text-sm ${!notif.read ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'} mb-1`}>{notif.title}</h4>
                            <p className="text-xs text-slate-600 line-clamp-2 mb-2 leading-relaxed">{notif.message}</p>
                            <span className="text-[10px] text-slate-400">{notif.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                      <motion.button className="transition-all duration-300 text-xs font-bold text-slate-600 hover:text-primary-600 transition-all duration-300 hover:shadow-lg" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}>Lihat Semua Notifikasi</motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>


            {/* Dashboard Donatur Button */}
            <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.05 }} 
              onClick={() => {
                navigate('/history');
                window.scrollTo(0, 0);
              }}
              aria-label="Riwayat Donasi"
              title="Riwayat Donasi"
              className={`transition-all duration-300 ${isSearchOpen ? 'hidden md:flex' : 'hidden md:flex'} relative items-center justify-center rounded-full ${
                isScrolled ? 'w-8 h-8 xl:w-9 xl:h-9 hover:bg-black/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200' : 'w-8 h-8 xl:w-9 xl:h-9 bg-white dark:bg-slate-800 shadow-lg shadow-black/5 border border-white/40 dark:border-slate-700 text-primary-500 hover:scale-105'
              } transition-all duration-300 hover:scale-105 hover:shadow-lg hover:brightness-110 active:scale-95 overflow-hidden`}>
              <HistoryIcon className="w-3.5 h-3.5 xl:w-4 xl:h-4 flex-shrink-0" />
            </motion.button>

            {/* Hamburger Menu */}
            <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.05 }} 
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Buka Menu Utama"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              className={`transition-all duration-300 ${isSearchOpen ? 'hidden' : 'flex'} items-center justify-center gap-2 rounded-full transition-all duration-300 ${
                isScrolled ? 'px-2.5 md:px-3 h-8 md:h-9 hover:bg-black/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200' : 'px-3 md:px-4 h-8 md:h-9 bg-white dark:bg-slate-800 shadow-lg shadow-black/5 border border-white/40 dark:border-slate-700 text-primary-500 hover:scale-105'
              } transition-all duration-300 hover:scale-105 hover:shadow-lg hover:brightness-110 active:scale-95`}>
              <span className="hidden sm:inline font-bold text-[10px] uppercase tracking-widest mt-0.5">{t('menu')}</span>
              <Menu className="w-4 h-4 flex-shrink-0" />
            </motion.button>
          </div>
        </div>
      </nav>
      )}

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[55] lg:hidden"
            />
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-xs z-[55] hidden lg:block"
            />
            
            <motion.div 
              id="mobile-menu"
              role="dialog"
              aria-modal="true"
              aria-label="Menu navigasi"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full sm:w-80 md:w-96 z-[60] bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-l border-slate-100 dark:border-slate-800"
            >
            <div className="p-4 flex justify-between items-center bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
               <div className="flex items-center gap-2">
                 <img src="/logo-kecil (1).png" alt="Logo" className="h-8 object-contain dark:brightness-0 dark:invert dark:drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]" />
              </div>
              <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.05 }} 
                onClick={() => setMobileMenuOpen(false)} 
                aria-label="Tutup Menu Mobile"
                className="transition-all duration-300 p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors transition-all duration-300 hover:scale-105 hover:shadow-lg hover:brightness-110 active:scale-95"
              >
                <X className="w-6 h-6" />
              </motion.button>
            </div>
            <div className="flex-1 p-5 lg:p-6 flex flex-col gap-2 overflow-y-auto">
              {[
                { name: t('beranda'), icon: Home, id: 'beranda', path: '/' },
                { name: t('program'), icon: HandHeart, id: 'program', path: '/donasi' },
                { name: t('amaliyah'), icon: LayoutDashboard, path: '/amaliyah' },
                { name: "Qur'an", icon: BookOpen, path: '/quran' },
                { name: t('zakat'), icon: HandCoins, path: '/zakat' },
                { name: 'Qurban', icon: Tent, path: '/qurban' },
                { name: 'Cari Masjid', icon: MapPin, path: '/mosques' },
                { name: 'Sholat & Kiblat', icon: Clock, path: '/sholat' },
                { name: 'Tentang Kami', icon: Info, id: 'tentang-kami' },
                { name: 'Layanan', icon: Component, id: 'layanan' },
                { name: 'Laporan', icon: TrendingUp, path: '/laporan' },
                { name: 'Artikel', icon: FileText, id: 'artikel' }
              ].map((item) => (
                <motion.button whileTap={{ scale: 0.98 }} whileHover={{ scale: 1.02 }} 
                  key={item.name} 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (item.path) {
                        navigate(item.path);
                        window.scrollTo(0,0);
                    } else {
                        if (location.pathname !== '/') {
                            navigate('/');
                            setTimeout(() => document.getElementById(item.id!)?.scrollIntoView({ behavior: 'smooth' }), 100);
                        } else {
                            document.getElementById(item.id!)?.scrollIntoView({ behavior: 'smooth' });
                        }
                    }
                  }} 
                  className="w-full text-left text-[15px] font-bold text-slate-700 dark:text-slate-200 hover:text-[#1799dc] dark:hover:text-[#1799dc] hover:bg-slate-50 dark:hover:bg-slate-800/50 p-2.5 rounded-xl flex items-center gap-3 transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[#1799dc] shrink-0">
                    <item.icon className="w-4 h-4" />
                  </div>
                  <span className="flex-1 truncate">{item.name}</span>
                </motion.button>
              ))}
              
              <div className="h-px w-full bg-slate-100 dark:bg-slate-800/80 my-3"></div>
              
              <motion.button whileTap={{ scale: 0.98 }} whileHover={{ scale: 1.02 }} 
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/history');
                  window.scrollTo(0, 0);
                }} 
                className="w-full text-left text-[15px] font-bold text-slate-700 dark:text-slate-200 hover:text-[#1799dc] dark:hover:text-[#1799dc] hover:bg-slate-50 dark:hover:bg-slate-800/50 p-2.5 rounded-xl flex items-center gap-3 transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[#1799dc] shrink-0">
                  <UserCircle className="w-4 h-4" />
                </div>
                <span className="flex-1 truncate">Dashboard Donatur</span>
              </motion.button>

              <motion.button whileTap={{ scale: 0.98 }} whileHover={{ scale: 1.02 }} 
                onClick={() => {
                  setMobileMenuOpen(false);
                  window.scrollTo(0,0);
                }} 
                className="w-full text-left text-[15px] font-bold text-slate-700 dark:text-slate-200 hover:text-[#1799dc] dark:hover:text-[#1799dc] hover:bg-slate-50 dark:hover:bg-slate-800/50 p-2.5 rounded-xl flex items-center gap-3 transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[#1799dc] shrink-0">
                  <Bell className="w-4 h-4" />
                </div>
                <span className="flex-1 truncate">Notifikasi</span>
                <span className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[9px] font-bold bg-red-500 text-white rounded-full px-2 py-0.5">1 Baru</span>
                </span>
              </motion.button>
              
              <motion.button whileTap={{ scale: 0.98 }} whileHover={{ scale: 1.02 }} 
                onClick={() => setIsDarkMode(!isDarkMode)} 
                className="w-full text-left text-[15px] font-bold text-slate-700 dark:text-slate-200 hover:text-[#1799dc] dark:hover:text-[#1799dc] hover:bg-slate-50 dark:hover:bg-slate-800/50 p-2.5 rounded-xl flex items-center gap-3 transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[#1799dc] shrink-0">
                  {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                </div>
                <span className="flex-1 truncate">Tema Gelap</span>
                <div className={`shrink-0 w-9 h-5 rounded-full flex items-center transition-colors ${isDarkMode ? 'bg-[#1799dc]' : 'bg-slate-300 dark:bg-slate-700'}`}>
                  <div className={`w-3.5 h-3.5 bg-white rounded-full mx-0.5 shadow-sm transform transition-transform ${isDarkMode ? 'translate-x-4' : 'translate-x-0'}`}></div>
                </div>
              </motion.button>
              
              <div className="mt-auto pt-8 flex flex-col gap-3">
                <motion.button className="w-full py-3.5 rounded-xl bg-[#1799dc] hover:bg-[#1588c4] active:bg-[#137ab0] text-white font-bold text-base shadow-lg shadow-[#1799dc]/20 transition-all" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  Mulai Sedekah
                </motion.button>
                <div className="flex justify-center gap-5 text-slate-400 dark:text-slate-500 mt-2 pb-4">
                  <motion.a href="#" className="hover:text-[#1799dc] transition-colors" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}><Facebook className="w-5 h-5" /></motion.a>
                  <motion.a href="#" className="hover:text-[#1799dc] transition-colors" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}><Instagram className="w-5 h-5" /></motion.a>
                  <motion.a href="#" className="hover:text-[#1799dc] transition-colors" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}><Youtube className="w-5 h-5" /></motion.a>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
      </AnimatePresence>

      <Routes>
        <Route path="/program/:id" element={
          <ProgramDetailPage 
            onQuickDonate={(prog, amt) => {
              setSelectedProgramForDonation(prog);
              setQurbanName('');
              setQurbanQty(1);
              setDonationAmount(amt);
            }} 
            onAddToCart={handleAddToCart}
            cartItemCount={cartItems.length}
            onOpenCart={() => setIsCartOpen(true)}
          />
        } />
        <Route path="/donasi" element={
          <DonasiPage 
            onAddToCart={handleAddToCart} 
            onQuickDonate={(prog, amt) => {
              setSelectedProgramForDonation(prog);
              setQurbanName('');
              setQurbanQty(1);
              setDonationAmount(amt);
            }} 
          />
        } />
        <Route path="/" element={
          <>
      {/* Hero Section */}
      <div id="beranda" className="relative flex flex-col pt-24 md:pt-32 pb-8 bg-[#eaf4fc]/40 dark:bg-slate-950 transition-colors duration-300">
        
        {/* Dark Top Background / Banner Area */}
        <div className="absolute top-0 left-0 right-0 h-[600px] md:h-[650px] lg:h-[70vh] max-h-[800px] rounded-b-[40px] md:rounded-b-[60px] overflow-hidden shadow-sm bg-slate-900">
           <AnimatePresence>
             <motion.img 
               key={`bg-${currentSlideIndex}`}
               initial={{ opacity: 0 }}
               animate={{ opacity: 0.15 }}
               exit={{ opacity: 0 }}
               transition={{ duration: 1.5, ease: "easeInOut" }}
               src={HERO_SLIDES[currentSlideIndex].image} 
               style={{ y: heroImageY }}
               className="absolute w-full h-[150%] -top-[25%] object-cover mix-blend-screen blur-[2px]"
               alt=""
             />
           </AnimatePresence>
           <div className="absolute inset-0 bg-gradient-to-b from-[#1070a2]/95 via-[#1588c4]/90 to-[#1799dc] dark:from-slate-900/95 dark:via-slate-800/95 dark:to-slate-800/95"></div>
           {/* Decorative patterns */}
           <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle, #fff 2px, transparent 2px)', backgroundSize: '24px 24px' }}></div>
           <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-[80px] translate-x-1/3 -translate-y-1/3"></div>
           <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-white/5 rounded-full blur-[60px] -translate-x-1/3 translate-y-1/3"></div>
        </div>

        {/* Main Content Wrapper */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 flex flex-col items-center flex-1">
          
          {/* Headline and Slider Top Section */}
          <div className="flex flex-col lg:flex-row items-center justify-between w-full gap-8 lg:gap-12 mb-10 md:mb-12 mt-2">
             
             {/* Left Text */}
             <div className="text-center lg:text-left flex-1 lg:pr-4 w-full flex flex-col items-center lg:items-start max-w-2xl lg:max-w-none mx-auto min-h-[300px] justify-center lg:justify-start">
               <span className="inline-block px-3 py-1 bg-white/10 dark:bg-black/20 text-white backdrop-blur-md rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider mb-4 border border-white/10 shadow-sm">
                 Laznas Dewan Dakwah
               </span>
               <AnimatePresence mode="wait">
                 <motion.div
                   key={currentSlideIndex}
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -20 }}
                   transition={{ duration: 0.6, ease: "easeOut" }}
                   className="flex flex-col items-center lg:items-start"
                 >
                   <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-4 tracking-tight drop-shadow-md leading-[1.15]">
                     <span className="text-[#f29f05] block">
                       {currentSlideIndex === 0 ? t('hero_top') : 
                         currentSlideIndex === 1 ? t('hero2_top') :
                         currentSlideIndex === 2 ? t('hero3_top') :
                         currentSlideIndex === 3 ? t('hero4_top') :
                         currentSlideIndex === 4 ? t('hero5_top') :
                         HERO_SLIDES[currentSlideIndex].topText}

                     </span>
                     {currentSlideIndex === 0 ? t('hero_bottom') : 
                       currentSlideIndex === 1 ? t('hero2_bottom') :
                       currentSlideIndex === 2 ? t('hero3_bottom') :
                       currentSlideIndex === 3 ? t('hero4_bottom') :
                       currentSlideIndex === 4 ? t('hero5_bottom') :
                       HERO_SLIDES[currentSlideIndex].bottomText}

                   </h1>
                   <p className="text-[#eaf4fc] dark:text-slate-300 text-sm md:text-base max-w-xl font-medium mb-8 drop-shadow-sm leading-relaxed">
                     Tunaikan Zakat, Infak, dan Sedekah dengan mudah, aman, dan transparan untuk meluaskan kebermanfaatan umat bersama kami.
                   </p>
                   <motion.button 
                       whileHover={{ scale: 1.05 }}
                       whileTap={{ scale: 0.95 }}
                       onClick={() => {
                         navigate('/donasi');
                         window.scrollTo(0,0);
                       }}
                       className="bg-[#f29f05] hover:bg-[#d98f04] text-white font-bold py-3.5 md:py-4 px-8 md:px-10 rounded-full shadow-[0_8px_20px_rgba(242,159,5,0.4)] text-sm md:text-base tracking-wide transition-all uppercase relative z-20"
                   >
                       Donasi Sekarang
                   </motion.button>
                 </motion.div>
               </AnimatePresence>
             </div>

             {/* Right Slider */}
             <div className="w-full max-w-[340px] sm:max-w-[400px] md:max-w-[440px] lg:max-w-[500px]">
                <div className="relative aspect-[4/3] w-full rounded-[32px] md:rounded-[40px] overflow-hidden shadow-2xl border-4 md:border-8 border-white/20 dark:border-white/10 group">
                  <AnimatePresence>
                    <motion.img 
                      key={`img-${currentSlideIndex}`}
                      initial={{ opacity: 0, scale: 1.05 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1.2, ease: "easeInOut" }}
                      src={HERO_SLIDES[currentSlideIndex].image} 
                      className="absolute inset-0 w-full h-full object-cover" 
                      alt="Berbagi Kebaikan" 
                    />
                  </AnimatePresence>
                  
                  {/* Decorative Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>

                  {/* Slider Controls Inside */}
                  <div className="absolute bottom-5 left-0 right-0 flex justify-center gap-2 z-20">
                     {HERO_SLIDES.map((_, idx) => (
                       <button 
                        key={idx}
                        onClick={() => setCurrentSlideIndex(idx)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${currentSlideIndex === idx ? 'w-8 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'}`}
                       />
                     ))}
                  </div>

                  {/* Prev/Next arrows */}
                  <button 
                    onClick={() => setCurrentSlideIndex(prev => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-[#f29f05] backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all z-20 shadow-lg"
                  >
                     <ArrowRight className="w-5 h-5 rotate-180" strokeWidth={2.5} />
                  </button>
                  <button 
                    onClick={() => setCurrentSlideIndex(prev => (prev + 1) % HERO_SLIDES.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-[#f29f05] backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all z-20 shadow-lg"
                  >
                     <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
                  </button>
                </div>
             </div>

          </div>

          {/* Enhanced Mobile-Friendly Impact Card */}
          <div className="bg-white dark:bg-slate-800 rounded-[28px] shadow-2xl shadow-[#1799dc]/10 dark:shadow-slate-900/50 w-full max-w-[850px] mx-auto mt-8 mb-4 relative border border-[#1799dc]/10 dark:border-slate-700 overflow-hidden flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-700/50 group">
             
             {/* Total Penyaluran & Manfaat - Super Compact */}
             <div className="p-5 md:px-6 md:py-6 flex-1 flex items-center justify-between gap-4 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-800/80">
                <div>
                   <p className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5 text-[#1799dc]" /> Penyaluran</p>
                   <h2 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white leading-none">26.5 <span className="text-sm font-bold text-slate-500">Miliar+</span></h2>
                </div>
                <div className="text-right">
                   <p className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center justify-end gap-1.5 justify-end"><Heart className="w-3.5 h-3.5 text-emerald-500" /> Penerima</p>
                   <h2 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white leading-none">1.2 <span className="text-sm font-bold text-slate-500">Juta+</span></h2>
                </div>
             </div>

             {/* Live Trans Notification (Merged into same layout) */}
             <div className="p-4 md:px-6 md:py-5 flex-[1.2] flex items-center bg-slate-50/50 dark:bg-slate-800/30">
               <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex flex-shrink-0 items-center justify-center mr-3 md:mr-4 relative">
                  <span className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-emerald-500 absolute top-0 right-0 border-2 border-white dark:border-slate-800"></span>
                  <Heart className="w-4 h-4 md:w-5 md:h-5 text-emerald-600 dark:text-emerald-400" />
               </div>
               <div className="flex-1 overflow-hidden h-10 md:h-12 relative cursor-pointer" onClick={() => {
                 document.getElementById('doa-terbaru')?.scrollIntoView({ behavior: 'smooth' });
               }}>
                  <AnimatePresence mode="popLayout">
                    {showLiveTransaction && liveTransactionIndex >= 0 && LIVE_TRANSACTIONS[liveTransactionIndex] ? (
                    <motion.div
                      key={liveTransactionIndex}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0 flex flex-col justify-center"
                    >
                      <p className="text-[11px] md:text-sm text-slate-700 dark:text-slate-300 leading-tight md:leading-snug">
                        <span className="font-bold">{LIVE_TRANSACTIONS[liveTransactionIndex].name}</span> {LIVE_TRANSACTIONS[liveTransactionIndex].action}
                      </p>
                      <span className="text-[9px] md:text-[11px] text-slate-400 font-medium md:mt-0.5">{LIVE_TRANSACTIONS[liveTransactionIndex].time}</span>
                    </motion.div>
                    ) : (
                    <motion.div
                      key="default"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex flex-col justify-center"
                    >
                      <p className="text-[11px] md:text-sm text-slate-500 dark:text-slate-400 leading-snug">Berbagi kebahagiaan dan siapkan bekal akhirat Anda dengan donasi terbaik hari ini.</p>
                    </motion.div>
                    )}
                  </AnimatePresence>
               </div>
             </div>
             
             {/* CTA -> Opens Laporan Transparansi page */}
             <div 
               onClick={() => {
                 navigate('/laporan');
                 window.scrollTo(0,0);
               }}
               className="hidden md:flex w-20 bg-[#f29f05] hover:bg-[#d98f04] transition-colors items-center justify-center text-white cursor-pointer"
             >
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1.5 transition-transform duration-300" />
             </div>
          </div>

          {/* Quick Menu Grid */}
          <div className="w-full max-w-[600px] mx-auto mt-8 mb-12 flex-1">
             <div className="grid grid-cols-4 gap-y-6 md:gap-y-8 gap-x-2 md:gap-x-4">
               {[
                  { icon: HandCoins, label: 'Zakat', color: 'from-emerald-400 to-emerald-500 text-white shadow-emerald-500/20', link: '/zakat' },
                  { icon: Heart, label: 'Infak/Sedekah', color: 'from-[#2db2f5] to-[#1799dc] text-white shadow-[#1799dc]/20', link: '#program' },
                  { icon: Tent, label: 'Qurban', color: 'from-[#febb22] to-[#f29f05] text-white shadow-[#f29f05]/20', link: '/qurban' },
                  { icon: Clock, label: 'Waktu Sholat', color: 'from-amber-400 to-amber-500 text-white shadow-amber-500/20', link: '/sholat' },
                  { icon: Users, label: 'Kemanusiaan', color: 'from-rose-400 to-rose-500 text-white shadow-rose-500/20', link: '#program' },
                  { icon: Calculator, label: 'Kalkulator', color: 'from-purple-400 to-purple-500 text-white shadow-purple-500/20', link: '/zakat' },
                  { icon: MapPin, label: 'Cari Masjid', color: 'from-cyan-400 to-cyan-500 text-white shadow-cyan-500/20', link: '/mosques' },
                  { icon: Component, label: 'Lainnya', color: 'from-slate-400 to-slate-500 text-white shadow-slate-500/20 text-xs tracking-wider', link: '#layanan' },
               ].map((menu, i) => (
                 <div 
                   key={i} 
                   className="flex flex-col items-center gap-1.5 md:gap-2.5 cursor-pointer group"
                   onClick={() => {
                      if (menu.link.startsWith('/')) {
                         navigate(menu.link);
                         window.scrollTo(0,0);
                      } else {
                         document.getElementById(menu.link.replace('#', ''))?.scrollIntoView({ behavior: 'smooth' });
                      }
                   }}
                 >
                    <div className="relative border-none">
                       <div className={`w-11 h-11 md:w-14 md:h-14 rounded-[16px] bg-gradient-to-br ${menu.color} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300 relative z-10 box-border`}>
                          <menu.icon className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2} />
                       </div>
                    </div>
                    <span className="text-[10px] md:text-[11.5px] font-extrabold text-slate-600 dark:text-slate-400 text-center leading-tight max-w-[64px] md:max-w-full px-1">{menu.label}</span>
                 </div>
               ))}
             </div>
          </div>

        </div>
      </div>



      {/* Visualisasi Dampak: Jangkauan & Efektivitas */}
      <section id="dampak" className="bg-slate-50 dark:bg-slate-900 relative pt-16 pb-20 md:py-24 overflow-hidden border-t border-slate-100 dark:border-slate-800 transition-colors duration-300">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-b from-[#1799dc]/5 to-transparent dark:from-[#1799dc]/10 rounded-full blur-[100px] opacity-80 -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02] dark:opacity-[0.03] pointer-events-none"></div>

        <div className="max-w-5xl mx-auto px-4 relative z-10 flex flex-col gap-6 md:gap-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-[10px] md:text-xs font-bold text-[#f29f05] uppercase tracking-[0.2em] mb-3">Visualisasi Dampak Donasi</h2>
            <h3 className="text-2xl md:text-4xl font-serif font-black text-slate-900 dark:text-white mb-4 tracking-tight leading-[1.15]">Membangun Harapan,<br/>Mengubah Kehidupan.</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm leading-relaxed px-4">Setiap rupiah yang diamanahkan telah menjadi senyum bagi jutaan penerima manfaat di seluruh penjuru negeri.</p>
          </div>

          <div className="w-full mb-6 max-w-[100vw] overflow-hidden">
            <div className="w-full overflow-x-auto hide-scrollbar px-4 md:px-0 pb-2 flex lg:justify-center">
              <div className="inline-flex flex-nowrap bg-slate-100 dark:bg-slate-800/80 p-1 rounded-full shadow-inner border border-slate-200/50 dark:border-slate-700/50 shrink-0">
                <motion.button whileTap={{ scale: 0.95 }}
                    onClick={() => setImpactTab('infografis')}
                    className={`transition-all duration-300 px-4 md:px-6 py-1.5 md:py-2 rounded-full text-[11px] md:text-sm font-bold flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 ${impactTab === 'infografis' ? 'bg-white dark:bg-slate-700 text-[#1799dc] shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                  >
                  <FileText className="w-3.5 h-3.5 md:w-4 md:h-4" /> Infografis
                </motion.button>
                <motion.button whileTap={{ scale: 0.95 }}
                  onClick={() => setImpactTab('peta')}
                  className={`transition-all duration-300 px-4 md:px-6 py-1.5 md:py-2 rounded-full text-[11px] md:text-sm font-bold flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 ${impactTab === 'peta' ? 'bg-white dark:bg-slate-700 text-[#f29f05] shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                >
                  <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4" /> Peta Program
                </motion.button>
                <motion.button whileTap={{ scale: 0.95 }}
                  onClick={() => setImpactTab('peta_qurban')}
                  className={`transition-all duration-300 px-4 md:px-6 py-1.5 md:py-2 rounded-full text-[11px] md:text-sm font-bold flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 ${impactTab === 'peta_qurban' ? 'bg-white dark:bg-slate-700 text-[#1799dc] shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                >
                  <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4" /> Peta Qurban
                </motion.button>
                <motion.button whileTap={{ scale: 0.95 }}
                  onClick={() => setImpactTab('galeri')}
                  className={`transition-all duration-300 px-4 md:px-6 py-1.5 md:py-2 rounded-full text-[11px] md:text-sm font-bold flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 ${impactTab === 'galeri' ? 'bg-white dark:bg-slate-700 text-emerald-500 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                >
                  <ImageIcon className="w-3.5 h-3.5 md:w-4 md:h-4" /> Galeri
                </motion.button>
              </div>
            </div>
          </div>

          <div className="w-full relative min-h-[300px]">
            <AnimatePresence mode="wait">
              {impactTab === 'infografis' && (
                <motion.div 
                  key="infografis"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="w-full"
                >
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-4xl mx-auto">
                    {[
                      { icon: TrendingUp, val: "26.5M", label: "Penyaluran (Rp)", color: "text-[#1799dc]", bg: "bg-[#1799dc]/" },
                      { icon: Heart, val: "1.2Jt+", label: "Penerima Manfaat", color: "text-emerald-500", bg: "bg-emerald-500/" },
                      { icon: MapPin, val: "34", label: "Provinsi", color: "text-[#f29f05]", bg: "bg-[#f29f05]/" },
                      { icon: CheckCircle2, val: "50+", label: "Program Berhasil", color: "text-purple-500", bg: "bg-purple-500/" }
                    ].map((stat, i) => (
                      <div key={i} className="bg-white dark:bg-slate-800 rounded-[20px] p-4 text-center border border-slate-200/50 dark:border-slate-700 shadow-sm transition-all group flex flex-col items-center justify-center hover:shadow-md">
                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-[14px] ${stat.bg}10 mb-2.5 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                          <stat.icon className={`w-5 h-5 md:w-6 md:h-6 ${stat.color}`} />
                        </div>
                        <h4 className={`text-2xl md:text-3xl font-black ${stat.color} mb-0.5 tracking-tight`}>{stat.val}</h4>
                        <p className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-tight">{stat.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid md:grid-cols-2 gap-3 md:gap-4 mt-3 md:mt-4 max-w-4xl mx-auto">
                    {/* Chart 1 */}
                    <div className="bg-white dark:bg-slate-800 rounded-[20px] p-5 md:p-6 border border-slate-200/50 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
                      <h4 className="text-[13px] md:text-[15px] font-bold text-slate-800 dark:text-white mb-4 border-b border-slate-50 dark:border-slate-700 pb-2.5">Distribusi Penyaluran</h4>
                      <div className="space-y-3.5 flex-1 flex flex-col justify-center">
                        {INFOGRAPHICS.totalPenyaluran.map((item, i) => (
                          <div key={i}>
                            <div className="flex justify-between text-[10px] md:text-[11px] font-bold mb-1.5">
                               <span className="text-slate-500 dark:text-slate-400">{item.label}</span>
                               <span className={item.color.replace('bg-', 'text-')}>{item.percent}%</span>
                            </div>
                            <div className="w-full bg-slate-50 dark:bg-slate-700/50 h-1.5 md:h-2 rounded-full overflow-hidden">
                               <motion.div 
                                 initial={{ width: 0 }}
                                 whileInView={{ width: `${item.percent}%` }}
                                 viewport={{ once: true }}
                                 transition={{ duration: 1.5, delay: 0.1 + (i*0.1), ease: "easeOut" }}
                                 className={`h-full ${item.color} rounded-full`}
                               />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Chart 2 */}
                    <div className="relative rounded-[20px] overflow-hidden bg-slate-900 p-5 md:p-6 shadow-md h-full flex flex-col justify-center border border-slate-800 min-h-[220px]">
                       <div className="absolute top-0 right-0 w-64 h-64 bg-[#1799dc] rounded-full blur-[80px] opacity-20 -translate-y-1/2 translate-x-1/4"></div>
                       <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#f29f05] rounded-full blur-[80px] opacity-10 translate-y-1/2 -translate-x-1/4"></div>
                       
                       <h4 className="text-[13px] md:text-[15px] font-bold text-white mb-1.5 relative z-10 border-b border-white/10 pb-2.5">Demografi Penerima</h4>
                       <p className="text-slate-400 text-[10px] md:text-[11px] mb-5 relative z-10 leading-relaxed max-w-xs mt-2">Penyaluran difokuskan pada asnaf prioritas dan daerah pelosok.</p>
                       
                       <div className="grid grid-cols-2 gap-2.5 relative z-10 mt-auto pt-2">
                         {INFOGRAPHICS.demografi.map((item, i) => (
                           <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-3 hover:bg-white/10 transition-colors group">
                             <h5 className="text-lg md:text-xl font-black text-[#f29f05] mb-0.5 group-hover:scale-105 origin-left transition-transform">{item.count}</h5>
                             <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{item.label}</p>
                           </div>
                         ))}
                       </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {impactTab === 'peta' && (
                <motion.div 
                  key="peta"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="w-full max-w-4xl mx-auto rounded-[20px] md:rounded-[24px] relative z-10 bg-transparent"
                >
                  <div className="absolute bottom-6 right-3 md:bottom-8 md:right-6 z-[2000] bg-white/95 backdrop-blur text-[9px] md:text-[10px] font-bold px-2.5 py-1 rounded-full text-slate-600 shadow border border-slate-100 flex items-center gap-1.5 pointer-events-none">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                    </span>
                    Live Data Daerah (Program)
                  </div>
                  <ProgramMap />
                </motion.div>
              )}

              {impactTab === 'peta_qurban' && (
                <motion.div 
                  key="peta_qurban"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="w-full max-w-4xl mx-auto rounded-[20px] md:rounded-[24px] relative z-10 bg-transparent"
                >
                  <div className="absolute bottom-6 right-3 md:bottom-8 md:right-6 z-[2000] bg-white/95 backdrop-blur text-[9px] md:text-[10px] font-bold px-2.5 py-1 rounded-full text-slate-600 shadow border border-slate-100 flex items-center gap-1.5 pointer-events-none">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                    </span>
                    Live Data Qurban
                  </div>
                  <QurbanMap />
                </motion.div>
              )}

              {impactTab === 'galeri' && (
                <motion.div 
                  key="galeri"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="w-full max-w-4xl mx-auto relative z-10"
                >
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 md:gap-3 auto-rows-[140px] md:auto-rows-[180px]">
                    {GALLERY_ITEMS.map((item, index) => (
                      <motion.div 
                        key={item.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                        className={`relative rounded-[16px] md:rounded-[20px] overflow-hidden group cursor-pointer ${item.span} shadow-sm border border-slate-200/50 dark:border-slate-800`}
                        onClick={() => setSelectedGalleryItem(item)}
                      >
                        <img 
                          src={`https://images.unsplash.com/photo-${item.image}?auto=format&fit=crop&w=800&q=80`} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                          alt={item.title}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-90 group-hover:opacity-100 transition-opacity flex items-end p-3 md:p-4">
                          <div className="translate-y-1 group-hover:translate-y-0 transition-transform w-full">
                            <h3 className="text-white font-extrabold text-[11px] md:text-sm leading-tight line-clamp-2 drop-shadow-md">{item.title}</h3>
                          </div>
                        </div>
                        {item.type === 'video' && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white shadow-xl border border-white/30 backdrop-saturate-150 group-hover:scale-110 transition-transform duration-300">
                              <PlayCircle className="w-4 h-4 md:w-5 md:h-5 ml-0.5" />
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Gallery Lightbox Modal */}
      <AnimatePresence>
        {selectedGalleryItem && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] bg-black/95 backdrop-blur-sm flex items-center justify-center p-3 md:p-6"
            onClick={() => setSelectedGalleryItem(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 10, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 10, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-3xl bg-slate-900 rounded-[24px] md:rounded-[32px] overflow-hidden shadow-2xl flex flex-col md:flex-row relative"
            >
              <button 
                onClick={() => setSelectedGalleryItem(null)}
                className="absolute top-3 right-3 md:top-4 md:right-4 w-8 h-8 md:w-10 md:h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-white border border-white/20 hover:text-black z-10 transition-colors"
              >
                <X className="w-4 h-4 md:w-5 md:h-5" />
              </button>
              
              <div className="flex-[1.5] relative aspect-video md:aspect-auto md:min-h-[300px]">
                <img src={`https://images.unsplash.com/photo-${selectedGalleryItem.image}?auto=format&fit=crop&w=1200&q=90`} className="w-full h-full object-cover" alt={selectedGalleryItem.title} />
                {selectedGalleryItem.type === 'video' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-[#1799dc] text-white rounded-full flex items-center justify-center hover:scale-110 cursor-pointer transition-transform shadow-lg shadow-[#1799dc]/40">
                      <PlayCircle className="w-6 h-6 md:w-8 md:h-8 ml-0.5 md:ml-1" />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex-1 bg-white dark:bg-slate-800 p-6 md:p-8 flex flex-col justify-center border-l md:border-t-0 border-slate-100 dark:border-slate-700">
                <div className="text-slate-500 dark:text-slate-400 font-bold mb-2 text-[9px] md:text-[10px] uppercase tracking-widest flex items-center gap-1.5 opacity-90">
                  <ImageIcon className="w-3.5 h-3.5" /> Transparansi
                </div>
                <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-2.5 tracking-tight leading-snug">{selectedGalleryItem.title}</h3>
                <p className="text-[13px] md:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">{selectedGalleryItem.desc}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>



      {/* Kategori Program Sedekah -> Dai Pengabdian */}

      <section id="layanan" className="bg-cream-100 dark:bg-slate-900 pt-32 pb-24 -mt-16 md:mt-0 md:pt-16 relative z-10 transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-4 mb-8">
           <SedekahSubuhCard onAddToCart={handleAddToCart} />
        </div>
        <InteractiveDonationCarousel onAddToCart={handleAddToCart} />
      </section>

      {/* Kencleng Masjid Digital */}
      <section className="py-16 bg-white dark:bg-slate-800 transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#1799dc] mb-2 tracking-tight">Kencleng Masjid Digital</h2>
          <p className="text-slate-500 font-medium mb-4 text-sm md:text-base">Sedekah Bantu Pembangunan, Renovasi, Operasional, & Dakwah Masjid</p>
          <div className="w-16 h-1.5 bg-primary-500 mx-auto rounded-full mb-10"></div>

          <div className="flex flex-wrap justify-center gap-8 md:gap-12 mb-10 text-center">
            {[1, 2].map((i, index) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex flex-col items-center max-w-[160px] group cursor-pointer"
              >
                <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-slate-50 shadow-lg mb-4 p-1 group-hover:-translate-y-2 transition-transform">
                  <img src={`https://images.unsplash.com/photo-1565552640578-8386121415f3?q=80&w=200&h=200&auto=format`} className="w-full h-full object-cover rounded-full" alt="Masjid" />
                  <div className="bg-primary-600 text-white text-[9px] md:text-[10px] px-2 py-1 absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-white font-bold whitespace-nowrap shadow-sm">
                    Bangun Masjid
                  </div>
                </div>
                <p className="text-xs md:text-sm font-bold text-slate-700 text-center mb-4 group-hover:text-primary-600 transition-colors leading-tight">
                  Berbagi Kebaikan untuk Pelosok
                </p>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="transition-all duration-300 bg-accent-500 text-white hover:bg-accent-600 text-xs md:text-sm font-bold px-6 py-2.5 rounded-full w-full shadow-sm transition-all duration-300 hover:shadow-lg"
                >
                  SEDEKAH
                </motion.button>
              </motion.div>
            ))}
          </div>
          
          <motion.button className="transition-all duration-300 border border-primary-600 text-primary-600 font-bold px-8 py-3.5 rounded-full hover:bg-primary-50 text-sm shadow-sm transition-all duration-300 hover:shadow-lg" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}>
            Tampilkan Lebih Banyak
          </motion.button>
        </div>
      </section>


      {/* Mari Tunaikan Aqiqah */}
      <section className="py-16 bg-cream-200 dark:bg-slate-900 text-center relative overflow-hidden transition-colors duration-300">
        <div className="absolute inset-0 islamic-pattern opacity-5 dark:opacity-[0.02]"></div>
        <div className="max-w-3xl mx-auto px-4 relative z-10 flex flex-col items-center">
          <div className="bg-white dark:bg-slate-800 p-3 rounded-full text-primary-600 dark:text-primary-400 mb-6 shadow-sm transition-colors duration-300">
            <Tent className="w-8 h-8" />
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-[#1799dc] mb-6 leading-none tracking-tight">
            Mari Tunaikan Aqiqah Multi Manfaat <span className="text-primary-600 block sm:inline mt-2 sm:mt-0">hingga ke Pedalaman</span>
          </h2>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="transition-all duration-300 bg-primary-600 hover:bg-primary-700 text-white font-bold text-base px-10 py-4 rounded-xl shadow-lg shadow-primary-600/20 transition-all transition-all duration-300 hover:shadow-lg"
          >
            TUNAIKAN SEKARANG
          </motion.button>
        </div>
      </section>

      
      {/* Program Yang Sedang Berlangsung */}
      <section id="program" className="py-16 md:py-24 bg-white dark:bg-slate-800 relative transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 md:mb-12 relative pb-4">
             {/* Diagonal line like in reference */}
             <div className="absolute left-0 bottom-0 w-2/3 h-[1px] bg-[#1799dc]/20 -rotate-2 origin-left z-0 sm:block hidden"></div>
            <div className="relative z-10 bg-white dark:bg-slate-800 pr-4 md:pr-8 text-left transition-colors duration-300">
              <h2 className="text-3xl md:text-5xl font-extrabold text-[#1799dc] tracking-tight leading-none mb-1 md:mb-0">Program<br className="hidden md:block"/> Prioritas</h2>
            </div>
            <div className="mt-4 sm:mt-0 relative z-10 bg-white dark:bg-slate-800 pl-0 sm:pl-4 transition-colors duration-300">
               <motion.button className="transition-all duration-300 text-slate-800 hover:text-primary-600 font-bold flex items-center gap-2 text-sm md:text-base group transition-all duration-300 hover:shadow-lg" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}>
                 Lihat Semua <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
               </motion.button>
            </div>
          </div>
          
          <motion.div 
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.15
                }
              }
            }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-8"
          >
            {loadingPrograms ? (
              [1, 2, 3, 4].map((i) => (
                <motion.div variants={{ hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } }} key={i} className="h-full">
                  <ProgramCardSkeleton />
                </motion.div>
              ))
            ) : (
              PROGRAMS.map((p, index) => (
                <motion.div variants={{ hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } }} key={p.id} className="h-full">
                  <ProgramCard p={p} index={index} onAddToCart={handleAddToCart} onQuickDonate={(prog, amt) => {
                  setSelectedProgramForDonation(prog);
                  setQurbanName('');
                  setQurbanQty(1);
                  setQurbanForParents(false);
                  setQurbanAnimal('');
                  setQurbanProcessing('');
                  setDonationAmount(formatCurrencyForm(amt));
                }} />
                </motion.div>
              ))
            )}
          </motion.div>
        </div>
      </section>



      {/* Video Banner Section */}
      <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center">
        <img src="https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&q=80&w=2000" className="absolute inset-0 w-full h-full object-cover" alt="Video cover" />
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative z-10 flex flex-col items-center text-center px-4">
          <motion.button className="transition-all duration-300 w-20 h-20 bg-accent-500 text-white rounded-full flex items-center justify-center shadow-accent-500/50 shadow-2xl hover:scale-110 transition-transform mb-8 transition-all duration-300 hover:shadow-lg" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}>
            <PlayCircle className="w-10 h-10" />
          </motion.button>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight leading-none">Bismillah Bisa Qurban, Kita Jemput Pahala Besar</h2>
        </div>
      </section>

      {/* Dinding Doa Pendekar Kebaikan */}
      <section id="doa-terbaru" className="py-20 md:py-24 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-100/30 dark:bg-primary-900/10 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-100/20 dark:bg-emerald-900/10 rounded-full blur-3xl opacity-50 translate-y-1/4 -translate-x-1/4 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-sm font-bold text-primary-600 dark:text-primary-400 uppercase tracking-[0.2em] mb-4 flex justify-center items-center gap-2">
              <Sparkles className="w-4 h-4" /> Dinding Doa Terkabul
            </h2>
            <h3 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight mb-4">
              Titipan Harapan dari<br className="hidden md:block"/>Para Pendekar Kebaikan.
            </h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-sm md:text-base">
              Setiap donasi membawa seuntai doa. Jangan biarkan doa-doa ini mengangkasa sendirian. Bantu aminkan agar pintu langit segera terbuka.
            </p>
          </div>

          <div className="relative -mx-4 px-4 overflow-x-hidden">
            {/* Gradient Mask for fading edges */}
            <div className="absolute inset-y-0 left-0 w-8 md:w-24 bg-gradient-to-r from-slate-50 dark:from-slate-900 to-transparent z-10 pointer-events-none"></div>
            <div className="absolute inset-y-0 right-0 w-8 md:w-24 bg-gradient-to-l from-slate-50 dark:from-slate-900 to-transparent z-10 pointer-events-none"></div>

            {/* Scrolling Track */}
            <div className="flex gap-4 md:gap-6 animate-[scroll_40s_linear_infinite] hover:[animation-play-state:paused] w-max select-none pb-4 px-4 md:px-24">
              {/* Duplicate array for seamless infinite scroll */}
              {[...prayers, ...prayers].map((prayer, i) => (
                <div 
                  key={`${prayer.id}-${i}`} 
                  className="w-[280px] md:w-[320px] shrink-0 bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative group"
                >
                  <div className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-900/40 dark:to-primary-800/20 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-800 shadow-sm rotate-12 group-hover:rotate-0 transition-transform">
                    <Heart className="w-4 h-4 text-primary-500 fill-primary-500/20" />
                  </div>
                  
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-500 dark:text-slate-400 capitalize">
                      {prayer.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white capitalize">{prayer.name}</h4>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">{prayer.timeAgo}</p>
                    </div>
                  </div>
                  
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-4 line-clamp-3 italic">
                    "{prayer.message}"
                  </p>
                  
                  <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-700 pt-3">
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      {prayer.amins} Orang mengaminkan
                    </span>
                    <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.05 }} 
                      onClick={() => handleAamiin(prayer.id)}
                      className="transition-all duration-300 text-[11px] font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/40 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1 active:scale-95"
                    >
                      <Sparkles className="w-3 h-3" /> Aamiin
                    </motion.button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Cerita Sukses: Kisah Mereka, Jejak Anda */}
      <section className="py-24 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 transition-colors duration-300 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-primary-100 dark:bg-primary-900/20 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
         
         <div className="max-w-7xl mx-auto px-4 relative z-10">
           <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
             <div className="max-w-2xl">
               <h2 className="text-sm font-bold text-[#f29f05] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                 <span className="w-8 h-px bg-[#f29f05]"></span> Cerita Sukses
               </h2>
               <h3 className="text-3xl md:text-5xl font-serif font-bold text-slate-900 dark:text-white leading-tight tracking-tight">Kisah Mereka,<br className="hidden md:block"/>Jejak Kebaikan Anda.</h3>
             </div>
             <p className="text-slate-500 dark:text-slate-400 max-w-md md:text-right">
               Di balik setiap angka yang tersalurkan, ada kisah tentang harapan yang kembali menyala dan senyum yang kembali merekah.
             </p>
           </div>
           
           <div className="grid md:grid-cols-3 gap-6 md:gap-8">
              {SISTER_STORIES.map((story, index) => (
                 <motion.div 
                   key={story.id} 
                   initial={{ opacity: 0, y: 30 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   transition={{ duration: 0.6, delay: index * 0.15 }}
                   className="group flex flex-col h-full"
                 >
                   <div className="relative h-[400px] mb-6 rounded-3xl overflow-hidden shadow-2xl shadow-primary-900/10 border-4 border-white dark:border-slate-800 ring-1 ring-slate-100 dark:ring-slate-700">
                     <img src={story.image} className="w-full h-full object-cover transition-transform hover:scale-105 duration-1000 grayscale-[0.2] hover:grayscale-0" alt={`Cerita ${story.name}`} />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                     
                     <div className="absolute bottom-6 left-6 right-6">
                       <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest rounded-full mb-3">
                         {story.program}
                       </span>
                       <h4 className="text-white text-xl md:text-2xl font-bold font-serif leading-tight">{story.name}</h4>
                       <p className="text-primary-200 text-sm flex items-center gap-1.5 mt-1">
                         <MapPin className="w-3.5 h-3.5" /> {story.location}
                       </p>
                     </div>
                   </div>
                   
                   <div className="flex-1 flex flex-col justify-between">
                     <blockquote className="text-slate-700 dark:text-slate-300 text-base md:text-lg italic font-serif leading-relaxed mb-6">
                       &quot;{story.quote}&quot;
                     </blockquote>
                     <div className="text-xs text-slate-400 font-medium uppercase tracking-widest pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <span>{story.date}</span>
                        <motion.button className="transition-all duration-300 text-primary-600 hover:text-primary-700 font-bold flex items-center gap-1 group/btn transition-all duration-300 hover:shadow-lg" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}>
                          Lihat Program <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                        </motion.button>
                     </div>
                   </div>
                 </motion.div>
              ))}
           </div>
         </div>
      </section>



      {/* Berita dan Artikel */}
      <section id="artikel" className="py-16 bg-white dark:bg-slate-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4 text-center md:text-left">
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#1799dc] mb-2 tracking-tight">Berita dan Artikel</h2>
              <div className="w-16 h-1.5 bg-primary-500 rounded-full mx-auto md:mx-0"></div>
            </div>
            <motion.button className="transition-all duration-300 text-primary-600 font-bold hover:bg-primary-50 px-6 py-2 rounded-full text-sm transition-all duration-300 hover:shadow-lg" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}>
              Lihat Berita Lainnya
            </motion.button>
          </div>
          
          <div className="flex overflow-x-auto gap-4 md:gap-6 pb-8 -mx-4 px-4 md:mx-0 md:px-0 snap-x snap-mandatory hide-scrollbar">
            {[
              { id: 1, image: '1496309732348-3627f3f040ee' },
              { id: 2, image: '1593113598332-cd288d649433' },
              { id: 3, image: '1579621970588-a35d0e7ab9b6' },
              { id: 4, image: '1542816417-0983c9c9ad53' }
            ].map((item, index) => (
              <motion.div 
                key={item.id} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -6, transition: { duration: 0.2, ease: "easeOut" } }}
                className="min-w-[65vw] sm:min-w-[280px] md:min-w-[calc(50%-12px)] lg:min-w-[calc(25%-18px)] snap-center group cursor-pointer bg-white dark:bg-slate-800 rounded-2xl p-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-300 border border-transparent hover:border-slate-100 dark:hover:border-slate-700 flex flex-col"
              >
                 <div className="h-32 md:h-40 overflow-hidden rounded-xl relative mb-3">
                    <img src={`https://images.unsplash.com/photo-${item.image}?q=80&w=400&auto=format&fit=crop`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Article" />
                    <div className="absolute top-2 left-2 bg-primary-600 text-[8px] md:text-[9px] font-black text-white px-2 py-1 rounded-md uppercase tracking-wider shadow-sm">
                      Dakwah
                    </div>
                 </div>
                 <div className="px-1 pb-1 text-center md:text-left">
                    <p className="text-[9px] md:text-[10px] text-slate-400 font-medium mb-1 uppercase tracking-widest">24 April 2026</p>
                    <h4 className="font-bold text-slate-800 line-clamp-2 md:line-clamp-3 group-hover:text-primary-600 transition-colors mb-2 text-xs md:text-sm leading-snug">Makin Praktis! Laznas Dewan Dakwah Hadirkan Layanan Inovatif</h4>
                    <motion.button className="transition-all duration-300 text-[9px] md:text-[10px] uppercase font-bold text-slate-400 group-hover:text-primary-600 flex items-center justify-center md:justify-start gap-1 w-full tracking-widest transition-all duration-300 hover:shadow-lg" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}>
                      BACA LANJUT <ChevronRight className="w-3 h-3" />
                    </motion.button>
                 </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
          </>
        } />
        <Route path="/history" element={
        /* Dashboard Section */
        <section className="pt-24 pb-16 min-h-[80vh] bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-[#1799dc] mb-2 tracking-tight">Dashboard Donatur</h1>
                <p className="text-slate-500 font-medium text-sm md:text-base">Melihat jejak kebaikan dan dampak nyata dari sedekah Anda.</p>
              </div>
              <div className="bg-primary-100 text-primary-800 font-bold px-5 py-3 rounded-xl flex items-center gap-4 border border-primary-200">
                <div className="p-2 bg-primary-600 text-white rounded-xl shadow-inner cursor-default">
                  <UserCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest font-bold opacity-80 mb-0.5">Total Kebaikan Terkumpul</div>
                  <div className="text-xl">Rp {formatCurrencyForm(userDonations.filter(t => t.status === 'Berhasil').reduce((acc, curr) => acc + curr.amount, 0).toString())}</div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 md:gap-6 mb-8">
              <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-accent-100 text-accent-600 flex items-center justify-center shrink-0">
                  <HandHeart className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-800 dark:text-slate-100">{new Set(userDonations.map(d => d.program)).size}</div>
                  <div className="text-xs font-bold text-slate-500 uppercase">Program Didukung</div>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-800 dark:text-slate-100">200+</div>
                  <div className="text-xs font-bold text-slate-500 uppercase">Jiwa Terbantu (Est)</div>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-800 dark:text-slate-100">3</div>
                  <div className="text-xs font-bold text-slate-500 uppercase">Wilayah Penyaluran</div>
                </div>
              </div>
            </div>

            <div className="mb-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#f29f05] to-[#d98f04] flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                  <Milestone className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Milestone Kebaikan</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Infak Milestone */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#1799dc]/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>
                  
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-1">
                        Progress Infak & Sedekah
                        <Info className="w-3.5 h-3.5 text-slate-400 cursor-help" />
                      </h3>
                      <p className="text-xs text-slate-500 font-medium tracking-wide uppercase">Level Saat Ini</p>
                    </div>
                    {(() => {
                      const totalInfak = userDonations.filter((t: any) => t.status === 'Berhasil' && typeof t.program === 'string' && !t.program.includes('Zakat')).reduce((acc: any, curr: any) => acc + curr.amount, 0);
                      const currentMilestone = MILESTONES.filter(m => totalInfak >= m.amount).pop() || MILESTONES[0];
                      const nextMilestone = MILESTONES.find(m => totalInfak < m.amount);
                      const Icon = currentMilestone.icon;
                      
                      return (
                        <div className={`px-4 py-2 rounded-xl ${currentMilestone.bg} ${currentMilestone.color} font-black text-xs flex items-center gap-2 border border-current/10 shadow-sm`}>
                          <Icon className="w-4 h-4" />
                          {currentMilestone.name}
                        </div>
                      );
                    })()}
                  </div>

                  {(() => {
                    const totalInfak = userDonations.filter((t: any) => t.status === 'Berhasil' && typeof t.program === 'string' && !t.program.includes('Zakat')).reduce((acc: any, curr: any) => acc + curr.amount, 0);
                    const currentMilestone = MILESTONES.filter(m => totalInfak >= m.amount).pop() || MILESTONES[0];
                    const nextMilestone = MILESTONES.find(m => m.amount > currentMilestone.amount) || null;
                    const progress = nextMilestone ? Math.min(((totalInfak - currentMilestone.amount) / (nextMilestone.amount - currentMilestone.amount)) * 100, 100) : 100;
                    
                    return (
                      <div className="space-y-4">
                        <div className="relative h-4 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#1799dc] to-[#2db2f5] rounded-full"
                          />
                        </div>
                        <div className="flex justify-between items-center text-[11px] font-bold">
                          <span className="text-slate-400 uppercase tracking-widest">Terkumpul: <span className="text-slate-700 dark:text-slate-200">{formatCurrency(totalInfak)}</span></span>
                          {nextMilestone && (
                            <span className="text-[#1799dc] uppercase tracking-widest">Sisa <span className="text-slate-700 dark:text-slate-200">{formatCurrency(nextMilestone.amount - totalInfak)}</span> lagi ke <span className="text-[#1799dc]">{nextMilestone.name}</span></span>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Zakat Milestone */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>
                  
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-1">
                        Progress Zakat
                        <Info className="w-3.5 h-3.5 text-slate-400 cursor-help" />
                      </h3>
                      <p className="text-xs text-slate-500 font-medium tracking-wide uppercase">Level Saat Ini</p>
                    </div>
                    {(() => {
                      const totalZakat = userDonations.filter((t: any) => t.status === 'Berhasil' && typeof t.program === 'string' && t.program.includes('Zakat')).reduce((acc: any, curr: any) => acc + curr.amount, 0);
                      const currentMilestone = ZAKAT_MILESTONES.filter(m => totalZakat >= m.amount).pop() || ZAKAT_MILESTONES[0];
                      const Icon = currentMilestone.icon;
                      
                      return (
                        <div className={`px-4 py-2 rounded-xl ${currentMilestone.bg} ${currentMilestone.color} font-black text-xs flex items-center gap-2 border border-current/10 shadow-sm`}>
                          <Icon className="w-4 h-4" />
                          {currentMilestone.name}
                        </div>
                      );
                    })()}
                  </div>

                  {(() => {
                    const totalZakat = userDonations.filter((t: any) => t.status === 'Berhasil' && typeof t.program === 'string' && t.program.includes('Zakat')).reduce((acc: any, curr: any) => acc + curr.amount, 0);
                    const currentMilestone = ZAKAT_MILESTONES.filter(m => totalZakat >= m.amount).pop() || ZAKAT_MILESTONES[0];
                    const nextMilestone = ZAKAT_MILESTONES.find(m => m.amount > currentMilestone.amount) || null;
                    const progress = nextMilestone ? Math.min(((totalZakat - currentMilestone.amount) / (nextMilestone.amount - currentMilestone.amount)) * 100, 100) : 100;
                    
                    return (
                      <div className="space-y-4">
                        <div className="relative h-4 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full"
                          />
                        </div>
                        <div className="flex justify-between items-center text-[11px] font-bold">
                          <span className="text-slate-400 uppercase tracking-widest">Terkumpul: <span className="text-slate-700 dark:text-slate-200">{formatCurrency(totalZakat)}</span></span>
                          {nextMilestone && (
                            <span className="text-emerald-600 uppercase tracking-widest">Sisa <span className="text-slate-700 dark:text-slate-200">{formatCurrency(nextMilestone.amount - totalZakat)}</span> lagi ke <span className="text-emerald-600">{nextMilestone.name}</span></span>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Lencana Pencapaian */}
              <div className="mt-8 mb-6">
                <div className="flex items-center gap-3 mb-6 px-1">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Lencana Pencapaian</h2>
                    <p className="text-sm font-medium text-slate-500 hidden md:block">Apresiasi khusus atas keikhlasan & konsistensi Anda dalam berbagi.</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                  {(() => {
                    const hasDonation = userDonations.filter((t: any) => t.status === 'Berhasil').length > 0;
                    
                    const badges = [
                      {
                        id: 'pejuang-subuh',
                        name: 'Pejuang Subuh',
                        desc: 'Sering berbagi di waktu fajar',
                        icon: Sunrise,
                        color: 'text-amber-500',
                        bg: 'bg-amber-50 dark:bg-amber-500/10',
                        border: 'border-amber-200 dark:border-amber-500/20',
                        unlocked: hasDonation // Logic dummy: minimal 1 donasi untuk membuka badge pertama agar tidak kosong
                      },
                      {
                        id: 'sahabat-yatim',
                        name: 'Sahabat Yatim',
                        desc: 'Simpati pada program yatim',
                        icon: HeartHandshake,
                        color: 'text-rose-500',
                        bg: 'bg-rose-50 dark:bg-rose-500/10',
                        border: 'border-rose-200 dark:border-rose-500/20',
                        unlocked: userDonations.some((t: any) => typeof t.program === 'string' && t.program.toLowerCase().includes('yatim'))
                      },
                      {
                        id: 'istiqomah',
                        name: 'Istiqomah',
                        desc: 'Donasi rutin 3x atau lebih',
                        icon: Repeat,
                        color: 'text-[#1799dc]',
                        bg: 'bg-[#1799dc]/5 dark:bg-[#1799dc]/10',
                        border: 'border-[#1799dc]/30 dark:border-[#1799dc]/20',
                        unlocked: userDonations.filter((t: any) => t.status === 'Berhasil').length >= 3
                      }
                    ];

                    return badges.map(badge => (
                      <div key={badge.id} className={`p-5 md:p-6 rounded-3xl border relative overflow-hidden transition-all duration-300 ${badge.unlocked ? `bg-white dark:bg-slate-800 shadow-sm ${badge.border} hover:scale-[1.02] hover:shadow-md cursor-default` : 'bg-slate-50 dark:bg-slate-800/40 border-dashed border-slate-200 dark:border-slate-700 grayscale opacity-60'}`}>
                        {badge.unlocked && <div className={`absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 opacity-50 ${badge.bg}`}></div>}
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${badge.unlocked ? badge.bg : 'bg-slate-200 dark:bg-slate-700'}`}>
                          <badge.icon className={`w-7 h-7 ${badge.unlocked ? badge.color : 'text-slate-400'}`} />
                        </div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-1.5 md:text-lg">{badge.name}</h4>
                        <p className="text-[11px] md:text-xs text-slate-500 dark:text-slate-400 leading-snug">{badge.desc}</p>
                        {!badge.unlocked && (
                           <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50 text-[10px] uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1.5">
                             <Lock className="w-3.5 h-3.5" /> Terkunci
                           </div>
                        )}
                        {badge.unlocked && (
                           <div className="absolute bottom-4 right-4 text-emerald-500/20">
                              <CheckCircle className="w-16 h-16" />
                           </div>
                        )}
                      </div>
                    ));
                  })()}
                </div>
              </div>

              {/* Pohon Kebaikan Interactive Visualizer */}
              <div className="mt-6">
                {(() => {
                   const totalSemua = userDonations.filter((t: any) => t.status === 'Berhasil').reduce((acc: any, curr: any) => acc + curr.amount, 0);
                   return <PohonKebaikanInteractive totalDonation={totalSemua} />;
                })()}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 px-1 gap-2">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Riwayat & Dampak Donasi</h2>
              
              <div className="flex items-center gap-2 bg-slate-200/50 dark:bg-slate-800 p-1 rounded-lg w-max">
                 {['Semua', 'Berhasil', 'Pending'].map((tab) => (
                   <button 
                     key={tab} 
                     onClick={() => setHistoryTab(tab)}
                     className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${historyTab === tab ? 'bg-white dark:bg-slate-700 text-[#1799dc] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                   >
                     {tab}
                   </button>
                 ))}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden mb-12 transition-colors duration-300">
              {/* Desktop Table View */}
              <div className="hidden md:block w-full overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                    <thead>
                       <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          <th className="p-4 font-bold">Tanggal</th>
                          <th className="p-4 font-bold">Program</th>
                          <th className="p-4 font-bold text-right">Nominal</th>
                          <th className="p-4 font-bold text-center">Status</th>
                          <th className="p-4 font-bold text-right">Aksi</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                       {(historyTab === 'Semua' ? userDonations : userDonations.filter((t: any) => t.status === historyTab)).map((txn: any) => (
                         <tr key={txn.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                            <td className="p-4 whitespace-nowrap">
                               <div className="text-sm font-bold text-slate-700 dark:text-slate-300">{txn.date}</div>
                               <div className="text-[10px] space-x-1 font-mono text-slate-400">{txn.id}</div>
                            </td>
                            <td className="p-4 min-w-[200px]">
                               <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-0.5">{txn.program}</h3>
                               <p className="text-[11px] text-slate-500 dark:text-slate-400">Via {txn.method}</p>
                               
                               {txn.status === 'Berhasil' && (
                                 <div className="mt-3 space-y-2">
                                   <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-wider">
                                      <span className="text-slate-400">Progres Penyaluran</span>
                                      <span className="text-primary-600 dark:text-primary-400">{txn.program.includes('Gaza') ? '45%' : '100%'}</span>
                                   </div>
                                   <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                      <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: txn.program.includes('Gaza') ? '45%' : '100%' }}
                                        className={`h-full rounded-full ${txn.program.includes('Gaza') ? 'bg-primary-500 shadow-[0_0_8px_rgba(23,153,220,0.3)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]'}`}
                                      />
                                   </div>
                                 </div>
                               )}
                               {txn.impact && (
                                 <div className="mt-2 bg-primary-50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-800/50 rounded-lg p-2 text-xs flex items-start gap-2">
                                     <CheckCircle2 className="w-4 h-4 text-primary-500 shrink-0 mt-0.5" />
                                     <p className="text-primary-800 dark:text-primary-300/80 leading-relaxed max-w-sm">{txn.impact}</p>
                                 </div>
                               )}
                            </td>
                            <td className="p-4 text-right whitespace-nowrap">
                               <span className="text-base font-black text-primary-600 dark:text-primary-400">{formatCurrency(txn.amount)}</span>
                            </td>
                            <td className="p-4 text-center">
                               <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${txn.status === 'Berhasil' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'}`}>
                                 {txn.status}
                               </span>
                            </td>
                            <td className="p-4 text-right">
                               <button className="text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 font-bold text-xs flex items-center justify-end gap-1.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                 <FileText className="w-4 h-4" /> Kuitansi
                               </button>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>

              {/* Mobile View */}
              <div className="md:hidden grid grid-cols-1 divide-y divide-slate-100 dark:divide-slate-700/50">
                {(historyTab === 'Semua' ? userDonations : userDonations.filter((t: any) => t.status === historyTab)).map((txn: any) => (
                  <div key={txn.id} className="p-4 flex flex-col gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{txn.date}</span>
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${txn.status === 'Berhasil' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'}`}>
                            {txn.status}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-0.5 leading-snug">{txn.program}</h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                          {txn.method} &middot; <span className="font-mono text-[10px]">{txn.id}</span>
                        </p>

                        {txn.status === 'Berhasil' && (
                           <div className="mt-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50">
                              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest mb-1.5">
                                 <span className="text-slate-400 flex items-center gap-1.5">
                                    <Activity className="w-3 h-3" /> Status Penyaluran
                                 </span>
                                 <span className={txn.program.includes('Gaza') ? 'text-primary-600' : 'text-emerald-600'}>
                                    {txn.program.includes('Gaza') ? '45%' : '100%'}
                                 </span>
                              </div>
                              <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                 <motion.div 
                                   initial={{ width: 0 }}
                                   animate={{ width: txn.program.includes('Gaza') ? '45%' : '100%' }}
                                   className={`h-full rounded-full ${txn.program.includes('Gaza') ? 'bg-primary-500 shadow-[0_0_10px_rgba(23,153,220,0.3)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]'}`}
                                 />
                              </div>
                           </div>
                        )}
                      </div>
                    </div>
                    
                    {txn.impact && (
                      <div className="bg-primary-50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-800/50 rounded-lg p-2.5 text-xs relative">
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-primary-500 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-primary-800 dark:text-primary-400 block mb-0.5 text-[10px] uppercase tracking-wider">Laporan Dampak</strong>
                            <p className="text-primary-900 dark:text-primary-200/80 leading-relaxed">{txn.impact}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-700/50 pt-3 mt-1">
                      <span className="text-lg font-black text-primary-600 dark:text-primary-400">{formatCurrency(txn.amount)}</span>
                      <button className="text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 font-bold text-[11px] flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary-200/50 dark:border-primary-800/50">
                        <FileText className="w-3.5 h-3.5" /> Unduh
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-8 text-center bg-primary-900 text-white p-6 md:p-8 rounded-2xl relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 islamic-pattern opacity-10"></div>
              <div className="absolute top-0 right-0 w-48 h-48 bg-accent-500 rounded-full blur-3xl -mr-24 -mt-24 opacity-20"></div>
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between text-center md:text-left gap-6">
                <div>
                  <h4 className="text-xl md:text-2xl font-extrabold text-[#1799dc] mb-2 tracking-tight">Terus Tebar Kebaikan</h4>
                  <p className="text-primary-200 font-medium text-sm md:text-base">Masih banyak saudara kita yang menanti uluran tangan sahabat.</p>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    navigate('/');
                    window.scrollTo(0,0);
                  }} 
                  className="transition-all duration-300 px-6 py-3 bg-accent-500 hover:bg-accent-600 text-primary-950 font-bold rounded-xl shadow-xl shadow-accent-500/20 transition-all flex items-center gap-2 whitespace-nowrap text-sm transition-all duration-300 hover:scale-105 hover:shadow-lg hover:brightness-110 active:scale-95"
                >
                  <Heart className="w-4 h-4" /> Donasi Lagi Sekarang
                </motion.button>
              </div>
            </div>
          </div>
        </section>
        } />
        <Route path="/laporan" element={
          <>
            <AnalyticsDashboard />
          </>
        } />
        <Route path="/quran" element={<QuranPage />} />
        <Route path="/amaliyah" element={<AmaliyahPage />} />
        <Route path="/zakat" element={<ZakatPage />} />
        <Route path="/qurban" element={<QurbanPage onAddToCart={handleAddToCart} />} />
        <Route path="/mosques" element={<MasjidLocator />} />
        <Route path="/sholat" element={<SholatPage />} />
        <Route path="/history" element={<DonationHistory />} />
        <Route path="/pengajuan-bantuan" element={<PengajuanBantuan />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 pt-20 pb-10 relative overflow-hidden border-t border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#1799dc] via-[#2db2f5] to-[#1799dc]"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-1">
              <div className="flex items-center mb-6">
                 <img src="/logo-kecil (1).png" alt="Logo" className="h-10 md:h-12 object-contain dark:brightness-0 dark:invert" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }} />
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-8">
                Lembaga Amil Zakat Nasional yang bertekad mensyiarkan dakwah di pelosok Nusantara melalui program pendayagunaan zakat yang inovatif dan terukur.
              </p>
              <div className="flex gap-4">
                <motion.a href="#" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-[#1799dc] hover:text-white transition-colors duration-300" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Facebook className="w-5 h-5" />
                </motion.a>
                <motion.a href="#" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-[#1799dc] hover:text-white transition-colors duration-300" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Instagram className="w-5 h-5" />
                </motion.a>
                <motion.a href="#" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-[#1799dc] hover:text-white transition-colors duration-300" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Youtube className="w-5 h-5" />
                </motion.a>
              </div>
            </div>

            <div>
              <h5 className="font-bold text-lg mb-8 text-slate-900 dark:text-white">{t('layanan')}</h5>
              <ul className="flex flex-col gap-4 text-slate-600 dark:text-slate-400 text-sm">
                <li><motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.05 }} onClick={() => { navigate('/zakat'); window.scrollTo(0,0); }} className="hover:text-[#1799dc] dark:hover:text-[#2db2f5] transition-colors duration-300">{t('kalkulator')}</motion.button></li>
                <li><motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.05 }} onClick={() => { navigate('/qurban'); window.scrollTo(0,0); }} className="hover:text-[#1799dc] dark:hover:text-[#2db2f5] transition-colors duration-300">Qurban</motion.button></li>
                <li><motion.a href="#" className="hover:text-[#1799dc] dark:hover:text-[#2db2f5] transition-colors duration-300" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>Konfirmasi Donasi</motion.a></li>
                <li><motion.a href="#" className="hover:text-[#1799dc] dark:hover:text-[#2db2f5] transition-colors duration-300" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>Layanan Jemput Zakat</motion.a></li>
                <li><motion.a href="#" className="hover:text-[#1799dc] dark:hover:text-[#2db2f5] transition-colors duration-300" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>Rekening Donasi</motion.a></li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-lg mb-8 text-slate-900 dark:text-white">{t('program_utama')}</h5>
               <ul className="flex flex-col gap-4 text-slate-600 dark:text-slate-400 text-sm">
                <li><motion.a href="#" className="hover:text-[#1799dc] dark:hover:text-[#2db2f5] transition-colors duration-300" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>Beasiswa Tahfidz</motion.a></li>
                <li><motion.a href="#" className="hover:text-[#1799dc] dark:hover:text-[#2db2f5] transition-colors duration-300" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>Air Bersih Nusantara</motion.a></li>
                <li><motion.a href="#" className="hover:text-[#1799dc] dark:hover:text-[#2db2f5] transition-colors duration-300" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>Bantu Dakwah Pelosok</motion.a></li>
                <li><motion.a href="#" className="hover:text-[#1799dc] dark:hover:text-[#2db2f5] transition-colors duration-300" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>Pangan Untuk Gaza</motion.a></li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-lg mb-8 text-slate-900 dark:text-white">{t('hubungi')}</h5>
              <ul className="flex flex-col gap-6 text-slate-600 dark:text-slate-400 text-sm">
                <li className="flex gap-3 items-start">
                  <MapPin className="w-5 h-5 text-[#f29f05] flex-shrink-0" />
                  <span>Jl. Kramat Raya No.45, Jakarta Pusat 10450</span>
                </li>
                <li className="flex gap-3 items-center">
                  <Phone className="w-5 h-5 text-[#f29f05] flex-shrink-0" />
                  <span>021-31901233</span>
                </li>
                <li className="flex gap-3 items-center">
                  <Mail className="w-5 h-5 text-[#f29f05] flex-shrink-0" />
                  <span>info@laznasdewandakwah.or.id</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-10 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              &copy; 2026 LAZNAS Dewan Dakwah. {t('hak_cipta')}
            </p>
            <div className="flex gap-8 text-xs text-slate-500 dark:text-slate-400">
              <motion.a href="#" className="hover:text-[#1799dc] transition-colors duration-300" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>Kebijakan Privasi</motion.a>
              <motion.a href="#" className="hover:text-[#1799dc] transition-colors duration-300" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>Syarat & Ketentuan</motion.a>
              <motion.a href="#" className="hover:text-[#1799dc] transition-colors duration-300" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>Bantuan</motion.a>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation Menu */}
      {!location.pathname.startsWith('/program/') && (
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200/50 dark:border-slate-800/50 shadow-[0_-10px_30px_rgba(0,0,0,0.08)]" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="flex items-center justify-between px-4 py-2 relative">
          
          <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.05 }} 
            onClick={() => {
              navigate('/');
              window.scrollTo(0,0);
            }} 
            className={`transition-all duration-300 flex flex-col items-center justify-center gap-1 w-12 ${location.pathname === '/' ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'} transition-all duration-300 hover:scale-105 hover:shadow-lg hover:brightness-110 active:scale-95`}>
            <Home className="w-5 h-5" strokeWidth={location.pathname === '/' ? 2.5 : 2} />
            <span className="text-[9px] font-bold tracking-tight">Beranda</span>
          </motion.button>

          <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.05 }} 
            onClick={() => {
              navigate('/amaliyah');
              window.scrollTo(0,0);
            }}
            className={`transition-all duration-300 flex flex-col items-center justify-center gap-1 w-12 ${location.pathname === '/amaliyah' ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'} transition-all duration-300 hover:scale-105 hover:shadow-lg hover:brightness-110 active:scale-95`}
          >
            <LayoutDashboard className="w-5 h-5" strokeWidth={location.pathname === '/amaliyah' ? 2.5 : 2} />
            <span className="text-[9px] font-bold tracking-tight">Amaliyah</span>
          </motion.button>

          <div className="relative flex flex-col items-center justify-end h-[42px] w-14">
            <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.05 }} 
              onClick={() => {
                navigate('/donasi');
                window.scrollTo(0,0);
              }}
              className="absolute -top-5 w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-tr from-[#1799dc] to-[#2db2f5] hover:bg-gradient-to-br text-white shadow-[0_8px_20px_rgba(23,153,220,0.4)] flex flex-col items-center justify-center transform hover:scale-105 active:scale-95 transition-all border-[4px] border-white dark:border-slate-900 z-10 duration-300"
            >
              <Heart className="w-6 h-6 md:w-7 md:h-7 fill-white" />
            </motion.button>
            <span className="text-[9px] font-bold tracking-tight text-slate-700 dark:text-slate-300 relative z-20">Donasi</span>
          </div>

          <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.05 }} 
            onClick={() => setIsZakatCalculatorOpen(true)}
            className="transition-all duration-300 flex flex-col items-center justify-center gap-1 w-12 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors transition-all duration-300 hover:scale-105 hover:shadow-lg hover:brightness-110 active:scale-95"
          >
            <Calculator className="w-5 h-5" strokeWidth={2} />
            <span className="text-[9px] font-bold tracking-tight">Zakat</span>
          </motion.button>

          <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.05 }} 
            onClick={() => {
              navigate('/history');
              window.scrollTo(0, 0);
            }}
            className={`transition-all duration-300 flex flex-col items-center justify-center gap-1 w-12 ${location.pathname === '/history' ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'} transition-all duration-300 hover:scale-105 hover:shadow-lg hover:brightness-110 active:scale-95`}>
            <UserCircle className="w-5 h-5" strokeWidth={location.pathname === '/history' ? 2.5 : 2} />
            <span className="text-[9px] font-bold tracking-tight">Akun</span>
          </motion.button>

        </div>
      </div>
      )}

      {/* Profile Modal */}
      <AnimatePresence>
        {isProfileModalOpen && (
          <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
            role="dialog"
          >
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProfileModalOpen(false)}
              className="absolute inset-0"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-4 md:p-6 bg-gradient-to-br from-primary-500 to-primary-600 dark:from-slate-800 dark:to-slate-900 flex items-center justify-between sticky top-0 z-10 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent mix-blend-overlay"></div>
                <h3 className="text-lg md:text-xl font-bold text-white relative z-10 flex items-center gap-2">
                  <UserCircle className="w-5 h-5 md:w-6 md:h-6" />
                  Profil Anda
                </h3>
                <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.05 }} 
                  onClick={() => setIsProfileModalOpen(false)}
                  className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors relative z-10"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              <div className="p-4 md:p-6 space-y-4 md:space-y-6 overflow-y-auto">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Nama Lengkap</label>
                  <input
                    type="text"
                    value={profileNameInput}
                    onChange={(e) => setProfileNameInput(e.target.value)}
                    placeholder="Nama Lengkap Anda"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Nomor Telepon</label>
                  <input
                    type="tel"
                    value={profilePhoneInput}
                    onChange={(e) => setProfilePhoneInput(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                  />
                  <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 pl-1">
                    Nomor telepon dgunakan untuk riwayat donasi dan amaliyah/bacaan Qur'an.
                  </p>
                </div>
              </div>

              <div className="p-4 md:p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 sticky bottom-0">
                <motion.button whileTap={{ scale: 0.98 }} whileHover={{ scale: 1.02 }}
                  onClick={saveProfile}
                  className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary-500/30 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Simpan Profil
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cart Modal */}
      <AnimatePresence>
        {isCartOpen && (
          <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
          >
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="absolute inset-0 transition-all duration-300"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative z-10 flex flex-col max-h-[95vh] md:max-h-[90vh] transition-colors duration-300"
            >
              <div className="p-4 md:p-6 flex-1 overflow-y-auto">
                <div className="flex justify-between items-start mb-3 md:mb-5 border-b border-slate-100 dark:border-slate-700/50 pb-2 md:pb-4">
                  <div className="pr-4">
                    <h3 className="text-lg md:text-xl font-extrabold text-[#1799dc] dark:text-[#2db2f5] mb-0.5 tracking-tight flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5" /> Kantung Kebaikan
                    </h3>
                    <p className="text-[10px] md:text-xs font-semibold text-slate-400 dark:text-slate-500 tracking-wider">
                      {cartItems.length} Program dipilih
                    </p>
                  </div>
                  <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.05 }} 
                    onClick={() => setIsCartOpen(false)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all shrink-0 -mt-2 -mr-2"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>

                {cartItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4">
                      <ShoppingBag className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                    </div>
                    <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-1">Kantung Kebaikan Masih Kosong</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-500">Mari temukan program kebaikan dan raih timbangan amal terbaikmu.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map((item, index) => (
                      <div key={index} className="flex gap-3 items-start border-b border-slate-100 dark:border-slate-700/50 pb-4">
                        <img src={item.program.image} alt={item.program.title} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 line-clamp-2 leading-snug mb-1">{item.program.title}</h4>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.program.category}</span>
                          <div className="text-[#1799dc] font-black text-sm mt-1">Rp {formatCurrencyForm(item.amount)}</div>
                        </div>
                        <motion.button 
                          whileTap={{ scale: 0.9 }} 
                          onClick={() => setCartItems(prev => prev.filter((_, i) => i !== index))}
                          className="p-1.5 text-slate-300 hover:text-red-500 bg-slate-50 hover:bg-red-50 dark:bg-slate-900 dark:hover:bg-red-900/20 rounded-lg shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </motion.button>
                      </div>
                    ))}
                    
                    <div className="pt-4 space-y-4">
                      <div className="flex justify-between items-center text-lg font-black text-slate-800 dark:text-white border-t border-slate-100 dark:border-slate-700 pt-4">
                        <span>Total Kebaikan:</span>
                        <span className="text-[#1799dc]">
                          Rp {formatCurrencyForm(cartItems.reduce((acc, curr) => acc + parseInt(curr.amount), 0).toString())}
                        </span>
                      </div>
                      
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          const total = cartItems.reduce((acc, curr) => acc + parseInt(curr.amount), 0);
                          setDonationAmount(formatCurrencyForm(total.toString()));
                          setSelectedProgramForDonation({
                            id: 999,
                            title: `Gabungan ${cartItems.length} Program Kebaikan`,
                            category: "Multiprogram",
                            description: cartItems.map(i => i.program.title).join(", "),
                            image: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&q=80&w=800",
                            collected: 0,
                            target: 0,
                            donors: 0
                          });
                          setIsCartOpen(false);
                        }}
                        className="w-full bg-gradient-to-r from-primary-500 to-[#1799dc] hover:from-primary-600 hover:to-[#1588c4] text-white font-extrabold py-4 rounded-xl shadow-lg shadow-primary-500/30 text-[15px] flex items-center justify-center gap-2 transition-all"
                      >
                        Lanjut Pembayaran <ChevronRight className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Donation Modal */}
      <AnimatePresence>
        {selectedProgramForDonation && (
          <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="donation-modal-title"
          >
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProgramForDonation(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-all duration-300"
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative z-10 flex flex-col max-h-[95vh] md:max-h-[90vh] transition-colors duration-300"
            >
              <div className="p-4 md:p-6 flex-1 overflow-y-auto">
                <div className="flex justify-between items-start mb-3 md:mb-5 border-b border-slate-100 dark:border-slate-700/50 pb-2 md:pb-4">
                  <div className="pr-4">
                    <h3 id="donation-modal-title" className="text-lg md:text-xl font-extrabold text-[#1799dc] dark:text-[#2db2f5] mb-0.5 tracking-tight">
                      {isDonationSuccess 
                        ? 'Alhamdulillah, Kebaikan Anda Terukir!' 
                        : showPaymentInstructions
                          ? 'Konfirmasi & Instruksi Pembayaran'
                          : selectedProgramForDonation.category === 'Qurban' 
                            ? 'Persembahan Terbaik, Kendaraan Syurga Anda 🐑' 
                            : 'Mari Tunaikan Kebaikan Hari Ini 🤍'}
                    </h3>
                    {!isDonationSuccess && !showPaymentInstructions && (
                      <p className="text-[10px] md:text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        Program Istimewa: {selectedProgramForDonation.title}
                      </p>
                    )}
                    {showPaymentInstructions && (
                      <p className="text-[10px] md:text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        Satu langkah lagi menuju kebaikan
                      </p>
                    )}
                  </div>
                  <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.05 }} 
                    onClick={() => {
                      setSelectedProgramForDonation(null);
                      setTimeout(() => {
                        setIsDonationSuccess(false);
                        setShowPaymentInstructions(false);
                      }, 300);
                    }}
                    aria-label="Tutup Pendaftaran Donasi"
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all shrink-0 -mt-2 -mr-2 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:brightness-110 active:scale-95"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>

                {isDonationSuccess ? (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0, y: 20 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      className="flex flex-col items-center justify-center pt-2 pb-0 text-center"
                    >
                      <div className="relative mb-5 mt-0">
                        <motion.div 
                          initial={{ scale: 0, rotate: -30 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                          className="w-24 h-24 bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 shadow-xl shadow-emerald-500/40 text-white rounded-full flex items-center justify-center relative z-10 mx-auto"
                        >
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.4 }}
                          >
                            <CheckCircle2 className="w-12 h-12" />
                          </motion.div>
                        </motion.div>
                        
                        <motion.div 
                          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-emerald-400/20 rounded-full z-0 blur-md"
                        />
                        <motion.div 
                          animate={{ rotate: 360 }}
                          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-[3px] border-dashed border-emerald-300 dark:border-emerald-800/60 rounded-full z-0"
                        />
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -top-2 right-1/4"
                        >
                           <Sparkles className="w-8 h-8 text-[#f29f05]" />
                        </motion.div>
                      </div>
                      
                      <h4 className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mb-1 leading-tight">Alhamdulillah!</h4>
                      <p className="text-slate-800 dark:text-white font-bold text-lg mb-1">Jazakumullahu Khairan Sahabat Dakwah</p>
                      
                      <div className="flex flex-col items-center gap-1 mb-4">
                        <p className="text-emerald-700 dark:text-emerald-400 font-arabic text-xl md:text-2xl mt-1 leading-relaxed text-center px-4">
                          أَخْلَفَ اللَّهُ عَلَيْكَ فِيمَا أَنْفَقْتَ، وَبَارَكَ لَكَ فِيمَا أَبْقَيْتَ
                        </p>
                        <p className="text-slate-500 dark:text-slate-300 text-[13px] px-2 leading-relaxed italic text-center">
                          "Semoga Allah memberikan pahala atas apa yang engkau berikan, dan memberikan keberkahan atas apa yang engkau simpan."
                        </p>
                      </div>
                      
                      <div className="w-full bg-emerald-50/80 dark:bg-emerald-900/20 rounded-2xl p-4 mb-4 border border-emerald-100 dark:border-emerald-800/30 relative overflow-hidden text-center shadow-inner scale-95 origin-center">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-300 to-emerald-500 dark:from-emerald-700 dark:to-emerald-500"></div>
                        <p className="text-[12px] md:text-[13px] text-emerald-800 dark:text-emerald-200 font-medium italic leading-relaxed">
                          "Sedekah itu memadamkan panasnya kubur bagi pelakunya, dan setiap mukmin akan bernaung di bawah naungan sedekahnya pada hari kiamat." (HR. Thabrani)
                        </p>
                      </div>

                      <div className="w-full bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-4 mb-5 border border-slate-100 dark:border-slate-700 relative overflow-hidden text-left">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[11px] md:text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">
                            {selectedProgramForDonation.category === 'Qurban' ? 'Investasi Syurga Anda' : 'Nominal Donasi'}
                          </span>
                          <span className="text-[10px] md:text-[11px] text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-md uppercase tracking-widest gap-1 flex items-center">
                            <CheckCircle2 className="w-3 h-3 md:w-3.5 md:h-3.5" /> Berhasil
                          </span>
                        </div>
                        <div className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-1">
                          Rp {donationAmount || "0"}
                        </div>
                        
                        {selectedProgramForDonation.category === 'Qurban' && qurbanName && (
                          <div className="pt-2 border-t border-slate-200 dark:border-slate-600/50 flex flex-col gap-1.5 mt-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] text-slate-500 dark:text-slate-400">Atas Nama:</span>
                              <span className="text-xs md:text-[13px] font-bold text-slate-800 dark:text-slate-200">{qurbanName}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] text-slate-500 dark:text-slate-400">Kuantitas:</span>
                              <span className="text-xs md:text-[13px] font-bold text-slate-800 dark:text-slate-200">{qurbanQty} Ekor</span>
                            </div>
                            {qurbanLocation && (
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] text-slate-500 dark:text-slate-400">Penyaluran:</span>
                                <span className="text-xs md:text-[13px] font-bold text-slate-800 dark:text-slate-200 truncate pl-2">{QURBAN_LOCATIONS.find(loc => loc.id === qurbanLocation)?.name || qurbanLocation}</span>
                              </div>
                            )}
                            {qurbanForParents && (
                              <div className="flex items-center justify-end">
                                <span className="text-[10px] md:text-[11px] bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300 font-bold px-2 py-0.5 rounded-full mt-1">
                                  ❤ Pahala Spesial Untuk Orang Tua Tercinta
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-600 flex justify-between items-center font-mono text-[10px] md:text-xs text-slate-400 dark:text-slate-500">
                          <span>Reference ID</span>
                          <span className="font-bold text-slate-600 dark:text-slate-300">#{Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 w-full mb-4">
                        <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.05 }} 
                          onClick={() => setIsTwibbonModalOpen(true)}
                          className="transition-all duration-300 flex items-center justify-center gap-2 py-3 px-4 bg-[#f29f05] hover:bg-[#d98f04] text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-[#f29f05]/20 hover:-translate-y-0.5 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:brightness-110 active:scale-95"
                        >
                          <Share2 className="w-4.5 h-4.5" /> Ajak Kebaikan
                        </motion.button>
                        <motion.button className="transition-all duration-300 flex items-center justify-center gap-2 py-3 px-4 bg-slate-100 dark:bg-slate-700/80 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 rounded-xl font-bold text-sm hover:-translate-y-0.5 transition-all duration-300 hover:shadow-lg" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}>
                          <Download className="w-4.5 h-4.5" /> Unduh Resi
                        </motion.button>
                      </div>
                      
                      <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.05 }} 
                        onClick={() => {
                           setSelectedProgramForDonation(null);
                           setTimeout(() => {
                             setIsDonationSuccess(false);
                             setShowPaymentInstructions(false);
                           }, 300);
                        }}
                        className="transition-all duration-300 w-full bg-gradient-to-r from-[#f29f05] to-[#d98f04] hover:from-[#d98f04] hover:to-[#c28003] text-white font-extrabold py-3.5 rounded-xl transition-all shadow-lg shadow-[#f29f05]/30 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:brightness-110 active:scale-95"
                      >
                        Kembali Menebar Kebaikan
                      </motion.button>
                    </motion.div>
                ) : showPaymentInstructions ? (
                   <motion.div 
                     initial={{ opacity: 0, x: 20 }}
                     animate={{ opacity: 1, x: 0 }}
                     className="flex flex-col gap-4 py-2"
                   >
                     <div className="bg-primary-50 dark:bg-primary-900/20 p-5 rounded-2xl border border-primary-100 dark:border-primary-800/50 text-center">
                       <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-slate-100 dark:border-slate-800">
                         <img 
                           src={PAYMENT_METHODS.find(m => m.id === selectedPaymentMethod)?.icon} 
                           className="w-10 h-10 object-contain" 
                           alt="" 
                         />
                       </div>
                       <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">
                         {PAYMENT_INSTRUCTIONS[selectedPaymentMethod]?.title || "Instruksi Pembayaran"}
                       </h4>
                       <div className="text-2xl font-black text-primary-600 dark:text-primary-400">
                         Rp {donationAmount}
                       </div>
                     </div>

                     <div className="space-y-3">
                       <label className="flex items-center gap-2 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">
                         <CheckCircle2 className="w-3.5 h-3.5" />
                         Langkah Pembayaran
                       </label>
                       <div className="space-y-2.5">
                         {(PAYMENT_INSTRUCTIONS[selectedPaymentMethod]?.steps || []).map((step: string, i: number) => (
                           <div key={i} className="flex gap-3 items-start bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/50 transition-all hover:border-primary-200">
                             <div className="w-6 h-6 rounded-full bg-primary-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                               {i + 1}
                             </div>
                             <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                               {step}
                             </p>
                           </div>
                         ))}
                       </div>
                     </div>

                     {PAYMENT_INSTRUCTIONS[selectedPaymentMethod]?.note && (
                       <div className="flex gap-3 bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-100 dark:border-amber-800/30">
                         <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                         <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium leading-relaxed">
                           {PAYMENT_INSTRUCTIONS[selectedPaymentMethod].note}
                         </p>
                       </div>
                     )}

                     <div className="flex flex-col gap-3 pt-2">
                       <motion.button 
                         whileHover={{ scale: 1.02 }}
                         whileTap={{ scale: 0.98 }}
                         onClick={() => {
                           finishDonation();
                         }}
                         className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-extrabold py-4 rounded-2xl shadow-xl shadow-primary-500/30 flex items-center justify-center gap-2 text-base"
                       >
                         Saya Sudah Transfer
                         <ArrowRight className="w-5 h-5" />
                       </motion.button>
                       
                       <button 
                         onClick={() => setShowPaymentInstructions(false)}
                         className="text-[13px] font-bold text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center justify-center gap-1.5 py-2"
                       >
                         Ubah Metode Pembayaran
                       </button>
                     </div>
                   </motion.div>
                ) : (
                <motion.form 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                  className="flex flex-col gap-3 md:gap-5" 
                  autoComplete="off"
                  onSubmit={async (e) => { 
                    e.preventDefault();
                    if (!donorPhone || donorPhone.trim() === '') {
                        alert("Mohon isi nomor telepon Anda.");
                        return;
                    }
                    setIsSubmitting(true);
                    
                    try {
                      const valAmount = parseInt(donationAmount.replace(/\D/g, ''));
                      if (!valAmount || valAmount <= 0) {
                        alert("Nominal donasi tidak valid");
                        setIsSubmitting(false);
                        return;
                      }

                      // Simulasi proses
                      await new Promise(resolve => setTimeout(resolve, 800));

                      setShowPaymentInstructions(true);
                      setIsSubmitting(false);
                      
                    } catch (err: any) {
                       setIsSubmitting(false);
                       console.error(err);
                       alert(err.message || "Terjadi kesalahan sistem pembayaran.");
                    }
                }}>
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-[10px] md:text-[11px] font-black text-primary-600 dark:text-primary-400 uppercase tracking-[0.2em] px-1">
                      <Calculator className="w-3 h-3" />
                      {selectedProgramForDonation.category === 'Qurban' ? 'Pilih Timbangan Amal Terbaik Anda' : 'Niatkan Sedekah Terbaik'}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(selectedProgramForDonation.category === 'Qurban' ? ['1.800.000', '2.500.000', '3.500.000'] : ['50.000', '100.000', '250.000']).map((amount) => (
                        <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.05 }} key={amount} type="button" onClick={() => setDonationAmount(amount)} className={`transition-all duration-300 py-2 text-[12px] md:text-sm font-black rounded-xl border transition-all duration-300 ${donationAmount === amount ? 'border-primary-500 bg-primary-50 text-primary-700 ring-2 ring-primary-500/10' : 'border-slate-200 text-slate-500 hover:border-primary-200 bg-white'} transition-all duration-300 hover:scale-105 hover:shadow-lg hover:brightness-110 active:scale-95`}>
                          {amount}
                        </motion.button>
                      ))}
                    </div>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="text-slate-400 font-bold text-xs">Rp</span>
                      </div>
                      <input required type="text" value={donationAmount} onChange={handleDonationAmountChange} placeholder="Nominal lainnya..." className="w-full pl-9 pr-4 py-2 bg-slate-50/50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 transition-all font-black text-base text-slate-900 dark:text-white" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Nama Sahabat Dakwah</label>
                      <input required value={donorName} onChange={(e) => setDonorName(e.target.value)} type="text" placeholder="Nama Anda" className="w-full px-3 py-2 bg-slate-50/50 rounded-xl border border-slate-200 text-sm font-medium" />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Nomor Telepon</label>
                      <input required value={donorPhone} onChange={(e) => setDonorPhone(e.target.value)} type="tel" placeholder="08xxxxxxxx" className="w-full px-3 py-2 bg-slate-50/50 rounded-xl border border-slate-200 text-sm font-medium" />
                    </div>
                  </div>

                  <div className="relative z-40">
                    <div className="flex justify-between items-center mb-2 gap-2">
                      <label className="block text-[10px] md:text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.15em] px-1 opacity-80 shrink-0">Metode Pembayaran</label>
                      <div className="relative flex-1 max-w-[150px]">
                        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                          <Search className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                        <input 
                          type="text" 
                          placeholder="Cari e-wallet / bank..." 
                          value={paymentSearchQuery}
                          onChange={(e) => setPaymentSearchQuery(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 text-[11px] bg-slate-50/80 dark:bg-slate-900/40 rounded-full border border-slate-200 dark:border-slate-700 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium text-slate-900 dark:text-white placeholder:text-slate-400"
                        />
                      </div>
                    </div>
                    <div className="flex overflow-x-auto gap-2 pb-2 snap-x hide-scrollbar -mx-1 px-1">
                      {PAYMENT_METHODS.filter(method => method.name.toLowerCase().includes(paymentSearchQuery.toLowerCase())).length > 0 ? (
                        PAYMENT_METHODS.filter(method => method.name.toLowerCase().includes(paymentSearchQuery.toLowerCase())).map((method) => (
                          <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.05 }}
                            key={method.id}
                            type="button"
                            onClick={() => setSelectedPaymentMethod(method.id)}
                            className={`transition-all duration-300 group min-w-[100px] flex gap-2 items-center p-2 rounded-xl border snap-start shrink-0 ${
                              selectedPaymentMethod === method.id
                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 shadow-sm ring-1 ring-primary-500/20'
                                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-primary-200 dark:hover:border-primary-700'
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center p-1 shrink-0 ${selectedPaymentMethod === method.id ? 'bg-white' : 'bg-slate-50 border border-slate-100 dark:border-slate-700 dark:bg-slate-900'}`}>
                              <img 
                                src={method.icon} 
                                alt={method.name} 
                                className={`w-full h-full object-contain transition-all duration-300 ${selectedPaymentMethod === method.id ? 'scale-110' : 'grayscale-[50%] group-hover:grayscale-0'}`} 
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <div className="flex flex-col items-start leading-none text-left min-w-0">
                              <span className={`font-bold text-[11px] md:text-[12px] truncate w-full ${selectedPaymentMethod === method.id ? 'text-primary-700 dark:text-primary-400' : 'text-slate-700 dark:text-slate-300'}`}>{method.name}</span>
                              <span className={`text-[9px] truncate w-full ${selectedPaymentMethod === method.id ? 'text-primary-500' : 'text-slate-400'}`}>{method.desc}</span>
                            </div>
                          </motion.button>
                        ))
                      ) : (
                        <div className="w-full text-center py-4 flex flex-col items-center justify-center">
                          <Wallet className="w-6 h-6 text-slate-300 dark:text-slate-600 mb-2" />
                          <span className="text-xs font-medium text-slate-500">Metode \'{paymentSearchQuery}\' tidak ditemukan</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedProgramForDonation.category === 'Qurban' && (
                    <div className="bg-primary-50/50 dark:bg-primary-900/10 p-3.5 md:p-4 rounded-xl border border-primary-100 dark:border-primary-900/30 space-y-4">
                      <div>
                        <label className="block text-[11px] md:text-[13px] font-bold text-slate-700 dark:text-slate-300 mb-1 md:mb-1.5 uppercase tracking-wider" htmlFor="qurban-name">
                          Atas Nama Siapa Qurban Ini Diniatkan? <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                           <div className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none">
                             <UserCircle className="w-4 h-4 md:w-5 md:h-5 text-slate-400" />
                           </div>
                           <input 
                             id="qurban-name" 
                             required 
                             type="text" 
                             value={qurbanName}
                             onChange={(e) => setQurbanName(e.target.value)}
                             placeholder="Contoh: Hamba Allah (Dicatat di buku amal)" 
                             className="w-full pl-9 md:pl-11 pr-4 py-2 md:py-3 bg-white dark:bg-slate-900/50 rounded-lg md:rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm md:text-base" 
                           />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] md:text-[13px] font-bold text-slate-700 dark:text-slate-300 mb-1 md:mb-1.5 uppercase tracking-wider" htmlFor="qurban-location">
                          Pilih Wilayah Penyaluran Qurban <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                           <div className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none">
                             <MapPin className="w-4 h-4 md:w-5 md:h-5 text-slate-400" />
                           </div>
                           <select 
                             id="qurban-location" 
                             required 
                             value={qurbanLocation}
                             onChange={(e) => setQurbanLocation(e.target.value)}
                             className="w-full pl-9 md:pl-11 pr-8 py-2 md:py-3 bg-white dark:bg-slate-900/50 rounded-lg md:rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm md:text-base appearance-none cursor-pointer" 
                           >
                             <option value="" disabled>Pilih Wilayah Penyaluran</option>
                             {QURBAN_LOCATIONS.map((loc) => (
                               <option key={loc.id} value={loc.id}>{loc.name}</option>
                             ))}
                           </select>
                           <div className="absolute inset-y-0 right-0 pr-3 md:pr-4 flex items-center pointer-events-none">
                             <ChevronDown className="w-4 h-4 md:w-5 md:h-5 text-slate-400" />
                           </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] md:text-[13px] font-bold text-slate-700 dark:text-slate-300 mb-1 md:mb-1.5 uppercase tracking-wider" htmlFor="qurban-animal">
                            Tipe Hewan Qurban <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                             <select 
                               id="qurban-animal" 
                               required 
                               value={qurbanAnimal}
                               onChange={(e) => setQurbanAnimal(e.target.value)}
                               className="w-full px-3 py-2 md:py-3 bg-white dark:bg-slate-900/50 rounded-lg md:rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm md:text-base appearance-none cursor-pointer" 
                             >
                               <option value="" disabled>Pilih Hewan Qurban</option>
                               {QURBAN_ANIMALS.map((animal) => (
                                 <option key={animal.id} value={animal.id}>{animal.name}</option>
                               ))}
                             </select>
                             <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                               <ChevronDown className="w-4 h-4 text-slate-400" />
                             </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] md:text-[13px] font-bold text-slate-700 dark:text-slate-300 mb-1 md:mb-1.5 uppercase tracking-wider" htmlFor="qurban-processing">
                            Metode Penyaluran <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                             <select 
                               id="qurban-processing" 
                               required 
                               value={qurbanProcessing}
                               onChange={(e) => setQurbanProcessing(e.target.value)}
                               className="w-full px-3 py-2 md:py-3 bg-white dark:bg-slate-900/50 rounded-lg md:rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm md:text-base appearance-none cursor-pointer" 
                             >
                               <option value="" disabled>Pilih Metode Penyaluran</option>
                               {QURBAN_PROCESSING.map((process) => (
                                 <option key={process.id} value={process.id}>{process.name}</option>
                               ))}
                             </select>
                             <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                               <ChevronDown className="w-4 h-4 text-slate-400" />
                             </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="flex-1">
                          <label className="block text-[11px] md:text-[13px] font-bold text-slate-700 dark:text-slate-300 mb-1 md:mb-1.5 uppercase tracking-wider" htmlFor="qurban-qty">
                            Jumlah Keberkahan (Bagian/Ekor)
                          </label>
                          <div className="flex items-center gap-2">
                             <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.05 }} type="button" onClick={() => setQurbanQty(Math.max(1, qurbanQty - 1))} className="transition-all duration-300 w-10 h-10 md:w-12 md:h-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-center hover:bg-slate-50 transition-colors text-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:brightness-110 active:scale-95">-</motion.button>
                             <div className="flex-1 text-center font-bold text-lg">{qurbanQty}</div>
                             <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.05 }} type="button" onClick={() => setQurbanQty(qurbanQty + 1)} className="transition-all duration-300 w-10 h-10 md:w-12 md:h-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-center hover:bg-slate-50 transition-colors text-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:brightness-110 active:scale-95">+</motion.button>
                          </div>
                        </div>
                        <div className="flex-1 flex flex-col justify-end">
                          <label className="flex items-center gap-2.5 p-2.5 md:p-3 bg-white dark:bg-slate-800 border items-center border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors group">
                            <input 
                              type="checkbox" 
                              checked={qurbanForParents}
                              onChange={(e) => setQurbanForParents(e.target.checked)}
                              className="w-4 h-4 md:w-5 md:h-5 rounded text-primary-600 focus:ring-primary-500 border-slate-300"
                            />
                            <span className="text-[11px] md:text-[13px] font-bold text-slate-700 dark:text-slate-300 group-hover:text-primary-700 transition-colors">
                              Persembahan Paling Mulia Untuk Orang Tua
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1 flex justify-between items-center">
                      <span>Titipkan Doa & Harapan</span>
                      <span className="text-slate-400 capitalize normal-case text-[9px] font-medium italic">Tampil live di Dinding Doa</span>
                    </label>
                    <div className="relative">
                      <textarea 
                        value={newPrayerMessage} 
                        onChange={(e) => setNewPrayerMessage(e.target.value)} 
                        rows={2}
                        placeholder="Tuliskan doa terbaik Anda (Opsional)" 
                        className="w-full px-3.5 py-3 bg-white dark:bg-slate-800/80 rounded-[1.25rem] border border-slate-200 dark:border-slate-700 text-sm font-medium resize-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 shadow-sm pr-4 transition-all"
                      ></textarea>
                    </div>
                    <div className="flex justify-end px-1">
                      <button
                        type="button"
                        onClick={handleGeneratePrayer}
                        disabled={isGeneratingPrayer}
                        className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 px-3 py-1.5 rounded-xl transition-all border border-indigo-200/50 dark:border-indigo-500/20 shadow-sm"
                      >
                        {isGeneratingPrayer ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                        )}
                        Bantu Rangkai Doa
                      </button>
                    </div>
                  </div>

                  <div className="mt-0.5 md:mt-2 text-[10px] md:text-[13px] text-slate-600 dark:text-slate-300 bg-emerald-50 dark:bg-emerald-900/20 px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl border border-emerald-100 dark:border-emerald-800/50 flex items-start gap-2 md:gap-3 shadow-inner">
                    <ShieldCheck className="w-4 h-4 md:w-5 md:h-5 text-emerald-500 dark:text-emerald-400 shrink-0 md:mt-0.5" />
                    <p className="leading-relaxed">
                      {selectedProgramForDonation.category === 'Qurban' 
                        ? <>"Maka laksanakanlah shalat karena Tuhanmu, dan berqurbanlah (sebagai ibadah dan mendekatkan diri kepada Allah)." <span className="text-emerald-700 dark:text-emerald-300 font-medium">(QS. Al-Kautsar: 2)</span></>
                        : <>"Perumpamaan nafkah yang dikeluarkan oleh orang-orang yang menafkahkan hartanya di jalan Allah, adalah serupa dengan sebutir benih yang menumbuhkan tujuh bulir..." <span className="text-emerald-700 dark:text-emerald-300 font-medium">(QS. Al-Baqarah: 261)</span></>
                      }
                    </p>
                  </div>

                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit" 
                    disabled={isSubmitting}
                    className="transition-all duration-300 w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-extrabold py-4 rounded-2xl transition-all shadow-xl shadow-primary-500/30 text-[15px] md:text-lg flex items-center justify-center gap-2 mt-2 group focus:outline-none disabled:opacity-75 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-lg"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Memproses...
                      </span>
                    ) : (
                      <>
                        {selectedProgramForDonation.category === 'Qurban' ? 'Bismillah, Siapkan Kendaraan Syurga Anda Sekarang' : 'Bismillah, Tunaikan Sedekah'} 
                        <Heart className="w-5 h-5 fill-white/20 group-hover:scale-110 transition-transform" />
                      </>
                    )}
                  </motion.button>
                </motion.form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Zakat Calculator Modal */}
      <AnimatePresence>
        {isZakatCalculatorOpen && (
          <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 dark:border-slate-800 flex flex-col max-h-[90vh]"
            >
              <div className="bg-primary-50 dark:bg-primary-900/20 p-4 border-b border-primary-100 dark:border-primary-800/50 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 dark:bg-primary-800 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-400">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-200">Kalkulator Zakat</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Hitung & tunaikan kewajiban Zakat</p>
                  </div>
                </div>
                <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.05 }} 
                  onClick={() => setIsZakatCalculatorOpen(false)}
                  className="transition-all duration-300 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-white/50 hover:bg-white dark:bg-slate-800/50 dark:hover:bg-slate-700 rounded-full transition-colors transition-all duration-300 hover:scale-105 hover:shadow-lg hover:brightness-110 active:scale-95"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Tab Navigation */}
              <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                {[
                  { id: 'penghasilan', label: 'Penghasilan' },
                  { id: 'maal', label: 'Maal/Harta' },
                  { id: 'perdagangan', label: 'Perdagangan' },
                  { id: 'saham', label: 'Saham' },
                  { id: 'rikaz', label: 'Rikaz' },
                  { id: 'fidyah', label: 'Fidyah' }
                ].map((tab) => (
                  <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.05 }}
                    key={tab.id}
                    onClick={() => setZakatTab(tab.id as any)}
                    className={`transition-all duration-300 flex-1 py-3 text-[9px] md:text-xs font-bold transition-all ${
                      zakatTab === tab.id 
                        ? 'text-primary-600 dark:text-primary-400 bg-white dark:bg-slate-900 border-t-2 border-t-primary-500 shadow-[0_-2px_10px_rgba(0,0,0,0.02)]' 
                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 border-t-2 border-t-transparent hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    {tab.label}
                  </motion.button>
                ))}
              </div>

              <div className="p-5 overflow-y-auto custom-scrollbar flex-1">
                <div className="mb-5 p-3.5 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800/30 flex items-center justify-between group cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider mb-0.5 block">
                      Harga Emas Saat Ini
                    </label>
                    <div className="flex items-center gap-1.5 focus-within:ring-2 focus-within:ring-primary-500/20 rounded-md">
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Rp</span>
                      <input 
                        type="text" 
                        value={formatCurrencyForm(goldPrice)}
                        onChange={(e) => setGoldPrice(e.target.value)}
                        className="bg-transparent text-sm font-bold text-slate-800 dark:text-slate-200 focus:outline-none w-24 border-b border-dashed border-slate-300 dark:border-slate-600 focus:border-primary-500"
                        title="Bisa diubah secara manual"
                      />
                      <span className="text-xs font-medium text-slate-500">/ gram</span>
                    </div>
                  </div>
                  {isFetchingGold ? (
                    <span className="text-[10px] bg-blue-100 dark:bg-blue-800/50 text-blue-600 dark:text-blue-300 px-2.5 py-1 rounded-full font-bold animate-pulse">Memperbarui</span>
                  ) : (
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2.5 py-1 rounded-full font-bold group-hover:bg-blue-100 dark:group-hover:bg-blue-800/50 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">Manual/Auto</span>
                  )}
                </div>

                <div className="space-y-4">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={zakatTab}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      {zakatTab === 'penghasilan' && (
                        <>
                          {[
                            { label: 'Pendapatan per Bulan', val: zakatIncome, set: setZakatIncome },
                            { label: 'Bonus/THR', val: zakatBonus, set: setZakatBonus }
                          ].map((f, i) => (
                            <div key={i}>
                              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">{f.label}</label>
                              <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                  <span className="text-slate-400 group-focus-within:text-primary-500 font-bold text-sm transition-colors">Rp</span>
                                </div>
                                <input 
                                  type="text" 
                                  value={formatCurrencyForm(f.val)}
                                  onChange={(e) => f.set(e.target.value.replace(/\D/g, ''))}
                                  placeholder="0"
                                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600" 
                                />
                              </div>
                            </div>
                          ))}
                        </>
                      )}

                      {zakatTab === 'maal' && (
                        <>
                          {[
                            { label: 'Uang Tunai & Tabungan', val: maalTabungan, set: setMaalTabungan },
                            { label: 'Nilai Emas / Perak', val: maalEmas, set: setMaalEmas },
                            { label: 'Properti / Kendaraan (Non-primer)', val: maalProperti, set: setMaalProperti },
                            { label: 'Hutang Jatuh Tempo', val: maalHutang, set: setMaalHutang, isDeduction: true }
                          ].map((f, i) => (
                            <div key={i}>
                              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">{f.label}</label>
                              <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                  <span className={`font-bold text-sm transition-colors ${f.isDeduction ? 'text-red-400 group-focus-within:text-red-500' : 'text-slate-400 group-focus-within:text-primary-500'}`}>Rp</span>
                                </div>
                                <input 
                                  type="text" 
                                  value={formatCurrencyForm(f.val)}
                                  onChange={(e) => f.set(e.target.value)}
                                  placeholder="0"
                                  className={`w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 transition-all text-sm font-bold placeholder:text-slate-300 dark:placeholder:text-slate-600 ${f.isDeduction ? 'focus:ring-red-500/20 focus:border-red-500 text-red-700 dark:text-red-400' : 'focus:ring-primary-500/20 focus:border-primary-500 text-slate-900 dark:text-white'}`} 
                                />
                              </div>
                            </div>
                          ))}
                        </>
                      )}

                      {zakatTab === 'perdagangan' && (
                        <>
                          {[
                            { label: 'Modal Diputar', val: dagangModal, set: setDagangModal },
                            { label: 'Keuntungan Perdagangan', val: dagangUntung, set: setDagangUntung },
                            { label: 'Piutang Lancar', val: dagangPiutang, set: setDagangPiutang },
                            { label: 'Hutang Jatuh Tempo', val: dagangHutang, set: setDagangHutang, isDeduction: true }
                          ].map((f, i) => (
                            <div key={i}>
                              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">{f.label}</label>
                              <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                  <span className={`font-bold text-sm transition-colors ${f.isDeduction ? 'text-red-400 group-focus-within:text-red-500' : 'text-slate-400 group-focus-within:text-primary-500'}`}>Rp</span>
                                </div>
                                <input 
                                  type="text" 
                                  value={formatCurrencyForm(f.val)}
                                  onChange={(e) => f.set(e.target.value)}
                                  placeholder="0"
                                  className={`w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 transition-all text-sm font-bold placeholder:text-slate-300 dark:placeholder:text-slate-600 ${f.isDeduction ? 'focus:ring-red-500/20 focus:border-red-500 text-red-700 dark:text-red-400' : 'focus:ring-primary-500/20 focus:border-primary-500 text-slate-900 dark:text-white'}`} 
                                />
                              </div>
                            </div>
                          ))}
                        </>
                      )}

                      {zakatTab === 'saham' && (
                        <>
                          {[
                            { label: 'Nilai Saham Saat Ini', val: sahamNilai, set: setSahamNilai },
                            { label: 'Keuntungan / Dividen', val: sahamDividen, set: setSahamDividen }
                          ].map((f, i) => (
                            <div key={i}>
                              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">{f.label}</label>
                              <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                  <span className="text-slate-400 group-focus-within:text-primary-500 font-bold text-sm transition-colors">Rp</span>
                                </div>
                                <input 
                                  type="text" 
                                  value={formatCurrencyForm(f.val)}
                                  onChange={(e) => f.set(e.target.value)}
                                  placeholder="0"
                                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600" 
                                />
                              </div>
                            </div>
                          ))}
                        </>
                      )}

                      {zakatTab === 'rikaz' && (
                        <>
                          <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-200 dark:border-amber-700/50 mb-4 bg-opacity-50">
                            <p className="text-xs text-amber-800 dark:text-amber-400 leading-relaxed">
                              <b>Zakat Rikaz</b> (Harta Temuan/Karun) tidak memiliki syarat nisab maupun haul (waktu kepemilikan). Kewajiban zakatnya adalah <b>20% (Khums)</b> dan harus segera dikeluarkan saat harta tersebut ditemukan.
                            </p>
                          </div>
                          {[
                            { label: 'Nilai Harta Temuan (Rikaz)', val: rikazNilai, set: setRikazNilai }
                          ].map((f, i) => (
                            <div key={i}>
                              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">{f.label}</label>
                              <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                  <span className="text-slate-400 group-focus-within:text-primary-500 font-bold text-sm transition-colors">Rp</span>
                                </div>
                                <input 
                                  type="text" 
                                  value={formatCurrencyForm(f.val)}
                                  onChange={(e) => f.set(e.target.value)}
                                  placeholder="0"
                                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600" 
                                />
                              </div>
                            </div>
                          ))}
                        </>
                      )}

                      {zakatTab === 'fidyah' && (
                        <>
                          <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-200 dark:border-amber-700/50 mb-4 bg-opacity-50">
                            <p className="text-xs text-amber-800 dark:text-amber-400 leading-relaxed">
                              <b>Fidyah</b> dibayarkan untuk mengganti puasa Ramadhan yang ditinggalkan (bagi yang tidak mampu mengganti/qadha puasa). <b>Kafarat</b> adalah tebusan atas pelanggaran (seperti sumpah).
                            </p>
                          </div>
                          <div className="mb-4">
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">Jenis Kewajiban</label>
                            <div className="flex gap-2">
                              <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.05 }}
                                onClick={() => { setFidyahType('fidyah'); setFidyahRate('60000'); }}
                                className={`transition-all duration-300 flex-1 py-2 text-xs font-bold rounded-lg border transition-colors ${fidyahType === 'fidyah' ? 'bg-primary-500 text-white border-primary-500' : 'bg-transparent text-slate-600 border-slate-300 dark:text-slate-300 dark:border-slate-600'}`}
                              >Fidyah Puasa</motion.button>
                              <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.05 }}
                                onClick={() => { setFidyahType('kafarat'); setFidyahRate('60000'); }}
                                className={`transition-all duration-300 flex-1 py-2 text-xs font-bold rounded-lg border transition-colors ${fidyahType === 'kafarat' ? 'bg-primary-500 text-white border-primary-500' : 'bg-transparent text-slate-600 border-slate-300 dark:text-slate-300 dark:border-slate-600'}`}
                              >Kafarat Sumpah</motion.button>
                            </div>
                          </div>
                          {[
                            { label: fidyahType === 'fidyah' ? 'Jumlah Hari Ditinggalkan' : 'Jumlah Pelanggaran', val: fidyahDays, set: setFidyahDays, prefix: '' },
                            { label: fidyahType === 'fidyah' ? 'Harga Fidyah per Hari' : 'Harga Kafarat (Makan 10 Orang Miskin)', val: fidyahRate, set: setFidyahRate, prefix: 'Rp' }
                          ].map((f, i) => (
                            <div key={i}>
                              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider mt-4">{f.label}</label>
                              <div className="relative group">
                                {f.prefix && (
                                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <span className="text-slate-400 group-focus-within:text-primary-500 font-bold text-sm transition-colors">{f.prefix}</span>
                                  </div>
                                )}
                                <input 
                                  type="text" 
                                  value={f.prefix ? formatCurrencyForm(f.val) : f.val}
                                  onChange={(e) => f.set(e.target.value.replace(/\D/g, ''))}
                                  placeholder="0"
                                  className={`w-full ${f.prefix ? 'pl-10' : 'pl-4'} pr-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600`} 
                                />
                              </div>
                            </div>
                          ))}
                        </>
                      )}
                    </motion.div>
                  </AnimatePresence>

                  <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800/50 shadow-inner mt-6 space-y-4">
                    {totalAsset > 0 && (
                      <div>
                        <h5 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 border-b border-slate-200 dark:border-slate-700/50 pb-1.5 flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5" /> Rincian Sumber Dana
                        </h5>
                        <div className="space-y-1.5 mb-3 px-1">
                          {zakatTab === 'penghasilan' && (
                            <>
                              {parseInt(zakatIncome.replace(/\D/g, '')) > 0 && <div className="flex justify-between text-xs"><span className="text-slate-600 dark:text-slate-300">Pendapatan</span><span className="font-medium text-slate-800 dark:text-slate-200">Rp {formatCurrencyForm(zakatIncome)}</span></div>}
                              {parseInt(zakatBonus.replace(/\D/g, '')) > 0 && <div className="flex justify-between text-xs"><span className="text-slate-600 dark:text-slate-300">Bonus/THR</span><span className="font-medium text-slate-800 dark:text-slate-200">Rp {formatCurrencyForm(zakatBonus)}</span></div>}
                            </>
                          )}
                          {zakatTab === 'maal' && (
                            <>
                              {parseInt(maalTabungan.replace(/\D/g, '')) > 0 && <div className="flex justify-between text-xs"><span className="text-slate-600 dark:text-slate-300">Tabungan</span><span className="font-medium text-slate-800 dark:text-slate-200">Rp {formatCurrencyForm(maalTabungan)}</span></div>}
                              {parseInt(maalEmas.replace(/\D/g, '')) > 0 && <div className="flex justify-between text-xs"><span className="text-slate-600 dark:text-slate-300">Emas/Perak</span><span className="font-medium text-slate-800 dark:text-slate-200">Rp {formatCurrencyForm(maalEmas)}</span></div>}
                              {parseInt(maalProperti.replace(/\D/g, '')) > 0 && <div className="flex justify-between text-xs"><span className="text-slate-600 dark:text-slate-300">Properti/Kendaraan</span><span className="font-medium text-slate-800 dark:text-slate-200">Rp {formatCurrencyForm(maalProperti)}</span></div>}
                              {parseInt(maalHutang.replace(/\D/g, '')) > 0 && <div className="flex justify-between text-xs"><span className="text-slate-600 dark:text-slate-300">Hutang</span><span className="font-medium text-red-500">-Rp {formatCurrencyForm(maalHutang)}</span></div>}
                            </>
                          )}
                          {zakatTab === 'perdagangan' && (
                            <>
                              {parseInt(dagangModal.replace(/\D/g, '')) > 0 && <div className="flex justify-between text-xs"><span className="text-slate-600 dark:text-slate-300">Modal Diputar</span><span className="font-medium text-slate-800 dark:text-slate-200">Rp {formatCurrencyForm(dagangModal)}</span></div>}
                              {parseInt(dagangUntung.replace(/\D/g, '')) > 0 && <div className="flex justify-between text-xs"><span className="text-slate-600 dark:text-slate-300">Keuntungan</span><span className="font-medium text-slate-800 dark:text-slate-200">Rp {formatCurrencyForm(dagangUntung)}</span></div>}
                              {parseInt(dagangPiutang.replace(/\D/g, '')) > 0 && <div className="flex justify-between text-xs"><span className="text-slate-600 dark:text-slate-300">Piutang Lancar</span><span className="font-medium text-slate-800 dark:text-slate-200">Rp {formatCurrencyForm(dagangPiutang)}</span></div>}
                              {parseInt(dagangHutang.replace(/\D/g, '')) > 0 && <div className="flex justify-between text-xs"><span className="text-slate-600 dark:text-slate-300">Hutang</span><span className="font-medium text-red-500">-Rp {formatCurrencyForm(dagangHutang)}</span></div>}
                            </>
                          )}
                          {zakatTab === 'saham' && (
                            <>
                              {parseInt(sahamNilai.replace(/\D/g, '')) > 0 && <div className="flex justify-between text-xs"><span className="text-slate-600 dark:text-slate-300">Nilai Saham</span><span className="font-medium text-slate-800 dark:text-slate-200">Rp {formatCurrencyForm(sahamNilai)}</span></div>}
                              {parseInt(sahamDividen.replace(/\D/g, '')) > 0 && <div className="flex justify-between text-xs"><span className="text-slate-600 dark:text-slate-300">Dividen</span><span className="font-medium text-slate-800 dark:text-slate-200">Rp {formatCurrencyForm(sahamDividen)}</span></div>}
                            </>
                          )}
                          {zakatTab === 'rikaz' && (
                            <>
                              {parseInt(rikazNilai.replace(/\D/g, '')) > 0 && <div className="flex justify-between text-xs"><span className="text-slate-600 dark:text-slate-300">Nilai Temuan</span><span className="font-medium text-slate-800 dark:text-slate-200">Rp {formatCurrencyForm(rikazNilai)}</span></div>}
                            </>
                          )}
                          {zakatTab === 'fidyah' && (
                            <>
                              {parseInt(fidyahDays.replace(/\D/g, '')) > 0 && <div className="flex justify-between text-xs"><span className="text-slate-600 dark:text-slate-300">{fidyahType === 'fidyah' ? 'Hari Ditinggalkan' : 'Jumlah Pelanggaran'}</span><span className="font-medium text-slate-800 dark:text-slate-200">{fidyahDays}</span></div>}
                              {parseInt(fidyahRate.replace(/\D/g, '')) > 0 && <div className="flex justify-between text-xs"><span className="text-slate-600 dark:text-slate-300">Tarif per {fidyahType === 'fidyah' ? 'Hari' : 'Pelanggaran'}</span><span className="font-medium text-slate-800 dark:text-slate-200">Rp {formatCurrencyForm(fidyahRate)}</span></div>}
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {zakatTab !== 'rikaz' && zakatTab !== 'fidyah' && (
                      <div>
                        <h5 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 border-b border-slate-200 dark:border-slate-700/50 pb-1.5 flex items-center gap-1.5">
                          <Calculator className="w-3.5 h-3.5" /> Detail Perhitungan Nisab
                        </h5>
                        <div className="space-y-1.5 px-1 text-xs">
                          {zakatTab === 'penghasilan' && (
                            <div className="mb-2 text-[10px] text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800/50 p-2 rounded border border-slate-100 dark:border-slate-700/50 leading-relaxed">
                              Nisab zakat penghasilan adalah senilai 85 gram emas per tahun. Jika dibayar per bulan, nisab dihitung dari nilai 85 gram emas dibagi 12 bulan. Zakat yang harus dikeluarkan adalah 2,5% dari total penghasilan.
                            </div>
                          )}
                          {zakatTab === 'maal' && (
                            <div className="mb-2 text-[10px] text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800/50 p-2 rounded border border-slate-100 dark:border-slate-700/50 leading-relaxed">
                              Nisab zakat maal (harta simpanan) adalah senilai 85 gram emas. Harta yang wajib dizakati adalah yang telah mencapai haul (1 tahun) dan dihitung setelah dikurangi hutang jatuh tempo. Nilai zakatnya adalah 2,5%.
                            </div>
                          )}
                          {zakatTab === 'perdagangan' && (
                            <div className="mb-2 text-[10px] text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800/50 p-2 rounded border border-slate-100 dark:border-slate-700/50 leading-relaxed">
                              Nisab zakat perdagangan sama dengan zakat maal, yaitu senilai 85 gram emas. Dihitung dari keseluruhan aset berputar (Modal + Untung + Piutang) dikurangi hutang jatuh tempo. Zakat yang dikeluarkan sebesar 2,5%.
                            </div>
                          )}
                          {zakatTab === 'saham' && (
                            <div className="mb-2 text-[10px] text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800/50 p-2 rounded border border-slate-100 dark:border-slate-700/50 leading-relaxed">
                              Nisab zakat saham disamakan dengan zakat maal (85 gram emas). Nilai aset dihitung dari nilai wajar saham (saat haul tiba) ditambah total dividen yang diterima. Zakat yang dikeluarkan adalah 2,5%.
                            </div>
                          )}
                          <div className="flex justify-between mt-2">
                            <span className="text-slate-600 dark:text-slate-300">Harga Emas</span>
                            <span className="font-medium text-slate-800 dark:text-slate-200">Rp {formatCurrencyForm(goldPrice)} / gr</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600 dark:text-slate-300">Nisab (85 gram)</span>
                            <span className="font-medium text-slate-800 dark:text-slate-200">Rp {formatCurrencyForm((parseInt(goldPrice.replace(/\D/g, '')) * 85).toString())} / tahun</span>
                          </div>
                          {zakatTab === 'penghasilan' && (
                            <div className="flex justify-between">
                              <span className="text-slate-600 dark:text-slate-300">Nisab per Bulan (85gr / 12)</span>
                              <span className="font-medium text-slate-800 dark:text-slate-200">Rp {formatCurrencyForm(Math.floor((parseInt(goldPrice.replace(/\D/g, '')) * 85) / 12).toString())} / bulan</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className={`${totalAsset > 0 || (zakatTab !== 'rikaz' && zakatTab !== 'fidyah') ? 'pt-3 border-t border-slate-200 dark:border-slate-700/50 mt-2' : ''}`}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{zakatTab === 'fidyah' ? 'Total Tagihan' : 'Total Harta Terhitung'}</span>
                        <span className="text-sm font-bold text-primary-600 dark:text-primary-500">Rp {formatCurrencyForm(totalAsset.toString())}</span>
                      </div>
                      {zakatTab !== 'fidyah' && (
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Batas Nisab {zakatTab === 'rikaz' ? '(Tidak Ada)' : zakatTab === 'penghasilan' ? '(Bulan)' : '(Tahun)'}</span>
                          <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">Rp {formatCurrencyForm(Math.floor(requiredNisab).toString())}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {isEligibleZakat ? (
                    <motion.div 
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/20 p-5 rounded-2xl border border-emerald-200 dark:border-emerald-700/50 text-center relative overflow-hidden shadow-sm"
                    >
                      <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-400 to-emerald-500"></div>
                      <p className="text-xs font-extrabold text-emerald-800 dark:text-emerald-400 uppercase tracking-widest mb-1.5 flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {zakatTab === 'fidyah' ? 'Wajib Dibayarkan' : `Wajib Zakat (${zakatTab === 'rikaz' ? '20%' : '2.5%'})`}
                      </p>
                      <h4 className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mb-2 drop-shadow-sm">Rp {formatCurrencyForm(zakatToPay.toString())}</h4>
                      <p className="text-xs font-medium text-emerald-700/80 dark:text-emerald-400/80 leading-relaxed px-4">{zakatTab === 'fidyah' ? (fidyahType === 'fidyah' ? 'Tunaikan fidyah Anda untuk mengganti puasa yang ditinggalkan.' : 'Tunaikan kafarat Anda sebagai tebusan atas pelanggaran.') : zakatTab === 'rikaz' ? 'Rikaz (Harta Temuan) wajib dikeluarkan zakatnya sebesar 20% tanpa syarat nisab dan haul.' : 'Alhamdulillah, harta Anda telah mencapai nisab. Tunaikan segera untuk membersihkan dan memberkahi harta Anda.'}</p>
                    </motion.div>
                  ) : totalAsset > 0 && zakatTab !== 'fidyah' ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl text-center border border-slate-200 dark:border-slate-700/50"
                    >
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400 leading-relaxed">Harta Anda belum mencapai batas nisab wajib zakat. Anda tetap bisa meraih keutamaan berbagi dengan menunaikan <b>Infak</b> atau <b>Sedekah</b>.</p>
                    </motion.div>
                  ) : null}

                </div>
              </div>

              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 relative z-20 shadow-[0_-10px_30px_rgba(0,0,0,0.02)] dark:shadow-[0_-10px_30px_rgba(0,0,0,0.2)]">
                <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.05 }}
                  disabled={!isEligibleZakat}
                  onClick={() => {
                    setIsZakatCalculatorOpen(false);
                    setTimeout(() => {
                      navigate('/donasi');
                      window.scrollTo(0,0);
                    }, 300);
                  }}
                  className={`w-full py-4 rounded-xl font-extrabold flex items-center justify-center gap-2 transition-all text-sm md:text-base ${ isEligibleZakat ? 'bg-gradient-to-r from-primary-500 to-[#1799dc] hover:from-primary-600 hover:to-[#1380b8] text-white shadow-lg shadow-primary-500/30 hover:shadow-xl hover:-translate-y-0.5' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed border border-slate-200 dark:border-slate-700/50' } duration-300`}
                >
                  {isEligibleZakat ? 'Bismillah, Tunaikan Zakat' : 'Penuhi Nisab Terlebih Dahulu'}
                </motion.button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {selectedProgramForDonation && (
        <TwibbonModal 
          isOpen={isTwibbonModalOpen} 
          onClose={() => setIsTwibbonModalOpen(false)} 
          program={selectedProgramForDonation} 
          donorName={donorName}
        />
      )}

      {/* Live Transaction Pop-up (Removed) */}

      {/* AI Chatbot */}
      <Chatbot />
    </div>
  );
}
