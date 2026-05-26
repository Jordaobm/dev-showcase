import type { DemoMetadata } from "@/registry/types";
import backgroundImage from "../assets/background.webp";
import { PwaCoreDemo } from "../pages/Demo";

export const metadata: DemoMetadata = {
  id: "pwa-core",
  name: "pwaCore.name",
  description: "pwaCore.description",
  longDescription: "pwaCore.longDescription",
  category: "shared.categories.pwa",
  tags: "pwaCore.tags",
  featured: true,
  status: "live",
  architecture: "pwaCore.architecture",
  technologies: "pwaCore.technologies",
  concepts: "pwaCore.concepts",
  component: PwaCoreDemo,
  i18nNamespace: "pwaCore",
  imageUrl: backgroundImage.src,
};
