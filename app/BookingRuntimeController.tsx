"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, Check, CheckCircle2, Copy, KeyRound, Link2, MessageCircle, X } from "lucide-react";

type Locale = "fi" | "en" | "uk" | "ru";
type CopiedTarget = "" | "link" | "key";

type BookingResult = {
  bookingId: string;
  trackingPath: string;
  accessKey: string;
  warning?: string;
};

const CALCULATOR_SNAPSHOT_KEY = "muuttobotti-calculator-snapshot";

const labels = {
  fi: {
    success: "Varaus vastaanotettu!",
    saved: "Varaus on tallennettu. Säilytä varausnumero, pääsykoodi ja yksityinen seurantalinkki.",
    tracking: "Avaa seuranta",
    error: "Varausta ei voitu lähettää. Yritä uudelleen tai lähetä tiedot WhatsAppissa.",
    fallback: "Verkkotallennus ei ole juuri nyt käytettävissä. Avaamme valmiiksi täytetyn WhatsApp-varauksen.",
    whatsapp: "Avaa WhatsApp",
    booking: "Varausnumero",
    privateLink: "Yksityinen seurantalinkki",
    accessCode: "Yksityinen pääsykoodi",
    copyLink: "Kopioi linkki",
    copyCode: "Kopioi koodi",
    copied: "Kopioitu",
    sendWhatsapp: "Lähetä WhatsAppiin",
    privateNote: "Pidä tämä linkki ja pääsykoodi yksityisenä. Niillä voi nähdä ja hallita varausta.",
  },
  en: {
    success: "Booking received!",
    saved: "Your booking is saved. Keep the booking number, access code and private tracking link.",
    tracking: "Open tracking",
    error: "The booking could not be sent. Please try again or send the details on WhatsApp.",
    fallback: "Online storage is temporarily unavailable. We are opening a pre-filled WhatsApp booking.",
    whatsapp: "Open WhatsApp",
    booking: "Booking number",
    privateLink: "Private tracking link",
    accessCode: "Private access code",
    copyLink: "Copy link",
    copyCode: "Copy code",
    copied: "Copied",
    sendWhatsapp: "Send to WhatsApp",
    privateNote: "Keep this link and access code private. They can be used to view and manage the booking.",
  },
  uk: {
    success: "Заявку отримано!",
    saved: "Заявку збережено. Збережіть номер, код доступу та приватне посилання для відстеження.",
    tracking: "Відкрити відстеження",
    error: "Не вдалося надіслати заявку. Спробуйте ще раз або надішліть дані у WhatsApp.",
    fallback: "Онлайн-збереження тимчасово недоступне. Відкриваємо заповнену заявку у WhatsApp.",
    whatsapp: "Відкрити WhatsApp",
    booking: "Номер заявки",
    privateLink: "Приватне посилання",
    accessCode: "Приватний код доступу",
    copyLink: "Копіювати посилання",
    copyCode: "Копіювати код",
    copied: "Скопійовано",
    sendWhatsapp: "Надіслати у WhatsApp",
    privateNote: "Не передавайте це посилання та код стороннім. Вони дають доступ до перегляду й керування заявкою.",
  },
  ru: {
    success: "Заявка получена!",
    saved: "Заявка сохранена. Сохраните номер, код доступа и приватную ссылку для отслеживания.",
    tracking: "Открыть отслеживание",
    error: "Не удалось отправить заявку. Попробуйте ещё раз или отправьте данные в WhatsApp.",
    fallback: "Онлайн-хранилище временно недоступно. Открываем заполненную заявку в WhatsApp.",
    whatsapp: "Открыть WhatsApp",
    booking: "Номер заявки",
    privateLink: "Приватная ссылка",
    accessCode: "Приватный код доступа",
    copyLink: "Копировать ссылку",
    copyCode: "Копировать код",
    copied: "Скопировано",
    sendWhatsapp: "Отправить в WhatsApp",
    privateNote: "Не передавайте эту ссылку и код посторонним. Они дают доступ к просмотру и управлению заявкой.",
  },
} as const;

function getLocale(): Locale {
  const lang = document.documentElement.lang;
  return lang === "en" || lang === "uk" || lang === "ru" ? lang : "fi";
}

function attachLeadContext(data: FormData) {
  const url = new URL(window.location.href);
  data.set("page_url", `${url.origin}${url.pathname}${url.search}`.slice(0, 1000));
  data.set("referer", document.referrer.slice(0, 1000));
  data.set("client_locale", getLocale());

  try {
    data.set("client_timezone", Intl.DateTimeFormat().resolvedOptions().timeZone || "");
  } catch {
    data.set("client_timezone", "");
  }

  data.set(
    "client_screen",
    `${window.screen.width}x${window.screen.height}@${window.devicePixelRatio || 1}`.slice(0, 80),
  );

  for (const [key, field] of [
    ["utm_source", "utm_source"],
    ["utm_medium", "utm_medium"],
    ["utm_campaign", "utm_campaign"],
  ] as const) {
    const value = url.searchParams.get(key);
    if (value) data.set(field, value.slice(0, 160));
  }

  try {
    const raw = sessionStorage.getItem(CALCULATOR_SNAPSHOT_KEY);
    if (!raw) return;
    const snapshot = JSON.parse(raw) as { mode?: string };
    const service = String(data.get("service") ?? "");
    if (snapshot?.mode === service) data.set("calculator_snapshot", raw.slice(0, 6000));
  } catch {
    // Calculator metadata is optional and must never block a booking.
  }
}

async function copyToClipboard(value: string) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

export default function BookingRuntimeController() {
  const [locale, setLocale] = useState<Locale>("fi");
  const [result, setResult] = useState<BookingResult | null>(null);
  const [error, setError] = useState("");
  const [fallbackUrl, setFallbackUrl] = useState("");
  const [fallbackNotice, setFallbackNotice] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState<CopiedTarget>("");

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
      setCopied("");

      try {
        const data = new FormData(form);
        const pickup = String(data.get("pickup") ?? "").trim();
        const destination = String(data.get("destination") ?? "").trim();
        if (!destination) data.set("destination", pickup);
        attachLeadContext(data);

        const response = await fetch("/api/bookings", {
          method: "POST",
          body: data,
          headers: { Accept: "application/json" },
        });

        const payload = await response.json().catch(() => ({})) as {
          bookingId?: string;
          trackingPath?: string;
          accessKey?: string;
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

        if (!response.ok || !payload.bookingId || !payload.trackingPath || !payload.accessKey) {
          throw new Error(payload.error || "Booking request failed");
        }

        setResult({
          bookingId: payload.bookingId,
          trackingPath: payload.trackingPath,
          accessKey: payload.accessKey,
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

  const trackingUrl = useMemo(() => {
    if (!result || typeof window === "undefined") return "";
    return new URL(result.trackingPath, window.location.origin).href;
  }, [result]);

  if (!mounted) return null;
  const t = labels[locale];

  const handleCopy = async (target: Exclude<CopiedTarget, "">, value: string) => {
    try {
      await copyToClipboard(value);
      setCopied(target);
      window.setTimeout(() => setCopied(current => current === target ? "" : current), 1800);
    } catch (copyError) {
      console.error("Clipboard copy failed", copyError);
    }
  };

  const whatsappShareUrl = result && trackingUrl
    ? `https://wa.me/?text=${encodeURIComponent(`${t.booking}: ${result.bookingId}\n${t.privateLink}: ${trackingUrl}`)}`
    : "";

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
        <div className="success-card booking-success-v61">
          <div className="success-status-icon"><CheckCircle2 /></div>
          <h3>{t.success}</h3>
          <p>{t.saved}</p>

          <div className="booking-reference booking-success-primary">
            <span>{t.booking}</span>
            <strong>{result.bookingId}</strong>
          </div>

          <div className="booking-private-data">
            <div className="booking-private-row">
              <div className="booking-private-heading"><Link2 /><span>{t.privateLink}</span></div>
              <code>{trackingUrl}</code>
              <button type="button" onClick={() => void handleCopy("link", trackingUrl)}>
                {copied === "link" ? <Check /> : <Copy />}
                {copied === "link" ? t.copied : t.copyLink}
              </button>
            </div>
            <div className="booking-private-row">
              <div className="booking-private-heading"><KeyRound /><span>{t.accessCode}</span></div>
              <code>{result.accessKey}</code>
              <button type="button" onClick={() => void handleCopy("key", result.accessKey)}>
                {copied === "key" ? <Check /> : <Copy />}
                {copied === "key" ? t.copied : t.copyCode}
              </button>
            </div>
          </div>

          <div className="booking-private-note"><KeyRound /><span>{t.privateNote}</span></div>

          <div className="success-actions booking-success-actions-v61">
            <a className="booking-open-tracking" href={result.trackingPath}>{t.tracking}<ArrowRight /></a>
            <a className="booking-share-whatsapp" href={whatsappShareUrl} target="_blank" rel="noreferrer"><MessageCircle />{t.sendWhatsapp}</a>
          </div>
          <button className="success-close" onClick={() => { setResult(null); setCopied(""); }}>OK</button>
        </div>
      </div>,
      document.body,
    )}
  </>;
}
