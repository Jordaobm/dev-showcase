import type { DemoMetadata } from "@/registry/types";
import backgroundImage from "../assets/background.webp";
import { OfflineDataLayerDemo } from "../pages/Demo";

export const metadata: DemoMetadata = {
  id: "offline-data-layer",
  name: "offlineDataLayer.name",
  description: "offlineDataLayer.description",
  longDescription: "offlineDataLayer.longDescription",
  category: "shared.categories.architecture",
  tags: "offlineDataLayer.tags",
  featured: false,
  status: "live",
  architecture: "offlineDataLayer.architecture",
  technologies: "offlineDataLayer.technologies",
  concepts: "offlineDataLayer.concepts",
  component: OfflineDataLayerDemo,
  i18nNamespace: "offlineDataLayer",
  imageUrl: backgroundImage.src,
};
