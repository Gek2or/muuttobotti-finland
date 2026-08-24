"use client";

import { useEffect } from "react";

const selectors = [
  ".section-heading",
  ".calculator-intro",
  ".calculator-card",
  ".center-heading",
  ".steps-grid article",
  ".portal-heading",
  ".dashboard-mockup",
  ".verified-review-panel",
  ".art-faq-head",
  ".art-faq-filters",
  ".art-faq-grid details",
  ".booking-copy",
  ".booking-form",
  ".map-card",
  ".contact-copy",
  ".seo-copy",
  ".seo-contact",
  ".seo-faq-grid article",
].join(",");

export default function VisualMotionEnhancer() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const observed = new WeakSet<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("ui-motion-in");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );

    const register = () => {
      const nodes = Array.from(document.querySelectorAll<HTMLElement>(selectors));
      nodes.forEach((node, index) => {
        if (observed.has(node)) return;
        observed.add(node);
        node.classList.add("ui-motion-ready");
        node.style.setProperty("--ui-motion-delay", `${Math.min(index % 6, 5) * 65}ms`);
        observer.observe(node);
      });
    };

    register();

    const mutationObserver = new MutationObserver(() => register());
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return null;
}
