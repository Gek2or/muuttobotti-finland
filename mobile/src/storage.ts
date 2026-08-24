import * as SecureStore from 'expo-secure-store';

const ADMIN_TOKEN = 'muuttobotti_admin_token';
const CLIENT_ID = 'muuttobotti_client_booking_id';
const CLIENT_KEY = 'muuttobotti_client_booking_key';
const CLIENT_HISTORY = 'muuttobotti_client_booking_history';
const PUSH_TOKEN = 'muuttobotti_push_token';

export type SavedBookingCredential = { id: string; key: string; savedAt: string };

async function readHistory(): Promise<SavedBookingCredential[]> {
  const raw = await SecureStore.getItemAsync(CLIENT_HISTORY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(item => item?.id && item?.key).slice(0, 20) : [];
  } catch { return []; }
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
  getPushToken: () => SecureStore.getItemAsync(PUSH_TOKEN),
  setPushToken: (token: string) => SecureStore.setItemAsync(PUSH_TOKEN, token),
};