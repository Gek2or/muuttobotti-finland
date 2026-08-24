import { useEffect, useMemo, useState } from 'react';
import { Linking, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Booking, getAdminBookings, updateAdminStatus } from '../src/api';
import { secureStorage } from '../src/storage';
import { colors, radius, shadow } from '../src/theme';

const statuses = ['new', 'confirmed', 'in_progress', 'completed', 'cancelled'];
const statusFi: Record<string, string> = { new: 'Uusi', confirmed: 'Vahvistettu', in_progress: 'Käynnissä', completed: 'Valmis', cancelled: 'Peruttu', change_requested: 'Muutos pyydetty' };

export default function AdminScreen() {
  const [token, setToken] = useState('');
  const [authorized, setAuthorized] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selected, setSelected] = useState<Booking | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => { secureStorage.getAdminToken().then(saved => { if (saved) { setToken(saved); void load(saved); } }); }, []);

  const load = async (value = token) => {
    if (!value) return;
    setBusy(true); setMessage('');
    try {
      const result = await getAdminBookings(value.trim());
      setBookings(result.bookings);
      setAuthorized(true);
      await secureStorage.setAdminToken(value.trim());
      if (!result.db) setMessage('D1 ei ole käytössä productionissa.');
    } catch (error) {
      setAuthorized(false);
      setMessage(error instanceof Error ? error.message : 'Admin-yhteys epäonnistui.');
    } finally { setBusy(false); }
  };

  const update = async (booking: Booking, status: string) => {
    setBusy(true); setMessage('');
    try {
      await updateAdminStatus(token, booking.id, status);
      const next = { ...booking, status };
      setBookings(items => items.map(item => item.id === booking.id ? next : item));
      setSelected(next);
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Tilaa ei voitu päivittää.'); }
    finally { setBusy(false); }
  };

  const counts = useMemo(() => ({
    all: bookings.length,
    new: bookings.filter(b => b.status === 'new').length,
    attention: bookings.filter(b => b.recommendation_level === 'attention' || b.recommendation_level === 'high').length,
  }), [bookings]);

  if (!authorized) return <ScrollView contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled"><View style={styles.loginCard}><Text style={styles.kicker}>MUUTTOBOTTI ADMIN</Text><Text style={styles.loginTitle}>Kirjaudu admin-tokenilla</Text><Text style={styles.copy}>Token tallennetaan laitteen SecureStoreen, ei sovelluskoodiin.</Text><TextInput value={token} onChangeText={setToken} autoCapitalize="none" secureTextEntry placeholder="Admin token" placeholderTextColor="#80918E" style={styles.tokenInput} />{!!message && <Text style={styles.error}>{message}</Text>}<TouchableOpacity style={styles.primary} disabled={busy} onPress={() => load()}><Text style={styles.primaryText}>{busy ? 'Tarkistetaan…' : 'Avaa admin'}</Text></TouchableOpacity></View></ScrollView>;

  if (selected) return <ScrollView contentContainerStyle={styles.wrap}>
    <TouchableOpacity onPress={() => setSelected(null)}><Text style={styles.back}>← Kaikki varaukset</Text></TouchableOpacity>
    <View style={styles.detailHero}><Text style={styles.kicker}>{selected.id}</Text><Text style={styles.detailTitle}>{selected.customer_name}</Text><Text style={styles.detailSub}>{selected.service} · {selected.preferred_date} {selected.preferred_time}</Text><View style={styles.priority}><Text style={styles.priorityText}>{(selected.recommendation_level || 'normal').toUpperCase()}</Text></View></View>

    <Section title="Asiakas"><Row label="Puhelin" value={selected.phone} /><Row label="Sähköposti" value={selected.email} /><Row label="Nouto" value={selected.pickup} /><Row label="Kohde" value={selected.destination} /></Section>
    <View style={styles.quickRow}><TouchableOpacity style={styles.quick} onPress={() => selected.phone && Linking.openURL(`tel:${selected.phone}`)}><Text style={styles.quickText}>Soita</Text></TouchableOpacity><TouchableOpacity style={styles.quick} onPress={() => selected.phone && Linking.openURL(`https://wa.me/${selected.phone.replace(/\D/g, '')}`)}><Text style={styles.quickText}>WhatsApp</Text></TouchableOpacity><TouchableOpacity style={styles.quick} onPress={() => selected.email && Linking.openURL(`mailto:${selected.email}`)}><Text style={styles.quickText}>Email</Text></TouchableOpacity></View>

    <Section title="Tilaus"><Row label="Palvelu" value={selected.service} /><Row label="Päivä" value={selected.preferred_date} /><Row label="Aika" value={selected.preferred_time} /><Row label="Lisätiedot" value={selected.notes} /><Row label="Kuvia" value={String(selected.photo_count || 0)} /></Section>

    <View style={styles.recommend}><Text style={styles.sectionLabel}>SUOSITUS</Text><Text style={styles.recommendText}>{selected.recommendation || 'Ei automaattista huomiota tähän tilaukseen.'}</Text></View>

    {!!selected.calculator_snapshot && <Section title="Laskuri"><Text selectable style={styles.code}>{prettySnapshot(selected.calculator_snapshot)}</Text></Section>}

    <Section title="Tekniset tiedot"><Row label="IP" value={selected.client_ip} /><Row label="Laite / selain" value={selected.user_agent} /><Row label="Sijainti" value={[selected.client_city, selected.client_region, selected.client_country].filter(Boolean).join(', ')} /><Row label="ASN / colo" value={[selected.client_asn, selected.cf_colo].filter(Boolean).join(' · ')} /><Row label="Aikavyöhyke" value={selected.timezone} /><Row label="Näyttö" value={selected.screen_size} /></Section>
    <Section title="Lähde"><Row label="Sivu" value={selected.page_url} /><Row label="Referer" value={selected.referer} /><Row label="UTM" value={[selected.utm_source, selected.utm_medium, selected.utm_campaign].filter(Boolean).join(' / ')} /></Section>

    <Text style={styles.sectionTitle}>Muuta tila</Text><View style={styles.statusGrid}>{statuses.map(status => <TouchableOpacity key={status} disabled={busy} onPress={() => update(selected, status)} style={[styles.statusButton, selected.status === status && styles.statusButtonActive]}><Text style={[styles.statusButtonText, selected.status === status && styles.statusButtonTextActive]}>{statusFi[status]}</Text></TouchableOpacity>)}</View>
    {!!message && <Text style={styles.error}>{message}</Text>}
  </ScrollView>;

  return <ScrollView contentContainerStyle={styles.wrap} refreshControl={<RefreshControl refreshing={busy} onRefresh={() => load()} tintColor={colors.ink} />}>
    <View style={styles.topRow}><View><Text style={styles.kickerDark}>MUUTTOBOTTI ADMIN</Text><Text style={styles.pageTitle}>Varaukset</Text></View><TouchableOpacity onPress={async () => { await secureStorage.clearAdminToken(); setAuthorized(false); setToken(''); }}><Text style={styles.logout}>Kirjaudu ulos</Text></TouchableOpacity></View>
    <View style={styles.stats}><Stat label="Kaikki" value={counts.all} /><Stat label="Uudet" value={counts.new} /><Stat label="Huomio" value={counts.attention} /></View>
    {!!message && <Text style={styles.error}>{message}</Text>}
    <View style={styles.list}>{bookings.map(booking => <TouchableOpacity key={booking.id} style={styles.bookingCard} onPress={() => setSelected(booking)}><View style={styles.cardTop}><Text style={styles.bookingId}>{booking.id}</Text><View style={[styles.badge, (booking.recommendation_level === 'high' || booking.recommendation_level === 'attention') && styles.badgeWarn]}><Text style={styles.badgeText}>{statusFi[booking.status] || booking.status}</Text></View></View><Text style={styles.customer}>{booking.customer_name}</Text><Text style={styles.meta}>{booking.service} · {booking.preferred_date} {booking.preferred_time}</Text><Text style={styles.route}>{booking.pickup}{booking.destination ? ` → ${booking.destination}` : ''}</Text>{!!booking.recommendation && <Text numberOfLines={2} style={styles.recPreview}>{booking.recommendation}</Text>}</TouchableOpacity>)}</View>
  </ScrollView>;
}

function Stat({ label, value }: { label: string; value: number }) { return <View style={styles.stat}><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>; }
function Section({ title, children }: { title: string; children: React.ReactNode }) { return <View style={styles.section}><Text style={styles.sectionLabel}>{title.toUpperCase()}</Text>{children}</View>; }
function Row({ label, value }: { label: string; value?: string }) { return <View style={styles.row}><Text style={styles.rowLabel}>{label}</Text><Text selectable style={styles.rowValue}>{value || '—'}</Text></View>; }
function prettySnapshot(raw: string) { try { return JSON.stringify(JSON.parse(raw), null, 2); } catch { return raw; } }

const styles = StyleSheet.create({
  wrap: { padding: 16, paddingBottom: 44, gap: 14 },
  loginCard: { backgroundColor: colors.ink, borderRadius: radius.xl, padding: 23, gap: 13, marginTop: 28 },
  kicker: { color: colors.lime, fontSize: 11, fontWeight: '900', letterSpacing: 1.2 },
  kickerDark: { color: '#6D817D', fontSize: 10, fontWeight: '900', letterSpacing: 1.1 },
  loginTitle: { color: '#fff', fontSize: 29, fontWeight: '950', letterSpacing: -1 },
  copy: { color: '#AFC1BD', fontSize: 14, lineHeight: 21 },
  tokenInput: { minHeight: 54, borderRadius: 15, paddingHorizontal: 15, backgroundColor: '#11313A', color: '#fff', fontSize: 15 },
  primary: { minHeight: 55, borderRadius: 15, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' },
  primaryText: { color: colors.ink, fontWeight: '900', fontSize: 16 },
  error: { color: colors.danger, fontSize: 13, lineHeight: 19 },
  topRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  pageTitle: { color: colors.ink, fontSize: 34, fontWeight: '950', letterSpacing: -1.2 },
  logout: { color: '#647773', fontSize: 13, fontWeight: '800', paddingBottom: 5 },
  stats: { flexDirection: 'row', gap: 8 },
  stat: { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, padding: 14 },
  statValue: { color: colors.ink, fontSize: 26, fontWeight: '950' },
  statLabel: { color: colors.muted, fontSize: 11, fontWeight: '800', marginTop: 2 },
  list: { gap: 10 },
  bookingCard: { backgroundColor: '#fff', borderRadius: radius.lg, padding: 17, borderWidth: 1, borderColor: colors.line, ...shadow },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bookingId: { color: '#71827F', fontSize: 11, fontWeight: '900', letterSpacing: .7 },
  badge: { borderRadius: 999, backgroundColor: '#EAF1E7', paddingHorizontal: 10, paddingVertical: 5 },
  badgeWarn: { backgroundColor: '#FFF0D8' },
  badgeText: { color: colors.ink, fontSize: 10, fontWeight: '900' },
  customer: { color: colors.ink, fontSize: 20, fontWeight: '900', marginTop: 9 },
  meta: { color: '#667A76', fontSize: 13, fontWeight: '750', marginTop: 4 },
  route: { color: colors.ink, fontSize: 14, lineHeight: 20, marginTop: 9 },
  recPreview: { color: '#728178', fontSize: 12, lineHeight: 18, marginTop: 9 },
  back: { color: '#5F746F', fontWeight: '850', fontSize: 14 },
  detailHero: { backgroundColor: colors.ink, borderRadius: radius.xl, padding: 22 },
  detailTitle: { color: '#fff', fontSize: 31, fontWeight: '950', letterSpacing: -1, marginTop: 6 },
  detailSub: { color: '#AFC1BD', fontSize: 14, marginTop: 6 },
  priority: { alignSelf: 'flex-start', marginTop: 14, borderRadius: 999, backgroundColor: colors.lime, paddingHorizontal: 11, paddingVertical: 6 },
  priorityText: { color: colors.ink, fontSize: 10, fontWeight: '950' },
  section: { backgroundColor: '#fff', borderRadius: radius.lg, padding: 17, borderWidth: 1, borderColor: colors.line },
  sectionLabel: { color: '#6B7D79', fontSize: 10, fontWeight: '900', letterSpacing: 1.1, marginBottom: 8 },
  row: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#EEF1ED' },
  rowLabel: { color: '#83918F', fontSize: 10, fontWeight: '850', textTransform: 'uppercase' },
  rowValue: { color: colors.ink, fontSize: 14, lineHeight: 20, fontWeight: '650', marginTop: 3 },
  quickRow: { flexDirection: 'row', gap: 8 },
  quick: { flex: 1, minHeight: 48, borderRadius: 14, backgroundColor: colors.inkSoft, alignItems: 'center', justifyContent: 'center' },
  quickText: { color: '#fff', fontSize: 13, fontWeight: '850' },
  recommend: { backgroundColor: '#EDF6E3', borderRadius: radius.lg, padding: 18 },
  recommendText: { color: '#405749', fontSize: 15, lineHeight: 23, fontWeight: '700' },
  code: { color: '#3F5550', fontSize: 11, lineHeight: 17, fontFamily: 'monospace' },
  sectionTitle: { color: colors.ink, fontSize: 19, fontWeight: '900', marginTop: 4 },
  statusGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statusButton: { minHeight: 45, borderRadius: 13, paddingHorizontal: 13, borderWidth: 1, borderColor: colors.line, backgroundColor: '#fff', justifyContent: 'center' },
  statusButtonActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  statusButtonText: { color: colors.ink, fontWeight: '850', fontSize: 12 },
  statusButtonTextActive: { color: '#fff' },
});
