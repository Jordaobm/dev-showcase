import type { DemoMetadata } from "@/registry/types";
import backgroundImage from "../assets/background.webp";

export const metadata: DemoMetadata = {
  id: "native-integrations",
  name: "nativeIntegrations.name",
  description: "nativeIntegrations.description",
  longDescription: "nativeIntegrations.longDescription",
  category: "shared.categories.nativeUX",
  tags: "nativeIntegrations.tags",
  featured: false,
  status: "live",
  architecture: "nativeIntegrations.architecture",
  technologies: "nativeIntegrations.technologies",
  concepts: "nativeIntegrations.concepts",
  component: () => import("../pages/Demo").then((m) => ({ default: m.NativeIntegrationsDemo })),
  i18nNamespace: "nativeIntegrations",
  imageUrl: backgroundImage.src,
};
