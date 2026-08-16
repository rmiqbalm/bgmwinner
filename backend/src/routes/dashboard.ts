import { Router, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { authRequired, AuthedRequest } from "../lib/auth.js";
import { dateFromStr, todayStr } from "../lib/dates.js";
import { getSettings } from "../lib/settings.js";

const router = Router();
router.use(authRequired);

router.get("/", async (req: AuthedRequest, res: Response) => {
  const role = req.user!.role;
  const d = dateFromStr(todayStr());
  const next = new Date(d);
  next.setDate(next.getDate() + 1);
  const settings = await getSettings();

  if (role === "ADMIN") {
    const [deposits, activeMitras, lapaks, leaves, products] = await Promise.all([
      prisma.dailyDeposit.findMany({ where: { date: { gte: d, lt: next } }, include: { items: true } }),
      prisma.user.count({ where: { role: "MITRA", status: "ACTIVE" } }),
      prisma.lapak.count({ where: { status: "ACTIVE" } }),
      prisma.leave.count({ where: { leaveDate: d } }),
      prisma.product.count(),
    ]);
    const totalSold = deposits.reduce((s, dep) => s + dep.items.reduce((x, it) => x + it.soldQty, 0), 0);
    return res.json({
      role,
      summary: {
        depositCount: deposits.length,
        totalSold,
        revenue: totalSold * settings.SELLING_PRICE,
        bgmIncome: totalSold * settings.BGM_FEE,
        activeMitras,
        activeLapaks: lapaks,
        leaveCountToday: leaves,
        totalProducts: products,
      },
    });
  }

  if (role === "STAFF") {
    const [deposits, lapaks] = await Promise.all([
      prisma.dailyDeposit.findMany({ where: { date: { gte: d, lt: next } }, include: { items: true } }),
      prisma.lapak.findMany({ where: { status: "ACTIVE" } }),
    ]);
    const totalSold = deposits.reduce((s, dep) => s + dep.items.reduce((x, it) => x + it.soldQty, 0), 0);
    const totalInitial = deposits.reduce((s, dep) => s + dep.items.reduce((x, it) => x + it.initialQty, 0), 0);
    return res.json({
      role,
      summary: {
        depositCount: deposits.length,
        totalInitial,
        totalSold,
        remaining: totalInitial - totalSold,
        revenue: totalSold * settings.SELLING_PRICE,
        lapakCount: lapaks.length,
      },
      lapaks,
    });
  }

  // MITRA
  const mitraId = req.user!.id;
  const [deposits, products, leaves, stocks] = await Promise.all([
    prisma.dailyDeposit.findMany({
      where: { mitraId, date: { gte: d, lt: next } },
      include: { items: true, lapak: { select: { name: true } } },
    }),
    prisma.product.count({ where: { mitraId } }),
    prisma.leave.findMany({ where: { mitraId, leaveDate: d } }),
    prisma.depositItem.count({
      where: { deposit: { mitraId, date: { gte: d, lt: next } }, remainingQty: { gt: 0 } },
    }),
  ]);
  const totalSold = deposits.reduce((s, dep) => s + dep.items.reduce((x, it) => x + it.soldQty, 0), 0);
  return res.json({
    role,
    summary: {
      depositCount: deposits.length,
      totalSold,
      estimatedIncome: totalSold * settings.MITRA_SHARE,
      productCount: products,
      leaveToday: leaves.length > 0,
      stockItemsToday: stocks,
    },
    deposits,
  });
});

export default router;
