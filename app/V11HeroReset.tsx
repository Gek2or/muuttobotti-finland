"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";

type Locale = "fi" | "en" | "uk" | "ru";

const ease = [0.22, 1, 0.36, 1] as const;
const localeOrder: Locale[] = ["fi", "en", "uk", "ru"];
const localeLabel: Record<Locale, string> = { fi: "FI", en: "EN", uk: "UA", ru: "RU" };

const copy = {
  fi: {
    nav: ["Palvelut", "Hinta", "Yhteys"],
    kicker: "MUUTTOBOTTI / UUSIMAA · KOKO SUOMI",
    hero: ["MUUTTO.", "ILMAN", "KAAOSTA."],
    heroSub: "Yksi tiimi. Koko muutto.",
    heroBody: "Muutot, kuljetukset ja siivous yhdellä suunnitelmalla. Selkeä arvio ennen varausta — ilman viiden eri palvelun koordinointia.",
    cta: "LASKE HINTA",
    specs: ["1 muuttaja · 60 €/h", "2 muuttajaa · 75 €/h", "Crafter · 13–15 m³", "2 h minimiveloitus"],
    storyK: "ONE TEAM / ONE FLOW",
    storyTitle: "Yksi kumppani. Koko muutto.",
    storyBody: "Kantaminen, kuljetus, siivous ja kalusteiden kasaus eivät ole erillisiä kortteja. Ne ovat saman päivän yksi hallittu prosessi.",
    lanes: ["KANNAMME.", "KULJETAMME.", "SIIVOAMME.", "KOKOAMME."],
    laneMeta: ["MOVING", "TRANSPORT", "CLEANING", "ASSEMBLY"],
    bridgeK: "MUUTTOBOTTI SMART ESTIMATE",
    bridgeTitleA: "REITTI SISÄÄN.",
    bridgeTitleB: "ARVIO ULOS.",
    bridgeBody: "Anna tärkeimmät tiedot muutostasi. Saat heti arvion ajasta, tiimistä ja hinnasta — ja jatkat samasta suunnitelmasta varaukseen.",
    example: "ESIMERKKIMUUTTO",
    route: "HELSINKI → ESPOO",
    chips: ["55 m²", "18 km", "2 muuttajaa"],
    price: "~ 287 €",
    bridgeCta: "LASKE OMA MUUTTO",
  },
  en: {
    nav: ["Services", "Estimate", "Contact"],
    kicker: "MUUTTOBOTTI / UUSIMAA · ALL FINLAND",
    hero: ["MOVE.", "WITHOUT", "CHAOS."],
    heroSub: "One team. The whole move.",
    heroBody: "Moving, transport and cleaning through one plan. A clear estimate before booking — without coordinating five separate services.",
    cta: "CALCULATE PRICE",
    specs: ["1 mover · 60 €/h", "2 movers · 75 €/h", "Crafter · 13–15 m³", "2 h minimum"],
    storyK: "ONE TEAM / ONE FLOW",
    storyTitle: "One partner. The whole move.",
    storyBody: "Carrying, transport, cleaning and assembly are not separate cards. They are one controlled operation across the same day.",
    lanes: ["WE CARRY.", "WE DRIVE.", "WE CLEAN.", "WE ASSEMBLE."],
    laneMeta: ["MOVING", "TRANSPORT", "CLEANING", "ASSEMBLY"],
    bridgeK: "MUUTTOBOTTI SMART ESTIMATE",
    bridgeTitleA: "ROUTE IN.",
    bridgeTitleB: "ESTIMATE OUT.",
    bridgeBody: "Tell us the essentials. Get an immediate estimate for time, team and price, then continue from the same plan into booking.",
    example: "EXAMPLE MOVE",
    route: "HELSINKI → ESPOO",
    chips: ["55 m²", "18 km", "2 movers"],
    price: "~ 287 €",
    bridgeCta: "CALCULATE MY MOVE",
  },
  uk: {
    nav: ["Послуги", "Розрахунок", "Контакти"],
    kicker: "MUUTTOBOTTI / UUSIMAA · ВСЯ ФІНЛЯНДІЯ",
    hero: ["ПЕРЕЇЗД.", "БЕЗ", "ХАОСУ."],
    heroSub: "Одна команда. Весь переїзд.",
    heroBody: "Переїзд, перевезення та прибирання в одному плані. Зрозуміла оцінка до бронювання — без координації п’яти окремих сервісів.",
    cta: "РОЗРАХУВАТИ ЦІНУ",
    specs: ["1 вантажник · 60 €/h", "2 вантажники · 75 €/h", "Crafter · 13–15 м³", "мінімум 2 години"],
    storyK: "ONE TEAM / ONE FLOW",
    storyTitle: "Один партнер. Весь переїзд.",
    storyBody: "Перенесення, транспорт, прибирання та складання меблів — не окремі картки. Це один керований процес протягом дня.",
    lanes: ["НЕСЕМО.", "ПЕРЕВОЗИМО.", "ПРИБИРАЄМО.", "ЗБИРАЄМО."],
    laneMeta: ["MOVING", "TRANSPORT", "CLEANING", "ASSEMBLY"],
    bridgeK: "MUUTTOBOTTI SMART ESTIMATE",
    bridgeTitleA: "МАРШРУТ НА ВХОДІ.",
    bridgeTitleB: "ОЦІНКА НА ВИХОДІ.",
    bridgeBody: "Вкажіть головні параметри. Одразу отримайте оцінку часу, команди й ціни та переходьте з того ж плану до бронювання.",
    example: "ПРИКЛАД ПЕРЕЇЗДУ",
    route: "HELSINKI → ESPOO",
    chips: ["55 м²", "18 км", "2 вантажники"],
    price: "~ 287 €",
    bridgeCta: "РОЗРАХУВАТИ МІЙ ПЕРЕЇЗД",
  },
  ru: {
    nav: ["Услуги", "Расчёт", "Контакты"],
    kicker: "MUUTTOBOTTI / UUSIMAA · ВСЯ ФИНЛЯНДИЯ",
    hero: ["ПЕРЕЕЗД.", "БЕЗ", "ХАОСА."],
    heroSub: "Одна команда. Весь переезд.",
    heroBody: "Переезд, перевозка и уборка в одном плане. Понятная оценка до бронирования — без координации пяти отдельных сервисов.",
    cta: "РАССЧИТАТЬ ЦЕНУ",
    specs: ["1 грузчик · 60 €/h", "2 грузчика · 75 €/h", "Crafter · 13–15 м³", "минимум 2 часа"],
    storyK: "ONE TEAM / ONE FLOW",
    storyTitle: "Один партнёр. Весь переезд.",
    storyBody: "Перенос, транспорт, уборка и сборка мебели — не отдельные карточки. Это один управляемый процесс в течение дня.",
    lanes: ["НЕСЁМ.", "ПЕРЕВОЗИМ.", "УБИРАЕМ.", "СОБИРАЕМ."],
    laneMeta: ["MOVING", "TRANSPORT", "CLEANING", "ASSEMBLY"],
    bridgeK: "MUUTTOBOTTI SMART ESTIMATE",
    bridgeTitleA: "МАРШРУТ НА ВХОДЕ.",
    bridgeTitleB: "ОЦЕНКА НА ВЫХОДЕ.",
    bridgeBody: "Укажите главные параметры. Сразу получите оценку времени, команды и цены и переходите из того же плана к бронированию.",
    example: "ПРИМЕР ПЕРЕЕЗДА",
    route: "HELSINKI → ESPOO",
    chips: ["55 м²", "18 км", "2 грузчика"],
    price: "~ 287 €",
    bridgeCta: "РАССЧИТАТЬ МОЙ ПЕРЕЕЗД",
  },
} as const;

function initialLocale(): Locale {
  if (typeof window === "undefined") return "fi";
  const lang = new URLSearchParams(window.location.search).get("lang");
  return lang === "en" || lang === "uk" || lang === "ru" ? lang : "fi";
}

export default function V11HeroReset() {
  const [locale, setLocaleState] = useState<Locale>("fi");
  const heroRef = useRef<HTMLElement | null>(null);
  const storyRef = useRef<HTMLElement | null>(null);
  const reduce = useReducedMotion();

  useEffect(() => setLocaleState(initialLocale()), []);

  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroSmooth = useSpring(heroProgress, { stiffness: 85, damping: 26, mass: 0.32 });
  const heroImageY = useTransform(heroSmooth, [0, 1], [0, reduce ? 0 : 64]);
  const heroImageScale = useTransform(heroSmooth, [0, 1], [1, reduce ? 1 : 1.055]);
  const heroCopyY = useTransform(heroSmooth, [0, 1], [0, reduce ? 0 : -44]);
  const heroFade = useTransform(heroSmooth, [0, 0.76, 1], [1, 1, reduce ? 1 : 0.42]);

  const { scrollYProgress: storyProgress } = useScroll({ target: storyRef, offset: ["start start", "end end"] });
  const storySmooth = useSpring(storyProgress, { stiffness: 72, damping: 25, mass: 0.42 });
  const laneA = useTransform(storySmooth, [0, 1], [0, reduce ? 0 : -120]);
  const laneB = useTransform(storySmooth, [0, 1], [reduce ? 0 : -92, reduce ? 0 : 78]);
  const laneC = useTransform(storySmooth, [0, 1], [reduce ? 0 : 46, reduce ? 0 : -96]);
  const laneD = useTransform(storySmooth, [0, 1], [reduce ? 0 : -64, reduce ? 0 : 38]);

  const c = copy[locale];

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });

  const setLocale = (next: Locale) => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (next === "fi") url.searchParams.delete("lang"); else url.searchParams.set("lang", next);
    window.location.assign(url.toString());
  };

  const cycleLocale = () => {
    const index = localeOrder.indexOf(locale);
    setLocale(localeOrder[(index + 1) % localeOrder.length]);
  };

  return (
    <div className="p12-reset">
      <header className="p12-header">
        <button className="p12-brand" onClick={() => go("home")} aria-label="Muuttobotti home">
          <span className="p12-brand-mark">M</span>
          <span>muutto<b>botti</b></span>
        </button>
        <nav className="p12-nav" aria-label="Primary navigation">
          <button onClick={() => go("services")}>{c.nav[0]}</button>
          <button onClick={() => go("calculator")}>{c.nav[1]}</button>
          <button onClick={() => go("contact")}>{c.nav[2]}</button>
        </nav>
        <div className="p12-header-actions">
          <div className="p12-lang-desktop" aria-label="Language">
            {localeOrder.map(item => <button key={item} className={item === locale ? "active" : ""} onClick={() => setLocale(item)}>{localeLabel[item]}</button>)}
          </div>
          <button className="p12-lang-mobile" onClick={cycleLocale} aria-label="Change language">{localeLabel[locale]}</button>
          <button className="p12-header-cta" onClick={() => go("calculator")}><span>{c.cta}</span><i>↘</i></button>
        </div>
      </header>

      <section id="home" ref={heroRef} className="p12-hero">
        <motion.div className="p12-hero-photo" style={{ y: heroImageY, scale: heroImageScale }} aria-hidden="true">
          <img src="/muuttobotti-hero.png" alt="" />
        </motion.div>
        <div className="p12-hero-shade" aria-hidden="true" />
        <motion.div className="p12-shell p12-hero-shell" style={{ opacity: heroFade }}>
          <motion.div className="p12-hero-copy" style={{ y: heroCopyY }}>
            <motion.span className="p12-kicker" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .65, ease }}>{c.kicker}</motion.span>
            <h1 aria-label={c.hero.join(" ")}>
              {c.hero.map((line, index) => (
                <motion.span
                  key={line}
                  className={index === 1 ? "accent" : ""}
                  initial={{ opacity: 0, y: 54 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: .88, delay: .07 + index * .08, ease }}
                >{line}</motion.span>
              ))}
            </h1>
            <motion.div className="p12-hero-bottom" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .72, delay: .38, ease }}>
              <div><strong>{c.heroSub}</strong><p>{c.heroBody}</p></div>
              <button onClick={() => go("calculator")}>{c.cta}<span>↘</span></button>
            </motion.div>
          </motion.div>

          <motion.aside className="p12-spec-stack" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .72, delay: .48, ease }}>
            {c.specs.map((spec, index) => <span key={spec}><i>0{index + 1}</i>{spec}</span>)}
          </motion.aside>

          <div className="p12-hero-index"><span>01</span><i /><small>MUUTTOBOTTI</small></div>
        </motion.div>
      </section>

      <section id="services" ref={storyRef} className="p12-system">
        <div className="p12-system-sticky">
          <div className="p12-shell p12-system-shell">
            <div className="p12-system-intro">
              <span className="p12-kicker ink">{c.storyK}</span>
              <h2>{c.storyTitle}</h2>
              <p>{c.storyBody}</p>
            </div>

            <div className="p12-lanes" aria-label="Muuttobotti service flow">
              <motion.div className="p12-lane" style={{ x: laneA }}><b>{c.lanes[0]}</b><span className="p12-visual p12-visual-hero"/><i>{c.laneMeta[0]}</i></motion.div>
              <motion.div className="p12-lane reverse" style={{ x: laneB }}><i>{c.laneMeta[1]}</i><span className="p12-visual p12-visual-pack-hero"/><b>{c.lanes[1]}</b></motion.div>
              <motion.div className="p12-lane" style={{ x: laneC }}><b>{c.lanes[2]}</b><span className="p12-visual p12-visual-kit"/><i>{c.laneMeta[2]}</i></motion.div>
              <motion.div className="p12-lane reverse" style={{ x: laneD }}><i>{c.laneMeta[3]}</i><span className="p12-visual p12-visual-layers"/><b>{c.lanes[3]}</b></motion.div>
            </div>

            <div className="p12-system-proof">
              <span>60 € / h</span><span>75 € / h</span><span>13–15 m³</span><span>2 h min</span>
            </div>
          </div>
        </div>
      </section>

      <section id="process" className="p12-bridge">
        <div className="p12-shell p12-bridge-grid">
          <motion.div className="p12-bridge-copy" initial={{ opacity: 0, y: 34 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .3 }} transition={{ duration: .78, ease }}>
            <span className="p12-kicker">{c.bridgeK}</span>
            <h2>{c.bridgeTitleA}<br/><em>{c.bridgeTitleB}</em></h2>
            <p>{c.bridgeBody}</p>
            <button onClick={() => go("calculator")}>{c.bridgeCta}<span>↘</span></button>
          </motion.div>

          <motion.div className="p12-route-card" initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .35 }} transition={{ duration: .82, ease }}>
            <div className="p12-route-head"><span>{c.example}</span><strong>{c.route}</strong></div>
            <svg viewBox="0 0 760 260" aria-hidden="true">
              <path className="p12-route-base" d="M42 183 C150 61 267 225 372 139 S582 71 718 119" />
              <motion.path className="p12-route-live" d="M42 183 C150 61 267 225 372 139 S582 71 718 119" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true, amount: .55 }} transition={{ duration: 1.5, ease }} />
              <motion.circle cx="42" cy="183" r="7" initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ duration: .32, delay: .16 }} />
              <motion.circle cx="718" cy="119" r="7" initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ duration: .32, delay: 1.12 }} />
            </svg>
            <div className="p12-route-meta"><div>{c.chips.map(item => <span key={item}>{item}</span>)}</div><motion.strong initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: .58, delay: .48, ease }}>{c.price}</motion.strong></div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
