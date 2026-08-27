import { useCallback, useEffect, useMemo, useState } from 'react';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Platform, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Booking, BookingEvent, getClientAccount, registerAccountPush, updateClientAccountBooking } from '../src/api';
import { useLanguage } from '../src/i18n';
import { registerForNotifications } from '../src/notifications';
import { secureStorage } from '../src/storage';
import { colors, radius } from '../src/theme';

const statusCopy: Record<string, Record<string, string>> = {
  fi: { new:'Vastaanotettu', confirmed:'Vahvistettu', assigned:'Tekijä määritetty', on_the_way:'Matkalla', in_progress:'Käynnissä', completed:'Valmis', cancelled:'Peruttu', change_requested:'Muutos käsittelyssä' },
  en: { new:'Received', confirmed:'Confirmed', assigned:'Crew assigned', on_the_way:'On the way', in_progress:'In progress', completed:'Completed', cancelled:'Cancelled', change_requested:'Change requested' },
  ru: { new:'Получен', confirmed:'Подтверждён', assigned:'Исполнитель назначен', on_the_way:'В пути', in_progress:'В работе', completed:'Завершён', cancelled:'Отменён', change_requested:'Изменение рассматривается' },
  uk: { new:'Отримано', confirmed:'Підтверджено', assigned:'Виконавця призначено', on_the_way:'В дорозі', in_progress:'В роботі', completed:'Завершено', cancelled:'Скасовано', change_requested:'Зміну розглядають' },
};

const copy: Record<string, Record<string, string>> = {
  fi: { live:'LIVE TILAUS', offer:'HINTATARJOUS', accept:'Hyväksy hinta', change:'Pyydä muutosta', changeHint:'Mitä hintaan pitäisi muuttaa?', crew:'TEKIJÄ', timeline:'Tapahtumat', modify:'Muuta tilausta', send:'Lähetä muutospyyntö', cancel:'Peru tilaus', back:'Takaisin profiiliin', refresh:'Päivitetty', push:'Ota push-ilmoitukset käyttöön', pushReady:'Push-ilmoitukset käytössä', session:'Istunto on vanhentunut. Kirjaudu uudelleen.', pickup:'Lähtö / palveluosoite', destination:'Kohdeosoite', date:'Päivä', time:'Aika', notes:'Lisätiedot' },
  en: { live:'LIVE ORDER', offer:'PRICE OFFER', accept:'Accept price', change:'Request change', changeHint:'What should change in the price?', crew:'CREW', timeline:'Timeline', modify:'Modify booking', send:'Send change request', cancel:'Cancel booking', back:'Back to profile', refresh:'Updated', push:'Enable push notifications', pushReady:'Push notifications enabled', session:'Your session expired. Please sign in again.', pickup:'Pickup / service address', destination:'Destination', date:'Date', time:'Time', notes:'Notes' },
  ru: { live:'ЗАКАЗ LIVE', offer:'ПРЕДЛОЖЕНИЕ ЦЕНЫ', accept:'Принять цену', change:'Попросить изменение', changeHint:'Что нужно изменить в цене?', crew:'ИСПОЛНИТЕЛЬ', timeline:'История', modify:'Изменить заказ', send:'Отправить запрос', cancel:'Отменить заказ', back:'Назад в профиль', refresh:'Обновлено', push:'Включить push-уведомления', pushReady:'Push-уведомления включены', session:'Сессия истекла. Войдите снова.', pickup:'Адрес погрузки / услуги', destination:'Адрес назначения', date:'Дата', time:'Время', notes:'Комментарий' },
  uk: { live:'ЗАМОВЛЕННЯ LIVE', offer:'ПРОПОЗИЦІЯ ЦІНИ', accept:'Прийняти ціну', change:'Запросити зміну', changeHint:'Що треба змінити у ціні?', crew:'ВИКОНАВЕЦЬ', timeline:'Історія', modify:'Змінити замовлення', send:'Надіслати запит', cancel:'Скасувати замовлення', back:'Назад до профілю', refresh:'Оновлено', push:'Увімкнути push-сповіщення', pushReady:'Push-сповіщення увімкнені', session:'Сесія завершилась. Увійдіть знову.', pickup:'Адреса завантаження / послуги', destination:'Адреса призначення', date:'Дата', time:'Час', notes:'Коментар' },
};

const chain = ['new', 'confirmed', 'assigned', 'on_the_way', 'in_progress', 'completed'];

export default function AccountOrderScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { locale } = useLanguage();
  const t = copy[locale] ?? copy.fi;
  const statuses = statusCopy[locale] ?? statusCopy.fi;
  const [booking, setBooking] = useState<Booking | null>(null);
  const [events, setEvents] = useState<BookingEvent[]>([]);
  const [token, setToken] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [quoteNote, setQuoteNote] = useState('');

  const apply = useCallback((b: Booking, e: BookingEvent[] = []) => {
    setBooking(b); setEvents(e); setPickup(b.pickup); setDestination(b.destination);
    setDate(b.preferred_date); setTime(b.preferred_time); setNotes(b.notes || '');
    setLastUpdated(new Date());
  }, []);

  const load = useCallback(async (quiet = false) => {
    if (!quiet) setBusy(true);
    try {
      const session = await secureStorage.getClientSession();
      if (!session.token) {
        await secureStorage.clearClientSession();
        setMsg(t.session);
        router.replace('/');
        return;
      }
      setToken(session.token);
      const r = await getClientAccount(session.token, String(id || ''));
      apply(r.booking, r.events || []);
      if (!quiet) setMsg('');
    } catch (error) {
      const text = error instanceof Error ? error.message : 'Error';
      if (/SESSION_INVALID|UNAUTHORIZED|401/i.test(text)) {
        await secureStorage.clearClientSession();
        router.replace('/');
        return;
      }
      if (!quiet) setMsg(text);
    } finally {
      if (!quiet) setBusy(false);
    }
  }, [apply, id, t.session]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  useEffect(() => {
    if (!booking?.id || !token) return undefined;
    const timer = setInterval(() => void load(true), 20_000);
    return () => clearInterval(timer);
  }, [booking?.id, load, token]);

  const act = async (bookingAction: string, patch: Record<string, unknown> = {}) => {
    if (!booking || !token) return;
    setBusy(true); setMsg('');
    try {
      const r = await updateClientAccountBooking(token, booking.id, bookingAction, patch);
      apply(r.booking, r.events || []); setMsg('✓');
    } catch (error) { setMsg(error instanceof Error ? error.message : 'Error'); }
    finally { setBusy(false); }
  };

  const enablePush = async () => {
    if (!booking || !token) return;
    const result = await registerForNotifications();
    if (!result.ok) { setMsg(result.reason); return; }
    try {
      await registerAccountPush(token, booking.id, result.token, Platform.OS, locale);
      setMsg(t.pushReady);
    } catch (error) { setMsg(error instanceof Error ? error.message : 'Push error'); }
  };

  const progressIndex = useMemo(() => chain.indexOf(booking?.status || 'new'), [booking?.status]);

  if (!booking) return (
    <ScrollView contentContainerStyle={s.wrap} refreshControl={<RefreshControl refreshing={busy} onRefresh={() => void load()} />}>
      <Text style={s.loadingTitle}>Muuttobotti</Text><Text style={s.loadingText}>{msg || 'Loading…'}</Text>
    </ScrollView>
  );

  const quotePending = booking.quote_status === 'pending' && Number(booking.quoted_price || 0) > 0;
  const editable = ['new','confirmed','assigned','change_requested'].includes(booking.status);

  return <ScrollView contentContainerStyle={s.wrap} refreshControl={<RefreshControl refreshing={busy} onRefresh={() => void load()} tintColor={colors.ink}/>} keyboardShouldPersistTaps="handled">
    <View style={s.hero}>
      <View style={s.liveRow}><View style={s.liveDot}/><Text style={s.kicker}>{t.live} · {booking.id}</Text></View>
      <Text style={s.title}>{statuses[booking.status] || booking.status}</Text>
      <Text style={s.copy}>{booking.preferred_date} {booking.preferred_time} · {booking.service}</Text>
      <View style={s.progress}>{chain.map((item,index)=><View key={item} style={[s.progressBar,index<=progressIndex&&s.progressOn]}/>)}</View>
      <View style={s.route}><Text style={s.routeText}>{booking.pickup}</Text><Text style={s.routeArrow}>↓</Text><Text style={s.routeText}>{booking.destination}</Text></View>
      {lastUpdated && <Text style={s.updated}>{t.refresh} · {lastUpdated.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</Text>}
    </View>

    {quotePending && <View style={s.offer}><Text style={s.offerLabel}>{t.offer}</Text><Text style={s.offerPrice}>{Number(booking.quoted_price).toFixed(2)} €</Text><Text style={s.offerCopy}>{booking.admin_note || ''}</Text><TouchableOpacity disabled={busy} style={s.primary} onPress={()=>void act('accept_quote')}><Text style={s.primaryText}>{t.accept}</Text></TouchableOpacity><TextInput multiline value={quoteNote} onChangeText={setQuoteNote} placeholder={t.changeHint} placeholderTextColor="#788B84" style={[s.input,s.textarea]}/><TouchableOpacity style={s.secondary} onPress={()=>void act('reject_quote',{note:quoteNote})}><Text style={s.secondaryText}>{t.change}</Text></TouchableOpacity></View>}

    {!!booking.assigned_worker && <View style={s.crew}><Text style={s.kicker}>{t.crew}</Text><Text style={s.crewName}>{booking.assigned_worker}</Text><Text style={s.copy}>{booking.assigned_worker_phone || ''}</Text></View>}

    <View style={s.panel}><Text style={s.section}>{t.timeline}</Text>{events.length===0?<Text style={s.muted}>—</Text>:events.slice().reverse().map((e,i)=><View key={`${e.event_id||i}-${e.created_at}`} style={s.event}><View style={s.dot}/><View style={{flex:1}}><Text style={s.eventTitle}>{statuses[e.status] || e.event_type}</Text><Text style={s.eventMeta}>{new Date(e.created_at).toLocaleString()} · {e.source}</Text>{!!e.note&&<Text style={s.eventNote}>{e.note}</Text>}</View></View>)}</View>

    <TouchableOpacity style={s.push} onPress={()=>void enablePush()}><Text style={s.pushText}>◉ {t.push}</Text></TouchableOpacity>

    {editable && <View style={s.panel}><Text style={s.section}>{t.modify}</Text><Field label={t.pickup} value={pickup} onChangeText={setPickup}/><Field label={t.destination} value={destination} onChangeText={setDestination}/><View style={s.two}><Field label={t.date} value={date} onChangeText={setDate}/><Field label={t.time} value={time} onChangeText={setTime}/></View><TextInput multiline value={notes} onChangeText={setNotes} placeholder={t.notes} placeholderTextColor="#788B84" style={[s.input,s.textarea]}/><TouchableOpacity disabled={busy} style={s.primary} onPress={()=>void act('modify',{pickup,destination,date,time,notes})}><Text style={s.primaryText}>{t.send}</Text></TouchableOpacity><TouchableOpacity style={s.danger} onPress={()=>void act('cancel')}><Text style={s.dangerText}>{t.cancel}</Text></TouchableOpacity></View>}

    {!!msg&&<Text style={s.msg}>{msg}</Text>}
    <TouchableOpacity style={s.secondary} onPress={()=>router.replace('/(client)/profile')}><Text style={s.secondaryText}>{t.back}</Text></TouchableOpacity>
  </ScrollView>;
}

function Field(props:any){return <View style={[s.field,props.style]}><Text style={s.label}>{props.label}</Text><TextInput {...props} placeholderTextColor="#788B84" style={s.input}/></View>}

const s=StyleSheet.create({
  wrap:{padding:16,paddingBottom:48,gap:11,backgroundColor:'#EEF3EE'},loadingTitle:{fontSize:31,fontWeight:'900',color:colors.ink},loadingText:{color:colors.muted},hero:{backgroundColor:'#06191F',borderRadius:radius.xl,padding:21},liveRow:{flexDirection:'row',alignItems:'center',gap:7},liveDot:{width:7,height:7,borderRadius:7,backgroundColor:'#C8FF36'},kicker:{color:'#C8FF36',fontSize:9,fontWeight:'900',letterSpacing:1},title:{color:'#fff',fontSize:31,fontWeight:'900',letterSpacing:-1,marginTop:7},copy:{color:'#A7BDB8',fontSize:12,lineHeight:18,marginTop:5},progress:{flexDirection:'row',gap:5,marginTop:14},progressBar:{flex:1,height:5,borderRadius:5,backgroundColor:'#24444C'},progressOn:{backgroundColor:'#C8FF36'},route:{marginTop:15,paddingTop:12,borderTopWidth:1,borderTopColor:'#24444C'},routeText:{color:'#fff',fontSize:13,fontWeight:'800'},routeArrow:{color:'#C8FF36',marginVertical:2},updated:{color:'#718F89',fontSize:9,fontWeight:'800',marginTop:11},offer:{backgroundColor:'#F2FFE0',borderWidth:1,borderColor:'#CDEB91',borderRadius:radius.lg,padding:17},offerLabel:{color:'#607842',fontSize:9,fontWeight:'900',letterSpacing:1},offerPrice:{fontSize:37,fontWeight:'900',color:colors.ink,marginTop:3},offerCopy:{color:'#5F735A',fontSize:12,lineHeight:18,marginTop:4},crew:{backgroundColor:'#0C2E36',borderRadius:radius.lg,padding:17},crewName:{color:'#fff',fontSize:20,fontWeight:'900',marginTop:5},panel:{backgroundColor:'#fff',borderRadius:radius.lg,padding:16,borderWidth:1,borderColor:colors.line,gap:8},section:{color:colors.ink,fontSize:18,fontWeight:'900'},muted:{color:colors.muted},event:{flexDirection:'row',gap:9,paddingVertical:8,borderBottomWidth:1,borderBottomColor:'#EEF1EE'},dot:{width:9,height:9,borderRadius:5,backgroundColor:'#C8FF36',marginTop:4},eventTitle:{color:colors.ink,fontSize:12,fontWeight:'900'},eventMeta:{color:colors.muted,fontSize:9,marginTop:2},eventNote:{color:'#5E716C',fontSize:10,lineHeight:15,marginTop:3},field:{flex:1,backgroundColor:'#fff',borderWidth:1,borderColor:colors.line,borderRadius:14,paddingHorizontal:12,paddingTop:9},label:{fontSize:9,fontWeight:'900',color:'#6C807A',textTransform:'uppercase'},input:{minHeight:40,color:colors.ink,fontWeight:'700',padding:0},textarea:{minHeight:80,textAlignVertical:'top',backgroundColor:'#fff',borderWidth:1,borderColor:colors.line,borderRadius:14,padding:12},two:{flexDirection:'row',gap:7},primary:{minHeight:51,borderRadius:14,backgroundColor:'#C8FF36',alignItems:'center',justifyContent:'center',marginTop:8},primaryText:{color:colors.ink,fontWeight:'900'},secondary:{minHeight:48,borderRadius:14,borderWidth:1,borderColor:colors.line,backgroundColor:'#fff',alignItems:'center',justifyContent:'center',marginTop:7},secondaryText:{color:colors.ink,fontWeight:'900'},danger:{minHeight:48,borderRadius:14,backgroundColor:'#FAE8E8',alignItems:'center',justifyContent:'center',marginTop:7},dangerText:{color:colors.danger,fontWeight:'900'},push:{minHeight:48,borderRadius:14,backgroundColor:'#0D3037',alignItems:'center',justifyContent:'center'},pushText:{color:'#C8FF36',fontWeight:'900',fontSize:12},msg:{color:'#4E7748',fontSize:12,fontWeight:'800'}
});
