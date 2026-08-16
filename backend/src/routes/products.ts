import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { authRequired, AuthedRequest, requireRole } from "../lib/auth.js";

const router = Router();
router.use(authRequired);

router.get("/", async (req: AuthedRequest, res: Response) => {
  const { mitraId } = req.query;
  const where: any = {};
  if (req.user!.role === "MITRA") where.mitraId = req.user!.id;
  if (mitraId && req.user!.role !== "MITRA") where.mitraId = parseInt(String(mitraId), 10);
  const products = await prisma.product.findMany({
    where,
    orderBy: { id: "asc" },
    include: { mitra: { select: { id: true, name: true } } },
  });
  res.json({ products });
});

router.post("/", requireRole("MITRA", "ADMIN"), async (req: AuthedRequest, res: Response) => {
  const { name, unit, price } = req.body;
  if (!name) return res.status(400).json({ error: "Nama produk wajib diisi" });
  const product = await prisma.product.create({
    data: {
      mitraId: req.user!.role === "MITRA" ? req.user!.id : (req.body.mitraId || req.user!.id),
      name,
      unit: unit || "pcs",
      price: price ? parseInt(price, 10) : 9000,
    },
  });
  res.status(201).json({ product });
});

router.patch("/:id", async (req: AuthedRequest, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return res.status(404).json({ error: "Produk tidak ditemukan" });
  if (req.user!.role !== "ADMIN" && product.mitraId !== req.user!.id) {
    return res.status(403).json({ error: "Akses ditolak" });
  }
  const { name, unit, price, status } = req.body;
  const data: any = {};
  if (name) data.name = name;
  if (unit) data.unit = unit;
  if (price) data.price = parseInt(price, 10);
  if (status) data.status = status;
  const updated = await prisma.product.update({ where: { id }, data });
  res.json({ product: updated });
});

export default router;
