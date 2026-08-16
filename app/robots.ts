import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/track"],
    },
    sitemap: "https://muuttobotti.fi/sitemap.xml",
  };
}
