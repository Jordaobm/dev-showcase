import type { DemoMetadata } from "@/registry/types";
import backgroundImage from "../assets/background.webp";
import { NativeIntegrationsDemo } from "../pages/Demo";

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
  component: NativeIntegrationsDemo,
  i18nNamespace: "nativeIntegrations",
  imageUrl: backgroundImage.src,
};
