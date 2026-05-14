import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Book, ArrowLeft, Search, Bookmark, BookmarkPlus, AlignRight, AlignLeft, FileText, ChevronRight, ChevronLeft, ChevronDown, PlayCircle, Play, Pause, Loader2, Mic, Square, Activity, Sparkles, Copy, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db, auth, OperationType, handleFirestoreError } from '../firebase';
import { doc, getDoc, setDoc, serverTimestamp, getDocs, collection } from 'firebase/firestore';
import doaData from '../data/doa.json';
import dzikirData from '../data/dzikir.json';

const RECITERS = [
    { id: "01", name: "Syaikh Abdullah Al-Juhany" },
    { id: "02", name: "Syaikh Abdul Muhsin Al-Qasim" },
    { id: "03", name: "Syaikh Abdurrahman as-Sudais" },
    { id: "04", name: "Syaikh Ibrahim Al-Dossari" },
    { id: "05", name: "Syaikh Misyari Rasyid Al-Afasi" },
];

export default function QuranPage() {
    const navigate = useNavigate();
    const [selectedReciter, setSelectedReciter] = useState<string>("05");
    const [activeTab, setActiveTab] = useState<'quran' | 'hadits' | 'doa' | 'dzikir'>('quran');
    
    const [quranViewMode, setQuranViewMode] = useState<'list' | 'mushaf'>('list');
    const [mushafPageIdx, setMushafPageIdx] = useState(0);
    const [touchStartX, setTouchStartX] = useState<number | null>(null);
    const [activeAyahAction, setActiveAyahAction] = useState<any | null>(null);

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
    const [selectedDoa, setSelectedDoa] = useState<any | null>(null);

    // Dzikir State
    const [dzikirs, setDzikirs] = useState<any[]>([]);
    const [loadingDzikirs, setLoadingDzikirs] = useState(false);
    const [searchDzikir, setSearchDzikir] = useState('');
    const [selectedDzikir, setSelectedDzikir] = useState<any | null>(null);
    const [selectedDzikirCategory, setSelectedDzikirCategory] = useState<string>('Al-Ma\'tsurat Pagi');
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [bookmark, setBookmark] = useState<any | null>(null);
    const [isSavingBookmark, setIsSavingBookmark] = useState(false);

    // Fetch bookmark on mount or auth change
    useEffect(() => {
        const fetchBookmark = async () => {
            if (auth.currentUser) {
                const phone = localStorage.getItem('app_user_phone');
                const targetUid = phone || auth.currentUser.uid;
                try {
                    const docRef = doc(db, 'user_settings', targetUid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        setBookmark(docSnap.data().lastRead);
                    }
                } catch (error) {
                    handleFirestoreError(error, OperationType.GET, 'user_settings/' + targetUid);
                }
            }
        };

        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                fetchBookmark();
            } else {
                setBookmark(null);
            }
        });

        return () => unsubscribe();
    }, []);

    const handleBookmark = async (ayahNumber: number = 1) => {
        if (!auth.currentUser) {
            alert("Silakan login untuk menyimpan penanda.");
            return;
        }

        if (!selectedSurah) return;

        const phone = localStorage.getItem('app_user_phone');
        const targetUid = phone || auth.currentUser.uid;

        setIsSavingBookmark(true);
        try {
            const surahNameStr = selectedSurah.namaLatin || (selectedSurah.name && selectedSurah.name.transliteration ? selectedSurah.name.transliteration.id : "Surat");
            const lastRead = {
                surahId: selectedSurah.number,
                surahName: surahNameStr,
                ayahNumber: ayahNumber,
                timestamp: new Date().toISOString()
            };

            await setDoc(doc(db, 'user_settings', targetUid), {
                userId: targetUid,
                lastRead: lastRead,
                updatedAt: serverTimestamp()
            }, { merge: true });

            setBookmark(lastRead);
            alert(`Berhasil menandai Surat ${lastRead.surahName} Ayat ${ayahNumber}`);
        } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, 'user_settings/' + targetUid);
            alert("Gagal menyimpan penanda.");
        } finally {
            setIsSavingBookmark(false);
        }
    };

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

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
    const voicesLoadedRef = useRef(false);

    useEffect(() => {
        const handleVoicesChanged = () => {
            voicesLoadedRef.current = true;
        };
        window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
        // Sometimes it's already loaded
        if (window.speechSynthesis.getVoices().length > 0) {
            voicesLoadedRef.current = true;
        }
        return () => window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
    }, []);

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
            setTimeout(() => {
                setDoas(doaData);
                setLoadingDoas(false);
            }, 300);
        }
    }, [activeTab]);

    // Fetch Dzikir
    useEffect(() => {
        if (activeTab === 'dzikir' && dzikirs.length === 0) {
            setLoadingDzikirs(true);
            setTimeout(() => {
                setDzikirs(dzikirData);
                setLoadingDzikirs(false);
            }, 300);
        }
    }, [activeTab]);

    const handleSelectSurah = (surah: any) => {
        setSelectedSurah(surah);
        setLoadingSurahDetail(true);
        
        Promise.all([
            fetch(`https://equran.id/api/v2/surat/${surah.nomor}`).then(res => res.json()),
            fetch(`https://api.quran.com/api/v4/verses/by_chapter/${surah.nomor}?words=true&audio=7&word_fields=text_uthmani_tajweed&per_page=300`).then(res => res.json()),
            fetch(`https://equran.id/api/v2/tafsir/${surah.nomor}`).then(res => res.json())
        ])
        .then(([equranData, quranComData, tafsirData]) => {
            if (equranData.code === 200) {
                // Merge tajweed and tafsir into equran data
                const mergedAyahs = equranData.data.ayat.map((ayah: any) => {
                    const verseInfo = quranComData.verses?.find((v: any) => v.verse_number === ayah.nomorAyat);
                    const ayahTafsir = tafsirData.data?.tafsir?.find((t: any) => t.ayat === ayah.nomorAyat);
                    return {
                        ...ayah,
                        pageNumber: verseInfo?.page_number,
                        teksTajweed: verseInfo?.text_uthmani_tajweed,
                        quranComWords: verseInfo?.words,
                        quranComAudio: verseInfo?.audio,
                        tafsir: ayahTafsir?.teks || null
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
    const [openTafsirAyah, setOpenTafsirAyah] = useState<number | null>(null);

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
        try {
            const audioEl = document.getElementById('quran-audio') as HTMLAudioElement;
            if (audioEl) {
                audioEl.pause();
                audioEl.onended = null;
                audioEl.onerror = null;
            }
        } catch (e) {
            console.error('Error stopping network TTS:', e);
        }
        networkTTSIdRef.current = null;
    };

    const speakViaBasicSpeech = (text: string, lang: string, audioId: string) => {
        try {
            if (!('speechSynthesis' in window)) return;
            
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = lang;
            utterance.rate = 0.85;
            
            const voice = getBestVoice(lang);
            if (voice) utterance.voice = voice;
            
            utterance.onend = () => {
                if (networkTTSIdRef.current === audioId) {
                    setPlayingAudio(null);
                    networkTTSIdRef.current = null;
                }
            };
            utterance.onerror = () => {
                if (networkTTSIdRef.current === audioId) {
                    setPlayingAudio(null);
                    networkTTSIdRef.current = null;
                }
            };
            
            networkTTSIdRef.current = audioId;
            setPlayingAudio(audioId);
            window.speechSynthesis.speak(utterance);
        } catch (e) {
            console.error('Basic speech fallback failed:', e);
            setPlayingAudio(null);
        }
    };

    const playNetworkTTS = (text: string, lang: string, audioId: string) => {
        try {
            const processedText = text.trim();
            if (!processedText) {
                setPlayingAudio(null);
                return;
            }

            const chunks: string[] = [];
            if (processedText.length <= 180) {
                chunks.push(processedText);
            } else {
                const words = processedText.split(' ');
                let currentChunk = '';
                words.forEach(word => {
                    if (currentChunk.length + word.length > 160) {
                        if (currentChunk) chunks.push(currentChunk.trim());
                        currentChunk = word + ' ';
                    } else {
                        currentChunk += word + ' ';
                    }
                });
                if (currentChunk) chunks.push(currentChunk.trim());
            }
            
            if (chunks.length === 0) {
                setPlayingAudio(null);
                return;
            }
            
            networkTTSChunksRef.current = chunks;
            networkTTSCurrentRef.current = 0;
            networkTTSIdRef.current = audioId;
            
            const audioEl = document.getElementById('quran-audio') as HTMLAudioElement;
            if (!audioEl) {
                setPlayingAudio(null);
                return;
            }

            const playNextChunk = () => {
                if (networkTTSIdRef.current !== audioId) return;
                
                if (networkTTSCurrentRef.current >= networkTTSChunksRef.current.length) {
                    setPlayingAudio(null);
                    networkTTSIdRef.current = null;
                    return;
                }
                
                const chunk = networkTTSChunksRef.current[networkTTSCurrentRef.current];
                
                audioEl.pause();
                audioEl.onended = null;
                audioEl.onerror = null;
                audioEl.src = `/api/tts?text=${encodeURIComponent(chunk)}&lang=${lang.split('-')[0]}`;
                audioEl.load();

                audioEl.onended = () => {
                    if (networkTTSIdRef.current === audioId) {
                        networkTTSCurrentRef.current++;
                        playNextChunk();
                    }
                };

                audioEl.onerror = (e) => {
                    console.error('Audio element error during chunk:', e);
                    speakViaBasicSpeech(chunk, lang, audioId);
                };
                
                const playPromise = audioEl.play();
                if (playPromise !== undefined) {
                    playPromise.catch(e => {
                        console.error('Network TTS playback error:', e);
                        if (e.name === 'NotAllowedError') {
                            alert('Browser memblokir audio otomatis. Silakan klik tombol lagi.');
                        }
                        setPlayingAudio(null);
                        networkTTSIdRef.current = null;
                    });
                }
            };
            
            playNextChunk();
        } catch (error) {
            console.error('Error in playNetworkTTS:', error);
            setPlayingAudio(null);
        }
    };

    const toggleSpeechAudio = (text: string, id: string, lang: 'ar-SA' | 'id-ID') => {
        try {
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
            stopNetworkTTS();
            
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
                    const voice = getBestVoice(lang);
                    const isHighQuality = voice && (
                        voice.name.includes('Google') || 
                        voice.name.includes('Natural') || 
                        voice.name.includes('Neural') || 
                        voice.name.includes('Enhanced') ||
                        voice.name.includes('Premium')
                    );

                    if (isHighQuality) {
                        const utterance = new SpeechSynthesisUtterance(text);
                        utterance.lang = lang;
                        utterance.voice = voice;
                        utterance.rate = 0.85;
                        utterance.onend = () => setPlayingAudio(null);
                        utterance.onerror = () => setPlayingAudio(null);
                        setTimeout(() => window.speechSynthesis.speak(utterance), 50);
                    } else {
                        playNetworkTTS(text, lang, id);
                    }
                } else {
                    const utterance = new SpeechSynthesisUtterance(text);
                    utterance.lang = lang;
                    utterance.rate = 0.85;
                    const voice = getBestVoice(lang);
                    if (voice) utterance.voice = voice;
                    utterance.onend = () => setPlayingAudio(null);
                    utterance.onerror = () => setPlayingAudio(null);
                    setTimeout(() => window.speechSynthesis.speak(utterance), 50);
                }
            }
        } catch (err) {
            console.error('Error in toggleSpeechAudio:', err);
            setPlayingAudio(null);
        }
    };

    const toggleHadithAudio = (text: string, id: number, lang: 'ar-SA' | 'id-ID' = 'ar-SA') => {
        try {
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
            stopNetworkTTS();
            
            const audioId = `hadith-${id}-${lang}`;
            if (playingAudio === audioId) {
                setPlayingAudio(null);
                return;
            }

            setPlayingAudio(audioId);

            if (lang === 'ar-SA') {
                const voice = getBestVoice(lang);
                const isHighQuality = voice && (
                    voice.name.includes('Google') || 
                    voice.name.includes('Natural') || 
                    voice.name.includes('Neural') || 
                    voice.name.includes('Enhanced') ||
                    voice.name.includes('Premium')
                );

                if (isHighQuality) {
                    const utterance = new SpeechSynthesisUtterance(text);
                    utterance.lang = lang;
                    utterance.voice = voice;
                    utterance.rate = 0.85;
                    utterance.onend = () => setPlayingAudio(null);
                    utterance.onerror = () => setPlayingAudio(null);
                    setTimeout(() => window.speechSynthesis.speak(utterance), 50);
                } else {
                    playNetworkTTS(text, lang, audioId);
                }
            } else {
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = lang;
                const voice = getBestVoice(lang);
                if (voice) utterance.voice = voice;
                utterance.rate = 0.9;
                utterance.onend = () => setPlayingAudio(null);
                utterance.onerror = () => setPlayingAudio(null);
                setTimeout(() => window.speechSynthesis.speak(utterance), 50);
            }
        } catch (err) {
            console.error('Error in toggleHadithAudio:', err);
            setPlayingAudio(null);
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

    const filteredDzikirs = dzikirs.filter(dzikir => 
        dzikir.category === selectedDzikirCategory && (
            dzikir.title.toLowerCase().includes(searchDzikir.toLowerCase()) || 
            dzikir.translation.toLowerCase().includes(searchDzikir.toLowerCase()) ||
            dzikir.category.toLowerCase().includes(searchDzikir.toLowerCase())
        )
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
            name: 'Mad Thabi\'i / Asli', 
            meaning: 'Panjang Normal', 
            reading: 'Dibaca panjang 2 harakat.', 
            color: '#06b6d4',
            patterns: ['madda_normal'] 
        },
        { 
            name: 'Mad Wajib Muttasil', 
            meaning: 'Panjang Bersambung', 
            reading: 'Dibaca panjang 4-5 harakat (bertemu hamzah dalam satu kata).', 
            color: '#3b82f6',
            patterns: ['madda_obligatory_mottasel', 'madda_obligatory_mutassil'] 
        },
        { 
            name: 'Mad Jaiz Munfasil', 
            meaning: 'Panjang Terpisah', 
            reading: 'Dibaca panjang 2, 4, atau 5 harakat (bertemu hamzah di kata berbeda).', 
            color: '#8b5cf6',
            patterns: ['madda_obligatory_monfasel', 'madda_obligatory_munfasil', 'madda_permissible_munfasil'] 
        },
        { 
            name: 'Mad \'Arid Lissukun', 
            meaning: 'Panjang saat Waqaf', 
            reading: 'Dibaca panjang 2, 4, atau 6 harakat saat waqaf (berhenti).', 
            color: '#f43f5e',
            patterns: ['madda_permissible'] 
        },
        { 
            name: 'Mad Lazim', 
            meaning: 'Panjang Wajib', 
            reading: 'Dibaca panjang 6 harakat mutlak.', 
            color: '#10b981',
            patterns: ['madda_necessery', 'madda_necessary', 'madda_lazim', 'madda_obligatory'] 
        },
        { 
            name: 'Ghunnah', 
            meaning: 'Dengung', 
            reading: 'Dibaca mendengung yang jelas dan ditahan 2 harakat (Mim/Nun bertasydid).', 
            color: '#ec4899', 
            patterns: ['ghunnah'] 
        },
        { 
            name: 'Ikhfa', 
            meaning: 'Samar', 
            reading: 'Membaca secara samar-samar antara Idzhar dan Idgham disertai dengungan.', 
            color: '#22c55e', 
            patterns: ['ikhfa', 'ikhafa'] 
        },
        { 
            name: 'Ikhfa Syafawi', 
            meaning: 'Samar Bibir', 
            reading: 'Secara samar dan dengung ketika Mim mati bertemu Ba.', 
            color: '#84cc16', 
            patterns: ['ikhfa_shafawi', 'ikhafa_shafawi'] 
        },
        { 
            name: 'Iqlab', 
            meaning: 'Tukar', 
            reading: 'Mengganti bunyi Nun Mati/Tanwin menjadi bunyi Mim bila bertemu huruf Ba.', 
            color: '#0284c7', 
            patterns: ['iqlaab', 'iqlab'] 
        },
        { 
            name: 'Idgham Bighunnah', 
            meaning: 'Melebur dengan Dengung', 
            reading: 'Melebur bunyi Nun Mati/Tanwin ke huruf berikutnya disertai dengungan.', 
            color: '#f59e0b', 
            patterns: ['idgham_with_ghunnah', 'idgham_ghunnah'] 
        },
        { 
            name: 'Idgham Bilaghunnah', 
            meaning: 'Melebur tanpa Dengung', 
            reading: 'Melebur bunyi Nun Mati/Tanwin ke huruf berikutnya tanpa dengungan.', 
            color: '#94a3b8', 
            patterns: ['idgham_without_ghunnah', 'idgham_wo_ghunnah', 'idgham_bilaghunnah'] 
        },
        { 
            name: 'Idgham Mimi / Mutamatsilain', 
            meaning: 'Melebur Mim', 
            reading: 'Melebur bunyi Mim mati ke huruf Mim berikutnya didertai dengungan.', 
            color: '#ea580c', 
            patterns: ['idgham_shafawi', 'idgham_mutajanisayn', 'idgham_mutaqaribayn'] 
        },
        { 
            name: 'Qalqalah', 
            meaning: 'Memantul', 
            reading: 'Memantulkan bunyi huruf saat dalam keadaan sukun atau waqaf.', 
            color: '#ef4444', 
            patterns: ['qalaqah', 'qalqalah'] 
        },
        { 
            name: 'Idzhar / Jelas', 
            meaning: 'Jelas', 
            reading: 'Membaca bunyi dengan jelas dan tegas tanpa dengungan tambahan.', 
            color: '#0d9488', 
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
                    
                    speakFeedbackAndPlayCorrect(feedbackText, ayah.audio[selectedReciter], ayahNumber);
                    
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

    const toArabicNumber = (n: number) => n.toString().replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d as any]);

    const changeTab = (tab: 'quran' | 'hadits' | 'doa' | 'dzikir') => {
        setActiveTab(tab);
        setSelectedDoa(null);
        setSelectedDzikir(null);
    };

    const mushafPages = React.useMemo(() => {
        if (!surahDetail?.ayat) return [];
        const hasPageNumbers = surahDetail.ayat.some((a: any) => a.pageNumber);
        
        if (hasPageNumbers) {
            const pagesMap = new Map();
            surahDetail.ayat.forEach((ayah: any) => {
                const num = ayah.pageNumber || 1;
                if (!pagesMap.has(num)) {
                    pagesMap.set(num, []);
                }
                pagesMap.get(num).push(ayah);
            });
            return Array.from(pagesMap.entries())
                        .sort((a, b) => a[0] - b[0])
                        .map(e => e[1]);
        } else {
            const chunks = [];
            for (let i = 0; i < surahDetail.ayat.length; i += 8) {
                chunks.push(surahDetail.ayat.slice(i, i + 8));
            }
            return chunks;
        }
    }, [surahDetail]);

    useEffect(() => {
        setMushafPageIdx(0);
    }, [surahDetail?.nomor]);

    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStartX(e.touches[0].clientX);
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchStartX === null) return;
        const touchEndX = e.changedTouches[0].clientX;
        const diff = touchEndX - touchStartX;
        
        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                // Swiped right -> Next page in Arabic reading order
                if (mushafPageIdx < mushafPages.length - 1) setMushafPageIdx(v => v + 1);
            } else {
                // Swiped left -> Prev page
                if (mushafPageIdx > 0) setMushafPageIdx(v => v - 1);
            }
        }
        setTouchStartX(null);
    };

    return (
        <div className="pt-20 md:pt-28 pb-16 min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
            <audio id="quran-audio" className="hidden" />
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
                                    onClick={() => changeTab('quran')}
                                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${activeTab === 'quran' ? 'bg-[#1799dc] text-white shadow-md' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                                >
                                    Al-Qur'an
                                </button>
                                <button 
                                    onClick={() => changeTab('hadits')}
                                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${activeTab === 'hadits' ? 'bg-[#1799dc] text-white shadow-md' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                                >
                                    Hadits
                                </button>
                                <button 
                                    onClick={() => changeTab('doa')}
                                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${activeTab === 'doa' ? 'bg-[#1799dc] text-white shadow-md' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                                >
                                    Doa Harian
                                </button>
                                <button 
                                    onClick={() => changeTab('dzikir')}
                                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${activeTab === 'dzikir' ? 'bg-[#1799dc] text-white shadow-md' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                                >
                                    Dzikir
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
                            {bookmark && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-8 p-4 bg-gradient-to-r from-[#1799dc]/10 to-[#2db2f5]/10 dark:from-[#1799dc]/20 dark:to-[#2db2f5]/20 rounded-2xl border border-[#1799dc]/20 dark:border-[#1799dc]/30 flex items-center justify-between group cursor-pointer"
                                    onClick={() => {
                                        const surah = surahs.find(s => s.nomor === bookmark.surahId);
                                        if (surah) handleSelectSurah(surah);
                                    }}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-[#1799dc] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#1799dc]/20">
                                            <Bookmark className="w-5 h-5 fill-current" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-[#1799dc] uppercase tracking-widest mb-0.5">Terakhir Dibaca</p>
                                            <h4 className="font-bold text-slate-800 dark:text-slate-100">Surat {bookmark.surahName}</h4>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-[#1799dc] group-hover:translate-x-1 transition-transform" />
                                </motion.div>
                            )}

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
                            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                                <button 
                                    onClick={() => { setSelectedSurah(null); setSurahDetail(null); }}
                                    className="flex items-center gap-2 text-slate-500 hover:text-[#1799dc] font-bold"
                                >
                                    <ArrowLeft className="w-5 h-5" /> Kembali
                                </button>
                                
                                <div className="flex bg-white dark:bg-slate-800 rounded-full p-1 shadow-sm border border-slate-200 dark:border-slate-700">
                                    <button 
                                        onClick={() => setQuranViewMode('list')}
                                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${quranViewMode === 'list' ? 'bg-[#1799dc] text-white shadow-md' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                                    >
                                        Terjemahan
                                    </button>
                                    <button 
                                        onClick={() => setQuranViewMode('mushaf')}
                                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${quranViewMode === 'mushaf' ? 'bg-[#1799dc] text-white shadow-md' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                                    >
                                        Mushaf
                                    </button>
                                </div>
                                
                                <div className="flex bg-white dark:bg-slate-800 rounded-full p-1 shadow-sm border border-slate-200 dark:border-slate-700 w-full sm:w-48 relative mt-3 sm:mt-0">
                                    <select
                                        title="Pilih Qari"
                                        value={selectedReciter}
                                        onChange={(e) => {
                                            if (playingAudio) toggleAudio(playingAudio);
                                            setSelectedReciter(e.target.value);
                                        }}
                                        className="bg-transparent text-xs font-bold text-slate-600 dark:text-slate-300 w-full pl-3 pr-8 py-1.5 focus:outline-none appearance-none cursor-pointer"
                                        style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
                                    >
                                        {RECITERS.map(r => (
                                            <option key={r.id} value={r.id} className="text-slate-800 dark:text-slate-800">{r.name}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        <ChevronDown className="w-4 h-4" />
                                    </div>
                                </div>

                                <button 
                                    onClick={handleBookmark}
                                    disabled={isSavingBookmark}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                        bookmark?.surahId === selectedSurah.number 
                                        ? 'bg-[#1799dc] text-white shadow-md' 
                                        : 'bg-white dark:bg-slate-800 text-[#1799dc] border border-[#1799dc]/20 hover:bg-[#1799dc] hover:text-white'
                                    }`}
                                >
                                    {isSavingBookmark ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : bookmark?.surahId === selectedSurah.number ? (
                                        <Bookmark className="w-4 h-4 fill-current" />
                                    ) : (
                                        <BookmarkPlus className="w-4 h-4" />
                                    )}
                                    {bookmark?.surahId === selectedSurah.number ? 'Tersimpan' : 'Tandai Surah'}
                                </button>
                            </div>
                            
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
                                quranViewMode === 'list' ? (
                                <div className="space-y-8">
                                    {surahDetail.ayat.map((ayah: any) => {
                                        const currentAudioUrl = (selectedReciter === "05" && ayah.quranComAudio) ? "https://verses.quran.com/" + ayah.quranComAudio.url : ayah.audio[selectedReciter];
                                        const segments = ayah.quranComAudio ? ayah.quranComAudio.segments : undefined;
                                        const isAyahPlaying = playingAudio === currentAudioUrl || playingAudio === ayah.audio[selectedReciter];

                                        return (
                                        <div id={`ayah-${ayah.nomorAyat}`} key={ayah.nomorAyat} className={`bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border relative transition-all duration-300 ${isAyahPlaying ? 'border-[#1799dc] ring-4 ring-[#1799dc]/10 dark:ring-[#1799dc]/20' : 'border-slate-100 dark:border-slate-700'}`}>
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="flex flex-col gap-3">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${isAyahPlaying ? 'bg-[#1799dc]/10 text-[#1799dc]' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                                                        {ayah.nomorAyat}
                                                    </div>
                                                    <button 
                                                        onClick={() => {
                                                            toggleAudio(currentAudioUrl, ayah.nomorAyat, segments);
                                                        }}
                                                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isAyahPlaying ? 'bg-[#1799dc] text-white shadow-md shadow-[#1799dc]/20' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-[#1799dc] hover:bg-slate-200 dark:hover:bg-slate-600'}`}
                                                        title="Putar Audio"
                                                    >
                                                        {isAyahPlaying ? <span className="w-3 h-3 bg-white rounded-sm"></span> : <PlayCircle className="w-5 h-5 ml-0.5" />}
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
                                                    <button 
                                                        onClick={() => handleCopy(`${ayah.teksArab}\n\n${ayah.teksIndonesia}`, `quran-${ayah.nomorAyat}`)}
                                                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${copiedId === `quran-${ayah.nomorAyat}` ? 'bg-green-100 text-green-600' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-[#8b5cf6]'}`}
                                                        title="Salin Ayat"
                                                    >
                                                        {copiedId === `quran-${ayah.nomorAyat}` ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                                    </button>
                                                    <button 
                                                        onClick={() => handleBookmark(ayah.nomorAyat)}
                                                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${bookmark?.surahId === selectedSurah.number && bookmark?.ayahNumber === ayah.nomorAyat ? 'bg-[#b08d57] text-white shadow-md shadow-[#b08d57]/20' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-[#b08d57]'}`}
                                                        title="Tandai Ayat Ini"
                                                    >
                                                        {bookmark?.surahId === selectedSurah.number && bookmark?.ayahNumber === ayah.nomorAyat ? <Bookmark className="w-5 h-5 fill-current" /> : <BookmarkPlus className="w-5 h-5" />}
                                                    </button>
                                                </div>
                                                <div className="flex-1 ml-6 text-right">
                                                    {ayah.quranComWords ? (
                                                        <p className="font-arabic text-3xl md:text-4xl leading-[2.2] md:leading-[2.5] text-slate-800 dark:text-slate-100" dir="rtl">
                                                            {ayah.quranComWords.map((word: any, wIndex: number) => {
                                                                return (
                                                                    <span key={word.id || wIndex}>
                                                                        <span 
                                                                            id={`word-${ayah.nomorAyat}-${wIndex}`}
                                                                            className={`inline transition-colors duration-200`}
                                                                            dangerouslySetInnerHTML={{ __html: word.text_uthmani_tajweed || word.text_uthmani || word.text }}
                                                                        />
                                                                        {" "}
                                                                    </span>
                                                                );
                                                            })}
                                                        </p>
                                                    ) : ayah.teksTajweed ? (
                                                        <p 
                                                            className={`font-arabic text-3xl md:text-4xl leading-[2.2] md:leading-[2.5] transition-colors duration-300 ${isAyahPlaying ? 'text-[#1799dc] dark:text-[#38bdf8]' : 'text-slate-800 dark:text-slate-100'}`}
                                                            dangerouslySetInnerHTML={{ __html: ayah.teksTajweed }} 
                                                            dir="rtl"
                                                        />
                                                    ) : (
                                                        <p className={`font-arabic text-3xl md:text-4xl leading-[2.2] md:leading-[2.5] transition-colors duration-300 ${isAyahPlaying ? 'text-[#1799dc] dark:text-[#38bdf8]' : 'text-slate-800 dark:text-slate-100'}`} dir="rtl">{ayah.teksArab}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="border-t border-slate-100 dark:border-slate-700/50 pt-4 mt-6">
                                                <p className={`text-sm font-medium mb-2 transition-colors duration-300 ${playingAudio === ayah.audio[selectedReciter] ? 'text-[#1799dc] dark:text-[#38bdf8]' : 'text-primary-600 dark:text-primary-400'}`}>{ayah.teksLatin}</p>
                                                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm md:text-base mb-4">{ayah.teksIndonesia}</p>
                                                
                                                {ayah.tafsir && (
                                                    <div className="mb-4">
                                                        <button
                                                            onClick={() => setOpenTafsirAyah(openTafsirAyah === ayah.nomorAyat ? null : ayah.nomorAyat)}
                                                            className="flex items-center gap-2 text-sm font-medium text-[#b08d57] hover:text-[#8b6d3a] transition-colors"
                                                        >
                                                            <Book className="w-4 h-4" />
                                                            {openTafsirAyah === ayah.nomorAyat ? 'Tutup Tafsir & Asbabun Nuzul' : 'Tafsir & Asbabun Nuzul'}
                                                            <ChevronDown className={`w-4 h-4 transition-transform ${openTafsirAyah === ayah.nomorAyat ? 'rotate-180' : ''}`} />
                                                        </button>
                                                        <AnimatePresence>
                                                            {openTafsirAyah === ayah.nomorAyat && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                                                    animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                                                                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                                                    className="overflow-hidden"
                                                                >
                                                                    <div className="bg-[#b08d57]/5 dark:bg-[#b08d57]/10 rounded-2xl p-5 border border-[#b08d57]/20">
                                                                        <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                                                                            <BookOpen className="w-5 h-5 text-[#b08d57]" />
                                                                            Tafsir & Asbabun Nuzul (Kemenag RI)
                                                                        </h4>
                                                                        <div className="text-sm md:text-base text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed" style={{ textAlign: 'justify' }}>
                                                                            {ayah.tafsir}
                                                                        </div>
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                )}

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
                                        );
                                    })}
                                </div>
                                ) : (
                                    <div 
                                        className="bg-[#fcfaf5] dark:bg-[#1a202c] rounded-3xl shadow-lg shadow-black/5 border border-[#e8dccb] dark:border-[#2d3748] relative min-h-[500px] overflow-hidden"
                                        onTouchStart={handleTouchStart}
                                        onTouchEnd={handleTouchEnd}
                                    >
                                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-[0.03] dark:opacity-5 pointer-events-none mix-blend-multiply dark:mix-blend-lighten rounded-3xl z-0"></div>
                                        
                                        <AnimatePresence mode="popLayout" initial={false}>
                                            {mushafPages.length > 0 && (
                                                <motion.div 
                                                    key={mushafPageIdx}
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: -20 }}
                                                    transition={{ duration: 0.3 }}
                                                    className="w-full p-6 sm:p-10 md:p-14 pb-8 relative z-10"
                                                >
                                                    {(mushafPageIdx === 0) && (
                                                        <>
                                                            <div className="relative w-full mb-8">
                                                                <h1 className="text-center font-arabic text-3xl md:text-5xl font-bold text-[#b08d57] opacity-80">{surahDetail.nama}</h1>
                                                            </div>
                                                            {surahDetail.nomor > 1 && surahDetail.nomor !== 9 && (
                                                                <div className="flex justify-center mb-10 w-full relative z-10">
                                                                    <h3 className="font-arabic text-3xl md:text-4xl text-[#2c241b] dark:text-[#f7fafc]" dir="rtl">
                                                                        بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم
                                                                    </h3>
                                                                </div>
                                                            )}
                                                        </>
                                                    )}

                                                    <div className="font-arabic text-[28px] sm:text-3xl md:text-4xl leading-[2.2] sm:leading-[2.4] md:leading-[2.5] text-[#2c241b] dark:text-[#f7fafc] text-justify relative z-10" dir="rtl" style={{ textJustify: 'inter-word', textAlignLast: 'center' }}>
                                                        {mushafPages[mushafPageIdx]?.map((ayah: any) => {
                                                            const currentAudioUrl = (selectedReciter === "05" && ayah.quranComAudio) ? "https://verses.quran.com/" + ayah.quranComAudio.url : ayah.audio[selectedReciter];
                                                            const isAyahPlaying = playingAudio === currentAudioUrl || playingAudio === ayah.audio[selectedReciter];
                                                            return (
                                                            <span 
                                                                key={ayah.nomorAyat} 
                                                                className={`inline transition-colors duration-300 cursor-pointer rounded px-0.5 outline-none ${activeAyahAction === ayah.nomorAyat || isAyahPlaying ? 'bg-[#b08d57]/20 dark:bg-[#b08d57]/30 ring-2 ring-[#b08d57]/40' : 'hover:bg-black/5 dark:hover:bg-white/10'}`} 
                                                                onClick={() => setActiveAyahAction(activeAyahAction === ayah.nomorAyat ? null : ayah.nomorAyat)}
                                                            >
                                                                {ayah.quranComWords ? (
                                                                    <>
                                                                        {ayah.quranComWords.map((word: any, wIndex: number) => (
                                                                            <span key={wIndex}>
                                                                                <span dangerouslySetInnerHTML={{ __html: word.text_uthmani_tajweed || word.text_uthmani || word.text }} />
                                                                                {" "}
                                                                            </span>
                                                                        ))}
                                                                    </>
                                                                ) : ayah.teksTajweed ? (
                                                                    <span dangerouslySetInnerHTML={{ __html: ayah.teksTajweed + " " }} />
                                                                ) : (
                                                                    <span>{ayah.teksArab + " "}</span>
                                                                )}
                                                                <span className="inline-flex flex-col items-center justify-center align-middle relative mx-1 mt-1 mb-1.5 text-[#b08d57] transition-colors leading-none">
                                                                    <span className="text-3xl sm:text-4xl lg:text-5xl font-normal opacity-90" style={{fontFamily: 'system-ui', lineHeight: 1}}>۝</span>
                                                                    <span className="absolute inset-0 flex items-center justify-center text-[10px] sm:text-xs lg:text-sm font-bold font-sans" style={{fontFeatureSettings: '"tnum"'}} dir="ltr">
                                                                        {toArabicNumber(ayah.nomorAyat)}
                                                                    </span>
                                                                </span>
                                                                {" "}
                                                            </span>
                                                            );
                                                        })}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* Pagination Controls */}
                                        {mushafPages.length > 1 && (
                                            <div className="relative z-20 flex justify-between items-center px-6 pb-6 w-full">
                                                <button 
                                                    onClick={() => setMushafPageIdx(v => Math.max(v - 1, 0))}
                                                    disabled={mushafPageIdx === 0}
                                                    className="p-2 rounded-full bg-[#b08d57]/10 text-[#b08d57] hover:bg-[#b08d57]/20 disabled:opacity-30 transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
                                                >
                                                    <ChevronLeft className="w-5 h-5" />
                                                    <span className="hidden sm:inline">Sebelumnya</span>
                                                </button>
                                                
                                                <div className="flex flex-col items-center opacity-60">
                                                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#b08d57] mb-1">Geser</span>
                                                    <span className="text-sm font-mono text-[#b08d57] font-semibold">{mushafPageIdx + 1} / {mushafPages.length}</span>
                                                </div>

                                                <button 
                                                    onClick={() => setMushafPageIdx(v => Math.min(v + 1, mushafPages.length - 1))}
                                                    disabled={mushafPageIdx === mushafPages.length - 1}
                                                    className="p-2 rounded-full bg-[#b08d57]/10 text-[#b08d57] hover:bg-[#b08d57]/20 disabled:opacity-30 transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
                                                >
                                                    <span className="hidden sm:inline">Selanjutnya</span>
                                                    <ChevronRight className="w-5 h-5" />
                                                </button>
                                            </div>
                                        )}

                                        {/* Tajweed Legend */}
                                        <div className="relative z-10 w-full mt-4 pb-8 border-t border-[#b08d57]/20 pt-8 flex flex-wrap gap-x-6 gap-y-3 justify-center items-center text-[10px] sm:text-xs font-semibold text-slate-600 dark:text-slate-300 bg-[#fcfaf5]/80 dark:bg-[#1a202c]/80 backdrop-blur-sm">
                                            <span className="opacity-60 uppercase tracking-widest text-[10px] w-full text-center mb-1">Panduan Warna Tajwid</span>
                                            {tajweedDefinitions.map((def) => (
                                                <span key={def.name} className="flex items-center gap-1.5" title={def.meaning}>
                                                    <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full" style={{ backgroundColor: def.color }}></span> 
                                                    {def.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )
                            ) : null}
                        </div>
                    )}

                    {/* Floating Bottom Panel for Mushaf Mode */}
                    <AnimatePresence>
                        {activeTab === 'quran' && selectedSurah && surahDetail && quranViewMode === 'mushaf' && activeAyahAction !== null && (
                            <motion.div 
                                initial={{ opacity: 0, y: 100 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 100 }}
                                className="fixed bottom-0 left-0 right-0 z-[100] p-4 pb-8 md:p-6"
                            >
                                {(() => {
                                    const ayah = surahDetail.ayat.find((a: any) => a.nomorAyat === activeAyahAction);
                                    if (!ayah) return null;
                                    return (
                                        <div className="max-w-2xl mx-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl shadow-[0_10px_50px_rgba(0,0,0,0.2)] border border-slate-200/50 dark:border-slate-800/50 p-5 md:p-6 relative">
                                            <button 
                                                onClick={() => setActiveAyahAction(null)}
                                                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                            
                                            <div className="mb-4 pr-10">
                                                <span className="inline-block px-3 py-1 bg-[#1799dc]/10 text-[#1799dc] font-bold text-xs rounded-full border border-[#1799dc]/20 mb-3">
                                                    Surat {selectedSurah.namaLatin} : Ayat {ayah.nomorAyat}
                                                </span>
                                                <p className="text-slate-700 dark:text-slate-200 text-sm md:text-base leading-relaxed font-semibold">
                                                    {ayah.teksIndonesia}
                                                </p>
                                                {ayah.tafsir && (
                                                    <div className="mt-4">
                                                        <button
                                                            onClick={() => setOpenTafsirAyah(openTafsirAyah === ayah.nomorAyat ? null : ayah.nomorAyat)}
                                                            className="flex items-center gap-2 text-sm font-medium text-[#b08d57] hover:text-[#8b6d3a] transition-colors"
                                                        >
                                                            <Book className="w-4 h-4" />
                                                            {openTafsirAyah === ayah.nomorAyat ? 'Tutup Tafsir & Asbabun Nuzul' : 'Tafsir & Asbabun Nuzul'}
                                                            <ChevronDown className={`w-4 h-4 transition-transform ${openTafsirAyah === ayah.nomorAyat ? 'rotate-180' : ''}`} />
                                                        </button>
                                                        <AnimatePresence>
                                                            {openTafsirAyah === ayah.nomorAyat && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                                                    animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                                                                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                                                    className="overflow-hidden"
                                                                >
                                                                    <div className="bg-[#b08d57]/5 dark:bg-[#b08d57]/10 rounded-xl p-4 border border-[#b08d57]/20 max-h-48 overflow-y-auto custom-scrollbar">
                                                                        <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-2 text-sm">
                                                                            <BookOpen className="w-4 h-4 text-[#b08d57]" />
                                                                            Tafsir & Asbabun Nuzul (Kemenag RI)
                                                                        </h4>
                                                                        <div className="text-xs md:text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed" style={{ textAlign: 'justify' }}>
                                                                            {ayah.tafsir}
                                                                        </div>
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                                <button 
                                                    onClick={() => {
                                                        const currentAudioUrl = (selectedReciter === "05" && ayah.quranComAudio) ? "https://verses.quran.com/" + ayah.quranComAudio.url : ayah.audio[selectedReciter];
                                                        const segments = ayah.quranComAudio ? ayah.quranComAudio.segments : undefined;
                                                        toggleAudio(currentAudioUrl, ayah.nomorAyat, segments);
                                                    }}
                                                    className={`px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-sm transition-all ${((selectedReciter === "05" && ayah.quranComAudio && playingAudio === "https://verses.quran.com/" + ayah.quranComAudio.url) || playingAudio === ayah.audio[selectedReciter]) ? 'bg-[#1799dc] text-white shadow-md shadow-[#1799dc]/20' : 'bg-[#1799dc]/10 text-[#1799dc] hover:bg-[#1799dc]/20'}`}
                                                >
                                                    {((selectedReciter === "05" && ayah.quranComAudio && playingAudio === "https://verses.quran.com/" + ayah.quranComAudio.url) || playingAudio === ayah.audio[selectedReciter]) ? <span className="w-3 h-3 bg-white rounded-sm animate-pulse"></span> : <PlayCircle className="w-4 h-4" />}
                                                    <span className="hidden sm:inline">Putar Murottal</span>
                                                    <span className="sm:hidden">Murottal</span>
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        toggleSpeechAudio(ayah.teksIndonesia, `quran-trans-${ayah.nomorAyat}`, 'id-ID');
                                                    }}
                                                    className={`px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-sm transition-all ${playingAudio === `quran-trans-${ayah.nomorAyat}` ? 'bg-[#8b5cf6] text-white shadow-md shadow-[#8b5cf6]/20' : 'bg-[#8b5cf6]/10 text-[#8b5cf6] hover:bg-[#8b5cf6]/20'}`}
                                                >
                                                    {playingAudio === `quran-trans-${ayah.nomorAyat}` ? <span className="w-3 h-3 bg-white rounded-sm animate-pulse"></span> : <FileText className="w-4 h-4" />}
                                                    <span className="hidden sm:inline">Putar Terjemahan</span>
                                                    <span className="sm:hidden">Terjemahan</span>
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        recordingAyah === ayah.nomorAyat ? stopRecording() : startRecording(ayah.nomorAyat);
                                                    }}
                                                    disabled={evaluatingAyah === ayah.nomorAyat || (recordingAyah !== null && recordingAyah !== ayah.nomorAyat)}
                                                    className={`px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-sm transition-all ${recordingAyah === ayah.nomorAyat ? 'bg-red-500 text-white shadow-md shadow-red-500/30 animate-pulse' : evaluatingAyah === ayah.nomorAyat ? 'bg-amber-100 text-amber-500 cursor-not-allowed' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 hover:text-slate-900 dark:hover:text-white'} disabled:opacity-50`}
                                                >
                                                    {evaluatingAyah === ayah.nomorAyat ? <Loader2 className="w-4 h-4 animate-spin" /> : recordingAyah === ayah.nomorAyat ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                                                    Talaqqi
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        setQuranViewMode('list'); 
                                                        setActiveAyahAction(null); 
                                                        setTimeout(() => {
                                                            const el = document.getElementById(`ayah-${ayah.nomorAyat}`);
                                                            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                            el?.classList.add('ring-4', 'ring-[#1799dc]/30');
                                                            setTimeout(() => el?.classList.remove('ring-4', 'ring-[#1799dc]/30'), 2000);
                                                        }, 100);
                                                    }} 
                                                    className="px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-sm bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all ml-auto"
                                                >
                                                    <AlignLeft className="w-4 h-4" /> Detail
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </motion.div>
                        )}
                    </AnimatePresence>


                    {/* HADITS TAB */}
                    {activeTab === 'hadits' && !selectedBook && (
                        <div>
                            {loadingBooks ? (
                                <div className="flex justify-center items-center py-20">
                                    <Loader2 className="w-8 h-8 animate-spin text-[#1799dc]" />
                                </div>
                            ) : (
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {books.map((book, index) => (
                                        <button 
                                            key={book.id}
                                            onClick={() => handleSelectBook(book)}
                                            className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm hover:shadow-md border border-slate-100 dark:border-slate-700 flex items-center gap-4 text-left transition-all hover:border-[#1799dc]/30 group"
                                        >
                                            <div className="w-12 h-12 bg-[#1799dc]/10 rounded-xl flex items-center justify-center text-[#1799dc] font-black text-lg group-hover:bg-[#1799dc] group-hover:text-white transition-all">
                                                {index + 1}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-black text-slate-800 dark:text-slate-100 text-base md:text-lg group-hover:text-[#1799dc] transition-colors">{book.name}</h3>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{book.available} Hadits</p>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-[#1799dc] group-hover:translate-x-1 transition-all" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* HADITH DETAIL VIEW */}
                    {activeTab === 'hadits' && selectedBook && (
                        <div>
                            <div className="flex items-center justify-between mb-8">
                                <button 
                                    onClick={() => { setSelectedBook(null); setHadiths([]); }}
                                    className="flex items-center gap-2 text-slate-500 hover:text-[#1799dc] font-bold group"
                                >
                                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Kembali
                                </button>
                                <div className="text-right">
                                    <h2 className="text-xl md:text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">{selectedBook.name}</h2>
                                    <p className="text-[10px] font-black text-[#1799dc] uppercase tracking-widest">{selectedBook.available} Koleksi Hadits</p>
                                </div>
                            </div>

                            <div className="relative w-full max-w-md mx-auto mb-10">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input 
                                    type="text" 
                                    placeholder={`Cari dalam ${selectedBook.name}...`}
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
                                <div className="space-y-10">
                                    {filteredHadiths.map((hadith) => (
                                        <div key={hadith.number} className="bg-white dark:bg-slate-800 p-8 md:p-10 rounded-[3rem] shadow-sm hover:shadow-md border border-slate-100 dark:border-slate-700 transition-all group overflow-hidden relative">
                                            <div className="absolute top-0 right-0 w-48 h-48 bg-[#1799dc]/5 blur-[60px] -mr-24 -mt-24 rounded-full"></div>
                                            
                                            <div className="relative z-10">
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6 border-b border-slate-50 dark:border-slate-700/50">
                                                    <div className="flex-1">
                                                        <h3 className="font-black text-slate-800 dark:text-slate-100 text-lg md:text-xl leading-tight mb-3 group-hover:text-[#1799dc] transition-colors">
                                                            {getHadithTitle(hadith.id)}
                                                        </h3>
                                                        <div className="flex items-center gap-3">
                                                            <span className="px-2.5 py-1 bg-[#1799dc]/10 text-[#1799dc] rounded-full text-[9px] font-black uppercase tracking-widest">
                                                                {selectedBook.name}
                                                            </span>
                                                            <span className="text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-widest">
                                                                Hadits #{hadith.number}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <button 
                                                            onClick={() => handleCopy(`${hadith.arab}\n\n${hadith.id}`, `hadith-${hadith.number}`)}
                                                            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all active:scale-95 ${copiedId === `hadith-${hadith.number}` ? 'bg-green-100 text-green-600' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600 hover:text-slate-800'}`}
                                                            title="Salin Hadits"
                                                        >
                                                            {copiedId === `hadith-${hadith.number}` ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                                        </button>
                                                        <button 
                                                            type="button"
                                                            onClick={(e) => { e.stopPropagation(); toggleHadithAudio(hadith.arab, hadith.number, 'ar-SA'); }}
                                                            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${playingAudio === 'hadith-' + hadith.number + '-ar-SA' ? 'bg-[#1799dc] text-white shadow-xl shadow-[#1799dc]/30 scale-110' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-[#1799dc] hover:bg-slate-200 active:scale-95'}`}
                                                            title="Putar Audio Arab"
                                                        >
                                                            {playingAudio === 'hadith-' + hadith.number + '-ar-SA' ? (
                                                                <div className="flex items-center gap-0.5">
                                                                    <span className="w-1 h-4 bg-white rounded-full animate-pulse"></span>
                                                                    <span className="w-1 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                                                                    <span className="w-1 h-4 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
                                                                </div>
                                                            ) : <PlayCircle className="w-7 h-7" />}
                                                        </button>
                                                        <button 
                                                            type="button"
                                                            onClick={(e) => { e.stopPropagation(); toggleHadithAudio(hadith.id, hadith.number, 'id-ID'); }}
                                                            className={`px-4 h-12 rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 text-xs font-black ${playingAudio === 'hadith-' + hadith.number + '-id-ID' ? 'bg-[#8b5cf6] text-white shadow-xl shadow-[#8b5cf6]/30 scale-105' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-[#8b5cf6] hover:bg-slate-200 active:scale-95'}`}
                                                            title="Dengarkan Terjemahan"
                                                        >
                                                            {playingAudio === 'hadith-' + hadith.number + '-id-ID' ? <div className="w-2 h-2 bg-white rounded-full animate-ping" /> : <FileText className="w-4 h-4" />}
                                                            {playingAudio === 'hadith-' + hadith.number + '-id-ID' ? 'Memutar' : 'Terjemahan'}
                                                        </button>
                                                    </div>
                                                </div>
                                                <p 
                                                    onClick={() => toggleHadithAudio(hadith.arab, hadith.number, 'ar-SA')}
                                                    className="font-arabic text-xl md:text-3xl leading-[2.2] md:leading-[2.5] text-slate-800 dark:text-slate-100 text-right mb-10 cursor-pointer hover:text-[#1799dc] transition-colors" 
                                                    dir="rtl"
                                                >
                                                    {hadith.arab}
                                                </p>
                                                <div className="relative pl-6 border-l-4 border-[#1799dc]/20 dark:border-slate-700">
                                                    <div className="absolute -left-1.5 top-0 w-2.5 h-2.5 bg-[#1799dc] rounded-full"></div>
                                                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed md:text-lg italic font-medium whitespace-pre-line">
                                                        {hadith.id.split(/(\[[^\]]+\])/).map((part: string, i: number) => {
                                                            if (part.startsWith('[') && part.endsWith(']')) {
                                                                return <span key={i} className="text-[#1799dc] dark:text-[#2db2f5] not-italic font-black decoration-dotted underline underline-offset-4">{part}</span>;
                                                            }
                                                            return part;
                                                        })}
                                                    </p>
                                                </div>
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
                            {selectedDoa ? (
                                <div>
                                    <button 
                                        onClick={() => setSelectedDoa(null)}
                                        className="flex items-center gap-2 text-slate-500 hover:text-[#1799dc] mb-6 transition-colors font-bold group"
                                    >
                                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                                        Kembali ke Daftar Doa
                                    </button>

                                    <div className="bg-white dark:bg-slate-800 p-8 md:p-12 rounded-[3.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 overflow-hidden relative">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#1799dc]/5 blur-[80px] -mr-32 -mt-32 rounded-full"></div>
                                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#8b5cf6]/5 blur-[80px] -ml-32 -mb-32 rounded-full"></div>
                                        
                                        <div className="relative z-10">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 pb-8 border-b border-slate-50 dark:border-slate-700/50">
                                                <div className="flex-1">
                                                    <h2 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-slate-100 mb-3 tracking-tight">
                                                        {selectedDoa.doa}
                                                    </h2>
                                                    {selectedDoa.riwayat && (
                                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 rounded-xl text-[10px] font-bold uppercase tracking-widest">
                                                            <BookOpen className="w-3.5 h-3.5" />
                                                            {parseRiwayat(selectedDoa.riwayat, selectedDoa.ayat, selectedDoa.artinya)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3 shrink-0">
                                                    <button 
                                                        onClick={() => handleCopy(`${selectedDoa.ayat}\n\n${selectedDoa.artinya}`, `doa-${selectedDoa.id}`)}
                                                        className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all active:scale-95 ${copiedId === `doa-${selectedDoa.id}` ? 'bg-green-100 text-green-600' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600 hover:text-slate-800'}`}
                                                        title="Salin Doa"
                                                    >
                                                        {copiedId === `doa-${selectedDoa.id}` ? <Check className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
                                                    </button>
                                                    <button 
                                                        onClick={() => toggleSpeechAudio(selectedDoa.ayat, `doa-ar-${selectedDoa.id}`, 'ar-SA')}
                                                        className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${playingAudio === `doa-ar-${selectedDoa.id}` ? 'bg-[#1799dc] text-white shadow-2xl shadow-[#1799dc]/40 scale-110' : 'bg-[#1799dc]/10 text-[#1799dc] hover:bg-[#1799dc] hover:text-white active:scale-95'}`}
                                                        title="Putar Audio Arab"
                                                    >
                                                        {playingAudio === `doa-ar-${selectedDoa.id}` ? (
                                                            <div className="flex items-center gap-1">
                                                                <span className="w-1 h-5 bg-white rounded-full animate-pulse"></span>
                                                                <span className="w-1 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                                                                <span className="w-1 h-5 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
                                                            </div>
                                                        ) : (
                                                            <PlayCircle className="w-8 h-8 ml-0.5" />
                                                        )}
                                                    </button>
                                                    <button 
                                                        onClick={() => toggleSpeechAudio(selectedDoa.artinya, `doa-id-${selectedDoa.id}`, 'id-ID')}
                                                        className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${playingAudio === `doa-id-${selectedDoa.id}` ? 'bg-[#8b5cf6] text-white shadow-2xl shadow-[#8b5cf6]/40 scale-110' : 'bg-[#8b5cf6]/10 text-[#8b5cf6] hover:bg-[#8b5cf6] hover:text-white active:scale-95'}`}
                                                        title="Putar Audio Terjemahan"
                                                    >
                                                        {playingAudio === `doa-id-${selectedDoa.id}` ? (
                                                            <div className="flex items-center gap-1">
                                                                <span className="w-1 h-5 bg-white rounded-full animate-pulse"></span>
                                                                <span className="w-1 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                                                                <span className="w-1 h-5 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
                                                            </div>
                                                        ) : (
                                                            <PlayCircle className="w-8 h-8 ml-0.5" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="space-y-12">
                                                <div className="text-center md:text-right">
                                                    <p className="font-arabic text-3xl md:text-5xl leading-[2.2] md:leading-[2.5] text-slate-800 dark:text-slate-100" dir="rtl">
                                                        {selectedDoa.ayat}
                                                    </p>
                                                </div>
                                                
                                                <div className="bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-[2rem] p-8 border border-slate-100 dark:border-slate-700 relative group">
                                                    <div className="absolute -top-3 -left-3 w-10 h-10 bg-white dark:bg-slate-700 rounded-xl shadow-md flex items-center justify-center border border-slate-100 dark:border-slate-600">
                                                        <AlignRight className="w-5 h-5 text-[#1799dc]" />
                                                    </div>
                                                    <p className="text-[#1799dc] font-black mb-4 tracking-widest uppercase text-[10px]">Transliterasi & Makna</p>
                                                    <p className="text-slate-500 dark:text-slate-400 font-medium italic mb-6 leading-relaxed text-base md:text-lg">
                                                        {selectedDoa.latin}
                                                    </p>
                                                    <p className="text-slate-800 dark:text-slate-200 leading-relaxed text-lg md:text-xl font-black">
                                                        {selectedDoa.artinya}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            ) : (
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
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {filteredDoas.map((doa) => (
                                                <button 
                                                    key={doa.id}
                                                    onClick={() => {
                                                        setSelectedDoa(doa);
                                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                                    }}
                                                    className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-[#1799dc] border border-slate-100 dark:border-slate-700 transition-all text-left group"
                                                >
                                                    <div className="flex justify-between items-center gap-3">
                                                        <h3 className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-[#1799dc] transition-colors line-clamp-1">
                                                            {doa.doa}
                                                        </h3>
                                                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-[#1799dc] group-hover:translate-x-1 transition-all shrink-0" />
                                                    </div>
                                                </button>
                                            ))}

                                            {filteredDoas.length === 0 && doas.length > 0 && (
                                                <div className="col-span-full text-center py-10 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                                                    Tidak ada doa yang cocok dengan pencarian Anda.
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'dzikir' && (
                        <div>
                            {selectedDzikir ? (
                                <div>
                                    <button 
                                        onClick={() => setSelectedDzikir(null)}
                                        className="flex items-center gap-2 text-slate-500 hover:text-[#1799dc] mb-6 transition-colors font-bold group"
                                    >
                                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                                        Kembali ke Daftar Dzikir
                                    </button>

                                    <div className="bg-white dark:bg-slate-800 p-8 md:p-12 rounded-[3.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 overflow-hidden relative">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#1799dc]/5 blur-[80px] -mr-32 -mt-32 rounded-full"></div>
                                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#8b5cf6]/5 blur-[80px] -ml-32 -mb-32 rounded-full"></div>
                                        
                                        <div className="relative z-10">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 pb-8 border-b border-slate-50 dark:border-slate-700/50">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <span className="px-3 py-1 bg-[#1799dc]/10 text-[#1799dc] rounded-full text-[9px] font-black uppercase tracking-widest">
                                                            {selectedDzikir.category}
                                                        </span>
                                                        {selectedDzikir.note && (
                                                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                                                                <Sparkles className="w-3 h-3" />
                                                                {selectedDzikir.note}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <h2 className="font-black text-slate-800 dark:text-slate-100 text-2xl md:text-3xl leading-tight tracking-tight">
                                                        {selectedDzikir.title}
                                                    </h2>
                                                </div>
                                                <div className="flex items-center gap-3 shrink-0">
                                                    <button 
                                                        onClick={() => handleCopy(`${selectedDzikir.arab}\n\n${selectedDzikir.translation}`, `dzikir-${selectedDzikir.id}`)}
                                                        className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all active:scale-95 ${copiedId === `dzikir-${selectedDzikir.id}` ? 'bg-green-100 text-green-600' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600 hover:text-slate-800'}`}
                                                        title="Salin Dzikir"
                                                    >
                                                        {copiedId === `dzikir-${selectedDzikir.id}` ? <Check className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
                                                    </button>
                                                    <button 
                                                        onClick={() => toggleSpeechAudio(selectedDzikir.arab, `dz-ar-${selectedDzikir.id}`, 'ar-SA')}
                                                        className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${playingAudio === `dz-ar-${selectedDzikir.id}` ? 'bg-[#1799dc] text-white shadow-2xl shadow-[#1799dc]/40 scale-110' : 'bg-[#1799dc]/10 text-[#1799dc] hover:bg-[#1799dc] hover:text-white active:scale-95'}`}
                                                        title="Putar Audio Arab"
                                                    >
                                                        {playingAudio === `dz-ar-${selectedDzikir.id}` ? (
                                                            <div className="flex items-center gap-1">
                                                                <span className="w-1 h-5 bg-white rounded-full animate-pulse"></span>
                                                                <span className="w-1 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                                                                <span className="w-1 h-5 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
                                                            </div>
                                                        ) : (
                                                            <PlayCircle className="w-8 h-8 ml-0.5" />
                                                        )}
                                                    </button>
                                                    <button 
                                                        onClick={() => toggleSpeechAudio(selectedDzikir.translation, `dz-id-${selectedDzikir.id}`, 'id-ID')}
                                                        className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${playingAudio === `dz-id-${selectedDzikir.id}` ? 'bg-[#8b5cf6] text-white shadow-2xl shadow-[#8b5cf6]/40 scale-110' : 'bg-[#8b5cf6]/10 text-[#8b5cf6] hover:bg-[#8b5cf6] hover:text-white active:scale-95'}`}
                                                        title="Putar Audio Terjemahan"
                                                    >
                                                        {playingAudio === `dz-id-${selectedDzikir.id}` ? (
                                                            <div className="flex items-center gap-1">
                                                                <span className="w-1 h-5 bg-white rounded-full animate-pulse"></span>
                                                                <span className="w-1 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                                                                <span className="w-1 h-5 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
                                                            </div>
                                                        ) : (
                                                            <PlayCircle className="w-8 h-8 ml-0.5" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
 
                                            <div className="flex flex-col gap-10">
                                                <div className="text-center md:text-right">
                                                    <p className="font-arabic text-3xl md:text-5xl leading-[2.2] md:leading-[2.5] text-slate-800 dark:text-slate-100" dir="rtl">
                                                        {selectedDzikir.arab}
                                                    </p>
                                                </div>
                                                <div className="bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-[2rem] p-8 border border-slate-100 dark:border-slate-700 relative group">
                                                    <div className="absolute -top-3 -left-3 w-10 h-10 bg-white dark:bg-slate-700 rounded-xl shadow-md flex items-center justify-center border border-slate-100 dark:border-slate-600">
                                                        <Activity className="w-5 h-5 text-[#1799dc]" />
                                                    </div>
                                                    <p className="text-[10px] font-black text-[#1799dc] mb-4 tracking-widest uppercase">Latin & Terjemahan</p>
                                                    <p className="text-slate-500 dark:text-slate-400 font-medium italic mb-6 leading-relaxed text-base md:text-lg">
                                                        {selectedDzikir.latin}
                                                    </p>
                                                    <p className="text-slate-800 dark:text-slate-200 leading-relaxed text-lg md:text-xl font-black">
                                                        {selectedDzikir.translation}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            ) : (
                                <div>
                                    <div className="flex flex-wrap justify-center gap-2 mb-8">
                                        {['Al-Ma\'tsurat Pagi', 'Al-Ma\'tsurat Petang', 'Setelah Sholat'].map((cat) => (
                                            <button
                                                key={cat}
                                                onClick={() => setSelectedDzikirCategory(cat)}
                                                className={`px-4 py-2 rounded-xl text-sm font-black transition-all ${selectedDzikirCategory === cat ? 'bg-[#1799dc] text-white shadow-lg shadow-[#1799dc]/20 active:scale-95' : 'bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-100 dark:border-slate-700'}`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="relative max-w-md mx-auto mb-8">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input 
                                            type="text" 
                                            placeholder={`Cari Dzikir di ${selectedDzikirCategory}...`}
                                            value={searchDzikir}
                                            onChange={(e) => setSearchDzikir(e.target.value)}
                                            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-[#1799dc]/50 outline-none transition-shadow block"
                                        />
                                    </div>

                                    {loadingDzikirs ? (
                                        <div className="flex justify-center items-center py-20">
                                            <Loader2 className="w-8 h-8 animate-spin text-[#1799dc]" />
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <AnimatePresence mode="popLayout">
                                                {filteredDzikirs.map((dzikir) => (
                                                    <motion.button 
                                                        key={dzikir.id}
                                                        layout
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, scale: 0.95 }}
                                                        onClick={() => {
                                                            setSelectedDzikir(dzikir);
                                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                                        }}
                                                        className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-[#1799dc] border border-slate-100 dark:border-slate-700 transition-all text-left group"
                                                    >
                                                        <div className="flex justify-between items-center gap-3">
                                                            <div className="flex-1 min-w-0">
                                                                <h3 className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-[#1799dc] transition-colors line-clamp-1">
                                                                    {dzikir.title}
                                                                </h3>
                                                            </div>
                                                            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-[#1799dc] group-hover:translate-x-1 transition-all shrink-0" />
                                                        </div>
                                                    </motion.button>
                                                ))}
                                            </AnimatePresence>

                                            {filteredDzikirs.length === 0 && dzikirs.length > 0 && (
                                                <div className="col-span-full text-center py-10 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                                                    Tidak ada dzikir yang cocok dengan pencarian Anda di kategori ini.
                                                </div>
                                            )}
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
