"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, Check, CheckCircle2, PackageCheck, Truck } from "lucide-react";

type Locale = "fi" | "en" | "uk" | "ru";
type Vehicle = "van" | "trailer";

const VEHICLE_KEY = "muuttobotti-vehicle-choice";

const copy = {
  fi: {
    eyebrow: "Tiedä mistä maksat",
    title: "Iso korkea Crafter — ja tarvittaessa vielä enemmän tilaa.",
    lead: "Muuttopalvelun perushintaan kuuluu korkea ja pitkä Crafter. Kun tavaraa on enemmän, mukaan voidaan ottaa 7–8 m³ perävaunu vain +10 €/h lisähinnalla.",
    vanTitle: "Korkea Crafter",
    vanVolume: "13–15 m³",
    vanPrice: "sisältyy perushintaan",
    vanText: "Hyvä valinta useimpiin yksiöihin, kaksioihin, huonekalukuljetuksiin ja pienempiin muuttoihin.",
    vanItems: ["Korkea tavaratila pitkille ja suurille esineille", "Sohvat, sängyt, kodinkoneet ja muuttolaatikot", "Kuorma pysyy samassa autossa ilman turhia lisäajoja"],
    comboTitle: "Crafter + perävaunu",
    comboVolume: "noin 20 m³",
    comboPrice: "+10 €/h",
    comboText: "Kun tavaraa on selvästi enemmän, 7–8 m³ perävaunu kasvattaa käytännön kokonaiskapasiteetin noin 20 kuutioon.",
    comboItems: ["Sopii suurempiin asuntoihin ja runsaisiin tavaramääriin", "Vähemmän edestakaisia ajoja voi säästää työaikaa", "Valitse suoraan ennen hinnan laskemista"],
    selectVan: "Valitse Crafter 13–15 m³",
    selectTrailer: "Valitse noin 20 m³",
    selected: "Valittu",
    cta: "Laske oma muutto",
    note: "Tilavuudet ovat suuntaa-antavia. Käytännön kapasiteettiin vaikuttavat tavaroiden muodot, pakkaustapa ja turvallinen kuormaus.",
  },
  en: {
    eyebrow: "Know what you pay for",
    title: "A large high-roof Crafter — with even more space when needed.",
    lead: "The base moving price includes a long, high-roof Crafter. For larger loads, add a 7–8 m³ trailer for only +€10/h.",
    vanTitle: "High-roof Crafter",
    vanVolume: "13–15 m³",
    vanPrice: "included in base price",
    vanText: "A strong fit for most studios, one-bedroom homes, furniture deliveries and smaller moves.",
    vanItems: ["High cargo area for tall and bulky items", "Sofas, beds, appliances and moving boxes", "Keeps the load together and reduces unnecessary extra trips"],
    comboTitle: "Crafter + trailer",
    comboVolume: "about 20 m³",
    comboPrice: "+€10/h",
    comboText: "For a clearly larger load, a 7–8 m³ trailer increases practical total capacity to around 20 cubic metres.",
    comboItems: ["Better for larger homes and heavier volumes", "Fewer back-and-forth trips can reduce total working time", "Choose it before calculating the final estimate"],
    selectVan: "Choose Crafter 13–15 m³",
    selectTrailer: "Choose about 20 m³",
    selected: "Selected",
    cta: "Calculate your move",
    note: "Volumes are approximate. Practical capacity depends on item shapes, packing and safe loading.",
  },
  uk: {
    eyebrow: "Розумійте, за що платите",
    title: "Великий високий Crafter — і ще більше місця за потреби.",
    lead: "У базову ціну переїзду входить довгий високий Crafter. Для більшого обсягу можна додати причіп 7–8 м³ лише за +10 €/год.",
    vanTitle: "Високий Crafter",
    vanVolume: "13–15 м³",
    vanPrice: "входить у базову ціну",
    vanText: "Підходить для більшості невеликих квартир, перевезення меблів та компактних переїздів.",
    vanItems: ["Високий вантажний відсік для великих речей", "Дивани, ліжка, техніка та коробки", "Менше зайвих поїздок завдяки великому об’єму"],
    comboTitle: "Crafter + причіп",
    comboVolume: "близько 20 м³",
    comboPrice: "+10 €/год",
    comboText: "Якщо речей значно більше, причіп 7–8 м³ збільшує практичний загальний об’єм приблизно до 20 кубів.",
    comboItems: ["Для більших квартир і великої кількості речей", "Менше повторних рейсів може скоротити час роботи", "Оберіть варіант перед розрахунком ціни"],
    selectVan: "Обрати Crafter 13–15 м³",
    selectTrailer: "Обрати близько 20 м³",
    selected: "Обрано",
    cta: "Розрахувати переїзд",
    note: "Об’єми орієнтовні. Реальна місткість залежить від форми речей, пакування та безпечного завантаження.",
  },
  ru: {
    eyebrow: "Понимайте, за что платите",
    title: "Большой высокий Crafter — и ещё больше места при необходимости.",
    lead: "В базовую стоимость переезда входит длинный высокий Crafter. Если вещей больше, можно добавить прицеп 7–8 м³ всего за +10 €/ч.",
    vanTitle: "Высокий Crafter",
    vanVolume: "13–15 м³",
    vanPrice: "входит в базовую цену",
    vanText: "Подходит для большинства небольших квартир, перевозки мебели и компактных переездов.",
    vanItems: ["Высокий грузовой отсек для крупных и длинных вещей", "Диваны, кровати, техника и коробки", "Большой объём помогает избежать лишних рейсов"],
    comboTitle: "Crafter + прицеп",
    comboVolume: "около 20 м³",
    comboPrice: "+10 €/ч",
    comboText: "Если вещей заметно больше, прицеп 7–8 м³ увеличивает практический общий объём примерно до 20 кубов.",
    comboItems: ["Подходит для больших квартир и большого количества вещей", "Меньше повторных рейсов может сократить общее время работы", "Выберите вариант перед расчётом цены"],
    selectVan: "Выбрать Crafter 13–15 м³",
    selectTrailer: "Выбрать около 20 м³",
    selected: "Выбрано",
    cta: "Рассчитать свой переезд",
    note: "Объёмы ориентировочные. Реальная вместимость зависит от формы вещей, упаковки и безопасной загрузки.",
  },
} as const;

function localeNow(): Locale {
  const lang = document.documentElement.lang;
  return lang === "en" || lang === "uk" || lang === "ru" ? lang : "fi";
}

export default function VehicleCapacityV7() {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const [locale, setLocale] = useState<Locale>("fi");
  const [vehicle, setVehicle] = useState<Vehicle>("van");

  useEffect(() => {
    const mount = () => {
      const calculator = document.querySelector<HTMLElement>(".calculator-section");
      if (!calculator?.parentElement) return;
      let slot = document.getElementById("vehicle-capacity-v7");
      if (!slot) {
        slot = document.createElement("div");
        slot.id = "vehicle-capacity-v7";
        calculator.parentElement.insertBefore(slot, calculator);
      }
      setTarget(slot);
    };
    mount();
    setLocale(localeNow());
    setVehicle(sessionStorage.getItem(VEHICLE_KEY) === "trailer" ? "trailer" : "van");
    const observer = new MutationObserver(() => setLocale(localeNow()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
    return () => observer.disconnect();
  }, []);

  if (!target) return null;
  const t = copy[locale];

  const choose = (next: Vehicle) => {
    setVehicle(next);
    sessionStorage.setItem(VEHICLE_KEY, next);
    window.dispatchEvent(new CustomEvent("muuttobotti:vehicle", { detail: { vehicle: next } }));
  };
  const scrollToCalculator = () => document.querySelector(".calculator-section")?.scrollIntoView({ behavior: "smooth", block: "start" });

  return createPortal(
    <section className="vehicle-v7" aria-labelledby="vehicle-v7-title">
      <div className="vehicle-v7-shell">
        <div className="vehicle-v7-head">
          <span>{t.eyebrow}</span>
          <h2 id="vehicle-v7-title">{t.title}</h2>
          <p>{t.lead}</p>
        </div>

        <div className="vehicle-v7-grid">
          <article className={`vehicle-v7-card ${vehicle === "van" ? "vehicle-v7-selected" : ""}`}>
            <div className="vehicle-v7-cardtop">
              <div className="vehicle-v7-icon"><Truck /></div>
              <div><h3>{t.vanTitle}</h3><p>{t.vanText}</p></div>
            </div>
            <div className="vehicle-v7-metric"><strong>{t.vanVolume}</strong><span>{t.vanPrice}</span></div>
            <ul>{t.vanItems.map(item => <li key={item}><CheckCircle2 />{item}</li>)}</ul>
            <button className="vehicle-v7-select" type="button" onClick={() => choose("van")} aria-pressed={vehicle === "van"}>
              {vehicle === "van" ? <><Check />{t.selected}</> : t.selectVan}
            </button>
          </article>

          <article className={`vehicle-v7-card vehicle-v7-card-featured ${vehicle === "trailer" ? "vehicle-v7-selected" : ""}`}>
            <div className="vehicle-v7-cardtop">
              <div className="vehicle-v7-icon"><PackageCheck /></div>
              <div><h3>{t.comboTitle}</h3><p>{t.comboText}</p></div>
            </div>
            <div className="vehicle-v7-metric"><strong>{t.comboVolume}</strong><span>{t.comboPrice}</span></div>
            <ul>{t.comboItems.map(item => <li key={item}><CheckCircle2 />{item}</li>)}</ul>
            <button className="vehicle-v7-select" type="button" onClick={() => choose("trailer")} aria-pressed={vehicle === "trailer"}>
              {vehicle === "trailer" ? <><Check />{t.selected}</> : t.selectTrailer}
            </button>
          </article>
        </div>

        <div className="vehicle-v7-footer">
          <small>{t.note}</small>
          <button type="button" onClick={scrollToCalculator}>{t.cta}<ArrowRight /></button>
        </div>
      </div>
    </section>,
    target,
  );
}
