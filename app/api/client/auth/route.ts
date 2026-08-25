import { ensureBookingSchema, getBookingEvents } from '../../bookings/schema';

function text(value: unknown, max=300){return String(value??'').trim().slice(0,max)}
function emailValue(value: unknown){return text(value,180).toLowerCase()}
async function sha(value:string){const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));return Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('')}
function sameOrigin(request:Request){const origin=request.headers.get('origin');return !origin||new URL(origin).host===new URL(request.url).host}
function sixDigits(){const a=new Uint32Array(1);crypto.getRandomValues(a);return String(100000+(a[0]%900000))}
async function sendCode(env:any,email:string,code:string){
  if(!env.RESEND_API_KEY) return false;
  const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${env.RESEND_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({from:env.RESEND_FROM||'Muuttobotti <noreply@muuttobotti.fi>',to:[email],subject:`Muuttobotti login code: ${code}`,html:`<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto"><h2>Muuttobotti</h2><p>Login code:</p><div style="font-size:34px;font-weight:800;letter-spacing:8px">${code}</div><p>This code expires in 10 minutes.</p></div>`})});
  return response.ok;
}
async function sessionEmail(db:any,token:string){
  if(!token)return '';
  const hash=await sha(token);
  const row:any=await db.prepare(`SELECT email FROM client_accounts WHERE session_hash=? AND datetime(session_expires_at)>datetime('now') LIMIT 1`).bind(hash).first();
  return String(row?.email||'');
}
async function accountBookings(db:any,email:string){
  const result=await db.prepare(`SELECT id,service,customer_name,pickup,destination,preferred_date,preferred_time,status,assigned_worker,assigned_worker_phone,quoted_price,quote_status,final_price,actual_hours,created_at,updated_at FROM bookings WHERE lower(email)=? ORDER BY datetime(created_at) DESC LIMIT 100`).bind(email).all();
  return result.results??[];
}

export async function POST(request:Request){
  if(!sameOrigin(request))return Response.json({error:'Invalid origin'},{status:403});
  const {env}=await import('cloudflare:workers');
  if(!env.DB)return Response.json({error:'DB_UNAVAILABLE'},{status:503});
  await ensureBookingSchema(env.DB);
  const body=await request.json().catch(()=>({})) as Record<string,unknown>;
  const action=text(body.action,40);
  if(action==='request_code'){
    const email=emailValue(body.email);
    if(!/^\S+@\S+\.\S+$/.test(email))return Response.json({error:'INVALID_EMAIL'},{status:400});
    const existing=await env.DB.prepare('SELECT id FROM bookings WHERE lower(email)=? LIMIT 1').bind(email).first();
    if(!existing)return Response.json({error:'NO_BOOKINGS_FOR_EMAIL'},{status:404});
    const code=sixDigits(), codeHash=await sha(`${email}:${code}`), expires=new Date(Date.now()+10*60*1000).toISOString();
    await env.DB.prepare(`INSERT INTO client_auth_codes(email,code_hash,expires_at,attempts,created_at) VALUES(?,?,?,0,CURRENT_TIMESTAMP) ON CONFLICT(email) DO UPDATE SET code_hash=excluded.code_hash,expires_at=excluded.expires_at,attempts=0,created_at=CURRENT_TIMESTAMP`).bind(email,codeHash,expires).run();
    const sent=await sendCode(env,email,code).catch(()=>false);
    if(!sent)return Response.json({error:'EMAIL_DELIVERY_NOT_CONFIGURED'},{status:503});
    return Response.json({ok:true,expiresIn:600},{headers:{'Cache-Control':'no-store'}});
  }
  if(action==='verify_code'){
    const email=emailValue(body.email),code=text(body.code,12);
    const row:any=await env.DB.prepare('SELECT code_hash,expires_at,attempts FROM client_auth_codes WHERE email=? LIMIT 1').bind(email).first();
    if(!row||Number(row.attempts)>=6||new Date(String(row.expires_at)).getTime()<Date.now())return Response.json({error:'CODE_EXPIRED'},{status:401});
    const candidate=await sha(`${email}:${code}`);
    if(candidate!==row.code_hash){await env.DB.prepare('UPDATE client_auth_codes SET attempts=attempts+1 WHERE email=?').bind(email).run();return Response.json({error:'INVALID_CODE'},{status:401});}
    const token=crypto.randomUUID().replaceAll('-','')+crypto.randomUUID().replaceAll('-',''), sessionHash=await sha(token), expires=new Date(Date.now()+30*24*60*60*1000).toISOString();
    const first:any=await env.DB.prepare('SELECT customer_name,phone FROM bookings WHERE lower(email)=? ORDER BY datetime(created_at) DESC LIMIT 1').bind(email).first();
    await env.DB.prepare(`INSERT INTO client_accounts(email,display_name,phone,session_hash,session_expires_at,updated_at) VALUES(?,?,?,?,?,CURRENT_TIMESTAMP) ON CONFLICT(email) DO UPDATE SET display_name=excluded.display_name,phone=excluded.phone,session_hash=excluded.session_hash,session_expires_at=excluded.session_expires_at,updated_at=CURRENT_TIMESTAMP`).bind(email,String(first?.customer_name||''),String(first?.phone||''),sessionHash,expires).run();
    await env.DB.prepare('DELETE FROM client_auth_codes WHERE email=?').bind(email).run();
    return Response.json({ok:true,token,profile:{email,displayName:first?.customer_name||'',phone:first?.phone||''},bookings:await accountBookings(env.DB,email)},{headers:{'Cache-Control':'no-store'}});
  }
  if(action==='me'){
    const token=text(body.token,200),email=await sessionEmail(env.DB,token);
    if(!email)return Response.json({error:'SESSION_INVALID'},{status:401});
    const bookingId=text(body.bookingId,40).toUpperCase();
    if(bookingId){const booking:any=await env.DB.prepare(`SELECT id,service,customer_name,phone,email,pickup,destination,preferred_date,preferred_time,notes,photo_count,status,assigned_worker,assigned_worker_phone,quoted_price,quote_status,final_price,actual_hours,admin_note,created_at,updated_at FROM bookings WHERE id=? AND lower(email)=? LIMIT 1`).bind(bookingId,email).first();if(!booking)return Response.json({error:'BOOKING_NOT_FOUND'},{status:404});return Response.json({ok:true,booking,events:await getBookingEvents(env.DB,bookingId)},{headers:{'Cache-Control':'no-store'}})}
    const account:any=await env.DB.prepare('SELECT email,display_name,phone FROM client_accounts WHERE email=? LIMIT 1').bind(email).first();
    return Response.json({ok:true,profile:{email,displayName:account?.display_name||'',phone:account?.phone||''},bookings:await accountBookings(env.DB,email)},{headers:{'Cache-Control':'no-store'}});
  }
  if(action==='logout'){
    const token=text(body.token,200),hash=await sha(token);await env.DB.prepare("UPDATE client_accounts SET session_hash='',session_expires_at='' WHERE session_hash=?").bind(hash).run();return Response.json({ok:true});
  }
  return Response.json({error:'UNKNOWN_ACTION'},{status:400});
}
