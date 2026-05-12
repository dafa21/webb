import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HandCoins, ArrowRight, Wallet, Banknote, CreditCard, ChevronDown, Search } from 'lucide-react';
import { PAYMENT_METHODS } from '../App';

const formatCurrencyForm = (val: string) => {
  if (!val) return '';
  const numberString = val.replace(/\D/g, '');
  if (!numberString) return '';
  return new Intl.NumberFormat('id-ID').format(Number(numberString)).replace(/,/g, '.');
};

export const ZakatPage = () => {
  const [zakatType, setZakatType] = useState('penghasilan');
  const [zakatAmount, setZakatAmount] = useState('');
  
  // Payment State
  const [paymentMethod, setPaymentMethod] = useState('');
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [paymentSearchQuery, setPaymentSearchQuery] = useState('');

  const calculateTotal = () => {
    return parseInt(zakatAmount.replace(/\D/g, '')) || 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Terima kasih. Anda akan dialihkan ke halaman pembayaran.');
  };

  return (
    <div className="bg-[#eaf4fc] dark:bg-slate-900 min-h-[85vh] lg:min-h-screen pt-32 pb-24 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 md:px-6">
        
        <div className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">Tunaikan Zakat</h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            Bersihkan harta, sucikan jiwa dengan berzakat yang tepat sasaran & transparan bersama LAZNAS Dewan Dakwah.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Step 1 Content - Made more compact */}
              <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Jenis Zakat</label>
                        <select 
                          value={zakatType}
                          onChange={(e) => setZakatType(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-[#1799dc]/20 focus:border-[#1799dc] transition-all outline-none font-medium dark:text-slate-100"
                        >
                          <option value="penghasilan">Zakat Penghasilan (Profesi)</option>
                          <option value="maal">Zakat Maal (Harta Simpanan)</option>
                          <option value="fitrah">Zakat Fitrah</option>
                          <option value="perniagaan">Zakat Perniagaan</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Nominal Zakat</label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <span className="text-slate-400 group-focus-within:text-[#1799dc] font-bold transition-colors">Rp</span>
                          </div>
                          <input 
                            type="text" 
                            value={formatCurrencyForm(zakatAmount)}
                            onChange={(e) => setZakatAmount(e.target.value)}
                            placeholder="0"
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-[#1799dc]/20 focus:border-[#1799dc] transition-all outline-none font-bold text-lg dark:text-slate-100"
                          />
                        </div>
                      </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 flex gap-4">
                    <InfoIcon className="w-6 h-6 text-blue-500 shrink-0" />
                    <div>
                      <h4 className="font-bold text-blue-900 dark:text-blue-300 text-sm mb-1">Butuh bantuan perhitungan?</h4>
                      <p className="text-blue-700/80 dark:text-blue-400/80 text-xs leading-relaxed">Gunakan fitur Kalkulator Zakat kami yang tersedia di bagian menu untuk menghitung secara detail kewajiban zakat Anda sebelum mengisi nominal di atas.</p>
                    </div>
                  </div>
              </div>

              <hr className="border-slate-100 dark:border-slate-700" />

              {/* Step 2 Content - Identitas */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2 p-1">
                  <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-[#1799dc] flex items-center justify-center text-[10px] font-black">1</div>
                  <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Identitas Muzaki</h3>
                </div>
                
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Nama Lengkap</label>
                    <input required type="text" value={donorName} onChange={e => setDonorName(e.target.value)} placeholder="Nama Anda" className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 outline-none text-sm font-black shadow-sm focus:border-blue-400 dark:text-white" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">WhatsApp/Kontak</label>
                    <input required type="tel" value={donorPhone} onChange={e => setDonorPhone(e.target.value)} placeholder="08xxxx" className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 outline-none text-sm font-bold shadow-sm focus:border-blue-400 dark:text-white" />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Email <span className="text-slate-400 font-normal">(Opsional)</span></label>
                    <input type="email" value={donorEmail} onChange={e => setDonorEmail(e.target.value)} placeholder="email@anda.com" className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 outline-none text-sm font-bold shadow-sm focus:border-blue-400 dark:text-white" />
                  </div>
                </div>
              </div>

              {/* Phase 2: Payment Prominent */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-[#1799dc] flex items-center justify-center text-[10px] font-black">2</div>
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Metode Pembayaran</h3>
                  </div>
                  <div className="relative max-w-[140px] sm:max-w-[200px]">
                    <Search className="absolute left-2.5 top-2 w-3 h-3 text-slate-400" />
                    <input type="text" placeholder="Cari bank..." value={paymentSearchQuery} onChange={e => setPaymentSearchQuery(e.target.value)} className="w-full pl-7 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full text-[10px] font-bold outline-none focus:border-blue-400 transition-all shadow-sm dark:text-white" />
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

              <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-between px-2">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 text-blue-500 flex items-center justify-center shadow-lg border border-slate-100 dark:border-slate-700 hidden sm:flex">
                        <Wallet className="w-6 h-6" />
                      </div>
                      <div className="text-left">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Total Zakat</p>
                        <p className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white leading-none">Rp {formatCurrencyForm(calculateTotal().toString())}</p>
                      </div>
                    </div>
                    
                    <button 
                      type="submit"
                      disabled={!paymentMethod || calculateTotal() === 0 || !donorName || !donorPhone}
                      className="w-full sm:w-auto px-8 py-4 bg-[#1799dc] hover:bg-[#1588c4] active:scale-[0.98] disabled:opacity-40 transition-all text-white rounded-2xl font-black text-base flex flex-col items-center justify-center shadow-xl shadow-blue-500/20 group"
                    >
                      <span className="flex items-center gap-2">Tunaikan Sekarang <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></span>
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

// Internal icon for help
const InfoIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M12 16v-4"></path>
    <path d="M12 8h.01"></path>
  </svg>
);
