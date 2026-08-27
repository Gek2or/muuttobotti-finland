import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

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

const webStorage = {
  getItemAsync: async (key: string) => {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(key);
  },
  setItemAsync: async (key: string, value: string) => {
    if (typeof window !== 'undefined') window.localStorage.setItem(key, value);
  },
  deleteItemAsync: async (key: string) => {
    if (typeof window !== 'undefined') window.localStorage.removeItem(key);
  },
};

const storage = Platform.OS === 'web' ? webStorage : SecureStore;

function isSavedCredential(value: unknown): value is SavedBookingCredential {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<SavedBookingCredential>;
  return typeof item.id === 'string' && item.id.length > 0 && typeof item.key === 'string' && item.key.length > 0;
}

async function readHistory(): Promise<SavedBookingCredential[]> {
  const raw = await storage.getItemAsync(CLIENT_HISTORY);
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
  await storage.setItemAsync(CLIENT_HISTORY, JSON.stringify(items.slice(0, 20)));
}

async function readPendingEstimate(): Promise<PendingEstimate | null> {
  const raw = await storage.getItemAsync(PENDING_ESTIMATE);
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
  getAdminToken: () => storage.getItemAsync(ADMIN_TOKEN),
  setAdminToken: (token: string) => storage.setItemAsync(ADMIN_TOKEN, token),
  clearAdminToken: () => storage.deleteItemAsync(ADMIN_TOKEN),
  getClientCredentials: async () => ({
    id: (await storage.getItemAsync(CLIENT_ID)) || '',
    key: (await storage.getItemAsync(CLIENT_KEY)) || '',
  }),
  getClientHistory: readHistory,
  setClientCredentials: async (id: string, key: string) => {
    await storage.setItemAsync(CLIENT_ID, id);
    await storage.setItemAsync(CLIENT_KEY, key);
    const current: SavedBookingCredential[] = await readHistory();
    const next: SavedBookingCredential = { id, key, savedAt: new Date().toISOString() };
    await writeHistory([next, ...current.filter((item: SavedBookingCredential) => item.id !== id)]);
  },
  removeClientCredential: async (id: string) => {
    const current: SavedBookingCredential[] = await readHistory();
    await writeHistory(current.filter((item: SavedBookingCredential) => item.id !== id));
    const activeId = await storage.getItemAsync(CLIENT_ID);
    if (activeId === id) {
      await storage.deleteItemAsync(CLIENT_ID);
      await storage.deleteItemAsync(CLIENT_KEY);
    }
  },
  clearClientCredentials: async () => {
    await storage.deleteItemAsync(CLIENT_ID);
    await storage.deleteItemAsync(CLIENT_KEY);
  },
  clearClientHistory: async () => {
    await storage.deleteItemAsync(CLIENT_HISTORY);
    await storage.deleteItemAsync(CLIENT_ID);
    await storage.deleteItemAsync(CLIENT_KEY);
  },
  getClientSession: async () => ({
    token: (await storage.getItemAsync(CLIENT_SESSION)) || '',
    email: (await storage.getItemAsync(CLIENT_EMAIL)) || '',
  }),
  setClientSession: async (token: string, email: string) => {
    await storage.setItemAsync(CLIENT_SESSION, token);
    await storage.setItemAsync(CLIENT_EMAIL, email);
  },
  clearClientSession: async () => {
    await storage.deleteItemAsync(CLIENT_SESSION);
    await storage.deleteItemAsync(CLIENT_EMAIL);
  },
  getPushToken: () => storage.getItemAsync(PUSH_TOKEN),
  setPushToken: (token: string) => storage.setItemAsync(PUSH_TOKEN, token),
  clearPushToken: () => storage.deleteItemAsync(PUSH_TOKEN),
  getPendingEstimate: readPendingEstimate,
  setPendingEstimate: (estimate: Omit<PendingEstimate, 'savedAt'>) => storage.setItemAsync(PENDING_ESTIMATE, JSON.stringify({ ...estimate, savedAt: new Date().toISOString() })),
  clearPendingEstimate: () => storage.deleteItemAsync(PENDING_ESTIMATE),
};
