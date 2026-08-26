"use client";

import { useMemo, useState } from "react";
import { Calculator, CalendarDays, Home, PackageCheck, Phone, UserRound, Truck, MapPin, ChevronRight, CheckCircle2 } from "lucide-react";
import styles from "./preview.module.css";

type Tab = "home" | "calculator" | "booking" | "orders" | "profile";

const tabs: { id: Tab; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Koti", icon: Home },
  { id: "calculator", label: "Hinta", icon: Calculator },
  { id: "booking", label: "Varaa", icon: CalendarDays },
  { id: "orders", label: "Tilaukset", icon: PackageCheck },
  { id: "profile", label: "Profiili", icon: UserRound },
];

export default function AppPreviewPage() {
  const [tab, setTab] = useState<Tab>("home");
  const [movers, setMovers] = useState<1 | 2>(2);
  const [hours, setHours] = useState(2);
  const [trailer, setTrailer] = useState(false);
  const [from, setFrom] = useState("Helsinki");
  const [to, setTo] = useState("Espoo");
  const [date, setDate] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const hourly = movers === 2 ? 75 : 60;
  const total = useMemo(() => Math.max(2, hours) * (hourly + (trailer ? 10 : 0)), [hours, hourly, trailer]);

  function go(next: Tab) {
    setSubmitted(false);
    setTab(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function submitBooking(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !date) return;
    setSubmitted(true);
  }

  return (
    <main className={styles.shell}>
      <section className={styles.phoneFrame}>
        <header className={styles.header}>
          <div>
            <div className={styles.brand}>MUUTTOBOTTI</div>
            <div className={styles.version}>App preview · v2.1.1</div>
          </div>
          <a className={styles.iconButton} href="tel:+3584578767567" aria-label="Soita Muuttobotille"><Phone size={19} /></a>
        </header>

        <div className={styles.content}>
          {tab === "home" && (
            <>
              <section className={styles.hero}>
                <div className={styles.badge}>Nopea muutto ilman säätöä</div>
                <h1>Muutto hallintaan yhdestä sovelluksesta.</h1>
                <p>Laske hinta, valitse kalusto ja tee varaus suoraan puhelimella.</p>
                <button className={styles.primary} onClick={() => go("calculator")}>Laske hinta <ChevronRight size={18} /></button>
              </section>

              <div className={styles.sectionTitle}>Kalusto</div>
              <section className={styles.vehicleCard}>
                <div className={styles.vehicleIcon}><Truck size={28} /></div>
                <div className={styles.grow}>
                  <strong>VW Crafter · korkea</strong>
                  <span>13–15 m³ · sopii useimpiin 1–3h asuntoihin</span>
                </div>
                <span className={styles.priceTag}>75 €/h</span>
              </section>
              <section className={styles.vehicleCard}>
                <div className={styles.vehicleIcon}><Truck size={28} /></div>
                <div className={styles.grow}>
                  <strong>Crafter + peräkärry</strong>
                  <span>Noin 20 m³ · +7–8 m³ lisätila</span>
                </div>
                <span className={styles.priceTag}>+10 €/h</span>
              </section>

              <div className={styles.sectionTitle}>Pikatoiminnot</div>
              <div className={styles.quickGrid}>
                <button onClick={() => go("booking")}><CalendarDays size={22} /><span>Varaa muutto</span></button>
                <button onClick={() => go("calculator")}><Calculator size={22} /><span>Hintalaskuri</span></button>
                <a href="tel:+3584578767567"><Phone size={22} /><span>Soita</span></a>
                <button onClick={() => go("orders")}><PackageCheck size={22} /><span>Tilaukset</span></button>
              </div>
            </>
          )}

          {tab === "calculator" && (
            <section className={styles.panel}>
              <div className={styles.eyebrow}>Hintalaskuri</div>
              <h2>Arvio muuton hinnasta</h2>
              <label>Lähtöosoite<input value={from} onChange={(e) => setFrom(e.target.value)} /></label>
              <label>Kohdeosoite<input value={to} onChange={(e) => setTo(e.target.value)} /></label>

              <div className={styles.segmentLabel}>Muuttajat</div>
              <div className={styles.segmented}>
                <button className={movers === 1 ? styles.active : ""} onClick={() => setMovers(1)}>1 muuttaja · 60 €/h</button>
                <button className={movers === 2 ? styles.active : ""} onClick={() => setMovers(2)}>2 muuttajaa · 75 €/h</button>
              </div>

              <label>Tunnit: <strong>{hours} h</strong><input className={styles.range} type="range" min="2" max="8" step="0.5" value={hours} onChange={(e) => setHours(Number(e.target.value))} /></label>

              <button className={`${styles.trailerToggle} ${trailer ? styles.trailerOn : ""}`} onClick={() => setTrailer(!trailer)}>
                <span><strong>Lisää peräkärry</strong><small>n. 20 m³ kokonaiskapasiteetti</small></span>
                <span>{trailer ? "Lisätty" : "+10 €/h"}</span>
              </button>

              <div className={styles.totalBox}>
                <span>Arvio yhteensä</span>
                <strong>{total.toFixed(0)} €</strong>
                <small>Minimi 2 h. Lopullinen hinta määräytyy toteutuneen työajan mukaan.</small>
              </div>
              <button className={styles.primary} onClick={() => go("booking")}>Jatka varaukseen <ChevronRight size={18} /></button>
            </section>
          )}

          {tab === "booking" && (
            <section className={styles.panel}>
              {!submitted ? (
                <form onSubmit={submitBooking}>
                  <div className={styles.eyebrow}>Varaus</div>
                  <h2>Varaa muutto</h2>
                  <div className={styles.routeBox}><MapPin size={18} /><div><strong>{from || "Lähtöosoite"}</strong><span>→ {to || "Kohdeosoite"}</span></div></div>
                  <label>Päivä<input required type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label>
                  <label>Nimi<input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Etunimi Sukunimi" /></label>
                  <label>Puhelin<input required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+358 ..." inputMode="tel" /></label>
                  <div className={styles.summaryLine}><span>{movers} muuttaja{movers === 2 ? "a" : ""}{trailer ? " + peräkärry" : ""}</span><strong>arvio {total.toFixed(0)} €</strong></div>
                  <button className={styles.primary} type="submit">Vahvista preview-varaus</button>
                  <p className={styles.note}>Preview-tilassa varausta ei lähetetä tuotannon järjestelmään.</p>
                </form>
              ) : (
                <div className={styles.success}>
                  <CheckCircle2 size={54} />
                  <h2>Varauspolku toimii.</h2>
                  <p>{name}, valintasi on vastaanotettu tässä previewssa.</p>
                  <div className={styles.totalBox}><span>{date}</span><strong>{total.toFixed(0)} €</strong><small>{from} → {to}</small></div>
                  <button className={styles.primary} onClick={() => go("home")}>Takaisin etusivulle</button>
                </div>
              )}
            </section>
          )}

          {tab === "orders" && (
            <section className={styles.panel}>
              <div className={styles.eyebrow}>Tilaukset</div>
              <h2>Omat muutot</h2>
              <div className={styles.empty}><PackageCheck size={42} /><strong>Ei aktiivisia tilauksia</strong><span>Tulevat ja aiemmat varaukset näkyvät täällä.</span><button className={styles.primary} onClick={() => go("booking")}>Tee ensimmäinen varaus</button></div>
            </section>
          )}

          {tab === "profile" && (
            <section className={styles.panel}>
              <div className={styles.eyebrow}>Profiili</div>
              <h2>Muuttobotti-tili</h2>
              <div className={styles.profileCard}><UserRound size={28} /><div><strong>Vierastila</strong><span>Kirjautuminen lisätään seuraavaan vaiheeseen.</span></div></div>
              <a className={styles.secondary} href="tel:+3584578767567">Ota yhteyttä asiakaspalveluun</a>
              <a className={styles.secondary} href="/">Avaa muuttobotti.fi</a>
            </section>
          )}
        </div>

        <nav className={styles.bottomNav} aria-label="Sovelluksen navigaatio">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} className={tab === id ? styles.navActive : ""} onClick={() => go(id)}><Icon size={21} /><span>{label}</span></button>
          ))}
        </nav>
      </section>
    </main>
  );
}
