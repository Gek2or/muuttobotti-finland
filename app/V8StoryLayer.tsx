"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type Locale = "fi" | "en" | "uk" | "ru";

const copy = {
  fi: {
    overline: "MUUTTOBOTTI / UUSIMAA · FINLAND",
    heroA: "Muutto.", heroB: "Ilman kaaosta.",
    heroP: "Yksi tiimi, iso auto ja selkeä hinta. Suunniteltu niin, että muutto tuntuu helpolta jo ennen ensimmäistä laatikkoa.",
    cta: "Laske oma hinta",
    proof: ["13–15 m³ Crafter", "1–2 muuttajaa", "Selkeä arvio ennen varausta"],
    servicesK: "Yksi kumppani. Koko päivä.", servicesA: "Muutto ei ole viisi eri ongelmaa.", servicesB: "Se on yksi hyvin hoidettu kokonaisuus.",
    services: ["Muutot", "Kuljetukset", "Siivous", "Ikkunanpesu", "Kalusteiden kasaus"],
    routeK: "Smart estimate", routeA: "Kerro reitti.", routeB: "Näe hinta.", routeP: "Anna muuton tärkeimmät tiedot. Muuttobotti laskee heti realistisen arvion ja sopivan tiimin.",
    example: "Esimerkki", route: "Helsinki → Espoo", estimate: "~ 287 €", meta: ["55 m²", "18 km", "2 muuttajaa"],
    calculatorLead: "Nyt tehdään tästä sinun muuttosi.",
    trustK: "Miksi Muuttobotti", trustA: "Vähemmän säätöä. Enemmän varmuutta.",
  },
  en: {
    overline: "MUUTTOBOTTI / UUSIMAA · FINLAND",
    heroA: "Move.", heroB: "No chaos.",
    heroP: "One team, a large van and a clear price. Designed to make moving feel simple before the first box is lifted.",
    cta: "Calculate my price",
    proof: ["13–15 m³ Crafter", "1–2 movers", "Clear estimate before booking"],
    servicesK: "One partner. The whole day.", servicesA: "Moving is not five separate problems.", servicesB: "It is one well-run operation.",
    services: ["Moving", "Transport", "Cleaning", "Window cleaning", "Furniture assembly"],
    routeK: "Smart estimate", routeA: "Give us the route.", routeB: "See the price.", routeP: "Share the essentials. Muuttobotti instantly builds a realistic estimate and recommends the right team.",
    example: "Example", route: "Helsinki → Espoo", estimate: "~ 287 €", meta: ["55 m²", "18 km", "2 movers"],
    calculatorLead: "Now make it your move.",
    trustK: "Why Muuttobotti", trustA: "Less coordination. More certainty.",
  },
  uk: {
    overline: "MUUTTOBOTTI / UUSIMAA · FINLAND",
    heroA: "Переїзд.", heroB: "Без хаосу.",
    heroP: "Одна команда, великий фургон і зрозуміла ціна. Все спроєктовано так, щоб переїзд був простим ще до першої коробки.",
    cta: "Розрахувати мою ціну",
    proof: ["Crafter 13–15 м³", "1–2 вантажники", "Зрозуміла оцінка до бронювання"],
    servicesK: "Один партнер. Весь день.", servicesA: "Переїзд — це не п’ять окремих проблем.", servicesB: "Це одна добре організована робота.",
    services: ["Переїзд", "Перевезення", "Прибирання", "Миття вікон", "Складання меблів"],
    routeK: "Smart estimate", routeA: "Дайте маршрут.", routeB: "Побачте ціну.", routeP: "Вкажіть основні дані. Muuttobotti одразу розрахує реалістичну оцінку й потрібну команду.",
    example: "Приклад", route: "Helsinki → Espoo", estimate: "~ 287 €", meta: ["55 м²", "18 км", "2 вантажники"],
    calculatorLead: "Тепер розрахуємо саме ваш переїзд.",
    trustK: "Чому Muuttobotti", trustA: "Менше координації. Більше впевненості.",
  },
  ru: {
    overline: "MUUTTOBOTTI / UUSIMAA · FINLAND",
    heroA: "Переезд.", heroB: "Без хаоса.",
    heroP: "Одна команда, большой фургон и понятная цена. Всё устроено так, чтобы переезд ощущался простым ещё до первой коробки.",
    cta: "Рассчитать мою цену",
    proof: ["Crafter 13–15 м³", "1–2 грузчика", "Понятная оценка до бронирования"],
    servicesK: "Один партнёр. Весь день.", servicesA: "Переезд — это не пять разных проблем.", servicesB: "Это одна хорошо организованная работа.",
    services: ["Переезд", "Перевозка", "Уборка", "Мойка окон", "Сборка мебели"],
    routeK: "Smart estimate", routeA: "Дайте маршрут.", routeB: "Увидьте цену.", routeP: "Укажите главное. Muuttobotti сразу рассчитает реалистичную оценку и подходящую команду.",
    example: "Пример", route: "Helsinki → Espoo", estimate: "~ 287 €", meta: ["55 м²", "18 км", "2 грузчика"],
    calculatorLead: "Теперь рассчитаем именно ваш переезд.",
    trustK: "Почему Muuttobotti", trustA: "Меньше координации. Больше уверенности.",
  },
} as const;

function detectLocale(): Locale {
  const t = document.querySelector<HTMLElement>(".lang-button")?.textContent ?? "";
  if (t.includes("🇷🇺")) return "ru";
  if (t.includes("🇺🇦")) return "uk";
  if (t.includes("🇬🇧") || t.includes("🇺🇸")) return "en";
  return "fi";
}

function Story({ locale }: { locale: Locale }) {
  const c = copy[locale];
  const go = () => document.getElementById("calculator")?.scrollIntoView({ behavior: "smooth" });
  return <div className="mb-v8-story">
    <section className="v8-scene v8-hero" data-v8="hero">
      <div className="v8-sticky">
        <div className="v8-hero-copy">
          <span className="v8-overline">{c.overline}</span>
          <h1>{c.heroA}<br/><em>{c.heroB}</em></h1>
          <p>{c.heroP}</p>
          <button onClick={go}>{c.cta}<span>↗</span></button>
        </div>
        <div className="v8-hero-media" aria-hidden="true"><div className="v8-media v8-media-hero"/></div>
        <div className="v8-proofline">{c.proof.map((item,i)=><span key={item}><b>0{i+1}</b>{item}</span>)}</div>
        <div className="v8-index">01 / 03</div>
      </div>
    </section>

    <section className="v8-scene v8-services" data-v8="services">
      <div className="v8-sticky">
        <div className="v8-services-copy">
          <span className="v8-overline dark">{c.servicesK}</span>
          <h2>{c.servicesA}<br/><em>{c.servicesB}</em></h2>
          <div className="v8-service-list">{c.services.map((item,i)=><div key={item} data-service={i}><span>0{i+1}</span><strong>{item}</strong></div>)}</div>
        </div>
        <div className="v8-services-media" aria-hidden="true"><div className="v8-media v8-media-services"/></div>
        <div className="v8-index dark">02 / 03</div>
      </div>
    </section>

    <section className="v8-scene v8-route" data-v8="route">
      <div className="v8-sticky">
        <div className="v8-route-visual" aria-hidden="true">
          <svg viewBox="0 0 900 620"><path className="v8-road-base" d="M82 465 C210 280 318 505 442 330 S666 152 816 250"/><path className="v8-road-live" d="M82 465 C210 280 318 505 442 330 S666 152 816 250"/><circle cx="82" cy="465" r="8"/><circle cx="816" cy="250" r="8"/></svg>
          <span className="v8-city a">HELSINKI</span><span className="v8-city b">ESPOO</span>
        </div>
        <div className="v8-route-copy">
          <span className="v8-overline">{c.routeK}</span>
          <h2>{c.routeA}<br/><em>{c.routeB}</em></h2>
          <p>{c.routeP}</p>
          <div className="v8-estimate">
            <div><small>{c.example}</small><span>{c.route}</span></div>
            <strong>{c.estimate}</strong>
            <div className="v8-meta">{c.meta.map(x=><i key={x}>{x}</i>)}</div>
          </div>
          <button onClick={go}>{c.cta}<span>↗</span></button>
        </div>
        <div className="v8-index">03 / 03</div>
      </div>
    </section>

    <div className="v8-calculator-lead"><span>MUUTTOBOTTI SMART ESTIMATE</span><h2>{c.calculatorLead}</h2></div>
  </div>;
}

function Trust({ locale }: { locale: Locale }) {
  const c = copy[locale];
  return <section className="v8-trust">
    <div><span>{c.trustK}</span><h2>{c.trustA}</h2></div>
    <div className="v8-trust-media" aria-hidden="true"><div className="v8-media v8-media-kit"/></div>
    <div className="v8-trust-points"><span>01 <b>Clear scope</b></span><span>02 <b>Right-size team</b></span><span>03 <b>One contact</b></span></div>
  </section>;
}

export default function V8StoryLayer() {
  const [locale,setLocale] = useState<Locale>("fi");
  const [intro,setIntro] = useState<HTMLElement|null>(null);
  const [outro,setOutro] = useState<HTMLElement|null>(null);

  useEffect(()=>{
    const shell=document.querySelector<HTMLElement>(".site-shell");
    const calculator=document.querySelector<HTMLElement>(".calculator-section");
    const booking=document.querySelector<HTMLElement>(".booking-section");
    const faq=document.querySelector<HTMLElement>(".faq-section");
    if(!shell||!calculator||!booking) return;
    shell.classList.add("mb-v8-enabled");
    let a=document.getElementById("mb-v8-intro-host");
    if(!a){a=document.createElement("div");a.id="mb-v8-intro-host";calculator.parentElement?.insertBefore(a,calculator);}
    let b=document.getElementById("mb-v8-outro-host");
    if(!b){b=document.createElement("div");b.id="mb-v8-outro-host";(faq??booking.nextElementSibling)?.parentElement?.insertBefore(b,faq??booking.nextElementSibling);}
    setIntro(a);setOutro(b);setLocale(detectLocale());
    const lang=document.querySelector(".language-wrap");
    const observer=new MutationObserver(()=>setLocale(detectLocale()));
    if(lang) observer.observe(lang,{subtree:true,childList:true,characterData:true,attributes:true});
    return()=>{observer.disconnect();shell.classList.remove("mb-v8-enabled");a?.remove();b?.remove();};
  },[]);

  return <>{intro&&createPortal(<Story locale={locale}/>,intro)}{outro&&createPortal(<Trust locale={locale}/>,outro)}</>;
}
