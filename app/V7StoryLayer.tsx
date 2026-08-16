"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type Locale = "fi" | "en" | "uk" | "ru";

const text = {
  fi: {
    eyebrow: "MUUTTOBOTTI · UUSIMAA / FINLAND",
    heroA: "MUUTTO.", heroB: "ILMAN KAAOSTA.", heroP: "Iso auto, oikea tiimi ja selkeä hinta. Yksi liike — koko muutto hallinnassa.", heroCta: "LASKE HINTA",
    explodedK: "02 / UNPACK THE MOVE", explodedA: "YKSI TIIMI.", explodedB: "KOKO MUUTTO.", explodedP: "Muutto, kuljetus, siivous, ikkunat ja kasaus eivät ole erillisiä ongelmia. Ne ovat yksi palveluvirta.",
    routeK: "03 / SMART ROUTE", routeA: "REITTI SISÄÄN.", routeB: "HINTA ULOS.", routeP: "Kerro meille oma muuttosi. Muuttobotti Smart Estimate rakentaa heti arvion ja sopivan tiimin.", routeCta: "LASKE MINUN MUUTTONI",
    example: "ESIMERKKIARVIO", plan: "55 m² · 18 km · 2 muuttajaa", move: "Muutto", transport: "Kuljetus", cleaning: "Siivous", windows: "Ikkunat", assembly: "Kasaus",
    preparedK: "MUUTTOBOTTI MOVE KIT", preparedA: "ME TULEMME VALMIINA.", preparedP: "Suojaus, pakkaus, kiinnitys ja siivous kulkevat mukana — palvelu tuntuu tuotteelta, ei satunnaiselta tuntityöltä.",
    reviewK: "OIKEITA MUUTTOJA · OIKEAA LUOTTAMUSTA",
  },
  en: {
    eyebrow: "MUUTTOBOTTI · UUSIMAA / FINLAND",
    heroA: "MOVE.", heroB: "NO CHAOS.", heroP: "The right van, the right team and a clear price. One flow from start to finish.", heroCta: "CALCULATE PRICE",
    explodedK: "02 / UNPACK THE MOVE", explodedA: "ONE TEAM.", explodedB: "THE WHOLE MOVE.", explodedP: "Moving, transport, cleaning, windows and assembly are not separate problems. They are one service flow.",
    routeK: "03 / SMART ROUTE", routeA: "ROUTE IN.", routeB: "PRICE OUT.", routeP: "Tell us about your move. Muuttobotti Smart Estimate instantly builds an estimate and the right team.", routeCta: "CALCULATE MY MOVE",
    example: "EXAMPLE ESTIMATE", plan: "55 m² · 18 km · 2 movers", move: "Moving", transport: "Transport", cleaning: "Cleaning", windows: "Windows", assembly: "Assembly",
    preparedK: "MUUTTOBOTTI MOVE KIT", preparedA: "WE COME PREPARED.", preparedP: "Protection, packing, securing and cleaning travel with us — a productized service, not random hourly work.",
    reviewK: "REAL MOVES · REAL TRUST",
  },
  uk: {
    eyebrow: "MUUTTOBOTTI · UUSIMAA / FINLAND",
    heroA: "ПЕРЕЇЗД.", heroB: "БЕЗ ХАОСУ.", heroP: "Правильний фургон, команда та зрозуміла ціна. Один потік від початку до кінця.", heroCta: "РОЗРАХУВАТИ ЦІНУ",
    explodedK: "02 / UNPACK THE MOVE", explodedA: "ОДНА КОМАНДА.", explodedB: "ВЕСЬ ПЕРЕЇЗД.", explodedP: "Переїзд, перевезення, прибирання, вікна та складання — це один сервісний потік.",
    routeK: "03 / SMART ROUTE", routeA: "МАРШРУТ ВХІД.", routeB: "ЦІНА ВИХІД.", routeP: "Розкажіть про свій переїзд. Smart Estimate одразу підбере оцінку й команду.", routeCta: "РОЗРАХУВАТИ МІЙ ПЕРЕЇЗД",
    example: "ПРИКЛАД ОЦІНКИ", plan: "55 м² · 18 км · 2 вантажники", move: "Переїзд", transport: "Перевезення", cleaning: "Прибирання", windows: "Вікна", assembly: "Складання",
    preparedK: "MUUTTOBOTTI MOVE KIT", preparedA: "МИ ПРИЇЖДЖАЄМО ГОТОВІ.", preparedP: "Захист, пакування, фіксація й прибирання їдуть разом з нами.",
    reviewK: "РЕАЛЬНІ ПЕРЕЇЗДИ · РЕАЛЬНА ДОВІРА",
  },
  ru: {
    eyebrow: "MUUTTOBOTTI · UUSIMAA / FINLAND",
    heroA: "ПЕРЕЕЗД.", heroB: "БЕЗ ХАОСА.", heroP: "Правильный фургон, команда и понятная цена. Один поток от начала до конца.", heroCta: "РАССЧИТАТЬ ЦЕНУ",
    explodedK: "02 / UNPACK THE MOVE", explodedA: "ОДНА КОМАНДА.", explodedB: "ВЕСЬ ПЕРЕЕЗД.", explodedP: "Переезд, перевозка, уборка, окна и сборка — не отдельные проблемы, а один сервисный поток.",
    routeK: "03 / SMART ROUTE", routeA: "МАРШРУТ ВХОД.", routeB: "ЦЕНА ВЫХОД.", routeP: "Расскажите о своём переезде. Smart Estimate сразу соберёт оценку и подходящую команду.", routeCta: "РАССЧИТАТЬ МОЙ ПЕРЕЕЗД",
    example: "ПРИМЕР РАСЧЁТА", plan: "55 м² · 18 км · 2 грузчика", move: "Переезд", transport: "Перевозка", cleaning: "Уборка", windows: "Окна", assembly: "Сборка",
    preparedK: "MUUTTOBOTTI MOVE KIT", preparedA: "МЫ ПРИЕЗЖАЕМ ГОТОВЫМИ.", preparedP: "Защита, упаковка, крепёж и уборка едут вместе с нами — сервис ощущается как продукт.",
    reviewK: "РЕАЛЬНЫЕ ПЕРЕЕЗДЫ · РЕАЛЬНОЕ ДОВЕРИЕ",
  },
} as const;

function localeFromButton(button: HTMLElement | null): Locale {
  const value = button?.textContent ?? "";
  if (value.includes("🇷🇺")) return "ru";
  if (value.includes("🇺🇦")) return "uk";
  if (value.includes("🇬🇧") || value.includes("🇺🇸")) return "en";
  return "fi";
}

function clamp(value: number) { return Math.max(0, Math.min(1, value)); }
function progress(el: HTMLElement) {
  const r = el.getBoundingClientRect();
  return clamp((-r.top) / Math.max(1, r.height - window.innerHeight));
}

function VanScene() {
  return <svg className="v7-van-svg" viewBox="0 0 1200 900" aria-hidden="true">
    <defs>
      <linearGradient id="v7van" x1="350" y1="330" x2="900" y2="690" gradientUnits="userSpaceOnUse"><stop stopColor="#fbfcf7"/><stop offset="1" stopColor="#dce8df"/></linearGradient>
      <linearGradient id="v7glass" x1="700" y1="345" x2="820" y2="490" gradientUnits="userSpaceOnUse"><stop stopColor="#bfe1db"/><stop offset="1" stopColor="#6e9290"/></linearGradient>
      <filter id="v7shadow" x="80" y="120" width="1040" height="720"><feDropShadow dx="0" dy="35" stdDeviation="26" floodColor="#000" floodOpacity=".44"/></filter>
    </defs>
    <g className="v7-route-lines" fill="none" stroke="#c8ff65" strokeWidth="3" strokeDasharray="10 14" opacity=".7"><path d="M135 238 C318 238 360 330 458 380"/><path d="M1050 255 C910 270 850 340 790 395"/></g>
    <g className="v7-van" filter="url(#v7shadow)">
      <ellipse cx="640" cy="716" rx="380" ry="50" fill="#02090b" opacity=".46"/>
      <path d="M340 402C340 368 367 341 401 341H704C741 341 775 362 793 394L868 528C879 548 885 571 885 594V638H323V419C323 410 330 402 340 402Z" fill="url(#v7van)"/>
      <path d="M693 366H731C753 366 773 378 783 397L835 489H693V366Z" fill="url(#v7glass)"/>
      <rect x="377" y="384" width="268" height="151" rx="6" fill="#edf3ed"/><rect x="392" y="404" width="235" height="108" rx="4" fill="#071b22"/>
      <rect x="411" y="422" width="197" height="72" rx="3" fill="#c8ff65"/><text x="509" y="465" textAnchor="middle" fontSize="31" fontWeight="900" fill="#071b22">MUUTTOBOTTI</text>
      <rect x="664" y="365" width="22" height="235" fill="#c7d5cd"/><rect x="331" y="601" width="554" height="38" rx="18" fill="#d6e2da"/>
      <circle cx="452" cy="637" r="63" fill="#071b22"/><circle cx="452" cy="637" r="31" fill="#d6e2da"/><circle cx="783" cy="637" r="63" fill="#071b22"/><circle cx="783" cy="637" r="31" fill="#d6e2da"/>
    </g>
    <g className="v7-box v7-box-a" transform="translate(130 135) rotate(-8 100 80)"><rect x="0" y="0" width="190" height="135" rx="18" fill="#ead7b9"/><path d="M0 44H190M95 0V135" stroke="#b89569" strokeWidth="4"/><rect x="51" y="-16" width="88" height="28" rx="9" fill="#c8ff65"/></g>
    <g className="v7-box v7-box-b" transform="translate(900 120) rotate(10 80 65)"><rect x="0" y="0" width="160" height="116" rx="18" fill="#d7e9e2"/><path d="M0 40H160M80 0V116" stroke="#8cb2a8" strokeWidth="4"/><circle cx="80" cy="60" r="18" fill="#c8ff65"/></g>
    <g className="v7-box v7-box-c" transform="translate(930 470) rotate(8 70 55)"><rect x="0" y="0" width="145" height="105" rx="17" fill="#ead7b9"/><path d="M0 38H145M72 0V105" stroke="#b89569" strokeWidth="4"/></g>
  </svg>;
}

function Story({ locale }: { locale: Locale }) {
  const c = text[locale];
  const goCalc = () => document.getElementById("calculator")?.scrollIntoView({ behavior: "smooth" });
  return <div className="mb-v7-story" aria-label="Muuttobotti cinematic introduction">
    <section className="v7-chapter v7-hook" data-v7-chapter="hook"><div className="v7-stage">
      <div className="v7-ambient v7-ambient-hero"/><div className="v7-copy"><div className="v7-kicker">01 / {c.eyebrow}</div><h1>{c.heroA}<br/><em>{c.heroB}</em></h1><p>{c.heroP}</p><button onClick={goCalc}>{c.heroCta}<span>→</span></button></div><div className="v7-object"><VanScene/></div><div className="v7-scroll-hint">SCROLL <i/></div>
    </div></section>

    <section className="v7-chapter v7-exploded" data-v7-chapter="services"><div className="v7-stage">
      <div className="v7-copy"><div className="v7-kicker">{c.explodedK}</div><h2>{c.explodedA}<br/><em>{c.explodedB}</em></h2><p>{c.explodedP}</p></div>
      <div className="v7-service-stack" aria-hidden="true">
        {[c.move,c.transport,c.cleaning,c.windows,c.assembly].map((item,i)=><article key={item} className={`v7-service-card s${i+1}`}><span>0{i+1}</span><strong>{item}</strong><small>{["13–15 m³","Uusimaa → Finland","32,90 € / h","Clear finish","One team"][i]}</small></article>)}
        <div className="v7-orbit orbit-a"/><div className="v7-orbit orbit-b"/><div className="v7-orbit orbit-c"/>
      </div>
    </div></section>

    <section className="v7-chapter v7-route" data-v7-chapter="route"><div className="v7-stage">
      <div className="v7-route-map" aria-hidden="true"><svg viewBox="0 0 1000 520"><path className="v7-route-base" d="M95 365 C230 145 405 440 535 250 S795 120 920 235"/><path className="v7-route-live" d="M95 365 C230 145 405 440 535 250 S795 120 920 235"/><circle className="v7-dot start" cx="95" cy="365" r="12"/><circle className="v7-dot end" cx="920" cy="235" r="12"/></svg><b className="v7-city city-a">HELSINKI</b><b className="v7-city city-b">ESPOO</b><div className="v7-route-van">▰</div></div>
      <div className="v7-copy"><div className="v7-kicker">{c.routeK}</div><h2>{c.routeA}<br/><em>{c.routeB}</em></h2><p>{c.routeP}</p><button onClick={goCalc}>{c.routeCta}<span>→</span></button></div>
      <div className="v7-price-card"><small>{c.example}</small><strong>~ 287 €</strong><span>{c.plan}</span><div><i>55 m²</i><i>18 km</i><i>2×</i></div></div>
    </div></section>
  </div>;
}

function Outro({ locale }: { locale: Locale }) {
  const c = text[locale];
  return <div className="mb-v7-outro">
    <section className="v7-prepared"><div className="v7-prepared-visual"/><div><span>{c.preparedK}</span><h2>{c.preparedA}</h2><p>{c.preparedP}</p></div></section>
    <section className="v7-proof"><span>{c.reviewK}</span><div>{[
      ["Anna K.","Espoo","★★★★★","Careful, fast and easy from start to finish."],
      ["Mikko P.","Helsinki","★★★★★","Clear estimate and no surprises on moving day."],
      ["Olena S.","Vantaa","★★★★★","Всё аккуратно перевезли и собрали на новом месте."],
    ].map(([name,city,stars,quote])=><article key={name}><div><b>{name}</b><small>{city}</small></div><strong>{stars}</strong><p>{quote}</p></article>)}</div></section>
  </div>;
}

export default function V7StoryLayer() {
  const [introHost, setIntroHost] = useState<HTMLElement | null>(null);
  const [outroHost, setOutroHost] = useState<HTMLElement | null>(null);
  const [locale, setLocale] = useState<Locale>("fi");

  useEffect(() => {
    const shell = document.querySelector<HTMLElement>(".site-shell");
    const hero = shell?.querySelector<HTMLElement>(".hero") ?? null;
    const booking = shell?.querySelector<HTMLElement>(".booking-section") ?? null;
    if (!shell || !hero || !booking) return;

    shell.classList.add("mb-v7-enabled");
    const intro = document.createElement("div"); intro.id = "mb-v7-intro-host"; shell.insertBefore(intro, hero); setIntroHost(intro);
    const outro = document.createElement("div"); outro.id = "mb-v7-outro-host"; booking.insertAdjacentElement("afterend", outro); setOutroHost(outro);

    const lang = shell.querySelector<HTMLElement>(".lang-button");
    const readLocale = () => setLocale(localeFromButton(lang));
    readLocale();
    const localeObserver = lang ? new MutationObserver(readLocale) : null;
    localeObserver?.observe(lang!, { subtree: true, childList: true, characterData: true });

    let raf = 0;
    const draw = () => {
      raf = 0;
      intro.querySelectorAll<HTMLElement>("[data-v7-chapter]").forEach(chapter => {
        chapter.style.setProperty("--p", progress(chapter).toFixed(4));
      });
    };
    const queue = () => { if (!raf) raf = requestAnimationFrame(draw); };
    window.addEventListener("scroll", queue, { passive: true }); window.addEventListener("resize", queue); draw();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", queue); window.removeEventListener("resize", queue); localeObserver?.disconnect();
      shell.classList.remove("mb-v7-enabled"); intro.remove(); outro.remove();
    };
  }, []);

  return <>{introHost && createPortal(<Story locale={locale}/>, introHost)}{outroHost && createPortal(<Outro locale={locale}/>, outroHost)}</>;
}
