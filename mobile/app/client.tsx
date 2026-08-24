import { router } from 'expo-router';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radius, shadow } from '../src/theme';

const cards = [
  { title: 'Laske hinta', text: 'Muutto, siivous tai Crafter-kuljetus.', route: '/calculator' as const, accent: true },
  { title: 'Tee varaus', text: 'Lähetä osoitteet, aika, yhteystiedot ja kuvat.', route: '/booking' as const },
  { title: 'Seuraa varausta', text: 'Avaa tilaus varausnumerolla ja pääsykoodilla.', route: '/track' as const },
];

export default function ClientScreen() {
  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>MUUTTOBOTTI APP</Text>
        <Text style={styles.title}>Muutto ilman turhaa säätöä.</Text>
        <Text style={styles.copy}>Hintalaskuri, varaus, seuranta ja yhteydenpito samassa paikassa.</Text>
      </View>

      <View style={styles.grid}>
        {cards.map(card => (
          <TouchableOpacity key={card.title} style={[styles.card, card.accent && styles.cardAccent]} onPress={() => router.push(card.route)}>
            <Text style={[styles.cardTitle, card.accent && styles.cardTitleAccent]}>{card.title}</Text>
            <Text style={[styles.cardText, card.accent && styles.cardTextAccent]}>{card.text}</Text>
            <Text style={[styles.arrow, card.accent && styles.cardTitleAccent]}>→</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.contact}>
        <Text style={styles.contactTitle}>Tarvitsetko apua?</Text>
        <TouchableOpacity style={styles.contactButton} onPress={() => Linking.openURL('tel:+3584578767567')}><Text style={styles.contactText}>Soita · 045 787 67567</Text></TouchableOpacity>
        <TouchableOpacity style={styles.contactButton} onPress={() => Linking.openURL('https://wa.me/3584578767567')}><Text style={styles.contactText}>WhatsApp</Text></TouchableOpacity>
        <TouchableOpacity style={styles.contactButton} onPress={() => Linking.openURL('mailto:autochemixfin@gmail.com')}><Text style={styles.contactText}>autochemixfin@gmail.com</Text></TouchableOpacity>
      </View>

      <View style={styles.info}>
        <Text style={styles.sectionTitle}>Muuttobotti</Text>
        <Text style={styles.infoText}>Muutot · kuljetukset · siivous · ikkunanpesu · kalusteasennus · poiskuljetus.</Text>
        <Text style={styles.infoText}>Uusimaa + koko Suomi sopimuksesta.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 18, paddingBottom: 36, gap: 18 },
  hero: { backgroundColor: colors.ink, borderRadius: radius.xl, padding: 24, minHeight: 225, justifyContent: 'flex-end' },
  kicker: { color: colors.lime, fontSize: 11, fontWeight: '900', letterSpacing: 1.2 },
  title: { color: '#fff', fontSize: 34, lineHeight: 37, fontWeight: '950', letterSpacing: -1.3, marginTop: 9 },
  copy: { color: '#B2C2C0', fontSize: 16, lineHeight: 24, marginTop: 12 },
  grid: { gap: 12 },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: 20, minHeight: 145, borderWidth: 1, borderColor: colors.line, ...shadow },
  cardAccent: { backgroundColor: colors.lime, borderColor: colors.lime },
  cardTitle: { color: colors.ink, fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },
  cardTitleAccent: { color: colors.ink },
  cardText: { color: colors.muted, fontSize: 15, lineHeight: 22, marginTop: 7, maxWidth: '88%' },
  cardTextAccent: { color: '#36503C' },
  arrow: { position: 'absolute', right: 20, bottom: 18, fontSize: 25, fontWeight: '700', color: colors.ink },
  contact: { backgroundColor: colors.inkSoft, borderRadius: radius.lg, padding: 20, gap: 9 },
  contactTitle: { color: '#fff', fontSize: 20, fontWeight: '900', marginBottom: 4 },
  sectionTitle: { color: colors.ink, fontSize: 20, fontWeight: '900', marginBottom: 4 },
  contactButton: { minHeight: 48, borderRadius: radius.md, backgroundColor: '#1A3D46', justifyContent: 'center', paddingHorizontal: 15 },
  contactText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  info: { backgroundColor: '#ECF1E8', borderRadius: radius.lg, padding: 20 },
  infoText: { color: '#536560', fontSize: 15, lineHeight: 23, marginTop: 6 },
});
