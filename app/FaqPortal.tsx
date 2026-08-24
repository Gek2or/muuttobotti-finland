"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, MessageCircle, ArrowRight } from "lucide-react";
import { faqContent, faqHeadings, type FaqLocale } from "./faq-content";

function normalizeLocale(value: string | null): FaqLocale {
  if (value === "en" || value === "uk" || value === "ru") return value;
  return "fi";
}

export default function FaqPortal() {
  const [target, setTarget] = useState<Element | null>(null);
  const [locale, setLocale] = useState<FaqLocale>("fi");

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

  if (!target) return null;

  const heading = faqHeadings[locale];

  return createPortal(
    <section className="art-faq" id="faq" aria-labelledby="faq-title">
      <div className="art-faq-head">
        <div>
          <span className="kicker">{heading.kicker}</span>
          <h2 id="faq-title">{heading.title}</h2>
        </div>
        <p>{heading.intro}</p>
      </div>

      <div className="art-faq-grid">
        {faqContent[locale].map(([question, answer], index) => (
          <details key={question} open={index === 0 ? true : undefined}>
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
