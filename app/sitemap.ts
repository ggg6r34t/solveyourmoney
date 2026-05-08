import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://solveyourmoney.com";

  return [
    "",
    "/about",
    "/how-it-works",
    "/pricing",
    "/privacy",
    "/terms",
    "/sign-in",
    "/sign-up",
  ].map((pathname) => ({
    url: `${base}${pathname}`,
    lastModified: new Date(),
  }));
}
