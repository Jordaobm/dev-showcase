import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

const robots = async (): Promise<MetadataRoute.Robots> => {
  const siteUrl = await getSiteUrl();

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
