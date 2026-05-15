import React, { useState } from 'react';
import { makhrajData, MakhrajDetail } from '../data/makhrajData';
import { Wind, Activity, MessageCircle, Smile, Box, ChevronRight, Volume2, Search, ArrowLeft } from 'lucide-react';

export default function MakhrajPage() {
    const [selectedMakhraj, setSelectedMakhraj] = useState<MakhrajDetail | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const iconMap: Record<string, React.ReactNode> = {
        Wind: <Wind className="w-6 h-6" />,
        Activity: <Activity className="w-6 h-6" />,
        MessageCircle: <MessageCircle className="w-6 h-6" />,
        Smile: <Smile className="w-6 h-6" />,
        Box: <Box className="w-6 h-6" />
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value.toLowerCase());
    };

    const filteredMakhraj = makhrajData.filter(m => 
        m.name.toLowerCase().includes(searchQuery) ||
        m.arabicName.includes(searchQuery) ||
        m.letters.some(l => l.includes(searchQuery))
    );

    if (selectedMakhraj) {
        return (
            <div className="animate-fade-in pb-12">
                <button 
                    onClick={() => setSelectedMakhraj(null)}
                    className="flex items-center gap-2 text-slate-500 hover:text-[#1799dc] transition-colors mb-6 font-bold"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Kembali ke Daftar Makhraj
                </button>

                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden isolate relative">
                    <div className="h-48 md:h-64 relative">
                        <img 
                            src={selectedMakhraj.imageUrl} 
                            alt={selectedMakhraj.name} 
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
                        <div className="absolute bottom-6 left-6 md:left-10 right-6 flex items-end justify-between">
                            <div>
                                <h2 className="text-3xl md:text-5xl font-black text-white mb-2">{selectedMakhraj.name}</h2>
                                <p className="text-lg text-slate-200 font-medium">{selectedMakhraj.shortDesc}</p>
                            </div>
                            <h3 className="font-arabic text-4xl md:text-6xl text-white opacity-90">{selectedMakhraj.arabicName}</h3>
                        </div>
                    </div>

                    <div className="p-6 md:p-10">
                        <div className="prose prose-slate dark:prose-invert max-w-none mb-10">
                            <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-300">
                                {selectedMakhraj.description}
                            </p>
                        </div>

                        <div className="mb-8">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-lg bg-[#1799dc]/10 text-[#1799dc] flex items-center justify-center">
                                    <MessageCircle className="w-5 h-5" />
                                </span>
                                Huruf-huruf di {selectedMakhraj.name}
                            </h3>
                            <div className="flex flex-wrap gap-3">
                                {selectedMakhraj.letters.map((letter, idx) => (
                                    <div key={idx} className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-sm">
                                        <span className="font-arabic text-3xl text-[#1799dc]">{letter}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {selectedMakhraj.parts && selectedMakhraj.parts.length > 0 && (
                            <div>
                                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-lg bg-[#1799dc]/10 text-[#1799dc] flex items-center justify-center">
                                        <Activity className="w-5 h-5" />
                                    </span>
                                    Rincian Titik Artikulasi
                                </h3>
                                <div className="space-y-4">
                                    {selectedMakhraj.parts.map((part, idx) => (
                                        <div key={idx} className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/50 flex flex-col md:flex-row gap-6 md:items-center">
                                            <div className="flex-1">
                                                <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">{part.name}</h4>
                                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{part.desc}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                {part.letters.map((letter, lIdx) => (
                                                    <div key={lIdx} className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-sm">
                                                        <span className="font-arabic text-2xl text-emerald-600 dark:text-emerald-400">{letter}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="pb-12 animate-fade-in relative">
            <div className="text-center max-w-2xl mx-auto mb-10 mt-6 relative z-10">
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-4">
                    Belajar <span className="text-[#1799dc]">Makharijul Huruf</span>
                </h2>
                <p className="text-slate-600 dark:text-slate-300">
                    Memahami titik keluarnya suara huruf hijaiyah demi kesempurnaan bacaan Al-Qur'an (Tajwid).
                </p>
                
                <div className="mt-8 relative max-w-md mx-auto">
                    <input 
                        type="text" 
                        placeholder="Cari huruf atau makhraj..."
                        value={searchQuery}
                        onChange={handleSearch}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full py-3 pl-12 pr-4 shadow-sm focus:ring-2 focus:ring-[#1799dc] focus:border-transparent transition-all outline-none"
                    />
                    <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                {filteredMakhraj.map((item) => (
                    <button 
                        key={item.id}
                        onClick={() => setSelectedMakhraj(item)}
                        className="bg-white dark:bg-slate-800 rounded-3xl p-6 text-left shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-xl hover:-translate-y-1 hover:border-[#1799dc]/30 transition-all duration-300 group flex flex-col"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-[#1799dc]/10 text-[#1799dc] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                {iconMap[item.icon || '']}
                            </div>
                            <span className="font-arabic text-3xl text-slate-300 dark:text-slate-600 group-hover:text-[#1799dc]/20 transition-colors">
                                {item.arabicName}
                            </span>
                        </div>
                        
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1 group-hover:text-[#1799dc] transition-colors">{item.name}</h3>
                        <p className="text-sm font-semibold text-[#1799dc] mb-3">{item.shortDesc}</p>
                        
                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-6 flex-1">
                            {item.description}
                        </p>

                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 dark:border-slate-700">
                            <div className="flex -space-x-2">
                                {item.letters.slice(0, 4).map((l, i) => (
                                    <div key={i} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 border-2 border-white dark:border-slate-800 flex items-center justify-center">
                                        <span className="text-xs font-arabic text-slate-700 dark:text-slate-200">{l}</span>
                                    </div>
                                ))}
                                {item.letters.length > 4 && (
                                    <div className="w-8 h-8 rounded-full bg-[#1799dc] border-2 border-white dark:border-slate-800 flex items-center justify-center">
                                        <span className="text-[10px] font-bold text-white">+{item.letters.length - 4}</span>
                                    </div>
                                )}
                            </div>
                            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-50 dark:bg-slate-900 group-hover:bg-[#1799dc] group-hover:text-white text-slate-400 transition-colors">
                                <ChevronRight className="w-4 h-4" />
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            {filteredMakhraj.length === 0 && (
                <div className="text-center py-20 relative z-10">
                    <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                        <Search className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">Makhraj tidak ditemukan</h3>
                    <p className="text-slate-500 dark:text-slate-400">Coba cari dengan huruf atau nama makhraj yang lain.</p>
                </div>
            )}
        </div>
    );
}
