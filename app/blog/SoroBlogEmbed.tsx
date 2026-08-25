"use client";

import Script from "next/script";

const SORO_EMBED_URL =
  "https://app.trysoro.com/api/embed/564b9f0a-6fd7-4cbb-9a53-c3748cfd677a?theme=dark";

export default function SoroBlogEmbed() {
  return (
    <>
      <div id="soro-blog" className="soro-blog-embed" aria-live="polite" />
      <Script
        id="muuttobotti-soro-blog"
        src={SORO_EMBED_URL}
        strategy="afterInteractive"
      />
    </>
  );
}
