"use client";

import { useTranslations } from "next-intl";
import { DemoPageLayout } from "@/features/shared/components/DemoPageLayout";
import { PushNotificationsSection } from "../components/PushNotificationsSection";

export const PushNotificationsDemo = () => {
  const t = useTranslations();

  const FEATURES = [
    {
      label: t("pushNotifications.featurePushLabel"),
      id: "pwa-notifications",
      done: true,
    },
  ] as { label: string; id: string | null; done: boolean }[];

  return (
    <DemoPageLayout
      name={t("pushNotifications.name")}
      description={t("pushNotifications.description")}
      summaryLabel={t("pushNotifications.summary")}
      features={FEATURES}
    >
      <PushNotificationsSection />
    </DemoPageLayout>
  );
};
