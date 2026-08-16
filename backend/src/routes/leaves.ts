import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { authRequired, AuthedRequest, requireRole } from "../lib/auth.js";
import { dateFromStr, todayStr, dateStr } from "../lib/dates.js";

const router = Router();

// Mitra libur hari ini (untuk semua pengunjung, publik)
router.get("/today", async (req: Request, res: Response) => {
  const { date, lapakId } = req.query;
  const d = date ? dateFromStr(String(date)) : dateFromStr(todayStr());
  const where: any = { leaveDate: d };
  if (lapakId) where.lapakId = parseInt(String(lapakId), 10);
  const leaves = await prisma.leave.findMany({
    where,
    orderBy: { id: "asc" },
    include: {
      mitra: { select: { id: true, name: true, phone: true } },
      lapak: { select: { id: true, name: true } },
    },
  });
  res.json({ date: dateStr(d), leaves });
});

router.use(authRequired);

// Create manual leave (mitra) - or admin on behalf
router.post("/", async (req: AuthedRequest, res: Response) => {
  const { leaveDate, lapakIds, reason } = req.body;
  const d = leaveDate ? dateFromStr(String(leaveDate)) : dateFromStr(todayStr());
  const today = dateFromStr(todayStr());
  if (d < today) return res.status(400).json({ error: "Tidak bisa isi libur untuk tanggal lampau" });

  let targetMitra = req.user!.id;
  if (req.user!.role !== "MITRA") {
    targetMitra = req.body.mitraId ? parseInt(String(req.body.mitraId), 10) : req.user!.id;
  }

  const regs = await prisma.mitraLapak.findMany({
    where: { mitraId: targetMitra, status: "ACTIVE" },
    include: { lapak: true },
  });
  let selected = regs;
  if (Array.isArray(lapakIds) && lapakIds.length > 0) {
    selected = regs.filter((r) => lapakIds.includes(r.lapakId));
  }
  if (selected.length === 0) {
    return res.status(400).json({ error: "Tidak ada lapak terdaftar untuk diinput libur" });
  }

  const created = await prisma.$transaction(
    selected.map((r) =>
      prisma.leave.create({
        data: { mitraId: targetMitra, lapakId: r.lapakId, leaveDate: d, reason: reason || null },
      })
    )
  );
  res.status(201).json({ leaves: created });
});

// List leaves with filters (admin/staff)
router.get("/", requireRole("ADMIN", "STAFF"), async (req: Request, res: Response) => {
  const { from, to, mitraId, lapakId } = req.query;
  const where: any = {};
  if (from && to) {
    where.leaveDate = { gte: dateFromStr(String(from)), lte: dateFromStr(String(to)) };
  } else if (from) {
    where.leaveDate = { gte: dateFromStr(String(from)) };
  } else if (to) {
    where.leaveDate = { lte: dateFromStr(String(to)) };
  }
  if (mitraId) where.mitraId = parseInt(String(mitraId), 10);
  if (lapakId) where.lapakId = parseInt(String(lapakId), 10);
  const leaves = await prisma.leave.findMany({
    where,
    orderBy: { leaveDate: "desc" },
    include: {
      mitra: { select: { id: true, name: true, phone: true } },
      lapak: { select: { id: true, name: true } },
    },
  });
  res.json({ leaves });
});

// Delete leave (admin, or mitra own manual leave)
router.delete("/:id", async (req: AuthedRequest, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const leave = await prisma.leave.findUnique({ where: { id } });
  if (!leave) return res.status(404).json({ error: "Data libur tidak ditemukan" });
  if (req.user!.role !== "ADMIN" && req.user!.role !== "STAFF") {
    if (leave.mitraId !== req.user!.id || leave.source !== "MANUAL") {
      return res.status(403).json({ error: "Akses ditolak" });
    }
  }
  await prisma.leave.delete({ where: { id } });
  res.json({ ok: true });
});

// Auto detect libur (admin/staff)
router.post("/auto-detect", requireRole("ADMIN", "STAFF"), async (req: AuthedRequest, res: Response) => {
  const { date } = req.body;
  const d = date ? dateFromStr(String(date)) : dateFromStr(todayStr());
  const next = new Date(d);
  next.setDate(next.getDate() + 1);

  const regs = await prisma.mitraLapak.findMany({
    where: { status: "ACTIVE" },
    include: { mitra: { select: { status: true } }, lapak: true },
  });

  const deposits = await prisma.dailyDeposit.findMany({
    where: { date: { gte: d, lt: next } },
    select: { mitraId: true, lapakId: true },
  });
  const deposited = new Set(deposits.map((x) => `${x.mitraId}-${x.lapakId}`));

  const leaves = await prisma.leave.findMany({
    where: { leaveDate: d },
    select: { mitraId: true, lapakId: true },
  });
  const alreadyLeave = new Set(leaves.map((x) => `${x.mitraId}-${x.lapakId}`));

  let created = 0;
  for (const reg of regs) {
    if (reg.mitra.status !== "ACTIVE") continue;
    const key = `${reg.mitraId}-${reg.lapakId}`;
    if (deposited.has(key) || alreadyLeave.has(key)) continue;
    await prisma.leave.create({
      data: { mitraId: reg.mitraId, lapakId: reg.lapakId, leaveDate: d, source: "AUTO" },
    });
    created++;
  }
  res.json({ date: dateStr(d), created });
});

export default router;
