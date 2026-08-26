"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, LockKeyhole } from "lucide-react";

type Locale = "fi" | "en" | "uk" | "ru";
type PartialBlock = { date: string; start: string; end: string };
type BookedStart = { date: string; time: string };
type AvailabilityPayload = {
  ok?: boolean;
  db?: boolean;
  fullDays?: string[];
  blocks?: PartialBlock[];
  bookedStarts?: BookedStart[];
};

const copy = {
  fi: { date: "Valitse päivä", time: "Valitse aloitusaika", unavailable: "Varattu", partial: "Osittain varattu", selected: "Valittu", noTimes: "Tälle päivälle ei ole vapaita aikoja.", loading: "Tarkistetaan vapaita aikoja…", hint: "Harmaat päivät ja ajat eivät ole varattavissa." },
  en: { date: "Choose a date", time: "Choose a start time", unavailable: "Booked", partial: "Partly booked", selected: "Selected", noTimes: "No available times on this date.", loading: "Checking availability…", hint: "Grey dates and times cannot be booked." },
  uk: { date: "Оберіть дату", time: "Оберіть час початку", unavailable: "Зайнято", partial: "Частково зайнято", selected: "Обрано", noTimes: "На цю дату вільного часу немає.", loading: "Перевіряємо вільний час…", hint: "Сірі дати й час недоступні для бронювання." },
  ru: { date: "Выберите дату", time: "Выберите время начала", unavailable: "Занято", partial: "Частично занято", selected: "Выбрано", noTimes: "На эту дату свободного времени нет.", loading: "Проверяем свободное время…", hint: "Серые даты и время нельзя выбрать." },
} as const;

function localeCode(): Locale {
  const value = document.documentElement.lang;
  return value === "en" || value === "uk" || value === "ru" ? value : "fi";
}

function isoDate(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function todayLocal() {
  const now = new Date();
  return isoDate(now.getFullYear(), now.getMonth(), now.getDate());
}

function addDays(value: string, days: number) {
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(y, m - 1, d + days);
  return isoDate(date.getFullYear(), date.getMonth(), date.getDate());
}

function minutes(value: string) {
  const [h, m] = value.slice(0, 5).split(":").map(Number);
  return h * 60 + m;
}

function makeSlots() {
  const values: string[] = [];
  for (let minute = 8 * 60; minute <= 22 * 60; minute += 30) {
    values.push(`${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`);
  }
  return values;
}

const slots = makeSlots();

export default function BookingAvailabilityPicker() {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const [dateInput, setDateInput] = useState<HTMLInputElement | null>(null);
  const [timeInput, setTimeInput] = useState<HTMLInputElement | null>(null);
  const [locale, setLocale] = useState<Locale>("fi");
  const [data, setData] = useState<AvailabilityPayload | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const now = new Date();
  const [viewMonth, setViewMonth] = useState(() => new Date(now.getFullYear(), now.getMonth(), 1));

  useEffect(() => {
    const form = document.querySelector<HTMLFormElement>(".booking-form");
    const date = form?.querySelector<HTMLInputElement>('input[name="date"]') ?? null;
    const time = form?.querySelector<HTMLInputElement>('input[name="time"]') ?? null;
    const row = date?.closest<HTMLElement>(".form-row") ?? null;
    if (!form || !date || !time || !row) return;

    setTarget(row);
    setDateInput(date);
    setTimeInput(time);
    setLocale(localeCode());

    const languageObserver = new MutationObserver(() => setLocale(localeCode()));
    languageObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });

    const from = todayLocal();
    const to = addDays(from, 180);
    void fetch(`/api/availability?from=${from}&to=${to}`, { cache: "no-store", headers: { Accept: "application/json" } })
      .then(response => response.ok ? response.json() : Promise.reject(new Error("availability")))
      .then((payload: AvailabilityPayload) => {
        if (!payload.ok || payload.db === false) return;
        setData(payload);
        row.classList.add("booking-availability-enhanced");
        date.setAttribute("aria-hidden", "true");
        time.setAttribute("aria-hidden", "true");
      })
      .catch(() => {
        // Native date/time inputs remain visible as a safe fallback.
      });

    return () => {
      languageObserver.disconnect();
      row.classList.remove("booking-availability-enhanced");
    };
  }, []);

  const fullDays = useMemo(() => new Set(data?.fullDays ?? []), [data]);
  const blocksByDate = useMemo(() => {
    const map = new Map<string, PartialBlock[]>();
    for (const block of data?.blocks ?? []) map.set(block.date, [...(map.get(block.date) ?? []), block]);
    return map;
  }, [data]);
  const bookedByDate = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const booking of data?.bookedStarts ?? []) {
      const set = map.get(booking.date) ?? new Set<string>();
      set.add(booking.time.slice(0, 5));
      map.set(booking.date, set);
    }
    return map;
  }, [data]);

  const isTimeBlocked = (date: string, time: string) => {
    if (fullDays.has(date)) return true;
    if (bookedByDate.get(date)?.has(time)) return true;
    const minute = minutes(time);
    return (blocksByDate.get(date) ?? []).some(block => minute >= minutes(block.start) && minute < minutes(block.end));
  };

  const freeSlotsFor = (date: string) => slots.filter(time => !isTimeBlocked(date, time));
  const dayDisabled = (date: string) => date < todayLocal() || fullDays.has(date) || freeSlotsFor(date).length === 0;
  const dayPartial = (date: string) => !dayDisabled(date) && ((blocksByDate.get(date)?.length ?? 0) > 0 || (bookedByDate.get(date)?.size ?? 0) > 0);

  const monthCells = useMemo(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const first = new Date(year, month, 1);
    const mondayOffset = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: Array<{ day: number; date: string } | null> = Array(mondayOffset).fill(null);
    for (let day = 1; day <= daysInMonth; day += 1) cells.push({ day, date: isoDate(year, month, day) });
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [viewMonth]);

  if (!target || !dateInput || !timeInput || !data) return null;
  const t = copy[locale];
  const intlLocale = locale === "uk" ? "uk-UA" : locale === "ru" ? "ru-RU" : locale === "en" ? "en-GB" : "fi-FI";
  const monthTitle = new Intl.DateTimeFormat(intlLocale, { month: "long", year: "numeric" }).format(viewMonth);
  const weekdays = Array.from({ length: 7 }, (_, i) => new Intl.DateTimeFormat(intlLocale, { weekday: "short" }).format(new Date(2024, 0, 1 + i)));
  const freeTimes = selectedDate ? freeSlotsFor(selectedDate) : [];

  const chooseDate = (date: string) => {
    if (dayDisabled(date)) return;
    setSelectedDate(date);
    setSelectedTime("");
    dateInput.value = date;
    timeInput.value = "";
    dateInput.dispatchEvent(new Event("change", { bubbles: true }));
  };

  const chooseTime = (time: string) => {
    if (!selectedDate || isTimeBlocked(selectedDate, time)) return;
    setSelectedTime(time);
    timeInput.value = time;
    timeInput.dispatchEvent(new Event("change", { bubbles: true }));
  };

  const canPrevious = viewMonth.getFullYear() > now.getFullYear() || viewMonth.getMonth() > now.getMonth();
  const maxMonth = new Date(now.getFullYear(), now.getMonth() + 5, 1);
  const canNext = viewMonth < maxMonth;

  return createPortal(
    <div className="booking-availability-picker">
      <div className="availability-title"><CalendarDays /><div><strong>{t.date}</strong><small>{t.hint}</small></div></div>
      <div className="availability-calendar">
        <div className="availability-month-head">
          <button type="button" onClick={() => canPrevious && setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))} disabled={!canPrevious} aria-label="Previous month"><ChevronLeft /></button>
          <strong>{monthTitle}</strong>
          <button type="button" onClick={() => canNext && setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))} disabled={!canNext} aria-label="Next month"><ChevronRight /></button>
        </div>
        <div className="availability-weekdays">{weekdays.map(day => <span key={day}>{day}</span>)}</div>
        <div className="availability-days">
          {monthCells.map((cell, index) => cell ? <button
            type="button"
            key={cell.date}
            className={`${selectedDate === cell.date ? "selected" : ""} ${dayDisabled(cell.date) ? "blocked" : ""} ${dayPartial(cell.date) ? "partial" : ""}`}
            disabled={dayDisabled(cell.date)}
            onClick={() => chooseDate(cell.date)}
            title={dayDisabled(cell.date) ? t.unavailable : dayPartial(cell.date) ? t.partial : ""}
          ><span>{cell.day}</span>{dayPartial(cell.date) && <i />}</button> : <span className="availability-empty" key={`empty-${index}`} />)}
        </div>
      </div>

      <div className={`availability-times ${selectedDate ? "active" : ""}`}>
        <div className="availability-time-head"><Clock3 /><strong>{t.time}</strong>{selectedDate && <span>{new Intl.DateTimeFormat(intlLocale, { day: "numeric", month: "short" }).format(new Date(`${selectedDate}T12:00:00`))}</span>}</div>
        {!selectedDate ? <p>{t.date}</p> : freeTimes.length === 0 ? <p><LockKeyhole />{t.noTimes}</p> : <div className="availability-time-grid">
          {slots.map(time => {
            const blocked = isTimeBlocked(selectedDate, time);
            return <button type="button" key={time} disabled={blocked} className={selectedTime === time ? "selected" : ""} onClick={() => chooseTime(time)}>{time}</button>;
          })}
        </div>}
      </div>
    </div>,
    target,
  );
}
