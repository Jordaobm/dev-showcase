"use client";

import { useTranslations } from "next-intl";
import { DemoPageLayout } from "@/features/shared/components/DemoPageLayout";
import { OverviewSection } from "../components/OverviewSection";
import { WebSocketSection } from "../components/WebSocketSection";
import { ServerSentEventsSection } from "../components/ServerSentEventsSection";
import { DailyUseSection } from "../components/DailyUseSection";
import { ChatDemo } from "../components/ChatDemo";

export const RealtimeDemo = () => {
  const t = useTranslations();

  const FEATURES = [
    {
      label: t("realtime.overviewLabel"),
      id: "overview",
      done: true,
    },
    {
      label: t("realtime.websocketLabel"),
      id: "websocket",
      done: true,
    },
    {
      label: t("realtime.sseLabel"),
      id: "sse",
      done: true,
    },
    {
      label: t("realtime.dailyLabel"),
      id: "daily-use",
      done: true,
    },
    {
      label: t("realtime.chatDemoLabel"),
      id: "chat-demo",
      done: true,
    },
  ] as { label: string; id: string | null; done: boolean }[];

  return (
    <DemoPageLayout
      name={t("realtime.name")}
      description={t("realtime.shortDescription")}
      summaryLabel={t("realtime.summary")}
      features={FEATURES}
    >
      <OverviewSection />
      <WebSocketSection />
      <ServerSentEventsSection />
      <DailyUseSection />
      <ChatDemo />
    </DemoPageLayout>
  );
};
