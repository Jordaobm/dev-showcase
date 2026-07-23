"use client";

import { useTranslations } from "next-intl";
import { Clock, Home, RotateCw, Wifi, WifiOff, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import { formatTime } from "@/features/shared/utils/formatDate";
import { Button } from "@/features/shared/components/Button";

interface StatusApplicationProps {
  headingLevel?: "h1" | "h4";
}

export const StatusApplication = ({
  headingLevel = "h4",
}: Readonly<StatusApplicationProps>) => {
  const t = useTranslations();
  const { isOnline, timeOffline, timeOnline } = useOnlineStatus();
  const Heading = headingLevel;
  const SubHeading = headingLevel === "h1" ? "h2" : "h3";

  return (
    <div className="mt-16">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
        className="flex justify-center mb-6"
      >
        <div className="relative">
          <motion.div
            animate={{ rotate: [0, -5, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center"
              style={{
                background: isOnline
                  ? "linear-gradient(135deg, #26dc26, #1cb91c)"
                  : "linear-gradient(135deg, #DC2626, #B91C1C)",
                boxShadow: isOnline
                  ? "0 8px 24px rgba(68, 220, 38, 0.3)"
                  : "0 8px 24px rgba(220, 38, 38, 0.3)",
              }}
            >
              {isOnline ? (
                <Wifi className="w-10 h-10 text-white" />
              ) : (
                <WifiOff className="w-10 h-10 text-white" />
              )}
            </div>
          </motion.div>

          <motion.div
            animate={{ scale: [1, 1.3], opacity: [1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute inset-0 rounded-2xl"
            style={{
              border: isOnline
                ? "2px solid rgba(38, 220, 38, 0.5)"
                : "2px solid rgba(220, 38, 38, 0.5)",
            }}
          />
        </div>
      </motion.div>

      <div className="text-center space-y-3 mb-8">
        <Heading
          className={
            isOnline
              ? "text-3xl font-bold bg-gradient-to-r from-green-500 to-green-400 bg-clip-text text-transparent"
              : "text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent"
          }
        >
          {isOnline
            ? t("pwaCore.statusAppOnlineHeading")
            : t("pwaCore.statusAppOfflineHeading")}
        </Heading>
        <p className="text-gray-600">
          {isOnline
            ? t("pwaCore.statusAppOnlineMessage")
            : t("pwaCore.statusAppOfflineMessage")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div
          className="p-4 rounded-xl"
          style={{
            background: isOnline
              ? "rgba(38, 220, 47, 0.08)"
              : "rgba(220, 38, 38, 0.08)",
            border: isOnline
              ? "1px solid rgba(38, 220, 38, 0.15)"
              : "1px solid rgba(220, 38, 38, 0.15)",
          }}
        >
          <div className="flex items-center gap-3">
            {isOnline ? (
              <Wifi className="w-5 h-5 text-green-600 flex-shrink-0" />
            ) : (
              <WifiOff className="w-5 h-5 text-red-600 flex-shrink-0" />
            )}
            <div>
              <p className="text-sm font-medium text-gray-900">
                {t("pwaCore.statusAppConnectionLabel")}
              </p>
              <p className="text-xs text-gray-600">
                {isOnline
                  ? t("pwaCore.statusAppConnected")
                  : t("pwaCore.statusAppDisconnected")}
              </p>
            </div>
          </div>
        </div>

        <div
          className="p-4 rounded-xl"
          style={{
            background: isOnline
              ? "rgba(38, 220, 47, 0.08)"
              : "rgba(220, 38, 38, 0.08)",
            border: isOnline
              ? "1px solid rgba(38, 220, 38, 0.15)"
              : "1px solid rgba(220, 38, 38, 0.15)",
          }}
        >
          <div className="flex items-center gap-3">
            <Clock
              className={`w-5 h-5 flex-shrink-0 ${isOnline ? "text-green-600" : "text-red-600"}`}
            />
            <div>
              <p className="text-sm font-medium text-gray-900">
                {isOnline
                  ? t("pwaCore.statusAppOnlineDuration")
                  : t("pwaCore.statusAppOfflineDuration")}
              </p>
              <p className="text-xs text-gray-600">
                {formatTime(isOnline ? timeOnline : timeOffline)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div
        className="p-6 rounded-xl border mb-8"
        style={{
          background: "rgba(255, 255, 255, 0.6)",
          border: "1px solid rgba(0, 0, 0, 0.06)",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
        }}
      >
        <SubHeading className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-500" />
          {t("pwaCore.statusAppWhatYouCanDo")}
        </SubHeading>

        <ul className="space-y-3">
          <li className="flex gap-3 items-start">
            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="w-2 h-2 bg-white rounded-full" />
            </div>
            <span className="text-sm text-gray-700">
              {t("pwaCore.statusAppActionHomepage")}
            </span>
          </li>
          <li className="flex gap-3 items-start">
            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="w-2 h-2 bg-white rounded-full" />
            </div>
            <span className="text-sm text-gray-700">
              {t("pwaCore.statusAppActionVisitedDemos")}
            </span>
          </li>
          <li className="flex gap-3 items-start">
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${isOnline ? "bg-green-500" : "bg-gray-300"}`}
            >
              <span className="w-2 h-2 bg-white rounded-full" />
            </div>
            <span
              className={`text-sm ${isOnline ? "text-gray-700" : "text-gray-500"}`}
            >
              {t("pwaCore.statusAppActionRealtimeApis")}
            </span>
          </li>
        </ul>
      </div>

      <div className="w-full flex flex-col sm:flex-row gap-3">
        <Button
          onClick={() => {
            if (isOnline) {
              location.reload();
            } else {
              window.history.back();
            }
          }}
          type="primary"
          className="flex-1 h-14"
        >
          <RotateCw className="w-5 h-5" />
          {t("pwaCore.statusAppContinueButton")}
        </Button>

        <Button
          onClick={() => (window.location.href = "/")}
          type="secondary"
          className="flex-1 h-14"
        >
          <Home className="w-5 h-5" />
          {t("pwaCore.statusAppHomeButton")}
        </Button>
      </div>

      <p className="text-center text-xs text-gray-500 mt-6 pt-6 border-t border-gray-200">
        {t("pwaCore.statusAppEstimateNote")}
      </p>
    </div>
  );
};
