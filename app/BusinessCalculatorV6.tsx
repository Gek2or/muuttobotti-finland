"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  Check,
  CheckCircle2,
  Clock3,
  PackageCheck,
  PackageOpen,
  Plus,
  Minus,
  Sparkles,
  Truck,
  UserRound,
  UsersRound,
} from "lucide-react";

type Mode = "moving" | "cleaning" | "transport";
type Locale = "fi" | "en" | "uk" | "ru";
type CleanType = "regular" | "moveout" | "deep";
type LoadLevel = "light" | "normal" | "full";
type Vehicle = "van" | "trailer";

const SNAPSHOT_KEY = "muuttobotti-calculator-snapshot";
const ATTACHED_KEY = "muuttobotti-booking-calculator-attached";

const copy = {
  fi: {
    tabs: ["Muutto", "Siivous", "Kuljetus"],
    team: "Tiimi",
    vehicle: "Ajoneuvo",
    details: "Muuton tiedot",
    one: "1 muuttaja",
    two: "2 muuttajaa",
    includedVan: "Korkea Crafter",
    vanVolume: "13–15 m³",
    included: "Sisältyy hintaan",
    vanText: "Pitkä ja korkea tavaratila useimpiin muuttoihin.",
    trailer: "Crafter + perävaunu",
    trailerVolume: "noin 20 m³",
    trailerPrice: "+10 €/h",
    trailerText: "7–8 m³ lisätila. Sopii suurempaan tavaramäärään ja voi vähentää lisäajoja.",
    size: "Asunnon koko",
    load: "Tavaramäärä",
    light: "Vähän",
    normalLoad: "Normaali",
    full: "Paljon",
    floor: "Kerros",
    distance: "Etäisyys",
    elevator: "Hissi",
    packing: "Pakkausapua",
    afterClean: "Muuttosiivous",
    heavy: "Raskaita esineitä",
    heavyHint: "esim. sohva, pesukone, painava pöytä",
    recommendation: "Muuttobotti-suositus",
    recommendTwo: "2 muuttajaa on tähän järkevin valinta",
    recommendOne: "1 muuttaja riittää todennäköisesti",
    recommendationTextTwo: "Työ valmistuu nopeammin ja hintaero pysyy usein pienenä.",
    recommendationTextOne: "Tavaramäärä ja kulkuolosuhteet näyttävät sopivilta yhdelle muuttajalle.",
    recommended: "Suositus",
    selected: "Valittu",
    compare: "Valitse tiimi",
    minimumMove: "Minimiveloitus 2 h.",
    cleanDetails: "Siivouksen tiedot",
    cleanSize: "Pinta-ala",
    windows: "Ikkunoita",
    cleanType: "Siivoustyyppi",
    regular: "Perussiivous",
    moveout: "Muuttosiivous",
    deep: "Suursiivous",
    minimumClean: "32,90 €/h · minimiveloitus 2 h · perusvälineet sisältyvät.",
    transportDetails: "Kuljetuksen tiedot",
    weight: "Arvioitu paino",
    delivery: "Toimitus",
    normal: "Normaali",
    express: "Pikakuljetus",
    minimumTransport: "Crafter-kuljetuksen minimiveloitus 79 €.",
    heavyRec: "Painava kuorma kannattaa vahvistaa ennen tilausta",
    transportRec: "Crafter sopii tähän kuljetukseen",
    estimate: "Alustava arvio",
    duration: "Arvioitu kesto",
    breakdown: "Mistä arvio muodostuu",
    work: "Työ",
    cleaning: "Siivous",
    driving: "Ajokulu",
    heavyFee: "Raskas kuorma",
    minimumAdjustment: "Minimiveloituksen täydennys",
    trailerFee: "Perävaunu",
    expressFee: "Pikakuljetus",
    continue: "Jatka varaukseen",
    attached: "Laskelma lisätään varaukseen erillisenä AI-tietona.",
    finalNote: "Tämä on alustava arvio. Lopullinen hinta vahvistetaan ennen työn alkua.",
  },
  en: {
    tabs: ["Moving", "Cleaning", "Transport"],
    team: "Team",
    vehicle: "Vehicle",
    details: "Move details",
    one: "1 mover",
    two: "2 movers",
    includedVan: "High-roof Crafter",
    vanVolume: "13–15 m³",
    included: "Included",
    vanText: "Long, high cargo space for most moves.",
    trailer: "Crafter + trailer",
    trailerVolume: "about 20 m³",
    trailerPrice: "+€10/h",
    trailerText: "An extra 7–8 m³ for larger loads and fewer extra trips.",
    size: "Home size",
    load: "Amount of belongings",
    light: "Light",
    normalLoad: "Normal",
    full: "Lots",
    floor: "Floor",
    distance: "Distance",
    elevator: "Elevator",
    packing: "Packing help",
    afterClean: "Move-out cleaning",
    heavy: "Heavy items",
    heavyHint: "e.g. sofa, washer, heavy table",
    recommendation: "Muuttobotti recommendation",
    recommendTwo: "2 movers are the best fit for this move",
    recommendOne: "1 mover is likely enough",
    recommendationTextTwo: "The job finishes faster and the total price difference often stays small.",
    recommendationTextOne: "The load and access conditions look suitable for one mover.",
    recommended: "Recommended",
    selected: "Selected",
    compare: "Choose team",
    minimumMove: "2 h minimum charge.",
    cleanDetails: "Cleaning details",
    cleanSize: "Area",
    windows: "Windows",
    cleanType: "Cleaning type",
    regular: "Regular",
    moveout: "Move-out",
    deep: "Deep clean",
    minimumClean: "€32.90/h · 2 h minimum · basic supplies included.",
    transportDetails: "Transport details",
    weight: "Estimated weight",
    delivery: "Delivery",
    normal: "Normal",
    express: "Express",
    minimumTransport: "Crafter transport minimum €79.",
    heavyRec: "Please confirm a heavy load before booking",
    transportRec: "The Crafter fits this transport",
    estimate: "Preliminary estimate",
    duration: "Estimated duration",
    breakdown: "Estimate breakdown",
    work: "Work",
    cleaning: "Cleaning",
    driving: "Distance charge",
    heavyFee: "Heavy load",
    minimumAdjustment: "Minimum charge adjustment",
    trailerFee: "Trailer",
    expressFee: "Express",
    continue: "Continue to booking",
    attached: "The estimate will be attached to the booking as separate AI information.",
    finalNote: "This is a preliminary estimate. Final price is confirmed before work starts.",
  },
  uk: {
    tabs: ["Переїзд", "Прибирання", "Перевезення"],
    team: "Команда",
    vehicle: "Автомобіль",
    details: "Дані переїзду",
    one: "1 вантажник",
    two: "2 вантажники",
    includedVan: "Високий Crafter",
    vanVolume: "13–15 м³",
    included: "Включено",
    vanText: "Довгий високий вантажний відсік для більшості переїздів.",
    trailer: "Crafter + причіп",
    trailerVolume: "близько 20 м³",
    trailerPrice: "+10 €/год",
    trailerText: "Додаткові 7–8 м³ для більшого обсягу та меншої кількості рейсів.",
    size: "Площа житла",
    load: "Кількість речей",
    light: "Мало",
    normalLoad: "Звичайно",
    full: "Багато",
    floor: "Поверх",
    distance: "Відстань",
    elevator: "Ліфт",
    packing: "Допомога з пакуванням",
    afterClean: "Прибирання після переїзду",
    heavy: "Важкі речі",
    heavyHint: "напр. диван, пральна машина, важкий стіл",
    recommendation: "Рекомендація Muuttobotti",
    recommendTwo: "2 вантажники — найкращий варіант для цього переїзду",
    recommendOne: "Ймовірно, достатньо 1 вантажника",
    recommendationTextTwo: "Робота завершиться швидше, а різниця в загальній ціні часто невелика.",
    recommendationTextOne: "Обсяг речей та умови доступу підходять для одного вантажника.",
    recommended: "Рекомендовано",
    selected: "Обрано",
    compare: "Оберіть команду",
    minimumMove: "Мінімальне замовлення 2 год.",
    cleanDetails: "Дані прибирання",
    cleanSize: "Площа",
    windows: "Вікна",
    cleanType: "Тип прибирання",
    regular: "Звичайне",
    moveout: "Після переїзду",
    deep: "Генеральне",
    minimumClean: "32,90 €/год · мінімум 2 год · базові засоби включено.",
    transportDetails: "Дані перевезення",
    weight: "Орієнтовна вага",
    delivery: "Доставка",
    normal: "Звичайна",
    express: "Експрес",
    minimumTransport: "Мінімум для Crafter — 79 €.",
    heavyRec: "Важкий вантаж краще підтвердити до замовлення",
    transportRec: "Crafter підходить для цього перевезення",
    estimate: "Попередня оцінка",
    duration: "Орієнтовний час",
    breakdown: "З чого складається оцінка",
    work: "Робота",
    cleaning: "Прибирання",
    driving: "Пробіг",
    heavyFee: "Важкий вантаж",
    minimumAdjustment: "Доплата до мінімальної вартості",
    trailerFee: "Причіп",
    expressFee: "Експрес",
    continue: "До бронювання",
    attached: "Розрахунок буде додано до заявки як окрема AI-інформація.",
    finalNote: "Це попередня оцінка. Остаточну ціну підтверджуємо до початку роботи.",
  },
  ru: {
    tabs: ["Переезд", "Уборка", "Перевозка"],
    team: "Команда",
    vehicle: "Машина",
    details: "Данные переезда",
    one: "1 грузчик",
    two: "2 грузчика",
    includedVan: "Высокий Crafter",
    vanVolume: "13–15 м³",
    included: "Включён",
    vanText: "Длинный высокий грузовой отсек для большинства переездов.",
    trailer: "Crafter + прицеп",
    trailerVolume: "около 20 м³",
    trailerPrice: "+10 €/ч",
    trailerText: "Дополнительные 7–8 м³ для большого объёма и меньшего количества рейсов.",
    size: "Площадь жилья",
    load: "Количество вещей",
    light: "Мало",
    normalLoad: "Обычно",
    full: "Много",
    floor: "Этаж",
    distance: "Расстояние",
    elevator: "Лифт",
    packing: "Помощь с упаковкой",
    afterClean: "Уборка после переезда",
    heavy: "Тяжёлые вещи",
    heavyHint: "например диван, стиральная машина, тяжёлый стол",
    recommendation: "Рекомендация Muuttobotti",
    recommendTwo: "2 грузчика — лучший вариант для этого переезда",
    recommendOne: "Скорее всего достаточно 1 грузчика",
    recommendationTextTwo: "Работа закончится быстрее, а разница в общей цене часто остаётся небольшой.",
    recommendationTextOne: "Объём вещей и условия доступа подходят для одного грузчика.",
    recommended: "Рекомендуем",
    selected: "Выбрано",
    compare: "Выберите команду",
    minimumMove: "Минимальный заказ 2 часа.",
    cleanDetails: "Данные уборки",
    cleanSize: "Площадь",
    windows: "Окна",
    cleanType: "Тип уборки",
    regular: "Обычная",
    moveout: "После переезда",
    deep: "Генеральная",
    minimumClean: "32,90 €/ч · минимум 2 часа · базовые средства включены.",
    transportDetails: "Данные перевозки",
    weight: "Примерный вес",
    delivery: "Доставка",
    normal: "Обычная",
    express: "Экспресс",
    minimumTransport: "Минимум Crafter — 79 €.",
    heavyRec: "Тяжёлый груз лучше подтвердить до заказа",
    transportRec: "Crafter подходит для этой перевозки",
    estimate: "Предварительная оценка",
    duration: "Примерное время",
    breakdown: "Из чего складывается оценка",
    work: "Работа",
    cleaning: "Уборка",
    driving: "Пробег",
    heavyFee: "Тяжёлый груз",
    minimumAdjustment: "Доплата до минимальной стоимости",
    trailerFee: "Прицеп",
    expressFee: "Экспресс",
    continue: "К бронированию",
    attached: "Расчёт будет прикреплён к форме как отдельная AI-информация.",
    finalNote: "Это предварительная оценка. Итоговую цену подтверждаем до начала работы.",
  },
} as const;

function localeNow(): Locale {
  const requested = new URLSearchParams(window.location.search).get("lang");
  if (requested === "en" || requested === "uk" || requested === "ru") return requested;
  const lang = document.documentElement.lang;
  return lang === "en" || lang === "uk" || lang === "ru" ? lang : "fi";
}

function money(value: number) {
  return Math.round(value);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function setNativeValue(element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, value: string) {
  const proto = element instanceof HTMLSelectElement
    ? HTMLSelectElement.prototype
    : element instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, "value")?.set?.call(element, value);
  element.dispatchEvent(new Event("input", { bubbles: true }));
  element.dispatchEvent(new Event("change", { bubbles: true }));
}

type StepperProps = {
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (value: number) => void;
  ariaLabel: string;
};

function NumericStepper({ value, min, max, step, unit = "", onChange, ariaLabel }: StepperProps) {
  const change = (next: number) => onChange(clamp(Math.round(next), min, max));
  return (
    <div className="bc8-stepper">
      <button type="button" aria-label={`${ariaLabel} -`} disabled={value <= min} onClick={() => change(value - step)}><Minus /></button>
      <div><input type="number" inputMode="numeric" min={min} max={max} value={value} aria-label={ariaLabel} onChange={(event) => change(Number(event.target.value) || min)} />{unit && <span>{unit}</span>}</div>
      <button type="button" aria-label={`${ariaLabel} +`} disabled={value >= max} onClick={() => change(value + step)}><Plus /></button>
    </div>
  );
}

type BreakdownRow = { icon: ReactNode; label: string; value: number };

export default function BusinessCalculatorV6() {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const [locale, setLocale] = useState<Locale>("fi");
  const [mode, setMode] = useState<Mode>("moving");
  const [vehicle, setVehicle] = useState<Vehicle>("van");
  const [movers, setMovers] = useState<1 | 2>(2);
  const [size, setSize] = useState(40);
  const [load, setLoad] = useState<LoadLevel>("normal");
  const [floor, setFloor] = useState(0);
  const [distance, setDistance] = useState(10);
  const [elevator, setElevator] = useState(true);
  const [packing, setPacking] = useState(false);
  const [afterClean, setAfterClean] = useState(false);
  const [heavyItems, setHeavyItems] = useState(false);
  const [cleanSize, setCleanSize] = useState(40);
  const [windows, setWindows] = useState(0);
  const [cleanType, setCleanType] = useState<CleanType>("regular");
  const [transportDistance, setTransportDistance] = useState(10);
  const [weight, setWeight] = useState(50);
  const [express, setExpress] = useState(false);

  useEffect(() => {
    setTarget(document.querySelector<HTMLElement>(".calculator-section"));
    setLocale(localeNow());
    const observer = new MutationObserver(() => setLocale(localeNow()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
    const onPop = () => setLocale(localeNow());
    window.addEventListener("popstate", onPop);
    return () => {
      observer.disconnect();
      window.removeEventListener("popstate", onPop);
    };
  }, []);

  const t = copy[locale];
  const trailerHourly = vehicle === "trailer" ? 10 : 0;

  const calculateMove = (count: 1 | 2) => {
    const hourly = (count === 1 ? 59 : 75) + trailerHourly;
    const extraM2 = Math.max(0, size - 20);
    const first = Math.min(extraM2, 30);
    const second = Math.max(0, Math.min(extraM2 - 30, 40));
    const third = Math.max(0, extraM2 - 70);
    const sizeHours = count === 1
      ? first * 0.012 + second * 0.018 + third * 0.025
      : first * 0.008 + second * 0.012 + third * 0.017;
    const baseHours = count === 1 ? 1.55 : 1.7;
    const loadHours = count === 1
      ? ({ light: 0, normal: 0.45, full: 1.1 } as const)[load]
      : ({ light: 0, normal: 0.3, full: 0.7 } as const)[load];
    const stairs = floor <= 0 ? 0 : elevator ? floor * (count === 1 ? 0.04 : 0.025) : floor * (count === 1 ? 0.16 : 0.1);
    const driveHours = Math.max(0, distance) / 50;
    const packHours = packing ? (count === 1 ? 1.1 : 0.7) : 0;
    const heavyHours = heavyItems ? (count === 1 ? 0.6 : 0.35) : 0;
    const moveHours = Math.max(2, baseHours + sizeHours + loadHours + stairs + driveHours + packHours + heavyHours);
    const cleaningHours = afterClean ? Math.max(2, size / 22) : 0;
    const work = moveHours * hourly;
    const cleaningPrice = cleaningHours * 32.9;
    return {
      moveHours,
      totalHours: moveHours + cleaningHours,
      hourly,
      work,
      cleaningHours,
      cleaningPrice,
      price: money(work + cleaningPrice),
    };
  };

  const moveOne = useMemo(
    () => calculateMove(1),
    [size, load, floor, distance, elevator, packing, afterClean, heavyItems, vehicle],
  );
  const moveTwo = useMemo(
    () => calculateMove(2),
    [size, load, floor, distance, elevator, packing, afterClean, heavyItems, vehicle],
  );
  const selectedMove = movers === 1 ? moveOne : moveTwo;
  const recommendTwo = heavyItems
    || (load === "full" && size >= 45)
    || size >= 80
    || (!elevator && floor >= 2 && size >= 35)
    || moveOne.moveHours - moveTwo.moveHours >= 0.65
    || moveOne.price >= moveTwo.price;
  const recommendTrailer = vehicle === "van" && ((load === "full" && size >= 45) || size >= 70);

  const cleaning = useMemo(() => {
    const divisor = cleanType === "deep" ? 16 : cleanType === "moveout" ? 19 : 24;
    const perWindow = cleanType === "deep" ? 0.22 : cleanType === "moveout" ? 0.18 : 0.14;
    const hours = Math.max(2, cleanSize / divisor + windows * perWindow);
    return { hours, price: money(hours * 32.9) };
  }, [cleanSize, windows, cleanType]);

  const transport = useMemo(() => {
    const driveHours = Math.max(0, transportDistance) / 50;
    const handlingHours = Math.max(0, weight - 50) / 320;
    const hours = Math.max(1, 0.8 + driveHours + handlingHours);
    const baseWork = hours * 49;
    const kmCharge = Math.max(0, transportDistance - 10) * 0.85;
    const heavyCharge = weight > 120 ? 30 + (weight - 120) * 0.06 : 0;
    const rawBase = baseWork + kmCharge + heavyCharge;
    const minimumAdjustment = Math.max(0, 79 - rawBase);
    const baseService = rawBase + minimumAdjustment;
    const trailerCharge = vehicle === "trailer" ? hours * 10 : 0;
    const beforeExpress = baseService + trailerCharge;
    const expressCharge = express ? beforeExpress * 0.25 : 0;
    return {
      hours,
      baseWork,
      kmCharge,
      heavyCharge,
      minimumAdjustment,
      trailerCharge,
      expressCharge,
      price: money(beforeExpress + expressCharge),
    };
  }, [transportDistance, weight, express, vehicle]);

  const result = mode === "moving"
    ? { price: selectedMove.price, hours: selectedMove.totalHours }
    : mode === "cleaning"
      ? cleaning
      : { price: transport.price, hours: transport.hours };

  const duration = result.hours <= 2.001
    ? `${result.hours.toFixed(1)} h`
    : `${result.hours.toFixed(1)}–${(result.hours + 0.5).toFixed(1)} h`;

  const breakdown = useMemo(() => {
    const rows: BreakdownRow[] = [];
    if (mode === "moving") {
      rows.push({ icon: <UsersRound />, label: t.work, value: selectedMove.work });
      if (selectedMove.cleaningPrice > 0) rows.push({ icon: <Sparkles />, label: t.cleaning, value: selectedMove.cleaningPrice });
    } else if (mode === "cleaning") {
      rows.push({ icon: <Sparkles />, label: t.cleaning, value: cleaning.price });
    } else {
      rows.push({ icon: <Truck />, label: t.work, value: transport.baseWork });
      if (transport.kmCharge > 0) rows.push({ icon: <Truck />, label: t.driving, value: transport.kmCharge });
      if (transport.heavyCharge > 0) rows.push({ icon: <PackageOpen />, label: t.heavyFee, value: transport.heavyCharge });
      if (transport.minimumAdjustment > 0) rows.push({ icon: <Check />, label: t.minimumAdjustment, value: transport.minimumAdjustment });
      if (transport.trailerCharge > 0) rows.push({ icon: <PackageCheck />, label: t.trailerFee, value: transport.trailerCharge });
      if (transport.expressCharge > 0) rows.push({ icon: <Clock3 />, label: t.expressFee, value: transport.expressCharge });
    }
    return rows;
  }, [mode, t, selectedMove, cleaning, transport]);

  useEffect(() => {
    const snapshot = {
      version: 8,
      source: "business-calculator-v8-single-source",
      mode,
      locale,
      quotedPrice: result.price,
      quotedDuration: duration,
      vehicle: mode === "cleaning" ? undefined : vehicle === "trailer" ? "crafter-trailer" : "crafter",
      vehicleVolumeM3: mode === "cleaning" ? undefined : vehicle === "trailer" ? "~20" : "13-15",
      trailerVolumeM3: mode !== "cleaning" && vehicle === "trailer" ? "7-8" : undefined,
      trailerHourlySurcharge: mode !== "cleaning" && vehicle === "trailer" ? 10 : 0,
      moving: mode === "moving" ? {
        movers,
        hourlyRate: selectedMove.hourly,
        sizeM2: size,
        loadLevel: load,
        floor,
        distanceKm: distance,
        elevator,
        packing,
        afterClean,
        heavyItems,
        recommendedMovers: recommendTwo ? 2 : 1,
        recommendedTrailer: recommendTrailer,
        workPrice: money(selectedMove.work),
        kmCharge: 0,
        cleaningPrice: money(selectedMove.cleaningPrice),
      } : undefined,
      cleaning: mode === "cleaning" ? {
        sizeM2: cleanSize,
        windows,
        cleanType,
        hourlyRate: 32.9,
      } : undefined,
      transport: mode === "transport" ? {
        distanceKm: transportDistance,
        weightKg: weight,
        express,
        hourlyRate: 49 + trailerHourly,
        kmCharge: money(transport.kmCharge),
        heavy: transport.heavyCharge > 0,
        trailerCharge: money(transport.trailerCharge),
      } : undefined,
      updatedAt: new Date().toISOString(),
    };
    sessionStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snapshot));
    window.dispatchEvent(new CustomEvent("muuttobotti:calculator-snapshot", { detail: snapshot }));
  }, [
    mode,
    locale,
    result.price,
    duration,
    vehicle,
    movers,
    size,
    load,
    floor,
    distance,
    elevator,
    packing,
    afterClean,
    heavyItems,
    recommendTwo,
    recommendTrailer,
    selectedMove,
    cleanSize,
    windows,
    cleanType,
    transportDistance,
    weight,
    express,
    transport,
    trailerHourly,
  ]);

  const continueBooking = () => {
    const service = document.querySelector<HTMLSelectElement>('select[name="service"]');
    if (service) setNativeValue(service, mode);
    sessionStorage.setItem(ATTACHED_KEY, "1");
    window.dispatchEvent(new CustomEvent("muuttobotti:calculator-attach"));
    document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
  };

  if (!target) return null;

  const loadOptions: { key: LoadLevel; label: string }[] = [
    { key: "light", label: t.light },
    { key: "normal", label: t.normalLoad },
    { key: "full", label: t.full },
  ];

  const vehiclePicker = (
    <section className="bc8-section bc8-full" aria-label={t.vehicle}>
      <div className="bc8-section-head"><span>02</span><div><small>{t.vehicle}</small></div></div>
      <div className="bc8-vehicle-grid">
        <button type="button" className={vehicle === "van" ? "active" : ""} onClick={() => setVehicle("van")}>
          <span className="bc8-icon"><Truck /></span>
          <span className="bc8-choice-copy"><b>{t.includedVan}</b><strong>{t.vanVolume}</strong><small>{t.vanText}</small></span>
          <em>{t.included}</em>
        </button>
        <button type="button" className={vehicle === "trailer" ? "active" : ""} onClick={() => setVehicle("trailer")}>
          <span className="bc8-icon combo"><PackageCheck /></span>
          <span className="bc8-choice-copy"><b>{t.trailer}</b><strong>{t.trailerVolume}</strong><small>{t.trailerText}</small></span>
          <em>{t.trailerPrice}</em>
        </button>
      </div>
      {mode === "moving" && recommendTrailer && vehicle === "van" && (
        <button type="button" className="bc8-volume-hint" onClick={() => setVehicle("trailer")}>
          <PackageCheck /><span>{t.trailerText}</span><ArrowRight />
        </button>
      )}
    </section>
  );

  return createPortal(
    <div className="bc8-card" data-mode={mode}>
      <div className="bc8-tabs" role="tablist" aria-label="Calculator">
        {(["moving", "cleaning", "transport"] as Mode[]).map((item, index) => (
          <button key={item} type="button" role="tab" aria-selected={mode === item} className={mode === item ? "active" : ""} onClick={() => setMode(item)}>
            {item === "moving" ? <Boxes /> : item === "cleaning" ? <Sparkles /> : <Truck />}
            <span>{t.tabs[index]}</span>
          </button>
        ))}
      </div>

      {mode === "moving" && (
        <div className="bc8-body">
          <section className="bc8-section bc8-full">
            <div className="bc8-section-head"><span>01</span><div><small>{t.team}</small></div></div>
            <div className="bc8-team-grid">
              <button type="button" className={movers === 1 ? "active" : ""} onClick={() => setMovers(1)}>
                <UserRound /><span><b>{t.one}</b><small>{59 + trailerHourly} €/h</small></span>{movers === 1 && <em>{t.selected}</em>}
              </button>
              <button type="button" className={movers === 2 ? "active" : ""} onClick={() => setMovers(2)}>
                <UsersRound /><span><b>{t.two}</b><small>{75 + trailerHourly} €/h</small></span>{movers === 2 && <em>{t.selected}</em>}
              </button>
            </div>
          </section>

          {vehiclePicker}

          <section className="bc8-section bc8-full">
            <div className="bc8-section-head"><span>03</span><div><small>{t.details}</small></div></div>
            <div className="bc8-fields">
              <label><span>{t.size}</span><NumericStepper value={size} min={15} max={220} step={5} unit="m²" onChange={setSize} ariaLabel={t.size} /></label>
              <label><span>{t.floor}</span><NumericStepper value={floor} min={0} max={12} step={1} onChange={setFloor} ariaLabel={t.floor} /></label>
              <label className="bc8-full"><span>{t.distance}</span><NumericStepper value={distance} min={0} max={500} step={5} unit="km" onChange={setDistance} ariaLabel={t.distance} /></label>
              <div className="bc8-load bc8-full"><span>{t.load}</span><div>{loadOptions.map((item) => <button type="button" key={item.key} className={load === item.key ? "active" : ""} onClick={() => setLoad(item.key)}>{item.label}</button>)}</div></div>
              <div className="bc8-switches bc8-full">
                <button type="button" className={elevator ? "on" : ""} onClick={() => setElevator(!elevator)}><CheckCircle2 />{t.elevator}</button>
                <button type="button" className={packing ? "on" : ""} onClick={() => setPacking(!packing)}><Boxes />{t.packing}</button>
                <button type="button" className={afterClean ? "on" : ""} onClick={() => setAfterClean(!afterClean)}><Sparkles />{t.afterClean}</button>
                <button type="button" className={heavyItems ? "on warning" : ""} onClick={() => setHeavyItems(!heavyItems)}><PackageOpen /><span>{t.heavy}<small>{t.heavyHint}</small></span></button>
              </div>
            </div>
          </section>

          <div className={`bc8-recommendation ${recommendTwo ? "strong" : ""}`}>
            <span className="bc8-rec-icon">{recommendTwo ? <UsersRound /> : <Check />}</span>
            <div><small>{t.recommendation}</small><strong>{recommendTwo ? t.recommendTwo : t.recommendOne}</strong><p>{recommendTwo ? t.recommendationTextTwo : t.recommendationTextOne}</p></div>
            {recommendTwo && movers === 1 && <button type="button" onClick={() => setMovers(2)}>{t.two}<ArrowRight /></button>}
          </div>

          <div className="bc8-compare">
            <div className="bc8-compare-title"><span>{t.compare}</span></div>
            <button type="button" className={movers === 1 ? "active" : ""} onClick={() => setMovers(1)}>
              <span><UserRound /><b>{t.one}</b></span><strong>{moveOne.price} €</strong><small>{moveOne.totalHours.toFixed(1)} h</small>{!recommendTwo && <em>{t.recommended}</em>}
            </button>
            <button type="button" className={movers === 2 ? "active" : ""} onClick={() => setMovers(2)}>
              <span><UsersRound /><b>{t.two}</b></span><strong>{moveTwo.price} €</strong><small>{moveTwo.totalHours.toFixed(1)} h</small>{recommendTwo && <em>{t.recommended}</em>}
            </button>
          </div>

          <div className="bc8-rule">{t.minimumMove}</div>
        </div>
      )}

      {mode === "cleaning" && (
        <div className="bc8-body">
          <section className="bc8-section bc8-full">
            <div className="bc8-section-head"><span>01</span><div><small>{t.cleanDetails}</small></div></div>
            <div className="bc8-fields">
              <label><span>{t.cleanSize}</span><NumericStepper value={cleanSize} min={20} max={300} step={5} unit="m²" onChange={setCleanSize} ariaLabel={t.cleanSize} /></label>
              <label><span>{t.windows}</span><NumericStepper value={windows} min={0} max={30} step={1} onChange={setWindows} ariaLabel={t.windows} /></label>
              <label className="bc8-full"><span>{t.cleanType}</span><select value={cleanType} onChange={(event) => setCleanType(event.target.value as CleanType)}><option value="regular">{t.regular}</option><option value="moveout">{t.moveout}</option><option value="deep">{t.deep}</option></select></label>
            </div>
          </section>
          <div className="bc8-rule">{t.minimumClean}</div>
        </div>
      )}

      {mode === "transport" && (
        <div className="bc8-body">
          {vehiclePicker}
          <section className="bc8-section bc8-full">
            <div className="bc8-section-head"><span>03</span><div><small>{t.transportDetails}</small></div></div>
            <div className="bc8-fields">
              <label><span>{t.distance}</span><NumericStepper value={transportDistance} min={0} max={600} step={5} unit="km" onChange={setTransportDistance} ariaLabel={t.distance} /></label>
              <label><span>{t.weight}</span><NumericStepper value={weight} min={0} max={1200} step={25} unit="kg" onChange={setWeight} ariaLabel={t.weight} /></label>
              <label className="bc8-full"><span>{t.delivery}</span><select value={express ? "express" : "normal"} onChange={(event) => setExpress(event.target.value === "express")}><option value="normal">{t.normal}</option><option value="express">{t.express}</option></select></label>
            </div>
          </section>
          <div className={`bc8-recommendation ${transport.heavyCharge > 0 ? "warning" : ""}`}>
            <span className="bc8-rec-icon">{transport.heavyCharge > 0 ? <AlertTriangle /> : <Truck />}</span>
            <div><small>{t.recommendation}</small><strong>{transport.heavyCharge > 0 ? t.heavyRec : t.transportRec}</strong></div>
          </div>
          <div className="bc8-rule">{t.minimumTransport}</div>
        </div>
      )}

      <div className="bc8-summary" aria-live="polite">
        <div className="bc8-summary-top">
          <div><span>{t.estimate}</span><strong>{result.price} €</strong></div>
          <div><span>{t.duration}</span><b>{duration}</b></div>
        </div>
        <div className="bc8-breakdown">
          <span>{t.breakdown}</span>
          <div>{breakdown.map((row, index) => <small key={`${row.label}-${index}`}><i>{row.icon}</i><span>{row.label}</span><b>{money(row.value)} €</b></small>)}</div>
        </div>
        <button type="button" className="bc8-continue" onClick={continueBooking}>{t.continue}<ArrowRight /></button>
        <p>{t.attached} {t.finalNote}</p>
      </div>
    </div>,
    target,
  );
}
