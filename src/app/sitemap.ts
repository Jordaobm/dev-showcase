import type { MetadataRoute } from "next";
import { registry } from "@/registry/index";
import { getSiteUrl } from "@/lib/site-url";

const sitemap = async (): Promise<MetadataRoute.Sitemap> => {
  const siteUrl = await getSiteUrl();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/sobre`, changeFrequency: "monthly", priority: 0.8 },
  ];

  const showcaseRoutes: MetadataRoute.Sitemap = registry.map((demo) => ({
    url: `${siteUrl}/showcase/${demo.id}`,
    changeFrequency: "monthly",
    priority: demo.status === "live" ? 0.7 : 0.4,
  }));

  return [...staticRoutes, ...showcaseRoutes];
};

export default sitemap;
