export function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

export function toDateOnly(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function dateStr(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function dateFromStr(str: string): Date {
  const [y, m, d] = str.split("-").map((n) => parseInt(n, 10));
  return new Date(y, (m || 1) - 1, d || 1);
}

export function todayStr(): string {
  return dateStr(new Date());
}

export function formatDateTime(date: Date): string {
  return `${dateStr(date)} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function monthKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
}
