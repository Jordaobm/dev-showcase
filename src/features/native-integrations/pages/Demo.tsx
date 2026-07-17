"use client";

import { useTranslations } from "next-intl";
import { DemoPageLayout } from "@/features/shared/components/DemoPageLayout";
import { WebShareAPISection } from "../components/WebShareAPISection";
import { ClipboardAPISection } from "../components/ClipboardAPISection";
import { ScreenWakeLockAPISection } from "../components/ScreenWakeLockAPISection";
import { FullScreenAPISection } from "../components/FullScreenAPISection";

export const NativeIntegrationsDemo = () => {
  const t = useTranslations();

  const FEATURES = [
    {
      label: t("nativeIntegrations.webShareSectionTitle"),
      id: "pwa-webshare-api",
      done: true,
    },
    {
      label: t("nativeIntegrations.clipboardSectionTitle"),
      id: "pwa-clipboard-api",
      done: true,
    },
    {
      label: t("nativeIntegrations.wakeLockSectionTitle"),
      id: "pwa-screen-wake-lock-api",
      done: true,
    },
    {
      label: t("nativeIntegrations.fullScreenSectionTitle"),
      id: "pwa-full-screen-api",
      done: true,
    },
  ] as { label: string; id: string | null; done: boolean }[];

  return (
    <DemoPageLayout
      name={t("nativeIntegrations.name")}
      description={t("nativeIntegrations.description")}
      summaryLabel={t("nativeIntegrations.summary")}
      features={FEATURES}
    >
      <WebShareAPISection />
      <ClipboardAPISection />
      <ScreenWakeLockAPISection />
      <FullScreenAPISection />
    </DemoPageLayout>
  );
};
