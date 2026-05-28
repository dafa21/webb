import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Request Logging
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // Health check route - MUST BE BEFORE STATIC SERVING
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", env: process.env.NODE_ENV, port: PORT });
  });

  app.get("/api/doa", async (req, res) => {
    try {
      const response = await fetch("https://doa-doa-api-ahmadramadhan.fly.dev/api");
      if (!response.ok) throw new Error("Failed to fetch doa");
      const data = await response.json();
      
      const riwayatMapping: Record<string, string> = {
        "1": "HR. Al-Bukhari no. 6324 & Muslim no. 2711",
        "2": "HR. Al-Bukhari no. 6312 & Muslim no. 2711",
        "3": "HR. Al-Bukhari no. 142 & Muslim no. 375",
        "4": "HR. Ibnu Sunni no. 163 & Ath-Thabrani",
        "5": "HR. Abu Dawud no. 5095 & At-Tirmidzi no. 3426",
        "6": "HR. Abu Dawud no. 5096",
        "7": "HR. Ibnu Majah no. 925",
        "8": "Bersumber dari Al-Qur'an & As-Sunnah",
        "9": "Hadits mauquf riwayat Ad-Dailami",
        "10": "HR. Abu Dawud no. 101 & Ibnu Majah no. 399",
        "11": "HR. Muslim no. 234",
        "12": "Bersumber dari Adab Membaca Al-Qur'an",
        "13": "HR. Abu Dawud & Al-Baihaqi",
        "14": "Adab harian dalam Islam",
        "15": "HR. Abu Dawud & At-Tirmidzi",
        "16": "HR. Muslim no. 2708",
        "17": "HR. Abu Dawud & Ibnu Majah",
        "18": "HR. Abu Dawud no. 4020 & At-Tirmidzi",
        "19": "HR. At-Tirmidzi no. 606",
        "20": "HR. Ibnu Majah & At-Tirmidzi",
        "21": "HR. At-Tirmidzi no. 3391",
        "22": "HR. At-Tirmidzi no. 3391",
        "23": "HR. Ibnu Sunni no. 163 & Ath-Thabrani",
        "24": "HR. Al-Bukhari & Muslim",
        "25": "HR. Muslim no. 713",
        "26": "HR. Muslim no. 713",
        "27": "HR. Al-Bukhari no. 614",
        "28": "HR. At-Tirmidzi no. 3446",
        "29": "HR. At-Tirmidzi no. 3428 & Ibnu Majah no. 2235",
        "30": "HR. Abu Dawud, At-Tirmidzi & Ibnu Majah",
        "31": "HR. Abu Dawud, At-Tirmidzi & Ibnu Majah",
        "32": "HR. Al-Bukhari no. 1032",
        "33": "HR. Al-Bukhari no. 1014",
        "34": "HR. Al-Bukhari no. 846 & Muslim no. 71",
        "35": "Bersumber dari Al-Qur'an & Adab Harian",
        "36": "HR. At-Tirmidzi no. 3563",
        "37": "Bersumber dari Adab Keseharian"
      };

      const enrichedData = data.map((d: any) => ({
        ...d,
        riwayat: riwayatMapping[d.id] || "Riwayat tidak diketahui"
      }));

      res.json(enrichedData);
    } catch (error) {
      console.error("Doa Proxy Error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Internal Server Error" });
    }
  });

  const hadithCache: Record<string, {arab: string, id: string}> = {};

  app.get("/api/hadith", async (req, res) => {
    try {
      const { book, number, ref } = req.query;
      
      const referenceKey = ref?.toString() || `${book} no. ${number}`;
      
      // Check local cache first so we don't bombard Gemini
      if (hadithCache[referenceKey]) {
         return res.json({
            code: 200,
            data: { contents: hadithCache[referenceKey] }
         });
      }

      // Try fetching from the original API (if book and number are present)
      if (book && number) {
         try {
             const response = await fetch(`https://api.hadith.gading.dev/books/${book}/${number}`);
             const data = await response.json();
             if (data.code === 200 && !data.error && data.data && data.data.contents) {
                 return res.json(data);
             }
         } catch(e) {
             console.error("Gading API fetch failed:", e);
         }

         // Second fallback: MyQuran API
         try {
             const myQuranBook = book === "abu-daud" ? "abu-dawud" : book;
             const response = await fetch(`https://api.myquran.com/v2/hadits/${myQuranBook}/${number}`);
             const data = await response.json();
             if (data.status && data.data) {
                 return res.json({
                    code: 200,
                    data: {
                        contents: {
                            number: data.data.number,
                            arab: data.data.arab,
                            id: data.data.id
                        }
                    }
                 });
             }
         } catch(e) {
             console.error("MyQuran API fetch failed:", e);
         }
      }

      // If missing or failed or doesn't have book/num, use Gemini!
      console.log(`Fallback to Gemini for: ${referenceKey}`);
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey || apiKey === "your-api-key" || apiKey.trim() === "") {
        console.error("[ERROR] GEMINI_API_KEY is not set.");
        return res.status(500).json({ error: "Layanan AI tidak tersedia (API Key tidak ditemukan)." });
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Using 1.5 flash for speed

      const prompt = `Anda adalah ahli hadits.\n` + 
      `Carikan teks asli (bahasa Arab) dan terjemahan Indonesianya untuk riwayat berikut: "${referenceKey}".\n` + 
      `Keluarkan respons DALAM FORMAT JSON SAJA yang berisi objek dengan format: { "arab": "teks arab", "id": "teks terjemahan indonesia" }.\n` +
      `Jika itu bukan ucapan Nabi (misal cuma adab atau quran), berikan teks ayat atau doa yang sesuai, dan terjemahannya, atau jelaskan adabnya singkat dalam arab dan id. Jangan sertakan markdown \`\`\`json, cukup balasan raw json. Jika riwayat tidak bisa dipastikan, berikan teks doa terkait atau penjelasan fallback di id.`;

      const aiResponse = await model.generateContent(prompt);
      let text = aiResponse.response.text().trim();
      
      // Clean markdown if gemini included it despite instructions
      if (text.startsWith("```json")) text = text.replace(/```json/g, "");
      if (text.startsWith("```")) text = text.replace(/```/g, "");
      if (text.endsWith("```")) text = text.substring(0, text.length - 3);
      
      const parsed = JSON.parse(text.trim());
      
      if (parsed.arab && parsed.id) {
         hadithCache[referenceKey] = parsed;
         return res.json({
            code: 200,
            data: { contents: parsed }
         });
      } else {
         throw new Error("Invalid format from AI");
      }

    } catch(err) {
       console.error("Hadith fallback error:", err);
       res.status(404).json({ error: "Hadith tidak ditemukan" });
    }
  });

  app.get("/api/tts", async (req, res) => {
    try {
      const { text, lang } = req.query;
      if (!text) return res.status(400).json({ error: "Text is required" });
      
      const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang || 'ar'}&client=tw-ob&q=${encodeURIComponent(text.toString())}`;
      
      const response = await fetch(ttsUrl, {
        headers: {
          'Referer': 'https://translate.google.com/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'No body');
        console.error(`Google TTS failed with status: ${response.status}. Body: ${errorText.substring(0, 500)}`);
        return res.status(response.status).json({ error: "Google TTS failed", details: errorText.substring(0, 100) });
      }
      
      const contentType = response.headers.get('content-type');
      if (contentType) res.setHeader('Content-Type', contentType);
      else res.setHeader('Content-Type', 'audio/mpeg');
      
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      
      const arrayBuffer = await response.arrayBuffer();
      res.send(Buffer.from(arrayBuffer));
    } catch (error) {
      console.error("TTS Proxy Exception:", error);
      res.status(500).json({ error: "Internal error in TTS proxy" });
    }
  });

  // Proxy endpoint for Talaqqi AI evaluation
  app.post("/api/evaluate-talaqqi", async (req, res) => {
    try {
      const { prompt, audioBase64, mimeType } = req.body;
      
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey || apiKey === "your-api-key" || apiKey.trim() === "") {
        console.error("[ERROR] GEMINI_API_KEY is not set.");
        return res.status(500).json({ error: "Layanan AI tidak tersedia (API Key tidak ditemukan)." });
      }

      if (!prompt || !audioBase64 || !mimeType) {
        return res.status(400).json({ error: "Missing required fields: prompt, audioBase64, or mimeType" });
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

      const response = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: mimeType,
            data: audioBase64
          }
        }
      ]);

      const feedback = response.response.text();
      res.json({ feedback });
    } catch (error) {
      console.error("Evaluation Error:", error);
      const errMsg = error instanceof Error ? error.message : String(error);
      if (errMsg.includes("API_KEY_INVALID") || errMsg.includes("API key not valid")) {
        return res.status(400).json({ error: "API_KEY_INVALID" });
      }
      res.status(500).json({ error: errMsg });
    }
  });

  app.post("/api/spiritual-first-aid", async (req, res) => {
    try {
      const { emotion } = req.body;

      if (!emotion) {
        return res.status(400).json({ error: "Missing required field: emotion" });
      }

      const staticResponses: Record<string, any[]> = {
        "Sedih 😢": [
          {
            "penenang": "Kesedihanmu adalah bukti bahwa kamu memiliki hati yang lembut. Allah tidak akan membebani hamba-Nya di luar batas kemampuannya.",
            "quran": {
              "surah": "At-Tawbah:40",
              "arab": "لَا تَحْزَنْ إِنَّ ٱللَّهَ مَعَنَا",
              "arti": "Janganlah engkau bersedih, sesungguhnya Allah bersama kita."
            },
            "hadits": {
              "sumber": "HR. Bukhari & Muslim",
              "arab": "مَا يُصِيبُ الْمُسْلِمَ مِنْ نَصَبٍ وَلَا وَصَبٍ وَلَا هَمٍّ وَلَا حُزْنٍ وَلَا أَذًى وَلَا غَمٍّ حَتَّى الشَّوْكَةِ يُشَاكُهَا إِلَّا كَفَّرَ اللَّهُ بِهَا مِنْ خَطَايَاهُ",
              "arti": "Tidaklah seorang muslim tertimpa kelelahan, penyakit, kesedihan, gangguan, gundah gulana, hingga duri yang menusuknya, melainkan Allah akan menghapus dosa-dosanya dengan semua itu."
            },
            "dzikir": {
              "arab": "إِنَّا لِلّهِ وَإِنَّـا إِلَيْهِ رَاجِعونَ، اللَّهُمَّ أْجُرْنِي فِي مُصِيبَتِي",
              "arti": "Sesungguhnya kami milik Allah dan kepada-Nya kami kembali. Ya Allah, berilah pahala dalam musibahku ini.",
              "cara_baca": "Inna lillahi wa inna ilaihi raji'un, Allahumma'jurni fi musibati"
            }
          },
          {
            "penenang": "Air matamu adalah doa ketika bibirmu tak sanggup berkata-kata. Menangislah, Allah Maha Mendengar rintihan hamba-Nya.",
            "quran": {
              "surah": "Al-Baqarah:286",
              "arab": "لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا",
              "arti": "Allah tidak membebani seseorang melainkan sesuai dengan kesanggupannya."
            },
            "hadits": {
              "sumber": "HR. Muslim",
              "arab": "عَجَبًا لأَمْرِ الْمُؤْمِنِ إِنَّ أَمْرَهُ كُلَّهُ خَيْرٌ",
              "arti": "Sungguh menakjubkan urusan seorang mukmin, semua urusannya adalah baik."
            },
            "dzikir": {
              "arab": "حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ",
              "arti": "Cukuplah Allah bagiku, tidak ada Tuhan selain Dia. Hanya kepada-Nya aku bertawakkal dan Dia adalah Tuhan Pemilik 'Arsy yang agung.",
              "cara_baca": "Hasbiyallahu la ilaha illa huwa 'alaihi tawakkaltu wa huwa rabbul 'arsyil 'azhim"
            }
          },
          {
            "penenang": "Setelah hujan pasti ada pelangi. Bersabarlah, kebahagiaan sedang menantimu di depan.",
            "quran": {
              "surah": "Asy-Syarh:5-6",
              "arab": "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا ۝ إِنَّ مَعَ الْعُسْرِ يُسْرًا",
              "arti": "Karena sesungguhnya sesudah kesulitan itu ada kemudahan. Sesungguhnya sesudah kesulitan itu ada kemudahan."
            },
            "hadits": {
              "sumber": "HR. Ahmad",
              "arab": "وَاعْلَمْ أَنَّ فِي الصَّبْرِ عَلَى مَا تَكْرَهُ خَيْرًا كَثِيرًا وَأَنَّ النَّصْرَ مَعَ الصَّبْرِ وَأَنَّ الْفَرَجَ مَعَ الْكَرْبِ وَأَنَّ مَعَ الْعُسْرِ يُسْرًا",
              "arti": "Ketahuilah bahwa dalam kesabaran terhadap apa yang engkau benci terdapat kebaikan yang banyak, dan bahwa pertolongan datang bersama kesabaran, dan kelapangan bersama kesempitan, dan kemudahan bersama kesulitan."
            },
            "dzikir": {
              "arab": "يَا حَيُّ يَا قَيُّوْمُ بِرَحْمَتِكَ أَسْتَغِيْثُ",
              "arti": "Wahai Rabb Yang Maha Hidup, wahai Rabb Yang Berdiri Sendiri tidak butuh segala sesuatu, dengan rahmat-Mu aku minta pertolongan.",
              "cara_baca": "Ya Hayyu Ya Qayyum birahmatika astaghits"
            }
          }
        ],
        "Marah 😠": [
          {
            "penenang": "Tarik napas perlahan. Orang yang kuat bukanlah yang pandai bergulat, tetapi yang mampu menahan amarahnya.",
            "quran": {
              "surah": "Ali 'Imran:134",
              "arab": "وَٱلْكَٰظِمِينَ ٱلْغَيْظَ وَٱلْعَافِينَ عَنِ ٱلنَّاسِ ۗ وَٱللَّهُ يُحِبُّ ٱلْمُحْسِنِينَ",
              "arti": "Dan orang-orang yang menahan amarahnya dan memaafkan (kesalahan) orang. Allah menyukai orang-orang yang berbuat kebajikan."
            },
            "hadits": {
              "sumber": "HR. Bukhari",
              "arab": "لَيْسَ الشَّدِيدُ بِالصُّرَعَةِ، إِنَّمَا الشَّدِيدُ الَّذِي يَمْلِكُ نَفْسَهُ عِنْدَ الْغَضَبِ",
              "arti": "Orang yang kuat bukanlah yang pandai bergulat, namun orang yang kuat adalah orang yang mampu menahan dirinya tatkala marah."
            },
            "dzikir": {
              "arab": "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ",
              "arti": "Aku berlindung kepada Allah dari godaan setan yang terkutuk.",
              "cara_baca": "A'udzu billahi minasy-syaitanir-rajim"
            }
          },
          {
            "penenang": "Amarah adalah api yang bisa membakar akal sehat. Basuhlah dirimu dan tenangkan hatimu bilamana api itu datang.",
            "quran": {
              "surah": "Asy-Syura:37",
              "arab": "وَإِذَا مَا غَضِبُوا۟ هُمْ يَغْفِرُونَ",
              "arti": "Dan apabila mereka marah mereka memberi maaf."
            },
            "hadits": {
              "sumber": "HR. Abu Dawud",
              "arab": "إِنَّ الْغَضَبَ مِنَ الشَّيْطَانِ وَإِنَّ الشَّيْطَانَ خُلِقَ مِنَ النَّارِ وَإِنَّمَا تُطْفَأُ النَّارُ بِالْمَاءِ فَإِذَا غَضِبَ أَحَدُكُمْ فَلْيَتَوَضَّأْ",
              "arti": "Sesungguhnya amarah itu dari setan, dan setan diciptakan dari api, dan api hanya bisa dipadamkan dengan air. Maka jika salah seorang dari kalian marah, hendaklah ia berwudhu."
            },
            "dzikir": {
              "arab": "اللَّهُمَّ اغْفِرْ لِي ذَنْبِي وَأَذْهِبْ غَيْظَ قَلْبِي",
              "arti": "Ya Allah, ampunilah dosaku dan hilangkanlah kemarahan hatiku.",
              "cara_baca": "Allahummaghfir lii dzanbii wa adzhib ghaizha qalbii"
            }
          }
        ],
        "Overthinking 🤯": [
          {
            "penenang": "Masa depan ada di tangan Allah. Rencanamu takkan mendahului takdir-Nya, maka serahkanlah segalanya kepada Sang Pengatur Semesta.",
            "quran": {
              "surah": "Al-Baqarah:216",
              "arab": "وَعَسَىٰ أَن تَكْرَهُوا۟ شَيْـًٔا وَهُوَ خَيْرٌ لَّكُمْ",
              "arti": "Boleh jadi kamu membenci sesuatu, padahal ia amat baik bagimu..."
            },
            "hadits": {
              "sumber": "HR. Tirmidzi",
              "arab": "إِذَا سَأَلْتَ فَاسْأَلْ اللَّهَ، وَإِذَا اسْتَعَنْتَ فَاسْتَعِنْ بِاللَّهِ",
              "arti": "Jika engkau memohon, mohonlah kepada Allah, dan jika engkau meminta pertolongan, mintalah kepada Allah."
            },
            "dzikir": {
              "arab": "حَسْبُنَا اللهُ وَنِعْمَ الْوَكِيْلُ",
              "arti": "Cukuplah Allah menjadi Penolong kami dan Allah adalah sebaik-baik Pelindung.",
              "cara_baca": "Hasbunallah wa ni'mal-wakil"
            }
          },
          {
            "penenang": "Pikiran yang terlalu berkeliaran hanya akan memenjarakanmu. Percayalah bahwa Allah sebaik-baiknya perencana.",
            "quran": {
              "surah": "Ali 'Imran:54",
              "arab": "وَٱللَّهُ خَيْرُ ٱلْمَٰكِرِينَ",
              "arti": "Dan Allah adalah sebaik-baik pembalas tipu daya."
            },
            "hadits": {
              "sumber": "HR. Bukhari",
              "arab": "أَنَا عِنْدَ ظَنِّ عَبْدِي بِي",
              "arti": "Allah berfirman: Aku sesuai prasangka hamba-Ku kepada-Ku."
            },
            "dzikir": {
              "arab": "بِسْمِ اللهِ تَوَكَّلْتُ عَلَى اللهِ لاَ حَوْلَ وَلاَ قُوَّةَ إِلاَّ بِاللهِ",
              "arti": "Dengan nama Allah, aku bertawakkal kepada Allah. Tiada daya dan kekuatan kecuali dengan (pertolongan) Allah.",
              "cara_baca": "Bismillahi tawakkaltu 'alallahi la hawla wa la quwwata illa billah"
            }
          }
        ],
        "Cemas Rezeki 💸": [
          {
            "penenang": "Rezekimu telah tertulis bahkan sebelum kamu lahir. Jangan biarkan kecemasan mencuri kedamaian hari ini.",
            "quran": {
              "surah": "Hud:6",
              "arab": "وَمَا مِن دَآبَّةٍ فِى ٱلْأَرْضِ إِلَّا عَلَى ٱللَّهِ رِزْقُهَا",
              "arti": "Dan tidak ada suatu binatang melata pun di bumi melainkan Allah-lah yang memberi rezekinya."
            },
            "hadits": {
              "sumber": "HR. Ibnu Majah",
              "arab": "فَإِنَّ نَفْسًا لَنْ تَمُوتَ حَتَّى تَسْتَوْفِيَ رِزْقَهَا",
              "arti": "Sesungguhnya satu jiwa tidak akan mati hingga rezekinya disempurnakan."
            },
            "dzikir": {
              "arab": "يَا حَيُّ يَا قَيُّوْمُ بِرَحْمَتِكَ أَسْتَغِيْثُ",
              "arti": "Wahai Dzat yang Maha Hidup, wahai Dzat yang Berdiri Sendiri, dengan rahmat-Mu aku memohon pertolongan.",
              "cara_baca": "Ya Hayyu Ya Qayyum, birahmatika astaghits"
            }
          },
          {
            "penenang": "Kunci rezeki ada di tangan Allah. Jangan cemaskan apa yang berada di luar kendalimu, cukup berusaha semampumu.",
            "quran": {
              "surah": "An-Najm:39",
              "arab": "وَأَن لَّيْسَ لِلْإِنسَٰنِ إِلَّا مَا سَعَىٰ",
              "arti": "Dan bahwasanya seorang manusia tiada memperoleh selain apa yang telah diusahakannya."
            },
            "hadits": {
              "sumber": "HR. Tirmidzi",
              "arab": "لَوْ أَنَّكُمْ تَتَوَكَّلُونَ عَلَى اللَّهِ حَقَّ تَوَكُّلِهِ لَرَزَقَكُمْ كَمَا يَرْزُقُ الطَّيْرَ تَغْدُو خِمَاصاً وَتَرُوحُ بِطَاناً",
              "arti": "Seandainya kalian bertawakkal kepada Allah dengan sebenar-benar tawakkal, niscaya Allah akan memberikan rezeki kepada kalian sebagaimana burung yang pergi di pagi hari dalam keadaan lapar dan pulang di sore hari dalam keadaan kenyang."
            },
            "dzikir": {
              "arab": "اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا",
              "arti": "Ya Allah, aku memohon kepada-Mu ilmu yang bermanfaat, rezeki yang baik dan amalan yang diterima.",
              "cara_baca": "Allahumma inni as-aluka 'ilman nafi'an, wa rizqan thayyiban, wa 'amalan mutaqabbalan"
            }
          }
        ],
        "Kesepian 🥺": [
          {
            "penenang": "Kamu tak pernah sendirian. Allah selalu lebih dekat daripadamu, bahkan lebih dekat dari urat lehermu.",
            "quran": {
              "surah": "Qaf:16",
              "arab": "وَنَحْنُ أَقْرَبُ إِلَيْهِ مِنْ حَبْلِ ٱلْوَرِيدِ",
              "arti": "Dan Kami lebih dekat kepadanya daripada urat lehernya."
            },
            "hadits": {
              "sumber": "HR. Bukhari",
              "arab": "أَنَا مَعَهُ إِذَا ذَكَرَنِي",
              "arti": "Allah berfirman: Aku bersamanya apabila ia mengingat-Ku."
            },
            "dzikir": {
              "arab": "رَبِّ لَا تَذَرْنِيْ فَرْدًا وَّاَنْتَ خَيْرُ الْوَارِثِيْنَ",
              "arti": "Ya Tuhanku, janganlah Engkau biarkan aku hidup seorang diri, dan Engkaulah pewaris yang paling baik.",
              "cara_baca": "Rabbi la tazarni fardaw wa anta khairul-warisin"
            }
          },
          {
            "penenang": "Merasa hening? Itu adalah waktu bagi Allah untuk berbicara denganmu melalui tanda-tanda kebesaran-Nya.",
            "quran": {
              "surah": "Al-Baqarah:186",
              "arab": "وَإِذَا سَأَلَكَ عِبَادِى عَنِّى فَإِنِّى قَرِيبٌ",
              "arti": "Dan apabila hamba-hamba-Ku bertanya kepadamu tentang Aku, maka (jawablah), bahwasanya Aku adalah dekat."
            },
            "hadits": {
              "sumber": "HR. Tirmidzi",
              "arab": "تَعَرَّفْ إِلَى اللَّهِ فِي الرَّخَاءِ يَعْرِفْكَ فِي الشِّدَّةِ",
              "arti": "Kenalilah Allah di masa lapang (senang), niscaya Allah akan mengenalimu di masa sempit (sulit)."
            },
            "dzikir": {
              "arab": "لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ",
              "arti": "Tidak ada Tuhan selain Engkau, Maha Suci Engkau, sesungguhnya aku adalah termasuk orang-orang yang zalim.",
              "cara_baca": "La ilaha illa anta, subhanaka inni kuntu minadz dholimin"
            }
          }
        ],
        "Lelah Batin 🥀": [
          {
            "penenang": "Istirahatlah, jiwa yang lelah. Serahkan sejenak bebanmu kepada-Nya. Shalatlah, dan rasakan ketenangannya.",
            "quran": {
              "surah": "Ar-Ra'd:28",
              "arab": "أَلَا بِذِكْرِ ٱللَّهِ تَطْمَئِنُّ ٱلْقُلُوبُ",
              "arti": "Ingatlah, hanya dengan mengingati Allah-lah hati menjadi tenteram."
            },
            "hadits": {
              "sumber": "HR. Abu Dawud",
              "arab": "يَا بِلَالُ أَرِحْنَا بِالصَّلَاةِ",
              "arti": "Wahai Bilal, istirahatkanlah kami dengan shalat."
            },
            "dzikir": {
              "arab": "لا حَوْلَ وَلا قُوَّةَ إِلا بِاللهِ",
              "arti": "Tidak ada daya dan upaya kecuali dengan pertolongan Allah.",
              "cara_baca": "La hawla wa la quwwata illa billah"
            }
          },
          {
            "penenang": "Jika pundakmu terasa berat, bersujudlah. Bumi yang kau pijak akan menjadi saksi bahwa kau telah bersandar kepada Pemiliknya.",
            "quran": {
              "surah": "Al-Baqarah:153",
              "arab": "يَٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ ٱسْتَعِينُوا۟ بِٱلصَّبْرِ وَٱلصَّلَوٰةِ ۚ إِنَّ ٱللَّهَ مَعَ ٱلصَّٰبِرِينَ",
              "arti": "Hai orang-orang yang beriman, jadikanlah sabar dan shalat sebagai penolongmu, sesungguhnya Allah beserta orang-orang yang sabar."
            },
            "hadits": {
              "sumber": "HR. Muslim",
              "arab": "أَقْرَبُ مَا يَكُونُ الْعَبْدُ مِنْ رَبِّهِ وَهُوَ سَاجِدٌ فَأَكْثِرُوا الدُّعَاءَ",
              "arti": "Keadaan paling dekat seorang hamba dengan Tuhannya adalah ketika ia sedang bersujud, maka perbanyaklah doa."
            },
            "dzikir": {
              "arab": "اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ، وَشُكْرِكَ، وَحُسْنِ عِبَادَتِكَ",
              "arti": "Ya Allah, tolonglah aku untuk mengingat-Mu, bersyukur kepada-Mu, dan beribadah dengan baik kepada-Mu.",
              "cara_baca": "Allahumma a'inni 'ala dzikrika wa syukrika wa husni 'ibadatik"
            }
          }
        ]
      };

      const emotionVariations = staticResponses[emotion];
      if (!emotionVariations || emotionVariations.length === 0) {
        return res.status(404).json({ error: "Emosi tidak ditemukan dalam database." });
      }

      // Pick a random response
      const randIndex = Math.floor(Math.random() * emotionVariations.length);
      const result = emotionVariations[randIndex];

      setTimeout(() => res.json(result), 1000); // Simulate subtle delay
    } catch (error: any) {
      console.error("Spiritual First Aid Error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.post("/api/motivate-dzikir", async (req, res) => {
    try {
      const { category, deedId } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey || apiKey === "your-api-key" || apiKey.trim() === "") {
        return res.status(500).json({ error: "Layanan AI tidak tersedia." });
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `Berikan satu pesan singkat yang sangat puitis, memotivasi, dan mengapresiasi pengguna karena baru saja menyelesaikan amaliyah (ibadah) kategori: "${category}" dengan spesifik amalan: "${deedId}". Pesan ini harus memberikan semangat untuk konsisten berdzikir/beribadah. Jangan gunakan format markdown, langsung teks saja. Maksimal 20 kata.`;
      
      const response = await model.generateContent(prompt);
      const text = response.response.text().trim();
      
      res.json({ message: text });
    } catch (error) {
       console.error("Dzikir Motivation Error:", error);
       res.status(500).json({ error: "Internal Server Error" });
    }
  });



  app.post("/api/chatbot", async (req, res) => {
    try {
      const { history } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey || apiKey === "your-api-key" || apiKey.trim() === "") {
         return res.status(500).json({ error: "Layanan AI tidak tersedia (API Key tidak ditemukan atau tidak valid)." });
      }

      if (!history || !Array.isArray(history)) {
         return res.status(400).json({ error: "Missing or invalid history array." });
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: `Anda adalah "Asisten Kebaikan", chatbot virtual untuk aplikasi Laznas Dewan Dakwah. 
Anda merupakan asisten yang sangat cerdas, humanis (seperti manusia), hangat, dan berpengetahuan luas tentang agama Islam.
Tugas Anda:
1. Membantu pengguna seputar donasi, zakat, infak, sedekah, fidyah, dan wakaf di Laznas Dewan Dakwah. (Arahkan ke menu utama/Beranda jika mereka ingin donasi).
2. Menghitungkan segala jenis Zakat (kalkulator zakat pintar). Anda BISA dan MAMPU menghitung Zakat Penghasilan, Zakat Maal, Zakat Fitrah, Zakat Emas/Perak, Zakat Pertanian, Zakat Peternakan, Zakat Perdagangan, dll. Jika pengguna ingin menghitung zakat, tanyakan variabel yang dibutuhkan (misal: gaji bulanan, total tabungan, harga emas saat ini, dll) lalu hitungkan untuknya beserta penjelasan nisab dan haul-nya (2,5% atau 5% atau 10% atau 20% sesuai syariat).
3. Menjawab pertanyaan-pertanyaan tentang hukum fiqih, syariat, dan ajaran Islam secara umum dengan dalil atau penjelasan yang mudah dipahami.
4. Berkomunikasi dengan luwes, ramah, dan islami, layaknya manusia (gunakan sapaan ramah, sesekali gunakan emoji yang sesuai).

Panduan:
- Jika diminta menghitung zakat, berikan panduan perhitungannya dengan rapi, jelas, dan akurat berdasarkan kaidah fiqih zakat.
- Jika ditanya hukum ibadah, muamalah, zakat penghasilan, nisab, berikan jawaban syar'i yang jelas beserta referensi umum.
- Jelaskan hukum Islam (wajib, sunnah, mubah, makruh, haram) dengan baik tanpa menghakimi.
- Jawab secara santai layaknya berbicara dengan teman, ringkas namun spesifik.
- Gunakan bahasa Indonesia yang baik, tidak kaku, santai namun tetap sopan dan memuliakan lawan bicara.
- Jika ada hal teknis yang di luar kewenangan/kapasitas Anda, arahkan pengguna menghubungi WhatsApp (0812-3456-7890) atau email (care@laznasdd.org).`
      });

      const response = await model.generateContent({
        contents: history,
        generationConfig: {
          temperature: 0.7
        }
      });
      
      const responseText = response.response.text();
      res.json({ message: responseText });
    } catch (error) {
       console.error("Chatbot API Error:", error);
       const errMsg = error instanceof Error ? error.message : String(error);
       if (errMsg.includes("API_KEY_INVALID") || errMsg.includes("API key not valid")) {
         return res.status(400).json({ error: "API_KEY_INVALID" });
       }
       res.status(500).json({ error: errMsg });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production setup
    const distPath = path.resolve(__dirname, "dist");
    const fallbackDistPath = path.resolve(process.cwd(), "dist");
    
    // Choose the best dist path available
    let finalDistPath = distPath;
    if (!fs.existsSync(path.join(distPath, "index.html")) && fs.existsSync(path.join(fallbackDistPath, "index.html"))) {
      finalDistPath = fallbackDistPath;
    }

    console.log(`[DEBUG] Final dist path chosen: ${finalDistPath}`);

    // Verify dist exists at startup
    if (!fs.existsSync(finalDistPath)) {
      console.error(`[ERROR] Production dist folder NOT FOUND at ${finalDistPath}`);
    }

    app.use(express.static(finalDistPath));

    app.get("*", (req, res) => {
      // Don't intercept API calls (redundant but safe)
      if (req.url.startsWith('/api')) return res.status(404).json({ error: 'API route not found' });

      const indexPath = path.join(finalDistPath, "index.html");
      
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        console.error(`[ERROR] index.html not found! Checked: ${indexPath}`);
        res.status(500).send(`
          <div style="font-family: sans-serif; padding: 2rem; max-width: 800px; margin: 0 auto; line-height: 1.6; border: 1px solid #fecaca; border-radius: 1rem; margin-top: 3rem; background: #fffafb;">
            <h1 style="color: #e11d48; margin-top: 0;">500 Internal Server Error</h1>
            <p style="color: #4b5563; font-size: 1.1rem;">Aplikasi backend berjalan, tetapi <b>file frontend (index.html) tidak ditemukan</b>.</p>
            
            <div style="background: #f3f4f6; pading: 1rem; border-radius: 0.5rem; padding: 1rem; font-family: monospace; font-size: 0.875rem; color: #374151; margin: 1.5rem 0; text-align: left; border: 1px solid #e5e7eb;">
              <b>DEBUG INFO:</b><br>
              - Target: ${indexPath}<br>
              - Dirname: ${__dirname}<br>
              - CWD: ${process.cwd()}<br>
              - NODE_ENV: ${process.env.NODE_ENV}
            </div>

            <h3 style="color: #1f2937;">Langkah Perbaikan:</h3>
            <ol style="color: #4b5563; text-align: left;">
              <li>Cek apakah folder <code>dist</code> sudah ada di VPS.</li>
              <li>Pastikan <code>npm run build</code> tidak error saat deployment.</li>
              <li>Jika baru saja update folder ke <code>/webb</code>, pastikan path di PM2 sudah sesuai.</li>
            </ol>
            <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 2rem 0;">
            <p style="font-size: 0.8rem; color: #9ca3af;">Laznas Dewan Dakwah - Digital Donation Platform</p>
          </div>
        `);
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
