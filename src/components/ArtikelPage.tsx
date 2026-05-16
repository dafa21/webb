'use client';

import { useState, useEffect } from 'react';
import ScrollExpandMedia from './ui/scroll-expansion-hero';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, User, Tag, ArrowRight, Share2, MessageCircle, Heart } from 'lucide-react';

interface MediaAbout {
  overview: string;
  sections: { title: string; content: string }[];
  conclusion: string;
  quote?: { text: string; author: string };
}

interface MediaContent {
  id: string;
  mediaType: 'video' | 'image';
  src: string;
  poster?: string;
  background: string;
  title: string;
  date: string;
  category: string;
  author: string;
  scrollToExpand: string;
  about: MediaAbout;
}

const ARTICLES_DATA: MediaContent[] = [
  {
    id: "art-1",
    mediaType: 'video',
    src: 'https://me7aitdbxq.ufs.sh/f/2wsMIGDMQRdYuZ5R8ahEEZ4aQK56LizRdfBSqeDMsmUIrJN1',
    background: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=1920&auto=format&fit=crop',
    title: 'Adab Berinfak di Era Digital',
    date: '12 Mei 2024',
    category: 'Fiqih',
    author: 'Ustadz Ahmad Fauzi',
    scrollToExpand: 'Scroll untuk menonton & membaca',
    about: {
      overview: 'Di era digital yang serba cepat ini, kemudahan berinfak melalui platform online membawa tantangan tersendiri dalam menjaga niat dan adab. Bagaimana kita tetap menjaga keikhlasan?',
      sections: [
        {
          title: 'Ketulusan Niat',
          content: 'Langkah pertama dan utama dalam berinfak adalah memastikan niat hanya semata-mata karena Allah SWT. Klik tombol "Donasi" jangan sampai didasari keinginan untuk pamer atau sekadar mengikuti tren.'
        },
        {
          title: 'Memilih Lembaga Terpercaya',
          content: 'Pastikan dana yang Anda salurkan dikelola oleh lembaga yang amanah dan transparan dalam pelaporannya, seperti Laznas Dewan Da\'wah.'
        },
        {
          title: 'Waktu Terbaik Berinfak',
          content: 'Sedekah subuh atau di hari Jumat memiliki keutamaan tersendiri. Namun, dalam kondisi mendesak, infak tercepat adalah yang terbaik.'
        }
      ],
      conclusion: 'Semoga dengan menjaga adab dan niat, setiap rupiah yang kita infakkan menjadi pemberat timbangan kebaikan di akhirat kelak.',
      quote: {
        text: "Tangan di atas lebih baik daripada tangan di bawah, dan mulailah dari orang-orang yang menjadi tanggung jawabmu.",
        author: "HR. Muslim"
      }
    },
  },
  {
    id: "art-2",
    mediaType: 'video',
    src: 'https://images.pexels.com/videos/5752729/space-earth-universe-cosmos-5752729.jpeg',
    background: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1920&auto=format&fit=crop',
    title: 'Mengenal Program Da\'wah Pedalaman',
    date: '15 Mei 2024',
    category: 'Da\'wah',
    author: 'Tim Humas Laznas',
    scrollToExpand: 'Gulir untuk eksplorasi lebih dalam',
    about: {
      overview: 'Da\'wah di pelosok Nusantara bukan sekadar menyampaikan risalah, tapi juga membawa perubahan sosial dan kesejahteraan bagi masyarakat yang jarang terjangkau.',
      sections: [
        {
          title: 'Perjalanan Tanpa Lelah',
          content: 'Para Dai Dewan Da\'wah harus menempuh perjalanan berkilo-kilo meter melalui hutan dan sungai demi menyampaikan cahaya Islam ke desa-desa terpencil di Papua, Mentawai, hingga pelosok Kalimantan.'
        },
        {
          title: 'Membangun Peradaban',
          content: 'Selain mengajar mengaji, para Dai juga membantu membangun sanitasi, mengajarkan teknik pertanian, dan mendirikan sekolah darurat bagi anak-anak di pedalaman.'
        }
      ],
      conclusion: 'Dukungan Anda adalah nafas bagi perjuangan para Dai di garis depan perbatasan peradaban.',
      quote: {
        text: "Siapa yang menempuh jalan untuk mencari ilmu, maka Allah akan memudahkan baginya jalan menuju surga.",
        author: "HR. Muslim"
      }
    },
  },
];

const ArticleContent = ({ article }: { article: MediaContent }) => {
  const [openSection, setOpenSection] = useState<number | null>(0);

  return (
    <div className='max-w-4xl mx-auto'>
      <div className='flex flex-wrap items-center gap-6 mb-8 py-4 border-b border-slate-100 dark:border-slate-800'>
        <div className='flex items-center gap-2 text-slate-500 dark:text-slate-400'>
          <Calendar className='w-4 h-4' />
          <span className='text-sm font-medium'>{article.date}</span>
        </div>
        <div className='flex items-center gap-2 text-slate-500 dark:text-slate-400'>
          <User className='w-4 h-4' />
          <span className='text-sm font-medium'>{article.author}</span>
        </div>
        <div className='flex items-center gap-2'>
          <Tag className='w-4 h-4 text-emerald-500' />
          <span className='text-sm font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-full'>{article.category}</span>
        </div>
      </div>

      <div className='prose prose-slate dark:prose-invert max-w-none'>
        <p className='text-xl leading-relaxed font-medium text-slate-700 dark:text-slate-300 mb-12 italic border-l-4 border-blue-500 pl-6'>
          "{article.about.overview}"
        </p>

        {/* Accordion Sections */}
        <div className="space-y-4 mb-16">
          {article.about.sections.map((section, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className='overflow-hidden rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm'
            >
              <button 
                onClick={() => setOpenSection(openSection === idx ? null : idx)}
                className="w-full flex items-center justify-between p-6 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <div className="flex items-center gap-4">
                  <span className={`flex items-center justify-center w-10 h-10 rounded-xl font-black text-sm transition-all ${
                    openSection === idx 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}>
                    0{idx + 1}
                  </span>
                  <h3 className={`text-lg font-black transition-colors ${
                    openSection === idx ? 'text-slate-900 dark:text-white' : 'text-slate-500'
                  }`}>
                    {section.title}
                  </h3>
                </div>
                <motion.div
                  animate={{ rotate: openSection === idx ? 180 : 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="text-slate-400"
                >
                  <ArrowRight className="w-5 h-5 rotate-90" />
                </motion.div>
              </button>
              
              <AnimatePresence>
                {openSection === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="p-6 pt-0 text-lg leading-loose text-slate-600 dark:text-slate-400 border-t border-slate-50 dark:border-slate-800 mt-2">
                       {section.content}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Inspirational Quote Section */}
        {article.about.quote && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="relative p-10 mb-16 overflow-hidden rounded-[2.5rem] bg-slate-900 text-white shadow-2xl"
          >
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="mb-6 opacity-20">
                <Heart className="w-12 h-12 fill-white" />
              </div>
              <p className="text-2xl md:text-3xl font-black italic mb-6 leading-tight tracking-tight">
                "{article.about.quote.text}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-px bg-blue-500"></div>
                <span className="text-sm font-black uppercase tracking-[0.2em] text-blue-400">
                  {article.about.quote.author}
                </span>
                <div className="w-8 h-px bg-blue-500"></div>
              </div>
            </div>
          </motion.div>
        )}

        <div className='p-8 bg-gradient-to-br from-blue-50 to-emerald-50 dark:from-slate-900 dark:to-emerald-900/20 rounded-3xl border border-blue-100 dark:border-slate-800'>
          <h4 className='text-lg font-black text-slate-900 dark:text-white mb-4'>Kesimpulan</h4>
          <p className='text-slate-700 dark:text-slate-300 leading-relaxed'>
            {article.about.conclusion}
          </p>
        </div>
      </div>

      <div className='flex items-center justify-between mt-20 pt-10 border-t border-slate-100 dark:border-slate-800 pb-20'>
        <div className='flex items-center gap-4'>
           <button className='flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-bold text-sm hover:bg-white dark:hover:bg-slate-800 transition-all border border-slate-100 dark:border-slate-800'>
             <Heart className='w-4 h-4' /> Suka
           </button>
           <button className='flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-bold text-sm hover:bg-white dark:hover:bg-slate-800 transition-all border border-slate-100 dark:border-slate-800'>
             <MessageCircle className='w-4 h-4' /> Komentar
           </button>
        </div>
        <button className='flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1799dc] text-white font-bold text-sm shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all'>
           <Share2 className='w-4 h-4' /> Bagikan
        </button>
      </div>
    </div>
  );
};

export const ArtikelPage = () => {
  const [activeArticleIdx, setActiveArticleIdx] = useState(0);
  const currentArticle = ARTICLES_DATA[activeArticleIdx];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeArticleIdx]);

  return (
    <div className='min-h-screen bg-white dark:bg-slate-950'>
      {/* Navigation for switcher */}
      <div className='fixed top-24 right-4 z-50 flex flex-col gap-3'>
        {ARTICLES_DATA.map((art, idx) => (
          <button
            key={art.id}
            onClick={() => setActiveArticleIdx(idx)}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-xl backdrop-blur-md border ${
              activeArticleIdx === idx
                ? 'bg-blue-600 border-blue-400 text-white scale-110'
                : 'bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-700 text-slate-400'
            }`}
            title={art.title}
          >
            {idx + 1}
          </button>
        ))}
      </div>

      <ScrollExpandMedia
        mediaType={currentArticle.mediaType}
        mediaSrc={currentArticle.src}
        bgImageSrc={currentArticle.background}
        title={currentArticle.title}
        date={currentArticle.date}
        scrollToExpand={currentArticle.scrollToExpand}
        textBlend
      >
        <ArticleContent article={currentArticle} />
      </ScrollExpandMedia>

      
      {/* Footer teaser for other articles */}
      <div className='bg-slate-50 dark:bg-slate-900 py-20 px-4'>
        <div className='max-w-4xl mx-auto'>
           <h3 className='text-2xl font-black text-slate-900 dark:text-white mb-8'>Artikel Lainnya</h3>
           <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
             {ARTICLES_DATA.map((art, idx) => idx !== activeArticleIdx && (
               <div 
                 key={art.id}
                 onClick={() => setActiveArticleIdx(idx)}
                 className='group bg-white dark:bg-slate-800 rounded-3xl p-4 border border-slate-100 dark:border-slate-700 cursor-pointer hover:shadow-2xl transition-all'
               >
                 <div className='h-40 rounded-2xl overflow-hidden mb-4'>
                    <img src={art.src} alt={art.title} className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-500' />
                 </div>
                 <h4 className='text-lg font-black text-slate-900 dark:text-white mb-2 line-clamp-1'>{art.title}</h4>
                 <p className='text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4'>{art.about.overview}</p>
                 <div className='flex items-center justify-between'>
                   <span className='text-[10px] font-black uppercase tracking-widest text-[#1799dc]'>{art.category}</span>
                   <button className='p-2 rounded-xl bg-blue-50 dark:bg-slate-900 text-[#1799dc]'>
                      <ArrowRight className='w-4 h-4' />
                   </button>
                 </div>
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
};
