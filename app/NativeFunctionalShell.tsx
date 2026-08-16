"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight, Boxes, Check, CheckCircle2, ChevronDown, Languages, Mail,
  MapPin, Menu, MessageCircle, Navigation, PackageCheck, Phone, Send,
  Sparkles, Truck, UploadCloud, UserRound, UsersRound, X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

type Locale = "fi" | "en" | "uk" | "ru";
type CalcMode = "moving" | "cleaning" | "transport";
type PropertyType = "apartment" | "house" | "office";

const flags: Record<Locale, string> = { fi: "FI", en: "EN", uk: "UA", ru: "RU" };
const serviceValues = ["moving", "transport", "cleaning", "windows", "assembly", "junk"] as const;

const copy = {
  fi: {
    nav: ["Palvelut", "Hinta", "Prosessi", "Yhteystiedot"], quote: "Laske hinta",
    calcK: "SMART ESTIMATE", calcTitle: "Laske muuttosi hinta.", calcBody: "Valitse tärkeimmät tiedot. Arvio päivittyy heti ja siirtyy automaattisesti varaukseen.",
    modes: ["Muutto", "Siivous", "Kuljetus"], property: "Kohde", apartment: "Asunto", house: "Omakotitalo", office: "Toimisto",
    movers: "Muuttajien määrä", one: "1 muuttaja", two: "2 muuttajaa", size: "Koko", floor: "Kerros", distance: "Etäisyys",
    elevator: "Hissi", packing: "Pakkausapua", afterClean: "Muuttosiivous", windows: "Ikkunoita", cleanType: "Siivoustyyppi",
    regular: "Perussiivous", moveout: "Muuttosiivous", deep: "Suursiivous", weight: "Arvioitu paino", urgency: "Toimitus", normal: "Normaali", express: "Pikakuljetus",
    estimate: "Arvioitu hinta", duration: "Arvioitu kesto", included: "Arvio sisältää ALV:n. Muuttopalvelun minimiveloitus on 2 h.", vatOnly: "Arvio sisältää ALV:n.", makePlan: "Näytä muuttosuunnitelma",
    planK: "SMART ESTIMATE · PLAN READY", planTitle: "Muuttosuunnitelmasi on valmis.", planBody: "Sama arvio jatkuu suoraan varaukseen — tietoja ei tarvitse syöttää uudelleen.", finalNote: "Vahvistamme lopullisen hinnan ennen työn suorittamista.", finish: "Viimeistele varaus",
    bookingK: "VARAUS", bookingTitle: "Vielä yhteystiedot.", bookingBody: "Lähetä pyyntö. Saat varausnumeron ja yksityisen seurantalinkin heti.",
    service: "Palvelu", name: "Nimi", phone: "Puhelin", email: "Sähköposti", pickup: "Nouto-osoite", destination: "Kohdeosoite", date: "Päivä", time: "Aika", notes: "Lisätiedot", photos: "Lisää kuvia", send: "Lähetä varaus",
    services: ["Muutto", "Kuljetus", "Siivous", "Ikkunanpesu", "Kalusteiden kasaus", "Poisvienti"],
    faqK: "HYVÄ TIETÄÄ", faqTitle: "Ennen varausta.", faqs: [
      ["Miten muuton hinta lasketaan?", "Arvio perustuu tiimin kokoon, työmäärään, kerrokseen, hissiin, etäisyyteen ja valittuihin lisäpalveluihin."],
      ["Onko minimiveloitusta?", "Kyllä. Muuttopalvelun minimiveloitus on kaksi tuntia."],
      ["Milloin työaika alkaa?", "Työaika alkaa, kun saavumme sovittuun nouto-osoitteeseen."],
      ["Voitteko pakata ja koota kalusteita?", "Kyllä. Pakkaus, purku ja kokoaminen voidaan lisätä samaan varaukseen."],
      ["Palveletteko Helsingin ulkopuolella?", "Kyllä. Palvelemme Uudellamaalla ja sopimuksesta koko Suomessa."],
    ],
    contactK: "UUSIMAA · FINLAND", contactTitle: "Yksi yhteyshenkilö koko muutolle.", contactBody: "Kysyttävää ennen varausta? Soita, lähetä sähköposti tai WhatsApp-viesti.",
    success: "Varaus vastaanotettu.", successBody: "Tallennathan varausnumeron ja seurantalinkin.", bookingNumber: "Varausnumero", openTracking: "Avaa seuranta", close: "Sulje",
    error: "Varausta ei voitu lähettää. Ota yhteyttä puhelimitse tai WhatsAppilla.",
  },
  en: {
    nav: ["Services", "Estimate", "Process", "Contact"], quote: "Calculate price",
    calcK: "SMART ESTIMATE", calcTitle: "Calculate your move.", calcBody: "Choose the essentials. Your estimate updates instantly and follows you into booking.",
    modes: ["Moving", "Cleaning", "Transport"], property: "Property", apartment: "Apartment", house: "House", office: "Office",
    movers: "Number of movers", one: "1 mover", two: "2 movers", size: "Size", floor: "Floor", distance: "Distance",
    elevator: "Elevator", packing: "Packing help", afterClean: "Move-out cleaning", windows: "Windows", cleanType: "Cleaning type",
    regular: "Regular", moveout: "Move-out", deep: "Deep clean", weight: "Estimated weight", urgency: "Delivery", normal: "Normal", express: "Express",
    estimate: "Estimated price", duration: "Estimated duration", included: "Estimate includes VAT. Moving service has a 2 h minimum charge.", vatOnly: "Estimate includes VAT.", makePlan: "Show my move plan",
    planK: "SMART ESTIMATE · PLAN READY", planTitle: "Your move plan is ready.", planBody: "The same estimate continues directly into booking — no need to enter the details again.", finalNote: "We confirm the final price before the job.", finish: "Finish booking",
    bookingK: "BOOKING", bookingTitle: "Just your contact details.", bookingBody: "Send the request. You receive a booking number and private tracking link immediately.",
    service: "Service", name: "Name", phone: "Phone", email: "Email", pickup: "Pickup address", destination: "Destination", date: "Date", time: "Time", notes: "Notes", photos: "Add photos", send: "Send booking",
    services: ["Moving", "Transport", "Cleaning", "Window cleaning", "Furniture assembly", "Junk removal"],
    faqK: "GOOD TO KNOW", faqTitle: "Before you book.", faqs: [
      ["How is the moving price calculated?", "The estimate is based on team size, workload, floor, elevator, distance and selected extras."],
      ["Is there a minimum charge?", "Yes. Moving service has a two-hour minimum charge."],
      ["When does billable time start?", "Billable time starts when we arrive at the agreed pickup address."],
      ["Can you pack and assemble furniture?", "Yes. Packing, disassembly and assembly can be added to the same booking."],
      ["Do you work outside Helsinki?", "Yes. We serve Uusimaa and, by agreement, all of Finland."],
    ],
    contactK: "UUSIMAA · FINLAND", contactTitle: "One point of contact for the whole move.", contactBody: "Questions before booking? Call, email or send a WhatsApp message.",
    success: "Booking received.", successBody: "Save your booking number and private tracking link.", bookingNumber: "Booking number", openTracking: "Open tracking", close: "Close",
    error: "We could not send the booking. Please call or WhatsApp us.",
  },
  uk: {
    nav: ["Послуги", "Розрахунок", "Процес", "Контакти"], quote: "Розрахувати ціну",
    calcK: "SMART ESTIMATE", calcTitle: "Розрахуйте переїзд.", calcBody: "Вкажіть головні параметри. Оцінка оновлюється одразу й переходить разом із вами до бронювання.",
    modes: ["Переїзд", "Прибирання", "Перевезення"], property: "Об’єкт", apartment: "Квартира", house: "Будинок", office: "Офіс",
    movers: "Кількість вантажників", one: "1 вантажник", two: "2 вантажники", size: "Площа", floor: "Поверх", distance: "Відстань",
    elevator: "Ліфт", packing: "Допомога з пакуванням", afterClean: "Прибирання після переїзду", windows: "Вікна", cleanType: "Тип прибирання",
    regular: "Звичайне", moveout: "Після переїзду", deep: "Генеральне", weight: "Приблизна вага", urgency: "Доставка", normal: "Звичайна", express: "Експрес",
    estimate: "Орієнтовна ціна", duration: "Орієнтовний час", included: "Оцінка включає ПДВ. Мінімальне замовлення переїзду — 2 години.", vatOnly: "Оцінка включає ПДВ.", makePlan: "Показати мій план",
    planK: "SMART ESTIMATE · PLAN READY", planTitle: "Ваш план переїзду готовий.", planBody: "Той самий розрахунок переходить прямо до бронювання — повторно вводити дані не потрібно.", finalNote: "Остаточну ціну підтвердимо до виконання роботи.", finish: "Завершити бронювання",
    bookingK: "БРОНЮВАННЯ", bookingTitle: "Залишилися контактні дані.", bookingBody: "Надішліть заявку. Ви одразу отримаєте номер бронювання та приватне посилання для відстеження.",
    service: "Послуга", name: "Ім’я", phone: "Телефон", email: "Email", pickup: "Адреса завантаження", destination: "Адреса доставки", date: "Дата", time: "Час", notes: "Примітки", photos: "Додати фото", send: "Надіслати заявку",
    services: ["Переїзд", "Перевезення", "Прибирання", "Миття вікон", "Складання меблів", "Вивіз речей"],
    faqK: "КОРИСНО ЗНАТИ", faqTitle: "Перед бронюванням.", faqs: [
      ["Як розраховується ціна переїзду?", "Оцінка залежить від кількості працівників, обсягу роботи, поверху, ліфта, відстані та додаткових послуг."],
      ["Є мінімальне замовлення?", "Так. Мінімальне замовлення переїзду — дві години."],
      ["Коли починається оплачуваний час?", "Час починається, коли ми прибуваємо за погодженою адресою завантаження."],
      ["Можете пакувати та збирати меблі?", "Так. Пакування, розбирання та складання можна додати до одного бронювання."],
      ["Працюєте за межами Гельсінкі?", "Так. Ми працюємо по Уусімаа та за домовленістю по всій Фінляндії."],
    ],
    contactK: "UUSIMAA · FINLAND", contactTitle: "Один контакт на весь переїзд.", contactBody: "Є питання до бронювання? Телефонуйте, пишіть на email або у WhatsApp.",
    success: "Бронювання отримано.", successBody: "Збережіть номер бронювання та приватне посилання для відстеження.", bookingNumber: "Номер бронювання", openTracking: "Відкрити відстеження", close: "Закрити",
    error: "Не вдалося надіслати заявку. Зателефонуйте або напишіть у WhatsApp.",
  },
  ru: {
    nav: ["Услуги", "Расчёт", "Процесс", "Контакты"], quote: "Рассчитать цену",
    calcK: "SMART ESTIMATE", calcTitle: "Рассчитайте переезд.", calcBody: "Укажите главные параметры. Оценка обновляется сразу и переходит вместе с вами к бронированию.",
    modes: ["Переезд", "Уборка", "Перевозка"], property: "Объект", apartment: "Квартира", house: "Дом", office: "Офис",
    movers: "Количество грузчиков", one: "1 грузчик", two: "2 грузчика", size: "Площадь", floor: "Этаж", distance: "Расстояние",
    elevator: "Лифт", packing: "Помощь с упаковкой", afterClean: "Уборка после переезда", windows: "Окна", cleanType: "Тип уборки",
    regular: "Обычная", moveout: "После переезда", deep: "Генеральная", weight: "Примерный вес", urgency: "Доставка", normal: "Обычная", express: "Экспресс",
    estimate: "Примерная цена", duration: "Примерное время", included: "Оценка включает НДС. Минимальный заказ переезда — 2 часа.", vatOnly: "Оценка включает НДС.", makePlan: "Показать мой план",
    planK: "SMART ESTIMATE · PLAN READY", planTitle: "Ваш план переезда готов.", planBody: "Тот же расчёт переходит прямо к бронированию — повторно вводить данные не нужно.", finalNote: "Финальную цену подтвердим до выполнения работы.", finish: "Завершить бронирование",
    bookingK: "БРОНИРОВАНИЕ", bookingTitle: "Остались контактные данные.", bookingBody: "Отправьте заявку. Вы сразу получите номер бронирования и приватную ссылку для отслеживания.",
    service: "Услуга", name: "Имя", phone: "Телефон", email: "Email", pickup: "Адрес загрузки", destination: "Адрес доставки", date: "Дата", time: "Время", notes: "Примечания", photos: "Добавить фото", send: "Отправить заявку",
    services: ["Переезд", "Перевозка", "Уборка", "Мойка окон", "Сборка мебели", "Вывоз вещей"],
    faqK: "ПОЛЕЗНО ЗНАТЬ", faqTitle: "Перед бронированием.", faqs: [
      ["Как рассчитывается цена переезда?", "Оценка зависит от количества работников, объёма работы, этажа, лифта, расстояния и дополнительных услуг."],
      ["Есть минимальный заказ?", "Да. Минимальный заказ переезда — два часа."],
      ["Когда начинается оплачиваемое время?", "Время начинается, когда мы приезжаем по согласованному адресу загрузки."],
      ["Можете упаковать и собрать мебель?", "Да. Упаковку, разборку и сборку можно добавить в одно бронирование."],
      ["Работаете за пределами Хельсинки?", "Да. Мы работаем по Уусимаа и по договорённости по всей Финляндии."],
    ],
    contactK: "UUSIMAA · FINLAND", contactTitle: "Один контакт на весь переезд.", contactBody: "Есть вопросы до бронирования? Позвоните, напишите на email или в WhatsApp.",
    success: "Бронирование получено.", successBody: "Сохраните номер бронирования и приватную ссылку для отслеживания.", bookingNumber: "Номер бронирования", openTracking: "Открыть отслеживание", close: "Закрыть",
    error: "Не удалось отправить заявку. Позвоните или напишите в WhatsApp.",
  },
} as const;

export default function NativeFunctionalShell() {
  const [locale, setLocale] = useState<Locale>("fi");
  const [langOpen, setLangOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mode, setMode] = useState<CalcMode>("moving");
  const [property, setProperty] = useState<PropertyType>("apartment");
  const [size, setSize] = useState(55);
  const [floor, setFloor] = useState(2);
  const [distance, setDistance] = useState(18);
  const [movers, setMovers] = useState<1 | 2>(2);
  const [elevator, setElevator] = useState(true);
  const [packing, setPacking] = useState(false);
  const [afterClean, setAfterClean] = useState(false);
  const [windows, setWindows] = useState(6);
  const [cleanType, setCleanType] = useState("regular");
  const [weight, setWeight] = useState(80);
  const [express, setExpress] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(0);
  const [bookingState, setBookingState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [bookingResult, setBookingResult] = useState<{ bookingId: string; trackingPath: string } | null>(null);
  const c = copy[locale];

  useEffect(() => {
    const query = new URLSearchParams(window.location.search).get("lang");
    if (query === "fi" || query === "en" || query === "uk" || query === "ru") {
      setLocale(query);
      document.documentElement.lang = query;
    }
  }, []);

  const estimate = useMemo(() => {
    if (mode === "moving") {
      const workload = 1.4 + size / 28 + Math.max(0, floor - (elevator ? 2 : 0)) * 0.22 + (packing ? 1.5 : 0);
      const hours = Math.max(2, movers === 1 ? workload * 1.45 : workload);
      const rate = movers === 1 ? 60 : 75;
      const price = Math.round(hours * rate + distance * 0.65 + (afterClean ? size * 1.1 : 0));
      return { price, hours: `${hours.toFixed(1)}–${(hours + 0.8).toFixed(1)} h` };
    }
    if (mode === "cleaning") {
      const multiplier = cleanType === "deep" ? 1.45 : cleanType === "moveout" ? 1.25 : 1;
      const hours = Math.max(2, size / 24 * multiplier + windows * 0.12);
      return { price: Math.round(hours * 32.9), hours: `${hours.toFixed(1)}–${(hours + 0.7).toFixed(1)} h` };
    }
    const hours = Math.max(1, 1 + distance / 48 + weight / 500);
    return { price: Math.round(42 + distance * 1.05 + weight * 0.05 + (express ? 35 : 0)), hours: `${hours.toFixed(1)}–${(hours + 0.5).toFixed(1)} h` };
  }, [mode, size, floor, distance, movers, elevator, packing, afterClean, windows, cleanType, weight, express]);

  const propertyLabel = property === "house" ? c.house : property === "office" ? c.office : c.apartment;
  const cleanTypeLabel = cleanType === "deep" ? c.deep : cleanType === "moveout" ? c.moveout : c.regular;

  const planChips = useMemo(() => {
    if (mode === "moving") {
      const chips = [propertyLabel, `${size} m²`, `${c.floor} ${floor}`, `${distance} km`, movers === 1 ? c.one : c.two];
      if (elevator) chips.push(c.elevator);
      if (packing) chips.push(c.packing);
      if (afterClean) chips.push(c.afterClean);
      return chips;
    }
    if (mode === "cleaning") return [cleanTypeLabel, `${size} m²`, `${windows} ${c.windows.toLowerCase()}`];
    return [`${distance} km`, `${weight} kg`, express ? c.express : c.normal];
  }, [mode, propertyLabel, cleanTypeLabel, size, floor, distance, movers, elevator, packing, afterClean, windows, weight, express, c]);

  const modeLabel = c.modes[["moving", "cleaning", "transport"].indexOf(mode)];
  const planText = [modeLabel, ...planChips, estimate.hours].join(" · ");
  const estimateNote = mode === "moving" ? c.included : c.vatOnly;

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setMenuOpen(false);
  };

  const chooseLocale = (next: Locale) => {
    setLocale(next);
    setLangOpen(false);
    document.documentElement.lang = next;
    const url = new URL(window.location.href);
    if (next === "fi") url.searchParams.delete("lang"); else url.searchParams.set("lang", next);
    window.history.replaceState({}, "", url);
  };

  async function submitBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBookingState("sending");
    try {
      const response = await fetch("/api/bookings", { method: "POST", body: new FormData(event.currentTarget) });
      if (!response.ok) throw new Error("booking failed");
      const result = await response.json() as { bookingId: string; trackingPath: string };
      setBookingResult(result);
      setBookingState("done");
      event.currentTarget.reset();
    } catch {
      setBookingState("error");
    }
  }

  return (
    <main className="site-shell native-functional-shell">
      <header className="topbar native-topbar">
        <button className="brand" onClick={() => scrollTo("home")} aria-label="Muuttobotti home"><span className="brand-mark"><PackageCheck size={19}/></span><span>muutto<span>botti</span></span></button>
        <nav className="desktop-nav" aria-label="Primary navigation">{c.nav.map((item, index) => <button key={item} onClick={() => scrollTo(["services", "calculator", "process", "contact"][index])}>{item}</button>)}</nav>
        <div className="header-actions">
          <div className="language-wrap"><button className="lang-button" onClick={() => setLangOpen(!langOpen)} aria-expanded={langOpen} aria-haspopup="menu"><Languages size={16}/>{flags[locale]}<ChevronDown size={13}/></button><AnimatePresence>{langOpen && <motion.div className="lang-menu" role="menu" initial={{ opacity: 0, y: -7 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -7 }}>{(["fi", "en", "uk", "ru"] as Locale[]).map(lang => <button role="menuitem" key={lang} className={lang === locale ? "active" : ""} onClick={() => chooseLocale(lang)}>{flags[lang]}<Check size={13}/></button>)}</motion.div>}</AnimatePresence></div>
          <button className="quote-button" onClick={() => scrollTo("calculator")}>{c.quote}<ArrowRight size={15}/></button>
          <button className="menu-button" aria-label="Menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X/> : <Menu/>}</button>
        </div>
        <AnimatePresence>{menuOpen && <motion.nav className="mobile-nav" aria-label="Mobile navigation" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>{c.nav.map((item, index) => <button key={item} onClick={() => scrollTo(["services", "calculator", "process", "contact"][index])}>{item}</button>)}</motion.nav>}</AnimatePresence>
      </header>

      <section className="calculator-section native-calculator" id="calculator">
        <div className="calculator-intro"><span className="kicker light">{c.calcK}</span><h2>{c.calcTitle}</h2><p>{c.calcBody}</p><div className="smart-note"><Sparkles size={18}/><div><strong>{mode === "moving" ? (movers === 1 ? c.one : c.two) : modeLabel}</strong><span>{mode === "moving" ? `Crafter 13–15 m³ · ${movers === 1 ? "60" : "75"} €/h` : c.vatOnly}</span></div></div></div>
        <div className="calculator-card">
          <div className="calc-tabs">{(["moving", "cleaning", "transport"] as CalcMode[]).map((item, index) => <button key={item} type="button" className={mode === item ? "active" : ""} aria-pressed={mode === item} onClick={() => setMode(item)}>{index === 0 ? <Boxes/> : index === 1 ? <Sparkles/> : <Truck/>}{c.modes[index]}</button>)}</div>
          <div className="calc-fields">
            {mode === "moving" && <>
              <label>{c.property}<select value={property} onChange={event => setProperty(event.target.value as PropertyType)}><option value="apartment">{c.apartment}</option><option value="house">{c.house}</option><option value="office">{c.office}</option></select></label>
              <label className="movers-field">{c.movers}<div className="mover-selector"><button type="button" className={movers === 1 ? "active" : ""} aria-pressed={movers === 1} onClick={() => setMovers(1)}><UserRound/>{c.one}<small>60 € / h</small></button><button type="button" className={movers === 2 ? "active" : ""} aria-pressed={movers === 2} onClick={() => setMovers(2)}><UsersRound/>{c.two}<small>75 € / h</small></button></div></label>
              <label>{c.size}<div className="range-value">{size} m²</div><input type="range" min="15" max="220" value={size} aria-label={c.size} onChange={event => setSize(+event.target.value)}/></label>
              <label>{c.floor}<div className="range-value">{floor}</div><input type="range" min="0" max="12" value={floor} aria-label={c.floor} onChange={event => setFloor(+event.target.value)}/></label>
              <label>{c.distance}<div className="range-value">{distance} km</div><input type="range" min="1" max="500" value={distance} aria-label={c.distance} onChange={event => setDistance(+event.target.value)}/></label>
              <div className="switch-grid"><button type="button" className={elevator ? "on" : ""} aria-pressed={elevator} onClick={() => setElevator(!elevator)}><CheckCircle2/>{c.elevator}</button><button type="button" className={packing ? "on" : ""} aria-pressed={packing} onClick={() => setPacking(!packing)}><Boxes/>{c.packing}</button><button type="button" className={afterClean ? "on" : ""} aria-pressed={afterClean} onClick={() => setAfterClean(!afterClean)}><Sparkles/>{c.afterClean}</button></div>
            </>}
            {mode === "cleaning" && <><label>{c.size}<div className="range-value">{size} m²</div><input type="range" min="20" max="300" value={size} aria-label={c.size} onChange={event => setSize(+event.target.value)}/></label><label>{c.windows}<div className="range-value">{windows}</div><input type="range" min="0" max="30" value={windows} aria-label={c.windows} onChange={event => setWindows(+event.target.value)}/></label><label>{c.cleanType}<select value={cleanType} onChange={event => setCleanType(event.target.value)}><option value="regular">{c.regular}</option><option value="moveout">{c.moveout}</option><option value="deep">{c.deep}</option></select></label></>}
            {mode === "transport" && <><label>{c.distance}<div className="range-value">{distance} km</div><input type="range" min="1" max="600" value={distance} aria-label={c.distance} onChange={event => setDistance(+event.target.value)}/></label><label>{c.weight}<div className="range-value">{weight} kg</div><input type="range" min="5" max="1200" step="5" value={weight} aria-label={c.weight} onChange={event => setWeight(+event.target.value)}/></label><label>{c.urgency}<select value={express ? "express" : "normal"} onChange={event => setExpress(event.target.value === "express")}><option value="normal">{c.normal}</option><option value="express">{c.express}</option></select></label><div className="route-preview"><MapPin/><span>Helsinki</span><div/><Navigation/><span>Espoo</span></div></>}
          </div>
          <div className="estimate-box" aria-live="polite"><div><span>{c.estimate}</span><strong>{estimate.price} €</strong><small>{estimateNote}</small></div><div><span>{c.duration}</span><strong className="time-estimate">{estimate.hours}</strong></div><button type="button" onClick={() => scrollTo("move-plan")}>{c.makePlan}<ArrowRight/></button></div>
        </div>
      </section>

      <div id="move-plan" className="native-plan-host">
        <section className="mb-move-plan">
          <div className="mb-plan-eyebrow"><span/>{c.planK}</div>
          <div className="mb-plan-grid"><div><h3>{c.planTitle}</h3><p>{c.planBody}</p><div className="mb-plan-chips">{planChips.map(chip => <span key={chip}>{chip}</span>)}</div></div><div className="mb-plan-price"><small>{modeLabel}</small><strong>{estimate.price} €</strong><span>{estimate.hours}</span></div></div>
          <div className="mb-plan-footer"><div className="mb-plan-note">{c.finalNote}</div><button className="mb-plan-cta" type="button" onClick={() => scrollTo("booking")}>{c.finish}<span>↘</span></button></div>
        </section>
      </div>

      <section className="booking-section" id="booking">
        <div className="booking-copy"><span className="kicker light">{c.bookingK}</span><h2>{c.bookingTitle}</h2><p>{c.bookingBody}</p></div>
        <form className="booking-form" onSubmit={submitBooking}>
          <input type="hidden" name="calculator_estimate" value={`${estimate.price} €`}/><input type="hidden" name="calculator_plan" value={planText}/><input type="text" name="website" className="honeypot" tabIndex={-1} autoComplete="off"/>
          <label>{c.service}<select key={mode} name="service" defaultValue={mode} required>{c.services.map((service, index) => <option key={service} value={serviceValues[index]}>{service}</option>)}</select></label>
          <div className="form-row"><label>{c.name}<input name="name" required autoComplete="name" placeholder="Anna Korhonen"/></label><label>{c.phone}<input name="phone" required autoComplete="tel" placeholder="+358 40 123 4567"/></label></div>
          <label>{c.email}<input name="email" type="email" required autoComplete="email" placeholder="anna@example.fi"/></label>
          <div className="form-row"><label>{c.pickup}<input name="pickup" required autoComplete="street-address" placeholder="Mannerheimintie 1, Helsinki"/></label><label>{c.destination}<input name="destination" required placeholder="Tapiolantie 4, Espoo"/></label></div>
          <div className="form-row"><label>{c.date}<input name="date" type="date" required/></label><label>{c.time}<input name="time" type="time" required/></label></div>
          <label>{c.notes}<textarea name="notes" rows={3} placeholder="Sofa, washing machine, 20 boxes…"/></label>
          <label className="upload-field"><UploadCloud/><span>{c.photos}<small>JPG, PNG, WebP · max 5 files · 8 MB / file</small></span><input name="photos" type="file" accept="image/png,image/jpeg,image/webp" multiple/></label>
          <button className="submit-button" disabled={bookingState === "sending"}>{bookingState === "sending" ? "…" : c.send}<Send/></button>
          {bookingState === "error" && <p className="form-error" role="alert">{c.error}</p>}
        </form>
      </section>

      <section className="faq-section" id="faq">
        <div className="faq-title"><span className="kicker">{c.faqK}</span><h2>{c.faqTitle}</h2></div>
        <div className="faq-list">{c.faqs.map(([question, answer], index) => <article key={question}><button type="button" onClick={() => setFaqOpen(faqOpen === index ? null : index)} aria-expanded={faqOpen === index}><span>{question}</span><ChevronDown className={faqOpen === index ? "rotate" : ""}/></button><AnimatePresence>{faqOpen === index && <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>{answer}</motion.p>}</AnimatePresence></article>)}</div>
      </section>

      <section className="contact-section" id="contact">
        <div className="map-card"><iframe title="Muuttobotti service area" loading="lazy" referrerPolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=Uusimaa%2C%20Finland&z=8&output=embed"/></div>
        <div className="contact-copy"><span className="kicker">{c.contactK}</span><h2>{c.contactTitle}</h2><p>{c.contactBody}</p><div className="company-contact"><UserRound/><div><strong>Stanislav Kosytskyy</strong><span>Muuttobotti / Autochemix Oy</span><small>Y-tunnus 3543357-8</small></div></div><div className="contact-actions"><a href="tel:+3584578767567"><Phone/>045 787 67567</a><a href="mailto:autochemixfin@gmail.com"><Mail/>autochemixfin@gmail.com</a><a href="https://wa.me/3584578767567" target="_blank" rel="noreferrer"><MessageCircle/>WhatsApp</a></div></div>
      </section>

      <footer><div className="footer-brand"><div className="brand"><span className="brand-mark"><PackageCheck/></span><span>muutto<span>botti</span></span></div><p>Muuttobotti / Autochemix Oy<br/>Y-tunnus 3543357-8</p><div className="footer-contacts"><a href="tel:+3584578767567">045 787 67567</a><a href="mailto:autochemixfin@gmail.com">autochemixfin@gmail.com</a></div></div><div><strong>{c.nav[0]}</strong>{c.services.slice(0,5).map(service => <a key={service} href="#calculator">{service}</a>)}</div><div><strong>Uusimaa</strong>{["Helsinki","Espoo","Vantaa","Tuusula","Kerava","Järvenpää"].map(city => <span key={city}>{city}</span>)}</div><div><strong>Muuttobotti</strong><a href="#calculator">{c.quote}</a><a href="/track">Tracking</a><a href="#contact">{c.nav[3]}</a></div><div className="footer-bottom"><span>© 2026 Muuttobotti · Autochemix Oy</span><span>Moving forward.</span></div></footer>

      <a className="whatsapp-float native-whatsapp" href="https://wa.me/3584578767567" target="_blank" rel="noreferrer" aria-label="WhatsApp"><MessageCircle/><span>WhatsApp</span></a>

      <AnimatePresence>{bookingState === "done" && bookingResult && <motion.div className="success-overlay" role="dialog" aria-modal="true" aria-labelledby="booking-success-title" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><motion.div className="success-card" initial={{ scale: .94, y: 18 }} animate={{ scale: 1, y: 0 }}><CheckCircle2/><h3 id="booking-success-title">{c.success}</h3><p>{c.successBody}</p><div className="booking-reference"><span>{c.bookingNumber}</span><strong>{bookingResult.bookingId}</strong></div><div className="success-actions"><a href={bookingResult.trackingPath}>{c.openTracking}<ArrowRight/></a></div><button className="success-close" onClick={() => setBookingState("idle")}>{c.close}</button></motion.div></motion.div>}</AnimatePresence>
    </main>
  );
}
