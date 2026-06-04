import type { DemoMetadata } from "@/registry/types";
import backgroundImage from "../assets/background.webp";
import { AuthDemo } from "../pages/Demo";

export const metadata: DemoMetadata = {
  id: "auth",
  name: "auth.name",
  description: "auth.description",
  longDescription: "auth.longDescription",
  category: "shared.categories.security",
  tags: "auth.tags",
  featured: true,
  status: "live",
  architecture: "auth.architecture",
  technologies: "auth.technologies",
  concepts: "auth.concepts",
  component: AuthDemo,
  i18nNamespace: "auth",
  imageUrl: backgroundImage.src,
};
