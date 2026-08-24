import MuuttobottiArtV3 from "./MuuttobottiArtV3";
import FaqPortal from "./FaqPortal";
import LocalizedSurfaceFixes from "./LocalizedSurfaceFixes";
import { faqContent } from "./faq-content";

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
    </>
  );
}
