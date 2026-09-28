"use client";

import { useEffect } from "react";
import { bookingWindowBounds } from "../booking-window";

export default function TrackingDateGuard() {
  useEffect(() => {
    const applyBounds = () => {
      const input = document.querySelector<HTMLInputElement>('.tracking-modal input[name="date"]');
      if (!input) return;
      const { today, maxDate } = bookingWindowBounds();
      input.min = today;
      input.max = maxDate;
    };

    applyBounds();
    const observer = new MutationObserver(applyBounds);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return null;
}
