import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Muuttobotti — muutot, kuljetukset ja siivous",
    short_name: "Muuttobotti",
    description: "Muutto-, kuljetus- ja siivouspalvelut Uudellamaalla ja sopimuksesta koko Suomessa.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f2efe7",
    theme_color: "#061411",
    lang: "fi",
    categories: ["business", "productivity"],
    icons: [{ src: "/favicon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
    shortcuts: [
      { name: "Laske hinta", short_name: "Hinta", url: "/#calculator" },
      { name: "Varaa palvelu", short_name: "Varaa", url: "/#booking" },
      { name: "Seuraa varausta", short_name: "Seuranta", url: "/track" },
    ],
  };
}
