"use client";

import { useTranslations } from "next-intl";
import { renderHtmlText } from "@/features/shared/utils/renderHtmlText";

export const CacheSection = () => {
  const t = useTranslations();

  return (
    <div id="pwa-cache" className="mt-12">
      <h3 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
        {t("pwaCore.cacheSectionTitle")}
      </h3>

      <div className="text-gray-600">
        <p>{t.rich("pwaCore.cacheServiceWorkerDesc", renderHtmlText)}</p>
        <br />
        <p>{t.rich("pwaCore.cacheDesc", renderHtmlText)}</p>
        <br />
        <p>{t("pwaCore.cacheSummary")}</p>
      </div>

      <div className="mt-4 p-4 border rounded-lg">
        <p className="text-sm text-gray-600 mb-3">
          {t("pwaCore.cacheStrategiesLabel")}
        </p>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>{t.rich("pwaCore.cacheStrategyHtml", renderHtmlText)}</li>
          <li>{t.rich("pwaCore.cacheStrategyImages", renderHtmlText)}</li>
          <li>{t.rich("pwaCore.cacheStrategyJsCss", renderHtmlText)}</li>
        </ul>
      </div>
    </div>
  );
};
