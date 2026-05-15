import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Clock, Search, HistoryIcon, CheckCircle2, ChevronRight, Download, UserCircle, Edit2, Save, X } from 'lucide-react';

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
// ...
];

export const DonationHistory: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Semua');

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
    alert('Profil berhasil disimpan');
    window.location.reload();
  };

  const cancelEdit = () => {
    setInputName(profileName);
    setInputPhone(profilePhone);
    setIsEditingProfile(false);
  };

  const filteredHistory = mockDonationHistory.filter(item => {
    if (activeTab === 'Semua') return true;
    return item.status === activeTab;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-12 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
            <button 
              onClick={() => navigate(-1)}
              className="w-10 h-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">Akun & Riwayat</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Kelola profil dan jejak kebaikan Anda</p>
            </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 mb-8 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-[#1799dc]"></div>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0 border border-slate-200 dark:border-slate-700">
                        <UserCircle className="w-10 h-10" />
                    </div>
                    
                    {!isEditingProfile ? (
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                                {profileName || 'Hamba Allah'}
                            </h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                                {profilePhone || 'Belum ada nomor telepon'}
                            </p>
                        </div>
                    ) : (
                        <div className="flex-1 space-y-3 w-full max-w-sm">
                            <div>
                                <input
                                    type="text"
                                    value={inputName}
                                    onChange={(e) => setInputName(e.target.value)}
                                    placeholder="Nama Lengkap"
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1799dc]/50 transition-colors dark:text-white"
                                />
                            </div>
                            <div>
                                <input
                                    type="tel"
                                    value={inputPhone}
                                    onChange={(e) => setInputPhone(e.target.value)}
                                    placeholder="Nomor Telepon"
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1799dc]/50 transition-colors dark:text-white"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2 md:self-start">
                    {!isEditingProfile ? (
                        <button 
                            onClick={() => setIsEditingProfile(true)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold transition-colors"
                        >
                            <Edit2 className="w-4 h-4" /> Edit Profil
                        </button>
                    ) : (
                        <>
                            <button 
                                onClick={cancelEdit}
                                className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-xl transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={saveProfile}
                                className="flex items-center gap-1.5 px-4 py-2.5 bg-[#1799dc] hover:bg-[#1588c4] text-white rounded-xl text-sm font-bold transition-colors shadow-lg shadow-[#1799dc]/20"
                            >
                                <Save className="w-4 h-4" /> Simpan
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl w-max">
            {['Semua', 'Berhasil', 'Pending'].map((tab) => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  activeTab === tab 
                    ? 'bg-white dark:bg-slate-700 text-[#1799dc] dark:text-[#2db2f5] shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Cari transaksi..."
              className="w-full sm:w-64 pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1799dc]/50 transition-all text-slate-800 dark:text-slate-200"
            />
          </div>
        </div>

        {/* History List */}
        <div className="space-y-4">
          {filteredHistory.map((item, i) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 hover:shadow-md transition-shadow group"
            >
              {/* Icon Status */}
              <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 ${
                item.status === 'Berhasil' 
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500' 
                  : 'bg-orange-50 dark:bg-orange-500/10 text-orange-500'
              }`}>
                {item.status === 'Berhasil' ? <CheckCircle2 className="w-7 h-7" /> : <Clock className="w-7 h-7" />}
              </div>

              {/* Detail Transaksi */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    item.status === 'Berhasil' 
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' 
                      : 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400'
                  }`}>
                    {item.status}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">{item.id}</span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-[15px] mb-1 truncate">{item.program}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{item.date}</p>
                
                {item.impact && item.status === 'Berhasil' && (
                  <div className="mt-3 p-3 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl">
                    <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed font-medium">
                      <strong className="font-bold text-blue-800 dark:text-blue-200 mr-1">Dampak:</strong>
                      {item.impact}
                    </p>
                  </div>
                )}
              </div>

              {/* Nominal & Aksi */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center shrink-0 sm:w-32 border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-800 pt-3 sm:pt-0 sm:pl-6 mt-2 sm:mt-0">
                <div className="text-left sm:text-right mb-0 sm:mb-3">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-0.5">Nominal</p>
                  <p className="font-black text-slate-900 dark:text-white text-lg">Rp {item.amount.toLocaleString('id-ID')}</p>
                </div>
                {item.status === 'Berhasil' && (
                  <button className="flex items-center gap-1.5 text-xs font-bold text-[#1799dc] hover:text-[#127fb8] transition-colors bg-[#1799dc]/5 hover:bg-[#1799dc]/10 px-3 py-1.5 rounded-lg">
                    <Download className="w-3.5 h-3.5" /> Sertifikat
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DonationHistory;
