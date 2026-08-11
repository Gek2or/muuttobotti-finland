import type { MetadataRoute } from "next";
import { servicePages } from "./[slug]/service-pages";
export default function sitemap(): MetadataRoute.Sitemap { const now = new Date(); return [{ url: "https://muuttobotti.fi", lastModified: now, changeFrequency: "weekly", priority: 1 }, ...Object.keys(servicePages).map(slug => ({ url: `https://muuttobotti.fi/${slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: slug === "privacy" || slug === "terms" ? .3 : .8 }))]; }
