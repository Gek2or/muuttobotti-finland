import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { useLanguage } from '../../src/i18n';
import { colors } from '../../src/theme';

const icon = (value: string, focused: boolean) => <Text style={{ fontSize: 18, color: focused ? colors.ink : '#748681', fontWeight: '900' }}>{value}</Text>;

export default function ClientTabsLayout() {
  const { tr } = useLanguage();
  return <Tabs screenOptions={{
    headerStyle: { backgroundColor: colors.ink }, headerTintColor: '#fff', headerTitleStyle: { fontWeight: '900' },
    tabBarStyle: { height: 72, paddingTop: 7, paddingBottom: 8, backgroundColor: '#fff', borderTopColor: '#E4E9E3' },
    tabBarActiveTintColor: colors.ink, tabBarInactiveTintColor: '#748681', tabBarLabelStyle: { fontSize: 10, fontWeight: '850' },
  }}>
    <Tabs.Screen name="index" options={{ title: tr('home'), headerShown: false, tabBarIcon: ({ focused }) => icon('⌂', focused) }} />
    <Tabs.Screen name="calculator" options={{ title: tr('calculator'), tabBarIcon: ({ focused }) => icon('€', focused) }} />
    <Tabs.Screen name="booking" options={{ title: tr('booking'), tabBarIcon: ({ focused }) => icon('+', focused) }} />
    <Tabs.Screen name="track" options={{ title: tr('tracking'), tabBarIcon: ({ focused }) => icon('◎', focused) }} />
    <Tabs.Screen name="profile" options={{ title: tr('profile'), tabBarIcon: ({ focused }) => icon('≡', focused) }} />
  </Tabs>;
}