"use client";

import { useEffect } from "react";

const SNAPSHOT_KEY = "muuttobotti-calculator-snapshot";

type CalculatorSnapshot = {
  mode?: string;
  quotedPrice?: number;
  quotedDuration?: string;
  vehicle?: string;
  transport?: {
    distanceKm?: number;
    weightKg?: number;
    express?: boolean;
    kmCharge?: number;
    hourlyRate?: number;
    heavy?: boolean;
    trailerCharge?: number;
  };
  [key: string]: unknown;
};

function parseHours(duration: unknown) {
  const match = String(duration ?? "").replace(",", ".").match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : 0;
}

function correctedTransportPrice(snapshot: CalculatorSnapshot) {
  if (snapshot.mode !== "transport" || snapshot.vehicle !== "crafter-trailer" || !snapshot.transport) return null;

  const hours = parseHours(snapshot.quotedDuration);
  if (!hours) return null;

  const distance = Number(snapshot.transport.distanceKm ?? 0);
  const weight = Number(snapshot.transport.weightKg ?? 0);
  const km = Math.max(0, distance - 10) * 0.85;
  const heavyCharge = weight > 120 ? 30 + (weight - 120) * 0.06 : 0;
  const baseWithoutTrailer = Math.max(79, hours * 49 + km + heavyCharge);
  const trailerCharge = hours * 10;
  const subtotal = baseWithoutTrailer + trailerCharge;
  const express = Boolean(snapshot.transport.express);
  const finalPrice = Math.round(subtotal * (express ? 1.25 : 1));

  return { finalPrice, trailerCharge, baseWithoutTrailer };
}

function apply(snapshot: CalculatorSnapshot) {
  const correction = correctedTransportPrice(snapshot);
  if (!correction) return;

  const enhanced: CalculatorSnapshot = {
    ...snapshot,
    quotedPrice: correction.finalPrice,
    transport: {
      ...snapshot.transport,
      hourlyRate: 59,
      trailerCharge: correction.trailerCharge,
    },
  };

  sessionStorage.setItem(SNAPSHOT_KEY, JSON.stringify(enhanced));

  const card = document.querySelector<HTMLElement>('.bc3-card[data-mode="transport"]');
  const price = card?.querySelector<HTMLElement>(".bc3-price strong");
  if (price) price.textContent = `${correction.finalPrice} €`;
}

export default function CalculatorPricingPolish() {
  useEffect(() => {
    const onSnapshot = (event: Event) => {
      const custom = event as CustomEvent<CalculatorSnapshot>;
      if (custom.detail) apply(custom.detail);
    };

    window.addEventListener("muuttobotti:calculator-snapshot", onSnapshot as EventListener);

    try {
      const raw = sessionStorage.getItem(SNAPSHOT_KEY);
      if (raw) apply(JSON.parse(raw) as CalculatorSnapshot);
    } catch {
      // A broken optional calculator snapshot must never affect the page.
    }

    return () => window.removeEventListener("muuttobotti:calculator-snapshot", onSnapshot as EventListener);
  }, []);

  return null;
}
