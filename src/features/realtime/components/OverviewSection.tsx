import { useTranslations } from "next-intl";

export const OverviewSection = () => {
  const t = useTranslations("realtime");

  return (
    <div className="mt-12" id="overview">
      <h3 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
        {t("overviewTitle")}
      </h3>

      <div className="mt-4 space-y-3 text-gray-600 text-base leading-relaxed">
        <p>{t("overviewParagraph1")}</p>
        <p>{t("overviewParagraph2")}</p>
        <p>{t("overviewParagraph3")}</p>
      </div>
    </div>
  );
};
