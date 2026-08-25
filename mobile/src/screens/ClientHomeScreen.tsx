import { useCallback, useEffect, useRef, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { Animated, Easing, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Booking, getBooking } from '../api';
import { useLanguage } from '../i18n';
import { secureStorage } from '../storage';
import { colors, radius, shadow } from '../theme';

const statusCopy = {
  fi: { new: 'Vastaanotettu', confirmed: 'Vahvistettu', assigned: 'Tekijä määritetty', in_progress: 'Käynnissä', completed: 'Valmis', cancelled: 'Peruttu', change_requested: 'Muutos pyydetty', active: 'AKTIIVINEN VARAUS', open: 'Avaa seuranta', loading: 'Päivitetään tila…' },
  en: { new: 'Received', confirmed: 'Confirmed', assigned: 'Team assigned', in_progress: 'In progress', completed: 'Completed', cancelled: 'Cancelled', change_requested: 'Change requested', active: 'ACTIVE BOOKING', open: 'Open tracking', loading: 'Updating status…' },
  uk: { new: 'Отримано', confirmed: 'Підтверджено', assigned: 'Команду призначено', in_progress: 'В роботі', completed: 'Завершено', cancelled: 'Скасовано', change_requested: 'Запит на зміну', active: 'АКТИВНЕ ЗАМОВЛЕННЯ', open: 'Відкрити відстеження', loading: 'Оновлюємо статус…' },
  ru: { new: 'Получено', confirmed: 'Подтверждено', assigned: 'Команда назначена', in_progress: 'В работе', completed: 'Завершено', cancelled: 'Отменено', change_requested: 'Запрошено изменение', active: 'АКТИВНЫЙ ЗАКАЗ', open: 'Открыть отслеживание', loading: 'Обновляем статус…' },
} as const;

export default function ClientHomeScreen() {
  const { tr, locale } = useLanguage();
  const insets = useSafeAreaInsets();
  const glow = useRef(new Animated.Value(0)).current;
  const enter = useRef(new Animated.Value(0)).current;
  const [booking, setBooking] = useState<Booking | null>(null);
  const [credentials, setCredentials] = useState<{ id: string; key: string } | null>(null);
  const [loadingBooking, setLoadingBooking] = useState(false);
  const st = statusCopy[locale];

  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(glow, { toValue: 1, duration: 3200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(glow, { toValue: 0, duration: 3200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ])).start();
    Animated.timing(enter, { toValue: 1, duration: 520, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [enter, glow]);

  const loadCurrentBooking = useCallback(async () => {
    const saved = await secureStorage.getClientCredentials();
    if (!saved.id || !saved.key) {
      setCredentials(null);
      setBooking(null);
      return;
    }
    setCredentials(saved);
    setLoadingBooking(true);
    try {
      const result = await getBooking(saved.id, saved.key);
      setBooking(result.booking);
    } catch {
      setBooking(null);
    } finally {
      setLoadingBooking(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { void loadCurrentBooking(); }, [loadCurrentBooking]));

  const cards = [
    { icon: '€', title: tr('calculatePrice'), text: tr('calculateText'), route: '/(client)/calculator' as const, accent: true },
    { icon: '+', title: tr('makeBooking'), text: tr('bookingText'), route: '/(client)/booking' as const },
    { icon: '◎', title: tr('trackBooking'), text: tr('trackText'), route: '/(client)/track' as const },
  ];

  const openTracking = () => {
    if (!credentials) return router.push('/(client)/track');
    router.push({ pathname: '/(client)/track', params: { id: credentials.id, key: credentials.key } });
  };

  return <ScrollView style={styles.screen} contentContainerStyle={styles.wrap} contentInsetAdjustmentBehavior="never" showsVerticalScrollIndicator={false}>
    <View style={[styles.hero, { paddingTop: Math.max(insets.top, 12) + 12 }]}>
      <Animated.View style={[styles.glowA, { transform: [{ translateX: glow.interpolate({ inputRange: [0, 1], outputRange: [0, -18] }) }, { translateY: glow.interpolate({ inputRange: [0, 1], outputRange: [0, 25] }) }, { scale: glow.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }) }] }]} />
      <Animated.View style={[styles.glowB, { opacity: glow.interpolate({ inputRange: [0, 1], outputRange: [.07, .16] }), transform: [{ scale: glow.interpolate({ inputRange: [0, 1], outputRange: [.9, 1.15] }) }] }]} />
      <View style={styles.scanline} />
      <Animated.View style={{ opacity: enter, transform: [{ translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }] }}>
        <View style={styles.liveRow}><View style={styles.liveDot} /><Text style={styles.kicker}>MUUTTOBOTTI LIVE · v1.1</Text></View>
        <Text style={styles.title}>{tr('homeTitle')}</Text>
        <Text style={styles.copy}>{tr('homeCopy')}</Text>
        <View style={styles.rateRow}><Rate label="1 muuttaja" value="59 €/h" /><Rate label="2 + Crafter" value="75 €/h" /><Rate label="Siivous" value="32,90 €/h" /></View>
      </Animated.View>
    </View>

    <Animated.View style={[styles.body, { opacity: enter, transform: [{ translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [22, 0] }) }] }]}>
      {(booking || loadingBooking) && <TouchableOpacity activeOpacity={.86} style={styles.activeBooking} onPress={openTracking}>
        <View style={styles.activeTop}><View><Text style={styles.activeKicker}>{st.active}</Text><Text style={styles.activeId}>{booking?.id || credentials?.id}</Text></View><View style={styles.statusBadge}><View style={styles.statusDot} /><Text style={styles.statusText}>{loadingBooking ? st.loading : st[booking?.status as keyof typeof st] || booking?.status}</Text></View></View>
        {booking && <><Text style={styles.activeRoute}>{booking.pickup} → {booking.destination}</Text><Text style={styles.activeMeta}>{booking.preferred_date} · {booking.preferred_time} · {booking.service}</Text></>}
        <View style={styles.openRow}><Text style={styles.openText}>{st.open}</Text><Text style={styles.openArrow}>→</Text></View>
      </TouchableOpacity>}

      <View style={styles.grid}>{cards.map((card, index) => <TouchableOpacity key={card.title} activeOpacity={.84} style={[styles.card, card.accent && styles.cardAccent]} onPress={() => router.push(card.route)}><View style={[styles.cardIcon, card.accent && styles.cardIconAccent]}><Text style={styles.cardIconText}>{card.icon}</Text></View><Text style={styles.cardTitle}>{card.title}</Text><Text style={styles.cardText}>{card.text}</Text><Text style={styles.arrow}>→</Text><Text style={styles.cardIndex}>0{index + 1}</Text></TouchableOpacity>)}</View>

      <View style={styles.contact}>
        <View><Text style={styles.contactKicker}>HUMAN SUPPORT</Text><Text style={styles.contactTitle}>{tr('help')}</Text></View>
        <View style={styles.contactRow}><TouchableOpacity style={styles.contactButton} onPress={() => Linking.openURL('tel:+3584578767567')}><Text style={styles.contactText}>Soita</Text></TouchableOpacity><TouchableOpacity style={styles.contactButton} onPress={() => Linking.openURL('https://wa.me/3584578767567')}><Text style={styles.contactText}>WhatsApp</Text></TouchableOpacity></View>
      </View>
    </Animated.View>
  </ScrollView>;
}

function Rate({ label, value }: { label: string; value: string }) { return <View style={styles.rate}><Text style={styles.rateValue}>{value}</Text><Text style={styles.rateLabel}>{label}</Text></View>; }

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.paper }, wrap: { paddingBottom: 34, backgroundColor: colors.paper },
  hero: { position: 'relative', overflow: 'hidden', backgroundColor: '#06191F', borderBottomLeftRadius: 36, borderBottomRightRadius: 36, paddingHorizontal: 22, paddingBottom: 24, minHeight: 310, justifyContent: 'flex-end' },
  scanline: { position: 'absolute', left: 0, right: 0, bottom: 75, height: 1, backgroundColor: '#31515A', opacity: .25 },
  body: { paddingHorizontal: 15, paddingTop: 13, gap: 12 },
  glowA: { position: 'absolute', width: 240, height: 240, borderRadius: 120, backgroundColor: '#285660', opacity: .55, right: -85, top: -70 },
  glowB: { position: 'absolute', width: 190, height: 190, borderRadius: 95, backgroundColor: colors.lime, left: -85, bottom: -55 },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 7 }, liveDot: { width: 7, height: 7, borderRadius: 99, backgroundColor: colors.lime, shadowColor: colors.lime, shadowOpacity: 1, shadowRadius: 9 },
  kicker: { color: colors.lime, fontSize: 10, fontWeight: '900', letterSpacing: 1.2 }, title: { color: '#fff', fontSize: 36, lineHeight: 39, fontWeight: '950', letterSpacing: -1.5, marginTop: 9 }, copy: { color: '#ADC0BC', fontSize: 15, lineHeight: 23, marginTop: 9 },
  rateRow: { flexDirection: 'row', gap: 7, marginTop: 17 }, rate: { flex: 1, backgroundColor: 'rgba(16,48,56,.82)', borderWidth: 1, borderColor: '#20434B', borderRadius: 13, padding: 10 }, rateValue: { color: '#fff', fontSize: 14, fontWeight: '950' }, rateLabel: { color: '#8FA6A1', fontSize: 9, marginTop: 3, fontWeight: '800' },
  activeBooking: { backgroundColor: '#0A252C', borderRadius: radius.lg, padding: 17, borderWidth: 1, borderColor: '#28505A', ...shadow }, activeTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }, activeKicker: { color: colors.lime, fontSize: 9, fontWeight: '950', letterSpacing: 1 }, activeId: { color: '#fff', fontSize: 19, fontWeight: '950', marginTop: 3 }, statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#15373F', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 7, maxWidth: 170 }, statusDot: { width: 7, height: 7, borderRadius: 99, backgroundColor: colors.lime }, statusText: { color: '#DDEAE7', fontSize: 9, fontWeight: '900', flexShrink: 1 }, activeRoute: { color: '#fff', fontSize: 14, fontWeight: '750', lineHeight: 20, marginTop: 14 }, activeMeta: { color: '#8EA7A2', fontSize: 11, marginTop: 4 }, openRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#21444C' }, openText: { color: colors.lime, fontSize: 12, fontWeight: '900' }, openArrow: { color: colors.lime, fontSize: 20 },
  grid: { gap: 9 }, card: { backgroundColor: '#fff', borderRadius: radius.lg, padding: 17, minHeight: 145, borderWidth: 1, borderColor: colors.line, ...shadow }, cardAccent: { backgroundColor: '#F3FFE2', borderColor: '#D2F293' }, cardIcon: { width: 39, height: 39, borderRadius: 12, backgroundColor: '#EDF2ED', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }, cardIconAccent: { backgroundColor: colors.lime }, cardIconText: { color: colors.ink, fontSize: 17, fontWeight: '950' }, cardTitle: { color: colors.ink, fontSize: 20, fontWeight: '950' }, cardText: { color: colors.muted, fontSize: 13, lineHeight: 20, marginTop: 5, maxWidth: '84%' }, arrow: { position: 'absolute', right: 18, bottom: 17, color: colors.ink, fontSize: 23, fontWeight: '900' }, cardIndex: { position: 'absolute', right: 16, top: 15, color: '#C3CECA', fontSize: 9, fontWeight: '950', letterSpacing: .8 },
  contact: { backgroundColor: '#0C2A32', borderRadius: radius.lg, padding: 18, gap: 12, borderWidth: 1, borderColor: '#234B54' }, contactKicker: { color: '#7F9B96', fontSize: 9, fontWeight: '900', letterSpacing: 1 }, contactTitle: { color: '#fff', fontSize: 20, fontWeight: '950', marginTop: 3 }, contactRow: { flexDirection: 'row', gap: 8 }, contactButton: { flex: 1, minHeight: 48, borderRadius: 13, backgroundColor: '#173B44', alignItems: 'center', justifyContent: 'center' }, contactText: { color: '#fff', fontSize: 13, fontWeight: '900' },
});
