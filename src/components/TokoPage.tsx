import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, Star, Share2, Heart, Search, Filter, 
  MapPin, Truck, ChevronRight, X, CheckCircle, Info, ArrowLeft,
  CreditCard, Wallet, Smartphone, ShieldCheck, Tag
} from 'lucide-react';
import { Link, Routes, Route, useParams, useNavigate, useLocation } from 'react-router-dom';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  sales: number;
  seller: string;
  location: string;
  weight: number; // in grams
}

const PRODUCTS: Product[] = [
  {
    id: "prod-1",
    name: "Kopi Arabica Pedalaman",
    description: "Kopi pilihan hasil panen petani binaan Dai di dataran tinggi Aceh. Ditanam secara organik dan diproses dengan penuh cinta.",
    price: 85000,
    image: "https://images.unsplash.com/photo-1559525839-b184a4d698c7?q=80&w=800&auto=format&fit=crop",
    category: "Pangan",
    rating: 4.9,
    sales: 1205,
    seller: "Koperasi Da'i Aceh",
    location: "Takengon, Aceh",
    weight: 250,
  },
  {
    id: "prod-2",
    name: "Madu Hutan Liar Riau",
    description: "Madu murni yang diringkas dari sarang lebah liar di hutan Riau. Pendapatan disalurkan untuk pendidikan anak-anak Sakai.",
    price: 150000,
    image: "https://images.unsplash.com/photo-1587049352847-4d4b137a4d5e?q=80&w=800&auto=format&fit=crop",
    category: "Kesehatan",
    rating: 4.8,
    sales: 854,
    seller: "Binaan Da'i Riau",
    location: "Pekanbaru, Riau",
    weight: 500,
  },
  {
    id: "prod-3",
    name: "Kain Tenun Ikat Sumba",
    description: "Tenun asli karya pengrajin wanita Sumba. Setiap helai menceritakan tradisi dan mendukung kemandirian ekonomi keluarga Mualaf.",
    price: 450000,
    image: "https://images.unsplash.com/photo-1620806497255-a0c5bdccbcf6?q=80&w=800&auto=format&fit=crop",
    category: "Kerajinan",
    rating: 5.0,
    sales: 156,
    seller: "UMKM Wanita Sumba",
    location: "Sumba Timur, NTT",
    weight: 400,
  },
  {
    id: "prod-4",
    name: "Cokelat Klasik Desa",
    description: "Cokelat batangan premium dari biji kakao lokal pilihan petani binaan. Rasakan kenikmatan sekaligus berbagi.",
    price: 45000,
    image: "https://images.unsplash.com/photo-1548907040-4baa42d10919?q=80&w=800&auto=format&fit=crop",
    category: "Pangan",
    rating: 4.7,
    sales: 3200,
    seller: "Koperasi Cokelat Kita",
    location: "Blitar, Jawa Timur",
    weight: 100,
  },
  {
    id: "prod-5",
    name: "Minyak Zaitun Ruqyah",
    description: "Minyak zaitun extra virgin yang telah di bacakan ayat-ayat ruqyah oleh para Da'i. Baik untuk kesehatan dan pengobatan thiibun nabawi.",
    price: 75000,
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=800&auto=format&fit=crop",
    category: "Kesehatan",
    rating: 4.9,
    sales: 580,
    seller: "Toko Sehat Da'i",
    location: "Bekasi, Jawa Barat",
    weight: 200,
  },
  {
    id: "prod-6",
    name: "Tas Anyaman Lontar",
    description: "Tas ramah lingkungan yang sangat kuat dan unik. Dibuat langsung oleh masyarakat binaan di daerah pesisir timur.",
    price: 120000,
    image: "https://images.unsplash.com/photo-1601614766345-d8aa13dfd596?q=80&w=800&auto=format&fit=crop",
    category: "Kerajinan",
    rating: 4.6,
    sales: 230,
    seller: "UMKM Lontar Indah",
    location: "Lombok, NTB",
    weight: 350,
  }
];

const CITIES = [
  "Jakarta", "Bandung", "Surabaya", "Yogyakarta", "Medan", "Makassar", "Semarang", "Palembang", "Balikpapan"
];

const CATEGORIES = ["Semua", "Pangan", "Kesehatan", "Kerajinan"];

interface CartItem extends Product {
  quantity: number;
}

const TokoDetail = ({ onAddToCart, onBuyNow, cartItemCount, onOpenCart }: { onAddToCart: (p: Product) => void, onBuyNow: (p: Product) => void, cartItemCount: number, onOpenCart: () => void }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = PRODUCTS.find(p => p.id === id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Produk tidak ditemukan</h2>
        <button onClick={() => navigate('/toko')} className="text-primary-500 font-medium flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Toko
        </button>
      </div>
    );
  }

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="max-w-5xl mx-auto md:px-6 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-500 pb-20">
      {/* Back Button (Mobile floating, Desktop relative) */}
      <div className="md:mb-6 px-4 py-3 md:p-0 flex items-center justify-between sticky top-0 md:relative z-50 bg-white/80 dark:bg-slate-950/80 md:bg-transparent backdrop-blur-xl md:backdrop-blur-none border-b border-slate-200 dark:border-slate-800 md:border-none">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/toko')} className="w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="font-bold text-slate-800 dark:text-white md:hidden">Detail Produk</span>
        </div>
        <button onClick={onOpenCart} className="w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-colors relative">
          <ShoppingBag className="w-5 h-5" />
          {cartItemCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white dark:border-slate-800">
              {cartItemCount}
            </span>
          )}
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-0 md:gap-8 lg:gap-12 bg-white dark:bg-slate-900 md:rounded-3xl shadow-sm md:p-6 lg:p-8 md:border border-slate-200 dark:border-slate-800">
        
        {/* Image Gallery (Simplified to single image) */}
        <div className="w-full md:w-1/2 lg:w-[45%] shrink-0">
          <div className="aspect-square md:rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            <div className="absolute top-4 left-4 z-10 pointer-events-none">
              <span className="text-[10px] sm:text-xs font-black bg-white/90 dark:bg-slate-900/90 backdrop-blur shadow-md px-3 py-1.5 rounded-full uppercase tracking-widest text-primary-500 border border-white/40">
                {product.category}
              </span>
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="w-full md:w-1/2 lg:w-[55%] flex flex-col p-5 md:p-0">
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500 bg-amber-50 dark:bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-100 dark:border-amber-500/20">
                <Star className="w-4 h-4 fill-amber-500" />
                <span>{product.rating}</span>
              </div>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 capitalize">{product.sales} Terjual</span>
            </div>
            
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-800 dark:text-white tracking-tight mb-4 leading-tight">
              {product.name}
            </h1>
            
            <div className="flex flex-col mb-6">
              <span className="text-sm text-slate-400 font-bold line-through decoration-red-400/50 mb-1">
                {formatRupiah(product.price * 1.15)}
              </span>
              <span className="text-3xl md:text-4xl font-black text-primary-500 leading-none">
                {formatRupiah(product.price)}
              </span>
            </div>
          </div>

          <div className="border-t border-b border-slate-100 dark:border-slate-800 py-4 mb-6 grid grid-cols-2 gap-4">
             <div className="flex items-start gap-3">
               <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-red-500" />
               </div>
               <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Pengiriman</p>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{product.location}</p>
               </div>
             </div>
             <div className="flex items-start gap-3">
               <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0">
                  <Tag className="w-5 h-5 text-emerald-500" />
               </div>
               <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Berat</p>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{product.weight} gram</p>
               </div>
             </div>
             <div className="flex items-start gap-3 col-span-2 mt-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
               <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-primary-600 dark:text-primary-400" />
               </div>
               <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Mitra / Penjual</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{product.seller}</p>
               </div>
             </div>
          </div>
          
          <div className="mb-8">
            <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest mb-3">Deskripsi Produk</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm whitespace-pre-line">
              {product.description}
            </p>
          </div>

          <div className="mt-auto hidden md:flex gap-3">
            <button 
              onClick={() => onAddToCart(product)}
              className="flex-1 h-14 rounded-2xl border-2 border-primary-500 text-primary-600 dark:text-primary-400 font-bold text-sm tracking-wide hover:bg-primary-50 dark:hover:bg-primary-900/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-5 h-5" /> Masukkan Keranjang
            </button>
            <button 
              onClick={() => onBuyNow(product)}
              className="flex-1 h-14 rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-black text-sm tracking-wide hover:from-primary-600 hover:to-primary-700 active:scale-95 transition-all shadow-xl shadow-primary-500/30 flex items-center justify-center gap-2"
            >
              Beli Sekarang
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Fixed Action Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 pb-8 flex gap-3 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] pt-4">
        <button 
          onClick={() => onAddToCart(product)}
          className="w-14 h-14 shrink-0 rounded-2xl border-2 border-primary-500 flex items-center justify-center text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 active:scale-95 transition-all"
        >
          <ShoppingBag className="w-6 h-6" />
        </button>
        <button 
          onClick={() => onBuyNow(product)}
          className="flex-1 h-14 rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-black text-[15px] tracking-wide active:scale-95 transition-all shadow-lg shadow-primary-500/30 flex items-center justify-center gap-2"
        >
          Beli Sekarang
        </button>
      </div>

    </div>
  );
};

export const TokoPage = () => {
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);
  
  // Checkout form state
  const [checkoutForm, setCheckoutForm] = useState({
    name: '',
    phone: '',
    address: '',
    city: 'Jakarta',
    paymentMethod: 'qris'
  });
  const [shippingCost, setShippingCost] = useState(0);

  const filteredProducts = PRODUCTS.filter(p => 
    (activeCategory === "Semua" || p.category === activeCategory) &&
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalWeight = cart.reduce((sum, item) => sum + (item.weight * item.quantity), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const location = useLocation();
  const isDetailPage = location.pathname.length > 6; // "/toko/..." is > 5

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Mock API Call for Shipping Cost
  useEffect(() => {
    if (cart.length > 0 && checkoutForm.city) {
      // Simulate API delay
      const loader = setTimeout(() => {
        // Base cost based on city index + weight factor
        const cityMultiplier = CITIES.indexOf(checkoutForm.city) + 1;
        const weightFactor = Math.ceil(totalWeight / 1000); // per kg
        const cost = 15000 + (cityMultiplier * 5000) * weightFactor;
        setShippingCost(cost);
      }, 500);
      return () => clearTimeout(loader);
    } else {
      setShippingCost(0);
    }
  }, [checkoutForm.city, totalWeight, cart.length]);

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate payment processing matching donation flow
    setTimeout(() => {
      setIsCheckoutOpen(false);
      setIsPaymentSuccess(true);
      setCart([]);
    }, 1500);
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className='min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 pt-20'>
      
      <Routes>
        <Route path="/" element={
          <>
            {/* Hero Header */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 pb-4 md:pb-6 rounded-b-[2rem] shadow-sm mb-6 relative overflow-hidden">
               <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-[#1799dc]/10 rounded-full blur-3xl"></div>
               <div className="absolute bottom-0 left-0 -ml-20 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl"></div>
               
               <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 pt-4 md:pt-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                     <div>
                        <div className="flex items-center gap-2 mb-2">
                           <span className="text-[9px] font-black tracking-widest uppercase text-[#1799dc] bg-[#1799dc]/10 px-2.5 py-1 rounded-full">UMKM & Da'i</span>
                        </div>
                        <h1 className="text-2xl md:text-4xl font-black text-slate-800 dark:text-white tracking-tighter mb-2 md:mb-3">Toko Kebaikan</h1>
                        <p className="text-slate-500 dark:text-slate-400 max-w-lg leading-relaxed text-xs md:text-sm">Beli produk pemberdayaan, bantu langsung kemandirian ekonomi da'i dan masyarakat binaan di pelosok.</p>
                     </div>
                     <div className="flex w-full md:w-auto relative group">
                       <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#1799dc] transition-colors" />
                       <input 
                         type="text" 
                         placeholder="Cari produk kebaikan..."
                         value={searchQuery}
                         onChange={(e) => setSearchQuery(e.target.value)}
                         className="w-full md:w-80 h-12 pl-11 pr-4 rounded-xl bg-slate-100 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-[#1799dc]/50 transition-all text-sm text-slate-800 dark:text-white"
                       />
                     </div>
                  </div>

                  <div className="flex items-center overflow-x-auto pb-2 gap-2 md:gap-3 no-scrollbar">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-4 md:px-5 py-2 md:py-2.5 rounded-xl font-bold text-[11px] md:text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
                          activeCategory === cat 
                            ? 'bg-[#1799dc] text-white shadow-md shadow-blue-500/20' 
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
               </div>
            </div>

            {/* Main Grid */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 mb-20">
               {filteredProducts.length === 0 ? (
                 <div className="text-center py-20">
                   <div className="inline-flex w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full items-center justify-center mb-4">
                      <Search className="w-8 h-8 text-slate-400" />
                   </div>
                   <p className="text-slate-500 font-medium">Produk tidak temukan.</p>
                 </div>
               ) : (
                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                   {filteredProducts.map(product => (
                     <motion.div 
                       key={product.id}
                       whileHover={{ y: -4 }}
                       className="bg-white dark:bg-slate-900 rounded-[20px] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col h-full relative"
                     >
                       <Link to={`/toko/${product.id}`} className="absolute inset-0 z-0"></Link>
                       <div className="absolute top-2 left-2 z-10 pointer-events-none">
                         <span className="text-[9px] font-black bg-white/90 dark:bg-slate-900/90 backdrop-blur shadow-sm px-2.5 py-1 rounded-full uppercase tracking-wider text-[#1799dc] border border-white/40">
                           {product.category}
                         </span>
                       </div>
                       <div className="aspect-[4/3] sm:aspect-square relative overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 pointer-events-none">
                         <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                       </div>
                       <div className="p-3 flex flex-col flex-1 pointer-events-none">
                         <h3 className="font-bold text-slate-800 dark:text-white text-[13px] md:text-sm leading-snug mb-1 line-clamp-2 min-h-[36px]">{product.name}</h3>
                         <div className="flex items-center gap-1 text-slate-400 text-[10px] sm:text-xs mb-3">
                           <MapPin className="w-3 h-3 text-red-400" />
                           <span className="truncate">{product.location}</span>
                         </div>
                         
                         <div className="mt-auto">
                           <div className="flex items-end justify-between mb-2.5 pointer-events-auto">
                             <div className="flex flex-col">
                               <span className="text-[10px] text-slate-400 font-medium line-through decoration-red-400/50 block mb-0.5">
                                 {formatRupiah(product.price * 1.15)}
                               </span>
                               <span className="text-sm md:text-base font-black text-[#1799dc] leading-none">
                                 {formatRupiah(product.price)}
                               </span>
                             </div>
                             
                             <button
                               onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(product); }}
                               className="relative z-10 w-8 h-8 md:w-9 md:h-9 bg-blue-50 dark:bg-blue-500/10 text-[#1799dc] hover:bg-[#1799dc] hover:text-white rounded-full flex items-center justify-center transition-all active:scale-95 group/btn shrink-0"
                             >
                               <ShoppingBag className="w-4 h-4 md:w-[18px] md:h-[18px] transition-transform group-hover/btn:scale-110" />
                             </button>
                           </div>
                           <div className="flex items-center gap-1 text-[10px] font-bold text-amber-500 bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
                              <Star className="w-3 h-3 fill-amber-500" />
                              <span>{product.rating}</span>
                              <span className="text-slate-300 dark:text-slate-600 mx-0.5">|</span>
                              <span className="text-slate-500 dark:text-slate-400 font-medium">{product.sales} terjual</span>
                           </div>
                         </div>
                       </div>
                     </motion.div>
                   ))}
                 </div>
               )}
            </div>
          </>
        } />
        <Route path="/:id" element={<TokoDetail onAddToCart={addToCart} onBuyNow={(prod) => { addToCart(prod); setIsCartOpen(true); }} cartItemCount={cartItemCount} onOpenCart={() => setIsCartOpen(true)} />} />
      </Routes>

      {/* Floating Cart Button */}
      {!isDetailPage && cart.length > 0 && (
        <motion.div
           initial={{ y: 100, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           className="fixed bottom-24 md:bottom-10 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-sm"
        >
          <button 
             onClick={() => setIsCartOpen(true)}
             className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl p-4 shadow-2xl flex items-center justify-between hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
             <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-white/10 dark:bg-slate-900/10 rounded-xl flex items-center justify-center">
                     <ShoppingBag className="w-5 h-5" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-slate-900 dark:border-white">
                    {cartItemCount}
                  </span>
                </div>
                <div className="flex flex-col items-start text-left">
                   <span className="text-xs font-medium opacity-70">Total Belanja</span>
                   <span className="text-base font-black">{formatRupiah(cartTotal)}</span>
                </div>
             </div>
             <div className="w-10 h-10 bg-white/10 dark:bg-slate-900/10 rounded-xl flex items-center justify-center">
               <ChevronRight className="w-5 h-5" />
             </div>
          </button>
        </motion.div>
      )}

      {/* Cart Drawer / Modal */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsCartOpen(false)}
               className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]"
            />
            <motion.div 
               initial={{ x: '100%' }}
               animate={{ x: 0 }}
               exit={{ x: '100%' }}
               transition={{ type: 'spring', damping: 25, stiffness: 200 }}
               className="fixed top-0 right-0 h-full w-full md:w-[480px] bg-white dark:bg-slate-900 z-[100] shadow-2xl flex flex-col"
            >
               <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                    <ShoppingBag className="w-6 h-6 text-[#1799dc]" />
                    Keranjang Kebaikan
                  </h2>
                  <button onClick={() => setIsCartOpen(false)} className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
                     <X className="w-5 h-5" />
                  </button>
               </div>

               <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
                 {cart.length === 0 ? (
                   <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                     <ShoppingBag className="w-16 h-16 mb-4 text-slate-300" />
                     <p className="font-bold text-slate-500">Keranjang masih kosong</p>
                   </div>
                 ) : (
                   <div className="space-y-6">
                     {cart.map(item => (
                       <div key={item.id} className="flex gap-4 items-center">
                         <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 bg-slate-100">
                           <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                         </div>
                         <div className="flex-1 min-w-0">
                           <h4 className="font-bold text-sm text-slate-800 dark:text-white truncate">{item.name}</h4>
                           <p className="text-xs text-slate-400 mb-2">{formatRupiah(item.price)} / pcs</p>
                           <div className="flex items-center gap-4">
                             <div className="flex items-center bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                               <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 flex items-center justify-center font-bold text-slate-500">-</button>
                               <span className="w-8 text-center text-xs font-bold text-slate-800 dark:text-white">{item.quantity}</span>
                               <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 flex items-center justify-center font-bold text-slate-500">+</button>
                             </div>
                             <span className="text-sm font-black text-[#1799dc]">{formatRupiah(item.price * item.quantity)}</span>
                           </div>
                         </div>
                       </div>
                     ))}
                   </div>
                 )}
               </div>

               {cart.length > 0 && (
                 <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                   <div className="flex justify-between items-center mb-6">
                     <span className="text-slate-500 font-medium">Subtotal ({cartItemCount} barang)</span>
                     <span className="text-xl font-black text-slate-800 dark:text-white">{formatRupiah(cartTotal)}</span>
                   </div>
                   <button 
                     onClick={() => {
                        setIsCartOpen(false);
                        setIsCheckoutOpen(true);
                     }}
                     className="w-full h-14 bg-[#1799dc] hover:bg-[#1588c4] text-white rounded-2xl font-black text-lg transition-all active:scale-[0.98] shadow-lg shadow-blue-500/20"
                   >
                     Checkout
                   </button>
                 </div>
               )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Checkout Modal - Inspired by Donation Flow */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsCheckoutOpen(false)}
               className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-all duration-300"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative z-10 flex flex-col max-h-[95vh] md:max-h-[90vh] transition-colors duration-300"
            >
              <div className="p-4 md:p-6 flex-1 overflow-y-auto">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white mb-1">Pengiriman & Pembayaran</h3>
                    <p className="text-[10px] md:text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Bantu Saudara di Pelosok
                    </p>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => { setIsCheckoutOpen(false); setIsCartOpen(true); }}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all shrink-0 -mt-2 -mr-2 absolute right-4 top-4"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>

                <form id="checkout-form" onSubmit={handleCheckoutSubmit} className="flex flex-col gap-3 md:gap-5">
                  {/* Shipping Info */}
                  <div className="space-y-3">
                     <label className="flex items-center gap-2 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">
                       <MapPin className="w-3.5 h-3.5 text-primary-500" />
                       Alamat Pengiriman
                     </label>
                     <div className="grid grid-cols-1 gap-3">
                       <div className="space-y-1">
                         <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Nama Lengkap</label>
                         <input required type="text" value={checkoutForm.name} onChange={e => setCheckoutForm({...checkoutForm, name: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm font-medium transition-all" placeholder="Misal: Budi Santoso" />
                       </div>
                       <div className="space-y-1">
                         <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">No. WhatsApp</label>
                         <input required type="tel" value={checkoutForm.phone} onChange={e => setCheckoutForm({...checkoutForm, phone: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm font-medium transition-all" placeholder="08123456789" />
                       </div>
                     </div>
                     <div className="space-y-1">
                       <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Kota / Kabupaten (API Ongkir)</label>
                       <div className="relative">
                         <select 
                           value={checkoutForm.city} 
                           onChange={e => setCheckoutForm({...checkoutForm, city: e.target.value})} 
                           className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm font-medium transition-all appearance-none"
                         >
                           {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                         </select>
                         <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
                       </div>
                     </div>
                     <div className="space-y-1">
                       <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Alamat Lengkap</label>
                       <textarea required rows={3} value={checkoutForm.address} onChange={e => setCheckoutForm({...checkoutForm, address: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm font-medium transition-all resize-none" placeholder="Nama Jalan, RT/RW, Patokan..." />
                     </div>
                  </div>

                  {/* Order Summary & Shipping Detail */}
                  <div className="bg-primary-50 dark:bg-primary-900/10 rounded-2xl p-4 border border-primary-100 dark:border-primary-800/30">
                     <div className="flex items-center gap-2 mb-3">
                       <Truck className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                       <h3 className="font-bold text-[13px] text-slate-800 dark:text-slate-200">Detail Pesanan & Ongkir</h3>
                     </div>
                     <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400 mb-2">
                       <span>Total Belanja ({cartItemCount} barang)</span>
                       <span className="font-medium text-slate-800 dark:text-slate-300">{formatRupiah(cartTotal)}</span>
                     </div>
                     <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400 mb-3 items-center">
                       <div className="flex items-center gap-1.5">
                         <span>Ongkos Kirim</span>
                         <span className="text-[9px] bg-white/60 dark:bg-slate-800/60 px-1.5 py-0.5 rounded uppercase font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">{checkoutForm.city}</span>
                       </div>
                       <span className="font-medium text-slate-800 dark:text-slate-300">
                         {shippingCost === 0 ? <span className="animate-pulse">Menghitung...</span> : formatRupiah(shippingCost)}
                       </span>
                     </div>
                     <div className="border-t border-primary-200/50 dark:border-primary-800/50 pt-3 flex justify-between items-center">
                       <span className="font-bold text-[13px] text-slate-800 dark:text-slate-200">Total Pembayaran</span>
                       <span className="text-lg font-black text-primary-600 dark:text-primary-400">{formatRupiah(cartTotal + shippingCost)}</span>
                     </div>
                  </div>

                  {/* Payment Method */}
                  <div className="relative z-40 space-y-2 mt-2">
                     <div className="flex justify-between items-center mb-2 gap-2">
                       <label className="block text-[10px] md:text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.15em] px-1 opacity-80 shrink-0">
                         Metode Pembayaran
                       </label>
                     </div>
                     <div className="grid grid-cols-2 gap-2">
                       {[
                         { id: 'qris', label: 'QRIS', icon: Smartphone },
                         { id: 'gopay', label: 'GoPay', icon: Wallet },
                         { id: 'bca_va', label: 'BCA VA', icon: CreditCard },
                         { id: 'mandiri_va', label: 'Mandiri VA', icon: CreditCard },
                       ].map(method => (
                         <label key={method.id} className={`cursor-pointer rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 transition-all outline outline-1 outline-offset-[-1px] ${checkoutForm.paymentMethod === method.id ? 'outline-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-[0_0_0_1px_rgba(23,153,220,1)]' : 'outline-slate-200 dark:outline-slate-700 bg-white dark:bg-slate-800 hover:outline-primary-200'}`}>
                           <input type="radio" className="hidden" name="paymentMethod" value={method.id} checked={checkoutForm.paymentMethod === method.id} onChange={(e) => setCheckoutForm({...checkoutForm, paymentMethod: e.target.value})} />
                           <method.icon className={`w-5 h-5 ${checkoutForm.paymentMethod === method.id ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400'}`} />
                           <span className={`text-[10px] font-bold text-center ${checkoutForm.paymentMethod === method.id ? 'text-primary-700 dark:text-primary-400' : 'text-slate-600 dark:text-slate-400'}`}>{method.label}</span>
                         </label>
                       ))}
                     </div>
                  </div>
                  
                  <div className="mt-4 pb-2">
                    <motion.button 
                      whileTap={{ scale: 0.95 }}
                      whileHover={{ scale: 1.02 }}
                      form="checkout-form"
                      type="submit"
                      disabled={shippingCost === 0 || !checkoutForm.name || !checkoutForm.address || !checkoutForm.phone}
                      className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-extrabold py-3.5 rounded-xl shadow-xl shadow-primary-500/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-base"
                    >
                      <ShieldCheck className="w-5 h-5" />
                      Lanjutkan Pembayaran
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {isPaymentSuccess && (
          <div className="fixed inset-0 flex items-center justify-center z-[100] p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-all duration-300" />
             <motion.div
               initial={{ scale: 0.95, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.95, opacity: 0, y: 20 }}
               className="bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl shadow-2xl w-full max-w-md p-6 relative z-10 flex flex-col items-center text-center max-h-[95vh] overflow-y-auto"
             >
                <div className="relative mb-5 mt-4">
                  <motion.div
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                    className="w-20 h-20 bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 shadow-xl shadow-emerald-500/40 text-white rounded-full flex items-center justify-center relative z-10 mx-auto"
                  >
                    <CheckCircle className="w-10 h-10" />
                  </motion.div>
                  <motion.div
                    animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 bg-emerald-400/20 rounded-full z-0 blur-md"
                  />
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 border-[3px] border-dashed border-emerald-300 dark:border-emerald-800/60 rounded-full z-0"
                  />
                </div>

                <h4 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mb-1 leading-tight">Alhamdulillah!</h4>
                <p className="text-slate-800 dark:text-white font-bold text-lg mb-6">Pemesanan Berhasil</p>

                <div className="w-full bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-4 mb-5 border border-slate-100 dark:border-slate-700 relative overflow-hidden text-left">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[11px] md:text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">
                      Total Pesanan
                    </span>
                    <span className="text-[10px] md:text-[11px] text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-md uppercase tracking-widest gap-1 flex items-center">
                      <CheckCircle className="w-3 h-3" /> Berhasil
                    </span>
                  </div>
                  <div className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-2">
                    {formatRupiah(cartTotal + shippingCost)}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                    Terima kasih atas kepedulian Anda. Pesanan akan segera diproses dan kebaikan Anda tersalurkan ke para perajin UMKM & Da'i.
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-600 flex justify-between items-center font-mono text-[10px] md:text-xs text-slate-400 dark:text-slate-500">
                    <span>Reference ID</span>
                    <span className="font-bold text-slate-600 dark:text-slate-300">
                      #{Math.floor(Math.random() * 100000000).toString().padStart(8, "0")}
                    </span>
                  </div>
                </div>

                <button 
                  onClick={() => setIsPaymentSuccess(false)} 
                  className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-extrabold py-3.5 rounded-xl transition-all shadow-lg shadow-primary-500/30 hover:shadow-xl hover:-translate-y-0.5"
                >
                  Belanja Kembali
                </button>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
