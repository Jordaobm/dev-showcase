"use client";

import { DemoPageLayout } from "@/features/shared/components/DemoPageLayout";
import { useTranslations } from "next-intl";
import { UIUXDashboard } from "../components/UIUXDashboard";
import { Dashboard } from "../components/Dashboard";

export const DashboardDemo = () => {
  const t = useTranslations();

  const FEATURES = [
    {
      label: t("dashboards.uiuxTitle"),
      id: "uiux",
      done: true,
    },
    {
      label: t("dashboards.dashboardTitle"),
      id: "dashboard",
      done: true,
    },
  ] as { label: string; id: string | null; done: boolean }[];

  return (
    <DemoPageLayout
      name={t("dashboards.name")}
      description={t("dashboards.shortDescription")}
      summaryLabel={t("dashboards.summary")}
      features={FEATURES}
    >
      <UIUXDashboard />
      <Dashboard />
    </DemoPageLayout>
  );
};
