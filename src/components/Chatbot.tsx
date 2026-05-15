import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { motion, AnimatePresence } from 'motion/react';

const genAI = new GoogleGenerativeAI((import.meta as any).env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || "");

const SYSTEM_PROMPT = `Anda adalah asisten virtual (chatbot) untuk Laznas Dewan Dakwah, sebuah lembaga zakat nasional yang terpercaya.
Tugas Anda adalah membantu pengguna dengan menjawab pertanyaan seputar:
1. Cara donasi, zakat, infak, sedekah, dan wakaf.
2. Program-program yang tersedia (seperti Bangun Masjid, Aqiqah, Sedekah Subuh, Bantu Palestina, dll).
3. Informasi seputar lembaga Laznas Dewan Dakwah.
4. Perhitungan Zakat:
   - Zakat Penghasilan: Zakat 2.5% dari total penghasilan. Nisabnya 85 gram emas setahun (atau dibagi 12 per bulan).
   - Zakat Maal/Perdagangan/Saham: Zakat 2.5%, Nisab 85 gram emas.
   - Zakat Rikaz: Zakat 20%, tidak ada Nisab dan Haul.
   - Fidyah: Senilai porsi makan per hari ditinggalkan puasa.

Panduan:
- Jawab dengan ramah, sopan, dan islami. Awali dengan salam jika diperlukan.
- Gunakan bahasa Indonesia yang baik dan mudah dipahami.
- Jawaban harus ringkas namun informatif (maksimal 3 paragraf).
- Jika pengguna ingin donasi, arahkan mereka untuk melihat program di halaman utama kami.
- Jika pengguna membutuhkan kontak langsung, beritahu bahwa mereka bisa menghubungi via WhatsApp di 0812-3456-7890 atau email care@laznasdd.org.`;

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user'|'model', text: string}[]>([
    { role: 'model', text: "Assalamu'alaikum! Ada yang bisa saya bantu terkait donasi atau program-program kami?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    console.log("Chatbot - User Message Sent:", userMessage);
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const history = messages.map(msg => ({
        role: msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.text }]
      }));
      history.push({ role: 'user', parts: [{ text: userMessage }] });

      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: SYSTEM_PROMPT,
      });

      const response = await model.generateContent({
        contents: history,
        generationConfig: {
          temperature: 0.7
        }
      });

      const responseText = response.response.text();
      console.log("Chatbot - Model Response Received:", responseText);
      setMessages(prev => [...prev, { role: 'model', text: responseText || "Mohon maaf, pesan kosong." }]);
    } catch (error: any) {
      console.error("Chatbot - Error communicating with Gemini API:", error);
      setMessages(prev => [...prev, { role: 'model', text: `Mohon maaf, terjadi kegagalan API saat komunikasi dengan Gemini: ${error?.message || 'Unknown error'}. Silakan coba beberapa saat lagi.` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-[140px] md:bottom-8 right-4 md:right-6 z-[110]">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-20 right-0 w-[350px] sm:w-[400px] h-[500px] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-100"
          >
            {/* Header */}
            <div className="p-4 bg-primary-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold font-serif">Asisten Kebaikan</h3>
                  <div className="flex items-center gap-1.5 text-[10px] text-primary-100 uppercase tracking-widest font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Online
                  </div>
                </div>
              </div>
              <motion.button onClick={() => setIsOpen(false)}
                className="transition-all duration-300 p-2 hover:bg-white/10 rounded-full transition-colors transition-all duration-300 hover:scale-105 hover:shadow-lg hover:brightness-110 active:scale-95"
                aria-label="Tutup Obrolan"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 p-4 overflow-y-auto bg-slate-50 flex flex-col gap-4">
              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    msg.role === 'user' ? 'bg-accent-500 text-white' : 'bg-primary-100 text-primary-600'
                  }`}>
                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-5 h-5" />}
                  </div>
                  <div className={`p-3 rounded-2xl text-sm max-w-[75%] ${
                    msg.role === 'user' 
                      ? 'bg-accent-500 text-white rounded-tr-none' 
                      : 'bg-white text-slate-700 shadow-sm border border-slate-100 font-medium rounded-tl-none'
                  }`}>
                    <div className="prose prose-sm prose-p:leading-relaxed" style={{ whiteSpace: 'pre-wrap' }}>
                      {msg.text}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 flex-row items-center text-slate-400">
                  <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center shrink-0">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 flex gap-1.5">
                    <motion.div className="w-2 h-2 bg-slate-400 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} />
                    <motion.div className="w-2 h-2 bg-slate-400 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} />
                    <motion.div className="w-2 h-2 bg-slate-400 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white border-t border-slate-100">
              <form 
                onSubmit={handleSend}
                className="flex items-center gap-2"
              >
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ketik pertanyaan Anda..."
                  className="flex-1 bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                  disabled={isLoading}
                  aria-label="Ketik pesan Anda"
                />
                <motion.button 
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  aria-label="Kirim pesan"
                  className="transition-all duration-300 p-2.5 bg-primary-600 text-white rounded-full hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-lg"
                 whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}>
                  <Send className="w-4 h-4 ml-0.5" />
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="transition-all duration-300 w-14 h-14 bg-primary-600 text-white rounded-full flex items-center justify-center shadow-2xl shadow-primary-600/40 outline-none focus:ring-4 focus:ring-primary-600/30 transition-all hover:bg-primary-700"
        aria-label={isOpen ? "Tutup Obrolan" : "Buka Obrolan"}
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </motion.button>
    </div>
  );
}
