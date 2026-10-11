"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Gift, Package, Timer, Trophy, Truck } from "lucide-react";

type Locale = "fi" | "en" | "uk" | "ru";
type Phase = "idle" | "playing" | "finished";
type BoxItem = { id: number; top: number; tone: number; size: number };
type Promo = { code: string; discount: 5 | 10 | 15; expiresAt: number };

export const PROMO_STORAGE_KEY = "muuttobotti-promo-v1";

const copy = {
  fi: {
    kicker: "MUUTTOBOTTI-PELI", title: "Pakkaa fiksusti. Voita alennus.",
    lead: "Nappaa muuttolaatikot kyytiin 15 sekunnissa. Jokainen pelaaja saa vähintään 5 % alennuksen.",
    start: "Aloita peli", instruction: "Napauta laatikoita ennen kuin ne ehtivät ohi", loaded: "Kyydissä", seconds: "aikaa",
    ready: "Furgon on valmis", readyText: "Aloita, kun olet valmis. Peli toimii hiirellä ja puhelimella.",
    won: "Sinä voitit", promo: "PROMOKOODI", use: "Käytä varauksessa", copied: "Kopioitu",
    valid: "Voimassa 30 päivää · yksi käyttö · ei voi yhdistää muihin tarjouksiin",
    levels: ["Osallistu: 5 %", "5 laatikkoa: 10 %", "10 laatikkoa: 15 %"],
  },
  en: {
    kicker: "MUUTTOBOTTI GAME", title: "Pack smart. Win a discount.",
    lead: "Load the moving boxes in 15 seconds. Every player wins at least 5% off.",
    start: "Start game", instruction: "Tap the boxes before they pass", loaded: "Loaded", seconds: "left",
    ready: "The van is ready", readyText: "Start when you are ready. Play with a mouse or on your phone.",
    won: "You won", promo: "PROMO CODE", use: "Use in booking", copied: "Copied",
    valid: "Valid for 30 days · one use · cannot be combined with other offers",
    levels: ["Play: 5%", "5 boxes: 10%", "10 boxes: 15%"],
  },
  uk: {
    kicker: "ГРА MUUTTOBOTTI", title: "Пакуйте вправно. Вигравайте знижку.",
    lead: "Завантажте коробки за 15 секунд. Кожен учасник отримує щонайменше 5% знижки.",
    start: "Почати гру", instruction: "Натискайте на коробки, поки вони не проїхали", loaded: "Завантажено", seconds: "секунд",
    ready: "Фургон готовий", readyText: "Починайте, коли будете готові. Гра працює мишкою та на телефоні.",
    won: "Ви виграли", promo: "ПРОМОКОД", use: "Використати в заявці", copied: "Скопійовано",
    valid: "Діє 30 днів · одне використання · не поєднується з іншими пропозиціями",
    levels: ["Участь: 5%", "5 коробок: 10%", "10 коробок: 15%"],
  },
  ru: {
    kicker: "ИГРА MUUTTOBOTTI", title: "Грузите ловко. Получайте скидку.",
    lead: "Загрузите коробки за 15 секунд. Каждый участник получает минимум 5% скидки.",
    start: "Начать игру", instruction: "Нажимайте на коробки, пока они не проехали", loaded: "Загружено", seconds: "секунд",
    ready: "Фургон готов", readyText: "Начинайте, когда будете готовы. Игра работает мышкой и на телефоне.",
    won: "Вы выиграли", promo: "ПРОМОКОД", use: "Использовать в заявке", copied: "Скопировано",
    valid: "Действует 30 дней · одно использование · не суммируется с другими предложениями",
    levels: ["Участие: 5%", "5 коробок: 10%", "10 коробок: 15%"],
  },
} as const;

function readPromo(): Promo | null {
  try {
    const value = JSON.parse(localStorage.getItem(PROMO_STORAGE_KEY) || "null") as Promo | null;
    if (!value || value.expiresAt <= Date.now()) return null;
    return value;
  } catch {
    return null;
  }
}

function makeCode(discount: 5 | 10 | 15) {
  const random = Array.from(crypto.getRandomValues(new Uint8Array(3)))
    .map(value => (value % 36).toString(36).toUpperCase())
    .join("");
  return `BOTTI${discount}-${random}`;
}

export default function PromoGame({ locale }: { locale: Locale }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [timeLeft, setTimeLeft] = useState(15);
  const [score, setScore] = useState(0);
  const [boxes, setBoxes] = useState<BoxItem[]>([]);
  const [promo, setPromo] = useState<Promo | null>(null);
  const [copied, setCopied] = useState(false);
  const scoreRef = useRef(0);
  const nextId = useRef(1);
  const t = copy[locale];

  useEffect(() => {
    const existing = readPromo();
    if (existing) {
      setPromo(existing);
      setPhase("finished");
    }
  }, []);

  useEffect(() => {
    if (phase !== "playing") return;
    const startedAt = Date.now();
    const clock = window.setInterval(() => {
      const remaining = Math.max(0, 15 - Math.floor((Date.now() - startedAt) / 1000));
      setTimeLeft(remaining);
    }, 200);
    const spawn = window.setInterval(() => {
      const item: BoxItem = {
        id: nextId.current++,
        top: 12 + Math.random() * 62,
        tone: Math.floor(Math.random() * 3),
        size: 46 + Math.floor(Math.random() * 12),
      };
      setBoxes(current => [...current.slice(-7), item]);
      window.setTimeout(() => setBoxes(current => current.filter(box => box.id !== item.id)), 2500);
    }, 650);
    const finish = window.setTimeout(() => {
      const discount: 5 | 10 | 15 = scoreRef.current >= 10 ? 15 : scoreRef.current >= 5 ? 10 : 5;
      const result: Promo = { code: makeCode(discount), discount, expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000 };
      localStorage.setItem(PROMO_STORAGE_KEY, JSON.stringify(result));
      setPromo(result);
      setBoxes([]);
      setTimeLeft(0);
      setPhase("finished");
    }, 15000);
    return () => {
      window.clearInterval(clock);
      window.clearInterval(spawn);
      window.clearTimeout(finish);
    };
  }, [phase]);

  const start = () => {
    scoreRef.current = 0;
    setScore(0);
    setBoxes([]);
    setTimeLeft(15);
    setCopied(false);
    setPhase("playing");
  };

  const catchBox = (id: number) => {
    if (phase !== "playing") return;
    setBoxes(current => current.filter(box => box.id !== id));
    scoreRef.current += 1;
    setScore(scoreRef.current);
  };

  const usePromo = async () => {
    if (!promo) return;
    try { await navigator.clipboard.writeText(promo.code); } catch { /* booking still receives it automatically */ }
    setCopied(true);
    document.getElementById("booking")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="promo-game-section" aria-labelledby="promo-game-title">
      <div className="promo-game-copy">
        <span className="promo-game-kicker"><Gift />{t.kicker}</span>
        <h2 id="promo-game-title">{t.title}</h2>
        <p>{t.lead}</p>
        <div className="promo-levels">
          {t.levels.map((level, index) => <span key={level} className={promo?.discount === [5, 10, 15][index] ? "active" : ""}><Check />{level}</span>)}
        </div>
        <small>{t.valid}</small>
      </div>

      <div className={`promo-game-card is-${phase}`}>
        <div className="promo-game-top">
          <span><Package />{t.loaded} <strong>{score}</strong></span>
          <span><Timer /><strong>{timeLeft}</strong> {t.seconds}</span>
        </div>
        <div className="promo-playfield" aria-live="polite">
          <div className="promo-road-lines" aria-hidden="true" />
          <div className="promo-van" aria-hidden="true"><Truck /><span>MB</span></div>

          {phase === "playing" && boxes.map(box => (
            <button
              type="button"
              className={`promo-box tone-${box.tone}`}
              style={{ top: `${box.top}%`, width: box.size, height: box.size }}
              key={box.id}
              onClick={() => catchBox(box.id)}
              aria-label={t.instruction}
            ><Package /></button>
          ))}

          {phase === "idle" && <div className="promo-game-overlay">
            <span className="promo-overlay-icon"><Truck /></span>
            <h3>{t.ready}</h3><p>{t.readyText}</p>
            <button type="button" onClick={start}>{t.start}<ArrowRight /></button>
          </div>}

          {phase === "playing" && <div className="promo-instruction">{t.instruction}</div>}

          {phase === "finished" && promo && <div className="promo-game-overlay promo-result">
            <span className="promo-overlay-icon"><Trophy /></span>
            <p>{t.won}</p><h3>−{promo.discount}%</h3>
            <small>{t.promo}</small><strong className="promo-code">{promo.code}</strong>
            <button type="button" onClick={usePromo}>{copied ? t.copied : t.use}<ArrowRight /></button>
          </div>}
        </div>
      </div>
    </section>
  );
}
