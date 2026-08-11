"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Boxes,
  Building2,
  Check,
  ChevronDown,
  Clock3,
  Hammer,
  Languages,
  Menu,
  MessageCircle,
  PackageCheck,
  Phone,
  Recycle,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
  X,
} from "lucide-react";
import { useState } from "react";

type Locale = "fi" | "en" | "uk" | "ru";

const copy = {
  fi: {
    nav: ["Palvelut", "Hinnat", "Miten se toimii", "Arvostelut"],
    quote: "Pyydä tarjous",
    eyebrow: "Muutot · Kuljetukset · Siivous",
    titleA: "Kaikki hoituu.",
    titleB: "Yhdellä varauksella.",
    body: "Luotettava tiimi, iso pakettiauto ja läpinäkyvä hinta. Muutot, kuljetukset ja siivoukset kaikkialla Uudellamaalla — ja tarvittaessa koko Suomessa.",
    primary: "Laske hinta",
    secondary: "Varaa verkossa",
    rating: "4,9 / 5 asiakkaidemme arvio",
    response: "Vastaamme yleensä 5 minuutissa",
    trust: ["Vakuutettu palvelu", "Ei piilokuluja", "Samana päivänä"],
    stats: [["1 000+", "suoritettua työtä"], ["98 %", "tyytyväisiä asiakkaita"], ["24/7", "verkkovaraus"]],
    servicesKicker: "Kaikki kodin logistiikka",
    servicesTitle: "Yksi luotettava tiimi. Kaikki palvelut.",
    servicesBody: "Varaa vain se, mitä tarvitset — tai anna meidän hoitaa koko päivä alusta loppuun.",
    from: "alkaen",
    book: "Varaa palvelu",
  },
  en: {
    nav: ["Services", "Pricing", "How it works", "Reviews"],
    quote: "Get a quote",
    eyebrow: "Moving · Transport · Cleaning",
    titleA: "Consider it done.",
    titleB: "In one booking.",
    body: "A reliable team, a large van and transparent pricing. Moving, transport and cleaning across Uusimaa — and throughout Finland when you need us.",
    primary: "Calculate price",
    secondary: "Book online",
    rating: "4.9 / 5 customer rating",
    response: "We usually reply in 5 minutes",
    trust: ["Fully insured", "No hidden fees", "Same-day service"],
    stats: [["1,000+", "completed jobs"], ["98%", "customer satisfaction"], ["24/7", "online booking"]],
    servicesKicker: "Home logistics, simplified",
    servicesTitle: "One trusted team. Every service.",
    servicesBody: "Book exactly what you need — or let us manage the whole day from start to finish.",
    from: "from",
    book: "Book service",
  },
  uk: {
    nav: ["Послуги", "Ціни", "Як це працює", "Відгуки"],
    quote: "Отримати пропозицію",
    eyebrow: "Переїзди · Перевезення · Прибирання",
    titleA: "Усе буде зроблено.",
    titleB: "Одним бронюванням.",
    body: "Надійна команда, великий фургон і прозорі ціни. Переїзди, перевезення та прибирання по Уусімаа й усій Фінляндії.",
    primary: "Розрахувати ціну",
    secondary: "Забронювати",
    rating: "4,9 / 5 оцінка клієнтів",
    response: "Зазвичай відповідаємо за 5 хвилин",
    trust: ["Застраховано", "Без прихованих платежів", "У день замовлення"],
    stats: [["1 000+", "виконаних робіт"], ["98%", "задоволених клієнтів"], ["24/7", "онлайн-бронювання"]],
    servicesKicker: "Уся домашня логістика",
    servicesTitle: "Одна надійна команда. Усі послуги.",
    servicesBody: "Замовляйте саме те, що потрібно, або довірте нам увесь день від початку до кінця.",
    from: "від",
    book: "Замовити",
  },
  ru: {
    nav: ["Услуги", "Цены", "Как это работает", "Отзывы"],
    quote: "Получить расчёт",
    eyebrow: "Переезды · Перевозки · Уборка",
    titleA: "Всё будет сделано.",
    titleB: "Одним бронированием.",
    body: "Надёжная команда, большой фургон и прозрачные цены. Переезды, перевозки и уборка по Уусимаа и всей Финляндии.",
    primary: "Рассчитать цену",
    secondary: "Забронировать",
    rating: "4,9 / 5 оценка клиентов",
    response: "Обычно отвечаем за 5 минут",
    trust: ["Всё застраховано", "Без скрытых платежей", "В день заказа"],
    stats: [["1 000+", "выполненных работ"], ["98%", "довольных клиентов"], ["24/7", "онлайн-бронирование"]],
    servicesKicker: "Вся домашняя логистика",
    servicesTitle: "Одна надёжная команда. Все услуги.",
    servicesBody: "Закажите только нужное или доверьте нам весь день — от начала до конца.",
    from: "от",
    book: "Заказать",
  },
} as const;

const services = [
  { icon: Boxes, key: "moving", title: { fi: "Muuttopalvelu", en: "Moving", uk: "Переїзди", ru: "Переезды" }, desc: { fi: "Koti- ja yritysmuutot, pakkaus sekä kalusteiden purku.", en: "Home and office moves, packing and furniture disassembly.", uk: "Переїзди дому й офісу, пакування та розбирання меблів.", ru: "Переезды дома и офиса, упаковка и разборка мебели." }, price: "59 € / h", tone: "mint" },
  { icon: Truck, key: "transport", title: { fi: "Kuljetukset", en: "Transport", uk: "Перевезення", ru: "Перевозки" }, desc: { fi: "Huonekalut, kodinkoneet, noudot ja pikakuljetukset.", en: "Furniture, appliances, store pickups and express delivery.", uk: "Меблі, техніка, забір із магазину та експрес-доставка.", ru: "Мебель, техника, забор из магазина и экспресс-доставка." }, price: "49 € / h", tone: "blue" },
  { icon: Sparkles, key: "cleaning", title: { fi: "Siivous", en: "Cleaning", uk: "Прибирання", ru: "Уборка" }, desc: { fi: "Muuttosiivous, kotisiivous ja toimistosiivous takuulla.", en: "Move-out, home and office cleaning with a quality guarantee.", uk: "Прибирання після переїзду, дому та офісу з гарантією.", ru: "Уборка после переезда, дома и офиса с гарантией." }, price: "32,90 € / h", tone: "sand" },
  { icon: Building2, key: "windows", title: { fi: "Ikkunanpesu", en: "Window cleaning", uk: "Миття вікон", ru: "Мойка окон" }, desc: { fi: "Raidattomat ikkunat, karmit ja parvekelasit ammattivälineillä.", en: "Streak-free windows, frames and balcony glass.", uk: "Вікна без розводів, рами та балконне скло.", ru: "Окна без разводов, рамы и балконное остекление." }, price: "45 €", tone: "ice" },
  { icon: Hammer, key: "assembly", title: { fi: "Kalusteasennus", en: "Furniture assembly", uk: "Збирання меблів", ru: "Сборка мебели" }, desc: { fi: "IKEA- ja muiden kalusteiden kokoaminen turvallisesti.", en: "Safe assembly of IKEA and other furniture.", uk: "Безпечне збирання IKEA та інших меблів.", ru: "Безопасная сборка IKEA и другой мебели." }, price: "45 € / h", tone: "lavender" },
  { icon: Recycle, key: "junk", title: { fi: "Kierrätys & poisvienti", en: "Junk removal", uk: "Вивіз речей", ru: "Вывоз вещей" }, desc: { fi: "Nouto, lajittelu ja vastuullinen kuljetus Sortti-asemalle.", en: "Pickup, sorting and responsible recycling-station transport.", uk: "Забір, сортування та доставка на станцію переробки.", ru: "Забор, сортировка и доставка на станцию переработки." }, price: "60 €", tone: "peach" },
] as const;

const flags: Record<Locale, string> = { fi: "FI", en: "EN", uk: "UA", ru: "RU" };

export default function MuuttobottiApp() {
  const [locale, setLocale] = useState<Locale>("fi");
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const c = copy[locale];

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <main className="site-shell">
      <header className="topbar">
        <button className="brand" onClick={() => scrollTo("home")} aria-label="Muuttobotti home">
          <span className="brand-mark"><PackageCheck size={22} strokeWidth={2.4} /></span>
          <span>muutto<span>botti</span></span>
        </button>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {c.nav.map((item, i) => <button key={item} onClick={() => scrollTo(["services", "calculator", "process", "reviews"][i])}>{item}</button>)}
        </nav>
        <div className="header-actions">
          <div className="language-wrap">
            <button className="lang-button" onClick={() => setLangOpen(!langOpen)} aria-expanded={langOpen}><Languages size={17} /> {flags[locale]} <ChevronDown size={14} /></button>
            <AnimatePresence>
              {langOpen && <motion.div className="lang-menu" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                {(["fi", "en", "uk", "ru"] as Locale[]).map((lang) => <button key={lang} onClick={() => { setLocale(lang); setLangOpen(false); }} className={locale === lang ? "active" : ""}>{flags[lang]} <Check size={14} /></button>)}
              </motion.div>}
            </AnimatePresence>
          </div>
          <button className="quote-button" onClick={() => scrollTo("calculator")}>{c.quote} <ArrowRight size={17} /></button>
          <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Open menu">{menuOpen ? <X /> : <Menu />}</button>
        </div>
        <AnimatePresence>{menuOpen && <motion.nav className="mobile-nav" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>{c.nav.map((item, i) => <button key={item} onClick={() => scrollTo(["services", "calculator", "process", "reviews"][i])}>{item}</button>)}</motion.nav>}</AnimatePresence>
      </header>

      <section className="hero" id="home">
        <img className="hero-media" src="/muuttobotti-hero.png" alt="Muuttobotti movers loading a large moving van at a Finnish apartment building" />
        <div className="hero-noise" />
        <div className="hero-glow" />
        <motion.div className="hero-copy" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .65 }}>
          <div className="eyebrow"><span /> {c.eyebrow}</div>
          <h1>{c.titleA}<br/><em>{c.titleB}</em></h1>
          <p>{c.body}</p>
          <div className="hero-actions">
            <button className="primary-button" onClick={() => scrollTo("calculator")}>{c.primary} <ArrowRight size={19} /></button>
            <button className="secondary-button" onClick={() => scrollTo("booking")}>{c.secondary}</button>
          </div>
          <div className="rating-row"><div className="avatars"><span>SK</span><span>MA</span><span>JL</span></div><div><div className="stars">★★★★★</div><small>{c.rating}</small></div></div>
        </motion.div>
        <div className="availability-pill"><span className="live-dot" /> {c.response}</div>
        <div className="trust-strip">{c.trust.map((item, i) => <div key={item}>{i === 0 ? <ShieldCheck/> : i === 1 ? <Check/> : <Clock3/>}<span>{item}</span></div>)}</div>
      </section>

      <section className="stats-band" aria-label="Company statistics">
        {c.stats.map(([value, label]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}
        <div className="cities"><span>HELSINKI</span><span>ESPOO</span><span>VANTAA</span><span>TUUSULA</span></div>
      </section>

      <section className="services-section" id="services">
        <div className="section-heading">
          <div><span className="kicker">{c.servicesKicker}</span><h2>{c.servicesTitle}</h2></div>
          <p>{c.servicesBody}</p>
        </div>
        <div className="service-grid">
          {services.map((service, i) => { const Icon = service.icon; return <motion.article className={`service-card ${service.tone}`} key={service.key} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * .06 }}>
            <div className="service-icon"><Icon size={25}/></div>
            <h3>{service.title[locale]}</h3><p>{service.desc[locale]}</p>
            <div className="service-price"><span>{c.from}</span><strong>{service.price}</strong></div>
            <button onClick={() => scrollTo("calculator")}>{c.book}<ArrowRight size={16}/></button>
          </motion.article> })}
        </div>
      </section>

      <section className="placeholder-section" id="calculator"><span>01</span><h2>Instant price calculator</h2></section>
      <section className="placeholder-section" id="process"><span>02</span><h2>Three easy steps</h2></section>
      <section className="placeholder-section" id="reviews"><span>03</span><h2>Trusted by customers</h2></section>
      <section className="placeholder-section" id="booking"><span>04</span><h2>Book online</h2></section>
    </main>
  );
}
