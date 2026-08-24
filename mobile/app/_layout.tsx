import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LanguageProvider } from '../src/i18n';
import { colors } from '../src/theme';

export default function RootLayout() {
  return (
    <LanguageProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.ink },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '800' },
          contentStyle: { backgroundColor: colors.paper },
          headerBackTitle: 'Takaisin',
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="client" options={{ headerShown: false }} />
        <Stack.Screen name="(client)" options={{ headerShown: false }} />
        <Stack.Screen name="calculator" options={{ title: 'Hintalaskuri' }} />
        <Stack.Screen name="booking" options={{ title: 'Uusi varaus' }} />
        <Stack.Screen name="track" options={{ title: 'Seuraa varausta' }} />
        <Stack.Screen name="admin" options={{ title: 'Admin' }} />
      </Stack>
    </LanguageProvider>
  );
}