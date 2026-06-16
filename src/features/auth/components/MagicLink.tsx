"use client";

import { Button } from "@/features/shared/components/Button";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AxiosError, AxiosResponse } from "axios";
import {
  CheckCircle2,
  Info,
  KeyRound,
  Mail,
  Server,
  ShieldCheck,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { login, sendMagicLink, UserData } from "../services/api";
import { renderHtmlText } from "@/features/shared/utils/renderHtmlText";
import type { OperationStatus } from "../types/OperationStatus";
import { AuthenticacaoAnchorLink } from "./AuthenticacaoAnchorLink";
import { FlowStepsGrid } from "./FlowStepsGrid";

export const MagicLinkSection = () => {
  const t = useTranslations();
  const searchParams = useSearchParams();

  const token = searchParams.get("token") || "";

  const [authStatus, setAuthStatus] = useState<OperationStatus>("idle");

  const [authData, setAuthData] = useState<UserData>({} as UserData);

  const { mutateAsync: sendMagicLinkMutate, status } = useMutation<
    AxiosResponse,
    AxiosError,
    { email: string }
  >({
    mutationFn: (data) => sendMagicLink(data),
  });

  const handleSendMagicLink = async () => {
    try {
      setAuthStatus("loading");
      await sendMagicLinkMutate({ email: authData?.email });
      setAuthStatus("success");
    } catch {
      setAuthStatus("error");
    }
  };

  const { data, isError, isFetching } = useQuery({
    queryKey: ["login", token],
    queryFn: () => login({ token }),
    enabled: !!token,
    retry: 0,
  });

  const emptyStateMessage = (kind: "credentials" | "token") => {
    if (isFetching) return t("auth.magicLinkValidating");
    if (isError) return t("auth.magicLinkExpiredOrUsed");
    return kind === "credentials"
      ? t("auth.magicLinkLoginToSeeCredentials")
      : t("auth.magicLinkLoginToSeeToken");
  };

  return (
    <div id="magiclink" className="mt-12">
      <h3 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
        {t("auth.magicLinkTitle")}
      </h3>
      <div className="mt-4 space-y-6 text-gray-600 text-base leading-relaxed">
        <div>
          <p>{t.rich("auth.magicLinkDesc1", renderHtmlText)}</p>
          <p className="mt-2">{t("auth.magicLinkDesc2")}</p>
        </div>

        <div>
          <p className="font-semibold text-gray-600 mb-3">
            {t("auth.magicLinkWhySectionTitle")}
          </p>
          <p className="mb-3 text-gray-500">{t("auth.magicLinkWhyIntro")}</p>
          <div className="grid grid-cols-1 grid-cols-1 gap-3">
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <ul className="space-y-2 text-xs text-gray-600">
                <li className="flex gap-2">
                  <span className="shrink-0 text-gray-400">—</span>
                  <span>{t("auth.magicLinkWhyItem1")}</span>
                </li>
                <li className="flex gap-2">
                  <span className="shrink-0 text-gray-400">—</span>
                  <span>{t("auth.magicLinkWhyItem2")}</span>
                </li>
                <li className="flex gap-2">
                  <span className="shrink-0 text-gray-400">—</span>
                  <span>{t("auth.magicLinkWhyItem3")}</span>
                </li>
                <li className="flex gap-2">
                  <span className="shrink-0 text-gray-400">—</span>
                  <span>{t("auth.magicLinkWhyItem4")}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div>
          <p className="font-semibold text-gray-600 mb-3">
            {t("auth.magicLinkHowSectionTitle")}
          </p>
          <p className="mb-3 text-gray-500">{t("auth.magicLinkHowDesc")}</p>
        </div>

        <div>
          <p className="font-semibold text-gray-600 mb-3">{t("auth.magicLinkFlowSectionTitle")}</p>
          <FlowStepsGrid
            columns={[
              {
                label: t("auth.magicLinkFlowPasswordLabel"),
                variant: "neutral",
                steps: [
                  t("auth.magicLinkFlowPasswordStep1"),
                  t("auth.magicLinkFlowPasswordStep2"),
                  t("auth.magicLinkFlowPasswordStep3"),
                  t("auth.magicLinkFlowPasswordStep4"),
                  t("auth.magicLinkFlowPasswordStep5"),
                  t("auth.magicLinkFlowPasswordStep6"),
                ],
              },
              {
                label: t("auth.magicLinkFlowMagicLabel"),
                variant: "highlight",
                steps: [
                  t("auth.magicLinkFlowMagicStep1"),
                  t("auth.magicLinkFlowMagicStep2"),
                  t("auth.magicLinkFlowMagicStep3"),
                  t("auth.magicLinkFlowMagicStep4"),
                  t("auth.magicLinkFlowMagicStep5"),
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
              {t.rich("auth.magicLinkDemoWarning", renderHtmlText)}
            </p>
          </div>
        </div>

        <p className="mt-3 font-bold">{t("auth.howItWorksLabel")}</p>
        <p className="mt-1 text-xs text-amber-700">{t("auth.magicLinkDemoHint")}</p>

        <div className="mt-4">
          <p className="font-semibold text-amber-800">{t("auth.magicLinkStep1Title")}</p>
          <p className="mt-1 text-xs text-amber-700">
            {t.rich("auth.magicLinkStep1Desc", {
              ...renderHtmlText,
              a: (chunks) => <AuthenticacaoAnchorLink chunks={chunks} />,
            })}
          </p>
          <div className="mt-3">
            <input
              type="email"
              aria-label={t("auth.magicLinkEmailFieldLabel")}
              value={authData?.email ?? ""}
              onChange={(e) =>
                setAuthData((prev) => ({ ...prev, email: e.target.value }))
              }
              placeholder={t("auth.magicLinkEmailPlaceholder")}
              className="w-full px-3 py-2 bg-white border-2 border-amber-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-red-400 transition-colors placeholder:text-gray-400"
            />

            <div className="mt-3">
              <Button
                type="primary"
                className="w-full"
                disabled={
                  authStatus === "loading" ||
                  authStatus === "success" ||
                  !authData?.email
                }
                onClick={handleSendMagicLink}
              >
                <Mail className="w-4 h-4" />

                {status === "pending"
                  ? t("auth.magicLinkSendingButton")
                  : t("auth.magicLinkSendButton")}
              </Button>
            </div>
          </div>
        </div>

        {authStatus === "success" && (
          <div className="mt-3 flex items-start gap-3 p-3 border border-green-200 rounded-lg bg-green-50">
            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-green-800">
                {t("auth.magicLinkSuccessTitle")}
              </p>
              <p className="text-xs text-green-700 mt-0.5">{t("auth.magicLinkSuccessDesc")}</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-start gap-2 p-3 border border-blue-200 rounded-lg bg-blue-50 text-xs text-blue-800">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <p>{t.rich("auth.magicLinkReplayWarning", renderHtmlText)}</p>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 border rounded-lg bg-gray-50">
          <div className="flex items-center gap-2 mb-1">
            <Server className="w-4 h-4 text-gray-400" />
            <p className="text-sm font-semibold text-gray-700">{t("auth.commonCredentialsLabel")}</p>
          </div>
          <p className="text-xs text-gray-400 mb-3">{t("auth.commonCredentialsHint")}</p>

          {!data?.data?.id ? (
            <p className="text-xs text-gray-400 italic">{emptyStateMessage("credentials")}</p>
          ) : (
            <ul className="space-y-2">
              <li className="flex items-start gap-2 p-2 bg-white border rounded text-xs">
                <KeyRound className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                <div className="min-w-0 space-y-1">
                  <p className="font-medium text-gray-700">
                    {t("auth.commonNameLabel")}{" "}
                    <span className="font-normal">
                      {data?.data?.user?.name}
                    </span>
                  </p>
                  <p className="text-gray-500">
                    {t("auth.commonEmailLabel")}{" "}
                    <span className="font-mono">{data?.data?.user?.email}</span>
                  </p>
                  <p className="text-gray-500">
                    {t("auth.commonCreatedAtLabel")}{" "}
                    <span className="font-mono text-[10px]">
                      {data?.data?.user?.createdAt ?? "—"}
                    </span>
                  </p>
                  <p className="text-gray-500">
                    {t("auth.commonIdLabel")}{" "}
                    <span className="font-mono">{data?.data?.user?.id}</span>
                  </p>
                </div>
              </li>
            </ul>
          )}
        </div>

        <div className="p-4 border rounded-lg bg-gray-50">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-4 h-4 text-gray-400" />
            <p className="text-sm font-semibold text-gray-700">{t("auth.magicLinkTokenPanelTitle")}</p>
          </div>
          <p className="text-xs text-gray-400 mb-3">{t("auth.magicLinkTokenPanelHint")}</p>

          {!data?.data?.id ? (
            <p className="text-xs text-gray-400 italic">{emptyStateMessage("token")}</p>
          ) : (
            <>
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    {t("auth.commonRawTokenLabel")}
                  </p>
                  <div className="bg-white border rounded p-2 font-mono text-[10px] break-all leading-5 select-all">
                    <span className="text-green-500">{token}</span>
                  </div>
                </div>
              </div>

              <ul className="mt-3 space-y-2">
                <li className="flex items-start gap-2 p-2 bg-white border rounded text-xs">
                  <KeyRound className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                  <div className="min-w-0 space-y-1">
                    <p className="text-gray-500">
                      {t("auth.commonCreatedAtLabel")}{" "}
                      <span className="font-mono">
                        {data?.data?.created_at}
                      </span>
                    </p>
                    <p className="text-gray-500">
                      {t("auth.magicLinkTokenExpiredAtLabel")}{" "}
                      <span className="font-mono text-[10px]">
                        {data?.data?.expires_at ?? "—"}
                      </span>
                    </p>
                    <p className="text-gray-500">
                      {t("auth.commonIdLabel")}{" "}
                      <span className="font-mono">{data?.data?.id}</span>
                    </p>
                  </div>
                </li>
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
