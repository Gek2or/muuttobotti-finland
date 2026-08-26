import MuuttobottiArtV3 from "./MuuttobottiArtV3";
import FaqPortal from "./FaqPortal";
import LocalizedSurfaceFixes from "./LocalizedSurfaceFixes";
import BusinessCalculatorV5 from "./BusinessCalculatorV5";
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
import "./home-blog-preview.css";
import "./mobile-conversion-booking.css";
import "./booking-availability.css";
import "./booking-calculator-attachment.css";

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
      <BlogNavigationEnhancer />
      <HomeBlogPreview />
      <FaqPortal />
      <LocalizedSurfaceFixes />
      <BusinessCalculatorV5 />
      <BookingCalculatorAttachment />
      <BookingAvailabilityPicker />
      <BookingRuntimeController />
      <VisualMotionEnhancer />
      <HeroUXV6 />
      <CalculatorBridgeV6 />
    </>
  );
}
