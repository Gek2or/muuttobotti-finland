/**
 * One source of truth for Muuttobotti booking start times.
 * Dates and hours always follow Finland, never the visitor's device timezone.
 * The last start is 30 minutes before the published closing time.
 */
export const BOOKING_TIME_ZONE = "Europe/Helsinki";
export const BOOKING_HORIZON_DAYS = 180;

export function validBookingDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() + 1 === month && date.getUTCDate() === day;
}

export function addBookingDays(value: string, days: number): string {
  if (!validBookingDate(value)) throw new Error("Invalid calendar date");
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

export function helsinkiNow(now: Date = new Date()): { date: string; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: BOOKING_TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(now);
  const part = (type: string) => Number(parts.find(item => item.type === type)?.value ?? 0);
  return {
    date: `${part("year")}-${String(part("month")).padStart(2, "0")}-${String(part("day")).padStart(2, "0")}`,
    minutes: part("hour") * 60 + part("minute"),
  };
}

export function workingHoursForDate(date: string): { open: number; close: number } | null {
  if (!validBookingDate(date)) return null;
  const [year, month, day] = date.split("-").map(Number);
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  if (weekday === 0) return { open: 12 * 60, close: 18 * 60 };
  if (weekday === 6) return { open: 8 * 60, close: 23 * 60 };
  return { open: 8 * 60, close: 22 * 60 + 30 };
}

export function isBookableStart(date: string, time: string, now: Date = new Date()): boolean {
  if (!validBookingDate(date) || !/^([01]\d|2[0-3]):(00|30)$/.test(time)) return false;
  const current = helsinkiNow(now);
  if (date < current.date || date > addBookingDays(current.date, BOOKING_HORIZON_DAYS)) return false;
  const hours = workingHoursForDate(date);
  if (!hours) return false;
  const [hour, minute] = time.split(":").map(Number);
  const start = hour * 60 + minute;
  return start >= hours.open && start + 30 <= hours.close && (date !== current.date || start > current.minutes);
}

export function availableStartTimes(date: string, now: Date = new Date()): string[] {
  const hours = workingHoursForDate(date);
  if (!hours) return [];
  const current = helsinkiNow(now);
  if (date < current.date || date > addBookingDays(current.date, BOOKING_HORIZON_DAYS)) return [];
  const times: string[] = [];
  for (let minute = hours.open; minute + 30 <= hours.close; minute += 30) {
    if (date === current.date && minute <= current.minutes) continue;
    times.push(`${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`);
  }
  return times;
}
