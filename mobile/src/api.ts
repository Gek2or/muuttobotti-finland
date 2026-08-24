export const API_BASE = 'https://muuttobotti.fi';

export type Booking = {
  id: string;
  service: string;
  customer_name: string;
  phone?: string;
  email?: string;
  pickup: string;
  destination: string;
  preferred_date: string;
  preferred_time: string;
  notes: string;
  photo_count: number;
  status: string;
  created_at: string;
  calculator_snapshot?: string;
  recommendation?: string;
  recommendation_level?: string;
  client_ip?: string;
  user_agent?: string;
  client_country?: string;
  client_region?: string;
  client_city?: string;
  client_asn?: string;
  cf_colo?: string;
  referer?: string;
  page_url?: string;
  locale?: string;
  timezone?: string;
  screen_size?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
};

async function json<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error((payload as any).error || `HTTP ${response.status}`);
  return payload as T;
}

export async function createBooking(data: FormData) {
  const response = await fetch(`${API_BASE}/api/bookings`, {
    method: 'POST',
    headers: { Accept: 'application/json' },
    body: data,
  });
  return json<{ bookingId: string; trackingPath: string; accessKey: string; warning?: string }>(response);
}

export async function getBooking(id: string, key: string) {
  const response = await fetch(`${API_BASE}/api/bookings/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ id, key }),
  });
  return json<{ booking: Booking }>(response);
}

export async function updateClientBooking(id: string, key: string, patch: Record<string, unknown>) {
  const response = await fetch(`${API_BASE}/api/bookings/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ id, key, ...patch }),
  });
  return json<{ booking: Booking }>(response);
}

export async function getAdminBookings(token: string) {
  const response = await fetch(`${API_BASE}/api/admin/bookings?limit=200`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  return json<{ ok: true; bookings: Booking[]; count: number; db: boolean; bucket: boolean }>(response);
}

export async function updateAdminStatus(token: string, id: string, status: string) {
  const response = await fetch(`${API_BASE}/api/admin/bookings`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ id, status }),
  });
  return json<{ ok: true; id: string; status: string }>(response);
}
