import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { hashPassword } from "../lib/password.js";
import { authRequired, AuthedRequest, requireRole } from "../lib/auth.js";

const router = Router();
router.use(authRequired, requireRole("ADMIN"));

router.get("/", async (req: Request, res: Response) => {
  const { role, search } = req.query;
  const where: any = {};
  if (role) where.role = role;
  if (search) {
    where.OR = [{ name: { contains: String(search) } }, { phone: { contains: String(search) } }];
  }
  const users = await prisma.user.findMany({
    where,
    orderBy: { id: "asc" },
    include: {
      _count: { select: { mitraLapaks: true, products: true } },
      mitraLapaks: { select: { lapakId: true } },
    },
  });
  res.json({ users: users.map(({ password, ...u }) => u) });
});

router.post("/", async (req: Request, res: Response) => {
  const { name, phone, address, role, password } = req.body;
  if (!name || !phone || !password) {
    return res.status(400).json({ error: "Nama, phone dan password wajib diisi" });
  }
  const validRoles = ["ADMIN", "STAFF", "MITRA"];
  if (role && !validRoles.includes(role)) {
    return res.status(400).json({ error: "Role tidak valid" });
  }
  const existing = await prisma.user.findUnique({ where: { phone } });
  if (existing) return res.status(409).json({ error: "Nomor HP sudah terdaftar" });
  const user = await prisma.user.create({
    data: {
      name,
      phone,
      address: address || null,
      role: role || "MITRA",
      password: await hashPassword(password),
    },
  });
  res.status(201).json({ user: { id: user.id, name: user.name, phone: user.phone, role: user.role, status: user.status } });
});

router.patch("/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const { name, phone, address, role, password, status } = req.body;
  const data: any = {};
  if (name) data.name = name;
  if (address !== undefined) data.address = address;
  if (role) data.role = role;
  if (status) data.status = status;
  if (password) data.password = await hashPassword(password);
  if (phone) {
    const existing = await prisma.user.findUnique({ where: { phone } });
    if (existing && existing.id !== id) return res.status(409).json({ error: "Nomor HP sudah terdaftar" });
    data.phone = phone;
  }
  const user = await prisma.user.update({ where: { id }, data });
  res.json({ user: { id: user.id, name: user.name, phone: user.phone, role: user.role, status: user.status } });
});

router.post("/:id/mitra-lapaks", async (req: AuthedRequest, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const { lapakIds } = req.body;
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return res.status(404).json({ error: "User tidak ditemukan" });
  if (user.role !== "MITRA") return res.status(400).json({ error: "Bukan akun Mitra" });

  const target: number[] = Array.isArray(lapakIds) ? lapakIds : [];
  await prisma.$transaction(async (tx) => {
    await tx.mitraLapak.deleteMany({ where: { mitraId: id } });
    if (target.length > 0) {
      const active = await tx.lapak.findMany({ where: { id: { in: target }, status: "ACTIVE" }, select: { id: true } });
      await tx.mitraLapak.createMany({
        data: active.map((l) => ({ mitraId: id, lapakId: l.id })),
      });
    }
  });
  res.json({ ok: true });
});

export default router;
