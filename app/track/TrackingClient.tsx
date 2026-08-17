"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft, CalendarDays, Check, CheckCircle2, Clock3, Edit3,
  LoaderCircle, LockKeyhole, MapPin, PackageCheck, Phone, Save,
  ShieldCheck, Trash2, Truck, XCircle,
} from "lucide-react";

type Locale = "fi" | "en" | "uk" | "ru";
type ErrorCode = "" | "notFound" | "unavailable" | "locked" | "pastDate" | "invalidChange";
type Booking = {
  id: string;
  service: string;
  customer_name: string;
  pickup: string;
  destination: string;
  preferred_date: string;
  preferred_time: string;
  notes: string;
  photo_count: number;
  status: string;
  created_at: string;
};

const languages: Record<Locale, string> = { fi: "FI", en: "EN", uk: "UA", ru: "RU" };
const copy = {
  fi: { back: "Takaisin etusivulle", eyebrow: "Turvallinen asiakasnäkymä", title: "Seuraa varaustasi.", intro: "Näe tilanne reaaliajassa, pyydä muutosta tai peru varaus.", id: "Varausnumero", key: "Yksityinen pääsykoodi", open: "Avaa varaus", private: "Tietosi näkyvät vain yksityisellä varauslinkillä.", notFound: "Varausta ei löytynyt. Tarkista numero ja pääsykoodi.", unavailable: "Palvelu ei ole juuri nyt käytettävissä. Yritä uudelleen tai soita meille.", locked: "Tätä varausta ei voi enää muuttaa verkossa. Ota yhteyttä meihin.", pastDate: "Valitse tämä päivä tai tuleva päivä.", invalidChange: "Tarkista muutetut tiedot ja yritä uudelleen.", hello: "Hei", route: "Reitti", address: "Palveluosoite", schedule: "Ajankohta", service: "Palvelu", photos: "Kuvaa", notes: "Lisätiedot", change: "Muuta tietoja", cancel: "Peru varaus", save: "Lähetä muutospyyntö", close: "Sulje", pickup: "Nouto-osoite", destination: "Kohdeosoite", date: "Päivä", time: "Aika", confirmCancel: "Haluatko varmasti perua varauksen?", changed: "Muutospyyntö vastaanotettu.", cancelled: "Varaus on peruttu.", contact: "Tarvitsetko apua? Soita 045 787 67567", steps: ["Vastaanotettu", "Vahvistettu", "Tiimi valittu", "Matkalla", "Valmis"] },
  en: { back: "Back to home", eyebrow: "Secure customer view", title: "Track your booking.", intro: "See live status, request a change or cancel your booking.", id: "Booking number", key: "Private access code", open: "Open booking", private: "Your details are only available through your private booking link.", notFound: "Booking not found. Check the number and access code.", unavailable: "The service is temporarily unavailable. Please try again or call us.", locked: "This booking can no longer be changed online. Please contact us.", pastDate: "Choose today or a future date.", invalidChange: "Check the changed details and try again.", hello: "Hello", route: "Route", address: "Service address", schedule: "Schedule", service: "Service", photos: "Photos", notes: "Notes", change: "Change details", cancel: "Cancel booking", save: "Send change request", close: "Close", pickup: "Pickup address", destination: "Destination", date: "Date", time: "Time", confirmCancel: "Are you sure you want to cancel this booking?", changed: "Change request received.", cancelled: "Booking cancelled.", contact: "Need help? Call 045 787 67567", steps: ["Received", "Confirmed", "Team assigned", "On the way", "Complete"] },
  uk: { back: "На головну", eyebrow: "Захищений кабінет клієнта", title: "Відстежуйте бронювання.", intro: "Перевіряйте статус, змінюйте дані або скасовуйте замовлення.", id: "Номер бронювання", key: "Приватний код доступу", open: "Відкрити", private: "Дані доступні лише за вашим приватним посиланням.", notFound: "Бронювання не знайдено. Перевірте номер і код.", unavailable: "Сервіс тимчасово недоступний. Спробуйте ще раз або зателефонуйте нам.", locked: "Це бронювання вже не можна змінити онлайн. Зв’яжіться з нами.", pastDate: "Оберіть сьогоднішню або майбутню дату.", invalidChange: "Перевірте змінені дані та спробуйте ще раз.", hello: "Вітаємо", route: "Маршрут", address: "Адреса послуги", schedule: "Дата й час", service: "Послуга", photos: "Фото", notes: "Примітки", change: "Змінити дані", cancel: "Скасувати", save: "Надіслати зміни", close: "Закрити", pickup: "Адреса завантаження", destination: "Адреса доставки", date: "Дата", time: "Час", confirmCancel: "Справді скасувати бронювання?", changed: "Запит на зміну отримано.", cancelled: "Бронювання скасовано.", contact: "Потрібна допомога? Телефонуйте 045 787 67567", steps: ["Отримано", "Підтверджено", "Команду призначено", "У дорозі", "Готово"] },
  ru: { back: "На главную", eyebrow: "Защищённый кабинет клиента", title: "Отслеживайте заказ.", intro: "Проверяйте статус, изменяйте данные или отменяйте бронирование.", id: "Номер бронирования", key: "Приватный код доступа", open: "Открыть заказ", private: "Данные доступны только по вашей приватной ссылке.", notFound: "Бронирование не найдено. Проверьте номер и код.", unavailable: "Сервис временно недоступен. Попробуйте ещё раз или позвоните нам.", locked: "Этот заказ уже нельзя изменить онлайн. Свяжитесь с нами.", pastDate: "Выберите сегодняшнюю или будущую дату.", invalidChange: "Проверьте изменённые данные и попробуйте ещё раз.", hello: "Здравствуйте", route: "Маршрут", address: "Адрес услуги", schedule: "Дата и время", service: "Услуга", photos: "Фото", notes: "Примечания", change: "Изменить данные", cancel: "Отменить заказ", save: "Отправить изменения", close: "Закрыть", pickup: "Адрес загрузки", destination: "Адрес доставки", date: "Дата", time: "Время", confirmCancel: "Точно отменить бронирование?", changed: "Запрос на изменение получен.", cancelled: "Бронирование отменено.", contact: "Нужна помощь? Звоните 045 787 67567", steps: ["Получено", "Подтверждено", "Команда назначена", "В пути", "Готово"] },
} as const;

const statusIndex: Record<string, number> = { new: 0, change_requested: 1, confirmed: 1, assigned: 2, on_the_way: 3, in_progress: 3, completed: 4 };
const statusLabels: Record<string, Record<Locale, string>> = {
  new: { fi: "Vastaanotettu", en: "Received", uk: "Отримано", ru: "Получено" },
  change_requested: { fi: "Muutospyyntö", en: "Change requested", uk: "Запит на зміну", ru: "Запрос на изменение" },
  confirmed: { fi: "Vahvistettu", en: "Confirmed", uk: "Підтверджено", ru: "Подтверждено" },
  assigned: { fi: "Tiimi valittu", en: "Team assigned", uk: "Команду призначено", ru: "Команда назначена" },
  on_the_way: { fi: "Matkalla", en: "On the way", uk: "У дорозі", ru: "В пути" },
  in_progress: { fi: "Työ käynnissä", en: "In progress", uk: "Робота триває", ru: "В работе" },
  completed: { fi: "Valmis", en: "Complete", uk: "Готово", ru: "Готово" },
  cancelled: { fi: "Peruttu", en: "Cancelled", uk: "Скасовано", ru: "Отменено" },
};
const serviceNames: Record<string, Record<Locale, string>> = {
  moving: { fi: "Muuttopalvelu", en: "Moving", uk: "Переїзд", ru: "Переезд" },
  transport: { fi: "Kuljetus", en: "Transport", uk: "Перевезення", ru: "Перевозка" },
  cleaning: { fi: "Siivous", en: "Cleaning", uk: "Прибирання", ru: "Уборка" },
  windows: { fi: "Ikkunanpesu", en: "Window cleaning", uk: "Миття вікон", ru: "Мойка окон" },
  assembly: { fi: "Kalusteasennus", en: "Furniture assembly", uk: "Збирання меблів", ru: "Сборка мебели" },
  junk: { fi: "Kierrätys", en: "Junk removal", uk: "Вивіз речей", ru: "Вывоз вещей" },
};

function updateErrorCode(status: number, serverError: string): ErrorCode {
  if (status === 404) return "notFound";
  if (status === 409) return "locked";
  if (status === 400 && serverError === "Booking date is in the past") return "pastDate";
  if (status === 400) return "invalidChange";
  return "unavailable";
}

export default function TrackingClient() {
  const [locale, setLocale] = useState<Locale>("fi");
  const [id, setId] = useState("");
  const [key, setKey] = useState("");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [busy, setBusy] = useState(false);
  const [errorCode, setErrorCode] = useState<ErrorCode>("");
  const [editing, setEditing] = useState(false);
  const [notice, setNotice] = useState("");
  const t = copy[locale];
  const error = errorCode ? t[errorCode] : "";
  const activeStep = booking?.status === "cancelled" ? -1 : statusIndex[booking?.status ?? "new"] ?? 0;
  const canEdit = booking ? ["new", "confirmed", "assigned", "change_requested"].includes(booking.status) : false;
  const hasRoute = booking ? booking.service === "moving" || booking.service === "transport" : false;

  async function loadBooking(nextId = id, nextKey = key) {
    setBusy(true); setErrorCode(""); setNotice("");
    try {
      const response = await fetch("/api/bookings/status", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: nextId, key: nextKey }) });
      if (!response.ok) {
        setBooking(null);
        setErrorCode(response.status === 404 ? "notFound" : "unavailable");
        return;
      }
      const data = await response.json() as { booking: Booking };
      setBooking(data.booking); setId(nextId); setKey(nextKey);
    } catch {
      setBooking(null); setErrorCode("unavailable");
    } finally { setBusy(false); }
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    const hashId = params.get("id") ?? "";
    const hashKey = params.get("key") ?? "";
    const timer = hashId && hashKey ? window.setTimeout(() => void loadBooking(hashId, hashKey), 0) : undefined;
    return () => { if (timer) window.clearTimeout(timer); };
    // The private link is intentionally read once from the URL fragment.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function updateBooking(action: "cancel" | "modify", values?: Record<string, string>) {
    setBusy(true); setErrorCode(""); setNotice("");
    try {
      const response = await fetch("/api/bookings/status", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, key, action, ...values }) });
      if (!response.ok) {
        const body = await response.json().catch(() => ({})) as { error?: string };
        setErrorCode(updateErrorCode(response.status, body.error ?? ""));
        return;
      }
      const data = await response.json() as { booking: Booking };
      setBooking(data.booking); setEditing(false); setNotice(action === "cancel" ? t.cancelled : t.changed);
    } catch {
      setErrorCode("unavailable");
    } finally { setBusy(false); }
  }

  function submitLookup(event: FormEvent) { event.preventDefault(); void loadBooking(); }
  function submitChanges(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const pickup = String(data.get("pickup") ?? "");
    const destination = hasRoute ? String(data.get("destination") ?? "") : pickup;
    void updateBooking("modify", {
      pickup,
      destination,
      date: String(data.get("date") ?? ""),
      time: String(data.get("time") ?? ""),
      notes: String(data.get("notes") ?? ""),
    });
  }

  const formattedDate = useMemo(() => booking ? new Intl.DateTimeFormat(locale === "uk" ? "uk-UA" : locale === "ru" ? "ru-RU" : locale === "en" ? "en-FI" : "fi-FI", { dateStyle: "long" }).format(new Date(`${booking.preferred_date}T12:00:00`)) : "", [booking, locale]);

  return <main className="tracking-page">
    <header className="tracking-header">
      <Link className="tracking-brand" href="/"><span><PackageCheck/></span>muutto<b>botti</b></Link>
      <div className="tracking-languages" aria-label="Language">{(Object.keys(languages) as Locale[]).map(language => <button type="button" aria-pressed={language === locale} className={language === locale ? "active" : ""} onClick={() => setLocale(language)} key={language}>{languages[language]}</button>)}</div>
      <Link className="tracking-back" href="/"><ArrowLeft/>{t.back}</Link>
    </header>

    <section className="tracking-shell">
      <div className="tracking-intro"><span><ShieldCheck/>{t.eyebrow}</span><h1>{t.title}</h1><p>{t.intro}</p><a href="tel:+3584578767567"><Phone/>{t.contact}</a></div>

      <AnimatePresence mode="wait">
        {!booking ? <motion.form className="tracking-lookup" key="lookup" onSubmit={submitLookup} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
          <div className="tracking-lock"><LockKeyhole/></div>
          <label>{t.id}<input value={id} onChange={event => setId(event.target.value.toUpperCase())} placeholder="MB-12AB34CD" required autoComplete="off"/></label>
          <label>{t.key}<input type="password" value={key} onChange={event => setKey(event.target.value.toLowerCase())} placeholder="••••••••••••••••" required autoComplete="off"/></label>
          {error && <p className="tracking-error" role="alert"><XCircle/>{error}</p>}
          <button className="tracking-primary" disabled={busy}>{busy ? <LoaderCircle className="spin"/> : <LockKeyhole/>}{t.open}</button>
          <small><ShieldCheck/>{t.private}</small>
        </motion.form> : <motion.div className="tracking-dashboard" key="dashboard" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
          <div className="tracking-dashboard-head"><div><span>{t.hello}, {booking.customer_name}</span><h2>{booking.id}</h2></div><div className={`tracking-status status-${booking.status}`}>{statusLabels[booking.status]?.[locale] ?? booking.status}</div></div>
          {booking.status === "cancelled" ? <div className="tracking-cancelled"><XCircle/>{t.cancelled}</div> : <div className="tracking-progress">{t.steps.map((step, index) => <div className={index <= activeStep ? "done" : ""} key={step}><i>{index < activeStep ? <Check/> : index + 1}</i><span>{step}</span></div>)}</div>}
          {notice && <div className="tracking-notice" role="status"><CheckCircle2/>{notice}</div>}
          {error && <div className="tracking-error" role="alert"><XCircle/>{error}</div>}
          <div className="tracking-detail-grid">
            <article><MapPin/><span>{hasRoute ? t.route : t.address}</span><strong>{booking.pickup}</strong>{hasRoute && <><i/><strong>{booking.destination}</strong></>}</article>
            <article><CalendarDays/><span>{t.schedule}</span><strong>{formattedDate}</strong><small><Clock3/>{booking.preferred_time}</small></article>
            <article><Truck/><span>{t.service}</span><strong>{serviceNames[booking.service]?.[locale] ?? booking.service}</strong><small>{booking.photo_count} {t.photos.toLowerCase()}</small></article>
          </div>
          {booking.notes && <div className="tracking-notes"><span>{t.notes}</span><p>{booking.notes}</p></div>}
          {canEdit && <div className="tracking-actions"><button type="button" onClick={() => { setErrorCode(""); setEditing(true); }}><Edit3/>{t.change}</button><button type="button" className="danger" onClick={() => window.confirm(t.confirmCancel) && void updateBooking("cancel")}><Trash2/>{t.cancel}</button></div>}
        </motion.div>}
      </AnimatePresence>
    </section>

    <AnimatePresence>{editing && booking && <motion.div className="tracking-modal" role="dialog" aria-modal="true" aria-labelledby="tracking-edit-title" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><motion.form onSubmit={submitChanges} initial={{ scale: .96, y: 15 }} animate={{ scale: 1, y: 0 }}>
      <div className="tracking-modal-head"><h3 id="tracking-edit-title">{t.change}</h3><button type="button" onClick={() => { setErrorCode(""); setEditing(false); }} aria-label={t.close}><XCircle/></button></div>
      <label>{hasRoute ? t.pickup : t.address}<input name="pickup" defaultValue={booking.pickup} required/></label>
      {hasRoute && <label>{t.destination}<input name="destination" defaultValue={booking.destination} required/></label>}
      <div className="tracking-form-row"><label>{t.date}<input name="date" type="date" defaultValue={booking.preferred_date} required/></label><label>{t.time}<input name="time" type="time" defaultValue={booking.preferred_time} required/></label></div>
      <label>{t.notes}<textarea name="notes" rows={3} defaultValue={booking.notes}/></label>
      {error && <p className="tracking-error" role="alert"><XCircle/>{error}</p>}
      <button className="tracking-primary" disabled={busy}>{busy ? <LoaderCircle className="spin"/> : <Save/>}{t.save}</button>
    </motion.form></motion.div>}</AnimatePresence>
  </main>;
}
