import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { authRequired, AuthedRequest, requireRole } from "../lib/auth.js";
import { dateFromStr, dateStr, todayStr } from "../lib/dates.js";
import { getSettings } from "../lib/settings.js";

const router = Router();
router.use(authRequired, requireRole("ADMIN"));

// List payments
router.get("/", async (req: Request, res: Response) => {
  const { mitraId, status } = req.query;
  const where: any = {};
  if (mitraId) where.mitraId = parseInt(String(mitraId), 10);
  if (status) where.status = status;
  const payments = await prisma.payment.findMany({
    where,
    orderBy: { id: "desc" },
    include: {
      mitra: { select: { id: true, name: true, phone: true } },
      payer: { select: { id: true, name: true } },
    },
  });
  res.json({ payments });
});

// Create payment for a mitra over a date range (from closed deposits)
router.post("/", async (req: AuthedRequest, res: Response) => {
  const { mitraId, dateFrom, dateTo } = req.body;
  if (!mitraId || !dateFrom || !dateTo) {
    return res.status(400).json({ error: "Mitra dan rentang tanggal wajib diisi" });
  }
  const dFrom = dateFromStr(String(dateFrom));
  const dTo = dateFromStr(String(dateTo));
  const mitra = await prisma.user.findUnique({ where: { id: parseInt(String(mitraId), 10) } });
  if (!mitra || mitra.role !== "MITRA") return res.status(404).json({ error: "Mitra tidak ditemukan" });

  const settings = await getSettings();
  const deposits = await prisma.dailyDeposit.findMany({
    where: { mitraId: mitra.id, date: { gte: dFrom, lte: dTo } },
    include: { items: { select: { soldQty: true } } },
  });
  const totalQty = deposits.reduce((s, d) => s + d.items.reduce((x, it) => x + it.soldQty, 0), 0);
  if (totalQty === 0) {
    return res.status(400).json({ error: "Tidak ada penjualan pada rentang tanggal tersebut" });
  }
  const totalAmount = totalQty * settings.MITRA_SHARE;

  const payment = await prisma.payment.create({
    data: { mitraId: mitra.id, dateFrom: dFrom, dateTo: dTo, totalQty, totalAmount },
  });
  res.status(201).json({ payment });
});

// Mark paid
router.post("/:id/pay", async (req: AuthedRequest, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const payment = await prisma.payment.findUnique({ where: { id } });
  if (!payment) return res.status(404).json({ error: "Payment tidak ditemukan" });
  if (payment.status === "PAID") return res.status(400).json({ error: "Sudah dibayar" });
  const updated = await prisma.payment.update({
    where: { id },
    data: { status: "PAID", paidAt: new Date(), paidBy: req.user!.id },
  });
  res.json({ payment: updated });
});

export default router;
