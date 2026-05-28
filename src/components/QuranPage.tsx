import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Book, ArrowLeft, Search, Bookmark, BookmarkPlus, AlignRight, AlignLeft, FileText, ChevronRight, ChevronLeft, ChevronDown, PlayCircle, Play, Pause, Loader2, Mic, Square, Activity, Sparkles, Copy, Check, X, MapPin, Volume2, BrainCircuit, Eye, CheckCircle2, ArrowRight } from 'lucide-react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { db, auth, OperationType, handleFirestoreError } from '../firebase';
import { doc, getDoc, setDoc, serverTimestamp, getDocs, collection } from 'firebase/firestore';
import doaData from '../data/doa.json';
import dzikirData from '../data/dzikir.json';
import MakhrajPage from './MakhrajPage';

const RECITERS = [
    { id: "7", name: "Syaikh Mishari Rashid Al-Afasy", fallback: "05" },
    { id: "3", name: "Syaikh Abdurrahman as-Sudais", fallback: "03" },
    { id: "10", name: "Syaikh Saud ash-Shuraym" },
    { id: "4", name: "Syaikh Abu Bakr Al-Shatri" },
    { id: "5", name: "Syaikh Hani ar-Rifai" },
    { id: "6", name: "Syaikh Mahmoud Khalil Al-Husary", style: "Murattal" },
    { id: "12", name: "Syaikh Mahmoud Khalil Al-Husary", style: "Muallim (Guru)" },
    { id: "2", name: "Syaikh AbdulBaset AbdulSamad", style: "Murattal" },
    { id: "1", name: "Syaikh AbdulBaset AbdulSamad", style: "Mujawwad" },
    { id: "9", name: "Syaikh Mohamed Siddiq al-Minshawi", style: "Murattal" },
    { id: "8", name: "Syaikh Mohamed Siddiq al-Minshawi", style: "Mujawwad" },
    { id: "11", name: "Syaikh Mohamed al-Tablawi" },
    { id: "01", name: "Syaikh Abdullah Al-Juhany" },
    { id: "02", name: "Syaikh Abdul Muhsin Al-Qasim" },
    { id: "04", name: "Syaikh Ibrahim Idris / Al-Dossari" },
    { id: "06", name: "Syaikh Yasser Al-Dosari" },
    { id: "05", name: "Syaikh Mishari Rashid Al-Afasy (Full)" }
];

export default function QuranPage() {
    const navigate = useNavigate();
    const { tab } = useParams<{ tab: string }>();
    const [selectedReciter, setSelectedReciter] = useState<string>("7");
    const location = useLocation();
    
    const activeTabParam = (tab as 'quran' | 'hadits' | 'doa' | 'dzikir' | 'kisahnabi' | 'makhraj' | 'buku') || 'quran';
    const [activeTab, setActiveTab] = useState<'quran' | 'hadits' | 'doa' | 'dzikir' | 'kisahnabi' | 'makhraj' | 'buku'>(activeTabParam);
    
    useEffect(() => {
        if (activeTabParam !== activeTab) {
            setActiveTab(activeTabParam);
            setSelectedDoa(null);
            setSelectedDzikir(null);
            setQuranViewMode('list');
            setSelectedSurah(null);
            setSurahDetail(null);
            setPlayingAudio(null);
            setSelectedBook(null);
            setHadiths([]);
        }
    }, [activeTabParam]);
    
    const [quranViewMode, setQuranViewMode] = useState<'list' | 'mushaf' | 'tahfidz'>('list');
    const [filterJuz, setFilterJuz] = useState<number | ''>('');
    const [filterPage, setFilterPage] = useState<number | ''>('');
    const [tahfidzStep, setTahfidzStep] = useState<'IDLE' | 'SHEIKH' | 'USER' | 'CHECK'>('IDLE');
    const [tahfidzAyahIdx, setTahfidzAyahIdx] = useState(0);
    const [tahfidzLevel, setTahfidzLevel] = useState<'urut' | 'potongan' | 'acak'>('urut');
    const [touchStartX, setTouchStartX] = useState<number | null>(null);
    const [activeAyahAction, setActiveAyahAction] = useState<any | null>(null);
    const [mushafPageIdx, setMushafPageIdx] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Quran State
    const [surahs, setSurahs] = useState<any[]>([]);
    const [searchSurah, setSearchSurah] = useState('');
    const [loadingSurahs, setLoadingSurahs] = useState(true);
    
    const [selectedSurah, setSelectedSurah] = useState<any | null>(null);
    const [surahDetail, setSurahDetail] = useState<any | null>(null);
    const [loadingSurahDetail, setLoadingSurahDetail] = useState(false);
    const [loadingAudioUpdate, setLoadingAudioUpdate] = useState(false);

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
    // Kisah Nabi State
    const [kisahNabis, setKisahNabis] = useState<any[]>([]);
    const [loadingKisah, setLoadingKisah] = useState(false);
    const [searchKisah, setSearchKisah] = useState('');
    const [selectedKisah, setSelectedKisah] = useState<any | null>(null);
    const [activeKisahStep, setActiveKisahStep] = useState(0);

    useEffect(() => {
        setActiveKisahStep(0);
    }, [selectedKisah]);

    const kisahTimeline = useMemo(() => {
        if (!selectedKisah) return [];
        const text = selectedKisah.description || "";
        const name = selectedKisah.name.toLowerCase();

        // Preset waypoints for specific prophets to create a "Map" feel
        let waypoints = [];
        if (name.includes('muhammad')) {
            waypoints = [
                { location: 'Mekkah', desc: 'Masa kecil hingga diangkat menjadi Rasul dan berdakwah secara sembunyi & terang-terangan.' },
                { location: 'Gua Hira', desc: 'Menerima wahyu pertama (Al-Alaq) melalui Malaikat Jibril.' },
                { location: 'Thaif', desc: 'Perjalanan dakwah yang penuh ujian dan penolakan dari penduduk Thaif.' },
                { location: 'Madinah', desc: 'Peristiwa Hijrah, membangun masjid pertama, dan mendirikan masyarakat madani.' },
                { location: 'Mekkah', desc: 'Fathu Makkah (Pembebasan kota Mekkah) tanpa pertumpahan darah.' }
            ];
        } else if (name.includes('musa')) {
            waypoints = [
                { location: 'Istana Firaun, Mesir', desc: 'Ditemukan oleh istri Firaun dan dibesarkan di lingkungan istana.' },
                { location: 'Madyan', desc: 'Melarikan diri ke Madyan, menikah, dan bekerja pada Nabi Syuaib.' },
                { location: 'Lembah Thuwa', desc: 'Mendapat mukjizat dan wahyu pertama untuk berdakwah ke Firaun.' },
                { location: 'Laut Merah', desc: 'Pelarian Bani Israil dan mukjizat membelah lautan.' },
                { location: 'Gurun Sinai', desc: 'Pengembaraan bersama Bani Israil dan menerima Taurat.' }
            ];
        } else if (name.includes('ibrahim')) {
            waypoints = [
                { location: 'Babilonia', desc: 'Perjuangan mencari Tuhan dan menghancurkan berhala kaumnya.' },
                { location: 'Tungku Api', desc: 'Mukjizat selamat dari api hukuman Raja Namrud.' },
                { location: 'Mesir & Syam', desc: 'Hijrah untuk menyebarkan dakwah tauhid.' },
                { location: 'Mekkah (Bakkah)', desc: 'Meninggalkan Siti Hajar & Ismail, hingga mukjizat Zamzam.' },
                { location: 'Baitullah', desc: 'Perintah qurban dan membangun Ka\'bah bersama Nabi Ismail.' }
            ];
        } else if (name.includes('yusuf')) {
            waypoints = [
                { location: 'Kanaan', desc: 'Kisah mimpi 11 bintang dan kecemburuan saudara-saudaranya.' },
                { location: 'Sumur', desc: 'Dibuang ke sumur lalu diselamatkan oleh musafir.' },
                { location: 'Istana Al-Aziz', desc: 'Dijual sebagai budak di Mesir dan fitnah Zulaikha.' },
                { location: 'Penjara Mesir', desc: 'Menafsirkan mimpi tahanan dan bersabar bertahun-tahun.' },
                { location: 'Istana Raja', desc: 'Menjadi bendahara negara (Menteri) dan berkumpul kembali dengan keluarga.' }
            ];
        } else if (name.includes('isa')) {
            waypoints = [
                { location: 'Baitlehem', desc: 'Lahir melalui mukjizat dari Maryam tanpa seorang ayah.' },
                { location: 'Nazaret', desc: 'Masa kecil dan tanda-tanda kenabian mulai terlihat.' },
                { location: 'Baitul Maqdis', desc: 'Berdakwah kepada Bani Israil dengan berbagai mukjizat (menyembuhkan, menghidupkan yang mati).' },
                { location: 'Bukit Zaitun', desc: 'Kisah pengkhianatan Yudas dan pengangkatan Nabi Isa ke langit.' }
            ];
        } else if (name.includes('yunus')) {
            waypoints = [
                { location: 'Ninawa', desc: 'Berdakwah kepada kaumnya namun ditolak.' },
                { location: 'Tepi Pantai', desc: 'Meninggalkan kaumnya dalam keadaan marah karena mereka tidak mau beriman.' },
                { location: 'Kapal', desc: 'Badai besar dan pengundian yang menyebabkan beliau dilempar ke laut.' },
                { location: 'Perut Paus', desc: 'Bertobat dengan doa "La ilaha illa anta, subhanaka inni kuntu minaz-zalimin".' },
                { location: 'Terdampar', desc: 'Diselamatkan ke daratan dan kembali mendapati kaumnya telah beriman.' }
            ];
        } else if (name.includes('nuh')) {
            waypoints = [
                { location: 'Pemukiman Kaum', desc: 'Berdakwah siang dan malam selama 950 tahun, namun hanya sedikit yang beriman.' },
                { location: 'Dataran Tinggi', desc: 'Mendapat perintah membuat bahtera besar jauh dari perairan yang diejek kaumnya.' },
                { location: 'Banjir Besar', desc: 'Azab air bah menenggelamkan semua yang ingkar, termasuk putranya Kan\'an.' },
                { location: 'Gunung Judi', desc: 'Bahtera berlabuh dengan selamat bersama orang-orang beriman dan hewan-hewan.' }
            ];
        } else if (name.includes('sulaiman')) {
            waypoints = [
                { location: 'Yerusalem', desc: 'Mewarisi kerajaan dari Nabi Daud dan membangun Baitul Maqdis.' },
                { location: 'Lembah Semut', desc: 'Perjalanan pasukan, mukjizat memahami bahasa hewan dan tunduknya angin.' },
                { location: 'Istana Kaca', desc: 'Menerima Ratu Balqis (Saba) dan menaklukkannya dengan kebijaksanaan.' },
                { location: 'Singgasana', desc: 'Wafat dalam keadaan berdiri bertongkat, tak diketahui jin hingga tongkatnya keropos.' }
            ];
        }

        let blocks = text.split(/\n\s*\n/).filter((b: string) => b.trim().length > 20);
        if (blocks.length < 3) {
            const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
            blocks = [];
            let currentBlock = "";
            for (const item of sentences) {
                currentBlock += item + " ";
                if (currentBlock.length > 250) {
                    blocks.push(currentBlock.trim());
                    currentBlock = "";
                }
            }
            if (currentBlock.trim().length > 0) {
                blocks.push(currentBlock.trim());
            }
        }

        // Merge waypoints with actual text blocks to spread the story
        const numBlocks = blocks.length;
        if (waypoints.length > 0) {
            return waypoints.map((wp, i) => {
                const proportion = Math.floor((i / waypoints.length) * numBlocks);
                const proportionNext = Math.floor(((i + 1) / waypoints.length) * numBlocks);
                const storySnippet = blocks.slice(proportion, proportionNext).join('\n\n') || wp.desc;
                return { location: wp.location, title: wp.desc, content: storySnippet };
            });
        }

        // Generic Map Fallback
        return blocks.map((b: string, i: number) => ({
            location: `Wilayah ${i + 1}`,
            title: `Bagian Perjalanan ${i + 1}`,
            content: b
        }));
    }, [selectedKisah]);

    // Pilihan Koleksi Buku Islami Lokal Gratis
    const curatedBooks = [
        {
            title: 'Ar-Rahiq Al-Makhtum',
            author: 'Syaikh Shafiyyurrahman Al-Mubarakfuri',
            description: 'Buku Sirah Nabawiyah terlengkap dan memenangkan juara pertama lomba seerah yang diselenggarakan oleh Rabithah Alam Islami.',
            readUrl: 'https://d1.islamhouse.com/data/id/ih_books/single/id_Ar_Rahiq_Al_Makhtum.pdf',
            source: 'Sirah Nabawiyah'
        },
        {
            title: 'Ringkasan Sirah Nabawiyah',
            author: 'Berbagai Ulama',
            description: 'Ringkasan perjalanan hidup Nabi Muhammad ﷺ.',
            readUrl: 'https://d1.islamhouse.com/data/id/ih_books/single/id_Ringkasan_Sirah_Nabawiyah.pdf',
            source: 'Sirah Nabawiyah'
        },
        {
            title: 'Tafsir Ibnu Katsir',
            author: 'Al-Hafizh Ibnu Katsir',
            description: 'Rujukan utama umat Islam untuk tafsir Al-Quran dengan riwayat sanad terpercaya.',
            readUrl: 'https://d1.islamhouse.com/data/id/ih_books/single/id_Tafsir_Ibnu_Katsir_Jilid_1.pdf',
            source: 'Tafsir'
        },
        {
            title: 'Bulughul Maram',
            author: 'Al-Hafizh Ibnu Hajar Al-Asqalani',
            description: 'Kumpulan hadits-hadits tentang hukum fiqih kehidupan sehari-hari.',
            readUrl: 'https://d1.islamhouse.com/data/id/ih_books/single/id_Bulughul_Maram.pdf',
            source: 'Hadits Fiqih'
        },
        {
            title: 'Riyadhus Shalihin',
            author: 'Imam An-Nawawi',
            description: 'Kitab kumpulan hadits-hadits shahih tentang akhlak, adab, dan penyucian jiwa.',
            readUrl: 'https://d1.islamhouse.com/data/id/ih_books/single/id_Riyadhus_Shalihin.pdf',
            source: 'Hadits Akhlak'
        },
        {
            title: 'Sifat Shalat Nabi',
            author: 'Syaikh Muhammad Nashiruddin Al-Albani',
            description: 'Buku yang menjelaskan tata cara shalat Nabi Muhammad ﷺ secara rinci dari takbir hingga salam.',
            readUrl: 'https://d1.islamhouse.com/data/id/ih_books/single/id_Sifat_Shalat_Nabi.pdf',
            source: 'Fiqih Ibadah'
        }
    ];

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
                surahId: selectedSurah.nomor,
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

    const activeWordRef = useRef<{ ayahNumber: number, startWord: number, endWord: number } | null>(null);
    const rqAnimRef = useRef<number | null>(null);

    const setWordHighlight = (ayahNumber: number, start: number, end: number, active: boolean) => {
        for (let i = start; i < end; i++) {
            const ids = [`word-${ayahNumber}-${i}`, `word-modal-${ayahNumber}-${i}`];
            ids.forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    if (active) {
                        el.classList.add('!text-[#1799dc]', 'dark:!text-[#38bdf8]', '!bg-[#1799dc]/10', 'dark:!bg-[#38bdf8]/10', 'rounded-lg', 'px-2', '-mx-2', 'relative', 'z-20');
                    } else {
                        el.classList.remove('!text-[#1799dc]', 'dark:!text-[#38bdf8]', '!bg-[#1799dc]/10', 'dark:!bg-[#38bdf8]/10', 'rounded-lg', 'px-2', '-mx-2', 'relative', 'z-20');
                    }
                }
            });
        }
    };

    // Keep highlight active across component re-renders
    useEffect(() => {
        if (activeWordRef.current && playingAudio) {
            setWordHighlight(activeWordRef.current.ayahNumber, activeWordRef.current.startWord, activeWordRef.current.endWord, true);
        }
    });

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

    // Fetch Kisah Nabi
    useEffect(() => {
        if (activeTab === 'kisahnabi' && kisahNabis.length === 0) {
            setLoadingKisah(true);
            fetch('https://islamic-api-zhirrr.vercel.app/api/kisahnabi')
                .then(res => res.json())
                .then(data => {
                    setKisahNabis(data);
                    setLoadingKisah(false);
                })
                .catch(err => {
                    console.error("Failed to fetch kisah nabi:", err);
                    setLoadingKisah(false);
                });
        }
    }, [activeTab]);



    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleEnded = () => {
            if (quranViewMode === 'tahfidz') {
                if (tahfidzStep === 'SHEIKH') {
                    setTahfidzStep('USER');
                }
            }
        };

        audio.addEventListener('ended', handleEnded);
        return () => audio.removeEventListener('ended', handleEnded);
    }, [quranViewMode, tahfidzStep]);

    const getAudioUrl = (ayah: any) => {
        if (!ayah) return "";

        // If explicitly choosing an Indonesian source reciter
        if (selectedReciter.startsWith('0')) {
            const url = ayah?.audio?.[selectedReciter] || ayah?.audio?.['01'];
            return url || (ayah?.audio ? Object.values(ayah.audio)[0] : "");
        }

        if (ayah?.quranComAudio?.url) {
            let url = ayah.quranComAudio.url;
            if (url.startsWith('//')) {
                url = `https:${url}`;
            } else if (!url.startsWith('http')) {
                url = `https://verses.quran.com/${url}`;
            }
            
            // Rewrite mirrors.quranicaudio.com to everyayah.com to avoid Indonesian ISP blocking & CORS proxy errors
            if (url.includes('mirrors.quranicaudio.com/everyayah/')) {
                url = url.replace('mirrors.quranicaudio.com/everyayah/', 'everyayah.com/data/');
            }
            
            return url;
        }
        
        // Fallback to equran.id audio if available for this reciter mapping
        const reciter = RECITERS.find(r => r.id === selectedReciter);
        if (reciter?.fallback && ayah?.audio?.[reciter.fallback]) {
            return ayah.audio[reciter.fallback];
        }
        
        // Final fallback to the first available audio from equran.id if quran.com fails
        if (ayah?.audio) {
            const indonesianFallback = ayah.audio['01'] || ayah.audio['05'] || Object.values(ayah.audio)[0];
            if (indonesianFallback) return indonesianFallback;
        }

        // Try quranComWords audio if available (sometimes it's there)
        if (ayah?.quranComWords && Array.isArray(ayah.quranComWords)) {
            const firstWordAudio = ayah.quranComWords.find((w: any) => w.audio_url)?.audio_url;
            if (firstWordAudio) {
                if (firstWordAudio.startsWith('//')) return `https:${firstWordAudio}`;
                return firstWordAudio.startsWith('http') ? firstWordAudio : `https://verses.quran.com/${firstWordAudio}`;
            }
        }
        
        return "";
    };

    const handleSelectSurah = (surah: any) => {
        setSelectedSurah(surah);
        setLoadingSurahDetail(true);
        
        Promise.all([
            fetch(`https://equran.id/api/v2/surat/${surah.nomor}`).then(res => res.json()),
            fetch(`https://api.quran.com/api/v4/verses/by_chapter/${surah.nomor}?words=true&audio=${selectedReciter}&word_fields=text_uthmani_tajweed&per_page=300`).then(res => res.json()),
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
                        juzNumber: verseInfo?.juz_number,
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

    useEffect(() => {
        if (!selectedSurah) return;
        
        setLoadingAudioUpdate(true);
        fetch(`https://api.quran.com/api/v4/verses/by_chapter/${selectedSurah.nomor}?words=true&audio=${selectedReciter}&word_fields=text_uthmani_tajweed&per_page=300`)
            .then(res => res.json())
            .then(quranComData => {
                setSurahDetail(prev => {
                    if (!prev) return prev;
                    const mergedAyahs = prev.ayat.map((ayah: any) => {
                        const verseInfo = quranComData.verses?.find((v: any) => v.verse_number === ayah.nomorAyat);
                        return {
                            ...ayah,
                            quranComAudio: verseInfo?.audio || null, // Clear old audio if new one is missing
                        };
                    });
                    return { ...prev, ayat: mergedAyahs };
                });
            })
            .catch(console.error)
            .finally(() => setLoadingAudioUpdate(false));
    }, [selectedReciter, selectedSurah]);

    const [playingAudio, setPlayingAudio] = useState<string | null>(null);
    const [openTafsirAyah, setOpenTafsirAyah] = useState<number | null>(null);

    const toggleAudio = (audioUrl: string, ayahNumber?: number, audioSegments?: any[], stopEarlyMs?: number) => {
        const audioEl = audioRef.current || document.getElementById('quran-audio') as HTMLAudioElement;
        if (!audioEl) return;

        const isIndonesianSource = selectedReciter.startsWith('0');
        const finalAyahNumber = isIndonesianSource ? undefined : ayahNumber;
        const finalSegments = isIndonesianSource ? undefined : audioSegments;

        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }

        // Remove existing highlight if any
        if (activeWordRef.current) {
            setWordHighlight(activeWordRef.current.ayahNumber, activeWordRef.current.startWord, activeWordRef.current.endWord, false);
            activeWordRef.current = null;
        }
        if (rqAnimRef.current) {
            cancelAnimationFrame(rqAnimRef.current);
            rqAnimRef.current = null;
        }

        if (playingAudio === audioUrl) {
            setPlayingAudio(null);
            audioEl.pause();
            audioEl.onplay = null;
            audioEl.onended = null;
            audioEl.onerror = null;
        } else {
            if (!audioUrl || audioUrl === "undefined") {
                alert("Audio tidak tersedia untuk ayat ini. Silakan coba qari lain atau pilih sumber audio yang berbeda.");
                return;
            }

            setPlayingAudio(audioUrl);
            
            // Clean up previous listeners
            audioEl.onplay = null;
            audioEl.onended = null;
            
            audioEl.onerror = (e: any) => {
                console.error("Audio Load Error:", e);
                setPlayingAudio(null);
                alert("Gagal memuat audio dari server internasional (mungkin diblokir provider). Silakan coba Syaikh dengan label '(ID Source)'.");
            };

            audioEl.src = audioUrl;
            audioEl.load();

            audioEl.play().catch(err => {
                if (err.name !== 'AbortError') {
                    console.error("Playback failed:", err);
                    setPlayingAudio(null);
                    // If it's a "no supported source" error, it's often a 404 or format issue
                    alert("Gagal memutar audio. Sumber audio mungkin tidak tersedia saat ini.");
                }
            });

            audioEl.onended = () => {
                setPlayingAudio(null);
                if (activeWordRef.current) {
                    setWordHighlight(activeWordRef.current.ayahNumber, activeWordRef.current.startWord, activeWordRef.current.endWord, false);
                    activeWordRef.current = null;
                }
                if (rqAnimRef.current) {
                    cancelAnimationFrame(rqAnimRef.current);
                    rqAnimRef.current = null;
                }

                if (quranViewMode !== 'tahfidz' && finalAyahNumber !== undefined) {
                    // Try to auto-play the next ayah
                    const nextAyah = surahDetail?.ayat?.find((a: any) => a.nomorAyat === finalAyahNumber + 1);
                    if (nextAyah) {
                        if (quranViewMode === 'mushaf') {
                             setActiveAyahAction(nextAyah.nomorAyat);
                        } else {
                             const el = document.getElementById(`ayah-${nextAyah.nomorAyat}`);
                             if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                        const nextAudioUrl = getAudioUrl(nextAyah);
                        const nextSegments = nextAyah.quranComAudio ? nextAyah.quranComAudio.segments : undefined;
                        // Avoid direct synchronous recursion to prevent stack blocking limits, set small timeout
                        setTimeout(() => toggleAudio(nextAudioUrl, nextAyah.nomorAyat, nextSegments), 300);
                    }
                }
            };
            
            if (finalAyahNumber && finalSegments) {
                const updateHighlight = () => {
                    if (!audioEl || audioEl.paused) return;
                    const currentTimeMs = audioEl.currentTime * 1000;
                    if (stopEarlyMs && currentTimeMs >= stopEarlyMs) {
                        audioEl.pause();
                        setPlayingAudio(null);
                        if (activeWordRef.current) {
                            setWordHighlight(activeWordRef.current.ayahNumber, activeWordRef.current.startWord, activeWordRef.current.endWord, false);
                            activeWordRef.current = null;
                        }
                        if (rqAnimRef.current) {
                            cancelAnimationFrame(rqAnimRef.current);
                            rqAnimRef.current = null;
                        }
                        audioEl.dispatchEvent(new Event('ended'));
                        return;
                    }

                    let newActiveWord: { ayahNumber: number, startWord: number, endWord: number } | null = null;
                    
                    for (let i = 0; i < finalSegments.length; i++) {
                        const seg = finalSegments[i];
                        if (seg && seg.length >= 4) {
                            const startMs = Number(seg[2]);
                            const endMs = Number(seg[3]);
                            if (currentTimeMs >= startMs && currentTimeMs <= endMs) {
                                newActiveWord = { 
                                    ayahNumber: finalAyahNumber, 
                                    startWord: Number(seg[0]), 
                                    endWord: Number(seg[1]) 
                                };
                                break;
                            }
                        }
                    }
                    
                    const prev = activeWordRef.current;
                    if (newActiveWord?.startWord !== prev?.startWord || newActiveWord?.endWord !== prev?.endWord || newActiveWord?.ayahNumber !== prev?.ayahNumber) {
                        if (prev) {
                            setWordHighlight(prev.ayahNumber, prev.startWord, prev.endWord, false);
                        }
                        if (newActiveWord) {
                            setWordHighlight(newActiveWord.ayahNumber, newActiveWord.startWord, newActiveWord.endWord, true);
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
            } else if (stopEarlyMs) {
                const updateEarlyStop = () => {
                    if (!audioEl || audioEl.paused) return;
                    if (audioEl.currentTime * 1000 >= stopEarlyMs) {
                        audioEl.pause();
                        setPlayingAudio(null);
                        if (rqAnimRef.current) {
                            cancelAnimationFrame(rqAnimRef.current);
                            rqAnimRef.current = null;
                        }
                        audioEl.dispatchEvent(new Event('ended'));
                        return;
                    }
                    rqAnimRef.current = requestAnimationFrame(updateEarlyStop);
                };
                audioEl.onplay = () => {
                    rqAnimRef.current = requestAnimationFrame(updateEarlyStop);
                };
                if (!audioEl.paused) {
                    rqAnimRef.current = requestAnimationFrame(updateEarlyStop);
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
                    setWordHighlight(activeWordRef.current.ayahNumber, activeWordRef.current.startWord, activeWordRef.current.endWord, false);
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

    const getPotonganAyat = (text: string) => {
        if (!text) return '';
        const words = text.split(' ');
        if (words.length <= 3) return words[0];
        return words.slice(0, Math.ceil(words.length / 3)).join(' ');
    };

    const getPotonganEndTimeMs = (text: string, audioSegments?: any[]) => {
        if (!text || !audioSegments) return undefined;
        const words = text.split(' ');
        let wordCount = words.length <= 3 ? 1 : Math.ceil(words.length / 3);
        
        let maxEndMs = 0;
        for(let i = 0; i < audioSegments.length; i++){
             const seg = audioSegments[i];
             // segment is usually [wordIndex, wordIndex, startMs, endMs]
             // We check if seg[0] <= wordCount - 1 because wIndex is 0-based
             if(seg && seg[0] <= wordCount - 1){
                  if(seg[3] > maxEndMs) maxEndMs = seg[3];
             }
        }
        return maxEndMs > 0 ? maxEndMs : undefined;
    };

    const renderArabicWithHighlight = (ayah: any, isPotongan: boolean = false, className: string = "") => {
        if (!ayah) return null;
        
        if (!ayah.quranComWords) {
            return <p className={className} dir="rtl">{isPotongan ? getPotonganAyat(ayah.teksArab) : ayah.teksArab}{isPotongan && ' ...'}</p>;
        }

        let wordCountToDisplay = ayah.quranComWords.length;
        if (isPotongan) {
            const limit = ayah.teksArab.split(' ').length <= 3 ? 1 : Math.ceil(ayah.teksArab.split(' ').length / 3);
            wordCountToDisplay = limit;
        }

        return (
            <p className={className} dir="rtl">
                {ayah.quranComWords.map((word: any, wIndex: number) => {
                    if (word.char_type_name === 'end') return null;
                    if (isPotongan && wIndex >= wordCountToDisplay) return null;
                    return (
                        <span key={`tahfidz-word-${ayah.nomorAyat}-${wIndex}`}>
                            <span 
                                id={`word-${ayah.nomorAyat}-${wIndex}`}
                                className="inline transition-colors duration-300 rounded"
                                dangerouslySetInnerHTML={{ __html: word.text_uthmani_tajweed || word.text_uthmani || word.text }}
                            />
                            {" "}
                        </span>
                    );
                })}
                {isPotongan && <span className="text-slate-400">...</span>}
            </p>
        );
    };

    const startRecording = async (ayahNumber: number) => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert('Browser Anda tidak mendukung Speech Recognition API. Rekomendasi: Gunakan Google Chrome.');
            return;
        }

        try {
            const recognition = new SpeechRecognition();
            recognition.lang = 'ar-SA';
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;
            
            let hasResult = false;

            recognition.onstart = () => {
                setRecordingAyah(ayahNumber);
                hasResult = false;
            };

            recognition.onresult = async (event: any) => {
                hasResult = true;
                const transcript = event.results[0][0].transcript;
                setEvaluatingAyah(ayahNumber);
                
                if (quranViewMode === 'tahfidz') {
                    setTahfidzStep('CHECK');
                }
                
                const ayah = surahDetail?.ayat.find((a: any) => a.nomorAyat === ayahNumber);
                
                // Hapus harakat untuk perbandingan yang lebih baik (Normalisasi sederhana)
                const removeTashkeel = (text: string) => text.replace(/[\u0617-\u061A\u064B-\u0652]/g, '');
                const transcriptNorm = removeTashkeel(transcript || '').trim();
                const ayahNorm = removeTashkeel(ayah?.teksArab || '').trim();
                
                let feedback = '';
                if (transcriptNorm === ayahNorm) {
                    feedback = 'Masya Allah! Hafalan Anda sempurna.';
                } else if (transcriptNorm && (ayahNorm.includes(transcriptNorm) || transcriptNorm.includes(ayahNorm))) {
                    feedback = 'Alhamdulillah bacaan Anda sudah baik, namun terdapat sedikit kekeliruan. Mari kita dengarkan bacaan yang benar.';
                } else {
                    feedback = 'Bacaan kurang tepat atau kurang jelas. Jangan menyerah, mari kita dengarkan bacaan yang benar.';
                }

                setEvaluationResults(prev => ({
                    ...prev,
                    [ayahNumber]: feedback
                }));
                
                if (ayah) {
                    const audioUrl = getAudioUrl(ayah);
                    toggleAudio(audioUrl, ayah.nomorAyat, ayah.quranComAudio?.segments);
                }
                setEvaluatingAyah(null);
            };

            recognition.onerror = (event: any) => {
                hasResult = true; // prevent onend from overwriting
                if (event.error !== 'aborted') {
                    console.error('Speech recognition error', event.error);
                    setEvaluationResults(prev => ({
                        ...prev,
                        [ayahNumber]: `Gagal mendeteksi suara (${event.error}). Pastikan Anda memberikan izin mikrofon dan berbicara dengan jelas.`
                    }));
                    if (quranViewMode === 'tahfidz') {
                        setTahfidzStep('CHECK');
                    }
                }
                setRecordingAyah(null);
                setEvaluatingAyah(null);
            };

            recognition.onend = () => {
                setRecordingAyah(null);
                if (!hasResult) {
                    setEvaluationResults(prev => ({
                        ...prev,
                        [ayahNumber]: "Suara tidak terdeteksi. Silakan coba lagi dan pastikan berbicara dengan jelas."
                    }));
                    if (quranViewMode === 'tahfidz') {
                        setTahfidzStep('CHECK');
                    }
                }
            };

            mediaRecorderRef.current = recognition as any;
            recognition.start();
        } catch (err) {
            console.error('Error accessing microphone via API:', err);
            alert('Tidak dapat memulai Speech Recognition: ' + (err instanceof Error ? err.message : String(err)));
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            try {
                (mediaRecorderRef.current as any).stop();
            } catch (e) {
                // Ignore
            }
            setRecordingAyah(null);
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
                
                const prompt = `Kamu adalah Talaqqi AI, seorang pakar tahsin Al-Quran bersanad yang sangat cerdas, teliti, santai, ramah, dan memotivasi. 
Tugasmu menyimak rekaman bacaan Surat ${surahDetail.namaLatin} ayat ${ayahNumber}.
Teks ayat asli: ${ayah.teksArab} (${ayah.teksLatin}).

Lakukan analisis tingkat tinggi pada bacaannya. Fokus pada:
1. Makharijul Huruf (ketepatan huruf, jangan sampai tertukar misal 'sin' dengan 'syin' atau 'ha' dengan 'kho').
2. Sifatul Huruf (qalqalah, ketebalan bunyi/tafkhim tarqiq).
3. Ahkamul Tajwid (hukum nun mati/mim mati, panjang mad 2/4/5/6 harakat, dengung/ghunnah).

Format respons:
- Buka dengan salam hangat dan apresiasi tulus.
- Berikan evaluasi spesifik: sebutkan kata/huruf apa yang sudah benar dan apa yang masih kurang tepat.
- Jelaskan cara memperbaikinya dengan bahasa awam yang mudah dipraktikkan (misal: "ayunkan 2 harakat", "tenggorokan bagian tengah", dll).
- Gunakan bahasa yang natural dan ramah Text-to-Speech (hindari simbol rumit, markdown tebal/miring berlebihan).
- Jika bacaan sempurna, puji dengan kalimat inspiratif dan beri semangat.
- WAJIB AKHIRI responsmu dengan kalimat ini (tanpa tambahan apapun setelahnya): "Mari kita dengarkan bacaan yang benarnya berikut ini."

Panjang respons: Singkat, akurat, bentuk paragraf (maksimal 3 paragraf). Berbicaralah seperti guru tahsin yang berhadapan langsung dengan muridnya.`;
                
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
                    
                    speakFeedbackAndPlayCorrect(feedbackText, getAudioUrl(ayah), ayahNumber);
                    
                } catch (e) {
                    console.error("Evaluation error", e);
                    let errorMessage = e instanceof Error ? e.message : "Gagal mengevaluasi bacaan.";
                    
                    if (errorMessage.includes("API key not valid") || errorMessage.includes("configuration") || errorMessage.includes("API_KEY_INVALID")) {
                        errorMessage = "API Key Gemini Anda tidak valid. Silakan hapus kustom Secret API Key di tab Settings agar aplikasi kembali menggunakan AI Gratis dari Google AI Studio.";
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

    const changeTab = (tab: 'quran' | 'hadits' | 'doa' | 'dzikir' | 'kisahnabi' | 'makhraj' | 'buku') => {
        navigate(`/quran/${tab}`);
    };

    const mushafPages = React.useMemo(() => {
        if (!surahDetail?.ayat) return [];
        
        const filteredAyahList = surahDetail.ayat.filter((a: any) => 
            (!filterJuz || a.juzNumber === filterJuz) && (!filterPage || a.pageNumber === filterPage)
        );

        const hasPageNumbers = filteredAyahList.some((a: any) => a.pageNumber);
        
        if (hasPageNumbers) {
            const pagesMap = new Map();
            filteredAyahList.forEach((ayah: any) => {
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
            for (let i = 0; i < filteredAyahList.length; i += 8) {
                chunks.push(filteredAyahList.slice(i, i + 8));
            }
            return chunks;
        }
    }, [surahDetail, filterJuz, filterPage]);

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
            <audio ref={audioRef} id="quran-audio" className="hidden" />
            <div className="max-w-4xl mx-auto px-4">
                
                {/* Header */}
                {!selectedSurah && !selectedBook && (
                    <div className="mb-6 text-center pt-2">
                        <div className="w-12 h-12 mx-auto bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-xl flex items-center justify-center mb-3">
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <h1 className="text-2xl font-extrabold text-[#1799dc] mb-1">Qur'an & Hadits</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm">Membaca dan merenungkan ayat suci serta riwayat nabi.</p>
                        
                        <div className="flex justify-center mt-4 w-full">
                            <div className="flex flex-wrap justify-center gap-1 bg-white dark:bg-slate-800 rounded-2xl md:rounded-full p-1 shadow-sm border border-slate-200 dark:border-slate-700 max-w-full">
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
                                <button 
                                    onClick={() => changeTab('kisahnabi')}
                                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${activeTab === 'kisahnabi' ? 'bg-[#1799dc] text-white shadow-md' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                                >
                                    Kisah Nabi
                                </button>
                                <button 
                                    onClick={() => changeTab('makhraj')}
                                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${activeTab === 'makhraj' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400'}`}
                                >
                                    <Sparkles className="w-3.5 h-3.5 hidden sm:block" /> Makhraj
                                </button>
                                <button 
                                    onClick={() => changeTab('buku')}
                                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${activeTab === 'buku' ? 'bg-[#1799dc] text-white shadow-md' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                                >
                                    Buku Islami
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
                                    <button 
                                        onClick={() => {
                                            setQuranViewMode('tahfidz');
                                            setTahfidzStep('IDLE');
                                            setTahfidzAyahIdx(0);
                                        }}
                                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${quranViewMode === 'tahfidz' ? 'bg-[#1799dc] text-white shadow-md' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                                    >
                                        Tahfidz
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
                                        className={`bg-transparent text-xs font-bold text-slate-600 dark:text-slate-300 w-full pl-3 pr-8 py-1.5 focus:outline-none appearance-none cursor-pointer ${loadingAudioUpdate ? 'opacity-50' : ''}`}
                                        style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
                                        disabled={loadingAudioUpdate}
                                    >
                                        {RECITERS.map(r => (
                                            <option key={r.id} value={r.id} className="text-slate-800 dark:text-slate-800">
                                                {r.name} {r.style ? `(${r.style})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        {loadingAudioUpdate ? <Loader2 className="w-4 h-4 animate-spin text-[#1799dc]" /> : <ChevronDown className="w-4 h-4" />}
                                    </div>
                                </div>

                                <button 
                                    onClick={handleBookmark}
                                    disabled={isSavingBookmark}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                        bookmark?.surahId === selectedSurah.nomor 
                                        ? 'bg-[#1799dc] text-white shadow-md' 
                                        : 'bg-white dark:bg-slate-800 text-[#1799dc] border border-[#1799dc]/20 hover:bg-[#1799dc] hover:text-white'
                                    }`}
                                >
                                    {isSavingBookmark ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : bookmark?.surahId === selectedSurah.nomor ? (
                                        <Bookmark className="w-4 h-4 fill-current" />
                                    ) : (
                                        <BookmarkPlus className="w-4 h-4" />
                                    )}
                                    {bookmark?.surahId === selectedSurah.nomor ? 'Tersimpan' : 'Tandai Surah'}
                                </button>
                            </div>
                            
                            <div className="bg-gradient-to-br from-[#1799dc] to-[#2db2f5] rounded-3xl p-5 md:p-8 text-white shadow-xl shadow-[#1799dc]/20 mb-6 text-center relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-2xl"></div>
                                <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/10 rounded-full -ml-20 -mb-20 blur-xl"></div>
                                
                                <h2 className="text-3xl md:text-4xl font-arabic font-bold mb-3 relative z-10">{selectedSurah.nama}</h2>
                                <h1 className="text-xl md:text-2xl font-extrabold mb-1 relative z-10">{selectedSurah.namaLatin}</h1>
                                <p className="opacity-90 font-medium tracking-wide uppercase text-[10px] md:text-xs relative z-10">{selectedSurah.arti} &middot; {selectedSurah.jumlahAyat} Ayat &middot; {selectedSurah.tempatTurun}</p>
                            
                                {['01','02','03','04','05','06'].includes(selectedReciter) && surahDetail?.audioFull?.[selectedReciter] && (
                                    <div className="relative z-10 flex justify-center mt-5">
                                        <button 
                                            onClick={() => toggleAudio(surahDetail.audioFull[selectedReciter])}
                                            className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm transition-all backdrop-blur-sm ${playingAudio === surahDetail.audioFull[selectedReciter] ? 'bg-white text-[#1799dc] shadow-lg' : 'bg-black/20 text-white hover:bg-black/30 border border-white/20 hover:border-white/40'}`}
                                        >
                                            {playingAudio === surahDetail.audioFull[selectedReciter] ? <span className="w-3 h-3 bg-[#1799dc] rounded-sm animate-pulse"></span> : <PlayCircle className="w-5 h-5" />}
                                            {playingAudio === surahDetail.audioFull[selectedReciter] ? 'Berhenti' : 'Putar Full Surah Murottal'}
                                        </button>
                                    </div>
                                )}
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

                            {quranViewMode !== 'tahfidz' && surahDetail && (
                                <div className="flex flex-wrap gap-3 mb-6">
                                    <div className="flex bg-white dark:bg-slate-800 rounded-xl p-1 shadow-sm border border-slate-200 dark:border-slate-700 w-full sm:w-auto relative">
                                        <select
                                            title="Filter Juz"
                                            value={filterJuz}
                                            onChange={(e) => setFilterJuz(e.target.value === '' ? '' : Number(e.target.value))}
                                            className="bg-transparent text-xs font-bold text-slate-600 dark:text-slate-300 w-full pl-3 pr-8 py-2 focus:outline-none appearance-none cursor-pointer"
                                            style={{ minWidth: '120px' }}
                                        >
                                            <option value="">Semua Juz</option>
                                            {Array.from(new Set(surahDetail.ayat.map((a: any) => a.juzNumber))).filter(Boolean).map(juz => (
                                                <option key={juz as number} value={juz as number}>Juz {juz as number}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                            <ChevronDown className="w-4 h-4" />
                                        </div>
                                    </div>
                                    <div className="flex bg-white dark:bg-slate-800 rounded-xl p-1 shadow-sm border border-slate-200 dark:border-slate-700 w-full sm:w-auto relative">
                                        <select
                                            title="Filter Halaman"
                                            value={filterPage}
                                            onChange={(e) => setFilterPage(e.target.value === '' ? '' : Number(e.target.value))}
                                            className="bg-transparent text-xs font-bold text-slate-600 dark:text-slate-300 w-full pl-3 pr-8 py-2 focus:outline-none appearance-none cursor-pointer"
                                            style={{ minWidth: '150px' }}
                                        >
                                            <option value="">Semua Halaman</option>
                                            {Array.from(new Set(surahDetail.ayat.map((a: any) => a.pageNumber))).filter(Boolean).map(page => (
                                                <option key={page as number} value={page as number}>Halaman {page as number}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                            <ChevronDown className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {loadingSurahDetail ? (
                                <div className="flex justify-center items-center py-20">
                                    <Loader2 className="w-8 h-8 animate-spin text-[#1799dc]" />
                                </div>
                            ) : surahDetail ? (
                                quranViewMode === 'list' ? (
                                <div className="space-y-8">
                                    {(() => {
                                        const filteredAyat = surahDetail.ayat.filter((a: any) => (!filterJuz || a.juzNumber === filterJuz) && (!filterPage || a.pageNumber === filterPage));
                                        
                                        if (filteredAyat.length === 0) {
                                            return (
                                                <div className="text-center py-10 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700">
                                                    <p className="text-slate-500 dark:text-slate-400">Tidak ada ayat yang cocok dengan filter saat ini.</p>
                                                    <button 
                                                        onClick={() => { setFilterJuz(''); setFilterPage(''); }}
                                                        className="mt-4 px-4 py-2 bg-[#1799dc] text-white rounded-lg text-sm font-bold"
                                                    >
                                                        Hapus Filter
                                                    </button>
                                                </div>
                                            );
                                        }

                                        return filteredAyat.map((ayah: any) => {
                                        const currentAudioUrl = getAudioUrl(ayah);
                                        const segments = ayah.quranComAudio ? ayah.quranComAudio.segments : undefined;
                                        const isAyahPlaying = playingAudio !== null && playingAudio === currentAudioUrl;

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
                                                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${bookmark?.surahId === selectedSurah.nomor && bookmark?.ayahNumber === ayah.nomorAyat ? 'bg-[#b08d57] text-white shadow-md shadow-[#b08d57]/20' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-[#b08d57]'}`}
                                                        title="Tandai Ayat Ini"
                                                    >
                                                        {bookmark?.surahId === selectedSurah.nomor && bookmark?.ayahNumber === ayah.nomorAyat ? <Bookmark className="w-5 h-5 fill-current" /> : <BookmarkPlus className="w-5 h-5" />}
                                                    </button>
                                                </div>
                                                <div className="flex-1 ml-6 text-right">
                                                    {ayah.quranComWords ? (
                                                        <p className="font-arabic text-3xl md:text-4xl leading-[2.2] md:leading-[2.5] text-slate-800 dark:text-slate-100" dir="rtl">
                                                            {ayah.quranComWords.map((word: any, wIndex: number) => {
                                                                if (word.char_type_name === 'end') return null;
                                                                return (
                                                                    <span key={`word-list-${ayah.nomorAyat}-${wIndex}`}>
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
                                                <p className={`text-sm font-medium mb-2 transition-colors duration-300 ${playingAudio === getAudioUrl(ayah) ? 'text-[#1799dc] dark:text-[#38bdf8]' : 'text-primary-600 dark:text-primary-400'}`}>{ayah.teksLatin}</p>
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
                                                            ).map((rule, idx) => (
                                                                <div 
                                                                    key={`${rule.name}-list-${idx}`} 
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
                                    })
                                    })()}
                                </div>
                                ) : quranViewMode === 'mushaf' ? (
                                    <div 
                                        className="bg-[#fcfaf5] dark:bg-[#1a202c] rounded-3xl shadow-lg shadow-black/5 border border-[#e8dccb] dark:border-[#2d3748] relative min-h-[500px] overflow-hidden"
                                        onTouchStart={handleTouchStart}
                                        onTouchEnd={handleTouchEnd}
                                    >
                                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-[0.03] dark:opacity-5 pointer-events-none mix-blend-multiply dark:mix-blend-lighten rounded-3xl z-0"></div>
                                        
                                        <AnimatePresence mode="popLayout" initial={false}>
                                            {mushafPages.length > 0 ? (
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

                                                    <div className="font-arabic text-[30px] sm:text-[34px] md:text-[40px] leading-[2.1] sm:leading-[2.2] md:leading-[2.3] text-[#2c241b] dark:text-[#f7fafc] text-right relative z-10" dir="rtl">
                                                        {mushafPages[mushafPageIdx]?.map((ayah: any) => {
                                                            const currentAudioUrl = getAudioUrl(ayah);
                                                            const isAyahPlaying = playingAudio !== null && playingAudio === currentAudioUrl;
                                                            return (
                                                            <span 
                                                                key={ayah.nomorAyat} 
                                                                className={`inline transition-colors duration-300 cursor-pointer rounded outline-none ${activeAyahAction === ayah.nomorAyat || isAyahPlaying ? 'bg-[#b08d57]/20 dark:bg-[#b08d57]/30 ring-2 ring-[#b08d57]/40 z-10 relative' : 'hover:bg-black/5 dark:hover:bg-white/10'}`} 
                                                                onClick={() => setActiveAyahAction(activeAyahAction === ayah.nomorAyat ? null : ayah.nomorAyat)}
                                                            >
                                                                {ayah.quranComWords ? (
                                                                    <>
                                                                        {ayah.quranComWords.map((word: any, wIndex: number) => {
                                                                            if (word.char_type_name === 'end') return null;
                                                                            return (
                                                                                <span key={`word-mushaf-${ayah.nomorAyat}-${wIndex}`}>
                                                                                    <span 
                                                                                        id={`word-${ayah.nomorAyat}-${wIndex}`}
                                                                                        className="inline transition-colors duration-200"
                                                                                        dangerouslySetInnerHTML={{ __html: word.text_uthmani_tajweed || word.text_uthmani || word.text }} 
                                                                                    />
                                                                                    {" "}
                                                                                </span>
                                                                            );
                                                                        })}
                                                                    </>
                                                                ) : ayah.teksTajweed ? (
                                                                    <span dangerouslySetInnerHTML={{ __html: ayah.teksTajweed + " " }} />
                                                                ) : (
                                                                    <span>{ayah.teksArab + " "}</span>
                                                                )}
                                                                <span className="inline-flex items-center justify-center align-middle relative mx-1 text-[#b08d57] transition-colors leading-none">
                                                                    <span className="text-3xl sm:text-4xl lg:text-5xl font-normal opacity-90" style={{fontFamily: 'system-ui', lineHeight: 1}}>۝</span>
                                                                    <span className="absolute inset-0 flex items-center justify-center text-[10px] sm:text-[11px] lg:text-[13px] font-bold font-sans pt-1" style={{fontFeatureSettings: '"tnum"'}} dir="ltr">
                                                                        {toArabicNumber(ayah.nomorAyat)}
                                                                    </span>
                                                                </span>
                                                                {" "}
                                                            </span>
                                                            );
                                                        })}
                                                    </div>
                                                </motion.div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center w-full h-full py-20 relative z-10">
                                                    <p className="text-slate-500 dark:text-slate-400 font-medium">Tidak ada ayat di halaman/juz ini.</p>
                                                    <button 
                                                        onClick={() => { setFilterJuz(''); setFilterPage(''); }}
                                                        className="mt-4 px-4 py-2 bg-[#b08d57] text-white rounded-lg text-sm font-bold"
                                                    >
                                                        Hapus Filter
                                                    </button>
                                                </div>
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
                                ) : (
                                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-10 shadow-xl border border-slate-100 dark:border-slate-700">
                                        <div className="max-w-3xl mx-auto">
                                            <div className="text-center mb-8">
                                                <div className="w-16 h-16 bg-[#1799dc]/10 text-[#1799dc] rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <BrainCircuit className="w-8 h-8" />
                                                </div>
                                                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Mode Sambung Ayat</h3>
                                                <p className="text-slate-500 dark:text-slate-400 mt-2">Belajar menghafal dengan mendengarkan Syeikh lalu menyambung ayat berikutnya.</p>
                                            </div>

                                            {tahfidzStep === 'IDLE' ? (
                                                <div className="py-6">
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                                        <button 
                                                            onClick={() => setTahfidzLevel('urut')}
                                                            className={`p-4 rounded-2xl border-2 text-left transition-all ${tahfidzLevel === 'urut' ? 'border-[#1799dc] bg-[#1799dc]/5 ring-4 ring-[#1799dc]/20' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}
                                                        >
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs">1</span>
                                                                <h4 className="font-bold text-slate-800 dark:text-slate-100">Gantian Ayat</h4>
                                                            </div>
                                                            <p className="text-xs text-slate-500 dark:text-slate-400">Syeikh membaca, lalu giliran Anda membaca ayat berikutnya berurutan.</p>
                                                        </button>
                                                        <button 
                                                            onClick={() => setTahfidzLevel('potongan')}
                                                            className={`p-4 rounded-2xl border-2 text-left transition-all ${tahfidzLevel === 'potongan' ? 'border-[#1799dc] bg-[#1799dc]/5 ring-4 ring-[#1799dc]/20' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}
                                                        >
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-xs">2</span>
                                                                <h4 className="font-bold text-slate-800 dark:text-slate-100">Potongan Ayat</h4>
                                                            </div>
                                                            <p className="text-xs text-slate-500 dark:text-slate-400">Menebak lanjutan dari potongan bagian ayat yang hilang.</p>
                                                        </button>
                                                        <button 
                                                            onClick={() => setTahfidzLevel('acak')}
                                                            className={`p-4 rounded-2xl border-2 text-left transition-all ${tahfidzLevel === 'acak' ? 'border-[#1799dc] bg-[#1799dc]/5 ring-4 ring-[#1799dc]/20' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}
                                                        >
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs">3</span>
                                                                <h4 className="font-bold text-slate-800 dark:text-slate-100">Acak (Per Juz)</h4>
                                                            </div>
                                                            <p className="text-xs text-slate-500 dark:text-slate-400">Diuji menyambung ayat secara acak sempurna. Simulasi tes tahfidz juz.</p>
                                                        </button>
                                                    </div>
                                                    <div className="text-center">
                                                        <button 
                                                            onClick={() => {
                                                                if (tahfidzLevel === 'acak' || tahfidzLevel === 'potongan') {
                                                                    // Random ayat to start
                                                                    const randIdx = Math.floor(Math.random() * (surahDetail.ayat.length - 1));
                                                                    setTahfidzAyahIdx(randIdx);
                                                                    setTahfidzStep('SHEIKH');
                                                                    const firstAyah = surahDetail.ayat[randIdx];
                                                                    const audioUrl = getAudioUrl(firstAyah);
                                                                    toggleAudio(audioUrl, firstAyah.nomorAyat, firstAyah.quranComAudio?.segments);
                                                                } else {
                                                                    setTahfidzAyahIdx(0);
                                                                    setTahfidzStep('SHEIKH');
                                                                    const firstAyah = surahDetail.ayat[0];
                                                                    const audioUrl = getAudioUrl(firstAyah);
                                                                    toggleAudio(audioUrl, firstAyah.nomorAyat, firstAyah.quranComAudio?.segments);
                                                                }
                                                            }}
                                                            className="px-10 py-5 bg-[#1799dc] hover:bg-[#1688c5] text-white rounded-2xl font-bold text-xl shadow-lg shadow-[#1799dc]/20 transition-all transform hover:scale-105 inline-flex items-center gap-3"
                                                        >
                                                            Mulai Hafalan <ChevronRight className="w-6 h-6" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-10">
                                                    {/* Current Context */}
                                                    {tahfidzStep === 'SHEIKH' && (
                                                        <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 relative overflow-hidden">
                                                            <div className="absolute top-0 left-0 w-1 h-full bg-[#1799dc]"></div>
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-[#1799dc] mb-3 block">Ayat Terakhir Diputar</span>
                                                            {renderArabicWithHighlight(
                                                                surahDetail.ayat[tahfidzAyahIdx], 
                                                                false, 
                                                                "font-arabic text-3xl md:text-4xl leading-[2.2] text-right text-slate-800 dark:text-slate-100 mb-4"
                                                            )}
                                                            <div className="flex justify-between items-end">
                                                                <div className="flex-1">
                                                                    <p className="text-xs font-bold text-[#1799dc] mb-1">{surahDetail.ayat[tahfidzAyahIdx].teksLatin}</p>
                                                                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{surahDetail.ayat[tahfidzAyahIdx].teksIndonesia}</p>
                                                                </div>
                                                                <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center font-bold text-[#1799dc] shadow-sm border border-slate-100 dark:border-slate-700">
                                                                    {surahDetail.ayat[tahfidzAyahIdx].nomorAyat}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Next Verse Prompt */}
                                                    <div className="text-center py-6">
                                                        {tahfidzStep === 'SHEIKH' ? (
                                                            <div className="flex flex-col items-center">
                                                                <div className="w-12 h-12 bg-[#1799dc]/10 text-[#1799dc] rounded-full flex items-center justify-center mb-4 animate-pulse">
                                                                    <Volume2 className="w-6 h-6" />
                                                                </div>
                                                                <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">Syekh sedang membacakan...</h4>
                                                                <p className="text-sm text-slate-500 mt-2">Simak dan perhatikan bacaannya.</p>
                                                            </div>
                                                        ) : tahfidzStep === 'USER' ? (
                                                            <div className="flex flex-col items-center">
                                                                <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mb-4">
                                                                    <Mic className="w-6 h-6" />
                                                                </div>
                                                                <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">Sekarang Giliran Anda!</h4>
                                                                <p className="text-sm text-slate-500 mt-2 mb-8">
                                                                    {tahfidzLevel === 'potongan' ? 
                                                                        `Teruskan potongan awal ayat ${surahDetail.ayat[tahfidzAyahIdx + 1]?.nomorAyat} berikut hingga selesai:` : 
                                                                        `Sambunglah ayat ke-${surahDetail.ayat[tahfidzAyahIdx + 1]?.nomorAyat || 'selanjutnya'}.`
                                                                    }
                                                                </p>
                                                                
                                                                {tahfidzLevel === 'potongan' && (
                                                                    <div className="relative bg-amber-50 dark:bg-amber-900/20 p-6 rounded-2xl border border-amber-100 dark:border-amber-500/30 mb-8 w-full group">
                                                                        <div className="absolute top-4 left-4">
                                                                            <button
                                                                                onClick={() => {
                                                                                    const ayah = surahDetail.ayat[tahfidzAyahIdx + 1];
                                                                                    if (ayah) {
                                                                                        const audioUrl = getAudioUrl(ayah);
                                                                                        const stopEarlyMs = getPotonganEndTimeMs(ayah.teksArab, ayah.quranComAudio?.segments);
                                                                                        toggleAudio(audioUrl, ayah.nomorAyat, ayah.quranComAudio?.segments, stopEarlyMs);
                                                                                    }
                                                                                }}
                                                                                className="w-10 h-10 bg-amber-200 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center hover:bg-amber-300 dark:hover:bg-amber-800 transition-colors shadow-sm"
                                                                                title="Putar Audio"
                                                                            >
                                                                                {playingAudio === getAudioUrl(surahDetail.ayat[tahfidzAyahIdx + 1]) ? (
                                                                                    <Square className="w-4 h-4" fill="currentColor" />
                                                                                ) : (
                                                                                    <Volume2 className="w-5 h-5" fill="currentColor" />
                                                                                )}
                                                                            </button>
                                                                        </div>
                                                                        {renderArabicWithHighlight(
                                                                            surahDetail.ayat[tahfidzAyahIdx + 1],
                                                                            true,
                                                                            "font-arabic text-3xl leading-[2.2] text-center text-slate-800 dark:text-slate-200 ml-14"
                                                                        )}
                                                                    </div>
                                                                )}
                                                                
                                                                <div className="flex flex-col md:flex-row gap-4 w-full max-w-sm">
                                                                    <button 
                                                                        onClick={() => {
                                                                            setTahfidzStep('CHECK');
                                                                            const nextAyah = surahDetail.ayat[tahfidzAyahIdx + 1];
                                                                            if (nextAyah) {
                                                                                const audioUrl = getAudioUrl(nextAyah);
                                                                                toggleAudio(audioUrl, nextAyah.nomorAyat, nextAyah.quranComAudio?.segments);
                                                                            }
                                                                        }}
                                                                        className="flex-1 py-4 bg-[#1799dc] hover:bg-[#1688c5] text-white rounded-2xl font-black shadow-lg shadow-[#1799dc]/20 transition-all flex items-center justify-center gap-2"
                                                                    >
                                                                        <Eye className="w-5 h-5" />
                                                                        Cek Hafalan
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => {
                                                                            if (recordingAyah) {
                                                                                stopRecording();
                                                                            } else {
                                                                                const nextAyah = surahDetail.ayat[tahfidzAyahIdx + 1];
                                                                                if (nextAyah) {
                                                                                    startRecording(nextAyah.nomorAyat);
                                                                                }
                                                                            }
                                                                        }}
                                                                        className={`flex-1 py-4 border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-black rounded-2xl transition-all flex items-center justify-center gap-2 ${recordingAyah ? 'bg-red-50 text-red-500 border-red-200' : 'hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                                                                    >
                                                                        {recordingAyah ? <Square className="w-4 h-4" /> : <Mic className="w-5 h-5" />}
                                                                        {recordingAyah ? 'Berhenti' : 'Rekam Bacaan'}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="flex flex-col items-center">
                                                                <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-4">
                                                                    <CheckCircle2 className="w-6 h-6" />
                                                                </div>
                                                                <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">Koreksi Bacaan</h4>
                                                                <p className="text-sm text-slate-500 mt-2 mb-6">Berikut adalah ayat yang Anda baca tadi.</p>
                                                                
                                                                <div className="w-full bg-green-50/50 dark:bg-green-900/10 p-6 rounded-3xl border border-green-100 dark:border-green-900/30 mb-8 relative hover:border-green-300 transition-colors group">
                                                                    <div className="absolute top-4 left-4">
                                                                        <button
                                                                            onClick={() => {
                                                                                const ayah = surahDetail.ayat[tahfidzAyahIdx + 1];
                                                                                if (ayah) {
                                                                                    const audioUrl = getAudioUrl(ayah);
                                                                                    toggleAudio(audioUrl, ayah.nomorAyat, ayah.quranComAudio?.segments);
                                                                                }
                                                                            }}
                                                                            className="w-10 h-10 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center hover:bg-green-200 dark:hover:bg-green-800 transition-colors shadow-sm"
                                                                            title="Putar Audio"
                                                                        >
                                                                            {playingAudio === getAudioUrl(surahDetail.ayat[tahfidzAyahIdx + 1]) ? (
                                                                                <Square className="w-4 h-4" fill="currentColor" />
                                                                            ) : (
                                                                                <Play className="w-4 h-4 ml-1" fill="currentColor" />
                                                                            )}
                                                                        </button>
                                                                    </div>
                                                                    {renderArabicWithHighlight(
                                                                        surahDetail.ayat[tahfidzAyahIdx + 1],
                                                                        false,
                                                                        "font-arabic text-3xl md:text-4xl leading-[2.2] text-right text-slate-800 dark:text-slate-100 mb-4 ml-14"
                                                                    )}
                                                                    <p className="text-sm font-bold text-green-600 mb-1">{surahDetail.ayat[tahfidzAyahIdx + 1]?.teksLatin}</p>
                                                                    <p className="text-sm text-slate-600 dark:text-slate-400">{surahDetail.ayat[tahfidzAyahIdx + 1]?.teksIndonesia}</p>
                                                                    
                                                                    {evaluationResults[surahDetail.ayat[tahfidzAyahIdx + 1]?.nomorAyat] && (
                                                                        <div className="mt-6 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-green-200 dark:border-green-800/30 text-left">
                                                                            <div className="flex items-center gap-2 mb-2 text-[#1799dc]">
                                                                                <Sparkles className="w-4 h-4" />
                                                                                <span className="text-xs font-black uppercase tracking-wider">Analisis Talaqqi AI</span>
                                                                            </div>
                                                                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                                                                {evaluationResults[surahDetail.ayat[tahfidzAyahIdx + 1]?.nomorAyat]}
                                                                            </p>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                <div className="flex gap-4 w-full max-w-sm">
                                                                    <button 
                                                                        onClick={() => {
                                                                            if (tahfidzLevel === 'acak' || tahfidzLevel === 'potongan') {
                                                                                const randIdx = Math.floor(Math.random() * (surahDetail.ayat.length - 1));
                                                                                setTahfidzAyahIdx(randIdx);
                                                                                setTahfidzStep('SHEIKH');
                                                                                const firstAyah = surahDetail.ayat[randIdx];
                                                                                const audioUrl = getAudioUrl(firstAyah);
                                                                                toggleAudio(audioUrl, firstAyah.nomorAyat, firstAyah.quranComAudio?.segments);
                                                                            } else {
                                                                                if (tahfidzAyahIdx + 2 < surahDetail.ayat.length) {
                                                                                    // Syeikh reads the NEXT NEXT verse (because we just did +1)
                                                                                    const nextSheikhIdx = tahfidzAyahIdx + 2;
                                                                                    setTahfidzAyahIdx(nextSheikhIdx);
                                                                                    setTahfidzStep('SHEIKH');
                                                                                    const nextAyah = surahDetail.ayat[nextSheikhIdx];
                                                                                    const audioUrl = getAudioUrl(nextAyah);
                                                                                    toggleAudio(audioUrl, nextAyah.nomorAyat, nextAyah.quranComAudio?.segments);
                                                                                } else {
                                                                                    setTahfidzStep('IDLE');
                                                                                    setTahfidzAyahIdx(0);
                                                                                }
                                                                            }
                                                                        }}
                                                                        className="flex-1 py-4 bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 rounded-2xl font-black shadow-lg transition-all flex items-center justify-center gap-2"
                                                                    >
                                                                        {tahfidzLevel === 'acak' || tahfidzLevel === 'potongan' ? 'Soal Berikutnya' : 'Gantian Berikutnya'}
                                                                        <ArrowRight className="w-5 h-5" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Progress */}
                                                    <div className="pt-6 border-t border-slate-100 dark:border-slate-700">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Progres Hafalan</span>
                                                            <span className="text-[10px] font-black text-[#1799dc]">{Math.round(((tahfidzAyahIdx + 1) / surahDetail.ayat.length) * 100)}%</span>
                                                        </div>
                                                        <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                            <div 
                                                                className="h-full bg-[#1799dc] transition-all duration-500" 
                                                                style={{ width: `${((tahfidzAyahIdx + 1) / surahDetail.ayat.length) * 100}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex justify-center">
                                                        <button 
                                                            onClick={() => {
                                                                setTahfidzStep('IDLE');
                                                                setTahfidzAyahIdx(0);
                                                                if (audioRef.current) audioRef.current.pause();
                                                                setPlayingAudio(null);
                                                            }}
                                                            className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors flex items-center gap-2"
                                                        >
                                                            <X className="w-4 h-4" />
                                                            Berhenti Berlatih
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
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
                                            
                                            <div className="mb-4 pr-10 overflow-y-auto max-h-[60vh] custom-scrollbar scroll-smooth p-2 -m-2">
                                                <span className="inline-block px-3 py-1 bg-[#1799dc]/10 text-[#1799dc] font-bold text-xs rounded-full border border-[#1799dc]/20 mb-3">
                                                    Surat {selectedSurah.namaLatin} : Ayat {ayah.nomorAyat}
                                                </span>
                                                
                                                <div className="my-4 text-right">
                                                    {ayah.quranComWords ? (
                                                        <p className="font-arabic text-2xl md:text-3xl leading-[2.2] md:leading-[2.5] text-slate-800 dark:text-slate-100" dir="rtl">
                                                            {ayah.quranComWords.map((word: any, wIndex: number) => {
                                                                if (word.char_type_name === 'end') return null;
                                                                return (
                                                                    <span key={`word-modal-wrap-${ayah.nomorAyat}-${wIndex}`}>
                                                                        <span 
                                                                            id={`word-modal-${ayah.nomorAyat}-${wIndex}`}
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
                                                            className={`font-arabic text-2xl md:text-3xl leading-[2.2] transition-colors duration-300 text-slate-800 dark:text-slate-100`}
                                                            dangerouslySetInnerHTML={{ __html: ayah.teksTajweed }} 
                                                            dir="rtl"
                                                        />
                                                    ) : (
                                                        <p className={`font-arabic text-2xl md:text-3xl leading-[2.2] transition-colors duration-300 text-slate-800 dark:text-slate-100`} dir="rtl">{ayah.teksArab}</p>
                                                    )}
                                                </div>

                                                <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-4">
                                                    <p className="text-sm font-medium mb-2 text-[#1799dc] dark:text-[#38bdf8]">{ayah.teksLatin}</p>
                                                    <p className="text-slate-700 dark:text-slate-200 text-sm md:text-base leading-relaxed font-semibold mb-4">
                                                        {ayah.teksIndonesia}
                                                    </p>
                                                </div>

                                                {ayah.tafsir && (
                                                    <div className="mb-4">
                                                        <button
                                                            onClick={async () => {
                                                                if (openTafsirAyah === ayah.nomorAyat) {
                                                                    setOpenTafsirAyah(null);
                                                                } else {
                                                                    setOpenTafsirAyah(ayah.nomorAyat);
                                                                }
                                                            }}
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
                                                                    <div className="bg-[#b08d57]/5 dark:bg-[#b08d57]/10 rounded-xl p-4 border border-[#b08d57]/20">
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

                                                {/* Tajweed Section */}
                                                {(ayah.teksTajweed || ayah.teksArab || ayah.quranComWords) && (
                                                    <div className="mt-4 pt-4 border-t border-dashed border-slate-200 dark:border-slate-700/50">
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <div className="w-1.5 h-4 bg-[#1799dc] rounded-full"></div>
                                                            <h4 className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500 dark:text-slate-400">Tajwid & Cara Baca</h4>
                                                        </div>
                                                        <div className="flex flex-col gap-2">
                                                            {getVerseTajweedRules(
                                                                (ayah.teksTajweed || '') + 
                                                                (ayah.teksArab || '') + 
                                                                (ayah.quranComWords?.map((w:any) => w.text_uthmani_tajweed || '').join(' ') || '')
                                                            ).map((rule, idx) => (
                                                                <div 
                                                                    key={`${rule.name}-mushaf-${idx}`} 
                                                                    className="flex items-start gap-3 p-2.5 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-700/40 hover:border-[#1799dc]/30 transition-colors"
                                                                >
                                                                    <div className="w-2.5 h-2.5 rounded-full mt-1 shrink-0 shadow-sm" style={{ backgroundColor: rule.color }}></div>
                                                                    <div className="flex-1">
                                                                        <div className="flex items-center gap-2 flex-wrap">
                                                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{rule.name}</span>
                                                                            {rule.transliteration && (
                                                                                <span className="text-[10px] px-2 py-0.5 rounded border border-[#1799dc]/20 text-[#1799dc] bg-[#1799dc]/5 font-medium">{rule.transliteration}</span>
                                                                            )}
                                                                        </div>
                                                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{rule.description}</p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                                <button 
                                                    onClick={() => {
                                                        const currentAudioUrl = getAudioUrl(ayah);
                                                        const segments = ayah.quranComAudio ? ayah.quranComAudio.segments : undefined;
                                                        toggleAudio(currentAudioUrl, ayah.nomorAyat, segments);
                                                    }}
                                                    className={`px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-sm transition-all ${(playingAudio !== null && playingAudio === getAudioUrl(ayah)) ? 'bg-[#1799dc] text-white shadow-md shadow-[#1799dc]/20' : 'bg-[#1799dc]/10 text-[#1799dc] hover:bg-[#1799dc]/20'}`}
                                                >
                                                    {(playingAudio !== null && playingAudio === getAudioUrl(ayah)) ? <span className="w-3 h-3 bg-white rounded-sm animate-pulse"></span> : <PlayCircle className="w-4 h-4" />}
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

                    {activeTab === 'kisahnabi' && (
                        <div>
                            {selectedKisah ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.5, ease: "easeOut" }}
                                >
                                    <button 
                                        onClick={() => {
                                            setSelectedKisah(null);
                                            stopNetworkTTS();
                                        }}
                                        className="flex items-center gap-2 text-slate-500 hover:text-[#1799dc] mb-6 transition-colors font-bold group"
                                    >
                                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                                        Kembali ke Daftar Kisah
                                    </button>

                                    <div className="bg-white dark:bg-slate-800 p-6 md:p-12 rounded-[3.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 overflow-hidden relative">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#1799dc]/5 blur-[80px] -mr-32 -mt-32 rounded-full"></div>
                                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#8b5cf6]/5 blur-[80px] -ml-32 -mb-32 rounded-full"></div>
                                        
                                        <div className="relative z-10">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-8 border-b border-slate-50 dark:border-slate-700/50">
                                                <div className="flex-1">
                                                    <div className="flex flex-wrap items-center gap-3 mb-4 text-[10px] md:text-xs">
                                                        <span className="px-3 py-1 bg-[#1799dc]/10 text-[#1799dc] rounded-full font-black uppercase tracking-widest">
                                                            Lahir: {selectedKisah.thn_kelahiran || '-'} SM
                                                        </span>
                                                        <span className="px-3 py-1 bg-amber-500/10 text-amber-600 rounded-full font-black uppercase tracking-widest">
                                                            Usia: {selectedKisah.usia || '-'} Tahun
                                                        </span>
                                                    </div>
                                                    <h2 className="font-black text-slate-800 dark:text-slate-100 text-3xl md:text-5xl leading-tight tracking-tight mb-3">
                                                        {selectedKisah.name}
                                                    </h2>
                                                    {selectedKisah.tmp && (
                                                        <p className="text-slate-500 dark:text-slate-400 font-medium text-lg flex items-center gap-2">
                                                            <MapPin className="w-5 h-5 text-[#1799dc]" />
                                                            Turun wahyu di {selectedKisah.tmp}
                                                        </p>
                                                    )}
                                                </div>
                                                <button 
                                                    onClick={() => toggleSpeechAudio(selectedKisah.description, `kisah-${selectedKisah.name}`, 'id-ID')}
                                                    className={`shrink-0 w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 ${playingAudio === `kisah-${selectedKisah.name}` ? 'bg-[#8b5cf6] text-white shadow-2xl shadow-[#8b5cf6]/40 scale-110' : 'bg-[#8b5cf6]/10 text-[#8b5cf6] hover:bg-[#8b5cf6] hover:text-white active:scale-95'}`}
                                                    title="Mulai Cerita"
                                                >
                                                    {playingAudio === `kisah-${selectedKisah.name}` ? (
                                                        <div className="flex items-center gap-1">
                                                            <div className="w-1.5 h-6 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                                            <div className="w-1.5 h-8 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                                            <div className="w-1.5 h-6 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                                        </div>
                                                    ) : (
                                                        <Volume2 className="w-8 h-8 ml-0.5" />
                                                    )}
                                                </button>
                                            </div>

                                            <div className="mt-8 relative">
                                                {/* Mini Map Overview */}
                                                <div className="mb-10 px-2">
                                                    <h3 className="text-xl font-black mb-4 flex items-center gap-2 text-slate-800 dark:text-slate-100">
                                                        <MapPin className="w-5 h-5 text-[#1799dc]" />
                                                        Peta Perjalanan
                                                    </h3>
                                                    <div className="relative pt-6 pb-4 overflow-x-auto scrollbar-hide">
                                                        <div className="absolute top-9 left-4 right-4 h-1 bg-slate-200 dark:bg-slate-700 rounded-full z-0"></div>
                                                        {activeKisahStep > 0 && (
                                                            <div 
                                                                className="absolute top-9 left-4 h-1 bg-[#1799dc] rounded-full z-0 transition-all duration-500 delay-100"
                                                                style={{ width: `calc(${(activeKisahStep / (kisahTimeline.length - 1)) * 100}% - 2rem)` }}
                                                            ></div>
                                                        )}
                                                        
                                                        <div className="relative z-10 flex justify-between min-w-[max-content] md:min-w-full gap-8 px-4">
                                                            {kisahTimeline.map((block, idx) => (
                                                                <button
                                                                    key={`map-node-${idx}`}
                                                                    onClick={() => setActiveKisahStep(idx)}
                                                                    className={`flex flex-col items-center gap-3 group transition-all duration-300 ${activeKisahStep === idx ? 'scale-110' : 'opacity-60 hover:opacity-100'}`}
                                                                >
                                                                    <div className={`w-5 h-5 rounded-full border-4 transition-all duration-300 ${activeKisahStep >= idx ? 'border-[#1799dc] bg-white dark:bg-slate-800 shadow-[0_0_15px_rgba(23,153,220,0.5)]' : 'border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-700'}`}></div>
                                                                    <div className={`text-[10px] md:text-xs font-black uppercase tracking-widest whitespace-nowrap px-3 py-1 rounded-full ${activeKisahStep === idx ? 'bg-[#1799dc] text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                                                                        {block.location}
                                                                    </div>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="absolute left-[2.2rem] top-40 bottom-8 w-1 bg-gradient-to-b from-[#1799dc]/20 via-[#1799dc]/10 to-transparent rounded-full hidden md:block"></div>
                                                <div className="space-y-4 md:space-y-6">
                                                    {kisahTimeline.map((block, idx) => (
                                                        <motion.div 
                                                            key={idx}
                                                            className={`relative md:pl-24 transition-all duration-500 cursor-pointer ${activeKisahStep === idx ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
                                                            onClick={() => setActiveKisahStep(idx)}
                                                        >
                                                            {/* Custom Timeline Dot */}
                                                            <div className={`hidden md:block absolute left-[1.95rem] top-8 w-3 h-3 rounded-full transition-all duration-500 z-10 ${activeKisahStep === idx ? 'bg-[#1799dc] scale-150 ring-4 ring-[#1799dc]/20' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                                                            
                                                            <div className={`bg-white dark:bg-slate-800 p-5 md:p-6 rounded-3xl md:rounded-[2rem] border transition-all duration-500 ${activeKisahStep === idx ? 'border-[#1799dc] shadow-xl shadow-[#1799dc]/10 ring-2 ring-[#1799dc]/5' : 'border-slate-100 dark:border-slate-700'}`}>
                                                                <div className="flex justify-between items-center mb-2">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="text-xs font-black text-[#1799dc] uppercase tracking-widest bg-[#1799dc]/10 px-4 py-1.5 rounded-full flex flex-col items-center">
                                                                            <MapPin className="w-4 h-4 mb-1" />
                                                                            {block.location}
                                                                        </div>
                                                                    </div>
                                                                    <button 
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setActiveKisahStep(idx);
                                                                            toggleSpeechAudio(block.content, `kisah-step-${idx}`, 'id-ID');
                                                                        }}
                                                                        className={`w-10 h-10 rounded-full flex shrink-0 items-center justify-center transition-all duration-300 ${playingAudio === `kisah-step-${idx}` ? 'bg-[#8b5cf6] text-white shadow-lg shadow-[#8b5cf6]/30 scale-110' : 'bg-slate-50 dark:bg-slate-700/50 text-[#8b5cf6] hover:bg-[#8b5cf6]/20'}`}
                                                                        title="Putar Audio Bagian Ini"
                                                                    >
                                                                        {playingAudio === `kisah-step-${idx}` ? (
                                                                            <div className="flex items-center gap-0.5">
                                                                                <div className="w-1 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                                                                <div className="w-1 h-4 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                                                                <div className="w-1 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                                                            </div>
                                                                        ) : (
                                                                            <Volume2 className="w-4 h-4 ml-0.5" />
                                                                        )}
                                                                    </button>
                                                                </div>
                                                                
                                                                <h4 className="font-bold text-lg md:text-xl text-slate-800 dark:text-slate-100 mb-2 mt-4">{block.title}</h4>

                                                                <div className={`grid transition-all duration-500 overflow-hidden ${activeKisahStep === idx ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0 mt-0'}`}>
                                                                    <div className="min-h-0 text-slate-700 dark:text-slate-300 leading-relaxed font-medium text-base md:text-lg whitespace-pre-wrap">
                                                                        {block.content}
                                                                    </div>
                                                                </div>
                                                                {activeKisahStep !== idx && (
                                                                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium text-sm md:text-base line-clamp-2 mt-2">
                                                                        {block.content}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <div>
                                    <div className="mb-8 relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Search className="h-5 w-5 text-slate-400" />
                                        </div>
                                        <input
                                            type="text"
                                            value={searchKisah}
                                            onChange={(e) => setSearchKisah(e.target.value)}
                                            placeholder="Cari nabi atau rasul..."
                                            className="w-full pl-11 pr-4 py-4 md:py-5 border-none rounded-3xl bg-white dark:bg-slate-800 shadow-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1799dc]/50 transition-all font-medium text-sm md:text-base outline-none"
                                        />
                                    </div>

                                    {loadingKisah ? (
                                        <div className="flex justify-center items-center py-20">
                                            <Loader2 className="w-8 h-8 animate-spin text-[#1799dc]" />
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            <AnimatePresence mode="popLayout">
                                                {kisahNabis
                                                    .filter(k => k.name.toLowerCase().includes(searchKisah.toLowerCase()))
                                                    .map((kisah, idx) => (
                                                    <motion.button 
                                                        key={idx}
                                                        layout
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, scale: 0.95 }}
                                                        onClick={() => {
                                                            setSelectedKisah(kisah);
                                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                                        }}
                                                        className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm hover:shadow-md hover:border-[#1799dc] border border-slate-100 dark:border-slate-700 transition-all text-left flex flex-col justify-between group h-full"
                                                    >
                                                        <div>
                                                            <div className="flex items-center gap-3 mb-4 text-[10px]">
                                                                <span className="px-2.5 py-1 bg-[#1799dc]/10 text-[#1799dc] rounded-full font-black uppercase tracking-widest shrink-0">
                                                                    {kisah.usia} Thn
                                                                </span>
                                                                <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-full font-bold uppercase tracking-widest truncate">
                                                                    {kisah.tmp || '-'}
                                                                </span>
                                                            </div>
                                                            <h3 className="font-black text-xl text-slate-800 dark:text-slate-100 group-hover:text-[#1799dc] transition-colors mb-3">
                                                                {kisah.name}
                                                            </h3>
                                                            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                                                                {kisah.description}
                                                            </p>
                                                        </div>
                                                        <div className="mt-6 flex justify-end">
                                                            <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center group-hover:bg-[#1799dc] transition-colors">
                                                                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white" />
                                                            </div>
                                                        </div>
                                                    </motion.button>
                                                ))}
                                            </AnimatePresence>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                    {activeTab === 'buku' && (
                        <div className="animate-fade-in-up">
                            <div className="mb-8 p-6 lg:p-8 bg-gradient-to-br from-[#1799dc] to-[#1384c2] rounded-3xl shadow-lg relative overflow-hidden text-white">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl -mr-32 -mt-32 rounded-full"></div>
                                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 blur-2xl -ml-24 -mb-24 rounded-full"></div>
                                <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center">
                                    <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm hidden md:block">
                                        <Book className="w-12 h-12 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black mb-2 flex items-center gap-3">
                                            Perpustakaan Islami Gratis
                                        </h2>
                                        <p className="text-white/80 font-medium leading-relaxed max-w-2xl text-sm md:text-base">
                                            Koleksi kitab-kitab utama umat Islam yang dapat Anda baca secara gratis dan legal. Disertai dengan tautan untuk mengunduh atau membaca e-book langsung dari sumber aslinya.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {curatedBooks.map((book, idx) => (
                                    <div key={idx} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col h-full hover:shadow-md hover:border-[#1799dc]/40 transition-all group relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-[#1799dc]/5 rounded-bl-full -z-0"></div>
                                        
                                        <div className="flex-1 relative z-10">
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="px-2.5 py-1 bg-[#1799dc]/10 dark:bg-[#1799dc]/20 text-[#1799dc] dark:text-[#3db2f0] text-[10px] font-black uppercase tracking-widest rounded-md">
                                                    {book.source}
                                                </span>
                                            </div>
                                            
                                            <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xl mb-1.5 leading-tight group-hover:text-[#1799dc] transition-colors">{book.title}</h4>
                                            
                                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-4 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800/50">
                                                <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                                                    <span className="font-bold">{book.author.charAt(0)}</span>
                                                </div>
                                                <span className="truncate">{book.author}</span>
                                            </div>
                                            
                                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">{book.description}</p>
                                        </div>
                                        
                                        <div className="relative z-10 pt-4 border-t border-slate-100 dark:border-slate-700/50 mt-auto">
                                            <a 
                                                href={book.readUrl} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="w-full py-3 bg-[#1799dc] hover:bg-[#1384c2] text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-sm shadow-[#1799dc]/20"
                                            >
                                                <BookOpen className="w-4 h-4" /> Baca PDF
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {activeTab === 'makhraj' && (
                        <div className="animate-fade-in-up">
                            <MakhrajPage />
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
