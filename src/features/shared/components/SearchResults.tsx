"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import type { DemoEntry } from "@/registry/types";
import { resolveText } from "@/features/shared/utils/resolveText";

interface SearchResultsProps {
  results: DemoEntry[];
  onSelect: () => void;
}

export const SearchResults = ({
  results,
  onSelect,
}: Readonly<SearchResultsProps>) => {
  const t = useTranslations();

  if (results.length === 0) {
    return (
      <div className="absolute top-full left-0 right-0 mt-2 p-4 rounded-2xl bg-white shadow-lg border border-gray-100 text-sm text-gray-500 text-center z-50">
        {t("shared.header.noResults")}
      </div>
    );
  }

  return (
    <div
      data-testid="search-results"
      className="absolute top-full left-0 right-0 mt-2 rounded-2xl bg-white shadow-lg border border-gray-100 overflow-hidden z-50 max-h-80 overflow-y-auto"
    >
      {results.map((demo) => (
        <Link
          key={demo.id}
          href={`/showcase/${demo.id}`}
          onClick={onSelect}
          data-testid="search-result-item"
          className="block px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
        >
          <p className="text-sm font-medium text-gray-900 truncate">{resolveText(t, demo.name)}</p>
          <p className="text-xs text-gray-500 truncate">{resolveText(t, demo.description)}</p>
        </Link>
      ))}
    </div>
  );
};
