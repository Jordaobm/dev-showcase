import type { DemoMetadata } from "@/registry/types";
import backgroundImage from "../assets/background.webp";
import { MediaCaptureDemo } from "../pages/Demo";

export const metadata: DemoMetadata = {
  id: "media-capture",
  name: "mediaCapture.name",
  description: "mediaCapture.description",
  longDescription: "mediaCapture.longDescription",
  category: "shared.categories.media",
  tags: "mediaCapture.tags",
  featured: false,
  status: "live",
  architecture: "mediaCapture.architecture",
  technologies: "mediaCapture.technologies",
  concepts: "mediaCapture.concepts",
  component: MediaCaptureDemo,
  i18nNamespace: "mediaCapture",
  imageUrl: backgroundImage.src,
};
