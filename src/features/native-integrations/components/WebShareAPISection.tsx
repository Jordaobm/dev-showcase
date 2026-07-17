"use client";

import { Button } from "@/features/shared/components/Button";
import { renderHtmlText } from "@/features/shared/utils/renderHtmlText";
import { CheckCircle, FileText, Link, Share, Type } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

const INITIAL_SHARE_DATA = { title: "Dev Showcase", text: "", url: "" };

export const WebShareAPISection = () => {
  const t = useTranslations();
  const [shared, setShared] = useState(false);
  const [shareData, setShareData] = useState(INITIAL_SHARE_DATA);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    const text = document.querySelector("title")?.innerHTML ?? "";
    const url = window.location.href;
    const data = { title: "Dev Showcase", text, url };
    setShareData(data);
    setIsSupported(
      typeof navigator.share === "function" && navigator.canShare(data),
    );
  }, []);

  const share = async () => {
    try {
      await navigator.share(shareData);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch {}
  };

  return (
    <div id="pwa-webshare-api" className="mt-12">
      <h3 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
        {t("nativeIntegrations.webShareSectionTitle")}
      </h3>

      <div className="text-gray-600">
        <p>{t.rich("nativeIntegrations.webShareDesc1", renderHtmlText)}</p>
        <br />
        <p>{t("nativeIntegrations.webShareDesc2")}</p>
        <br />
        <p>{t("nativeIntegrations.webShareUseCasesIntro")}</p>
        <br />
        <ul className="space-y-1 list-disc list-inside">
          <li>{t("nativeIntegrations.webShareUseCasesItem1")}</li>
          <li>{t("nativeIntegrations.webShareUseCasesItem2")}</li>
          <li>{t("nativeIntegrations.webShareUseCasesItem3")}</li>
          <li>{t("nativeIntegrations.webShareUseCasesItem4")}</li>
        </ul>
        <br />
        <p>{t("nativeIntegrations.webShareExampleNote")}</p>
        <br />
        <p>{t("nativeIntegrations.webShareValueNote")}</p>
      </div>

      <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded text-sm text-amber-900">
        <p className="font-bold">{t("nativeIntegrations.howToUseLabel")}</p>
        <p className="mt-2">{t("nativeIntegrations.webShareHowToUseIntro")}</p>

        <div className="mt-4 flex-col gap-3">
          <Button
            type="primary"
            onClick={share}
            disabled={!isSupported}
            className="w-full md:w-auto"
            customStyle={
              shared
                ? {
                    background: "linear-gradient(135deg, #26dc26, #21b91c)",
                    boxShadow:
                      "0 4px 16px rgba(38, 220, 53, 0.3), 0 0 20px rgba(44, 220, 38, 0.15)",
                  }
                : {}
            }
          >
            {shared ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <Share className="w-5 h-5" />
            )}
            {shared
              ? t("nativeIntegrations.webShareSharedButton")
              : t("nativeIntegrations.webShareShareButton")}
          </Button>

          {!isSupported && (
            <p className="text-sm text-amber-700">
              {t("nativeIntegrations.webShareUnsupportedMessage")}
            </p>
          )}
        </div>

        <div className="mt-4">
          <div className="mt-4 p-4 border rounded-lg">
            <p className="text-sm text-gray-600 mb-3">
              {t("nativeIntegrations.webShareDataTitle")}
            </p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <Type size={15} className="mt-0.5 shrink-0 text-gray-400" />
                <span>
                  <strong>
                    {t("nativeIntegrations.webShareDataTitleTitle")}:
                  </strong>{" "}
                  {shareData.title}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <FileText size={15} className="mt-0.5 shrink-0 text-gray-400" />
                <span>
                  <strong>{t("nativeIntegrations.webShareDataText")}</strong>:{" "}
                  {shareData.text || "—"}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Link size={15} className="mt-0.5 shrink-0 text-gray-400" />
                <span className="break-all">
                  <strong>{t("nativeIntegrations.webShareDataURL")}</strong>:{" "}
                  {shareData.url || "—"}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-4 p-4 border rounded-lg">
        <p className="text-sm text-gray-600 mb-3">
          {t("nativeIntegrations.methodsTitle")}
        </p>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>
            {t.rich("nativeIntegrations.webShareMethod1", renderHtmlText)}
          </li>
          <li>
            {t.rich("nativeIntegrations.webShareMethod2", renderHtmlText)}
          </li>
        </ul>
      </div>
    </div>
  );
};
