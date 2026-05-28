import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Search, Clock, CheckCircle2, UserCircle, Edit2, Save, X, Download, Heart, TrendingUp, History, FileText, Award, Flame, Star, Sparkles, ChevronDown, ChevronUp, Target, Quote, Building, ChevronRight } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from 'recharts';

const mockDonationHistory = [
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
    id: "TRX-10292",
    date: "11 Ramadhan 1447 H / 01 Mar 2026",
    program: "Sedekah Subuh",
    amount: 50000,
    status: "Berhasil",
    method: "Gopay",
  },
  {
    id: "TRX-10291",
    date: "10 Ramadhan 1447 H / 28 Feb 2026",
    program: "Pembangunan Masjid As-Salam",
    amount: 1000000,
    status: "Pending",
    method: "Bank Transfer",
  }
];

const chartData = [
  { name: 'Jan', amount: 150000 },
  { name: 'Feb', amount: 300000 },
  { name: 'Mar', amount: 200000 },
  { name: 'Apr', amount: 500000 },
  { name: 'Mei', amount: 450000 },
  { name: 'Jun', amount: 700000 },
];

export const DonationHistory: React.FC<{ userDonations?: any[] }> = ({ userDonations = [] }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Semua');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState(localStorage.getItem('app_user_name') || '');
  const [profilePhone, setProfilePhone] = useState(localStorage.getItem('app_user_phone') || '');
  const [inputName, setInputName] = useState(profileName);
  const [inputPhone, setInputPhone] = useState(profilePhone);

  const saveProfile = () => {
    localStorage.setItem('app_user_name', inputName);
    localStorage.setItem('app_user_phone', inputPhone);
    setProfileName(inputName);
    setProfilePhone(inputPhone);
    setIsEditingProfile(false);
  };

  const cancelEdit = () => {
    setInputName(profileName);
    setInputPhone(profilePhone);
    setIsEditingProfile(false);
  };

  // Gunakan data dari props (Firebase) jika ada, jika tidak fallback ke mock data
  const historyDataToUse = userDonations.length > 0 ? userDonations : mockDonationHistory;

  const filteredHistory = historyDataToUse.filter((item: any) => {
    if (activeTab === 'Semua') return true;
    return item.status === activeTab;
  });

  const totalDonation = historyDataToUse
    .filter((item: any) => item.status === 'Berhasil')
    .reduce((acc: number, curr: any) => acc + curr.amount, 0);

  const getDonorLevel = (total: number) => {
    if (total > 5000000) return { name: 'Platinum', icon: <Award className="w-4 h-4 text-purple-500" />, color: 'from-purple-400 to-purple-600', text: 'text-purple-600', bg: 'bg-purple-100' };
    if (total > 1000000) return { name: 'Gold', icon: <Star className="w-4 h-4 text-yellow-500" />, color: 'from-yellow-400 to-amber-500', text: 'text-amber-600', bg: 'bg-amber-100' };
    if (total > 500000) return { name: 'Silver', icon: <Sparkles className="w-4 h-4 text-slate-400" />, color: 'from-slate-400 to-slate-500', text: 'text-slate-600', bg: 'bg-slate-100' };
    return { name: 'Bronze', icon: <Flame className="w-4 h-4 text-orange-500" />, color: 'from-orange-400 to-red-500', text: 'text-orange-600', bg: 'bg-orange-100' };
  };

  const level = getDonorLevel(totalDonation);

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#0f172a] pt-24 pb-12 transition-colors duration-300 font-sans selection:bg-[#1799dc]/30">
      <div className="max-w-4xl mx-auto px-4 md:px-6">
        
        {/* Modern Header */}
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate(-1)}
                className="w-11 h-11 bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all shrink-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Akun Saya</h1>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Jejak kebaikan & profil donatur</p>
              </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-10">
          {/* Card Profil Member */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-[#1799dc] to-[#2db2f5] p-1 rounded-3xl shadow-xl shadow-[#1799dc]/20">
              <div className="bg-white dark:bg-slate-900 rounded-[22px] p-6 h-full relative overflow-hidden">
                {/* Decorative background circle */}
                <div className="absolute -right-8 -top-8 w-24 h-24 bg-[#1799dc]/10 dark:bg-[#1799dc]/5 rounded-full blur-xl pointer-events-none"></div>
                
                <div className="flex justify-between items-start mb-6">
                  <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-200 dark:border-slate-700">
                    <UserCircle className="w-10 h-10" />
                  </div>
                  {!isEditingProfile && (
                     <button 
                        onClick={() => setIsEditingProfile(true)}
                        className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors"
                     >
                       <Edit2 className="w-3.5 h-3.5" />
                     </button>
                  )}
                </div>

                {!isEditingProfile ? (
                  <div className="mb-4 relative z-10">
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1 truncate">
                          {profileName || 'Hamba Allah'}
                      </h2>
                      <p className="text-sm font-mono text-slate-500 dark:text-slate-400">
                          {profilePhone || 'Belum ada no. telp'}
                      </p>
                  </div>
                ) : (
                  <div className="space-y-3 mb-6 relative z-10">
                      <input
                          type="text"
                          value={inputName}
                          onChange={(e) => setInputName(e.target.value)}
                          placeholder="Nama Lengkap"
                          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:outline-none focus:border-[#1799dc] transition-colors dark:text-white"
                      />
                      <input
                          type="tel"
                          value={inputPhone}
                          onChange={(e) => setInputPhone(e.target.value)}
                          placeholder="Nomor Telepon"
                          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono focus:outline-none focus:border-[#1799dc] transition-colors dark:text-white"
                      />
                      <div className="flex items-center gap-2 pt-2">
                        <button 
                            onClick={cancelEdit}
                            className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-semibold text-sm transition-colors"
                        >
                            Batal
                        </button>
                        <button 
                            onClick={saveProfile}
                            className="flex-1 py-2.5 bg-[#1799dc] hover:bg-[#1588c4] text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-1.5"
                        >
                            <Save className="w-4 h-4" /> Simpan
                        </button>
                      </div>
                  </div>
                )}

                <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-auto">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Level Keanggotaan</p>
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 ${level.bg} dark:bg-slate-800 rounded-lg text-xs font-bold border border-white/50 dark:border-slate-700 shadow-sm`}>
                        {level.icon} <span className={`${level.text} dark:text-white`}>{level.name} Donatur</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats & Chart */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                       <TrendingUp className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400">Total Kebaikan</h3>
                  </div>
                  <button className="text-[11px] font-bold text-[#1799dc] bg-[#1799dc]/10 px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-[#1799dc]/20 transition-colors">
                    <FileText className="w-3.5 h-3.5" /> Bukti Potong Pajak
                  </button>
                </div>
                <p className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                  Rp {totalDonation.toLocaleString('id-ID')}
                </p>
              </div>
              <div className="h-24 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Tooltip 
                      formatter={(value: number) => [`Rp ${value.toLocaleString('id-ID')}`, 'Donasi']}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={5} />
                    <Area type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-500 flex items-center justify-center">
                     <History className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400">Transaksi Berhasil</h3>
                </div>
                <p className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                  {historyDataToUse.filter((h: any) => h.status === 'Berhasil').length} <span className="text-lg text-slate-400 font-medium">kali</span>
                </p>
              </div>
              
              <div className="mt-8 bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <Heart className="w-4 h-4 fill-current" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Donasi Rutin Aktif</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Sedekah Subuh Rp 10.000/hari</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dampak Keseluruhan & Pencapaian */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="md:col-span-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl p-6 sm:p-8 relative overflow-hidden text-white shadow-lg shadow-emerald-500/20">
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
             <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none"></div>
             
             <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                   <div className="flex items-center gap-2">
                     <Target className="w-5 h-5 text-emerald-200" />
                     <h2 className="text-lg font-bold">Dampak Kebaikan Anda</h2>
                   </div>
                </div>
                
                <div className="grid grid-cols-2 gap-8 mb-8">
                   <div>
                     <p className="text-emerald-100/80 text-[11px] uppercase font-bold tracking-wider mb-1.5">Penerima Manfaat</p>
                     <p className="text-4xl font-black">125 <span className="text-lg font-bold text-emerald-200">Jiwa</span></p>
                   </div>
                   <div>
                     <p className="text-emerald-100/80 text-[11px] uppercase font-bold tracking-wider mb-1.5">Program Terbantu</p>
                     <p className="text-4xl font-black">5 <span className="text-lg font-bold text-emerald-200">Wilayah</span></p>
                   </div>
                </div>
                
                <div className="pt-6 border-t border-emerald-400/30 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 backdrop-blur-sm border border-white/20">
                    <Quote className="w-4 h-4 text-emerald-100 fill-current" />
                  </div>
                  <p className="text-sm italic text-emerald-50 leading-relaxed pt-1">
                    "Terima kasih atas bantuan air bersihnya, kini warga desa kami tidak perlu berjalan jauh 5km setiap hari. Semoga Allah membalas kebaikan Anda."
                    <span className="text-[10px] font-bold text-emerald-200 uppercase mt-2 block tracking-wider">— Warga Desa Suka Maju</span>
                  </p>
                </div>
             </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
             <div className="flex items-center justify-between mb-6">
                 <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                   <Award className="w-5 h-5 text-amber-500" />
                   Pencapaian
                 </h2>
             </div>
             <div className="space-y-5">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center relative border border-amber-100 dark:border-amber-900/30 shrink-0">
                       <Star className="w-6 h-6 text-amber-500 fill-current" />
                       <div className="absolute -bottom-1.5 -right-1.5 bg-white dark:bg-slate-900 rounded-full p-0.5">
                          <div className="bg-emerald-500 rounded-full w-4 h-4 flex items-center justify-center">
                             <CheckCircle2 className="w-3 h-3 text-white" />
                          </div>
                       </div>
                    </div>
                    <div>
                       <h4 className="font-bold text-sm text-slate-900 dark:text-white">Dermawan Rutin</h4>
                       <p className="text-xs text-slate-500 mt-0.5">Berdonasi 3 bln berturut</p>
                    </div>
                 </div>
                 
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center relative border border-blue-100 dark:border-blue-900/30 shrink-0">
                       <Flame className="w-6 h-6 text-blue-500 fill-current" />
                    </div>
                    <div>
                       <h4 className="font-bold text-sm text-slate-900 dark:text-white">Pahlawan Subuh</h4>
                       <p className="text-xs text-slate-500 mt-0.5">5x Sedekah sblm jam 6 pagi</p>
                    </div>
                 </div>
                 
                 <div className="flex items-center gap-4 opacity-40 grayscale group hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer">
                    <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center border border-rose-100 dark:border-rose-900/30 shrink-0">
                       <Heart className="w-6 h-6 text-rose-500 fill-current" />
                    </div>
                    <div>
                       <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-rose-500 transition-colors">Misi Kemanusiaan</h4>
                       <p className="text-xs text-slate-500 mt-0.5">Bantu korban bencana (0/1)</p>
                    </div>
                 </div>
             </div>
          </div>
        </div>

        {/* Alur Distribusi Global */}
        <div className="mb-12 mt-10">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#1799dc]/5 to-transparent rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center mb-8 relative z-10">
              <div>
                <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  Alur Penyaluran Kebaikan
                </h2>
                <p className="text-sm text-slate-500 mt-1">Transparansi langkah demi langkah donasi Anda sampai ke penerima manfaat.</p>
              </div>
            </div>

            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
               {[
                 { icon: <FileText className="w-5 h-5" />, title: "Donasi Diterima", desc: "Sistem mencatat transaksi secara otomatis dan real-time.", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10" },
                 { icon: <Clock className="w-5 h-5" />, title: "Verifikasi", desc: "Tim memastikan dana masuk sesuai peruntukan program.", color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10" },
                 { icon: <TrendingUp className="w-5 h-5" />, title: "Implementasi", desc: "Penyaluran dilakukan langsung ke titik sasaran di lapangan.", color: "text-[#1799dc]", bg: "bg-[#1799dc]/10 dark:bg-[#1799dc]/20" },
                 { icon: <CheckCircle2 className="w-5 h-5" />, title: "Pelaporan", desc: "Donatur menerima laporan dampak dan dokumentasi.", color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10" }
               ].map((step, idx) => (
                 <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    key={idx} 
                    className="relative flex flex-col md:items-center md:text-center"
                 >
                    {/* Connector line for desktop */}
                    {idx < 3 && (
                      <div className="hidden md:block absolute top-[24px] left-[60%] w-[80%] h-[2px] bg-slate-100 dark:bg-slate-800 overflow-hidden rounded-full">
                        <motion.div
                          initial={{ x: '-100%' }}
                          animate={{ x: '300%' }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'linear', delay: idx * 0.2 }}
                          className="absolute h-full w-[30%] bg-gradient-to-r from-transparent via-[#1799dc] to-transparent"
                        />
                      </div>
                    )}
                    {/* Connector line for mobile */}
                    {idx < 3 && (
                      <div className="block md:hidden absolute top-[48px] left-[23px] w-[2px] h-[calc(100%+24px)] bg-slate-100 dark:bg-slate-800 overflow-hidden rounded-full">
                        <motion.div
                          initial={{ y: '-100%' }}
                          animate={{ y: '300%' }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'linear', delay: idx * 0.2 }}
                          className="absolute w-full h-[30%] bg-gradient-to-b from-transparent via-[#1799dc] to-transparent"
                        />
                      </div>
                    )}
                    <div className="flex md:flex-col items-start md:items-center gap-4 md:gap-0">
                       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 md:mb-4 relative z-10 ${step.bg} ${step.color} ${idx < 3 ? 'mb-8 md:mb-4' : ''}`}>
                          {step.icon}
                       </div>
                       <div>
                         <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5 md:mb-1">{step.title}</h3>
                         <p className="text-xs text-slate-500 leading-relaxed max-w-[200px] mx-auto">{step.desc}</p>
                       </div>
                    </div>
                 </motion.div>
               ))}
            </div>
          </div>
        </div>

        {/* Riwayat Transaksi - Clean UI */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Riwayat Transaksi</h2>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-white dark:bg-slate-900 p-1 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                {['Semua', 'Berhasil', 'Pending'].map((tab) => (
                  <button 
                    key={tab} 
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activeTab === tab 
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' 
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <AnimatePresence>
            {filteredHistory.map((item: any, i: number) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="group bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col gap-4 sm:gap-6 hover:shadow-md transition-all sm:hover:-translate-y-0.5"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                      item.status === 'Berhasil' 
                        ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500' 
                        : 'bg-orange-50 dark:bg-orange-500/10 text-orange-500'
                    }`}>
                      {item.status === 'Berhasil' ? <CheckCircle2 className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-slate-900 dark:text-white text-[15px] truncate mb-0.5 group-hover:text-[#1799dc] transition-colors">{item.program}</h3>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                        <span className="font-mono">{item.id}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                        <span>{item.date.split(' / ')[1] || item.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:items-end justify-end pl-16 md:pl-0">
                    <p className="font-black text-slate-900 dark:text-white text-lg">Rp {item.amount.toLocaleString('id-ID')}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] uppercase font-bold tracking-wider ${
                        item.status === 'Berhasil' ? 'text-emerald-500' : 'text-orange-500'
                      }`}>
                        {item.status}
                      </span>
                      {item.status === 'Berhasil' && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                          <button className="text-[10px] flex items-center gap-1 font-bold text-[#1799dc] hover:text-[#127fb8]">
                            <Download className="w-3 h-3" /> Bukti
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Expandable Section */}
                {item.status === 'Berhasil' && (
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-2">
                    <button 
                      onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                      className="w-full flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-[#1799dc] transition-colors"
                    >
                      <span>Detail & Laporan Penyaluran</span>
                      {expandedId === item.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    
                    <AnimatePresence>
                      {expandedId === item.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0 }}
                              className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl h-max"
                            >
                              <p className="text-[10px] uppercase font-bold tracking-wide text-slate-400 mb-2">Informasi Transaksi</p>
                              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                                <div className="flex justify-between">
                                  <span className="font-medium text-slate-500">Metode</span>
                                  <span className="font-bold">{item.method || 'Transfer Bank'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="font-medium text-slate-500">Waktu</span>
                                  <span className="font-bold">{item.date.split(' / ')[0]}</span>
                                </div>
                              </div>
                            </motion.div>

                            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                              <p className="text-[10px] uppercase font-bold tracking-wide text-slate-400 mb-4">Timeline Penyaluran</p>
                              <div className="relative pl-10 space-y-8">
                                {/* The Vertical Line */}
                                <div className="absolute left-[15px] top-4 bottom-6 w-[2px] bg-slate-200 dark:bg-slate-700 overflow-hidden rounded-full">
                                  {/* Flowing animated dash */}
                                  <motion.div
                                    initial={{ y: '-100%' }}
                                    animate={{ y: '300%' }}
                                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                    className="absolute w-full h-[50%] bg-gradient-to-b from-transparent via-[#1799dc] to-transparent"
                                  />
                                </div>
                                <motion.div 
                                  variants={{
                                    hidden: { opacity: 0 },
                                    show: { opacity: 1, transition: { staggerChildren: 0.2 } }
                                  }}
                                  initial="hidden"
                                  animate="show"
                                  className="relative z-10 space-y-8"
                                >
                                  {/* Step 1: Donasi Diterima */}
                                  <motion.div variants={{ hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0 } }} className="relative">
                                    <div className="absolute -left-[40px] top-0 w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 ring-4 ring-slate-50 dark:ring-slate-800 flex items-center justify-center z-10 shadow-sm">
                                      <CheckCircle2 className="w-4 h-4" />
                                    </div>
                                    <div className="pt-1.5">
                                      <h4 className="text-[13px] font-bold text-slate-900 dark:text-white">Donasi Diterima</h4>
                                      <p className="text-[11px] text-slate-500 mt-1">{item.date.split(' / ')[0]} <span className="mx-1">•</span> <span className="font-medium text-emerald-600 dark:text-emerald-400">Terkonfirmasi</span></p>
                                    </div>
                                  </motion.div>
                                  
                                  {/* Step 2: Proses Penyaluran */}
                                  <motion.div variants={{ hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0 } }} className="relative">
                                    <div className={`absolute -left-[40px] top-0 w-8 h-8 rounded-full ring-4 ring-slate-50 dark:ring-slate-800 flex items-center justify-center z-10 shadow-sm ${item.impact ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-blue-100 dark:bg-blue-900/30 text-[#1799dc] dark:text-[#1799dc]'}`}>
                                      {item.impact ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                                      {!item.impact && (
                                        <div className="absolute inset-0 rounded-full ring-2 ring-[#1799dc]/30 animate-ping"></div>
                                      )}
                                    </div>
                                    <div className="pt-1.5">
                                      <h4 className={`text-[13px] font-bold ${item.impact ? 'text-slate-900 dark:text-white' : 'text-[#1799dc]'}`}>Proses Penyaluran</h4>
                                      <p className="text-[11px] text-slate-500 mt-1">{item.impact ? 'Selesai didistribusikan' : 'Sedang diproses oleh tim di lapangan'}</p>
                                    </div>
                                  </motion.div>

                                  {/* Step 3: Laporan Tiba */}
                                  <motion.div variants={{ hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0 } }} className="relative">
                                    <div className={`absolute -left-[40px] top-0 w-8 h-8 rounded-full ring-4 ring-slate-50 dark:ring-slate-800 flex items-center justify-center z-10 shadow-sm ${item.impact ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
                                      {item.impact ? <Heart className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                                    </div>
                                    <div className="pt-1.5">
                                      <h4 className={`text-[13px] font-bold ${item.impact ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>Donasi Tersalurkan</h4>
                                      <p className="text-[11px] text-slate-500 mt-1">{item.impact ? 'Laporan implementasi tersedia' : 'Menunggu update laporan'}</p>
                                      
                                      {item.impact && (
                                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} className="mt-3 bg-emerald-50/80 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30 p-4 rounded-xl transform origin-top-left transition-all">
                                          <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center shrink-0">
                                              <Heart className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                            </div>
                                            <div>
                                              <p className="text-[10px] uppercase font-bold tracking-wide text-emerald-600 dark:text-emerald-400 mb-1">Dampak Donasi Anda</p>
                                              <p className="text-xs text-emerald-800 dark:text-emerald-200 font-medium leading-relaxed">{item.impact}</p>
                                            </div>
                                          </div>
                                        </motion.div>
                                      )}
                                    </div>
                                  </motion.div>
                                </motion.div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            ))}
            </AnimatePresence>

            {filteredHistory.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Tidak ada transaksi ditemukan.</p>
              </div>
            )}
          </div>
        </div>

        {/* DKM Login Gateway */}
        <div className="mt-8 mb-12">
          <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-800/30 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
             <div className="flex items-center gap-4 relative z-10 w-full sm:w-auto">
                <div className="w-14 h-14 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm shrink-0 border border-emerald-100 dark:border-emerald-800/30">
                   <Building className="w-7 h-7" />
                </div>
                <div>
                   <h3 className="font-black text-lg text-slate-900 dark:text-white">Pengurus Masjid?</h3>
                   <p className="text-sm text-slate-600 dark:text-slate-400">Atur administrasi, keuangan & qurban.</p>
                </div>
             </div>
             <button 
               onClick={() => navigate('/dkm-login')}
               className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 relative z-10 shrink-0 whitespace-nowrap"
             >
               Login Portal DKM
               <ChevronRight className="w-4 h-4" />
             </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DonationHistory;
