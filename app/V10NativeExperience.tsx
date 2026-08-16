"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";

type Locale = "fi" | "en" | "uk" | "ru";

const copy = {
  fi: {
    overline: "MUUTTOBOTTI / UUSIMAA · FINLAND",
    heroA: "Muutto voi olla",
    heroB: "yksinkertainen.",
    heroC: "Kun kaikki toimii yhdessä.",
    body: "Yksi tiimi, iso 13–15 m³ Crafter ja selkeä arvio ennen varausta. Muutto, kuljetus ja siivous ilman turhaa koordinointia.",
    cta: "Laske oma hinta",
    facts: ["1–2 muuttajaa", "Uusimaa → koko Suomi", "Varaus verkossa 24/7"],
    one: "Yksi kumppani. Koko päivä.",
    sentence: ["Me kannamme", "kuljetamme", "siivoamme", "ja kokoamme."],
    serviceBody: "Sinun ei tarvitse rakentaa muuttoa viidestä eri palvelusta. Me hoidamme sen yhtenä suunniteltuna kokonaisuutena.",
    services: ["Muutot", "Kuljetukset", "Siivous", "Ikkunanpesu", "Kalusteiden kasaus"],
    prepared: "Valmiina ennen ovikelloa",
    preparedA: "Me tulemme",
    preparedB: "valmiina.",
    preparedBody: "Suojaus, pakkaus, kiinnitys ja tarvittaessa siivous kulkevat samassa prosessissa.",
    estimateK: "MUUTTOBOTTI SMART ESTIMATE",
    estimateA: "Reitti sisään.",
    estimateB: "Selkeä arvio ulos.",
    estimateBody: "Kerro tärkeimmät tiedot muutostasi. Saat heti realistisen arvion ajasta, tiimistä ja hinnasta.",
    example: "Esimerkkimuutto",
    route: "Helsinki → Espoo",
    estimate: "~ 287 €",
    meta: ["55 m²", "18 km", "2 muuttajaa"],
    proofK: "Oikeita muuttoja. Selkeä palvelu.",
    proofA: "Yksi kumppani.",
    proofB: "Jokainen vaihe hallinnassa.",
    handoff: "Nyt tehdään siitä sinun muuttosi.",
  },
  en: {
    overline: "MUUTTOBOTTI / UUSIMAA · FINLAND",
    heroA: "Moving can feel",
    heroB: "simple.",
    heroC: "When everything works together.",
    body: "One team, a large 13–15 m³ Crafter and a clear estimate before booking. Moving, transport and cleaning without needless coordination.",
    cta: "Calculate my price",
    facts: ["1–2 movers", "Uusimaa → all Finland", "Online booking 24/7"],
    one: "One partner. The whole day.",
    sentence: ["We carry", "transport", "clean", "and assemble."],
    serviceBody: "You should not have to build your move from five separate services. We run it as one planned operation.",
    services: ["Moving", "Transport", "Cleaning", "Window cleaning", "Furniture assembly"],
    prepared: "Ready before the doorbell",
    preparedA: "We arrive",
    preparedB: "prepared.",
    preparedBody: "Protection, packing, securing and optional cleaning live in one process.",
    estimateK: "MUUTTOBOTTI SMART ESTIMATE",
    estimateA: "Route in.",
    estimateB: "Clear estimate out.",
    estimateBody: "Tell us the essentials. Get an immediate realistic estimate for time, team and price.",
    example: "Example move",
    route: "Helsinki → Espoo",
    estimate: "~ 287 €",
    meta: ["55 m²", "18 km", "2 movers"],
    proofK: "Real moves. Clear service.",
    proofA: "One partner.",
    proofB: "Every step under control.",
    handoff: "Now make it your move.",
  },
  uk: {
    overline: "MUUTTOBOTTI / UUSIMAA · FINLAND",
    heroA: "Переїзд може бути",
    heroB: "простим.",
    heroC: "Коли все працює разом.",
    body: "Одна команда, великий Crafter 13–15 м³ і зрозуміла оцінка до бронювання. Переїзд, перевезення та прибирання без зайвої координації.",
    cta: "Розрахувати мою ціну",
    facts: ["1–2 вантажники", "Uusimaa → вся Фінляндія", "Онлайн-бронювання 24/7"],
    one: "Один партнер. Весь день.",
    sentence: ["Ми переносимо", "перевозимо", "прибираємо", "і збираємо."],
    serviceBody: "Вам не потрібно складати переїзд із п’яти окремих послуг. Ми організовуємо його як один процес.",
    services: ["Переїзд", "Перевезення", "Прибирання", "Миття вікон", "Складання меблів"],
    prepared: "Готові ще до дзвінка у двері",
    preparedA: "Ми приїжджаємо",
    preparedB: "підготовленими.",
    preparedBody: "Захист, пакування, фіксація та за потреби прибирання — в одному процесі.",
    estimateK: "MUUTTOBOTTI SMART ESTIMATE",
    estimateA: "Маршрут на вході.",
    estimateB: "Зрозуміла оцінка на виході.",
    estimateBody: "Вкажіть головні дані. Одразу отримайте реалістичну оцінку часу, команди та ціни.",
    example: "Приклад переїзду",
    route: "Helsinki → Espoo",
    estimate: "~ 287 €",
    meta: ["55 м²", "18 км", "2 вантажники"],
    proofK: "Реальні переїзди. Зрозумілий сервіс.",
    proofA: "Один партнер.",
    proofB: "Кожен етап під контролем.",
    handoff: "Тепер зробимо це вашим переїздом.",
  },
  ru: {
    overline: "MUUTTOBOTTI / UUSIMAA · FINLAND",
    heroA: "Переезд может быть",
    heroB: "простым.",
    heroC: "Когда всё работает вместе.",
    body: "Одна команда, большой Crafter 13–15 м³ и понятная оценка до бронирования. Переезд, перевозка и уборка без лишней координации.",
    cta: "Рассчитать мою цену",
    facts: ["1–2 грузчика", "Uusimaa → вся Финляндия", "Онлайн-бронирование 24/7"],
    one: "Один партнёр. Весь день.",
    sentence: ["Мы переносим", "перевозим", "убираем", "и собираем."],
    serviceBody: "Вам не нужно собирать переезд из пяти отдельных услуг. Мы организуем его как один процесс.",
    services: ["Переезд", "Перевозка", "Уборка", "Мойка окон", "Сборка мебели"],
    prepared: "Готовы ещё до звонка в дверь",
    preparedA: "Мы приезжаем",
    preparedB: "подготовленными.",
    preparedBody: "Защита, упаковка, крепёж и при необходимости уборка — в одном процессе.",
    estimateK: "MUUTTOBOTTI SMART ESTIMATE",
    estimateA: "Маршрут на входе.",
    estimateB: "Понятная оценка на выходе.",
    estimateBody: "Укажите главное. Сразу получите реалистичную оценку времени, команды и цены.",
    example: "Пример переезда",
    route: "Helsinki → Espoo",
    estimate: "~ 287 €",
    meta: ["55 м²", "18 км", "2 грузчика"],
    proofK: "Реальные переезды. Понятный сервис.",
    proofA: "Один партнёр.",
    proofB: "Каждый этап под контролем.",
    handoff: "Теперь сделаем это вашим переездом.",
  },
} as const;

function detectLocale(): Locale {
  if (typeof window === "undefined") return "fi";
  const query = new URLSearchParams(window.location.search).get("lang");
  if (query === "ru" || query === "uk" || query === "en" || query === "fi") return query;
  const label = document.querySelector<HTMLElement>(".lang-button")?.textContent ?? "";
  if (label.includes("🇷🇺")) return "ru";
  if (label.includes("🇺🇦")) return "uk";
  if (label.includes("🇬🇧") || label.includes("🇺🇸")) return "en";
  return "fi";
}

const reveal = { hidden: { opacity: 0, y: 36 }, visible: { opacity: 1, y: 0 } };

function Visual({ slice, className = "" }: { slice: "hero" | "layers" | "kit" | "services"; className?: string }) {
  return <span className={`v10-visual v10-visual-${slice} ${className}`} aria-hidden="true"><i /></span>;
}

export default function V10NativeExperience() {
  const [locale, setLocale] = useState<Locale>("fi");
  const heroRef = useRef<HTMLElement | null>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const photoY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 42]);
  const photoScale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 1.035]);
  const copyY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -28]);

  useEffect(() => {
    const read = () => setLocale(detectLocale());
    read();
    const wrap = document.querySelector(".language-wrap");
    const observer = new MutationObserver(read);
    if (wrap) observer.observe(wrap, { subtree: true, childList: true, characterData: true, attributes: true });
    window.addEventListener("popstate", read);
    return () => { observer.disconnect(); window.removeEventListener("popstate", read); };
  }, []);

  const c = copy[locale];
  const goToCalculator = () => document.getElementById("calculator")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });

  return (
    <div className="mb-v10-native">
      <section id="home" ref={heroRef} className="v10-hero">
        <div className="v10-shell">
          <motion.span className="v10-kicker" initial="hidden" animate="visible" variants={reveal} transition={{ duration: .55 }}>{c.overline}</motion.span>
          <motion.div className="v10-hero-copy" style={{ y: copyY }}>
            <h1><span>{c.heroA}</span><motion.span className="v10-inline-photo" style={{ y: photoY, scale: photoScale }}><Visual slice="hero" /></motion.span><em>{c.heroB}</em></h1>
            <h2>{c.heroC}</h2>
            <div className="v10-hero-bottom"><p>{c.body}</p><button onClick={goToCalculator}>{c.cta}<span>↗</span></button></div>
          </motion.div>
          <div className="v10-facts">{c.facts.map((fact, index) => <span key={fact}><i>0{index + 1}</i>{fact}</span>)}</div>
        </div>
      </section>

      <motion.section id="services" className="v10-services" initial="hidden" whileInView="visible" viewport={{ once: true, amount: .18 }} variants={reveal} transition={{ duration: .7 }}>
        <div className="v10-shell">
          <span className="v10-kicker dark">{c.one}</span>
          <div className="v10-sentence"><span>{c.sentence[0]}</span><Visual slice="layers" className="short" /><span>{c.sentence[1]}</span><span>{c.sentence[2]}</span><Visual slice="kit" className="tiny" /><span>{c.sentence[3]}</span></div>
          <div className="v10-services-foot"><p>{c.serviceBody}</p><div className="v10-service-list">{c.services.map((service, index) => <div key={service}><i>0{index + 1}</i><strong>{service}</strong><span>↗</span></div>)}</div></div>
        </div>
      </motion.section>

      <section id="process" className="v10-prepared">
        <div className="v10-shell">
          <motion.div initial={{ opacity: 0, x: -28 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: .3 }} transition={{ duration: .65 }}>
            <span className="v10-kicker dark">{c.prepared}</span>
            <h2>{c.preparedA} <Visual slice="kit" className="wide" /> <em>{c.preparedB}</em></h2>
            <p>{c.preparedBody}</p>
          </motion.div>
        </div>
      </section>

      <section className="v10-route">
        <div className="v10-shell v10-route-grid">
          <motion.div className="v10-route-copy" initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .3 }} transition={{ duration: .65 }}>
            <span className="v10-kicker">{c.estimateK}</span>
            <h2>{c.estimateA}<br/><em>{c.estimateB}</em></h2>
            <p>{c.estimateBody}</p>
            <button onClick={goToCalculator}>{c.cta}<span>↗</span></button>
          </motion.div>
          <motion.div className="v10-route-board" initial={{ opacity: 0, scale: .965 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, amount: .35 }} transition={{ duration: .7 }}>
            <div className="v10-route-head"><span>{c.example}</span><strong>{c.route}</strong></div>
            <svg viewBox="0 0 760 270" aria-hidden="true"><path className="v10-route-base" d="M44 190 C155 64 264 236 370 145 S580 72 716 124"/><motion.path className="v10-route-live" d="M44 190 C155 64 264 236 370 145 S580 72 716 124" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true, amount: .5 }} transition={{ duration: 1.35, ease: "easeInOut" }}/><circle cx="44" cy="190" r="6"/><circle cx="716" cy="124" r="6"/></svg>
            <div className="v10-price"><div>{c.meta.map(item => <span key={item}>{item}</span>)}</div><strong>{c.estimate}</strong></div>
          </motion.div>
        </div>
      </section>

      <section id="reviews" className="v10-proof">
        <div className="v10-shell">
          <span className="v10-kicker dark">{c.proofK}</span>
          <div className="v10-proof-grid"><h2>{c.proofA}<br/><em>{c.proofB}</em></h2><motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .35 }} transition={{ duration: .7 }}><Visual slice="services" className="proof" /></motion.div></div>
        </div>
      </section>

      <section className="v10-handoff"><div className="v10-shell"><span>{c.estimateK}</span><h2>{c.handoff}</h2></div></section>
    </div>
  );
}
