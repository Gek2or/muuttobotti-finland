import { ensureBookingSchema } from "../bookings/schema";
import { ensureAvailabilitySchema, validDate } from "./schema";

function noStore(payload: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("Cache-Control", "no-store, max-age=0");
  return Response.json(payload, { ...init, headers });
}

function addDays(date: string, days: number) {
  const [y, m, d] = date.split("-").map(Number);
  const value = new Date(Date.UTC(y, m - 1, d + days));
  return value.toISOString().slice(0, 10);
}

function todayUtc() {
  return new Date().toISOString().slice(0, 10);
}

export async function GET(request: Request) {
  const { env } = await import("cloudflare:workers");
  if (!env.DB) return noStore({ ok: true, fullDays: [], blocks: [], bookedStarts: [], db: false });

  const url = new URL(request.url);
  const fallbackFrom = todayUtc();
  const from = validDate(url.searchParams.get("from") || "") ? String(url.searchParams.get("from")) : fallbackFrom;
  let to = validDate(url.searchParams.get("to") || "") ? String(url.searchParams.get("to")) : addDays(from, 180);
  if (to < from) to = from;
  if (to > addDays(from, 240)) to = addDays(from, 240);

  await ensureAvailabilitySchema(env.DB);
  await ensureBookingSchema(env.DB);

  const blocksResult = await env.DB.prepare(`SELECT id, block_date, start_time, end_time, all_day
    FROM availability_blocks
    WHERE block_date BETWEEN ? AND ?
    ORDER BY block_date ASC, all_day DESC, start_time ASC`).bind(from, to).all();

  const bookingResult = await env.DB.prepare(`SELECT preferred_date, preferred_time
    FROM bookings
    WHERE preferred_date BETWEEN ? AND ?
      AND status IN ('confirmed','assigned','on_the_way','in_progress')
      AND preferred_time <> ''
    ORDER BY preferred_date ASC, preferred_time ASC`).bind(from, to).all();

  const blocks = (blocksResult.results ?? []) as Array<any>;
  const fullDays = Array.from(new Set(blocks.filter(item => Number(item.all_day) === 1).map(item => String(item.block_date))));
  const partial = blocks
    .filter(item => Number(item.all_day) !== 1)
    .map(item => ({ date: String(item.block_date), start: String(item.start_time), end: String(item.end_time) }));
  const bookedStarts = (bookingResult.results ?? []).map((item: any) => ({
    date: String(item.preferred_date),
    time: String(item.preferred_time).slice(0, 5),
  }));

  return noStore({ ok: true, db: true, from, to, fullDays, blocks: partial, bookedStarts });
}
