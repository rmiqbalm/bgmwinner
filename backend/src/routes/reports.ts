import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { authRequired, AuthedRequest, requireRole } from "../lib/auth.js";
import { dateFromStr, todayStr, dateStr, monthKey } from "../lib/dates.js";
import { getSettings } from "../lib/settings.js";

const router = Router();
router.use(authRequired);

// Laporan Stok IN/OUT
router.get("/stock", async (req: AuthedRequest, res: Response) => {
  const { from, to, lapakId, mitraId } = req.query;
  const dFrom = from ? dateFromStr(String(from)) : dateFromStr(todayStr());
  const dTo = to ? dateFromStr(String(to)) : dateFromStr(todayStr());
  const where: any = {
    date: { gte: dFrom, lte: dTo },
  };
  if (lapakId) where.lapakId = parseInt(String(lapakId), 10);
  if (mitraId && req.user!.role !== "MITRA") where.mitraId = parseInt(String(mitraId), 10);
  if (req.user!.role === "MITRA") where.mitraId = req.user!.id;

  const deposits = await prisma.dailyDeposit.findMany({
    where,
    orderBy: [{ date: "asc" }, { id: "asc" }],
    include: {
      mitra: { select: { id: true, name: true } },
      lapak: { select: { id: true, name: true } },
      items: { include: { product: { select: { id: true, name: true, unit: true } } } },
    },
  });

  const rows: any[] = [];
  let totalIn = 0;
  let totalOut = 0;
  for (const d of deposits) {
    for (const it of d.items) {
      rows.push({
        date: dateStr(d.date),
        lapak: d.lapak.name,
        mitra: d.mitra.name,
        product: it.product.name,
        unit: it.product.unit,
        price: it.price,
        stockIn: it.initialQty,
        sold: it.soldQty,
        remaining: it.remainingQty,
        status: d.status,
      });
      totalIn += it.initialQty;
      totalOut += it.soldQty;
    }
  }
  res.json({
    from: dateStr(dFrom),
    to: dateStr(dTo),
    summary: { totalIn, totalOut, totalRemaining: totalIn - totalOut },
    rows,
  });
});

// Laporan Cashflow
router.get("/cashflow", async (req: AuthedRequest, res: Response) => {
  const { from, to, lapakId, mitraId } = req.query;
  const dFrom = from ? dateFromStr(String(from)) : dateFromStr(todayStr());
  const dTo = to ? dateFromStr(String(to)) : dateFromStr(todayStr());
  const settings = await getSettings();

  const where: any = {
    date: { gte: dFrom, lte: dTo },
  };
  if (lapakId) where.lapakId = parseInt(String(lapakId), 10);
  if (mitraId && req.user!.role !== "MITRA") where.mitraId = parseInt(String(mitraId), 10);
  if (req.user!.role === "MITRA") where.mitraId = req.user!.id;

  const deposits = await prisma.dailyDeposit.findMany({
    where,
    orderBy: [{ date: "asc" }, { id: "asc" }],
    include: {
      mitra: { select: { id: true, name: true } },
      lapak: { select: { id: true, name: true } },
      items: { select: { soldQty: true } },
    },
  });

  let totalQty = 0;
  let totalRevenue = 0;
  let totalMitraShare = 0;
  let totalBgmFee = 0;
  const byDay: Record<string, { date: string; qty: number; revenue: number; mitraShare: number; bgmFee: number }> = {};
  const byMonth: Record<string, { month: string; qty: number; revenue: number; mitraShare: number; bgmFee: number }> = {};

  for (const d of deposits) {
    const qty = d.items.reduce((s, it) => s + it.soldQty, 0);
    if (qty === 0) continue;
    const revenue = qty * settings.SELLING_PRICE;
    const mitraShare = qty * settings.MITRA_SHARE;
    const bgmFee = qty * settings.BGM_FEE;
    totalQty += qty;
    totalRevenue += revenue;
    totalMitraShare += mitraShare;
    totalBgmFee += bgmFee;

    const ds = dateStr(d.date);
    if (!byDay[ds]) byDay[ds] = { date: ds, qty: 0, revenue: 0, mitraShare: 0, bgmFee: 0 };
    byDay[ds].qty += qty;
    byDay[ds].revenue += revenue;
    byDay[ds].mitraShare += mitraShare;
    byDay[ds].bgmFee += bgmFee;

    const ms = monthKey(d.date);
    if (!byMonth[ms]) byMonth[ms] = { month: ms, qty: 0, revenue: 0, mitraShare: 0, bgmFee: 0 };
    byMonth[ms].qty += qty;
    byMonth[ms].revenue += revenue;
    byMonth[ms].mitraShare += mitraShare;
    byMonth[ms].bgmFee += bgmFee;
  }

  res.json({
    from: dateStr(dFrom),
    to: dateStr(dTo),
    sellingPrice: settings.SELLING_PRICE,
    mitraShare: settings.MITRA_SHARE,
    bgmFee: settings.BGM_FEE,
    summary: {
      qty: totalQty,
      cashIn: totalRevenue,
      mitraShare: totalMitraShare,
      bgmIncome: totalBgmFee,
      net: totalRevenue - totalMitraShare,
    },
    byDay: Object.values(byDay).sort((a, b) => a.date.localeCompare(b.date)),
    byMonth: Object.values(byMonth).sort((a, b) => a.month.localeCompare(b.month)),
  });
});

// Export CSV helper endpoint
router.get("/stock/export", requireRole("ADMIN", "STAFF"), async (req: AuthedRequest, res: Response) => {
  const { from, to } = req.query;
  const dFrom = from ? dateFromStr(String(from)) : dateFromStr(todayStr());
  const dTo = to ? dateFromStr(String(to)) : dateFromStr(todayStr());
  const deposits = await prisma.dailyDeposit.findMany({
    where: { date: { gte: dFrom, lte: dTo } },
    orderBy: [{ date: "asc" }, { id: "asc" }],
    include: {
      mitra: { select: { name: true } },
      lapak: { select: { name: true } },
      items: { include: { product: { select: { name: true, unit: true } } } },
    },
  });
  const lines = ["Tanggal,Lapak,Mitra,Produk,Satuan,Stok Masuk,Terjual,Sisa"];
  for (const d of deposits) {
    for (const it of d.items) {
      lines.push(
        `${dateStr(d.date)},${d.lapak.name},${d.mitra.name},${it.product.name},${it.product.unit},${it.initialQty},${it.soldQty},${it.remainingQty}`
      );
    }
  }
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="stok-${dateStr(dFrom)}-${dateStr(dTo)}.csv"`);
  res.send("\uFEFF" + lines.join("\n"));
});

export default router;
