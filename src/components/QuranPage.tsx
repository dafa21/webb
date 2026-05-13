import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Book, ArrowLeft, Search, Bookmark, AlignRight, FileText, ChevronRight, PlayCircle, Loader2, Mic, Square, Activity, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import doaData from '../data/doa.json';

export default function QuranPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'quran' | 'hadits' | 'doa'>('quran');

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

    // Doa State
    const [doas, setDoas] = useState<any[]>([]);
    const [loadingDoas, setLoadingDoas] = useState(false);
    const [searchDoa, setSearchDoa] = useState('');

    const [selectedReference, setSelectedReference] = useState<{bookId: string, number: string, bookName: string, fullText: string, fallback: {arab: string, id: string}} | null>(null);
    const [referenceData, setReferenceData] = useState<any>(null);
    const [loadingReference, setLoadingReference] = useState(false);

    // Talaqqi AI State
    const [recordingAyah, setRecordingAyah] = useState<number | null>(null);
    const [evaluatingAyah, setEvaluatingAyah] = useState<number | null>(null);
    const [evaluationResults, setEvaluationResults] = useState<{ [key: number]: string }>({});
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    
    // Refs for network-based TTS
    const networkTTSChunksRef = useRef<string[]>([]);
    const networkTTSCurrentRef = useRef<number>(0);
    const networkTTSIdRef = useRef<string | null>(null);

    const activeWordRef = useRef<{ ayahNumber: number, wordIndex: number } | null>(null);
    const rqAnimRef = useRef<number | null>(null);

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

    useEffect(() => {
        if (selectedReference) {
            setLoadingReference(true);
            setReferenceData(null);
            fetch(`https://api.hadith.gading.dev/books/${selectedReference.bookId}/${selectedReference.number}`)
                .then(res => res.json())
                .then(data => {
                    if (data.code === 200 && data.data && data.data.contents) {
                        setReferenceData(data.data.contents);
                    } else {
                        // Use fallback directly if original API fails
                        setReferenceData({ 
                             arab: selectedReference.fallback.arab, 
                             id: selectedReference.fallback.id,
                             isFallback: true
                        });
                    }
                })
                .catch(err => {
                    console.error(err);
                    setReferenceData({ 
                         arab: selectedReference.fallback.arab, 
                         id: selectedReference.fallback.id,
                         isFallback: true
                    });
                })
                .finally(() => setLoadingReference(false));
        }
    }, [selectedReference]);

    // Fetch Doa
    useEffect(() => {
        if (activeTab === 'doa' && doas.length === 0) {
            setLoadingDoas(true);
            // using local data instead of fetch API to support static deployment without node backend
            setTimeout(() => {
                setDoas(doaData);
                setLoadingDoas(false);
            }, 300);
        }
    }, [activeTab]);

    const handleSelectSurah = (surah: any) => {
        setSelectedSurah(surah);
        setLoadingSurahDetail(true);
        
        Promise.all([
            fetch(`https://equran.id/api/v2/surat/${surah.nomor}`).then(res => res.json()),
            fetch(`https://api.quran.com/api/v4/verses/by_chapter/${surah.nomor}?words=true&audio=7&word_fields=text_uthmani_tajweed&per_page=300`).then(res => res.json())
        ])
        .then(([equranData, quranComData]) => {
            if (equranData.code === 200) {
                // Merge tajweed into equran data
                const mergedAyahs = equranData.data.ayat.map((ayah: any) => {
                    const verseInfo = quranComData.verses?.find((v: any) => v.verse_number === ayah.nomorAyat);
                    return {
                        ...ayah,
                        teksTajweed: verseInfo?.text_uthmani_tajweed,
                        quranComWords: verseInfo?.words,
                        quranComAudio: verseInfo?.audio
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

    const toggleAudio = (audioUrl: string, ayahNumber?: number, audioSegments?: any[]) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }

        // Remove existing highlight if any
        if (activeWordRef.current) {
            const el = document.getElementById(`word-${activeWordRef.current.ayahNumber}-${activeWordRef.current.wordIndex}`);
            if (el) el.classList.remove('text-[#1799dc]', 'dark:text-[#38bdf8]', 'bg-[#1799dc]/10', 'dark:bg-[#38bdf8]/10', 'rounded-lg', 'px-2', '-mx-2');
            activeWordRef.current = null;
        }
        if (rqAnimRef.current) {
            cancelAnimationFrame(rqAnimRef.current);
            rqAnimRef.current = null;
        }

        if (playingAudio === audioUrl) {
            setPlayingAudio(null);
            const audioEl = document.getElementById('quran-audio') as HTMLAudioElement;
            if (audioEl) {
                audioEl.pause();
                audioEl.onplay = null;
            }
        } else {
            setPlayingAudio(audioUrl);
            const audioEl = document.getElementById('quran-audio') as HTMLAudioElement;
            if (audioEl) {
                audioEl.src = audioUrl;
                audioEl.play().catch(console.error);
                audioEl.onended = () => {
                    setPlayingAudio(null);
                    if (activeWordRef.current) {
                        const el = document.getElementById(`word-${activeWordRef.current.ayahNumber}-${activeWordRef.current.wordIndex}`);
                        if (el) el.classList.remove('text-[#1799dc]', 'dark:text-[#38bdf8]', 'bg-[#1799dc]/10', 'dark:bg-[#38bdf8]/10', 'rounded-lg', 'px-2', '-mx-2');
                        activeWordRef.current = null;
                    }
                    if (rqAnimRef.current) {
                        cancelAnimationFrame(rqAnimRef.current);
                        rqAnimRef.current = null;
                    }
                };
                
                if (ayahNumber && audioSegments) {
                    const updateHighlight = () => {
                        if (!audioEl || audioEl.paused) return;
                        const currentTimeMs = audioEl.currentTime * 1000;
                        let newActiveWord: { ayahNumber: number, wordIndex: number } | null = null;
                        
                        for (let i = 0; i < audioSegments.length; i++) {
                            const seg = audioSegments[i];
                            if (seg && seg.length >= 4) {
                                const startMs = seg[2];
                                const endMs = seg[3];
                                if (currentTimeMs >= startMs && currentTimeMs <= endMs) {
                                    newActiveWord = { ayahNumber, wordIndex: seg[0] };
                                    break;
                                }
                            }
                        }
                        
                        const prev = activeWordRef.current;
                        if (newActiveWord?.wordIndex !== prev?.wordIndex || newActiveWord?.ayahNumber !== prev?.ayahNumber) {
                            if (prev) {
                                const el = document.getElementById(`word-${prev.ayahNumber}-${prev.wordIndex}`);
                                if (el) el.classList.remove('text-[#1799dc]', 'dark:text-[#38bdf8]', 'bg-[#1799dc]/10', 'dark:bg-[#38bdf8]/10', 'rounded-lg', 'px-2', '-mx-2');
                            }
                            if (newActiveWord) {
                                const el = document.getElementById(`word-${newActiveWord.ayahNumber}-${newActiveWord.wordIndex}`);
                                if (el) el.classList.add('text-[#1799dc]', 'dark:text-[#38bdf8]', 'bg-[#1799dc]/10', 'dark:bg-[#38bdf8]/10', 'rounded-lg', 'px-2', '-mx-2');
                            }
                            activeWordRef.current = newActiveWord;
                        }
                        
                        rqAnimRef.current = requestAnimationFrame(updateHighlight);
                    };
                    audioEl.onplay = () => {
                        rqAnimRef.current = requestAnimationFrame(updateHighlight);
                    };
                    if (!audioEl.paused) {
                        rqAnimRef.current = requestAnimationFrame(updateHighlight);
                    }
                } else {
                    audioEl.onplay = null;
                }
            }
        }
    };

    const getBestVoice = (lang: string) => {
        const voices = window.speechSynthesis.getVoices();
        let voice = voices.find(v => v.lang === lang && (v.name.includes('Google') || v.name.includes('Premium') || v.name.includes('Enhanced')));
        if (!voice) {
            voice = voices.find(v => v.lang.startsWith(lang.split('-')[0]) && (v.name.includes('Google') || v.name.includes('Premium') || v.name.includes('Enhanced')));
        }
        if (!voice) voice = voices.find(v => v.lang === lang && v.name.includes('Majed')); // Popular Arabic male voice on Apple devices
        if (!voice) voice = voices.find(v => v.lang === lang);
        if (!voice) voice = voices.find(v => v.lang.startsWith(lang.split('-')[0]));
        return voice;
    };

    const stopNetworkTTS = () => {
        const audioEl = document.getElementById('quran-audio') as HTMLAudioElement;
        if (audioEl && networkTTSIdRef.current) {
            audioEl.pause();
            audioEl.onended = null;
            audioEl.onerror = null;
        }
        networkTTSIdRef.current = null;
    };

    const playNetworkTTS = (text: string, lang: string, audioId: string) => {
        const words = text.split(' ');
        let chunks: string[] = [];
        let currentChunk = '';
        words.forEach(word => {
            if (currentChunk.length + word.length > 180) {
                if (currentChunk) chunks.push(currentChunk.trim());
                currentChunk = word + ' ';
            } else {
                currentChunk += word + ' ';
            }
        });
        if (currentChunk) chunks.push(currentChunk.trim());
        
        networkTTSChunksRef.current = chunks;
        networkTTSCurrentRef.current = 0;
        networkTTSIdRef.current = audioId;
        
        const playNextChunk = () => {
            if (networkTTSIdRef.current !== audioId) return; // Stopped
            if (networkTTSCurrentRef.current >= networkTTSChunksRef.current.length) {
                setPlayingAudio(null);
                networkTTSIdRef.current = null;
                return;
            }
            
            const chunk = networkTTSChunksRef.current[networkTTSCurrentRef.current];
            const audioEl = document.getElementById('quran-audio') as HTMLAudioElement;
            if (audioEl) {
                audioEl.src = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang.split('-')[0]}&client=tw-ob&q=${encodeURIComponent(chunk)}`;
                audioEl.onended = () => {
                    networkTTSCurrentRef.current++;
                    playNextChunk();
                };
                audioEl.onerror = () => {
                    setPlayingAudio(null);
                    networkTTSIdRef.current = null;
                };
                audioEl.play().catch(e => {
                    console.error('Network TTS error:', e);
                    setPlayingAudio(null);
                    networkTTSIdRef.current = null;
                });
            }
        };
        
        playNextChunk();
    };

    const toggleSpeechAudio = (text: string, id: string, lang: 'ar-SA' | 'id-ID') => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        stopNetworkTTS();
        
        // Coba untuk memberhentikan audio Quran jika sedang berjalan
        if (playingAudio && !playingAudio.startsWith('doa') && !playingAudio.startsWith('quran-trans') && !playingAudio.startsWith('hadith')) {
            const audioEl = document.getElementById('quran-audio') as HTMLAudioElement;
            if (audioEl) {
                audioEl.pause();
                audioEl.onplay = null;
                audioEl.onended = null;
            }
            if (rqAnimRef.current) {
                cancelAnimationFrame(rqAnimRef.current);
                rqAnimRef.current = null;
            }
            if (activeWordRef.current) {
                const el = document.getElementById(`word-${activeWordRef.current.ayahNumber}-${activeWordRef.current.wordIndex}`);
                if (el) el.classList.remove('text-[#1799dc]', 'dark:text-[#38bdf8]', 'bg-[#1799dc]/10', 'dark:bg-[#38bdf8]/10', 'rounded-lg', 'px-2', '-mx-2');
                activeWordRef.current = null;
            }
        }
    
        if (playingAudio === id) {
            setPlayingAudio(null);
        } else {
            setPlayingAudio(id);
            if (lang === 'ar-SA') {
                playNetworkTTS(text, lang, id);
            } else {
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = lang;
                utterance.rate = 0.85; // Diperlambat sedikit agar lebih jelas
                
                const bestVoice = getBestVoice(lang);
                if (bestVoice) utterance.voice = bestVoice;
                
                utterance.onend = () => setPlayingAudio(null);
                utterance.onerror = () => setPlayingAudio(null);
                
                window.speechSynthesis.speak(utterance);
            }
        }
    };

    const toggleHadithAudio = (text: string, id: number, lang: 'ar-SA' | 'id-ID' = 'ar-SA') => {
        const audioEl = document.getElementById('quran-audio') as HTMLAudioElement;
        
        if (!('speechSynthesis' in window)) {
            alert('Fitur suara tidak didukung di browser ini.');
            return;
        }
        
        window.speechSynthesis.cancel();
        stopNetworkTTS();
        
        if (playingAudio && !playingAudio.startsWith('doa') && !playingAudio.startsWith('quran-trans') && !playingAudio.startsWith('hadith')) {
            if (audioEl) {
                audioEl.pause();
                audioEl.onplay = null;
                audioEl.onended = null;
            }
        }
        
        const audioId = `hadith-${id}-${lang}`;
        if (playingAudio === audioId) {
            setPlayingAudio(null);
            return;
        }

        if (lang === 'ar-SA') {
            setPlayingAudio(audioId);
            playNetworkTTS(text, lang, audioId);
        } else {
            // Resume if paused
            if (window.speechSynthesis.paused) {
                window.speechSynthesis.resume();
            }

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = lang;
            utterance.rate = 0.85; // Diperlambat sedikit agar lebih jelas
            
            // Try to find a voice that matches the language
            const bestVoice = getBestVoice(lang);
            if (bestVoice) {
                utterance.voice = bestVoice;
            }

            utterance.pitch = 1;
            utterance.rate = 0.9; // Slightly slower for better clarity
            
            utterance.onend = () => setPlayingAudio(null);
            utterance.onerror = (event) => {
                console.error('SpeechSynthesis Error:', event);
                setPlayingAudio(null);
            };
            
            setPlayingAudio(audioId);
            // Small delay without setTimeout, just call directly
            window.speechSynthesis.speak(utterance);
        }
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

    const filteredDoas = doas.filter(doa => 
        doa.doa.toLowerCase().includes(searchDoa.toLowerCase()) || 
        doa.artinya.toLowerCase().includes(searchDoa.toLowerCase())
    );

    const parseRiwayat = (riwayat: string, fallbackArab: string, fallbackId: string) => {
        if (!riwayat) return null;

        const bookRefs = [
            { name: 'Al-Bukhari', id: 'bukhari' },
            { name: 'Muslim', id: 'muslim' },
            { name: 'Abu Dawud', id: 'abu-daud' },
            { name: 'At-Tirmidzi', id: 'tirmidzi' },
            { name: 'Ibnu Majah', id: 'ibnu-majah' },
            { name: 'An-Nasai', id: 'nasai' },
            { name: 'Ahmad', id: 'ahmad' },
            { name: 'Darimi', id: 'darimi' },
            { name: 'Malik', id: 'malik' }
        ];

        let parsedElements: any[] = [];
        let remainingText = riwayat;

        // Iterate and try to find references
        while (remainingText.length > 0) {
            let earliestMatch: any = null;

            bookRefs.forEach(book => {
                const regex = new RegExp(`(${book.name})(?:\\s*no\\.?\\s*(\\d+))?`, 'i');
                const match = remainingText.match(regex);
                if (match && (!earliestMatch || match.index !== undefined && earliestMatch.index !== undefined && match.index < earliestMatch.index)) {
                    earliestMatch = {
                        book,
                        match: match[0],
                        bookMatch: match[1],
                        number: match[2],
                        index: match.index
                    };
                }
            });

            if (earliestMatch && earliestMatch.number) {
                // We found a book with a number, slice text before it as plain text
                if (earliestMatch.index > 0) {
                    parsedElements.push(<span key={`text-${parsedElements.length}`}>{remainingText.substring(0, earliestMatch.index)}</span>);
                }
                
                // Add the clickable button
                parsedElements.push(
                    <button 
                        key={`btn-${parsedElements.length}`}
                        onClick={() => setSelectedReference({ bookId: earliestMatch.book.id, number: earliestMatch.number, bookName: earliestMatch.book.name, fullText: earliestMatch.match, fallback: { arab: fallbackArab, id: fallbackId } })}
                        className="inline-flex items-center mx-1 px-1.5 py-0.5 bg-[#1799dc]/10 hover:bg-[#1799dc]/20 text-[#1799dc] dark:text-[#38bdf8] rounded cursor-pointer transition-colors"
                        title="Buka Referensi Hadits"
                    >
                        {earliestMatch.match}
                    </button>
                );

                remainingText = remainingText.substring(earliestMatch.index + earliestMatch.match.length);
            } else {
                // If we also want to match books without numbers we could, but we can't fetch them specifically
                // Let's just treat the rest as text
                parsedElements.push(<span key={`text-${parsedElements.length}`}>{remainingText}</span>);
                break;
            }
        }

        return <>{parsedElements}</>;
    };

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

    const [showTajweedGuide, setShowTajweedGuide] = useState(false);

    const tajweedDefinitions = [
        { 
            name: 'Madd', 
            meaning: 'Panjang', 
            reading: 'Dibaca panjang 2 harakat atau lebih sesuai jenisnya.', 
            color: '#8b5cf6', 
            patterns: ['madda_normal', 'madda_permissible', 'madda_necessery', 'madda_necessary', 'madda_obligatory', 'madda_lazim'] 
        },
        { 
            name: 'Ghunnah', 
            meaning: 'Dengung', 
            reading: 'Dibaca mendengung yang jelas dan ditahan 2 harakat.', 
            color: '#ec4899', 
            patterns: ['ghunnah'] 
        },
        { 
            name: 'Ikhfa', 
            meaning: 'Samar', 
            reading: 'Membaca huruf dengan samar-samar antara Idzhar dan Idgham disertai dengungan.', 
            color: '#22c55e', 
            patterns: ['ikhfa', 'ikhafa', 'ikhfa_shafawi', 'ikhafa_shafawi'] 
        },
        { 
            name: 'Iqlab', 
            meaning: 'Tukar', 
            reading: 'Mengganti bunyi Nun Mati/Tanwin menjadi bunyi Mim bila bertemu huruf Ba.', 
            color: '#3b82f6', 
            patterns: ['iqlaab', 'iqlab'] 
        },
        { 
            name: 'Idgham Bighunnah', 
            meaning: 'Melebur dengan Dengung', 
            reading: 'Melebur bunyi Nun Mati/Tanwin ke huruf berikutnya disertai dengungan.', 
            color: '#f59e0b', 
            patterns: ['idgham_with_ghunnah', 'idgham_ghunnah', 'idgham_shafawi', 'idgham_mutajanisayn', 'idgham_mutaqaribayn'] 
        },
        { 
            name: 'Idgham Bilaghunnah', 
            meaning: 'Melebur tanpa Dengung', 
            reading: 'Melebur bunyi Nun Mati/Tanwin ke huruf berikutnya tanpa dengungan.', 
            color: '#94a3b8', 
            patterns: ['idgham_without_ghunnah', 'idgham_wo_ghunnah', 'idgham_bilaghunnah'] 
        },
        { 
            name: 'Qalqalah', 
            meaning: 'Memantul', 
            reading: 'Memantulkan bunyi huruf saat dalam keadaan sukun atau waqaf.', 
            color: '#ef4444', 
            patterns: ['qalaqah'] 
        },
        { 
            name: 'Idzhar', 
            meaning: 'Jelas', 
            reading: 'Membaca bunyi Nun Mati/Tanwin dengan jelas dan tegas tanpa dengungan.', 
            color: '#0f172a', 
            patterns: ['idhar', 'idzhar', 'idhar_shafawi', 'idzhar_shafawi'] 
        }
    ];

    const getVerseTajweedRules = (html: string) => {
        if (!html) return [];
        
        const rules: any[] = [];
        tajweedDefinitions.forEach(def => {
            const hasRule = def.patterns.some(pattern => html.includes(pattern));
            if (hasRule) {
                rules.push(def);
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
        
        const bestVoice = getBestVoice('id-ID');
        if (bestVoice) {
            utterance.voice = bestVoice;
        }
        
        utterance.onend = () => {
            // Setelah AI selesai bicara, putar audio aslinya yang benar
            toggleAudio(correctAudioUrl);
        };
        
        window.speechSynthesis.speak(utterance);
    };

    const evaluateAudio = async (ayahNumber: number, audioBlob: Blob, mimeType: string) => {
        try {
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = async () => {
                const base64data = reader.result as string;
                const audioBase64 = base64data.split(',')[1];
                
                const ayah = surahDetail?.ayat.find((a: any) => a.nomorAyat === ayahNumber);
                if (!ayah) return;
                
                const prompt = `Kamu adalah Talaqqi AI, guru tahsin Al-Quran yang santai, ramah, dan memotivasi. Dengarkan rekaman ini: membaca surat ${surahDetail.namaLatin} ayat ${ayahNumber}. Ayat aslinya: ${ayah.teksArab} (${ayah.teksLatin}). Evaluasi bacaannya. Berikan pujian dulu, lalu koreksi makhraj atau mad/tajwidnya jika ada dengan menggunakan ejaan bahasa Indonesia yang mudah dibaca oleh text-to-speech. Jangan gunakan simbol rumit atau tanda kurung berlebihan. Jika bacaan sempurna, puji dengan tulus. Setelah koreksi, katakan 'Mari kita dengarkan bacaan yang benarnya berikut ini.'. Singkat saja, maksimal 2 paragraf pendek.`;
                
                try {
                    const response = await fetch('/api/evaluate-talaqqi', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            prompt,
                            audioBase64,
                            mimeType
                        }),
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || 'Gagal mengevaluasi bacaan');
                    }

                    const data = await response.json();
                    const feedbackText = data.feedback || "Tidak dapat memberikan umpan balik saat ini.";
                    
                    setEvaluationResults(prev => ({
                        ...prev,
                        [ayahNumber]: feedbackText
                    }));
                    
                    speakFeedbackAndPlayCorrect(feedbackText, ayah.audio["05"], ayahNumber);
                    
                } catch (e) {
                    console.error("Evaluation error", e);
                    let errorMessage = e instanceof Error ? e.message : "Gagal mengevaluasi bacaan.";
                    
                    if (errorMessage.includes("API key not valid") || errorMessage.includes("configuration")) {
                        errorMessage = "Konfigurasi Talaqqi AI (API Key) bermasalah. Pastikan API Key Gemini sudah terpasang dengan benar di server settings.";
                    }

                    setEvaluationResults(prev => ({
                        ...prev,
                        [ayahNumber]: errorMessage
                    }));
                } finally {
                    setEvaluatingAyah(null);
                }
            };
        } catch (err) {
            console.error('Error during evaluation process:', err);
            setEvaluatingAyah(null);
        }
    };

    return (
        <div className="pt-20 md:pt-28 pb-16 min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
            <div className="max-w-4xl mx-auto px-4">
                
                {/* Header */}
                {!selectedSurah && !selectedBook && (
                    <div className="mb-6 text-center pt-2">
                        <div className="w-12 h-12 mx-auto bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-xl flex items-center justify-center mb-3">
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <h1 className="text-2xl font-extrabold text-[#1799dc] mb-1">Qur'an & Hadits</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm">Membaca dan merenungkan ayat suci serta riwayat nabi.</p>
                        
                        <div className="flex justify-center mt-4">
                            <div className="flex bg-white dark:bg-slate-800 rounded-full p-1 shadow-sm border border-slate-200 dark:border-slate-700">
                                <button 
                                    onClick={() => setActiveTab('quran')}
                                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${activeTab === 'quran' ? 'bg-[#1799dc] text-white shadow-md' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                                >
                                    Al-Qur'an
                                </button>
                                <button 
                                    onClick={() => setActiveTab('hadits')}
                                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${activeTab === 'hadits' ? 'bg-[#1799dc] text-white shadow-md' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                                >
                                    Hadits
                                </button>
                                <button 
                                    onClick={() => setActiveTab('doa')}
                                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${activeTab === 'doa' ? 'bg-[#1799dc] text-white shadow-md' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                                >
                                    Doa Harian
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
                            
                            <div className="bg-gradient-to-br from-[#1799dc] to-[#2db2f5] rounded-3xl p-5 md:p-8 text-white shadow-xl shadow-[#1799dc]/20 mb-6 text-center relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-2xl"></div>
                                <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/10 rounded-full -ml-20 -mb-20 blur-xl"></div>
                                
                                <h2 className="text-3xl md:text-4xl font-arabic font-bold mb-3 relative z-10">{selectedSurah.nama}</h2>
                                <h1 className="text-xl md:text-2xl font-extrabold mb-1 relative z-10">{selectedSurah.namaLatin}</h1>
                                <p className="opacity-90 font-medium tracking-wide uppercase text-[10px] md:text-xs relative z-10">{selectedSurah.arti} &middot; {selectedSurah.jumlahAyat} Ayat &middot; {selectedSurah.tempatTurun}</p>
                            </div>

                            <div className="mb-6 flex flex-col items-center gap-4">
                                <div className="flex flex-wrap gap-2 md:gap-3 justify-center text-[10px] md:text-xs font-medium">
                                    {tajweedDefinitions.map(rule => (
                                        <span key={rule.name} className="px-2 md:px-3 py-1 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm flex items-center">
                                            <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: rule.color }}></span>
                                            {rule.name}
                                        </span>
                                    ))}
                                </div>
                                <button 
                                    onClick={() => setShowTajweedGuide(!showTajweedGuide)}
                                    className="flex items-center gap-2 text-xs font-bold text-[#1799dc] bg-[#1799dc]/10 px-4 py-2 rounded-full hover:bg-[#1799dc]/20 transition-colors"
                                >
                                    <AlignRight className="w-4 h-4" />
                                    {showTajweedGuide ? 'Tutup Panduan Tajwid' : 'Lihat Penjelasan Tajwid'}
                                </button>
                            </div>

                            <AnimatePresence>
                                {showTajweedGuide && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mb-8 overflow-hidden"
                                    >
                                        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm grid md:grid-cols-2 gap-4">
                                            {tajweedDefinitions.map(rule => (
                                                <div key={rule.name} className="flex gap-4">
                                                    <div className="w-1.5 rounded-full shrink-0" style={{ backgroundColor: rule.color }}></div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-2">
                                                            {rule.name} <span className="text-[10px] text-slate-400 font-medium">({rule.meaning})</span>
                                                        </h4>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                                            {rule.reading}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {loadingSurahDetail ? (
                                <div className="flex justify-center items-center py-20">
                                    <Loader2 className="w-8 h-8 animate-spin text-[#1799dc]" />
                                </div>
                            ) : surahDetail ? (
                                <div className="space-y-8">
                                    <audio id="quran-audio" className="hidden" />
                                    {surahDetail.ayat.map((ayah: any) => (
                                        <div key={ayah.nomorAyat} className={`bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border relative transition-all duration-300 ${(playingAudio === ayah.audio["05"] || playingAudio === (ayah.quranComAudio ? "https://verses.quran.com/" + ayah.quranComAudio.url : null)) ? 'border-[#1799dc] ring-4 ring-[#1799dc]/10 dark:ring-[#1799dc]/20' : 'border-slate-100 dark:border-slate-700'}`}>
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="flex flex-col gap-3">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${(playingAudio === ayah.audio["05"] || playingAudio === (ayah.quranComAudio ? "https://verses.quran.com/" + ayah.quranComAudio.url : null)) ? 'bg-[#1799dc]/10 text-[#1799dc]' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                                                        {ayah.nomorAyat}
                                                    </div>
                                                    <button 
                                                        onClick={() => {
                                                            const audioUrlToPlay = ayah.quranComAudio ? "https://verses.quran.com/" + ayah.quranComAudio.url : ayah.audio["05"];
                                                            toggleAudio(audioUrlToPlay, ayah.nomorAyat, ayah.quranComAudio?.segments);
                                                        }}
                                                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${(playingAudio === ayah.audio["05"] || playingAudio === (ayah.quranComAudio ? "https://verses.quran.com/" + ayah.quranComAudio.url : null)) ? 'bg-[#1799dc] text-white shadow-md shadow-[#1799dc]/20' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-[#1799dc] hover:bg-slate-200 dark:hover:bg-slate-600'}`}
                                                        title="Putar Audio"
                                                    >
                                                        {(playingAudio === ayah.audio["05"] || playingAudio === (ayah.quranComAudio ? "https://verses.quran.com/" + ayah.quranComAudio.url : null)) ? <span className="w-3 h-3 bg-white rounded-sm"></span> : <PlayCircle className="w-5 h-5 ml-0.5" />}
                                                    </button>
                                                    <button 
                                                        onClick={() => toggleSpeechAudio(ayah.teksIndonesia, `quran-trans-${ayah.nomorAyat}`, 'id-ID')}
                                                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${playingAudio === `quran-trans-${ayah.nomorAyat}` ? 'bg-[#8b5cf6] text-white shadow-md shadow-[#8b5cf6]/20' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 hover:bg-[#8b5cf6]/10 hover:text-[#8b5cf6]'}`}
                                                        title="Putar Terjemahan"
                                                    >
                                                        {playingAudio === `quran-trans-${ayah.nomorAyat}` ? <span className="w-3 h-3 bg-white rounded-sm"></span> : <PlayCircle className="w-5 h-5 ml-0.5" />}
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
                                                    {ayah.quranComWords ? (
                                                        <p className="font-arabic text-4xl md:text-[2.75rem] leading-[2.5] md:leading-[2.75] text-slate-800 dark:text-slate-100" dir="rtl">
                                                            {ayah.quranComWords.map((word: any, wIndex: number) => {
                                                                return (
                                                                    <span 
                                                                        id={`word-${ayah.nomorAyat}-${wIndex}`}
                                                                        key={word.id || wIndex} 
                                                                        className={`inline-block ml-2 lg:ml-3 transition-colors duration-200`}
                                                                        dangerouslySetInnerHTML={{ __html: word.text_uthmani_tajweed || word.text_uthmani || word.text }}
                                                                    />
                                                                );
                                                            })}
                                                        </p>
                                                    ) : ayah.teksTajweed ? (
                                                        <p 
                                                            className={`font-arabic text-4xl md:text-[2.75rem] leading-[2.5] md:leading-[2.75] transition-colors duration-300 ${(playingAudio === ayah.audio["05"] || playingAudio === (ayah.quranComAudio ? "https://verses.quran.com/" + ayah.quranComAudio.url : null)) ? 'text-[#1799dc] dark:text-[#38bdf8]' : 'text-slate-800 dark:text-slate-100'}`}
                                                            dangerouslySetInnerHTML={{ __html: ayah.teksTajweed }} 
                                                            dir="rtl"
                                                        />
                                                    ) : (
                                                        <p className={`font-arabic text-4xl md:text-[2.75rem] leading-[2.5] md:leading-[2.75] transition-colors duration-300 ${(playingAudio === ayah.audio["05"] || playingAudio === (ayah.quranComAudio ? "https://verses.quran.com/" + ayah.quranComAudio.url : null)) ? 'text-[#1799dc] dark:text-[#38bdf8]' : 'text-slate-800 dark:text-slate-100'}`} dir="rtl">{ayah.teksArab}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="border-t border-slate-100 dark:border-slate-700/50 pt-4 mt-6">
                                                <p className={`text-sm font-medium mb-2 transition-colors duration-300 ${playingAudio === ayah.audio["05"] ? 'text-[#1799dc] dark:text-[#38bdf8]' : 'text-primary-600 dark:text-primary-400'}`}>{ayah.teksLatin}</p>
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
                                                {(ayah.teksTajweed || ayah.teksArab || ayah.quranComWords) && (
                                                    <div className="mt-6 pt-5 border-t border-dashed border-slate-200 dark:border-slate-700/50">
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <div className="w-1.5 h-4 bg-[#1799dc] rounded-full"></div>
                                                            <h4 className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500 dark:text-slate-400">Tajwid & Cara Baca</h4>
                                                        </div>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                            {getVerseTajweedRules(
                                                                (ayah.teksTajweed || '') + 
                                                                (ayah.teksArab || '') + 
                                                                (ayah.quranComWords?.map((w:any) => w.text_uthmani_tajweed || '').join(' ') || '')
                                                            ).map(rule => (
                                                                <div 
                                                                    key={rule.name} 
                                                                    className="flex items-start gap-3 p-2.5 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-700/40 hover:border-[#1799dc]/30 transition-colors"
                                                                >
                                                                    <div className="w-2.5 h-2.5 rounded-full mt-1 shrink-0 shadow-sm" style={{ backgroundColor: rule.color }}></div>
                                                                    <div className="flex-1">
                                                                        <div className="flex items-center gap-2 flex-wrap">
                                                                            <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest">{rule.name}</span>
                                                                            <span className="text-[9px] text-[#1799dc] font-medium bg-[#1799dc]/10 px-1.5 rounded-md">{rule.meaning}</span>
                                                                        </div>
                                                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
                                                                            {rule.reading}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        {getVerseTajweedRules(
                                                            (ayah.teksTajweed || '') + 
                                                            (ayah.teksArab || '') + 
                                                            (ayah.quranComWords?.map((w:any) => w.text_uthmani_tajweed || '').join(' ') || '')
                                                        ).length === 0 && (
                                                            <p className="text-[10px] text-slate-400 font-medium italic">Tidak ditemukan hukum tajwid khusus di ayat ini.</p>
                                                        )}
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

                    {activeTab === 'doa' && (
                        <div>
                            <div className="relative max-w-md mx-auto mb-8">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input 
                                    type="text" 
                                    placeholder="Cari Doa..."
                                    value={searchDoa}
                                    onChange={(e) => setSearchDoa(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-[#1799dc]/50 outline-none transition-shadow block"
                                />
                            </div>

                            {loadingDoas ? (
                                <div className="flex justify-center items-center py-20">
                                    <Loader2 className="w-8 h-8 animate-spin text-[#1799dc]" />
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {filteredDoas.map((doa) => (
                                        <div key={doa.id} className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-[2rem] shadow-sm hover:shadow-md border border-slate-100 dark:border-slate-700 transition-all">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-100 dark:border-slate-700/50">
                                                <div className="flex-1">
                                                    <h3 className="font-black text-slate-800 dark:text-slate-100 text-xl md:text-2xl leading-tight mb-2">
                                                        {doa.doa}
                                                    </h3>
                                                    {doa.riwayat && (
                                                        <div className="inline-block mt-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 rounded-lg text-xs font-bold uppercase tracking-wide">
                                                            {parseRiwayat(doa.riwayat, doa.ayat, doa.artinya)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3 shrink-0">
                                                    <button 
                                                        onClick={() => toggleSpeechAudio(doa.ayat, `doa-ar-${doa.id}`, 'ar-SA')}
                                                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${playingAudio === `doa-ar-${doa.id}` ? 'bg-[#1799dc] text-white shadow-lg shadow-[#1799dc]/30 scale-105' : 'bg-[#1799dc]/10 text-[#1799dc] hover:bg-[#1799dc] hover:text-white'}`}
                                                        title="Putar Audio Arab"
                                                    >
                                                        {playingAudio === `doa-ar-${doa.id}` ? <span className="w-4 h-4 bg-white rounded-sm"></span> : <PlayCircle className="w-6 h-6 ml-0.5" />}
                                                    </button>
                                                    <button 
                                                        onClick={() => toggleSpeechAudio(doa.artinya, `doa-id-${doa.id}`, 'id-ID')}
                                                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${playingAudio === `doa-id-${doa.id}` ? 'bg-[#8b5cf6] text-white shadow-lg shadow-[#8b5cf6]/30 scale-105' : 'bg-[#8b5cf6]/10 text-[#8b5cf6] hover:bg-[#8b5cf6] hover:text-white'}`}
                                                        title="Putar Audio Terjemahan"
                                                    >
                                                        {playingAudio === `doa-id-${doa.id}` ? <span className="w-4 h-4 bg-white rounded-sm"></span> : <PlayCircle className="w-6 h-6 ml-0.5" />}
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-8">
                                                <div>
                                                    <p className="font-arabic text-3xl md:text-5xl leading-[2.5] md:leading-[2.5] text-right text-slate-800 dark:text-slate-100 mb-6" dir="rtl">
                                                        {doa.ayat}
                                                    </p>
                                                </div>
                                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-700">
                                                    <p className="text-sm font-medium text-primary-600 dark:text-primary-400 mb-3">{doa.latin}</p>
                                                    <p className="text-slate-700 dark:text-slate-300 leading-loose md:text-lg font-medium">
                                                        {doa.artinya}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {filteredDoas.length === 0 && doas.length > 0 && (
                                        <div className="text-center py-10 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                                            Tidak ada doa yang cocok dengan pencarian Anda.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>

            {/* Hadith Reference Modal */}
            {selectedReference && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedReference(null)}>
                    <div 
                        className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                                {selectedReference.bookName} - Hadits No. {selectedReference.number}
                            </h3>
                            <button 
                                onClick={() => setSelectedReference(null)}
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                            </button>
                        </div>
                        
                        <div className="p-6 md:p-8 overflow-y-auto w-full">
                            {loadingReference ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <Loader2 className="w-10 h-10 animate-spin text-[#1799dc] mb-4" />
                                    <p className="text-slate-500">Memuat hadits...</p>
                                </div>
                            ) : referenceData?.arab ? (
                                <div className="space-y-8">
                                    <p className="font-arabic text-3xl leading-[2.2] text-right text-slate-800 dark:text-slate-100" dir="rtl">
                                        {referenceData.arab}
                                    </p>
                                    <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-700">
                                        <p className="text-slate-700 dark:text-slate-300 leading-loose text-lg font-medium">
                                            {referenceData.id}
                                        </p>
                                    </div>
                                    {referenceData.isFallback && (
                                        <p className="text-sm text-slate-400 mt-4 text-center italic">
                                            Teks hadits lengkap saat ini sedang tidak tersedia. Di atas adalah kutipan doa yang dimaksud dari hadits ini.
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-slate-500 text-lg mb-4">{referenceData?.error || 'Hadits tidak ditemukan'}</p>
                                    <p className="text-sm text-slate-400">Pastikan nomor hadits valid untuk kitab ini.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
