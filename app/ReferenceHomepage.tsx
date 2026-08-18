"use client";

import { motion } from "framer-motion";
import {
  ArrowRight, Boxes, CheckCircle2, ChevronDown, CircleCheckBig, Clock3, Hammer,
  MapPin, Menu, PackageCheck, Phone, Recycle, ShieldCheck, Sparkles, Truck, X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Locale = "fi" | "en" | "uk" | "ru";

const langs: Locale[] = ["fi", "en", "uk", "ru"];
const langLabel: Record<Locale, string> = { fi: "FI", en: "EN", uk: "UA", ru: "RU" };

const copy = {
  fi: {
    nav: ["Palvelut", "Hinnat", "Miten se toimii", "Yhteys"], quote: "Varaa nyt",
    badge: "Reliable · Fast · Careful", titleA: "Muutot,", titleB: "kuljetukset", titleC: "ja siivous.", heroBody: "Luotettava muutto-, kuljetus- ja siivouspalvelu Uudellamaalla ja sopimuksesta koko Suomessa.", price: "Laske hinta", contact: "Ota yhteyttä",
    stat1: "Selkeä hinnoittelu", stat2: "Crafter 13–15 m³", stat3: "2 h minimiveloitus",
    quick: "Pika-arvio", quickSub: "Saat suuntaa antavan arvion heti.", size: "Koko", distance: "Etäisyys", movers: "Muuttajat", one: "1 muuttaja", two: "2 muuttajaa", estimate: "Arvio alkaen", continue: "Tee tarkka arvio",
    servicesK: "PALVELUMME", servicesT: "Kaikki mitä tarvitset — yhdestä paikasta.",
    services: [
      ["Muuttopalvelut", "Asunnot, toimistot, varastot."], ["Kuljetukset", "Yksittäiset tavarat ja express."], ["Siivous", "Kodit, toimistot, muuttosiivous."], ["Ikkunanpesu", "Kirkkaat ikkunat kotiin ja yritykseen."], ["Kalusteasennus", "IKEA ja muut huonekalut."], ["Poisvienti", "Lajittelu ja Sorttiasema."]
    ],
    whyK: "MIKSI MUUTTOBOTTI?", whyT: "Yksi tiimi. Selkeä prosessi.", why: ["Sovittu aika pitää", "Tavaroita käsitellään huolellisesti", "60/75 € tuntihinnoittelu", "Uusimaa + koko Suomi sopimuksesta"],
    processK: "NÄIN SE TOIMII", processT: "Neljä askelta valmiiseen muuttoon.", steps: [["01", "Laske hinta", "Syötä tärkeimmät tiedot."],["02", "Tee varaus", "Valitse aika ja palvelut."],["03", "Me hoidamme", "Saavumme paikalle sovitusti."],["04", "Seuraa tilausta", "Yksityinen tracking-linkki." ]],
    workK: "Oikeaa työtä · oikea kalusto", workT: "Suunniteltu arjen muuttoihin.",
    areaK: "TOIMIMME TÄÄLLÄ", areaT: "Uudeltamaalta koko Suomeen.", areaBody: "Päätoimialue: Helsinki, Espoo, Vantaa, Tuusula ja Järvenpää. Pidemmät muutot sovitaan erikseen.", cities: ["Helsinki", "Espoo", "Vantaa", "Tuusula", "Järvenpää", "Koko Suomi"],
    ctaT: "Valmis helpottamaan muuttopäivää?", ctaB: "Laske hinta ja jatka suoraan varaukseen.",
  },
  en: {
    nav: ["Services", "Pricing", "How it works", "Contact"], quote: "Book now",
    badge: "Reliable · Fast · Careful", titleA: "Moving,", titleB: "transport", titleC: "and cleaning.", heroBody: "Reliable moving, transport and cleaning across Uusimaa and, by agreement, all Finland.", price: "Calculate price", contact: "Contact us",
    stat1: "Clear pricing", stat2: "Crafter 13–15 m³", stat3: "2 h minimum",
    quick: "Quick estimate", quickSub: "Get an indicative price instantly.", size: "Size", distance: "Distance", movers: "Movers", one: "1 mover", two: "2 movers", estimate: "Estimate from", continue: "Get exact estimate",
    servicesK: "OUR SERVICES", servicesT: "Everything you need — in one place.", services: [["Moving", "Homes, offices and storage."],["Transport", "Single items and express."],["Cleaning", "Homes, offices, move-out cleaning."],["Window cleaning", "Clear windows for home and business."],["Assembly", "IKEA and other furniture."],["Junk removal", "Sorting and recycling station."]],
    whyK: "WHY MUUTTOBOTTI?", whyT: "One team. Clear process.", why: ["Agreed time means agreed time", "Careful handling", "60/75 € hourly pricing", "Uusimaa + Finland by agreement"],
    processK: "HOW IT WORKS", processT: "Four steps to a finished move.", steps: [["01","Estimate","Enter the key details."],["02","Book","Choose time and services."],["03","We handle it","We arrive as agreed."],["04","Track it","Private tracking link."]],
    workK: "Real work · real equipment", workT: "Built for everyday moves.", areaK: "SERVICE AREA", areaT: "From Uusimaa to all Finland.", areaBody: "Main area: Helsinki, Espoo, Vantaa, Tuusula and Järvenpää. Longer moves are agreed separately.", cities: ["Helsinki","Espoo","Vantaa","Tuusula","Järvenpää","All Finland"], ctaT: "Ready to make moving day easier?", ctaB: "Calculate your price and continue straight to booking.",
  },
  uk: {
    nav: ["Послуги", "Ціни", "Як це працює", "Контакти"], quote: "Забронювати",
    badge: "Надійно · Швидко · Дбайливо", titleA: "Переїзди,", titleB: "перевезення", titleC: "та прибирання.", heroBody: "Надійні переїзди, перевезення й прибирання по Uusimaa та за домовленістю по всій Фінляндії.", price: "Розрахувати", contact: "Зв’язатися",
    stat1: "Прозорі ціни", stat2: "Crafter 13–15 м³", stat3: "мінімум 2 години", quick: "Швидка оцінка", quickSub: "Орієнтовна ціна одразу.", size: "Площа", distance: "Відстань", movers: "Вантажники", one: "1 вантажник", two: "2 вантажники", estimate: "Від", continue: "Точний розрахунок",
    servicesK: "ПОСЛУГИ", servicesT: "Усе потрібне — в одному місці.", services: [["Переїзди","Квартири, офіси, склади."],["Перевезення","Окремі речі та express."],["Прибирання","Дім, офіс, після переїзду."],["Миття вікон","Для дому та бізнесу."],["Збірка меблів","IKEA та інші меблі."],["Вивіз речей","Сортування та утилізація."]],
    whyK: "ЧОМУ MUUTTOBOTTI?", whyT: "Одна команда. Зрозумілий процес.", why: ["Приїжджаємо у погоджений час", "Дбайливе поводження", "60/75 € за годину", "Uusimaa + вся Фінляндія за домовленістю"], processK: "ЯК ЦЕ ПРАЦЮЄ", processT: "Чотири кроки до готового переїзду.", steps: [["01","Розрахунок","Вкажіть головні дані."],["02","Бронювання","Оберіть час і послуги."],["03","Ми працюємо","Приїжджаємо вчасно."],["04","Відстеження","Приватне tracking-посилання."]], workK: "Реальна робота · реальний транспорт", workT: "Для звичайних і складних переїздів.", areaK: "ГЕОГРАФІЯ", areaT: "Від Uusimaa по всій Фінляндії.", areaBody: "Основна зона: Helsinki, Espoo, Vantaa, Tuusula та Järvenpää. Далекі переїзди узгоджуються окремо.", cities: ["Helsinki","Espoo","Vantaa","Tuusula","Järvenpää","Вся Фінляндія"], ctaT: "Готові спростити день переїзду?", ctaB: "Розрахуйте ціну та переходьте прямо до бронювання.",
  },
  ru: {
    nav: ["Услуги", "Цены", "Как это работает", "Контакты"], quote: "Забронировать",
    badge: "Надёжно · Быстро · Аккуратно", titleA: "Переезды,", titleB: "перевозки", titleC: "и уборка.", heroBody: "Надёжные переезды, перевозки и уборка по Uusimaa и по договорённости по всей Финляндии.", price: "Рассчитать", contact: "Связаться",
    stat1: "Понятные цены", stat2: "Crafter 13–15 м³", stat3: "минимум 2 часа", quick: "Быстрый расчёт", quickSub: "Ориентировочная цена сразу.", size: "Площадь", distance: "Расстояние", movers: "Грузчики", one: "1 грузчик", two: "2 грузчика", estimate: "От", continue: "Точный расчёт",
    servicesK: "УСЛУГИ", servicesT: "Всё необходимое — в одном месте.", services: [["Переезды","Квартиры, офисы, склады."],["Перевозки","Отдельные вещи и express."],["Уборка","Дом, офис, после переезда."],["Мойка окон","Для дома и бизнеса."],["Сборка мебели","IKEA и другая мебель."],["Вывоз вещей","Сортировка и утилизация."]],
    whyK: "ПОЧЕМУ MUUTTOBOTTI?", whyT: "Одна команда. Понятный процесс.", why: ["Приезжаем в согласованное время", "Аккуратное обращение", "60/75 € в час", "Uusimaa + вся Финляндия по договорённости"], processK: "КАК ЭТО РАБОТАЕТ", processT: "Четыре шага до готового переезда.", steps: [["01","Расчёт","Укажите основные данные."],["02","Бронирование","Выберите время и услуги."],["03","Мы работаем","Приезжаем как договорились."],["04","Отслеживание","Приватная tracking-ссылка."]], workK: "Реальная работа · реальный транспорт", workT: "Для обычных и сложных переездов.", areaK: "ГЕОГРАФИЯ", areaT: "От Uusimaa по всей Финляндии.", areaBody: "Основная зона: Helsinki, Espoo, Vantaa, Tuusula и Järvenpää. Дальние переезды согласуем отдельно.", cities: ["Helsinki","Espoo","Vantaa","Tuusula","Järvenpää","Вся Финляндия"], ctaT: "Готовы упростить день переезда?", ctaB: "Рассчитайте цену и переходите прямо к бронированию.",
  },
} as const;

const serviceIcons = [Boxes, Truck, Sparkles, PackageCheck, Hammer, Recycle];
const serviceVisuals = ["hero","pack0","pack2","pack3","pack1","hero2"];

function getLocale(): Locale {
  if (typeof window === "undefined") return "fi";
  const value = new URLSearchParams(window.location.search).get("lang");
  return value === "en" || value === "uk" || value === "ru" ? value : "fi";
}

export default function ReferenceHomepage() {
  const [locale, setLocale] = useState<Locale>("fi");
  const [menu, setMenu] = useState(false);
  const [size, setSize] = useState(55);
  const [distance, setDistance] = useState(18);
  const [movers, setMovers] = useState<1 | 2>(2);

  useEffect(() => setLocale(getLocale()), []);
  const c = copy[locale];

  const quickPrice = useMemo(() => {
    const workload = 1.4 + size / 28;
    const hours = Math.max(2, movers === 1 ? workload * 1.45 : workload);
    return Math.round(hours * (movers === 1 ? 60 : 75) + distance * 0.65);
  }, [size, distance, movers]);

  const go = (id: string) => { document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }); setMenu(false); };
  const chooseLocale = (next: Locale) => {
    const url = new URL(window.location.href);
    if (next === "fi") url.searchParams.delete("lang"); else url.searchParams.set("lang", next);
    window.location.assign(url.toString());
  };

  return (
    <div className="ref-home">
      <header className="ref-header">
        <button className="ref-brand" onClick={() => go("home")} aria-label="Muuttobotti home"><img src="/muuttobotti-mark.svg" alt=""/><span>MUUTTOBOTTI</span></button>
        <nav>{c.nav.map((item, i) => <button key={item} onClick={() => go(["services","calculator","process","contact"][i])}>{item}</button>)}</nav>
        <div className="ref-head-actions"><div className="ref-langs">{langs.map(item => <button className={item === locale ? "active" : ""} key={item} onClick={() => chooseLocale(item)}>{langLabel[item]}</button>)}</div><button className="ref-book" onClick={() => go("calculator")}>{c.quote}<ArrowRight size={15}/></button><button className="ref-menu" onClick={() => setMenu(!menu)} aria-label="Menu">{menu ? <X/> : <Menu/>}</button></div>
        {menu && <div className="ref-mobile-menu">{c.nav.map((item, i) => <button key={item} onClick={() => go(["services","calculator","process","contact"][i])}>{item}</button>)}</div>}
      </header>

      <section className="ref-hero" id="home">
        <div className="ref-hero-photo" aria-hidden="true"/>
        <div className="ref-hero-overlay"/>
        <div className="ref-shell ref-hero-grid">
          <motion.div className="ref-hero-copy" initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .75 }}>
            <span className="ref-pill">{c.badge}</span>
            <h1><span>{c.titleA}</span><span>{c.titleB}</span><em>{c.titleC}</em></h1>
            <p>{c.heroBody}</p>
            <div className="ref-hero-actions"><button onClick={() => go("calculator")}>{c.price}<ArrowRight/></button><a href="https://wa.me/3584578767567" target="_blank" rel="noreferrer">{c.contact}</a></div>
            <div className="ref-hero-stats"><span><ShieldCheck/>{c.stat1}</span><span><Truck/>{c.stat2}</span><span><Clock3/>{c.stat3}</span></div>
          </motion.div>

          <motion.aside className="ref-quick" initial={{ opacity: 0, x: 32 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .8, delay: .08 }}>
            <div className="ref-quick-head"><div><span>{c.quick}</span><small>{c.quickSub}</small></div><Sparkles/></div>
            <label>{c.size}<strong>{size} m²</strong><input type="range" min="20" max="180" value={size} onChange={e => setSize(+e.target.value)}/></label>
            <label>{c.distance}<strong>{distance} km</strong><input type="range" min="1" max="120" value={distance} onChange={e => setDistance(+e.target.value)}/></label>
            <div className="ref-movers-label">{c.movers}</div><div className="ref-movers"><button className={movers === 1 ? "active" : ""} onClick={() => setMovers(1)}>{c.one}<small>60 €/h</small></button><button className={movers === 2 ? "active" : ""} onClick={() => setMovers(2)}>{c.two}<small>75 €/h</small></button></div>
            <div className="ref-quick-result"><span>{c.estimate}</span><strong>{quickPrice} €</strong></div>
            <button className="ref-quick-cta" onClick={() => go("calculator")}>{c.continue}<ArrowRight/></button>
          </motion.aside>
        </div>
      </section>

      <section className="ref-services" id="services"><div className="ref-shell"><div className="ref-section-head"><div><span>{c.servicesK}</span><h2>{c.servicesT}</h2></div><button onClick={() => go("calculator")}>{c.price}<ArrowRight/></button></div><div className="ref-service-grid">{c.services.map(([title, body], index) => { const Icon = serviceIcons[index]; return <motion.article key={title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .2 }} transition={{ delay: index * .05 }}><div className={`ref-service-image ${serviceVisuals[index]}`}/><div className="ref-service-body"><Icon/><h3>{title}</h3><p>{body}</p><button onClick={() => go("calculator")}><ArrowRight/></button></div></motion.article>; })}</div></div></section>

      <section className="ref-why"><div className="ref-shell ref-why-grid"><div><span className="ref-eyebrow">{c.whyK}</span><h2>{c.whyT}</h2><p>{c.heroBody}</p></div><div className="ref-benefits">{c.why.map((item, index) => <div key={item}><span>0{index + 1}</span><CircleCheckBig/><strong>{item}</strong></div>)}</div><div className="ref-van-cut"/></div></section>

      <section className="ref-process" id="process"><div className="ref-shell"><span className="ref-eyebrow">{c.processK}</span><h2>{c.processT}</h2><div className="ref-step-grid">{c.steps.map(([num,title,body]) => <article key={num}><span>{num}</span><div className="ref-step-dot"/><h3>{title}</h3><p>{body}</p></article>)}</div></div></section>

      <section className="ref-work"><div className="ref-shell"><div className="ref-work-head"><div><span className="ref-eyebrow">{c.workK}</span><h2>{c.workT}</h2></div><div className="ref-work-tabs"><span>MUUTOT</span><span>KULJETUKSET</span><span>SIIVOUS</span></div></div><div className="ref-gallery"><div className="g1"/><div className="g2"/><div className="g3"/><div className="g4"/><div className="g5"/></div></div></section>

      <section className="ref-area"><div className="ref-shell ref-area-grid"><div><span className="ref-eyebrow">{c.areaK}</span><h2>{c.areaT}</h2><p>{c.areaBody}</p><div className="ref-city-list">{c.cities.map(city => <span key={city}>{city}</span>)}</div></div><div className="ref-route-map"><div className="ref-route-line"/><span className="city c1">Helsinki</span><span className="city c2">Vantaa</span><span className="city c3">Tuusula</span><span className="city c4">Tampere</span><span className="city c5">Oulu</span><MapPin className="pin p1"/><MapPin className="pin p2"/><MapPin className="pin p3"/><MapPin className="pin p4"/><MapPin className="pin p5"/></div></div></section>

      <section className="ref-final-cta"><div className="ref-shell"><div><span>MUUTTOBOTTI</span><h2>{c.ctaT}</h2><p>{c.ctaB}</p></div><button onClick={() => go("calculator")}>{c.price}<ArrowRight/></button><a href="tel:+3584578767567"><Phone/>045 787 67567</a></div></section>
    </div>
  );
}
