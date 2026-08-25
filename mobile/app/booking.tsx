import { useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@expo/ui/community/datetime-picker';
import { Linking, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { createBooking } from '../src/api';
import { useLanguage } from '../src/i18n';
import { PendingEstimate, secureStorage } from '../src/storage';
import { colors, radius } from '../src/theme';

type Service = 'moving' | 'cleaning' | 'transport';
type PickedPhoto = { uri: string; fileName?: string | null; mimeType?: string | null };

const pad = (value: number) => String(value).padStart(2, '0');
const dateString = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const timeString = (date: Date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`;

const estimateCopy = {
  fi: { attached: 'LASKURI LIITETTY', text: 'Tämä arvio lähetetään varauksen mukana ja näkyy Admin Consolessa.' },
  en: { attached: 'ESTIMATE ATTACHED', text: 'This estimate is sent with the booking and is visible in Admin Console.' },
  uk: { attached: 'ОЦІНКУ ДОДАНО', text: 'Ця оцінка буде надіслана разом із замовленням і видима адміністратору.' },
  ru: { attached: 'РАСЧЁТ ПРИКРЕПЛЁН', text: 'Этот расчёт отправится вместе с заказом и будет виден в Admin Console.' },
} as const;

export default function BookingScreen() {
  const { locale, tr } = useLanguage();
  const ec = estimateCopy[locale];
  const [service, setService] = useState<Service>('moving');
  const [estimate, setEstimate] = useState<PendingEstimate | null>(null);
  const [name, setName] = useState(''); const [phone, setPhone] = useState(''); const [email, setEmail] = useState('');
  const [pickup, setPickup] = useState(''); const [destination, setDestination] = useState(''); const [notes, setNotes] = useState('');
  const [dateValue, setDateValue] = useState(() => { const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(10, 0, 0, 0); return d; });
  const [timeValue, setTimeValue] = useState(() => { const d = new Date(); d.setHours(10, 0, 0, 0); return d; });
  const [showDate, setShowDate] = useState(false); const [showTime, setShowTime] = useState(false);
  const [photos, setPhotos] = useState<PickedPhoto[]>([]); const [busy, setBusy] = useState(false); const [message, setMessage] = useState('');
  const [success, setSuccess] = useState<{ id: string; key: string } | null>(null);

  useEffect(() => {
    void secureStorage.getPendingEstimate().then(value => {
      if (!value) return;
      setEstimate(value);
      setService(value.service);
    });
  }, []);

  const pickPhotos = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: .8, allowsMultipleSelection: true, selectionLimit: 5 });
    if (!result.canceled) setPhotos(result.assets.slice(0, 5).map(asset => ({ uri: asset.uri, fileName: asset.fileName, mimeType: asset.mimeType })));
  };

  const submit = async () => {
    if (!name || !phone || !email || !pickup) return setMessage(tr('required'));
    if ((service === 'moving' || service === 'transport') && !destination) return setMessage(tr('destinationRequired'));
    setBusy(true); setMessage('');
    try {
      const form = new FormData();
      form.append('service', service); form.append('name', name); form.append('phone', phone); form.append('email', email);
      form.append('pickup', pickup); form.append('destination', destination || pickup); form.append('date', dateString(dateValue)); form.append('time', timeString(timeValue)); form.append('notes', notes);
      form.append('client_locale', locale); form.append('client_timezone', Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Helsinki'); form.append('page_url', 'muuttobotti://booking');
      if (estimate) form.append('calculator_snapshot', JSON.stringify(estimate.snapshot));
      photos.forEach((photo, index) => form.append('photos', { uri: photo.uri, name: photo.fileName || `photo-${index + 1}.jpg`, type: photo.mimeType || 'image/jpeg' } as any));
      const result = await createBooking(form);
      if ('fallback' in result && result.fallback === 'whatsapp') { setMessage('WhatsApp fallback'); await Linking.openURL(result.whatsappUrl); return; }
      await secureStorage.setClientCredentials(result.bookingId, result.accessKey);
      await secureStorage.clearPendingEstimate();
      setEstimate(null);
      setSuccess({ id: result.bookingId, key: result.accessKey }); setMessage(tr('saved'));
    } catch (error) { setMessage(error instanceof Error ? error.message : tr('required')); }
    finally { setBusy(false); }
  };

  if (success) return <ScrollView contentContainerStyle={styles.wrap}><View style={styles.success}>
    <View style={styles.successGlow} /><Text style={styles.successKicker}>{tr('bookingSaved')}</Text><Text style={styles.successTitle}>{success.id}</Text><Text style={styles.successText}>{tr('privacyCopy')}</Text>
    <View style={styles.keyBox}><Text style={styles.keyLabel}>{tr('accessCode')}</Text><Text selectable style={styles.key}>{success.key}</Text></View>
    <TouchableOpacity style={styles.primary} onPress={() => router.push({ pathname: '/track', params: { id: success.id, key: success.key } })}><Text style={styles.primaryText}>{tr('openTracking')}</Text></TouchableOpacity>
  </View></ScrollView>;

  const serviceLabels = { moving: tr('moving'), cleaning: tr('cleaning'), transport: tr('transport') };
  const estimatePrice = estimate?.snapshot?.quotedPrice;
  const estimateDuration = estimate?.snapshot?.quotedDuration;

  return <ScrollView contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
    <View style={styles.introCard}><Text style={styles.introKicker}>MUUTTOBOTTI BOOKING FLOW</Text><Text style={styles.introTitle}>{tr('makeBooking')}</Text><Text style={styles.intro}>{tr('bookingText')}</Text></View>
    <View style={styles.serviceRow}>{(['moving', 'cleaning', 'transport'] as Service[]).map(item => <TouchableOpacity key={item} onPress={() => setService(item)} style={[styles.service, service === item && styles.serviceActive]}><Text style={[styles.serviceText, service === item && styles.serviceTextActive]}>{serviceLabels[item]}</Text></TouchableOpacity>)}</View>

    {estimate && <View style={styles.estimateCard}><View><Text style={styles.estimateKicker}>{ec.attached}</Text><Text style={styles.estimateText}>{ec.text}</Text></View><View style={styles.estimateValue}><Text style={styles.estimatePrice}>{typeof estimatePrice === 'number' ? `${estimatePrice} €` : '✓'}</Text>{typeof estimateDuration === 'string' && <Text style={styles.estimateDuration}>{estimateDuration}</Text>}</View><TouchableOpacity onPress={async () => { await secureStorage.clearPendingEstimate(); setEstimate(null); }}><Text style={styles.removeEstimate}>×</Text></TouchableOpacity></View>}

    <Field label={`${tr('name')} *`} value={name} onChangeText={setName} /><Field label={`${tr('phone')} *`} value={phone} onChangeText={setPhone} keyboardType="phone-pad" /><Field label={`${tr('email')} *`} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
    <Field label={`${service === 'cleaning' ? tr('serviceAddress') : tr('pickup')} *`} value={pickup} onChangeText={setPickup} />{service !== 'cleaning' && <Field label={`${tr('destination')} *`} value={destination} onChangeText={setDestination} />}

    <View style={styles.two}>
      <TouchableOpacity style={[styles.field, { flex: 1 }]} onPress={() => { setShowDate(!showDate); setShowTime(false); }}><Text style={styles.label}>{tr('date')} *</Text><Text style={styles.pickerValue}>{dateString(dateValue)}</Text></TouchableOpacity>
      <TouchableOpacity style={[styles.field, { flex: 1 }]} onPress={() => { setShowTime(!showTime); setShowDate(false); }}><Text style={styles.label}>{tr('time')} *</Text><Text style={styles.pickerValue}>{timeString(timeValue)}</Text></TouchableOpacity>
    </View>
    {showDate && <View style={styles.pickerShell}><DateTimePicker value={dateValue} mode="date" presentation={Platform.OS === 'android' ? 'dialog' : 'inline'} onValueChange={(_, selected) => { if (selected) setDateValue(selected); if (Platform.OS === 'android') setShowDate(false); }} /></View>}
    {showTime && <View style={styles.pickerShell}><DateTimePicker value={timeValue} mode="time" presentation={Platform.OS === 'android' ? 'dialog' : 'inline'} onValueChange={(_, selected) => { if (selected) setTimeValue(selected); if (Platform.OS === 'android') setShowTime(false); }} /></View>}

    <View style={styles.field}><Text style={styles.label}>{tr('notes')}</Text><TextInput multiline value={notes} onChangeText={setNotes} placeholderTextColor="#8A9895" style={[styles.input, styles.textarea]} /></View>
    <TouchableOpacity style={styles.photoButton} onPress={pickPhotos}><View style={styles.photoIcon}><Text style={styles.photoIconText}>＋</Text></View><View style={{ flex: 1 }}><Text style={styles.photoTitle}>{tr('addPhotos')}</Text><Text style={styles.photoText}>{photos.length ? `${photos.length} ${tr('photosSelected')}` : tr('photoLimit')}</Text></View></TouchableOpacity>
    {!!message && <Text style={styles.message}>{message}</Text>}<TouchableOpacity style={[styles.primary, busy && { opacity: .55 }]} disabled={busy} onPress={submit}><Text style={styles.primaryText}>{busy ? '…' : tr('sendBooking')}</Text><Text style={styles.primaryArrow}>→</Text></TouchableOpacity>
  </ScrollView>;
}

function Field(props: any) { return <View style={styles.field}><Text style={styles.label}>{props.label}</Text><TextInput {...props} style={styles.input} placeholderTextColor="#8A9895" /></View>; }
const styles = StyleSheet.create({
  wrap: { padding: 15, paddingBottom: 42, gap: 10, backgroundColor: colors.paper },
  introCard: { backgroundColor: '#06191F', borderRadius: radius.xl, padding: 20, borderWidth: 1, borderColor: '#214650' }, introKicker: { color: colors.lime, fontSize: 9, fontWeight: '950', letterSpacing: 1 }, introTitle: { color: '#fff', fontSize: 28, fontWeight: '950', letterSpacing: -1, marginTop: 5 }, intro: { color: '#AFC1BD', fontSize: 13, lineHeight: 20, marginTop: 6 },
  serviceRow: { flexDirection: 'row', backgroundColor: '#E8ECE6', borderRadius: 15, padding: 4, gap: 4 }, service: { flex: 1, minHeight: 45, borderRadius: 12, justifyContent: 'center', alignItems: 'center' }, serviceActive: { backgroundColor: colors.ink }, serviceText: { color: '#60706D', fontWeight: '900', fontSize: 11 }, serviceTextActive: { color: colors.lime },
  estimateCard: { position: 'relative', flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#EEFFD9', borderRadius: radius.lg, padding: 15, paddingRight: 34, borderWidth: 1, borderColor: '#D0F08F' }, estimateKicker: { color: '#557B31', fontSize: 9, fontWeight: '950', letterSpacing: .8 }, estimateText: { color: '#5D7651', fontSize: 10, lineHeight: 15, marginTop: 4, maxWidth: 220 }, estimateValue: { marginLeft: 'auto', alignItems: 'flex-end' }, estimatePrice: { color: colors.ink, fontSize: 19, fontWeight: '950' }, estimateDuration: { color: '#687C62', fontSize: 9, fontWeight: '800', marginTop: 2 }, removeEstimate: { position: 'absolute', right: -25, top: -22, color: '#78906E', fontSize: 19, fontWeight: '900' },
  field: { backgroundColor: '#fff', borderRadius: 15, padding: 13, borderWidth: 1, borderColor: colors.line }, label: { color: '#60706D', fontSize: 9, fontWeight: '950', letterSpacing: .7, textTransform: 'uppercase', marginBottom: 6 }, input: { minHeight: 38, color: colors.ink, fontSize: 16, fontWeight: '700', padding: 0 }, textarea: { minHeight: 100, textAlignVertical: 'top' }, two: { flexDirection: 'row', gap: 9 }, pickerValue: { color: colors.ink, fontSize: 16, fontWeight: '900', minHeight: 38, textAlignVertical: 'center' }, pickerShell: { backgroundColor: '#fff', borderRadius: radius.lg, padding: 8, borderWidth: 1, borderColor: colors.line, overflow: 'hidden' },
  photoButton: { flexDirection: 'row', alignItems: 'center', gap: 11, borderRadius: radius.lg, padding: 15, borderWidth: 1, borderStyle: 'dashed', borderColor: '#9FB3A9', backgroundColor: '#F0F4EF' }, photoIcon: { width: 39, height: 39, borderRadius: 12, backgroundColor: '#E2EAE2', alignItems: 'center', justifyContent: 'center' }, photoIconText: { color: colors.ink, fontSize: 20, fontWeight: '900' }, photoTitle: { color: colors.ink, fontSize: 14, fontWeight: '950' }, photoText: { color: colors.muted, fontSize: 11, marginTop: 3 },
  message: { color: colors.danger, fontSize: 12, lineHeight: 18 }, primary: { minHeight: 58, borderRadius: 16, backgroundColor: colors.lime, paddingHorizontal: 17, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, primaryText: { color: colors.ink, fontSize: 14, fontWeight: '950' }, primaryArrow: { color: colors.ink, fontSize: 22, fontWeight: '950' },
  success: { position: 'relative', overflow: 'hidden', backgroundColor: '#06191F', borderRadius: radius.xl, padding: 23, gap: 13, borderWidth: 1, borderColor: '#214650' }, successGlow: { position: 'absolute', width: 200, height: 200, borderRadius: 100, right: -90, top: -100, backgroundColor: colors.lime, opacity: .1 }, successKicker: { color: colors.lime, fontSize: 10, fontWeight: '950', letterSpacing: 1.2 }, successTitle: { color: '#fff', fontSize: 34, fontWeight: '950' }, successText: { color: '#B6C5C2', fontSize: 14, lineHeight: 22 }, keyBox: { backgroundColor: '#102F37', padding: 15, borderRadius: 15, borderWidth: 1, borderColor: '#244A53' }, keyLabel: { color: '#89A09D', fontSize: 9, fontWeight: '950' }, key: { color: '#fff', fontSize: 13, fontWeight: '800', marginTop: 7 },
});