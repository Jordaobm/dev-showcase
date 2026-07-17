"use client";

import type { Locale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";
import { useRouter, usePathname } from "@/i18n/navigation";
import { Globe } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

const LANGUAGE_NAMES: Record<Locale, string> = {
  "pt-BR": "shared.languages.pt-BR",
  "en-US": "shared.languages.en-US",
  "es-ES": "shared.languages.es-ES",
};

export const LanguageSwitcher = () => {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations();
  const [isOpen, setIsOpen] = useState(false);

  const changeLocale = (nextLocale: Locale) => {
    router.replace(pathname, { locale: nextLocale });
  };

  const getLanguageName = (lang: Locale) => {
    const key = LANGUAGE_NAMES[lang] as string;
    return t(key);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
        aria-label={t("shared.components.changeLanguage")}
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline">{getLanguageName(locale)}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {routing.locales.map((lang) => (
            <button
              key={lang}
              onClick={() => {
                changeLocale(lang);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                locale === lang
                  ? "bg-red-50 text-red-600 font-medium"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              {getLanguageName(lang)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
