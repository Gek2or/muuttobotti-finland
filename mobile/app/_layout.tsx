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
          contentStyle: { backgroundColor: colors.ink },
          headerBackTitle: 'Takaisin',
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="client" options={{ headerShown: false }} />
        <Stack.Screen name="(client)" options={{ headerShown: false }} />
        <Stack.Screen name="calculator" options={{ title: 'Hintalaskuri', contentStyle: { backgroundColor: colors.paper } }} />
        <Stack.Screen name="booking" options={{ title: 'Uusi varaus', contentStyle: { backgroundColor: colors.paper } }} />
        <Stack.Screen name="track" options={{ title: 'Seuraa varausta', contentStyle: { backgroundColor: colors.paper } }} />
        <Stack.Screen name="admin" options={{ title: 'Admin', contentStyle: { backgroundColor: colors.paper } }} />
      </Stack>
    </LanguageProvider>
  );
}
