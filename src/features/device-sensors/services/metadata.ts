import type { DemoMetadata } from "@/registry/types";
import backgroundImage from "../assets/background.webp";
import { DeviceSensorsDemo } from "../pages/Demo";

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
  component: DeviceSensorsDemo,
  i18nNamespace: "deviceSensors",
  imageUrl: backgroundImage.src,
};
