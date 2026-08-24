import { ensureBookingSchema } from "./schema";

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

type Recommendation = {
  level: "normal" | "attention" | "high";
  text: string;
};

function numberValue(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseSnapshot(raw: string): Record<string, any> | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw);
    return value && typeof value === "object" ? value as Record<string, any> : null;
  } catch {
    return null;
  }
}

function buildRecommendation(payload: BookingPayload, snapshot: Record<string, any> | null): Recommendation {
  const advice: string[] = [];
  let score = 0;
  const service = payload.service;
  const notesLower = payload.notes.toLowerCase();

  if (service === "moving") {
    const data = snapshot?.moving ?? {};
    const movers = numberValue(data.movers, 0);
    const size = numberValue(data.sizeM2, 0);
    const floor = numberValue(data.floor, 0);
    const distance = numberValue(data.distanceKm, 0);
    const elevator = Boolean(data.elevator);
    const packing = Boolean(data.packing);
    const afterClean = Boolean(data.afterClean);

    if (movers === 1 && size >= 45) {
      score += size >= 80 ? 2 : 1;
      advice.push(`Предложить 2 грузчиков: площадь ${size} м², с одним человеком работа заметно дольше.`);
    }
    if (!elevator && floor >= 2) {
      score += floor >= 4 ? 2 : 1;
      advice.push(`Нет лифта, этаж ${floor}: уточнить тяжёлые предметы и доступ по лестнице.`);
    }
    if (distance >= 80) {
      score += 1;
      advice.push(`Дальний маршрут ${distance} км: подтвердить оба адреса, время выезда и рассмотреть предоплату.`);
    }
    if (packing) advice.push("Клиент выбрал упаковку: уточнить количество коробок и объём хрупких вещей.");
    if (afterClean) advice.push("Есть muuttosiivous: подтвердить, когда помещение освободится и что входит в уборку.");
    if (!advice.length) advice.push("Стандартный переезд: подтвердить объём, парковку и наличие крупных/тяжёлых предметов.");
  } else if (service === "transport") {
    const data = snapshot?.transport ?? {};
    const distance = numberValue(data.distanceKm, 0);
    const weight = numberValue(data.weightKg, 0);
    const express = Boolean(data.express);

    if (weight > 120) {
      score += weight >= 250 ? 2 : 1;
      advice.push(`Груз около ${weight} кг: проверить габариты и нужен ли второй грузчик/тележка.`);
    }
    if (distance >= 80) {
      score += 1;
      advice.push(`Дистанция ${distance} км: подтвердить маршрут, ожидание и рассмотреть предоплату.`);
    }
    if (express) {
      score += 1;
      advice.push("Express-заказ: связаться с клиентом как можно быстрее и подтвердить доступность Crafter.");
    }
    if (!advice.length) advice.push("Обычная перевозка: уточнить размеры груза, помощь при погрузке и парковку у обоих адресов.");
  } else if (service === "cleaning") {
    const data = snapshot?.cleaning ?? {};
    const size = numberValue(data.sizeM2, 0);
    const windows = numberValue(data.windows, 0);
    const cleanType = String(data.cleanType ?? "regular");

    if (size >= 100) {
      score += 1;
      advice.push(`Большая площадь ${size} м²: проверить объём работ и рассмотреть второго уборщика.`);
    }
    if (cleanType === "moveout" || cleanType === "deep") {
      score += 1;
      advice.push("Уточнить состояние кухни/ванной, духовки, холодильника и шкафов — это влияет на длительность.");
    }
    if (windows >= 10) advice.push(`Окон: ${windows}. Уточнить балконное остекление и доступ к высоким окнам.`);
    if (!advice.length) advice.push("Стандартная уборка: подтвердить площадь, состояние помещения и доступ к воде/электричеству.");
  } else {
    advice.push("Уточнить объём услуги, доступ к объекту, длительность и подтвердить финальную цену до начала работ.");
  }

  if (/heavy|painava|raskas|тяж|важк/i.test(notesLower)) {
    score += 1;
    advice.push("В комментарии упомянут тяжёлый предмет — обязательно уточнить вес/габариты и количество работников.");
  }

  const quotedPrice = numberValue(snapshot?.quotedPrice, 0);
  const quotedDuration = String(snapshot?.quotedDuration ?? "");
  if (quotedPrice > 0) advice.push(`Расчёт клиента: ${quotedPrice} €${quotedDuration ? ` / ${quotedDuration}` : ""}. Финальную цену подтвердить до выезда.`);

  return {
    level: score >= 3 ? "high" : score >= 1 ? "attention" : "normal",
    text: advice.map(item => `• ${item}`).join("\n"),
  };
}

function textFromCf(cf: Record<string, unknown>, key: string) {
  const value = cf[key];
  return value === null || value === undefined ? "" : String(value).slice(0, 180);
}

function requestMetadata(request: Request, data: FormData) {
  const cf = ((request as Request & { cf?: Record<string, unknown> }).cf ?? {}) as Record<string, unknown>;
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
  return {
    clientIp: (request.headers.get("cf-connecting-ip") || forwarded).slice(0, 80),
    userAgent: (request.headers.get("user-agent") || "").slice(0, 1000),
    country: (request.headers.get("cf-ipcountry") || textFromCf(cf, "country")).slice(0, 80),
    region: textFromCf(cf, "region"),
    city: textFromCf(cf, "city"),
    asn: textFromCf(cf, "asn"),
    colo: textFromCf(cf, "colo"),
    referer: field(data, "referer", 1000) || (request.headers.get("referer") || "").slice(0, 1000),
    pageUrl: field(data, "page_url", 1000),
    locale: field(data, "client_locale", 20),
    timezone: field(data, "client_timezone", 100),
    screenSize: field(data, "client_screen", 100),
    utmSource: field(data, "utm_source", 160),
    utmMedium: field(data, "utm_medium", 160),
    utmCampaign: field(data, "utm_campaign", 160),
  };
}

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
  const calculatorSnapshotRaw = field(data, "calculator_snapshot", 6000);
  const calculatorSnapshot = parseSnapshot(calculatorSnapshotRaw);
  const recommendation = buildRecommendation(payload, calculatorSnapshot);
  const meta = requestMetadata(request, data);

  try {
    await ensureBookingSchema(db);

    await db.prepare(`INSERT INTO bookings (
      id, service, customer_name, phone, email, pickup, destination,
      preferred_date, preferred_time, notes, photo_count, access_token_hash,
      calculator_snapshot, recommendation, recommendation_level,
      client_ip, user_agent, client_country, client_region, client_city, client_asn, cf_colo,
      referer, page_url, locale, timezone, screen_size, utm_source, utm_medium, utm_campaign
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(
        id, payload.service, payload.name, payload.phone, payload.email, payload.pickup, payload.destination,
        payload.date, payload.time, payload.notes, storedPhotoCount, accessTokenHash,
        calculatorSnapshotRaw, recommendation.text, recommendation.level,
        meta.clientIp, meta.userAgent, meta.country, meta.region, meta.city, meta.asn, meta.colo,
        meta.referer, meta.pageUrl, meta.locale, meta.timezone, meta.screenSize,
        meta.utmSource, meta.utmMedium, meta.utmCampaign,
      ).run();

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
