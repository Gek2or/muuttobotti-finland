import type { Metadata } from "next";
import MobilePreview from "./MobilePreview";
import "./mobile-preview.css";

export const metadata: Metadata = {
  title: "Muuttobotti Mobile Preview",
  description: "Interactive preview of the Muuttobotti Android/iOS client app.",
  robots: { index: false, follow: false },
};

export default function MobilePreviewPage() {
  return <MobilePreview />;
}
