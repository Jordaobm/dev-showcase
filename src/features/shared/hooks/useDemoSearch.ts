"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { registry } from "@/registry/index";
import type { DemoEntry } from "@/registry/types";
import { resolveText } from "@/features/shared/utils/resolveText";

export const useDemoSearch = (query: string): DemoEntry[] => {
  const t = useTranslations();

  return useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return [];

    return registry.filter((demo) => {
      const name = resolveText(t, demo.name).toLowerCase();
      const description = resolveText(t, demo.description).toLowerCase();
      const technologies = resolveText(t, demo.technologies).toLowerCase();
      const tags = resolveText(t, demo.tags).toLowerCase();
      return (
        name.includes(normalizedQuery) ||
        description.includes(normalizedQuery) ||
        technologies.includes(normalizedQuery) ||
        tags.includes(normalizedQuery)
      );
    });
  }, [query, t]);
};
