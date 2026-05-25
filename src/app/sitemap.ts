import type { MetadataRoute } from "next";

const siteUrl = "https://karinakoziarabrows.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/courses", "/privacy", "/terms"];

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
  }));
}
