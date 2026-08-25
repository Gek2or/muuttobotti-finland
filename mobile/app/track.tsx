import { useEffect, useMemo, useState } from 'react';
import DateTimePicker from '@expo/ui/community/datetime-picker';
import { useLocalSearchParams } from 'expo-router';
import {
  Linking,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Booking, BookingEvent, getBooking, registerBookingPush, updateClientBooking } from '../src/api';
import { useLanguage } from '../src/i18n';
import { registerForNotifications } from '../src/notifications';
import { secureStorage } from '../src/storage';
import { colors, radius, shadow } from '../src/theme';

const pad = (value: number) => String(value).padStart(2, '0');
const dateString = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const timeString = (date: Date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`;
const fromDateTime = (date: string, time: string) => {
  const parsed = new Date(`${date || '2026-01-01'}T${time || '10:00'}:00`);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
};

const uiCopy: Record<string, Record<string, string>> = {
  fi: { live: 'LIVE TILAUS', offer: 'Hintatarjous', accept: 'Hyväksy hinta', changePrice: 'Pyydä muutosta', crew: 'Tekijä', call: 'Soita', timeline: 'Tapahtumat', enable: 'Ota push-ilmoitukset käyttöön', priceNote: 'Hyväksytty hinta lukitaan tilaukselle.', changeHint: 'Kirjoita lyhyesti mitä hintaan pitäisi muuttaa.', send: 'Lähetä pyyntö', modify: 'Muuta tilausta', another: 'Avaa toinen tilaus' },
  en: { live: 'LIVE ORDER', offer: 'Price offer', accept: 'Accept price', changePrice: 'Request change', crew: 'Assigned crew', call: 'Call', timeline: 'Timeline', enable: 'Enable push notifications', priceNote: 'Accepted price is locked to the booking.', changeHint: 'Tell us briefly what should change in the price.', send: 'Send request', modify: 'Modify booking', another: 'Open another booking' },
  ru: { live: 'ЗАКАЗ LIVE', offer: 'Предложение цены', accept: 'Принять цену', changePrice: 'Попросить изменение', crew: 'Исполнитель', call: 'Позвонить', timeline: 'История', enable: 'Включить push-уведомления', priceNote: 'После принятия цена фиксируется за заказом.', changeHint: 'Коротко напишите, что нужно изменить в цене.', send: 'Отправить запрос', modify: 'Изменить заказ', another: 'Открыть другой заказ' },
  uk: { live: 'ЗАМОВЛЕННЯ LIVE', offer: 'Пропозиція ціни', accept: 'Прийняти ціну', changePrice: 'Запросити зміну', crew: 'Виконавець', call: 'Подзвонити', timeline: 'Історія', enable: 'Увімкнути push-сповіщення', priceNote: 'Після прийняття ціна фіксується.', changeHint: 'Коротко напишіть, що треба змінити у ціні.', send: 'Надіслати запит', modify: 'Змінити замовлення', another: 'Відкрити інше замовлення' },
};

const statusCopy: Record<string, Record<string, string>> = {
  fi: { new: 'Vastaanotettu', confirmed: 'Vahvistettu', assigned: 'Tekijä määritetty', on_the_way: 'Matkalla', in_progress: 'Käynnissä', completed: 'Valmis', cancelled: 'Peruttu', change_requested: 'Muutos käsittelyssä' },
  en: { new: 'Received', confirmed: 'Confirmed', assigned: 'Crew assigned', on_the_way: 'On the way', in_progress: 'In progress', completed: 'Completed', cancelled: 'Cancelled', change_requested: 'Change requested' },
  ru: { new: 'Получен', confirmed: 'Подтверждён', assigned: 'Исполнитель назначен', on_the_way: 'В пути', in_progress: 'В работе', completed: 'Завершён', cancelled: 'Отменён', change_requested: 'Изменение рассматривается' },
  uk: { new: 'Отримано', confirmed: 'Підтверджено', assigned: 'Виконавця призначено', on_the_way: 'В дорозі', in_progress: 'В роботі', completed: 'Завершено', cancelled: 'Скасовано', change_requested: 'Зміну розглядають' },
};

export default function TrackScreen() {
  const params = useLocalSearchParams<{ id?: string; key?: string }>();
  const { locale, tr } = useLanguage();
  const t = uiCopy[locale] ?? uiCopy.fi;
  const statuses = statusCopy[locale] ?? statusCopy.fi;

  const [id, setId] = useState('');
  const [key, setKey] = useState('');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [events, setEvents] = useState<BookingEvent[]>([]);
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [quoteNote, setQuoteNote] = useState('');
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [showQuoteChange, setShowQuoteChange] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const apply = (nextBooking: Booking, nextEvents: BookingEvent[] = []) => {
    setBooking(nextBooking);
    setEvents(nextEvents);
    setPickup(nextBooking.pickup);
    setDestination(nextBooking.destination);
    setDate(nextBooking.preferred_date);
    setTime(nextBooking.preferred_time);
    setNotes(nextBooking.notes || '');
  };

  const loadWith = async (nextId = id, nextKey = key, quiet = false) => {
    if (!nextId || !nextKey) {
      if (!quiet) setMessage(tr('enterTracking'));
      return;
    }
    if (!quiet) setBusy(true);
    try {
      const normalizedId = nextId.trim().toUpperCase();
      const normalizedKey = nextKey.trim().toLowerCase();
      const result = await getBooking(normalizedId, normalizedKey);
      apply(result.booking, result.events || []);
      await secureStorage.setClientCredentials(normalizedId, normalizedKey);
      if (!quiet) setMessage('');
    } catch (error) {
      if (!quiet) setMessage(error instanceof Error ? error.message : tr('enterTracking'));
    } finally {
      if (!quiet) setBusy(false);
    }
  };

  useEffect(() => {
    void (async () => {
      const saved = await secureStorage.getClientCredentials();
      const nextId = String(params.id || saved.id || '').toUpperCase();
      const nextKey = String(params.key || saved.key || '').toLowerCase();
      setId(nextId);
      setKey(nextKey);
      if (nextId && nextKey) await loadWith(nextId, nextKey);
    })();
    // params intentionally drive credential reloads.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id, params.key]);

  useEffect(() => {
    if (!booking) return undefined;
    const timer = setInterval(() => void loadWith(id, key, true), 20_000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booking?.id, id, key]);

  const patch = async (data: Record<string, unknown>) => {
    if (!booking) return;
    setBusy(true);
    setMessage('');
    try {
      const result = await updateClientBooking(id, key, data);
      apply(result.booking, result.events || []);
      setMessage('✓');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Error');
    } finally {
      setBusy(false);
    }
  };

  const enablePush = async () => {
    const result = await registerForNotifications();
    if (!result.ok) {
      setMessage(result.reason);
      return;
    }
    try {
      await registerBookingPush(id, key, result.token, Platform.OS, locale);
      setMessage('✓ Push');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Push error');
    }
  };

  const progress = useMemo(() => {
    const chain = ['new', 'confirmed', 'assigned', 'on_the_way', 'in_progress', 'completed'];
    return { chain, index: chain.indexOf(booking?.status || 'new') };
  }, [booking?.status]);

  if (!booking) {
    return (
      <ScrollView contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled">
        <View style={styles.loginHero}>
          <Text style={styles.kicker}>MUUTTOBOTTI · V2</Text>
          <Text style={styles.loginTitle}>{tr('tracking')}</Text>
          <Text style={styles.heroCopy}>{tr('enterTracking')}</Text>
        </View>
        <Field label={tr('bookingNumber')} value={id} onChangeText={setId} autoCapitalize="characters" placeholder="MB-12AB34CD" />
        <Field label={tr('accessKey')} value={key} onChangeText={setKey} autoCapitalize="none" secureTextEntry />
        <TouchableOpacity disabled={busy} onPress={() => void loadWith()} style={styles.primary}>
          <Text style={styles.primaryText}>{busy ? '…' : tr('openBooking')}</Text>
        </TouchableOpacity>
        {!!message && <Text style={styles.message}>{message}</Text>}
      </ScrollView>
    );
  }

  const dateTime = fromDateTime(date, time);
  const quotePending = Number(booking.quoted_price || 0) > 0 && booking.quote_status === 'pending';
  const editable = ['new', 'confirmed', 'assigned', 'change_requested'].includes(booking.status);

  return (
    <ScrollView
      contentContainerStyle={styles.wrap}
      refreshControl={<RefreshControl refreshing={busy} onRefresh={() => void loadWith()} tintColor={colors.ink} />}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.statusCard}>
        <View style={styles.glow} />
        <Text style={styles.kicker}>{t.live} · {booking.id}</Text>
        <Text style={styles.status}>{statuses[booking.status] || booking.status}</Text>
        <Text style={styles.service}>{booking.service} · {booking.preferred_date} {booking.preferred_time}</Text>
        <View style={styles.progress}>
          {progress.chain.map((item, index) => <View key={item} style={[styles.dot, index <= progress.index && styles.dotOn]} />)}
        </View>
      </View>

      {quotePending && (
        <View style={styles.quote}>
          <Text style={styles.quoteLabel}>{t.offer}</Text>
          <Text style={styles.quotePrice}>{Number(booking.quoted_price).toFixed(2)} €</Text>
          <Text style={styles.quoteCopy}>{booking.admin_note || t.priceNote}</Text>
          <TouchableOpacity disabled={busy} style={styles.primary} onPress={() => void patch({ action: 'accept_quote' })}>
            <Text style={styles.primaryText}>{t.accept}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondary} onPress={() => setShowQuoteChange(value => !value)}>
            <Text style={styles.secondaryText}>{t.changePrice}</Text>
          </TouchableOpacity>
          {showQuoteChange && (
            <>
              <View style={styles.field}>
                <Text style={styles.label}>{t.changeHint}</Text>
                <TextInput value={quoteNote} onChangeText={setQuoteNote} multiline style={[styles.input, styles.textarea]} />
              </View>
              <TouchableOpacity style={styles.secondary} onPress={() => void patch({ action: 'reject_quote', note: quoteNote })}>
                <Text style={styles.secondaryText}>{t.send}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}

      {!!booking.assigned_worker && (
        <View style={styles.crew}>
          <View>
            <Text style={styles.smallLabel}>{t.crew}</Text>
            <Text style={styles.crewName}>{booking.assigned_worker}</Text>
            <Text style={styles.crewPhone}>{booking.assigned_worker_phone || 'Muuttobotti'}</Text>
          </View>
          {!!booking.assigned_worker_phone && (
            <TouchableOpacity style={styles.call} onPress={() => void Linking.openURL(`tel:${booking.assigned_worker_phone}`)}>
              <Text style={styles.callText}>{t.call}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <View style={styles.summary}>
        <Row label={tr('name')} value={booking.customer_name} />
        <Row label={tr('pickup')} value={booking.pickup} />
        <Row label={tr('destination')} value={booking.destination} />
        {Number(booking.final_price || 0) > 0 && <Row label="Final" value={`${Number(booking.final_price).toFixed(2)} €`} />}
      </View>

      <View style={styles.timelineCard}>
        <Text style={styles.sectionTitle}>{t.timeline}</Text>
        {events.length === 0 ? <Text style={styles.muted}>—</Text> : events.slice().reverse().map((event, index) => (
          <View key={`${event.event_id || index}-${event.created_at}`} style={styles.event}>
            <View style={styles.eventDot} />
            <View style={{ flex: 1 }}>
              <Text style={styles.eventTitle}>{statuses[event.status] || event.event_type}</Text>
              <Text style={styles.eventMeta}>{new Date(event.created_at).toLocaleString()} · {event.source}</Text>
              {!!event.note && <Text style={styles.eventNote}>{event.note}</Text>}
            </View>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.pushButton} onPress={() => void enablePush()}>
        <Text style={styles.pushText}>◉ {t.enable}</Text>
      </TouchableOpacity>

      {editable && (
        <>
          <Text style={styles.sectionTitle}>{t.modify}</Text>
          <Field label={tr('pickup')} value={pickup} onChangeText={setPickup} />
          <Field label={tr('destination')} value={destination} onChangeText={setDestination} />
          <View style={styles.two}>
            <TouchableOpacity style={[styles.field, { flex: 1 }]} onPress={() => { setShowDate(value => !value); setShowTime(false); }}>
              <Text style={styles.label}>{tr('date')}</Text><Text style={styles.pickerValue}>{date}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.field, { flex: 1 }]} onPress={() => { setShowTime(value => !value); setShowDate(false); }}>
              <Text style={styles.label}>{tr('time')}</Text><Text style={styles.pickerValue}>{time}</Text>
            </TouchableOpacity>
          </View>
          {showDate && (
            <View style={styles.pickerShell}>
              <DateTimePicker
                value={dateTime}
                mode="date"
                presentation={Platform.OS === 'android' ? 'dialog' : 'inline'}
                onValueChange={(_, value) => {
                  if (value) setDate(dateString(value));
                  if (Platform.OS === 'android') setShowDate(false);
                }}
              />
            </View>
          )}
          {showTime && (
            <View style={styles.pickerShell}>
              <DateTimePicker
                value={dateTime}
                mode="time"
                presentation={Platform.OS === 'android' ? 'dialog' : 'inline'}
                onValueChange={(_, value) => {
                  if (value) setTime(timeString(value));
                  if (Platform.OS === 'android') setShowTime(false);
                }}
              />
            </View>
          )}
          <View style={styles.field}>
            <Text style={styles.label}>{tr('notes')}</Text>
            <TextInput multiline value={notes} onChangeText={setNotes} style={[styles.input, styles.textarea]} />
          </View>
          <TouchableOpacity disabled={busy} onPress={() => void patch({ action: 'modify', pickup, destination, date, time, notes })} style={styles.primary}>
            <Text style={styles.primaryText}>{tr('sendChange')}</Text>
          </TouchableOpacity>
          <TouchableOpacity disabled={busy} onPress={() => void patch({ action: 'cancel' })} style={styles.danger}>
            <Text style={styles.dangerText}>{tr('cancelBooking')}</Text>
          </TouchableOpacity>
        </>
      )}

      {!!message && <Text style={styles.message}>{message}</Text>}
      <TouchableOpacity onPress={() => setBooking(null)} style={styles.secondary}>
        <Text style={styles.secondaryText}>{t.another}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Field(props: React.ComponentProps<typeof TextInput> & { label: string }) {
  const { label, ...inputProps } = props;
  return <View style={styles.field}><Text style={styles.label}>{label}</Text><TextInput {...inputProps} placeholderTextColor="#82938f" style={styles.input} /></View>;
}
function Row({ label, value }: { label: string; value: string }) {
  return <View style={styles.row}><Text style={styles.rowLabel}>{label}</Text><Text style={styles.rowValue}>{value || '—'}</Text></View>;
}

const styles = StyleSheet.create({
  wrap: { padding: 16, paddingBottom: 48, gap: 12, backgroundColor: '#EEF3EE' },
  loginHero: { backgroundColor: '#06191F', borderRadius: radius.xl, padding: 22, overflow: 'hidden' },
  loginTitle: { color: '#fff', fontSize: 32, fontWeight: '900', marginTop: 6 },
  heroCopy: { color: '#A7BDB8', lineHeight: 21, marginTop: 7 },
  statusCard: { backgroundColor: '#06191F', borderRadius: radius.xl, padding: 22, overflow: 'hidden', ...shadow },
  glow: { position: 'absolute', width: 190, height: 190, borderRadius: 95, right: -70, top: -80, backgroundColor: '#294E50', opacity: 0.58 },
  kicker: { color: '#C8FF36', fontSize: 10, fontWeight: '900', letterSpacing: 1.2 },
  status: { color: '#fff', fontSize: 32, fontWeight: '900', marginTop: 7, letterSpacing: -1 },
  service: { color: '#A7BDB8', fontSize: 13, marginTop: 6 },
  progress: { flexDirection: 'row', gap: 6, marginTop: 18 },
  dot: { height: 5, flex: 1, borderRadius: 9, backgroundColor: '#24424A' },
  dotOn: { backgroundColor: '#C8FF36' },
  quote: { backgroundColor: '#F2FFE0', borderColor: '#CDEB91', borderWidth: 1, borderRadius: radius.lg, padding: 18 },
  quoteLabel: { color: '#59713C', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  quotePrice: { color: colors.ink, fontSize: 38, fontWeight: '900', letterSpacing: -1.3, marginTop: 4 },
  quoteCopy: { color: '#5F735B', fontSize: 13, lineHeight: 20, marginTop: 4 },
  crew: { backgroundColor: '#0D2E36', borderRadius: radius.lg, padding: 17, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  smallLabel: { color: '#86A19B', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  crewName: { color: '#fff', fontSize: 20, fontWeight: '900', marginTop: 4 },
  crewPhone: { color: '#9AB1AC', fontSize: 12, marginTop: 3 },
  call: { backgroundColor: '#C8FF36', borderRadius: 13, paddingHorizontal: 17, minHeight: 44, justifyContent: 'center' },
  callText: { color: colors.ink, fontWeight: '900' },
  summary: { backgroundColor: '#fff', borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, overflow: 'hidden' },
  row: { padding: 14, borderBottomWidth: 1, borderBottomColor: '#EDF0EC' },
  rowLabel: { color: colors.muted, fontSize: 9, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.7 },
  rowValue: { color: colors.ink, fontSize: 15, lineHeight: 22, fontWeight: '700', marginTop: 4 },
  timelineCard: { backgroundColor: '#fff', borderRadius: radius.lg, padding: 17, borderWidth: 1, borderColor: colors.line },
  sectionTitle: { color: colors.ink, fontSize: 20, fontWeight: '900', marginTop: 6 },
  event: { flexDirection: 'row', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#EEF1EE' },
  eventDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#C8FF36', marginTop: 4, shadowColor: '#C8FF36', shadowOpacity: 0.5, shadowRadius: 7 },
  eventTitle: { color: colors.ink, fontWeight: '900', fontSize: 13 },
  eventMeta: { color: '#7B8C88', fontSize: 10, marginTop: 3 },
  eventNote: { color: '#5D706B', fontSize: 11, lineHeight: 17, marginTop: 4 },
  muted: { color: colors.muted },
  pushButton: { minHeight: 50, borderRadius: 15, backgroundColor: '#102F37', alignItems: 'center', justifyContent: 'center' },
  pushText: { color: '#fff', fontWeight: '900' },
  field: { backgroundColor: '#fff', borderRadius: radius.md, padding: 14, borderWidth: 1, borderColor: colors.line },
  label: { color: '#60706D', fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 7 },
  input: { minHeight: 38, color: colors.ink, fontSize: 16, fontWeight: '600', padding: 0 },
  textarea: { minHeight: 92, textAlignVertical: 'top' },
  two: { flexDirection: 'row', gap: 10 },
  pickerValue: { color: colors.ink, fontSize: 16, fontWeight: '800', minHeight: 38, textAlignVertical: 'center' },
  pickerShell: { backgroundColor: '#fff', borderRadius: radius.lg, padding: 8, borderWidth: 1, borderColor: colors.line },
  primary: { minHeight: 56, borderRadius: radius.md, backgroundColor: '#C8FF36', alignItems: 'center', justifyContent: 'center', marginTop: 9 },
  primaryText: { color: colors.ink, fontSize: 15, fontWeight: '900' },
  secondary: { minHeight: 50, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginTop: 9 },
  secondaryText: { color: colors.ink, fontWeight: '900' },
  danger: { minHeight: 50, borderRadius: radius.md, backgroundColor: '#F7E7E7', alignItems: 'center', justifyContent: 'center', marginTop: 9 },
  dangerText: { color: colors.danger, fontWeight: '900' },
  message: { color: colors.danger, fontSize: 13, lineHeight: 19 },
});
