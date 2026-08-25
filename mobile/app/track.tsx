import { useEffect, useState } from 'react';
import DateTimePicker from '@expo/ui/community/datetime-picker';
import { useLocalSearchParams } from 'expo-router';
import { Alert, Linking, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Booking, getBooking, updateClientBooking } from '../src/api';
import { useLanguage } from '../src/i18n';
import { secureStorage } from '../src/storage';
import { colors, radius, shadow } from '../src/theme';

const pad=(v:number)=>String(v).padStart(2,'0');
const dateString=(d:Date)=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const timeString=(d:Date)=>`${pad(d.getHours())}:${pad(d.getMinutes())}`;
function fromDateTime(date:string,time:string){ const d=new Date(`${date || '2026-01-01'}T${time || '10:00'}:00`); return Number.isNaN(d.getTime())?new Date():d; }

const copy = {
  fi:{status:{new:'Vastaanotettu',confirmed:'Vahvistettu',assigned:'Tiimi määritetty',in_progress:'Käynnissä',completed:'Valmis',cancelled:'Peruttu',change_requested:'Muutos pyydetty'},refresh:'Päivitä tila',contact:'Ota yhteyttä',details:'Tilauksen tiedot',edit:'Muuta varausta',hide:'Sulje muokkaus',cancelConfirm:'Perutaanko varaus?',cancelText:'Tätä toimintoa ei voi perua sovelluksesta.',yes:'Peru varaus',no:'Takaisin',updated:'Muutos lähetetty.'},
  en:{status:{new:'Received',confirmed:'Confirmed',assigned:'Team assigned',in_progress:'In progress',completed:'Completed',cancelled:'Cancelled',change_requested:'Change requested'},refresh:'Refresh status',contact:'Contact us',details:'Booking details',edit:'Modify booking',hide:'Close editing',cancelConfirm:'Cancel booking?',cancelText:'This action cannot be undone in the app.',yes:'Cancel booking',no:'Back',updated:'Change sent.'},
  uk:{status:{new:'Отримано',confirmed:'Підтверджено',assigned:'Команду призначено',in_progress:'У роботі',completed:'Завершено',cancelled:'Скасовано',change_requested:'Запит на зміну'},refresh:'Оновити статус',contact:'Зв’язатися',details:'Дані замовлення',edit:'Змінити замовлення',hide:'Закрити редагування',cancelConfirm:'Скасувати замовлення?',cancelText:'Цю дію не можна скасувати в застосунку.',yes:'Скасувати',no:'Назад',updated:'Зміну надіслано.'},
  ru:{status:{new:'Получено',confirmed:'Подтверждено',assigned:'Команда назначена',in_progress:'В работе',completed:'Завершено',cancelled:'Отменено',change_requested:'Запрошено изменение'},refresh:'Обновить статус',contact:'Связаться',details:'Данные заказа',edit:'Изменить заказ',hide:'Закрыть редактирование',cancelConfirm:'Отменить заказ?',cancelText:'Это действие нельзя отменить в приложении.',yes:'Отменить заказ',no:'Назад',updated:'Изменение отправлено.'},
} as const;

const stages = ['new','confirmed','in_progress','completed'];

export default function TrackScreen() {
  const params = useLocalSearchParams<{id?:string;key?:string}>();
  const { tr, locale } = useLanguage(); const t=copy[locale];
  const [id,setId]=useState(''); const [key,setKey]=useState(''); const [booking,setBooking]=useState<Booking|null>(null);
  const [pickup,setPickup]=useState(''); const [destination,setDestination]=useState(''); const [date,setDate]=useState(''); const [time,setTime]=useState(''); const [notes,setNotes]=useState('');
  const [editing,setEditing]=useState(false); const [showDate,setShowDate]=useState(false); const [showTime,setShowTime]=useState(false); const [busy,setBusy]=useState(false); const [message,setMessage]=useState('');

  useEffect(() => { (async()=>{ const saved=await secureStorage.getClientCredentials(); const nextId=String(params.id||saved.id||'').trim().toUpperCase(); const nextKey=String(params.key||saved.key||'').trim().toLowerCase(); setId(nextId); setKey(nextKey); if(nextId&&nextKey) void loadWith(nextId,nextKey); })(); },[params.id,params.key]);

  const apply=(value:Booking)=>{ setBooking(value); setPickup(value.pickup||''); setDestination(value.destination||''); setDate(value.preferred_date||''); setTime(value.preferred_time||''); setNotes(value.notes||''); };
  const loadWith=async(nextId=id,nextKey=key)=>{ if(!nextId||!nextKey){setMessage(tr('enterTracking'));return;} setBusy(true);setMessage('');try{const cleanId=nextId.trim().toUpperCase(),cleanKey=nextKey.trim().toLowerCase();const result=await getBooking(cleanId,cleanKey);apply(result.booking);await secureStorage.setClientCredentials(cleanId,cleanKey);setId(cleanId);setKey(cleanKey);}catch(error){setMessage(error instanceof Error?error.message:tr('enterTracking'));}finally{setBusy(false);} };
  const modify=async()=>{if(!booking)return;setBusy(true);setMessage('');try{const result=await updateClientBooking(id,key,{action:'modify',pickup,destination,date,time,notes});apply(result.booking);setEditing(false);setMessage(t.updated);}catch(error){setMessage(error instanceof Error?error.message:'Error');}finally{setBusy(false);} };
  const cancel=()=>Alert.alert(t.cancelConfirm,t.cancelText,[{text:t.no,style:'cancel'},{text:t.yes,style:'destructive',onPress:async()=>{if(!booking)return;setBusy(true);try{const result=await updateClientBooking(id,key,{action:'cancel'});apply(result.booking);}catch(error){setMessage(error instanceof Error?error.message:'Error');}finally{setBusy(false);}}}]);

  if(!booking) return <ScrollView contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled"><View style={styles.openCard}><Text style={styles.openKicker}>MUUTTOBOTTI TRACKING</Text><Text style={styles.openTitle}>{tr('trackBooking')}</Text><Text style={styles.intro}>{tr('enterTracking')}</Text><Field label={tr('bookingNumber')} value={id} onChangeText={setId} autoCapitalize="characters" placeholder="MB-12AB34CD"/><Field label={tr('accessKey')} value={key} onChangeText={setKey} autoCapitalize="none" secureTextEntry/><TouchableOpacity disabled={busy} onPress={()=>loadWith()} style={styles.primary}><Text style={styles.primaryText}>{busy?'…':tr('openBooking')}</Text></TouchableOpacity>{!!message&&<Text style={styles.message}>{message}</Text>}</View></ScrollView>;

  const currentIndex = booking.status==='assigned'?1:stages.indexOf(booking.status);
  const dt=fromDateTime(date,time);
  return <ScrollView contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
    <View style={styles.statusCard}><Text style={styles.kicker}>{booking.id}</Text><Text style={styles.status}>{t.status[booking.status as keyof typeof t.status]||booking.status}</Text><Text style={styles.service}>{booking.service} · {booking.preferred_date} · {booking.preferred_time}</Text><View style={styles.timeline}>{stages.map((stage,index)=><View key={stage} style={styles.stage}><View style={[styles.stageDot,index<=currentIndex&&booking.status!=='cancelled'&&styles.stageDotActive]} /><Text style={[styles.stageText,index<=currentIndex&&booking.status!=='cancelled'&&styles.stageTextActive]}>{t.status[stage as keyof typeof t.status]}</Text></View>)}</View></View>

    <View style={styles.quickRow}><TouchableOpacity style={styles.quick} onPress={()=>loadWith()} disabled={busy}><Text style={styles.quickText}>↻ {t.refresh}</Text></TouchableOpacity><TouchableOpacity style={styles.quick} onPress={()=>Linking.openURL('https://wa.me/3584578767567')}><Text style={styles.quickText}>WhatsApp</Text></TouchableOpacity></View>

    <View style={styles.summary}><Text style={styles.sectionLabel}>{t.details}</Text><Row label={tr('name')} value={booking.customer_name}/><Row label={tr('pickup')} value={booking.pickup}/><Row label={tr('destination')} value={booking.destination}/><Row label={tr('date')} value={`${booking.preferred_date} ${booking.preferred_time}`}/><Row label="Photos" value={String(booking.photo_count||0)}/></View>

    <TouchableOpacity style={styles.editToggle} onPress={()=>setEditing(!editing)}><Text style={styles.editToggleText}>{editing?t.hide:t.edit}</Text><Text style={styles.editToggleText}>{editing?'−':'＋'}</Text></TouchableOpacity>

    {editing && <View style={styles.editBox}><Field label={tr('pickup')} value={pickup} onChangeText={setPickup}/><Field label={tr('destination')} value={destination} onChangeText={setDestination}/><View style={styles.two}><TouchableOpacity style={[styles.field,{flex:1}]} onPress={()=>{setShowDate(!showDate);setShowTime(false)}}><Text style={styles.label}>{tr('date')}</Text><Text style={styles.pickerValue}>{date}</Text></TouchableOpacity><TouchableOpacity style={[styles.field,{flex:1}]} onPress={()=>{setShowTime(!showTime);setShowDate(false)}}><Text style={styles.label}>{tr('time')}</Text><Text style={styles.pickerValue}>{time}</Text></TouchableOpacity></View>{showDate&&<View style={styles.pickerShell}><DateTimePicker value={dt} mode="date" presentation={Platform.OS==='android'?'dialog':'inline'} onValueChange={(_,v)=>{if(v)setDate(dateString(v));if(Platform.OS==='android')setShowDate(false)}}/></View>}{showTime&&<View style={styles.pickerShell}><DateTimePicker value={dt} mode="time" presentation={Platform.OS==='android'?'dialog':'inline'} onValueChange={(_,v)=>{if(v)setTime(timeString(v));if(Platform.OS==='android')setShowTime(false)}}/></View>}<View style={styles.field}><Text style={styles.label}>{tr('notes')}</Text><TextInput multiline value={notes} onChangeText={setNotes} style={[styles.input,styles.textarea]}/></View><TouchableOpacity disabled={busy} onPress={modify} style={styles.primary}><Text style={styles.primaryText}>{tr('sendChange')}</Text></TouchableOpacity><TouchableOpacity disabled={busy||booking.status==='cancelled'||booking.status==='completed'} onPress={cancel} style={styles.danger}><Text style={styles.dangerText}>{tr('cancelBooking')}</Text></TouchableOpacity></View>}
    {!!message&&<Text style={styles.message}>{message}</Text>}
  </ScrollView>;
}

function Field(props:any){return <View style={styles.field}><Text style={styles.label}>{props.label}</Text><TextInput {...props} placeholderTextColor="#8A9895" style={styles.input}/></View>}
function Row({label,value}:{label:string;value?:string}){return <View style={styles.row}><Text style={styles.rowLabel}>{label}</Text><Text style={styles.rowValue}>{value||'—'}</Text></View>}

const styles=StyleSheet.create({
  wrap:{padding:16,paddingBottom:44,gap:12},openCard:{backgroundColor:'#fff',borderRadius:24,padding:18,borderWidth:1,borderColor:colors.line,gap:12,...shadow},openKicker:{color:'#6B7E79',fontSize:10,fontWeight:'900',letterSpacing:1},openTitle:{color:colors.ink,fontSize:27,fontWeight:'900'},intro:{color:'#5F706D',fontSize:14,lineHeight:21},
  field:{backgroundColor:'#fff',borderRadius:radius.md,padding:14,borderWidth:1,borderColor:colors.line},label:{color:'#60706D',fontSize:10,fontWeight:'900',textTransform:'uppercase',letterSpacing:.7,marginBottom:7},input:{minHeight:38,color:colors.ink,fontSize:16,fontWeight:'600',padding:0},textarea:{minHeight:100,textAlignVertical:'top'},two:{flexDirection:'row',gap:10},pickerValue:{color:colors.ink,fontSize:16,fontWeight:'800',minHeight:38,textAlignVertical:'center'},pickerShell:{backgroundColor:'#fff',borderRadius:radius.lg,padding:8,borderWidth:1,borderColor:colors.line},
  primary:{minHeight:56,borderRadius:15,backgroundColor:colors.lime,alignItems:'center',justifyContent:'center'},primaryText:{color:colors.ink,fontSize:15,fontWeight:'900'},message:{color:colors.danger,fontSize:13,lineHeight:19},statusCard:{backgroundColor:colors.ink,borderRadius:24,padding:21},kicker:{color:colors.lime,fontSize:10,fontWeight:'900',letterSpacing:1},status:{color:'#fff',fontSize:31,fontWeight:'900',marginTop:7},service:{color:'#ABC0BC',fontSize:13,marginTop:7},
  timeline:{marginTop:18,gap:10},stage:{flexDirection:'row',alignItems:'center',gap:10},stageDot:{width:10,height:10,borderRadius:5,backgroundColor:'#35525A'},stageDotActive:{backgroundColor:colors.lime},stageText:{color:'#6F8984',fontSize:12,fontWeight:'700'},stageTextActive:{color:'#E4EFEC'},quickRow:{flexDirection:'row',gap:8},quick:{flex:1,minHeight:48,borderRadius:14,backgroundColor:'#fff',borderWidth:1,borderColor:colors.line,alignItems:'center',justifyContent:'center'},quickText:{color:colors.ink,fontSize:12,fontWeight:'800'},
  summary:{backgroundColor:'#fff',borderRadius:20,borderWidth:1,borderColor:colors.line,padding:16},sectionLabel:{color:colors.ink,fontSize:18,fontWeight:'900',marginBottom:8},row:{paddingVertical:9,borderTopWidth:1,borderTopColor:'#EDF0EC'},rowLabel:{color:colors.muted,fontSize:9,fontWeight:'900',textTransform:'uppercase'},rowValue:{color:colors.ink,fontSize:14,lineHeight:20,fontWeight:'700',marginTop:3},
  editToggle:{minHeight:56,borderRadius:16,backgroundColor:'#EAF0E7',paddingHorizontal:16,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},editToggleText:{color:colors.ink,fontSize:14,fontWeight:'900'},editBox:{gap:10},danger:{minHeight:50,borderRadius:14,backgroundColor:'#F7E7E7',alignItems:'center',justifyContent:'center'},dangerText:{color:colors.danger,fontWeight:'900'},
});
