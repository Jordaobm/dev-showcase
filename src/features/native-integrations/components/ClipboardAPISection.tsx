"use client";

import { renderHtmlText } from "@/features/shared/utils/renderHtmlText";
import { ArrowRight, Check, ClipboardPaste, Copy } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

export const ClipboardAPISection = () => {
  const t = useTranslations();
  const [textarea, setTextarea] = useState({
    textarea1: t("nativeIntegrations.clipboardInitialText"),
    textarea2: "",
  });
  const [copied, setCopied] = useState(false);
  const [pasted, setPasted] = useState(false);
  const [unavailable, setUnavailable] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(textarea.textarea1);
      setCopied(true);
      setUnavailable(false);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setUnavailable(true);
    }
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setTextarea((prev) => ({ ...prev, textarea2: text }));
      setPasted(true);
      setUnavailable(false);
      setTimeout(() => setPasted(false), 2000);
    } catch {
      setUnavailable(true);
    }
  };

  return (
    <div id="pwa-clipboard-api" className="mt-12">
      <h3 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
        {t("nativeIntegrations.clipboardSectionTitle")}
      </h3>

      <div className="text-gray-600">
        <p>{t.rich("nativeIntegrations.clipboardDesc1", renderHtmlText)}</p>
        <br />
        <p>{t.rich("nativeIntegrations.clipboardDesc2", renderHtmlText)}</p>
        <br />
        <p>{t("nativeIntegrations.clipboardUseCasesIntro")}</p>
        <br />
        <ul className="space-y-1 list-disc list-inside">
          <li>{t("nativeIntegrations.clipboardUseCasesItem1")}</li>
          <li>{t("nativeIntegrations.clipboardUseCasesItem2")}</li>
          <li>{t("nativeIntegrations.clipboardUseCasesItem3")}</li>
          <li>{t("nativeIntegrations.clipboardUseCasesItem4")}</li>
        </ul>
        <br />
        <p>{t("nativeIntegrations.clipboardExampleNote")}</p>
        <br />
        <p>{t("nativeIntegrations.clipboardValueNote")}</p>
      </div>

      <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded text-sm text-amber-900">
        <p className="font-bold">{t("nativeIntegrations.howToUseLabel")}</p>
        <p className="mt-2">{t("nativeIntegrations.clipboardHowToUseIntro")}</p>

        <div className="mt-4">
          <div className="flex flex-col md:flex-row mt-4 gap-4 items-start">
            <div className="w-full flex-1 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  {t("nativeIntegrations.clipboardCopyLabel")}
                </span>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600 font-medium cursor-pointer"
                >
                  {copied ? (
                    <Check size={14} className="text-green-600" />
                  ) : (
                    <Copy size={14} />
                  )}
                  {copied
                    ? t("nativeIntegrations.clipboardCopiedButton")
                    : t("nativeIntegrations.clipboardCopyButton")}
                </button>
              </div>
              <textarea
                aria-label={t("nativeIntegrations.clipboardCopyLabel")}
                className="w-full h-40 resize-none p-4 bg-white border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:border-[var(--premium-red)] transition-all duration-300 text-sm text-gray-700"
                value={textarea.textarea1}
                onChange={(e) =>
                  setTextarea((prev) => ({
                    ...prev,
                    textarea1: e.target.value,
                  }))
                }
              />
            </div>

            <div className="hidden md:flex items-center pt-10 text-gray-400">
              <ArrowRight size={20} />
            </div>

            <div className="w-full flex-1 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  {t("nativeIntegrations.clipboardPasteLabel")}
                </span>
                <button
                  onClick={pasteFromClipboard}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600 font-medium cursor-pointer"
                >
                  {pasted ? (
                    <Check size={14} className="text-green-600" />
                  ) : (
                    <ClipboardPaste size={14} />
                  )}
                  {pasted
                    ? t("nativeIntegrations.clipboardPastedButton")
                    : t("nativeIntegrations.clipboardPasteButton")}
                </button>
              </div>
              <textarea
                aria-label={t("nativeIntegrations.clipboardPasteLabel")}
                className="w-full h-40 resize-none p-4 bg-white border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:border-[var(--premium-red)] transition-all duration-300 text-sm text-gray-700"
                value={textarea.textarea2}
                onChange={(e) =>
                  setTextarea((prev) => ({
                    ...prev,
                    textarea2: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          {unavailable && (
            <p className="mt-3 text-sm text-amber-700">
              {t("nativeIntegrations.clipboardUnavailableMessage")}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 p-4 border rounded-lg">
        <p className="text-sm text-gray-600 mb-3">
          {t("nativeIntegrations.methodsTitle")}
        </p>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>{t.rich("nativeIntegrations.clipboardMethod1", renderHtmlText)}</li>
          <li>{t.rich("nativeIntegrations.clipboardMethod2", renderHtmlText)}</li>
        </ul>
      </div>
    </div>
  );
};
