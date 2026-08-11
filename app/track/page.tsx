import type { Metadata } from "next";
import TrackingClient from "./TrackingClient";

export const metadata: Metadata = {
  title: "Booking tracking",
  description: "Track, update or cancel your Muuttobotti booking securely.",
  robots: { index: false, follow: false },
};

export default function TrackingPage() {
  return <TrackingClient />;
}
