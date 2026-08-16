"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Plan = {
  title: string;
  subtitle: string;
  mode: string;
  price: string;
  hours: string;
  chips: string[];
  note: string;
  cta: string;
};

const initialPlan: Plan = {
  title: "Your move plan is ready",
  subtitle: "Your estimate is summarized from the choices above.",
  mode: "Moving",
  price: "— €",
  hours: "— h",
  chips: [],
  note: "We confirm the final price before the job.",
  cta: "Finish booking",
};

function localeCopy(firstTab: string) {
  if (firstTab.includes("Переїзд")) return {
    title: "Ваш план переїзду готовий",
    subtitle: "Ми зібрали розрахунок із вибраних вище параметрів.",
    note: "Остаточну ціну підтвердимо до виконання роботи.",
    movers: "вантажники",
    cta: "Завершити бронювання",
  };
  if (firstTab.includes("Переезд")) return {
    title: "Ваш план переезда готов",
    subtitle: "Мы собрали расчёт из выбранных выше параметров.",
    note: "Финальную цену подтвердим до выполнения работы.",
    movers: "грузчика",
    cta: "Завершить бронирование",
  };
  if (firstTab.includes("Muutto")) return {
    title: "Muuttosuunnitelmasi on valmis",
    subtitle: "Kokosimme arvion yllä valitsemistasi tiedoista.",
    note: "Vahvistamme lopullisen hinnan ennen työn suorittamista.",
    movers: "muuttajaa",
    cta: "Viimeistele varaus",
  };
  return {
    title: "Your move plan is ready",
    subtitle: "Your estimate is summarized from the choices above.",
    note: "We confirm the final price before the job.",
    movers: "movers",
    cta: "Finish booking",
  };
}

export default function MovePlanBridge() {
  const [mount, setMount] = useState<HTMLElement | null>(null);
  const [plan, setPlan] = useState<Plan>(initialPlan);
  const currentPlan = useRef<Plan>(initialPlan);
  const formRef = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    const booking = document.querySelector<HTMLElement>(".booking-section");
    const form = booking?.querySelector<HTMLFormElement>(".booking-form") ?? null;
    const calculator = document.querySelector<HTMLElement>(".calculator-section");
    if (!booking || !form || !calculator) return;

    formRef.current = form;
    let host = document.getElementById("mb-plan-host");
    if (!host) {
      host = document.createElement("div");
      host.id = "mb-plan-host";
      booking.insertBefore(host, form);
    }
    setMount(host);

    const readPlan = () => {
      const tabs = [...calculator.querySelectorAll<HTMLButtonElement>(".calc-tabs button")];
      const activeIndex = Math.max(0, tabs.findIndex(button => button.classList.contains("active")));
      const firstTab = tabs[0]?.textContent?.trim() ?? "Moving";
      const locale = localeCopy(firstTab);
      const mode = tabs[activeIndex]?.textContent?.trim() ?? firstTab;
      const price = calculator.querySelector<HTMLElement>(".estimate-box strong:not(.time-estimate)")?.textContent?.trim() ?? "— €";
      const hours = calculator.querySelector<HTMLElement>(".time-estimate")?.textContent?.trim() ?? "— h";
      const values = [...calculator.querySelectorAll<HTMLElement>(".range-value")]
        .map(node => node.textContent?.trim())
        .filter((value): value is string => Boolean(value));
      const chips: string[] = [];

      if (activeIndex === 0) {
        if (values[0]) chips.push(values[0]);
        if (values[2]) chips.push(values[2]);
        const moverButtons = [...calculator.querySelectorAll<HTMLButtonElement>(".mover-selector button")];
        const moverIndex = Math.max(0, moverButtons.findIndex(button => button.classList.contains("active")));
        chips.push(`${moverIndex + 1} ${locale.movers}`);
        [...calculator.querySelectorAll<HTMLButtonElement>(".switch-grid button.on")]
          .slice(0, 3)
          .forEach(button => {
            const label = button.textContent?.replace(/\s+/g, " ").trim();
            if (label) chips.push(label);
          });
      } else {
        values.slice(0, 2).forEach(value => chips.push(value));
      }

      const next: Plan = {
        title: locale.title,
        subtitle: locale.subtitle,
        mode,
        price,
        hours,
        chips,
        note: locale.note,
        cta: locale.cta,
      };
      currentPlan.current = next;
      setPlan(next);
    };

    let frame = 0;
    const schedule = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(readPlan);
    };

    calculator.addEventListener("input", schedule);
    calculator.addEventListener("change", schedule);
    calculator.addEventListener("click", schedule);
    const observer = new MutationObserver(schedule);
    const estimate = calculator.querySelector(".estimate-box");
    if (estimate) observer.observe(estimate, { subtree: true, childList: true, characterData: true });

    const onFormData = (event: Event) => {
      const data = (event as FormDataEvent).formData;
      const summary = currentPlan.current;
      data.set("calculator_estimate", summary.price);
      data.set("calculator_plan", [summary.mode, ...summary.chips, summary.hours].join(" · "));
    };
    form.addEventListener("formdata", onFormData);
    readPlan();

    return () => {
      calculator.removeEventListener("input", schedule);
      calculator.removeEventListener("change", schedule);
      calculator.removeEventListener("click", schedule);
      observer.disconnect();
      form.removeEventListener("formdata", onFormData);
      if (frame) cancelAnimationFrame(frame);
      formRef.current = null;
      host?.remove();
    };
  }, []);

  const summary = useMemo(() => plan.chips.join(" · "), [plan.chips]);
  if (!mount) return null;

  const finishBooking = () => {
    const form = formRef.current;
    if (!form) return;
    form.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => form.querySelector<HTMLInputElement>('input[name="name"]')?.focus(), 420);
  };

  return createPortal(
    <section className="mb-move-plan" aria-live="polite">
      <div className="mb-plan-eyebrow"><span /> SMART ESTIMATE · PLAN READY</div>
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
      <div className="mb-plan-footer">
        <div className="mb-plan-note">{plan.note}</div>
        <button className="mb-plan-cta" type="button" onClick={finishBooking}>{plan.cta}<span>↘</span></button>
      </div>
    </section>,
    mount,
  );
}
