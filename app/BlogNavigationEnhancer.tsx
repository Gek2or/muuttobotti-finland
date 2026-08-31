"use client";

import { useEffect } from "react";

type Locale = "fi" | "en" | "uk" | "ru";

const labels: Record<Locale, string> = {
  fi: "Blogi",
  en: "Blog",
  uk: "Блог",
  ru: "Блог",
};

function currentLocale(): Locale {
  const requested = new URLSearchParams(window.location.search).get("lang");
  if (requested === "en" || requested === "uk" || requested === "ru") return requested;
  const lang = document.documentElement.lang;
  return lang === "en" || lang === "uk" || lang === "ru" ? lang : "fi";
}

function blogHref(locale: Locale) {
  return locale === "fi" ? "/blog" : `/blog?lang=${locale}`;
}

export default function BlogNavigationEnhancer() {
  useEffect(() => {
    const syncBlogLinks = () => {
      const locale = currentLocale();
      const label = labels[locale];
      const href = blogHref(locale);

      document.querySelectorAll<HTMLElement>(".desktop-nav, .mobile-nav").forEach((nav) => {
        let button = nav.querySelector<HTMLButtonElement>("button[data-blog-nav='true']");
        if (!button) {
          button = document.createElement("button");
          button.type = "button";
          button.dataset.blogNav = "true";
          nav.appendChild(button);
        }

        button.onclick = () => { window.location.href = href; };
        if (button.textContent !== label) button.textContent = label;
        if (button.getAttribute("aria-label") !== label) button.setAttribute("aria-label", label);
      });

      const footerColumns = document.querySelectorAll<HTMLElement>("footer > div");
      const companyColumn = footerColumns[3] ?? null;
      if (companyColumn) {
        let link = companyColumn.querySelector<HTMLAnchorElement>("a[data-blog-footer='true']");
        if (!link) {
          link = document.createElement("a");
          link.dataset.blogFooter = "true";
          const firstLink = companyColumn.querySelector("a");
          if (firstLink) companyColumn.insertBefore(link, firstLink);
          else companyColumn.appendChild(link);
        }
        link.href = href;
        if (link.textContent !== label) link.textContent = label;
      }
    };

    syncBlogLinks();

    const handleMenuClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element) || !target.closest(".menu-button")) return;
      window.setTimeout(syncBlogLinks, 0);
    };

    document.addEventListener("click", handleMenuClick);

    const observer = new MutationObserver((mutations) => {
      if (mutations.some((mutation) => mutation.type === "attributes" && mutation.attributeName === "lang")) {
        syncBlogLinks();
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["lang"],
    });

    return () => {
      document.removeEventListener("click", handleMenuClick);
      observer.disconnect();
      document.querySelectorAll("[data-blog-nav='true'], [data-blog-footer='true']").forEach((node) => node.remove());
    };
  }, []);

  return null;
}
