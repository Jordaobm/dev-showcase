"use client";

import { useTranslations } from "next-intl";
import { DemoPageLayout } from "@/features/shared/components/DemoPageLayout";
import { SpeechRecognitionAPISection } from "../components/SpeechRecognitionAPISection";

export const VoiceInterfaceDemo = () => {
  const t = useTranslations();

  const FEATURES = [
    {
      label: t("voiceInterface.featureLabel"),
      id: "pwa-speech-recognition-api",
      done: true,
    },
  ] as { label: string; id: string | null; done: boolean }[];

  return (
    <DemoPageLayout
      name={t("voiceInterface.name")}
      description={t("voiceInterface.description")}
      summaryLabel={t("voiceInterface.summary")}
      features={FEATURES}
    >
      <SpeechRecognitionAPISection />
    </DemoPageLayout>
  );
};
