"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clipboard,
  Clock3,
  Globe2,
  Loader2,
  LockKeyhole,
  Mail,
  MapPin,
  MessageCircle,
  MonitorSmartphone,
  Phone,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Truck,
  UserRound,
  Wifi,
} from "lucide-react";

type Booking = {
  id: string;
  service: string;
  customer_name: string;
  phone: string;
  email: string;
  pickup: string;
  destination: string;
  preferred_date: string;
  preferred_time: string;
  notes: string;
  photo_count: number;
  status: string;
  calculator_snapshot: string;
  recommendation: string;
  recommendation_level: "normal" | "attention" | "high" | string;
  client_ip: string;
  user_agent: string;
  client_country: string;
  client_region: string;
  client_city: string;
  client_asn: string;
  cf_colo: string;
  referer: string;
  page_url: string;
  locale: string;
  timezone: string;
  screen_size: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  created_at: string;
};

type ApiPayload = {
  ok?: boolean;
  db?: boolean;
  bucket?: boolean;
  count?: number;
  bookings?: Booking[];
  error?: string;
};

const TOKEN_KEY = "muuttobotti-admin-token";

const statusLabels: Record<string, string> = {
  new: "Новая",
  confirmed: "Подтверждена",
  in_progress: "В работе",
  completed: "Завершена",
  cancelled: "Отменена",
};

const serviceLabels: Record<string, string> = {
  moving: "Переезд",
  cleaning: "Уборка",
  transport: "Перевозка",
  windows: "Окна",
  assembly: "Сборка",
  junk: "Вывоз вещей",
};

function parseSnapshot(raw: string) {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Record<string, any>;
  } catch {
    return null;
  }
}

function formatCreated(value: string) {
  if (!value) return "—";
  const normalized = value.includes("T") ? value : `${value.replace(" ", "T")}Z`;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function deviceSummary(userAgent: string) {
  if (!userAgent) return "Не определено";
  const ua = userAgent.toLowerCase();
  const device = /android/.test(ua) ? "Android" : /iphone|ipad/.test(ua) ? "iPhone / iPad" : /windows/.test(ua) ? "Windows" : /mac os|macintosh/.test(ua) ? "macOS" : /linux/.test(ua) ? "Linux" : "Другое устройство";
  const browser = /edg\//.test(ua) ? "Edge" : /chrome\//.test(ua) && !/edg\//.test(ua) ? "Chrome" : /safari\//.test(ua) && !/chrome\//.test(ua) ? "Safari" : /firefox\//.test(ua) ? "Firefox" : "браузер";
  return `${device} · ${browser}`;
}

function whatsappLink(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits.startsWith("0") ? `358${digits.slice(1)}` : digits}` : "#";
}

function snapshotRows(snapshot: Record<string, any> | null) {
  if (!snapshot) return [] as Array<[string, string]>;
  const mode = String(snapshot.mode || "");
  const rows: Array<[string, string]> = [];
  if (snapshot.quotedPrice) rows.push(["Расчёт", `${snapshot.quotedPrice} €`]);
  if (snapshot.quotedDuration) rows.push(["Время", String(snapshot.quotedDuration)]);

  if (mode === "moving" && snapshot.moving) {
    const m = snapshot.moving;
    rows.push(["Грузчики", String(m.movers ?? "—")]);
    rows.push(["Площадь", `${m.sizeM2 ?? "—"} м²`]);
    rows.push(["Этаж", String(m.floor ?? "—")]);
    rows.push(["Дистанция", `${m.distanceKm ?? "—"} км`]);
    rows.push(["Лифт", m.elevator ? "Да" : "Нет"]);
    rows.push(["Упаковка", m.packing ? "Да" : "Нет"]);
    rows.push(["Уборка после", m.afterClean ? "Да" : "Нет"]);
  } else if (mode === "cleaning" && snapshot.cleaning) {
    const c = snapshot.cleaning;
    rows.push(["Площадь", `${c.sizeM2 ?? "—"} м²`]);
    rows.push(["Окна", String(c.windows ?? "—")]);
    rows.push(["Тип", String(c.cleanType ?? "—")]);
  } else if (mode === "transport" && snapshot.transport) {
    const tr = snapshot.transport;
    rows.push(["Дистанция", `${tr.distanceKm ?? "—"} км`]);
    rows.push(["Вес", `${tr.weightKg ?? "—"} кг`]);
    rows.push(["Express", tr.express ? "Да" : "Нет"]);
    rows.push(["Тяжёлый груз", tr.heavy ? "Да" : "Нет"]);
  }
  return rows;
}

export default function AdminBookingsClient() {
  const [tokenInput, setTokenInput] = useState("");
  const [token, setToken] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);
  const [bucketConnected, setBucketConnected] = useState<boolean | null>(null);
  const [query, setQuery] = useState("");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const saved = sessionStorage.getItem(TOKEN_KEY) || "";
    if (saved) {
      setToken(saved);
      setTokenInput(saved);
    }
  }, []);

  async function loadBookings(activeToken = token) {
    if (!activeToken) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/bookings?limit=200", {
        headers: { Authorization: `Bearer ${activeToken}`, Accept: "application/json" },
        cache: "no-store",
      });
      const payload = await response.json().catch(() => ({})) as ApiPayload;
      if (response.status === 401) {
        sessionStorage.removeItem(TOKEN_KEY);
        setToken("");
        setBookings([]);
        throw new Error("Неверный admin-token.");
      }
      setDbConnected(payload.db ?? null);
      setBucketConnected(payload.bucket ?? null);
      if (!response.ok || !payload.bookings) {
        if (payload.error === "DB_UNAVAILABLE") throw new Error("Cloudflare D1 пока не подключена к production Worker. Админка готова, но ей нужна рабочая DB binding.");
        throw new Error("Не удалось загрузить заявки.");
      }
      setBookings(payload.bookings);
      setSelectedId(current => current && payload.bookings!.some(item => item.id === current) ? current : (payload.bookings![0]?.id || ""));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Ошибка загрузки.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) void loadBookings(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  function login(event: FormEvent) {
    event.preventDefault();
    const value = tokenInput.trim();
    if (!value) return;
    sessionStorage.setItem(TOKEN_KEY, value);
    setToken(value);
  }

  function logout() {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken("");
    setBookings([]);
    setSelectedId("");
    setError("");
  }

  async function updateStatus(id: string, status: string) {
    if (!token) return;
    try {
      const response = await fetch("/api/admin/bookings", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ id, status }),
      });
      if (!response.ok) throw new Error();
      setBookings(items => items.map(item => item.id === id ? { ...item, status } : item));
    } catch {
      setError("Не удалось изменить статус заявки.");
    }
  }

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return bookings.filter(item => {
      if (serviceFilter !== "all" && item.service !== serviceFilter) return false;
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      if (!needle) return true;
      return [item.id, item.customer_name, item.phone, item.email, item.pickup, item.destination]
        .some(value => String(value || "").toLowerCase().includes(needle));
    });
  }, [bookings, query, serviceFilter, statusFilter]);

  const selected = bookings.find(item => item.id === selectedId) || filtered[0] || null;
  const snapshot = selected ? parseSnapshot(selected.calculator_snapshot) : null;
  const calcRows = snapshotRows(snapshot);

  if (!token) {
    return <main className="admin-login-shell">
      <form className="admin-login-card" onSubmit={login}>
        <div className="admin-login-mark"><LockKeyhole /></div>
        <span>MUUTTOBOTTI ADMIN</span>
        <h1>Заявки клиентов</h1>
        <p>Закрытая панель. Admin-token хранится только в текущей сессии браузера.</p>
        <label>Admin-token<input type="password" value={tokenInput} onChange={event => setTokenInput(event.target.value)} autoComplete="current-password" autoFocus /></label>
        <button type="submit"><ShieldCheck /> Войти</button>
        {error && <div className="admin-login-error">{error}</div>}
        <a href="/"><ArrowLeft /> Вернуться на сайт</a>
      </form>
    </main>;
  }

  return <main className="admin-app-shell">
    <header className="admin-topbar">
      <div><span className="admin-logo">M</span><div><strong>Muuttobotti</strong><small>Lead intelligence</small></div></div>
      <div className="admin-health">
        <span className={dbConnected ? "ok" : "bad"}>{dbConnected ? <CheckCircle2 /> : <AlertTriangle />} D1</span>
        <span className={bucketConnected ? "ok" : "warn"}>{bucketConnected ? <CheckCircle2 /> : <AlertTriangle />} R2</span>
        <button onClick={() => void loadBookings()} disabled={loading}>{loading ? <Loader2 className="spin" /> : <RefreshCw />} Обновить</button>
        <button className="ghost" onClick={logout}>Выйти</button>
      </div>
    </header>

    {error && <div className="admin-global-error"><AlertTriangle />{error}</div>}

    <section className="admin-stats">
      <article><span>Всего</span><strong>{bookings.length}</strong></article>
      <article><span>Новые</span><strong>{bookings.filter(item => item.status === "new").length}</strong></article>
      <article><span>Требуют внимания</span><strong>{bookings.filter(item => item.recommendation_level === "attention" || item.recommendation_level === "high").length}</strong></article>
      <article><span>Сегодня</span><strong>{bookings.filter(item => item.created_at?.slice(0,10) === new Date().toISOString().slice(0,10)).length}</strong></article>
    </section>

    <section className="admin-workspace">
      <aside className="admin-list-panel">
        <div className="admin-filters">
          <label className="admin-search"><Search /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Имя, телефон, адрес, ID…" /></label>
          <div>
            <select value={serviceFilter} onChange={event => setServiceFilter(event.target.value)}>
              <option value="all">Все услуги</option>
              <option value="moving">Переезд</option>
              <option value="transport">Перевозка</option>
              <option value="cleaning">Уборка</option>
            </select>
            <select value={statusFilter} onChange={event => setStatusFilter(event.target.value)}>
              <option value="all">Все статусы</option>
              {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>
        </div>

        <div className="admin-booking-list">
          {filtered.length === 0 && <div className="admin-empty">Заявок по фильтру нет.</div>}
          {filtered.map(item => <button key={item.id} className={`admin-booking-row ${selected?.id === item.id ? "active" : ""}`} onClick={() => setSelectedId(item.id)}>
            <div className="row-top"><span className={`priority ${item.recommendation_level}`}></span><strong>{item.customer_name || "Без имени"}</strong><time>{formatCreated(item.created_at)}</time></div>
            <div className="row-meta"><span>{serviceLabels[item.service] || item.service}</span><span>{statusLabels[item.status] || item.status}</span><span>{item.id}</span></div>
            <div className="row-route"><MapPin />{item.pickup}{item.destination && item.destination !== item.pickup ? ` → ${item.destination}` : ""}</div>
          </button>)}
        </div>
      </aside>

      <section className="admin-detail-panel">
        {!selected ? <div className="admin-empty-detail"><Truck /><h2>Выберите заявку</h2><p>Здесь появится полная информация по клиенту.</p></div> : <>
          <div className="admin-detail-head">
            <div><span>{selected.id}</span><h1>{selected.customer_name}</h1><p>{serviceLabels[selected.service] || selected.service} · создана {formatCreated(selected.created_at)}</p></div>
            <select value={selected.status} onChange={event => void updateStatus(selected.id, event.target.value)}>
              {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>

          <div className={`admin-recommendation ${selected.recommendation_level}`}>
            <div><Sparkles /><span>Рекомендация по этой заявке</span></div>
            <p>{selected.recommendation || "Рекомендация появится для новых заявок после обновления системы."}</p>
          </div>

          <div className="admin-action-row">
            <a href={`tel:${selected.phone}`}><Phone /> Позвонить</a>
            <a className="whatsapp" href={whatsappLink(selected.phone)} target="_blank" rel="noreferrer"><MessageCircle /> WhatsApp</a>
            <a href={`mailto:${selected.email}`}><Mail /> Email</a>
            <button onClick={() => navigator.clipboard.writeText(`${selected.id}\n${selected.customer_name}\n${selected.phone}\n${selected.pickup}\n${selected.destination}\n${selected.preferred_date} ${selected.preferred_time}\n${selected.notes}`)}><Clipboard /> Копировать</button>
          </div>

          <div className="admin-detail-grid">
            <article className="admin-card">
              <h3><UserRound /> Клиент</h3>
              <dl><dt>Имя</dt><dd>{selected.customer_name || "—"}</dd><dt>Телефон</dt><dd>{selected.phone || "—"}</dd><dt>Email</dt><dd>{selected.email || "—"}</dd></dl>
            </article>

            <article className="admin-card">
              <h3><CalendarDays /> Заказ</h3>
              <dl><dt>Услуга</dt><dd>{serviceLabels[selected.service] || selected.service}</dd><dt>Дата</dt><dd>{selected.preferred_date || "—"}</dd><dt>Время</dt><dd>{selected.preferred_time || "—"}</dd><dt>Фото</dt><dd>{selected.photo_count || 0}</dd></dl>
            </article>

            <article className="admin-card wide">
              <h3><MapPin /> Маршрут / адрес</h3>
              <dl><dt>Откуда</dt><dd>{selected.pickup || "—"}</dd><dt>Куда</dt><dd>{selected.destination || "—"}</dd></dl>
            </article>

            <article className="admin-card wide">
              <h3><MessageCircle /> Комментарий клиента</h3>
              <p className="admin-notes">{selected.notes || "Комментарий не оставлен."}</p>
            </article>

            <article className="admin-card wide">
              <h3><Sparkles /> Расчёт калькулятора</h3>
              {calcRows.length ? <dl className="calc-dl">{calcRows.map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl> : <p className="muted">Клиент отправил форму без расчёта калькулятора.</p>}
            </article>

            <article className="admin-card">
              <h3><Wifi /> IP и сеть</h3>
              <dl><dt>IP</dt><dd className="mono">{selected.client_ip || "—"}</dd><dt>Страна</dt><dd>{selected.client_country || "—"}</dd><dt>Регион</dt><dd>{selected.client_region || "—"}</dd><dt>Город</dt><dd>{selected.client_city || "—"}</dd><dt>ASN</dt><dd>{selected.client_asn || "—"}</dd><dt>Cloudflare</dt><dd>{selected.cf_colo || "—"}</dd></dl>
            </article>

            <article className="admin-card">
              <h3><MonitorSmartphone /> Устройство</h3>
              <dl><dt>Тип</dt><dd>{deviceSummary(selected.user_agent)}</dd><dt>Экран</dt><dd>{selected.screen_size || "—"}</dd><dt>Язык</dt><dd>{selected.locale || "—"}</dd><dt>Timezone</dt><dd>{selected.timezone || "—"}</dd></dl>
              <details><summary>User-Agent</summary><code>{selected.user_agent || "—"}</code></details>
            </article>

            <article className="admin-card wide">
              <h3><Globe2 /> Источник заявки</h3>
              <dl><dt>Страница</dt><dd className="break">{selected.page_url || "—"}</dd><dt>Referrer</dt><dd className="break">{selected.referer || "Прямой заход / не передан"}</dd><dt>UTM source</dt><dd>{selected.utm_source || "—"}</dd><dt>UTM medium</dt><dd>{selected.utm_medium || "—"}</dd><dt>UTM campaign</dt><dd>{selected.utm_campaign || "—"}</dd></dl>
            </article>
          </div>
        </>}
      </section>
    </section>
  </main>;
}
