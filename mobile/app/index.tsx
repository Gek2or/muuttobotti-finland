import { router } from 'expo-router';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { localeOptions, useLanguage } from '../src/i18n';
import { colors, radius, shadow } from '../src/theme';

export default function IndexScreen() {
  const { locale, setLocale, tr } = useLanguage();
  return <SafeAreaView style={styles.safe}><View style={styles.wrap}>
    <View>
      <View style={styles.logoRow}><View style={styles.mark}><Text style={styles.markText}>M</Text></View><Text style={styles.logo}>Muuttobotti</Text></View>
      <View style={styles.languages}>{localeOptions.map(item => <TouchableOpacity key={item.value} style={[styles.lang, locale === item.value && styles.langActive]} onPress={() => setLocale(item.value)}><Text style={[styles.langText, locale === item.value && styles.langTextActive]}>{item.label}</Text></TouchableOpacity>)}</View>
      <Text style={styles.kicker}>{tr('roleKicker')}</Text>
      <Text style={styles.title}>{tr('roleTitle')}</Text>
      <Text style={styles.copy}>{tr('roleCopy')}</Text>
    </View>
    <View style={styles.actions}>
      <TouchableOpacity style={styles.primary} onPress={() => router.push('/client')}><Text style={styles.primaryText}>{tr('clientRole')}</Text></TouchableOpacity>
      <TouchableOpacity style={styles.secondary} onPress={() => router.push('/admin')}><Text style={styles.secondaryText}>{tr('adminRole')}</Text></TouchableOpacity>
    </View>
    <Text style={styles.footer}>Autochemix Oy · Muuttobotti</Text>
  </View></SafeAreaView>;
}

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.ink }, wrap: { flex: 1, padding: 24, justifyContent: 'space-between' }, logoRow: { flexDirection: 'row', alignItems: 'center', gap: 11, marginTop: 14 }, mark: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' }, markText: { color: colors.ink, fontWeight: '950', fontSize: 21 }, logo: { color: '#fff', fontSize: 24, fontWeight: '900', letterSpacing: -.8 }, languages: { flexDirection: 'row', gap: 6, marginTop: 22 }, lang: { minWidth: 46, height: 38, borderRadius: 12, borderWidth: 1, borderColor: '#28464E', alignItems: 'center', justifyContent: 'center' }, langActive: { backgroundColor: colors.lime, borderColor: colors.lime }, langText: { color: '#AFC1BD', fontWeight: '900', fontSize: 12 }, langTextActive: { color: colors.ink }, kicker: { color: colors.lime, fontSize: 12, fontWeight: '900', letterSpacing: 1.2, marginTop: 35 }, title: { color: '#fff', fontSize: 42, lineHeight: 45, fontWeight: '950', letterSpacing: -1.8, marginTop: 11 }, copy: { color: '#AFC1BF', fontSize: 17, lineHeight: 26, marginTop: 16 }, actions: { gap: 12 }, primary: { minHeight: 58, borderRadius: radius.md, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center', ...shadow }, primaryText: { color: colors.ink, fontSize: 17, fontWeight: '900' }, secondary: { minHeight: 56, borderRadius: radius.md, borderWidth: 1, borderColor: '#315058', alignItems: 'center', justifyContent: 'center' }, secondaryText: { color: '#fff', fontSize: 16, fontWeight: '850' }, footer: { color: '#71888A', textAlign: 'center', fontSize: 12 } });