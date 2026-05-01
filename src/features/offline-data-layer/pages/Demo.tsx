"use client";

import { useTranslations } from "next-intl";
import { DemoPageLayout } from "@/features/shared/components/DemoPageLayout";
import { OPFSSection } from "../components/OPFSSection";
import { IndexedDBSection } from "../components/IndexedDBSection";
import { StorageSection } from "../components/StorageSection";

export const OfflineDataLayerDemo = () => {
  const t = useTranslations();

  const FEATURES = [
    {
      label: t("offlineDataLayer.featureOpfsLabel"),
      id: "pwa-opfs",
      done: true,
    },
    {
      label: t("offlineDataLayer.featureIndexedDbLabel"),
      id: "pwa-indexdb",
      done: true,
    },
    {
      label: t("offlineDataLayer.featureStorageLabel"),
      id: "pwa-storage",
      done: true,
    },
  ] as { label: string; id: string | null; done: boolean }[];

  return (
    <DemoPageLayout
      name={t("offlineDataLayer.name")}
      description={t("offlineDataLayer.description")}
      summaryLabel={t("offlineDataLayer.summary")}
      features={FEATURES}
    >
      <OPFSSection />
      <IndexedDBSection />
      <StorageSection />
    </DemoPageLayout>
  );
};
