"use client";

import { useTranslations } from "next-intl";
import { DemoPageLayout } from "@/features/shared/components/DemoPageLayout";
import { WebShareAPISection } from "../components/WebShareAPISection";
import { ClipboardAPISection } from "../components/ClipboardAPISection";
import { ScreenWakeLockAPISection } from "../components/ScreenWakeLockAPISection";
import { FullScreenAPISection } from "../components/FullScreenAPISection";

const FEATURES = [
  { label: "Web Share API", id: "pwa-webshare-api", done: true },
  { label: "Clipboard API", id: "pwa-clipboard-api", done: true },
  { label: "Screen Wake Lock", id: "pwa-screen-wake-lock-api", done: true },
  { label: "Full Screen API", id: "pwa-full-screen-api", done: true },
] as { label: string; id: string | null; done: boolean }[];

export const NativeIntegrationsDemo = () => {
  const t = useTranslations();

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
