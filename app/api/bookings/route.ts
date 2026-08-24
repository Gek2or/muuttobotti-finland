const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxFileSize = 8 * 1024 * 1024;
const WHATSAPP_NUMBER = "3584578767567";

function field(data: FormData, name: string, max = 300) {
  return String(data.get(name) ?? "").trim().slice(0, max);
}

function safeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-100) || "photo.jpg";
}

async function hashAccessKey(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
}

function isAllowedOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  let originHost = "";
  try {
    originHost = new URL(origin).host.toLowerCase();
  } catch {
    return false;
  }

  const requestHost = new URL(request.url).host.toLowerCase();
  const forwardedHost = (request.headers.get("x-forwarded-host") || "")
    .split(",")[0]
    .trim()
    .toLowerCase();
  const hostHeader = (request.headers.get("host") || "").toLowerCase();

  const allowedHosts = new Set([
    requestHost,
    forwardedHost,
    hostHeader,
    "muuttobotti.fi",
    "www.muuttobotti.fi",
  ].filter(Boolean));

  return allowedHosts.has(originHost);
}

type BookingPayload = {
  service: string;
  name: string;
  phone: string;
  email: string;
  pickup: string;
  destination: string;
  date: string;
  time: string;
  notes: string;
};

function makeWhatsAppUrl(payload: BookingPayload, photoCount: number, draftId: string) {
  const lines = [
    "Muuttobotti – verkkovaraus",
    `Tunnus: ${draftId}`,
    `Palvelu: ${payload.service}`,
    `Nimi: ${payload.name}`,
    `Puhelin: ${payload.phone}`,
    `Sähköposti: ${payload.email}`,
    `Nouto / palveluosoite: ${payload.pickup}`,
    `Kohdeosoite: ${payload.destination}`,
    `Päivä: ${payload.date}`,
    `Aika: ${payload.time}`,
    payload.notes ? `Lisätiedot: ${payload.notes}` : "",
    photoCount > 0 ? `Kuvia valittu: ${photoCount} – liitä kuvat tähän WhatsApp-keskusteluun.` : "",
    "",
    "Verkkotallennus ei ollut juuri nyt käytettävissä, joten lähetän varauksen WhatsAppissa.",
  ].filter(Boolean);

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`;
}

function fallbackResponse(payload: BookingPayload, photoCount: number, code: string) {
  const draftId = `MB-WA-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
  return Response.json(
    {
      ok: false,
      fallback: "whatsapp",
      code,
      draftId,
      whatsappUrl: makeWhatsAppUrl(payload, photoCount, draftId),
    },
    { status: 202, headers: { "Cache-Control": "no-store" } },
  );
}

export async function GET() {
  const { env } = await import("cloudflare:workers");
  return Response.json(
    {
      ok: true,
      service: "bookings",
      db: Boolean(env.DB),
      bucket: Boolean(env.BUCKET),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  const { env } = await import("cloudflare:workers");

  if (!isAllowedOrigin(request)) {
    return Response.json({ error: "Invalid origin" }, { status: 403 });
  }

  const data = await request.formData();
  if (field(data, "website", 100)) return Response.json({ ok: true }, { status: 201 });

  const payload: BookingPayload = {
    service: field(data, "service", 50), name: field(data, "name", 100),
    phone: field(data, "phone", 50), email: field(data, "email", 160),
    pickup: field(data, "pickup", 300), destination: field(data, "destination", 300),
    date: field(data, "date", 20), time: field(data, "time", 20), notes: field(data, "notes", 2000),
  };

  if (!payload.service || !payload.name || !payload.phone || !payload.email || !payload.pickup || !payload.destination || !payload.date || !payload.time) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (!/^\S+@\S+\.\S+$/.test(payload.email)) return Response.json({ error: "Invalid email" }, { status: 400 });

  const files = data.getAll("photos").filter((item): item is File => item instanceof File && item.size > 0);
  if (files.length > 5 || files.some(file => file.size > maxFileSize || !allowedTypes.has(file.type))) {
    return Response.json({ error: "Invalid upload" }, { status: 400 });
  }

  if (!env.DB) {
    console.error("Booking API: Cloudflare D1 binding DB is unavailable; using WhatsApp fallback");
    return fallbackResponse(payload, files.length, "DB_UNAVAILABLE");
  }

  const id = `MB-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  const accessKey = crypto.randomUUID().replaceAll("-", "");
  const accessTokenHash = await hashAccessKey(accessKey);
  const db = env.DB;
  const canStorePhotos = Boolean(env.BUCKET);
  const storedPhotoCount = canStorePhotos ? files.length : 0;

  try {
    await db.prepare(`CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY, service TEXT NOT NULL, customer_name TEXT NOT NULL,
      phone TEXT NOT NULL, email TEXT NOT NULL, pickup TEXT NOT NULL,
      destination TEXT NOT NULL, preferred_date TEXT NOT NULL, preferred_time TEXT NOT NULL,
      notes TEXT NOT NULL DEFAULT '', photo_count INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'new', access_token_hash TEXT,
      notification_status TEXT NOT NULL DEFAULT 'queued',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`).run();

    const schemaInfo = await db.prepare("PRAGMA table_info(bookings)").all();
    const schemaRows = (schemaInfo.results ?? []) as Array<{ name?: string }>;
    const columns = new Set(schemaRows.map(row => String(row.name ?? "")));
    const additions: Array<[string, string]> = [
      ["notes", "notes TEXT NOT NULL DEFAULT ''"],
      ["photo_count", "photo_count INTEGER NOT NULL DEFAULT 0"],
      ["status", "status TEXT NOT NULL DEFAULT 'new'"],
      ["access_token_hash", "access_token_hash TEXT"],
      ["notification_status", "notification_status TEXT NOT NULL DEFAULT 'queued'"],
    ];

    for (const [name, sql] of additions) {
      if (!columns.has(name)) await db.prepare(`ALTER TABLE bookings ADD COLUMN ${sql}`).run();
    }

    await db.prepare("INSERT INTO bookings (id, service, customer_name, phone, email, pickup, destination, preferred_date, preferred_time, notes, photo_count, access_token_hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .bind(id, payload.service, payload.name, payload.phone, payload.email, payload.pickup, payload.destination, payload.date, payload.time, payload.notes, storedPhotoCount, accessTokenHash).run();

    if (files.length > 0 && env.BUCKET) {
      await Promise.all(files.map((file, index) => env.BUCKET.put(
        `bookings/${id}/${index + 1}-${safeFileName(file.name)}`,
        file.stream(),
        { httpMetadata: { contentType: file.type }, customMetadata: { bookingId: id } },
      )));
    }
  } catch (error) {
    console.error("Booking API storage failure; using WhatsApp fallback", error);
    return fallbackResponse(payload, files.length, "DB_WRITE_FAILED");
  }

  return Response.json(
    {
      ok: true,
      bookingId: id,
      accessKey,
      trackingPath: `/track#id=${encodeURIComponent(id)}&key=${encodeURIComponent(accessKey)}`,
      warning: files.length > 0 && !canStorePhotos ? "PHOTOS_NOT_STORED" : undefined,
    },
    { status: 201, headers: { "Cache-Control": "no-store" } },
  );
}
