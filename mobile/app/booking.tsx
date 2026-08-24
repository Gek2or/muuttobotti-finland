import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Linking, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { createBooking } from '../src/api';
import { secureStorage } from '../src/storage';
import { colors, radius } from '../src/theme';

type Service = 'moving' | 'cleaning' | 'transport';

type PickedPhoto = { uri: string; fileName?: string | null; mimeType?: string | null };

export default function BookingScreen() {
  const [service, setService] = useState<Service>('moving');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<PickedPhoto[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState<{ id: string; key: string } | null>(null);

  const pickPhotos = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: .8, allowsMultipleSelection: true, selectionLimit: 5 });
    if (!result.canceled) setPhotos(result.assets.slice(0, 5).map(asset => ({ uri: asset.uri, fileName: asset.fileName, mimeType: asset.mimeType })));
  };

  const submit = async () => {
    if (!name || !phone || !email || !pickup || !date || !time) {
      setMessage('Täytä kaikki pakolliset kentät.');
      return;
    }
    if ((service === 'moving' || service === 'transport') && !destination) {
      setMessage('Lisää kohdeosoite.');
      return;
    }

    setBusy(true);
    setMessage('');
    try {
      const form = new FormData();
      form.append('service', service);
      form.append('name', name);
      form.append('phone', phone);
      form.append('email', email);
      form.append('pickup', pickup);
      form.append('destination', destination || pickup);
      form.append('date', date);
      form.append('time', time);
      form.append('notes', notes);
      form.append('client_locale', 'fi');
      form.append('client_timezone', Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Helsinki');
      form.append('page_url', 'muuttobotti://booking');

      photos.forEach((photo, index) => {
        form.append('photos', {
          uri: photo.uri,
          name: photo.fileName || `photo-${index + 1}.jpg`,
          type: photo.mimeType || 'image/jpeg',
        } as any);
      });

      const result = await createBooking(form);
      if ('fallback' in result && result.fallback === 'whatsapp') {
        setMessage('Verkkotallennus ei ole käytössä. Avaamme valmiin WhatsApp-varauksen.');
        await Linking.openURL(result.whatsappUrl);
        return;
      }
      await secureStorage.setClientCredentials(result.bookingId, result.accessKey);
      setSuccess({ id: result.bookingId, key: result.accessKey });
      setMessage('Varaus tallennettu onnistuneesti.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Varausta ei voitu lähettää.');
    } finally {
      setBusy(false);
    }
  };

  if (success) {
    return <ScrollView contentContainerStyle={styles.wrap}><View style={styles.success}><Text style={styles.successKicker}>VARAUS TALLENNETTU</Text><Text style={styles.successTitle}>{success.id}</Text><Text style={styles.successText}>Pääsykoodi on tallennettu turvallisesti tähän laitteeseen.</Text><View style={styles.keyBox}><Text style={styles.keyLabel}>PÄÄSYKOODI</Text><Text selectable style={styles.key}>{success.key}</Text></View><TouchableOpacity style={styles.primary} onPress={() => Linking.openURL(`https://muuttobotti.fi/track#id=${encodeURIComponent(success.id)}&key=${encodeURIComponent(success.key)}`)}><Text style={styles.primaryText}>Avaa seuranta</Text></TouchableOpacity></View></ScrollView>;
  }

  return (
    <ScrollView contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled">
      <Text style={styles.intro}>Täytä tiedot. Saat varausnumeron ja yksityisen pääsykoodin heti, kun varaus tallentuu.</Text>
      <View style={styles.serviceRow}>{(['moving', 'cleaning', 'transport'] as Service[]).map((item, i) => <TouchableOpacity key={item} onPress={() => setService(item)} style={[styles.service, service === item && styles.serviceActive]}><Text style={[styles.serviceText, service === item && styles.serviceTextActive]}>{['Muutto', 'Siivous', 'Kuljetus'][i]}</Text></TouchableOpacity>)}</View>

      <Field label="Nimi *" value={name} onChangeText={setName} />
      <Field label="Puhelin *" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <Field label="Sähköposti *" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <Field label={service === 'cleaning' ? 'Palveluosoite *' : 'Nouto-osoite *'} value={pickup} onChangeText={setPickup} />
      {service !== 'cleaning' && <Field label="Kohdeosoite *" value={destination} onChangeText={setDestination} />}
      <View style={styles.two}><View style={{ flex: 1 }}><Field label="Päivä *" placeholder="2026-08-31" value={date} onChangeText={setDate} /></View><View style={{ flex: 1 }}><Field label="Aika *" placeholder="10:00" value={time} onChangeText={setTime} /></View></View>
      <View style={styles.field}><Text style={styles.label}>Lisätiedot</Text><TextInput multiline value={notes} onChangeText={setNotes} placeholder="Kerrokset, hissi, raskaat tavarat, toiveet..." placeholderTextColor="#8A9895" style={[styles.input, styles.textarea]} /></View>

      <TouchableOpacity style={styles.photoButton} onPress={pickPhotos}><Text style={styles.photoTitle}>Lisää kuvia</Text><Text style={styles.photoText}>{photos.length ? `${photos.length} kuvaa valittu` : 'Enintään 5 kuvaa · 8 MB / kuva'}</Text></TouchableOpacity>

      {!!message && <Text style={styles.message}>{message}</Text>}
      <TouchableOpacity style={[styles.primary, busy && { opacity: .55 }]} disabled={busy} onPress={submit}><Text style={styles.primaryText}>{busy ? 'Lähetetään…' : 'Lähetä varaus'}</Text></TouchableOpacity>
    </ScrollView>
  );
}

function Field(props: any) {
  return <View style={styles.field}><Text style={styles.label}>{props.label}</Text><TextInput {...props} style={styles.input} placeholderTextColor="#8A9895" /></View>;
}

const styles = StyleSheet.create({
  wrap: { padding: 16, paddingBottom: 40, gap: 12 },
  intro: { color: '#5F706D', fontSize: 16, lineHeight: 24, marginBottom: 3 },
  serviceRow: { flexDirection: 'row', backgroundColor: '#E8ECE6', borderRadius: radius.md, padding: 5, gap: 5 },
  service: { flex: 1, minHeight: 46, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
  serviceActive: { backgroundColor: colors.ink },
  serviceText: { color: '#60706D', fontWeight: '850', fontSize: 13 },
  serviceTextActive: { color: '#fff' },
  field: { backgroundColor: '#fff', borderRadius: radius.md, padding: 14, borderWidth: 1, borderColor: colors.line },
  label: { color: '#60706D', fontSize: 11, fontWeight: '900', letterSpacing: .8, textTransform: 'uppercase', marginBottom: 7 },
  input: { minHeight: 38, color: colors.ink, fontSize: 17, fontWeight: '650', padding: 0 },
  textarea: { minHeight: 110, textAlignVertical: 'top', paddingTop: 4 },
  two: { flexDirection: 'row', gap: 10 },
  photoButton: { borderRadius: radius.lg, padding: 18, borderWidth: 1, borderStyle: 'dashed', borderColor: '#A8B8B1', backgroundColor: '#F0F3EE' },
  photoTitle: { color: colors.ink, fontSize: 16, fontWeight: '900' },
  photoText: { color: colors.muted, fontSize: 13, marginTop: 4 },
  message: { color: colors.danger, fontSize: 14, lineHeight: 20, paddingHorizontal: 4 },
  primary: { minHeight: 58, borderRadius: radius.md, backgroundColor: colors.lime, justifyContent: 'center', alignItems: 'center', marginTop: 3 },
  primaryText: { color: colors.ink, fontSize: 16, fontWeight: '900' },
  success: { backgroundColor: colors.ink, borderRadius: radius.xl, padding: 24, gap: 14 },
  successKicker: { color: colors.lime, fontSize: 11, fontWeight: '900', letterSpacing: 1.2 },
  successTitle: { color: '#fff', fontSize: 35, fontWeight: '950', letterSpacing: -1.2 },
  successText: { color: '#B6C5C2', fontSize: 15, lineHeight: 23 },
  keyBox: { backgroundColor: '#102F37', padding: 16, borderRadius: radius.md },
  keyLabel: { color: '#89A09D', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  key: { color: '#fff', fontSize: 14, fontWeight: '800', marginTop: 7 },
});
