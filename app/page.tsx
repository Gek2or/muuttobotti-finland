import MuuttobottiArtV3 from "./MuuttobottiArtV3";
import FaqPortal from "./FaqPortal";
import LocalizedSurfaceFixes from "./LocalizedSurfaceFixes";
import BusinessCalculatorV4 from "./BusinessCalculatorV4";
import BookingRuntimeController from "./BookingRuntimeController";
import VisualMotionEnhancer from "./VisualMotionEnhancer";
import HeroUXV6 from "./HeroUXV6";
import CalculatorBridgeV6 from "./CalculatorBridgeV6";
import { faqContent } from "./faq-content";
import "./experience-v5.css";
import "./business-calculator-v2.css";
import "./booking-runtime.css";
import "./v6-ui.css";
import "./mobile-header-polish.css";
import "./mobile-readability-v61.css";
import "./calculator-v4.css";

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
      <BusinessCalculatorV4 />
      <BookingRuntimeController />
      <VisualMotionEnhancer />
      <HeroUXV6 />
      <CalculatorBridgeV6 />
    </>
  );
}
