import * as SecureStore from 'expo-secure-store';

const ADMIN_TOKEN = 'muuttobotti_admin_token';
const CLIENT_ID = 'muuttobotti_client_booking_id';
const CLIENT_KEY = 'muuttobotti_client_booking_key';
const CLIENT_HISTORY = 'muuttobotti_client_booking_history';
const CLIENT_SESSION = 'muuttobotti_client_session';
const CLIENT_EMAIL = 'muuttobotti_client_email';
const PUSH_TOKEN = 'muuttobotti_push_token';
const PENDING_ESTIMATE = 'muuttobotti_pending_estimate';

export type SavedBookingCredential = { id: string; key: string; savedAt: string };
export type PendingEstimate = { service: 'moving' | 'cleaning' | 'transport'; snapshot: Record<string, unknown>; savedAt: string };

function isSavedCredential(value: unknown): value is SavedBookingCredential {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<SavedBookingCredential>;
  return typeof item.id === 'string' && item.id.length > 0 && typeof item.key === 'string' && item.key.length > 0;
}

async function readHistory(): Promise<SavedBookingCredential[]> {
  const raw = await SecureStore.getItemAsync(CLIENT_HISTORY);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isSavedCredential).slice(0, 20);
  } catch {
    return [];
  }
}

async function writeHistory(items: SavedBookingCredential[]) {
  await SecureStore.setItemAsync(CLIENT_HISTORY, JSON.stringify(items.slice(0, 20)));
}

async function readPendingEstimate(): Promise<PendingEstimate | null> {
  const raw = await SecureStore.getItemAsync(PENDING_ESTIMATE);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<PendingEstimate>;
    if (!parsed.service || !parsed.snapshot || typeof parsed.snapshot !== 'object') return null;
    return parsed as PendingEstimate;
  } catch {
    return null;
  }
}

export const secureStorage = {
  getAdminToken: () => SecureStore.getItemAsync(ADMIN_TOKEN),
  setAdminToken: (token: string) => SecureStore.setItemAsync(ADMIN_TOKEN, token),
  clearAdminToken: () => SecureStore.deleteItemAsync(ADMIN_TOKEN),
  getClientCredentials: async () => ({
    id: (await SecureStore.getItemAsync(CLIENT_ID)) || '',
    key: (await SecureStore.getItemAsync(CLIENT_KEY)) || '',
  }),
  getClientHistory: readHistory,
  setClientCredentials: async (id: string, key: string) => {
    await SecureStore.setItemAsync(CLIENT_ID, id);
    await SecureStore.setItemAsync(CLIENT_KEY, key);
    const current: SavedBookingCredential[] = await readHistory();
    const next: SavedBookingCredential = { id, key, savedAt: new Date().toISOString() };
    await writeHistory([next, ...current.filter((item: SavedBookingCredential) => item.id !== id)]);
  },
  removeClientCredential: async (id: string) => {
    const current: SavedBookingCredential[] = await readHistory();
    await writeHistory(current.filter((item: SavedBookingCredential) => item.id !== id));
    const activeId = await SecureStore.getItemAsync(CLIENT_ID);
    if (activeId === id) {
      await SecureStore.deleteItemAsync(CLIENT_ID);
      await SecureStore.deleteItemAsync(CLIENT_KEY);
    }
  },
  clearClientCredentials: async () => {
    await SecureStore.deleteItemAsync(CLIENT_ID);
    await SecureStore.deleteItemAsync(CLIENT_KEY);
  },
  clearClientHistory: async () => {
    await SecureStore.deleteItemAsync(CLIENT_HISTORY);
    await SecureStore.deleteItemAsync(CLIENT_ID);
    await SecureStore.deleteItemAsync(CLIENT_KEY);
  },
  getClientSession: async () => ({
    token: (await SecureStore.getItemAsync(CLIENT_SESSION)) || '',
    email: (await SecureStore.getItemAsync(CLIENT_EMAIL)) || '',
  }),
  setClientSession: async (token: string, email: string) => {
    await SecureStore.setItemAsync(CLIENT_SESSION, token);
    await SecureStore.setItemAsync(CLIENT_EMAIL, email);
  },
  clearClientSession: async () => {
    await SecureStore.deleteItemAsync(CLIENT_SESSION);
    await SecureStore.deleteItemAsync(CLIENT_EMAIL);
  },
  getPushToken: () => SecureStore.getItemAsync(PUSH_TOKEN),
  setPushToken: (token: string) => SecureStore.setItemAsync(PUSH_TOKEN, token),
  clearPushToken: () => SecureStore.deleteItemAsync(PUSH_TOKEN),
  getPendingEstimate: readPendingEstimate,
  setPendingEstimate: (estimate: Omit<PendingEstimate, 'savedAt'>) => SecureStore.setItemAsync(PENDING_ESTIMATE, JSON.stringify({ ...estimate, savedAt: new Date().toISOString() })),
  clearPendingEstimate: () => SecureStore.deleteItemAsync(PENDING_ESTIMATE),
};
