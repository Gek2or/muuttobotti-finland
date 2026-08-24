"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, MessageCircle, ArrowRight } from "lucide-react";
import { faqContent, faqHeadings, type FaqLocale } from "./faq-content";

type FaqCategory = "all" | "moving" | "cleaning" | "transport" | "booking";

const questionCategories: FaqCategory[] = [
  "moving", "moving", "moving", "moving", "moving", "transport",
  "moving", "moving", "moving", "cleaning", "cleaning", "transport",
  "transport", "booking", "booking", "booking", "booking", "booking",
];

const categoryLabels: Record<FaqLocale, Record<FaqCategory, string>> = {
  fi: { all: "Kaikki", moving: "Muutto", cleaning: "Siivous", transport: "Kuljetus", booking: "Varaus" },
  en: { all: "All", moving: "Moving", cleaning: "Cleaning", transport: "Transport", booking: "Booking" },
  uk: { all: "Усі", moving: "Переїзд", cleaning: "Прибирання", transport: "Перевезення", booking: "Бронювання" },
  ru: { all: "Все", moving: "Переезд", cleaning: "Уборка", transport: "Перевозка", booking: "Бронирование" },
};

function normalizeLocale(value: string | null): FaqLocale {
  if (value === "en" || value === "uk" || value === "ru") return value;
  return "fi";
}

export default function FaqPortal() {
  const [target, setTarget] = useState<Element | null>(null);
  const [locale, setLocale] = useState<FaqLocale>("fi");
  const [category, setCategory] = useState<FaqCategory>("all");

  useEffect(() => {
    const reviews = document.querySelector(".reviews-section");
    setTarget(reviews);
    setLocale(normalizeLocale(document.documentElement.lang));

    const observer = new MutationObserver(() => {
      setLocale(normalizeLocale(document.documentElement.lang));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setCategory("all");
  }, [locale]);

  const filteredQuestions = useMemo(() => {
    return faqContent[locale]
      .map((entry, index) => ({ entry, index, category: questionCategories[index] ?? "booking" }))
      .filter((item) => category === "all" || item.category === category);
  }, [locale, category]);

  if (!target) return null;

  const heading = faqHeadings[locale];
  const labels = categoryLabels[locale];
  const categories: FaqCategory[] = ["all", "moving", "cleaning", "transport", "booking"];

  const categoryCount = (item: FaqCategory) => {
    if (item === "all") return faqContent[locale].length;
    return questionCategories.filter((value) => value === item).length;
  };

  return createPortal(
    <section className="art-faq" id="faq" aria-labelledby="faq-title">
      <div className="art-faq-head">
        <div>
          <span className="kicker">{heading.kicker}</span>
          <h2 id="faq-title">{heading.title}</h2>
        </div>
        <p>{heading.intro}</p>
      </div>

      <div className="art-faq-filters" role="tablist" aria-label={heading.kicker}>
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={category === item}
            className={category === item ? "active" : ""}
            onClick={() => setCategory(item)}
          >
            <span>{labels[item]}</span>
            <small>{categoryCount(item)}</small>
          </button>
        ))}
      </div>

      <div className="art-faq-grid">
        {filteredQuestions.map(({ entry: [question, answer] }, index) => (
          <details key={`${category}-${question}`} open={index === 0 ? true : undefined}>
            <summary>
              <span>{question}</span>
              <ChevronDown aria-hidden="true" />
            </summary>
            <p>{answer}</p>
          </details>
        ))}
      </div>

      <div className="art-faq-cta">
        <div>
          <strong>{heading.title}</strong>
          <span>{heading.intro}</span>
        </div>
        <div>
          <a href="#booking">{heading.booking}<ArrowRight /></a>
          <a href="https://wa.me/3584578767567" target="_blank" rel="noreferrer"><MessageCircle />{heading.whatsapp}</a>
        </div>
      </div>
    </section>,
    target,
  );
}
