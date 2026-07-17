"use client";

import { formatSeconds } from "@/features/shared/utils/formatSeconds";
import { renderHtmlText } from "@/features/shared/utils/renderHtmlText";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

export const BatteryStatusAPISection = () => {
  const t = useTranslations();
  const [info, setInfo] = useState<Partial<BatteryManager>>();
  const [isSupported, setIsSupported] = useState(true);
  const batteryRef = useRef<BatteryManager | null>(null);
  const updateRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    let mounted = true;

    if (typeof navigator.getBattery !== "function") {
      setIsSupported(false);
      return;
    }

    navigator
      .getBattery()
      .then((battery) => {
        if (!mounted) return;

        batteryRef.current = battery;

        const update = () => {
          setInfo({
            charging: battery.charging,
            level: battery.level,
            chargingTime: battery.chargingTime,
            dischargingTime: battery.dischargingTime,
          });
        };

        updateRef.current = update;
        update();

        battery.addEventListener("chargingchange", update);
        battery.addEventListener("levelchange", update);
        battery.addEventListener("chargingtimechange", update);
        battery.addEventListener("dischargingtimechange", update);
      })
      .catch(() => {
        if (mounted) setIsSupported(false);
      });

    return () => {
      mounted = false;
      const battery = batteryRef.current;
      const update = updateRef.current;
      if (!battery || !update) return;
      battery.removeEventListener("chargingchange", update);
      battery.removeEventListener("levelchange", update);
      battery.removeEventListener("chargingtimechange", update);
      battery.removeEventListener("dischargingtimechange", update);
    };
  }, []);

  return (
    <div id="pwa-battery-status-api" className="mt-12">
      <h3 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
        {t("deviceSensors.batterySectionTitle")}
      </h3>

      <div className="text-gray-600">
        <p>{t.rich("deviceSensors.batteryDesc1", renderHtmlText)}</p>
        <br />
        <p>{t("deviceSensors.batteryDesc2")}</p>
        <br />
        <p>{t("deviceSensors.batteryCapabilitiesIntro")}</p>
        <br />
        <ul className="space-y-1 list-disc list-inside">
          <li>{t("deviceSensors.batteryCapabilitiesItem1")}</li>
          <li>{t("deviceSensors.batteryCapabilitiesItem2")}</li>
          <li>{t("deviceSensors.batteryCapabilitiesItem3")}</li>
          <li>{t("deviceSensors.batteryCapabilitiesItem4")}</li>
        </ul>
        <br />
        <p>{t("deviceSensors.batteryExamplesIntro")}</p>
        <br />
        <ul className="space-y-1 list-disc list-inside">
          <li>{t("deviceSensors.batteryExamplesItem1")}</li>
          <li>{t("deviceSensors.batteryExamplesItem2")}</li>
          <li>{t("deviceSensors.batteryExamplesItem3")}</li>
          <li>{t("deviceSensors.batteryExamplesItem4")}</li>
        </ul>
        <br />
        <p>{t("deviceSensors.batterySupportNote")}</p>
        <br />
        <p>{t("deviceSensors.batteryValueNote")}</p>
      </div>

      <div className="mt-4 p-4 border rounded-lg">
        <p className="text-sm text-gray-600 mb-3">
          {t("deviceSensors.methodsTitle")}
        </p>
        {isSupported ? (
          <ul className="space-y-2 text-sm text-gray-700">
            <li>
              <strong>{t("deviceSensors.batteryChargingLabel")}</strong>
              <span className="ml-1 font-medium">
                {info?.charging
                  ? t("deviceSensors.batteryChargingYes")
                  : t("deviceSensors.batteryChargingNo")}
              </span>
            </li>

            <li>
              <strong>{t("deviceSensors.batteryChargingTimeLabel")}</strong>
              <span className="ml-1 font-medium">
                {formatSeconds(info?.chargingTime, t)}
              </span>
            </li>

            <li>
              <strong>{t("deviceSensors.batteryDischargingTimeLabel")}</strong>
              <span className="ml-1 font-medium">
                {formatSeconds(info?.dischargingTime, t)}
              </span>
            </li>
          </ul>
        ) : (
          <p className="text-sm text-amber-700">
            {t("deviceSensors.batteryUnsupportedMessage")}
          </p>
        )}
      </div>
    </div>
  );
};
