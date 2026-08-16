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
  subtitle: "Muuttobotti AI has prepared your estimate.",
  mode: "Moving",
  price: "— €",
  hours: "— h",
  chips: [],
  note: "Final price is confirmed before the booking.",
};

function copyFor(firstTab: string) {
  if (firstTab.includes("Переїзд")) return { title: "Ваш план переїзду готовий", subtitle: "Muuttobotti AI підготував вашу оцінку.", note: "Остаточну ціну підтвердимо до бронювання.", movers: "вантажники" };
  if (firstTab.includes("Переезд")) return { title: "Ваш план переезда готов", subtitle: "Muuttobotti AI подготовил ваш расчёт.", note: "Финальная цена подтверждается до бронирования.", movers: "грузчика" };
  if (firstTab.includes("Muutto")) return { title: "Muuttosuunnitelmasi on valmis", subtitle: "Muuttobotti AI kokosi arviosi.", note: "Lopullinen hinta vahvistetaan ennen varausta.", movers: "muuttajaa" };
  return { title: "Your move plan is ready", subtitle: "Muuttobotti AI has prepared your estimate.", note: "Final price is confirmed before the booking.", movers: "movers" };
}

function progressFor(el: Element) {
  const rect = el.getBoundingClientRect();
  const viewport = window.innerHeight || 1;
  return Math.max(0, Math.min(1, (viewport - rect.top) / (viewport + rect.height)));
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

    const motionSections = [
      document.querySelector<HTMLElement>(".hero"),
      document.querySelector<HTMLElement>(".services-section"),
      document.querySelector<HTMLElement>(".calculator-section"),
      document.querySelector<HTMLElement>(".process-section"),
      document.querySelector<HTMLElement>(".reviews-section"),
      booking,
    ].filter((value): value is HTMLElement => Boolean(value));

    let ticking = false;
    const draw = () => {
      ticking = false;
      motionSections.forEach((section, index) => {
        const p = progressFor(section);
        const centered = p - 0.5;
        section.style.setProperty("--mb-motion-y", `${(-centered * (34 + index * 4)).toFixed(1)}px`);
        section.style.setProperty("--mb-motion-x", `${(centered * (index % 2 ? 42 : -34)).toFixed(1)}px`);
        section.style.setProperty("--mb-motion-scale", `${(1.055 - Math.abs(centered) * 0.055).toFixed(3)}`);
        section.style.setProperty("--mb-motion-rotate", `${(centered * (index % 2 ? 2.1 : -1.6)).toFixed(2)}deg`);
        section.style.setProperty("--mb-motion-opacity", `${Math.max(0.45, 1 - Math.abs(centered) * 0.55).toFixed(3)}`);
        section.style.setProperty("--mb-motion-clip", `${Math.max(0, 10 - p * 18).toFixed(2)}%`);
      });
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(draw);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", draw);
    draw();

    return () => {
      calculator.removeEventListener("input", scheduleRead);
      calculator.removeEventListener("change", scheduleRead);
      calculator.removeEventListener("click", scheduleRead);
      observer.disconnect();
      form.removeEventListener("formdata", onFormData);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", draw);
      host?.remove();
    };
  }, []);

  const summary = useMemo(() => plan.chips.join(" · "), [plan.chips]);
  if (!mount) return null;

  return createPortal(
    <section className="mb-move-plan" aria-live="polite">
      <div className="mb-plan-eyebrow"><span /> MUUTTOBOTTI AI · PLAN READY</div>
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
