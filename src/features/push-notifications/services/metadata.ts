import type { DemoMetadata } from "@/registry/types";
import backgroundImage from "../assets/background.webp";
import { PushNotificationsDemo } from "../pages/Demo";

export const metadata: DemoMetadata = {
  id: "push-notifications",
  name: "pushNotifications.name",
  description: "pushNotifications.description",
  longDescription: "pushNotifications.longDescription",
  category: "shared.categories.communication",
  tags: "pushNotifications.tags",
  featured: false,
  status: "live",
  architecture: "pushNotifications.architecture",
  technologies: "pushNotifications.technologies",
  concepts: "pushNotifications.concepts",
  component: PushNotificationsDemo,
  i18nNamespace: "pushNotifications",
  imageUrl: backgroundImage.src,
};
