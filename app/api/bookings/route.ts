const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxFileSize = 8 * 1024 * 1024;

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

export async function POST(request: Request) {
  const { env } = await import("cloudflare:workers");
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== new URL(request.url).host) {
    return Response.json({ error: "Invalid origin" }, { status: 403 });
  }

  const data = await request.formData();
  if (field(data, "website", 100)) return Response.json({ ok: true }, { status: 201 });

  const calculatorEstimate = field(data, "calculator_estimate", 80);
  const calculatorPlan = field(data, "calculator_plan", 600);
  const customerNotes = field(data, "notes", 1600);
  const calculatorNotes = [
    calculatorEstimate ? `Muuttobotti AI estimate: ${calculatorEstimate}` : "",
    calculatorPlan ? `Calculated plan: ${calculatorPlan}` : "",
  ].filter(Boolean).join("\n");

  const payload = {
    service: field(data, "service", 50), name: field(data, "name", 100),
    phone: field(data, "phone", 50), email: field(data, "email", 160),
    pickup: field(data, "pickup", 300), destination: field(data, "destination", 300),
    date: field(data, "date", 20), time: field(data, "time", 20),
    notes: [calculatorNotes, customerNotes].filter(Boolean).join("\n\n").slice(0, 2000),
  };

  if (!payload.service || !payload.name || !payload.phone || !payload.email || !payload.pickup || !payload.destination || !payload.date || !payload.time) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (!/^\S+@\S+\.\S+$/.test(payload.email)) return Response.json({ error: "Invalid email" }, { status: 400 });

  const files = data.getAll("photos").filter((item): item is File => item instanceof File && item.size > 0);
  if (files.length > 5 || files.some(file => file.size > maxFileSize || !allowedTypes.has(file.type))) {
    return Response.json({ error: "Invalid upload" }, { status: 400 });
  }

  const id = `MB-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  const accessKey = crypto.randomUUID().replaceAll("-", "");
  const accessTokenHash = await hashAccessKey(accessKey);
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
  await db.prepare("INSERT INTO bookings (id, service, customer_name, phone, email, pickup, destination, preferred_date, preferred_time, notes, photo_count, access_token_hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .bind(id, payload.service, payload.name, payload.phone, payload.email, payload.pickup, payload.destination, payload.date, payload.time, payload.notes, files.length, accessTokenHash).run();

  await Promise.all(files.map((file, index) => env.BUCKET.put(
    `bookings/${id}/${index + 1}-${safeFileName(file.name)}`,
    file.stream(),
    { httpMetadata: { contentType: file.type }, customMetadata: { bookingId: id } },
  )));

  return Response.json(
    { ok: true, bookingId: id, accessKey, trackingPath: `/track#id=${encodeURIComponent(id)}&key=${encodeURIComponent(accessKey)}` },
    { status: 201, headers: { "Cache-Control": "no-store" } },
  );
}
