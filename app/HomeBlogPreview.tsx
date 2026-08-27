"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, CalendarDays, CheckCircle2, Navigation } from "lucide-react";

type Locale = "fi" | "en" | "uk" | "ru";

const SORO_EMBED_URL =
  "https://app.trysoro.com/api/embed/564b9f0a-6fd7-4cbb-9a53-c3748cfd677a?theme=light";

const copy: Record<
  Locale,
  {
    kicker: string;
    title: string;
    text: string;
    cta: string;
    processLabel: string;
    steps: [string, string][];
  }
> = {
  fi: {
    kicker: "Muutto-opas",
    title: "Ajankohtaista muutosta, hinnoista ja arjen logistiikasta.",
    text: "Tuoreimmat oppaat ja käytännön vinkit suoraan Muuttobotin blogista.",
    cta: "Avaa koko blogi",
    processLabel: "Näin varaus etenee",
    steps: [
      ["Kerro mitä tarvitset", "Osoitteet, aika ja tärkeimmät tiedot."],
      ["Saat vahvistuksen", "Vahvistamme hinnan ja ajan ennen työtä."],
      ["Seuraa varausta", "Saat yksityisen seurantalinkin."],
    ],
  },
  en: {
    kicker: "Moving guide",
    title: "Fresh advice on moving, pricing and everyday logistics.",
    text: "The latest practical guides and tips from the Muuttobotti blog.",
    cta: "Open the full blog",
    processLabel: "How your booking works",
    steps: [
      ["Tell us what you need", "Addresses, time and the key details."],
      ["Get confirmation", "We confirm price and time before the job."],
      ["Track the booking", "You receive a private tracking link."],
    ],
  },
  uk: {
    kicker: "Гід з переїзду",
    title: "Актуально про переїзди, ціни та щоденну логістику.",
    text: "Нові практичні поради та матеріали з блогу Muuttobotti.",
    cta: "Відкрити весь блог",
    processLabel: "Як проходить бронювання",
    steps: [
      ["Розкажіть, що потрібно", "Адреси, час і головні деталі."],
      ["Отримайте підтвердження", "Підтвердимо ціну та час до роботи."],
      ["Відстежуйте замовлення", "Отримаєте приватне посилання."],
    ],
  },
  ru: {
    kicker: "Гид по переезду",
    title: "Актуально о переездах, ценах и повседневной логистике.",
    text: "Свежие практические советы и материалы из блога Muuttobotti.",
    cta: "Открыть весь блог",
    processLabel: "Как проходит заказ",
    steps: [
      ["Расскажите, что нужно", "Адреса, время и главные детали."],
      ["Получите подтверждение", "Подтвердим цену и время до работы."],
      ["Следите за заказом", "Получите приватную ссылку отслеживания."],
    ],
  },
};

function normalizeLocale(value: string | null | undefined): Locale {
  const code = (value || "fi").toLowerCase().slice(0, 2);
  return code === "en" || code === "uk" || code === "ru" ? code : "fi";
}

function blogHref(locale: Locale) {
  return locale === "fi" ? "/blog" : `/blog?lang=${locale}`;
}

export default function HomeBlogPreview() {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const [locale, setLocale] = useState<Locale>("fi");
  const [shouldLoadBlog, setShouldLoadBlog] = useState(false);

  useEffect(() => {
    const section = document.querySelector<HTMLElement>(".process-section");
    if (!section) return;

    setTarget(section);
    setLocale(normalizeLocale(document.documentElement.lang));

    const languageObserver = new MutationObserver(() => {
      setLocale(normalizeLocale(document.documentElement.lang));
    });
    languageObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["lang"],
    });

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoadBlog(true);
          intersectionObserver.disconnect();
        }
      },
      { rootMargin: "700px 0px" },
    );
    intersectionObserver.observe(section);

    return () => {
      languageObserver.disconnect();
      intersectionObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!shouldLoadBlog || !target) return;
    if (document.getElementById("muuttobotti-soro-home-preview")) return;

    const script = document.createElement("script");
    script.id = "muuttobotti-soro-home-preview";
    script.src = SORO_EMBED_URL;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, [shouldLoadBlog, target]);

  const t = useMemo(() => copy[locale], [locale]);
  const icons = [CalendarDays, CheckCircle2, Navigation];
  const href = blogHref(locale);

  if (!target) return null;

  return createPortal(
    <div className="home-blog-layout">
      <div className="home-blog-heading">
        <div>
          <span className="kicker">{t.kicker}</span>
          <h2>{t.title}</h2>
        </div>
        <div className="home-blog-intro">
          <p>{t.text}</p>
          <a href={href}>
            {t.cta}
            <ArrowRight size={18} />
          </a>
        </div>
      </div>

      <div className="home-blog-preview-shell" aria-label={t.kicker}>
        <div id="soro-blog" className="home-soro-preview" aria-live="polite">
          {!shouldLoadBlog && <div className="home-blog-skeleton" aria-hidden="true" />}
        </div>
        <div className="home-blog-preview-fade" aria-hidden="true" />
        <a className="home-blog-preview-cta" href={href}>
          {t.cta}
          <ArrowRight size={18} />
        </a>
      </div>

      <div className="process-quick-strip" aria-label={t.processLabel}>
        <strong className="process-quick-label">{t.processLabel}</strong>
        <div className="process-quick-items">
          {t.steps.map(([title, description], index) => {
            const Icon = icons[index];
            return (
              <div className="process-quick-item" key={title}>
                <span className="process-quick-number">0{index + 1}</span>
                <span className="process-quick-icon"><Icon size={19} /></span>
                <span className="process-quick-copy">
                  <strong>{title}</strong>
                  <small>{description}</small>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>,
    target,
  );
}
