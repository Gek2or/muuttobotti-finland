import * as SecureStore from 'expo-secure-store';

const ADMIN_TOKEN = 'muuttobotti_admin_token';
const CLIENT_ID = 'muuttobotti_client_booking_id';
const CLIENT_KEY = 'muuttobotti_client_booking_key';
const CLIENT_HISTORY = 'muuttobotti_client_booking_history';
const CLIENT_PROFILE = 'muuttobotti_client_profile';
const LAST_ESTIMATE = 'muuttobotti_last_estimate';
const PUSH_TOKEN = 'muuttobotti_push_token';

export type SavedBookingCredential = { id: string; key: string; savedAt: string };
export type ClientProfile = { name: string; phone: string; email: string };
export type SavedEstimate = {
  mode: 'moving' | 'cleaning' | 'transport';
  price: number;
  hours: number;
  summary: string;
  bookingNotes: string;
  savedAt: string;
};

async function readJson<T>(key: string, fallback: T): Promise<T> {
  const raw = await SecureStore.getItemAsync(key);
  if (!raw) return fallback;
  try { return JSON.parse(raw) as T; } catch { return fallback; }
}

async function readHistory(): Promise<SavedBookingCredential[]> {
  const parsed = await readJson<SavedBookingCredential[]>(CLIENT_HISTORY, []);
  return Array.isArray(parsed) ? parsed.filter(item => item?.id && item?.key).slice(0, 20) : [];
}

async function writeHistory(items: SavedBookingCredential[]) {
  await SecureStore.setItemAsync(CLIENT_HISTORY, JSON.stringify(items.slice(0, 20)));
}

export const secureStorage = {
  getAdminToken: () => SecureStore.getItemAsync(ADMIN_TOKEN),
  setAdminToken: (token: string) => SecureStore.setItemAsync(ADMIN_TOKEN, token),
  clearAdminToken: () => SecureStore.deleteItemAsync(ADMIN_TOKEN),

  getClientCredentials: async () => ({ id: (await SecureStore.getItemAsync(CLIENT_ID)) || '', key: (await SecureStore.getItemAsync(CLIENT_KEY)) || '' }),
  getClientHistory: readHistory,
  setClientCredentials: async (id: string, key: string) => {
    await SecureStore.setItemAsync(CLIENT_ID, id);
    await SecureStore.setItemAsync(CLIENT_KEY, key);
    const current = await readHistory();
    await writeHistory([{ id, key, savedAt: new Date().toISOString() }, ...current.filter(item => item.id !== id)]);
  },
  removeClientCredential: async (id: string) => {
    const current = await readHistory();
    await writeHistory(current.filter(item => item.id !== id));
  },
  clearClientCredentials: async () => {
    await SecureStore.deleteItemAsync(CLIENT_ID);
    await SecureStore.deleteItemAsync(CLIENT_KEY);
  },
  clearClientHistory: () => SecureStore.deleteItemAsync(CLIENT_HISTORY),

  getClientProfile: () => readJson<ClientProfile>(CLIENT_PROFILE, { name: '', phone: '', email: '' }),
  setClientProfile: (profile: ClientProfile) => SecureStore.setItemAsync(CLIENT_PROFILE, JSON.stringify(profile)),
  clearClientProfile: () => SecureStore.deleteItemAsync(CLIENT_PROFILE),

  getLastEstimate: () => readJson<SavedEstimate | null>(LAST_ESTIMATE, null),
  setLastEstimate: (estimate: SavedEstimate) => SecureStore.setItemAsync(LAST_ESTIMATE, JSON.stringify(estimate)),
  clearLastEstimate: () => SecureStore.deleteItemAsync(LAST_ESTIMATE),

  getPushToken: () => SecureStore.getItemAsync(PUSH_TOKEN),
  setPushToken: (token: string) => SecureStore.setItemAsync(PUSH_TOKEN, token),
};
