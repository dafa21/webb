import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import midtransClient from "midtrans-client";

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

  // API routes
  app.post("/api/payment", async (req, res) => {
    try {
      const { amount, programName, donorName, donorEmail, paymentMethod, qurbanName, qurbanQty, qurbanLocation, qurbanAnimal, qurbanProcessing, qurbanForParents } = req.body;

      if (!process.env.MIDTRANS_SERVER_KEY) {
        console.warn("MIDTRANS_SERVER_KEY environment variable is missing. Returning a MOCK_TOKEN for testing purposes.");
        return res.json({ token: 'MOCK_TOKEN', orderId: `DONATION-MOCK-${Date.now()}` });
      }

      // Create Snap API instance
      let snap = new midtransClient.Snap({
        isProduction: false,
        serverKey: process.env.MIDTRANS_SERVER_KEY,
      });

      const orderId = `DONATION-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      let finalName = `Donasi: ${programName.substring(0, 40)}`;
      if (qurbanName && qurbanAnimal) {
        let animalName = qurbanAnimal.replace('_', ' ');
        finalName = `Qurban: ${qurbanName} (${qurbanQty} ${animalName})`;
      }

      let parameter = {
        transaction_details: {
          order_id: orderId,
          gross_amount: amount,
        },
        item_details: [
          {
            id: 'DONATION',
            price: amount,
            quantity: 1,
            name: finalName.substring(0, 50),
          }
        ],
        customer_details: {
          first_name: donorName || "Hamba Allah",
          email: donorEmail || "hamba.allah@example.com",
        },
        enabled_payments: paymentMethod ? [paymentMethod] : ["gopay", "shopeepay", "bca_va", "mandiri_va", "other_va"],
        credit_card: {
          secure: true
        }
      };

      const transaction = await snap.createTransaction(parameter);
      
      res.json({ token: transaction.token, orderId });
    } catch (error: any) {
      console.error("Payment error:", error);
      res.status(500).json({ error: error.message || "Failed to create payment" });
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
    console.log(`[DEBUG] Attempting to serve static files from: ${distPath}`);

    // Verify dist exists at startup
    if (!fs.existsSync(distPath)) {
      console.error(`[ERROR] Production dist folder NOT FOUND at ${distPath}`);
      console.log("[DEBUG] Current directory contents:", fs.readdirSync(__dirname));
    }

    app.use(express.static(distPath));

    app.get("*", (req, res) => {
      const indexPath = path.join(distPath, "index.html");
      
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        console.error(`[ERROR] index.html not found at: ${indexPath}`);
        res.status(500).send(`
          <h1>500 Internal Server Error</h1>
          <p>Aplikasi tidak dapat menemukan file frontend.</p>
          <hr>
          <p><b>Path yang dicari:</b> ${indexPath}</p>
          <p><b>Saran:</b> Coba jalankan <code>npm run build</code> di server secara manual di dalam folder project.</p>
        `);
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
