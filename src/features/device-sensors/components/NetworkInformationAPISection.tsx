"use client";

import { renderHtmlText } from "@/features/shared/utils/renderHtmlText";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useClientSnapshot } from "@/features/shared/hooks/useClientSnapshot";

interface NetworkInfo {
  downlink?: number;
  effectiveType?: string;
  rtt?: number;
  saveData?: boolean;
}

const snapshotConnection = (c: NetworkInformation): NetworkInfo => {
  return {
    downlink: c.downlink,
    effectiveType: c.effectiveType,
    rtt: c.rtt,
    saveData: c.saveData,
  };
};

export const NetworkInformationAPISection = () => {
  const t = useTranslations();
  const [info, setInfo] = useState<NetworkInfo | null>(null);
  const isSupported = useClientSnapshot(() => !!navigator.connection, true);

  useEffect(() => {
    const connection = navigator.connection ?? null;
    if (!connection) return;

    const handleChange = () => setInfo(snapshotConnection(connection));
    handleChange();
    connection.addEventListener("change", handleChange);
    return () => connection.removeEventListener("change", handleChange);
  }, []);

  return (
    <div id="pwa-network-information-api" className="mt-12">
      <h3 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
        {t("deviceSensors.networkSectionTitle")}
      </h3>

      <div className="text-gray-600">
        <p>{t.rich("deviceSensors.networkDesc1", renderHtmlText)}</p>
        <br />
        <p>{t("deviceSensors.networkDesc2")}</p>
        <br />
        <p>{t("deviceSensors.networkCapabilitiesIntro")}</p>
        <br />
        <ul className="space-y-1 list-disc list-inside">
          <li>{t("deviceSensors.networkCapabilitiesItem1")}</li>
          <li>{t("deviceSensors.networkCapabilitiesItem2")}</li>
          <li>{t("deviceSensors.networkCapabilitiesItem3")}</li>
          <li>{t("deviceSensors.networkCapabilitiesItem4")}</li>
        </ul>
        <br />
        <p>{t("deviceSensors.networkAdaptNote")}</p>
        <br />
        <p>{t("deviceSensors.networkExamplesIntro")}</p>
        <br />
        <ul className="space-y-1 list-disc list-inside">
          <li>{t("deviceSensors.networkExamplesItem1")}</li>
          <li>{t("deviceSensors.networkExamplesItem2")}</li>
          <li>{t("deviceSensors.networkExamplesItem3")}</li>
          <li>{t("deviceSensors.networkExamplesItem4")}</li>
        </ul>
        <br />
        <p>{t("deviceSensors.networkPwaNote")}</p>
      </div>

      <div className="mt-4 p-4 border rounded-lg">
        <p className="text-sm text-gray-600 mb-3">
          {t("deviceSensors.methodsTitle")}
        </p>
        {isSupported ? (
          <ul className="space-y-2 text-sm text-gray-700">
            <li>
              <strong>{t("deviceSensors.networkDownlinkLabel")}</strong>{" "}
              {info?.downlink}Mbps
            </li>
            <li>
              <strong>{t("deviceSensors.networkEffectiveTypeLabel")}</strong>{" "}
              {info?.effectiveType}
            </li>
            <li>
              <strong>{t("deviceSensors.networkRttLabel")}</strong>{" "}
              {info?.rtt}ms
            </li>
            <li>
              <strong>{t("deviceSensors.networkSaveDataLabel")}</strong>{" "}
              {info?.saveData
                ? t("deviceSensors.networkSaveDataYes")
                : t("deviceSensors.networkSaveDataNo")}
            </li>
          </ul>
        ) : (
          <p className="text-sm text-amber-700">
            {t("deviceSensors.networkUnsupportedMessage")}
          </p>
        )}
      </div>
    </div>
  );
};
