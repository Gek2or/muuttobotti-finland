import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Booking, getBooking, updateClientBooking } from '../src/api';
import { secureStorage } from '../src/storage';
import { colors, radius } from '../src/theme';

const statusLabels: Record<string, string> = {
  new: 'Vastaanotettu', confirmed: 'Vahvistettu', assigned: 'Tekijä määritetty', in_progress: 'Käynnissä', completed: 'Valmis', cancelled: 'Peruttu', change_requested: 'Muutos pyydetty',
};

export default function TrackScreen() {
  const [id, setId] = useState('');
  const [key, setKey] = useState('');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    secureStorage.getClientCredentials().then(saved => { if (saved.id) setId(saved.id); if (saved.key) setKey(saved.key); });
  }, []);

  const load = async () => {
    if (!id || !key) return setMessage('Syötä varausnumero ja pääsykoodi.');
    setBusy(true); setMessage('');
    try {
      const result = await getBooking(id.trim().toUpperCase(), key.trim().toLowerCase());
      setBooking(result.booking);
      setPickup(result.booking.pickup); setDestination(result.booking.destination); setDate(result.booking.preferred_date); setTime(result.booking.preferred_time); setNotes(result.booking.notes || '');
      await secureStorage.setClientCredentials(id.trim().toUpperCase(), key.trim().toLowerCase());
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Varausta ei löytynyt.'); }
    finally { setBusy(false); }
  };

  const modify = async () => {
    if (!booking) return;
    setBusy(true); setMessage('');
    try {
      const result = await updateClientBooking(id, key, { action: 'modify', pickup, destination, date, time, notes });
      setBooking(result.booking); setMessage('Muutospyyntö lähetetty.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Muutosta ei voitu lähettää.'); }
    finally { setBusy(false); }
  };

  const cancel = async () => {
    if (!booking) return;
    setBusy(true); setMessage('');
    try {
      const result = await updateClientBooking(id, key, { action: 'cancel' });
      setBooking(result.booking); setMessage('Varaus peruttu.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Varausta ei voitu perua.'); }
    finally { setBusy(false); }
  };

  return <ScrollView contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled">
    {!booking ? <>
      <Text style={styles.intro}>Syötä varausnumero ja yksityinen pääsykoodi. Sovellus voi tallentaa ne turvallisesti tälle laitteelle.</Text>
      <Field label="Varausnumero" value={id} onChangeText={setId} autoCapitalize="characters" placeholder="MB-12AB34CD" />
      <Field label="Pääsykoodi" value={key} onChangeText={setKey} autoCapitalize="none" placeholder="32 merkin koodi" secureTextEntry={false} />
      {!!message && <Text style={styles.message}>{message}</Text>}
      <TouchableOpacity disabled={busy} onPress={load} style={styles.primary}><Text style={styles.primaryText}>{busy ? 'Haetaan…' : 'Avaa varaus'}</Text></TouchableOpacity>
    </> : <>
      <View style={styles.statusCard}>
        <Text style={styles.kicker}>VARAUS {booking.id}</Text>
        <Text style={styles.status}>{statusLabels[booking.status] || booking.status}</Text>
        <Text style={styles.service}>{booking.service} · {booking.preferred_date} {booking.preferred_time}</Text>
      </View>

      <View style={styles.summary}><Row label="Nimi" value={booking.customer_name} /><Row label="Nouto" value={booking.pickup} /><Row label="Kohde" value={booking.destination} /><Row label="Kuvia" value={String(booking.photo_count || 0)} /></View>

      <Text style={styles.sectionTitle}>Muuta varausta</Text>
      <Field label="Nouto / palveluosoite" value={pickup} onChangeText={setPickup} />
      <Field label="Kohdeosoite" value={destination} onChangeText={setDestination} />
      <View style={styles.two}><View style={{ flex: 1 }}><Field label="Päivä" value={date} onChangeText={setDate} /></View><View style={{ flex: 1 }}><Field label="Aika" value={time} onChangeText={setTime} /></View></View>
      <View style={styles.field}><Text style={styles.label}>Lisätiedot</Text><TextInput multiline value={notes} onChangeText={setNotes} style={[styles.input, styles.textarea]} /></View>
      {!!message && <Text style={styles.message}>{message}</Text>}
      <TouchableOpacity disabled={busy} onPress={modify} style={styles.primary}><Text style={styles.primaryText}>Lähetä muutospyyntö</Text></TouchableOpacity>
      <TouchableOpacity disabled={busy} onPress={cancel} style={styles.danger}><Text style={styles.dangerText}>Peru varaus</Text></TouchableOpacity>
      <TouchableOpacity onPress={() => setBooking(null)} style={styles.secondary}><Text style={styles.secondaryText}>Avaa toinen varaus</Text></TouchableOpacity>
    </>}
  </ScrollView>;
}

function Field(props: any) { return <View style={styles.field}><Text style={styles.label}>{props.label}</Text><TextInput {...props} placeholderTextColor="#8A9895" style={styles.input} /></View>; }
function Row({ label, value }: { label: string; value: string }) { return <View style={styles.row}><Text style={styles.rowLabel}>{label}</Text><Text style={styles.rowValue}>{value || '—'}</Text></View>; }

const styles = StyleSheet.create({
  wrap: { padding: 16, paddingBottom: 40, gap: 12 },
  intro: { color: '#5F706D', fontSize: 16, lineHeight: 24, marginBottom: 4 },
  field: { backgroundColor: '#fff', borderRadius: radius.md, padding: 14, borderWidth: 1, borderColor: colors.line },
  label: { color: '#60706D', fontSize: 11, fontWeight: '900', textTransform: 'uppercase', letterSpacing: .8, marginBottom: 7 },
  input: { minHeight: 38, color: colors.ink, fontSize: 16, fontWeight: '650', padding: 0 },
  textarea: { minHeight: 100, textAlignVertical: 'top' },
  two: { flexDirection: 'row', gap: 10 },
  primary: { minHeight: 56, borderRadius: radius.md, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' },
  primaryText: { color: colors.ink, fontSize: 16, fontWeight: '900' },
  secondary: { minHeight: 50, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  secondaryText: { color: colors.ink, fontWeight: '850' },
  danger: { minHeight: 50, borderRadius: radius.md, backgroundColor: '#F7E7E7', alignItems: 'center', justifyContent: 'center' },
  dangerText: { color: colors.danger, fontWeight: '900' },
  message: { color: colors.danger, fontSize: 14, lineHeight: 20 },
  statusCard: { backgroundColor: colors.ink, borderRadius: radius.xl, padding: 22 },
  kicker: { color: colors.lime, fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  status: { color: '#fff', fontSize: 30, fontWeight: '950', marginTop: 7 },
  service: { color: '#ABC0BC', fontSize: 14, marginTop: 7 },
  summary: { backgroundColor: '#fff', borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, overflow: 'hidden' },
  row: { padding: 14, borderBottomWidth: 1, borderBottomColor: '#EDF0EC' },
  rowLabel: { color: colors.muted, fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: .8 },
  rowValue: { color: colors.ink, fontSize: 15, lineHeight: 22, fontWeight: '700', marginTop: 4 },
  sectionTitle: { color: colors.ink, fontSize: 20, fontWeight: '900', marginTop: 7 },
});
