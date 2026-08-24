"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  AlertTriangle, ArrowRight, Boxes, Check, CheckCircle2, Clock3, Gauge,
  Minus, PackageOpen, Plus, Sparkles, Truck, UserRound, UsersRound,
} from "lucide-react";

type Mode = "moving" | "cleaning" | "transport";
type Locale = "fi" | "en" | "uk" | "ru";
type CleanType = "regular" | "moveout" | "deep";
type LoadLevel = "light" | "normal" | "full";

const SNAPSHOT_KEY = "muuttobotti-calculator-snapshot";

const ui = {
  fi: {
    tabs:["Muutto","Siivous","Kuljetus"], movers:"Muuttajien määrä", one:"1 muuttaja", two:"2 muuttajaa",
    size:"Asunnon koko", load:"Tavaramäärä", light:"Vähän tavaraa", normalLoad:"Normaali", full:"Paljon tavaraa",
    sizeHint:"Pinta-ala vaikuttaa arvioon vain kevyesti. Tavaramäärä, kerros ja raskaat esineet vaikuttavat enemmän.",
    floor:"Kerros", distance:"Etäisyys", elevator:"Hissi", packing:"Pakkausapua", afterClean:"Muuttosiivous",
    heavy:"Raskaita esineitä", heavyHint:"esim. sohva, pesukone, painava pöytä", windows:"Ikkunoita", cleanType:"Siivoustyyppi",
    regular:"Perussiivous", moveout:"Muuttosiivous", deep:"Suursiivous", weight:"Arvioitu paino", delivery:"Toimitus",
    normal:"Normaali", express:"Pikakuljetus", estimate:"Alustava arvio", duration:"Arvioitu kesto", continue:"Jatka varaukseen",
    breakdown:"Mistä arvio muodostuu", work:"Työ", driving:"Ajokulu", extra:"Lisäpalvelut", minimum:"Minimiveloitus",
    moveSmall:"Pieni muutto", moveMedium:"Keskikokoinen muutto", moveLarge:"Suuri muutto", recommendation:"Suositus",
    recTwo:"Suosittelemme 2 muuttajaa", recOne:"1 muuttaja riittää todennäköisesti", recHeavy:"Painava kuorma kannattaa vahvistaa ennen tilausta",
    recCleaning:"Arvio perustuu pinta-alaan, siivoustyyppiin ja ikkunoihin", recTransport:"Crafter sopii tähän kuljetukseen",
    whyTwo:"Kahdella muuttajalla työ valmistuu nopeammin ja kokonaisuus pysyy usein järkevämpänä.",
    minMove:"Minimi 2 h. Ensimmäiset 10 km sisältyvät, sen jälkeen 0,85 €/km. Pinta-ala vaikuttaa arvioon portaittain, ei suoraan euroina per m².",
    minClean:"32,90 €/h · minimiveloitus 2 h · perusvälineet sisältyvät.",
    minTransport:"Crafter-kuljetuksen minimiveloitus 79 €. Ensimmäiset 10 km sisältyvät.",
    compare:"Vertailu", withOne:"1 muuttajalla", withTwo:"2 muuttajalla", saveTime:"Säästät aikaa noin",
    finalNote:"Tämä on alustava arvio. Lopullinen hinta vahvistetaan ennen työn alkua.",
  },
  en: {
    tabs:["Moving","Cleaning","Transport"], movers:"Number of movers", one:"1 mover", two:"2 movers",
    size:"Home size", load:"Amount of belongings", light:"Light", normalLoad:"Normal", full:"Lots of belongings",
    sizeHint:"Home size only affects the estimate lightly. Amount of belongings, floor and heavy items matter more.",
    floor:"Floor", distance:"Distance", elevator:"Elevator", packing:"Packing help", afterClean:"Move-out cleaning",
    heavy:"Heavy items", heavyHint:"e.g. sofa, washer, heavy table", windows:"Windows", cleanType:"Cleaning type",
    regular:"Regular", moveout:"Move-out", deep:"Deep clean", weight:"Estimated weight", delivery:"Delivery",
    normal:"Normal", express:"Express", estimate:"Preliminary estimate", duration:"Estimated duration", continue:"Continue to booking",
    breakdown:"Estimate breakdown", work:"Work", driving:"Distance", extra:"Extras", minimum:"Minimum charge",
    moveSmall:"Small move", moveMedium:"Medium move", moveLarge:"Large move", recommendation:"Recommendation",
    recTwo:"We recommend 2 movers", recOne:"1 mover is likely enough", recHeavy:"Confirm a heavy load before booking",
    recCleaning:"Estimate is based on size, cleaning type and windows", recTransport:"The Crafter fits this transport",
    whyTwo:"Two movers finish faster and often keep the overall job more efficient.",
    minMove:"2 h minimum. First 10 km included, then €0.85/km. Home size affects the estimate in soft tiers, not as a direct €/m² charge.", minClean:"€32.90/h · 2 h minimum · basic supplies included.",
    minTransport:"Crafter transport minimum €79. First 10 km included.", compare:"Compare", withOne:"With 1 mover", withTwo:"With 2 movers",
    saveTime:"Estimated time saved", finalNote:"This is a preliminary estimate. Final price is confirmed before work starts.",
  },
  uk: {
    tabs:["Переїзд","Прибирання","Перевезення"], movers:"Кількість вантажників", one:"1 вантажник", two:"2 вантажники",
    size:"Площа житла", load:"Кількість речей", light:"Мало речей", normalLoad:"Звичайно", full:"Багато речей",
    sizeHint:"Площа лише трохи впливає на оцінку. Кількість речей, поверх і важкі предмети важливіші.",
    floor:"Поверх", distance:"Відстань", elevator:"Ліфт", packing:"Допомога з пакуванням", afterClean:"Прибирання після переїзду",
    heavy:"Важкі речі", heavyHint:"напр. диван, пральна машина, важкий стіл", windows:"Вікна", cleanType:"Тип прибирання",
    regular:"Звичайне", moveout:"Після переїзду", deep:"Генеральне", weight:"Орієнтовна вага", delivery:"Доставка",
    normal:"Звичайна", express:"Експрес", estimate:"Попередня оцінка", duration:"Орієнтовний час", continue:"До бронювання",
    breakdown:"З чого складається оцінка", work:"Робота", driving:"Пробіг", extra:"Додатково", minimum:"Мінімальна оплата",
    moveSmall:"Малий переїзд", moveMedium:"Середній переїзд", moveLarge:"Великий переїзд", recommendation:"Рекомендація",
    recTwo:"Рекомендуємо 2 вантажників", recOne:"Ймовірно, достатньо 1 вантажника", recHeavy:"Важкий вантаж краще підтвердити до замовлення",
    recCleaning:"Оцінка враховує площу, тип прибирання та вікна", recTransport:"Crafter підходить для цього перевезення",
    whyTwo:"Двоє вантажників працюють швидше й часто роблять весь переїзд ефективнішим.",
    minMove:"Мінімум 2 год. Перші 10 км включено, далі 0,85 €/км. Площа впливає на оцінку м’якими діапазонами, а не прямою оплатою за м².", minClean:"32,90 €/год · мінімум 2 год · базові засоби включено.",
    minTransport:"Мінімум для Crafter — 79 €. Перші 10 км включено.", compare:"Порівняння", withOne:"З 1 вантажником", withTwo:"З 2 вантажниками",
    saveTime:"Орієнтовна економія часу", finalNote:"Це попередня оцінка. Остаточну ціну підтверджуємо до початку роботи.",
  },
  ru: {
    tabs:["Переезд","Уборка","Перевозка"], movers:"Количество грузчиков", one:"1 грузчик", two:"2 грузчика",
    size:"Площадь жилья", load:"Количество вещей", light:"Мало вещей", normalLoad:"Обычно", full:"Много вещей",
    sizeHint:"Площадь влияет на расчёт лишь умеренно. Количество вещей, этаж и тяжёлые предметы важнее.",
    floor:"Этаж", distance:"Расстояние", elevator:"Лифт", packing:"Помощь с упаковкой", afterClean:"Уборка после переезда",
    heavy:"Тяжёлые вещи", heavyHint:"например диван, стиральная машина, тяжёлый стол", windows:"Окна", cleanType:"Тип уборки",
    regular:"Обычная", moveout:"После переезда", deep:"Генеральная", weight:"Примерный вес", delivery:"Доставка",
    normal:"Обычная", express:"Экспресс", estimate:"Предварительная оценка", duration:"Примерное время", continue:"К бронированию",
    breakdown:"Из чего складывается оценка", work:"Работа", driving:"Пробег", extra:"Дополнительно", minimum:"Минимальная оплата",
    moveSmall:"Небольшой переезд", moveMedium:"Средний переезд", moveLarge:"Большой переезд", recommendation:"Рекомендация",
    recTwo:"Рекомендуем 2 грузчиков", recOne:"Скорее всего достаточно 1 грузчика", recHeavy:"Тяжёлый груз лучше подтвердить до заказа",
    recCleaning:"Расчёт учитывает площадь, тип уборки и окна", recTransport:"Crafter подходит для этой перевозки",
    whyTwo:"Два грузчика работают быстрее и часто делают весь заказ эффективнее.",
    minMove:"Минимум 2 часа. Первые 10 км включены, дальше 0,85 €/км. Площадь влияет на оценку мягкими диапазонами, а не прямой оплатой за м².", minClean:"32,90 €/ч · минимум 2 часа · базовые средства включены.",
    minTransport:"Минимум Crafter — 79 €. Первые 10 км включены.", compare:"Сравнение", withOne:"С 1 грузчиком", withTwo:"С 2 грузчиками",
    saveTime:"Примерная экономия времени", finalNote:"Это предварительная оценка. Итоговую цену подтверждаем до начала работы.",
  },
} as const;

function localeNow(): Locale {
  const lang = document.documentElement.lang;
  return lang === "en" || lang === "uk" || lang === "ru" ? lang : "fi";
}
function money(value:number){ return Math.round(value); }
function clamp(value:number,min:number,max:number){ return Math.min(max,Math.max(min,value)); }
function setNativeValue(element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, value: string) {
  const proto = element instanceof HTMLSelectElement ? HTMLSelectElement.prototype : element instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto,"value")?.set?.call(element,value);
  element.dispatchEvent(new Event("input",{bubbles:true}));
  element.dispatchEvent(new Event("change",{bubbles:true}));
}

type StepperProps={value:number;min:number;max:number;step:number;unit?:string;onChange:(value:number)=>void;ariaLabel:string;};
function NumericStepper({value,min,max,step,unit="",onChange,ariaLabel}:StepperProps){
  const change=(next:number)=>onChange(clamp(Math.round(next),min,max));
  return <div className="bc5-stepper">
    <button type="button" aria-label={`${ariaLabel} -`} disabled={value<=min} onClick={()=>change(value-step)}><Minus/></button>
    <div className="bc5-stepper-value"><input type="number" inputMode="numeric" min={min} max={max} value={value} aria-label={ariaLabel} onChange={event=>change(Number(event.target.value)||min)}/>{unit&&<span>{unit}</span>}</div>
    <button type="button" aria-label={`${ariaLabel} +`} disabled={value>=max} onClick={()=>change(value+step)}><Plus/></button>
  </div>;
}

export default function BusinessCalculatorV4(){
  const [target,setTarget]=useState<HTMLElement|null>(null);
  const [locale,setLocale]=useState<Locale>("fi");
  const [mode,setMode]=useState<Mode>("moving");
  const [movers,setMovers]=useState<1|2>(2);
  const [size,setSize]=useState(15);
  const [load,setLoad]=useState<LoadLevel>("normal");
  const [floor,setFloor]=useState(0);
  const [distance,setDistance]=useState(0);
  const [elevator,setElevator]=useState(true);
  const [packing,setPacking]=useState(false);
  const [afterClean,setAfterClean]=useState(false);
  const [heavyItems,setHeavyItems]=useState(false);
  const [cleanSize,setCleanSize]=useState(20);
  const [windows,setWindows]=useState(0);
  const [cleanType,setCleanType]=useState<CleanType>("regular");
  const [transportDistance,setTransportDistance]=useState(0);
  const [weight,setWeight]=useState(0);
  const [express,setExpress]=useState(false);

  useEffect(()=>{
    setTarget(document.querySelector<HTMLElement>(".calculator-section"));
    setLocale(localeNow());
    const observer=new MutationObserver(()=>setLocale(localeNow()));
    observer.observe(document.documentElement,{attributes:true,attributeFilter:["lang"]});
    return()=>observer.disconnect();
  },[]);

  const t=ui[locale];
  const calculateMove=(count:1|2)=>{
    const hourly=count===1?59:75;
    const extraM2=Math.max(0,size-20);
    const first=Math.min(extraM2,30);
    const second=Math.max(0,Math.min(extraM2-30,40));
    const third=Math.max(0,extraM2-70);
    const sizeHours=count===1?first*.012+second*.018+third*.025:first*.008+second*.012+third*.017;
    const baseHours=count===1?1.55:1.70;
    const loadHours=count===1?({light:0,normal:.45,full:1.10} as const)[load]:({light:0,normal:.30,full:.70} as const)[load];
    const stairs=floor<=0?0:elevator?floor*(count===1?.04:.025):floor*(count===1?.16:.10);
    const driveHours=Math.max(0,distance-10)/50;
    const packHours=packing?(count===1?1.1:.7):0;
    const heavyHours=heavyItems?(count===1?.6:.35):0;
    const hours=Math.max(2,baseHours+sizeHours+loadHours+stairs+driveHours+packHours+heavyHours);
    const km=Math.max(0,distance-10)*.85;
    const cleanHours=afterClean?Math.max(2,size/22):0;
    const clean=cleanHours*32.9;
    return {hours,work:hours*hourly,km,clean,price:money(hours*hourly+km+clean)};
  };

  const moveOne=useMemo(()=>calculateMove(1),[size,load,floor,distance,elevator,packing,afterClean,heavyItems]);
  const moveTwo=useMemo(()=>calculateMove(2),[size,load,floor,distance,elevator,packing,afterClean,heavyItems]);
  const selectedMove=movers===1?moveOne:moveTwo;
  const recommendTwo=heavyItems || (load==="full"&&size>=45) || size>=85 || (!elevator&&floor>=2&&size>=35) || moveOne.hours-moveTwo.hours>=.75 || moveOne.price>=moveTwo.price;
  const moveScore=size+(load==="light"?0:load==="normal"?25:55);
  const sizeBand=moveScore<55?"small":moveScore<115?"medium":"large";

  const cleaning=useMemo(()=>{const divisor=cleanType==="deep"?16:cleanType==="moveout"?19:24;const perWindow=cleanType==="deep"?.22:cleanType==="moveout"?.18:.14;const hours=Math.max(2,cleanSize/divisor+windows*perWindow);return {hours,price:money(hours*32.9)};},[cleanSize,windows,cleanType]);
  const transport=useMemo(()=>{const driveHours=Math.max(0,transportDistance-10)/50;const handling=Math.max(0,weight-50)/320;const hours=Math.max(1,1+driveHours+handling);const km=Math.max(0,transportDistance-10)*.85;const heavy=weight>120;const heavyCharge=heavy?30+(weight-120)*.06:0;const base=Math.max(79,hours*49+km+heavyCharge);const price=money(base*(express?1.25:1));return {hours,km,heavy,price,work:Math.max(49,hours*49),extra:heavyCharge+(express?base*.25:0)};},[transportDistance,weight,express]);
  const result=mode==="moving"?{price:selectedMove.price,hours:selectedMove.hours}:mode==="cleaning"?cleaning:transport;
  const duration=result.hours<=2.001?`${result.hours.toFixed(1)} h`:`${result.hours.toFixed(1)}–${(result.hours+.5).toFixed(1)} h`;

  useEffect(()=>{const snapshot={version:5,source:"business-calculator-v5-steppers",mode,locale,quotedPrice:result.price,quotedDuration:duration,moving:mode==="moving"?{movers,hourlyRate:movers===1?59:75,sizeM2:size,loadLevel:load,floor,distanceKm:distance,elevator,packing,afterClean,heavyItems,recommendedMovers:recommendTwo?2:1,workPrice:money(selectedMove.work),kmCharge:money(selectedMove.km),cleaningPrice:money(selectedMove.clean)}:undefined,cleaning:mode==="cleaning"?{sizeM2:cleanSize,windows,cleanType,hourlyRate:32.9}:undefined,transport:mode==="transport"?{distanceKm:transportDistance,weightKg:weight,express,kmCharge:money(transport.km),heavy:transport.heavy}:undefined,updatedAt:new Date().toISOString()};sessionStorage.setItem(SNAPSHOT_KEY,JSON.stringify(snapshot));},[mode,locale,result.price,duration,movers,size,load,floor,distance,elevator,packing,afterClean,heavyItems,recommendTwo,selectedMove,cleanSize,windows,cleanType,transportDistance,weight,express,transport]);

  const continueBooking=()=>{const service=document.querySelector<HTMLSelectElement>('select[name="service"]');const notes=document.querySelector<HTMLTextAreaElement>('textarea[name="notes"]');if(service)setNativeValue(service,mode);let note=`${t.estimate}: ${result.price} €, ${t.duration}: ${duration}. `;if(mode==="moving")note+=`${movers} ${locale==="fi"?"muuttajaa":locale==="en"?"movers":locale==="uk"?"вантажники":"грузчика"}, ${size} m², load: ${load}, ${floor}. krs, ${distance} km${heavyItems?", heavy items":""}.`;if(mode==="cleaning")note+=`${cleanSize} m², ${windows} windows, ${cleanType}.`;if(mode==="transport")note+=`${transportDistance} km, ${weight} kg${express?", express":""}.`;if(notes)setNativeValue(notes,note);document.getElementById("booking")?.scrollIntoView({behavior:"smooth"});};

  if(!target)return null;
  const bandLabel=sizeBand==="small"?t.moveSmall:sizeBand==="medium"?t.moveMedium:t.moveLarge;
  const saved=Math.max(0,moveOne.hours-moveTwo.hours);
  const loadLabels:{key:LoadLevel,label:string}[]=[{key:"light",label:t.light},{key:"normal",label:t.normalLoad},{key:"full",label:t.full}];

  return createPortal(<div className="bc3-card bc4-card bc5-card" data-mode={mode}>
    <div className="bc3-tabs">{(["moving","cleaning","transport"] as Mode[]).map((item,i)=><button key={item} className={mode===item?"active":""} onClick={()=>setMode(item)}>{item==="moving"?<Boxes/>:item==="cleaning"?<Sparkles/>:<Truck/>}<span>{t.tabs[i]}</span></button>)}</div>
    {mode==="moving"&&<div className="bc3-body"><div className="bc3-move-band"><div><Gauge/><span>{bandLabel}</span></div><div className={`bc3-scale ${sizeBand}`}><i/><i/><i/></div></div><div className="bc3-grid bc5-grid">
      <div className="bc3-full bc5-control"><span className="bc5-label">{t.movers}</span><div className="bc3-movers"><button className={movers===1?"active":""} onClick={()=>setMovers(1)}><UserRound/><div><b>{t.one}</b><small>59 €/h</small></div></button><button className={movers===2?"active":""} onClick={()=>setMovers(2)}><UsersRound/><div><b>{t.two}</b><small>75 €/h · Crafter</small></div></button></div></div>
      <div className="bc5-control"><span className="bc5-label">{t.size}</span><NumericStepper value={size} min={15} max={220} step={5} unit="m²" onChange={setSize} ariaLabel={t.size}/></div>
      <div className="bc5-control"><span className="bc5-label">{t.floor}</span><NumericStepper value={floor} min={0} max={12} step={1} onChange={setFloor} ariaLabel={t.floor}/></div>
      <div className="bc3-full bc4-volume"><span>{t.load}</span><div>{loadLabels.map(item=><button key={item.key} className={load===item.key?"active":""} onClick={()=>setLoad(item.key)}>{item.label}</button>)}</div><small>{t.sizeHint}</small></div>
      <div className="bc3-full bc5-control"><span className="bc5-label">{t.distance}</span><NumericStepper value={distance} min={0} max={500} step={5} unit="km" onChange={setDistance} ariaLabel={t.distance}/></div>
      <div className="bc3-switches bc3-full"><button className={elevator?"on":""} onClick={()=>setElevator(!elevator)}><CheckCircle2/>{t.elevator}</button><button className={packing?"on":""} onClick={()=>setPacking(!packing)}><Boxes/>{t.packing}</button><button className={afterClean?"on":""} onClick={()=>setAfterClean(!afterClean)}><Sparkles/>{t.afterClean}</button><button className={heavyItems?"on warning":""} onClick={()=>setHeavyItems(!heavyItems)}><PackageOpen/><span>{t.heavy}<small>{t.heavyHint}</small></span></button></div>
    </div><div className={`bc3-recommendation ${recommendTwo?"recommend-two":""}`}><div className="bc3-rec-icon">{recommendTwo?<UsersRound/>:<Check/>}</div><div><span>{t.recommendation}</span><strong>{recommendTwo?t.recTwo:t.recOne}</strong>{recommendTwo&&<p>{t.whyTwo}</p>}</div>{recommendTwo&&movers===1&&<button onClick={()=>setMovers(2)}>{t.two}<ArrowRight/></button>}</div><div className="bc3-compare"><span>{t.compare}</span><div><small>{t.withOne}</small><b>{money(moveOne.price)} € · {moveOne.hours.toFixed(1)} h</b></div><div><small>{t.withTwo}</small><b>{money(moveTwo.price)} € · {moveTwo.hours.toFixed(1)} h</b></div><div className="bc3-time-save"><Clock3/><small>{t.saveTime}</small><b>{saved.toFixed(1)} h</b></div></div><div className="bc3-rule">{t.minMove}</div></div>}
    {mode==="cleaning"&&<div className="bc3-body"><div className="bc3-grid bc5-grid"><div className="bc5-control"><span className="bc5-label">{t.size}</span><NumericStepper value={cleanSize} min={20} max={300} step={5} unit="m²" onChange={setCleanSize} ariaLabel={t.size}/></div><div className="bc5-control"><span className="bc5-label">{t.windows}</span><NumericStepper value={windows} min={0} max={30} step={1} onChange={setWindows} ariaLabel={t.windows}/></div><label className="bc3-full"><span>{t.cleanType}</span><select value={cleanType} onChange={e=>setCleanType(e.target.value as CleanType)}><option value="regular">{t.regular}</option><option value="moveout">{t.moveout}</option><option value="deep">{t.deep}</option></select></label></div><div className="bc3-recommendation"><div className="bc3-rec-icon"><Sparkles/></div><div><span>{t.recommendation}</span><strong>{t.recCleaning}</strong></div></div><div className="bc3-rule">{t.minClean}</div></div>}
    {mode==="transport"&&<div className="bc3-body"><div className="bc3-grid bc5-grid"><div className="bc5-control"><span className="bc5-label">{t.distance}</span><NumericStepper value={transportDistance} min={0} max={600} step={5} unit="km" onChange={setTransportDistance} ariaLabel={t.distance}/></div><div className="bc5-control"><span className="bc5-label">{t.weight}</span><NumericStepper value={weight} min={0} max={1200} step={25} unit="kg" onChange={setWeight} ariaLabel={t.weight}/></div><label className="bc3-full"><span>{t.delivery}</span><select value={express?"express":"normal"} onChange={e=>setExpress(e.target.value==="express")}><option value="normal">{t.normal}</option><option value="express">{t.express}</option></select></label></div><div className={`bc3-recommendation ${transport.heavy?"recommend-two":""}`}><div className="bc3-rec-icon">{transport.heavy?<AlertTriangle/>:<Truck/>}</div><div><span>{t.recommendation}</span><strong>{transport.heavy?t.recHeavy:t.recTransport}</strong></div></div><div className="bc3-rule">{t.minTransport}</div></div>}
    <div className="bc3-summary"><div className="bc3-price"><span>{t.estimate}</span><strong>{result.price} €</strong></div><div><span>{t.duration}</span><b>{duration}</b></div><div className="bc3-breakdown"><span>{t.breakdown}</span>{mode==="moving"&&<><small>{t.work}: {money(selectedMove.work)} €</small>{selectedMove.km>0&&<small>{t.driving}: {money(selectedMove.km)} €</small>}{selectedMove.clean>0&&<small>{t.extra}: {money(selectedMove.clean)} €</small>}</>}{mode==="cleaning"&&<small>{t.minimum}: 2 h · 32,90 €/h</small>}{mode==="transport"&&<><small>{t.work}: {money(transport.work)} €</small>{transport.km>0&&<small>{t.driving}: {money(transport.km)} €</small>}</>}</div><button onClick={continueBooking}>{t.continue}<ArrowRight/></button><p>{t.finalNote}</p></div>
  </div>,target);
}
