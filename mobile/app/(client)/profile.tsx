import { useFocusEffect, router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { localeOptions, useLanguage } from '../../src/i18n';
import { registerForNotifications } from '../../src/notifications';
import { SavedBookingCredential, secureStorage } from '../../src/storage';
import { colors, radius } from '../../src/theme';

const copy = {
  fi: { active: 'Aktiivinen kirjautuminen', none: 'Ei aktiivista varausta', logout: 'Kirjaudu ulos', remove: 'Poista', clear: 'Poista kaikki tallennetut varaukset', pushOn: 'Push-ilmoitukset käytössä tällä laitteella', pushOff: 'Push-ilmoituksia ei ole vielä otettu käyttöön', version: 'Muuttobotti Mobile v1.1.0' },
  en: { active: 'Active session', none: 'No active booking', logout: 'Sign out', remove: 'Remove', clear: 'Clear all saved bookings', pushOn: 'Push notifications are enabled on this device', pushOff: 'Push notifications are not enabled yet', version: 'Muuttobotti Mobile v1.1.0' },
  uk: { active: 'Активний вхід', none: 'Немає активного замовлення', logout: 'Вийти', remove: 'Видалити', clear: 'Видалити всі збережені замовлення', pushOn: 'Push-сповіщення увімкнені на цьому пристрої', pushOff: 'Push-сповіщення ще не увімкнені', version: 'Muuttobotti Mobile v1.1.0' },
  ru: { active: 'Активный вход', none: 'Нет активного заказа', logout: 'Выйти', remove: 'Удалить', clear: 'Удалить все сохранённые заказы', pushOn: 'Push-уведомления включены на этом устройстве', pushOff: 'Push-уведомления ещё не включены', version: 'Muuttobotti Mobile v1.1.0' },
} as const;

export default function ProfileScreen() {
  const { locale, setLocale, tr } = useLanguage();
  const t = copy[locale];
  const [history, setHistory] = useState<SavedBookingCredential[]>([]);
  const [activeId, setActiveId] = useState('');
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushState, setPushState] = useState('');

  const refresh = useCallback(async () => {
    const [items, current, pushToken] = await Promise.all([
      secureStorage.getClientHistory(),
      secureStorage.getClientCredentials(),
      secureStorage.getPushToken(),
    ]);
    setHistory(items);
    setActiveId(current.id);
    setPushEnabled(Boolean(pushToken));
  }, []);

  useFocusEffect(useCallback(() => { void refresh(); }, [refresh]));

  const enablePush = async () => {
    const result = await registerForNotifications();
    setPushState(result.ok ? tr('notificationReady') : tr('notificationUnavailable'));
    await refresh();
  };

  const signOut = async () => {
    await secureStorage.clearClientCredentials();
    setActiveId('');
    router.replace('/');
  };

  const removeBooking = async (id: string) => {
    await secureStorage.removeClientCredential(id);
    await refresh();
  };

  const clearBookings = () => {
    Alert.alert(t.clear, '', [
      { text: 'Cancel', style: 'cancel' },
      { text: t.clear, style: 'destructive', onPress: async () => { await secureStorage.clearClientHistory(); await refresh(); } },
    ]);
  };

  return <ScrollView contentContainerStyle={styles.wrap}>
    <View style={styles.hero}><Text style={styles.kicker}>MUUTTOBOTTI · v1.1</Text><Text style={styles.title}>{tr('profile')}</Text><Text style={styles.copy}>{tr('privacyCopy')}</Text></View>

    <View style={styles.section}><Text style={styles.sectionTitle}>{t.active}</Text><Text style={styles.sessionId}>{activeId || t.none}</Text>{activeId ? <TouchableOpacity style={styles.secondary} onPress={signOut}><Text style={styles.secondaryText}>{t.logout}</Text></TouchableOpacity> : null}</View>

    <View style={styles.section}><Text style={styles.sectionTitle}>{tr('language')}</Text><View style={styles.langRow}>{localeOptions.map(item => <TouchableOpacity key={item.value} style={[styles.lang, locale === item.value && styles.langActive]} onPress={() => setLocale(item.value)}><Text style={[styles.langText, locale === item.value && styles.langTextActive]}>{item.label}</Text></TouchableOpacity>)}</View></View>

    <View style={styles.section}><Text style={styles.sectionTitle}>{tr('savedBookings')}</Text>{history.length === 0 ? <Text style={styles.muted}>{tr('noBookings')}</Text> : history.map(item => <View key={item.id} style={styles.booking}><TouchableOpacity style={styles.bookingMain} onPress={() => router.push({ pathname: '/track', params: { id: item.id, key: item.key } })}><View><Text style={styles.bookingId}>{item.id}</Text><Text style={styles.bookingMeta}>{new Date(item.savedAt).toLocaleDateString()}</Text></View><Text style={styles.arrow}>→</Text></TouchableOpacity><TouchableOpacity style={styles.remove} onPress={() => removeBooking(item.id)}><Text style={styles.removeText}>{t.remove}</Text></TouchableOpacity></View>)}{history.length > 0 ? <TouchableOpacity style={styles.dangerButton} onPress={clearBookings}><Text style={styles.dangerText}>{t.clear}</Text></TouchableOpacity> : null}</View>

    <View style={styles.section}><Text style={styles.sectionTitle}>{tr('notifications')}</Text><Text style={styles.muted}>{pushState || (pushEnabled ? t.pushOn : t.pushOff)}</Text><TouchableOpacity style={styles.primary} onPress={enablePush}><Text style={styles.primaryText}>{tr('enableNotifications')}</Text></TouchableOpacity></View>

    <View style={styles.section}><Text style={styles.sectionTitle}>{tr('help')}</Text><TouchableOpacity style={styles.action} onPress={() => Linking.openURL('tel:+3584578767567')}><Text style={styles.actionText}>045 787 67567</Text></TouchableOpacity><TouchableOpacity style={styles.action} onPress={() => Linking.openURL('https://wa.me/3584578767567')}><Text style={styles.actionText}>WhatsApp</Text></TouchableOpacity><TouchableOpacity style={styles.action} onPress={() => Linking.openURL('mailto:autochemixfin@gmail.com')}><Text style={styles.actionText}>autochemixfin@gmail.com</Text></TouchableOpacity></View>

    <Text style={styles.version}>{t.version}</Text>
  </ScrollView>;
}

const styles = StyleSheet.create({ wrap: { padding: 16, paddingBottom: 34, gap: 13 }, hero: { backgroundColor: colors.ink, borderRadius: radius.xl, padding: 22 }, kicker: { color: colors.lime, fontSize: 11, fontWeight: '900', letterSpacing: 1.2 }, title: { color: '#fff', fontSize: 34, fontWeight: '950', marginTop: 6 }, copy: { color: '#AFC1BD', fontSize: 14, lineHeight: 21, marginTop: 8 }, section: { backgroundColor: '#fff', borderRadius: radius.lg, padding: 17, borderWidth: 1, borderColor: colors.line, gap: 9 }, sectionTitle: { color: colors.ink, fontSize: 18, fontWeight: '900' }, muted: { color: colors.muted, fontSize: 14, lineHeight: 21 }, sessionId: { color: colors.ink, fontSize: 15, fontWeight: '850' }, langRow: { flexDirection: 'row', gap: 7 }, lang: { flex: 1, minHeight: 45, borderRadius: 12, backgroundColor: '#EEF2ED', alignItems: 'center', justifyContent: 'center' }, langActive: { backgroundColor: colors.ink }, langText: { color: '#667773', fontSize: 13, fontWeight: '900' }, langTextActive: { color: '#fff' }, booking: { borderTopWidth: 1, borderTopColor: '#EDF0EC', paddingTop: 8, gap: 7 }, bookingMain: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 }, bookingId: { color: colors.ink, fontSize: 15, fontWeight: '900' }, bookingMeta: { color: colors.muted, fontSize: 11, marginTop: 2 }, arrow: { color: colors.ink, fontSize: 21 }, remove: { alignSelf: 'flex-start', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 9, backgroundColor: '#F4F1EF' }, removeText: { color: colors.danger, fontSize: 12, fontWeight: '900' }, primary: { minHeight: 50, borderRadius: 13, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' }, primaryText: { color: colors.ink, fontWeight: '900' }, secondary: { minHeight: 48, borderRadius: 13, borderWidth: 1, borderColor: '#CAD6CC', alignItems: 'center', justifyContent: 'center' }, secondaryText: { color: colors.ink, fontWeight: '900' }, dangerButton: { minHeight: 44, borderRadius: 12, backgroundColor: '#FFF4F1', alignItems: 'center', justifyContent: 'center', marginTop: 4 }, dangerText: { color: colors.danger, fontSize: 12, fontWeight: '900' }, action: { minHeight: 46, borderRadius: 12, backgroundColor: '#F0F3EE', paddingHorizontal: 14, justifyContent: 'center' }, actionText: { color: colors.ink, fontSize: 14, fontWeight: '800' }, version: { textAlign: 'center', color: colors.muted, fontSize: 11, marginTop: 2 } });
