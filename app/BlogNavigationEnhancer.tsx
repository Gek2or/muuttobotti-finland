"use client";

import { useEffect } from "react";

const labels: Record<string, string> = {
  fi: "Blogi",
  en: "Blog",
  uk: "Блог",
  ru: "Блог",
};

export default function BlogNavigationEnhancer() {
  useEffect(() => {
    const syncBlogLinks = () => {
      const lang = document.documentElement.lang || "fi";
      const label = labels[lang] ?? labels.fi;

      document.querySelectorAll<HTMLElement>(".desktop-nav, .mobile-nav").forEach((nav) => {
        let button = nav.querySelector<HTMLButtonElement>("button[data-blog-nav='true']");
        if (!button) {
          button = document.createElement("button");
          button.type = "button";
          button.dataset.blogNav = "true";
          button.addEventListener("click", () => {
            window.location.href = "/blog";
          });
          nav.appendChild(button);
        }

        if (button.textContent !== label) button.textContent = label;
        if (button.getAttribute("aria-label") !== label) button.setAttribute("aria-label", label);
      });

      const companyColumn = Array.from(document.querySelectorAll<HTMLElement>("footer > div")).find(
        (column) => column.querySelector("strong")?.textContent?.trim() === "Company",
      );

      if (companyColumn) {
        let link = companyColumn.querySelector<HTMLAnchorElement>("a[data-blog-footer='true']");
        if (!link) {
          link = document.createElement("a");
          link.href = "/blog";
          link.dataset.blogFooter = "true";
          const firstLink = companyColumn.querySelector("a");
          if (firstLink) companyColumn.insertBefore(link, firstLink);
          else companyColumn.appendChild(link);
        }
        if (link.textContent !== label) link.textContent = label;
      }
    };

    syncBlogLinks();

    // Only watch the actual language attribute. Watching the full DOM caused
    // our own injected link mutations to retrigger the observer continuously
    // on mobile, which could make the homepage appear frozen.
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
      observer.disconnect();
      document.querySelectorAll("[data-blog-nav='true'], [data-blog-footer='true']").forEach((node) => node.remove());
    };
  }, []);

  return null;
}
