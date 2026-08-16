import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { optionalAuth, AuthedRequest } from "../lib/auth.js";
import { dateFromStr, todayStr, dateStr } from "../lib/dates.js";

const router = Router();
router.use(optionalAuth);

// Halaman Stok Produk: hanya produk dengan sisa stok > 0
router.get("/", async (req: AuthedRequest, res: Response) => {
  const { date, lapakId } = req.query;
  const d = date ? dateFromStr(String(date)) : dateFromStr(todayStr());
  const next = new Date(d);
  next.setDate(next.getDate() + 1);

  const where: any = {
    deposit: { date: { gte: d, lt: next }, status: "OPEN" },
    remainingQty: { gt: 0 },
  };
  if (lapakId) where.deposit = { date: { gte: d, lt: next }, status: "OPEN", lapakId: parseInt(String(lapakId), 10) };
  if (req.user && req.user.role === "MITRA") {
    where.deposit = { ...(where.deposit || {}), mitraId: req.user.id };
  }

  const items = await prisma.depositItem.findMany({
    where,
    orderBy: { id: "asc" },
    include: {
      product: { select: { id: true, name: true, unit: true, price: true } },
      deposit: {
        select: {
          id: true,
          date: true,
          mitra: { select: { id: true, name: true } },
          lapak: { select: { id: true, name: true } },
        },
      },
    },
  });

  const stocks = items.map((it) => ({
    id: it.id,
    depositId: it.depositId,
    date: dateStr(it.deposit.date),
    product: it.product,
    mitra: it.deposit.mitra,
    lapak: it.deposit.lapak,
    remainingQty: it.remainingQty,
    initialQty: it.initialQty,
    soldQty: it.soldQty,
  }));

  res.json({ date: dateStr(d), total: stocks.length, stocks });
});

export default router;
