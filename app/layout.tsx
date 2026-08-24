import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./overrides.css";
import "./seo-pages.css";
import "./commercial-v2.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin", "cyrillic"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://muuttobotti.fi"),
  title: {
    default: "Muuttopalvelu Helsinki, Espoo & Vantaa | Muuttobotti",
    template: "%s | Muuttobotti",
  },
  description:
    "Muutot, kuljetukset, muuttosiivous ja kalusteasennus Uudellamaalla ja koko Suomessa. Selkeä hinnoittelu, iso 13–15 m³ pakettiauto ja helppo verkkovaraus.",
  keywords: [
    "muuttopalvelu Helsinki",
    "muutto Espoo",
    "muutto Vantaa",
    "muutto Tuusula",
    "kuljetuspalvelu",
    "muuttosiivous",
    "kalusteasennus",
    "Muuttobotti",
  ],
  alternates: {
    canonical: "/",
    languages: {
      "fi-FI": "/",
      "en-FI": "/?lang=en",
      "uk-FI": "/?lang=uk",
      "ru-FI": "/?lang=ru",
    },
  },
  openGraph: {
    title: "Muuttobotti — muutot, kuljetukset ja siivous",
    description: "Yksi tiimi muuttoon, kuljetukseen ja siivoukseen. Palvelemme Uudellamaalla ja koko Suomessa.",
    url: "https://muuttobotti.fi",
    siteName: "Muuttobotti",
    locale: "fi_FI",
    type: "website",
    images: [{ url: "/muuttobotti-hero.png", alt: "Muuttobotti muuttopalvelu Suomessa" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Muuttobotti — muutot, kuljetukset ja siivous",
    description: "Selkeä muutto- ja kuljetuspalvelu Uudellamaalla ja koko Suomessa.",
    images: ["/muuttobotti-hero.png"],
  },
  robots: { index: true, follow: true },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  category: "moving services",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#071b22",
  colorScheme: "light dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "MovingCompany",
    "@id": "https://muuttobotti.fi/#business",
    name: "Muuttobotti",
    legalName: "Autochemix Oy",
    taxID: "3543357-8",
    url: "https://muuttobotti.fi",
    image: "https://muuttobotti.fi/muuttobotti-hero.png",
    description: "Muutto-, kuljetus- ja siivouspalvelut Uudellamaalla ja koko Suomessa.",
    areaServed: ["Helsinki", "Espoo", "Vantaa", "Tuusula", "Kerava", "Järvenpää", "Porvoo", "Finland"],
    serviceType: ["Muuttopalvelu", "Kuljetuspalvelu", "Muuttosiivous", "Ikkunanpesu", "Kalusteasennus", "Kierrätyskuljetus"],
    priceRange: "€€",
    telephone: "+3584578767567",
    email: "autochemixfin@gmail.com",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+3584578767567",
      contactType: "customer service",
      availableLanguage: ["Finnish", "English", "Russian", "Ukrainian"],
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        opens: "07:00",
        closes: "22:00",
      },
    ],
    address: { "@type": "PostalAddress", addressRegion: "Uusimaa", addressCountry: "FI" },
  };

  return (
    <html lang="fi">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
        {children}
      </body>
    </html>
  );
}
