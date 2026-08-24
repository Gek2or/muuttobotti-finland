import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { secureStorage } from './storage';

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }),
});

export async function registerForNotifications() {
  if (!Device.isDevice) return { ok: false as const, reason: 'PHYSICAL_DEVICE_REQUIRED' };

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('bookings', {
      name: 'Muuttobotti bookings',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 180, 80, 180],
      lightColor: '#B8FF00',
    });
  }

  const current = await Notifications.getPermissionsAsync();
  const permission = current.status === 'granted' ? current : await Notifications.requestPermissionsAsync();
  if (permission.status !== 'granted') return { ok: false as const, reason: 'PERMISSION_DENIED' };

  try {
    const token = await Notifications.getDevicePushTokenAsync();
    const value = typeof token.data === 'string' ? token.data : JSON.stringify(token.data);
    await secureStorage.setPushToken(value);
    return { ok: true as const, token: value, type: token.type };
  } catch {
    return { ok: false as const, reason: 'TOKEN_UNAVAILABLE' };
  }
}

export async function scheduleLocalBookingNotice(title: string, body: string) {
  return Notifications.scheduleNotificationAsync({ content: { title, body, sound: true }, trigger: null });
}