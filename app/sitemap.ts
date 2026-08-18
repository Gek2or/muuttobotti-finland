import type { MetadataRoute } from "next";
import { servicePages } from "./[slug]/service-pages";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://muuttobotti.fi",
      changeFrequency: "weekly",
      priority: 1,
    },
    ...Object.keys(servicePages).map(slug => ({
      url: `https://muuttobotti.fi/${slug}`,
      changeFrequency: "monthly" as const,
      priority: slug === "privacy" || slug === "terms" ? 0.3 : 0.8,
    })),
  ];
}
