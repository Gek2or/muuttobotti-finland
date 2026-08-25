import type { Metadata } from "next";
import SoroBlogEmbed from "./SoroBlogEmbed";
import "./blog.css";

export const metadata: Metadata = {
  title: "Muutto-opas ja vinkit",
  description:
    "Muuttobotin käytännön oppaat muuttoon, kuljetuksiin, pakkaamiseen, siivoukseen ja sujuvampaan muuttopäivään Suomessa.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "Muuttobotti Blogi — muutto-oppaat ja vinkit",
    description:
      "Käytännön vinkkejä muuttoon, kuljetuksiin, pakkaamiseen ja siivoukseen Suomessa.",
    url: "https://muuttobotti.fi/blog",
    siteName: "Muuttobotti",
    locale: "fi_FI",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function BlogPage() {
  return (
    <main className="blog-page-shell">
      <header className="blog-topbar">
        <a className="blog-brand" href="/" aria-label="Muuttobotti etusivu">
          <span className="blog-brand-mark">M</span>
          <span>
            muutto<strong>botti</strong>
          </span>
        </a>
        <nav className="blog-nav" aria-label="Blog navigation">
          <a href="/">Etusivu</a>
          <a href="/#services">Palvelut</a>
          <a href="/#calculator">Hinnat</a>
          <a className="blog-cta" href="/#booking">Pyydä tarjous</a>
        </nav>
      </header>

      <section className="blog-hero">
        <div className="blog-hero-inner">
          <span className="blog-kicker">MUUTTOBOTTI · OPPAAT</span>
          <h1>Fiksumpi muutto alkaa hyvästä suunnitelmasta.</h1>
          <p>
            Käytännön vinkkejä muuttoon, kuljetuksiin, pakkaamiseen ja siivoukseen — selkeästi ja ilman turhaa säätöä.
          </p>
        </div>
      </section>

      <section className="blog-content" aria-label="Muuttobotti blog articles">
        <SoroBlogEmbed />
      </section>

      <section className="blog-bottom-cta">
        <div>
          <span>Tarvitsetko apua muuttoon?</span>
          <h2>Laske hinta tai lähetä varaus suoraan verkossa.</h2>
        </div>
        <a href="/#calculator">Laske hinta</a>
      </section>
    </main>
  );
}
