import * as SecureStore from 'expo-secure-store';

const ADMIN_TOKEN = 'muuttobotti_admin_token';
const CLIENT_ID = 'muuttobotti_client_booking_id';
const CLIENT_KEY = 'muuttobotti_client_booking_key';

export const secureStorage = {
  getAdminToken: () => SecureStore.getItemAsync(ADMIN_TOKEN),
  setAdminToken: (token: string) => SecureStore.setItemAsync(ADMIN_TOKEN, token),
  clearAdminToken: () => SecureStore.deleteItemAsync(ADMIN_TOKEN),
  getClientCredentials: async () => ({
    id: (await SecureStore.getItemAsync(CLIENT_ID)) || '',
    key: (await SecureStore.getItemAsync(CLIENT_KEY)) || '',
  }),
  setClientCredentials: async (id: string, key: string) => {
    await SecureStore.setItemAsync(CLIENT_ID, id);
    await SecureStore.setItemAsync(CLIENT_KEY, key);
  },
  clearClientCredentials: async () => {
    await SecureStore.deleteItemAsync(CLIENT_ID);
    await SecureStore.deleteItemAsync(CLIENT_KEY);
  },
};
