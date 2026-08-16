import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import BookingDateFloor from "./BookingDateFloor";
import ServiceWorkerRegistration from "./ServiceWorkerRegistration";
import "./globals.css";
import "./overrides.css";
import "./v11-native.css";
import "./v11-credibility.css";
import "./v11-plan.css";
import "./v11-ux.css";
import "./v11-track.css";
import "./v11-seo.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin", "cyrillic"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://muuttobotti.fi"),
  title: { default: "Muuttobotti | Muutot, kuljetukset ja siivous", template: "%s | Muuttobotti" },
  description: "Luotettava muutto-, kuljetus- ja siivouspalvelu Uudellamaalla ja sopimuksesta koko Suomessa. Selkeä hinta-arvio ja helppo verkkovaraus.",
  keywords: ["muuttopalvelu", "muutto Helsinki", "kuljetuspalvelu", "siivouspalvelu", "ikkunanpesu", "Muuttobotti"],
  alternates: { canonical: "/", languages: { "fi-FI": "/", "en-FI": "/?lang=en", "uk-FI": "/?lang=uk", "ru-FI": "/?lang=ru" } },
  openGraph: { title: "Muuttobotti — muutto ilman turhaa säätöä", description: "Muutot, kuljetukset ja siivous yhdellä varauspyynnöllä.", locale: "fi_FI", type: "website" },
  robots: { index: true, follow: true },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  other: { "codex-preview": "development" },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#061411", colorScheme: "light dark" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const schema = { "@context": "https://schema.org", "@type": "MovingCompany", name: "Muuttobotti", legalName: "Autochemix Oy", taxID: "3543357-8", url: "https://muuttobotti.fi", areaServed: ["Helsinki", "Espoo", "Vantaa", "Tuusula", "Finland"], priceRange: "€€", telephone: "+3584578767567", email: "autochemixfin@gmail.com", employee: { "@type": "Person", name: "Stanislav Kosytskyy", jobTitle: "Toimitusjohtaja" }, address: { "@type": "PostalAddress", addressCountry: "FI" } };
  return (
    <html lang="fi">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <script src="/generated/generated-visuals.js" defer />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
        <BookingDateFloor />
        <ServiceWorkerRegistration />
        {children}
      </body>
    </html>
  );
}
