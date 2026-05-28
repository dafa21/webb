'use client';

import { useState, useEffect } from 'react';
import ScrollExpandMedia from './ui/scroll-expansion-hero';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, User, Tag, ArrowRight, Share2, MessageCircle, Heart } from 'lucide-react';

interface MediaAbout {
  overview: string;
  sections: { title: string; content: string; image?: string }[];
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
      overview: 'Di era digital yang serba cepat ini, kemudahan berinfak melalui platform online membawa tantangan tersendiri dalam menjaga niat dan adab. Bagaimana kita tetap menjaga keikhlasan di tengah gempuran tren digital?',
      sections: [
        {
          title: 'Ketulusan Niat di Ujung Jari',
          content: 'Langkah pertama dan utama dalam berinfak adalah memastikan niat hanya semata-mata karena Allah SWT. Di era di mana "share" dan "like" menjadi validasi sosial, klik tombol "Donasi" jangan sampai didasari keinginan untuk pamer atau sekadar mengikuti tren. Keikhlasan adalah inti dari keberkahan harta yang kita keluarkan.',
          image: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?q=80&w=800&auto=format&fit=crop'
        },
        {
          title: 'Transparansi dan Lembaga Kepercayaan',
          content: 'Pilihlah platform dan lembaga yang memiliki reputasi kredibel. Transparansi bukan hanya tentang angka, tapi juga tentang bagaimana dampak nyata dari dana yang disalurkan. Pastikan dana yang Anda salurkan dikelola oleh lembaga yang amanah dan memiliki sistem pelaporan yang jelas, seperti Laznas Dewan Da\'wah yang telah bertahun-tahun melayani umat.',
          image: 'https://images.unsplash.com/photo-1454165833767-027ffea9e77b?q=80&w=800&auto=format&fit=crop'
        },
        {
          title: 'Waktu dan Keutamaan Berinfak',
          content: 'Meskipun digital memungkinkan kita berdonasi kapan saja, memahami waktu-waktu utama tetaplah penting. Sedekah subuh atau di hari Jumat memiliki keutamaan tersendiri sebagaimana diajarkan oleh Rasulullah SAW. Era digital memudahkan kita untuk menjadwalkan infak rutin di waktu-waktu mulia tersebut agar tidak terlewatkan.',
          image: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=80&w=800&auto=format&fit=crop'
        }
      ],
      conclusion: 'Implementasi adab berinfak di era digital adalah ujian keikhlasan yang nyata. Dengan menjaga niat dan memilih kanal yang tepat, setiap rupiah yang kita infakkan insya Allah akan menjadi saksi kebaikan yang abadi.',
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
    title: 'Cahaya Da\'wah di Ujung Negeri',
    date: '15 Mei 2024',
    category: 'Da\'wah',
    author: 'Tim Humas Laznas',
    scrollToExpand: 'Gulir untuk eksplorasi lebih dalam',
    about: {
      overview: 'Da\'wah di pelosok Nusantara bukan sekadar menyampaikan risalah keagamaan, tetapi merupakan upaya holistik dalam membawa perubahan sosial, pendidikan, dan kesejahteraan bagi masyarakat marjinal.',
      sections: [
        {
          title: 'Perjuangan Menembus Batas',
          content: 'Para Dai Dewan Da\'wah adalah pejuang sejati. Mereka harus menempuh perjalanan berkilo-kilo meter melalui medan yang berat seperti hutan lebat dan sungai-sungai berarus deras. Tujuannya satu: menyampaikan cahaya Islam ke desa-desa terpencil di Papua, Kepulauan Mentawai, hingga pedalaman Kalimantan yang mungkin jarang tersentuh peradaban modern.',
          image: 'https://images.unsplash.com/photo-1501533155389-f831968ed761?q=80&w=800&auto=format&fit=crop'
        },
        {
          title: 'Membangun Peradaban dari Bawah',
          content: 'Tugas Dai di pedalaman sangatlah kompleks. Selain mengajar ngaji dan dasar-dasar agama, mereka berperan sebagai agen pembangunan. Mereka membantu masyarakat membangun sistem sanitasi yang layak, mengajarkan teknik pertanian berkelanjutan, hingga mendirikan sekolah-sekolah darurat agar anak-anak di pedalaman memiliki masa depan yang lebih cerah.',
          image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=800&auto=format&fit=crop'
        },
        {
          title: 'Kemandirian Masyarakat Binaaan',
          content: 'Fokus utama dari da\'wah pedalaman adalah menciptakan kemandirian. Bukan hanya memberi bantuan secara terus-menerus, tapi juga membekali mereka dengan keterampian hidup. Kehadiran para Dai menjadi jembatan bagi masyarakat lokal untuk lebih berdaya secara ekonomi dan spiritual.',
          image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb773b09?q=80&w=800&auto=format&fit=crop'
        }
      ],
      conclusion: 'Perjalanan panjang da\'wah di pedalaman adalah bukti nyata bahwa persaudaraan Islam tidak mengenal batas geografis. Dukungan Anda adalah energi bagi mereka.',
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
      <div className='flex flex-wrap items-center gap-4 mb-8 py-4 border-b border-slate-100 dark:border-slate-800'>
        <div className='flex items-center gap-2.5 text-slate-500 dark:text-slate-400'>
          <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center border border-slate-100 dark:border-slate-800">
            <Calendar className='w-3.5 h-3.5 text-[#1799dc]' />
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] font-black uppercase tracking-wider opacity-50">Tanggal</span>
            <span className='text-xs font-bold text-slate-700 dark:text-slate-300'>{article.date}</span>
          </div>
        </div>
        <div className='flex items-center gap-2.5 text-slate-500 dark:text-slate-400'>
          <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center border border-slate-100 dark:border-slate-800">
            <User className='w-3.5 h-3.5 text-[#1799dc]' />
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] font-black uppercase tracking-wider opacity-50">Penulis</span>
            <span className='text-xs font-bold text-slate-700 dark:text-slate-300'>{article.author}</span>
          </div>
        </div>
        <div className='flex items-center ml-auto'>
          <span className='text-[10px] font-black text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-xl border border-blue-100 dark:border-blue-900/50 uppercase tracking-widest'>{article.category}</span>
        </div>
      </div>

      <div className='prose prose-blue dark:prose-invert max-w-none'>
        <p className='text-lg md:text-xl leading-relaxed font-bold text-slate-800 dark:text-slate-200 mb-12 tracking-tight'>
           {article.about.overview}
        </p>

        {/* Accordion Sections */}
        <div className="space-y-4 mb-16">
          {article.about.sections.map((section, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              viewport={{ once: true }}
              className='overflow-hidden rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all hover:shadow-md'
            >
              <button 
                onClick={() => setOpenSection(openSection === idx ? null : idx)}
                className="w-full flex items-center justify-between p-6 text-left transition-all"
              >
                <div className="flex items-center gap-4">
                  <span className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl font-black text-sm transition-all ${
                    openSection === idx 
                      ? 'bg-[#1799dc] text-white shadow-lg shadow-blue-500/20' 
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-400'
                  }`}>
                    {idx + 1}
                  </span>
                  <h3 className={`text-base md:text-lg font-black transition-all ${
                    openSection === idx ? 'text-slate-900 dark:text-white' : 'text-slate-500'
                  }`}>
                    {section.title}
                  </h3>
                </div>
                <motion.div
                  animate={{ 
                    rotate: openSection === idx ? 180 : 0,
                  }}
                  className={`p-1.5 rounded-lg transition-colors ${openSection === idx ? 'text-[#1799dc]' : 'text-slate-300'}`}
                >
                  <ArrowRight className="w-4 h-4 rotate-90" />
                </motion.div>
              </button>
              
              <AnimatePresence>
                {openSection === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-6 pb-8 border-t border-slate-50 dark:border-slate-800 mt-2">
                       {section.image && (
                         <div className="relative mt-4 mb-6 rounded-2xl overflow-hidden shadow-lg h-48 md:h-64">
                            <img 
                              src={section.image} 
                              alt={section.title} 
                              className="w-full h-full object-cover transition-transform duration-1000"
                            />
                         </div>
                       )}
                       <p className="text-sm md:text-base leading-relaxed text-slate-600 dark:text-slate-400 font-medium">
                          {section.content}
                       </p>
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
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="relative p-10 mb-16 overflow-hidden rounded-[2.5rem] bg-slate-900 text-white shadow-xl"
          >
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="mb-6 p-3 rounded-2xl bg-white/5 border border-white/10">
                <Heart className="w-8 h-8 fill-[#1799dc] text-[#1799dc]" />
              </div>
              <p className="text-xl md:text-2xl font-bold italic mb-6 leading-relaxed tracking-tight max-w-xl">
                "{article.about.quote.text}"
              </p>
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">
                  {article.about.quote.author}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        <div className='p-8 bg-slate-50 dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800'>
          <div className="flex items-center gap-3 mb-4">
             <div className="w-10 h-10 rounded-xl bg-[#1799dc] flex items-center justify-center">
                <ArrowRight className="w-5 h-5 text-white" />
             </div>
             <h4 className='text-xl font-black text-slate-900 dark:text-white'>Kesimpulan</h4>
          </div>
          <p className='text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed'>
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
      <div className='bg-slate-50 dark:bg-slate-950 py-16 px-4'>
        <div className='max-w-4xl mx-auto'>
           <div className="flex items-center justify-between mb-8">
             <h3 className='text-xl md:text-2xl font-black text-slate-900 dark:text-white'>Artikel Terkait</h3>
             <div className="w-12 h-1 bg-blue-100 dark:bg-slate-800 rounded-full"></div>
           </div>
           
           <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
             {ARTICLES_DATA.map((art, idx) => idx !== activeArticleIdx && (
               <motion.div 
                 key={art.id}
                 whileHover={{ y: -5 }}
                 onClick={() => {
                   setActiveArticleIdx(idx);
                   window.scrollTo(0, 0);
                 }}
                 className='group bg-white dark:bg-slate-900 rounded-[2rem] p-3 border border-slate-100 dark:border-slate-800 cursor-pointer shadow-sm hover:shadow-xl transition-all'
               >
                 <div className='h-44 rounded-[1.5rem] overflow-hidden mb-4 relative'>
                    <img src={art.src} alt={art.title} className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-700' />
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-[8px] font-black uppercase text-white tracking-widest">
                      {art.category}
                    </div>
                 </div>
                 <div className="px-2 pb-2">
                    <h4 className='text-base font-black text-slate-900 dark:text-white mb-2 line-clamp-1 group-hover:text-[#1799dc] transition-colors'>{art.title}</h4>
                    <p className='text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4'>{art.about.overview}</p>
                    <div className='flex items-center justify-between pt-2 border-t border-slate-50 dark:border-slate-800'>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-slate-300" />
                        <span className='text-[10px] font-bold text-slate-400'>{art.date}</span>
                      </div>
                      <div className='w-8 h-8 rounded-xl bg-blue-50 dark:bg-slate-800 text-[#1799dc] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all'>
                         <ArrowRight className='w-4 h-4' />
                      </div>
                    </div>
                 </div>
               </motion.div>
             ))}
           </div>
        </div>
      </div>

    </div>
  );
};
