import type { Metadata } from "next";
import AdminAvailabilityClient from "./AdminAvailabilityClient";
import "./admin-availability.css";

export const metadata: Metadata = {
  title: "Muuttobotti Admin · Availability",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminAvailabilityPage() {
  return <AdminAvailabilityClient />;
}
