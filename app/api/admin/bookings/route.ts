import { isAdminRequest, unauthorized } from '../admin-auth';
import { appendBookingEvent, ensureBookingSchema } from '../../bookings/schema';
import { notifyBooking } from '../../bookings/notifications';

const STATUSES = new Set(['new','confirmed','assigned','on_the_way','in_progress','completed','cancelled','change_requested']);
function noStore(payload:unknown,init:ResponseInit={}){const headers=new Headers(init.headers);headers.set('Cache-Control','no-store');headers.set('X-Robots-Tag','noindex, nofollow');return Response.json(payload,{...init,headers})}

export async function GET(request:Request){
  if(!(await isAdminRequest(request)))return unauthorized();
  const {env}=await import('cloudflare:workers');
  if(!env.DB)return noStore({error:'DB_UNAVAILABLE',db:false,bucket:Boolean(env.BUCKET)},{status:503});
  const url=new URL(request.url);const requestedLimit=Number(url.searchParams.get('limit')||100);const limit=Math.max(1,Math.min(300,Number.isFinite(requestedLimit)?requestedLimit:100));
  try{await ensureBookingSchema(env.DB);const result=await env.DB.prepare(`SELECT id,service,customer_name,phone,email,pickup,destination,preferred_date,preferred_time,notes,photo_count,status,calculator_snapshot,recommendation,recommendation_level,assigned_worker,assigned_worker_phone,quoted_price,quote_status,final_price,actual_hours,admin_note,client_ip,user_agent,client_country,client_region,client_city,client_asn,cf_colo,referer,page_url,locale,timezone,screen_size,utm_source,utm_medium,utm_campaign,created_at,updated_at FROM bookings ORDER BY datetime(created_at) DESC LIMIT ?`).bind(limit).all();return noStore({ok:true,db:true,bucket:Boolean(env.BUCKET),count:(result.results??[]).length,bookings:result.results??[]})}catch(error){console.error('Admin booking list failed',error);return noStore({error:'ADMIN_QUERY_FAILED'},{status:500})}
}

export async function PATCH(request:Request){
  if(!(await isAdminRequest(request)))return unauthorized();
  const {env}=await import('cloudflare:workers');if(!env.DB)return noStore({error:'DB_UNAVAILABLE'},{status:503});
  const body=await request.json().catch(()=>({})) as {id?:string;status?:string};const id=String(body.id||'').trim();const status=String(body.status||'').trim();
  if(!/^MB-[A-Z0-9-]{4,40}$/.test(id)||!STATUSES.has(status))return noStore({error:'INVALID_UPDATE'},{status:400});
  try{await ensureBookingSchema(env.DB);const result=await env.DB.prepare('UPDATE bookings SET status=?, updated_at=CURRENT_TIMESTAMP WHERE id=?').bind(status,id).run();if((result.meta?.changes??0)>0){await appendBookingEvent(env.DB,id,status,'status','admin',`Admin changed status to ${status}`);const booking:any=await env.DB.prepare('SELECT id,email,locale FROM bookings WHERE id=? LIMIT 1').bind(id).first();if(booking&&['confirmed','assigned','on_the_way','in_progress','completed','cancelled','change_requested'].includes(status))void notifyBooking(env as any,booking,status as any).catch(()=>{})}return noStore({ok:true,id,status,changes:result.meta?.changes??0})}catch(error){console.error('Admin status update failed',error);return noStore({error:'STATUS_UPDATE_FAILED'},{status:500})}
}
