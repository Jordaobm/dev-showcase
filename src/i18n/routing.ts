import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["pt-BR", "en-US", "es-ES"] as const,
  defaultLocale: "pt-BR",
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];
