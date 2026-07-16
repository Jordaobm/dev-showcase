import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

const robots = (): MetadataRoute.Robots => {
  const siteUrl = getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/diagnostics/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
};

export default robots;
