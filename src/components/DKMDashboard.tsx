import React, { useState } from 'react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, LogOut, LayoutDashboard, Wallet, Users, Beef, FileText, 
  TrendingUp, Activity, Plus, FileBarChart, CheckCircle2, ChevronRight, Settings, Building, X
} from 'lucide-react';

export const DKMDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { tab } = useParams<{ tab: string }>();
  
  if (!localStorage.getItem('dkm_logged_in')) {
    return <Navigate to="/dkm-login" replace />;
  }

  const activeTab = tab ? tab.charAt(0).toUpperCase() + tab.slice(1) : 'Overview';

  // Modal States
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isQurbanModalOpen, setIsQurbanModalOpen] = useState(false);
  const [isJamaahModalOpen, setIsJamaahModalOpen] = useState(false);

  // Data States
  const [transactions, setTransactions] = useState([
    { date: "21 Mei 2026", desc: "Infaq Celengan Jumat", cat: "Pemasukan", in: "4.500.000", out: "-" },
    { date: "20 Mei 2026", desc: "Bayar Listrik PLN", cat: "Operasional", in: "-", out: "1.250.000" },
    { date: "15 Mei 2026", desc: "Honor Penceramah", cat: "Operasional", in: "-", out: "500.000" },
    { date: "14 Mei 2026", desc: "Donasi Renovasi Atap", cat: "Pembangunan", in: "15.000.000", out: "-" },
  ]);

  const [qurbans, setQurbans] = useState([
    { id: "QRB-26-001", name: "Bpk. Ahmad Suhendar", type: "Sapi (Patungan 1/7)", status: "Lunas" },
    { id: "QRB-26-002", name: "Ibu Siti Aminah", type: "Kambing", status: "Cicil" },
    { id: "QRB-26-003", name: "Hamba Allah", type: "Sapi (Utuh)", status: "Lunas" },
  ]);

  const [jamaahs, setJamaahs] = useState([
    { name: "Ahmad Suhendar", status: "Donatur Rutin", loc: "Perum As-Salam Blok A", last: "Hari ini" },
    { name: "Siti Aminah", status: "Pequrban", loc: "Komplek Citra Asri", last: "2 hari lalu" },
    { name: "Budi Santoso", status: "Jamaah Umum", loc: "Jl. Merpati Raya", last: "1 minggu lalu" },
  ]);

  const handleLogout = () => {
    localStorage.removeItem('dkm_logged_in');
    navigate('/dkm-login');
  };

  const handleAddTx = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const desc = formData.get('desc') as string;
    const type = formData.get('type') as string;
    const amount = formData.get('amount') as string;
    const formattedAmount = Number(amount).toLocaleString('id-ID');
    
    setTransactions([{
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      desc,
      cat: type === 'in' ? 'Pemasukan' : 'Pengeluaran',
      in: type === 'in' ? formattedAmount : '-',
      out: type === 'out' ? formattedAmount : '-'
    }, ...transactions]);
    setIsTxModalOpen(false);
  };

  const handleAddQurban = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const type = formData.get('type') as string;
    
    setQurbans([{
      id: `QRB-26-${String(qurbans.length + 1).padStart(3, '0')}`,
      name,
      type,
      status: "Lunas"
    }, ...qurbans]);
    setIsQurbanModalOpen(false);
  };

  const handleAddJamaah = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const loc = formData.get('loc') as string;
    const status = formData.get('status') as string;
    
    setJamaahs([{
      name,
      loc,
      status,
      last: "Baru saja"
    }, ...jamaahs]);
    setIsJamaahModalOpen(false);
  };

  const menuItems = [
    { id: 'Overview', icon: <LayoutDashboard className="w-5 h-5 md:w-4 md:h-4" />, label: 'Ringkasan', color: 'bg-emerald-500', shadow: 'shadow-emerald-500/30' },
    { id: 'Keuangan', icon: <Wallet className="w-5 h-5 md:w-4 md:h-4" />, label: 'Keuangan', color: 'bg-blue-500', shadow: 'shadow-blue-500/30' },
    { id: 'Qurban', icon: <Beef className="w-5 h-5 md:w-4 md:h-4" />, label: 'Qurban', color: 'bg-orange-500', shadow: 'shadow-orange-500/30' },
    { id: 'Jamaah', icon: <Users className="w-5 h-5 md:w-4 md:h-4" />, label: 'Jamaah', color: 'bg-purple-500', shadow: 'shadow-purple-500/30' },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#0f172a] font-sans text-slate-900 dark:text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar untuk Desktop / Topbar untuk Mobile */}
      <div className="w-full md:w-72 bg-white dark:bg-slate-900 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 flex flex-col h-auto md:h-screen sticky top-0 z-20 shadow-sm">
        <div className="p-6 md:p-8 flex items-center justify-between md:block border-b md:border-b-0 border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shrink-0">
               <Building className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-lg md:text-xl">DKM Admin</h2>
              <p className="text-xs text-slate-500 font-medium">Masjid As-Salam</p>
            </div>
          </div>
          <button onClick={() => navigate('/')} className="md:hidden p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
             <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Menu Navigasi - Mobile Grid / Desktop List */}
        <div className="p-4 md:p-6 flex-1 grid grid-cols-4 md:flex md:flex-col gap-2 md:gap-2 overflow-y-auto hide-scrollbar">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => navigate(`/dkm-dashboard/${item.id.toLowerCase()}`)}
              className={`group flex flex-col md:flex-row items-center gap-1.5 md:gap-3 md:px-4 md:py-3 md:rounded-xl transition-all ${
                activeTab === item.id 
                  ? 'md:bg-emerald-50 md:dark:bg-emerald-500/10' 
                  : 'md:hover:bg-slate-50 md:dark:hover:bg-slate-800'
              }`}
            >
              <div className={`w-12 h-12 md:w-8 md:h-8 rounded-2xl md:rounded-lg flex items-center justify-center text-white shadow-lg md:shadow-none transition-all ${activeTab === item.id ? 'scale-110 md:scale-100 ring-4 ring-slate-100 dark:ring-slate-800 md:ring-0' : 'opacity-90 md:opacity-100 group-hover:scale-105 md:group-hover:scale-100'} ${item.color} ${item.shadow}`}>
                {item.icon}
              </div>
              <span className={`text-[10px] md:text-sm font-bold text-center md:text-left ${
                activeTab === item.id 
                  ? 'text-slate-900 dark:text-white md:text-emerald-600 md:dark:text-emerald-400' 
                  : 'text-slate-500 md:text-slate-600 md:dark:text-slate-400'
              }`}>
                {item.label}
              </span>
            </button>
          ))}
        </div>

        <div className="p-4 md:p-6 border-t border-slate-100 dark:border-slate-800 hidden md:block">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-left text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all font-bold"
          >
            <LogOut className="w-5 h-5" />
            Keluar
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto pb-24 md:pb-8">
        {/* Header Desktop (hidden on mobile) */}
        <div className="hidden md:flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Dashboard {activeTab}</h1>
            <p className="text-slate-500">Kelola dan pantau aktivitas masjid Anda</p>
          </div>
          <div className="flex items-center gap-3">
             <button className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
               <Settings className="w-5 h-5" />
             </button>
             <button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm">
               <Plus className="w-4 h-4" /> Laporan Baru
             </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-4 md:mt-0">
          {activeTab === 'Overview' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { title: "Saldo Kas", value: "Rp 15.2M", desc: "+2.4% bln ini", icon: <Wallet className="text-blue-500" /> },
                  { title: "Pendaftar Qurban", value: "45", desc: "15 Sapi, 30 Kambing", icon: <Beef className="text-orange-500" /> },
                  { title: "Total Jamaah", value: "1,240", desc: "Terdaftar di sistem", icon: <Users className="text-emerald-500" /> },
                  { title: "Donasi Sedekah", value: "8.5jt", desc: "Minggu ini", icon: <TrendingUp className="text-purple-500" /> },
                ].map((stat, i) => (
                  <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-4 md:p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-2">
                       <span className="text-xs md:text-sm text-slate-500 font-bold uppercase tracking-wider">{stat.title}</span>
                       <div className="p-1.5 md:p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                          {React.cloneElement(stat.icon, { className: 'w-4 h-4 md:w-5 md:h-5' })}
                       </div>
                    </div>
                    <div>
                      <p className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">{stat.value}</p>
                      <p className="text-[10px] md:text-xs text-slate-400 font-medium mt-1">{stat.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent Activity & Charts Placeholder */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="md:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-lg">Aktivitas Terakhir</h3>
                      <button className="text-sm font-bold text-emerald-500 hover:text-emerald-600">Lihat Semua</button>
                    </div>
                    <div className="space-y-4">
                      {[
                        { title: "Pembelian Hewan Qurban (5 Sapi)", date: "Hari ini, 10:30", amount: "- Rp 125.000.000", type: "out" },
                        { title: "Infaq Jumat", date: "Kemarin, 13:45", amount: "+ Rp 8.450.000", type: "in" },
                        { title: "Donasi Program Renovasi", date: "21 Mei 2026", amount: "+ Rp 2.000.000", type: "in" },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors">
                           <div className="flex items-center gap-3">
                             <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.type === 'in' ? 'bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10' : 'bg-rose-50 text-rose-500 dark:bg-rose-500/10'}`}>
                                {item.type === 'in' ? <TrendingUp className="w-5 h-5" /> : <TrendingUp className="w-5 h-5 rotate-180" />}
                             </div>
                             <div>
                               <p className="font-bold text-sm text-slate-900 dark:text-white">{item.title}</p>
                               <p className="text-xs text-slate-500">{item.date}</p>
                             </div>
                           </div>
                           <p className={`font-bold text-sm ${item.type === 'in' ? 'text-emerald-500' : 'text-slate-900 dark:text-white'}`}>{item.amount}</p>
                        </div>
                      ))}
                    </div>
                 </div>

                 <div className="bg-gradient-to-br from-[#1799dc] to-[#1588c4] rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                    <h3 className="font-bold text-lg mb-2 relative z-10">Program Aktif</h3>
                    <p className="text-blue-100 text-sm mb-6 relative z-10">Renovasi Kubah Masjid</p>
                    
                    <div className="relative z-10 mt-auto">
                      <div className="flex justify-between text-sm font-bold mb-2">
                        <span>Terkumpul</span>
                        <span>65%</span>
                      </div>
                      <div className="w-full bg-black/20 rounded-full h-2 mb-2">
                         <div className="bg-white h-2 rounded-full" style={{ width: '65%' }}></div>
                      </div>
                      <p className="text-xs font-medium text-blue-100">Target: Rp 200.000.000</p>
                    </div>
                    
                    <button className="w-full mt-6 py-2.5 bg-white text-[#1799dc] rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors relative z-10">
                      Kelola Program
                    </button>
                 </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'Qurban' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex justify-between items-center">
                 <h2 className="text-xl font-bold">Manajemen Qurban 1447 H</h2>
                 <button onClick={() => setIsQurbanModalOpen(true)} className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Pendaftar Baru
                 </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="bg-amber-50 dark:bg-amber-500/10 rounded-2xl p-5 border border-amber-100 dark:border-amber-900/30">
                    <h3 className="text-amber-800 dark:text-amber-300 font-bold mb-1">Target Sapi</h3>
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-black text-amber-600">20</span>
                      <span className="text-sm font-bold text-amber-500 mb-1">Ekor</span>
                    </div>
                    <p className="text-xs text-amber-700/70 mt-2">15 Terdaftar (5 Sisa)</p>
                 </div>
                 <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
                    <h3 className="text-slate-700 dark:text-slate-300 font-bold mb-1">Target Kambing</h3>
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-black text-slate-900 dark:text-white">50</span>
                      <span className="text-sm font-bold text-slate-500 mb-1">Ekor</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">30 Terdaftar (20 Sisa)</p>
                 </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase text-slate-500 font-bold">
                      <tr>
                        <th className="px-6 py-4">No. Registrasi</th>
                        <th className="px-6 py-4">Nama Pequrban (Shohibul Qurban)</th>
                        <th className="px-6 py-4">Jenis Hewan</th>
                        <th className="px-6 py-4">Status Pembayaran</th>
                        <th className="px-6 py-4 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {qurbans.map((item, i) => (
                        <tr key={i} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/20">
                          <td className="px-6 py-4 font-mono text-slate-500">{item.id}</td>
                          <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{item.name}</td>
                          <td className="px-6 py-4">{item.type}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide ${item.status === 'Lunas' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'}`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                             <button className="text-[#1799dc] font-bold text-xs hover:underline">Edit</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'Keuangan' && (
             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="flex justify-between items-center">
                   <h2 className="text-xl font-bold">Laporan Keuangan Masjid</h2>
                   <div className="flex gap-2">
                     <button className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2">
                        <FileBarChart className="w-4 h-4" /> Export CSV
                     </button>
                     <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Catat Transaksi
                     </button>
                   </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
                     <h3 className="font-bold text-slate-700 dark:text-slate-300">Riwayat Mutasi</h3>
                     <span className="text-xs px-3 py-1 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 font-medium">Bulan Ini (Mei 26)</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-white dark:bg-slate-900 text-xs uppercase text-slate-500 font-bold border-b border-slate-100 dark:border-slate-800">
                        <tr>
                          <th className="px-6 py-4">Tanggal</th>
                          <th className="px-6 py-4">Keterangan</th>
                          <th className="px-6 py-4">Kategori</th>
                          <th className="px-6 py-4 text-right">Debit (Masuk)</th>
                          <th className="px-6 py-4 text-right">Kredit (Keluar)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { date: "21 Mei 2026", desc: "Infaq Celengan Jumat", cat: "Pemasukan", in: "4.500.000", out: "-" },
                          { date: "20 Mei 2026", desc: "Bayar Listrik PLN", cat: "Operasional", in: "-", out: "1.250.000" },
                          { date: "15 Mei 2026", desc: "Honor Penceramah", cat: "Operasional", in: "-", out: "500.000" },
                          { date: "14 Mei 2026", desc: "Donasi Renovasi Atap", cat: "Pembangunan", in: "15.000.000", out: "-" },
                        ].map((item, i) => (
                          <tr key={i} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/20">
                            <td className="px-6 py-4 text-slate-500 font-medium">{item.date}</td>
                            <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{item.desc}</td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400">{item.cat}</span>
                            </td>
                            <td className="px-6 py-4 text-right font-mono font-bold text-emerald-500">{item.in !== "-" ? `Rp ${item.in}` : "-"}</td>
                            <td className="px-6 py-4 text-right font-mono font-bold text-rose-500">{item.out !== "-" ? `Rp ${item.out}` : "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
             </motion.div>
          )}

          {activeTab === 'Jamaah' && (
             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="flex justify-between items-center">
                   <h2 className="text-xl font-bold">Data Jamaah Terdaftar</h2>
                   <button onClick={() => setIsJamaahModalOpen(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2">
                      <Plus className="w-4 h-4" /> Tambah Jamaah
                   </button>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase text-slate-500 font-bold border-b border-slate-100 dark:border-slate-800">
                        <tr>
                          <th className="px-6 py-4">Nama Lengkap</th>
                          <th className="px-6 py-4">Status Donatur</th>
                          <th className="px-6 py-4">Domisili</th>
                          <th className="px-6 py-4 text-right">Terakhir Aktif</th>
                        </tr>
                      </thead>
                      <tbody>
                        {jamaahs.map((item, i) => (
                          <tr key={i} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/20">
                            <td className="px-6 py-4 font-bold text-slate-900 dark:text-white flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 font-bold text-xs">{item.name.charAt(0)}</div>
                              {item.name}
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                                {item.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-slate-500">{item.loc}</td>
                            <td className="px-6 py-4 text-right text-slate-500">{item.last}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
             </motion.div>
          )}

        </div>
      </div>
      
      {/* Logout button for mobile (bottom) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-30">
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center gap-3 px-4 py-3 w-full text-white bg-rose-500 hover:bg-rose-600 rounded-xl transition-all font-bold"
          >
            <LogOut className="w-5 h-5" />
            Keluar dari Dashboard
          </button>
      </div>

      {/* Modals */}
      <AnimatePresence>
         {isTxModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
               <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-md shadow-xl border border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between items-center mb-6">
                     <h3 className="text-xl font-bold">Catat Transaksi</h3>
                     <button onClick={() => setIsTxModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                  </div>
                  <form onSubmit={handleAddTx} className="space-y-4">
                     <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Keterangan</label>
                        <input name="desc" type="text" required placeholder="Contoh: Bayar Listrik" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                     </div>
                     <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Jenis Transaksi</label>
                        <select name="type" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none">
                           <option value="in">Pemasukan (Debit)</option>
                           <option value="out">Pengeluaran (Kredit)</option>
                        </select>
                     </div>
                     <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Jumlah (Rp)</label>
                        <input name="amount" type="number" required placeholder="500000" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                     </div>
                     <button type="submit" className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-all mt-4">Simpan Transaksi</button>
                  </form>
               </motion.div>
            </div>
         )}

         {isQurbanModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
               <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-md shadow-xl border border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between items-center mb-6">
                     <h3 className="text-xl font-bold">Pendaftar Qurban Baru</h3>
                     <button onClick={() => setIsQurbanModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                  </div>
                  <form onSubmit={handleAddQurban} className="space-y-4">
                     <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Nama Shohibul Qurban</label>
                        <input name="name" type="text" required placeholder="Nama Lengkap" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                     </div>
                     <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Jenis Hewan</label>
                        <select name="type" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none">
                           <option value="Kambing">Kambing / Domba</option>
                           <option value="Sapi (Patungan 1/7)">Sapi (Patungan 1/7)</option>
                           <option value="Sapi (Utuh)">Sapi (Utuh)</option>
                        </select>
                     </div>
                     <button type="submit" className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold transition-all mt-4">Daftarkan Pequrban</button>
                  </form>
               </motion.div>
            </div>
         )}

         {isJamaahModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
               <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-md shadow-xl border border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between items-center mb-6">
                     <h3 className="text-xl font-bold">Tambah Data Jamaah</h3>
                     <button onClick={() => setIsJamaahModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                  </div>
                  <form onSubmit={handleAddJamaah} className="space-y-4">
                     <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Nama Lengkap</label>
                        <input name="name" type="text" required placeholder="Nama Lengkap Jamaah" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                     </div>
                     <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Asal / Domisili</label>
                        <input name="loc" type="text" required placeholder="Contoh: Perum As-Salam" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                     </div>
                     <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Status Donatur</label>
                        <select name="status" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none">
                           <option value="Jamaah Umum">Jamaah Umum</option>
                           <option value="Donatur Rutin">Donatur Rutin</option>
                           <option value="Muzaki">Muzaki</option>
                           <option value="Pequrban">Pequrban</option>
                        </select>
                     </div>
                     <button type="submit" className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold transition-all mt-4">Simpan Data Jamaah</button>
                  </form>
               </motion.div>
            </div>
         )}
      </AnimatePresence>
    </div>
  );
};

export default DKMDashboard;
