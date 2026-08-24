"use client";

import { useEffect } from "react";

function setRangeToMinimum(input: HTMLInputElement) {
  const min = input.min || "0";
  if (input.value === min) return;

  const valueSetter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value",
  )?.set;

  valueSetter?.call(input, min);
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

function setSelectToFirstOption(select: HTMLSelectElement) {
  if (!select.options.length || select.selectedIndex === 0) return;
  select.selectedIndex = 0;
  select.dispatchEvent(new Event("change", { bubbles: true }));
}

function resetCalculatorToMinimums() {
  const calculator = document.querySelector<HTMLElement>(".calculator-section");
  if (!calculator) return;

  calculator
    .querySelectorAll<HTMLInputElement>('input[type="range"]')
    .forEach(setRangeToMinimum);

  calculator
    .querySelectorAll<HTMLSelectElement>(".calc-fields select")
    .forEach(setSelectToFirstOption);

  const moverButtons = calculator.querySelectorAll<HTMLButtonElement>(
    ".mover-selector button",
  );
  if (moverButtons.length && !moverButtons[0].classList.contains("active")) {
    moverButtons[0].click();
  }

  const switches = calculator.querySelectorAll<HTMLButtonElement>(
    ".switch-grid button",
  );

  // The elevator can only reduce or keep the estimate unchanged.
  // Optional paid extras must always start disabled.
  switches.forEach((button, index) => {
    if (index > 0 && button.classList.contains("on")) button.click();
  });
}

export default function CalculatorMinimumDefaults() {
  useEffect(() => {
    let frame = 0;
    const scheduleReset = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(resetCalculatorToMinimums);
    };

    scheduleReset();

    const fields = document.querySelector(".calculator-section .calc-fields");
    if (!fields) return () => cancelAnimationFrame(frame);

    const observer = new MutationObserver(scheduleReset);
    observer.observe(fields, { childList: true, subtree: true });

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  return null;
}
