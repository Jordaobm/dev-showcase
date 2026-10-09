"use client";

import { useTranslations } from "next-intl";
import { resolveText } from "@/features/shared/utils/resolveText";

interface CategoryFilterProps {
  categories: string[];
  selected: string;
  onSelect: (category: string) => void;
}

export const CategoryFilter = ({
  categories,
  selected,
  onSelect,
}: Readonly<CategoryFilterProps>) => {
  const t = useTranslations();

  return (
    <div
      className="mx-auto flex max-w-4xl flex-wrap justify-center gap-2"
      data-testid="category-filter"
    >
      {categories.map((category) => {
        const isSelected = selected === category;
        const label =
          category === "All"
            ? t("shared.categories.all")
            : resolveText(t, category);
        return (
          <button
            key={category}
            type="button"
            onClick={() => onSelect(category)}
            aria-pressed={isSelected}
            className={`cursor-pointer rounded-full border px-4 py-1.5 text-sm font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--premium-red)] ${
              isSelected
                ? "border-[var(--premium-red)] bg-[var(--premium-red)] text-white"
                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:text-gray-900"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
};
