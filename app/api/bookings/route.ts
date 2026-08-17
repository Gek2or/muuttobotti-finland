import { packBookingNotes } from "./booking-notes";
import {
  sendBookingCreatedNotification,
  sendCustomerBookingConfirmation,
  type BookingLocale,
  type BookingNotificationPayload,
  type NotificationEnv,
} from "./notifications";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const allowedServices = new Set(["moving", "transport", "cleaning", "windows", "assembly", "junk"]);
const maxFileSize = 8 * 1024 * 1024;
const maxRequestSize = 45 * 1024 * 1024;

function field(data: FormData, name: string, max = 300) {
  return String(data.get(name) ?? "").trim().slice(0, max);
}

function singleLineField(data: FormData, name: string, max = 300) {
  return field(data, name, max).replace(/[\u0000-\u001f\u007f]+/g, " ").replace(/\s+/g, " ").trim();
}

function safeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-100) || "photo.jpg";
}

function requestLocale(request: Request): BookingLocale {
  try {
    const referer = request.headers.get("referer");
    const lang = referer ? new URL(referer).searchParams.get("lang") : null;
    return lang === "en" || lang === "uk" || lang === "ru" ? lang : "fi";
  } catch {
    return "fi";
  }
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

export async function POST(request: Request) {
  const { env } = await import("cloudflare:workers");
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== new URL(request.url).host) {
    return Response.json({ error: "Invalid origin" }, { status: 403 });
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (Number.isFinite(contentLength) && contentLength > maxRequestSize) {
    return Response.json({ error: "Request is too large" }, { status: 413 });
  }

  const data = await request.formData();
  if (field(data, "website", 100)) return Response.json({ ok: true }, { status: 201 });

  const calculatorEstimate = field(data, "calculator_estimate", 80);
  const calculatorPlan = field(data, "calculator_plan", 600);
  const customerNotes = field(data, "notes", 1600);
  const storedNotes = packBookingNotes(calculatorEstimate, calculatorPlan, customerNotes);

  const payload: BookingNotificationPayload = {
    service: singleLineField(data, "service", 50),
    name: singleLineField(data, "name", 100),
    phone: singleLineField(data, "phone", 50),
    email: singleLineField(data, "email", 160),
    pickup: singleLineField(data, "pickup", 300),
    destination: singleLineField(data, "destination", 300),
    date: singleLineField(data, "date", 20),
    time: singleLineField(data, "time", 20),
    notes: customerNotes,
    estimate: calculatorEstimate,
    plan: calculatorPlan,
  };

  if (!payload.service || !payload.name || !payload.phone || !payload.email || !payload.pickup || !payload.destination || !payload.date || !payload.time) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (!allowedServices.has(payload.service)) return Response.json({ error: "Invalid service" }, { status: 400 });
  if (!/^\S+@\S+\.\S+$/.test(payload.email)) return Response.json({ error: "Invalid email" }, { status: 400 });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(payload.date) || !/^\d{2}:\d{2}$/.test(payload.time)) {
    return Response.json({ error: "Invalid schedule" }, { status: 400 });
  }
  if (payload.date < helsinkiToday()) {
    return Response.json({ error: "Booking date is in the past" }, { status: 400 });
  }

  const files = data.getAll("photos").filter((item): item is File => item instanceof File && item.size > 0);
  if (files.length > 5 || files.some(file => file.size > maxFileSize || !allowedTypes.has(file.type))) {
    return Response.json({ error: "Invalid upload" }, { status: 400 });
  }

  const db = env.DB;
  await db.prepare(`CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY, service TEXT NOT NULL, customer_name TEXT NOT NULL,
    phone TEXT NOT NULL, email TEXT NOT NULL, pickup TEXT NOT NULL,
    destination TEXT NOT NULL, preferred_date TEXT NOT NULL, preferred_time TEXT NOT NULL,
    notes TEXT NOT NULL DEFAULT '', photo_count INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'new', access_token_hash TEXT,
    notification_status TEXT NOT NULL DEFAULT 'queued',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();

  const recent = await db.prepare(
    "SELECT COUNT(*) AS count FROM bookings WHERE created_at >= datetime('now', '-10 minutes') AND (lower(email) = lower(?) OR phone = ?)"
  ).bind(payload.email, payload.phone).first<{ count: number }>();
  if ((recent?.count ?? 0) >= 3) {
    return Response.json(
      { error: "Too many booking attempts" },
      { status: 429, headers: { "Retry-After": "600", "Cache-Control": "no-store" } },
    );
  }

  const id = `MB-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  const accessKey = crypto.randomUUID().replaceAll("-", "");
  const accessTokenHash = await hashAccessKey(accessKey);
  await db.prepare("INSERT INTO bookings (id, service, customer_name, phone, email, pickup, destination, preferred_date, preferred_time, notes, photo_count, access_token_hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .bind(id, payload.service, payload.name, payload.phone, payload.email, payload.pickup, payload.destination, payload.date, payload.time, storedNotes, files.length, accessTokenHash).run();

  const objectKeys = files.map((file, index) => `bookings/${id}/${index + 1}-${safeFileName(file.name)}`);
  try {
    await Promise.all(files.map((file, index) => env.BUCKET.put(
      objectKeys[index],
      file.stream(),
      { httpMetadata: { contentType: file.type }, customMetadata: { bookingId: id } },
    )));
  } catch {
    await Promise.allSettled([
      objectKeys.length ? env.BUCKET.delete(objectKeys) : Promise.resolve(),
      db.prepare("DELETE FROM bookings WHERE id = ?").bind(id).run(),
    ]);
    return Response.json({ error: "Photo upload failed" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }

  const trackingPath = `/track#id=${encodeURIComponent(id)}&key=${encodeURIComponent(accessKey)}`;
  const trackingUrl = new URL(trackingPath, request.url).toString();
  const notificationEnv = env as typeof env & NotificationEnv;
  const [adminStatus, customerStatus] = await Promise.all([
    sendBookingCreatedNotification(notificationEnv, id, payload, files.length),
    sendCustomerBookingConfirmation(notificationEnv, id, payload, requestLocale(request), trackingUrl),
  ]);
  try {
    await db.prepare("UPDATE bookings SET notification_status = ? WHERE id = ?")
      .bind(`admin_${adminStatus}_customer_${customerStatus}`, id).run();
  } catch {
    // The booking is already safely persisted. Notification bookkeeping must never
    // turn a successful booking into a client-visible failure and duplicate retry.
  }

  return Response.json(
    { ok: true, bookingId: id, accessKey, trackingPath },
    { status: 201, headers: { "Cache-Control": "no-store" } },
  );
}
