import type { useTranslations } from "next-intl";

type TranslateFn = ReturnType<typeof useTranslations>;

export const resolveText = (t: TranslateFn, value: string): string => {
  return t.has(value) ? t(value) : value;
};
