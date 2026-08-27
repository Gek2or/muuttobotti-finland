import type { Metadata } from "next";
import SoroBlogEmbed from "./SoroBlogEmbed";
import "./blog.css";

type Locale = "fi" | "en" | "uk" | "ru";

const copy = {
  fi: {
    metadataTitle: "Muutto-opas ja vinkit",
    metadataDescription: "Muuttobotin käytännön oppaat muuttoon, kuljetuksiin, pakkaamiseen, siivoukseen ja sujuvampaan muuttopäivään Suomessa.",
    home: "Etusivu", services: "Palvelut", pricing: "Hinnat", quote: "Pyydä tarjous",
    kicker: "MUUTTOBOTTI · OPPAAT", title: "Fiksumpi muutto alkaa hyvästä suunnitelmasta.",
    intro: "Käytännön vinkkejä muuttoon, kuljetuksiin, pakkaamiseen ja siivoukseen — selkeästi ja ilman turhaa säätöä.",
    articles: "Muuttobotti blogiartikkelit", needHelp: "Tarvitsetko apua muuttoon?", bottom: "Laske hinta tai lähetä varaus suoraan verkossa.", calculate: "Laske hinta",
  },
  en: {
    metadataTitle: "Moving guides and tips",
    metadataDescription: "Practical Muuttobotti guides for moving, transport, packing, cleaning and a smoother moving day in Finland.",
    home: "Home", services: "Services", pricing: "Pricing", quote: "Get a quote",
    kicker: "MUUTTOBOTTI · GUIDES", title: "A smarter move starts with a good plan.",
    intro: "Practical advice for moving, transport, packing and cleaning in Finland — clear and useful.",
    articles: "Muuttobotti blog articles", needHelp: "Need help with your move?", bottom: "Calculate the price or send your booking online.", calculate: "Calculate price",
  },
  uk: {
    metadataTitle: "Гіди та поради для переїзду",
    metadataDescription: "Практичні матеріали Muuttobotti про переїзд, перевезення, пакування, прибирання та організацію переїзду у Фінляндії.",
    home: "Головна", services: "Послуги", pricing: "Ціни", quote: "Отримати розрахунок",
    kicker: "MUUTTOBOTTI · ГІДИ", title: "Розумний переїзд починається з хорошого плану.",
    intro: "Практичні поради про переїзд, перевезення, пакування та прибирання у Фінляндії — коротко й зрозуміло.",
    articles: "Статті блогу Muuttobotti", needHelp: "Потрібна допомога з переїздом?", bottom: "Розрахуйте вартість або надішліть заявку онлайн.", calculate: "Розрахувати ціну",
  },
  ru: {
    metadataTitle: "Гиды и советы по переезду",
    metadataDescription: "Практические материалы Muuttobotti о переездах, перевозках, упаковке, уборке и организации переезда в Финляндии.",
    home: "Главная", services: "Услуги", pricing: "Цены", quote: "Получить расчёт",
    kicker: "MUUTTOBOTTI · ГИДЫ", title: "Продуманный переезд начинается с хорошего плана.",
    intro: "Практические советы о переездах, перевозках, упаковке и уборке в Финляндии — понятно и без лишнего.",
    articles: "Статьи блога Muuttobotti", needHelp: "Нужна помощь с переездом?", bottom: "Рассчитайте стоимость или отправьте заявку онлайн.", calculate: "Рассчитать цену",
  },
} as const;

function normalizeLocale(value: string | string[] | undefined): Locale {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === "en" || raw === "uk" || raw === "ru" ? raw : "fi";
}

function homeHref(locale: Locale, hash = "") {
  const lang = locale === "fi" ? "" : `?lang=${locale}`;
  return `/${lang}${hash}`;
}

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ lang?: string | string[] }> }): Promise<Metadata> {
  const query = await searchParams;
  const locale = normalizeLocale(query.lang);
  const t = copy[locale];
  const canonical = locale === "fi" ? "/blog" : `/blog?lang=${locale}`;
  const ogLocale = locale === "en" ? "en_FI" : locale === "uk" ? "uk_UA" : locale === "ru" ? "ru_RU" : "fi_FI";

  return {
    title: t.metadataTitle,
    description: t.metadataDescription,
    alternates: {
      canonical,
      languages: {
        "fi-FI": "/blog",
        "en-FI": "/blog?lang=en",
        "uk-FI": "/blog?lang=uk",
        "ru-FI": "/blog?lang=ru",
      },
    },
    openGraph: {
      title: `${t.metadataTitle} | Muuttobotti`,
      description: t.metadataDescription,
      url: `https://muuttobotti.fi${canonical}`,
      siteName: "Muuttobotti",
      locale: ogLocale,
      type: "website",
    },
    robots: { index: true, follow: true },
  };
}

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ lang?: string | string[] }> }) {
  const query = await searchParams;
  const locale = normalizeLocale(query.lang);
  const t = copy[locale];

  return (
    <main className="blog-page-shell" lang={locale === "uk" ? "uk" : locale}>
      <header className="blog-topbar">
        <a className="blog-brand" href={homeHref(locale)} aria-label={t.home}>
          <span className="blog-brand-mark">M</span>
          <span>muutto<strong>botti</strong></span>
        </a>
        <nav className="blog-nav" aria-label={t.home}>
          <a href={homeHref(locale)}>{t.home}</a>
          <a href={homeHref(locale, "#services")}>{t.services}</a>
          <a href={homeHref(locale, "#calculator")}>{t.pricing}</a>
          <a className="blog-cta" href={homeHref(locale, "#booking")}>{t.quote}</a>
        </nav>
      </header>

      <section className="blog-hero">
        <div className="blog-hero-inner">
          <span className="blog-kicker">{t.kicker}</span>
          <h1>{t.title}</h1>
          <p>{t.intro}</p>
        </div>
      </section>

      <section className="blog-content" aria-label={t.articles}>
        <SoroBlogEmbed />
      </section>

      <section className="blog-bottom-cta">
        <div>
          <span>{t.needHelp}</span>
          <h2>{t.bottom}</h2>
        </div>
        <a href={homeHref(locale, "#calculator")}>{t.calculate}</a>
      </section>
    </main>
  );
}
