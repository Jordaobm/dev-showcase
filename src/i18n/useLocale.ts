"use client";

import { useCallback, useEffect, useState } from "react";
import type { Locale } from "./config";
import { SUPPORTED_LOCALES } from "./config";

const LOCALE_COOKIE_NAME = "NEXT_LOCALE";

export const useLocale = () => {
  const [locale, setLocale] = useState<Locale | null>(null);

  useEffect(() => {
    const storedLocale = getCookieLocale();
    if (storedLocale) {
      setLocale(storedLocale);
    } else {
      setLocale(detectBrowserLocale());
    }
  }, []);

  const changeLocale = useCallback((newLocale: Locale) => {
    setCookieLocale(newLocale);
    setLocale(newLocale);
    setTimeout(() => {
      window.location.reload();
    }, 100);
  }, []);

  return { locale, changeLocale };
};

export const getCookieLocale = (): Locale | null => {
  if (typeof document === "undefined") return null;
  const cookies = document.cookie.split("; ");
  for (const cookie of cookies) {
    const [name, value] = cookie.split("=");
    if (name === LOCALE_COOKIE_NAME) {
      const decoded = decodeURIComponent(value);
      if (isValidLocale(decoded)) {
        return decoded as Locale;
      }
    }
  }
  return null;
};

export const setCookieLocale = (locale: Locale) => {
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
  document.cookie = `${LOCALE_COOKIE_NAME}=${locale}; path=/; expires=${oneYearFromNow.toUTCString()}; SameSite=Lax`;
};

export const detectBrowserLocale = (): Locale => {
  if (typeof navigator === "undefined") return "pt-BR";

  const browserLang = navigator.language.toLowerCase();

  if (browserLang.startsWith("pt")) return "pt-BR";
  if (browserLang.startsWith("en")) return "en-US";
  if (browserLang.startsWith("es")) return "es-ES";

  return "pt-BR";
};

const isValidLocale = (locale: string): boolean => {
  return (SUPPORTED_LOCALES as readonly string[]).includes(locale);
};
