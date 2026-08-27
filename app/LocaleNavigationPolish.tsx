"use client";

import { useEffect } from "react";

type Locale = "fi" | "en" | "uk" | "ru";

function currentLocale(): Locale {
  const lang = document.documentElement.lang;
  return lang === "en" || lang === "uk" || lang === "ru" ? lang : "fi";
}

function query(locale: Locale) {
  return locale === "fi" ? "" : `?lang=${locale}`;
}

function home(locale: Locale, hash = "") {
  return `/${query(locale)}${hash}`;
}

function localPage(path: string, locale: Locale) {
  return `${path}${query(locale)}`;
}

function syncLinks() {
  const locale = currentLocale();

  document.querySelectorAll<HTMLAnchorElement>("footer a").forEach((link) => {
    if (link.dataset.blogFooter === "true") return;
    const raw = link.getAttribute("href") || "";
    if (!raw) return;

    if (raw === "#booking" || raw === "/#booking" || raw.includes("#booking")) link.href = home(locale, "#booking");
    else if (raw === "#reviews" || raw === "/#reviews" || raw.includes("#reviews")) link.href = home(locale, "#reviews");
    else if (raw.startsWith("/track")) link.href = localPage("/track", locale);
    else if (raw.startsWith("/privacy")) link.href = localPage("/privacy", locale);
    else if (raw.startsWith("/terms")) link.href = localPage("/terms", locale);
    else if (/^\/(moving|cleaning|window-cleaning|express-delivery|furniture-assembly)-/.test(raw)) {
      const path = raw.split("?")[0].split("#")[0];
      link.href = localPage(path, locale);
    }
  });
}

export default function LocaleNavigationPolish() {
  useEffect(() => {
    syncLinks();
    const observer = new MutationObserver(() => syncLinks());
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
    const onMenu = (event: MouseEvent) => {
      const target = event.target;
      if (target instanceof Element && target.closest(".menu-button, .lang-button")) window.setTimeout(syncLinks, 0);
    };
    document.addEventListener("click", onMenu);
    return () => {
      observer.disconnect();
      document.removeEventListener("click", onMenu);
    };
  }, []);
  return null;
}
