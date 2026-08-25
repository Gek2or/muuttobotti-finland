import { useCallback, useEffect, useRef, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { Animated, Linking, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '../i18n';
import { SavedBookingCredential, secureStorage } from '../storage';
import { colors, radius, shadow } from '../theme';

const copy = {
  fi: { trust: '4,9/5 · 34 Google-arvostelua', estimate: 'Laske hinta', estimateSub: 'Saat alustavan arvion alle minuutissa.', book: 'Varaa palvelu', bookSub: 'Osoitteet, aika, yhteystiedot ja kuvat.', latest: 'Viimeisin varaus', latestSub: 'Avaa seuranta yhdellä painalluksella.', why: 'Miksi Muuttobotti?', why1: 'Selkeä arvio ennen tilausta', why2: 'Crafter 13–15 m³', why3: 'Varaus ja seuranta samassa sovelluksessa', share: 'Jaa Muuttobotti', help: 'Tarvitsetko apua?' },
  en: { trust: '4.9/5 · 34 Google reviews', estimate: 'Calculate price', estimateSub: 'Get a preliminary estimate in under a minute.', book: 'Book a service', bookSub: 'Addresses, time, contacts and photos.', latest: 'Latest booking', latestSub: 'Open tracking with one tap.', why: 'Why Muuttobotti?', why1: 'Clear estimate before booking', why2: 'Crafter 13–15 m³', why3: 'Booking and tracking in one app', share: 'Share Muuttobotti', help: 'Need help?' },
  uk: { trust: '4,9/5 · 34 відгуки Google', estimate: 'Розрахувати ціну', estimateSub: 'Попередня оцінка менш ніж за хвилину.', book: 'Забронювати послугу', bookSub: 'Адреси, час, контакти та фото.', latest: 'Останнє замовлення', latestSub: 'Відкрити відстеження одним натисканням.', why: 'Чому Muuttobotti?', why1: 'Зрозуміла оцінка до бронювання', why2: 'Crafter 13–15 м³', why3: 'Бронювання і відстеження в одному застосунку', share: 'Поділитися Muuttobotti', help: 'Потрібна допомога?' },
  ru: { trust: '4,9/5 · 34 отзыва Google', estimate: 'Рассчитать цену', estimateSub: 'Предварительная оценка меньше чем за минуту.', book: 'Забронировать услугу', bookSub: 'Адреса, время, контакты и фото.', latest: 'Последний заказ', latestSub: 'Открыть отслеживание одним нажатием.', why: 'Почему Muuttobotti?', why1: 'Понятная оценка до бронирования', why2: 'Crafter 13–15 м³', why3: 'Бронь и отслеживание в одном приложении', share: 'Поделиться Muuttobotti', help: 'Нужна помощь?' },
} as const;

export default function ClientHomeScreen() {
  const { tr, locale } = useLanguage();
  const t = copy[locale];
  const insets = useSafeAreaInsets();
  const [history, setHistory] = useState<SavedBookingCredential[]>([]);
  const fade = useRef(new Animated.Value(0)).current;
  const lift = useRef(new Animated.Value(14)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 420, useNativeDriver: true }),
      Animated.spring(lift, { toValue: 0, damping: 17, stiffness: 150, useNativeDriver: true }),
    ]).start();
  }, [fade, lift]);

  useFocusEffect(useCallback(() => { secureStorage.getClientHistory().then(setHistory); }, []));
  const latest = history[0];

  return <ScrollView style={styles.screen} contentContainerStyle={styles.wrap} contentInsetAdjustmentBehavior="never" showsVerticalScrollIndicator={false}>
    <View style={[styles.hero, { paddingTop: Math.max(insets.top, 12) + 14 }]}>
      <View style={styles.glowA} /><View style={styles.glowB} />
      <Animated.View style={{ opacity: fade, transform: [{ translateY: lift }] }}>
        <View style={styles.trust}><Text style={styles.star}>★</Text><Text style={styles.trustText}>{t.trust}</Text></View>
        <Text style={styles.kicker}>MUUTTOBOTTI APP · V1</Text>
        <Text style={styles.title}>{tr('homeTitle')}</Text>
        <Text style={styles.copy}>{tr('homeCopy')}</Text>
        <View style={styles.rateRow}><Rate label="1 muuttaja" value="59 €/h" /><Rate label="2 + Crafter" value="75 €/h" /><Rate label="Siivous" value="32,90 €/h" /></View>
      </Animated.View>
    </View>

    <Animated.View style={[styles.body, { opacity: fade, transform: [{ translateY: lift }] }]}>
      <TouchableOpacity activeOpacity={.88} style={styles.primaryCard} onPress={() => router.push('/(client)/calculator')}>
        <Text style={styles.eyebrow}>01 · {tr('calculator')}</Text><Text style={styles.primaryTitle}>{t.estimate}</Text><Text style={styles.primaryText}>{t.estimateSub}</Text><Text style={styles.primaryArrow}>→</Text>
      </TouchableOpacity>

      <TouchableOpacity activeOpacity={.9} style={styles.card} onPress={() => router.push('/(client)/booking')}>
        <Text style={styles.eyebrowDark}>02 · {tr('booking')}</Text><Text style={styles.cardTitle}>{t.book}</Text><Text style={styles.cardText}>{t.bookSub}</Text><Text style={styles.cardArrow}>＋</Text>
      </TouchableOpacity>

      {latest && <TouchableOpacity activeOpacity={.9} style={styles.latestCard} onPress={() => router.push({ pathname: '/(client)/track', params: { id: latest.id, key: latest.key } })}>
        <View style={{ flex: 1 }}><Text style={styles.eyebrowDark}>{t.latest}</Text><Text style={styles.latestId}>{latest.id}</Text><Text style={styles.cardText}>{t.latestSub}</Text></View><Text style={styles.latestIcon}>◎</Text>
      </TouchableOpacity>}

      <View style={styles.why}><Text style={styles.sectionTitle}>{t.why}</Text><Why text={t.why1} /><Why text={t.why2} /><Why text={t.why3} /></View>

      <TouchableOpacity style={styles.share} onPress={() => Share.share({ message: 'Muuttobotti — muutot, kuljetukset ja siivous: https://muuttobotti.fi' })}><Text style={styles.shareText}>{t.share}</Text><Text style={styles.shareIcon}>↗</Text></TouchableOpacity>

      <View style={styles.contact}><Text style={styles.contactTitle}>{t.help}</Text><View style={styles.contactRow}><TouchableOpacity style={styles.contactButton} onPress={() => Linking.openURL('tel:+3584578767567')}><Text style={styles.contactText}>☎ 045 787 67567</Text></TouchableOpacity><TouchableOpacity style={styles.contactButton} onPress={() => Linking.openURL('https://wa.me/3584578767567')}><Text style={styles.contactText}>WhatsApp</Text></TouchableOpacity></View></View>
    </Animated.View>
  </ScrollView>;
}

function Rate({ label, value }: { label: string; value: string }) { return <View style={styles.rate}><Text style={styles.rateValue}>{value}</Text><Text style={styles.rateLabel}>{label}</Text></View>; }
function Why({ text }: { text: string }) { return <View style={styles.whyRow}><View style={styles.dot} /><Text style={styles.whyText}>{text}</Text></View>; }

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.paper }, wrap: { paddingBottom: 34, backgroundColor: colors.paper },
  hero: { position: 'relative', overflow: 'hidden', backgroundColor: colors.ink, borderBottomLeftRadius: 34, borderBottomRightRadius: 34, paddingHorizontal: 22, paddingBottom: 24, minHeight: 330, justifyContent: 'flex-end' },
  glowA: { position: 'absolute', width: 250, height: 250, borderRadius: 125, backgroundColor: '#274A50', opacity: .68, right: -86, top: -66 }, glowB: { position: 'absolute', width: 160, height: 160, borderRadius: 80, backgroundColor: colors.lime, opacity: .10, left: -64, bottom: -42 },
  trust: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#12313A', borderRadius: 999, paddingHorizontal: 11, paddingVertical: 7, marginBottom: 13 }, star: { color: colors.lime, fontSize: 12 }, trustText: { color: '#D7E5E2', fontSize: 11, fontWeight: '800' },
  kicker: { color: colors.lime, fontSize: 11, fontWeight: '900', letterSpacing: 1.2 }, title: { color: '#fff', fontSize: 36, lineHeight: 39, fontWeight: '900', letterSpacing: -1.4, marginTop: 8 }, copy: { color: '#B5C5C1', fontSize: 16, lineHeight: 24, marginTop: 10 },
  rateRow: { flexDirection: 'row', gap: 7, marginTop: 18 }, rate: { flex: 1, backgroundColor: '#12313A', borderRadius: 13, padding: 10 }, rateValue: { color: '#fff', fontSize: 14, fontWeight: '900' }, rateLabel: { color: '#91A7A2', fontSize: 9, marginTop: 3, fontWeight: '800' },
  body: { paddingHorizontal: 16, paddingTop: 14, gap: 12 },
  primaryCard: { minHeight: 150, borderRadius: 24, backgroundColor: colors.lime, padding: 20, ...shadow }, eyebrow: { color: '#456000', fontSize: 10, fontWeight: '900', letterSpacing: .9, textTransform: 'uppercase' }, primaryTitle: { color: colors.ink, fontSize: 25, fontWeight: '900', marginTop: 8 }, primaryText: { color: '#3F514A', fontSize: 13, lineHeight: 19, marginTop: 6, maxWidth: '84%' }, primaryArrow: { position: 'absolute', right: 20, bottom: 17, color: colors.ink, fontSize: 30, fontWeight: '700' },
  card: { minHeight: 130, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line, borderRadius: 21, padding: 18, ...shadow }, eyebrowDark: { color: '#7B8986', fontSize: 10, fontWeight: '900', letterSpacing: .8, textTransform: 'uppercase' }, cardTitle: { color: colors.ink, fontSize: 21, fontWeight: '900', marginTop: 7 }, cardText: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 5 }, cardArrow: { position: 'absolute', right: 19, bottom: 16, color: colors.ink, fontSize: 25, fontWeight: '700' },
  latestCard: { minHeight: 108, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line, borderRadius: 21, padding: 18, ...shadow }, latestId: { color: colors.ink, fontSize: 19, fontWeight: '900', marginTop: 5 }, latestIcon: { color: colors.ink, fontSize: 28, marginLeft: 10 },
  why: { backgroundColor: '#EAF0E7', borderRadius: 21, padding: 18 }, sectionTitle: { color: colors.ink, fontSize: 20, fontWeight: '900', marginBottom: 6 }, whyRow: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 42, borderTopWidth: 1, borderTopColor: '#DAE3D7' }, dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.limeStrong }, whyText: { flex: 1, color: '#425852', fontSize: 13, lineHeight: 19, fontWeight: '700' },
  share: { minHeight: 58, borderRadius: 17, paddingHorizontal: 17, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, shareText: { color: colors.ink, fontSize: 15, fontWeight: '900' }, shareIcon: { color: colors.ink, fontSize: 20 },
  contact: { backgroundColor: colors.inkSoft, borderRadius: 21, padding: 18, gap: 10 }, contactTitle: { color: '#fff', fontSize: 20, fontWeight: '900' }, contactRow: { flexDirection: 'row', gap: 8 }, contactButton: { flex: 1, minHeight: 49, borderRadius: 13, backgroundColor: '#1A3D46', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 }, contactText: { color: '#fff', fontSize: 12, fontWeight: '800', textAlign: 'center' },
});
