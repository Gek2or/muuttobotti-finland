import { isAdminRequest, unauthorized } from "../admin-auth";
import { ensureBookingSchema } from "../../bookings/schema";
import { ensureAvailabilitySchema, validDate, validTime, timeToMinutes } from "../../availability/schema";

function noStore(payload: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("Cache-Control", "no-store");
  headers.set("X-Robots-Tag", "noindex, nofollow");
  return Response.json(payload, { ...init, headers });
}

function text(value: unknown, max = 300) {
  return String(value ?? "").trim().slice(0, max);
}

export async function GET(request: Request) {
  if (!(await isAdminRequest(request))) return unauthorized();
  const { env } = await import("cloudflare:workers");
  if (!env.DB) return noStore({ error: "DB_UNAVAILABLE" }, { status: 503 });
  await ensureAvailabilitySchema(env.DB);
  await ensureBookingSchema(env.DB);

  const blocks = await env.DB.prepare(`SELECT id, block_date, start_time, end_time, all_day, label, source, created_at
    FROM availability_blocks
    WHERE block_date >= date('now','-1 day')
    ORDER BY block_date ASC, all_day DESC, start_time ASC
    LIMIT 500`).all();

  const bookings = await env.DB.prepare(`SELECT id, service, customer_name, preferred_date, preferred_time, status
    FROM bookings
    WHERE preferred_date >= date('now','-1 day')
      AND status NOT IN ('completed','cancelled')
    ORDER BY preferred_date ASC, preferred_time ASC
    LIMIT 300`).all();

  return noStore({ ok: true, blocks: blocks.results ?? [], bookings: bookings.results ?? [] });
}

export async function POST(request: Request) {
  if (!(await isAdminRequest(request))) return unauthorized();
  const { env } = await import("cloudflare:workers");
  if (!env.DB) return noStore({ error: "DB_UNAVAILABLE" }, { status: 503 });
  await ensureAvailabilitySchema(env.DB);

  const body = await request.json().catch(() => ({})) as Record<string, unknown>;
  const date = text(body.date, 20);
  const allDay = body.allDay === true;
  const start = allDay ? "" : text(body.start, 5);
  const end = allDay ? "" : text(body.end, 5);
  const label = text(body.label, 160);

  if (!validDate(date)) return noStore({ error: "INVALID_DATE" }, { status: 400 });
  if (!allDay) {
    if (!validTime(start) || !validTime(end) || timeToMinutes(end) <= timeToMinutes(start)) {
      return noStore({ error: "INVALID_TIME_RANGE" }, { status: 400 });
    }
  }

  const id = `AV-${crypto.randomUUID().slice(0, 10).toUpperCase()}`;
  await env.DB.prepare(`INSERT INTO availability_blocks
    (id, block_date, start_time, end_time, all_day, label, source)
    VALUES (?, ?, ?, ?, ?, ?, 'admin')`)
    .bind(id, date, start, end, allDay ? 1 : 0, label).run();

  return noStore({ ok: true, block: { id, block_date: date, start_time: start, end_time: end, all_day: allDay ? 1 : 0, label } }, { status: 201 });
}

export async function DELETE(request: Request) {
  if (!(await isAdminRequest(request))) return unauthorized();
  const { env } = await import("cloudflare:workers");
  if (!env.DB) return noStore({ error: "DB_UNAVAILABLE" }, { status: 503 });
  await ensureAvailabilitySchema(env.DB);

  const url = new URL(request.url);
  const id = text(url.searchParams.get("id"), 40);
  if (!/^AV-[A-Z0-9-]{4,40}$/.test(id)) return noStore({ error: "INVALID_ID" }, { status: 400 });
  await env.DB.prepare("DELETE FROM availability_blocks WHERE id = ?").bind(id).run();
  return noStore({ ok: true });
}
