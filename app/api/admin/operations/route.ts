import { isAdminRequest, unauthorized } from '../admin-auth';
import { appendBookingEvent, ensureBookingSchema, touchBooking } from '../../bookings/schema';
import { notifyBooking } from '../../bookings/notifications';

const STATUSES = new Set(['new','confirmed','assigned','on_the_way','in_progress','completed','cancelled','change_requested']);

function noStore(payload: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  headers.set('Cache-Control', 'no-store');
  headers.set('X-Robots-Tag', 'noindex, nofollow');
  return Response.json(payload, { ...init, headers });
}

function text(value: unknown, max = 1000) { return String(value ?? '').trim().slice(0, max); }
function number(value: unknown, min = 0, max = 100000) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(min, Math.min(max, parsed));
}

async function getBooking(db: any, id: string) {
  return db.prepare(`SELECT id, service, customer_name, phone, email, pickup, destination, preferred_date, preferred_time,
    notes, photo_count, status, calculator_snapshot, recommendation, recommendation_level,
    assigned_worker, assigned_worker_phone, quoted_price, quote_status, final_price, actual_hours, admin_note,
    locale, created_at, updated_at FROM bookings WHERE id = ? LIMIT 1`).bind(id).first();
}

export async function GET(request: Request) {
  if (!(await isAdminRequest(request))) return unauthorized();
  const { env } = await import('cloudflare:workers');
  if (!env.DB) return noStore({ error: 'DB_UNAVAILABLE' }, { status: 503 });
  await ensureBookingSchema(env.DB);
  const url = new URL(request.url);
  const date = text(url.searchParams.get('date'), 20);
  const status = text(url.searchParams.get('status'), 30);
  const q = text(url.searchParams.get('q'), 120).toLowerCase();
  const clauses: string[] = [];
  const values: unknown[] = [];
  if (date) { clauses.push('preferred_date = ?'); values.push(date); }
  if (status && STATUSES.has(status)) { clauses.push('status = ?'); values.push(status); }
  if (q) {
    clauses.push('(lower(id) LIKE ? OR lower(customer_name) LIKE ? OR lower(phone) LIKE ? OR lower(email) LIKE ? OR lower(pickup) LIKE ? OR lower(destination) LIKE ?)');
    for (let i=0;i<6;i++) values.push(`%${q}%`);
  }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const result = await env.DB.prepare(`SELECT id, service, customer_name, phone, email, pickup, destination,
    preferred_date, preferred_time, notes, photo_count, status, calculator_snapshot, recommendation, recommendation_level,
    assigned_worker, assigned_worker_phone, quoted_price, quote_status, final_price, actual_hours, admin_note,
    locale, created_at, updated_at FROM bookings ${where}
    ORDER BY preferred_date ASC, preferred_time ASC, datetime(created_at) DESC LIMIT 300`).bind(...values).all();
  const workers = await env.DB.prepare('SELECT worker_id, name, phone, email, active FROM workers ORDER BY active DESC, name ASC').all();
  const stats = await env.DB.prepare(`SELECT
    COUNT(*) total,
    SUM(CASE WHEN status='new' THEN 1 ELSE 0 END) new_count,
    SUM(CASE WHEN status IN ('confirmed','assigned','on_the_way','in_progress','change_requested') THEN 1 ELSE 0 END) active_count,
    SUM(CASE WHEN preferred_date = date('now') AND status NOT IN ('completed','cancelled') THEN 1 ELSE 0 END) today_count
    FROM bookings`).first();
  return noStore({ ok: true, bookings: result.results ?? [], workers: workers.results ?? [], stats });
}

export async function POST(request: Request) {
  if (!(await isAdminRequest(request))) return unauthorized();
  const { env } = await import('cloudflare:workers');
  if (!env.DB) return noStore({ error: 'DB_UNAVAILABLE' }, { status: 503 });
  await ensureBookingSchema(env.DB);
  const body = await request.json().catch(() => ({})) as Record<string, unknown>;
  if (body.action !== 'worker_upsert') return noStore({ error: 'UNKNOWN_ACTION' }, { status: 400 });
  const name = text(body.name, 120);
  if (!name) return noStore({ error: 'WORKER_NAME_REQUIRED' }, { status: 400 });
  const workerId = text(body.worker_id, 80) || `W-${crypto.randomUUID().slice(0,8).toUpperCase()}`;
  const phone = text(body.phone, 60); const email = text(body.email, 160); const active = body.active === false ? 0 : 1;
  await env.DB.prepare(`INSERT INTO workers(worker_id,name,phone,email,active,updated_at) VALUES(?,?,?,?,?,CURRENT_TIMESTAMP)
    ON CONFLICT(worker_id) DO UPDATE SET name=excluded.name, phone=excluded.phone, email=excluded.email, active=excluded.active, updated_at=CURRENT_TIMESTAMP`)
    .bind(workerId,name,phone,email,active).run();
  return noStore({ ok: true, worker: { worker_id: workerId, name, phone, email, active } });
}

export async function PATCH(request: Request) {
  if (!(await isAdminRequest(request))) return unauthorized();
  const { env } = await import('cloudflare:workers');
  if (!env.DB) return noStore({ error: 'DB_UNAVAILABLE' }, { status: 503 });
  await ensureBookingSchema(env.DB);
  const body = await request.json().catch(() => ({})) as Record<string, unknown>;
  const id = text(body.id, 40).toUpperCase();
  const action = text(body.action, 40);
  if (!/^MB-[A-Z0-9-]{4,40}$/.test(id)) return noStore({ error: 'INVALID_ID' }, { status: 400 });
  const current: any = await getBooking(env.DB, id);
  if (!current) return noStore({ error: 'BOOKING_NOT_FOUND' }, { status: 404 });

  let notice: any = null;
  if (action === 'status') {
    const status = text(body.status, 30);
    if (!STATUSES.has(status)) return noStore({ error: 'INVALID_STATUS' }, { status: 400 });
    await env.DB.prepare('UPDATE bookings SET status=?, updated_at=CURRENT_TIMESTAMP WHERE id=?').bind(status,id).run();
    await appendBookingEvent(env.DB,id,status,'status','admin',text(body.note,500));
    if (['confirmed','assigned','on_the_way','in_progress','completed','cancelled','change_requested'].includes(status)) notice = status;
  } else if (action === 'assign') {
    const workerId = text(body.worker_id,80);
    const worker: any = workerId ? await env.DB.prepare('SELECT * FROM workers WHERE worker_id=? LIMIT 1').bind(workerId).first() : null;
    const workerName = text(worker?.name || body.worker_name,120);
    const workerPhone = text(worker?.phone || body.worker_phone,60);
    if (!workerName) return noStore({ error:'WORKER_REQUIRED' },{status:400});
    await env.DB.prepare(`UPDATE bookings SET assigned_worker=?, assigned_worker_phone=?, status='assigned', updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(workerName,workerPhone,id).run();
    await appendBookingEvent(env.DB,id,'assigned','assignment','admin',workerName);
    notice = 'assigned';
  } else if (action === 'quote') {
    const amount = number(body.amount,1,100000);
    if (!amount) return noStore({ error:'PRICE_REQUIRED' },{status:400});
    const note = text(body.note,1000);
    await env.DB.prepare(`UPDATE bookings SET quoted_price=?, quote_status='pending', admin_note=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(amount,note,id).run();
    await appendBookingEvent(env.DB,id,current.status,'quote','admin',`${amount.toFixed(2)} EUR${note ? ` · ${note}` : ''}`);
    notice = 'quote';
  } else if (action === 'note') {
    const note = text(body.note,2000);
    await env.DB.prepare('UPDATE bookings SET admin_note=?, updated_at=CURRENT_TIMESTAMP WHERE id=?').bind(note,id).run();
    await appendBookingEvent(env.DB,id,current.status,'admin_note','admin',note);
  } else if (action === 'complete') {
    const finalPrice = number(body.final_price,0,100000);
    const actualHours = number(body.actual_hours,0,1000);
    await env.DB.prepare(`UPDATE bookings SET final_price=?, actual_hours=?, status='completed', updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(finalPrice,actualHours,id).run();
    await appendBookingEvent(env.DB,id,'completed','completion','admin',`${finalPrice.toFixed(2)} EUR · ${actualHours.toFixed(2)} h`);
    notice = 'completed';
  } else return noStore({ error:'UNKNOWN_ACTION' },{status:400});

  await touchBooking(env.DB,id);
  const updated: any = await getBooking(env.DB,id);
  if (notice) void notifyBooking(env as any, updated, notice).catch(error => console.error('Notify failed',error));
  return noStore({ ok:true, booking: updated });
}
