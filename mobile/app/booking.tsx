import { useEffect, useMemo, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@expo/ui/community/datetime-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Linking, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { createBooking } from '../src/api';
import { useLanguage } from '../src/i18n';
import { secureStorage } from '../src/storage';
import { colors, radius, shadow } from '../src/theme';

type Service = 'moving' | 'cleaning' | 'transport';
type PickedPhoto = { uri: string; fileName?: string | null; mimeType?: string | null };
const services: Service[] = ['moving', 'cleaning', 'transport'];
const pad = (n: number) => String(n).padStart(2, '0');
const dateString = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const timeString = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

const copy = {
  fi: { title:'Varaa palvelu', sub:'Täytä tiedot. Saat varausnumeron ja yksityisen seurantalinkin, kun varaus tallentuu.', service:'Palvelu', estimate:'Laskurista tuotu arvio', ready:'Valmius', contact:'Yhteystiedot ja osoitteet', details:'Aika ja lisätiedot', optional:'Vapaaehtoinen', send:'Lähetä varaus', secure:'Tiedot lähetetään suoraan Muuttobotti-järjestelmään.', done:'Varaus vastaanotettu', doneText:'Pidä pääsykoodi tallessa. Sitä tarvitaan seurantaan.', again:'Tee uusi varaus', fallback:'Varausta ei voitu tallentaa. Avaamme WhatsAppin, jotta pyyntö ei katoa.' },
  en: { title:'Book a service', sub:'Fill in the details. You receive a booking number and private tracking link when it is saved.', service:'Service', estimate:'Estimate from calculator', ready:'Ready', contact:'Contact details and addresses', details:'Time and details', optional:'Optional', send:'Send booking', secure:'Your details are sent directly to the Muuttobotti system.', done:'Booking received', doneText:'Keep the access code safe. It is required for tracking.', again:'Create another booking', fallback:'The booking could not be saved. We will open WhatsApp so your request is not lost.' },
  uk: { title:'Забронювати послугу', sub:'Заповніть дані. Після збереження ви отримаєте номер і приватне посилання.', service:'Послуга', estimate:'Оцінка з калькулятора', ready:'Готовність', contact:'Контакти та адреси', details:'Час і деталі', optional:'Необов’язково', send:'Надіслати заявку', secure:'Дані надсилаються безпосередньо в систему Muuttobotti.', done:'Заявку отримано', doneText:'Збережіть код доступу для відстеження.', again:'Створити нову заявку', fallback:'Заявку не вдалося зберегти. Відкриємо WhatsApp, щоб запит не загубився.' },
  ru: { title:'Забронировать услугу', sub:'Заполни данные. После сохранения получишь номер заказа и приватную ссылку.', service:'Услуга', estimate:'Расчёт из калькулятора', ready:'Готовность', contact:'Контакты и адреса', details:'Время и детали', optional:'Необязательно', send:'Отправить заявку', secure:'Данные отправляются напрямую в систему Muuttobotti.', done:'Заявка получена', doneText:'Сохрани код доступа — он нужен для отслеживания.', again:'Создать новую заявку', fallback:'Заявку не удалось сохранить. Откроем WhatsApp, чтобы запрос не потерялся.' },
} as const;

export default function BookingScreen() {
  const { locale, tr } = useLanguage();
  const t = copy[locale];
  const params = useLocalSearchParams<{ service?: string; estimate?: string }>();
  const initialService: Service = services.includes(params.service as Service) ? (params.service as Service) : 'moving';
  const [service, setService] = useState<Service>(initialService);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [notes, setNotes] = useState(typeof params.estimate === 'string' ? params.estimate : '');
  const [dateValue, setDateValue] = useState(() => { const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(10, 0, 0, 0); return d; });
  const [timeValue, setTimeValue] = useState(() => { const d = new Date(); d.setHours(10, 0, 0, 0); return d; });
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [photos, setPhotos] = useState<PickedPhoto[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState<{ id: string; key: string } | null>(null);

  useEffect(() => {
    secureStorage.getClientProfile().then(profile => {
      setName(v => v || profile.name);
      setPhone(v => v || profile.phone);
      setEmail(v => v || profile.email);
    });
  }, []);

  useEffect(() => {
    if (services.includes(params.service as Service)) setService(params.service as Service);
    if (typeof params.estimate === 'string' && params.estimate) setNotes(v => v || params.estimate || '');
  }, [params.service, params.estimate]);

  const required = useMemo(
    () => service === 'cleaning' ? [name, phone, email, pickup] : [name, phone, email, pickup, destination],
    [service, name, phone, email, pickup, destination],
  );
  const completion = Math.round((required.filter(Boolean).length / required.length) * 100);

  const pickPhotos = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: .8, allowsMultipleSelection: true, selectionLimit: 5 });
    if (!result.canceled) setPhotos(result.assets.slice(0, 5).map(asset => ({ uri: asset.uri, fileName: asset.fileName, mimeType: asset.mimeType })));
  };

  const submit = async () => {
    if (!name || !phone || !email || !pickup) return setMessage(tr('required'));
    if (service !== 'cleaning' && !destination) return setMessage(tr('destinationRequired'));
    setBusy(true); setMessage('');
    try {
      const form = new FormData();
      form.append('service', service);
      form.append('name', name.trim());
      form.append('phone', phone.trim());
      form.append('email', email.trim());
      form.append('pickup', pickup.trim());
      form.append('destination', (destination || pickup).trim());
      form.append('date', dateString(dateValue));
      form.append('time', timeString(timeValue));
      form.append('notes', notes.trim());
      form.append('client_locale', locale);
      form.append('client_timezone', Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Helsinki');
      form.append('page_url', 'muuttobotti://booking');
      photos.forEach((photo, index) => form.append('photos', { uri: photo.uri, name: photo.fileName || `photo-${index + 1}.jpg`, type: photo.mimeType || 'image/jpeg' } as any));

      const result = await createBooking(form);
      await secureStorage.setClientProfile({ name: name.trim(), phone: phone.trim(), email: email.trim() });
      if ('fallback' in result) {
        setMessage(t.fallback);
        await Linking.openURL(result.whatsappUrl);
        return;
      }
      const { bookingId, accessKey } = result;
      await secureStorage.setClientCredentials(bookingId, accessKey);
      setSuccess({ id: bookingId, key: accessKey });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : tr('required'));
    } finally {
      setBusy(false);
    }
  };

  if (success) return <ScrollView contentContainerStyle={s.wrap}><View style={s.success}>
    <Text style={s.successKicker}>{t.done}</Text><Text style={s.successTitle}>{success.id}</Text><Text style={s.successText}>{t.doneText}</Text>
    <View style={s.keyBox}><Text style={s.keyLabel}>{tr('accessCode')}</Text><Text selectable style={s.key}>{success.key}</Text></View>
    <TouchableOpacity style={s.primary} onPress={() => router.replace({ pathname: '/(client)/track', params: { id: success.id, key: success.key } })}><Text style={s.primaryText}>{tr('openTracking')} →</Text></TouchableOpacity>
    <TouchableOpacity style={s.secondary} onPress={() => { setSuccess(null); setPickup(''); setDestination(''); setNotes(''); setPhotos([]); }}><Text style={s.secondaryText}>{t.again}</Text></TouchableOpacity>
  </View></ScrollView>;

  const serviceLabels = { moving: tr('moving'), cleaning: tr('cleaning'), transport: tr('transport') };
  return <ScrollView contentContainerStyle={s.wrap} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
    <View style={s.header}><Text style={s.kicker}>MUUTTOBOTTI · V1</Text><Text style={s.headerTitle}>{t.title}</Text><Text style={s.headerText}>{t.sub}</Text><Text style={s.progressText}>{t.ready} {completion}%</Text><View style={s.track}><View style={[s.fill, { width: `${completion}%` }]} /></View></View>
    {typeof params.estimate === 'string' && params.estimate ? <View style={s.estimate}><Text style={s.estimateLabel}>{t.estimate}</Text><Text style={s.estimateText}>{params.estimate}</Text></View> : null}

    <View style={s.section}><Text style={s.sectionTitle}>01 · {t.service}</Text><View style={s.serviceRow}>{services.map(item => <TouchableOpacity key={item} onPress={() => setService(item)} style={[s.service, service === item && s.serviceActive]}><Text style={[s.serviceText, service === item && s.serviceTextActive]}>{serviceLabels[item]}</Text></TouchableOpacity>)}</View></View>

    <View style={s.section}><Text style={s.sectionTitle}>02 · {t.contact}</Text><Field label={`${tr('name')} *`} value={name} onChangeText={setName} /><Field label={`${tr('phone')} *`} value={phone} onChangeText={setPhone} keyboardType="phone-pad" /><Field label={`${tr('email')} *`} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" /><Field label={`${service === 'cleaning' ? tr('serviceAddress') : tr('pickup')} *`} value={pickup} onChangeText={setPickup} />{service !== 'cleaning' && <Field label={`${tr('destination')} *`} value={destination} onChangeText={setDestination} />}</View>

    <View style={s.section}><Text style={s.sectionTitle}>03 · {t.details}</Text><View style={s.two}>
      <TouchableOpacity style={[s.field, { flex: 1 }]} onPress={() => { setShowDate(!showDate); setShowTime(false); }}><Text style={s.label}>{tr('date')} *</Text><Text style={s.pickerValue}>{dateString(dateValue)}</Text></TouchableOpacity>
      <TouchableOpacity style={[s.field, { flex: 1 }]} onPress={() => { setShowTime(!showTime); setShowDate(false); }}><Text style={s.label}>{tr('time')} *</Text><Text style={s.pickerValue}>{timeString(timeValue)}</Text></TouchableOpacity>
    </View>
    {showDate && <View style={s.pickerShell}><DateTimePicker value={dateValue} mode="date" presentation={Platform.OS === 'android' ? 'dialog' : 'inline'} onValueChange={(_, selected) => { if (selected) setDateValue(selected); if (Platform.OS === 'android') setShowDate(false); }} /></View>}
    {showTime && <View style={s.pickerShell}><DateTimePicker value={timeValue} mode="time" presentation={Platform.OS === 'android' ? 'dialog' : 'inline'} onValueChange={(_, selected) => { if (selected) setTimeValue(selected); if (Platform.OS === 'android') setShowTime(false); }} /></View>}
    <View style={s.field}><Text style={s.label}>{tr('notes')}</Text><TextInput multiline value={notes} onChangeText={setNotes} placeholderTextColor="#8A9895" style={[s.input, s.textarea]} /></View>
    <TouchableOpacity style={s.photoButton} onPress={pickPhotos}><Text style={s.photoTitle}>{tr('addPhotos')}</Text><Text style={s.photoText}>{photos.length ? `${photos.length} ${tr('photosSelected')}` : `${t.optional} · ${tr('photoLimit')}`}</Text></TouchableOpacity></View>

    {!!message && <Text style={s.message}>{message}</Text>}
    <TouchableOpacity style={[s.primary, busy && { opacity: .6 }]} disabled={busy} onPress={submit}>{busy ? <ActivityIndicator color={colors.ink} /> : <Text style={s.primaryText}>{t.send} →</Text>}</TouchableOpacity>
    <Text style={s.secure}>{t.secure}</Text>
  </ScrollView>;
}

function Field(props: any) { return <View style={s.field}><Text style={s.label}>{props.label}</Text><TextInput {...props} style={s.input} placeholderTextColor="#8A9895" /></View>; }

const s = StyleSheet.create({
  wrap:{padding:16,paddingBottom:44,gap:12},header:{backgroundColor:colors.ink,borderRadius:24,padding:20},kicker:{color:colors.lime,fontSize:10,fontWeight:'900',letterSpacing:1.1},headerTitle:{color:'#fff',fontSize:29,fontWeight:'900',marginTop:7},headerText:{color:'#AFC0BC',fontSize:13,lineHeight:20,marginTop:7},progressText:{color:'#D6E2DF',fontSize:11,fontWeight:'800',marginTop:15,marginBottom:7},track:{height:8,borderRadius:999,backgroundColor:'#173740',overflow:'hidden'},fill:{height:'100%',borderRadius:999,backgroundColor:colors.lime},
  estimate:{backgroundColor:'#F4FFE2',borderRadius:18,padding:15,borderWidth:1,borderColor:'#D8F2A8'},estimateLabel:{color:'#486100',fontSize:10,fontWeight:'900',letterSpacing:.8,textTransform:'uppercase'},estimateText:{color:colors.ink,fontSize:12,lineHeight:18,fontWeight:'700',marginTop:5},section:{backgroundColor:'#fff',borderRadius:20,padding:16,borderWidth:1,borderColor:colors.line,gap:10,...shadow},sectionTitle:{color:colors.ink,fontSize:17,fontWeight:'900'},
  serviceRow:{flexDirection:'row',backgroundColor:'#E8ECE6',borderRadius:radius.md,padding:5,gap:5},service:{flex:1,minHeight:46,borderRadius:13,justifyContent:'center',alignItems:'center'},serviceActive:{backgroundColor:colors.ink},serviceText:{color:'#60706D',fontWeight:'800',fontSize:12},serviceTextActive:{color:'#fff'},field:{backgroundColor:'#F7F8F5',borderRadius:14,padding:13,borderWidth:1,borderColor:'#E3E8E1'},label:{color:'#60706D',fontSize:10,fontWeight:'900',letterSpacing:.7,textTransform:'uppercase',marginBottom:7},input:{minHeight:38,color:colors.ink,fontSize:16,fontWeight:'600',padding:0},textarea:{minHeight:96,textAlignVertical:'top'},two:{flexDirection:'row',gap:9},pickerValue:{color:colors.ink,fontSize:16,fontWeight:'800',minHeight:38,textAlignVertical:'center'},pickerShell:{backgroundColor:'#fff',borderRadius:radius.lg,padding:8,borderWidth:1,borderColor:colors.line,overflow:'hidden'},
  photoButton:{borderRadius:16,padding:16,borderWidth:1,borderStyle:'dashed',borderColor:'#A8B8B1',backgroundColor:'#F0F3EE'},photoTitle:{color:colors.ink,fontSize:15,fontWeight:'900'},photoText:{color:colors.muted,fontSize:12,marginTop:4},message:{color:colors.danger,fontSize:13,lineHeight:19},primary:{minHeight:58,borderRadius:16,backgroundColor:colors.lime,justifyContent:'center',alignItems:'center',...shadow},primaryText:{color:colors.ink,fontSize:16,fontWeight:'900'},secure:{color:'#7E908C',textAlign:'center',fontSize:11,lineHeight:16},
  success:{backgroundColor:colors.ink,borderRadius:24,padding:22,gap:13},successKicker:{color:colors.lime,fontSize:11,fontWeight:'900',letterSpacing:1.1},successTitle:{color:'#fff',fontSize:34,fontWeight:'900'},successText:{color:'#B6C5C2',fontSize:14,lineHeight:21},keyBox:{backgroundColor:'#102F37',padding:15,borderRadius:14},keyLabel:{color:'#89A09D',fontSize:10,fontWeight:'900'},key:{color:'#fff',fontSize:13,fontWeight:'800',marginTop:7},secondary:{minHeight:52,borderRadius:15,borderWidth:1,borderColor:'#35515A',alignItems:'center',justifyContent:'center'},secondaryText:{color:'#fff',fontSize:14,fontWeight:'800'},
});
