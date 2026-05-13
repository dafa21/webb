import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Book, ArrowLeft, Search, Bookmark, AlignRight, FileText, ChevronRight, PlayCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function QuranPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'quran' | 'hadits'>('quran');

    // Quran State
    const [surahs, setSurahs] = useState<any[]>([]);
    const [searchSurah, setSearchSurah] = useState('');
    const [loadingSurahs, setLoadingSurahs] = useState(true);
    
    const [selectedSurah, setSelectedSurah] = useState<any | null>(null);
    const [surahDetail, setSurahDetail] = useState<any | null>(null);
    const [loadingSurahDetail, setLoadingSurahDetail] = useState(false);

    // Hadits State
    const [books, setBooks] = useState<any[]>([]);
    const [loadingBooks, setLoadingBooks] = useState(true);
    const [searchBook, setSearchBook] = useState('');

    const [selectedBook, setSelectedBook] = useState<any | null>(null);
    const [hadiths, setHadiths] = useState<any[]>([]);
    const [loadingHadiths, setLoadingHadiths] = useState(false);
    const [hadithPage, setHadithPage] = useState(1);
    const [searchHadithText, setSearchHadithText] = useState('');

    // Fetch Surahs
    useEffect(() => {
        if (activeTab === 'quran' && surahs.length === 0) {
            setLoadingSurahs(true);
            fetch('https://equran.id/api/v2/surat')
                .then(res => res.json())
                .then(data => {
                    if (data.code === 200) {
                        setSurahs(data.data);
                    }
                })
                .catch(console.error)
                .finally(() => setLoadingSurahs(false));
        }
    }, [activeTab]);

    // Fetch Hadith Books
    useEffect(() => {
        if (activeTab === 'hadits' && books.length === 0) {
            setLoadingBooks(true);
            fetch('https://api.hadith.gading.dev/books')
                .then(res => res.json())
                .then(data => {
                    if (data.code === 200) {
                        setBooks(data.data);
                    }
                })
                .catch(console.error)
                .finally(() => setLoadingBooks(false));
        }
    }, [activeTab]);

    const handleSelectSurah = (surah: any) => {
        setSelectedSurah(surah);
        setLoadingSurahDetail(true);
        
        Promise.all([
            fetch(`https://equran.id/api/v2/surat/${surah.nomor}`).then(res => res.json()),
            fetch(`https://api.quran.com/api/v4/verses/by_chapter/${surah.nomor}?fields=text_uthmani_tajweed&per_page=300`).then(res => res.json())
        ])
        .then(([equranData, quranComData]) => {
            if (equranData.code === 200) {
                // Merge tajweed into equran data
                const mergedAyahs = equranData.data.ayat.map((ayah: any, index: number) => {
                    const tajweedVerse = quranComData.verses?.find((v: any) => v.verse_number === ayah.nomorAyat);
                    return {
                        ...ayah,
                        teksTajweed: tajweedVerse?.text_uthmani_tajweed
                    };
                });
                setSurahDetail({
                    ...equranData.data,
                    ayat: mergedAyahs
                });
            }
        })
        .catch(console.error)
        .finally(() => setLoadingSurahDetail(false));
    };

    const [playingAudio, setPlayingAudio] = useState<string | null>(null);

    const toggleAudio = (audioUrl: string) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        if (playingAudio === audioUrl) {
            setPlayingAudio(null);
            const audioEl = document.getElementById('quran-audio') as HTMLAudioElement;
            if (audioEl) audioEl.pause();
        } else {
            setPlayingAudio(audioUrl);
            setTimeout(() => {
                const audioEl = document.getElementById('quran-audio') as HTMLAudioElement;
                if (audioEl) {
                    audioEl.src = audioUrl;
                    audioEl.play().catch(console.error);
                    audioEl.onended = () => setPlayingAudio(null);
                }
            }, 50);
        }
    };

    const toggleHadithAudio = (text: string, id: number, lang: 'ar-SA' | 'id-ID' = 'ar-SA') => {
        const audioEl = document.getElementById('quran-audio') as HTMLAudioElement;
        if (audioEl) audioEl.pause();
        
        if (!('speechSynthesis' in window)) {
            alert('Fitur suara tidak didukung di browser ini.');
            return;
        }
        
        window.speechSynthesis.cancel();
        
        const audioId = `hadith-${id}-${lang}`;
        if (playingAudio === audioId) {
            setPlayingAudio(null);
            return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.onend = () => setPlayingAudio(null);
        utterance.onerror = () => setPlayingAudio(null);
        
        setPlayingAudio(audioId);
        window.speechSynthesis.speak(utterance);
    };

    // Cleanup audio on unmount
    useEffect(() => {
        return () => {
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    const handleSelectBook = (book: any) => {
        setSelectedBook(book);
        setHadithPage(1);
        setSearchHadithText('');
        fetchHadiths(book.id, 1);
    };

    const fetchHadiths = (bookId: string, page: number) => {
        setLoadingHadiths(true);
        const rangeStart = (page - 1) * 50 + 1;
        const rangeEnd = page * 50;
        fetch(`https://api.hadith.gading.dev/books/${bookId}?range=${rangeStart}-${rangeEnd}`)
            .then(res => res.json())
            .then(data => {
                if (data.code === 200) {
                    setHadiths(data.data.hadiths);
                }
            })
            .catch(console.error)
            .finally(() => setLoadingHadiths(false));
    };

    const filteredSurahs = surahs.filter(s => 
        s.namaLatin.toLowerCase().includes(searchSurah.toLowerCase()) || 
        s.arti.toLowerCase().includes(searchSurah.toLowerCase())
    );

    const filteredBooks = books.filter(b => 
        b.name.toLowerCase().includes(searchBook.toLowerCase())
    );

    const filteredHadiths = hadiths.filter(h => 
        h.id.toLowerCase().includes(searchHadithText.toLowerCase()) || 
        h.arab.includes(searchHadithText)
    );

    return (
        <div className="pt-20 md:pt-28 pb-16 min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
            <div className="max-w-4xl mx-auto px-4">
                
                {/* Header */}
                {!selectedSurah && !selectedBook && (
                    <div className="mb-8 text-center pt-4">
                        <div className="w-16 h-16 mx-auto bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-2xl flex items-center justify-center mb-4">
                            <BookOpen className="w-8 h-8" />
                        </div>
                        <h1 className="text-3xl font-extrabold text-[#1799dc] mb-3">Qur'an & Hadits</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base">Membaca dan merenungkan ayat suci serta riwayat nabi.</p>
                        
                        <div className="flex justify-center mt-6">
                            <div className="flex bg-white dark:bg-slate-800 rounded-full p-1 shadow-sm border border-slate-200 dark:border-slate-700">
                                <button 
                                    onClick={() => setActiveTab('quran')}
                                    className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${activeTab === 'quran' ? 'bg-[#1799dc] text-white shadow-md' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                                >
                                    Al-Qur'an
                                </button>
                                <button 
                                    onClick={() => setActiveTab('hadits')}
                                    className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${activeTab === 'hadits' ? 'bg-[#1799dc] text-white shadow-md' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                                >
                                    Hadits
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Content Area */}
                <div className="mt-8">
                    
                    {/* QURAN TAB */}
                    {activeTab === 'quran' && !selectedSurah && (
                        <div>
                            <div className="relative max-w-md mx-auto mb-8">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input 
                                    type="text" 
                                    placeholder="Cari Surah (cth: Yasin, Al-Mulk)..."
                                    value={searchSurah}
                                    onChange={(e) => setSearchSurah(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-[#1799dc]/50 outline-none transition-shadow block"
                                />
                            </div>

                            {loadingSurahs ? (
                                <div className="flex justify-center items-center py-20">
                                    <Loader2 className="w-8 h-8 animate-spin text-[#1799dc]" />
                                </div>
                            ) : (
                                <div className="grid md:grid-cols-2 gap-4">
                                    {filteredSurahs.map(surah => (
                                        <button 
                                            key={surah.nomor}
                                            onClick={() => handleSelectSurah(surah)}
                                            className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm hover:shadow-md border border-slate-100 dark:border-slate-700 flex items-center justify-between text-left transition-all hover:border-[#1799dc]/30 group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-slate-50 dark:bg-slate-700/50 rounded-xl flex items-center justify-center font-bold text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-600 group-hover:bg-[#1799dc] group-hover:text-white transition-colors">
                                                    {surah.nomor}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg group-hover:text-[#1799dc] transition-colors">{surah.namaLatin}</h3>
                                                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{surah.arti} &middot; {surah.jumlahAyat} Ayat</p>
                                                </div>
                                            </div>
                                            <div className="text-xl font-arabic text-[#1799dc] font-bold">
                                                {surah.nama}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* SURAH DETAIL VIEW */}
                    {activeTab === 'quran' && selectedSurah && (
                        <div>
                            <button 
                                onClick={() => { setSelectedSurah(null); setSurahDetail(null); }}
                                className="flex items-center gap-2 text-slate-500 hover:text-[#1799dc] mb-6 font-bold"
                            >
                                <ArrowLeft className="w-5 h-5" /> Kembali
                            </button>
                            
                            <div className="bg-gradient-to-br from-[#1799dc] to-[#2db2f5] rounded-3xl p-6 md:p-10 text-white shadow-xl shadow-[#1799dc]/20 mb-8 text-center relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-2xl"></div>
                                <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/10 rounded-full -ml-20 -mb-20 blur-xl"></div>
                                
                                <h2 className="text-4xl md:text-5xl font-arabic font-bold mb-4 relative z-10">{selectedSurah.nama}</h2>
                                <h1 className="text-2xl md:text-3xl font-extrabold mb-2 relative z-10">{selectedSurah.namaLatin}</h1>
                                <p className="opacity-90 font-medium tracking-wide uppercase text-sm relative z-10">{selectedSurah.arti} &middot; {selectedSurah.jumlahAyat} Ayat &middot; {selectedSurah.tempatTurun}</p>
                            </div>

                            <div className="mb-8 flex flex-wrap gap-2 md:gap-3 justify-center text-[10px] md:text-xs font-medium">
                                <span className="px-2 md:px-3 py-1 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm"><span className="text-[#8b5cf6] text-lg md:text-xl leading-none px-0.5 relative top-0.5 md:top-1">•</span> Madd (Panjang)</span>
                                <span className="px-2 md:px-3 py-1 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm"><span className="text-[#ec4899] text-lg md:text-xl leading-none px-0.5 relative top-0.5 md:top-1">•</span> Ghunnah (Dengung)</span>
                                <span className="px-2 md:px-3 py-1 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm"><span className="text-[#22c55e] text-lg md:text-xl leading-none px-0.5 relative top-0.5 md:top-1">•</span> Ikhfa</span>
                                <span className="px-2 md:px-3 py-1 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm"><span className="text-[#3b82f6] text-lg md:text-xl leading-none px-0.5 relative top-0.5 md:top-1">•</span> Iqlab</span>
                                <span className="px-2 md:px-3 py-1 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm"><span className="text-[#f59e0b] text-lg md:text-xl leading-none px-0.5 relative top-0.5 md:top-1">•</span> Idgham Bighunnah</span>
                                <span className="px-2 md:px-3 py-1 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm"><span className="text-[#94a3b8] text-lg md:text-xl leading-none px-0.5 relative top-0.5 md:top-1">•</span> Idgham Bilaghunnah</span>
                                <span className="px-2 md:px-3 py-1 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm"><span className="text-slate-800 dark:text-slate-100 text-lg md:text-xl leading-none px-0.5 relative top-0.5 md:top-1">•</span> Idzhar (Hitam)</span>
                                <span className="px-2 md:px-3 py-1 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm"><span className="text-[#ef4444] text-lg md:text-xl leading-none px-0.5 relative top-0.5 md:top-1">•</span> Qalqalah</span>
                            </div>

                            {loadingSurahDetail ? (
                                <div className="flex justify-center items-center py-20">
                                    <Loader2 className="w-8 h-8 animate-spin text-[#1799dc]" />
                                </div>
                            ) : surahDetail ? (
                                <div className="space-y-8">
                                    <audio id="quran-audio" className="hidden" />
                                    {surahDetail.ayat.map((ayah: any) => (
                                        <div key={ayah.nomorAyat} className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 relative transition-colors duration-300">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="flex flex-col gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-500">
                                                        {ayah.nomorAyat}
                                                    </div>
                                                    <button 
                                                        onClick={() => toggleAudio(ayah.audio["05"])}
                                                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${playingAudio === ayah.audio["05"] ? 'bg-[#1799dc] text-white shadow-md shadow-[#1799dc]/20' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-[#1799dc] hover:bg-slate-200 dark:hover:bg-slate-600'}`}
                                                    >
                                                        {playingAudio === ayah.audio["05"] ? <span className="w-3 h-3 bg-white rounded-sm"></span> : <PlayCircle className="w-5 h-5 ml-0.5" />}
                                                    </button>
                                                </div>
                                                <div className="flex-1 ml-6 text-right">
                                                    {ayah.teksTajweed ? (
                                                        <p 
                                                            className="font-arabic text-4xl md:text-[2.75rem] leading-[2.5] md:leading-[2.75] text-slate-800 dark:text-slate-100" 
                                                            dangerouslySetInnerHTML={{ __html: ayah.teksTajweed }} 
                                                            dir="rtl"
                                                        />
                                                    ) : (
                                                        <p className="font-arabic text-4xl md:text-[2.75rem] leading-[2.5] md:leading-[2.75] text-slate-800 dark:text-slate-100" dir="rtl">{ayah.teksArab}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="border-t border-slate-100 dark:border-slate-700/50 pt-4 mt-6">
                                                <p className="text-sm font-medium text-primary-600 dark:text-primary-400 mb-2">{ayah.teksLatin}</p>
                                                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm md:text-base">{ayah.teksIndonesia}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : null}
                        </div>
                    )}


                    {/* HADITS TAB */}
                    {activeTab === 'hadits' && !selectedBook && (
                        <div>
                            {loadingBooks ? (
                                <div className="flex justify-center items-center py-20">
                                    <Loader2 className="w-8 h-8 animate-spin text-[#1799dc]" />
                                </div>
                            ) : (
                                <div className="grid md:grid-cols-3 gap-4">
                                    {books.map(book => (
                                        <button 
                                            key={book.id}
                                            onClick={() => handleSelectBook(book)}
                                            className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm hover:shadow-md border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center text-center transition-all hover:border-[#1799dc]/30 group"
                                        >
                                            <div className="w-16 h-16 bg-[#1799dc]/10 rounded-full flex items-center justify-center text-[#1799dc] mb-4 group-hover:scale-110 transition-transform">
                                                <Book className="w-8 h-8" />
                                            </div>
                                            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg mb-1">{book.name}</h3>
                                            <p className="text-xs text-slate-500 font-medium bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full">{book.available} Hadits</p>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* HADITH DETAIL VIEW */}
                    {activeTab === 'hadits' && selectedBook && (
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <button 
                                    onClick={() => { setSelectedBook(null); setHadiths([]); }}
                                    className="flex items-center gap-2 text-slate-500 hover:text-[#1799dc] font-bold"
                                >
                                    <ArrowLeft className="w-5 h-5" /> Kembali
                                </button>
                                <h2 className="text-xl font-bold border-b-2 border-[#1799dc] pb-1 pr-4">{selectedBook.name}</h2>
                            </div>

                            <div className="relative w-full mb-8">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input 
                                    type="text" 
                                    placeholder={`Cari dalam ${selectedBook.name} (halaman ini)...`}
                                    value={searchHadithText}
                                    onChange={(e) => setSearchHadithText(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-[#1799dc]/50 outline-none transition-shadow block"
                                />
                            </div>

                            {loadingHadiths ? (
                                <div className="flex justify-center items-center py-20">
                                    <Loader2 className="w-8 h-8 animate-spin text-[#1799dc]" />
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {filteredHadiths.map((hadith) => (
                                        <div key={hadith.number} className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
                                            <div className="flex items-center justify-between gap-3 mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
                                                <div className="flex flex-col">
                                                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">{selectedBook.name}</h3>
                                                    <div className="text-primary-600 dark:text-primary-400 font-semibold text-sm">
                                                        Hadits #{hadith.number}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button 
                                                        onClick={() => toggleHadithAudio(hadith.arab, hadith.number, 'ar-SA')}
                                                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${playingAudio === 'hadith-' + hadith.number + '-ar-SA' ? 'bg-[#1799dc] text-white shadow-md shadow-[#1799dc]/20' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-[#1799dc] hover:bg-slate-200 dark:hover:bg-slate-600'}`}
                                                        title="Putar Audio Arab"
                                                    >
                                                        {playingAudio === 'hadith-' + hadith.number + '-ar-SA' ? <span className="w-3 h-3 bg-white rounded-sm"></span> : <PlayCircle className="w-5 h-5 ml-0.5" />}
                                                    </button>
                                                    <button 
                                                        onClick={() => toggleHadithAudio(hadith.id, hadith.number, 'id-ID')}
                                                        className={`px-3 h-10 rounded-full flex items-center justify-center gap-2 transition-colors text-xs font-bold ${playingAudio === 'hadith-' + hadith.number + '-id-ID' ? 'bg-[#1799dc] text-white shadow-md shadow-[#1799dc]/20' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-[#1799dc] hover:bg-slate-200 dark:hover:bg-slate-600'}`}
                                                        title="Dengarkan Terjemahan"
                                                    >
                                                        {playingAudio === 'hadith-' + hadith.number + '-id-ID' ? <span className="w-2.5 h-2.5 bg-white rounded-sm"></span> : <FileText className="w-4 h-4" />}
                                                        {playingAudio === 'hadith-' + hadith.number + '-id-ID' ? 'Berhenti' : 'Terjemahan'}
                                                    </button>
                                                </div>
                                            </div>
                                            <p 
                                                onClick={() => toggleHadithAudio(hadith.arab, hadith.number, 'ar-SA')}
                                                className="font-arabic text-3xl md:text-[2.5rem] leading-[2.5] md:leading-[2.5] text-slate-800 dark:text-slate-100 text-right mb-6 cursor-pointer hover:text-[#1799dc] transition-colors" 
                                                dir="rtl"
                                                title="Klik untuk memutar audio Arab"
                                            >
                                                {hadith.arab}
                                            </p>
                                            <div className="relative pl-6 border-l-4 border-slate-100 dark:border-slate-700">
                                                <p className="text-slate-700 dark:text-slate-300 leading-loose md:text-lg italic font-medium whitespace-pre-line">
                                                    {hadith.id.split(/(\[[^\]]+\])/).map((part: string, i: number) => {
                                                        if (part.startsWith('[') && part.endsWith(']')) {
                                                            return <span key={i} className="text-[#1799dc] dark:text-[#2db2f5] not-italic font-bold">{part}</span>;
                                                        }
                                                        return part;
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    ))}

                                    {filteredHadiths.length === 0 && hadiths.length > 0 && (
                                        <div className="text-center py-10 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                                            Tidak ada hadits yang cocok dengan pencarian Anda di halaman ini. <br/> Coba kata kunci lain atau beralih ke halaman selanjutnya.
                                        </div>
                                    )}

                                    <div className="flex justify-center gap-4 mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
                                        <button 
                                            disabled={hadithPage === 1}
                                            onClick={() => {
                                                const newPage = hadithPage - 1;
                                                setHadithPage(newPage);
                                                fetchHadiths(selectedBook.id, newPage);
                                                window.scrollTo(0, 0);
                                            }}
                                            className="px-6 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold disabled:opacity-50"
                                        >
                                            Sebelumnya
                                        </button>
                                        <div className="flex items-center font-bold px-4">
                                            Hal {hadithPage}
                                        </div>
                                        <button 
                                            onClick={() => {
                                                const newPage = hadithPage + 1;
                                                setHadithPage(newPage);
                                                fetchHadiths(selectedBook.id, newPage);
                                                window.scrollTo(0, 0);
                                            }}
                                            className="px-6 py-2 bg-[#1799dc] text-white rounded-xl font-bold shadow-md shadow-[#1799dc]/20"
                                        >
                                            Selanjutnya
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
