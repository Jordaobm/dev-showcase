"use client";

import { useTranslations } from "next-intl";
import { DemoPageLayout } from "@/features/shared/components/DemoPageLayout";
import { CameraAPISection } from "../components/CameraAPISection";
import { MediaRecorderVideoAPISection } from "../components/MediaRecorderVideoAPISection";
import { MediaRecorderAudioAPISection } from "../components/MediaRecorderAudioAPISection";

export const MediaCaptureDemo = () => {
  const t = useTranslations();

  const FEATURES = [
    {
      label: t("mediaCapture.featureCameraLabel"),
      id: "pwa-camera-api",
      done: true,
    },
    {
      label: t("mediaCapture.featureScreenLabel"),
      id: "pwa-media-recorder-video-api",
      done: true,
    },
    {
      label: t("mediaCapture.featureAudioLabel"),
      id: "pwa-media-recorder-audio-api",
      done: true,
    },
  ] as { label: string; id: string | null; done: boolean }[];

  return (
    <DemoPageLayout
      name={t("mediaCapture.name")}
      description={t("mediaCapture.description")}
      summaryLabel={t("mediaCapture.summary")}
      features={FEATURES}
    >
      <CameraAPISection />
      <MediaRecorderVideoAPISection />
      <MediaRecorderAudioAPISection />
    </DemoPageLayout>
  );
};
