"use client";

import { useTranslations } from "next-intl";
import { StatusApplication } from "./StatusApplication";
import { renderHtmlText } from "@/features/shared/utils/renderHtmlText";

export const StatusSection = () => {
  const t = useTranslations();

  return (
    <div id="pwa-status" className="mt-12">
      <h3 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
        {t("pwaCore.statusSectionTitle")}
      </h3>

      <div className="text-gray-600">
        <p>{t.rich("pwaCore.statusIntro", renderHtmlText)}</p>
        <br />
        <p>{t.rich("pwaCore.statusDesktopTest1", renderHtmlText)}</p>
        <br />
        <p>{t.rich("pwaCore.statusDesktopTest2", renderHtmlText)}</p>
        <br />
        <p>{t("pwaCore.statusMobileTest")}</p>
        <br />
        <p>{t("pwaCore.statusPwaNote")}</p>
        <br />
        <p>
          {t("pwaCore.statusMdnTestBefore")}{" "}
          <a
            className="underline text-blue-500"
            target="_blank"
            rel="noreferrer noopener"
            href={process.env.NEXT_PUBLIC_MDN_URL}
          >
            MDN
          </a>
          . {t("pwaCore.statusMdnTestAfter")}
        </p>
        <br />
        <p>{t.rich("pwaCore.statusResetTest", renderHtmlText)}</p>
      </div>

      <StatusApplication />
    </div>
  );
};
