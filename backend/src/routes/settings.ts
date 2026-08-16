import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { authRequired, requireRole } from "../lib/auth.js";

const router = Router();

router.get("/", authRequired, requireRole("ADMIN"), async (_req: Request, res: Response) => {
  const settings = await prisma.setting.findMany({ orderBy: { key: "asc" } });
  res.json({ settings });
});

router.patch("/", authRequired, requireRole("ADMIN"), async (req: Request, res: Response) => {
  const updates = req.body;
  const allowed = [
    "MITRA_SHARE",
    "BGM_FEE",
    "SELLING_PRICE",
    "DEPOSIT_OPEN",
    "DEPOSIT_CLOSE",
    "STALL_CLOSE",
    "AUTO_LEAVE_HOUR",
    "WINDOW_ENFORCE",
  ];
  for (const key of Object.keys(updates)) {
    if (!allowed.includes(key)) continue;
    await prisma.setting.upsert({
      where: { key },
      update: { value: String(updates[key]) },
      create: { key, value: String(updates[key]) },
    });
  }
  const settings = await prisma.setting.findMany({ orderBy: { key: "asc" } });
  res.json({ settings });
});

export default router;
