import type { MetadataRoute } from "next";
import { registry } from "@/registry/index";
import { getSiteUrl } from "@/lib/site-url";
import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

interface RouteConfig {
  href: string;
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;
  priority: number;
}

const buildUrl = (siteUrl: string, href: string, locale: string) =>
  `${siteUrl}${getPathname({ href, locale })}`;

const buildLanguageAlternates = (siteUrl: string, href: string) =>
  Object.fromEntries(
    routing.locales.map((locale) => [locale, buildUrl(siteUrl, href, locale)]),
  );

const sitemap = (): MetadataRoute.Sitemap => {
  const siteUrl = getSiteUrl();

  const routes: RouteConfig[] = [
    { href: "/", changeFrequency: "weekly", priority: 1 },
    { href: "/sobre", changeFrequency: "monthly", priority: 0.8 },
    ...registry.map((demo) => ({
      href: `/showcase/${demo.id}`,
      changeFrequency: "monthly" as const,
      priority: demo.status === "live" ? 0.7 : 0.4,
    })),
  ];

  return routes.flatMap(({ href, changeFrequency, priority }) =>
    routing.locales.map((locale) => ({
      url: buildUrl(siteUrl, href, locale),
      changeFrequency,
      priority,
      alternates: { languages: buildLanguageAlternates(siteUrl, href) },
    })),
  );
};

export default sitemap;
