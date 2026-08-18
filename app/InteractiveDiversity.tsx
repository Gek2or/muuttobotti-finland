"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight, Boxes, Building2, Check, CircleDot, Hammer, MapPin, PackageOpen,
  Recycle, Sparkles, Truck, WandSparkles, Waves,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Locale = "fi" | "en" | "uk" | "ru";
type ServiceKey = "moving" | "transport" | "cleaning" | "windows" | "assembly" | "junk";
type WorkFilter = "all" | "moving" | "transport" | "cleaning";

const services: ServiceKey[] = ["moving", "transport", "cleaning", "windows", "assembly", "junk"];
const serviceIcons = { moving: Boxes, transport: Truck, cleaning: Sparkles, windows: Waves, assembly: Hammer, junk: Recycle };

const copy = {
  fi: {
    kicker: "INTERACTIVE MOVE LAB",
    title: "Rakenna muutto. Kokeile ennen varausta.",
    body: "Eri palvelut tarvitsevat eri tavalla selkeyttä. Siksi jokainen osa toimii eri tavalla — ei kuutta samanlaista korttia.",
    mixerK: "01 · SERVICE MIXER", mixerT: "Mitä tarvitset samalle päivälle?", mixerB: "Yhdistä palvelut. Valintasi seuraavat sinua kohti tarkkaa arviota.", selected: "Valittu kokonaisuus", empty: "Valitse yksi tai useampi palvelu.",
    serviceNames: { moving: "Muutto", transport: "Kuljetus", cleaning: "Siivous", windows: "Ikkunat", assembly: "Asennus", junk: "Poisvienti" },
    vanK: "02 · LOAD EXPLORER", vanT: "Näe kuorman rytmi.", vanB: "Säädä kuormituksen tasoa. Visualisointi auttaa hahmottamaan, miksi hyvä lastausjärjestys ratkaisee.", vanLabel: "Kuormituksen visualisointi", vanNote: "Crafter 13–15 m³ · visuaalinen demo, ei tilavuuslaskelma", light: "Kevyt", balanced: "Tasainen", full: "Tiivis",
    wipeK: "03 · CLEAN FINISH", wipeT: "Vedä rajaa.", wipeB: "Interaktiivinen käsittelydemo näyttää, miten sama tila muuttuu visuaalisesti, kun valo, pinta ja viimeistely selkeytyvät.", wipeNote: "Visuaalinen demo — ei ennen/jälkeen-asiakaskuva.",
    processK: "04 · LIVE PROCESS", processT: "Klikkaa vaihetta. Näe mitä tapahtuu seuraavaksi.",
    steps: [
      ["Arvio", "Valitse palvelu, koko ja tärkeimmät muuttotiedot."],
      ["Suunnitelma", "Muodostamme saman arvion pohjalta Move Planin."],
      ["Muuttopäivä", "Tiimi, Crafter ja valitut lisäpalvelut toimivat samassa järjestyksessä."],
      ["Seuranta", "Saat varausnumeron ja yksityisen tracking-linkin."],
    ],
    galleryK: "05 · WORK WALL", galleryT: "Vaihda näkymää.", filters: { all: "Kaikki", moving: "Muutot", transport: "Kuljetukset", cleaning: "Siivous" },
    cityK: "06 · ROUTE SWITCHER", cityT: "Valitse suunta.", cityB: "Pääalue Uusimaa. Pidemmät muutot sovitaan erikseen koko Suomeen.", available: "Palvelu saatavilla", routeFrom: "Lähtöalue", routeTo: "Kohde", goCalc: "Jatka Smart Estimateen",
  },
  en: {
    kicker: "INTERACTIVE MOVE LAB",
    title: "Build the move. Try the flow before booking.",
    body: "Different services need different kinds of clarity. Each block therefore behaves differently — not six copies of the same card.",
    mixerK: "01 · SERVICE MIXER", mixerT: "What belongs in the same day?", mixerB: "Combine services. Your selection follows you toward the detailed estimate.", selected: "Selected setup", empty: "Choose one or more services.",
    serviceNames: { moving: "Moving", transport: "Transport", cleaning: "Cleaning", windows: "Windows", assembly: "Assembly", junk: "Junk removal" },
    vanK: "02 · LOAD EXPLORER", vanT: "See the loading rhythm.", vanB: "Adjust the load level. The visualization shows why a controlled loading order matters.", vanLabel: "Load visualization", vanNote: "Crafter 13–15 m³ · visual demo, not a volume calculator", light: "Light", balanced: "Balanced", full: "Dense",
    wipeK: "03 · CLEAN FINISH", wipeT: "Drag the divider.", wipeB: "An interactive treatment demo shows how the same scene changes visually as light, surface and finish become clearer.", wipeNote: "Visual demo — not a customer before/after photo.",
    processK: "04 · LIVE PROCESS", processT: "Choose a step. See what happens next.",
    steps: [["Estimate", "Choose the service, size and essential move details."],["Move Plan", "We turn the same estimate into one structured plan."],["Move day", "Team, Crafter and selected extras run through one coordinated flow."],["Tracking", "You receive a booking number and private tracking link."]],
    galleryK: "05 · WORK WALL", galleryT: "Switch the view.", filters: { all: "All", moving: "Moving", transport: "Transport", cleaning: "Cleaning" },
    cityK: "06 · ROUTE SWITCHER", cityT: "Choose a direction.", cityB: "Uusimaa is our main area. Longer moves are agreed separately across Finland.", available: "Service available", routeFrom: "Base area", routeTo: "Destination", goCalc: "Continue to Smart Estimate",
  },
  uk: {
    kicker: "INTERACTIVE MOVE LAB", title: "Зберіть переїзд. Спробуйте сценарій до бронювання.", body: "Різні послуги потребують різної взаємодії. Тому блоки працюють по-різному, а не повторюють однакові картки.",
    mixerK: "01 · SERVICE MIXER", mixerT: "Що потрібно в один день?", mixerB: "Поєднайте послуги. Вибір веде далі до точного розрахунку.", selected: "Обраний набір", empty: "Оберіть одну або кілька послуг.",
    serviceNames: { moving: "Переїзд", transport: "Перевезення", cleaning: "Прибирання", windows: "Вікна", assembly: "Збірка", junk: "Вивіз" },
    vanK: "02 · LOAD EXPLORER", vanT: "Подивіться ритм завантаження.", vanB: "Змініть рівень завантаження. Візуалізація показує, чому порядок у фургоні має значення.", vanLabel: "Візуалізація завантаження", vanNote: "Crafter 13–15 м³ · візуальне демо, не калькулятор об’єму", light: "Легко", balanced: "Збалансовано", full: "Щільно",
    wipeK: "03 · CLEAN FINISH", wipeT: "Перетягніть межу.", wipeB: "Інтерактивне демо показує зміну одного простору через світло, поверхні та фінішне прибирання.", wipeNote: "Візуальне демо — не фото клієнта до/після.",
    processK: "04 · LIVE PROCESS", processT: "Оберіть етап і побачте, що далі.", steps: [["Розрахунок", "Оберіть послугу, площу та головні параметри."],["Move Plan", "З того ж розрахунку формується один план."],["День переїзду", "Команда, Crafter та додаткові послуги працюють в одному процесі."],["Відстеження", "Ви отримуєте номер бронювання і приватне посилання."]],
    galleryK: "05 · WORK WALL", galleryT: "Змініть добірку.", filters: { all: "Усе", moving: "Переїзди", transport: "Перевезення", cleaning: "Прибирання" },
    cityK: "06 · ROUTE SWITCHER", cityT: "Оберіть напрямок.", cityB: "Основна зона — Uusimaa. Далекі переїзди узгоджуємо по всій Фінляндії.", available: "Послуга доступна", routeFrom: "Стартова зона", routeTo: "Напрямок", goCalc: "До Smart Estimate",
  },
  ru: {
    kicker: "INTERACTIVE MOVE LAB", title: "Соберите переезд. Попробуйте сценарий до бронирования.", body: "Разным услугам нужен разный интерактив. Поэтому блоки работают по-разному, а не повторяют одинаковые карточки.",
    mixerK: "01 · SERVICE MIXER", mixerT: "Что нужно в один день?", mixerB: "Объедините услуги. Выбор ведёт дальше к точному расчёту.", selected: "Выбранный набор", empty: "Выберите одну или несколько услуг.",
    serviceNames: { moving: "Переезд", transport: "Перевозка", cleaning: "Уборка", windows: "Окна", assembly: "Сборка", junk: "Вывоз" },
    vanK: "02 · LOAD EXPLORER", vanT: "Посмотрите ритм загрузки.", vanB: "Меняйте уровень загрузки. Визуализация показывает, почему порядок внутри фургона важен.", vanLabel: "Визуализация загрузки", vanNote: "Crafter 13–15 м³ · визуальное демо, не калькулятор объёма", light: "Легко", balanced: "Баланс", full: "Плотно",
    wipeK: "03 · CLEAN FINISH", wipeT: "Перетащите границу.", wipeB: "Интерактивная демонстрация показывает изменение одной сцены через свет, поверхности и финишную обработку.", wipeNote: "Визуальное демо — не фото клиента до/после.",
    processK: "04 · LIVE PROCESS", processT: "Выберите этап и посмотрите, что дальше.", steps: [["Расчёт", "Выберите услугу, площадь и основные параметры."],["Move Plan", "Из того же расчёта формируется единый план."],["День переезда", "Команда, Crafter и дополнительные услуги работают в одном процессе."],["Отслеживание", "Вы получаете номер бронирования и приватную ссылку."]],
    galleryK: "05 · WORK WALL", galleryT: "Переключите подборку.", filters: { all: "Всё", moving: "Переезды", transport: "Перевозки", cleaning: "Уборка" },
    cityK: "06 · ROUTE SWITCHER", cityT: "Выберите направление.", cityB: "Основная зона — Uusimaa. Дальние переезды согласовываем по всей Финляндии.", available: "Услуга доступна", routeFrom: "Стартовая зона", routeTo: "Направление", goCalc: "К Smart Estimate",
  },
} as const;

const workItems: Array<{ kind: Exclude<WorkFilter, "all">; visual: string; label: string }> = [
  { kind: "moving", visual: "hero", label: "MOVE / 01" },
  { kind: "transport", visual: "pack0", label: "TRANSPORT / 02" },
  { kind: "cleaning", visual: "pack2", label: "CLEAN / 03" },
  { kind: "moving", visual: "pack1", label: "MOVE / 04" },
  { kind: "transport", visual: "hero2", label: "DELIVERY / 05" },
  { kind: "cleaning", visual: "pack3", label: "DETAIL / 06" },
];

function getLocale(): Locale {
  if (typeof window === "undefined") return "fi";
  const value = new URLSearchParams(window.location.search).get("lang");
  return value === "en" || value === "uk" || value === "ru" ? value : "fi";
}

export default function InteractiveDiversity() {
  const [locale, setLocale] = useState<Locale>("fi");
  const [selected, setSelected] = useState<ServiceKey[]>(["moving", "transport"]);
  const [load, setLoad] = useState(58);
  const [wipe, setWipe] = useState(54);
  const [step, setStep] = useState(0);
  const [filter, setFilter] = useState<WorkFilter>("all");
  const [city, setCity] = useState("Espoo");

  useEffect(() => setLocale(getLocale()), []);
  const c = copy[locale];

  const filteredWork = useMemo(() => workItems.filter(item => filter === "all" || item.kind === filter), [filter]);
  const loadWord = load < 36 ? c.light : load < 76 ? c.balanced : c.full;

  const toggleService = (key: ServiceKey) => {
    setSelected(current => current.includes(key) ? current.filter(item => item !== key) : [...current, key]);
  };

  const goCalculator = () => document.getElementById("calculator")?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <section className="ix-lab" aria-labelledby="ix-title">
      <div className="ix-shell ix-head">
        <span className="ix-kicker">{c.kicker}</span>
        <h2 id="ix-title">{c.title}</h2>
        <p>{c.body}</p>
      </div>

      <div className="ix-shell ix-grid">
        <motion.article className="ix-panel ix-mixer" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .2 }}>
          <div className="ix-panel-copy"><span>{c.mixerK}</span><h3>{c.mixerT}</h3><p>{c.mixerB}</p></div>
          <div className="ix-service-mixer">
            {services.map(key => {
              const Icon = serviceIcons[key];
              const active = selected.includes(key);
              return <button key={key} type="button" className={active ? "active" : ""} aria-pressed={active} onClick={() => toggleService(key)}><Icon/><span>{c.serviceNames[key]}</span><i>{active ? <Check/> : <CircleDot/>}</i></button>;
            })}
          </div>
          <div className="ix-selection" aria-live="polite"><small>{c.selected}</small>{selected.length ? <div>{selected.map(key => <span key={key}>{c.serviceNames[key]}</span>)}</div> : <p>{c.empty}</p>}</div>
        </motion.article>

        <motion.article className="ix-panel ix-van-panel" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .2 }}>
          <div className="ix-panel-copy"><span>{c.vanK}</span><h3>{c.vanT}</h3><p>{c.vanB}</p></div>
          <div className="ix-van-stage" aria-hidden="true">
            <div className="ix-van-body"><div className="ix-van-cargo" style={{ width: `${Math.max(14, load)}%` }}>{Array.from({ length: 12 }).map((_, i) => <motion.b key={i} animate={{ opacity: i / 12 < load / 100 ? 1 : .12, y: i / 12 < load / 100 ? 0 : 8 }} />)}</div><div className="ix-wheel one"/><div className="ix-wheel two"/></div>
            <div className="ix-load-number"><strong>{load}%</strong><span>{loadWord}</span></div>
          </div>
          <label className="ix-range-label">{c.vanLabel}<input type="range" min="12" max="100" value={load} onChange={event => setLoad(+event.target.value)}/><small>{c.vanNote}</small></label>
        </motion.article>

        <motion.article className="ix-panel ix-wipe-panel" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .2 }}>
          <div className="ix-panel-copy"><span>{c.wipeK}</span><h3>{c.wipeT}</h3><p>{c.wipeB}</p></div>
          <div className="ix-wipe" style={{ "--wipe": `${wipe}%` } as React.CSSProperties}>
            <div className="ix-wipe-base"/>
            <div className="ix-wipe-clean"/>
            <div className="ix-wipe-line"><i/></div>
            <input aria-label={c.wipeT} type="range" min="8" max="92" value={wipe} onChange={event => setWipe(+event.target.value)}/>
          </div>
          <small className="ix-demo-note">{c.wipeNote}</small>
        </motion.article>

        <motion.article className="ix-panel ix-process" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .2 }}>
          <div className="ix-panel-copy"><span>{c.processK}</span><h3>{c.processT}</h3></div>
          <div className="ix-stepper" role="tablist" aria-label={c.processT}>{c.steps.map((item, index) => <button role="tab" aria-selected={step === index} key={item[0]} type="button" onClick={() => setStep(index)} className={step === index ? "active" : ""}><b>0{index + 1}</b><span>{item[0]}</span></button>)}</div>
          <AnimatePresence mode="wait"><motion.div className="ix-step-detail" key={step} initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }} transition={{ duration: .25 }}><div className="ix-step-orbit"><PackageOpen/></div><div><small>0{step + 1} / 04</small><h4>{c.steps[step][0]}</h4><p>{c.steps[step][1]}</p></div></motion.div></AnimatePresence>
          <div className="ix-step-progress"><i style={{ width: `${((step + 1) / 4) * 100}%` }}/></div>
        </motion.article>
      </div>

      <div className="ix-shell ix-work-section">
        <div className="ix-work-head"><div><span className="ix-kicker">{c.galleryK}</span><h3>{c.galleryT}</h3></div><div className="ix-filters">{(["all","moving","transport","cleaning"] as WorkFilter[]).map(item => <button type="button" className={filter === item ? "active" : ""} key={item} onClick={() => setFilter(item)}>{c.filters[item]}</button>)}</div></div>
        <motion.div layout className="ix-work-grid"><AnimatePresence>{filteredWork.map(item => <motion.article layout key={item.label} className={`ix-work-card ${item.visual}`} initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .94 }} whileHover={{ y: -5 }}><span>{item.label}</span><i><ArrowRight/></i></motion.article>)}</AnimatePresence></motion.div>
      </div>

      <div className="ix-shell ix-route-section">
        <div className="ix-route-copy"><span className="ix-kicker">{c.cityK}</span><h3>{c.cityT}</h3><p>{c.cityB}</p><div className="ix-city-buttons">{["Helsinki","Espoo","Vantaa","Tuusula","Järvenpää","Tampere","Turku"].map(item => <button type="button" onClick={() => setCity(item)} className={city === item ? "active" : ""} key={item}>{item}</button>)}</div></div>
        <div className="ix-route-visual" aria-live="polite"><div className="ix-route-status"><span><MapPin/>{c.routeFrom}</span><strong>UUSIMAA</strong></div><div className="ix-route-line"><i/><motion.b key={city} initial={{ left: "8%" }} animate={{ left: "88%" }} transition={{ duration: .7, ease: [0.22,1,0.36,1] }}><Truck/></motion.b></div><div className="ix-route-status right"><span>{c.routeTo}<MapPin/></span><strong>{city.toUpperCase()}</strong></div><div className="ix-available"><Check/>{c.available}</div><button type="button" onClick={goCalculator}>{c.goCalc}<ArrowRight/></button></div>
      </div>
    </section>
  );
}
