import type { DemoMetadata } from "@/registry/types";
import backgroundImage from "../assets/background.webp";

export const metadata: DemoMetadata = {
  id: "device-sensors",
  name: "deviceSensors.name",
  description: "deviceSensors.description",
  longDescription: "deviceSensors.longDescription",
  category: "shared.categories.hardware",
  tags: "deviceSensors.tags",
  featured: false,
  status: "live",
  architecture: "deviceSensors.architecture",
  technologies: "deviceSensors.technologies",
  concepts: "deviceSensors.concepts",
  component: () => import("../pages/Demo").then((m) => ({ default: m.DeviceSensorsDemo })),
  i18nNamespace: "deviceSensors",
  imageUrl: backgroundImage.src,
};
