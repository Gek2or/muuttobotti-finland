"use client";

import { useMemo, useState } from "react";

type Tab = "home" | "calc" | "booking" | "track" | "profile";

const tabs: { key: Tab; icon: string; label: string }[] = [
  { key: "home", icon: "⌂", label: "Koti" },
  { key: "calc", icon: "±", label: "Laskuri" },
  { key: "booking", icon: "+", label: "Varaa" },
  { key: "track", icon: "◎", label: "Seuraa" },
  { key: "profile", icon: "●", label: "Profiili" },
];

export default function MobilePreview() {
  const [tab, setTab] = useState<Tab>("home");
  const [m2, setM2] = useState(55);
  const [km, setKm] = useState(15);
  const [movers, setMovers] = useState<1 | 2>(2);
  const [lang, setLang] = useState("FI");

  const estimate = useMemo(() => {
    const hourly = movers === 1 ? 59 : 75;
    const sizeHours = Math.max(0, m2 - 20) * (movers === 1 ? 0.016 : 0.011);
    const hours = Math.max(2, 1.7 + sizeHours);
    return Math.round(hours * hourly + Math.max(0, km - 10) * 0.85);
  }, [m2, km, movers]);

  return (
    <main className="mp-shell">
      <div className="mp-topnote"><strong>Muuttobotti Mobile v0.2</strong><span>Interactive web preview</span></div>
      <section className="mp-phone" aria-label="Muuttobotti mobile app preview">
        <div className="mp-status"><span>9:41</span><span>● ● ●</span></div>
        <header className="mp-header"><div className="mp-brand"><b>M</b><span>Muuttobotti</span></div><button>{lang}</button></header>

        <div className="mp-screen">
          {tab === "home" && <Home onGo={setTab} />}
          {tab === "calc" && <Calculator m2={m2} km={km} movers={movers} setM2={setM2} setKm={setKm} setMovers={setMovers} estimate={estimate} />}
          {tab === "booking" && <Booking />}
          {tab === "track" && <Tracking />}
          {tab === "profile" && <Profile lang={lang} setLang={setLang} />}
        </div>

        <nav className="mp-tabs">{tabs.map(item => <button key={item.key} onClick={() => setTab(item.key)} className={tab === item.key ? "active" : ""}><i>{item.icon}</i><span>{item.label}</span></button>)}</nav>
      </section>
      <p className="mp-hint">Это web-preview мобильного интерфейса. Нажимай нижние вкладки и элементы калькулятора.</p>
    </main>
  );
}

function Home({ onGo }: { onGo: (tab: Tab) => void }) {
  return <div className="mp-stack">
    <section className="mp-hero"><small>MUUTTOBOTTI APP</small><h1>Muutto ilman turhaa säätöä.</h1><p>Hintalaskuri, varaus, seuranta ja yhteydenpito samassa paikassa.</p></section>
    <div className="mp-rating"><div><b>4,9</b><span>★★★★★</span></div><small>34 Google-arvostelua</small></div>
    <button className="mp-action lime" onClick={() => onGo("calc")}><strong>Laske hinta</strong><span>Muutto, siivous tai kuljetus</span><em>→</em></button>
    <button className="mp-action" onClick={() => onGo("booking")}><strong>Tee varaus</strong><span>Lähetä osoitteet, aika ja kuvat</span><em>→</em></button>
    <button className="mp-action" onClick={() => onGo("track")}><strong>Seuraa varausta</strong><span>Avaa tilaus varausnumerolla</span><em>→</em></button>
  </div>;
}

function Stepper({ label, value, unit, step, set }: { label: string; value: number; unit: string; step: number; set: (n: number) => void }) {
  return <div className="mp-control"><label>{label}</label><div className="mp-stepper"><button onClick={() => set(Math.max(0, value - step))}>−</button><strong>{value}<small>{unit}</small></strong><button onClick={() => set(value + step)}>+</button></div></div>;
}

function Calculator({ m2, km, movers, setM2, setKm, setMovers, estimate }: any) {
  return <div className="mp-stack"><div className="mp-title"><small>HINTALASKURI</small><h2>Laske arvio</h2></div>
    <div className="mp-segments"><button className="active">Muutto</button><button>Siivous</button><button>Kuljetus</button></div>
    <div className="mp-control"><label>Muuttajien määrä</label><div className="mp-people"><button className={movers === 1 ? "active" : ""} onClick={() => setMovers(1)}><b>1 muuttaja</b><span>59 €/h</span></button><button className={movers === 2 ? "active" : ""} onClick={() => setMovers(2)}><b>2 muuttajaa</b><span>75 €/h · Crafter</span></button></div></div>
    <Stepper label="Asunnon koko" value={m2} unit="m²" step={5} set={setM2} />
    <Stepper label="Etäisyys" value={km} unit="km" step={5} set={setKm} />
    <div className="mp-recommend"><small>SUOSITUS</small><b>{m2 >= 70 ? "2 muuttajaa suositellaan" : "Valinta näyttää hyvältä"}</b><p>Pinta-ala on vain yksi tekijä. Tavaramäärä ja olosuhteet vaikuttavat lopulliseen arvioon.</p></div>
    <div className="mp-price"><small>ALUSTAVA ARVIO</small><b>{estimate} €</b><span>Minimi 2 h · ensimmäiset 10 km sisältyvät</span></div>
  </div>;
}

function Booking() {
  return <div className="mp-stack"><div className="mp-title"><small>UUSI VARAUS</small><h2>Varaa muutto</h2></div>
    <div className="mp-segments"><button className="active">Muutto</button><button>Siivous</button><button>Kuljetus</button></div>
    {[["Nimi","Matti Meikäläinen"],["Puhelin","045 123 4567"],["Sähköposti","matti@email.fi"],["Nouto-osoite","Helsinki"],["Kohdeosoite","Espoo"]].map(([l,v]) => <div className="mp-field" key={l}><small>{l}</small><span>{v}</span></div>)}
    <div className="mp-two"><div className="mp-field"><small>Päivä</small><span>31.8.2026</span></div><div className="mp-field"><small>Aika</small><span>10:00</span></div></div>
    <button className="mp-submit">Lähetä varaus</button>
  </div>;
}

function Tracking() {
  return <div className="mp-stack"><section className="mp-trackhero"><small>VARAUS MB-12AB34CD</small><h2>Vahvistettu</h2><p>Muutto · 31.8.2026 · 10:00</p></section>
    <div className="mp-timeline"><div className="done"><i>✓</i><span><b>Vastaanotettu</b><small>Varaus tallennettu</small></span></div><div className="done"><i>✓</i><span><b>Vahvistettu</b><small>Aika on vahvistettu</small></span></div><div><i>3</i><span><b>Matkalla</b><small>Ilmoitamme, kun tiimi lähtee</small></span></div><div><i>4</i><span><b>Valmis</b><small>Työ valmistunut</small></span></div></div>
    <div className="mp-field"><small>Nouto</small><span>Iso Roobertinkatu, Helsinki</span></div><div className="mp-field"><small>Kohde</small><span>Tammisto, Vantaa</span></div>
  </div>;
}

function Profile({ lang, setLang }: { lang: string; setLang: (s: string) => void }) {
  return <div className="mp-stack"><div className="mp-title"><small>PROFIILI</small><h2>Omat tiedot</h2></div>
    <div className="mp-profilecard"><div className="mp-avatar">M</div><div><b>Muuttobotti-asiakas</b><span>Tilaukset ja asetukset</span></div></div>
    <div className="mp-control"><label>Kieli</label><div className="mp-lang">{["FI","EN","UA","RU"].map(l => <button key={l} className={lang === l ? "active" : ""} onClick={() => setLang(l)}>{l}</button>)}</div></div>
    <div className="mp-section"><small>TALLENNETUT VARAUKSET</small><div className="mp-saved"><b>MB-12AB34CD</b><span>31.8.2026 · Muutto</span></div></div>
    <div className="mp-section"><small>ILMOITUKSET</small><div className="mp-setting"><span>Push-ilmoitukset</span><i>ON</i></div><div className="mp-setting"><span>WhatsApp</span><i>→</i></div></div>
  </div>;
}
