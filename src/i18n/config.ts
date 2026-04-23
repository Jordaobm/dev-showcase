export const SUPPORTED_LOCALES = ["pt-BR", "en-US", "es-ES"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "pt-BR";

export const getMatchingLocale = (acceptLanguage: string): Locale => {
  if (!acceptLanguage) return DEFAULT_LOCALE;

  const languages = acceptLanguage
    .split(",")
    .map((lang) => lang.split(";")[0].trim().toLowerCase());

  for (const lang of languages) {
    if (lang === "pt-br") return "pt-BR";
    if (lang === "en-us" || lang.startsWith("en")) return "en-US";
    if (lang === "es-es" || lang.startsWith("es")) return "es-ES";

    if (lang.startsWith("pt")) return "pt-BR";
    if (lang.startsWith("en")) return "en-US";
    if (lang.startsWith("es")) return "es-ES";
  }

  return DEFAULT_LOCALE;
};
