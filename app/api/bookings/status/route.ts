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
  return db.prepare(`SELECT id, service, customer_name, phone, email, pickup, destination,
    preferred_date, preferred_time, notes, photo_count, status, created_at
    FROM bookings WHERE id = ? AND access_token_hash = ? LIMIT 1`)
    .bind(id, accessTokenHash).first<BookingRow>();
}

function response(booking: BookingRow) {
  return Response.json({
    booking: {
      id: booking.id,
      service: booking.service,
      customer_name: booking.customer_name,
      pickup: booking.pickup,
      destination: booking.destination,
      preferred_date: booking.preferred_date,
      preferred_time: booking.preferred_time,
      notes: booking.notes,
      photo_count: booking.photo_count,
      status: booking.status,
      created_at: booking.created_at,
    },
  }, { headers: { "Cache-Control": "no-store" } });
}

function notificationPayload(booking: BookingRow): BookingNotificationPayload {
  return {
    service: booking.service,
    name: booking.customer_name,
    phone: booking.phone,
    email: booking.email,
    pickup: booking.pickup,
    destination: booking.destination,
    date: booking.preferred_date,
    time: booking.preferred_time,
    notes: booking.notes,
  };
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Invalid origin" }, { status: 403 });
  const { env } = await import("cloudflare:workers");
  const body = await request.json().catch(() => ({})) as Record<string, unknown>;
  const id = text(body.id, 20).toUpperCase();
  const key = text(body.key, 64).toLowerCase();
  const booking = await findBooking(env.DB, id, key);
  if (!booking) return Response.json({ error: "Booking not found" }, { status: 404, headers: { "Cache-Control": "no-store" } });
  return response(booking);
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

  let action: "modify" | "cancel";
  if (body.action === "cancel") {
    action = "cancel";
    await env.DB.prepare("UPDATE bookings SET status = 'cancelled' WHERE id = ?").bind(id).run();
  } else if (body.action === "modify") {
    action = "modify";
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
  } else {
    return Response.json({ error: "Unknown action" }, { status: 400 });
  }

  const updated = await findBooking(env.DB, id, key);
  if (!updated) return Response.json({ error: "Booking not found" }, { status: 404 });

  const notificationStatus = await sendBookingStatusNotification(
    env as typeof env & NotificationEnv,
    id,
    action,
    notificationPayload(updated),
  );
  await env.DB.prepare("UPDATE bookings SET notification_status = ? WHERE id = ?")
    .bind(`${action}_${notificationStatus}`, id).run();

  return response(updated);
}
