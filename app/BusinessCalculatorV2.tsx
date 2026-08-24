"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowRight,
  Boxes,
  CheckCircle2,
  Sparkles,
  Truck,
  UserRound,
  UsersRound,
  AlertTriangle,
} from "lucide-react";

type Mode = "moving" | "cleaning" | "transport";
type Locale = "fi" | "en" | "uk" | "ru";
type CleanType = "regular" | "moveout" | "deep";

const text = {
  fi: {
    tabs: ["Muutto", "Siivous", "Kuljetus"],
    movers: "Muuttajien määrä", one: "1 muuttaja", two: "2 muuttajaa",
    size: "Asunnon koko", floor: "Kerros", distance: "Etäisyys osoitteiden välillä",
    elevator: "Hissi", packing: "Pakkausapua", afterClean: "Muuttosiivous",
    windows: "Ikkunoita", cleanType: "Siivoustyyppi", regular: "Perussiivous", moveout: "Muuttosiivous", deep: "Suursiivous",
    weight: "Arvioitu paino", delivery: "Toimitus", normal: "Normaali", express: "Pikakuljetus",
    price: "Arvioitu hinta", duration: "Arvioitu kesto", continue: "Jatka varaukseen",
    moveRule: "Minimiveloitus 2 h. Ensimmäiset 10 km sisältyvät arvioon, sen jälkeen Crafterin ajokulu 0,85 €/km.",
    oneRule: "Yhdellä muuttajalla työaika kasvaa nopeammin koon ja portaiden mukaan — näin yhden muuttajan työ pysyy kannattavana.",
    cleanRule: "Siivous 32,90 €/h, minimiveloitus 2 h. Ammattivälineet ja perusaineet sisältyvät.",
    transportRule: "Crafter-kuljetuksen minimiveloitus 79 €. Ensimmäiset 10 km sisältyvät, sen jälkeen 0,85 €/km.",
    work: "Työ", driving: "Ajokulu", cleaning: "Siivous", minimum: "Minimi", heavy: "Painava kuorma voi vaatia toisen työntekijän. Lopullinen hinta vahvistetaan ennen työtä.",
  },
  en: {
    tabs: ["Moving", "Cleaning", "Transport"],
    movers: "Number of movers", one: "1 mover", two: "2 movers",
    size: "Home size", floor: "Floor", distance: "Distance between addresses",
    elevator: "Elevator", packing: "Packing help", afterClean: "Move-out cleaning",
    windows: "Windows", cleanType: "Cleaning type", regular: "Regular", moveout: "Move-out", deep: "Deep clean",
    weight: "Estimated weight", delivery: "Delivery", normal: "Normal", express: "Express",
    price: "Estimated price", duration: "Estimated duration", continue: "Continue to booking",
    moveRule: "2 h minimum. First 10 km are included; after that the Crafter distance charge is €0.85/km.",
    oneRule: "With one mover, time increases faster with size and stairs so one-mover jobs remain commercially viable.",
    cleanRule: "Cleaning €32.90/h, 2 h minimum. Professional tools and basic supplies included.",
    transportRule: "Crafter transport minimum €79. First 10 km included, then €0.85/km.",
    work: "Work", driving: "Distance", cleaning: "Cleaning", minimum: "Minimum", heavy: "Heavy loads may require a second worker. Final price is confirmed before the job.",
  },
  uk: {
    tabs: ["Переїзд", "Прибирання", "Перевезення"],
    movers: "Кількість вантажників", one: "1 вантажник", two: "2 вантажники",
    size: "Площа житла", floor: "Поверх", distance: "Відстань між адресами",
    elevator: "Ліфт", packing: "Допомога з пакуванням", afterClean: "Прибирання після переїзду",
    windows: "Вікна", cleanType: "Тип прибирання", regular: "Звичайне", moveout: "Після переїзду", deep: "Генеральне",
    weight: "Орієнтовна вага", delivery: "Доставка", normal: "Звичайна", express: "Експрес",
    price: "Орієнтовна ціна", duration: "Орієнтовний час", continue: "До бронювання",
    moveRule: "Мінімум 2 год. Перші 10 км включено, далі витрати Crafter — 0,85 €/км.",
    oneRule: "Для одного вантажника час сильніше зростає з площею та поверхами, щоб робота залишалась вигідною.",
    cleanRule: "Прибирання 32,90 €/год, мінімум 2 год. Професійні інструменти та базові засоби включені.",
    transportRule: "Мінімум для Crafter — 79 €. Перші 10 км включено, далі 0,85 €/км.",
    work: "Робота", driving: "Пробіг", cleaning: "Прибирання", minimum: "Мінімум", heavy: "Важкий вантаж може потребувати другого працівника. Остаточна ціна підтверджується до роботи.",
  },
  ru: {
    tabs: ["Переезд", "Уборка", "Перевозка"],
    movers: "Количество грузчиков", one: "1 грузчик", two: "2 грузчика",
    size: "Площадь жилья", floor: "Этаж", distance: "Расстояние между адресами",
    elevator: "Лифт", packing: "Помощь с упаковкой", afterClean: "Уборка после переезда",
    windows: "Окна", cleanType: "Тип уборки", regular: "Обычная", moveout: "После переезда", deep: "Генеральная",
    weight: "Примерный вес", delivery: "Доставка", normal: "Обычная", express: "Экспресс",
    price: "Примерная цена", duration: "Примерное время", continue: "К бронированию",
    moveRule: "Минимум 2 часа. Первые 10 км включены, дальше расходы Crafter — 0,85 €/км.",
    oneRule: "Для одного грузчика время сильнее растёт от площади и этажей, чтобы заказ с одним грузчиком оставался выгодным.",
    cleanRule: "Уборка 32,90 €/ч, минимум 2 часа. Профессиональные инструменты и базовые средства включены.",
    transportRule: "Минимум для Crafter — 79 €. Первые 10 км включены, дальше 0,85 €/км.",
    work: "Работа", driving: "Пробег", cleaning: "Уборка", minimum: "Минимум", heavy: "Тяжёлый груз может потребовать второго работника. Итоговая цена подтверждается до работы.",
  },
} as const;

function currentLocale(): Locale {
  const lang = document.documentElement.lang;
  return lang === "en" || lang === "uk" || lang === "ru" ? lang : "fi";
}

function roundMoney(value: number) {
  return Math.round(value);
}

function setNativeValue(element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, value: string) {
  const proto = element instanceof HTMLSelectElement
    ? HTMLSelectElement.prototype
    : element instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
  setter?.call(element, value);
  element.dispatchEvent(new Event("input", { bubbles: true }));
  element.dispatchEvent(new Event("change", { bubbles: true }));
}

export default function BusinessCalculatorV2() {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const [locale, setLocale] = useState<Locale>("fi");
  const [mode, setMode] = useState<Mode>("moving");

  const [movers, setMovers] = useState<1 | 2>(2);
  const [moveSize, setMoveSize] = useState(15);
  const [moveFloor, setMoveFloor] = useState(0);
  const [moveDistance, setMoveDistance] = useState(1);
  const [elevator, setElevator] = useState(true);
  const [packing, setPacking] = useState(false);
  const [afterClean, setAfterClean] = useState(false);

  const [cleanSize, setCleanSize] = useState(20);
  const [windows, setWindows] = useState(0);
  const [cleanType, setCleanType] = useState<CleanType>("regular");

  const [transportDistance, setTransportDistance] = useState(1);
  const [weight, setWeight] = useState(5);
  const [express, setExpress] = useState(false);

  useEffect(() => {
    const section = document.querySelector<HTMLElement>(".calculator-section");
    setTarget(section);
    setLocale(currentLocale());

    const langObserver = new MutationObserver(() => setLocale(currentLocale()));
    langObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });

    const serviceGrid = document.querySelector(".service-grid");
    const handleServiceClick = (event: Event) => {
      const button = (event.target as Element | null)?.closest(".service-card button");
      if (!button) return;
      const card = button.closest(".service-card");
      if (!card) return;
      const cards = Array.from(document.querySelectorAll(".service-card"));
      const index = cards.indexOf(card);
      if (index === 1) setMode("transport");
      else if (index === 2) setMode("cleaning");
      else if (index === 0) setMode("moving");
    };
    serviceGrid?.addEventListener("click", handleServiceClick, true);

    return () => {
      langObserver.disconnect();
      serviceGrid?.removeEventListener("click", handleServiceClick, true);
    };
  }, []);

  const t = text[locale];

  const moving = useMemo(() => {
    const hourly = movers === 1 ? 59 : 75;
    const sizeHours = Math.max(0, moveSize - 15) * (movers === 1 ? 0.05 : 0.035);
    const floorHours = moveFloor <= 0
      ? 0
      : elevator
        ? moveFloor * 0.03
        : moveFloor * (movers === 1 ? 0.20 : 0.14);
    const drivingHours = Math.max(0, moveDistance - 10) / 50;
    const packingHours = packing ? (movers === 1 ? 1.5 : 1.0) : 0;
    const moveHours = Math.max(2, 2 + sizeHours + floorHours + drivingHours + packingHours);
    const kmCharge = Math.max(0, moveDistance - 10) * 0.85;
    const cleaningHours = afterClean ? Math.max(2, moveSize / 22) : 0;
    const cleaningPrice = cleaningHours * 32.9;
    const workPrice = moveHours * hourly;
    const total = roundMoney(workPrice + kmCharge + cleaningPrice);
    const isPureMinimum = moveSize === 15 && moveFloor === 0 && moveDistance <= 10 && !packing && !afterClean;
    return {
      price: total,
      hours: isPureMinimum ? "2.0 h" : `${moveHours.toFixed(1)}–${(moveHours + 0.5).toFixed(1)} h`,
      workPrice: roundMoney(workPrice),
      kmCharge: roundMoney(kmCharge),
      cleaningPrice: roundMoney(cleaningPrice),
      cleaningHours,
    };
  }, [movers, moveSize, moveFloor, moveDistance, elevator, packing, afterClean]);

  const cleaning = useMemo(() => {
    const divisor = cleanType === "deep" ? 17 : cleanType === "moveout" ? 20 : 24;
    const perWindow = cleanType === "deep" ? 0.20 : cleanType === "moveout" ? 0.18 : 0.15;
    const hours = Math.max(2, cleanSize / divisor + windows * perWindow);
    return {
      price: roundMoney(hours * 32.9),
      hours: hours <= 2.001 ? "2.0 h" : `${hours.toFixed(1)}–${(hours + 0.5).toFixed(1)} h`,
    };
  }, [cleanSize, windows, cleanType]);

  const transport = useMemo(() => {
    const drivingHours = Math.max(0, transportDistance - 10) / 50;
    const handlingHours = Math.max(0, weight - 50) / 350;
    const hours = Math.max(1, 1 + drivingHours + handlingHours);
    const kmCharge = Math.max(0, transportDistance - 10) * 0.85;
    const heavyCharge = weight > 120 ? 25 + (weight - 120) * 0.05 : 0;
    const raw = hours * 49 + kmCharge + heavyCharge;
    const normalPrice = Math.max(79, raw);
    const price = roundMoney(normalPrice * (express ? 1.25 : 1));
    return {
      price,
      hours: hours <= 1.001 ? "1.0 h" : `${hours.toFixed(1)}–${(hours + 0.4).toFixed(1)} h`,
      kmCharge: roundMoney(kmCharge),
      heavy: weight > 120,
    };
  }, [transportDistance, weight, express]);

  const result = mode === "moving" ? moving : mode === "cleaning" ? cleaning : transport;

  const continueToBooking = () => {
    const service = document.querySelector<HTMLSelectElement>('select[name="service"]');
    const notes = document.querySelector<HTMLTextAreaElement>('textarea[name="notes"]');
    if (service) setNativeValue(service, mode);

    let note = `${t.price}: ${result.price} €, ${t.duration}: ${result.hours}. `;
    if (mode === "moving") {
      note += `${movers} ${locale === "fi" ? "muuttajaa" : locale === "ru" ? "грузчика" : locale === "uk" ? "вантажники" : "movers"}, ${moveSize} m², ${moveFloor}. krs, ${moveDistance} km.`;
    } else if (mode === "cleaning") {
      note += `${cleanSize} m², ${windows} ${t.windows.toLowerCase()}, ${cleanType}.`;
    } else {
      note += `${transportDistance} km, ${weight} kg${express ? ", express" : ""}.`;
    }
    if (notes) setNativeValue(notes, note);
    document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
  };

  if (!target) return null;

  return createPortal(
    <div className="business-calculator-card" data-mode={mode}>
      <div className="bc-tabs">
        {(["moving", "cleaning", "transport"] as Mode[]).map((item, index) => (
          <button key={item} type="button" className={mode === item ? "active" : ""} onClick={() => setMode(item)}>
            {item === "moving" ? <Boxes/> : item === "cleaning" ? <Sparkles/> : <Truck/>}
            {t.tabs[index]}
          </button>
        ))}
      </div>

      <div className="bc-fields">
        {mode === "moving" && <>
          <label className="bc-full">{t.movers}
            <div className="bc-movers">
              <button type="button" className={movers === 1 ? "active" : ""} onClick={() => setMovers(1)}><UserRound/><span>{t.one}<small>59 € / h</small></span></button>
              <button type="button" className={movers === 2 ? "active" : ""} onClick={() => setMovers(2)}><UsersRound/><span>{t.two}<small>75 € / h</small></span></button>
            </div>
          </label>
          <label>{t.size}<strong>{moveSize} m²</strong><input type="range" min="15" max="220" value={moveSize} onChange={e => setMoveSize(+e.target.value)}/></label>
          <label>{t.floor}<strong>{moveFloor}</strong><input type="range" min="0" max="12" value={moveFloor} onChange={e => setMoveFloor(+e.target.value)}/></label>
          <label className="bc-full">{t.distance}<strong>{moveDistance} km</strong><input type="range" min="1" max="500" value={moveDistance} onChange={e => setMoveDistance(+e.target.value)}/></label>
          <div className="bc-switches bc-full">
            <button type="button" className={elevator ? "active" : ""} onClick={() => setElevator(!elevator)}><CheckCircle2/>{t.elevator}</button>
            <button type="button" className={packing ? "active" : ""} onClick={() => setPacking(!packing)}><Boxes/>{t.packing}</button>
            <button type="button" className={afterClean ? "active" : ""} onClick={() => setAfterClean(!afterClean)}><Sparkles/>{t.afterClean}</button>
          </div>
          <div className="bc-rule bc-full"><strong>{t.moveRule}</strong><span>{t.oneRule}</span></div>
        </>}

        {mode === "cleaning" && <>
          <label>{t.size}<strong>{cleanSize} m²</strong><input type="range" min="20" max="300" value={cleanSize} onChange={e => setCleanSize(+e.target.value)}/></label>
          <label>{t.windows}<strong>{windows}</strong><input type="range" min="0" max="30" value={windows} onChange={e => setWindows(+e.target.value)}/></label>
          <label className="bc-full">{t.cleanType}
            <select value={cleanType} onChange={e => setCleanType(e.target.value as CleanType)}>
              <option value="regular">{t.regular}</option>
              <option value="moveout">{t.moveout}</option>
              <option value="deep">{t.deep}</option>
            </select>
          </label>
          <div className="bc-rule bc-full"><strong>{t.cleanRule}</strong></div>
        </>}

        {mode === "transport" && <>
          <label>{t.distance}<strong>{transportDistance} km</strong><input type="range" min="1" max="600" value={transportDistance} onChange={e => setTransportDistance(+e.target.value)}/></label>
          <label>{t.weight}<strong>{weight} kg</strong><input type="range" min="5" max="1200" step="5" value={weight} onChange={e => setWeight(+e.target.value)}/></label>
          <label className="bc-full">{t.delivery}
            <select value={express ? "express" : "normal"} onChange={e => setExpress(e.target.value === "express")}>
              <option value="normal">{t.normal}</option>
              <option value="express">{t.express}</option>
            </select>
          </label>
          <div className="bc-rule bc-full"><strong>{t.transportRule}</strong></div>
          {transport.heavy && <div className="bc-warning bc-full"><AlertTriangle/>{t.heavy}</div>}
        </>}
      </div>

      <div className="bc-estimate">
        <div><span>{t.price}</span><strong>{result.price} €</strong></div>
        <div><span>{t.duration}</span><b>{result.hours}</b></div>
        <div className="bc-breakdown">
          {mode === "moving" && <>
            <small>{t.work}: {moving.workPrice} €</small>
            {moving.kmCharge > 0 && <small>{t.driving}: {moving.kmCharge} €</small>}
            {moving.cleaningPrice > 0 && <small>{t.cleaning}: {moving.cleaningPrice} €</small>}
          </>}
          {mode === "cleaning" && <small>{t.minimum}: 2 h · 32,90 €/h</small>}
          {mode === "transport" && <small>{t.minimum}: 79 €{transport.kmCharge > 0 ? ` · ${t.driving}: ${transport.kmCharge} €` : ""}</small>}
        </div>
        <button type="button" onClick={continueToBooking}>{t.continue}<ArrowRight/></button>
      </div>
    </div>,
    target,
  );
}
