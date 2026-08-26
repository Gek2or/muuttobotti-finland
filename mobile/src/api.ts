export const API_BASE = 'https://muuttobotti.fi';

export type BookingEvent = { event_id?: number; booking_id: string; status: string; event_type: string; source: string; note: string; created_at: string };
export type Booking = {
  id: string; service: string; customer_name: string; phone?: string; email?: string;
  pickup: string; destination: string; preferred_date: string; preferred_time: string; notes: string;
  photo_count: number; status: string; created_at: string; updated_at?: string;
  calculator_snapshot?: string; recommendation?: string; recommendation_level?: string;
  assigned_worker?: string; assigned_worker_phone?: string;
  quoted_price?: number; quote_status?: string; final_price?: number; actual_hours?: number; admin_note?: string;
  client_ip?: string; user_agent?: string; client_country?: string; client_region?: string; client_city?: string;
  client_asn?: string; cf_colo?: string; referer?: string; page_url?: string; locale?: string; timezone?: string;
  screen_size?: string; utm_source?: string; utm_medium?: string; utm_campaign?: string;
};
export type Worker = { worker_id: string; name: string; phone?: string; email?: string; active: number };
export type Availability = { ok: true; db: boolean; from?: string; to?: string; fullDays: string[]; blocks: Array<{date:string;start:string;end:string}>; bookedStarts: Array<{date:string;time:string}> };
export type BookingCreateResult =
  | { bookingId: string; trackingPath: string; accessKey: string; warning?: string }
  | { fallback: 'whatsapp'; code?: string; draftId: string; whatsappUrl: string };

async function json<T>(response:Response):Promise<T>{const payload=await response.json().catch(()=>({}));if(!response.ok)throw new Error((payload as any).error||`HTTP ${response.status}`);return payload as T}
export async function createBooking(data:FormData){return json<BookingCreateResult>(await fetch(`${API_BASE}/api/bookings`,{method:'POST',headers:{Accept:'application/json'},body:data}))}
export async function getAvailability(from:string,to=from){const qs=new URLSearchParams({from,to});return json<Availability>(await fetch(`${API_BASE}/api/availability?${qs.toString()}`,{headers:{Accept:'application/json'}}))}
export async function getBooking(id:string,key:string){return json<{booking:Booking;events:BookingEvent[]}>(await fetch(`${API_BASE}/api/bookings/status`,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({id,key})}))}
export async function updateClientBooking(id:string,key:string,patch:Record<string,unknown>){return json<{booking:Booking;events:BookingEvent[]}>(await fetch(`${API_BASE}/api/bookings/status`,{method:'PATCH',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({id,key,...patch})}))}
export async function registerBookingPush(id:string,key:string,token:string,platform:string,locale:string){return json<{ok:true}>(await fetch(`${API_BASE}/api/bookings/push`,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({id,key,token,platform,locale})}))}
export async function getAdminBookings(token:string){return json<{ok:true;bookings:Booking[];count:number;db:boolean;bucket:boolean}>(await fetch(`${API_BASE}/api/admin/bookings?limit=200`,{headers:{Authorization:`Bearer ${token}`,Accept:'application/json'}}))}
export async function getAdminOperations(token:string,filters:{date?:string;status?:string;q?:string}={}){const qs=new URLSearchParams();Object.entries(filters).forEach(([k,v])=>{if(v)qs.set(k,v)});return json<{ok:true;bookings:Booking[];workers:Worker[];stats:any}>(await fetch(`${API_BASE}/api/admin/operations?${qs.toString()}`,{headers:{Authorization:`Bearer ${token}`,Accept:'application/json'}}))}
export async function adminOperation(token:string,id:string,action:string,patch:Record<string,unknown>={}){return json<{ok:true;booking:Booking}>(await fetch(`${API_BASE}/api/admin/operations`,{method:'PATCH',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({id,action,...patch})}))}
export async function upsertWorker(token:string,worker:Partial<Worker>&{name:string}){return json<{ok:true;worker:Worker}>(await fetch(`${API_BASE}/api/admin/operations`,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({action:'worker_upsert',...worker})}))}
export async function requestClientCode(email:string){return json<{ok:true;expiresIn:number}>(await fetch(`${API_BASE}/api/client/auth`,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({action:'request_code',email})}))}
export async function verifyClientCode(email:string,code:string){return json<{ok:true;token:string;profile:any;bookings:Booking[]}>(await fetch(`${API_BASE}/api/client/auth`,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({action:'verify_code',email,code})}))}
export async function getClientAccount(token:string,bookingId?:string){return json<any>(await fetch(`${API_BASE}/api/client/auth`,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({action:'me',token,bookingId})}))}
export async function updateClientAccountBooking(token:string,bookingId:string,bookingAction:string,patch:Record<string,unknown>={}){return json<{ok:true;booking:Booking;events:BookingEvent[]}>(await fetch(`${API_BASE}/api/client/auth`,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({action:'booking_action',token,bookingId,bookingAction,...patch})}))}
export async function logoutClientAccount(token:string){return json<{ok:true}>(await fetch(`${API_BASE}/api/client/auth`,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({action:'logout',token})}))}
export async function registerAccountPush(session:string,bookingId:string,token:string,platform:string,locale:string){return json<{ok:true}>(await fetch(`${API_BASE}/api/client/push`,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({session,bookingId,token,platform,locale})}))}
