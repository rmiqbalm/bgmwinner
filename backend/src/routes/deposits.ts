import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { authRequired, AuthedRequest, requireRole } from "../lib/auth.js";
import { getSettings } from "../lib/settings.js";
import { dateFromStr, todayStr, dateStr } from "../lib/dates.js";
import { isBetween, nowMinutes, isAfter } from "../lib/window.js";

const router = Router();
router.use(authRequired);

function canOperate(userRole: string): boolean {
  return userRole === "ADMIN" || userRole === "STAFF";
}

async function canModifyDeposit(req: AuthedRequest, depositId: number): Promise<{ ok: boolean; error?: string }> {
  const deposit = await prisma.dailyDeposit.findUnique({ where: { id: depositId } });
  if (!deposit) return { ok: false, error: "Setoran tidak ditemukan" };
  if (deposit.status === "CLOSED") return { ok: false, error: "Setoran sudah ditutup" };
  const role = req.user!.role;
  if (canOperate(role)) return { ok: true };
  if (deposit.mitraId !== req.user!.id) return { ok: false, error: "Akses ditolak" };
  const settings = await getSettings();
  if (settings.WINDOW_ENFORCE && !isBetween(nowMinutes(), settings.DEPOSIT_OPEN, settings.DEPOSIT_CLOSE)) {
    return { ok: false, error: "Di luar jam setoran (05:00-06:00)" };
  }
  return { ok: true };
}

// List deposits
router.get("/", async (req: AuthedRequest, res: Response) => {
  const { date, lapakId, mitraId, status } = req.query;
  const d = date ? dateFromStr(String(date)) : dateFromStr(todayStr());
  const next = new Date(d);
  next.setDate(next.getDate() + 1);

  const where: any = { date: { gte: d, lt: next } };
  if (lapakId) where.lapakId = parseInt(String(lapakId), 10);
  if (mitraId && req.user!.role !== "MITRA") where.mitraId = parseInt(String(mitraId), 10);
  if (status) where.status = status;
  if (req.user!.role === "MITRA") where.mitraId = req.user!.id;

  const deposits = await prisma.dailyDeposit.findMany({
    where,
    orderBy: { id: "asc" },
    include: {
      mitra: { select: { id: true, name: true } },
      lapak: { select: { id: true, name: true } },
      items: {
        include: { product: { select: { id: true, name: true, unit: true } } },
        orderBy: { id: "asc" },
      },
    },
  });
  res.json({ date: dateStr(d), deposits });
});

// Create deposit
router.post("/", async (req: AuthedRequest, res: Response) => {
  try {
    const { date, lapakId, mitraId, items } = req.body;
    const targetDate = date ? dateFromStr(String(date)) : dateFromStr(todayStr());
    const role = req.user!.role;
    let ownerId = mitraId ? parseInt(String(mitraId), 10) : req.user!.id;

    if (role === "MITRA") {
      if (mitraId) return res.status(403).json({ error: "Akses ditolak" });
      ownerId = req.user!.id;
      const reg = await prisma.mitraLapak.findUnique({
        where: { mitraId_lapakId: { mitraId: ownerId, lapakId: parseInt(String(lapakId), 10) } },
      });
      if (!reg) return res.status(403).json({ error: "Anda tidak terdaftar di lapak tersebut" });
      const settings = await getSettings();
      if (settings.WINDOW_ENFORCE && !isBetween(nowMinutes(), settings.DEPOSIT_OPEN, settings.DEPOSIT_CLOSE)) {
        return res.status(403).json({ error: "Di luar jam setoran (05:00-06:00)" });
      }
    }

    const existing = await prisma.dailyDeposit.findUnique({
      where: {
        mitraId_lapakId_date: { mitraId: ownerId, lapakId: parseInt(String(lapakId), 10), date: targetDate },
      },
    });
    if (existing) return res.status(409).json({ error: "Setoran untuk hari dan lapak ini sudah ada" });

    const itemList = Array.isArray(items) ? items : [];
    const deposit = await prisma.$transaction(async (tx) => {
      const created = await tx.dailyDeposit.create({
        data: { date: targetDate, mitraId: ownerId, lapakId: parseInt(String(lapakId), 10), submittedAt: new Date() },
      });
      const validItems = [];
      for (const it of itemList) {
        const qty = parseInt(String(it.qty), 10);
        if (!qty || qty <= 0) continue;
        const product = await tx.product.findUnique({ where: { id: parseInt(String(it.productId), 10) } });
        if (!product || product.mitraId !== ownerId) continue;
        validItems.push({
          depositId: created.id,
          productId: product.id,
          initialQty: qty,
          remainingQty: qty,
          price: product.price,
        });
      }
      if (validItems.length > 0) {
        await tx.depositItem.createMany({ data: validItems });
      }
      return tx.dailyDeposit.findUnique({
        where: { id: created.id },
        include: {
          mitra: { select: { id: true, name: true } },
          lapak: { select: { id: true, name: true } },
          items: { include: { product: true } },
        },
      });
    });
    res.status(201).json({ deposit });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Gagal membuat setoran" });
  }
});

// Deposit detail
router.get("/:id", async (req: AuthedRequest, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const deposit = await prisma.dailyDeposit.findUnique({
    where: { id },
    include: {
      mitra: { select: { id: true, name: true, phone: true } },
      lapak: { select: { id: true, name: true } },
      items: {
        include: { product: { select: { id: true, name: true, unit: true } } },
        orderBy: { id: "asc" },
      },
      saleLogs: { orderBy: { soldAt: "desc" }, take: 200 },
    },
  });
  if (!deposit) return res.status(404).json({ error: "Setoran tidak ditemukan" });
  if (req.user!.role === "MITRA" && deposit.mitraId !== req.user!.id) {
    return res.status(403).json({ error: "Akses ditolak" });
  }
  res.json({ deposit });
});

// Add item to open deposit
router.post("/:id/items", async (req: AuthedRequest, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const { productId, qty } = req.body;
  const check = await canModifyDeposit(req, id);
  if (!check.ok) return res.status(403).json({ error: check.error });
  const deposit = await prisma.dailyDeposit.findUnique({ where: { id } });
  if (!deposit) return res.status(404).json({ error: "Setoran tidak ditemukan" });
  const q = parseInt(String(qty), 10);
  if (!q || q <= 0) return res.status(400).json({ error: "Jumlah tidak valid" });

  const existing = await prisma.depositItem.findFirst({ where: { depositId: id, productId: parseInt(String(productId), 10) } });
  if (existing) {
    const updated = await prisma.depositItem.update({
      where: { id: existing.id },
      data: { initialQty: existing.initialQty + q, remainingQty: existing.remainingQty + q },
    });
    return res.json({ item: updated });
  }
  const product = await prisma.product.findUnique({ where: { id: parseInt(String(productId), 10) } });
  if (!product || product.mitraId !== deposit.mitraId) {
    return res.status(400).json({ error: "Produk tidak valid untuk Mitra ini" });
  }
  const item = await prisma.depositItem.create({
    data: { depositId: id, productId: product.id, initialQty: q, remainingQty: q, price: product.price },
  });
  res.status(201).json({ item });
});

// Update item quantity (only before any sales)
router.patch("/:id/items/:itemId", async (req: AuthedRequest, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const itemId = parseInt(req.params.itemId, 10);
  const check = await canModifyDeposit(req, id);
  if (!check.ok) return res.status(403).json({ error: check.error });
  const item = await prisma.depositItem.findFirst({ where: { id: itemId, depositId: id } });
  if (!item) return res.status(404).json({ error: "Item tidak ditemukan" });
  if (item.soldQty > 0) return res.status(400).json({ error: "Tidak bisa ubah qty karena sudah ada penjualan" });

  const q = parseInt(String(req.body.qty), 10);
  if (!q || q <= 0) return res.status(400).json({ error: "Jumlah tidak valid" });
  const updated = await prisma.depositItem.update({
    where: { id: itemId },
    data: { initialQty: q, remainingQty: q },
  });
  res.json({ item: updated });
});

// Remove item (only if no sales)
router.delete("/:id/items/:itemId", async (req: AuthedRequest, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const itemId = parseInt(req.params.itemId, 10);
  const check = await canModifyDeposit(req, id);
  if (!check.ok) return res.status(403).json({ error: check.error });
  const item = await prisma.depositItem.findFirst({ where: { id: itemId, depositId: id } });
  if (!item) return res.status(404).json({ error: "Item tidak ditemukan" });
  if (item.soldQty > 0) return res.status(400).json({ error: "Tidak bisa hapus karena sudah ada penjualan" });
  await prisma.depositItem.delete({ where: { id: itemId } });
  res.json({ ok: true });
});

// Sell (tombol Terjual)
router.post("/:id/sell", requireRole("ADMIN", "STAFF"), async (req: AuthedRequest, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const { itemId, qty } = req.body;
  const deposit = await prisma.dailyDeposit.findUnique({ where: { id } });
  if (!deposit) return res.status(404).json({ error: "Setoran tidak ditemukan" });
  if (deposit.status === "CLOSED") return res.status(400).json({ error: "Setoran sudah ditutup" });

  const item = await prisma.depositItem.findFirst({ where: { id: parseInt(String(itemId), 10), depositId: id } });
  if (!item) return res.status(404).json({ error: "Produk tidak ditemukan" });
  if (item.remainingQty <= 0) return res.status(400).json({ error: "Stok produk sudah habis" });

  const q = Math.min(qty ? parseInt(String(qty), 10) : 1, item.remainingQty);
  if (!q || q <= 0) return res.status(400).json({ error: "Jumlah tidak valid" });

  const updated = await prisma.$transaction(async (tx) => {
    const item = await tx.depositItem.update({
      where: { id: parseInt(String(itemId), 10) },
      data: { soldQty: { increment: q }, remainingQty: { decrement: q } },
    });
    await tx.saleLog.create({
      data: { depositId: id, depositItemId: item.id, productId: item.productId, qty: q, soldBy: req.user!.id },
    });
    return item;
  });

  res.json({ item: updated, sold: q, soldOut: updated.remainingQty === 0 });
});

// Closing
router.post("/:id/close", requireRole("ADMIN", "STAFF"), async (req: AuthedRequest, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const { adjustments } = req.body;
  const deposit = await prisma.dailyDeposit.findUnique({ where: { id } });
  if (!deposit) return res.status(404).json({ error: "Setoran tidak ditemukan" });
  if (deposit.status === "CLOSED") return res.status(400).json({ error: "Setoran sudah ditutup" });

  await prisma.$transaction(async (tx) => {
    if (Array.isArray(adjustments)) {
      for (const adj of adjustments) {
        const itemId = parseInt(String(adj.itemId), 10);
        const actual = parseInt(String(adj.actualQty), 10);
        if (isNaN(actual) || actual < 0) continue;
        const item = await tx.depositItem.findFirst({ where: { id: itemId, depositId: id } });
        if (!item) continue;
        const sold = Math.max(0, item.initialQty - actual);
        const extra = sold - item.soldQty;
        await tx.depositItem.update({
          where: { id: itemId },
          data: { remainingQty: actual, soldQty: sold, note: adj.note || null },
        });
        if (extra > 0) {
          await tx.saleLog.create({
            data: {
              depositId: id,
              depositItemId: itemId,
              productId: item.productId,
              qty: extra,
              soldBy: req.user!.id,
            },
          });
        }
      }
    }
    await tx.dailyDeposit.update({
      where: { id },
      data: { status: "CLOSED", closedAt: new Date() },
    });
  });

  const final = await prisma.dailyDeposit.findUnique({
    where: { id },
    include: {
      mitra: { select: { id: true, name: true } },
      lapak: { select: { id: true, name: true } },
      items: { include: { product: { select: { id: true, name: true, unit: true } } } },
    },
  });
  res.json({ deposit: final });
});

// Reopen (admin only)
router.post("/:id/reopen", requireRole("ADMIN"), async (req: AuthedRequest, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const deposit = await prisma.dailyDeposit.update({
    where: { id },
    data: { status: "OPEN", closedAt: null },
  });
  res.json({ deposit });
});

export default router;
