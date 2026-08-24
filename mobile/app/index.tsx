import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { ActivityIndicator, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { getAdminBookings, getBooking } from '../src/api';
import { localeOptions, useLanguage } from '../src/i18n';
import { secureStorage } from '../src/storage';
import { colors, radius, shadow } from '../src/theme';

type Role = 'client' | 'admin';

const loginCopy = {
  fi: {
    welcome: 'Tervetuloa takaisin.',
    subtitle: 'Avaa oma varauksesi tai hallitse Muuttobotin tilauksia.',
    client: 'Asiakas', admin: 'Admin',
    clientTitle: 'Avaa oma varaus',
    clientCopy: 'Käytä varauksen jälkeen saamaasi varausnumeroa ja yksityistä pääsykoodia.',
    adminTitle: 'Admin-kirjautuminen',
    adminCopy: 'Vain Muuttobotin henkilöstölle. Token tallennetaan laitteen SecureStoreen.',
    bookingId: 'Varausnumero', accessKey: 'Pääsykoodi', adminToken: 'Admin token',
    signIn: 'Kirjaudu sisään', checking: 'Tarkistetaan…',
    newCustomer: 'Uusi asiakas?', continueGuest: 'Jatka ilman kirjautumista',
    hint: 'Pääsykoodi löytyy varauksen vahvistuksen yksityisestä linkistä.',
    invalidClient: 'Varausta ei löytynyt näillä tunnuksilla.', invalidAdmin: 'Admin-kirjautuminen epäonnistui.',
  },
  en: {
    welcome: 'Welcome back.', subtitle: 'Open your booking or manage Muuttobotti orders.', client: 'Customer', admin: 'Admin',
    clientTitle: 'Open your booking', clientCopy: 'Use the booking number and private access code received after booking.',
    adminTitle: 'Admin sign in', adminCopy: 'For Muuttobotti staff only. The token is stored in the device SecureStore.',
    bookingId: 'Booking number', accessKey: 'Access code', adminToken: 'Admin token', signIn: 'Sign in', checking: 'Checking…',
    newCustomer: 'New customer?', continueGuest: 'Continue without signing in', hint: 'The access code is included in your private booking link.',
    invalidClient: 'No booking was found with these credentials.', invalidAdmin: 'Admin sign in failed.',
  },
  uk: {
    welcome: 'З поверненням.', subtitle: 'Відкрийте своє замовлення або керуйте замовленнями Muuttobotti.', client: 'Клієнт', admin: 'Admin',
    clientTitle: 'Відкрити замовлення', clientCopy: 'Використайте номер замовлення та приватний код доступу, отримані після бронювання.',
    adminTitle: 'Вхід адміністратора', adminCopy: 'Лише для команди Muuttobotti. Token зберігається в SecureStore пристрою.',
    bookingId: 'Номер замовлення', accessKey: 'Код доступу', adminToken: 'Admin token', signIn: 'Увійти', checking: 'Перевіряємо…',
    newCustomer: 'Новий клієнт?', continueGuest: 'Продовжити без входу', hint: 'Код доступу є у приватному посиланні на замовлення.',
    invalidClient: 'Замовлення з такими даними не знайдено.', invalidAdmin: 'Не вдалося увійти до admin.',
  },
  ru: {
    welcome: 'С возвращением.', subtitle: 'Откройте свой заказ или управляйте заказами Muuttobotti.', client: 'Клиент', admin: 'Администратор',
    clientTitle: 'Открыть свой заказ', clientCopy: 'Используйте номер заказа и приватный код доступа, полученные после бронирования.',
    adminTitle: 'Вход администратора', adminCopy: 'Только для команды Muuttobotti. Token сохраняется в SecureStore устройства.',
    bookingId: 'Номер заказа', accessKey: 'Код доступа', adminToken: 'Admin token', signIn: 'Войти', checking: 'Проверяем…',
    newCustomer: 'Новый клиент?', continueGuest: 'Продолжить без входа', hint: 'Код доступа находится в приватной ссылке после бронирования.',
    invalidClient: 'Заказ с такими данными не найден.', invalidAdmin: 'Не удалось войти в admin.',
  },
} as const;

export default function IndexScreen() {
  const { locale, setLocale } = useLanguage();
  const t = loginCopy[locale];
  const [role, setRole] = useState<Role>('client');
  const [bookingId, setBookingId] = useState('');
  const [accessKey, setAccessKey] = useState('');
  const [adminToken, setAdminToken] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    void (async () => {
      const [client, token] = await Promise.all([secureStorage.getClientCredentials(), secureStorage.getAdminToken()]);
      if (client.id) setBookingId(client.id);
      if (client.key) setAccessKey(client.key);
      if (token) setAdminToken(token);
    })();
  }, []);

  const signIn = async () => {
    setBusy(true);
    setMessage('');
    try {
      if (role === 'client') {
        const id = bookingId.trim().toUpperCase();
        const key = accessKey.trim().toLowerCase();
        if (!id || !key) throw new Error(t.invalidClient);
        await getBooking(id, key);
        await secureStorage.setClientCredentials(id, key);
        router.replace({ pathname: '/(client)/track', params: { id, key } });
      } else {
        const token = adminToken.trim();
        if (!token) throw new Error(t.invalidAdmin);
        await getAdminBookings(token);
        await secureStorage.setAdminToken(token);
        router.replace('/admin');
      }
    } catch (error) {
      setMessage(error instanceof Error && error.message ? error.message : role === 'client' ? t.invalidClient : t.invalidAdmin);
    } finally {
      setBusy(false);
    }
  };

  const changeRole = (next: Role) => { setRole(next); setMessage(''); };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled">
          <View style={styles.brandRow}>
            <View style={styles.logoRow}><View style={styles.mark}><Text style={styles.markText}>M</Text></View><Text style={styles.logo}>Muuttobotti</Text></View>
            <View style={styles.languages}>{localeOptions.map(item => <TouchableOpacity key={item.value} style={[styles.lang, locale === item.value && styles.langActive]} onPress={() => setLocale(item.value)}><Text style={[styles.langText, locale === item.value && styles.langTextActive]}>{item.label}</Text></TouchableOpacity>)}</View>
          </View>

          <View style={styles.hero}>
            <Text style={styles.kicker}>MUUTTOBOTTI MOBILE</Text>
            <Text style={styles.title}>{t.welcome}</Text>
            <Text style={styles.copy}>{t.subtitle}</Text>
          </View>

          <View style={styles.loginCard}>
            <View style={styles.roleTabs}>
              <TouchableOpacity style={[styles.roleTab, role === 'client' && styles.roleTabActive]} onPress={() => changeRole('client')}><Text style={[styles.roleText, role === 'client' && styles.roleTextActive]}>{t.client}</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.roleTab, role === 'admin' && styles.roleTabActive]} onPress={() => changeRole('admin')}><Text style={[styles.roleText, role === 'admin' && styles.roleTextActive]}>{t.admin}</Text></TouchableOpacity>
            </View>

            <Text style={styles.formTitle}>{role === 'client' ? t.clientTitle : t.adminTitle}</Text>
            <Text style={styles.formCopy}>{role === 'client' ? t.clientCopy : t.adminCopy}</Text>

            {role === 'client' ? <>
              <Field label={t.bookingId} value={bookingId} onChangeText={setBookingId} autoCapitalize="characters" placeholder="MB-12AB34CD" />
              <Field label={t.accessKey} value={accessKey} onChangeText={setAccessKey} autoCapitalize="none" secureTextEntry placeholder="••••••••••••••••" />
              <Text style={styles.hint}>{t.hint}</Text>
            </> : <Field label={t.adminToken} value={adminToken} onChangeText={setAdminToken} autoCapitalize="none" secureTextEntry placeholder="••••••••••••••••" />}

            {!!message && <Text style={styles.error}>{message}</Text>}
            <TouchableOpacity style={[styles.primary, busy && styles.disabled]} disabled={busy} onPress={signIn}>
              {busy ? <ActivityIndicator color={colors.ink} /> : <Text style={styles.primaryText}>{t.signIn}</Text>}
            </TouchableOpacity>

            {role === 'client' && <View style={styles.guestBlock}>
              <Text style={styles.guestLabel}>{t.newCustomer}</Text>
              <TouchableOpacity style={styles.secondary} onPress={() => router.replace('/(client)')}><Text style={styles.secondaryText}>{t.continueGuest}</Text></TouchableOpacity>
            </View>}
          </View>

          <View style={styles.securityRow}><View style={styles.securityDot} /><Text style={styles.securityText}>SecureStore · HTTPS · private booking access</Text></View>
          <Text style={styles.footer}>Autochemix Oy · Y-tunnus 3543357-8</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field(props: any) {
  return <View style={styles.field}><Text style={styles.label}>{props.label}</Text><TextInput {...props} placeholderTextColor="#738A87" style={styles.input} /></View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.ink }, flex: { flex: 1 },
  wrap: { flexGrow: 1, padding: 18, paddingBottom: 32, backgroundColor: colors.ink },
  brandRow: { gap: 14, marginTop: 4 }, logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  mark: { width: 42, height: 42, borderRadius: 13, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' }, markText: { color: colors.ink, fontWeight: '950', fontSize: 20 },
  logo: { color: '#fff', fontSize: 23, fontWeight: '950', letterSpacing: -.8 },
  languages: { flexDirection: 'row', gap: 6 }, lang: { minWidth: 43, height: 34, borderRadius: 10, borderWidth: 1, borderColor: '#29464E', alignItems: 'center', justifyContent: 'center' }, langActive: { backgroundColor: '#18353D', borderColor: '#45636A' }, langText: { color: '#88A09D', fontWeight: '900', fontSize: 11 }, langTextActive: { color: colors.lime },
  hero: { paddingTop: 34, paddingBottom: 26 }, kicker: { color: colors.lime, fontSize: 11, fontWeight: '900', letterSpacing: 1.2 },
  title: { color: '#fff', fontSize: 39, lineHeight: 42, fontWeight: '950', letterSpacing: -1.7, marginTop: 8 }, copy: { color: '#A9BCB8', fontSize: 16, lineHeight: 24, marginTop: 10, maxWidth: 390 },
  loginCard: { backgroundColor: '#F4F6F2', borderRadius: 28, padding: 18, gap: 12, ...shadow },
  roleTabs: { flexDirection: 'row', backgroundColor: '#E4EAE2', borderRadius: 15, padding: 4, gap: 4 }, roleTab: { flex: 1, minHeight: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }, roleTabActive: { backgroundColor: colors.ink }, roleText: { color: '#6A7B77', fontSize: 13, fontWeight: '900' }, roleTextActive: { color: '#fff' },
  formTitle: { color: colors.ink, fontSize: 25, fontWeight: '950', letterSpacing: -.8, marginTop: 5 }, formCopy: { color: '#667975', fontSize: 13, lineHeight: 20, marginBottom: 2 },
  field: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#DDE5DC', borderRadius: radius.md, paddingHorizontal: 14, paddingTop: 10, paddingBottom: 8 }, label: { color: '#667A75', fontSize: 10, fontWeight: '900', letterSpacing: .8, textTransform: 'uppercase' }, input: { minHeight: 42, padding: 0, color: colors.ink, fontSize: 16, fontWeight: '750' },
  hint: { color: '#788985', fontSize: 11, lineHeight: 16, marginTop: -3 }, error: { color: colors.danger, fontSize: 13, lineHeight: 19, fontWeight: '700' },
  primary: { minHeight: 56, borderRadius: radius.md, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center', marginTop: 2 }, primaryText: { color: colors.ink, fontSize: 16, fontWeight: '950' }, disabled: { opacity: .65 },
  guestBlock: { borderTopWidth: 1, borderTopColor: '#DDE4DC', paddingTop: 13, gap: 8 }, guestLabel: { color: '#71827E', fontSize: 12, fontWeight: '800', textAlign: 'center' }, secondary: { minHeight: 50, borderRadius: radius.md, borderWidth: 1, borderColor: '#CAD6CC', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }, secondaryText: { color: colors.ink, fontSize: 14, fontWeight: '900' },
  securityRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 18 }, securityDot: { width: 7, height: 7, borderRadius: 99, backgroundColor: colors.lime }, securityText: { color: '#718C89', fontSize: 10, fontWeight: '750' }, footer: { color: '#5F7976', textAlign: 'center', fontSize: 10, marginTop: 9 },
});