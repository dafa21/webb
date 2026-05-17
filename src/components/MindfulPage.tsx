import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Play, Pause, Wind, Moon, Heart, Shield, Volume2, Loader2, Sparkles, AlertCircle, CheckCircle2, BookOpen, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MurottalList = [
    { id: 1, surah: 'Ar-Rahman', reciter: 'Mishary Rashid Alafasy', url: 'https://server8.mp3quran.net/afs/055.mp3', duration: '15:23' },
    { id: 2, surah: 'Al-Mulk', reciter: 'Mishary Rashid Alafasy', url: 'https://server8.mp3quran.net/afs/067.mp3', duration: '7:30' },
    { id: 3, surah: 'Yasin', reciter: 'Mishary Rashid Alafasy', url: 'https://server8.mp3quran.net/afs/036.mp3', duration: '14:50' },
    { id: 4, surah: 'Al-Kahf', reciter: 'Mishary Rashid Alafasy', url: 'https://server8.mp3quran.net/afs/018.mp3', duration: '34:20' }
];

const MuhasabahPrompts = [
    "Apakah lisanku hari ini lebih banyak berdzikir atau bergunjing?",
    "Sudahkah aku mensyukuri setidaknya 3 nikmat kecil hari ini?",
    "Apakah ada hati yang tanpa sadar aku sakiti melalui candaanku?",
    "Sudahkah aku menunaikan shalat tepat pada waktunya?",
    "Jika hari ini adalah hari terakhirku, apakah amalku cukup?"
];

const RuqyahList = [
    {
        title: "Surah Al-Fatihah",
        arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ۝ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ۝ الرَّحْمَٰنِ الرَّحِيمِ ۝ مَالِكِ يَوْمِ الدِّينِ ۝ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ۝ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ۝ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
        translation: "Surah Al-Fatihah adalah meruqyah (mengobati). (HR. Bukhari dan Muslim)"
    },
    {
        title: "5 Ayat Pertama Al-Baqarah",
        arabic: "الم ۝ ذَٰلِكَ الْكِتَابُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ ۝ الَّذِينَ يُؤْمِنُونَ بِالْغَيْبِ وَيُقِيمُونَ الصَّلَاةَ وَمِمَّا رَزَقْنَاهُمْ يُنفِقُونَ ۝ وَالَّذِينَ يُؤْمِنُونَ بِمَا أُنزِلَ إِلَيْكَ وَمَا أُنزِلَ مِن قَبْلِكَ وَبِالْآخِرَةِ هُمْ يُوقِنُونَ ۝ أُولَٰئِكَ عَلَىٰ هُدًى مِّن رَّبِّهِمْ ۖ وَأُولَٰئِكَ هُمُ الْمُفْلِحُونَ",
        translation: "Sebagai pelindung tambahan dari gangguan setan di rumah."
    },
    {
        title: "Ayat Kursi",
        arabic: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ",
        translation: "\"Barangsiapa membaca ayat kursi ketika berbaring di tempat tidurnya, maka Allah akan senantiasa menjaganya dan setan tidak akan mendekatinya hingga pagi hari.\" (HR. Bukhari)"
    },
    {
        title: "Dua Ayat Terakhir Al-Baqarah",
        arabic: "ءَامَنَ ٱلرَّسُولُ بِمَآ أُنزِلَ إِلَيْهِ مِن رَّبِّهِۦ وَٱلْمُؤْمِنُونَ ۚ كُلٌّ ءَامَنَ بِٱللَّهِ وَمَلَـٰٓئِكَتِهِۦ وَكُتُبِهِۦ وَرُسُلِهِۦ لَا نُفَرِّقُ بَيْنَ أَحَدٍ مِّن رُّسُلِهِۦ ۚ وَقَالُوا۟ سَمِعْنَا وَأَطَعْنَا ۖ غُفْرَانَكَ رَبَّنَا وَإِلَيْكَ ٱلْمَصِيرُ ۝ لَا يُكَلِّفُ ٱللَّهُ نَفْسًا إِلَّا وُسْعَهَا ۚ لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا ٱكْتَسَبَتْ ۗ رَبَّنَا لَا تُؤَاخِذْنَآ إِن نَّسِينَآ أَوْ أَخْطَأْنَا ۚ رَبَّنَا وَلَا تَحْمِلْ عَلَيْنَآ إِصْرًا كَمَا حَمَلْتَهُۥ عَلَى ٱلَّذِينَ مِن قَبْلِنَا ۚ رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِۦ ۖ وَٱعْفُ عَنَّا وَٱغْفِرْ لَنَا وَٱرْحَمْنَآ ۚ أَنتَ مَوْلَىٰنَا فَٱنصُرْنَا عَلَى ٱلْقَوْمِ ٱلْكَـٰفِرِينَ",
        translation: "\"Barangsiapa membaca dua ayat terakhir dari surat Al Baqarah pada malam hari, maka dua ayat tersebut telah mencukupinya.\" (HR. Bukhari dan Muslim)"
    },
    {
        title: "Ayat Pembatal Sihir (Al-A'raf 117-122)",
        arabic: "وَأَوْحَيْنَآ إِلَىٰ مُوسَىٰٓ أَنْ أَلْقِ عَصَاكَ ۖ فَإِذَا هِيَ تَلْقَفُ مَا يَأْفِكُونَ ۝ فَوَقَعَ ٱلْحَقُّ وَبَطَلَ مَا كَانُوا۟ يَعْمَلُونَ ۝ فَغُلِبُوا۟ هُنَالِكَ وَٱنقَلَبُوا۟ صَاغِرِينَ ۝ وَأُلْقِيَ ٱلسَّحَرَةُ سَاجِدِينَ ۝ قَالُوٓا۟ ءَامَنَّا بِرَبِّ ٱلْعَالَمِينَ ۝ رَبِّ مُوسَىٰ وَهَارُونَ",
        translation: "Dan Kami wahyukan kepada Musa: \"Lemparkanlah tongkatmu!\". Maka sekonyong-konyong tongkat itu menelan apa yang mereka sulapkan. Karena itu nyatalah yang benar dan batallah yang selalu mereka kerjakan. Maka mereka kalah di tempat itu dan jadilah mereka orang-orang yang hina. Dan ahli-ahli sihir itu serta merta meniarap bersujud."
    },
    {
        title: "Ayat Pembatal Sihir (Yunus 81-82)",
        arabic: "فَلَمَّآ أَلْقَوْا۟ قَالَ مُوسَىٰ مَا جِئْتُم بِهِ ٱلسِّحْرُ ۖ إِنَّ ٱللَّهَ سَيُبْطِلُهُۥٓ ۖ إِنَّ ٱللَّهَ لَا يُصْلِحُ عَمَلَ ٱلْمُفْسِدِينَ ۝ وَيُحِقُّ ٱللَّهُ ٱلْحَقَّ بِكَلِمَاتِهِۦ وَلَوْ كَرِهَ ٱلْمُجْرِمُونَ",
        translation: "Maka setelah mereka lemparkan, Musa berkata: \"Apa yang kamu datangkan itu, itulah sihir, sesungguhnya Allah akan menampakkan kebatilannya\". Sesungguhnya Allah tidak membiarkan terus berlangsungnya pekerjaan orang-orang yang membuat kerusakan."
    },
    {
        title: "Ayat Pembatal Sihir (Thaha 69)",
        arabic: "وَأَلْقِ مَا فِى يَمِينِكَ تَلْقَفْ مَا صَنَعُوٓا۟ ۖ إِنَّمَا صَنَعُوا۟ كَيْدُ سَاحِرٍ ۖ وَلَا يُفْلِحُ ٱلسَّاحِرُ حَيْثُ أَتَىٰ",
        translation: "Dan lemparkanlah apa yang ada ditangan kananmu, niscaya ia akan menelan apa yang mereka perbuat. Sesungguhnya apa yang mereka perbuat itu adalah tipu daya tukang sihir (belaka). Dan tidak akan menang tukang sihir itu, dari mana saja ia datang."
    },
    {
        title: "Tiga Qul (Al-Ikhlas, Al-Falaq, An-Nas)",
        instruction: "Rapatkan kedua telapak tangan, tiup (dengan sedikit ludah halus), lalu bacakan ke dalamnya, kemudian usapkan ke seluruh tubuh yang bisa dijangkau dari kepala hingga kaki. Ulangi 3 kali.",
        arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ. اللَّهُ الصَّمَدُ. لَمْ يَلِدْ وَلَمْ يُولَدْ. وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ.\n\nقُلْ أَعُوذُ بِرَبِّ الْفَلَقِ. مِنْ شَرِّ مَا خَلَقَ. وَمِنْ شَرِّ غَاسِقٍ إِذَا وَقَبَ. وَمِنْ شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ. وَمِنْ شَرِّ حَاسِدٍ إِذَا حَسَدَ.\n\nقُلْ أَعُوذُ بِرَبِّ النَّاسِ. مَلِكِ النَّاسِ. إِلَهِ النَّاسِ. مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ. الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ. مِنَ الْجِنَّةِ وَالنَّاسِ."
    },
    {
        title: "Sayyidul Istighfar",
        arabic: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
        translation: "Penghulu istighfar yang jika dibaca dengan yakin di malam hari lalu meninggal sebelum pagi, maka ia termasuk penghuni surga. (HR. Bukhari)"
    },
    {
        title: "Doa Sebelum Tidur (Bismika)",
        arabic: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
        translation: "\"Dengan nama-Mu Ya Allah, aku mati dan aku hidup.\""
    }
];

const MindfulPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'firstaid' | 'breathe' | 'murottal' | 'muhasabah' | 'ruqyah'>('firstaid');

    // First Aid State
    const [selectedEmotion, setSelectedEmotion] = useState('');
    const [firstAidData, setFirstAidData] = useState<any>(null);
    const [isLoadingFirstAid, setIsLoadingFirstAid] = useState(false);
    const [playingAudioType, setPlayingAudioType] = useState<string | null>(null);
    const dzikirAudioRef = useRef<HTMLAudioElement | null>(null);

    // Murottal State
    const [playingTrack, setPlayingTrack] = useState<number | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    // Breathe State
    const [breatheState, setBreatheState] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
    const [breatheActive, setBreatheActive] = useState(false);
    const breatheTimer = useRef<any>(null);

    // Muhasabah State
    const [currentPrompt, setCurrentPrompt] = useState(0);

    const toggleMurottal = (trackId: number, url: string) => {
        if (playingTrack === trackId && isPlaying) {
            audioRef.current?.pause();
            setIsPlaying(false);
            return;
        }
        
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = url;
            audioRef.current.play();
            setPlayingTrack(trackId);
            setIsPlaying(true);
        }
    };

    const runBreatheCycle = () => {
        setBreatheState('inhale');
        breatheTimer.current = setTimeout(() => {
            setBreatheState('hold');
            breatheTimer.current = setTimeout(() => {
                setBreatheState('exhale');
                breatheTimer.current = setTimeout(runBreatheCycle, 4000);
            }, 3000); // Exhale for 4s, Hold for 3s
        }, 4000); // Inhale for 4s
    };

    const toggleBreathe = () => {
        if (breatheActive) {
            setBreatheActive(false);
            clearTimeout(breatheTimer.current);
            setBreatheState('inhale');
        } else {
            setBreatheActive(true);
            runBreatheCycle();
        }
    };

    useEffect(() => {
        audioRef.current = new Audio();
        audioRef.current.onended = () => setIsPlaying(false);
        
        dzikirAudioRef.current = new Audio();
        dzikirAudioRef.current.onended = () => setPlayingAudioType(null);
        
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
            }
            if (dzikirAudioRef.current) {
                dzikirAudioRef.current.pause();
            }
            clearTimeout(breatheTimer.current);
        };
    }, []);

    const fetchFirstAid = async (emotion: string) => {
        setSelectedEmotion(emotion);
        setFirstAidData(null);
        setIsLoadingFirstAid(true);
        if (dzikirAudioRef.current) dzikirAudioRef.current.pause();
        setPlayingAudioType(null);
        
        try {
            const res = await fetch('/api/spiritual-first-aid', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ emotion })
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || 'Gagal mengambil data');
            }
            const data = await res.json();
            setFirstAidData(data);
        } catch (error: any) {
            console.error(error);
            alert(error.message || "Terjadi kesalahan, pastikan koneksi dan API Key tersedia.");
        } finally {
            setIsLoadingFirstAid(false);
        }
    };

    const playArabicAudio = (text: string, type: string) => {
        if (playingAudioType === type && dzikirAudioRef.current && !dzikirAudioRef.current.paused) {
            dzikirAudioRef.current.pause();
            setPlayingAudioType(null);
            return;
        }
        if (dzikirAudioRef.current) {
            dzikirAudioRef.current.src = `/api/tts?text=${encodeURIComponent(text)}&lang=ar`;
            dzikirAudioRef.current.play();
            setPlayingAudioType(type);
        }
    };

    return (
        <div className="min-h-screen bg-[#070B14] text-slate-200 font-sans selection:bg-emerald-500/30 overflow-hidden relative">
            {/* Ambient Backgrounds */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-900/10 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-teal-900/10 rounded-full blur-[120px]"></div>
                <div className="absolute top-[40%] right-[10%] w-[30%] h-[30%] bg-indigo-900/10 rounded-full blur-[100px]"></div>
            </div>

            <div className="relative z-10 max-w-lg mx-auto h-screen flex flex-col">
                <header className="flex items-center justify-between pt-10 pb-6 px-6 shrink-0">
                    <button onClick={() => navigate('/')} className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-md flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors border border-white/5">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="text-xs font-semibold text-slate-400 tracking-[0.2em] uppercase">Islamic Healing</div>
                    <div className="w-10 h-10"></div>
                </header>

                <nav className="flex items-center justify-start md:justify-center gap-3 px-6 pb-2 overflow-x-auto scrollbar-hide shrink-0 snap-x">
                    {[
                        { id: 'firstaid', icon: Heart, label: 'P3K Hati' },
                        { id: 'breathe', icon: Wind, label: 'Breathe' },
                        { id: 'murottal', icon: Volume2, label: 'Murottal' },
                        { id: 'muhasabah', icon: Moon, label: 'Refleksi' },
                        { id: 'ruqyah', icon: Shield, label: 'Ruqyah' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`snap-center flex items-center justify-center gap-2 px-5 py-3 rounded-full text-sm font-medium transition-all duration-300 ${activeTab === tab.id ? 'bg-white text-[#070B14] shadow-[0_0_20px_rgba(255,255,255,0.15)]' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200 backdrop-blur-md border border-white/5'}`}
                        >
                            <tab.icon className="w-4 h-4" />
                            <span className="whitespace-nowrap">{tab.label}</span>
                        </button>
                    ))}
                </nav>

                <main className="px-6 flex-1 overflow-y-auto scrollbar-hide pb-20 relative">
                    <AnimatePresence mode="wait">
                        {activeTab === 'firstaid' && (
                            <motion.div
                                key="firstaid"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-8 pt-6 pb-20"
                            >
                                <div className="text-center space-y-3">
                                    <h2 className="text-3xl font-serif text-white tracking-tight">P3K Hati (First-Aid)</h2>
                                    <p className="text-slate-400 text-[15px]">Apa yang sedang kamu rasakan saat ini? Pilih emosimu, dan biarkan ayat-Nya menenangkanmu.</p>
                                </div>
                                
                                <div className="flex flex-wrap gap-3 justify-center">
                                    {["Sedih 😢", "Marah 😠", "Overthinking 🤯", "Cemas Rezeki 💸", "Kesepian 🥺", "Lelah Batin 🥀"].map(emosi => (
                                        <button
                                            key={emosi}
                                            onClick={() => fetchFirstAid(emosi)}
                                            className={`px-5 py-3 rounded-full text-sm font-semibold transition-all border ${selectedEmotion === emosi ? 'bg-emerald-500 text-white border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:border-white/20'}`}
                                        >
                                            {emosi}
                                        </button>
                                    ))}
                                </div>

                                {isLoadingFirstAid && (
                                    <div className="flex flex-col items-center justify-center py-10 opacity-70">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-emerald-500 rounded-full blur-[20px] opacity-20 animate-pulse"></div>
                                            <Loader2 className="w-10 h-10 text-emerald-400 animate-spin relative z-10" />
                                        </div>
                                        <p className="mt-4 text-slate-400 text-sm tracking-widest uppercase font-semibold">Mencari penawar hati...</p>
                                    </div>
                                )}

                                {firstAidData && !isLoadingFirstAid && (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="space-y-6"
                                    >
                                        <div className="bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border border-emerald-500/20 p-6 md:p-8 rounded-[2rem] text-center shadow-[inset_0_0_40px_rgba(16,185,129,0.05)]">
                                            <p className="text-xl md:text-2xl font-serif text-emerald-100 italic leading-relaxed tracking-wide">
                                                "{firstAidData.penenang}"
                                            </p>
                                        </div>

                                        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 space-y-4 backdrop-blur-md">
                                            <div className="flex items-center justify-between border-b border-white/10 pb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                                                        <BookOpen className="w-4 h-4" />
                                                    </div>
                                                    <h3 className="font-bold text-white tracking-wide">Ayat Al-Qur'an ({firstAidData.quran.surah})</h3>
                                                </div>
                                                <button 
                                                    onClick={() => playArabicAudio(firstAidData.quran.arab, 'quran')}
                                                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${playingAudioType === 'quran' ? 'bg-white text-emerald-900 shadow-[0_0_15px_rgba(255,255,255,0.5)]' : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 border border-emerald-500/30 hover:text-white'}`}
                                                >
                                                    {playingAudioType === 'quran' ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                                                </button>
                                            </div>
                                            <p className="text-right font-serif text-2xl md:text-3xl leading-[2.2] text-white" style={{ fontFamily: "'Amiri Quran', serif" }}>
                                                {firstAidData.quran.arab}
                                            </p>
                                            <p className="text-slate-400 text-sm italic leading-relaxed">
                                                {firstAidData.quran.arti}
                                            </p>
                                        </div>

                                        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 space-y-4 backdrop-blur-md">
                                            <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                                                <div className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center">
                                                    <Info className="w-4 h-4" />
                                                </div>
                                                <h3 className="font-bold text-white tracking-wide">Pesan Nabi ({firstAidData.hadits.sumber})</h3>
                                            </div>
                                            <p className="text-right font-serif text-2xl md:text-3xl leading-[2.2] text-white" style={{ fontFamily: "'Amiri Quran', serif" }}>
                                                {firstAidData.hadits.arab}
                                            </p>
                                            <p className="text-slate-400 text-sm italic leading-relaxed">
                                                {firstAidData.hadits.arti}
                                            </p>
                                        </div>

                                        <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-[2rem] p-6 space-y-4 backdrop-blur-md">
                                            <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                                                        <Heart className="w-4 h-4" />
                                                    </div>
                                                    <h3 className="font-bold text-white tracking-wide">Dzikir Penenang</h3>
                                                </div>
                                                <button 
                                                    onClick={() => playArabicAudio(firstAidData.dzikir.arab, 'dzikir')}
                                                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${playingAudioType === 'dzikir' ? 'bg-white text-emerald-900 shadow-[0_0_15px_rgba(255,255,255,0.5)]' : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 border border-emerald-500/30 hover:text-white'}`}
                                                >
                                                    {playingAudioType === 'dzikir' ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                                                </button>
                                            </div>
                                            <p className="text-right font-serif text-3xl md:text-4xl leading-[2.2] text-white text-emerald-100" style={{ fontFamily: "'Amiri Quran', serif" }}>
                                                {firstAidData.dzikir.arab}
                                            </p>
                                            <div className="space-y-2">
                                                <p className="text-emerald-400 font-medium text-sm tracking-wide">"{firstAidData.dzikir.cara_baca}"</p>
                                                <p className="text-slate-300 text-sm italic leading-relaxed">
                                                    {firstAidData.dzikir.arti}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'breathe' && (
                            <motion.div
                                key="breathe"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="flex flex-col items-center justify-center h-full min-h-[60vh]"
                            >
                                <div className="text-center mb-16 space-y-3">
                                    <h2 className="text-4xl font-serif text-white tracking-tight">Tarik Nafas.</h2>
                                    <p className="text-slate-400 text-[15px] font-medium tracking-wide">Gunakan metode 4-3-4 sambil berdzikir.</p>
                                </div>

                                <div className="relative w-72 h-72 flex items-center justify-center mb-16">
                                    <motion.div
                                        animate={{
                                            scale: breatheActive ? (breatheState === 'inhale' ? 1.4 : breatheState === 'hold' ? 1.4 : 1) : 1,
                                            opacity: breatheActive ? (breatheState === 'inhale' ? 0.4 : breatheState === 'hold' ? 0.3 : 0.1) : 0.05
                                        }}
                                        transition={{ duration: breatheState === 'hold' ? 3 : 4, ease: "easeInOut" }}
                                        className="absolute inset-0 bg-white/20 rounded-full blur-2xl"
                                    ></motion.div>
                                    
                                    <motion.div
                                        animate={{
                                            scale: breatheActive ? (breatheState === 'inhale' ? 1 : breatheState === 'hold' ? 1 : 0.6) : 0.6,
                                        }}
                                        transition={{ duration: breatheState === 'hold' ? 3 : 4, ease: "easeInOut" }}
                                        className="relative w-56 h-56 rounded-full border border-white/20 flex flex-col items-center justify-center bg-white/5 backdrop-blur-xl shadow-[inset_0_0_40px_rgba(255,255,255,0.05)]"
                                    >
                                        <div className="text-2xl font-serif text-white mb-2 tracking-wider">
                                            {breatheState === 'inhale' && "Subhanallah"}
                                            {breatheState === 'hold' && "Alhamdulillah"}
                                            {breatheState === 'exhale' && "Allahu Akbar"}
                                        </div>
                                        <div className="text-slate-400 text-xs tracking-[0.2em] uppercase font-semibold">
                                            {breatheState === 'inhale' && "Tarik"}
                                            {breatheState === 'hold' && "Tahan"}
                                            {breatheState === 'exhale' && "Hembuskan"}
                                        </div>
                                    </motion.div>
                                </div>

                                <button
                                    onClick={toggleBreathe}
                                    className={`px-10 py-4 rounded-full font-bold transition-all duration-500 shadow-xl tracking-wider text-sm uppercase ${breatheActive ? 'bg-white/10 text-white border border-white/20 hover:bg-white/20' : 'bg-white text-[#070B14] hover:scale-105 hover:bg-slate-100'}`}
                                >
                                    {breatheActive ? 'Hentikan' : 'Mulai Latihan'}
                                </button>
                            </motion.div>
                        )}

                        {activeTab === 'murottal' && (
                            <motion.div
                                key="murottal"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-6 pt-6"
                            >
                                <div className="text-center mb-8 space-y-3">
                                    <h2 className="text-3xl font-serif text-white tracking-tight">Tenangkan Hati</h2>
                                    <p className="text-slate-400 text-[15px]">"...Hanya dengan mengingat Allah hati menjadi tenteram." (QS. 13:28)</p>
                                </div>

                                <div className="space-y-4">
                                    {MurottalList.map((track) => (
                                        <div key={track.id} className={`group bg-white/5 border rounded-[2rem] p-5 flex items-center justify-between transition-all duration-300 backdrop-blur-md cursor-pointer ${playingTrack === track.id && isPlaying ? 'border-white/30 bg-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.2)]' : 'border-white/5 hover:border-white/20 hover:bg-white/10'}`} onClick={() => toggleMurottal(track.id, track.url)}>
                                            <div className="flex items-center gap-5">
                                                <button
                                                    className={`w-14 h-14 shrink-0 rounded-full flex items-center justify-center transition-all duration-300 ${playingTrack === track.id && isPlaying ? 'bg-white text-[#070B14] shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'bg-white/10 text-white group-hover:bg-white/20'}`}
                                                >
                                                    {playingTrack === track.id && isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
                                                </button>
                                                <div>
                                                    <h4 className="font-bold text-white text-lg font-serif mb-0.5">Surah {track.surah}</h4>
                                                    <p className="text-slate-400 text-xs tracking-wider uppercase font-medium">{track.reciter}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                {playingTrack === track.id && isPlaying ? (
                                                    <div className="flex items-end gap-1 h-6 mr-2">
                                                        <motion.div animate={{ height: [8, 20, 10, 24, 8] }} transition={{ duration: 1, repeat: Infinity }} className="w-1.5 bg-white rounded-t-full"></motion.div>
                                                        <motion.div animate={{ height: [12, 8, 24, 12, 16] }} transition={{ duration: 1.2, repeat: Infinity }} className="w-1.5 bg-white rounded-t-full"></motion.div>
                                                        <motion.div animate={{ height: [24, 16, 8, 20, 24] }} transition={{ duration: 0.9, repeat: Infinity }} className="w-1.5 bg-white rounded-t-full"></motion.div>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-500 text-sm font-medium mr-2">{track.duration}</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'muhasabah' && (
                            <motion.div
                                key="muhasabah"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="min-h-[60vh] flex flex-col justify-center py-6"
                            >
                                <div className="text-center mb-10 space-y-3">
                                    <h2 className="text-3xl font-serif text-white tracking-tight">Muhasabah Diri</h2>
                                    <p className="text-slate-400 text-[15px]">Refleksi harian untuk hati yang lebih tenang.</p>
                                </div>

                                <div className="bg-white/5 border border-white/10 p-10 rounded-[2.5rem] relative mb-10 backdrop-blur-xl shadow-2xl">
                                    <Sparkles className="absolute top-6 right-6 text-white/5 w-20 h-20" />
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={currentPrompt}
                                            initial={{ opacity: 0, filter: "blur(10px)", scale: 0.95 }}
                                            animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
                                            exit={{ opacity: 0, filter: "blur(10px)", scale: 0.95 }}
                                            transition={{ duration: 0.5 }}
                                            className="min-h-[160px] flex items-center justify-center text-center relative z-10"
                                        >
                                            <p className="text-2xl md:text-3xl font-serif text-white leading-relaxed tracking-wide">
                                                "{MuhasabahPrompts[currentPrompt]}"
                                            </p>
                                        </motion.div>
                                    </AnimatePresence>
                                </div>

                                <div className="flex gap-4">
                                    <button 
                                        onClick={() => setCurrentPrompt(prev => prev > 0 ? prev - 1 : MuhasabahPrompts.length - 1)}
                                        className="flex-1 py-4 bg-white/5 text-slate-300 rounded-[2rem] hover:bg-white/10 transition-colors font-medium border border-white/5 tracking-wider uppercase text-xs"
                                    >
                                        Sebelumnya
                                    </button>
                                    <button 
                                        onClick={() => setCurrentPrompt(prev => prev < MuhasabahPrompts.length - 1 ? prev + 1 : 0)}
                                        className="flex-1 py-4 bg-white text-[#070B14] rounded-[2rem] hover:bg-slate-200 transition-colors font-bold shadow-[0_10px_20px_rgba(255,255,255,0.1)] tracking-wider uppercase text-xs"
                                    >
                                        Selanjutnya
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'ruqyah' && (
                            <motion.div
                                key="ruqyah"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-8 pt-6 pb-20"
                            >
                                <div className="text-center space-y-3">
                                    <h2 className="text-3xl font-serif text-white tracking-tight">Ruqyah Sebelum Tidur</h2>
                                    <p className="text-slate-400 text-[15px]">Membentengi diri dari gangguan fisik maupun ghaib sesuai sunnah.</p>
                                </div>

                                <div className="bg-amber-500/10 border border-amber-500/20 rounded-[2rem] p-5 flex gap-4 text-amber-200 backdrop-blur-md">
                                    <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" />
                                    <p className="text-sm leading-relaxed opacity-90">Posisikan diri dalam keadaan suci (berwudhu), duduk di pinggir tempat tidur, dan hadirkan hati yang ikhlas hanya bergantung pada perlindungan Allah Subhanahu wa Ta'ala.</p>
                                </div>

                                <div className="space-y-6">
                                    {RuqyahList.map((item, index) => (
                                        <div key={index} className="bg-white/5 border border-white/10 rounded-[2rem] p-6 md:p-8 space-y-5 backdrop-blur-md transition-all duration-300 hover:border-white/20 hover:bg-white/10">
                                            <div className="flex items-center gap-4 border-b border-white/10 pb-4">
                                                <div className="w-10 h-10 bg-white/10 text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0 backdrop-blur-sm">
                                                    {index + 1}
                                                </div>
                                                <h3 className="text-xl font-serif font-bold text-white tracking-wide">{item.title}</h3>
                                            </div>
                                            
                                            {item.instruction && (
                                                <div className="bg-black/20 rounded-2xl p-4 text-slate-300 text-sm leading-relaxed border border-white/5">
                                                    {item.instruction}
                                                </div>
                                            )}

                                            <p className="text-right font-serif text-2xl md:text-3xl leading-[2.5] text-white" style={{ fontFamily: "'Amiri Quran', serif" }}>
                                                {item.arabic.split('\n').map((line, i) => (
                                                    <span key={i}>
                                                        {line}
                                                        {i !== item.arabic.split('\n').length - 1 && <><br /><br /></>}
                                                    </span>
                                                ))}
                                            </p>
                                            
                                            {item.translation && (
                                                <p className="text-slate-400 text-[15px] italic leading-relaxed pt-2 border-t border-white/5">
                                                    {item.translation}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};

export default MindfulPage;

