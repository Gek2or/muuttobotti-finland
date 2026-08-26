import { useCallback, useEffect, useMemo, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { Linking, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import {
  adminOperation,
  AdminAvailabilityBlock,
  Booking,
  createAdminAvailabilityBlock,
  deleteAdminAvailabilityBlock,
  getAdminAvailability,
  getAdminOperations,
  upsertWorker,
  Worker,
} from '../api';
import { secureStorage } from '../storage';
import { colors, radius, shadow } from '../theme';

const statusFi: Record<string,string> = {
  new:'Uusi', confirmed:'Vahvistettu', assigned:'Tekijä määritetty', on_the_way:'Matkalla',
  in_progress:'Käynnissä', completed:'Valmis', cancelled:'Peruttu', change_requested:'Muutos pyydetty',
};
const statusFlow = ['new','confirmed','assigned','on_the_way','in_progress','completed'];
const today = () => new Date().toISOString().slice(0,10);
const tomorrow = () => { const d=new Date(); d.setDate(d.getDate()+1); return d.toISOString().slice(0,10); };

type ScheduleItem = { id:string; service:string; customer_name:string; preferred_date:string; preferred_time:string; status:string };

export default function AdminOperationsScreen() {
  const [token,setToken] = useState('');
  const [authorized,setAuthorized] = useState(false);
  const [bookings,setBookings] = useState<Booking[]>([]);
  const [workers,setWorkers] = useState<Worker[]>([]);
  const [stats,setStats] = useState<any>({});
  const [selected,setSelected] = useState<Booking|null>(null);
  const [busy,setBusy] = useState(false);
  const [message,setMessage] = useState('');
  const [lastSync,setLastSync] = useState<Date|null>(null);
  const [q,setQ] = useState('');
  const [status,setStatus] = useState('');
  const [date,setDate] = useState('');
  const [quote,setQuote] = useState('');
  const [note,setNote] = useState('');
  const [finalPrice,setFinalPrice] = useState('');
  const [actualHours,setActualHours] = useState('');
  const [newWorker,setNewWorker] = useState('');
  const [newWorkerPhone,setNewWorkerPhone] = useState('');
  const [blocks,setBlocks] = useState<AdminAvailabilityBlock[]>([]);
  const [schedule,setSchedule] = useState<ScheduleItem[]>([]);
  const [blockDate,setBlockDate] = useState(tomorrow());
  const [blockStart,setBlockStart] = useState('09:00');
  const [blockEnd,setBlockEnd] = useState('12:00');
  const [blockLabel,setBlockLabel] = useState('');
  const [allDay,setAllDay] = useState(true);

  const load = useCallback(async (
    value: string,
    filters: {q?:string;status?:string;date?:string},
    quiet = false,
  ) => {
    if (!value) return;
    if (!quiet) { setBusy(true); setMessage(''); }
    try {
      const [operations,availability] = await Promise.all([
        getAdminOperations(value.trim(), filters),
        getAdminAvailability(value.trim()),
      ]);
      setBookings(operations.bookings || []);
      setWorkers(operations.workers || []);
      setStats(operations.stats || {});
      setBlocks(availability.blocks || []);
      setSchedule((availability.bookings || []) as ScheduleItem[]);
      setAuthorized(true);
      setLastSync(new Date());
      await secureStorage.setAdminToken(value.trim());
    } catch (error) {
      const text = error instanceof Error ? error.message : 'Admin-yhteys epäonnistui';
      if (!quiet) {
        setMessage(text);
        if (/UNAUTHORIZED|401|INVALID_TOKEN/i.test(text)) {
          await secureStorage.clearAdminToken();
          setAuthorized(false); setToken(''); router.replace('/');
        }
      }
    } finally { if (!quiet) setBusy(false); }
  }, []);

  const restore = useCallback(async () => {
    const saved = await secureStorage.getAdminToken();
    if (!saved) { router.replace('/'); return; }
    setToken(saved);
    await load(saved,{q,status,date});
  }, [date,load,q,status]);

  useFocusEffect(useCallback(() => { if (!authorized) void restore(); }, [authorized,restore]));

  useEffect(() => {
    if (!authorized || selected || !token) return undefined;
    const timer = setInterval(() => void load(token,{q,status,date},true),15_000);
    return () => clearInterval(timer);
  }, [authorized,date,load,q,selected,status,token]);

  const filtered = useMemo(() => bookings, [bookings]);
  const syncText = lastSync ? lastSync.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) : '—';
  const upcoming = useMemo(() => schedule.slice(0,10), [schedule]);

  const openBooking = (booking:Booking) => {
    setSelected(booking);
    setQuote(Number(booking.quoted_price||0) ? String(booking.quoted_price) : '');
    setNote(booking.admin_note || '');
    setFinalPrice(Number(booking.final_price||0) ? String(booking.final_price) : '');
    setActualHours(Number(booking.actual_hours||0) ? String(booking.actual_hours) : '');
    setMessage('');
  };
  const closeBooking = () => { setSelected(null); setQuote(''); setNote(''); setFinalPrice(''); setActualHours(''); void load(token,{q,status,date},true); };

  const run = async (action:string, patch:Record<string,unknown>={}) => {
    if (!selected || !token) return;
    setBusy(true); setMessage('');
    try {
      const result = await adminOperation(token,selected.id,action,patch);
      setSelected(result.booking);
      setBookings(items=>items.map(item=>item.id===result.booking.id?result.booking:item));
      setLastSync(new Date()); setMessage('✓ Tallennettu');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Päivitys epäonnistui'); }
    finally { setBusy(false); }
  };

  const addWorker = async () => {
    if (!newWorker.trim() || !token) return;
    setBusy(true); setMessage('');
    try {
      const result = await upsertWorker(token,{name:newWorker.trim(),phone:newWorkerPhone.trim()});
      setWorkers(items=>[result.worker,...items.filter(item=>item.worker_id!==result.worker.worker_id)]);
      setNewWorker(''); setNewWorkerPhone(''); setMessage('✓ Tekijä lisätty');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Tekijää ei voitu lisätä'); }
    finally { setBusy(false); }
  };

  const addBlock = async () => {
    if (!token || !/^\d{4}-\d{2}-\d{2}$/.test(blockDate)) { setMessage('Tarkista päivämäärä.'); return; }
    setBusy(true); setMessage('');
    try {
      const result = await createAdminAvailabilityBlock(token,{date:blockDate,allDay,start:allDay?undefined:blockStart,end:allDay?undefined:blockEnd,label:blockLabel.trim()});
      setBlocks(items=>[...items,result.block].sort((a,b)=>`${a.block_date}${a.start_time}`.localeCompare(`${b.block_date}${b.start_time}`)));
      setBlockLabel(''); setMessage('✓ Saatavuus päivitetty'); setLastSync(new Date());
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Estoa ei voitu tallentaa'); }
    finally { setBusy(false); }
  };

  const removeBlock = async (id:string) => {
    if (!token) return;
    setBusy(true); setMessage('');
    try { await deleteAdminAvailabilityBlock(token,id); setBlocks(items=>items.filter(item=>item.id!==id)); setMessage('✓ Esto poistettu'); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Estoa ei voitu poistaa'); }
    finally { setBusy(false); }
  };

  const logout = async () => { setAuthorized(false); setToken(''); setSelected(null); try { await secureStorage.clearAdminToken(); } finally { router.replace('/'); } };

  if (!authorized) return <ScrollView contentContainerStyle={s.wrap}><View style={s.login}><Text style={s.kicker}>MUUTTOBOTTI · OPERATIONS V2.1</Text><Text style={s.loginTitle}>Connecting…</Text><Text style={s.copy}>{message || 'SecureStore → Operations API'}</Text></View></ScrollView>;

  if (selected) return <ScrollView contentContainerStyle={s.wrap} refreshControl={<RefreshControl refreshing={busy} onRefresh={()=>void load(token,{q,status,date})} tintColor={colors.ink}/>} keyboardShouldPersistTaps="handled">
    <TouchableOpacity onPress={closeBooking}><Text style={s.back}>← Varaukset</Text></TouchableOpacity>
    <View style={s.detailHero}><View style={s.liveRow}><Text style={s.kicker}>{selected.id}</Text><View style={s.live}><Text style={s.liveText}>● LIVE</Text></View></View><Text style={s.detailTitle}>{selected.customer_name}</Text><Text style={s.detailSub}>{statusFi[selected.status]||selected.status} · {selected.preferred_date} {selected.preferred_time}</Text><Text style={s.route}>{selected.pickup} → {selected.destination}</Text></View>
    <View style={s.quick}><Action text="Soita" onPress={()=>selected.phone&&void Linking.openURL(`tel:${selected.phone}`)}/><Action text="WhatsApp" onPress={()=>selected.phone&&void Linking.openURL(`https://wa.me/${selected.phone.replace(/\D/g,'')}`)}/><Action text="Email" onPress={()=>selected.email&&void Linking.openURL(`mailto:${selected.email}`)}/></View>
    <Section title="TILAUS"><Row label="Palvelu" value={selected.service}/><Row label="Puhelin" value={selected.phone}/><Row label="Email" value={selected.email}/><Row label="Lisätiedot" value={selected.notes}/><Row label="Kuvia" value={String(selected.photo_count||0)}/></Section>
    <Section title="HINTA"><View style={s.metricRow}><Metric label="Tarjous" value={Number(selected.quoted_price||0)>0?`${Number(selected.quoted_price).toFixed(2)} €`:'—'}/><Metric label="Tila" value={selected.quote_status||'none'}/><Metric label="Final" value={Number(selected.final_price||0)>0?`${Number(selected.final_price).toFixed(2)} €`:'—'}/></View><TextInput keyboardType="decimal-pad" value={quote} onChangeText={setQuote} placeholder="Uusi tarjous €" placeholderTextColor="#82918E" style={s.input}/><TextInput value={note} onChangeText={setNote} placeholder="Viesti asiakkaalle" placeholderTextColor="#82918E" style={s.input}/><TouchableOpacity disabled={busy} style={s.primary} onPress={()=>void run('quote',{amount:Number(quote.replace(',','.')),note})}><Text style={s.primaryText}>Lähetä hintatarjous</Text></TouchableOpacity></Section>
    <Section title="TEKIJÄ"><Text style={s.muted}>{selected.assigned_worker?`${selected.assigned_worker} · ${selected.assigned_worker_phone||''}`:'Ei vielä määritetty'}</Text><View style={s.chips}>{workers.filter(w=>w.active).map(worker=><TouchableOpacity key={worker.worker_id} style={[s.chip,selected.assigned_worker===worker.name&&s.chipOn]} onPress={()=>void run('assign',{worker_id:worker.worker_id})}><Text style={[s.chipText,selected.assigned_worker===worker.name&&s.chipTextOn]}>{worker.name}</Text></TouchableOpacity>)}</View></Section>
    <Section title="TYÖN TILA"><View style={s.statusGrid}>{statusFlow.map(item=><TouchableOpacity key={item} disabled={busy} style={[s.statusBtn,selected.status===item&&s.statusOn]} onPress={()=>void run('status',{status:item})}><Text style={[s.statusText,selected.status===item&&s.statusTextOn]}>{statusFi[item]}</Text></TouchableOpacity>)}<TouchableOpacity disabled={busy} style={[s.statusBtn,selected.status==='cancelled'&&s.statusDanger]} onPress={()=>void run('status',{status:'cancelled'})}><Text style={s.statusText}>Peruttu</Text></TouchableOpacity></View></Section>
    <Section title="VALMISTUMINEN"><View style={s.two}><TextInput keyboardType="decimal-pad" value={finalPrice} onChangeText={setFinalPrice} placeholder="Lopullinen €" placeholderTextColor="#82918E" style={[s.input,{flex:1}]}/><TextInput keyboardType="decimal-pad" value={actualHours} onChangeText={setActualHours} placeholder="Tunnit" placeholderTextColor="#82918E" style={[s.input,{flex:1}]}/></View><TouchableOpacity disabled={busy} style={s.complete} onPress={()=>void run('complete',{final_price:Number(finalPrice.replace(',','.')),actual_hours:Number(actualHours.replace(',','.'))})}><Text style={s.completeText}>Merkitse valmiiksi</Text></TouchableOpacity></Section>
    <Section title="ADMIN NOTE"><TextInput multiline value={note} onChangeText={setNote} placeholder="Sisäinen huomio" placeholderTextColor="#82918E" style={[s.input,s.textarea]}/><TouchableOpacity disabled={busy} style={s.secondary} onPress={()=>void run('note',{note})}><Text style={s.secondaryText}>Tallenna huomio</Text></TouchableOpacity></Section>
    {!!selected.calculator_snapshot&&<Section title="LASKURI"><Text selectable style={s.code}>{prettySnapshot(selected.calculator_snapshot)}</Text></Section>}
    {!!message&&<Text style={s.message}>{message}</Text>}
  </ScrollView>;

  return <ScrollView contentContainerStyle={s.wrap} refreshControl={<RefreshControl refreshing={busy} onRefresh={()=>void load(token,{q,status,date})} tintColor={colors.ink}/>} keyboardShouldPersistTaps="handled">
    <View style={s.top}><View><View style={s.syncRow}><View style={s.syncDot}/><Text style={s.kickerDark}>AUTO · 15 S · {syncText}</Text></View><Text style={s.pageTitle}>Operations</Text></View><TouchableOpacity onPress={()=>void logout()}><Text style={s.logout}>Kirjaudu ulos</Text></TouchableOpacity></View>
    <View style={s.stats}><Stat label="Kaikki" value={Number(stats.total||bookings.length)}/><Stat label="Uudet" value={Number(stats.new_count||0)}/><Stat label="Aktiiviset" value={Number(stats.active_count||0)}/><Stat label="Tänään" value={Number(stats.today_count||0)}/></View>
    <View style={s.filters}><TextInput value={q} onChangeText={setQ} placeholder="Hae nimi, numero, osoite…" placeholderTextColor="#82918E" style={[s.input,{flex:1}]}/><TouchableOpacity style={s.filterBtn} onPress={()=>void load(token,{q,status,date})}><Text style={s.filterText}>Hae</Text></TouchableOpacity></View>
    <View style={s.chips}><Filter label="Kaikki" on={!status&&!date} onPress={()=>{setStatus('');setDate('');void load(token,{q})}}/><Filter label="Tänään" on={date===today()} onPress={()=>{const d=today();setDate(d);setStatus('');void load(token,{q,date:d})}}/>{['new','confirmed','assigned','on_the_way','in_progress','change_requested'].map(item=><Filter key={item} label={statusFi[item]} on={status===item} onPress={()=>{setStatus(item);setDate('');void load(token,{q,status:item})}}/>)}</View>
    {!!message&&<Text style={s.error}>{message}</Text>}
    <View style={s.list}>{filtered.length===0?<View style={s.empty}><Text style={s.emptyTitle}>Ei tilauksia</Text><Text style={s.muted}>Uudet tilaukset ilmestyvät tähän automaattisesti.</Text></View>:filtered.map(booking=><TouchableOpacity key={booking.id} style={s.card} onPress={()=>openBooking(booking)}><View style={s.cardTop}><Text style={s.bookingId}>{booking.id}</Text><View style={s.badge}><Text style={s.badgeText}>{statusFi[booking.status]||booking.status}</Text></View></View><Text style={s.customer}>{booking.customer_name}</Text><Text style={s.meta}>{booking.preferred_date} {booking.preferred_time} · {booking.service}</Text><Text style={s.routeSmall}>{booking.pickup} → {booking.destination}</Text><View style={s.cardBottom}>{booking.assigned_worker?<Text style={s.worker}>◉ {booking.assigned_worker}</Text>:<Text style={s.unassigned}>○ Ei tekijää</Text>}{Number(booking.quoted_price||0)>0&&<Text style={s.price}>{Number(booking.quoted_price).toFixed(0)} € · {booking.quote_status}</Text>}</View></TouchableOpacity>)}</View>

    <Section title="KALENTERI & SAATAVUUS">
      <Text style={s.muted}>Estä päivä tai aikaväli. Muutos näkyy asiakkaan varausnäkymässä heti.</Text>
      <View style={s.two}><TextInput value={blockDate} onChangeText={setBlockDate} placeholder="YYYY-MM-DD" placeholderTextColor="#82918E" style={[s.input,{flex:1}]}/><TouchableOpacity style={[s.allDay,allDay&&s.allDayOn]} onPress={()=>setAllDay(value=>!value)}><Text style={[s.allDayText,allDay&&s.allDayTextOn]}>{allDay?'Koko päivä':'Aikaväli'}</Text></TouchableOpacity></View>
      {!allDay&&<View style={s.two}><TextInput value={blockStart} onChangeText={setBlockStart} placeholder="09:00" placeholderTextColor="#82918E" style={[s.input,{flex:1}]}/><TextInput value={blockEnd} onChangeText={setBlockEnd} placeholder="12:00" placeholderTextColor="#82918E" style={[s.input,{flex:1}]}/></View>}
      <TextInput value={blockLabel} onChangeText={setBlockLabel} placeholder="Syy / huomio (valinnainen)" placeholderTextColor="#82918E" style={s.input}/>
      <TouchableOpacity disabled={busy} style={s.primary} onPress={()=>void addBlock()}><Text style={s.primaryText}>+ Estä aika</Text></TouchableOpacity>
      <View style={s.availabilityList}>{blocks.slice(0,20).map(block=><View key={block.id} style={s.block}><View style={{flex:1}}><Text style={s.blockDate}>{block.block_date}</Text><Text style={s.blockTime}>{Number(block.all_day)===1?'KOKO PÄIVÄ':`${block.start_time}–${block.end_time}`}{block.label?` · ${block.label}`:''}</Text></View><TouchableOpacity disabled={busy} onPress={()=>void removeBlock(block.id)} style={s.remove}><Text style={s.removeText}>Poista</Text></TouchableOpacity></View>)}</View>
      <Text style={[s.sectionLabel,{marginTop:10}]}>TULEVAT TILAUKSET</Text>
      {upcoming.length===0?<Text style={s.muted}>Ei tulevia aktiivisia tilauksia.</Text>:upcoming.map(item=><View key={item.id} style={s.scheduleRow}><View><Text style={s.scheduleDate}>{item.preferred_date} · {item.preferred_time}</Text><Text style={s.scheduleName}>{item.customer_name}</Text></View><Text style={s.scheduleStatus}>{statusFi[item.status]||item.status}</Text></View>)}
    </Section>

    <Section title="TEKIJÄT"><View style={s.two}><TextInput value={newWorker} onChangeText={setNewWorker} placeholder="Nimi" placeholderTextColor="#82918E" style={[s.input,{flex:1}]}/><TextInput value={newWorkerPhone} onChangeText={setNewWorkerPhone} placeholder="Puhelin" placeholderTextColor="#82918E" style={[s.input,{flex:1}]}/></View><TouchableOpacity disabled={busy} style={s.secondary} onPress={()=>void addWorker()}><Text style={s.secondaryText}>+ Lisää tekijä</Text></TouchableOpacity><View style={s.chips}>{workers.map(w=><View key={w.worker_id} style={s.workerTag}><Text style={s.workerTagText}>{w.name}{w.phone?` · ${w.phone}`:''}</Text></View>)}</View></Section>
  </ScrollView>;
}

function Action({text,onPress}:{text:string;onPress:()=>void}){return <TouchableOpacity style={s.action} onPress={onPress}><Text style={s.actionText}>{text}</Text></TouchableOpacity>}
function Filter({label,on,onPress}:{label:string;on:boolean;onPress:()=>void}){return <TouchableOpacity style={[s.chip,on&&s.chipOn]} onPress={onPress}><Text style={[s.chipText,on&&s.chipTextOn]}>{label}</Text></TouchableOpacity>}
function Section({title,children}:{title:string;children:React.ReactNode}){return <View style={s.section}><Text style={s.sectionLabel}>{title}</Text>{children}</View>}
function Row({label,value}:{label:string;value?:string}){return <View style={s.row}><Text style={s.rowLabel}>{label}</Text><Text selectable style={s.rowValue}>{value||'—'}</Text></View>}
function Metric({label,value}:{label:string;value:string}){return <View style={s.metric}><Text style={s.metricValue}>{value}</Text><Text style={s.metricLabel}>{label}</Text></View>}
function Stat({label,value}:{label:string;value:number}){return <View style={s.stat}><Text style={s.statValue}>{value}</Text><Text style={s.statLabel}>{label}</Text></View>}
function prettySnapshot(raw:string){try{return JSON.stringify(JSON.parse(raw),null,2)}catch{return raw}}

const s=StyleSheet.create({
  wrap:{padding:16,paddingBottom:48,gap:13,backgroundColor:'#EEF3EE'},login:{backgroundColor:'#06191F',borderRadius:radius.xl,padding:23,gap:13,marginTop:25},kicker:{color:'#C8FF36',fontSize:10,fontWeight:'900',letterSpacing:1.2},loginTitle:{color:'#fff',fontSize:31,fontWeight:'900',letterSpacing:-1},copy:{color:'#A7BDB8',fontSize:14,lineHeight:21},top:{flexDirection:'row',alignItems:'flex-end',justifyContent:'space-between'},syncRow:{flexDirection:'row',alignItems:'center',gap:6},syncDot:{width:7,height:7,borderRadius:7,backgroundColor:'#8AD546'},kickerDark:{color:'#667D78',fontSize:9,fontWeight:'900',letterSpacing:1},pageTitle:{color:colors.ink,fontSize:35,fontWeight:'900',letterSpacing:-1.3},logout:{color:'#607672',fontSize:12,fontWeight:'800'},stats:{flexDirection:'row',gap:7},stat:{flex:1,backgroundColor:'#fff',borderRadius:15,padding:11,borderWidth:1,borderColor:colors.line},statValue:{color:colors.ink,fontSize:23,fontWeight:'900'},statLabel:{color:colors.muted,fontSize:9,fontWeight:'800',marginTop:2},filters:{flexDirection:'row',gap:7},filterBtn:{backgroundColor:'#0C2C34',borderRadius:14,paddingHorizontal:16,justifyContent:'center'},filterText:{color:'#fff',fontWeight:'900'},input:{minHeight:49,borderRadius:14,borderWidth:1,borderColor:colors.line,backgroundColor:'#fff',paddingHorizontal:13,color:colors.ink,fontWeight:'700'},textarea:{minHeight:100,textAlignVertical:'top',paddingTop:12},chips:{flexDirection:'row',gap:7,flexWrap:'wrap',marginTop:8},chip:{borderRadius:999,paddingHorizontal:11,paddingVertical:9,backgroundColor:'#fff',borderWidth:1,borderColor:colors.line},chipOn:{backgroundColor:'#06191F',borderColor:'#06191F'},chipText:{color:'#5F716D',fontSize:10,fontWeight:'900'},chipTextOn:{color:'#fff'},list:{gap:9},card:{backgroundColor:'#fff',borderRadius:radius.lg,padding:16,borderWidth:1,borderColor:colors.line,...shadow},cardTop:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},bookingId:{color:'#70837E',fontSize:10,fontWeight:'900',letterSpacing:.7},badge:{backgroundColor:'#EAF1E7',borderRadius:999,paddingHorizontal:9,paddingVertical:5},badgeText:{color:colors.ink,fontSize:9,fontWeight:'900'},customer:{color:colors.ink,fontSize:20,fontWeight:'900',marginTop:8},meta:{color:'#60746F',fontSize:12,fontWeight:'700',marginTop:4},routeSmall:{color:colors.ink,fontSize:13,lineHeight:19,marginTop:8},cardBottom:{flexDirection:'row',justifyContent:'space-between',marginTop:11},worker:{color:'#466A41',fontSize:11,fontWeight:'800'},unassigned:{color:'#9A7A3F',fontSize:11,fontWeight:'800'},price:{color:colors.ink,fontSize:11,fontWeight:'900'},empty:{backgroundColor:'#fff',borderRadius:radius.lg,padding:22,borderWidth:1,borderColor:colors.line},emptyTitle:{color:colors.ink,fontSize:18,fontWeight:'900'},workerTag:{backgroundColor:'#E8F1E5',borderRadius:999,paddingHorizontal:10,paddingVertical:7},workerTagText:{color:'#526B51',fontSize:10,fontWeight:'800'},back:{color:'#5E746F',fontWeight:'900'},detailHero:{backgroundColor:'#06191F',borderRadius:radius.xl,padding:21},liveRow:{flexDirection:'row',justifyContent:'space-between'},live:{backgroundColor:'#14353D',borderRadius:999,paddingHorizontal:9,paddingVertical:5},liveText:{color:'#C8FF36',fontSize:9,fontWeight:'900'},detailTitle:{color:'#fff',fontSize:30,fontWeight:'900',letterSpacing:-1,marginTop:7},detailSub:{color:'#A9BEBA',fontSize:13,marginTop:5},route:{color:'#fff',fontSize:14,lineHeight:21,marginTop:12},quick:{flexDirection:'row',gap:7},action:{flex:1,minHeight:47,borderRadius:14,backgroundColor:'#102F37',alignItems:'center',justifyContent:'center'},actionText:{color:'#fff',fontWeight:'900',fontSize:12},section:{backgroundColor:'#fff',borderRadius:radius.lg,padding:16,borderWidth:1,borderColor:colors.line,gap:8},sectionLabel:{color:'#687B77',fontSize:9,fontWeight:'900',letterSpacing:1.1,marginBottom:5},row:{paddingVertical:7,borderBottomWidth:1,borderBottomColor:'#EEF1EE'},rowLabel:{color:'#82918E',fontSize:9,fontWeight:'800',textTransform:'uppercase'},rowValue:{color:colors.ink,fontSize:13,lineHeight:19,fontWeight:'600',marginTop:3},metricRow:{flexDirection:'row',gap:7},metric:{flex:1,backgroundColor:'#EEF3EE',borderRadius:13,padding:11},metricValue:{color:colors.ink,fontSize:15,fontWeight:'900'},metricLabel:{color:colors.muted,fontSize:9,marginTop:2},muted:{color:colors.muted,fontSize:12,lineHeight:18},statusGrid:{flexDirection:'row',flexWrap:'wrap',gap:7},statusBtn:{minHeight:44,borderRadius:12,paddingHorizontal:11,borderWidth:1,borderColor:colors.line,justifyContent:'center'},statusOn:{backgroundColor:'#06191F',borderColor:'#06191F'},statusDanger:{backgroundColor:'#F8E8E8'},statusText:{color:colors.ink,fontSize:10,fontWeight:'900'},statusTextOn:{color:'#fff'},two:{flexDirection:'row',gap:8},primary:{minHeight:54,borderRadius:15,backgroundColor:'#C8FF36',alignItems:'center',justifyContent:'center',marginTop:5},primaryText:{color:colors.ink,fontWeight:'900'},secondary:{minHeight:48,borderRadius:14,borderWidth:1,borderColor:colors.line,backgroundColor:'#fff',alignItems:'center',justifyContent:'center',marginTop:5},secondaryText:{color:colors.ink,fontWeight:'900'},complete:{minHeight:51,borderRadius:14,backgroundColor:'#0D2F36',alignItems:'center',justifyContent:'center',marginTop:5},completeText:{color:'#C8FF36',fontWeight:'900'},code:{fontFamily:'monospace',fontSize:10,lineHeight:16,color:'#3E5550'},message:{color:'#416F3C',fontSize:12,fontWeight:'800'},error:{color:colors.danger,fontSize:12},allDay:{minHeight:49,borderRadius:14,borderWidth:1,borderColor:colors.line,backgroundColor:'#F3F5F2',paddingHorizontal:14,alignItems:'center',justifyContent:'center'},allDayOn:{backgroundColor:'#06191F',borderColor:'#06191F'},allDayText:{color:'#667873',fontSize:11,fontWeight:'900'},allDayTextOn:{color:'#C8FF36'},availabilityList:{gap:6,marginTop:5},block:{flexDirection:'row',alignItems:'center',gap:8,backgroundColor:'#F2F5F1',borderRadius:13,padding:11},blockDate:{color:colors.ink,fontSize:12,fontWeight:'900'},blockTime:{color:colors.muted,fontSize:10,marginTop:2},remove:{backgroundColor:'#FFE9E7',borderRadius:10,paddingHorizontal:9,paddingVertical:7},removeText:{color:colors.danger,fontSize:9,fontWeight:'900'},scheduleRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:10,borderTopWidth:1,borderTopColor:'#EDF1EE',paddingVertical:8},scheduleDate:{color:colors.ink,fontSize:11,fontWeight:'900'},scheduleName:{color:colors.muted,fontSize:10,marginTop:2},scheduleStatus:{color:'#557351',fontSize:9,fontWeight:'900'}
});
