"use client";

import { useEffect } from "react";

function helsinkiToday() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Helsinki",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const value = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

export default function BookingDateFloor() {
  useEffect(() => {
    const today = helsinkiToday();
    const apply = (input: HTMLInputElement) => {
      if (input.type === "date") input.min = today;
    };

    document.querySelectorAll<HTMLInputElement>('input[type="date"]').forEach(apply);

    const onFocusIn = (event: FocusEvent) => {
      if (event.target instanceof HTMLInputElement) apply(event.target);
    };
    document.addEventListener("focusin", onFocusIn);
    return () => document.removeEventListener("focusin", onFocusIn);
  }, []);

  return null;
}
