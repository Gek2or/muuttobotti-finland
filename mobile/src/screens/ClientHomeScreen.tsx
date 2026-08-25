import { useCallback, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { Linking, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '../i18n';
import { MotionPressable, Reveal } from '../motion';
import { SavedBookingCredential, SavedEstimate, secureStorage } from '../storage';
import { colors, radius, shadow } from '../theme';

const copy = {
  fi: { trust:'4,9/5 · 34 Google-arvostelua', fast:'Laske hinta nopeasti', fastSub:'Ei kirjautumista. Saat heti alustavan arvion.', continue:'Jatka viimeistä arviota', continueSub:'Arviosi on tallessa tällä laitteella.', latest:'Viimeisin varaus', latestSub:'Avaa seuranta yhdellä painalluksella.', why:'Miksi Muuttobotti?', whyItems:['Selkeä hinta-arvio ennen varausta','Crafter 13–15 m³ muuttoihin ja kuljetuksiin','Varaus ja seuranta samassa sovelluksessa'], share:'Suosittele Muuttobottia', shareSub:'Jaa palvelu ystävälle ilman kampanjalupauksia.', help:'Tarvitsetko apua nyt?', call:'Soita', book:'Varaa nyt', saved:'Tallennettu arvio' },
  en: { trust:'4.9/5 · 34 Google reviews', fast:'Get a quick estimate', fastSub:'No sign-in. See a preliminary estimate immediately.', continue:'Continue your last estimate', continueSub:'Your estimate is saved on this device.', latest:'Latest booking', latestSub:'Open tracking with one tap.', why:'Why Muuttobotti?', whyItems:['Clear estimate before booking','Crafter 13–15 m³ for moving and transport','Booking and tracking in one app'], share:'Recommend Muuttobotti', shareSub:'Share the service with a friend.', help:'Need help now?', call:'Call', book:'Book now', saved:'Saved estimate' },
  uk: { trust:'4,9/5 · 34 відгуки Google', fast:'Швидко розрахувати ціну', fastSub:'Без входу. Попередня оцінка одразу.', continue:'Продовжити останній розрахунок', continueSub:'Розрахунок збережено на цьому пристрої.', latest:'Останнє замовлення', latestSub:'Відкрити відстеження одним натисканням.', why:'Чому Muuttobotti?', whyItems:['Зрозуміла оцінка до бронювання','Crafter 13–15 м³ для переїздів і перевезень','Бронювання та відстеження в одному застосунку'], share:'Порадити Muuttobotti', shareSub:'Поділитися сервісом з другом.', help:'Потрібна допомога зараз?', call:'Подзвонити', book:'Забронювати', saved:'Збережена оцінка' },
  ru: { trust:'4,9/5 · 34 отзыва Google', fast:'Быстро рассчитать цену', fastSub:'Без входа. Предварительная оценка сразу.', continue:'Продолжить последний расчёт', continueSub:'Расчёт сохранён на этом устройстве.', latest:'Последний заказ', latestSub:'Открыть отслеживание одним нажатием.', why:'Почему Muuttobotti?', whyItems:['Понятная оценка до бронирования','Crafter 13–15 м³ для переездов и перевозок','Бронь и отслеживание в одном приложении'], share:'Порекомендовать Muuttobotti', shareSub:'Поделиться сервисом с другом.', help:'Нужна помощь сейчас?', call:'Позвонить', book:'Забронировать', saved:'Сохранённый расчёт' },
};

export default function ClientHomeScreen() {
  const { tr, locale } = useLanguage();
  const insets = useSafeAreaInsets();
  const t = copy[locale];
  const [history, setHistory] = useState<SavedBookingCredential[]>([]);
  const [estimate, setEstimate] = useState<SavedEstimate | null>(null);

  useFocusEffect(useCallback(() => {
    Promise.all([secureStorage.getClientHistory(), secureStorage.getLastEstimate()]).then(([items, saved]) => {
      setHistory(items); setEstimate(saved);
    });
  }, []));

  const latest = history[0];
  const openEstimate = () => estimate && router.push({ pathname: '/(client)/booking', params: { service: estimate.mode, estimate: estimate.bookingNotes } });
  const share = () => Share.share({ message: 'Muuttobotti — muutot, kuljetukset ja siivous: https://muuttobotti.fi' });

  return <ScrollView style={styles.screen} contentContainerStyle={styles.wrap} contentInsetAdjustmentBehavior="never" showsVerticalScrollIndicator={false}>
    <View style={[styles.hero, { paddingTop: Math.max(insets.top, 12) + 12 }]}>
      <View style={styles.glowA} /><View style={styles.glowB} />
      <Reveal delay={40}><View style={styles.trustPill}><Text style={styles.trustStar}>★</Text><Text style={styles.trustText}>{t.trust}</Text></View></Reveal>
      <Reveal delay={90}><Text style={styles.kicker}>MUUTTOBOTTI APP</Text><Text style={styles.title}>{tr('homeTitle')}</Text><Text style={styles.copy}>{tr('homeCopy')}</Text></Reveal>
      <Reveal delay={150}><View style={styles.rateRow}><Rate label="1 muuttaja" value="59 €/h" /><Rate label="2 + Crafter" value="75 €/h" /><Rate label="Siivous" value="32,90 €/h" /></View></Reveal>
    </View>

    <View style={styles.body}>
      <Reveal delay={100}>
        <MotionPressable style={styles.primaryHook} onPress={() => router.push('/(client)/calculator')}>
          <View style={styles.primaryHookInner}><View style={{ flex: 1 }}><Text style={styles.hookEyebrow}>01 · {tr('calculator')}</Text><Text style={styles.hookTitle}>{t.fast}</Text><Text style={styles.hookText}>{t.fastSub}</Text></View><Text style={styles.hookArrow}>→</Text></View>
        </MotionPressable>
      </Reveal>

      {estimate && <Reveal delay={150}><MotionPressable style={styles.resumeCard} onPress={openEstimate}><View style={styles.resumeTop}><View><Text style={styles.resumeEyebrow}>{t.saved}</Text><Text style={styles.resumePrice}>{estimate.price} €</Text></View><View style={styles.resumeBadge}><Text style={styles.resumeBadgeText}>{estimate.mode.toUpperCase()}</Text></View></View><Text style={styles.resumeTitle}>{t.continue}</Text><Text style={styles.resumeText}>{estimate.summary}</Text><View style={styles.inlineAction}><Text style={styles.inlineActionText}>{t.book}</Text><Text style={styles.inlineActionText}>→</Text></View></MotionPressable></Reveal>}

      {latest && <Reveal delay={190}><MotionPressable style={styles.latestCard} onPress={() => router.push({ pathname: '/(client)/track', params: { id: latest.id, key: latest.key } })}><View style={{ flex: 1 }}><Text style={styles.latestEyebrow}>{t.latest}</Text><Text style={styles.latestId}>{latest.id}</Text><Text style={styles.latestText}>{t.latestSub}</Text></View><Text style={styles.latestArrow}>◎</Text></MotionPressable></Reveal>}

      <Reveal delay={220}><View style={styles.quickGrid}>
        <MotionPressable style={styles.quickCard} onPress={() => router.push('/(client)/booking')}><View style={styles.quickInner}><Text style={styles.quickIcon}>＋</Text><Text style={styles.quickTitle}>{tr('makeBooking')}</Text><Text style={styles.quickText}>{tr('bookingText')}</Text></View></MotionPressable>
        <MotionPressable style={styles.quickCard} onPress={() => router.push('/(client)/track')}><View style={styles.quickInner}><Text style={styles.quickIcon}>◎</Text><Text style={styles.quickTitle}>{tr('trackBooking')}</Text><Text style={styles.quickText}>{tr('trackText')}</Text></View></MotionPressable>
      </View></Reveal>

      <Reveal delay={260}><View style={styles.why}><Text style={styles.sectionTitle}>{t.why}</Text>{t.whyItems.map((item, index) => <View key={item} style={styles.whyRow}><View style={styles.whyNumber}><Text style={styles.whyNumberText}>0{index + 1}</Text></View><Text style={styles.whyText}>{item}</Text></View>)}</View></Reveal>

      <Reveal delay={300}><MotionPressable style={styles.shareCard} onPress={share}><View style={styles.shareInner}><View><Text style={styles.shareTitle}>{t.share}</Text><Text style={styles.shareText}>{t.shareSub}</Text></View><Text style={styles.shareIcon}>↗</Text></View></MotionPressable></Reveal>

      <Reveal delay={340}><View style={styles.contact}><Text style={styles.contactTitle}>{t.help}</Text><View style={styles.contactRow}><MotionPressable style={styles.contactButton} onPress={() => Linking.openURL('tel:+3584578767567')}><View style={styles.contactInner}><Text style={styles.contactText}>{t.call}</Text></View></MotionPressable><MotionPressable style={styles.contactButton} onPress={() => Linking.openURL('https://wa.me/3584578767567')}><View style={styles.contactInner}><Text style={styles.contactText}>WhatsApp</Text></View></MotionPressable></View></View></Reveal>
    </View>
  </ScrollView>;
}

function Rate({ label, value }: { label: string; value: string }) { return <View style={styles.rate}><Text style={styles.rateValue}>{value}</Text><Text style={styles.rateLabel}>{label}</Text></View>; }

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.paper }, wrap: { paddingBottom: 34, backgroundColor: colors.paper }, body: { paddingHorizontal: 16, paddingTop: 14, gap: 13 },
  hero: { position: 'relative', overflow: 'hidden', backgroundColor: colors.ink, borderBottomLeftRadius: 34, borderBottomRightRadius: 34, paddingHorizontal: 22, paddingBottom: 23, minHeight: 330, justifyContent: 'flex-end' },
  glowA: { position: 'absolute', width: 250, height: 250, borderRadius: 125, backgroundColor: '#274A50', opacity: .67, right: -84, top: -62 }, glowB: { position: 'absolute', width: 165, height: 165, borderRadius: 83, backgroundColor: colors.lime, opacity: .11, left: -65, bottom: -42 },
  trustPill: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#12313A', borderRadius: 999, paddingHorizontal: 11, paddingVertical: 7, marginBottom: 13 }, trustStar: { color: colors.lime, fontSize: 12 }, trustText: { color: '#D9E6E3', fontSize: 11, fontWeight: '800' },
  kicker: { color: colors.lime, fontSize: 11, fontWeight: '900', letterSpacing: 1.2 }, title: { color: '#fff', fontSize: 36, lineHeight: 39, fontWeight: '900', letterSpacing: -1.4, marginTop: 8 }, copy: { color: '#B5C5C1', fontSize: 16, lineHeight: 24, marginTop: 10 },
  rateRow: { flexDirection: 'row', gap: 7, marginTop: 18 }, rate: { flex: 1, backgroundColor: '#12313A', borderRadius: 13, padding: 10 }, rateValue: { color: '#fff', fontSize: 14, fontWeight: '900' }, rateLabel: { color: '#91A7A2', fontSize: 9, marginTop: 3, fontWeight: '800' },
  primaryHook: { minHeight: 150, borderRadius: 24, backgroundColor: colors.lime, ...shadow }, primaryHookInner: { flex: 1, padding: 20, flexDirection: 'row', alignItems: 'flex-end' }, hookEyebrow: { color: '#466100', fontSize: 10, fontWeight: '900', letterSpacing: .9, textTransform: 'uppercase' }, hookTitle: { color: colors.ink, fontSize: 24, lineHeight: 27, fontWeight: '900', marginTop: 7 }, hookText: { color: '#3E514A', fontSize: 13, lineHeight: 19, marginTop: 6, maxWidth: '92%' }, hookArrow: { color: colors.ink, fontSize: 30, fontWeight: '700', marginLeft: 10 },
  resumeCard: { borderRadius: 22, backgroundColor: colors.inkSoft, minHeight: 170 }, resumeTop: { flexDirection: 'row', justifyContent: 'space-between', padding: 18, paddingBottom: 6 }, resumeEyebrow: { color: '#9FB3AE', fontSize: 10, fontWeight: '900', letterSpacing: .9, textTransform: 'uppercase' }, resumePrice: { color: '#fff', fontSize: 34, fontWeight: '900', marginTop: 3 }, resumeBadge: { alignSelf: 'flex-start', backgroundColor: '#21444C', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 7 }, resumeBadgeText: { color: colors.lime, fontSize: 9, fontWeight: '900', letterSpacing: .8 }, resumeTitle: { color: '#fff', fontSize: 18, fontWeight: '900', paddingHorizontal: 18 }, resumeText: { color: '#AFC0BC', fontSize: 13, lineHeight: 19, paddingHorizontal: 18, marginTop: 5 }, inlineAction: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#24454D', marginTop: 15, paddingHorizontal: 18, paddingVertical: 13 }, inlineActionText: { color: colors.lime, fontWeight: '900', fontSize: 13 },
  latestCard: { backgroundColor: '#fff', borderRadius: 20, borderWidth: 1, borderColor: colors.line, minHeight: 112, ...shadow }, latestCard: { backgroundColor: '#fff', borderRadius: 20, borderWidth: 1, borderColor: colors.line, minHeight: 112, padding: 17, flexDirection: 'row', alignItems: 'center', ...shadow }, latestEyebrow: { color: colors.muted, fontSize: 10, fontWeight: '900', letterSpacing: .9, textTransform: 'uppercase' }, latestId: { color: colors.ink, fontSize: 19, fontWeight: '900', marginTop: 4 }, latestText: { color: colors.muted, fontSize: 12, marginTop: 3 }, latestArrow: { color: colors.ink, fontSize: 27, marginLeft: 10 },
  quickGrid: { flexDirection: 'row', gap: 10 }, quickCard: { flex: 1, minHeight: 150, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line, ...shadow }, quickInner: { flex: 1, padding: 16 }, quickIcon: { color: colors.ink, fontSize: 24, fontWeight: '800' }, quickTitle: { color: colors.ink, fontSize: 16, lineHeight: 20, fontWeight: '900', marginTop: 16 }, quickText: { color: colors.muted, fontSize: 11, lineHeight: 16, marginTop: 5 },
  why: { backgroundColor: '#EAF0E7', borderRadius: 22, padding: 18, gap: 4 }, sectionTitle: { color: colors.ink, fontSize: 20, fontWeight: '900', marginBottom: 6 }, whyRow: { flexDirection: 'row', gap: 11, alignItems: 'center', paddingVertical: 9, borderTopWidth: 1, borderTopColor: '#DCE4D9' }, whyNumber: { width: 34, height: 34, borderRadius: 11, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }, whyNumberText: { color: colors.ink, fontSize: 10, fontWeight: '900' }, whyText: { flex: 1, color: '#42554F', fontSize: 13, lineHeight: 19, fontWeight: '700' },
  shareCard: { minHeight: 90, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line }, shareInner: { flex: 1, padding: 17, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, shareTitle: { color: colors.ink, fontSize: 17, fontWeight: '900' }, shareText: { color: colors.muted, fontSize: 12, marginTop: 4, maxWidth: 260 }, shareIcon: { fontSize: 25, color: colors.ink },
  contact: { backgroundColor: colors.inkSoft, borderRadius: 22, padding: 18, gap: 11 }, contactTitle: { color: '#fff', fontSize: 20, fontWeight: '900' }, contactRow: { flexDirection: 'row', gap: 8 }, contactButton: { flex: 1, minHeight: 50, borderRadius: 14, backgroundColor: '#1A3D46' }, contactInner: { flex: 1, alignItems: 'center', justifyContent: 'center' }, contactText: { color: '#fff', fontSize: 14, fontWeight: '800' },
});
