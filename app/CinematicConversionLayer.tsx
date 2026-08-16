"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

type Plan = {
  title: string;
  subtitle: string;
  mode: string;
  price: string;
  hours: string;
  chips: string[];
  note: string;
};

const initialPlan: Plan = {
  title: "Your move plan is ready",
  subtitle: "Muuttobotti Smart Estimate prepared your estimate.",
  mode: "Moving",
  price: "— €",
  hours: "— h",
  chips: [],
  note: "Final price is confirmed before the booking.",
};

function copyFor(firstTab: string) {
  if (firstTab.includes("Переїзд")) return { title: "Ваш план переїзду готовий", subtitle: "Muuttobotti Smart Estimate підготував вашу оцінку.", note: "Остаточну ціну підтвердимо до бронювання.", movers: "вантажники" };
  if (firstTab.includes("Переезд")) return { title: "Ваш план переезда готов", subtitle: "Muuttobotti Smart Estimate подготовил ваш расчёт.", note: "Финальная цена подтверждается до бронирования.", movers: "грузчика" };
  if (firstTab.includes("Muutto")) return { title: "Muuttosuunnitelmasi on valmis", subtitle: "Muuttobotti Smart Estimate kokosi arviosi.", note: "Lopullinen hinta vahvistetaan ennen varausta.", movers: "muuttajaa" };
  return { title: "Your move plan is ready", subtitle: "Muuttobotti Smart Estimate prepared your estimate.", note: "Final price is confirmed before the booking.", movers: "movers" };
}

export default function CinematicConversionLayer() {
  const [mount, setMount] = useState<HTMLElement | null>(null);
  const [plan, setPlan] = useState<Plan>(initialPlan);

  useEffect(() => {
    const booking = document.querySelector<HTMLElement>(".booking-section");
    const form = booking?.querySelector<HTMLFormElement>(".booking-form") ?? null;
    const calculator = document.querySelector<HTMLElement>(".calculator-section");
    if (!booking || !form || !calculator) return;

    let host = document.getElementById("mb-plan-host");
    if (!host) {
      host = document.createElement("div");
      host.id = "mb-plan-host";
      booking.insertBefore(host, form);
    }
    setMount(host);

    let currentPlan = initialPlan;
    const readPlan = () => {
      const tabs = [...calculator.querySelectorAll<HTMLButtonElement>(".calc-tabs button")];
      const activeIndex = Math.max(0, tabs.findIndex(button => button.classList.contains("active")));
      const firstTab = tabs[0]?.textContent?.trim() ?? "Moving";
      const locale = copyFor(firstTab);
      const mode = tabs[activeIndex]?.textContent?.trim() ?? firstTab;
      const price = calculator.querySelector<HTMLElement>(".estimate-box strong")?.textContent?.trim() ?? "— €";
      const hours = calculator.querySelector<HTMLElement>(".time-estimate")?.textContent?.trim() ?? "— h";
      const values = [...calculator.querySelectorAll<HTMLElement>(".range-value")].map(node => node.textContent?.trim()).filter((value): value is string => Boolean(value));
      const chips: string[] = [];

      if (activeIndex === 0) {
        if (values[0]) chips.push(values[0]);
        if (values[2]) chips.push(values[2]);
        const moverButtons = [...calculator.querySelectorAll<HTMLButtonElement>(".mover-selector button")];
        const moverIndex = Math.max(0, moverButtons.findIndex(button => button.classList.contains("active")));
        chips.push(`${moverIndex + 1} ${locale.movers}`);
        const switches = [...calculator.querySelectorAll<HTMLButtonElement>(".switch-grid button.on")];
        switches.slice(0, 2).forEach(button => {
          const label = button.textContent?.trim();
          if (label) chips.push(label);
        });
      } else {
        values.slice(0, 2).forEach(value => chips.push(value));
      }

      currentPlan = { title: locale.title, subtitle: locale.subtitle, mode, price, hours, chips, note: locale.note };
      setPlan(currentPlan);
    };

    const scheduleRead = () => window.requestAnimationFrame(readPlan);
    calculator.addEventListener("input", scheduleRead);
    calculator.addEventListener("change", scheduleRead);
    calculator.addEventListener("click", scheduleRead);
    const observer = new MutationObserver(scheduleRead);
    const estimate = calculator.querySelector(".estimate-box");
    if (estimate) observer.observe(estimate, { subtree: true, childList: true, characterData: true });
    readPlan();

    const onFormData = (event: Event) => {
      const data = (event as FormDataEvent).formData;
      data.set("calculator_estimate", currentPlan.price);
      data.set("calculator_plan", [currentPlan.mode, ...currentPlan.chips, currentPlan.hours].join(" · "));
    };
    form.addEventListener("formdata", onFormData);

    return () => {
      calculator.removeEventListener("input", scheduleRead);
      calculator.removeEventListener("change", scheduleRead);
      calculator.removeEventListener("click", scheduleRead);
      observer.disconnect();
      form.removeEventListener("formdata", onFormData);
      host?.remove();
    };
  }, []);

  const summary = useMemo(() => plan.chips.join(" · "), [plan.chips]);
  if (!mount) return null;

  return createPortal(
    <section className="mb-move-plan" aria-live="polite">
      <div className="mb-plan-eyebrow"><span /> MUUTTOBOTTI / SMART ESTIMATE / PLAN READY</div>
      <div className="mb-plan-grid">
        <div>
          <h3>{plan.title}</h3>
          <p>{plan.subtitle}</p>
          {summary && <div className="mb-plan-chips">{plan.chips.map(chip => <span key={chip}>{chip}</span>)}</div>}
        </div>
        <div className="mb-plan-price">
          <small>{plan.mode}</small>
          <strong>{plan.price}</strong>
          <span>{plan.hours}</span>
        </div>
      </div>
      <div className="mb-plan-note">{plan.note}</div>
    </section>,
    mount,
  );
}
