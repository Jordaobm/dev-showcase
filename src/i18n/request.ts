import { getRequestConfig } from "next-intl/server";
import { headers, cookies } from "next/headers";
import { getMatchingLocale, SUPPORTED_LOCALES } from "./config";
import type { Locale } from "./config";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value;

  let locale: Locale;

  if (
    cookieLocale &&
    (SUPPORTED_LOCALES as readonly string[]).includes(cookieLocale)
  ) {
    locale = cookieLocale as Locale;
  } else {
    const headersList = await headers();
    const acceptLanguage = headersList.get("accept-language") || "";
    locale = getMatchingLocale(acceptLanguage);
  }

  const messages = (await import(`./messages/${locale}` as any)).default;

  return {
    locale,
    messages,
    getMessageFallback({ key }) {
      return key;
    },
  };
});
