"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Eye, Gift, Move, RotateCcw, Timer, Trophy } from "lucide-react";

type Locale = "fi" | "en" | "uk" | "ru";
type Phase = "idle" | "playing" | "finished";
type Promo = { code: string; discount: 5 | 10 | 15; expiresAt: number };

export const PROMO_STORAGE_KEY = "muuttobotti-promo-puzzle-v2";

const solved = Array.from({ length: 9 }, (_, index) => index);

const copy = {
  fi: {
    kicker: "MUUTTOBOTTI-PULMA", title: "Kokoa muutto. Avaa etusi.",
    lead: "Kokoa kuva napauttamalla kahta palaa. Ei raahaamista – pulma toimii sujuvasti myös puhelimella.",
    start: "Aloita pulma", how: "Napauta kahta palaa vaihtaaksesi niiden paikat", moves: "Siirrot", time: "Aika",
    preview: "Näytä kuva", previewing: "Muista kuva", ready: "Yhdeksän palaa. Yksi valmis muutto.",
    readyText: "Nopeus ja tarkkuus ratkaisevat alennuksesi.", won: "Pulma valmis", promo: "PROMOKOODI",
    use: "Käytä varauksessa", copied: "Kopioitu", again: "Uusi pulma",
    valid: "Voimassa 30 päivää · yksi käyttö · ei voi yhdistää muihin tarjouksiin",
    levels: ["Valmis: 5 %", "Alle 90 s: 10 %", "Alle 45 s + 12 siirtoa: 15 %"], tile: "Pala",
  },
  en: {
    kicker: "MUUTTOBOTTI PUZZLE", title: "Build the move. Unlock your deal.",
    lead: "Complete the image by tapping two pieces. No dragging – it works smoothly on every phone.",
    start: "Start puzzle", how: "Tap two pieces to swap their places", moves: "Moves", time: "Time",
    preview: "Show picture", previewing: "Remember the picture", ready: "Nine pieces. One finished move.",
    readyText: "Speed and accuracy decide your discount.", won: "Puzzle complete", promo: "PROMO CODE",
    use: "Use in booking", copied: "Copied", again: "New puzzle",
    valid: "Valid for 30 days · one use · cannot be combined with other offers",
    levels: ["Complete: 5%", "Under 90 sec: 10%", "Under 45 sec + 12 moves: 15%"], tile: "Piece",
  },
  uk: {
    kicker: "ПАЗЛ MUUTTOBOTTI", title: "Складіть переїзд. Отримайте знижку.",
    lead: "Складіть зображення, натискаючи дві деталі. Без перетягування — зручно на будь-якому телефоні.",
    start: "Почати пазл", how: "Натисніть дві деталі, щоб поміняти їх місцями", moves: "Ходи", time: "Час",
    preview: "Показати картинку", previewing: "Запам’ятайте картинку", ready: "Дев’ять деталей. Один готовий переїзд.",
    readyText: "Швидкість і точність визначать вашу знижку.", won: "Пазл складено", promo: "ПРОМОКОД",
    use: "Використати в заявці", copied: "Скопійовано", again: "Новий пазл",
    valid: "Діє 30 днів · одне використання · не поєднується з іншими пропозиціями",
    levels: ["Готово: 5%", "До 90 с: 10%", "До 45 с + 12 ходів: 15%"], tile: "Деталь",
  },
  ru: {
    kicker: "ПАЗЛ MUUTTOBOTTI", title: "Соберите переезд. Откройте скидку.",
    lead: "Соберите изображение, нажимая на две детали. Без перетаскивания — удобно на любом телефоне.",
    start: "Начать пазл", how: "Нажмите две детали, чтобы поменять их местами", moves: "Ходы", time: "Время",
    preview: "Показать картинку", previewing: "Запомните картинку", ready: "Девять деталей. Один готовый переезд.",
    readyText: "Скорость и точность определят вашу скидку.", won: "Пазл собран", promo: "ПРОМОКОД",
    use: "Использовать в заявке", copied: "Скопировано", again: "Новый пазл",
    valid: "Действует 30 дней · одно использование · не суммируется с другими предложениями",
    levels: ["Готово: 5%", "До 90 сек: 10%", "До 45 сек + 12 ходов: 15%"], tile: "Деталь",
  },
} as const;

function readPromo(): Promo | null {
  try {
    const value = JSON.parse(localStorage.getItem(PROMO_STORAGE_KEY) || "null") as Promo | null;
    return value && value.expiresAt > Date.now() ? value : null;
  } catch { return null; }
}

function makeCode(discount: 5 | 10 | 15) {
  const random = Array.from(crypto.getRandomValues(new Uint8Array(3)))
    .map(value => (value % 36).toString(36).toUpperCase()).join("");
  return `PUZZLE${discount}-${random}`;
}

function shuffledTiles() {
  let tiles = [...solved];
  do {
    tiles = [...solved];
    for (let i = tiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
    }
  } while (tiles.filter((piece, index) => piece !== index).length < 7);
  return tiles;
}

export default function PromoGame({ locale }: { locale: Locale }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [tiles, setTiles] = useState(solved);
  const [selected, setSelected] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [preview, setPreview] = useState(false);
  const [promo, setPromo] = useState<Promo | null>(null);
  const [copied, setCopied] = useState(false);
  const startedAt = useRef(0);
  const t = copy[locale];

  useEffect(() => {
    const existing = readPromo();
    if (existing) { setPromo(existing); setPhase("finished"); }
  }, []);

  useEffect(() => {
    if (phase !== "playing") return;
    const timer = window.setInterval(() => setSeconds(Math.floor((Date.now() - startedAt.current) / 1000)), 250);
    return () => window.clearInterval(timer);
  }, [phase]);

  const start = () => {
    setTiles(shuffledTiles());
    setSelected(null); setMoves(0); setSeconds(0); setPreview(false); setCopied(false);
    startedAt.current = Date.now();
    setPhase("playing");
  };

  const finish = (nextMoves: number) => {
    const elapsed = Math.max(1, Math.floor((Date.now() - startedAt.current) / 1000));
    const discount: 5 | 10 | 15 = elapsed <= 45 && nextMoves <= 12 ? 15 : elapsed <= 90 ? 10 : 5;
    const result: Promo = { code: makeCode(discount), discount, expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000 };
    localStorage.setItem(PROMO_STORAGE_KEY, JSON.stringify(result));
    setSeconds(elapsed); setPromo(result); setPhase("finished");
  };

  const chooseTile = (position: number) => {
    if (phase !== "playing" || preview) return;
    if (selected === null) { setSelected(position); return; }
    if (selected === position) { setSelected(null); return; }
    const next = [...tiles];
    [next[selected], next[position]] = [next[position], next[selected]];
    const nextMoves = moves + 1;
    setTiles(next); setMoves(nextMoves); setSelected(null);
    if (next.every((piece, index) => piece === index)) finish(nextMoves);
  };

  const showPreview = () => {
    if (preview || phase !== "playing") return;
    setSelected(null); setPreview(true);
    window.setTimeout(() => setPreview(false), 2200);
  };

  const usePromo = async () => {
    if (!promo) return;
    try { await navigator.clipboard.writeText(promo.code); } catch { /* added to booking automatically */ }
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
          {t.levels.map((level, index) => <span key={level} className={promo?.discount === ([5, 10, 15] as const)[index] ? "active" : ""}><Check />{level}</span>)}
        </div>
        <small>{t.valid}</small>
      </div>

      <div className={`promo-puzzle-card is-${phase}`}>
        <div className="promo-puzzle-top">
          <span><Move /><small>{t.moves}</small><strong>{moves}</strong></span>
          <span><Timer /><small>{t.time}</small><strong>{seconds}s</strong></span>
          <button type="button" onClick={showPreview} disabled={phase !== "playing" || preview}><Eye />{preview ? t.previewing : t.preview}</button>
        </div>

        <div className="promo-puzzle-stage" aria-live="polite">
          <div className={`promo-puzzle-grid ${preview ? "is-preview" : ""}`}>
            {tiles.map((piece, position) => {
              const row = Math.floor(piece / 3);
              const column = piece % 3;
              return <button
                type="button" key={`${position}-${piece}`} className={`promo-puzzle-tile ${selected === position ? "is-selected" : ""}`}
                style={{ backgroundPosition: `${column * 50}% ${row * 50}%` }}
                onClick={() => chooseTile(position)} aria-label={`${t.tile} ${position + 1}`}
                data-piece={piece} data-position={position}
              ><span>{position + 1}</span></button>;
            })}
          </div>

          {phase === "idle" && <div className="promo-puzzle-overlay">
            <span className="promo-overlay-icon"><Move /></span><h3>{t.ready}</h3><p>{t.readyText}</p>
            <button type="button" onClick={start}>{t.start}<ArrowRight /></button>
          </div>}

          {phase === "playing" && !preview && <div className="promo-puzzle-tip">{t.how}</div>}

          {phase === "finished" && promo && <div className="promo-puzzle-overlay promo-result">
            <span className="promo-overlay-icon"><Trophy /></span><p>{t.won}</p><h3>−{promo.discount}%</h3>
            <small>{t.promo}</small><strong className="promo-code">{promo.code}</strong>
            <div className="promo-result-actions">
              <button type="button" onClick={usePromo}>{copied ? t.copied : t.use}<ArrowRight /></button>
              <button type="button" className="promo-again" onClick={start}><RotateCcw />{t.again}</button>
            </div>
          </div>}
        </div>
      </div>
    </section>
  );
}
