import { useMemo, useState } from 'react';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useLanguage } from '../src/i18n';
import { MotionPressable, Reveal } from '../src/motion';
import { SavedEstimate, secureStorage } from '../src/storage';
import { colors, radius, shadow } from '../src/theme';

type Mode = 'moving' | 'cleaning' | 'transport';
type Load = 'light' | 'normal' | 'full';
type CleanType = 'regular' | 'moveout' | 'deep';
const clamp = (v:number,min:number,max:number) => Math.max(min,Math.min(max,v));

const c = {
  fi:{tabs:['Muutto','Siivous','Kuljetus'],movers:'Muuttajien määrä',one:'1 muuttaja',two:'2 muuttajaa',size:'Asunnon koko',floor:'Kerros',load:'Tavaramäärä',loads:['Vähän','Normaali','Paljon'],distance:'Etäisyys',elevator:'Hissi',packing:'Pakkausapua',heavy:'Raskaita esineitä',recommend:'Suosittelemme 2 muuttajaa',why:'Kahdella muuttajalla työ valmistuu nopeammin ja kokonaisuus pysyy usein järkevämpänä.',compare:'Vertailu',area:'Pinta-ala',windows:'Ikkunoita',cleanType:'Siivoustyyppi',cleans:['Perus','Muuttosiivous','Suursiivous'],weight:'Arvioitu paino',express:'Pikakuljetus +25%',estimate:'ALUSTAVA ARVIO',moveNote:'Minimi 2 h. Ensimmäiset 10 km sisältyvät, sen jälkeen 0,85 €/km.',cleanNote:'32,90 €/h · minimiveloitus 2 h.',transportNote:'Crafter-kuljetuksen minimiveloitus 79 €. Ensimmäiset 10 km sisältyvät.',save:'Tallenna arvio',saved:'Arvio tallennettu',book:'Jatka varaukseen',bookSub:'Täytämme palvelun ja arvion valmiiksi varaukseen.',trust:'Ei kirjautumista · arvio tallentuu laitteelle'},
  en:{tabs:['Moving','Cleaning','Transport'],movers:'Number of movers',one:'1 mover',two:'2 movers',size:'Home size',floor:'Floor',load:'Amount of belongings',loads:['Light','Normal','Full'],distance:'Distance',elevator:'Elevator',packing:'Packing help',heavy:'Heavy items',recommend:'We recommend 2 movers',why:'Two movers finish faster and often keep the total job more efficient.',compare:'Comparison',area:'Area',windows:'Windows',cleanType:'Cleaning type',cleans:['Regular','Move-out','Deep clean'],weight:'Estimated weight',express:'Express +25%',estimate:'PRELIMINARY ESTIMATE',moveNote:'2 h minimum. First 10 km included, then €0.85/km.',cleanNote:'€32.90/h · 2 h minimum.',transportNote:'Crafter transport minimum €79. First 10 km included.',save:'Save estimate',saved:'Estimate saved',book:'Continue to booking',bookSub:'Service and estimate are carried into the booking form.',trust:'No sign-in · estimate saved on device'},
  uk:{tabs:['Переїзд','Прибирання','Перевезення'],movers:'Кількість вантажників',one:'1 вантажник',two:'2 вантажники',size:'Площа житла',floor:'Поверх',load:'Кількість речей',loads:['Мало','Звичайно','Багато'],distance:'Відстань',elevator:'Ліфт',packing:'Допомога з пакуванням',heavy:'Важкі речі',recommend:'Рекомендуємо 2 вантажників',why:'Двоє вантажників працюють швидше й часто роблять переїзд ефективнішим.',compare:'Порівняння',area:'Площа',windows:'Вікна',cleanType:'Тип прибирання',cleans:['Звичайне','Після переїзду','Генеральне'],weight:'Орієнтовна вага',express:'Експрес +25%',estimate:'ПОПЕРЕДНЯ ОЦІНКА',moveNote:'Мінімум 2 год. Перші 10 км включено, далі 0,85 €/км.',cleanNote:'32,90 €/год · мінімум 2 год.',transportNote:'Мінімум Crafter — 79 €. Перші 10 км включено.',save:'Зберегти оцінку',saved:'Оцінку збережено',book:'Перейти до бронювання',bookSub:'Послуга та оцінка автоматично перейдуть у форму.',trust:'Без входу · оцінка зберігається на пристрої'},
  ru:{tabs:['Переезд','Уборка','Перевозка'],movers:'Количество грузчиков',one:'1 грузчик',two:'2 грузчика',size:'Площадь жилья',floor:'Этаж',load:'Количество вещей',loads:['Мало','Обычно','Много'],distance:'Расстояние',elevator:'Лифт',packing:'Помощь с упаковкой',heavy:'Тяжёлые вещи',recommend:'Рекомендуем 2 грузчиков',why:'Два грузчика работают быстрее и часто делают заказ эффективнее.',compare:'Сравнение',area:'Площадь',windows:'Окна',cleanType:'Тип уборки',cleans:['Обычная','После переезда','Генеральная'],weight:'Примерный вес',express:'Экспресс +25%',estimate:'ПРЕДВАРИТЕЛЬНАЯ ОЦЕНКА',moveNote:'Минимум 2 часа. Первые 10 км включены, дальше 0,85 €/км.',cleanNote:'32,90 €/ч · минимум 2 часа.',transportNote:'Минимум Crafter — 79 €. Первые 10 км включены.',save:'Сохранить расчёт',saved:'Расчёт сохранён',book:'Перейти к бронированию',bookSub:'Услуга и расчёт автоматически попадут в форму.',trust:'Без входа · расчёт сохраняется на устройстве'},
};

function Stepper({label,value,step,min,max,unit='',onChange}:{label:string;value:number;step:number;min:number;max:number;unit?:string;onChange:(v:number)=>void}) {
  return <View style={s.control}><Text style={s.label}>{label}</Text><View style={s.stepper}>
    <TouchableOpacity style={[s.stepButton,value<=min&&s.disabled]} disabled={value<=min} onPress={()=>onChange(clamp(value-step,min,max))}><Text style={s.stepText}>−</Text></TouchableOpacity>
    <View style={s.valueBox}><TextInput keyboardType="number-pad" value={String(value)} onChangeText={v=>onChange(clamp(Number(v)||min,min,max))} style={s.valueInput}/>{!!unit&&<Text style={s.unit}>{unit}</Text>}</View>
    <TouchableOpacity style={[s.stepButton,value>=max&&s.disabled]} disabled={value>=max} onPress={()=>onChange(clamp(value+step,min,max))}><Text style={s.stepText}>+</Text></TouchableOpacity>
  </View></View>;
}

export default function CalculatorScreen() {
  const { locale } = useLanguage();
  const t = c[locale];
  const [mode,setMode] = useState<Mode>('moving');
  const [movers,setMovers] = useState<1|2>(2);
  const [size,setSize] = useState(15); const [load,setLoad] = useState<Load>('normal'); const [floor,setFloor] = useState(0); const [distance,setDistance] = useState(0);
  const [elevator,setElevator] = useState(true); const [packing,setPacking] = useState(false); const [heavy,setHeavy] = useState(false);
  const [cleanSize,setCleanSize] = useState(20); const [windows,setWindows] = useState(0); const [cleanType,setCleanType] = useState<CleanType>('regular');
  const [transportDistance,setTransportDistance] = useState(0); const [weight,setWeight] = useState(0); const [express,setExpress] = useState(false);
  const [saved,setSaved] = useState(false);

  const calcMove = (count:1|2) => {
    const hourly=count===1?59:75,extra=Math.max(0,size-20),first=Math.min(extra,30),second=Math.max(0,Math.min(extra-30,40)),third=Math.max(0,extra-70);
    const sizeHours=count===1?first*.012+second*.018+third*.025:first*.008+second*.012+third*.017;
    const base=count===1?1.55:1.70; const loadHours=count===1?({light:0,normal:.45,full:1.1} as const)[load]:({light:0,normal:.3,full:.7} as const)[load];
    const stairs=floor<=0?0:elevator?floor*(count===1?.04:.025):floor*(count===1?.16:.1);
    const hours=Math.max(2,base+sizeHours+loadHours+stairs+Math.max(0,distance-10)/50+(packing?(count===1?1.1:.7):0)+(heavy?(count===1?.6:.35):0));
    return { hours, price:Math.round(hours*hourly+Math.max(0,distance-10)*.85) };
  };
  const one=useMemo(()=>calcMove(1),[size,load,floor,distance,elevator,packing,heavy]);
  const two=useMemo(()=>calcMove(2),[size,load,floor,distance,elevator,packing,heavy]);
  const selected=movers===1?one:two;
  const recommend=heavy||(load==='full'&&size>=45)||size>=85||(!elevator&&floor>=2&&size>=35)||one.price>=two.price;
  const cleaning=useMemo(()=>{const div=cleanType==='deep'?16:cleanType==='moveout'?19:24,per=cleanType==='deep'?.22:cleanType==='moveout'?.18:.14,hours=Math.max(2,cleanSize/div+windows*per);return{hours,price:Math.round(hours*32.9)}},[cleanSize,windows,cleanType]);
  const transport=useMemo(()=>{const hours=Math.max(1,1+Math.max(0,transportDistance-10)/50+Math.max(0,weight-50)/320),km=Math.max(0,transportDistance-10)*.85,heavyCharge=weight>120?30+(weight-120)*.06:0,base=Math.max(79,hours*49+km+heavyCharge);return{hours,price:Math.round(base*(express?1.25:1))}},[transportDistance,weight,express]);
  const result=mode==='moving'?selected:mode==='cleaning'?cleaning:transport;

  const estimateText = mode==='moving'
    ? `${movers} mover(s), ${size} m², ${load}, floor ${floor}, ${distance} km${heavy?', heavy items':''}${packing?', packing help':''}`
    : mode==='cleaning' ? `${cleanSize} m², ${windows} windows, ${cleanType}` : `${transportDistance} km, ${weight} kg${express?', express':''}`;
  const bookingNotes = `Muuttobotti app estimate: ${result.price} €, ${result.hours.toFixed(1)}–${(result.hours+.5).toFixed(1)} h. ${estimateText}`;

  const buildEstimate = (): SavedEstimate => ({ mode, price: result.price, hours: result.hours, summary: estimateText, bookingNotes, savedAt: new Date().toISOString() });
  const saveEstimate = async () => { await secureStorage.setLastEstimate(buildEstimate()); setSaved(true); };
  const continueBooking = async () => {
    await secureStorage.setLastEstimate(buildEstimate());
    router.push({ pathname:'/(client)/booking', params:{ service:mode, estimate:bookingNotes } });
  };

  return <ScrollView contentContainerStyle={s.wrap} showsVerticalScrollIndicator={false}>
    <Reveal><View style={s.trust}><Text style={s.trustDot}>●</Text><Text style={s.trustText}>{t.trust}</Text></View></Reveal>
    <Reveal delay={40}><View style={s.tabs}>{(['moving','cleaning','transport'] as Mode[]).map((item,i)=><TouchableOpacity key={item} onPress={()=>{setMode(item);setSaved(false)}} style={[s.tab,mode===item&&s.tabActive]}><Text style={[s.tabText,mode===item&&s.tabTextActive]}>{t.tabs[i]}</Text></TouchableOpacity>)}</View></Reveal>

    {mode==='moving'&&<>
      <Reveal delay={80}><View style={s.section}><Text style={s.label}>{t.movers}</Text><View style={s.choiceRow}><TouchableOpacity style={[s.choice,movers===1&&s.choiceActive]} onPress={()=>{setMovers(1);setSaved(false)}}><Text style={s.choiceTitle}>{t.one}</Text><Text style={s.choiceSub}>59 €/h</Text></TouchableOpacity><TouchableOpacity style={[s.choice,movers===2&&s.choiceActive]} onPress={()=>{setMovers(2);setSaved(false)}}><Text style={s.choiceTitle}>{t.two}</Text><Text style={s.choiceSub}>75 €/h · Crafter</Text></TouchableOpacity></View></View></Reveal>
      <Reveal delay={100}><Stepper label={t.size} value={size} step={5} min={15} max={220} unit="m²" onChange={v=>{setSize(v);setSaved(false)}}/></Reveal>
      <Reveal delay={120}><View style={s.section}><Text style={s.label}>{t.load}</Text><View style={s.choiceRow}>{(['light','normal','full'] as Load[]).map((v,i)=><TouchableOpacity key={v} onPress={()=>{setLoad(v);setSaved(false)}} style={[s.chip,load===v&&s.chipActive]}><Text style={[s.chipText,load===v&&s.chipTextActive]}>{t.loads[i]}</Text></TouchableOpacity>)}</View></View></Reveal>
      <Reveal delay={140}><Stepper label={t.floor} value={floor} step={1} min={0} max={12} onChange={v=>{setFloor(v);setSaved(false)}}/></Reveal>
      <Reveal delay={160}><Stepper label={t.distance} value={distance} step={5} min={0} max={500} unit="km" onChange={v=>{setDistance(v);setSaved(false)}}/></Reveal>
      <Reveal delay={180}><View style={s.toggles}>{[[elevator,setElevator,t.elevator],[packing,setPacking,t.packing],[heavy,setHeavy,t.heavy]].map(([on,setter,label])=><TouchableOpacity key={label as string} style={[s.toggle,on&&s.toggleActive]} onPress={()=>{(setter as (v:boolean)=>void)(!(on as boolean));setSaved(false)}}><Text style={[s.toggleText,on&&s.toggleTextActive]}>{label as string}</Text></TouchableOpacity>)}</View></Reveal>
      {recommend&&<Reveal delay={200}><View style={s.recommend}><View style={s.recommendBadge}><Text style={s.recommendBadgeText}>2×</Text></View><View style={{flex:1}}><Text style={s.recommendTitle}>{t.recommend}</Text><Text style={s.recommendText}>{t.why}</Text></View></View></Reveal>}
      <Reveal delay={220}><View style={s.compare}><Text style={s.compareTitle}>{t.compare}</Text><View style={s.compareRow}><Text style={s.compareLine}>{t.one}</Text><Text style={s.compareValue}>{one.price} € · {one.hours.toFixed(1)} h</Text></View><View style={s.compareRow}><Text style={s.compareLine}>{t.two}</Text><Text style={s.compareValue}>{two.price} € · {two.hours.toFixed(1)} h</Text></View></View></Reveal>
    </>}

    {mode==='cleaning'&&<><Reveal delay={80}><Stepper label={t.area} value={cleanSize} step={5} min={20} max={300} unit="m²" onChange={v=>{setCleanSize(v);setSaved(false)}}/></Reveal><Reveal delay={100}><Stepper label={t.windows} value={windows} step={1} min={0} max={30} onChange={v=>{setWindows(v);setSaved(false)}}/></Reveal><Reveal delay={120}><View style={s.section}><Text style={s.label}>{t.cleanType}</Text><View style={s.choiceRow}>{(['regular','moveout','deep'] as CleanType[]).map((v,i)=><TouchableOpacity key={v} onPress={()=>{setCleanType(v);setSaved(false)}} style={[s.chip,cleanType===v&&s.chipActive]}><Text style={[s.chipText,cleanType===v&&s.chipTextActive]}>{t.cleans[i]}</Text></TouchableOpacity>)}</View></View></Reveal></>}
    {mode==='transport'&&<><Reveal delay={80}><Stepper label={t.distance} value={transportDistance} step={5} min={0} max={600} unit="km" onChange={v=>{setTransportDistance(v);setSaved(false)}}/></Reveal><Reveal delay={100}><Stepper label={t.weight} value={weight} step={25} min={0} max={1200} unit="kg" onChange={v=>{setWeight(v);setSaved(false)}}/></Reveal><Reveal delay={120}><TouchableOpacity style={[s.toggle,express&&s.toggleActive]} onPress={()=>{setExpress(!express);setSaved(false)}}><Text style={[s.toggleText,express&&s.toggleTextActive]}>{t.express}</Text></TouchableOpacity></Reveal></>}

    <Reveal delay={240}><View style={s.summary}><Text style={s.summaryLabel}>{t.estimate}</Text><View style={s.priceRow}><Text style={s.price}>{result.price} €</Text><View style={s.durationPill}><Text style={s.duration}>{result.hours.toFixed(1)}–{(result.hours+.5).toFixed(1)} h</Text></View></View><Text style={s.summaryDetails}>{estimateText}</Text><Text style={s.note}>{mode==='moving'?t.moveNote:mode==='cleaning'?t.cleanNote:t.transportNote}</Text></View></Reveal>

    <Reveal delay={280}><MotionPressable style={s.bookButton} onPress={continueBooking}><View style={s.bookInner}><View style={{flex:1}}><Text style={s.bookTitle}>{t.book}</Text><Text style={s.bookSub}>{t.bookSub}</Text></View><Text style={s.bookArrow}>→</Text></View></MotionPressable></Reveal>
    <Reveal delay={300}><MotionPressable style={[s.saveButton,saved&&s.saveButtonDone]} onPress={saveEstimate}><View style={s.saveInner}><Text style={[s.saveText,saved&&s.saveTextDone]}>{saved?t.saved:t.save}</Text><Text style={[s.saveText,saved&&s.saveTextDone]}>{saved?'✓':'＋'}</Text></View></MotionPressable></Reveal>
  </ScrollView>;
}

const s=StyleSheet.create({
  wrap:{padding:16,paddingBottom:42,gap:12}, trust:{flexDirection:'row',alignItems:'center',gap:8,alignSelf:'center',backgroundColor:'#EAF0E7',paddingHorizontal:12,paddingVertical:8,borderRadius:999},trustDot:{color:colors.limeStrong,fontSize:10},trustText:{color:'#586A65',fontSize:11,fontWeight:'800'},
  tabs:{flexDirection:'row',backgroundColor:'#E8ECE6',padding:5,borderRadius:radius.md},tab:{flex:1,minHeight:48,alignItems:'center',justifyContent:'center',borderRadius:13},tabActive:{backgroundColor:colors.ink},tabText:{color:'#61706D',fontSize:13,fontWeight:'800'},tabTextActive:{color:'#fff'},
  section:{backgroundColor:colors.card,borderRadius:radius.lg,padding:16,borderWidth:1,borderColor:colors.line},label:{color:'#60706D',fontSize:11,fontWeight:'900',letterSpacing:.8,textTransform:'uppercase',marginBottom:10},control:{backgroundColor:colors.card,borderRadius:radius.lg,padding:16,borderWidth:1,borderColor:colors.line},
  stepper:{flexDirection:'row',gap:7,backgroundColor:'#EDF1EC',padding:6,borderRadius:17},stepButton:{width:58,height:58,borderRadius:13,backgroundColor:'#fff',alignItems:'center',justifyContent:'center',...shadow},disabled:{opacity:.3},stepText:{fontSize:27,fontWeight:'600',color:colors.ink},valueBox:{flex:1,flexDirection:'row',alignItems:'center',justifyContent:'center'},valueInput:{minWidth:70,textAlign:'center',fontSize:24,fontWeight:'900',color:colors.ink},unit:{color:colors.muted,fontWeight:'800',marginLeft:2},
  choiceRow:{flexDirection:'row',gap:8,flexWrap:'wrap'},choice:{flex:1,minWidth:135,padding:14,borderRadius:15,backgroundColor:'#EEF2ED',borderWidth:1,borderColor:'#E0E6DF'},choiceActive:{backgroundColor:colors.lime,borderColor:colors.limeStrong},choiceTitle:{color:colors.ink,fontSize:15,fontWeight:'900'},choiceSub:{color:'#60716B',fontSize:12,marginTop:4},
  chip:{flexGrow:1,minHeight:44,paddingHorizontal:12,borderRadius:13,backgroundColor:'#EDF1EC',alignItems:'center',justifyContent:'center'},chipActive:{backgroundColor:colors.ink},chipText:{color:'#5C6E69',fontWeight:'800',fontSize:13},chipTextActive:{color:'#fff'},toggles:{flexDirection:'row',flexWrap:'wrap',gap:8},toggle:{minHeight:48,paddingHorizontal:15,borderRadius:14,backgroundColor:'#EDF1EC',justifyContent:'center',borderWidth:1,borderColor:'#E0E6DF'},toggleActive:{backgroundColor:'#DFFFB0',borderColor:'#CBEF8B'},toggleText:{color:'#60706D',fontWeight:'800',fontSize:13},toggleTextActive:{color:colors.ink},
  recommend:{backgroundColor:'#102F37',borderRadius:20,padding:16,flexDirection:'row',gap:12,alignItems:'flex-start'},recommendBadge:{width:42,height:42,borderRadius:13,backgroundColor:colors.lime,alignItems:'center',justifyContent:'center'},recommendBadgeText:{color:colors.ink,fontSize:14,fontWeight:'900'},recommendTitle:{color:'#fff',fontSize:16,fontWeight:'900'},recommendText:{color:'#AFC0BC',fontSize:12,lineHeight:18,marginTop:4},
  compare:{backgroundColor:'#fff',borderRadius:18,padding:16,borderWidth:1,borderColor:colors.line,gap:9},compareTitle:{color:colors.ink,fontSize:16,fontWeight:'900'},compareRow:{flexDirection:'row',justifyContent:'space-between',gap:10,borderTopWidth:1,borderTopColor:'#EEF1ED',paddingTop:9},compareLine:{color:'#5D6F69',fontSize:13,fontWeight:'700'},compareValue:{color:colors.ink,fontSize:13,fontWeight:'900'},
  summary:{backgroundColor:colors.ink,borderRadius:24,padding:20},summaryLabel:{color:colors.lime,fontSize:10,fontWeight:'900',letterSpacing:1.1},priceRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginTop:5},price:{color:'#fff',fontSize:43,lineHeight:48,fontWeight:'900',letterSpacing:-1.5},durationPill:{backgroundColor:'#173840',borderRadius:999,paddingHorizontal:11,paddingVertical:7},duration:{color:'#D5E1DE',fontSize:12,fontWeight:'800'},summaryDetails:{color:'#D2DEDB',fontSize:13,lineHeight:19,marginTop:8},note:{color:'#91A5A1',fontSize:11,lineHeight:17,marginTop:10},
  bookButton:{minHeight:84,borderRadius:20,backgroundColor:colors.lime,...shadow},bookInner:{flex:1,paddingHorizontal:18,paddingVertical:15,flexDirection:'row',alignItems:'center'},bookTitle:{color:colors.ink,fontSize:18,fontWeight:'900'},bookSub:{color:'#43554F',fontSize:11,lineHeight:16,marginTop:3,maxWidth:'92%'},bookArrow:{color:colors.ink,fontSize:29,fontWeight:'700',marginLeft:8},
  saveButton:{minHeight:54,borderRadius:16,backgroundColor:'#fff',borderWidth:1,borderColor:colors.line},saveButtonDone:{backgroundColor:'#102F37',borderColor:'#102F37'},saveInner:{flex:1,paddingHorizontal:17,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},saveText:{color:colors.ink,fontSize:14,fontWeight:'900'},saveTextDone:{color:colors.lime},
});
