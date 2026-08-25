import { useEffect, useMemo, useState } from 'react';
import { Linking, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Booking, getAdminBookings, updateAdminStatus } from '../src/api';
import { secureStorage } from '../src/storage';
import { colors, radius, shadow } from '../src/theme';

const statuses = ['new', 'confirmed', 'assigned', 'in_progress', 'completed', 'cancelled'];
const statusFi: Record<string, string> = { new: 'Uusi', confirmed: 'Vahvistettu', assigned: 'Tekijä määritetty', in_progress: 'Käynnissä', completed: 'Valmis', cancelled: 'Peruttu', change_requested: 'Muutos pyydetty' };

type Filter = 'all' | 'new' | 'active' | 'attention';

export default function AdminScreen() {
  const [token, setToken] = useState('');
  const [authorized, setAuthorized] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selected, setSelected] = useState<Booking | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

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
    active: bookings.filter(b => ['confirmed', 'assigned', 'in_progress', 'change_requested'].includes(b.status)).length,
    attention: bookings.filter(b => b.recommendation_level === 'attention' || b.recommendation_level === 'high' || b.status === 'change_requested').length,
  }), [bookings]);

  const visibleBookings = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return bookings.filter(booking => {
      if (filter === 'new' && booking.status !== 'new') return false;
      if (filter === 'active' && !['confirmed', 'assigned', 'in_progress', 'change_requested'].includes(booking.status)) return false;
      if (filter === 'attention' && !(booking.recommendation_level === 'attention' || booking.recommendation_level === 'high' || booking.status === 'change_requested')) return false;
      if (!needle) return true;
      return [booking.id, booking.customer_name, booking.phone, booking.email, booking.pickup, booking.destination, booking.service]
        .filter(Boolean).join(' ').toLowerCase().includes(needle);
    });
  }, [bookings, filter, query]);

  if (!authorized) return <ScrollView contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled">
    <View style={styles.loginCard}><View style={styles.liveRow}><View style={styles.liveDot} /><Text style={styles.kicker}>MUUTTOBOTTI ADMIN · LIVE</Text></View><Text style={styles.loginTitle}>Operations Console</Text><Text style={styles.copy}>Production D1 -varaukset, asiakkaat ja tilanohjaus. Token tallennetaan laitteen SecureStoreen.</Text><TextInput value={token} onChangeText={setToken} autoCapitalize="none" secureTextEntry placeholder="Admin token" placeholderTextColor="#80918E" style={styles.tokenInput} />{!!message && <Text style={styles.error}>{message}</Text>}<TouchableOpacity style={styles.primary} disabled={busy} onPress={() => load()}><Text style={styles.primaryText}>{busy ? 'Tarkistetaan…' : 'Avaa Admin Console'}</Text></TouchableOpacity></View>
  </ScrollView>;

  if (selected) return <ScrollView contentContainerStyle={styles.wrap} showsVerticalScrollIndicator={false}>
    <TouchableOpacity onPress={() => setSelected(null)}><Text style={styles.back}>← Kaikki varaukset</Text></TouchableOpacity>
    <View style={styles.detailHero}><View style={styles.detailGlow} /><View style={styles.detailTop}><Text style={styles.kicker}>{selected.id}</Text><StatusBadge status={selected.status} /></View><Text style={styles.detailTitle}>{selected.customer_name}</Text><Text style={styles.detailSub}>{selected.service} · {selected.preferred_date} {selected.preferred_time}</Text><Text style={styles.detailRoute}>{selected.pickup}{selected.destination ? ` → ${selected.destination}` : ''}</Text></View>

    <View style={styles.quickRow}><TouchableOpacity style={styles.quick} onPress={() => selected.phone && Linking.openURL(`tel:${selected.phone}`)}><Text style={styles.quickIcon}>☎</Text><Text style={styles.quickText}>Soita</Text></TouchableOpacity><TouchableOpacity style={styles.quick} onPress={() => selected.phone && Linking.openURL(`https://wa.me/${selected.phone.replace(/\D/g, '')}`)}><Text style={styles.quickIcon}>◉</Text><Text style={styles.quickText}>WhatsApp</Text></TouchableOpacity><TouchableOpacity style={styles.quick} onPress={() => selected.email && Linking.openURL(`mailto:${selected.email}`)}><Text style={styles.quickIcon}>@</Text><Text style={styles.quickText}>Email</Text></TouchableOpacity></View>

    <Section title="Asiakas"><Row label="Puhelin" value={selected.phone} /><Row label="Sähköposti" value={selected.email} /><Row label="Nouto" value={selected.pickup} /><Row label="Kohde" value={selected.destination} /></Section>
    <Section title="Tilaus"><Row label="Palvelu" value={selected.service} /><Row label="Päivä" value={selected.preferred_date} /><Row label="Aika" value={selected.preferred_time} /><Row label="Lisätiedot" value={selected.notes} /><Row label="Kuvia" value={String(selected.photo_count || 0)} /></Section>

    <View style={[styles.recommend, selected.recommendation_level === 'high' && styles.recommendHigh]}><Text style={styles.sectionLabel}>AI / RULE RECOMMENDATION · {(selected.recommendation_level || 'normal').toUpperCase()}</Text><Text style={styles.recommendText}>{selected.recommendation || 'Ei automaattista huomiota tähän tilaukseen.'}</Text></View>
    {!!selected.calculator_snapshot && <Section title="Asiakkaan laskuri"><Text selectable style={styles.code}>{prettySnapshot(selected.calculator_snapshot)}</Text></Section>}

    <Text style={styles.sectionTitle}>Työn tila</Text><View style={styles.statusGrid}>{statuses.map(status => <TouchableOpacity key={status} disabled={busy} onPress={() => update(selected, status)} style={[styles.statusButton, selected.status === status && styles.statusButtonActive]}><Text style={[styles.statusButtonText, selected.status === status && styles.statusButtonTextActive]}>{statusFi[status]}</Text></TouchableOpacity>)}</View>
    {selected.status === 'change_requested' && <View style={styles.changeNotice}><Text style={styles.changeTitle}>Asiakas pyysi muutosta</Text><Text style={styles.changeCopy}>Tarkista osoite/aika/lisätiedot ja vahvista tilaus uudelleen, kun muutos on hyväksytty.</Text></View>}

    <Section title="Tekniset tiedot"><Row label="IP" value={selected.client_ip} /><Row label="Laite / selain" value={selected.user_agent} /><Row label="Sijainti" value={[selected.client_city, selected.client_region, selected.client_country].filter(Boolean).join(', ')} /><Row label="ASN / colo" value={[selected.client_asn, selected.cf_colo].filter(Boolean).join(' · ')} /><Row label="Aikavyöhyke" value={selected.timezone} /><Row label="Näyttö" value={selected.screen_size} /></Section>
    {!!message && <Text style={styles.error}>{message}</Text>}
  </ScrollView>;

  return <ScrollView contentContainerStyle={styles.wrap} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={busy} onRefresh={() => load()} tintColor={colors.lime} />}>
    <View style={styles.topRow}><View><View style={styles.liveRowDark}><View style={styles.liveDot} /><Text style={styles.kickerDark}>MUUTTOBOTTI OPERATIONS</Text></View><Text style={styles.pageTitle}>Varaukset</Text></View><TouchableOpacity onPress={async () => { await secureStorage.clearAdminToken(); setAuthorized(false); setToken(''); }}><Text style={styles.logout}>Kirjaudu ulos</Text></TouchableOpacity></View>
    <View style={styles.stats}><Stat label="Kaikki" value={counts.all} active={filter === 'all'} onPress={() => setFilter('all')} /><Stat label="Uudet" value={counts.new} active={filter === 'new'} onPress={() => setFilter('new')} /><Stat label="Aktiiviset" value={counts.active} active={filter === 'active'} onPress={() => setFilter('active')} /><Stat label="Huomio" value={counts.attention} active={filter === 'attention'} onPress={() => setFilter('attention')} /></View>
    <View style={styles.searchBox}><Text style={styles.searchIcon}>⌕</Text><TextInput value={query} onChangeText={setQuery} placeholder="Hae nimellä, ID:llä, osoitteella…" placeholderTextColor="#879691" style={styles.searchInput} /></View>
    {!!message && <Text style={styles.error}>{message}</Text>}
    <Text style={styles.resultCount}>{visibleBookings.length} / {bookings.length}</Text>
    <View style={styles.list}>{visibleBookings.map(booking => <TouchableOpacity key={booking.id} activeOpacity={.82} style={styles.bookingCard} onPress={() => setSelected(booking)}><View style={styles.cardTop}><Text style={styles.bookingId}>{booking.id}</Text><StatusBadge status={booking.status} /></View><Text style={styles.customer}>{booking.customer_name}</Text><Text style={styles.meta}>{booking.service} · {booking.preferred_date} {booking.preferred_time}</Text><Text style={styles.route}>{booking.pickup}{booking.destination ? ` → ${booking.destination}` : ''}</Text>{(booking.recommendation_level === 'high' || booking.recommendation_level === 'attention' || booking.status === 'change_requested') && <View style={styles.attention}><Text style={styles.attentionText}>HUOMIO · {(booking.recommendation_level || booking.status).toUpperCase()}</Text></View>}</TouchableOpacity>)}</View>
    {!visibleBookings.length && <View style={styles.empty}><Text style={styles.emptyTitle}>Ei osumia</Text><Text style={styles.copyDark}>Muuta hakua tai suodatinta.</Text></View>}
  </ScrollView>;
}

function StatusBadge({ status }: { status: string }) { const live = ['confirmed', 'assigned', 'in_progress', 'change_requested'].includes(status); return <View style={[styles.badge, live && styles.badgeLive, status === 'cancelled' && styles.badgeCancelled]}><View style={[styles.badgeDot, live && styles.badgeDotLive]} /><Text style={styles.badgeText}>{statusFi[status] || status}</Text></View>; }
function Stat({ label, value, active, onPress }: { label: string; value: number; active?: boolean; onPress?: () => void }) { return <TouchableOpacity activeOpacity={.82} onPress={onPress} style={[styles.stat, active && styles.statActive]}><Text style={[styles.statValue, active && styles.statValueActive]}>{value}</Text><Text style={[styles.statLabel, active && styles.statLabelActive]}>{label}</Text></TouchableOpacity>; }
function Section({ title, children }: { title: string; children: React.ReactNode }) { return <View style={styles.section}><Text style={styles.sectionLabel}>{title.toUpperCase()}</Text>{children}</View>; }
function Row({ label, value }: { label: string; value?: string }) { return <View style={styles.row}><Text style={styles.rowLabel}>{label}</Text><Text selectable style={styles.rowValue}>{value || '—'}</Text></View>; }
function prettySnapshot(raw: string) { try { return JSON.stringify(JSON.parse(raw), null, 2); } catch { return raw; } }

const styles = StyleSheet.create({
  wrap: { padding: 15, paddingBottom: 46, gap: 12, backgroundColor: colors.paper, minHeight: '100%' },
  loginCard: { backgroundColor: '#06191F', borderRadius: radius.xl, padding: 22, gap: 13, marginTop: 28, borderWidth: 1, borderColor: '#21454E', ...shadow },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 7 }, liveRowDark: { flexDirection: 'row', alignItems: 'center', gap: 6 }, liveDot: { width: 7, height: 7, borderRadius: 99, backgroundColor: colors.lime, shadowColor: colors.lime, shadowOpacity: 1, shadowRadius: 8 },
  kicker: { color: colors.lime, fontSize: 10, fontWeight: '950', letterSpacing: 1.15 }, kickerDark: { color: '#728883', fontSize: 9, fontWeight: '950', letterSpacing: 1.1 },
  loginTitle: { color: '#fff', fontSize: 30, fontWeight: '950', letterSpacing: -1 }, copy: { color: '#AFC1BD', fontSize: 14, lineHeight: 21 }, copyDark: { color: colors.muted, fontSize: 13, lineHeight: 20 },
  tokenInput: { minHeight: 54, borderRadius: 15, paddingHorizontal: 15, backgroundColor: '#10313A', borderWidth: 1, borderColor: '#244A53', color: '#fff', fontSize: 15 },
  primary: { minHeight: 55, borderRadius: 15, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' }, primaryText: { color: colors.ink, fontWeight: '950', fontSize: 15 }, error: { color: colors.danger, fontSize: 13, lineHeight: 19 },
  topRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }, pageTitle: { color: colors.ink, fontSize: 35, fontWeight: '950', letterSpacing: -1.3, marginTop: 3 }, logout: { color: '#647773', fontSize: 12, fontWeight: '850', paddingBottom: 5 },
  stats: { flexDirection: 'row', gap: 6 }, stat: { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line, borderRadius: 15, padding: 11, minHeight: 74 }, statActive: { backgroundColor: colors.ink, borderColor: colors.ink }, statValue: { color: colors.ink, fontSize: 23, fontWeight: '950' }, statValueActive: { color: colors.lime }, statLabel: { color: colors.muted, fontSize: 9, fontWeight: '850', marginTop: 2 }, statLabelActive: { color: '#9EB3AF' },
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 52, borderRadius: 15, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line, paddingHorizontal: 13 }, searchIcon: { color: '#7D908B', fontSize: 20, fontWeight: '800' }, searchInput: { flex: 1, color: colors.ink, fontSize: 14, fontWeight: '700' }, resultCount: { color: '#84938F', fontSize: 10, fontWeight: '850', textAlign: 'right' },
  list: { gap: 9 }, bookingCard: { backgroundColor: '#fff', borderRadius: radius.lg, padding: 16, borderWidth: 1, borderColor: colors.line, ...shadow }, cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }, bookingId: { color: '#71827F', fontSize: 10, fontWeight: '950', letterSpacing: .7 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 999, backgroundColor: '#EAF1E7', paddingHorizontal: 9, paddingVertical: 5 }, badgeLive: { backgroundColor: '#E9F7DA' }, badgeCancelled: { backgroundColor: '#F7E7E7' }, badgeDot: { width: 6, height: 6, borderRadius: 99, backgroundColor: '#91A19B' }, badgeDotLive: { backgroundColor: colors.limeStrong }, badgeText: { color: colors.ink, fontSize: 9, fontWeight: '950' },
  customer: { color: colors.ink, fontSize: 20, fontWeight: '950', marginTop: 9 }, meta: { color: '#667A76', fontSize: 12, fontWeight: '750', marginTop: 4 }, route: { color: colors.ink, fontSize: 13, lineHeight: 19, marginTop: 9, fontWeight: '650' }, attention: { alignSelf: 'flex-start', backgroundColor: '#FFF0D8', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5, marginTop: 10 }, attentionText: { color: '#9A5F17', fontSize: 8, fontWeight: '950', letterSpacing: .5 },
  empty: { backgroundColor: '#fff', borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, padding: 20, alignItems: 'center' }, emptyTitle: { color: colors.ink, fontSize: 19, fontWeight: '950', marginBottom: 4 },
  back: { color: '#5F746F', fontWeight: '900', fontSize: 13 }, detailHero: { backgroundColor: '#06191F', borderRadius: radius.xl, padding: 21, overflow: 'hidden', borderWidth: 1, borderColor: '#21454E' }, detailGlow: { position: 'absolute', width: 180, height: 180, borderRadius: 90, right: -70, top: -90, backgroundColor: '#315D65', opacity: .55 }, detailTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, detailTitle: { color: '#fff', fontSize: 30, fontWeight: '950', letterSpacing: -1, marginTop: 7 }, detailSub: { color: '#AFC1BD', fontSize: 13, marginTop: 6 }, detailRoute: { color: '#fff', fontSize: 14, lineHeight: 20, fontWeight: '700', marginTop: 15 },
  quickRow: { flexDirection: 'row', gap: 7 }, quick: { flex: 1, minHeight: 58, borderRadius: 14, backgroundColor: '#0D3038', alignItems: 'center', justifyContent: 'center', gap: 3 }, quickIcon: { color: colors.lime, fontSize: 15, fontWeight: '950' }, quickText: { color: '#fff', fontSize: 11, fontWeight: '900' },
  section: { backgroundColor: '#fff', borderRadius: radius.lg, padding: 16, borderWidth: 1, borderColor: colors.line }, sectionLabel: { color: '#6B7D79', fontSize: 9, fontWeight: '950', letterSpacing: 1, marginBottom: 7 }, row: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#EEF1ED' }, rowLabel: { color: '#83918F', fontSize: 9, fontWeight: '900', textTransform: 'uppercase' }, rowValue: { color: colors.ink, fontSize: 13, lineHeight: 19, fontWeight: '700', marginTop: 3 },
  recommend: { backgroundColor: '#EDF6E3', borderRadius: radius.lg, padding: 17 }, recommendHigh: { backgroundColor: '#FFF0D8' }, recommendText: { color: '#405749', fontSize: 14, lineHeight: 22, fontWeight: '700' }, code: { color: '#3F5550', fontSize: 10, lineHeight: 16, fontFamily: 'monospace' },
  sectionTitle: { color: colors.ink, fontSize: 19, fontWeight: '950', marginTop: 3 }, statusGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 }, statusButton: { minHeight: 44, borderRadius: 12, paddingHorizontal: 12, borderWidth: 1, borderColor: colors.line, backgroundColor: '#fff', justifyContent: 'center' }, statusButtonActive: { backgroundColor: colors.ink, borderColor: colors.ink }, statusButtonText: { color: colors.ink, fontWeight: '900', fontSize: 11 }, statusButtonTextActive: { color: colors.lime },
  changeNotice: { backgroundColor: '#FFF3DE', borderRadius: radius.lg, padding: 15, borderWidth: 1, borderColor: '#F1D8AF' }, changeTitle: { color: '#9C6019', fontSize: 14, fontWeight: '950' }, changeCopy: { color: '#7C684F', fontSize: 12, lineHeight: 18, marginTop: 4 },
});
