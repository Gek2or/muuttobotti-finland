"use client";

import { useEffect } from "react";

function numberFrom(value: string | null | undefined, fallback = 0) {
  const match = value?.replace(",", ".").match(/-?\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : fallback;
}

export default function PricingGuard() {
  useEffect(() => {
    const calculator = document.querySelector<HTMLElement>(".calculator-section");
    if (!calculator) return;

    let frame = 0;
    const patch = () => {
      frame = 0;
      const tabs = [...calculator.querySelectorAll<HTMLButtonElement>(".calc-tabs button")];
      const activeMode = Math.max(0, tabs.findIndex(button => button.classList.contains("active")));
      const moverButtons = [...calculator.querySelectorAll<HTMLButtonElement>(".mover-selector button")];

      const labels = ["60 € / h", "75 € / h"];
      moverButtons.forEach((button, index) => {
        const small = button.querySelector("small");
        if (small && small.textContent !== labels[index]) small.textContent = labels[index];
      });

      const vat = calculator.querySelector<HTMLElement>(".estimate-box small");
      if (vat?.textContent?.includes("polttoaineen")) vat.textContent = vat.textContent.replace("polttoaineen", "polttoaine");

      if (activeMode !== 0 || moverButtons.length < 2) return;

      const values = [...calculator.querySelectorAll<HTMLElement>(".range-value")];
      const size = numberFrom(values[0]?.textContent, 55);
      const floor = numberFrom(values[1]?.textContent, 2);
      const distance = numberFrom(values[2]?.textContent, 18);
      const movers = moverButtons[0].classList.contains("active") ? 1 : 2;
      const switches = [...calculator.querySelectorAll<HTMLButtonElement>(".switch-grid button")];
      const elevator = switches[0]?.classList.contains("on") ?? false;
      const packing = switches[1]?.classList.contains("on") ?? false;
      const afterClean = switches[2]?.classList.contains("on") ?? false;

      const workload = 1.4 + size / 28 + Math.max(0, floor - (elevator ? 2 : 0)) * 0.22 + (packing ? 1.5 : 0);
      const hours = Math.max(2, movers === 1 ? workload * 1.45 : workload);
      const hourlyRate = movers === 1 ? 60 : 75;
      const price = Math.round(hours * hourlyRate + distance * 0.65 + (afterClean ? size * 1.1 : 0));
      const duration = `${hours.toFixed(1)}–${(hours + 0.8).toFixed(1)} h`;

      const priceNode = calculator.querySelector<HTMLElement>(".estimate-box strong:not(.time-estimate)");
      const durationNode = calculator.querySelector<HTMLElement>(".time-estimate");
      const priceText = `${price} €`;
      if (priceNode && priceNode.textContent !== priceText) priceNode.textContent = priceText;
      if (durationNode && durationNode.textContent !== duration) durationNode.textContent = duration;
    };

    const schedule = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(patch);
    };

    calculator.addEventListener("input", schedule);
    calculator.addEventListener("change", schedule);
    calculator.addEventListener("click", schedule);
    const observer = new MutationObserver(schedule);
    const estimate = calculator.querySelector(".estimate-box");
    if (estimate) observer.observe(estimate, { subtree: true, childList: true, characterData: true });
    patch();

    return () => {
      calculator.removeEventListener("input", schedule);
      calculator.removeEventListener("change", schedule);
      calculator.removeEventListener("click", schedule);
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
