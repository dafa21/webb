import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Book, ArrowLeft, Search, Bookmark, AlignRight, FileText, ChevronRight, PlayCircle, Loader2, Mic, Square, Activity, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GoogleGenerativeAI } from '@google/generative-ai';

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

    // Talaqqi AI State
    const [recordingAyah, setRecordingAyah] = useState<number | null>(null);
    const [evaluatingAyah, setEvaluatingAyah] = useState<number | null>(null);
    const [evaluationResults, setEvaluationResults] = useState<{ [key: number]: string }>({});
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

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

        // Resume if paused
        if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
        }

        setTimeout(() => {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = lang;
            
            // Try to find a voice that matches the language
            const voices = window.speechSynthesis.getVoices();
            let voice = voices.find(v => v.lang === lang); // Exact match
            if (!voice) {
                voice = voices.find(v => v.lang.startsWith(lang.split('-')[0])); // Language match
            }
            
            if (voice) {
                utterance.voice = voice;
            }

            utterance.pitch = 1;
            utterance.rate = 0.9; // Slightly slower for better clarity
            
            utterance.onend = () => setPlayingAudio(null);
            utterance.onerror = (event) => {
                console.error('SpeechSynthesis Error:', event);
                setPlayingAudio(null);
            };
            
            setPlayingAudio(audioId);
            window.speechSynthesis.speak(utterance);
        }, 100);
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

    const getHadithTitle = (text: string) => {
        const markers = ["bersabda:", "berkata:", "bertanya:", "bahwa:", "bahwasanya", "menceritakan:"];
        let content = text;
        
        for (const marker of markers) {
            const index = text.indexOf(marker);
            if (index !== -1) {
                content = text.substring(index + marker.length).trim();
                break;
            }
        }
        
        // Clean up quotes, brackets and specific markers
        content = content.replace(/^["'\[\(\s\d]+|["'\]\)\s]+$/g, '');
        
        // Take first 7-9 words
        const words = content.split(/\s+/);
        if (words.length > 0 && words[0].length < 3) {
             // skip very short words like "Ia"
             const title = words.slice(0, 10).join(' ');
             return title.charAt(0).toUpperCase() + title.slice(1) + (words.length > 10 ? '...' : '');
        }
        
        const titleLen = words.length > 8 ? 8 : words.length;
        const title = words.slice(0, titleLen).join(' ');
        return title.charAt(0).toUpperCase() + title.slice(1) + (words.length > titleLen ? '...' : '');
    };

    const getVerseTajweedRules = (html: string) => {
        if (!html) return [];
        
        const rules: { name: string, color: string }[] = [];
        const tajweedDefinitions = [
            { name: 'Madd', color: '#8b5cf6', patterns: ['madda_normal', 'madda_permissible', 'madda_necessery', 'madda_necessary', 'madda_obligatory'] },
            { name: 'Ghunnah', color: '#ec4899', patterns: ['ghunnah'] },
            { name: 'Ikhfa', color: '#22c55e', patterns: ['ikhfa', 'ikhafa', 'ikhfa_shafawi', 'ikhafa_shafawi'] },
            { name: 'Iqlab', color: '#3b82f6', patterns: ['iqlaab', 'iqlab'] },
            { name: 'Idgham Bighunnah', color: '#f59e0b', patterns: ['idgham_with_ghunnah', 'idgham_ghunnah', 'idgham_shafawi', 'idgham_mutajanisayn', 'idgham_mutaqaribayn'] },
            { name: 'Idgham Bilaghunnah', color: '#94a3b8', patterns: ['idgham_without_ghunnah', 'idgham_wo_ghunnah', 'idgham_bilaghunnah'] },
            { name: 'Qalqalah', color: '#ef4444', patterns: ['qalaqah'] },
        ];

        tajweedDefinitions.forEach(def => {
            const hasRule = def.patterns.some(pattern => html.includes(pattern));
            if (hasRule) {
                rules.push({ name: def.name, color: def.color });
            }
        });

        return rules;
    };

    const startRecording = async (ayahNumber: number) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            // Coba format yang didukung browser
            const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
            const mediaRecorder = new MediaRecorder(stream, { mimeType });
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
                stream.getTracks().forEach(track => track.stop());
                await evaluateAudio(ayahNumber, audioBlob, mimeType);
            };

            mediaRecorder.start();
            setRecordingAyah(ayahNumber);
        } catch (err) {
            console.error('Error accessing microphone:', err);
            alert('Tidak dapat mengakses mikrofon. Pastikan Anda telah memberikan izin.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            const currentAyah = recordingAyah;
            mediaRecorderRef.current.stop();
            setRecordingAyah(null);
            setEvaluatingAyah(currentAyah);
        }
    };

    const speakFeedbackAndPlayCorrect = (feedbackText: string, correctAudioUrl: string, ayahNumber: number) => {
        if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
        }
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(feedbackText);
        utterance.lang = 'id-ID';
        utterance.rate = 0.95;
        
        const voices = window.speechSynthesis.getVoices();
        let voice = voices.find(v => v.lang === 'id-ID');
        if (!voice) {
            voice = voices.find(v => v.lang.startsWith('id'));
        }
        if (voice) {
            utterance.voice = voice;
        }
        
        utterance.onend = () => {
            // Setelah AI selesai bicara, putar audio aslinya yang benar
            toggleAudio(correctAudioUrl);
        };
        
        window.speechSynthesis.speak(utterance);
    };

    const evaluateAudio = async (ayahNumber: number, audioBlob: Blob, mimeType: string) => {
        try {
            const apiKey = process.env.GEMINI_API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY;
            if (!apiKey) throw new Error("Gemini API key is missing");
            
            const genAI = new GoogleGenerativeAI(apiKey);
            
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = async () => {
                const base64data = reader.result as string;
                const base64Content = base64data.split(',')[1];
                
                const ayah = surahDetail?.ayat.find((a: any) => a.nomorAyat === ayahNumber);
                if (!ayah) return;
                
                const prompt = `Kamu adalah Talaqqi AI, guru tahsin Al-Quran yang santai, ramah, dan memotivasi. Dengarkan rekaman ini: membaca surat ${surahDetail.namaLatin} ayat ${ayahNumber}. Ayat aslinya: ${ayah.teksArab} (${ayah.teksLatin}). Evaluasi bacaannya. Berikan pujian dulu, lalu koreksi makhraj atau mad/tajwidnya jika ada dengan menggunakan ejaan bahasa Indonesia yang mudah dibaca oleh text-to-speech. Jangan gunakan simbol rumit atau tanda kurung berlebihan. Jika bacaan sempurna, puji dengan tulus. Setelah koreksi, katakan 'Mari kita dengarkan bacaan yang benarnya berikut ini.'. Singkat saja, maksimal 2 paragraf pendek.`;
                
                try {
                    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                    const response = await model.generateContent([
                        prompt,
                        {
                            inlineData: {
                                mimeType: mimeType,
                                data: base64Content
                            }
                        }
                    ]);
                    
                    const responseText = response.response.text();
                    const feedbackText = responseText || "Tidak dapat memberikan umpan balik saat ini.";
                    setEvaluationResults(prev => ({
                        ...prev,
                        [ayahNumber]: feedbackText
                    }));
                    
                    speakFeedbackAndPlayCorrect(feedbackText, ayah.audio["05"], ayahNumber);
                    
                } catch (e) {
                    console.error("Gemini eval error", e);
                    setEvaluationResults(prev => ({
                        ...prev,
                        [ayahNumber]: "Gagal mengevaluasi bacaan. Coba rekam suara sekali lagi dengan volume lebih keras."
                    }));
                } finally {
                    setEvaluatingAyah(null);
                }
            };
        } catch (err) {
            console.error('Error during evaluation:', err);
            setEvaluatingAyah(null);
        }
    };

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
                                                        title="Putar Audio"
                                                    >
                                                        {playingAudio === ayah.audio["05"] ? <span className="w-3 h-3 bg-white rounded-sm"></span> : <PlayCircle className="w-5 h-5 ml-0.5" />}
                                                    </button>
                                                    <button 
                                                        onClick={() => recordingAyah === ayah.nomorAyat ? stopRecording() : startRecording(ayah.nomorAyat)}
                                                        disabled={evaluatingAyah === ayah.nomorAyat || (recordingAyah !== null && recordingAyah !== ayah.nomorAyat)}
                                                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${recordingAyah === ayah.nomorAyat ? 'bg-red-500 text-white shadow-md shadow-red-500/30 animate-pulse' : evaluatingAyah === ayah.nomorAyat ? 'bg-amber-100 text-amber-500 cursor-not-allowed' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 hover:bg-[#1799dc]/10 hover:text-[#1799dc]'} disabled:opacity-50`}
                                                        title="Talaqqi AI (Cek Bacaan)"
                                                    >
                                                        {evaluatingAyah === ayah.nomorAyat ? (
                                                            <Loader2 className="w-5 h-5 animate-spin" />
                                                        ) : recordingAyah === ayah.nomorAyat ? (
                                                            <Square className="w-4 h-4 fill-current" />
                                                        ) : (
                                                            <Mic className="w-5 h-5" />
                                                        )}
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
                                                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm md:text-base mb-4">{ayah.teksIndonesia}</p>
                                                
                                                {/* Talaqqi AI Feedback */}
                                                <AnimatePresence>
                                                    {(evaluatingAyah === ayah.nomorAyat || evaluationResults[ayah.nomorAyat] || recordingAyah === ayah.nomorAyat) && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                                            animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                                                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                                            className="overflow-hidden"
                                                        >
                                                            <div className={`p-4 rounded-2xl border ${recordingAyah === ayah.nomorAyat ? 'bg-red-50/50 border-red-100 dark:bg-red-900/10 dark:border-red-900/30' : evaluatingAyah === ayah.nomorAyat ? 'bg-amber-50/50 border-amber-100 dark:bg-amber-900/10 dark:border-amber-900/30' : 'bg-[#1799dc]/5 border-[#1799dc]/20 dark:bg-[#1799dc]/10 dark:border-[#1799dc]/30'}`}>
                                                                <div className="flex items-start gap-3">
                                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${recordingAyah === ayah.nomorAyat ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : evaluatingAyah === ayah.nomorAyat ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-[#1799dc]/20 text-[#1799dc] dark:bg-[#1799dc]/30'}`}>
                                                                        {recordingAyah === ayah.nomorAyat ? (
                                                                            <Mic className="w-4 h-4 animate-pulse" />
                                                                        ) : evaluatingAyah === ayah.nomorAyat ? (
                                                                            <Activity className="w-4 h-4 animate-pulse" />
                                                                        ) : (
                                                                            <Sparkles className="w-4 h-4" />
                                                                        )}
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <h4 className={`text-sm font-bold mb-1 ${recordingAyah === ayah.nomorAyat ? 'text-red-700 dark:text-red-400' : evaluatingAyah === ayah.nomorAyat ? 'text-amber-700 dark:text-amber-400' : 'text-[#1799dc]'}`}>
                                                                            {recordingAyah === ayah.nomorAyat ? 'Merekam bacaan...' : evaluatingAyah === ayah.nomorAyat ? 'Talaqqi AI sedang mengevaluasi...' : 'Evaluasi Talaqqi AI'}
                                                                        </h4>
                                                                        {recordingAyah === ayah.nomorAyat && (
                                                                            <p className="text-xs text-red-600/80 dark:text-red-400/80">Silakan baca ayat ini dengan jelas. Tekan tombol kotak merah untuk berhenti.</p>
                                                                        )}
                                                                        {evaluatingAyah === ayah.nomorAyat && (
                                                                            <p className="text-xs text-amber-600/80 dark:text-amber-400/80">Tunggu sebentar, AI sedang mendengarkan dan menganalisis bacaan dan tajwid Anda.</p>
                                                                        )}
                                                                        {evaluationResults[ayah.nomorAyat] && !evaluatingAyah && !recordingAyah && (
                                                                            <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                                                                                {evaluationResults[ayah.nomorAyat]}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>

                                                {/* Tajweed Section */}
                                                {ayah.teksTajweed && (
                                                    <div className="mt-4 pt-4 border-t border-dashed border-slate-100 dark:border-slate-700/50">
                                                        <h4 className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 dark:text-slate-500 mb-3">Hukum Tajwid Ayat Ini</h4>
                                                        <div className="flex flex-wrap gap-2">
                                                            {getVerseTajweedRules(ayah.teksTajweed).map(rule => (
                                                                <div key={rule.name} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700 text-[10px] font-bold shadow-sm">
                                                                    <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.1)]" style={{ backgroundColor: rule.color }}></div>
                                                                    <span className="text-slate-700 dark:text-slate-300 uppercase tracking-widest">{rule.name}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
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
                                        <div key={hadith.number} className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-[2rem] shadow-sm hover:shadow-md border border-slate-100 dark:border-slate-700 transition-all group">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-100 dark:border-slate-700/50">
                                                <div className="flex-1">
                                                    <h3 className="font-black text-slate-800 dark:text-slate-100 text-xl md:text-2xl leading-tight mb-2 group-hover:text-[#1799dc] transition-colors">
                                                        {getHadithTitle(hadith.id)}
                                                    </h3>
                                                    <div className="flex items-center gap-2">
                                                        <span className="px-2 py-1 bg-[#1799dc]/10 text-[#1799dc] rounded-lg text-[10px] font-bold uppercase tracking-widest leading-none">
                                                            {selectedBook.name}
                                                        </span>
                                                        <span className="text-slate-400 dark:text-slate-500 font-bold text-xs">
                                                            Hadits #{hadith.number}
                                                        </span>
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
