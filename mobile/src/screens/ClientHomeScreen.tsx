import { router } from 'expo-router';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLanguage } from '../i18n';
import { colors, radius, shadow } from '../theme';

export default function ClientHomeScreen() {
  const { tr } = useLanguage();
  const cards = [
    { title: tr('calculatePrice'), text: tr('calculateText'), route: '/(client)/calculator' as const, accent: true },
    { title: tr('makeBooking'), text: tr('bookingText'), route: '/(client)/booking' as const },
    { title: tr('trackBooking'), text: tr('trackText'), route: '/(client)/track' as const },
  ];

  return <ScrollView contentContainerStyle={styles.wrap}>
    <View style={styles.hero}>
      <View style={styles.glowA} /><View style={styles.glowB} />
      <Text style={styles.kicker}>MUUTTOBOTTI APP</Text>
      <Text style={styles.title}>{tr('homeTitle')}</Text>
      <Text style={styles.copy}>{tr('homeCopy')}</Text>
      <View style={styles.rateRow}><Rate label="1 muuttaja" value="59 €/h" /><Rate label="2 + Crafter" value="75 €/h" /><Rate label="Siivous" value="32,90 €/h" /></View>
    </View>

    <View style={styles.grid}>{cards.map(card => <TouchableOpacity key={card.title} style={[styles.card, card.accent && styles.cardAccent]} onPress={() => router.push(card.route)}><Text style={styles.cardTitle}>{card.title}</Text><Text style={styles.cardText}>{card.text}</Text><Text style={styles.arrow}>→</Text></TouchableOpacity>)}</View>

    <View style={styles.contact}>
      <Text style={styles.contactTitle}>{tr('help')}</Text>
      <View style={styles.contactRow}><TouchableOpacity style={styles.contactButton} onPress={() => Linking.openURL('tel:+3584578767567')}><Text style={styles.contactText}>Soita</Text></TouchableOpacity><TouchableOpacity style={styles.contactButton} onPress={() => Linking.openURL('https://wa.me/3584578767567')}><Text style={styles.contactText}>WhatsApp</Text></TouchableOpacity></View>
    </View>

    <View style={styles.info}><Text style={styles.infoTitle}>Muuttobotti</Text><Text style={styles.infoText}>{tr('services')}</Text><Text style={styles.infoText}>{tr('coverage')}</Text></View>
  </ScrollView>;
}

function Rate({ label, value }: { label: string; value: string }) { return <View style={styles.rate}><Text style={styles.rateValue}>{value}</Text><Text style={styles.rateLabel}>{label}</Text></View>; }

const styles = StyleSheet.create({
  wrap: { padding: 16, paddingBottom: 32, gap: 14, backgroundColor: colors.paper },
  hero: { position: 'relative', overflow: 'hidden', backgroundColor: colors.ink, borderRadius: radius.xl, padding: 23, minHeight: 320, justifyContent: 'flex-end' },
  glowA: { position: 'absolute', width: 220, height: 220, borderRadius: 110, backgroundColor: '#274A50', opacity: .6, right: -80, top: -60 },
  glowB: { position: 'absolute', width: 150, height: 150, borderRadius: 75, backgroundColor: colors.lime, opacity: .10, left: -55, bottom: -35 },
  kicker: { color: colors.lime, fontSize: 11, fontWeight: '900', letterSpacing: 1.2 },
  title: { color: '#fff', fontSize: 35, lineHeight: 38, fontWeight: '950', letterSpacing: -1.4, marginTop: 8 },
  copy: { color: '#B5C5C1', fontSize: 16, lineHeight: 24, marginTop: 10 },
  rateRow: { flexDirection: 'row', gap: 7, marginTop: 18 }, rate: { flex: 1, backgroundColor: '#12313A', borderRadius: 13, padding: 10 }, rateValue: { color: '#fff', fontSize: 14, fontWeight: '900' }, rateLabel: { color: '#91A7A2', fontSize: 9, marginTop: 3, fontWeight: '800' },
  grid: { gap: 10 }, card: { backgroundColor: '#fff', borderRadius: radius.lg, padding: 19, minHeight: 130, borderWidth: 1, borderColor: colors.line, ...shadow }, cardAccent: { backgroundColor: '#F4FFE2', borderColor: '#D9F6A8' }, cardTitle: { color: colors.ink, fontSize: 21, fontWeight: '900' }, cardText: { color: colors.muted, fontSize: 14, lineHeight: 21, marginTop: 6, maxWidth: '86%' }, arrow: { position: 'absolute', right: 19, bottom: 18, color: colors.ink, fontSize: 24, fontWeight: '800' },
  contact: { backgroundColor: colors.inkSoft, borderRadius: radius.lg, padding: 18, gap: 10 }, contactTitle: { color: '#fff', fontSize: 20, fontWeight: '900' }, contactRow: { flexDirection: 'row', gap: 8 }, contactButton: { flex: 1, minHeight: 48, borderRadius: 13, backgroundColor: '#1A3D46', alignItems: 'center', justifyContent: 'center' }, contactText: { color: '#fff', fontSize: 14, fontWeight: '850' },
  info: { backgroundColor: '#ECF1E8', borderRadius: radius.lg, padding: 19 }, infoTitle: { color: colors.ink, fontSize: 19, fontWeight: '900' }, infoText: { color: '#586A65', fontSize: 14, lineHeight: 22, marginTop: 5 },
});