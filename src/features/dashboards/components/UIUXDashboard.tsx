import { renderHtmlText } from "@/features/shared/utils/renderHtmlText";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

const richText = {
  ...renderHtmlText,
  link: (chunks: ReactNode) => (
    <a
      href="https://uxpilot.ai/blogs/dashboard-design-principles"
      target="_blank"
      rel="noopener noreferrer"
      className="underline"
    >
      {chunks}
    </a>
  ),
};

export const UIUXDashboard = () => {
  const t = useTranslations("dashboards");

  const principles = [1, 2, 3, 4, 5, 6] as const;

  return (
    <div className="mt-12" id="uiux">
      <h3 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
        {t("uiuxTitle")}
      </h3>

      <div className="mt-4 space-y-3 text-gray-600 text-base leading-relaxed">
        <p>{t("uiuxIntro1")}</p>
        <p>{t("uiuxIntro2")}</p>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
          <p className="font-semibold text-gray-700 mb-2 text-sm">
            {t("uiuxBusinessTitle")}
          </p>
          <p className="text-xs text-gray-600 leading-relaxed">
            {t("uiuxBusinessDesc")}
          </p>
        </div>
        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
          <p className="font-semibold text-gray-700 mb-2 text-sm">
            {t("uiuxSystemTitle")}
          </p>
          <p className="text-xs text-gray-600 leading-relaxed">
            {t("uiuxSystemDesc")}
          </p>
        </div>
      </div>

      <p className="mt-4 text-gray-600 text-base leading-relaxed">
        {t("uiuxIntro3")}
      </p>

      <div className="mt-6">
        <p className="font-semibold text-gray-700 mb-3">
          {t("uiuxPrinciplesTitle")}
        </p>
        <ul className="space-y-3">
          {principles.map((n) => (
            <li
              key={n}
              className="flex gap-2 text-sm text-gray-600 leading-relaxed"
            >
              <span className="shrink-0 text-gray-400">—</span>
              <span>{t.rich(`uiuxPrinciple${n}`, renderHtmlText)}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-6 text-xs text-gray-400 leading-relaxed">
        {t.rich("uiuxCredit", richText)}
      </p>
    </div>
  );
};
