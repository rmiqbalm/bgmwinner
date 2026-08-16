export function parseTime(value: string): { hour: number; minute: number } {
  const [h, m] = value.split(":").map((n) => parseInt(n, 10));
  return { hour: isNaN(h) ? 0 : h, minute: isNaN(m) ? 0 : m };
}

export function toMinutes(time: { hour: number; minute: number }): number {
  return time.hour * 60 + time.minute;
}

export function nowMinutes(date = new Date()): number {
  return date.getHours() * 60 + date.getMinutes();
}

export function isBetween(now: number, start: string, end: string): boolean {
  const s = toMinutes(parseTime(start));
  const e = toMinutes(parseTime(end));
  return now >= s && now <= e;
}

export function isAfter(now: number, time: string): boolean {
  return now > toMinutes(parseTime(time));
}
