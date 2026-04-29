"use client";

import { Button } from "@/features/shared/components/Button";
import { renderHtmlText } from "@/features/shared/utils/renderHtmlText";
import { Bell, BellPlus, BellRing, Send } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { usePushSubscription } from "../hooks/usePushSubscription";

export const PushNotificationsSection = () => {
  const t = useTranslations();
  const [permissionNotification, setPermissionNotification] =
    useState<NotificationPermission>("default");

  useEffect(() => {
    if (typeof Notification !== "undefined") {
      setPermissionNotification(Notification.permission);
    }
  }, []);

  const {
    subscription,
    isSupported,
    isSubscribing,
    isSending,
    subscribeError,
    sendError,
    subscribe,
    sendTestNotification,
  } = usePushSubscription();

  const requestPermission = () => {
    if (typeof Notification === "undefined") return;
    Notification.requestPermission().then(setPermissionNotification);
  };

  return (
    <div id="pwa-notifications" className="mt-12">
      <h3 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
        {t("pushNotifications.sectionTitle")}
      </h3>

      <div className="text-gray-600">
        <p>{t.rich("pushNotifications.desc1", renderHtmlText)}</p>
        <br />
        <p>{t("pushNotifications.desc2")}</p>
        <br />
        <p>{t("pushNotifications.canDoIntro")}</p>
        <br />
        <ul className="space-y-1 list-disc list-inside">
          <li>{t("pushNotifications.canDoItem1")}</li>
          <li>{t("pushNotifications.canDoItem2")}</li>
          <li>{t("pushNotifications.canDoItem3")}</li>
          <li>{t("pushNotifications.canDoItem4")}</li>
          <li>{t("pushNotifications.canDoItem5")}</li>
        </ul>
        <br />
        <p>{t("pushNotifications.pwaNote")}</p>
        <br />
        <p>{t.rich("pushNotifications.whyItWorksDesc", renderHtmlText)}</p>
        <br />
        <p>{t("pushNotifications.valueNote")}</p>
      </div>

      <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded text-sm text-amber-900">
        <p className="leading-relaxed">
          {t.rich("pushNotifications.demoWarning", renderHtmlText)}
        </p>

        <p className="mt-4 font-bold">{t("pushNotifications.howToUseLabel")}</p>

        <p className="mt-2">{t("pushNotifications.howToUseIntro")}</p>

        <br />

        <ul className="space-y-1 list-disc list-inside">
          <li>{t.rich("pushNotifications.step1", renderHtmlText)}</li>
          <li>{t.rich("pushNotifications.step2", renderHtmlText)}</li>
          <li>{t.rich("pushNotifications.step3", renderHtmlText)}</li>
        </ul>

        <br />

        {!isSupported && (
          <p className="mb-4 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
            {t("pushNotifications.unsupportedMessage")}
          </p>
        )}

        <p>{t("pushNotifications.permissionIntro")}</p>

        <div className="mt-4">
          <Button
            type="primary"
            onClick={requestPermission}
            disabled={permissionNotification === "granted" || !isSupported}
            className="w-full sm:w-auto"
          >
            {permissionNotification === "granted" ? (
              <>
                <BellRing className="w-5 h-5" />
                {t("pushNotifications.permissionGrantedButton")}
              </>
            ) : (
              <>
                <Bell className="w-5 h-5" />
                {t("pushNotifications.permissionRequestButton")}
              </>
            )}
          </Button>
        </div>

        {permissionNotification === "denied" && (
          <p className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {t("pushNotifications.permissionDeniedMessage")}
          </p>
        )}

        <p className="mt-4">{t("pushNotifications.subscribeIntro")}</p>

        <div className="mt-4">
          <Button
            type="primary"
            onClick={subscribe}
            disabled={!isSupported || isSubscribing}
            className="w-full sm:w-auto"
          >
            <BellPlus className="w-5 h-5" />
            {isSubscribing
              ? t("pushNotifications.subscribingButton")
              : t("pushNotifications.subscribeButton")}
          </Button>
        </div>

        {subscribeError && (
          <p className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {t("pushNotifications.subscribeErrorMessage")}
          </p>
        )}

        <p className="mt-4">{t("pushNotifications.sendIntro")}</p>

        <div className="mt-4">
          <Button
            type="primary"
            onClick={sendTestNotification}
            disabled={!subscription || isSending}
            className="w-full sm:w-auto"
          >
            <Send className="w-5 h-5" />
            {isSending
              ? t("pushNotifications.sendingButton")
              : t("pushNotifications.sendButton")}
          </Button>
        </div>

        {sendError && (
          <p className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {t("pushNotifications.sendErrorMessage")}
          </p>
        )}
      </div>

      <div className="mt-4 p-4 border rounded-lg">
        <p className="text-sm text-gray-600 mb-3">
          {t("pushNotifications.methodsTitle")}
        </p>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>{t.rich("pushNotifications.method1", renderHtmlText)}</li>
          <li>{t.rich("pushNotifications.method2", renderHtmlText)}</li>
          <li>{t.rich("pushNotifications.method3", renderHtmlText)}</li>
          <li>{t.rich("pushNotifications.method4", renderHtmlText)}</li>
          <li>{t.rich("pushNotifications.method5", renderHtmlText)}</li>
          <li>{t.rich("pushNotifications.method6", renderHtmlText)}</li>
          <li>{t.rich("pushNotifications.method7", renderHtmlText)}</li>
        </ul>
      </div>
    </div>
  );
};
