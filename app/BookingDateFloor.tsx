"use client";

import { useEffect } from "react";

function helsinkiNow() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Helsinki",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const value = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return {
    date: `${value.year}-${value.month}-${value.day}`,
    time: `${value.hour}:${value.minute}`,
  };
}

function applyScheduleFloor(input: HTMLInputElement) {
  const now = helsinkiNow();
  if (input.type === "date") {
    input.min = now.date;
    const form = input.form;
    const timeInput = form?.querySelector<HTMLInputElement>('input[type="time"][name="time"]');
    if (timeInput) timeInput.min = input.value === now.date ? now.time : "";
    return;
  }

  if (input.type === "time") {
    const form = input.form;
    const dateInput = form?.querySelector<HTMLInputElement>('input[type="date"][name="date"]');
    input.min = dateInput?.value === now.date ? now.time : "";
  }
}

export default function BookingDateFloor() {
  useEffect(() => {
    const applyAll = () => {
      document.querySelectorAll<HTMLInputElement>('input[type="date"], input[type="time"]').forEach(applyScheduleFloor);
    };

    applyAll();

    const onFocusIn = (event: FocusEvent) => {
      if (event.target instanceof HTMLInputElement) applyScheduleFloor(event.target);
    };
    const onChange = (event: Event) => {
      if (event.target instanceof HTMLInputElement && event.target.type === "date") {
        applyScheduleFloor(event.target);
      }
    };

    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("change", onChange);
    return () => {
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("change", onChange);
    };
  }, []);

  return null;
}
