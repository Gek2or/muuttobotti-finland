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
type Slice = "hero" | "layers" | "kit" | "services";

const ease = [0.22, 1, 0.36, 1] as const;

const copy = {
  fi: {
    overline: "MUUTTOBOTTI / UUSIMAA · FINLAND",
    heroA: "Muutto voi olla",
    heroB: "yksinkertainen.",
    heroC: "Kun kaikki toimii yhdessä.",
    body: "Yksi tiimi, iso 13–15 m³ Crafter ja selkeä arvio ennen varausta. Muutto, kuljetus ja siivous ilman turhaa koordinointia.",
    cta: "Laske oma hinta",
    facts: ["1–2 muuttajaa", "Uusimaa → koko Suomi", "Varaus verkossa 24/7"],
    rail: ["Muutot", "Kuljetukset", "Siivous", "Ikkunanpesu", "Kalusteet"],
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
    proofK: "Selkeä alusta loppuun",
    proofA: "Ei yllätyksiä.",
    proofB: "Yksi hallittu prosessi.",
    proofBody: "Näet arvion ennen varausta, tiedät mitä palveluun kuuluu ja jatkat samasta suunnitelmasta suoraan varaukseen.",
    proofFacts: ["2 h minimiveloitus muuttopalvelussa", "13–15 m³ korkea Crafter", "Arvio ennen varauksen lähettämistä"],
    handoffK: "Sinun muuttosi",
    handoff: "Seuraavaksi lasketaan oikea suunnitelma.",
  },
  en: {
    overline: "MUUTTOBOTTI / UUSIMAA · FINLAND",
    heroA: "Moving can feel",
    heroB: "simple.",
    heroC: "When everything works together.",
    body: "One team, a large 13–15 m³ Crafter and a clear estimate before booking. Moving, transport and cleaning without needless coordination.",
    cta: "Calculate my price",
    facts: ["1–2 movers", "Uusimaa → all Finland", "Online booking 24/7"],
    rail: ["Moving", "Transport", "Cleaning", "Windows", "Assembly"],
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
    proofK: "Clear from start to finish",
    proofA: "No surprises.",
    proofB: "One controlled process.",
    proofBody: "See the estimate before booking, know what the service includes, then continue from the same plan directly into your request.",
    proofFacts: ["2 h minimum for moving service", "13–15 m³ high-roof Crafter", "Estimate before submitting your booking"],
    handoffK: "Your move",
    handoff: "Now we build the real plan.",
  },
  uk: {
    overline: "MUUTTOBOTTI / UUSIMAA · FINLAND",
    heroA: "Переїзд може бути",
    heroB: "простим.",
    heroC: "Коли все працює разом.",
    body: "Одна команда, великий Crafter 13–15 м³ і зрозуміла оцінка до бронювання. Переїзд, перевезення та прибирання без зайвої координації.",
    cta: "Розрахувати мою ціну",
    facts: ["1–2 вантажники", "Uusimaa → вся Фінляндія", "Онлайн-бронювання 24/7"],
    rail: ["Переїзд", "Перевезення", "Прибирання", "Вікна", "Меблі"],
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
    proofK: "Зрозуміло від початку до кінця",
    proofA: "Без сюрпризів.",
    proofB: "Один керований процес.",
    proofBody: "Ви бачите оцінку до бронювання, знаєте, що входить у послугу, і переходите з того ж плану прямо до заявки.",
    proofFacts: ["Мінімум 2 години для переїзду", "Crafter 13–15 м³ з високим дахом", "Оцінка до відправлення заявки"],
    handoffK: "Ваш переїзд",
    handoff: "Тепер створимо реальний план.",
  },
  ru: {
    overline: "MUUTTOBOTTI / UUSIMAA · FINLAND",
    heroA: "Переезд может быть",
    heroB: "простым.",
    heroC: "Когда всё работает вместе.",
    body: "Одна команда, большой Crafter 13–15 м³ и понятная оценка до бронирования. Переезд, перевозка и уборка без лишней координации.",
    cta: "Рассчитать мою цену",
    facts: ["1–2 грузчика", "Uusimaa → вся Финляндия", "Онлайн-бронирование 24/7"],
    rail: ["Переезд", "Перевозка", "Уборка", "Окна", "Мебель"],
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
    proofK: "Понятно от начала до конца",
    proofA: "Без сюрпризов.",
    proofB: "Один управляемый процесс.",
    proofBody: "Вы видите оценку до бронирования, знаете, что входит в услугу, и переходите из того же плана прямо к заявке.",
    proofFacts: ["Минимум 2 часа для переезда", "Crafter 13–15 м³ с высокой крышей", "Оценка до отправки заявки"],
    handoffK: "Ваш переезд",
    handoff: "Теперь создадим реальный план.",
  },
} as const;

function detectLocale(): Locale {
  if (typeof window === "undefined") return "fi";
  const query = new URLSearchParams(window.location.search).get("lang");
  if (query === "ru" || query === "uk" || query === "en" || query === "fi") return query;
  const label = document.querySelector<HTMLElement>(".lang-button")?.textContent ?? "";
  if (label.includes("RU")) return "ru";
  if (label.includes("UA")) return "uk";
  if (label.includes("EN")) return "en";
  return "fi";
}

function Media({ slice, className = "" }: { slice: Slice; className?: string }) {
  return (
    <motion.span
      className={`v11-media v11-media-${slice} ${className}`}
      aria-hidden="true"
      initial={{ clipPath: "inset(0 100% 0 0)" }}
      whileInView={{ clipPath: "inset(0 0% 0 0)" }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.9, ease }}
    >
      <span />
    </motion.span>
  );
}

export default function V11NativeExperience() {
  const [locale, setLocale] = useState<Locale>("fi");
  const heroRef = useRef<HTMLElement | null>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 90, damping: 28, mass: 0.35 });
  const headlineY = useTransform(smooth, [0, 1], [0, reduce ? 0 : -48]);
  const heroMediaY = useTransform(smooth, [0, 1], [0, reduce ? 0 : 56]);
  const heroMediaScale = useTransform(smooth, [0, 1], [1, reduce ? 1 : 1.06]);
  const heroOpacity = useTransform(smooth, [0, 0.82, 1], [1, 1, reduce ? 1 : 0.55]);
  const scrollCueOpacity = useTransform(smooth, [0, 0.25], [1, 0]);

  useEffect(() => {
    const read = () => setLocale(detectLocale());
    read();
    const wrap = document.querySelector(".language-wrap");
    const observer = new MutationObserver(read);
    if (wrap) observer.observe(wrap, { subtree: true, childList: true, characterData: true, attributes: true });
    window.addEventListener("popstate", read);
    return () => {
      observer.disconnect();
      window.removeEventListener("popstate", read);
    };
  }, []);

  const c = copy[locale];
  const goToCalculator = () => document.getElementById("calculator")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });

  return (
    <div className="mb-v11-native">
      <section id="home" ref={heroRef} className="v11-hero">
        <motion.div className="v11-shell v11-hero-shell" style={{ opacity: heroOpacity }}>
          <motion.span
            className="v11-kicker"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
          >
            {c.overline}
          </motion.span>

          <motion.div className="v11-hero-copy" style={{ y: headlineY }}>
            <h1>
              <motion.span initial={{ opacity: 0, y: 44 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.85, ease, delay: 0.08 }}>{c.heroA}</motion.span>
              <motion.span className="v11-inline-media" style={{ y: heroMediaY, scale: heroMediaScale }}>
                <Media slice="hero" />
              </motion.span>
              <motion.em initial={{ opacity: 0, y: 44 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.85, ease, delay: 0.16 }}>{c.heroB}</motion.em>
            </h1>
            <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease, delay: 0.28 }}>{c.heroC}</motion.h2>
            <motion.div className="v11-hero-bottom" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.38 }}>
              <p>{c.body}</p>
              <button onClick={goToCalculator}>{c.cta}<span>↗</span></button>
            </motion.div>
          </motion.div>

          <div className="v11-facts">{c.facts.map((fact, index) => <span key={fact}><i>0{index + 1}</i>{fact}</span>)}</div>
          <motion.div className="v11-scroll-cue" style={{ opacity: scrollCueOpacity }}><span />SCROLL</motion.div>
        </motion.div>
      </section>

      <section className="v11-rail" aria-hidden="true">
        <motion.div
          className="v11-rail-track"
          animate={reduce ? undefined : { x: ["0%", "-50%"] }}
          transition={reduce ? undefined : { duration: 28, ease: "linear", repeat: Infinity }}
        >
          {[...c.rail, ...c.rail].map((item, index) => <span key={`${item}-${index}`}>{item}<i>↗</i></span>)}
        </motion.div>
      </section>

      <section id="services" className="v11-services">
        <div className="v11-shell">
          <span className="v11-kicker dark">{c.one}</span>
          <div className="v11-sentence">
            <motion.span initial={{ opacity: 0, y: 36 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.75, ease }}>{c.sentence[0]}</motion.span>
            <Media slice="layers" className="short" />
            <motion.span initial={{ opacity: 0, y: 36 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.75, ease, delay: 0.05 }}>{c.sentence[1]}</motion.span>
            <motion.span initial={{ opacity: 0, y: 36 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.75, ease, delay: 0.1 }}>{c.sentence[2]}</motion.span>
            <Media slice="kit" className="tiny" />
            <motion.span initial={{ opacity: 0, y: 36 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.75, ease, delay: 0.15 }}>{c.sentence[3]}</motion.span>
          </div>

          <div className="v11-services-foot">
            <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.65, ease }}>{c.serviceBody}</motion.p>
            <div className="v11-service-list">
              {c.services.map((service, index) => (
                <motion.div
                  key={service}
                  initial={{ opacity: 0, x: 24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.55 }}
                  transition={{ duration: 0.55, ease, delay: index * 0.04 }}
                >
                  <i>0{index + 1}</i><strong>{service}</strong><span>↗</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="process" className="v11-prepared">
        <div className="v11-shell">
          <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.75, ease }}>
            <span className="v11-kicker dark">{c.prepared}</span>
            <h2>{c.preparedA} <Media slice="kit" className="wide" /> <em>{c.preparedB}</em></h2>
            <p>{c.preparedBody}</p>
          </motion.div>
        </div>
      </section>

      <section className="v11-route">
        <div className="v11-shell v11-route-grid">
          <motion.div className="v11-route-copy" initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.75, ease }}>
            <span className="v11-kicker">{c.estimateK}</span>
            <h2>{c.estimateA}<br/><em>{c.estimateB}</em></h2>
            <p>{c.estimateBody}</p>
            <button onClick={goToCalculator}>{c.cta}<span>↗</span></button>
          </motion.div>

          <motion.div className="v11-route-board" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.35 }} transition={{ duration: 0.8, ease }}>
            <div className="v11-route-head"><span>{c.example}</span><strong>{c.route}</strong></div>
            <svg viewBox="0 0 760 270" aria-hidden="true">
              <path className="v11-route-base" d="M44 190 C155 64 264 236 370 145 S580 72 716 124"/>
              <motion.path className="v11-route-live" d="M44 190 C155 64 264 236 370 145 S580 72 716 124" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 1.55, ease }} />
              <motion.circle cx="44" cy="190" r="6" initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.2, duration: 0.35 }} />
              <motion.circle cx="716" cy="124" r="6" initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 1.25, duration: 0.35 }} />
            </svg>
            <div className="v11-price"><div>{c.meta.map(item => <span key={item}>{item}</span>)}</div><motion.strong initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.65, ease, delay: 0.55 }}>{c.estimate}</motion.strong></div>
          </motion.div>
        </div>
      </section>

      <section id="reviews" className="v11-proof">
        <div className="v11-shell">
          <span className="v11-kicker dark">{c.proofK}</span>
          <div className="v11-proof-grid">
            <div>
              <motion.h2 initial={{ opacity: 0, y: 34 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.8, ease }}>{c.proofA}<br/><em>{c.proofB}</em></motion.h2>
              <p>{c.proofBody}</p>
              <div className="v11-proof-facts">{c.proofFacts.map((fact, index) => <span key={fact}><i>0{index + 1}</i>{fact}</span>)}</div>
            </div>
            <Media slice="services" className="proof" />
          </div>
        </div>
      </section>

      <section className="v11-handoff">
        <div className="v11-shell">
          <span>{c.handoffK}</span>
          <motion.h2 initial={{ opacity: 0, y: 34 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.75, ease }}>{c.handoff}</motion.h2>
          <button onClick={goToCalculator}>{c.cta}<i>↘</i></button>
        </div>
      </section>
    </div>
  );
}
