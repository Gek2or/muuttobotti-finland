import { useFocusEffect, router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { localeOptions, useLanguage } from '../../src/i18n';
import { registerForNotifications } from '../../src/notifications';
import { SavedBookingCredential, secureStorage } from '../../src/storage';
import { colors, radius } from '../../src/theme';

export default function ProfileScreen() {
  const { locale, setLocale, tr } = useLanguage();
  const [history, setHistory] = useState<SavedBookingCredential[]>([]);
  const [pushState, setPushState] = useState('');
  useFocusEffect(useCallback(() => { secureStorage.getClientHistory().then(setHistory); }, []));

  const enablePush = async () => {
    const result = await registerForNotifications();
    setPushState(result.ok ? tr('notificationReady') : tr('notificationUnavailable'));
  };

  return <ScrollView contentContainerStyle={styles.wrap}>
    <View style={styles.hero}><Text style={styles.kicker}>MUUTTOBOTTI</Text><Text style={styles.title}>{tr('profile')}</Text><Text style={styles.copy}>{tr('privacyCopy')}</Text></View>

    <View style={styles.section}><Text style={styles.sectionTitle}>{tr('language')}</Text><View style={styles.langRow}>{localeOptions.map(item => <TouchableOpacity key={item.value} style={[styles.lang, locale === item.value && styles.langActive]} onPress={() => setLocale(item.value)}><Text style={[styles.langText, locale === item.value && styles.langTextActive]}>{item.label}</Text></TouchableOpacity>)}</View></View>

    <View style={styles.section}><Text style={styles.sectionTitle}>{tr('savedBookings')}</Text>{history.length === 0 ? <Text style={styles.muted}>{tr('noBookings')}</Text> : history.map(item => <TouchableOpacity key={item.id} style={styles.booking} onPress={() => router.push({ pathname: '/track', params: { id: item.id, key: item.key } })}><View><Text style={styles.bookingId}>{item.id}</Text><Text style={styles.bookingMeta}>{new Date(item.savedAt).toLocaleDateString()}</Text></View><Text style={styles.arrow}>→</Text></TouchableOpacity>)}</View>

    <View style={styles.section}><Text style={styles.sectionTitle}>{tr('notifications')}</Text><Text style={styles.muted}>{pushState || tr('notificationUnavailable')}</Text><TouchableOpacity style={styles.primary} onPress={enablePush}><Text style={styles.primaryText}>{tr('enableNotifications')}</Text></TouchableOpacity></View>

    <View style={styles.section}><Text style={styles.sectionTitle}>{tr('help')}</Text><TouchableOpacity style={styles.action} onPress={() => Linking.openURL('tel:+3584578767567')}><Text style={styles.actionText}>045 787 67567</Text></TouchableOpacity><TouchableOpacity style={styles.action} onPress={() => Linking.openURL('https://wa.me/3584578767567')}><Text style={styles.actionText}>WhatsApp</Text></TouchableOpacity><TouchableOpacity style={styles.action} onPress={() => Linking.openURL('mailto:autochemixfin@gmail.com')}><Text style={styles.actionText}>autochemixfin@gmail.com</Text></TouchableOpacity></View>
  </ScrollView>;
}

const styles = StyleSheet.create({ wrap: { padding: 16, paddingBottom: 34, gap: 13 }, hero: { backgroundColor: colors.ink, borderRadius: radius.xl, padding: 22 }, kicker: { color: colors.lime, fontSize: 11, fontWeight: '900', letterSpacing: 1.2 }, title: { color: '#fff', fontSize: 34, fontWeight: '950', marginTop: 6 }, copy: { color: '#AFC1BD', fontSize: 14, lineHeight: 21, marginTop: 8 }, section: { backgroundColor: '#fff', borderRadius: radius.lg, padding: 17, borderWidth: 1, borderColor: colors.line, gap: 9 }, sectionTitle: { color: colors.ink, fontSize: 18, fontWeight: '900' }, muted: { color: colors.muted, fontSize: 14, lineHeight: 21 }, langRow: { flexDirection: 'row', gap: 7 }, lang: { flex: 1, minHeight: 45, borderRadius: 12, backgroundColor: '#EEF2ED', alignItems: 'center', justifyContent: 'center' }, langActive: { backgroundColor: colors.ink }, langText: { color: '#667773', fontSize: 13, fontWeight: '900' }, langTextActive: { color: '#fff' }, booking: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#EDF0EC' }, bookingId: { color: colors.ink, fontSize: 15, fontWeight: '900' }, bookingMeta: { color: colors.muted, fontSize: 11, marginTop: 2 }, arrow: { color: colors.ink, fontSize: 21 }, primary: { minHeight: 50, borderRadius: 13, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' }, primaryText: { color: colors.ink, fontWeight: '900' }, action: { minHeight: 46, borderRadius: 12, backgroundColor: '#F0F3EE', paddingHorizontal: 14, justifyContent: 'center' }, actionText: { color: colors.ink, fontSize: 14, fontWeight: '800' } });