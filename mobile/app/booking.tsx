import { useEffect, useMemo, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@expo/ui/community/datetime-picker';
import { Linking, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { createBooking } from '../src/api';
import { useLanguage } from '../src/i18n';
import { MotionPressable, Reveal } from '../src/motion';
import { secureStorage } from '../src/storage';
import { colors, radius, shadow } from '../src/theme';

type Service = 'moving' | 'cleaning' | 'transport';
type PickedPhoto = { uri: string; fileName?: string | null; mimeType?: string | null };
const services: Service[] = ['moving','cleaning','transport'];
const pad = (value:number) => String(value).padStart(2,'0');
const dateString = (date:Date) => `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`;
const timeString = (date:Date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`;

const local = {
  fi:{title:'Varaa muutamassa vaiheessa',savedProfile:'Yhteystietosi täytetään automaattisesti tällä laitteella.',estimate:'Laskurista tuotu arvio',progress:'Varauksen valmius',step1:'Palvelu',step2:'Yhteystiedot ja osoitteet',step3:'Aika ja lisätiedot',optional:'Vapaaehtoinen mutta hyödyllinen',send:'Lähetä varaus',secure:'Tietosi lähetetään suoraan Muuttobotti-järjestelmään.',done:'Varaus vastaanotettu',doneText:'Pidä pääsykoodi tallessa. Se tarvitaan tilauksen seurantaan.',another:'Tee uusi varaus'},
  en:{title:'Book in a few steps',savedProfile:'Your contact details are filled automatically on this device.',estimate:'Estimate from calculator',progress:'Booking readiness',step1:'Service',step2:'Contact details and addresses',step3:'Time and details',optional:'Optional but useful',send:'Send booking',secure:'Your details are sent directly to the Muuttobotti system.',done:'Booking received',doneText:'Keep the access code safe. You need it for tracking.',another:'Create another booking'},
  uk:{title:'Бронювання за кілька кроків',savedProfile:'Контактні дані автоматично підставляються на цьому пристрої.',estimate:'Оцінка з калькулятора',progress:'Готовність бронювання',step1:'Послуга',step2:'Контакти та адреси',step3:'Час і деталі',optional:'Необов’язково, але корисно',send:'Надіслати бронювання',secure:'Дані надсилаються безпосередньо в систему Muuttobotti.',done:'Бронювання отримано',doneText:'Збережіть код доступу для відстеження замовлення.',another:'Створити нове бронювання'},
  ru:{title:'Бронирование за несколько шагов',savedProfile:'Контактные данные автоматически подставляются на этом устройстве.',estimate:'Расчёт из калькулятора',progress:'Готовность бронирования',step1:'Услуга',step2:'Контакты и адреса',step3:'Время и детали',optional:'Необязательно, но полезно',send:'Отправить заявку',secure:'Данные отправляются напрямую в систему Muuttobotti.',done:'Заявка получена',doneText:'Сохрани код доступа — он нужен для отслеживания заказа.',another:'Создать новую заявку'},
};

export default function BookingScreen() {
  const { locale, tr } = useLanguage();
  const t = local[locale];
  const params = useLocalSearchParams<{ service?: string; estimate?: string }>();
  const initialService: Service = services.includes(params.service as Service) ? params.service as Service : 'moving';
  const [service,setService] = useState<Service>(initialService);
  const [name,setName] = useState(''); const [phone,setPhone] = useState(''); const [email,setEmail] = useState('');
  const [pickup,setPickup] = useState(''); const [destination,setDestination] = useState(''); const [notes,setNotes] = useState(typeof params.estimate==='string'?params.estimate:'');
  const [dateValue,setDateValue] = useState(()=>{const d=new Date();d.setDate(d.getDate()+1);d.setHours(10,0,0,0);return d;});
  const [timeValue,setTimeValue] = useState(()=>{const d=new Date();d.setHours(10,0,0,0);return d;});
  const [showDate,setShowDate] = useState(false); const [showTime,setShowTime] = useState(false);
  const [photos,setPhotos] = useState<PickedPhoto[]>([]); const [busy,setBusy] = useState(false); const [message,setMessage] = useState('');
  const [success,setSuccess] = useState<{id:string;key:string}|null>(null);

  useEffect(()=>{ secureStorage.getClientProfile().then(profile=>{ if(!name)setName(profile.name); if(!phone)setPhone(profile.phone); if(!email)setEmail(profile.email); }); },[]);
  useEffect(()=>{ if(services.includes(params.service as Service)) setService(params.service as Service); if(typeof params.estimate==='string'&&params.estimate&&!notes)setNotes(params.estimate); },[params.service,params.estimate]);

  const required = useMemo(()=>service==='cleaning'?[name,phone,email,pickup]:[name,phone,email,pickup,destination],[service,name,phone,email,pickup,destination]);
  const completion = Math.round((required.filter(Boolean).length/required.length)*100);

  const pickPhotos = async()=>{ const result=await ImagePicker.launchImageLibraryAsync({mediaTypes:['images'],quality:.8,allowsMultipleSelection:true,selectionLimit:5}); if(!result.canceled)setPhotos(result.assets.slice(0,5).map(asset=>({uri:asset.uri,fileName:asset.fileName,mimeType:asset.mimeType}))); };

  const submit = async()=>{
    if(!name||!phone||!email||!pickup)return setMessage(tr('required'));
    if((service==='moving'||service==='transport')&&!destination)return setMessage(tr('destinationRequired'));
    setBusy(true);setMessage('');
    try{
      const form=new FormData();
      form.append('service',service);form.append('name',name);form.append('phone',phone);form.append('email',email);form.append('pickup',pickup);form.append('destination',destination||pickup);form.append('date',dateString(dateValue));form.append('time',timeString(timeValue));form.append('notes',notes);form.append('client_locale',locale);form.append('client_timezone',Intl.DateTimeFormat().resolvedOptions().timeZone||'Europe/Helsinki');form.append('page_url','muuttobotti://booking');
      photos.forEach((photo,index)=>form.append('photos',{uri:photo.uri,name:photo.fileName||`photo-${index+1}.jpg`,type:photo.mimeType||'image/jpeg'} as any));
      const result=await createBooking(form);
      if('fallback'in result&&result.fallback==='whatsapp'){setMessage('WhatsApp fallback');await Linking.openURL(result.whatsappUrl);return;}
      await Promise.all([secureStorage.setClientCredentials(result.bookingId,result.accessKey),secureStorage.setClientProfile({name,phone,email})]);
      setSuccess({id:result.bookingId,key:result.accessKey});
    }catch(error){setMessage(error instanceof Error?error.message:tr('required'));}finally{setBusy(false);}
  };

  if(success)return <ScrollView contentContainerStyle={styles.wrap}><Reveal><View style={styles.success}><Text style={styles.successKicker}>{t.done}</Text><Text style={styles.successTitle}>{success.id}</Text><Text style={styles.successText}>{t.doneText}</Text><View style={styles.keyBox}><Text style={styles.keyLabel}>{tr('accessCode')}</Text><Text selectable style={styles.key}>{success.key}</Text></View><MotionPressable style={styles.primary} onPress={()=>router.push({pathname:'/(client)/track',params:{id:success.id,key:success.key}})}><View style={styles.primaryInner}><Text style={styles.primaryText}>{tr('openTracking')}</Text><Text style={styles.primaryText}>→</Text></View></MotionPressable><MotionPressable style={styles.secondary} onPress={()=>{setSuccess(null);setPickup('');setDestination('');setNotes('');setPhotos([])}}><View style={styles.center}><Text style={styles.secondaryText}>{t.another}</Text></View></MotionPressable></View></Reveal></ScrollView>;

  const labels={moving:tr('moving'),cleaning:tr('cleaning'),transport:tr('transport')};
  return <ScrollView contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
    <Reveal><View style={styles.head}><Text style={styles.headKicker}>MUUTTOBOTTI · BOOKING</Text><Text style={styles.headTitle}>{t.title}</Text><Text style={styles.headText}>{t.savedProfile}</Text><View style={styles.progressTop}><View><Text style={styles.progressLabel}>{t.progress}</Text><Text style={styles.progressValue}>{completion}%</Text></View><View style={styles.progressTrack}><View style={[styles.progressFill,{width:`${completion}%`}]} /></View></View></View></Reveal>

    {typeof params.estimate==='string'&&params.estimate&&<Reveal delay={60}><View style={styles.estimate}><Text style={styles.estimateLabel}>{t.estimate}</Text><Text style={styles.estimateText}>{params.estimate}</Text></View></Reveal>}

    <Reveal delay={90}><View style={styles.group}><Text style={styles.groupNumber}>01</Text><Text style={styles.groupTitle}>{t.step1}</Text><View style={styles.serviceRow}>{services.map(item=><TouchableOpacity key={item} onPress={()=>setService(item)} style={[styles.service,service===item&&styles.serviceActive]}><Text style={[styles.serviceText,service===item&&styles.serviceTextActive]}>{labels[item]}</Text></TouchableOpacity>)}</View></View></Reveal>

    <Reveal delay={130}><View style={styles.group}><Text style={styles.groupNumber}>02</Text><Text style={styles.groupTitle}>{t.step2}</Text><Field label={`${tr('name')} *`} value={name} onChangeText={setName}/><Field label={`${tr('phone')} *`} value={phone} onChangeText={setPhone} keyboardType="phone-pad"/><Field label={`${tr('email')} *`} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none"/><Field label={`${service==='cleaning'?tr('serviceAddress'):tr('pickup')} *`} value={pickup} onChangeText={setPickup}/>{service!=='cleaning'&&<Field label={`${tr('destination')} *`} value={destination} onChangeText={setDestination}/>}</View></Reveal>

    <Reveal delay={170}><View style={styles.group}><Text style={styles.groupNumber}>03</Text><Text style={styles.groupTitle}>{t.step3}</Text><View style={styles.two}><TouchableOpacity style={[styles.field,{flex:1}]} onPress={()=>{setShowDate(!showDate);setShowTime(false)}}><Text style={styles.label}>{tr('date')} *</Text><Text style={styles.pickerValue}>{dateString(dateValue)}</Text></TouchableOpacity><TouchableOpacity style={[styles.field,{flex:1}]} onPress={()=>{setShowTime(!showTime);setShowDate(false)}}><Text style={styles.label}>{tr('time')} *</Text><Text style={styles.pickerValue}>{timeString(timeValue)}</Text></TouchableOpacity></View>{showDate&&<View style={styles.pickerShell}><DateTimePicker value={dateValue} mode="date" presentation={Platform.OS==='android'?'dialog':'inline'} onValueChange={(_,selected)=>{if(selected)setDateValue(selected);if(Platform.OS==='android')setShowDate(false)}}/></View>}{showTime&&<View style={styles.pickerShell}><DateTimePicker value={timeValue} mode="time" presentation={Platform.OS==='android'?'dialog':'inline'} onValueChange={(_,selected)=>{if(selected)setTimeValue(selected);if(Platform.OS==='android')setShowTime(false)}}/></View>}<View style={styles.field}><Text style={styles.label}>{tr('notes')}</Text><TextInput multiline value={notes} onChangeText={setNotes} placeholderTextColor="#8A9895" style={[styles.input,styles.textarea]}/></View><TouchableOpacity style={styles.photoButton} onPress={pickPhotos}><Text style={styles.photoTitle}>{tr('addPhotos')}</Text><Text style={styles.photoText}>{photos.length?`${photos.length} ${tr('photosSelected')}`:`${t.optional} · ${tr('photoLimit')}`}</Text></TouchableOpacity></View></Reveal>

    {!!message&&<Text style={styles.message}>{message}</Text>}
    <Reveal delay={220}><MotionPressable style={[styles.primary,busy&&{opacity:.55}]} disabled={busy} onPress={submit}><View style={styles.primaryInner}><Text style={styles.primaryText}>{busy?'…':t.send}</Text><Text style={styles.primaryText}>→</Text></View></MotionPressable><Text style={styles.secureText}>{t.secure}</Text></Reveal>
  </ScrollView>;
}

function Field(props:any){return <View style={styles.field}><Text style={styles.label}>{props.label}</Text><TextInput {...props} style={styles.input} placeholderTextColor="#8A9895"/></View>}

const styles=StyleSheet.create({
  wrap:{padding:16,paddingBottom:42,gap:12},head:{backgroundColor:colors.ink,borderRadius:24,padding:20},headKicker:{color:colors.lime,fontSize:10,fontWeight:'900',letterSpacing:1.1},headTitle:{color:'#fff',fontSize:28,lineHeight:32,fontWeight:'900',marginTop:7},headText:{color:'#AFC0BC',fontSize:13,lineHeight:19,marginTop:7},progressTop:{marginTop:17,flexDirection:'row',alignItems:'flex-end',gap:12},progressLabel:{color:'#819A95',fontSize:10,fontWeight:'900',textTransform:'uppercase'},progressValue:{color:'#fff',fontSize:20,fontWeight:'900',marginTop:2},progressTrack:{flex:1,height:8,borderRadius:999,backgroundColor:'#173740',overflow:'hidden',marginBottom:4},progressFill:{height:'100%',backgroundColor:colors.lime,borderRadius:999},
  estimate:{backgroundColor:'#F4FFE2',borderRadius:18,padding:15,borderWidth:1,borderColor:'#D8F2A8'},estimateLabel:{color:'#486100',fontSize:10,fontWeight:'900',letterSpacing:.8,textTransform:'uppercase'},estimateText:{color:colors.ink,fontSize:13,lineHeight:19,fontWeight:'700',marginTop:5},
  group:{backgroundColor:'#fff',borderRadius:20,padding:16,borderWidth:1,borderColor:colors.line,gap:10,...shadow},groupNumber:{color:'#95A49F',fontSize:10,fontWeight:'900',letterSpacing:1},groupTitle:{color:colors.ink,fontSize:19,fontWeight:'900',marginBottom:2},serviceRow:{flexDirection:'row',backgroundColor:'#E8ECE6',borderRadius:radius.md,padding:5,gap:5},service:{flex:1,minHeight:46,borderRadius:13,justifyContent:'center',alignItems:'center'},serviceActive:{backgroundColor:colors.ink},serviceText:{color:'#60706D',fontWeight:'800',fontSize:13},serviceTextActive:{color:'#fff'},
  field:{backgroundColor:'#F7F8F5',borderRadius:14,padding:13,borderWidth:1,borderColor:'#E3E8E1'},label:{color:'#60706D',fontSize:10,fontWeight:'900',letterSpacing:.7,textTransform:'uppercase',marginBottom:7},input:{minHeight:38,color:colors.ink,fontSize:16,fontWeight:'600',padding:0},textarea:{minHeight:96,textAlignVertical:'top'},two:{flexDirection:'row',gap:9},pickerValue:{color:colors.ink,fontSize:16,fontWeight:'800',minHeight:38,textAlignVertical:'center'},pickerShell:{backgroundColor:'#fff',borderRadius:radius.lg,padding:8,borderWidth:1,borderColor:colors.line,overflow:'hidden'},photoButton:{borderRadius:16,padding:16,borderWidth:1,borderStyle:'dashed',borderColor:'#A8B8B1',backgroundColor:'#F0F3EE'},photoTitle:{color:colors.ink,fontSize:15,fontWeight:'900'},photoText:{color:colors.muted,fontSize:12,lineHeight:18,marginTop:4},message:{color:colors.danger,fontSize:14,lineHeight:20},
  primary:{minHeight:62,borderRadius:17,backgroundColor:colors.lime,...shadow},primaryInner:{flex:1,paddingHorizontal:18,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},primaryText:{color:colors.ink,fontSize:16,fontWeight:'900'},secureText:{color:colors.muted,fontSize:11,lineHeight:17,textAlign:'center',marginTop:8},secondary:{minHeight:52,borderRadius:15,backgroundColor:'#173740'},center:{flex:1,alignItems:'center',justifyContent:'center'},secondaryText:{color:'#fff',fontSize:14,fontWeight:'800'},
  success:{backgroundColor:colors.ink,borderRadius:26,padding:24,gap:14},successKicker:{color:colors.lime,fontSize:11,fontWeight:'900',letterSpacing:1.2},successTitle:{color:'#fff',fontSize:35,fontWeight:'900'},successText:{color:'#B6C5C2',fontSize:15,lineHeight:23},keyBox:{backgroundColor:'#102F37',padding:16,borderRadius:radius.md},keyLabel:{color:'#89A09D',fontSize:10,fontWeight:'900'},key:{color:'#fff',fontSize:14,fontWeight:'800',marginTop:7},
});
