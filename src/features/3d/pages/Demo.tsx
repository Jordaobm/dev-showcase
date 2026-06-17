"use client";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { DemoPageLayout } from "@/features/shared/components/DemoPageLayout";
import { TechStackSolarSystem } from "../components/TechStackSolarSystem";

const OrbitControlsSection = dynamic(
  () =>
    import("../components/OrbitControls").then(
      (mod) => mod.OrbitControlsSection,
    ),
  { ssr: false },
);

const GalaxyShaderSection = dynamic(
  () =>
    import("../components/GalaxyShader").then(
      (mod) => mod.GalaxyShaderSection,
    ),
  { ssr: false },
);

const CameraJourneySection = dynamic(
  () =>
    import("../components/CameraJourney").then(
      (mod) => mod.CameraJourneySection,
    ),
  { ssr: false },
);

export const ThreeDDemo = () => {
  const t = useTranslations();

  const FEATURES = [
    {
      label: t("demo3d.orbitFeatureLabel"),
      id: "orbit-controls",
      done: true,
    },
    {
      label: t("demo3d.solarFeatureLabel"),
      id: "tech-stack-solar-system",
      done: true,
    },
    {
      label: t("demo3d.galaxyFeatureLabel"),
      id: "galaxy-shader",
      done: true,
    },
    {
      label: t("demo3d.journeyFeatureLabel"),
      id: "camera-journey",
      done: true,
    },
  ] as { label: string; id: string | null; done: boolean }[];

  return (
    <DemoPageLayout
      name={t("demo3d.name")}
      description={t("demo3d.shortDescription")}
      summaryLabel={t("demo3d.summary")}
      features={FEATURES}
    >
      <OrbitControlsSection />
      <TechStackSolarSystem />
      <GalaxyShaderSection />
      <CameraJourneySection />
    </DemoPageLayout>
  );
};
