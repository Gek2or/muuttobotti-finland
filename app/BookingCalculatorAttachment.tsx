"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Bot, CheckCircle2, PackageCheck, Sparkles, Truck, UsersRound, X } from "lucide-react";

type Locale = "fi" | "en" | "uk" | "ru";
type Snapshot = Record<string, any>;

const SNAPSHOT_KEY = "muuttobotti-calculator-snapshot";
const ATTACHED_KEY = "muuttobotti-booking-calculator-attached";
const ATTACHED_SNAPSHOT_KEY = "muuttobotti-booking-calculator-snapshot";

const copy = {
  fi:{title:"Muuttobotti AI · laskelman tiedot",body:"Nämä tiedot liitetään varaukseen erillisenä lisätietona. Voit poistaa ne ennen lähettämistä.",remove:"Poista laskelman tiedot",price:"Arvio",duration:"Kesto",vehicle:"Ajoneuvo",movers:"Muuttajat",home:"Asunto",route:"Matka",load:"Tavaramäärä",weight:"Paino",cleaning:"Siivous",floor:"krs",van:"Korkea Crafter · 13–15 m³",trailer:"Crafter + 7–8 m³ perävaunu · noin 20 m³ · +10 €/h",attached:"Liitetty varaukseen",loads:{light:"Vähän tavaraa",normal:"Normaali",full:"Paljon tavaraa"},cleanTypes:{regular:"Perussiivous",moveout:"Muuttosiivous",deep:"Suursiivous"}},
  en:{title:"Muuttobotti AI · estimate details",body:"These details are attached to the booking as separate additional information. You can remove them before sending.",remove:"Remove estimate details",price:"Estimate",duration:"Duration",vehicle:"Vehicle",movers:"Movers",home:"Home",route:"Distance",load:"Load",weight:"Weight",cleaning:"Cleaning",floor:"floor",van:"High-roof Crafter · 13–15 m³",trailer:"Crafter + 7–8 m³ trailer · about 20 m³ · +€10/h",attached:"Attached to booking",loads:{light:"Light",normal:"Normal",full:"Lots of belongings"},cleanTypes:{regular:"Regular cleaning",moveout:"Move-out cleaning",deep:"Deep cleaning"}},
  uk:{title:"Muuttobotti AI · дані розрахунку",body:"Ці дані додаються до заявки як окрема додаткова інформація. Їх можна видалити перед надсиланням.",remove:"Видалити дані розрахунку",price:"Оцінка",duration:"Час",vehicle:"Автомобіль",movers:"Вантажники",home:"Житло",route:"Відстань",load:"Речі",weight:"Вага",cleaning:"Прибирання",floor:"поверх",van:"Високий Crafter · 13–15 м³",trailer:"Crafter + причіп 7–8 м³ · близько 20 м³ · +10 €/год",attached:"Додано до заявки",loads:{light:"Мало речей",normal:"Звичайна кількість",full:"Багато речей"},cleanTypes:{regular:"Звичайне прибирання",moveout:"Прибирання після переїзду",deep:"Генеральне прибирання"}},
  ru:{title:"Muuttobotti AI · данные расчёта",body:"Эти данные прикрепляются к заявке как отдельная дополнительная информация. Их можно удалить перед отправкой.",remove:"Удалить данные расчёта",price:"Расчёт",duration:"Время",vehicle:"Машина",movers:"Грузчики",home:"Жильё",route:"Расстояние",load:"Вещи",weight:"Вес",cleaning:"Уборка",floor:"этаж",van:"Высокий Crafter · 13–15 м³",trailer:"Crafter + прицеп 7–8 м³ · около 20 м³ · +10 €/ч",attached:"Прикреплено к заявке",loads:{light:"Мало вещей",normal:"Обычное количество",full:"Много вещей"},cleanTypes:{regular:"Обычная уборка",moveout:"Уборка после переезда",deep:"Генеральная уборка"}},
} as const;

function localeNow(): Locale {
  const lang=document.documentElement.lang;
  return lang==="en"||lang==="uk"||lang==="ru"?lang:"fi";
}

function parseSnapshot(raw:string|null):Snapshot|null {
  if(!raw)return null;
  try{return JSON.parse(raw);}catch{return null;}
}

function readLiveSnapshot(): Snapshot|null {
  return parseSnapshot(sessionStorage.getItem(SNAPSHOT_KEY));
}

function readAttachedSnapshot(): Snapshot|null {
  return parseSnapshot(sessionStorage.getItem(ATTACHED_SNAPSHOT_KEY));
}

function clearAttachment() {
  sessionStorage.removeItem(ATTACHED_KEY);
  sessionStorage.removeItem(ATTACHED_SNAPSHOT_KEY);
}

export default function BookingCalculatorAttachment(){
  const [target,setTarget]=useState<HTMLElement|null>(null);
  const [locale,setLocale]=useState<Locale>("fi");
  const [snapshot,setSnapshot]=useState<Snapshot|null>(null);

  useEffect(()=>{
    const mount=()=>{
      const form=document.querySelector<HTMLFormElement>(".booking-form");
      if(!form)return;
      let slot=document.getElementById("booking-calculator-attachment-slot");
      if(!slot){
        slot=document.createElement("div");
        slot.id="booking-calculator-attachment-slot";
        const serviceLabel=form.querySelector('select[name="service"]')?.closest("label");
        if(serviceLabel?.nextSibling)form.insertBefore(slot,serviceLabel.nextSibling);else form.appendChild(slot);
      }
      setTarget(slot);
    };
    mount();
    setLocale(localeNow());
    if(sessionStorage.getItem(ATTACHED_KEY)==="1"){
      const stored=readAttachedSnapshot()??readLiveSnapshot();
      if(stored){
        sessionStorage.setItem(ATTACHED_SNAPSHOT_KEY,JSON.stringify(stored));
        setSnapshot(stored);
      }
    }

    const onAttach=()=>{
      const current=readLiveSnapshot();
      if(!current)return;
      sessionStorage.setItem(ATTACHED_KEY,"1");
      sessionStorage.setItem(ATTACHED_SNAPSHOT_KEY,JSON.stringify(current));
      setSnapshot(current);
    };
    const onSubmitGate=(event:Event)=>{
      const form=event.target as HTMLFormElement|null;
      if(!form?.classList?.contains("booking-form"))return;
      if(sessionStorage.getItem(ATTACHED_KEY)!=="1"){
        sessionStorage.removeItem(SNAPSHOT_KEY);
        return;
      }
      const frozen=sessionStorage.getItem(ATTACHED_SNAPSHOT_KEY);
      if(frozen)sessionStorage.setItem(SNAPSHOT_KEY,frozen);
    };
    const onServiceChange=(event:Event)=>{
      const select=event.target as HTMLSelectElement|null;
      if(select?.name!=="service"||sessionStorage.getItem(ATTACHED_KEY)!=="1")return;
      const current=readAttachedSnapshot();
      if(current?.mode&&current.mode!==select.value){
        clearAttachment();
        setSnapshot(null);
      }
    };

    window.addEventListener("muuttobotti:calculator-attach",onAttach);
    document.addEventListener("submit",onSubmitGate,true);
    document.addEventListener("change",onServiceChange,true);
    const observer=new MutationObserver(()=>setLocale(localeNow()));
    observer.observe(document.documentElement,{attributes:true,attributeFilter:["lang"]});
    return()=>{
      observer.disconnect();
      window.removeEventListener("muuttobotti:calculator-attach",onAttach);
      document.removeEventListener("submit",onSubmitGate,true);
      document.removeEventListener("change",onServiceChange,true);
    };
  },[]);

  const rows=useMemo(()=>{
    if(!snapshot)return [] as {icon:ReactNode;label:string;value:string}[];
    const t=copy[locale];
    const output:{icon:ReactNode;label:string;value:string}[]=[];
    output.push({icon:<Sparkles/>,label:t.price,value:`${snapshot.quotedPrice ?? "–"} €`});
    output.push({icon:<CheckCircle2/>,label:t.duration,value:String(snapshot.quotedDuration ?? "–")});
    if(snapshot.mode!=="cleaning"){
      output.push({icon:snapshot.vehicle==="crafter-trailer"?<PackageCheck/>:<Truck/>,label:t.vehicle,value:snapshot.vehicle==="crafter-trailer"?t.trailer:t.van});
    }
    if(snapshot.mode==="moving"){
      const m=snapshot.moving??{};
      const loadKey=String(m.loadLevel??"normal") as keyof typeof t.loads;
      output.push({icon:<UsersRound/>,label:t.movers,value:String(m.movers??"–")});
      output.push({icon:<Bot/>,label:t.home,value:`${m.sizeM2??"–"} m² · ${m.floor??0} ${t.floor}`});
      output.push({icon:<Truck/>,label:t.route,value:`${m.distanceKm??0} km`});
      output.push({icon:<PackageCheck/>,label:t.load,value:t.loads[loadKey]??String(m.loadLevel??"–")});
    } else if(snapshot.mode==="transport"){
      const tr=snapshot.transport??{};
      output.push({icon:<Truck/>,label:t.route,value:`${tr.distanceKm??0} km`});
      output.push({icon:<PackageCheck/>,label:t.weight,value:`${tr.weightKg??0} kg`});
    } else if(snapshot.mode==="cleaning"){
      const c=snapshot.cleaning??{};
      const typeKey=String(c.cleanType??"regular") as keyof typeof t.cleanTypes;
      output.push({icon:<Sparkles/>,label:t.cleaning,value:`${c.sizeM2??"–"} m² · ${t.cleanTypes[typeKey]??String(c.cleanType??"")}`});
    }
    return output;
  },[snapshot,locale]);

  if(!target||!snapshot)return null;
  const t=copy[locale];

  const remove=()=>{
    clearAttachment();
    setSnapshot(null);
    window.dispatchEvent(new CustomEvent("muuttobotti:calculator-detach"));
  };

  return createPortal(<div className="booking-ai-attachment" role="status">
    <div className="booking-ai-head">
      <div className="booking-ai-title"><span><Bot/></span><div><strong>{t.title}</strong><small><CheckCircle2/>{t.attached}</small></div></div>
      <button type="button" onClick={remove} aria-label={t.remove} title={t.remove}><X/></button>
    </div>
    <p>{t.body}</p>
    <div className="booking-ai-grid">{rows.map((row,index)=><div className="booking-ai-row" key={`${row.label}-${index}`}><span>{row.icon}</span><div><small>{row.label}</small><b>{row.value}</b></div></div>)}</div>
  </div>,target);
}
