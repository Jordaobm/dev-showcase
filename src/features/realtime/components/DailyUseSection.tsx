import { useTranslations } from "next-intl";

export const DailyUseSection = () => {
  const t = useTranslations("realtime");

  return (
    <div className="mt-12" id="daily-use">
      <h3 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
        {t("dailyTitle")}
      </h3>

      <div className="mt-4 space-y-3 text-gray-600 text-base leading-relaxed">
        <p>{t("dailyIntegration")}</p>
        <p>{t("dailyExamples")}</p>
      </div>
    </div>
  );
};
