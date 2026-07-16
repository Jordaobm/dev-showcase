"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { LayoutGrid, Tag } from "lucide-react";
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
      className="flex flex-wrap gap-3 justify-center mb-16"
      data-testid="category-filter"
    >
      {categories.map((category) => {
        const isSelected = selected === category;
        const label =
          category === "All"
            ? t("shared.categories.all")
            : resolveText(t, category);
        return (
          <motion.button
            key={category}
            onClick={() => onSelect(category)}
            className="px-6 py-3 rounded-full transition-all duration-300 relative overflow-hidden premium-button cursor-pointer"
            style={{
              background: isSelected
                ? "linear-gradient(135deg, #DC2626, #B91C1C)"
                : "white",
              color: isSelected ? "white" : "#374151",
              border: isSelected ? "none" : "1px solid rgba(0, 0, 0, 0.08)",
              boxShadow: isSelected
                ? "0 8px 24px rgba(220, 38, 38, 0.35), 0 0 32px rgba(220, 38, 38, 0.2)"
                : "0 4px 12px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
            }}
            whileHover={{
              scale: 1.05,
              y: -2,
            }}
            whileTap={{ scale: 0.98 }}
          >
            {isSelected && (
              <>
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    boxShadow: "0 0 40px rgba(220, 38, 38, 0.4)",
                    opacity: 0.6,
                  }}
                />
                <div
                  className="absolute inset-0 rounded-full opacity-30"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(255, 255, 255, 0.3) 0%, transparent 100%)",
                  }}
                />
              </>
            )}
            <span className="relative z-10 font-medium flex items-center gap-2 text-sm">
              {category === "All" ? (
                <LayoutGrid className="w-4 h-4" />
              ) : (
                <Tag className="w-4 h-4" />
              )}
              {label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
};
