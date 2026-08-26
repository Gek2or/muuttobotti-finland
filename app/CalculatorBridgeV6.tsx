"use client";

import { useEffect } from "react";

const SNAPSHOT_KEY = "muuttobotti-calculator-snapshot";
const VEHICLE_KEY = "muuttobotti-vehicle-choice";

type Locale = "fi" | "en" | "uk" | "ru";

const copy = {
  fi: {
    bookingVan: "Ajoneuvo: korkea Crafter, 13–15 m³.",
    bookingTrailer: "Ajoneuvo: korkea Crafter 13–15 m³ + perävaunu 7–8 m³, käytännön kokonaiskapasiteetti noin 20 m³ (+10 €/h).",
    adjusted: "Arvio perävaunulla",
  },
  en: {
    bookingVan: "Vehicle: high-roof Crafter, 13–15 m³.",
    bookingTrailer: "Vehicle: high-roof Crafter 13–15 m³ + 7–8 m³ trailer, practical total capacity about 20 m³ (+€10/h).",
    adjusted: "Estimate with trailer",
  },
  uk: {
    bookingVan: "Автомобіль: високий Crafter, 13–15 м³.",
    bookingTrailer: "Автомобіль: високий Crafter 13–15 м³ + причіп 7–8 м³, практичний загальний об’єм близько 20 м³ (+10 €/год).",
    adjusted: "Оцінка з причепом",
  },
  ru: {
    bookingVan: "Машина: высокий Crafter, 13–15 м³.",
    bookingTrailer: "Машина: высокий Crafter 13–15 м³ + прицеп 7–8 м³, практический общий объём около 20 м³ (+10 €/ч).",
    adjusted: "Оценка с прицепом",
  },
} as const;

function localeNow(): Locale {
  const lang = document.documentElement.lang;
  return lang === "en" || lang === "uk" || lang === "ru" ? lang : "fi";
}

function parseHours(duration: unknown) {
  const match = String(duration ?? "").replace(",", ".").match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : 0;
}

export default function CalculatorBridgeV6(){
  useEffect(()=>{
    let withTrailer = sessionStorage.getItem(VEHICLE_KEY) === "trailer";

    const select=(index:number)=>{
      const tabs=document.querySelectorAll<HTMLButtonElement>(".bc3-tabs button");
      tabs[index]?.click();
    };

    const getSnapshot = () => {
      try {
        return JSON.parse(sessionStorage.getItem(SNAPSHOT_KEY) || "null");
      } catch {
        return null;
      }
    };

    const applyTrailerPrice = () => {
      const card = document.querySelector<HTMLElement>(".bc3-card");
      const snapshot = getSnapshot();
      if (!card || !snapshot) return;
      const mode = card.dataset.mode;
      if (mode === "cleaning" || snapshot.mode !== mode) return;

      const basePrice = Number(snapshot.quotedPrice || 0);
      const hours = parseHours(snapshot.quotedDuration);
      const surcharge = withTrailer ? Math.round(hours * 10) : 0;
      const finalPrice = basePrice + surcharge;

      const price = card.querySelector<HTMLElement>(".bc3-price strong");
      const nextPrice = `${finalPrice} €`;
      if (price && basePrice > 0 && price.textContent?.trim() !== nextPrice) price.textContent = nextPrice;

      card.querySelector(".bc6-trailer-surcharge")?.remove();

      if (
        snapshot.vehicle !== (withTrailer ? "crafter-trailer" : "crafter") ||
        snapshot.finalQuotedPrice !== finalPrice ||
        snapshot.trailerHourlySurcharge !== (withTrailer ? 10 : 0)
      ) {
        const enhanced = {
          ...snapshot,
          vehicle: withTrailer ? "crafter-trailer" : "crafter",
          vehicleVolumeM3: withTrailer ? "~20" : "13-15",
          trailerVolumeM3: withTrailer ? "7-8" : undefined,
          trailerHourlySurcharge: withTrailer ? 10 : 0,
          finalQuotedPrice: finalPrice,
        };
        sessionStorage.setItem(SNAPSHOT_KEY, JSON.stringify(enhanced));
      }
    };

    const onVehicle = (event: Event) => {
      const custom = event as CustomEvent<{ vehicle?: string }>;
      withTrailer = custom.detail?.vehicle === "trailer";
      sessionStorage.setItem(VEHICLE_KEY, withTrailer ? "trailer" : "van");
      window.setTimeout(applyTrailerPrice, 0);
    };

    const onClick=(event:MouseEvent)=>{
      const target=event.target as Element|null;
      const serviceButton=target?.closest(".service-card button");
      if(serviceButton){
        const card=serviceButton.closest(".service-card");
        const cards=Array.from(document.querySelectorAll(".service-card"));
        const index=card?cards.indexOf(card):-1;
        if(index===0)select(0);
        if(index===1)select(2);
        if(index===2)select(1);
      }
      const offer=target?.closest(".hero-v6-price-grid button");
      if(offer){
        const offers=Array.from(document.querySelectorAll(".hero-v6-price-grid button"));
        const index=offers.indexOf(offer);
        select(index===2?1:0);
      }

      const continueButton = target?.closest(".bc3-summary > button");
      if (continueButton) {
        window.setTimeout(() => {
          const notes = document.querySelector<HTMLTextAreaElement>('textarea[name="notes"]');
          if (!notes) return;
          const snapshot = getSnapshot();
          const t = copy[localeNow()];
          const vehicleText = withTrailer ? t.bookingTrailer : t.bookingVan;
          const adjustedText = withTrailer && snapshot?.finalQuotedPrice ? ` ${t.adjusted}: ${snapshot.finalQuotedPrice} €.` : "";
          const next = `${notes.value.trim()} ${vehicleText}${adjustedText}`.trim();
          const descriptor = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value");
          descriptor?.set?.call(notes, next);
          notes.dispatchEvent(new Event("input", { bubbles: true }));
          notes.dispatchEvent(new Event("change", { bubbles: true }));
        }, 0);
      }
    };

    document.addEventListener("click",onClick,true);
    window.addEventListener("muuttobotti:vehicle", onVehicle as EventListener);
    const interval = window.setInterval(applyTrailerPrice, 300);
    applyTrailerPrice();

    return()=>{
      document.removeEventListener("click",onClick,true);
      window.removeEventListener("muuttobotti:vehicle", onVehicle as EventListener);
      window.clearInterval(interval);
    };
  },[]);
  return null;
}
