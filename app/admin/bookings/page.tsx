import type { Metadata } from "next";
import AdminBookingsClient from "./AdminBookingsClient";
import AdminAvailabilityShortcut from "./AdminAvailabilityShortcut";
import "./admin-bookings.css";
import "./admin-availability-shortcut.css";

export const metadata: Metadata = {
  title: "Muuttobotti Admin · Bookings",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function AdminBookingsPage() {
  return <><AdminBookingsClient /><AdminAvailabilityShortcut /></>;
}
