import React from 'react';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, Users, Map, Wallet } from 'lucide-react';
import { QurbanMap } from './QurbanMap';

const formatCurrencyForm = (val: string) => {
  if (!val) return '';
  const numberString = val.replace(/\D/g, '');
  if (!numberString) return '';
  return new Intl.NumberFormat('id-ID').format(Number(numberString)).replace(/,/g, '.');
};

const MONTHLY_DATA = [
  { name: 'Okt', value: 3500000000 },
  { name: 'Nov', value: 4200000000 },
  { name: 'Des', value: 5100000000 },
  { name: 'Jan', value: 3800000000 },
  { name: 'Feb', value: 4500000000 },
  { name: 'Mar', value: 5400000000 },
];

const PROGRAM_DATA = [
  { name: 'Pendidikan', value: 45 },
  { name: 'Kemanusiaan', value: 30 },
  { name: 'Kesehatan', value: 15 },
  { name: 'Ekonomi', value: 10 },
];
const COLORS = ['#10b981', '#1799dc', '#f29f05', '#8b5cf6'];

const DEMOGRAPHIC_DATA = [
  { region: 'Jawa & Bali', donors: 25000 },
  { region: 'Sumatera', donors: 12000 },
  { region: 'Kalimantan', donors: 6000 },
  { region: 'Sulawesi & IndTim', donors: 5000 },
];

export const AnalyticsDashboard = () => {
  return (
    <div className="bg-[#eaf4fc] dark:bg-slate-900 min-h-[85vh] lg:min-h-screen pt-32 pb-24 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="mb-12 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">Laporan Transparansi</h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl text-sm md:text-base leading-relaxed">Melihat dampak kebaikan yang Anda bagikan. Statistik penyaluran dan penerimaan donasi kami terkelola dengan amanah dan transparan.</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { title: 'Total Donasi Tersalurkan', value: 'Rp 26.5 Miliar', icon: <Wallet className="w-6 h-6 text-emerald-500" /> },
            { title: 'Rata-rata Donasi', value: 'Rp 250.000', icon: <TrendingUp className="w-6 h-6 text-[#1799dc]" /> },
            { title: 'Total Donatur', value: '48.000+', icon: <Users className="w-6 h-6 text-[#f29f05]" /> },
            { title: 'Daerah Jangkauan', value: '34 Provinsi', icon: <Map className="w-6 h-6 text-purple-500" /> },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center shrink-0">
                  {stat.icon}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.title}</p>
                  <h3 className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white mt-1">{stat.value}</h3>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart: Donation Trend */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-slate-800 rounded-3xl p-6 lg:p-8 shadow-sm border border-slate-100 dark:border-slate-700 lg:col-span-2"
          >
            <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Tren Donasi (6 Bulan Terakhir)</h4>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={MONTHLY_DATA} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <Line type="monotone" dataKey="value" stroke="#1799dc" strokeWidth={4} dot={{ r: 4, fill: '#1799dc', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="5 5" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis 
                    tickFormatter={(val) => `Rp ${val / 1000000000}M`} 
                    tick={{ fill: '#64748b', fontSize: 12 }} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <Tooltip 
                    formatter={(value: number) => [`Rp ${formatCurrencyForm(value.toString())}`, 'Donasi']}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Pie Chart: Popular Programs */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-slate-800 rounded-3xl p-6 lg:p-8 shadow-sm border border-slate-100 dark:border-slate-700"
          >
            <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Program Terpopuler</h4>
            <div className="h-[280px] w-full flex flex-col items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={PROGRAM_DATA}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {PROGRAM_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`${value}%`, 'Proporsi']}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 w-full">
                {PROGRAM_DATA.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                    <span className="text-xs text-slate-600 dark:text-slate-400 font-medium truncate">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Bar Chart: Demographics Map */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white dark:bg-slate-800 rounded-3xl p-6 lg:p-8 shadow-sm border border-slate-100 dark:border-slate-700 lg:col-span-3"
          >
            <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Demografi Asal Donatur (Regional)</h4>
            <div className="h-[320px] w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={DEMOGRAPHIC_DATA} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} barSize={40}>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="region" tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(23,153,220,0.05)' }}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                    formatter={(val: number) => [val, 'Donatur']}
                  />
                  <Bar dataKey="donors" fill="#f29f05" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Qurban Map Section */}
        <div className="mt-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col md:flex-row md:items-end justify-between mb-6"
          >
            <div>
              <h4 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white mb-2">Sebaran Qurban Nusantara</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">Peta interaktif persebaran hewan qurban dan penerima manfaat di seluruh Indonesia dan ranah global.</p>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <QurbanMap />
          </motion.div>
        </div>
      </div>
    </div>
  );
};
