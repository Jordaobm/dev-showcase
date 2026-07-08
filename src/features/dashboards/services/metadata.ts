import type { DemoMetadata } from "@/registry/types";
import backgroundImage from "../assets/background.webp";

export const metadata: DemoMetadata = {
  id: "dashboards",
  name: "dashboards.name",
  description: "dashboards.description",
  longDescription: "dashboards.longDescription",
  category: "shared.categories.dashboards",
  tags: "dashboards.tags",
  featured: true,
  status: "coming-soon",
  architecture: "dashboards.architecture",
  technologies: "dashboards.technologies",
  concepts: "dashboards.concepts",
  i18nNamespace: "dashboards",
  imageUrl: backgroundImage.src,
};
