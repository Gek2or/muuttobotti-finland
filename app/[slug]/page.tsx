/* eslint-disable @next/next/no-html-link-for-pages */
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock3, Mail, MessageCircle, PackageCheck, Phone, ShieldCheck, UserRound } from "lucide-react";
import { notFound } from "next/navigation";
import { servicePages } from "./service-pages";

export function generateStaticParams() {
  return Object.keys(servicePages).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = servicePages[slug];
  if (!page) return {};
  const url = `https://muuttobotti.fi/${slug}`;

  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: `/${slug}` },
    openGraph: {
      title: `${page.title} | Muuttobotti`,
      description: page.description,
      url,
      siteName: "Muuttobotti",
      locale: "fi_FI",
      type: "website",
      images: [{ url: "/muuttobotti-hero.png", alt: `${page.title} – Muuttobotti` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${page.title} | Muuttobotti`,
      description: page.description,
      images: ["/muuttobotti-hero.png"],
    },
  };
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = servicePages[slug];
  if (!page) notFound();

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Muuttobotti", item: "https://muuttobotti.fi" },
      { "@type": "ListItem", position: 2, name: page.title, item: `https://muuttobotti.fi/${slug}` },
    ],
  };

  const serviceSchema = page.legal || !page.serviceName
    ? null
    : {
        "@context": "https://schema.org",
        "@type": "Service",
        name: page.title,
        serviceType: page.serviceName,
        description: page.description,
        areaServed: page.area ? { "@type": page.area === "Suomi" ? "Country" : "City", name: page.area } : undefined,
        provider: { "@id": "https://muuttobotti.fi/#business" },
        url: `https://muuttobotti.fi/${slug}`,
      };

  const faqSchema = page.faq?.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: page.faq.map(([question, answer]) => ({
          "@type": "Question",
          name: question,
          acceptedAnswer: { "@type": "Answer", text: answer },
        })),
      }
    : null;

  return (
    <main className="seo-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {serviceSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />}
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}

      <header>
        <a href="/" className="brand"><span className="brand-mark"><PackageCheck/></span><span>muutto<span>botti</span></span></a>
        <a href="/#booking" className="quote-button">Pyydä tarjous</a>
      </header>

      <section className="seo-hero-section">
        <div className="seo-main-column">
          <a href="/" className="back-link"><ArrowLeft/> Etusivulle</a>
          <div className="seo-copy">
            <span className="kicker light">{page.eyebrow}</span>
            <h1>{page.title}</h1>
            <p>{page.description}</p>
            <div className="seo-bullets">{page.bullets.map((item) => <span key={item}><CheckCircle2/>{item}</span>)}</div>
            {!page.legal && (
              <div className="seo-trust-row">
                <span><ShieldCheck/> Selkeä vahvistus ennen työtä</span>
                <span><Clock3/> Työaika alkaa sovitusta nouto-osoitteesta</span>
              </div>
            )}
            <div className="seo-actions">
              {!page.legal && <a href="/#calculator">Laske hinta <ArrowRight/></a>}
              <a href="/#booking">{page.legal ? "Takaisin varaukseen" : "Varaa verkossa"}</a>
            </div>
          </div>

          {!page.legal && page.faq?.length ? (
            <div className="seo-faq-block">
              <span className="kicker">Hyvä tietää</span>
              <h2>Usein kysyttyä tästä palvelusta</h2>
              <div className="seo-faq-grid">
                {page.faq.map(([question, answer]) => (
                  <article key={question}>
                    <h3>{question}</h3>
                    <p>{answer}</p>
                  </article>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <aside className="seo-contact">
          <strong>Tarvitsetko apua heti?</strong>
          <p>Voit myös lähettää osoitteet ja lyhyen kuvauksen WhatsAppissa, niin arvioimme työn nopeasti.</p>
          <span><UserRound/> Stanislav Kosytskyy</span>
          <a href="tel:+3584578767567"><Phone/> 045 787 67567</a>
          <a href="mailto:autochemixfin@gmail.com"><Mail/> autochemixfin@gmail.com</a>
          <a href="https://wa.me/3584578767567"><MessageCircle/> WhatsApp</a>
          <small>Autochemix Oy · Y-tunnus 3543357-8</small>
        </aside>
      </section>

      <footer>
        <span>© 2026 Muuttobotti · Autochemix Oy · Y-tunnus 3543357-8</span>
        <a href="/privacy">Tietosuoja</a>
        <a href="/terms">Ehdot</a>
      </footer>
    </main>
  );
}
