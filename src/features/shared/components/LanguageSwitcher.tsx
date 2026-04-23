"use client";

import type { Locale } from "@/i18n/config";
import { SUPPORTED_LOCALES } from "@/i18n/config";
import { useLocale } from "@/i18n/useLocale";
import { Globe } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

const LANGUAGE_NAMES: Record<Locale, string> = {
  "pt-BR": "shared.languages.pt-BR",
  "en-US": "shared.languages.en-US",
  "es-ES": "shared.languages.es-ES",
};

export const LanguageSwitcher = () => {
  const { locale, changeLocale } = useLocale();
  const t = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !locale) {
    return null;
  }

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
          {(SUPPORTED_LOCALES as readonly Locale[]).map((lang) => (
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
