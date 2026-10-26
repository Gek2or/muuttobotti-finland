import { ensureBookingSchema } from "../bookings/schema";
import { ensureAvailabilitySchema } from "./schema";
import { addBookingDays, helsinkiNow, validBookingDate } from "../../booking-window";

function noStore(payload: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("Cache-Control", "no-store, max-age=0");
  return Response.json(payload, { ...init, headers });
}

export async function GET(request: Request) {
  const { env } = await import("cloudflare:workers");
  if (!env.DB) return noStore({ ok: true, fullDays: [], blocks: [], bookedStarts: [], db: false });

  const url = new URL(request.url);
  const today = helsinkiNow().date;
  const maxDate = addBookingDays(today, 180);
  const requestedFrom = url.searchParams.get("from") || "";
  const requestedTo = url.searchParams.get("to") || "";
  const from = validBookingDate(requestedFrom) && requestedFrom >= today && requestedFrom <= maxDate ? requestedFrom : today;
  const to = validBookingDate(requestedTo) && requestedTo >= from && requestedTo <= maxDate ? requestedTo : maxDate;

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
