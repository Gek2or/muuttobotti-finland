import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { router, Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Linking, Platform } from 'react-native';
import { LanguageProvider } from '../src/i18n';
import { secureStorage } from '../src/storage';
import { colors } from '../src/theme';

async function openBookingTarget(idValue: unknown, keyValue?: unknown) {
  const id = String(idValue || '').trim().toUpperCase();
  const key = String(keyValue || '').trim().toLowerCase();
  if (!id) return;
  if (key) {
    await secureStorage.setClientCredentials(id, key);
    router.push({ pathname: '/(client)/track', params: { id, key } });
    return;
  }
  const session = await secureStorage.getClientSession();
  if (session.token) router.push({ pathname: '/account-order', params: { id } });
  else router.replace('/');
}

async function openAppUrl(rawUrl: string | null) {
  if (!rawUrl) return;
  try {
    const url = new URL(rawUrl);
    const hostOrPath = `${url.host}${url.pathname}`.toLowerCase();
    if (!hostOrPath.includes('track') && !hostOrPath.includes('booking')) return;
    const id = url.searchParams.get('id') || url.searchParams.get('bookingId');
    const key = url.searchParams.get('key') || url.searchParams.get('accessKey');
    await openBookingTarget(id, key);
  } catch {
    // Ignore malformed external links and keep the current screen intact.
  }
}

export default function RootLayout() {
  const segments = useSegments();

  useEffect(() => {
    const guardProtectedRoute = async () => {
      const route = String(segments[0] || '');
      if (route === 'admin') {
        const token = await secureStorage.getAdminToken();
        if (!token) router.replace('/');
        return;
      }
      if (route === 'account-order') {
        const session = await secureStorage.getClientSession();
        if (!session.token) router.replace('/');
      }
    };
    void guardProtectedRoute();
  }, [segments]);

  useEffect(() => {
    const openFromNotification = async (data: Record<string, unknown> | undefined) => {
      if (!data) return;
      await openBookingTarget(data.bookingId || data.id, data.accessKey || data.key);
    };

    const linkSubscription = Linking.addEventListener('url', event => { void openAppUrl(event.url); });
    void Linking.getInitialURL().then(openAppUrl);

    if (Platform.OS === 'web') {
      return () => linkSubscription.remove();
    }

    const notificationSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      void openFromNotification(response.notification.request.content.data as Record<string, unknown> | undefined);
    });
    void Notifications.getLastNotificationResponseAsync().then(response => {
      if (response) return openFromNotification(response.notification.request.content.data as Record<string, unknown> | undefined);
    });

    return () => {
      notificationSubscription.remove();
      linkSubscription.remove();
    };
  }, []);

  return <LanguageProvider>
    <StatusBar style="light" />
    <Stack screenOptions={{ headerStyle:{backgroundColor:colors.ink}, headerTintColor:'#fff', headerTitleStyle:{fontWeight:'900'}, contentStyle:{backgroundColor:colors.ink}, headerBackTitle:'Takaisin' }}>
      <Stack.Screen name="index" options={{headerShown:false}} />
      <Stack.Screen name="client" options={{headerShown:false}} />
      <Stack.Screen name="(client)" options={{headerShown:false}} />
      <Stack.Screen name="calculator" options={{title:'Hintalaskuri',contentStyle:{backgroundColor:colors.paper}}} />
      <Stack.Screen name="booking" options={{title:'Uusi varaus',contentStyle:{backgroundColor:colors.paper}}} />
      <Stack.Screen name="track" options={{title:'Seuraa varausta',contentStyle:{backgroundColor:colors.paper}}} />
      <Stack.Screen name="account-order" options={{title:'Muuttobotti · Tilaus',contentStyle:{backgroundColor:colors.paper}}} />
      <Stack.Screen name="admin" options={{title:'Operations',contentStyle:{backgroundColor:colors.paper}}} />
    </Stack>
  </LanguageProvider>;
}
