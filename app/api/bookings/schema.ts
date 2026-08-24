export const BOOKING_TABLE_SQL = `CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  service TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  pickup TEXT NOT NULL,
  destination TEXT NOT NULL,
  preferred_date TEXT NOT NULL,
  preferred_time TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  photo_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'new',
  access_token_hash TEXT,
  notification_status TEXT NOT NULL DEFAULT 'queued',
  calculator_snapshot TEXT NOT NULL DEFAULT '',
  recommendation TEXT NOT NULL DEFAULT '',
  recommendation_level TEXT NOT NULL DEFAULT 'normal',
  client_ip TEXT NOT NULL DEFAULT '',
  user_agent TEXT NOT NULL DEFAULT '',
  client_country TEXT NOT NULL DEFAULT '',
  client_region TEXT NOT NULL DEFAULT '',
  client_city TEXT NOT NULL DEFAULT '',
  client_asn TEXT NOT NULL DEFAULT '',
  cf_colo TEXT NOT NULL DEFAULT '',
  referer TEXT NOT NULL DEFAULT '',
  page_url TEXT NOT NULL DEFAULT '',
  locale TEXT NOT NULL DEFAULT '',
  timezone TEXT NOT NULL DEFAULT '',
  screen_size TEXT NOT NULL DEFAULT '',
  utm_source TEXT NOT NULL DEFAULT '',
  utm_medium TEXT NOT NULL DEFAULT '',
  utm_campaign TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)`;

const COLUMN_ADDITIONS: Array<[string, string]> = [
  ["notes", "notes TEXT NOT NULL DEFAULT ''"],
  ["photo_count", "photo_count INTEGER NOT NULL DEFAULT 0"],
  ["status", "status TEXT NOT NULL DEFAULT 'new'"],
  ["access_token_hash", "access_token_hash TEXT"],
  ["notification_status", "notification_status TEXT NOT NULL DEFAULT 'queued'"],
  ["calculator_snapshot", "calculator_snapshot TEXT NOT NULL DEFAULT ''"],
  ["recommendation", "recommendation TEXT NOT NULL DEFAULT ''"],
  ["recommendation_level", "recommendation_level TEXT NOT NULL DEFAULT 'normal'"],
  ["client_ip", "client_ip TEXT NOT NULL DEFAULT ''"],
  ["user_agent", "user_agent TEXT NOT NULL DEFAULT ''"],
  ["client_country", "client_country TEXT NOT NULL DEFAULT ''"],
  ["client_region", "client_region TEXT NOT NULL DEFAULT ''"],
  ["client_city", "client_city TEXT NOT NULL DEFAULT ''"],
  ["client_asn", "client_asn TEXT NOT NULL DEFAULT ''"],
  ["cf_colo", "cf_colo TEXT NOT NULL DEFAULT ''"],
  ["referer", "referer TEXT NOT NULL DEFAULT ''"],
  ["page_url", "page_url TEXT NOT NULL DEFAULT ''"],
  ["locale", "locale TEXT NOT NULL DEFAULT ''"],
  ["timezone", "timezone TEXT NOT NULL DEFAULT ''"],
  ["screen_size", "screen_size TEXT NOT NULL DEFAULT ''"],
  ["utm_source", "utm_source TEXT NOT NULL DEFAULT ''"],
  ["utm_medium", "utm_medium TEXT NOT NULL DEFAULT ''"],
  ["utm_campaign", "utm_campaign TEXT NOT NULL DEFAULT ''"],
];

export async function ensureBookingSchema(db: any) {
  await db.prepare(BOOKING_TABLE_SQL).run();
  const schemaInfo = await db.prepare("PRAGMA table_info(bookings)").all();
  const rows = (schemaInfo.results ?? []) as Array<{ name?: string }>;
  const columns = new Set(rows.map(row => String(row.name ?? "")));

  for (const [name, sql] of COLUMN_ADDITIONS) {
    if (!columns.has(name)) {
      await db.prepare(`ALTER TABLE bookings ADD COLUMN ${sql}`).run();
    }
  }
}
