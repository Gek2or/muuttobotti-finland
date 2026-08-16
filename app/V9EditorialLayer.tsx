"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type Locale = "fi" | "en" | "uk" | "ru";

const copy = {
  fi: {
    overline: "MUUTTOBOTTI / UUSIMAA · FINLAND",
    heroTop: "Muutto voi olla",
    heroBottom: "yksinkertainen.",
    heroSecond: "Kun kaikki on yhdessä.",
    heroBody: "Yksi tiimi, iso 13–15 m³ auto ja selkeä arvio ennen varausta. Muutot, kuljetukset ja siivous ilman turhaa koordinointia.",
    cta: "Laske oma hinta",
    facts: ["1–2 muuttajaa", "Uusimaa → koko Suomi", "Varaus verkossa 24/7"],
    serviceK: "Yksi kumppani. Koko päivä.",
    serviceLeadA: "Me kannamme",
    serviceLeadB: "kuljetamme",
    serviceLeadC: "siivoamme",
    serviceLeadD: "ja kokoamme.",
    serviceBody: "Sinun ei tarvitse rakentaa muuttoa viidestä eri palvelusta. Me suunnittelemme sen yhtenä kokonaisuutena.",
    services: ["Muutot", "Kuljetukset", "Siivous", "Ikkunanpesu", "Kalusteiden kasaus"],
    preparedK: "Valmiina ennen ovikelloa",
    preparedA: "Me tulemme",
    preparedB: "valmiina.",
    preparedBody: "Suojaus, pakkaus, kiinnitys ja tarvittaessa siivous kulkevat samassa prosessissa.",
    routeK: "Muuttobotti Smart Estimate",
    routeA: "Reitti sisään.",
    routeB: "Selkeä arvio ulos.",
    routeBody: "Kerro tärkeimmät tiedot muutostasi. Saat heti realistisen arvion ajasta, tiimistä ja hinnasta.",
    example: "Esimerkkimuutto",
    route: "Helsinki → Espoo",
    estimate: "~ 287 €",
    meta: ["55 m²", "18 km", "2 muuttajaa"],
    calcLead: "Nyt tehdään siitä sinun muuttosi.",
    outroK: "Yksi varaus. Yksi yhteyshenkilö.",
    outroA: "Vähemmän säätöä.",
    outroB: "Enemmän varmuutta.",
    outroBody: "Kun arvio on valmis, suunnitelma jatkaa suoraan varaukseen. Ei uutta lomakeviidakkoa — vain puuttuvat tiedot.",
  },
  en: {
    overline: "MUUTTOBOTTI / UUSIMAA · FINLAND",
    heroTop: "Moving can feel",
    heroBottom: "simple.",
    heroSecond: "When everything works together.",
    heroBody: "One team, a large 13–15 m³ van and a clear estimate before booking. Moving, transport and cleaning without needless coordination.",
    cta: "Calculate my price",
    facts: ["1–2 movers", "Uusimaa → all Finland", "Online booking 24/7"],
    serviceK: "One partner. The whole day.",
    serviceLeadA: "We carry",
    serviceLeadB: "transport",
    serviceLeadC: "clean",
    serviceLeadD: "and assemble.",
    serviceBody: "You should not have to build your move from five separate services. We run it as one operation.",
    services: ["Moving", "Transport", "Cleaning", "Window cleaning", "Furniture assembly"],
    preparedK: "Ready before the doorbell",
    preparedA: "We arrive",
    preparedB: "prepared.",
    preparedBody: "Protection, packing, securing and optional cleaning live in the same process.",
    routeK: "Muuttobotti Smart Estimate",
    routeA: "Route in.",
    routeB: "Clear estimate out.",
    routeBody: "Tell us the essentials. Get an immediate realistic estimate for time, team and price.",
    example: "Example move",
    route: "Helsinki → Espoo",
    estimate: "~ 287 €",
    meta: ["55 m²", "18 km", "2 movers"],
    calcLead: "Now make it your move.",
    outroK: "One booking. One point of contact.",
    outroA: "Less coordination.",
    outroB: "More certainty.",
    outroBody: "Once the estimate is ready, your plan continues directly into booking. No second process — only the missing details.",
  },
  uk: {
    overline: "MUUTTOBOTTI / UUSIMAA · FINLAND",
    heroTop: "Переїзд може бути",
    heroBottom: "простим.",
    heroSecond: "Коли все працює разом.",
    heroBody: "Одна команда, великий фургон 13–15 м³ і зрозуміла оцінка до бронювання. Переїзд, перевезення та прибирання без зайвої координації.",
    cta: "Розрахувати мою ціну",
    facts: ["1–2 вантажники", "Uusimaa → вся Фінляндія", "Онлайн-бронювання 24/7"],
    serviceK: "Один партнер. Весь день.",
    serviceLeadA: "Ми переносимо",
    serviceLeadB: "перевозимо",
    serviceLeadC: "прибираємо",
    serviceLeadD: "і збираємо.",
    serviceBody: "Вам не потрібно складати переїзд із п’яти окремих послуг. Ми організовуємо його як один процес.",
    services: ["Переїзд", "Перевезення", "Прибирання", "Миття вікон", "Складання меблів"],
    preparedK: "Готові ще до дзвінка у двері",
    preparedA: "Ми приїжджаємо",
    preparedB: "підготовленими.",
    preparedBody: "Захист, пакування, фіксація та за потреби прибирання — в одному процесі.",
    routeK: "Muuttobotti Smart Estimate",
    routeA: "Маршрут на вході.",
    routeB: "Зрозуміла оцінка на виході.",
    routeBody: "Вкажіть головні дані. Одразу отримайте реалістичну оцінку часу, команди та ціни.",
    example: "Приклад переїзду",
    route: "Helsinki → Espoo",
    estimate: "~ 287 €",
    meta: ["55 м²", "18 км", "2 вантажники"],
    calcLead: "Тепер зробимо це вашим переїздом.",
    outroK: "Одне бронювання. Один контакт.",
    outroA: "Менше координації.",
    outroB: "Більше впевненості.",
    outroBody: "Після розрахунку план одразу переходить у бронювання. Без другого процесу — лише відсутні дані.",
  },
  ru: {
    overline: "MUUTTOBOTTI / UUSIMAA · FINLAND",
    heroTop: "Переезд может быть",
    heroBottom: "простым.",
    heroSecond: "Когда всё работает вместе.",
    heroBody: "Одна команда, большой фургон 13–15 м³ и понятная оценка до бронирования. Переезд, перевозка и уборка без лишней координации.",
    cta: "Рассчитать мою цену",
    facts: ["1–2 грузчика", "Uusimaa → вся Финляндия", "Онлайн-бронирование 24/7"],
    serviceK: "Один партнёр. Весь день.",
    serviceLeadA: "Мы переносим",
    serviceLeadB: "перевозим",
    serviceLeadC: "убираем",
    serviceLeadD: "и собираем.",
    serviceBody: "Вам не нужно собирать переезд из пяти отдельных услуг. Мы организуем его как один процесс.",
    services: ["Переезд", "Перевозка", "Уборка", "Мойка окон", "Сборка мебели"],
    preparedK: "Готовы ещё до звонка в дверь",
    preparedA: "Мы приезжаем",
    preparedB: "подготовленными.",
    preparedBody: "Защита, упаковка, крепёж и при необходимости уборка — в одном процессе.",
    routeK: "Muuttobotti Smart Estimate",
    routeA: "Маршрут на входе.",
    routeB: "Понятная оценка на выходе.",
    routeBody: "Укажите главное. Сразу получите реалистичную оценку времени, команды и цены.",
    example: "Пример переезда",
    route: "Helsinki → Espoo",
    estimate: "~ 287 €",
    meta: ["55 м²", "18 км", "2 грузчика"],
    calcLead: "Теперь сделаем это вашим переездом.",
    outroK: "Одно бронирование. Один контакт.",
    outroA: "Меньше координации.",
    outroB: "Больше уверенности.",
    outroBody: "После расчёта план сразу переходит в бронирование. Никакого второго процесса — только недостающие данные.",
  },
} as const;

function detectLocale(): Locale {
  const value = document.querySelector<HTMLElement>(".lang-button")?.textContent ?? "";
  if (value.includes("🇷🇺")) return "ru";
  if (value.includes("🇺🇦")) return "uk";
  if (value.includes("🇬🇧") || value.includes("🇺🇸")) return "en";
  return "fi";
}

function Story({ locale }: { locale: Locale }) {
  const c = copy[locale];
  const go = () => document.getElementById("calculator")?.scrollIntoView({ behavior: "smooth" });

  return <main className="mb-v9-story">
    <section className="v9-hero" data-v9="hero">
      <div className="v9-shell v9-hero-shell">
        <span className="v9-kicker">{c.overline}</span>
        <div className="v9-display v9-display-hero">
          <span>{c.heroTop}</span>
          <span className="v9-inline-media v9-inline-hero" aria-hidden="true"><i /></span>
          <span className="v9-accent">{c.heroBottom}</span>
        </div>
        <h2 className="v9-hero-second">{c.heroSecond}</h2>
        <div className="v9-hero-bottom">
          <p>{c.heroBody}</p>
          <button onClick={go}>{c.cta}<b>↗</b></button>
        </div>
        <div className="v9-facts">{c.facts.map((fact, index) => <span key={fact}><i>0{index + 1}</i>{fact}</span>)}</div>
      </div>
    </section>

    <section className="v9-services" data-v9="services">
      <div className="v9-shell">
        <span className="v9-kicker dark">{c.serviceK}</span>
        <div className="v9-service-sentence">
          <span>{c.serviceLeadA}</span>
          <span className="v9-inline-media v9-inline-services" aria-hidden="true"><i /></span>
          <span>{c.serviceLeadB}</span>
          <span>{c.serviceLeadC}</span>
          <span className="v9-inline-media v9-inline-kit-small" aria-hidden="true"><i /></span>
          <span>{c.serviceLeadD}</span>
        </div>
        <div className="v9-services-foot">
          <p>{c.serviceBody}</p>
          <div className="v9-service-list">{c.services.map((service, index) => <div key={service}><i>0{index + 1}</i><strong>{service}</strong><span>↗</span></div>)}</div>
        </div>
      </div>
    </section>

    <section className="v9-prepared" data-v9="prepared">
      <div className="v9-shell v9-prepared-shell">
        <span className="v9-kicker dark">{c.preparedK}</span>
        <div className="v9-prepared-line"><span>{c.preparedA}</span><span className="v9-inline-media v9-inline-kit" aria-hidden="true"><i /></span><em>{c.preparedB}</em></div>
        <p>{c.preparedBody}</p>
      </div>
    </section>

    <section className="v9-route" data-v9="route">
      <div className="v9-shell v9-route-shell">
        <span className="v9-kicker">{c.routeK}</span>
        <div className="v9-route-grid">
          <div className="v9-route-copy">
            <h2>{c.routeA}<br/><em>{c.routeB}</em></h2>
            <p>{c.routeBody}</p>
            <button onClick={go}>{c.cta}<b>↗</b></button>
          </div>
          <div className="v9-route-board" aria-label={`${c.example}: ${c.route}, ${c.estimate}`}>
            <div className="v9-route-head"><span>{c.example}</span><strong>{c.route}</strong></div>
            <svg viewBox="0 0 760 270" aria-hidden="true"><path className="v9-route-base" d="M44 190 C155 64 264 236 370 145 S580 72 716 124"/><path className="v9-route-live" d="M44 190 C155 64 264 236 370 145 S580 72 716 124"/><circle cx="44" cy="190" r="6"/><circle cx="716" cy="124" r="6"/></svg>
            <div className="v9-price-row"><strong>{c.estimate}</strong><div>{c.meta.map(item => <span key={item}>{item}</span>)}</div></div>
          </div>
        </div>
      </div>
    </section>

    <section className="v9-calc-lead"><div className="v9-shell"><span>MUUTTOBOTTI / SMART ESTIMATE</span><h2>{c.calcLead}</h2></div></section>
  </main>;
}

function Outro({ locale }: { locale: Locale }) {
  const c = copy[locale];
  return <section className="v9-outro">
    <div className="v9-shell">
      <span className="v9-kicker dark">{c.outroK}</span>
      <div className="v9-outro-line"><span>{c.outroA}</span><span className="v9-inline-media v9-inline-final" aria-hidden="true"><i /></span><em>{c.outroB}</em></div>
      <p>{c.outroBody}</p>
    </div>
  </section>;
}

export default function V9EditorialLayer() {
  const [locale, setLocale] = useState<Locale>("fi");
  const [intro, setIntro] = useState<HTMLElement | null>(null);
  const [outro, setOutro] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const shell = document.querySelector<HTMLElement>(".site-shell");
    const calculator = document.querySelector<HTMLElement>(".calculator-section");
    const booking = document.querySelector<HTMLElement>(".booking-section");
    const faq = document.querySelector<HTMLElement>(".faq-section");
    if (!shell || !calculator || !booking) return;

    shell.classList.add("mb-v9-enabled");
    const introHost = document.createElement("div");
    introHost.id = "mb-v9-intro-host";
    calculator.parentElement?.insertBefore(introHost, calculator);
    const outroHost = document.createElement("div");
    outroHost.id = "mb-v9-outro-host";
    (faq ?? booking.nextElementSibling)?.parentElement?.insertBefore(outroHost, faq ?? booking.nextElementSibling);
    setIntro(introHost);
    setOutro(outroHost);
    setLocale(detectLocale());

    const language = document.querySelector(".language-wrap");
    const observer = new MutationObserver(() => setLocale(detectLocale()));
    if (language) observer.observe(language, { subtree: true, childList: true, characterData: true, attributes: true });

    return () => {
      observer.disconnect();
      shell.classList.remove("mb-v9-enabled");
      introHost.remove();
      outroHost.remove();
    };
  }, []);

  return <>{intro && createPortal(<Story locale={locale}/>, intro)}{outro && createPortal(<Outro locale={locale}/>, outro)}</>;
}
