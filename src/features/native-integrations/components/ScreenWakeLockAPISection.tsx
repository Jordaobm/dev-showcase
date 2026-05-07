"use client";

import { Button } from "@/features/shared/components/Button";
import { renderHtmlText } from "@/features/shared/utils/renderHtmlText";
import { Lock, LockOpen } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";

export const ScreenWakeLockAPISection = () => {
  const t = useTranslations();
  const wakeLock = useRef<WakeLockSentinel | null>(null);
  const [locked, setLocked] = useState(false);
  const [unavailable, setUnavailable] = useState(false);

  const lock = async () => {
    if (locked) {
      if (!wakeLock.current) return;

      await wakeLock.current.release().then(() => {
        wakeLock.current = null;
      });
      setLocked(false);
    } else {
      try {
        wakeLock.current = await navigator.wakeLock.request("screen");
        setLocked(true);
        setUnavailable(false);
      } catch {
        setUnavailable(true);
      }
    }
  };

  return (
    <div id="pwa-screen-wake-lock-api" className="mt-12">
      <h3 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
        {t("nativeIntegrations.wakeLockSectionTitle")}
      </h3>

      <div className="text-gray-600">
        <p>{t.rich("nativeIntegrations.wakeLockDesc1", renderHtmlText)}</p>
        <br />
        <p>{t("nativeIntegrations.wakeLockDesc2")}</p>
        <br />
        <p>{t("nativeIntegrations.wakeLockExampleNote")}</p>
        <br />
        <p>{t("nativeIntegrations.wakeLockUseCasesIntro")}</p>
        <br />
        <ul className="space-y-1 list-disc list-inside">
          <li>{t("nativeIntegrations.wakeLockUseCasesItem1")}</li>
          <li>{t("nativeIntegrations.wakeLockUseCasesItem2")}</li>
          <li>{t("nativeIntegrations.wakeLockUseCasesItem3")}</li>
          <li>{t("nativeIntegrations.wakeLockUseCasesItem4")}</li>
          <li>{t("nativeIntegrations.wakeLockUseCasesItem5")}</li>
        </ul>
        <br />
        <p>{t("nativeIntegrations.wakeLockWithoutApiNote")}</p>
        <br />
        <p>{t("nativeIntegrations.wakeLockCaveatNote")}</p>
        <br />
        <p>{t("nativeIntegrations.wakeLockPwaNote")}</p>
      </div>

      <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded text-sm text-amber-900">
        <p className="font-bold">{t("nativeIntegrations.howToUseLabel")}</p>
        <p className="mt-2">{t("nativeIntegrations.wakeLockHowToUseIntro")}</p>

        <div className="mt-4">
          <Button type="primary" onClick={lock}>
            {locked ? (
              <>
                <Lock className="w-5 h-5" />
                {t("nativeIntegrations.wakeLockActiveButton")}
              </>
            ) : (
              <>
                <LockOpen className="w-5 h-5" />
                {t("nativeIntegrations.wakeLockActivateButton")}
              </>
            )}
          </Button>

          {unavailable && (
            <p className="mt-2 text-sm text-amber-700">
              {t("nativeIntegrations.wakeLockUnavailableMessage")}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 p-4 border rounded-lg">
        <p className="text-sm text-gray-600 mb-3">
          {t("nativeIntegrations.methodsTitle")}
        </p>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>{t.rich("nativeIntegrations.wakeLockMethod1", renderHtmlText)}</li>
          <li>{t.rich("nativeIntegrations.wakeLockMethod2", renderHtmlText)}</li>
        </ul>
      </div>
    </div>
  );
};
