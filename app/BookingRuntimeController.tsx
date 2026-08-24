"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, CheckCircle2, MessageCircle, X } from "lucide-react";

type Locale = "fi" | "en" | "uk" | "ru";

type BookingResult = {
  bookingId: string;
  trackingPath: string;
  warning?: string;
};

const labels = {
  fi: {
    success: "Varaus vastaanotettu!",
    saved: "Varaus on tallennettu. Säilytä varausnumero ja yksityinen seurantalinkki.",
    tracking: "Avaa seuranta",
    error: "Varausta ei voitu lähettää. Yritä uudelleen tai lähetä tiedot WhatsAppissa.",
    fallback: "Verkkotallennus ei ole juuri nyt käytettävissä. Avaamme valmiiksi täytetyn WhatsApp-varauksen.",
    whatsapp: "Avaa WhatsApp",
    booking: "Varausnumero",
  },
  en: {
    success: "Booking received!",
    saved: "Your booking is saved. Keep the booking number and private tracking link.",
    tracking: "Open tracking",
    error: "The booking could not be sent. Please try again or send the details on WhatsApp.",
    fallback: "Online storage is temporarily unavailable. We are opening a pre-filled WhatsApp booking.",
    whatsapp: "Open WhatsApp",
    booking: "Booking number",
  },
  uk: {
    success: "Заявку отримано!",
    saved: "Заявку збережено. Збережіть номер і приватне посилання для відстеження.",
    tracking: "Відкрити відстеження",
    error: "Не вдалося надіслати заявку. Спробуйте ще раз або надішліть дані у WhatsApp.",
    fallback: "Онлайн-збереження тимчасово недоступне. Відкриваємо заповнену заявку у WhatsApp.",
    whatsapp: "Відкрити WhatsApp",
    booking: "Номер заявки",
  },
  ru: {
    success: "Заявка получена!",
    saved: "Заявка сохранена. Сохраните номер и приватную ссылку для отслеживания.",
    tracking: "Открыть отслеживание",
    error: "Не удалось отправить заявку. Попробуйте ещё раз или отправьте данные в WhatsApp.",
    fallback: "Онлайн-хранилище временно недоступно. Открываем заполненную заявку в WhatsApp.",
    whatsapp: "Открыть WhatsApp",
    booking: "Номер заявки",
  },
} as const;

function getLocale(): Locale {
  const lang = document.documentElement.lang;
  return lang === "en" || lang === "uk" || lang === "ru" ? lang : "fi";
}

export default function BookingRuntimeController() {
  const [locale, setLocale] = useState<Locale>("fi");
  const [result, setResult] = useState<BookingResult | null>(null);
  const [error, setError] = useState("");
  const [fallbackUrl, setFallbackUrl] = useState("");
  const [fallbackNotice, setFallbackNotice] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setLocale(getLocale());

    const languageObserver = new MutationObserver(() => setLocale(getLocale()));
    languageObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });

    const form = document.querySelector<HTMLFormElement>(".booking-form");
    if (!form) return () => languageObserver.disconnect();

    const onSubmit = async (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      if (!form.reportValidity()) return;

      const submitButton = form.querySelector<HTMLButtonElement>(".submit-button");
      if (submitButton?.disabled) return;
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.setAttribute("aria-busy", "true");
      }

      setError("");
      setFallbackNotice(false);
      setFallbackUrl("");

      try {
        const data = new FormData(form);
        const pickup = String(data.get("pickup") ?? "").trim();
        const destination = String(data.get("destination") ?? "").trim();
        if (!destination) data.set("destination", pickup);

        const response = await fetch("/api/bookings", {
          method: "POST",
          body: data,
          headers: { Accept: "application/json" },
        });

        const payload = await response.json().catch(() => ({})) as {
          bookingId?: string;
          trackingPath?: string;
          fallback?: string;
          whatsappUrl?: string;
          warning?: string;
          error?: string;
        };

        if (payload.fallback === "whatsapp" && payload.whatsappUrl) {
          setFallbackUrl(payload.whatsappUrl);
          setFallbackNotice(true);
          window.setTimeout(() => window.location.assign(payload.whatsappUrl!), 250);
          return;
        }

        if (!response.ok || !payload.bookingId || !payload.trackingPath) {
          throw new Error(payload.error || "Booking request failed");
        }

        setResult({
          bookingId: payload.bookingId,
          trackingPath: payload.trackingPath,
          warning: payload.warning,
        });
        form.reset();
      } catch (requestError) {
        console.error("Booking submit failed", requestError);
        setError(labels[getLocale()].error);
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.removeAttribute("aria-busy");
        }
      }
    };

    form.addEventListener("submit", onSubmit, true);
    return () => {
      languageObserver.disconnect();
      form.removeEventListener("submit", onSubmit, true);
    };
  }, []);

  if (!mounted) return null;
  const t = labels[locale];

  return <>
    {error && createPortal(
      <div className="booking-runtime-error" role="alert">{error}</div>,
      document.body,
    )}

    {fallbackNotice && fallbackUrl && createPortal(
      <div className="booking-fallback-toast" role="status">
        <MessageCircle />
        <span>{t.fallback}</span>
        <a href={fallbackUrl}>{t.whatsapp}<ArrowRight /></a>
        <button onClick={() => setFallbackNotice(false)} aria-label="Close"><X /></button>
      </div>,
      document.body,
    )}

    {result && createPortal(
      <div className="success-overlay booking-runtime-success">
        <div className="success-card">
          <CheckCircle2 />
          <h3>{t.success}</h3>
          <p>{t.saved}</p>
          <div className="booking-reference">
            <span>{t.booking}</span>
            <strong>{result.bookingId}</strong>
          </div>
          <div className="success-actions">
            <a href={result.trackingPath}>{t.tracking}<ArrowRight /></a>
          </div>
          <button className="success-close" onClick={() => setResult(null)}>OK</button>
        </div>
      </div>,
      document.body,
    )}
  </>;
}
