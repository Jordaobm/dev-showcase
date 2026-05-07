"use client";

import { Button } from "@/features/shared/components/Button";
import { renderHtmlText } from "@/features/shared/utils/renderHtmlText";
import { Expand, Shrink } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

export const FullScreenAPISection = () => {
  const t = useTranslations();
  const [fullScreen, setFullScreen] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    setIsSupported(document.fullscreenEnabled);

    const handleChange = () => {
      setFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleChange);
    };
  }, []);

  const toggleFullScreen = async () => {
    try {
      const el = document.querySelector("body");

      if (!document.fullscreenElement) {
        await el?.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
      setUnavailable(false);
    } catch {
      setUnavailable(true);
    }
  };

  return (
    <div id="pwa-full-screen-api" className="mt-12">
      <h3 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
        {t("nativeIntegrations.fullScreenSectionTitle")}
      </h3>

      <div className="text-gray-600">
        <p>{t.rich("nativeIntegrations.fullScreenDesc1", renderHtmlText)}</p>
        <br />
        <p>{t("nativeIntegrations.fullScreenDesc2")}</p>
        <br />
        <p>{t("nativeIntegrations.fullScreenUseCasesIntro")}</p>
        <br />
        <ul className="space-y-1 list-disc list-inside">
          <li>{t("nativeIntegrations.fullScreenUseCasesItem1")}</li>
          <li>{t("nativeIntegrations.fullScreenUseCasesItem2")}</li>
          <li>{t("nativeIntegrations.fullScreenUseCasesItem3")}</li>
          <li>{t("nativeIntegrations.fullScreenUseCasesItem4")}</li>
          <li>{t("nativeIntegrations.fullScreenUseCasesItem5")}</li>
        </ul>
        <br />
        <p>{t("nativeIntegrations.fullScreenExampleNote")}</p>
        <br />
        <p>{t("nativeIntegrations.fullScreenValueNote")}</p>
      </div>

      <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded text-sm text-amber-900">
        <p className="font-bold">{t("nativeIntegrations.howToUseLabel")}</p>

        <p className="mt-2">
          {t("nativeIntegrations.fullScreenHowToUseIntro")}
        </p>

        <div className="flex flex-col md:flex-row mt-4 gap-4 items-start">
          <div>
            <Button
              type="primary"
              onClick={toggleFullScreen}
              disabled={!isSupported}
            >
              {fullScreen ? (
                <>
                  <Shrink className="w-5 h-5" />
                  {t("nativeIntegrations.fullScreenExitButton")}
                </>
              ) : (
                <>
                  <Expand className="w-5 h-5" />
                  {t("nativeIntegrations.fullScreenEnterButton")}
                </>
              )}
            </Button>

            {(!isSupported || unavailable) && (
              <p className="mt-2 text-sm text-amber-700">
                {t("nativeIntegrations.fullScreenUnavailableMessage")}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 p-4 border rounded-lg">
        <p className="text-sm text-gray-600 mb-3">
          {t("nativeIntegrations.methodsTitle")}
        </p>

        <ul className="space-y-2 text-sm text-gray-700">
          <li>
            {t.rich("nativeIntegrations.fullScreenMethod1", renderHtmlText)}
          </li>
          <li>
            {t.rich("nativeIntegrations.fullScreenMethod2", renderHtmlText)}
          </li>
        </ul>
      </div>
    </div>
  );
};
