import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { hashPassword, verifyPassword } from "../lib/password.js";
import { signToken } from "../lib/token.js";
import { authRequired, AuthedRequest } from "../lib/auth.js";

const router = Router();

interface RegisterBody {
  name: string;
  phone: string;
  address: string;
  password: string;
  lapakIds?: number[];
}

router.post("/register", async (req: Request<{}, {}, RegisterBody>, res: Response) => {
  try {
    const { name, phone, address, password, lapakIds } = req.body;
    if (!name || !phone || !address || !password) {
      return res.status(400).json({ error: "Nama, No. HP, Alamat dan password wajib diisi" });
    }
    const existing = await prisma.user.findUnique({ where: { phone } });
    if (existing) {
      return res.status(409).json({ error: "Nomor HP sudah terdaftar" });
    }

    const user = await prisma.user.create({
      data: {
        name,
        phone,
        address,
        password: await hashPassword(password),
        role: "MITRA",
      },
    });

    if (lapakIds && lapakIds.length > 0) {
      const active = await prisma.lapak.findMany({
        where: { id: { in: lapakIds }, status: "ACTIVE" },
        select: { id: true },
      });
      await prisma.mitraLapak.createMany({
        data: active.map((l) => ({ mitraId: user.id, lapakId: l.id })),
      });
    }

    const token = signToken({ id: user.id, role: user.role });
    res.status(201).json({
      token,
      user: { id: user.id, name: user.name, phone: user.phone, role: user.role },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Gagal mendaftar" });
  }
});

router.post("/login", async (req: Request<{}, {}, { phone: string; password: string }>, res: Response) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ error: "Phone dan password wajib diisi" });
    }
    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user || !(await verifyPassword(password, user.password))) {
      return res.status(401).json({ error: "Nomor HP atau password salah" });
    }
    if (user.status !== "ACTIVE") {
      return res.status(403).json({ error: "Akun Anda nonaktif. Hubungi admin." });
    }
    const token = signToken({ id: user.id, role: user.role });
    res.json({
      token,
      user: { id: user.id, name: user.name, phone: user.phone, role: user.role },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Gagal login" });
  }
});

router.get("/me", authRequired, async (req: AuthedRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        mitraLapaks: { include: { lapak: true }, orderBy: { id: "asc" } },
        _count: { select: { products: true } },
      },
    });
    if (!user) return res.status(404).json({ error: "User tidak ditemukan" });
    const { password, ...safe } = user;
    res.json({ user: safe });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Gagal mengambil data user" });
  }
});

export default router;
