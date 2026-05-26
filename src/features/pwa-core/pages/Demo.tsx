"use client";

import { useTranslations } from "next-intl";
import { DemoPageLayout } from "@/features/shared/components/DemoPageLayout";
import { InstallSection } from "../components/InstallSection";
import { CacheSection } from "../components/CacheSection";
import { StatusSection } from "../components/StatusSection";

export const PwaCoreDemo = () => {
  const t = useTranslations();

  const FEATURES = [
    { label: t("pwaCore.featureInstallLabel"), id: "pwa-install", done: true },
    { label: t("pwaCore.featureCacheLabel"), id: "pwa-cache", done: true },
    { label: t("pwaCore.featureStatusLabel"), id: "pwa-status", done: true },
  ] as { label: string; id: string | null; done: boolean }[];

  return (
    <DemoPageLayout
      name={t("pwaCore.name")}
      description={t("pwaCore.description")}
      summaryLabel={t("pwaCore.summary")}
      features={FEATURES}
    >
      <InstallSection />
      <CacheSection />
      <StatusSection />
    </DemoPageLayout>
  );
};
