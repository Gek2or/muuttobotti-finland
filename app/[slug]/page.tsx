/* eslint-disable @next/next/no-html-link-for-pages */
import type { Metadata } from "next";
import { ArrowLeft, CheckCircle2, Mail, MessageCircle, PackageCheck, Phone, UserRound } from "lucide-react";
import { notFound } from "next/navigation";
import { servicePages } from "./service-pages";

export function generateStaticParams() {
  return Object.keys(servicePages).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = servicePages[slug];
  if (!page) return {};
  const socialTitle = `${page.title} | Muuttobotti`;
  const socialImage = "/muuttobotti-hero.png";
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: `/${slug}` },
    openGraph: {
      title: socialTitle,
      description: page.description,
      url: `/${slug}`,
      siteName: "Muuttobotti",
      locale: "fi_FI",
      type: "website",
      images: [socialImage],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description: page.description,
      images: [socialImage],
    },
  };
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = servicePages[slug];
  if (!page) notFound();
  const isLegal = slug === "privacy" || slug === "terms";

  return (
    <main className={`seo-page ${isLegal ? "legal-page" : ""}`}>
      <header>
        <a href="/" className="brand"><span className="brand-mark"><PackageCheck/></span><span>muutto<span>botti</span></span></a>
        <a href={isLegal ? "/" : "/#booking"} className="quote-button">{isLegal ? "Etusivulle" : "Pyydä tarjous"}</a>
      </header>
      <section>
        <a href="/" className="back-link"><ArrowLeft/> Etusivulle</a>
        <div className="seo-copy">
          <span className="kicker light">{page.eyebrow}</span><h1>{page.title}</h1><p>{page.description}</p>
          <div className="seo-bullets">{page.bullets.map((item) => <span key={item}><CheckCircle2/>{item}</span>)}</div>
          {isLegal ? (
            <div className="seo-actions"><a href="mailto:autochemixfin@gmail.com">Ota yhteyttä</a><a href="/">Takaisin etusivulle</a></div>
          ) : (
            <div className="seo-actions"><a href="/#calculator">Laske hinta</a><a href="/#booking">Varaa verkossa</a></div>
          )}
        </div>
        <div className="seo-contact">
          <strong>{isLegal ? "Kysyttävää tietosuojasta tai ehdoista?" : "Tarvitsetko apua heti?"}</strong>
          <span><UserRound/> Stanislav Kosytskyy</span>
          <a href="tel:+3584578767567"><Phone/> 045 787 67567</a>
          <a href="mailto:autochemixfin@gmail.com"><Mail/> autochemixfin@gmail.com</a>
          {!isLegal && <a href="https://wa.me/3584578767567"><MessageCircle/> WhatsApp</a>}
        </div>
      </section>
      <footer><span>© 2026 Muuttobotti · Autochemix Oy · Y-tunnus 3543357-8</span><a href="/privacy">Tietosuoja</a><a href="/terms">Ehdot</a></footer>
    </main>
  );
}
