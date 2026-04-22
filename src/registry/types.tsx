import type { ComponentType } from "react";

export interface DemoMetadata {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  category: string;
  tags: string;
  featured: boolean;
  status: "live" | "coming-soon";
  technologies: string;
  architecture: string;
  concepts: string;
  component?: ComponentType;
  i18nNamespace?: string;
  imageUrl?: string;
}

export interface DemoEntry extends DemoMetadata {
  component?: ComponentType;
}
