import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HandCoins, ArrowRight, Wallet, Banknote, CreditCard, ChevronDown, Search, BookOpen, Heart, Info, DollarSign, Calculator, FileText, CheckCircle2, Share2, Download, Sparkles } from 'lucide-react';
import { PAYMENT_METHODS, PAYMENT_INSTRUCTIONS } from '../App';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, serverTimestamp, setDoc, doc } from 'firebase/firestore';

const formatCurrencyForm = (val: string) => {
  if (!val) return '';
  const numberString = val.replace(/\D/g, '');
  if (!numberString) return '';
  return new Intl.NumberFormat('id-ID').format(Number(numberString)).replace(/,/g, '.');
};

export const ZakatPage = () => {
  const [activeTab, setActiveTab] = useState<'bayar' | 'edukasi' | 'kalkulator'>('bayar');
  const [zakatType, setZakatType] = useState('penghasilan');
  const [zakatAmount, setZakatAmount] = useState('');
  
  // Payment State
  const [paymentMethod, setPaymentMethod] = useState('');
  const [donorName, setDonorName] = useState(localStorage.getItem('app_user_name') || '');
  const [donorEmail, setDonorEmail] = useState('');
  const [donorPhone, setDonorPhone] = useState(localStorage.getItem('app_user_phone') || '');
  const [paymentSearchQuery, setPaymentSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPaymentInstructions, setShowPaymentInstructions] = useState(false);
  const [isDonationSuccess, setIsDonationSuccess] = useState(false);

  // Calculator States
  const [calcTab, setCalcTab] = useState<'penghasilan' | 'maal' | 'perdagangan' | 'saham' | 'rikaz' | 'fidyah'>('penghasilan');
  const [calcGoldPrice, setCalcGoldPrice] = useState('1350000');
  
  // Penghasilan
  const [calcIncome, setCalcIncome] = useState('');
  const [calcBonus, setCalcBonus] = useState('');
  
  // Maal
  const [calcMaalTabungan, setCalcMaalTabungan] = useState('');
  const [calcMaalEmas, setCalcMaalEmas] = useState(''); 
  const [calcMaalProperti, setCalcMaalProperti] = useState(''); 
  const [calcMaalHutang, setCalcMaalHutang] = useState(''); 
  
  // Perdagangan
  const [calcDagangModal, setCalcDagangModal] = useState('');
  const [calcDagangUntung, setCalcDagangUntung] = useState('');
  const [calcDagangPiutang, setCalcDagangPiutang] = useState('');
  const [calcDagangHutang, setCalcDagangHutang] = useState('');
  
  // Saham
  const [calcSahamNilai, setCalcSahamNilai] = useState('');
  const [calcSahamDividen, setCalcSahamDividen] = useState('');
  
  // Rikaz
  const [calcRikazNilai, setCalcRikazNilai] = useState('');
  
  // Fidyah
  const [calcFidyahDays, setCalcFidyahDays] = useState('');
  const [calcFidyahRate, setCalcFidyahRate] = useState('60000');

  const getCalcDetails = () => {
    const price = parseInt(calcGoldPrice.replace(/\D/g, '')) || 1350000;
    const nisabTahun = price * 85; 
    const nisabBulan = nisabTahun / 12;

    let totalAsset = 0;
    let requiredNisab = nisabTahun;
    let zakatAmmount = 0;
    let isEligible = false;

    if (calcTab === 'penghasilan') {
        const income = parseInt(calcIncome.replace(/\D/g, '')) || 0;
        const bonus = parseInt(calcBonus.replace(/\D/g, '')) || 0;
        totalAsset = income + bonus;
        requiredNisab = nisabBulan;
        isEligible = totalAsset >= requiredNisab;
        if (isEligible) zakatAmmount = totalAsset * 0.025;
    } else if (calcTab === 'maal') {
        const t = parseInt(calcMaalTabungan.replace(/\D/g, '')) || 0;
        const e = parseInt(calcMaalEmas.replace(/\D/g, '')) || 0;
        const p = parseInt(calcMaalProperti.replace(/\D/g, '')) || 0;
        const h = parseInt(calcMaalHutang.replace(/\D/g, '')) || 0;
        totalAsset = t + e + p - h;
        requiredNisab = nisabTahun;
        isEligible = totalAsset >= requiredNisab;
        if (isEligible) zakatAmmount = totalAsset * 0.025;
    } else if (calcTab === 'perdagangan') {
        const m = parseInt(calcDagangModal.replace(/\D/g, '')) || 0;
        const u = parseInt(calcDagangUntung.replace(/\D/g, '')) || 0;
        const p = parseInt(calcDagangPiutang.replace(/\D/g, '')) || 0;
        const h = parseInt(calcDagangHutang.replace(/\D/g, '')) || 0;
        totalAsset = m + u + p - h;
        requiredNisab = nisabTahun;
        isEligible = totalAsset >= requiredNisab;
        if (isEligible) zakatAmmount = totalAsset * 0.025;
    } else if (calcTab === 'saham') {
        const s = parseInt(calcSahamNilai.replace(/\D/g, '')) || 0;
        const d = parseInt(calcSahamDividen.replace(/\D/g, '')) || 0;
        totalAsset = s + d;
        requiredNisab = nisabTahun;
        isEligible = totalAsset >= requiredNisab;
        if (isEligible) zakatAmmount = totalAsset * 0.025;
    } else if (calcTab === 'rikaz') {
        const r = parseInt(calcRikazNilai.replace(/\D/g, '')) || 0;
        totalAsset = r;
        requiredNisab = 0;
        isEligible = totalAsset > 0;
        if (isEligible) zakatAmmount = totalAsset * 0.20;
    } else if (calcTab === 'fidyah') {
        const days = parseInt(calcFidyahDays.replace(/\D/g, '')) || 0;
        const rate = parseInt(calcFidyahRate.replace(/\D/g, '')) || 0;
        totalAsset = days * rate;
        requiredNisab = 0;
        isEligible = totalAsset > 0;
        if (isEligible) zakatAmmount = totalAsset;
    }

    return { totalAsset, requiredNisab, isEligible, zakatAmmount };
  };

  const { totalAsset: calcTotalAsset, requiredNisab: calcRequiredNisab, isEligible: calcIsEligible, zakatAmmount: calcZakatAmmount } = getCalcDetails();

  const handleApplyCalcAmount = () => {
      setZakatType(calcTab === 'perdagangan' ? 'perniagaan' : calcTab);
      setZakatAmount(formatCurrencyForm(calcZakatAmmount.toString()));
      setActiveTab('bayar');
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const calculateTotal = () => {
    return parseInt(zakatAmount.replace(/\D/g, '')) || 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!donorPhone) {
        alert("Nomor telepon kudu diisi.");
        return;
    }
    
    if (!paymentMethod) {
        alert("Pilih metode pembayaran terlebih dahulu.");
        return;
    }
    
    setIsSubmitting(true);
    
    try {
        const valAmount = calculateTotal();
        if (!valAmount || valAmount <= 0) {
            alert("Nominal zakat tidak valid");
            setIsSubmitting(false);
            return;
        }

        // Simulasi proses
        await new Promise(resolve => setTimeout(resolve, 800));

        localStorage.setItem('app_user_phone', donorPhone);
        if (donorName) localStorage.setItem('app_user_name', donorName);

        setShowPaymentInstructions(true);
        setIsSubmitting(false);
        window.scrollTo({ top: 300, behavior: 'smooth' });
    } catch (err: any) {
        setIsSubmitting(false);
        console.error(err);
        alert(err.message || "Terjadi kesalahan sistem pembayaran.");
    }
  };

  const finishDonation = async () => {
    setIsDonationSuccess(true);
    setShowPaymentInstructions(false);
    
    const uid = donorPhone;
    const valAmount = calculateTotal();
    
    const zakatTypeName = zakatType === 'penghasilan' ? 'Zakat Penghasilan' :
                          zakatType === 'maal' ? 'Zakat Maal' :
                          zakatType === 'fitrah' ? 'Zakat Fitrah' :
                          zakatType === 'perniagaan' ? 'Zakat Perniagaan' :
                          zakatType === 'saham' ? 'Zakat Saham' :
                          zakatType === 'rikaz' ? 'Zakat Rikaz' :
                          zakatType === 'fidyah' ? 'Fidyah' : zakatType;
    
    const payload = {
        userId: uid,
        date: new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' }),
        program: zakatTypeName,
        amount: valAmount,
        status: 'Berhasil',
        category: 'Zakat',
        method: PAYMENT_METHODS.find(m => m.id === paymentMethod)?.name || paymentMethod,
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
    }
  };

  const ZAKAT_TYPES_EDU = [
    {
      id: 'fitrah',
      title: 'Zakat Fitrah',
      icon: HandCoins,
      color: 'bg-emerald-500',
      description: 'Zakat yang diwajibkan atas setiap jiwa baik lelaki dan perempuan muslim yang dilakukan pada bulan Ramadhan hingga menjelang shalat Idul Fitri.',
      details: 'Besarannya setara dengan 2,5 kg atau 3,5 liter beras/makanan pokok per jiwa.'
    },
    {
      id: 'maal',
      title: 'Zakat Maal',
      icon: Wallet,
      color: 'bg-blue-500',
      description: 'Zakat atas harta yang dimiliki secara tam (sempurna) yang telah mencapai nisab dan haul.',
      details: 'Mencakup simpanan uang, emas, perak, kendaraan, dan aset lainnya. Kadar zakatnya umumnya 2,5%.'
    },
    {
      id: 'penghasilan',
      title: 'Zakat Penghasilan',
      icon: Banknote,
      color: 'bg-indigo-500',
      description: 'Zakat yang dikeluarkan dari hasil pendapatan profesi (gaji, honorarium) bila telah mencapai nisab.',
      details: 'Nisabnya setara dengan 85 gram emas per tahun. Zakat bisa ditunaikan rutin per bulan dengan kadar 2,5%.'
    },
    {
      id: 'perniagaan',
      title: 'Zakat Perniagaan',
      icon: CreditCard,
      color: 'bg-amber-500',
      description: 'Zakat atas harta yang diperuntukkan untuk jual-beli guna mencari keuntungan.',
      details: 'Dihitung dari (Modal + Keuntungan + Piutang) - Hutang Jatuh Tempo. Kadar 2,5% bila mencapai nisab emas 85 gram.'
    }
  ];

  const ASNAF = [
    { title: 'Fakir', desc: 'Sangat miskin, tidak punya harta & tenaga untuk hidup.' },
    { title: 'Miskin', desc: 'Punya harta/tenaga tapi tidak mencukupi kebutuhan dasar.' },
    { title: 'Amil', desc: 'Pengurus atau panitia pengelola zakat.' },
    { title: 'Muallaf', desc: 'Orang yang baru masuk Islam dan butuh penguatan.' },
    { title: 'Riqab', desc: 'Hamba sahaya atau budak (memerdekakan).' },
    { title: 'Gharimin', desc: 'Orang yang terlilit hutang untuk kebutuhan mubah.' },
    { title: 'Fisabilillah', desc: 'Orang yang berjuang di jalan Allah.' },
    { title: 'Ibnu Sabil', desc: 'Musafir yang kehabisan bekal perjalanan.' }
  ];

  return (
    <div className="bg-[#eaf4fc] dark:bg-slate-900 min-h-[85vh] lg:min-h-screen pt-32 pb-24 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 md:px-6">
        
        <div className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">Tunaikan Zakat</h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-sm md:text-base leading-relaxed mb-6">
            Bersihkan harta, sucikan jiwa dengan berzakat yang tepat sasaran & transparan bersama LAZNAS Dewan Dakwah.
          </p>

          <div className="flex justify-center mb-8">
            <div className="flex items-center bg-white dark:bg-slate-800 p-1.5 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm relative">
                <button
                    onClick={() => setActiveTab('bayar')}
                    className={`relative z-10 px-4 md:px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2 ${activeTab === 'bayar' ? 'text-white' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                >
                    <Wallet className="w-4 h-4" /> <span className="hidden sm:inline">Bayar Zakat</span><span className="sm:hidden">Bayar</span>
                </button>
                <button
                    onClick={() => setActiveTab('kalkulator')}
                    className={`relative z-10 px-4 md:px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2 ${activeTab === 'kalkulator' ? 'text-white' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                >
                    <Calculator className="w-4 h-4" /> <span className="hidden sm:inline">Kalkulator Zakat</span><span className="sm:hidden">Kalkulator</span>
                </button>
                <button
                    onClick={() => setActiveTab('edukasi')}
                    className={`relative z-10 px-4 md:px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2 ${activeTab === 'edukasi' ? 'text-white' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                >
                    <BookOpen className="w-4 h-4" /> <span className="hidden sm:inline">Edukasi Zakat</span><span className="sm:hidden">Edukasi</span>
                </button>
                <div 
                    className="absolute top-1.5 bottom-1.5 w-[calc(33.33%-4px)] bg-[#1799dc] rounded-full transition-transform duration-300 ease-out shadow-md"
                    style={{ 
                        transform: activeTab === 'bayar' ? 'translateX(0)' : 
                                   activeTab === 'kalkulator' ? 'translateX(100%)' :
                                   'translateX(200%)' 
                    }}
                />
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
        {activeTab === 'bayar' && (
        <motion.div 
            key="bayar"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden"
        >
          <div className="p-6 md:p-8">
            <AnimatePresence mode="wait">
              {isDonationSuccess ? (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex flex-col items-center justify-center py-6"
                >
                  <div className="relative mb-6">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ 
                        type: "spring",
                        stiffness: 260,
                        damping: 20,
                        duration: 1.5 
                      }}
                      className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center text-emerald-500 shadow-xl border-4 border-white dark:border-slate-800 relative z-10"
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
                  
                  <div className="w-full bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-4 mb-5 border border-slate-100 dark:border-slate-700 relative overflow-hidden text-left">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[11px] md:text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">
                        Nominal Zakat
                      </span>
                      <span className="text-[10px] md:text-[11px] text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-md uppercase tracking-widest gap-1 flex items-center">
                        <CheckCircle2 className="w-3 h-3 md:w-3.5 md:h-3.5" /> Berhasil
                      </span>
                    </div>
                    <div className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-1">
                      Rp {formatCurrencyForm(calculateTotal().toString())}
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-600 flex justify-between items-center font-mono text-[10px] md:text-xs text-slate-400 dark:text-slate-500">
                      <span>Reference ID</span>
                      <span className="font-bold text-slate-600 dark:text-slate-300">#{Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 w-full mb-4">
                    <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.05 }} 
                      className="transition-all duration-300 flex items-center justify-center gap-2 py-3 px-4 bg-[#f29f05] hover:bg-[#d98f04] text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-[#f29f05]/20 hover:-translate-y-0.5"
                    >
                      <Share2 className="w-4.5 h-4.5" /> Ajak Kebaikan
                    </motion.button>
                    <motion.button className="transition-all duration-300 flex items-center justify-center gap-2 py-3 px-4 bg-slate-100 dark:bg-slate-700/80 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 rounded-xl font-bold text-sm hover:-translate-y-0.5" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}>
                      <Download className="w-4.5 h-4.5" /> Unduh Resi
                    </motion.button>
                  </div>
                  
                  <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.05 }} 
                    onClick={() => {
                        setIsDonationSuccess(false);
                        setZakatAmount('');
                    }}
                    className="transition-all duration-300 w-full bg-gradient-to-r from-[#f29f05] to-[#d98f04] hover:from-[#d98f04] hover:to-[#c28003] text-white font-extrabold py-3.5 rounded-xl transition-all shadow-lg shadow-[#f29f05]/30 hover:shadow-xl hover:-translate-y-0.5"
                  >
                    Kembali Menunaikan Zakat
                  </motion.button>
                </motion.div>
              ) : showPaymentInstructions && paymentMethod ? (
                <motion.div 
                  key="instructions"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col gap-4 py-2"
                >
                  <div className="bg-[#1799dc]/10 dark:bg-[#1799dc]/20 p-5 rounded-2xl border border-[#1799dc]/20 text-center">
                    <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-slate-100 dark:border-slate-800">
                      <img 
                        src={PAYMENT_METHODS.find(m => m.id === paymentMethod)?.icon} 
                        className="w-10 h-10 object-contain" 
                        alt="" 
                      />
                    </div>
                    <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">
                      {PAYMENT_INSTRUCTIONS[paymentMethod]?.title || "Instruksi Pembayaran"}
                    </h4>
                    <div className="text-2xl font-black text-[#1799dc] dark:text-[#1799dc]">
                      Rp {formatCurrencyForm(calculateTotal().toString())}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Langkah Pembayaran
                    </label>
                    <div className="space-y-2.5">
                      {(PAYMENT_INSTRUCTIONS[paymentMethod]?.steps || []).map((step: string, i: number) => (
                        <div key={i} className="flex gap-3 items-start bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/50 transition-all hover:border-[#1799dc]/30">
                          <div className="w-6 h-6 rounded-full bg-[#1799dc] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {i + 1}
                          </div>
                          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                            {step}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {PAYMENT_INSTRUCTIONS[paymentMethod]?.note && (
                    <div className="flex gap-3 bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-100 dark:border-amber-800/30">
                      <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium leading-relaxed">
                        {PAYMENT_INSTRUCTIONS[paymentMethod].note}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-col gap-3 pt-2">
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={finishDonation}
                      className="w-full bg-gradient-to-r from-[#1799dc] to-[#1588c4] hover:from-[#1588c4] hover:to-[#1277ad] text-white font-extrabold py-4 rounded-2xl shadow-xl shadow-[#1799dc]/30 flex items-center justify-center gap-2 text-base"
                    >
                      Saya Sudah Transfer
                      <ArrowRight className="w-5 h-5" />
                    </motion.button>
                    
                    <button 
                      type="button"
                      onClick={() => setShowPaymentInstructions(false)}
                      className="text-[13px] font-bold text-slate-400 hover:text-[#1799dc] transition-colors flex items-center justify-center gap-1.5 py-2"
                    >
                      Ubah Metode Pembayaran
                    </button>
                  </div>
                </motion.div>
              ) : (
            <form onSubmit={handleSubmit} className="space-y-8" key="form">
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
                          <option value="perniagaan">Zakat Perniagaan / Perdagangan</option>
                          <option value="saham">Zakat Saham / Investasi</option>
                          <option value="rikaz">Zakat Rikaz (Harta Temuan)</option>
                          <option value="fidyah">Fidyah (Pengganti Puasa)</option>
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
                    <Info className="w-6 h-6 text-blue-500 shrink-0" />
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
                        {isSubmitting ? (
                          <span className="flex items-center gap-2">
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Memproses...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">Tunaikan Sekarang <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></span>
                        )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
            )}
            </AnimatePresence>
          </div>
        </motion.div>
        )}
        {activeTab === 'kalkulator' && (
            <motion.div
                key="kalkulator"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden"
            >
              <div className="bg-primary-50 dark:bg-primary-900/20 p-4 md:p-6 border-b border-primary-100 dark:border-primary-800/50 flex justify-between items-center bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#1799dc]/10 rounded-full flex items-center justify-center text-[#1799dc]">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-200">Kalkulator Zakat</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Hitung & tunaikan kewajiban Zakat</p>
                  </div>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="flex flex-wrap border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 overflow-x-auto custom-scrollbar">
                {[
                  { id: 'penghasilan', label: 'Penghasilan' },
                  { id: 'maal', label: 'Maal/Harta' },
                  { id: 'perdagangan', label: 'Perdagangan' },
                  { id: 'saham', label: 'Saham' },
                  { id: 'rikaz', label: 'Rikaz' },
                  { id: 'fidyah', label: 'Fidyah' }
                ].map((tab) => (
                  <button 
                    key={tab.id}
                    onClick={() => setCalcTab(tab.id as any)}
                    className={`transition-all duration-300 px-4 py-3 text-xs font-bold whitespace-nowrap min-w-fit ${
                      calcTab === tab.id 
                        ? 'text-[#1799dc] bg-white dark:bg-slate-900 border-t-2 border-t-[#1799dc] shadow-[0_-2px_10px_rgba(0,0,0,0.02)]' 
                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 border-t-2 border-t-transparent hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-6 md:p-8 space-y-6">
                <div className="p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800/30 flex items-center justify-between">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider mb-0.5 block">
                      Harga Emas Saat Ini
                    </label>
                    <div className="flex items-center gap-1.5 focus-within:ring-2 focus-within:ring-[#1799dc]/20 rounded-md">
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Rp</span>
                      <input 
                        type="text" 
                        value={formatCurrencyForm(calcGoldPrice)}
                        onChange={(e) => setCalcGoldPrice(e.target.value)}
                        className="bg-transparent text-sm font-bold text-slate-800 dark:text-slate-200 focus:outline-none w-24 border-b border-dashed border-slate-300 dark:border-slate-600 focus:border-[#1799dc]"
                        title="Bisa diubah secara manual"
                      />
                      <span className="text-xs font-medium text-slate-500">/ gram</span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2.5 py-1 rounded-full font-bold">Manual</span>
                </div>

                <div className="space-y-4">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={calcTab}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      {calcTab === 'penghasilan' && (
                        <>
                          {[
                            { label: 'Pendapatan per Bulan', val: calcIncome, set: setCalcIncome },
                            { label: 'Bonus/THR', val: calcBonus, set: setCalcBonus }
                          ].map((f, i) => (
                            <div key={i}>
                              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">{f.label}</label>
                              <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                  <span className="text-slate-400 group-focus-within:text-[#1799dc] font-bold text-sm transition-colors">Rp</span>
                                </div>
                                <input type="text" value={formatCurrencyForm(f.val)} onChange={(e) => f.set(e.target.value)} placeholder="0" className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-[#1799dc]/20 focus:border-[#1799dc] outline-none font-bold text-sm transition-all dark:text-white" />
                              </div>
                            </div>
                          ))}
                          <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            <p className="mb-2"><span className="font-bold text-[#1799dc]">Nisab Zakat Penghasilan:</span><br/>Nisab zakat penghasilan adalah senilai 85 gram emas per tahun. Jika dibayar per bulan, nisab dihitung dari nilai 85 gram emas dibagi 12 bulan. Zakat yang harus dikeluarkan adalah 2,5% dari total penghasilan.</p>
                          </div>
                        </>
                      )}

                      {calcTab === 'maal' && (
                        <>
                          {[
                            { label: 'Tabungan/Giro/Deposito', val: calcMaalTabungan, set: setCalcMaalTabungan },
                            { label: 'Logam Mulia (Emas/Perak)', val: calcMaalEmas, set: setCalcMaalEmas },
                            { label: 'Properti Investasi', val: calcMaalProperti, set: setCalcMaalProperti },
                            { label: 'Hutang Jatuh Tempo (Pengurang)', val: calcMaalHutang, set: setCalcMaalHutang, color: 'border-rose-100 dark:border-rose-900/50 focus:border-rose-400 focus:ring-rose-400/20', text: 'text-rose-500' }
                          ].map((f, i) => (
                            <div key={i}>
                              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">{f.label}</label>
                              <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                  <span className={`font-bold text-sm transition-colors ${f.text || 'text-slate-400 group-focus-within:text-[#1799dc]'}`}>Rp</span>
                                </div>
                                <input type="text" value={formatCurrencyForm(f.val)} onChange={(e) => f.set(e.target.value)} placeholder="0" className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl border outline-none font-bold text-sm transition-all dark:text-white ${f.color || 'border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-[#1799dc]/20 focus:border-[#1799dc]'}`} />
                              </div>
                            </div>
                          ))}
                          <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            <p className="mb-2"><span className="font-bold text-[#1799dc]">Nisab Zakat Maal:</span><br/>Zakat yang dikenakan atas kepemilikan harta (uang, emas, aset, dll) yang telah mencapai nisab 85 gram emas dan dimiliki penuh selama 1 tahun (haul). Zakat yang dikeluarkan adalah 2,5%.</p>
                          </div>
                        </>
                      )}

                      {calcTab === 'perdagangan' && (
                        <>
                          {[
                            { label: 'Uang Tunai / Modal Diputar', val: calcDagangModal, set: setCalcDagangModal },
                            { label: 'Laba / Untung Tertahan', val: calcDagangUntung, set: setCalcDagangUntung },
                            { label: 'Piutang Lancar', val: calcDagangPiutang, set: setCalcDagangPiutang },
                            { label: 'Hutang Jatuh Tempo (Pengurang)', val: calcDagangHutang, set: setCalcDagangHutang, color: 'border-rose-100 dark:border-rose-900/50 focus:border-rose-400 focus:ring-rose-400/20', text: 'text-rose-500' }
                          ].map((f, i) => (
                            <div key={i}>
                              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">{f.label}</label>
                              <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                  <span className={`font-bold text-sm transition-colors ${f.text || 'text-slate-400 group-focus-within:text-[#1799dc]'}`}>Rp</span>
                                </div>
                                <input type="text" value={formatCurrencyForm(f.val)} onChange={(e) => f.set(e.target.value)} placeholder="0" className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl border outline-none font-bold text-sm transition-all dark:text-white ${f.color || 'border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-[#1799dc]/20 focus:border-[#1799dc]'}`} />
                              </div>
                            </div>
                          ))}
                           <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            <p className="mb-2"><span className="font-bold text-[#1799dc]">Nisab Zakat Perdagangan:</span><br/>Nisab zakat perdagangan sama dengan zakat maal, yaitu senilai 85 gram emas. Dihitung dari keseluruhan aset berputar (Modal + Untung + Piutang) dikurangi hutang jatuh tempo. Zakat yang dikeluarkan sebesar 2,5%.</p>
                          </div>
                        </>
                      )}

                      {calcTab === 'saham' && (
                        <>
                           {[
                            { label: 'Nilai Pasar Saham Saat Ini', val: calcSahamNilai, set: setCalcSahamNilai },
                            { label: 'Total Dividen Diterima', val: calcSahamDividen, set: setCalcSahamDividen },
                          ].map((f, i) => (
                            <div key={i}>
                              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">{f.label}</label>
                              <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                  <span className="text-slate-400 group-focus-within:text-[#1799dc] font-bold text-sm transition-colors">Rp</span>
                                </div>
                                <input type="text" value={formatCurrencyForm(f.val)} onChange={(e) => f.set(e.target.value)} placeholder="0" className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-[#1799dc]/20 focus:border-[#1799dc] outline-none font-bold text-sm transition-all dark:text-white" />
                              </div>
                            </div>
                          ))}
                          <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            <p className="mb-2"><span className="font-bold text-[#1799dc]">Nisab Zakat Saham/Investasi:</span><br/>Nisab zakat saham disamakan dengan zakat maal (85 gram emas). Nilai aset dihitung dari nilai wajar saham (saat haul tiba) ditambah total dividen yang diterima. Zakat yang dikeluarkan adalah 2,5%.</p>
                          </div>
                        </>
                      )}

                      {calcTab === 'rikaz' && (
                        <>
                           <div className="mb-4">
                              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">Nilai Harta Temuan / Hadiah</label>
                              <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                  <span className="text-slate-400 group-focus-within:text-[#1799dc] font-bold text-sm transition-colors">Rp</span>
                                </div>
                                <input type="text" value={formatCurrencyForm(calcRikazNilai)} onChange={(e) => setCalcRikazNilai(e.target.value)} placeholder="0" className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-[#1799dc]/20 focus:border-[#1799dc] outline-none font-bold text-sm transition-all dark:text-white" />
                              </div>
                            </div>
                            <div className="bg-rose-50 dark:bg-rose-900/10 p-4 rounded-xl border border-dashed border-rose-200 dark:border-rose-900/50 text-xs text-rose-600 dark:text-rose-400 leading-relaxed">
                              <p className="mb-2"><span className="font-bold">Ketentuan Zakat Rikaz:</span><br/><b>Zakat Rikaz</b> (Harta Temuan/Karun) tidak memiliki syarat nisab maupun haul (waktu kepemilikan). Kewajiban zakatnya adalah <b>20% (Khums)</b> dan harus segera dikeluarkan saat harta tersebut ditemukan.</p>
                            </div>
                        </>
                      )}

                      {calcTab === 'fidyah' && (
                        <>
                           <div className="mb-4">
                              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">Jumlah Hari Ditinggalkan</label>
                              <div className="relative group">
                                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                                  <span className="text-slate-400 font-bold text-sm transition-colors">Hari</span>
                                </div>
                                <input type="number" value={calcFidyahDays} onChange={(e) => setCalcFidyahDays(e.target.value)} placeholder="0" className="w-full pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-[#1799dc]/20 focus:border-[#1799dc] outline-none font-bold text-sm transition-all dark:text-white" />
                              </div>
                            </div>
                            <div className="mb-4">
                              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">Harga Beras/Makan (Per Hari / Per Jiwa)</label>
                              <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                  <span className="text-slate-400 group-focus-within:text-[#1799dc] font-bold text-sm transition-colors">Rp</span>
                                </div>
                                <input type="text" value={formatCurrencyForm(calcFidyahRate)} onChange={(e) => setCalcFidyahRate(e.target.value)} placeholder="0" className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-[#1799dc]/20 focus:border-[#1799dc] outline-none font-bold text-sm transition-all dark:text-white" />
                              </div>
                            </div>
                            <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl border border-dashed border-amber-200 dark:border-amber-900/50 text-xs text-amber-700 dark:text-amber-500 leading-relaxed">
                              <p className="mb-2"><span className="font-bold">Ketentuan Fidyah:</span><br/>Bagi orang tua renta, orang sakit parah yang tak kunjung sembuh, atau wanita hamil/menyusui (dengan syarat tertentu) yang tidak mampu berpuasa, wajib membayar fidyah berupa memberi makan 1 orang miskin per hari puasa yang ditinggalkan. Besaran yang dianjurkan senilai porsi makan wajar yang biasa kita makan.</p>
                            </div>
                        </>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
                
                {/* Result Block */}
                <div className={`p-5 rounded-2xl border ${calcIsEligible ? 'bg-gradient-to-br from-blue-50 to-emerald-50 dark:from-[#1799dc]/10 dark:to-emerald-900/10 border-blue-200 dark:border-[#1799dc]/30' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700'} transition-colors duration-500`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-slate-500 tracking-wider uppercase">Nisab Wajib Zakat</span>
                    <span className="text-sm font-black text-slate-800 dark:text-slate-200">Rp {formatCurrencyForm(calcRequiredNisab.toString())}</span>
                  </div>
                  <div className="flex justify-between items-center mb-4 pb-4 border-b border-dashed border-slate-300 dark:border-slate-700">
                    <span className="text-xs font-bold text-slate-500 tracking-wider uppercase">Total Harta/Nilai Anda</span>
                    <span className="text-sm font-black text-slate-800 dark:text-slate-200">Rp {formatCurrencyForm(calcTotalAsset.toString())}</span>
                  </div>
                  
                  <div className="text-center mt-2 space-y-2">
                    <p className={`text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-1.5 ${calcIsEligible ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}>
                      {calcIsEligible ? (
                        <><CheckCircle2 className="w-3.5 h-3.5" /> {calcTab === 'fidyah' ? 'Wajib Dibayarkan' : `Wajib Zakat (${calcTab === 'rikaz' ? '20%' : '2.5%'})`}</>
                      ) : (
                        'Belum Wajib Zakat'
                      )}
                    </p>
                    <p className={`text-3xl font-black ${calcIsEligible ? 'text-[#1799dc] dark:text-[#38bdf8] drop-shadow-sm' : 'text-slate-400'}`}>
                      Rp {formatCurrencyForm(calcZakatAmmount.toString())}
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <button 
                    disabled={!calcIsEligible}
                    onClick={handleApplyCalcAmount}
                    className={`w-full py-4 rounded-xl font-extrabold flex items-center justify-center gap-2 transition-all text-sm md:text-base ${ calcIsEligible ? 'bg-gradient-to-r from-[#1799dc] to-[#1380b8] hover:from-[#1588c4] hover:to-[#0f6795] text-white shadow-lg shadow-[#1799dc]/30 hover:shadow-xl hover:-translate-y-0.5' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed border border-slate-200 dark:border-slate-700/50' } duration-300`}
                  >
                    {calcIsEligible ? 'Gunakan Nominal Untuk Bayar Zakat' : 'Penuhi Nisab Terlebih Dahulu'}
                  </button>
                </div>

              </div>
            </motion.div>
        )}
        {activeTab === 'edukasi' && (
            <motion.div 
                key="edukasi"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
            >
                {/* Intro Card */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 shadow-md border border-slate-100 dark:border-slate-700 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5 dark:opacity-10 pointer-events-none">
                        <Heart className="w-48 h-48 text-[#1799dc]" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-[#1799dc]/10 flex items-center justify-center">
                                <BookOpen className="w-5 h-5 text-[#1799dc]" />
                            </div>
                            <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white">Makna & Panduan Zakat</h2>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6 font-medium">
                            Zakat secara bahasa artinya bersih, suci, subur, berkat, dan berkembang. 
                            Secara istilah syariat, zakat adalah bagian dari harta yang wajib dikeluarkan oleh setiap Muslim 
                            apabila telah mencapai syarat yang ditetapkan (Nisab & Haul) untuk diberikan kepada golongan yang berhak menerimanya (Asnaf).
                        </p>
                        
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Nisab
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                    Batas minimal jumlah harta yang wajib dikeluarkan zakatnya. Jika kurang dari nisab, tidak wajib zakat, melainkan sedekah/infak biasa.
                                </p>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Haul
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                    Batas waktu minimal kepemilikan harta agar diwajibkan zakat, yaitu berlalu selama satu tahun penuh (Hijriyah/Masehi).
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Jenis Zakat */}
                <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white mt-10 mb-6 px-2">Macam-Macam Zakat</h2>
                <div className="grid md:grid-cols-2 gap-4">
                    {ZAKAT_TYPES_EDU.map((zakat, idx) => {
                        const Icon = zakat.icon;
                        return (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                key={zakat.id} 
                                className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-md border border-slate-100 dark:border-slate-700 hover:shadow-lg transition-shadow group"
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg ${zakat.color}`}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 group-hover:text-[#1799dc] transition-colors">{zakat.title}</h3>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-3">{zakat.description}</p>
                                        <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                <span className="text-[#1799dc]">Detail:</span> {zakat.details}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Asnaf Zakat */}
                <div className="bg-gradient-to-br from-[#1799dc] to-blue-700 rounded-3xl p-6 md:p-8 text-white mt-10 shadow-xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-12 translate-x-12"></div>
                    <div className="relative z-10">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl md:text-3xl font-extrabold mb-3">8 Golongan Penerima Zakat (Asnaf)</h2>
                            <p className="text-blue-100 font-medium text-sm md:text-base max-w-2xl mx-auto">
                                "Sesungguhnya zakat itu hanyalah untuk orang-orang fakir, orang miskin, amil zakat, yang dilunakkan hatinya (mualaf)..." <br className="hidden md:block"/> 
                                <span className="italic text-white opacity-80">(QS. At-Taubah: 60)</span>
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                            {ASNAF.map((item, idx) => (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.2 + (idx * 0.05) }}
                                    key={item.title} 
                                    className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 p-4 rounded-2xl transition-all"
                                >
                                    <div className="w-8 h-8 rounded-full bg-white text-[#1799dc] flex items-center justify-center font-black text-sm mb-3">
                                        {idx + 1}
                                    </div>
                                    <h4 className="font-bold text-lg mb-1">{item.title}</h4>
                                    <p className="text-[11px] text-blue-100 leading-relaxed font-medium">{item.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

            </motion.div>
        )}
        </AnimatePresence>

      </div>
    </div>
  );
};

