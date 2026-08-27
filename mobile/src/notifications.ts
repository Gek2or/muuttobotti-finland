import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { secureStorage } from './storage';

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }),
  });
}

export async function registerForNotifications() {
  if (Platform.OS === 'web') return { ok: false as const, reason: 'WEB_UNSUPPORTED' };
  if (!Device.isDevice) return { ok: false as const, reason: 'PHYSICAL_DEVICE_REQUIRED' };

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('bookings', {
      name: 'Muuttobotti orders',
      description: 'Booking status, price offers and crew updates',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0,180,80,180],
      lightColor: '#C8FF36',
      sound: 'default',
    });
  }

  const current = await Notifications.getPermissionsAsync();
  const permission = current.status === 'granted' ? current : await Notifications.requestPermissionsAsync();
  if (permission.status !== 'granted') return { ok: false as const, reason: 'PERMISSION_DENIED' };

  try {
    const expo = await Notifications.getExpoPushTokenAsync();
    if (expo?.data && /^(ExponentPushToken|ExpoPushToken)\[.+\]$/.test(expo.data)) {
      await secureStorage.setPushToken(expo.data);
      return { ok: true as const, token: expo.data, type: 'expo' as const };
    }
  } catch {
    // A standalone build without an Expo/EAS project ID cannot use Expo's remote push gateway.
  }

  // The backend currently sends remote push through Expo Push API. Do not persist
  // a raw APNs/FCM token as if remote push were configured.
  await secureStorage.clearPushToken();
  return { ok: false as const, reason: 'REMOTE_PUSH_NOT_CONFIGURED' };
}

export async function scheduleLocalBookingNotice(title:string,body:string,data:Record<string,unknown>={}) {
  if (Platform.OS === 'web') return null;
  return Notifications.scheduleNotificationAsync({ content:{ title,body,sound:true,data }, trigger:null });
}
