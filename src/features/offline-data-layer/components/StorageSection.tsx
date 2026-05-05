"use client";

import { Button } from "@/features/shared/components/Button";
import { formatBytes } from "@/features/shared/utils/formatBytes";
import { renderHtmlText } from "@/features/shared/utils/renderHtmlText";
import { DatabaseSearchIcon, DatabaseZapIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

export const StorageSection = () => {
  const t = useTranslations();
  const [permissionStorage, setPermissionStorage] = useState({
    status: false,
    requested: false,
    quota: "0 Bytes",
    usage: "0 Bytes",
  });
  const [isSupported, setIsSupported] = useState(true);

  const getStorageStatus = async () => {
    if (navigator.storage === undefined) {
      setIsSupported(false);
      return;
    }

    const granted = await navigator.storage.persisted();
    const estimate = await navigator.storage.estimate();
    setPermissionStorage((prev) => ({
      ...prev,
      quota: formatBytes(Number(estimate?.quota)),
      usage: formatBytes(Number(estimate?.usage)),
      status: granted,
    }));
  };

  const requestPermissionStorage = async () => {
    if (!isSupported) return;

    const alreadyGranted = await navigator.storage.persisted();
    if (alreadyGranted) return;
    const granted = await navigator.storage.persist();
    setPermissionStorage((prev) => ({
      ...prev,
      status: granted,
      requested: true,
    }));
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    getStorageStatus();
  }, []);

  return (
    <div id="pwa-storage" className="mt-12">
      <h3 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
        {t("offlineDataLayer.storageSectionTitle")}
      </h3>

      <div className="text-gray-600">
        <p>{t.rich("offlineDataLayer.storageDesc1", renderHtmlText)}</p>
        <br />
        <p>{t("offlineDataLayer.storageDesc2")}</p>
        <br />
        <p>{t("offlineDataLayer.storageTechIntro")}</p>
        <br />
        <ul className="space-y-2 list-disc list-inside">
          <li>{t.rich("offlineDataLayer.storageTechIndexedDB", renderHtmlText)}</li>
          <li>{t.rich("offlineDataLayer.storageTechCache", renderHtmlText)}</li>
          <li>{t.rich("offlineDataLayer.storageTechOPFS", renderHtmlText)}</li>
        </ul>
        <br />
        <p>{t("offlineDataLayer.storageModernAppsNote")}</p>
        <br />
        <p>{t.rich("offlineDataLayer.storageEvictionDesc", renderHtmlText)}</p>
        <br />
        <p>{t.rich("offlineDataLayer.storagePersistDesc", renderHtmlText)}</p>
        <br />
        <p>{t.rich("offlineDataLayer.storageBrowserDiffDesc", renderHtmlText)}</p>
      </div>

      <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded text-sm text-amber-900">
        <p className="font-bold">{t("offlineDataLayer.howToUseLabel")}</p>

        <p className="mt-2">{t("offlineDataLayer.storageHowToUseText")}</p>

        <div className="mt-4">
          <Button
            type="primary"
            onClick={requestPermissionStorage}
            disabled={permissionStorage.status || !isSupported}
            className="w-fit"
          >
            {permissionStorage.status ? (
              <>
                <DatabaseZapIcon className="w-5 h-5" />
                {t("offlineDataLayer.storageActiveButton")}
              </>
            ) : (
              <>
                <DatabaseSearchIcon className="w-5 h-5" />
                {t("offlineDataLayer.storageRequestButton")}
              </>
            )}
          </Button>

          {!isSupported && (
            <p className="text-sm text-amber-600">
              {t("offlineDataLayer.storageUnsupportedMessage")}
            </p>
          )}

          {isSupported && permissionStorage.requested && !permissionStorage.status && (
            <p className="text-sm text-amber-600">
              {t("offlineDataLayer.storageDeniedMessage")}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 p-4 border rounded-lg">
        <p className="text-sm text-gray-600 mb-3">
          {t("offlineDataLayer.storageInfoTitle")}
        </p>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>
            <strong>{t("offlineDataLayer.storagePersistentLabel")}</strong>{" "}
            {permissionStorage.status
              ? t("offlineDataLayer.storageYes")
              : t("offlineDataLayer.storageNo")}
          </li>
          <li>
            <strong>{t("offlineDataLayer.storageUsedLabel")}</strong>{" "}
            {permissionStorage.usage}
          </li>
          <li>
            <strong>{t("offlineDataLayer.storageQuotaLabel")}</strong>{" "}
            {permissionStorage.quota}
          </li>
        </ul>
      </div>

      <div className="mt-4 p-4 border rounded-lg">
        <p className="text-sm text-gray-600 mb-3">
          {t("offlineDataLayer.methodsTitle")}
        </p>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>{t.rich("offlineDataLayer.storageMethod1", renderHtmlText)}</li>
          <li>{t.rich("offlineDataLayer.storageMethod2", renderHtmlText)}</li>
          <li>{t.rich("offlineDataLayer.storageMethod3", renderHtmlText)}</li>
        </ul>
      </div>
    </div>
  );
};
