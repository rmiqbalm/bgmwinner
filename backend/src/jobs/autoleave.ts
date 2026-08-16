import cron from "node-cron";
import { prisma } from "../lib/prisma.js";
import { getSettings } from "../lib/settings.js";
import { dateFromStr, todayStr, toDateOnly } from "../lib/dates.js";

// Auto deteksi libur: untuk setiap (Mitra, Lapak) yang tidak setor & tidak
// mengisi libur manual pada hari tersebut, buat record libur otomatis.
export async function runAutoLeave(date?: Date): Promise<number> {
  const d = toDateOnly(date || dateFromStr(todayStr()));
  const next = new Date(d);
  next.setDate(next.getDate() + 1);

  const regs = await prisma.mitraLapak.findMany({
    where: { status: "ACTIVE" },
    include: { mitra: { select: { status: true } } },
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
    try {
      await prisma.leave.create({
        data: { mitraId: reg.mitraId, lapakId: reg.lapakId, leaveDate: d, source: "AUTO" },
      });
      created++;
    } catch (e) {
      // unique constraint race - ignore
    }
  }
  return created;
}

export function startAutoLeaveJob() {
  cron.schedule("30 6 * * *", async () => {
    try {
      const settings = await getSettings();
      const created = await runAutoLeave();
      console.log(`[auto-leave] ${new Date().toISOString()} dibuat ${created} libur otomatis`);
    } catch (e) {
      console.error("[auto-leave] error:", e);
    }
  });
  console.log("[auto-leave] job terjadwal pada 06:30 setiap hari");
}
