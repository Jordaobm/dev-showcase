"use client";

import { Button } from "@/features/shared/components/Button";
import { useMutation } from "@tanstack/react-query";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Download,
  Fingerprint,
  Info,
  KeyRound,
  Loader2,
  QrCode,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useQRCode } from "next-qrcode";
import { useState } from "react";
import { generateQRCode, resetTOTP, validateQRCode } from "../services/api";
import { AxiosResponse } from "axios";
import { useSession } from "../hooks/useSession";
import { extractSecret } from "@/features/shared/utils/extractSecret";
import { renderHtmlText } from "@/features/shared/utils/renderHtmlText";
import type { OperationStatus } from "../types/OperationStatus";
import { AuthenticacaoAnchorLink } from "./AuthenticacaoAnchorLink";
import { FlowStepsGrid } from "./FlowStepsGrid";

const SECRET_ID_KEY = `secret_id_key`;
type ValidationMode = "totp" | "backup";

export const TOTPSection = () => {
  const t = useTranslations();
  const { isLoggedIn } = useSession();
  const { Image } = useQRCode();

  const [authStatus, setAuthStatus] = useState<OperationStatus>("idle");
  const [validateStatus, setValidateStatus] = useState<OperationStatus>("idle");
  const [resetStatus, setResetStatus] = useState<OperationStatus>("idle");
  const [inputCode, setInputCode] = useState("");
  const [validationMode, setValidationMode] = useState<ValidationMode>("totp");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const { mutateAsync: generateQRCodeMutate, data: qrCode } = useMutation({
    mutationFn: generateQRCode,
  });

  const { mutateAsync: validateQRCodeMutate } = useMutation<
    unknown,
    AxiosResponse,
    { token: string; id: number; type: ValidationMode }
  >({
    mutationFn: validateQRCode,
  });

  const { mutateAsync: resetTOTPMutate } = useMutation({
    mutationFn: resetTOTP,
  });

  const handleGenerateQRCode = async () => {
    try {
      setAuthStatus("loading");
      const response = await generateQRCodeMutate();
      localStorage.setItem(SECRET_ID_KEY, response?.data?.id);
      setAuthStatus("success");
    } catch {
      setAuthStatus("error");
    }
  };

  const handleResetAndRegenerate = async () => {
    try {
      setResetStatus("loading");
      await resetTOTPMutate();
      setValidateStatus("idle");
      setInputCode("");
      setResetStatus("idle");
      document
        .getElementById("totp-step-2")
        ?.scrollIntoView({ behavior: "smooth" });
      await handleGenerateQRCode();
    } catch {
      setResetStatus("error");
    }
  };

  const handleValidateCode = async () => {
    try {
      setValidateStatus("loading");
      const id = localStorage.getItem(SECRET_ID_KEY);
      await validateQRCodeMutate({
        token: inputCode,
        id: Number(id),
        type: validationMode,
      });
      setValidateStatus("success");
      if (validationMode === "backup") setInputCode("");
    } catch {
      setValidateStatus("error");
    }
  };

  const handleTOTPInput = (value: string) => {
    setInputCode(value.replace(/\D/g, "").slice(0, 6));
  };

  const handleBackupCodeInput = (value: string) => {
    const digits = value
      .replace(/[^A-Fa-f0-9]/g, "")
      .toUpperCase()
      .slice(0, 8);
    setInputCode(
      digits.length > 4 ? `${digits.slice(0, 4)}-${digits.slice(4)}` : digits,
    );
  };

  const copyCode = async (code: string, index: number) => {
    await navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const copyAllCodes = async () => {
    const codes: string[] = qrCode?.data?.backupCodes ?? [];
    await navigator.clipboard.writeText(codes.join("\n"));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 1500);
  };

  const downloadCodes = () => {
    const codes: string[] = qrCode?.data?.backupCodes ?? [];
    if (!codes.length) return;
    const lines = [
      t("auth.totpDownloadFileHeader"),
      "",
      ...codes.map((c, i) => `${i + 1}. ${c}`),
      "",
      t("auth.totpDownloadFileFooter1"),
      t("auth.totpDownloadFileFooter2"),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "backup-codes-2fa.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const switchMode = (mode: ValidationMode) => {
    setValidationMode(mode);
    setInputCode("");
    setValidateStatus("idle");
  };

  const isValidateDisabled =
    validateStatus === "loading" ||
    !isLoggedIn ||
    (validationMode === "totp"
      ? inputCode.length !== 6
      : inputCode.length !== 9);

  const secret =
    authStatus === "success" && qrCode?.data?.qrCode
      ? extractSecret(qrCode.data.qrCode)
      : null;

  return (
    <div id="totp" className="mt-12">
      <h3 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
        {t("auth.totpTitle")}
      </h3>

      <div className="mt-4 space-y-6 text-gray-600 text-base leading-relaxed">
        <div>
          <p>{t.rich("auth.totpDesc1", renderHtmlText)}</p>
          <p className="mt-2">{t("auth.totpDesc2")}</p>
        </div>

        <div>
          <p className="font-semibold text-gray-600 mb-3">{t("auth.totpWhyTitle")}</p>
          <p className="mb-3 text-gray-500">{t.rich("auth.totpWhyDesc", renderHtmlText)}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <p className="font-semibold text-gray-700 mb-2 text-xs">{t("auth.totpKnowTitle")}</p>
              <ul className="space-y-2 text-xs text-gray-600">
                <li className="flex gap-2">
                  <span className="shrink-0 text-gray-400">—</span>
                  <span>{t("auth.totpKnowItem1")}</span>
                </li>
                <li className="flex gap-2">
                  <span className="shrink-0 text-gray-400">—</span>
                  <span>{t("auth.totpKnowItem2")}</span>
                </li>
                <li className="flex gap-2">
                  <span className="shrink-0 text-gray-400">—</span>
                  <span>{t("auth.totpKnowItem3")}</span>
                </li>
              </ul>
            </div>
            <div className="p-4 border border-green-200 rounded-lg bg-green-50">
              <p className="font-semibold text-green-700 mb-2 text-xs">{t("auth.totpHaveTitle")}</p>
              <ul className="space-y-2 text-xs text-green-800">
                <li className="flex gap-2">
                  <span className="shrink-0 text-green-400">—</span>
                  <span>{t("auth.totpHaveItem1")}</span>
                </li>
                <li className="flex gap-2">
                  <span className="shrink-0 text-green-400">—</span>
                  <span>{t.rich("auth.totpHaveItem2", renderHtmlText)}</span>
                </li>
                <li className="flex gap-2">
                  <span className="shrink-0 text-green-400">—</span>
                  <span>{t("auth.totpHaveItem3")}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div>
          <p className="font-semibold text-gray-600 mb-3">{t("auth.totpHowTitle")}</p>
          <p className="mb-3 text-gray-500">{t.rich("auth.totpHowDesc", renderHtmlText)}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
            <p className="font-semibold text-blue-700 mb-2 text-xs">{t("auth.totpQrTitle")}</p>
            <p className="text-xs text-blue-800 mb-2">{t.rich("auth.totpQrDesc1", renderHtmlText)}</p>
            <p className="text-xs text-blue-700">{t("auth.totpQrDesc2")}</p>
          </div>
          <div className="p-4 border border-orange-200 rounded-lg bg-orange-50">
            <p className="font-semibold text-orange-700 mb-2 text-xs">{t("auth.totpBackupTitle")}</p>
            <p className="text-xs text-orange-800 mb-2">
              {t.rich("auth.totpBackupDesc1", renderHtmlText)}
            </p>
            <p className="text-xs text-orange-700">{t.rich("auth.totpBackupDesc2", renderHtmlText)}</p>
          </div>
        </div>

        <div>
          <p className="font-semibold text-gray-600 mb-3">{t("auth.totpFlowTitle")}</p>
          <FlowStepsGrid
            columns={[
              {
                label: t("auth.totpFlowEnableLabel"),
                variant: "neutral",
                steps: [
                  t("auth.totpFlowEnableStep1"),
                  t("auth.totpFlowEnableStep2"),
                  t("auth.totpFlowEnableStep3"),
                  t("auth.totpFlowEnableStep4"),
                  t("auth.totpFlowEnableStep5"),
                  t("auth.totpFlowEnableStep6"),
                ],
              },
              {
                label: t("auth.totpFlowLoginLabel"),
                variant: "highlight",
                steps: [
                  t("auth.totpFlowLoginStep1"),
                  t("auth.totpFlowLoginStep2"),
                  t("auth.totpFlowLoginStep3"),
                  t("auth.totpFlowLoginStep4"),
                ],
              },
            ]}
          />
        </div>
      </div>

      <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded text-sm text-amber-900">
        <div className="p-4 bg-amber-50 border border-amber-200 rounded text-sm text-amber-900">
          <div className="flex items-start gap-2">
            <Info className="mt-1 shrink-0" />
            <p className="text-sm leading-relaxed">
              {t.rich("auth.totpDemoWarning", renderHtmlText)}
            </p>
          </div>
        </div>

        <p className="mt-3 font-bold">{t("auth.howItWorksLabel")}</p>
        <p className="mt-1 text-xs text-amber-700">{t("auth.totpDemoHint")}</p>

        <div className="mt-4">
          <p className="font-semibold text-amber-800">{t("auth.totpStep1Title")}</p>
          <p className="mt-1 text-xs text-amber-700">
            {t.rich("auth.totpStep1Desc", {
              ...renderHtmlText,
              a: (chunks) => <AuthenticacaoAnchorLink chunks={chunks} />,
            })}
          </p>
          <div className="mt-3">
            {isLoggedIn ? (
              <Button
                type="primary"
                className="w-full"
                disabled={isLoggedIn}
                customStyle={{
                  background: "linear-gradient(135deg, #44dc26, #29b91c)",
                  boxShadow:
                    "0 4px 16px rgba(53, 220, 38, 0.3), 0 0 20px rgba(38, 220, 62, 0.15)",
                }}
              >
                <Fingerprint className="w-4 h-4" />
                {t("auth.totpAlreadyLoggedIn")}
              </Button>
            ) : (
              <a href="#autenticacao">
                <Button type="primary" className="w-full">
                  <Fingerprint className="w-4 h-4" />
                  {t("auth.totpGoToLoginButton")}
                </Button>
              </a>
            )}
          </div>
        </div>

        <div id="totp-step-2" className="mt-6">
          <p className="font-semibold text-amber-800">{t("auth.totpStep2Title")}</p>
          <p className="mt-1 text-xs text-amber-700">
            {t.rich("auth.totpStep2Desc", renderHtmlText)}
          </p>

          <div className="mt-3">
            <Button
              type="primary"
              onClick={handleGenerateQRCode}
              disabled={authStatus === "loading" || !isLoggedIn}
              className="w-full"
            >
              {authStatus === "loading" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t("auth.totpGeneratingButton")}
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  {t("auth.totpGenerateButton")}
                </>
              )}
            </Button>
          </div>

          <div className="mt-3 p-4 border rounded-lg bg-white">
            {authStatus === "idle" && (
              <div className="flex flex-col items-center py-6 text-gray-400">
                <QrCode className="w-8 h-8 mb-2 opacity-30" />
                <p className="text-xs">{t("auth.totpIdleHint")}</p>
              </div>
            )}

            {authStatus === "error" && (
              <div className="flex items-start gap-3 p-3 border border-orange-200 bg-orange-50 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-orange-800">
                    {t("auth.totpAlreadyConfiguredTitle")}
                  </p>
                  <p className="text-xs text-orange-700 mt-0.5">
                    {t.rich("auth.totpAlreadyConfiguredDesc", renderHtmlText)}
                  </p>
                </div>
              </div>
            )}

            {authStatus === "success" && (
              <>
                <div className="flex items-start gap-2 mb-4 p-2.5 bg-red-50 border border-red-200 rounded-lg">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-700">
                    {t.rich("auth.totpOneTimeWarning", renderHtmlText)}
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="flex flex-col items-center p-3 border rounded-lg bg-gray-50">
                    <div className="flex items-center gap-2 mb-1 self-start">
                      <QrCode className="w-4 h-4 text-gray-500" />
                      <p className="text-sm font-semibold text-gray-700">
                        {t("auth.totpQrPanelTitle")}
                      </p>
                    </div>
                    <p className="text-xs text-gray-400 mb-3 self-start">
                      {t("auth.totpQrPanelHint")}
                    </p>
                    {/* eslint-disable-next-line jsx-a11y/alt-text */}
                    <Image
                      text={qrCode?.data?.qrCode}
                      options={{
                        type: "image/jpeg",
                        quality: 0.3,
                        errorCorrectionLevel: "M",
                        margin: 3,
                        scale: 4,
                        width: 200,
                        color: { dark: "#000000", light: "#ffffff" },
                      }}
                    />
                    {secret && (
                      <div className="mt-3 w-full">
                        <p className="text-[10px] text-gray-400 mb-1">
                          {t("auth.totpManualEntryHint")}
                        </p>
                        <div className="p-2 bg-white border rounded text-[11px] font-mono text-gray-600 break-all tracking-wider select-all cursor-text">
                          {secret}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-3 border border-orange-200 rounded-lg bg-orange-50">
                    <div className="flex items-center gap-2 mb-3">
                      <KeyRound className="w-4 h-4 text-orange-600" />
                      <p className="text-sm font-semibold text-orange-800">
                        {t("auth.totpBackupPanelTitle")}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {qrCode?.data?.backupCodes?.map(
                        (code: string, i: number) => (
                          <button
                            key={code}
                            onClick={() => copyCode(code, i)}
                            className="flex items-center gap-1 p-1.5 bg-white border border-orange-100 rounded text-[11px] font-mono hover:border-orange-300 transition-colors group"
                            title={t("auth.totpCopyTooltip")}
                          >
                            <span className="text-gray-300 text-[10px] w-4 shrink-0 text-right">
                              {i + 1}.
                            </span>
                            <span className="flex-1 text-gray-700 tracking-wider">
                              {code}
                            </span>
                            {copiedIndex === i ? (
                              <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0" />
                            ) : (
                              <Copy className="w-3 h-3 text-gray-300 group-hover:text-orange-400 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}
                          </button>
                        ),
                      )}
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={copyAllCodes}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white border border-orange-200 rounded text-xs text-orange-700 hover:bg-orange-100 transition-colors"
                      >
                        {copiedAll ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-green-500" />
                            {t("auth.totpCopiedLabel")}
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            {t("auth.totpCopyAllButton")}
                          </>
                        )}
                      </button>
                      <button
                        onClick={downloadCodes}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-orange-600 text-white rounded text-xs hover:bg-orange-700 transition-colors"
                      >
                        <Download className="w-3 h-3" />
                        {t("auth.totpDownloadButton")}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mt-6">
          <p className="font-semibold text-amber-800">{t("auth.totpStep3Title")}</p>
          <p className="mt-1 text-xs text-amber-700">{t("auth.totpStep3Desc")}</p>

          <div className="mt-3 p-4 border rounded-lg bg-white">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-gray-400" />
              <p className="text-sm font-semibold text-gray-700">
                {t("auth.totpValidatePanelTitle")}
              </p>
            </div>

            <div className="flex gap-1.5 mb-4">
              <button
                onClick={() => switchMode("totp")}
                className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  validationMode === "totp"
                    ? "bg-gray-700 text-white"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {t("auth.totpModeAppLabel")}
              </button>
              <button
                onClick={() => switchMode("backup")}
                className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  validationMode === "backup"
                    ? "bg-orange-600 text-white"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {t("auth.totpModeBackupLabel")}
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <input
                  type={validationMode === "totp" ? "tel" : "text"}
                  inputMode={validationMode === "totp" ? "numeric" : "text"}
                  aria-label={
                    validationMode === "totp"
                      ? t("auth.totpModeAppLabel")
                      : t("auth.totpModeBackupLabel")
                  }
                  value={inputCode}
                  onChange={(e) =>
                    validationMode === "totp"
                      ? handleTOTPInput(e.target.value)
                      : handleBackupCodeInput(e.target.value)
                  }
                  placeholder={
                    validationMode === "totp" ? "123456" : "XXXX-XXXX"
                  }
                  maxLength={validationMode === "totp" ? 6 : 9}
                  className="w-full px-3 py-2 bg-white border-2 rounded-lg text-sm text-gray-700 font-mono tracking-widest focus:outline-none focus:border-red-400 transition-colors placeholder:text-gray-300 placeholder:font-mono placeholder:tracking-widest"
                />
                <p className="mt-1 text-[10px] text-gray-400">
                  {validationMode === "totp"
                    ? t("auth.totpDigitsCounter", { count: inputCode.length })
                    : t("auth.totpBackupFormatHint")}
                </p>
              </div>

              <Button
                type="secondary"
                onClick={handleValidateCode}
                disabled={isValidateDisabled}
                className="w-full"
              >
                {validateStatus === "loading" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t("auth.totpValidatingButton")}
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    {t("auth.totpVerifyButton")}
                  </>
                )}
              </Button>

              {validateStatus === "success" && validationMode === "totp" && (
                <div className="flex items-start gap-3 p-3 border border-green-200 rounded-lg bg-green-50">
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-green-800">
                      {t("auth.totpValidCodeTitle")}
                    </p>
                    <p className="text-xs text-green-700 mt-0.5">{t("auth.totpValidCodeDesc")}</p>
                  </div>
                </div>
              )}

              {validateStatus === "success" && validationMode === "backup" && (
                <div className="space-y-2">
                  <div className="flex items-start gap-3 p-3 border border-green-200 rounded-lg bg-green-50">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-green-800">
                        {t("auth.totpBackupAcceptedTitle")}
                      </p>
                      <p className="text-xs text-green-700 mt-0.5">
                        {t("auth.totpBackupAcceptedDesc")}
                      </p>
                    </div>
                  </div>
                  <div className="p-3 border border-blue-200 rounded-lg bg-blue-50 space-y-3">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-blue-800">
                          {t("auth.totpReconfigureTitle")}
                        </p>
                        <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                          {t.rich("auth.totpReconfigureDesc", renderHtmlText)}
                        </p>
                      </div>
                    </div>
                    <Button
                      customStyle={{
                        background: "linear-gradient(135deg, #2657dc, #1c65b9)",
                        boxShadow:
                          "0 4px 16px rgba(38, 111, 220, 0.3), 0 0 20px rgba(38, 123, 220, 0.15)",
                      }}
                      type="primary"
                      onClick={handleResetAndRegenerate}
                      disabled={resetStatus === "loading"}
                      className="w-full"
                    >
                      {resetStatus === "loading" ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {t("auth.totpReconfiguringButton")}
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          {t("auth.totpReconfigureButton")}
                        </>
                      )}
                    </Button>
                    {resetStatus === "error" && (
                      <p className="text-xs text-red-600">{t("auth.totpReconfigureError")}</p>
                    )}
                  </div>
                </div>
              )}

              {validateStatus === "error" && (
                <div className="space-y-2">
                  <div className="flex items-start gap-3 p-3 border border-red-200 rounded-lg bg-red-50">
                    <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-red-800">
                        {validationMode === "totp"
                          ? t("auth.totpInvalidCodeTitle")
                          : t("auth.totpInvalidBackupTitle")}
                      </p>
                      <p className="text-xs text-red-700 mt-0.5">
                        {validationMode === "totp"
                          ? t("auth.totpInvalidCodeDesc")
                          : t("auth.totpInvalidBackupDesc")}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4"></div>
    </div>
  );
};
