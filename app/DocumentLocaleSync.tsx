"use client";

import { useEffect } from "react";

type Locale = "fi" | "en" | "uk" | "ru";

function localeFromUrl(): Locale {
  const value = new URLSearchParams(window.location.search).get("lang");
  return value === "en" || value === "uk" || value === "ru" ? value : "fi";
}

export default function DocumentLocaleSync() {
  useEffect(() => {
    const sync = () => {
      const locale = localeFromUrl();
      if (document.documentElement.lang !== locale) document.documentElement.lang = locale;
    };

    sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  return null;
}
