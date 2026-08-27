import type { Metadata } from "next";
import TrackingClient from "./TrackingClient";

type Locale = "fi" | "en" | "uk" | "ru";
const copy = {
  fi: { title: "Varauksen seuranta", description: "Seuraa, muuta tai peru Muuttobotti-varaus turvallisesti." },
  en: { title: "Booking tracking", description: "Track, update or cancel your Muuttobotti booking securely." },
  uk: { title: "Відстеження бронювання", description: "Безпечно відстежуйте, змінюйте або скасовуйте бронювання Muuttobotti." },
  ru: { title: "Отслеживание бронирования", description: "Безопасно отслеживайте, изменяйте или отменяйте бронирование Muuttobotti." },
} as const;

function locale(value: string | string[] | undefined): Locale {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === "en" || raw === "uk" || raw === "ru" ? raw : "fi";
}

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ lang?: string | string[] }> }): Promise<Metadata> {
  const query = await searchParams;
  const t = copy[locale(query.lang)];
  return { title: t.title, description: t.description, robots: { index: false, follow: false } };
}

export default function TrackingPage() {
  return <TrackingClient />;
}
