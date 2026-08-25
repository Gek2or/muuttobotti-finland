import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';
import { useLanguage } from '../../src/i18n';
import { colors } from '../../src/theme';

const icon = (value: string, focused: boolean) => <View style={{ width: 34, height: 30, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: focused ? colors.lime : 'transparent' }}><Text style={{ fontSize: 17, color: focused ? colors.ink : '#78908B', fontWeight: '900' }}>{value}</Text></View>;

export default function ClientTabsLayout() {
  const { tr } = useLanguage();
  return <Tabs screenOptions={{
    headerStyle: { backgroundColor: colors.ink }, headerTintColor: '#fff', headerTitleStyle: { fontWeight: '900' },
    tabBarStyle: { height: 78, paddingTop: 7, paddingBottom: 9, backgroundColor: '#071B22', borderTopColor: '#17343C', borderTopWidth: 1, elevation: 18 },
    tabBarActiveTintColor: colors.lime, tabBarInactiveTintColor: '#78908B', tabBarLabelStyle: { fontSize: 9, fontWeight: '900', marginTop: 1 },
  }}>
    <Tabs.Screen name="index" options={{ title: tr('home'), headerShown: false, tabBarIcon: ({ focused }) => icon('⌂', focused) }} />
    <Tabs.Screen name="calculator" options={{ title: tr('calculator'), tabBarIcon: ({ focused }) => icon('€', focused) }} />
    <Tabs.Screen name="booking" options={{ title: tr('booking'), tabBarIcon: ({ focused }) => icon('+', focused) }} />
    <Tabs.Screen name="track" options={{ title: tr('tracking'), tabBarIcon: ({ focused }) => icon('◎', focused) }} />
    <Tabs.Screen name="profile" options={{ title: tr('profile'), tabBarIcon: ({ focused }) => icon('◈', focused) }} />
  </Tabs>;
}