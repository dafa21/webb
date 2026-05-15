import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { GoogleGenerativeAI } from "@google/generative-ai";
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

      if (!apiKey) {
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

      if (!apiKey) {
        console.error("[ERROR] GEMINI_API_KEY is not set.");
        return res.status(500).json({ error: "Layanan AI tidak tersedia (API Key tidak ditemukan)." });
      }

      if (!prompt || !audioBase64 || !mimeType) {
        return res.status(400).json({ error: "Missing required fields: prompt, audioBase64, or mimeType" });
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

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
      res.status(500).json({ error: error instanceof Error ? error.message : "Internal Server Error" });
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
