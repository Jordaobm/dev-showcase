"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export const OfflineDetector = () => {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/offline") return;

    if (!navigator.onLine) {
      window.location.href = "/offline";
      return;
    }

    const handleOffline = () => {
      window.location.href = "/offline";
    };

    window.addEventListener("offline", handleOffline);
    return () => window.removeEventListener("offline", handleOffline);
  }, [pathname]);

  return null;
};
