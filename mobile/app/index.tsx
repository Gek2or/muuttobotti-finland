import { router } from 'expo-router';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radius, shadow } from '../src/theme';

export default function IndexScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.wrap}>
        <View>
          <View style={styles.logoRow}><View style={styles.mark}><Text style={styles.markText}>M</Text></View><Text style={styles.logo}>Muuttobotti</Text></View>
          <Text style={styles.kicker}>MUUTTO · KULJETUS · SIIVOUS</Text>
          <Text style={styles.title}>Kaikki muuttoon liittyvä samassa sovelluksessa.</Text>
          <Text style={styles.copy}>Laske hinta, tee varaus, seuraa tilausta ja pidä yhteys Muuttobottiin. Admin-näkymä näyttää kaikki liidit ja suositukset.</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.primary} onPress={() => router.push('/client')}>
            <Text style={styles.primaryText}>Jatka asiakkaana</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondary} onPress={() => router.push('/admin')}>
            <Text style={styles.secondaryText}>Avaa admin</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>Autochemix Oy · Muuttobotti</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.ink },
  wrap: { flex: 1, padding: 24, justifyContent: 'space-between' },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 11, marginTop: 14 },
  mark: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' },
  markText: { color: colors.ink, fontWeight: '950', fontSize: 21 },
  logo: { color: '#fff', fontSize: 24, fontWeight: '900', letterSpacing: -0.8 },
  kicker: { color: colors.lime, fontSize: 12, fontWeight: '900', letterSpacing: 1.3, marginTop: 48 },
  title: { color: '#fff', fontSize: 43, lineHeight: 46, fontWeight: '950', letterSpacing: -1.9, marginTop: 12 },
  copy: { color: '#AFC1BF', fontSize: 17, lineHeight: 27, marginTop: 18 },
  actions: { gap: 12 },
  primary: { minHeight: 58, borderRadius: radius.md, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center', ...shadow },
  primaryText: { color: colors.ink, fontSize: 17, fontWeight: '900' },
  secondary: { minHeight: 56, borderRadius: radius.md, borderWidth: 1, borderColor: '#315058', alignItems: 'center', justifyContent: 'center' },
  secondaryText: { color: '#fff', fontSize: 16, fontWeight: '850' },
  footer: { color: '#71888A', textAlign: 'center', fontSize: 12, marginBottom: 2 },
});
