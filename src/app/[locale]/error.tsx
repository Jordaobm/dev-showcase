"use client";

import { useEffect } from "react";
import { Link } from "@/i18n/navigation";
import { motion } from "motion/react";
import { AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/features/shared/components/Button";
import { GLOBAL_ERROR_DIAGNOSTIC_MESSAGE } from "./errorDiagnosticMessage";

const ErrorPage = ({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) => {
  const t = useTranslations();

  useEffect(() => {
    console.error(error);
  }, [error]);

  if (error.message === GLOBAL_ERROR_DIAGNOSTIC_MESSAGE) {
    throw error;
  }

  return (
    <div className="showroom-environment min-h-screen flex items-center justify-center p-6">
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-[32px] p-12 md:p-16 text-center max-w-lg w-full"
        style={{
          background:
            "linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(249, 250, 251, 0.8))",
          border: "1px solid rgba(220, 38, 38, 0.15)",
          boxShadow:
            "0 8px 32px rgba(0, 0, 0, 0.08), inset 0 2px 0 rgba(255, 255, 255, 1)",
        }}
      >
        <motion.div
          className="inline-flex p-6 rounded-3xl mb-8"
          style={{
            background: "white",
            boxShadow:
              "0 8px 24px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 1)",
          }}
          animate={{ rotate: [0, -5, 5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <AlertTriangle className="w-12 h-12" style={{ color: "#DC2626" }} />
        </motion.div>

        <h1 className="text-3xl mb-3 font-semibold">{t("shared.error.title")}</h1>
        <p className="text-lg text-gray-500 max-w-md mx-auto leading-relaxed mb-8">
          {t("shared.error.description")}
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Button type="primary" onClick={reset}>
            {t("shared.error.retry")}
          </Button>
          <Link
            href="/"
            className="px-5 py-2.5 rounded-2xl text-sm font-medium text-gray-700 transition-all hover:scale-105"
            style={{
              background: "rgba(255, 255, 255, 0.7)",
              border: "1px solid rgba(0, 0, 0, 0.06)",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
            }}
          >
            {t("shared.error.backHome")}
          </Link>
        </div>
      </motion.main>
    </div>
  );
};

export default ErrorPage;
