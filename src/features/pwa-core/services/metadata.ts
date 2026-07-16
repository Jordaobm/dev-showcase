import type { DemoMetadata } from "@/registry/types";
import backgroundImage from "../assets/background.webp";

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
  component: () => import("../pages/Demo").then((m) => ({ default: m.PwaCoreDemo })),
  i18nNamespace: "pwaCore",
  imageUrl: backgroundImage.src,
};
