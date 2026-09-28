export const BOOKING_WINDOW_DAYS = 180;
export const BOOKING_TIME_ZONE = "Europe/Helsinki";

function dateKeyFromParts(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function validDateKey(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day;
}

function addDaysKey(value: string, days: number) {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return dateKeyFromParts(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
}

function helsinkiNow(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: BOOKING_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);

  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return {
    date: dateKeyFromParts(Number(values.year), Number(values.month), Number(values.day)),
    minutes: Number(values.hour) * 60 + Number(values.minute),
  };
}

function weekday(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

function openingMinutes(value: string) {
  const day = weekday(value);
  if (day === 0) return { open: 12 * 60, close: 18 * 60 };
  if (day === 6) return { open: 8 * 60, close: 23 * 60 };
  return { open: 8 * 60, close: 22 * 60 + 30 };
}

function timeMinutes(value: string) {
  if (!/^\d{2}:\d{2}$/.test(value)) return null;
  const [hour, minute] = value.split(":").map(Number);
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return hour * 60 + minute;
}

export function bookingWindowBounds(now = new Date()) {
  const current = helsinkiNow(now);
  return { today: current.date, maxDate: addDaysKey(current.date, BOOKING_WINDOW_DAYS) };
}

export function isBookableStart(date: string, time: string, now = new Date()) {
  if (!validDateKey(date)) return false;
  const minute = timeMinutes(time);
  if (minute === null) return false;

  const current = helsinkiNow(now);
  const maxDate = addDaysKey(current.date, BOOKING_WINDOW_DAYS);
  if (date < current.date || date > maxDate) return false;

  const hours = openingMinutes(date);
  if (minute < hours.open || minute >= hours.close) return false;
  if (date === current.date && minute <= current.minutes) return false;

  return true;
}

export function bookingStartSlots(date: string) {
  if (!validDateKey(date)) return [] as string[];
  const { open, close } = openingMinutes(date);
  const slots: string[] = [];
  for (let minute = open; minute < close; minute += 30) {
    slots.push(`${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`);
  }
  return slots;
}
