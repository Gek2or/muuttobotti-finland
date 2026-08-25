import { appendBookingEvent, getBookingEvents } from "../schema";

type BookingRow = {
  id: string;
  service: string;
  customer_name: string;
  pickup: string;
  destination: string;
  preferred_date: string;
  preferred_time: string;
  notes: string;
  photo_count: number;
  status: string;
  created_at: string;
};

const editableStatuses = new Set(["new", "confirmed", "assigned", "change_requested"]);

function text(value: unknown, max = 300) {
  return String(value ?? "").trim().slice(0, max);
}

async function hashAccessKey(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
}

function validCredentials(id: string, key: string) {
  return /^MB-[A-F0-9]{8}$/.test(id) && /^[a-f0-9]{32}$/.test(key);
}

function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return !origin || new URL(origin).host === new URL(request.url).host;
}

async function findBooking(db: D1Database, id: string, key: string) {
  if (!validCredentials(id, key)) return null;
  const accessTokenHash = await hashAccessKey(key);
  return db.prepare(`SELECT id, service, customer_name, pickup, destination,
    preferred_date, preferred_time, notes, photo_count, status, created_at
    FROM bookings WHERE id = ? AND access_token_hash = ? LIMIT 1`)
    .bind(id, accessTokenHash).first<BookingRow>();
}

async function response(db: D1Database, booking: BookingRow) {
  const storedEvents = await getBookingEvents(db, booking.id) as Array<Record<string, unknown>>;
  const createdEvent = {
    event_id: 0,
    booking_id: booking.id,
    status: "new",
    event_type: "created",
    source: "client",
    note: "Booking created",
    created_at: booking.created_at,
  };
  const hasCreatedEvent = storedEvents.some(event => event.event_type === "created");
  const events = hasCreatedEvent ? storedEvents : [createdEvent, ...storedEvents];
  return Response.json({ booking, events }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Invalid origin" }, { status: 403 });
  const { env } = await import("cloudflare:workers");
  const body = await request.json().catch(() => ({})) as Record<string, unknown>;
  const id = text(body.id, 20).toUpperCase();
  const key = text(body.key, 64).toLowerCase();
  const booking = await findBooking(env.DB, id, key);
  if (!booking) return Response.json({ error: "Booking not found" }, { status: 404, headers: { "Cache-Control": "no-store" } });
  return response(env.DB, booking);
}

export async function PATCH(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Invalid origin" }, { status: 403 });
  const { env } = await import("cloudflare:workers");
  const body = await request.json().catch(() => ({})) as Record<string, unknown>;
  const id = text(body.id, 20).toUpperCase();
  const key = text(body.key, 64).toLowerCase();
  const booking = await findBooking(env.DB, id, key);
  if (!booking) return Response.json({ error: "Booking not found" }, { status: 404 });
  if (!editableStatuses.has(booking.status)) return Response.json({ error: "Booking can no longer be changed online" }, { status: 409 });

  if (body.action === "cancel") {
    await env.DB.prepare("UPDATE bookings SET status = 'cancelled' WHERE id = ?").bind(id).run();
    await appendBookingEvent(env.DB, id, "cancelled", "status", "client", "Client cancelled booking");
  } else if (body.action === "modify") {
    const pickup = text(body.pickup);
    const destination = text(body.destination);
    const date = text(body.date, 20);
    const time = text(body.time, 20);
    const notes = text(body.notes, 2000);
    if (!pickup || !destination || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
      return Response.json({ error: "Invalid booking details" }, { status: 400 });
    }
    await env.DB.prepare(`UPDATE bookings SET pickup = ?, destination = ?, preferred_date = ?,
      preferred_time = ?, notes = ?, status = 'change_requested' WHERE id = ?`)
      .bind(pickup, destination, date, time, notes, id).run();
    await appendBookingEvent(env.DB, id, "change_requested", "change", "client", "Client requested booking changes");
  } else {
    return Response.json({ error: "Unknown action" }, { status: 400 });
  }

  const updated = await findBooking(env.DB, id, key);
  return updated ? response(env.DB, updated) : Response.json({ error: "Booking not found" }, { status: 404 });
}
