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

  // Keep remote-push state honest: the backend currently delivers through Expo Push API,
  // so a raw APNs/FCM token must not be displayed as if remote push were enabled.
  await secureStorage.clearPushToken();
  return { ok: false as const, reason: 'REMOTE_PUSH_NOT_CONFIGURED' };
}

export async function scheduleLocalBookingNotice(title:string,body:string,data:Record<string,unknown>={}) {
  return Notifications.scheduleNotificationAsync({ content:{ title,body,sound:true,data }, trigger:null });
}
