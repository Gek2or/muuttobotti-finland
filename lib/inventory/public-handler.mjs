import { handleInventory } from './handler.mjs';

const LIMIT = 5;
const HOUR_MS = 60 * 60 * 1000;
const headers = { 'Cache-Control':'no-store', 'X-Robots-Tag':'noindex, nofollow' };
const reply = (data,status,extra={}) => Response.json(data,{status,headers:{...headers,...extra}});

export async function handlePublicInventory(request, { env, extract } = {}) {
  if (request.method !== 'POST') return reply({error:'method_not_allowed'},405);
  if (env?.AI_INVENTORY_PUBLIC_ENABLED !== 'true') return reply({error:'feature_disabled'},503);

  const origin=request.headers.get('origin');
  if (!origin || origin !== new URL(request.url).origin) return reply({error:'invalid_origin'},403);
  const ip=request.headers.get('cf-connecting-ip');
  if (!ip || !env.DB || !env.AI_RATE_LIMIT_SALT) return reply({error:'public_access_not_configured'},503);

  const bucket=Math.floor(Date.now()/HOUR_MS);
  const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(`${env.AI_RATE_LIMIT_SALT}:${ip}`));
  const clientHash=[...new Uint8Array(digest)].map(byte=>byte.toString(16).padStart(2,'0')).join('');
  try {
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS ai_inventory_rate_limits (
      bucket INTEGER NOT NULL,
      client_hash TEXT NOT NULL,
      request_count INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (bucket, client_hash)
    )`).run();
    const row=await env.DB.prepare(`INSERT INTO ai_inventory_rate_limits (bucket,client_hash,request_count)
      VALUES (?,?,1)
      ON CONFLICT(bucket,client_hash) DO UPDATE SET request_count=request_count+1
      RETURNING request_count`).bind(bucket,clientHash).first();
    if (!row || Number(row.request_count)>LIMIT) {
      const retry=Math.max(1,Math.ceil(((bucket+1)*HOUR_MS-Date.now())/1000));
      return reply({error:'rate_limited'},429,{'Retry-After':String(retry)});
    }
    if (Number(row.request_count)===1 && bucket%24===0)
      await env.DB.prepare('DELETE FROM ai_inventory_rate_limits WHERE bucket < ?').bind(bucket-48).run();
  } catch (error) {
    console.error('AI inventory rate limit failed',error);
    return reply({error:'rate_limit_unavailable'},503);
  }

  return handleInventory(request,{authorize:async()=>true,env,extract});
}
