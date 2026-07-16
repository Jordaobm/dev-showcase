import type { DemoMetadata } from "@/registry/types";
import backgroundImage from "../assets/background.webp";

export const metadata: DemoMetadata = {
  id: "voice-interface",
  name: "voiceInterface.name",
  description: "voiceInterface.description",
  longDescription: "voiceInterface.longDescription",
  category: "shared.categories.accessibilityAI",
  tags: "voiceInterface.tags",
  featured: false,
  status: "live",
  architecture: "voiceInterface.architecture",
  technologies: "voiceInterface.technologies",
  concepts: "voiceInterface.concepts",
  component: () => import("../pages/Demo").then((m) => ({ default: m.VoiceInterfaceDemo })),
  i18nNamespace: "voiceInterface",
  imageUrl: backgroundImage.src,
};
