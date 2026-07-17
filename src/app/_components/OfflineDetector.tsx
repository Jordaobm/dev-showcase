"use client";

import { useEffect } from "react";
import { getPathname, usePathname } from "@/i18n/navigation";
import { useLocale } from "next-intl";

export const OfflineDetector = () => {
  const pathname = usePathname();
  const locale = useLocale();
  const offlineHref = getPathname({ href: "/offline", locale });

  useEffect(() => {
    if (pathname === "/offline") return;

    if (!navigator.onLine) {
      window.location.href = offlineHref;
      return;
    }

    const handleOffline = () => {
      window.location.href = offlineHref;
    };

    window.addEventListener("offline", handleOffline);
    return () => window.removeEventListener("offline", handleOffline);
  }, [pathname, offlineHref]);

  return null;
};
