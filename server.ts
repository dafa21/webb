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

  // Proxy endpoint for Talaqqi AI evaluation
  app.post("/api/evaluate-talaqqi", async (req, res) => {
    try {
      const { prompt, audioBase64, mimeType } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.status(500).json({ error: "Gemini API key is not configured on server" });
      }

      if (!prompt || !audioBase64 || !mimeType) {
        return res.status(400).json({ error: "Missing required fields: prompt, audioBase64, or mimeType" });
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
