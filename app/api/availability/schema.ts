export const AVAILABILITY_BLOCKS_SQL = `CREATE TABLE IF NOT EXISTS availability_blocks (
  id TEXT PRIMARY KEY,
  block_date TEXT NOT NULL,
  start_time TEXT NOT NULL DEFAULT '',
  end_time TEXT NOT NULL DEFAULT '',
  all_day INTEGER NOT NULL DEFAULT 0,
  label TEXT NOT NULL DEFAULT '',
  source TEXT NOT NULL DEFAULT 'admin',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)`;

export async function ensureAvailabilitySchema(db: any) {
  await db.prepare(AVAILABILITY_BLOCKS_SQL).run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_availability_blocks_date ON availability_blocks(block_date, all_day, start_time)").run();
}

export function validDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function validTime(value: string) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export function timeToMinutes(value: string) {
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}

export async function isUnavailable(db: any, date: string, time: string) {
  await ensureAvailabilitySchema(db);
  const blocks = await db.prepare(`SELECT all_day, start_time, end_time
    FROM availability_blocks WHERE block_date = ?`).bind(date).all();
  const minute = timeToMinutes(time);
  return ((blocks.results ?? []) as any[]).some(block => {
    if (Number(block.all_day) === 1) return true;
    const start = String(block.start_time || '');
    const end = String(block.end_time || '');
    if (!validTime(start) || !validTime(end)) return false;
    return minute >= timeToMinutes(start) && minute < timeToMinutes(end);
  });
}
