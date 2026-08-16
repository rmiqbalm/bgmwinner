import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { authRequired, optionalAuth, requireRole } from "../lib/auth.js";

const router = Router();

router.get("/", optionalAuth, async (_req: Request, res: Response) => {
  const lapaks = await prisma.lapak.findMany({
    orderBy: { id: "asc" },
    include: { _count: { select: { mitraLapaks: true } } },
  });
  res.json({ lapaks });
});

router.post("/", authRequired, requireRole("ADMIN"), async (req: Request, res: Response) => {
  const { name, location } = req.body;
  if (!name) return res.status(400).json({ error: "Nama lapak wajib diisi" });
  const lapak = await prisma.lapak.create({ data: { name, location: location || null } });
  res.status(201).json({ lapak });
});

router.patch("/:id", authRequired, requireRole("ADMIN"), async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const { name, location, status } = req.body;
  const data: any = {};
  if (name) data.name = name;
  if (location !== undefined) data.location = location;
  if (status) data.status = status;
  const lapak = await prisma.lapak.update({ where: { id }, data });
  res.json({ lapak });
});

export default router;
