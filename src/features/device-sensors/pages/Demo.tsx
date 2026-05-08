"use client";

import { useTranslations } from "next-intl";
import { DemoPageLayout } from "@/features/shared/components/DemoPageLayout";
import { NetworkInformationAPISection } from "../components/NetworkInformationAPISection";
import { BatteryStatusAPISection } from "../components/BatteryStatusAPISection";
import { VibrationAPISection } from "../components/VibrationAPISection";

export const DeviceSensorsDemo = () => {
  const t = useTranslations();

  const FEATURES = [
    {
      label: t("deviceSensors.networkSectionTitle"),
      id: "pwa-network-information-api",
      done: true,
    },
    {
      label: t("deviceSensors.batterySectionTitle"),
      id: "pwa-battery-status-api",
      done: true,
    },
    {
      label: t("deviceSensors.vibrationSectionTitle"),
      id: "pwa-vibration-api",
      done: true,
    },
  ] as { label: string; id: string | null; done: boolean }[];

  return (
    <DemoPageLayout
      name={t("deviceSensors.name")}
      description={t("deviceSensors.description")}
      summaryLabel={t("deviceSensors.summary")}
      features={FEATURES}
    >
      <NetworkInformationAPISection />
      <BatteryStatusAPISection />
      <VibrationAPISection />
    </DemoPageLayout>
  );
};
