import { packBookingNotes, unpackBookingNotes } from "../booking-notes";
import {
  sendBookingStatusNotification,
  type BookingNotificationPayload,
  type NotificationEnv,
} from "../notifications";

type BookingRow = {
  id: string;
  service: string;
  customer_name: string;
  phone: string;
  email: string;
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
const maxRequestSize = 8 * 1024;

function text(value: unknown, max = 300) {
  return String(value ?? "").trim().slice(0, max);
}

function singleLine(value: unknown, max = 300) {
  return text(value, max).replace(/[\u0000-\u001f\u007f]+/g, " ").replace(/\s+/g, " ").trim();
}

function helsinkiToday() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Helsinki",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const value = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
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

function requestAllowed(request: Request) {
  if (!sameOrigin(request)) return false;
  const contentLength = Number(request.headers.get("content-length") || 0);
  return !Number.isFinite(contentLength) || contentLength <= maxRequestSize;
}

async function findBooking(db: D1Database, id: string, key: string) {
  if (!validCredentials(id, key)) return null;
  const accessTokenHash = await hashAccessKey(key);
  return db.prepare(`SELECT id, service, customer_name, phone, email, pickup, destination,
    preferred_date, preferred_time, notes, photo_count, status, created_at
    FROM bookings WHERE id = ? AND access_token_hash = ? LIMIT 1`)
    .bind(id, accessTokenHash).first<BookingRow>();
}

function response(booking: BookingRow) {
  const noteParts = unpackBookingNotes(booking.notes);
  return Response.json({
    booking: {
      id: booking.id,
      service: booking.service,
      customer_name: booking.customer_name,
      pickup: booking.pickup,
      destination: booking.destination,
      preferred_date: booking.preferred_date,
      preferred_time: booking.preferred_time,
      notes: noteParts.customerNotes,
      photo_count: booking.photo_count,
      status: booking.status,
      created_at: booking.created_at,
    },
  }, { headers: { "Cache-Control": "no-store" } });
}

function notificationPayload(booking: BookingRow): BookingNotificationPayload {
  const noteParts = unpackBookingNotes(booking.notes);
  return {
    service: booking.service,
    name: booking.customer_name,
    phone: booking.phone,
    email: booking.email,
    pickup: booking.pickup,
    destination: booking.destination,
    date: booking.preferred_date,
    time: booking.preferred_time,
    notes: noteParts.customerNotes,
    estimate: noteParts.estimate,
    plan: noteParts.plan,
  };
}

export async function POST(request: Request) {
  if (!requestAllowed(request)) return Response.json({ error: "Invalid request" }, { status: 403, headers: { "Cache-Control": "no-store" } });
  const { env } = await import("cloudflare:workers");
  const body = await request.json().catch(() => ({})) as Record<string, unknown>;
  const id = singleLine(body.id, 20).toUpperCase();
  const key = singleLine(body.key, 64).toLowerCase();
  const booking = await findBooking(env.DB, id, key);
  if (!booking) return Response.json({ error: "Booking not found" }, { status: 404, headers: { "Cache-Control": "no-store" } });
  return response(booking);
}

export async function PATCH(request: Request) {
  if (!requestAllowed(request)) return Response.json({ error: "Invalid request" }, { status: 403, headers: { "Cache-Control": "no-store" } });
  const { env } = await import("cloudflare:workers");
  const body = await request.json().catch(() => ({})) as Record<string, unknown>;
  const id = singleLine(body.id, 20).toUpperCase();
  const key = singleLine(body.key, 64).toLowerCase();
  const booking = await findBooking(env.DB, id, key);
  if (!booking) return Response.json({ error: "Booking not found" }, { status: 404, headers: { "Cache-Control": "no-store" } });
  if (!editableStatuses.has(booking.status)) return Response.json({ error: "Booking can no longer be changed online" }, { status: 409, headers: { "Cache-Control": "no-store" } });

  let action: "modify" | "cancel";
  if (body.action === "cancel") {
    action = "cancel";
    await env.DB.prepare("UPDATE bookings SET status = 'cancelled' WHERE id = ?").bind(id).run();
  } else if (body.action === "modify") {
    action = "modify";
    const pickup = singleLine(body.pickup);
    const destination = singleLine(body.destination);
    const date = singleLine(body.date, 20);
    const time = singleLine(body.time, 20);
    const customerNotes = text(body.notes, 1600);
    if (!pickup || !destination || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
      return Response.json({ error: "Invalid booking details" }, { status: 400, headers: { "Cache-Control": "no-store" } });
    }
    if (date < helsinkiToday()) {
      return Response.json({ error: "Booking date is in the past" }, { status: 400, headers: { "Cache-Control": "no-store" } });
    }

    const originalNotes = unpackBookingNotes(booking.notes);
    const storedNotes = packBookingNotes(originalNotes.estimate, originalNotes.plan, customerNotes);
    await env.DB.prepare(`UPDATE bookings SET pickup = ?, destination = ?, preferred_date = ?,
      preferred_time = ?, notes = ?, status = 'change_requested' WHERE id = ?`)
      .bind(pickup, destination, date, time, storedNotes, id).run();
  } else {
    return Response.json({ error: "Unknown action" }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }

  const updated = await findBooking(env.DB, id, key);
  if (!updated) return Response.json({ error: "Booking not found" }, { status: 404, headers: { "Cache-Control": "no-store" } });

  const notificationStatus = await sendBookingStatusNotification(
    env as typeof env & NotificationEnv,
    id,
    action,
    notificationPayload(updated),
  );
  try {
    await env.DB.prepare("UPDATE bookings SET notification_status = ? WHERE id = ?")
      .bind(`${action}_${notificationStatus}`, id).run();
  } catch {
    // The requested booking change is already persisted. Notification bookkeeping
    // must not turn a successful customer action into a retryable error.
  }

  return response(updated);
}
