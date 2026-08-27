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
  fi: { back: "Takaisin etusivulle", eyebrow: "Turvallinen asiakasnäkymä", title: "Seuraa varaustasi.", intro: "Näe varauksen tila, pyydä muutosta tai peru varaus.", id: "Varausnumero", key: "Yksityinen pääsykoodi", open: "Avaa varaus", private: "Tietosi näkyvät vain yksityisellä varauslinkillä.", notFound: "Varausta ei löytynyt. Tarkista numero ja pääsykoodi.", hello: "Hei", route: "Reitti", schedule: "Ajankohta", service: "Palvelu", photos: "kuvaa", notes: "Lisätiedot", change: "Muuta tietoja", cancel: "Peru varaus", save: "Lähetä muutospyyntö", close: "Sulje", pickup: "Nouto-osoite", destination: "Kohdeosoite", date: "Päivä", time: "Aika", confirmCancel: "Haluatko varmasti perua varauksen?", changed: "Muutospyyntö vastaanotettu.", cancelled: "Varaus on peruttu.", contact: "Tarvitsetko apua? Soita 045 787 67567", steps: ["Vastaanotettu", "Vahvistettu", "Tiimi valittu", "Matkalla", "Valmis"], statuses:{new:"Vastaanotettu",change_requested:"Muutosta pyydetty",confirmed:"Vahvistettu",assigned:"Tiimi valittu",on_the_way:"Matkalla",in_progress:"Työ käynnissä",completed:"Valmis",cancelled:"Peruttu"} },
  en: { back: "Back to home", eyebrow: "Secure customer view", title: "Track your booking.", intro: "Check the booking status, request a change or cancel your booking.", id: "Booking number", key: "Private access code", open: "Open booking", private: "Your details are only available through your private booking link.", notFound: "Booking not found. Check the number and access code.", hello: "Hello", route: "Route", schedule: "Schedule", service: "Service", photos: "photos", notes: "Notes", change: "Change details", cancel: "Cancel booking", save: "Send change request", close: "Close", pickup: "Pickup address", destination: "Destination", date: "Date", time: "Time", confirmCancel: "Are you sure you want to cancel this booking?", changed: "Change request received.", cancelled: "Booking cancelled.", contact: "Need help? Call 045 787 67567", steps: ["Received", "Confirmed", "Team assigned", "On the way", "Complete"], statuses:{new:"Received",change_requested:"Change requested",confirmed:"Confirmed",assigned:"Team assigned",on_the_way:"On the way",in_progress:"In progress",completed:"Complete",cancelled:"Cancelled"} },
  uk: { back: "На головну", eyebrow: "Захищений кабінет клієнта", title: "Відстежуйте бронювання.", intro: "Перевіряйте статус, змінюйте дані або скасовуйте замовлення.", id: "Номер бронювання", key: "Приватний код доступу", open: "Відкрити", private: "Дані доступні лише за вашим приватним посиланням.", notFound: "Бронювання не знайдено. Перевірте номер і код.", hello: "Вітаємо", route: "Маршрут", schedule: "Дата й час", service: "Послуга", photos: "фото", notes: "Примітки", change: "Змінити дані", cancel: "Скасувати", save: "Надіслати зміни", close: "Закрити", pickup: "Адреса завантаження", destination: "Адреса доставки", date: "Дата", time: "Час", confirmCancel: "Справді скасувати бронювання?", changed: "Запит на зміну отримано.", cancelled: "Бронювання скасовано.", contact: "Потрібна допомога? Телефонуйте 045 787 67567", steps: ["Отримано", "Підтверджено", "Команду призначено", "У дорозі", "Готово"], statuses:{new:"Отримано",change_requested:"Запит на зміну",confirmed:"Підтверджено",assigned:"Команду призначено",on_the_way:"У дорозі",in_progress:"Виконується",completed:"Готово",cancelled:"Скасовано"} },
  ru: { back: "На главную", eyebrow: "Защищённый кабинет клиента", title: "Отслеживайте заказ.", intro: "Проверяйте статус, изменяйте данные или отменяйте бронирование.", id: "Номер бронирования", key: "Приватный код доступа", open: "Открыть заказ", private: "Данные доступны только по вашей приватной ссылке.", notFound: "Бронирование не найдено. Проверьте номер и код.", hello: "Здравствуйте", route: "Маршрут", schedule: "Дата и время", service: "Услуга", photos: "фото", notes: "Примечания", change: "Изменить данные", cancel: "Отменить заказ", save: "Отправить изменения", close: "Закрыть", pickup: "Адрес загрузки", destination: "Адрес доставки", date: "Дата", time: "Время", confirmCancel: "Точно отменить бронирование?", changed: "Запрос на изменение получен.", cancelled: "Бронирование отменено.", contact: "Нужна помощь? Звоните 045 787 67567", steps: ["Получено", "Подтверждено", "Команда назначена", "В пути", "Готово"], statuses:{new:"Получено",change_requested:"Запрошено изменение",confirmed:"Подтверждено",assigned:"Команда назначена",on_the_way:"В пути",in_progress:"В работе",completed:"Готово",cancelled:"Отменено"} },
} as const;

const statusIndex: Record<string, number> = { new: 0, change_requested: 1, confirmed: 1, assigned: 2, on_the_way: 3, in_progress: 3, completed: 4 };
const serviceNames: Record<string, Record<Locale, string>> = {
  moving: { fi: "Muuttopalvelu", en: "Moving", uk: "Переїзд", ru: "Переезд" },
  transport: { fi: "Kuljetus", en: "Transport", uk: "Перевезення", ru: "Перевозка" },
  cleaning: { fi: "Siivous", en: "Cleaning", uk: "Прибирання", ru: "Уборка" },
  windows: { fi: "Ikkunanpesu", en: "Window cleaning", uk: "Миття вікон", ru: "Мойка окон" },
  assembly: { fi: "Kalusteasennus", en: "Furniture assembly", uk: "Збирання меблів", ru: "Сборка мебели" },
  junk: { fi: "Kierrätys", en: "Junk removal", uk: "Вивіз речей", ru: "Вывоз вещей" },
};

function normalizeLocale(value: string | null): Locale {
  return value === "en" || value === "uk" || value === "ru" ? value : "fi";
}

function homeHref(locale: Locale) {
  return locale === "fi" ? "/" : `/?lang=${locale}`;
}

export default function TrackingClient() {
  const [locale, setLocale] = useState<Locale>("fi");
  const [id, setId] = useState("");
  const [key, setKey] = useState("");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [notice, setNotice] = useState("");
  const t = copy[locale];
  const activeStep = booking?.status === "cancelled" ? -1 : statusIndex[booking?.status ?? "new"] ?? 0;
  const canEdit = booking ? ["new", "confirmed", "assigned", "change_requested"].includes(booking.status) : false;

  async function loadBooking(nextId = id, nextKey = key) {
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/bookings/status", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: nextId, key: nextKey }) });
      if (!response.ok) throw new Error("not found");
      const data = await response.json() as { booking: Booking };
      setBooking(data.booking); setId(nextId); setKey(nextKey);
    } catch { setBooking(null); setError(copy[locale].notFound); }
    finally { setBusy(false); }
  }

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const initialLocale = normalizeLocale(query.get("lang"));
    setLocale(initialLocale);
    document.documentElement.lang = initialLocale;

    const params = new URLSearchParams(window.location.hash.slice(1));
    const hashId = params.get("id") ?? "";
    const hashKey = params.get("key") ?? "";
    const timer = hashId && hashKey ? window.setTimeout(() => void loadBooking(hashId, hashKey), 0) : undefined;
    return () => { if (timer) window.clearTimeout(timer); };
    // Private credentials are intentionally read once from the URL fragment.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const chooseLocale = (next: Locale) => {
    setLocale(next);
    document.documentElement.lang = next;
    const url = new URL(window.location.href);
    if (next === "fi") url.searchParams.delete("lang"); else url.searchParams.set("lang", next);
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  };

  async function updateBooking(action: "cancel" | "modify", values?: Record<string, string>) {
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/bookings/status", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, key, action, ...values }) });
      if (!response.ok) throw new Error("update failed");
      const data = await response.json() as { booking: Booking };
      setBooking(data.booking); setEditing(false); setNotice(action === "cancel" ? t.cancelled : t.changed);
    } catch { setError(t.notFound); }
    finally { setBusy(false); }
  }

  function submitLookup(event: FormEvent) { event.preventDefault(); void loadBooking(); }
  function submitChanges(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    void updateBooking("modify", Object.fromEntries(["pickup", "destination", "date", "time", "notes"].map(name => [name, String(data.get(name) ?? "")])));
  }

  const formattedDate = useMemo(() => booking ? new Intl.DateTimeFormat(locale === "uk" ? "uk-UA" : locale === "ru" ? "ru-RU" : locale === "en" ? "en-FI" : "fi-FI", { dateStyle: "long" }).format(new Date(`${booking.preferred_date}T12:00:00`)) : "", [booking, locale]);
  const statusLabel = booking ? (t.statuses[booking.status as keyof typeof t.statuses] ?? booking.status.replaceAll("_", " ")) : "";

  return <main className="tracking-page">
    <header className="tracking-header">
      <Link className="tracking-brand" href={homeHref(locale)} aria-label={t.back}><span><PackageCheck/></span>muutto<b>botti</b></Link>
      <div className="tracking-languages" aria-label="Language">{(Object.keys(languages) as Locale[]).map(language => <button type="button" className={language === locale ? "active" : ""} onClick={() => chooseLocale(language)} key={language} aria-pressed={language === locale}>{languages[language]}</button>)}</div>
      <Link className="tracking-back" href={homeHref(locale)}><ArrowLeft/>{t.back}</Link>
    </header>

    <section className="tracking-shell">
      <div className="tracking-intro"><span><ShieldCheck/>{t.eyebrow}</span><h1>{t.title}</h1><p>{t.intro}</p><a href="tel:+3584578767567"><Phone/>{t.contact}</a></div>

      <AnimatePresence mode="wait">
        {!booking ? <motion.form className="tracking-lookup" key="lookup" onSubmit={submitLookup} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
          <div className="tracking-lock"><LockKeyhole/></div>
          <label>{t.id}<input value={id} onChange={event => setId(event.target.value.toUpperCase())} placeholder="MB-12AB34CD" required autoComplete="off"/></label>
          <label>{t.key}<input type="password" value={key} onChange={event => setKey(event.target.value.toLowerCase())} placeholder="••••••••••••••••" required autoComplete="off"/></label>
          {error && <p className="tracking-error"><XCircle/>{error}</p>}
          <button type="submit" className="tracking-primary" disabled={busy}>{busy ? <LoaderCircle className="spin"/> : <LockKeyhole/>}{t.open}</button>
          <small><ShieldCheck/>{t.private}</small>
        </motion.form> : <motion.div className="tracking-dashboard" key="dashboard" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
          <div className="tracking-dashboard-head"><div><span>{t.hello}, {booking.customer_name}</span><h2>{booking.id}</h2></div><div className={`tracking-status status-${booking.status}`}>{statusLabel}</div></div>
          {booking.status === "cancelled" ? <div className="tracking-cancelled"><XCircle/>{t.cancelled}</div> : <div className="tracking-progress">{t.steps.map((step, index) => <div className={index <= activeStep ? "done" : ""} key={step}><i>{index < activeStep ? <Check/> : index + 1}</i><span>{step}</span></div>)}</div>}
          {notice && <div className="tracking-notice"><CheckCircle2/>{notice}</div>}
          {error && <div className="tracking-error"><XCircle/>{error}</div>}
          <div className="tracking-detail-grid">
            <article><MapPin/><span>{t.route}</span><strong>{booking.pickup}</strong><i/><strong>{booking.destination}</strong></article>
            <article><CalendarDays/><span>{t.schedule}</span><strong>{formattedDate}</strong><small><Clock3/>{booking.preferred_time}</small></article>
            <article><Truck/><span>{t.service}</span><strong>{serviceNames[booking.service]?.[locale] ?? booking.service}</strong><small>{booking.photo_count} {t.photos}</small></article>
          </div>
          {booking.notes && <div className="tracking-notes"><span>{t.notes}</span><p>{booking.notes}</p></div>}
          {canEdit && <div className="tracking-actions"><button type="button" onClick={() => setEditing(true)}><Edit3/>{t.change}</button><button type="button" className="danger" onClick={() => window.confirm(t.confirmCancel) && void updateBooking("cancel")}><Trash2/>{t.cancel}</button></div>}
        </motion.div>}
      </AnimatePresence>
    </section>

    <AnimatePresence>{editing && booking && <motion.div className="tracking-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><motion.form onSubmit={submitChanges} initial={{ scale: .96, y: 15 }} animate={{ scale: 1, y: 0 }}>
      <div className="tracking-modal-head"><h3>{t.change}</h3><button type="button" onClick={() => setEditing(false)} aria-label={t.close}><XCircle/></button></div>
      <label>{t.pickup}<input name="pickup" defaultValue={booking.pickup} required/></label>
      <label>{t.destination}<input name="destination" defaultValue={booking.destination} required/></label>
      <div className="tracking-form-row"><label>{t.date}<input name="date" type="date" defaultValue={booking.preferred_date} required/></label><label>{t.time}<input name="time" type="time" defaultValue={booking.preferred_time} required/></label></div>
      <label>{t.notes}<textarea name="notes" rows={3} defaultValue={booking.notes}/></label>
      <button type="submit" className="tracking-primary" disabled={busy}>{busy ? <LoaderCircle className="spin"/> : <Save/>}{t.save}</button>
    </motion.form></motion.div>}</AnimatePresence>
  </main>;
}
