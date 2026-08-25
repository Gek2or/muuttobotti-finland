import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { router, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LanguageProvider } from '../src/i18n';
import { secureStorage } from '../src/storage';
import { colors } from '../src/theme';

export default function RootLayout() {
  useEffect(() => {
    const openFromNotification = async (data: Record<string, unknown> | undefined) => {
      if (!data) return;
      const id = String(data.bookingId || data.id || '').trim().toUpperCase();
      const key = String(data.accessKey || data.key || '').trim().toLowerCase();
      if (!id) return;
      if (key) {
        await secureStorage.setClientCredentials(id, key);
        router.push({ pathname: '/(client)/track', params: { id, key } });
        return;
      }
      const session = await secureStorage.getClientSession();
      if (session.token) router.push({ pathname: '/account-order', params: { id } });
    };
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      void openFromNotification(response.notification.request.content.data as Record<string, unknown> | undefined);
    });
    void Notifications.getLastNotificationResponseAsync().then(response => {
      if (response) return openFromNotification(response.notification.request.content.data as Record<string, unknown> | undefined);
    });
    return () => subscription.remove();
  }, []);

  return <LanguageProvider>
    <StatusBar style="light" backgroundColor={colors.ink} />
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
