"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/features/shared/components/Button";
import { Download } from "lucide-react";
import { useInstallPrompt } from "../hooks/useInstallPrompt";
import { renderHtmlText } from "@/features/shared/utils/renderHtmlText";

export const InstallSection = () => {
  const t = useTranslations();
  const { canInstall, isInstalling, install } = useInstallPrompt();

  return (
    <div id="pwa-install" className="mt-12">
      <h3 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
        {t("pwaCore.installSectionTitle")}
      </h3>

      <div className="text-gray-600">
        <p>{t("pwaCore.installIntro1")}</p>
        <br />
        <p>{t("pwaCore.installIntro2")}</p>
        <br />
        <p>{t("pwaCore.installIntro3")}</p>
        <br />
        <p className="text-red-500 font-bold">
          {t("pwaCore.installBenefitsTitle")}
        </p>
        <br />
        <ul className="space-y-1 list-disc list-inside">
          <li>{t.rich("pwaCore.installBenefit1", renderHtmlText)}</li>
          <li>{t.rich("pwaCore.installBenefit2", renderHtmlText)}</li>
          <li>{t.rich("pwaCore.installBenefit3", renderHtmlText)}</li>
          <li>{t.rich("pwaCore.installBenefit4", renderHtmlText)}</li>
        </ul>
        <br />
        <p className="text-red-500 font-bold">
          {t("pwaCore.installLimitsTitle")}
        </p>
        <br />
        <ul className="space-y-1 list-disc list-inside">
          <li>{t.rich("pwaCore.installLimit1", renderHtmlText)}</li>
          <li>{t.rich("pwaCore.installLimit2", renderHtmlText)}</li>
          <li>{t.rich("pwaCore.installLimit3", renderHtmlText)}</li>
        </ul>
        <br />
        <p>{t("pwaCore.installSummary")}</p>
      </div>

      <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded text-sm text-amber-900">
        <p className="font-bold">{t("pwaCore.installHowToUseLabel")}</p>
        <p className="mt-1">{t("pwaCore.installHowTo1")}</p>

        {canInstall && (
          <Button
            type="primary"
            onClick={install}
            disabled={isInstalling}
            className="mt-4 w-full sm:w-3xs"
          >
            <Download className="w-4 h-4" />
            {t("pwaCore.installButton")}
          </Button>
        )}

        {!canInstall && (
          <Button type="primary" disabled className="mt-4 w-full sm:w-3xs">
            <Download className="w-4 h-4" />
            {t("pwaCore.installUnavailable")}
          </Button>
        )}

        <p className="mt-4">{t("pwaCore.installConditionsIntro")}</p>

        <ul className="mt-2 space-y-1 list-disc list-inside">
          <li>{t.rich("pwaCore.installCondition1", renderHtmlText)}</li>
          <li>{t.rich("pwaCore.installCondition2", renderHtmlText)}</li>
          <li>{t.rich("pwaCore.installCondition3", renderHtmlText)}</li>
          <li>{t.rich("pwaCore.installCondition4", renderHtmlText)}</li>
        </ul>

        <p className="mt-4">{t("pwaCore.installManualIntro")}</p>

        <ul className="mt-2 space-y-1 list-disc list-inside">
          <li>{t.rich("pwaCore.installManualDesktop", renderHtmlText)}</li>
          <li>{t.rich("pwaCore.installManualMobile", renderHtmlText)}</li>
        </ul>
      </div>
    </div>
  );
};
