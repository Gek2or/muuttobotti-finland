import MuuttobottiArtV3 from "./MuuttobottiArtV3";
import FaqPortal from "./FaqPortal";
import LocalizedSurfaceFixes from "./LocalizedSurfaceFixes";
import BusinessCalculatorV2 from "./BusinessCalculatorV2";
import BookingRuntimeController from "./BookingRuntimeController";
import VisualMotionEnhancer from "./VisualMotionEnhancer";
import { faqContent } from "./faq-content";
import "./experience-v5.css";
import "./business-calculator-v2.css";
import "./booking-runtime.css";

export default function Home() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqContent.fi.map(([question, answer]) => ({
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
      <MuuttobottiArtV3 />
      <FaqPortal />
      <LocalizedSurfaceFixes />
      <BusinessCalculatorV2 />
      <BookingRuntimeController />
      <VisualMotionEnhancer />
    </>
  );
}
