import fs from "node:fs";
import path from "node:path";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import lapakRoutes from "./routes/lapaks.js";
import productRoutes from "./routes/products.js";
import depositRoutes from "./routes/deposits.js";
import leaveRoutes from "./routes/leaves.js";
import stockRoutes from "./routes/stocks.js";
import reportRoutes from "./routes/reports.js";
import paymentRoutes from "./routes/payments.js";
import settingRoutes from "./routes/settings.js";
import dashboardRoutes from "./routes/dashboard.js";
import { runAutoLeave } from "./jobs/autoleave.js";

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get("/api/health", (_req, res) => res.json({ ok: true, time: new Date().toISOString() }));

  app.get("/api/cron/autoleave", async (req, res) => {
    const secret = process.env.CRON_SECRET;
    if (secret) {
      const auth = req.headers.authorization || "";
      if (auth !== `Bearer ${secret}`) {
        return res.status(401).json({ error: "unauthorized" });
      }
    }
    try {
      const created = await runAutoLeave();
      res.json({ ok: true, created });
    } catch (e) {
      console.error("[cron/autoleave] error:", e);
      res.status(500).json({ ok: false, error: "gagal menjalankan auto-leave" });
    }
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/lapaks", lapakRoutes);
  app.use("/api/products", productRoutes);
  app.use("/api/deposits", depositRoutes);
  app.use("/api/leaves", leaveRoutes);
  app.use("/api/stocks", stockRoutes);
  app.use("/api/reports", reportRoutes);
  app.use("/api/payments", paymentRoutes);
  app.use("/api/settings", settingRoutes);
  app.use("/api/dashboard", dashboardRoutes);

  const distDir = path.join(process.cwd(), "../frontend/dist");
  if (fs.existsSync(distDir)) {
    app.use(express.static(distDir));
    app.get("*", (req: express.Request, res: express.Response, next: express.NextFunction) => {
      if (req.path.startsWith("/api")) return next();
      res.sendFile(path.join(distDir, "index.html"));
    });
  }

  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err);
    res.status(500).json({ error: "Terjadi kesalahan server" });
  });

  return app;
}
