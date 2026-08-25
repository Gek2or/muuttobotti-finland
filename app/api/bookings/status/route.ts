import { appendBookingEvent, ensureBookingSchema, getBookingEvents, touchBooking } from '../schema';

type BookingRow = {
  id: string; service: string; customer_name: string; phone?: string; email?: string;
  pickup: string; destination: string; preferred_date: string; preferred_time: string;
  notes: string; photo_count: number; status: string; created_at: string; updated_at?: string;
  assigned_worker?: string; assigned_worker_phone?: string;
  quoted_price?: number; quote_status?: string; final_price?: number; actual_hours?: number; admin_note?: string;
};

const editableStatuses = new Set(['new','confirmed','assigned','change_requested']);

function text(value: unknown, max = 300) { return String(value ?? '').trim().slice(0, max); }
async function hashAccessKey(value: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
}
function validCredentials(id: string, key: string) { return /^MB-[A-F0-9]{8}$/.test(id) && /^[a-f0-9]{32}$/.test(key); }
function sameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  return !origin || new URL(origin).host === new URL(request.url).host;
}
async function findBooking(db: any, id: string, key: string) {
  if (!validCredentials(id,key)) return null;
  await ensureBookingSchema(db);
  const accessTokenHash = await hashAccessKey(key);
  return db.prepare(`SELECT id, service, customer_name, phone, email, pickup, destination,
    preferred_date, preferred_time, notes, photo_count, status, assigned_worker, assigned_worker_phone,
    quoted_price, quote_status, final_price, actual_hours, admin_note, created_at, updated_at
    FROM bookings WHERE id = ? AND access_token_hash = ? LIMIT 1`).bind(id,accessTokenHash).first<BookingRow>();
}
async function response(db: any, booking: BookingRow) {
  const storedEvents = await getBookingEvents(db,booking.id) as Array<Record<string,unknown>>;
  const createdEvent = { event_id:0, booking_id:booking.id, status:'new', event_type:'created', source:'client', note:'Booking created', created_at:booking.created_at };
  const hasCreatedEvent = storedEvents.some(event => event.event_type === 'created');
  const events = hasCreatedEvent ? storedEvents : [createdEvent,...storedEvents];
  return Response.json({ booking, events }, { headers:{ 'Cache-Control':'no-store' } });
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({error:'Invalid origin'},{status:403});
  const { env } = await import('cloudflare:workers');
  if (!env.DB) return Response.json({error:'DB_UNAVAILABLE'},{status:503});
  const body = await request.json().catch(() => ({})) as Record<string,unknown>;
  const id = text(body.id,20).toUpperCase(); const key = text(body.key,64).toLowerCase();
  const booking = await findBooking(env.DB,id,key);
  return booking ? response(env.DB,booking) : Response.json({error:'Booking not found'},{status:404,headers:{'Cache-Control':'no-store'}});
}

export async function PATCH(request: Request) {
  if (!sameOrigin(request)) return Response.json({error:'Invalid origin'},{status:403});
  const { env } = await import('cloudflare:workers');
  if (!env.DB) return Response.json({error:'DB_UNAVAILABLE'},{status:503});
  const body = await request.json().catch(() => ({})) as Record<string,unknown>;
  const id = text(body.id,20).toUpperCase(); const key = text(body.key,64).toLowerCase();
  const booking = await findBooking(env.DB,id,key);
  if (!booking) return Response.json({error:'Booking not found'},{status:404});

  const action = text(body.action,40);
  if (action === 'accept_quote') {
    if (!booking.quoted_price || booking.quote_status !== 'pending') return Response.json({error:'NO_PENDING_QUOTE'},{status:409});
    await env.DB.prepare(`UPDATE bookings SET quote_status='accepted', final_price=quoted_price, updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(id).run();
    await appendBookingEvent(env.DB,id,booking.status,'quote_accepted','client',`${Number(booking.quoted_price).toFixed(2)} EUR`);
  } else if (action === 'reject_quote') {
    if (!booking.quoted_price || booking.quote_status !== 'pending') return Response.json({error:'NO_PENDING_QUOTE'},{status:409});
    const note = text(body.note,1000);
    await env.DB.prepare(`UPDATE bookings SET quote_status='change_requested', status='change_requested', updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(id).run();
    await appendBookingEvent(env.DB,id,'change_requested','quote_change','client',note || 'Client requested a different price');
  } else {
    if (!editableStatuses.has(booking.status)) return Response.json({error:'Booking can no longer be changed online'},{status:409});
    if (action === 'cancel') {
      await env.DB.prepare(`UPDATE bookings SET status='cancelled', updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(id).run();
      await appendBookingEvent(env.DB,id,'cancelled','status','client','Client cancelled booking');
    } else if (action === 'modify') {
      const pickup=text(body.pickup), destination=text(body.destination), date=text(body.date,20), time=text(body.time,20), notes=text(body.notes,2000);
      if (!pickup || !destination || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return Response.json({error:'Invalid booking details'},{status:400});
      await env.DB.prepare(`UPDATE bookings SET pickup=?, destination=?, preferred_date=?, preferred_time=?, notes=?, status='change_requested', updated_at=CURRENT_TIMESTAMP WHERE id=?`)
        .bind(pickup,destination,date,time,notes,id).run();
      await appendBookingEvent(env.DB,id,'change_requested','change','client','Client requested booking changes');
    } else return Response.json({error:'Unknown action'},{status:400});
  }
  await touchBooking(env.DB,id);
  const updated = await findBooking(env.DB,id,key);
  return updated ? response(env.DB,updated) : Response.json({error:'Booking not found'},{status:404});
}
