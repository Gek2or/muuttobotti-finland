"use client";

import { useEffect } from "react";

const SORO_EMBED_URL = "https://app.trysoro.com/api/embed/564b9f0a-6fd7-4cbb-9a53-c3748cfd677a";

export default function SoroBlogEmbed() {
  useEffect(() => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SORO_EMBED_URL}"]`);
    if (existing) return;

    const script = document.createElement("script");
    script.src = SORO_EMBED_URL;
    script.defer = true;
    script.dataset.muuttobottiSoro = "true";
    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, []);

  return <div id="soro-blog" className="soro-blog-embed" aria-live="polite" />;
}
