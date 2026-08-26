"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, CalendarDays, MessageCircle, Phone, Sparkles, Truck, UserRound, UsersRound } from "lucide-react";

type Locale = "fi" | "en" | "uk" | "ru";

const copy = {
  fi: { one:"1 muuttaja", two:"2 muuttajaa + Crafter", clean:"Siivous", from:"alkaen", calculate:"Laske hinta", book:"Varaa", call:"Soita", whatsapp:"WhatsApp", smart:"Selkeä arvio ennen varausta" },
  en: { one:"1 mover", two:"2 movers + Crafter", clean:"Cleaning", from:"from", calculate:"Calculate", book:"Book", call:"Call", whatsapp:"WhatsApp", smart:"Clear estimate before booking" },
  uk: { one:"1 вантажник", two:"2 вантажники + Crafter", clean:"Прибирання", from:"від", calculate:"Розрахувати", book:"Замовити", call:"Дзвінок", whatsapp:"WhatsApp", smart:"Зрозумілий розрахунок до бронювання" },
  ru: { one:"1 грузчик", two:"2 грузчика + Crafter", clean:"Уборка", from:"от", calculate:"Рассчитать", book:"Заказать", call:"Позвонить", whatsapp:"WhatsApp", smart:"Понятный расчёт до бронирования" },
} as const;

function getLocale(): Locale {
  const lang=document.documentElement.lang;
  return lang==="en"||lang==="uk"||lang==="ru"?lang:"fi";
}

export default function HeroUXV6(){
  const [hero,setHero]=useState<HTMLElement|null>(null);
  const [copyTarget,setCopyTarget]=useState<HTMLElement|null>(null);
  const [mounted,setMounted]=useState(false);
  const [locale,setLocale]=useState<Locale>("fi");

  useEffect(()=>{
    setMounted(true);
    setHero(document.querySelector<HTMLElement>(".hero"));
    setCopyTarget(document.querySelector<HTMLElement>(".hero-copy"));
    setLocale(getLocale());
    const observer=new MutationObserver(()=>setLocale(getLocale()));
    observer.observe(document.documentElement,{attributes:true,attributeFilter:["lang"]});
    return()=>observer.disconnect();
  },[]);

  if(!mounted)return null;
  const t=copy[locale];
  const scrollCalc=()=>document.getElementById("calculator")?.scrollIntoView({behavior:"smooth",block:"start"});
  const scrollBooking=()=>document.getElementById("booking")?.scrollIntoView({behavior:"smooth",block:"start"});

  return <>
    {hero&&createPortal(<div className="hero-v6-atmosphere" aria-hidden="true"><span className="hero-v6-orb orb-a"/><span className="hero-v6-orb orb-b"/><span className="hero-v6-route"><i/><i/><i/></span></div>,hero)}
    {copyTarget&&createPortal(<div className="hero-v6-offers">
      <div className="hero-v6-smart"><Sparkles/><span>{t.smart}</span></div>
      <div className="hero-v6-price-grid">
        <button onClick={scrollCalc}><UserRound/><span><small>{t.one}</small><b>{t.from} 59 €/h</b></span><ArrowRight/></button>
        <button onClick={scrollCalc}><UsersRound/><span><small>{t.two}</small><b>{t.from} 75 €/h</b></span><ArrowRight/></button>
        <button onClick={scrollCalc}><Sparkles/><span><small>{t.clean}</small><b>{t.from} 32,90 €/h</b></span><ArrowRight/></button>
      </div>
    </div>,copyTarget)}
    {createPortal(<nav className="mobile-conversion-bar" aria-label="Quick actions">
      <a href="tel:+3584578767567"><Phone/><span>{t.call}</span></a>
      <a href="https://wa.me/3584578767567"><MessageCircle/><span>{t.whatsapp}</span></a>
      <button className="mobile-calc-action" onClick={scrollCalc}><Truck/><span>{t.calculate}</span></button>
      <button className="mobile-book-action" onClick={scrollBooking}><CalendarDays/><span>{t.book}</span></button>
    </nav>,document.body)}
  </>;
}
