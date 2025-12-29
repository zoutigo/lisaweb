import type { MetadataRoute } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://lisaweb.fr";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    "/",
    "/services-offers",
    "/methode",
    "/realisations",
    "/demande-devis",
    "/contact",
    "/faq",
  ];

  const now = new Date();

  return pages.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
  }));
}
