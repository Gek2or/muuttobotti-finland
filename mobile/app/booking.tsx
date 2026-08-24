import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@expo/ui/community/datetime-picker';
import { Linking, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { createBooking } from '../src/api';
import { useLanguage } from '../src/i18n';
import { secureStorage } from '../src/storage';
import { colors, radius } from '../src/theme';

type Service = 'moving' | 'cleaning' | 'transport';
type PickedPhoto = { uri: string; fileName?: string | null; mimeType?: string | null };

const pad = (value: number) => String(value).padStart(2, '0');
const dateString = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const timeString = (date: Date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`;

export default function BookingScreen() {
  const { locale, tr } = useLanguage();
  const [service, setService] = useState<Service>('moving');
  const [name, setName] = useState(''); const [phone, setPhone] = useState(''); const [email, setEmail] = useState('');
  const [pickup, setPickup] = useState(''); const [destination, setDestination] = useState(''); const [notes, setNotes] = useState('');
  const [dateValue, setDateValue] = useState(() => { const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(10, 0, 0, 0); return d; });
  const [timeValue, setTimeValue] = useState(() => { const d = new Date(); d.setHours(10, 0, 0, 0); return d; });
  const [showDate, setShowDate] = useState(false); const [showTime, setShowTime] = useState(false);
  const [photos, setPhotos] = useState<PickedPhoto[]>([]); const [busy, setBusy] = useState(false); const [message, setMessage] = useState('');
  const [success, setSuccess] = useState<{ id: string; key: string } | null>(null);

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
      photos.forEach((photo, index) => form.append('photos', { uri: photo.uri, name: photo.fileName || `photo-${index + 1}.jpg`, type: photo.mimeType || 'image/jpeg' } as any));
      const result = await createBooking(form);
      if ('fallback' in result && result.fallback === 'whatsapp') { setMessage('WhatsApp fallback'); await Linking.openURL(result.whatsappUrl); return; }
      await secureStorage.setClientCredentials(result.bookingId, result.accessKey);
      setSuccess({ id: result.bookingId, key: result.accessKey }); setMessage(tr('saved'));
    } catch (error) { setMessage(error instanceof Error ? error.message : tr('required')); }
    finally { setBusy(false); }
  };

  if (success) return <ScrollView contentContainerStyle={styles.wrap}><View style={styles.success}>
    <Text style={styles.successKicker}>{tr('bookingSaved')}</Text><Text style={styles.successTitle}>{success.id}</Text><Text style={styles.successText}>{tr('privacyCopy')}</Text>
    <View style={styles.keyBox}><Text style={styles.keyLabel}>{tr('accessCode')}</Text><Text selectable style={styles.key}>{success.key}</Text></View>
    <TouchableOpacity style={styles.primary} onPress={() => router.push({ pathname: '/track', params: { id: success.id, key: success.key } })}><Text style={styles.primaryText}>{tr('openTracking')}</Text></TouchableOpacity>
  </View></ScrollView>;

  const serviceLabels = { moving: tr('moving'), cleaning: tr('cleaning'), transport: tr('transport') };
  return <ScrollView contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled">
    <Text style={styles.intro}>{tr('bookingText')}</Text>
    <View style={styles.serviceRow}>{(['moving', 'cleaning', 'transport'] as Service[]).map(item => <TouchableOpacity key={item} onPress={() => setService(item)} style={[styles.service, service === item && styles.serviceActive]}><Text style={[styles.serviceText, service === item && styles.serviceTextActive]}>{serviceLabels[item]}</Text></TouchableOpacity>)}</View>
    <Field label={`${tr('name')} *`} value={name} onChangeText={setName} /><Field label={`${tr('phone')} *`} value={phone} onChangeText={setPhone} keyboardType="phone-pad" /><Field label={`${tr('email')} *`} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
    <Field label={`${service === 'cleaning' ? tr('serviceAddress') : tr('pickup')} *`} value={pickup} onChangeText={setPickup} />{service !== 'cleaning' && <Field label={`${tr('destination')} *`} value={destination} onChangeText={setDestination} />}

    <View style={styles.two}>
      <TouchableOpacity style={[styles.field, { flex: 1 }]} onPress={() => { setShowDate(!showDate); setShowTime(false); }}><Text style={styles.label}>{tr('date')} *</Text><Text style={styles.pickerValue}>{dateString(dateValue)}</Text></TouchableOpacity>
      <TouchableOpacity style={[styles.field, { flex: 1 }]} onPress={() => { setShowTime(!showTime); setShowDate(false); }}><Text style={styles.label}>{tr('time')} *</Text><Text style={styles.pickerValue}>{timeString(timeValue)}</Text></TouchableOpacity>
    </View>
    {showDate && <View style={styles.pickerShell}><DateTimePicker value={dateValue} mode="date" presentation={Platform.OS === 'android' ? 'dialog' : 'inline'} onValueChange={(_, selected) => { if (selected) setDateValue(selected); if (Platform.OS === 'android') setShowDate(false); }} /></View>}
    {showTime && <View style={styles.pickerShell}><DateTimePicker value={timeValue} mode="time" presentation={Platform.OS === 'android' ? 'dialog' : 'inline'} onValueChange={(_, selected) => { if (selected) setTimeValue(selected); if (Platform.OS === 'android') setShowTime(false); }} /></View>}

    <View style={styles.field}><Text style={styles.label}>{tr('notes')}</Text><TextInput multiline value={notes} onChangeText={setNotes} placeholderTextColor="#8A9895" style={[styles.input, styles.textarea]} /></View>
    <TouchableOpacity style={styles.photoButton} onPress={pickPhotos}><Text style={styles.photoTitle}>{tr('addPhotos')}</Text><Text style={styles.photoText}>{photos.length ? `${photos.length} ${tr('photosSelected')}` : tr('photoLimit')}</Text></TouchableOpacity>
    {!!message && <Text style={styles.message}>{message}</Text>}<TouchableOpacity style={[styles.primary, busy && { opacity: .55 }]} disabled={busy} onPress={submit}><Text style={styles.primaryText}>{busy ? '…' : tr('sendBooking')}</Text></TouchableOpacity>
  </ScrollView>;
}

function Field(props: any) { return <View style={styles.field}><Text style={styles.label}>{props.label}</Text><TextInput {...props} style={styles.input} placeholderTextColor="#8A9895" /></View>; }
const styles = StyleSheet.create({ wrap: { padding: 16, paddingBottom: 40, gap: 12 }, intro: { color: '#5F706D', fontSize: 16, lineHeight: 24 }, serviceRow: { flexDirection: 'row', backgroundColor: '#E8ECE6', borderRadius: radius.md, padding: 5, gap: 5 }, service: { flex: 1, minHeight: 46, borderRadius: 13, justifyContent: 'center', alignItems: 'center' }, serviceActive: { backgroundColor: colors.ink }, serviceText: { color: '#60706D', fontWeight: '850', fontSize: 13 }, serviceTextActive: { color: '#fff' }, field: { backgroundColor: '#fff', borderRadius: radius.md, padding: 14, borderWidth: 1, borderColor: colors.line }, label: { color: '#60706D', fontSize: 11, fontWeight: '900', letterSpacing: .7, textTransform: 'uppercase', marginBottom: 7 }, input: { minHeight: 38, color: colors.ink, fontSize: 17, fontWeight: '650', padding: 0 }, textarea: { minHeight: 105, textAlignVertical: 'top' }, two: { flexDirection: 'row', gap: 10 }, pickerValue: { color: colors.ink, fontSize: 17, fontWeight: '850', minHeight: 38, textAlignVertical: 'center' }, pickerShell: { backgroundColor: '#fff', borderRadius: radius.lg, padding: 8, borderWidth: 1, borderColor: colors.line, overflow: 'hidden' }, photoButton: { borderRadius: radius.lg, padding: 18, borderWidth: 1, borderStyle: 'dashed', borderColor: '#A8B8B1', backgroundColor: '#F0F3EE' }, photoTitle: { color: colors.ink, fontSize: 16, fontWeight: '900' }, photoText: { color: colors.muted, fontSize: 13, marginTop: 4 }, message: { color: colors.danger, fontSize: 14, lineHeight: 20 }, primary: { minHeight: 58, borderRadius: radius.md, backgroundColor: colors.lime, justifyContent: 'center', alignItems: 'center' }, primaryText: { color: colors.ink, fontSize: 16, fontWeight: '900' }, success: { backgroundColor: colors.ink, borderRadius: radius.xl, padding: 24, gap: 14 }, successKicker: { color: colors.lime, fontSize: 11, fontWeight: '900', letterSpacing: 1.2 }, successTitle: { color: '#fff', fontSize: 35, fontWeight: '950' }, successText: { color: '#B6C5C2', fontSize: 15, lineHeight: 23 }, keyBox: { backgroundColor: '#102F37', padding: 16, borderRadius: radius.md }, keyLabel: { color: '#89A09D', fontSize: 10, fontWeight: '900' }, key: { color: '#fff', fontSize: 14, fontWeight: '800', marginTop: 7 } });