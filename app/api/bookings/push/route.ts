import { ensureBookingSchema } from '../schema';

function text(value: unknown, max = 300) { return String(value ?? '').trim().slice(0, max); }
async function hashAccessKey(value: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2,'0')).join('');
}
function sameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  return !origin || new URL(origin).host === new URL(request.url).host;
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({error:'Invalid origin'},{status:403});
  const { env } = await import('cloudflare:workers');
  if (!env.DB) return Response.json({error:'DB_UNAVAILABLE'},{status:503});
  await ensureBookingSchema(env.DB);
  const body = await request.json().catch(() => ({})) as Record<string,unknown>;
  const id=text(body.id,20).toUpperCase(), key=text(body.key,64).toLowerCase(), token=text(body.token,500);
  const platform=text(body.platform,30), locale=text(body.locale,10)||'fi';
  if (!/^MB-[A-F0-9]{8}$/.test(id) || !/^[a-f0-9]{32}$/.test(key) || !token) return Response.json({error:'INVALID_INPUT'},{status:400});
  const accessTokenHash=await hashAccessKey(key);
  const booking=await env.DB.prepare('SELECT id FROM bookings WHERE id=? AND access_token_hash=? LIMIT 1').bind(id,accessTokenHash).first();
  if (!booking) return Response.json({error:'BOOKING_NOT_FOUND'},{status:404});
  await env.DB.prepare(`INSERT INTO push_tokens(token,booking_id,platform,locale,active,updated_at) VALUES(?,?,?,?,1,CURRENT_TIMESTAMP)
    ON CONFLICT(token) DO UPDATE SET booking_id=excluded.booking_id, platform=excluded.platform, locale=excluded.locale, active=1, updated_at=CURRENT_TIMESTAMP`)
    .bind(token,id,platform,locale).run();
  return Response.json({ok:true},{headers:{'Cache-Control':'no-store'}});
}

export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return Response.json({error:'Invalid origin'},{status:403});
  const { env } = await import('cloudflare:workers');
  if (!env.DB) return Response.json({error:'DB_UNAVAILABLE'},{status:503});
  const body=await request.json().catch(() => ({})) as Record<string,unknown>;
  const token=text(body.token,500);
  if (!token) return Response.json({error:'TOKEN_REQUIRED'},{status:400});
  await env.DB.prepare('UPDATE push_tokens SET active=0, updated_at=CURRENT_TIMESTAMP WHERE token=?').bind(token).run();
  return Response.json({ok:true});
}
