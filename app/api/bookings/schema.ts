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
  assigned_worker TEXT NOT NULL DEFAULT '',
  assigned_worker_phone TEXT NOT NULL DEFAULT '',
  quoted_price REAL NOT NULL DEFAULT 0,
  quote_status TEXT NOT NULL DEFAULT 'none',
  final_price REAL NOT NULL DEFAULT 0,
  actual_hours REAL NOT NULL DEFAULT 0,
  admin_note TEXT NOT NULL DEFAULT '',
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
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)`;

export const BOOKING_EVENTS_TABLE_SQL = `CREATE TABLE IF NOT EXISTS booking_events (
  event_id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_id TEXT NOT NULL,
  status TEXT NOT NULL,
  event_type TEXT NOT NULL DEFAULT 'status',
  source TEXT NOT NULL DEFAULT 'system',
  note TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)`;

export const PUSH_TOKENS_TABLE_SQL = `CREATE TABLE IF NOT EXISTS push_tokens (
  token TEXT PRIMARY KEY,
  booking_id TEXT NOT NULL DEFAULT '',
  platform TEXT NOT NULL DEFAULT '',
  locale TEXT NOT NULL DEFAULT 'fi',
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)`;

export const CLIENT_ACCOUNTS_TABLE_SQL = `CREATE TABLE IF NOT EXISTS client_accounts (
  email TEXT PRIMARY KEY,
  display_name TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  session_hash TEXT NOT NULL DEFAULT '',
  session_expires_at TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)`;

export const CLIENT_AUTH_CODES_TABLE_SQL = `CREATE TABLE IF NOT EXISTS client_auth_codes (
  email TEXT PRIMARY KEY,
  code_hash TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)`;

export const WORKERS_TABLE_SQL = `CREATE TABLE IF NOT EXISTS workers (
  worker_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
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
  ["assigned_worker", "assigned_worker TEXT NOT NULL DEFAULT ''"],
  ["assigned_worker_phone", "assigned_worker_phone TEXT NOT NULL DEFAULT ''"],
  ["quoted_price", "quoted_price REAL NOT NULL DEFAULT 0"],
  ["quote_status", "quote_status TEXT NOT NULL DEFAULT 'none'"],
  ["final_price", "final_price REAL NOT NULL DEFAULT 0"],
  ["actual_hours", "actual_hours REAL NOT NULL DEFAULT 0"],
  ["admin_note", "admin_note TEXT NOT NULL DEFAULT ''"],
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
  ["updated_at", "updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP"],
];

export async function ensureBookingSchema(db: any) {
  await db.prepare(BOOKING_TABLE_SQL).run();
  const schemaInfo = await db.prepare("PRAGMA table_info(bookings)").all();
  const rows = (schemaInfo.results ?? []) as Array<{ name?: string }>;
  const columns = new Set(rows.map(row => String(row.name ?? "")));

  for (const [name, sql] of COLUMN_ADDITIONS) {
    if (!columns.has(name)) await db.prepare(`ALTER TABLE bookings ADD COLUMN ${sql}`).run();
  }

  await db.prepare(BOOKING_EVENTS_TABLE_SQL).run();
  await db.prepare(PUSH_TOKENS_TABLE_SQL).run();
  await db.prepare(CLIENT_ACCOUNTS_TABLE_SQL).run();
  await db.prepare(CLIENT_AUTH_CODES_TABLE_SQL).run();
  await db.prepare(WORKERS_TABLE_SQL).run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_booking_events_booking_id ON booking_events(booking_id, event_id)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_bookings_email ON bookings(email, created_at)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_bookings_status_date ON bookings(status, preferred_date)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_push_tokens_booking ON push_tokens(booking_id, active)").run();
}

export async function appendBookingEvent(db: any, bookingId: string, status: string, eventType = "status", source = "system", note = "") {
  await ensureBookingSchema(db);
  await db.prepare(`INSERT INTO booking_events (booking_id, status, event_type, source, note) VALUES (?, ?, ?, ?, ?)`)
    .bind(bookingId, status, eventType, source, String(note || "").slice(0, 1000)).run();
}

export async function getBookingEvents(db: any, bookingId: string) {
  await ensureBookingSchema(db);
  const result = await db.prepare(`SELECT event_id, booking_id, status, event_type, source, note, created_at
    FROM booking_events WHERE booking_id = ? ORDER BY event_id ASC LIMIT 200`).bind(bookingId).all();
  return result.results ?? [];
}

export async function touchBooking(db: any, bookingId: string) {
  await db.prepare("UPDATE bookings SET updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(bookingId).run();
}
