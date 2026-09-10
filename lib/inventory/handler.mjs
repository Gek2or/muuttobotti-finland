import { extractInventory } from './extract.mjs';

const headers = { 'Cache-Control':'no-store', 'X-Robots-Tag':'noindex, nofollow' };
const reply = (data,status) => Response.json(data,{status,headers});
const MAX_BYTES = 24000;

export async function handleInventory(request, { authorize, env, extract = extractInventory }) {
  if (request.method !== 'POST') return reply({error:'method_not_allowed'},405);
  // Authenticate before parsing input or making billable calls.
  if (!await authorize(request)) return reply({error:'unauthorized'},401);
  if (env.AI_INVENTORY_ENABLED !== 'true') return reply({error:'feature_disabled'},503);
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) return reply({error:'json_required'},415);
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) return reply({error:'invalid_origin'},403);
  let body;
  try {
    if (!request.body || Number(request.headers.get('content-length')) > MAX_BYTES) return reply({error:'body_too_large_or_empty'},413);
    const reader=request.body.getReader(); let size=0; const chunks=[];
    try {
      while (true) {
        const {value,done}=await reader.read(); if(done) break;
        size+=value.byteLength;
        if(size>MAX_BYTES) {await reader.cancel(); return reply({error:'body_too_large'},413);}
        chunks.push(value);
      }
    } finally {reader.releaseLock();}
    const bytes=new Uint8Array(size); let offset=0;
    for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}
    body=JSON.parse(new TextDecoder().decode(bytes));
  } catch {return reply({error:'invalid_json'},400);}
  if (!body || Object.keys(body).length!==1 || typeof body.text!=='string' || !body.text.trim() || body.text.length>6000)
    return reply({error:'text_required_max_6000'},400);
  const result=await extract(body.text,{apiKey:env.OPENAI_API_KEY,model:env.OPENAI_INVENTORY_MODEL});
  return reply(result,result.ok?200:503);
}
