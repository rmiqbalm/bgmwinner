import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const adminPassword = await bcrypt.hash("admin123", 10);
  const staffPassword = await bcrypt.hash("staff123", 10);
  const mitraPassword = await bcrypt.hash("mitra123", 10);

  const admin = await prisma.user.upsert({
    where: { phone: "081100000001" },
    update: {},
    create: {
      name: "Administrator BGM",
      phone: "081100000001",
      address: "Kantor BGM Winner",
      role: "ADMIN",
      password: adminPassword,
    },
  });

  const staff1 = await prisma.user.upsert({
    where: { phone: "081100000002" },
    update: {},
    create: {
      name: "Staff Lapak A",
      phone: "081100000002",
      address: "Lapak A",
      role: "STAFF",
      password: staffPassword,
    },
  });

  const staff2 = await prisma.user.upsert({
    where: { phone: "081100000003" },
    update: {},
    create: {
      name: "Staff Lapak B",
      phone: "081100000003",
      address: "Lapak B",
      role: "STAFF",
      password: staffPassword,
    },
  });

  const lapakA = await prisma.lapak.upsert({
    where: { id: 1 },
    update: {},
    create: { name: "Lapak A", location: "Pasar Sentral Blok A" },
  });

  const lapakB = await prisma.lapak.upsert({
    where: { id: 2 },
    update: {},
    create: { name: "Lapak B", location: "Pasar Sentral Blok B" },
  });

  const lapakC = await prisma.lapak.upsert({
    where: { id: 3 },
    update: {},
    create: { name: "Lapak C", location: "Pasar Sentral Blok C" },
  });

  const mitra1 = await prisma.user.upsert({
    where: { phone: "081200000001" },
    update: {},
    create: {
      name: "Mitra Siti",
      phone: "081200000001",
      address: "Jl. Melati No. 1",
      role: "MITRA",
      password: mitraPassword,
    },
  });

  const mitra2 = await prisma.user.upsert({
    where: { phone: "081200000002" },
    update: {},
    create: {
      name: "Mitra Budi",
      phone: "081200000002",
      address: "Jl. Anggrek No. 2",
      role: "MITRA",
      password: mitraPassword,
    },
  });

  await prisma.mitraLapak.upsert({
    where: { mitraId_lapakId: { mitraId: mitra1.id, lapakId: lapakA.id } },
    update: {},
    create: { mitraId: mitra1.id, lapakId: lapakA.id },
  });
  await prisma.mitraLapak.upsert({
    where: { mitraId_lapakId: { mitraId: mitra1.id, lapakId: lapakB.id } },
    update: {},
    create: { mitraId: mitra1.id, lapakId: lapakB.id },
  });
  await prisma.mitraLapak.upsert({
    where: { mitraId_lapakId: { mitraId: mitra2.id, lapakId: lapakA.id } },
    update: {},
    create: { mitraId: mitra2.id, lapakId: lapakA.id },
  });

  const p1 = await prisma.product.create({
    data: { mitraId: mitra1.id, name: "Keripik Singkong", unit: "bungkus", price: 9000 },
  });
  const p2 = await prisma.product.create({
    data: { mitraId: mitra1.id, name: "Stik Keju", unit: "bungkus", price: 9000 },
  });
  const p3 = await prisma.product.create({
    data: { mitraId: mitra2.id, name: "Rengginang", unit: "bungkus", price: 9000 },
  });

  const defaults: Record<string, string> = {
    MITRA_SHARE: "9000",
    BGM_FEE: "1000",
    SELLING_PRICE: "10000",
    DEPOSIT_OPEN: "05:00",
    DEPOSIT_CLOSE: "06:00",
    STALL_CLOSE: "12:00",
    AUTO_LEAVE_HOUR: "06:30",
    WINDOW_ENFORCE: "false",
  };
  for (const [key, value] of Object.entries(defaults)) {
    await prisma.setting.upsert({ where: { key }, update: {}, create: { key, value } });
  }

  console.log("Seed selesai:");
  console.log(`  Admin  : 081100000001 / admin123 (${admin.id})`);
  console.log(`  Staff  : 081100000002 / staff123 (${staff1.id})`);
  console.log(`  Staff  : 081100000003 / staff123 (${staff2.id})`);
  console.log(`  Mitra  : 081200000001 / mitra123 (${mitra1.id})`);
  console.log(`  Mitra  : 081200000002 / mitra123 (${mitra2.id})`);
  console.log(`  Lapak  : ${lapakA.name}, ${lapakB.name}, ${lapakC.name}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
