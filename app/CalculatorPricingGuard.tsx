"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type Locale = "fi" | "en" | "uk" | "ru";

type Snapshot = {
  moving: boolean;
  minimum: boolean;
  movers: 1 | 2;
  minimumPrice: number;
  price: number;
  hoursText: string;
};

const labels: Record<Locale, { title: string; one: string; two: string }> = {
  fi: {
    title: "Minimiveloitus 2 h",
    one: "1 muuttaja × 59 €/h",
    two: "2 muuttajaa + iso Crafter × 75 €/h",
  },
  en: {
    title: "Minimum charge 2 h",
    one: "1 mover × €59/h",
    two: "2 movers + large Crafter × €75/h",
  },
  uk: {
    title: "Мінімальне замовлення 2 год",
    one: "1 вантажник × 59 €/год",
    two: "2 вантажники + великий Crafter × 75 €/год",
  },
  ru: {
    title: "Минимальный заказ 2 ч",
    one: "1 грузчик × 59 €/ч",
    two: "2 грузчика + большой Crafter × 75 €/ч",
  },
};

function localeFromDocument(): Locale {
  const lang = document.documentElement.lang;
  if (lang === "en" || lang === "uk" || lang === "ru") return lang;
  return "fi";
}

function calculatorSnapshot(): Snapshot | null {
  const calculator = document.querySelector<HTMLElement>(".calculator-section");
  if (!calculator) return null;

  const tabs = Array.from(calculator.querySelectorAll<HTMLButtonElement>(".calc-tabs button"));
  const activeTab = tabs.findIndex((button) => button.classList.contains("active"));
  const moving = activeTab === 0;

  const moverButtons = Array.from(calculator.querySelectorAll<HTMLButtonElement>(".mover-selector button"));
  const movers: 1 | 2 = moverButtons[1]?.classList.contains("active") ? 2 : 1;
  const hourlyRate = movers === 1 ? 59 : 75;
  const minimumPrice = hourlyRate * 2;

  if (!moving) {
    return { moving: false, minimum: false, movers, minimumPrice, price: minimumPrice, hoursText: "2.0 h" };
  }

  const ranges = Array.from(calculator.querySelectorAll<HTMLInputElement>('.calc-fields input[type="range"]'));
  if (ranges.length < 3) return null;

  const [sizeRange, floorRange, distanceRange] = ranges;
  const size = Number(sizeRange.value);
  const floor = Number(floorRange.value);
  const distance = Number(distanceRange.value);
  const sizeMin = Number(sizeRange.min || 0);
  const floorMin = Number(floorRange.min || 0);
  const distanceMin = Number(distanceRange.min || 0);

  const switches = Array.from(calculator.querySelectorAll<HTMLButtonElement>(".switch-grid button"));
  const elevator = switches[0]?.classList.contains("on") ?? false;
  const packing = switches[1]?.classList.contains("on") ?? false;
  const afterClean = switches[2]?.classList.contains("on") ?? false;

  const sizeExtra = Math.max(0, size - sizeMin);
  const floorExtra = Math.max(0, floor - floorMin - (elevator ? 2 : 0));
  const distanceExtra = Math.max(0, distance - distanceMin);

  // The minimum slider positions represent the minimum two-hour booking.
  // Only work above those baseline values adds time/cost.
  const handlingExtra = sizeExtra / 35 + floorExtra * 0.22 + (packing ? 1.5 : 0);
  const moverFactor = movers === 1 ? 1.35 : 1;
  const travelExtra = distanceExtra / 70;
  const hours = Math.max(2, 2 + handlingExtra * moverFactor + travelExtra);

  const transportSupplement = distanceExtra * 0.65;
  const cleaningSupplement = afterClean ? Math.max(0, size) * 1.1 : 0;
  const price = Math.max(minimumPrice, Math.round(hours * hourlyRate + transportSupplement + cleaningSupplement));

  const allRangesAtMinimum =
    size <= sizeMin && floor <= floorMin && distance <= distanceMin;
  const minimum = allRangesAtMinimum && !packing && !afterClean;
  const hoursText = minimum ? "2.0 h" : `${hours.toFixed(1)}–${(hours + 0.8).toFixed(1)} h`;

  return { moving, minimum, movers, minimumPrice, price, hoursText };
}

function setNativeTextareaValue(textarea: HTMLTextAreaElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")?.set;
  setter?.call(textarea, value);
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
}

export default function CalculatorPricingGuard() {
  const [target, setTarget] = useState<Element | null>(null);
  const [state, setState] = useState<Snapshot>({
    moving: true,
    minimum: false,
    movers: 2,
    minimumPrice: 150,
    price: 150,
    hoursText: "2.0 h",
  });
  const [locale, setLocale] = useState<Locale>("fi");

  useEffect(() => {
    const calculator = document.querySelector<HTMLElement>(".calculator-section");
    const card = calculator?.querySelector(".calculator-card") ?? null;
    setTarget(card);
    if (!calculator) return;

    let frame = 0;

    const sync = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const next = calculatorSnapshot();
        if (!next) return;

        setLocale(localeFromDocument());
        setState((current) => {
          if (
            current.moving === next.moving &&
            current.minimum === next.minimum &&
            current.movers === next.movers &&
            current.minimumPrice === next.minimumPrice &&
            current.price === next.price &&
            current.hoursText === next.hoursText
          ) return current;
          return next;
        });

        if (!next.moving) return;
        const estimate = calculator.querySelector<HTMLElement>(".estimate-box");
        if (!estimate) return;

        const priceNode = estimate.querySelectorAll<HTMLElement>("strong")[0];
        const durationNode = estimate.querySelector<HTMLElement>(".time-estimate");
        if (priceNode && priceNode.textContent?.trim() !== `${next.price} €`) {
          priceNode.textContent = `${next.price} €`;
        }
        if (durationNode && durationNode.textContent?.trim() !== next.hoursText) {
          durationNode.textContent = next.hoursText;
        }

        if (next.minimum) estimate.dataset.minimumCharge = "true";
        else delete estimate.dataset.minimumCharge;
      });
    };

    const handleInteraction = () => sync();
    calculator.addEventListener("input", handleInteraction, true);
    calculator.addEventListener("change", handleInteraction, true);
    calculator.addEventListener("click", handleInteraction, true);

    const handleContinue = (event: Event) => {
      const button = (event.target as Element | null)?.closest(".estimate-box button");
      if (!button) return;
      const current = calculatorSnapshot();
      if (!current?.moving) return;

      window.setTimeout(() => {
        const textarea = document.querySelector<HTMLTextAreaElement>('textarea[name="notes"]');
        if (!textarea) return;
        const corrected = textarea.value
          .replace(/\d+\s*€/, `${current.price} €`)
          .replace(/\d+(?:[.,]\d+)?(?:–\d+(?:[.,]\d+)?)?\s*h/, current.hoursText);
        if (corrected !== textarea.value) setNativeTextareaValue(textarea, corrected);
      }, 0);
    };

    calculator.addEventListener("click", handleContinue, true);

    const observer = new MutationObserver(sync);
    observer.observe(calculator, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["class"],
    });

    const langObserver = new MutationObserver(sync);
    langObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });

    sync();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      langObserver.disconnect();
      calculator.removeEventListener("input", handleInteraction, true);
      calculator.removeEventListener("change", handleInteraction, true);
      calculator.removeEventListener("click", handleInteraction, true);
      calculator.removeEventListener("click", handleContinue, true);
    };
  }, []);

  if (!target || !state.moving) return null;

  const text = labels[locale];
  return createPortal(
    <div className={`minimum-charge-note ${state.minimum ? "is-active" : ""}`}>
      <div>
        <span>{text.title}</span>
        <strong>{state.minimumPrice} €</strong>
      </div>
      <small>{state.movers === 1 ? text.one : text.two}</small>
    </div>,
    target,
  );
}
