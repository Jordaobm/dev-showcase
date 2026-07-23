"use client";

import { Button } from "@/features/shared/components/Button";
import { renderHtmlText } from "@/features/shared/utils/renderHtmlText";
import { Vibrate, VibrateOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { useClientSnapshot } from "@/features/shared/hooks/useClientSnapshot";

const PATTERN: number[] = [200, 100, 200];
const PATTERN_DURATION = PATTERN.reduce((a, b) => a + b, 0);

type VibrateStatus = "idle" | "accepted" | "rejected";

export const VibrationAPISection = () => {
  const t = useTranslations();
  const [isVibrating, setIsVibrating] = useState(false);
  const isSupported = useClientSnapshot(
    () => typeof navigator.vibrate === "function",
    true,
  );
  const [vibrateStatus, setVibrateStatus] = useState<VibrateStatus>("idle");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopVibration = () => {
    navigator.vibrate(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsVibrating(false);
    setVibrateStatus("idle");
  };

  const startVibration = () => {
    const accepted = navigator.vibrate(PATTERN);
    if (!accepted) {
      setVibrateStatus("rejected");
      return;
    }
    setVibrateStatus("accepted");
    intervalRef.current = setInterval(() => {
      navigator.vibrate(PATTERN);
    }, PATTERN_DURATION);
    setIsVibrating(true);
  };

  const toggleVibration = () => {
    if (isVibrating) {
      stopVibration();
    } else {
      startVibration();
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        navigator.vibrate(0);
      }
    };
  }, []);

  return (
    <div id="pwa-vibration-api" className="mt-12">
      <h3 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
        {t("deviceSensors.vibrationSectionTitle")}
      </h3>

      <div className="text-gray-600">
        <p>{t.rich("deviceSensors.vibrationDesc1", renderHtmlText)}</p>
        <br />
        <p>{t("deviceSensors.vibrationDesc2")}</p>
        <br />
        <p>{t("deviceSensors.vibrationCapabilitiesIntro")}</p>
        <br />
        <ul className="space-y-1 list-disc list-inside">
          <li>{t("deviceSensors.vibrationCapabilitiesItem1")}</li>
          <li>{t("deviceSensors.vibrationCapabilitiesItem2")}</li>
          <li>{t("deviceSensors.vibrationCapabilitiesItem3")}</li>
          <li>{t("deviceSensors.vibrationCapabilitiesItem4")}</li>
        </ul>
        <br />
        <p>{t("deviceSensors.vibrationPatternNote")}</p>
        <br />
        <p>{t("deviceSensors.vibrationSupportNote")}</p>
        <br />
        <p>{t("deviceSensors.vibrationPwaNote")}</p>
      </div>

      <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded text-sm text-amber-900">
        <p className="font-bold">{t("deviceSensors.howToUseLabel")}</p>

        <p className="mt-2">{t("deviceSensors.vibrationHowToUseIntro")}</p>

        <div className="flex flex-col md:flex-row mt-4 gap-4 items-start">
          <Button
            type="primary"
            onClick={toggleVibration}
            disabled={!isSupported}
          >
            {isVibrating ? (
              <>
                <VibrateOff className="w-5 h-5" />
                {t("deviceSensors.vibrationStopButton")}
              </>
            ) : (
              <>
                <Vibrate className="w-5 h-5" />
                {t("deviceSensors.vibrationStartButton")}
              </>
            )}
          </Button>
        </div>

        {!isSupported && (
          <p className="mt-2 text-sm text-yellow-600">
            {t("deviceSensors.vibrationUnsupportedMessage")}
          </p>
        )}

        {vibrateStatus === "accepted" && (
          <p className="mt-2 text-sm text-green-600">
            {t.rich("deviceSensors.vibrationAcceptedMessage", renderHtmlText)}
          </p>
        )}
        {vibrateStatus === "rejected" && (
          <p className="mt-2 text-sm text-red-600">
            {t.rich("deviceSensors.vibrationRejectedMessage", renderHtmlText)}
          </p>
        )}
      </div>

      <div className="mt-4 p-4 border rounded-lg">
        <p className="text-sm text-gray-600 mb-3">
          {t("deviceSensors.methodsTitle")}
        </p>

        <ul className="space-y-2 text-sm text-gray-700">
          <li>{t.rich("deviceSensors.vibrationMethod1", renderHtmlText)}</li>
          <li>{t.rich("deviceSensors.vibrationMethod2", renderHtmlText)}</li>
          <li>{t.rich("deviceSensors.vibrationMethod3", renderHtmlText)}</li>
        </ul>
      </div>
    </div>
  );
};
