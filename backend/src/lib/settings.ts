import { prisma } from "./prisma.js";

export interface AppSettings {
  MITRA_SHARE: number;
  BGM_FEE: number;
  SELLING_PRICE: number;
  DEPOSIT_OPEN: string;
  DEPOSIT_CLOSE: string;
  STALL_CLOSE: string;
  AUTO_LEAVE_HOUR: string;
  WINDOW_ENFORCE: boolean;
}

const DEFAULTS: AppSettings = {
  MITRA_SHARE: 9000,
  BGM_FEE: 1000,
  SELLING_PRICE: 10000,
  DEPOSIT_OPEN: "05:00",
  DEPOSIT_CLOSE: "06:00",
  STALL_CLOSE: "12:00",
  AUTO_LEAVE_HOUR: "06:30",
  WINDOW_ENFORCE: false,
};

export async function getSettings(): Promise<AppSettings> {
  const rows = await prisma.setting.findMany();
  const map: Record<string, string> = {};
  for (const row of rows) map[row.key] = row.value;
  return {
    MITRA_SHARE: parseInt(map.MITRA_SHARE || String(DEFAULTS.MITRA_SHARE), 10),
    BGM_FEE: parseInt(map.BGM_FEE || String(DEFAULTS.BGM_FEE), 10),
    SELLING_PRICE: parseInt(map.SELLING_PRICE || String(DEFAULTS.SELLING_PRICE), 10),
    DEPOSIT_OPEN: map.DEPOSIT_OPEN || DEFAULTS.DEPOSIT_OPEN,
    DEPOSIT_CLOSE: map.DEPOSIT_CLOSE || DEFAULTS.DEPOSIT_CLOSE,
    STALL_CLOSE: map.STALL_CLOSE || DEFAULTS.STALL_CLOSE,
    AUTO_LEAVE_HOUR: map.AUTO_LEAVE_HOUR || DEFAULTS.AUTO_LEAVE_HOUR,
    WINDOW_ENFORCE: (map.WINDOW_ENFORCE || "false") === "true",
  };
}
