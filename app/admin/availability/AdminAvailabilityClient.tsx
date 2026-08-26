"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowLeft, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Clock3, Loader2, LockKeyhole, Plus, RefreshCw, Trash2 } from "lucide-react";

type Block = { id: string; block_date: string; start_time: string; end_time: string; all_day: number; label: string; created_at?: string };
type Booking = { id: string; service: string; customer_name: string; preferred_date: string; preferred_time: string; status: string };
type Payload = { ok?: boolean; blocks?: Block[]; bookings?: Booking[]; error?: string };

const TOKEN_KEY = "muuttobotti-admin-token";

function isoDate(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function today() {
  const d = new Date();
  return isoDate(d.getFullYear(), d.getMonth(), d.getDate());
}

export default function AdminAvailabilityClient() {
  const now = new Date();
  const [token, setToken] = useState("");
  const [tokenInput, setTokenInput] = useState("");
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState(today());
  const [allDay, setAllDay] = useState(true);
  const [start, setStart] = useState("08:00");
  const [end, setEnd] = useState("12:00");
  const [label, setLabel] = useState("");
  const [viewMonth, setViewMonth] = useState(() => new Date(now.getFullYear(), now.getMonth(), 1));

  useEffect(() => {
    const saved = sessionStorage.getItem(TOKEN_KEY) || "";
    if (saved) { setToken(saved); setTokenInput(saved); }
  }, []);

  async function load(activeToken = token) {
    if (!activeToken) return;
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/admin/availability", { headers: { Authorization: `Bearer ${activeToken}`, Accept: "application/json" }, cache: "no-store" });
      const payload = await response.json().catch(() => ({})) as Payload;
      if (response.status === 401) {
        sessionStorage.removeItem(TOKEN_KEY); setToken(""); throw new Error("Неверный admin-token.");
      }
      if (!response.ok) throw new Error(payload.error || "Не удалось загрузить календарь.");
      setBlocks(payload.blocks || []); setBookings(payload.bookings || []);
    } catch (e) { setError(e instanceof Error ? e.message : "Ошибка загрузки."); }
    finally { setLoading(false); }
  }

  useEffect(() => { if (token) void load(token); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [token]);

  function login(e: FormEvent) {
    e.preventDefault(); const value = tokenInput.trim(); if (!value) return;
    sessionStorage.setItem(TOKEN_KEY, value); setToken(value);
  }

  async function createBlock(e: FormEvent) {
    e.preventDefault(); if (!token || !selectedDate) return;
    setSaving(true); setError("");
    try {
      const response = await fetch("/api/admin/availability", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ date: selectedDate, allDay, start, end, label }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Не удалось заблокировать время.");
      setLabel(""); await load(token);
    } catch (e) { setError(e instanceof Error ? e.message : "Ошибка сохранения."); }
    finally { setSaving(false); }
  }

  async function removeBlock(id: string) {
    if (!token) return;
    try {
      const response = await fetch(`/api/admin/availability?id=${encodeURIComponent(id)}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } });
      if (!response.ok) throw new Error();
      setBlocks(items => items.filter(item => item.id !== id));
    } catch { setError("Не удалось удалить блокировку."); }
  }

  const byDate = useMemo(() => {
    const map = new Map<string, Block[]>();
    for (const item of blocks) map.set(item.block_date, [...(map.get(item.block_date) || []), item]);
    return map;
  }, [blocks]);
  const bookingsByDate = useMemo(() => {
    const map = new Map<string, Booking[]>();
    for (const item of bookings) map.set(item.preferred_date, [...(map.get(item.preferred_date) || []), item]);
    return map;
  }, [bookings]);

  const cells = useMemo(() => {
    const y = viewMonth.getFullYear(), m = viewMonth.getMonth();
    const offset = (new Date(y, m, 1).getDay() + 6) % 7;
    const count = new Date(y, m + 1, 0).getDate();
    const result: Array<{ day: number; date: string } | null> = Array(offset).fill(null);
    for (let d = 1; d <= count; d += 1) result.push({ day: d, date: isoDate(y, m, d) });
    while (result.length % 7) result.push(null);
    return result;
  }, [viewMonth]);

  const selectedBlocks = byDate.get(selectedDate) || [];
  const selectedBookings = bookingsByDate.get(selectedDate) || [];

  if (!token) return <main className="availability-admin-login"><form onSubmit={login}>
    <LockKeyhole /><span>MUUTTOBOTTI ADMIN</span><h1>Календарь занятости</h1><p>Здесь можно закрывать целый день или отдельные часы для новых заказов.</p>
    <label>Admin-token<input type="password" value={tokenInput} onChange={e => setTokenInput(e.target.value)} autoFocus /></label>
    <button type="submit">Войти</button><a href="/admin/bookings"><ArrowLeft /> К заявкам</a>{error && <div className="availability-error">{error}</div>}
  </form></main>;

  return <main className="availability-admin-shell">
    <header className="availability-admin-head"><div><CalendarDays /><div><span>MUUTTOBOTTI</span><h1>Календарь занятости</h1></div></div><div><a href="/admin/bookings"><ArrowLeft /> Заявки</a><button onClick={() => void load()} disabled={loading}>{loading ? <Loader2 className="spin" /> : <RefreshCw />} Обновить</button></div></header>
    {error && <div className="availability-error">{error}</div>}

    <section className="availability-admin-grid">
      <div className="availability-admin-calendar-card">
        <div className="availability-admin-month"><button onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))}><ChevronLeft /></button><strong>{new Intl.DateTimeFormat("ru-RU", { month: "long", year: "numeric" }).format(viewMonth)}</strong><button onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}><ChevronRight /></button></div>
        <div className="availability-admin-weekdays">{["Пн","Вт","Ср","Чт","Пт","Сб","Вс"].map(v => <span key={v}>{v}</span>)}</div>
        <div className="availability-admin-days">{cells.map((cell, i) => cell ? <button key={cell.date} className={`${selectedDate === cell.date ? "selected" : ""} ${(byDate.get(cell.date) || []).some(b => Number(b.all_day) === 1) ? "blocked" : ""}`} onClick={() => setSelectedDate(cell.date)}><span>{cell.day}</span>{(byDate.get(cell.date)?.length || 0) > 0 && <i className="block-dot" />}{(bookingsByDate.get(cell.date)?.length || 0) > 0 && <i className="booking-dot" />}</button> : <span key={i} />)}</div>
        <div className="availability-admin-legend"><span><i className="block-dot" /> закрыто</span><span><i className="booking-dot" /> есть заказ</span></div>
      </div>

      <form className="availability-admin-form" onSubmit={createBlock}>
        <div className="availability-date-title"><CalendarDays /><div><span>Выбранная дата</span><strong>{new Intl.DateTimeFormat("ru-RU", { dateStyle: "long" }).format(new Date(`${selectedDate}T12:00:00`))}</strong></div></div>
        <label className="availability-all-day"><input type="checkbox" checked={allDay} onChange={e => setAllDay(e.target.checked)} /><span><strong>Закрыть весь день</strong><small>Клиент увидит дату серой и не сможет её выбрать.</small></span></label>
        {!allDay && <div className="availability-time-row"><label>С<input type="time" value={start} onChange={e => setStart(e.target.value)} /></label><label>До<input type="time" value={end} onChange={e => setEnd(e.target.value)} /></label></div>}
        <label>Комментарий<input value={label} onChange={e => setLabel(e.target.value)} placeholder="Напр. переезд 2 грузчика / личное" /></label>
        <button className="availability-save" type="submit" disabled={saving}>{saving ? <Loader2 className="spin" /> : <Plus />}{allDay ? "Закрыть дату" : "Закрыть время"}</button>

        <div className="availability-day-state"><h3>Что уже стоит на эту дату</h3>
          {selectedBlocks.length === 0 && selectedBookings.length === 0 && <p><CheckCircle2 /> День пока свободен.</p>}
          {selectedBlocks.map(block => <div className="availability-block-row" key={block.id}><Clock3 /><div><strong>{Number(block.all_day) === 1 ? "Весь день закрыт" : `${block.start_time}–${block.end_time}`}</strong><span>{block.label || "Без комментария"}</span></div><button type="button" onClick={() => void removeBlock(block.id)} aria-label="Удалить"><Trash2 /></button></div>)}
          {selectedBookings.map(booking => <div className="availability-booking-row" key={booking.id}><CalendarDays /><div><strong>{booking.preferred_time} · {booking.customer_name}</strong><span>{booking.id} · {booking.service} · {booking.status}</span></div></div>)}
        </div>
      </form>
    </section>

    <section className="availability-upcoming"><h2>Ближайшие закрытые даты и часы</h2>{blocks.length === 0 ? <p>Ручных блокировок пока нет.</p> : <div>{blocks.slice(0, 30).map(block => <article key={block.id}><strong>{block.block_date}</strong><span>{Number(block.all_day) === 1 ? "Весь день" : `${block.start_time}–${block.end_time}`}</span><small>{block.label || "—"}</small><button onClick={() => void removeBlock(block.id)}><Trash2 /></button></article>)}</div>}</section>
  </main>;
}
