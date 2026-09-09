import type { Metadata } from "next";
import MuuttobottiArtV3 from "./MuuttobottiArtV3";
import FaqPortal from "./FaqPortal";
import LocalizedSurfaceFixes from "./LocalizedSurfaceFixes";
import LocaleNavigationPolish from "./LocaleNavigationPolish";
import BusinessCalculatorV6 from "./BusinessCalculatorV6";
import BookingCalculatorAttachment from "./BookingCalculatorAttachment";
import BookingRuntimeController from "./BookingRuntimeController";
import BookingAvailabilityPicker from "./BookingAvailabilityPicker";
import VisualMotionEnhancer from "./VisualMotionEnhancer";
import HeroUXV6 from "./HeroUXV6";
import CalculatorBridgeV6 from "./CalculatorBridgeV6";
import BlogNavigationEnhancer from "./BlogNavigationEnhancer";
import HomeBlogPreview from "./HomeBlogPreview";
import { faqContent } from "./faq-content";
import "./experience-v5.css";
import "./business-calculator-v2.css";
import "./booking-runtime.css";
import "./v6-ui.css";
import "./mobile-header-polish.css";
import "./mobile-readability-v61.css";
import "./calculator-v4.css";
import "./calculator-v5-integrated.css";
import "./calculator-v8-premium.css";
import "./calculator-desktop-polish.css";
import "./home-blog-preview.css";
import "./mobile-conversion-booking.css";
import "./booking-availability.css";
import "./booking-calculator-attachment.css";

type Locale = "fi" | "en" | "uk" | "ru";
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const seo: Record<Locale, { title: string; description: string; ogLocale: string }> = {
  fi: {
    title: "Muuttopalvelu Helsinki, Espoo & Vantaa | Muuttobotti",
    description: "Muutot, kuljetukset, muuttosiivous ja kalusteasennus Uudellamaalla ja koko Suomessa. Selkeä hinnoittelu, iso 13–15 m³ Crafter ja helppo verkkovaraus.",
    ogLocale: "fi_FI",
  },
  en: {
    title: "Moving Service in Helsinki, Espoo & Vantaa | Muuttobotti",
    description: "Moving, transport, cleaning and furniture assembly across Uusimaa and Finland. Clear pricing, a 13–15 m³ high-roof Crafter and easy online booking.",
    ogLocale: "en_FI",
  },
  uk: {
    title: "Переїзди в Гельсінкі, Еспоо та Вантаа | Muuttobotti",
    description: "Переїзди, перевезення, прибирання та збирання меблів в Уусімаа й по Фінляндії. Прозорі ціни, високий Crafter 13–15 м³ та онлайн-бронювання.",
    ogLocale: "uk_UA",
  },
  ru: {
    title: "Переезды в Хельсинки, Эспоо и Вантаа | Muuttobotti",
    description: "Переезды, перевозки, уборка и сборка мебели по Уусимаа и Финляндии. Понятные цены, высокий Crafter 13–15 м³ и удобное онлайн-бронирование.",
    ogLocale: "ru_RU",
  },
};

function localeFrom(value: string | string[] | undefined): Locale {
  const candidate = Array.isArray(value) ? value[0] : value;
  return candidate === "en" || candidate === "uk" || candidate === "ru" ? candidate : "fi";
}

function localizedUrl(locale: Locale) {
  return locale === "fi" ? "/" : `/?lang=${locale}`;
}

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const params = await searchParams;
  const locale = localeFrom(params.lang);
  const current = seo[locale];
  const url = localizedUrl(locale);

  return {
    title: current.title,
    description: current.description,
    alternates: {
      canonical: url,
      languages: {
        "fi-FI": "/",
        "en-FI": "/?lang=en",
        "uk-FI": "/?lang=uk",
        "ru-FI": "/?lang=ru",
      },
    },
    openGraph: {
      title: current.title,
      description: current.description,
      url,
      siteName: "Muuttobotti",
      locale: current.ogLocale,
      type: "website",
      images: [{ url: "/muuttobotti-hero.png", alt: "Muuttobotti" }],
    },
    twitter: {
      card: "summary_large_image",
      title: current.title,
      description: current.description,
      images: ["/muuttobotti-hero.png"],
    },
  };
}

export default async function Home({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const locale = localeFrom(params.lang);
  const localizedFaq = faqContent[locale];
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: locale === "uk" ? "uk-UA" : locale === "ru" ? "ru-RU" : locale === "en" ? "en-FI" : "fi-FI",
    mainEntity: localizedFaq.map(([question, answer]) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: {
        "@type": "Answer",
        text: answer,
      },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <MuuttobottiArtV3 initialLocale={locale} />
      <BlogNavigationEnhancer />
      <HomeBlogPreview />
      <FaqPortal />
      <LocalizedSurfaceFixes />
      <LocaleNavigationPolish />
      <BusinessCalculatorV6 />
      <BookingCalculatorAttachment />
      <BookingAvailabilityPicker />
      <BookingRuntimeController />
      <VisualMotionEnhancer />
      <HeroUXV6 />
      <CalculatorBridgeV6 />
    </>
  );
}
