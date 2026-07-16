import type { DemoMetadata } from "@/registry/types";
import backgroundImage from "../assets/background.webp";

export const metadata: DemoMetadata = {
  id: "demo3d",
  name: "demo3d.name",
  description: "demo3d.description",
  longDescription: "demo3d.longDescription",
  category: "shared.categories.ux",
  tags: "demo3d.tags",
  featured: true,
  status: "live",
  architecture: "demo3d.architecture",
  technologies: "demo3d.technologies",
  concepts: "demo3d.concepts",
  component: () => import("../pages/Demo").then((m) => ({ default: m.ThreeDDemo })),
  i18nNamespace: "demo3d",
  imageUrl: backgroundImage.src,
};
