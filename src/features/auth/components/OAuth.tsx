"use client";

import { Button } from "@/features/shared/components/Button";
import {
  DecodedJWT,
  decodeJWT,
  formatPayloadForDisplay,
} from "@/features/shared/utils/decodeJWT";
import { renderHtmlText } from "@/features/shared/utils/renderHtmlText";
import { getSessionBannerClass } from "@/features/shared/utils/getSessionBannerClass";
import {
  CheckCircle,
  Fingerprint,
  Info,
  KeyRound,
  Loader2,
  Server,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { signIn, signOut, useSession } from "next-auth/react";
import {
  startTransition,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { AuthResponse } from "../services/api";
import Image from "next/image";
import type { OperationStatus } from "../types/OperationStatus";

type SessionState = "idle" | "active" | "expired" | "refreshing";

const EXPIRY_WARNING_SECONDS = 15;

interface AuthResponseUser {
  name: string;
  email: string;
  image: string;
}

interface Session {
  user: AuthResponseUser;
  expires: string;
  accessToken: string;
  idToken: string;
}

const oauthRichText = {
  ...renderHtmlText,
  safe: (c: React.ReactNode) => (
    <span className="text-green-700 font-medium">{c}</span>
  ),
  danger: (c: React.ReactNode) => (
    <span className="text-red-700 font-medium">{c}</span>
  ),
};

const SessionExpiresCount = ({
  chunks,
  isExpiring,
}: Readonly<{ chunks: React.ReactNode; isExpiring: boolean }>) => {
  return (
    <strong className={isExpiring ? "text-orange-700" : undefined}>
      {chunks}
    </strong>
  );
};

export const OAuthSection = () => {
  const t = useTranslations();
  const { data: dataSession, update } = useSession();

  const session = dataSession as Session;

  const [authStatus, setAuthStatus] = useState<OperationStatus>("idle");

  const [sessionState, setSessionState] = useState<SessionState>("idle");
  const [decoded, setDecoded] = useState<DecodedJWT | null>(null);

  const [userData, setUserData] = useState<AuthResponseUser | null>(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [expiry, setExpiry] = useState<number | null>(null);

  const sessionStateRef = useRef<SessionState>("idle");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    sessionStateRef.current = sessionState;
  }, [sessionState]);

  const applyNewSession = useCallback(
    (token: string, user: AuthResponseUser) => {
      const dec = decodeJWT(token);
      if (!dec) return;
      const expMs = (dec.payload.exp as number) * 1000;

      setDecoded(dec);
      setUserData(user);
      setExpiry(expMs);
      setTimeLeft(Math.max(0, Math.floor((expMs - Date.now()) / 1000)));
      setSessionState("active");
    },
    [],
  );

  useEffect(() => {
    if (!expiry) return;

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(async () => {
      const remaining = Math.floor((expiry - Date.now()) / 1000);

      if (
        remaining <= EXPIRY_WARNING_SECONDS &&
        remaining > 0 &&
        sessionStateRef.current === "active"
      ) {
        setSessionState("refreshing");
        await update();
        setSessionState("active");
      }

      if (remaining <= 0) {
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
        setTimeLeft(0);

        if (
          sessionStateRef.current !== "expired" &&
          sessionStateRef.current !== "refreshing"
        ) {
          setSessionState("expired");
        }
        return;
      }

      setTimeLeft(remaining);
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [expiry]);

  const handleAuthenticate = async () => {
    try {
      setAuthStatus("loading");
      await signIn("google");
      setAuthStatus("success");
    } catch {
      setAuthStatus("error");
    }
  };

  useEffect(() => {
    if (session?.user?.name) {
      startTransition(() => {
        applyNewSession(session?.idToken, session?.user);
      });
    }
  }, [applyNewSession, session?.accessToken, session?.user, session]);

  const handleLogout = async () => {
    setSessionState("idle");
    setDecoded(null);
    setUserData(null);
    setExpiry(null);
    try {
      await signOut();
    } catch (error) {
      console.error(error);
    }
  };

  const isActive = sessionState === "active";
  const isExpiring = isActive && timeLeft <= EXPIRY_WARNING_SECONDS;
  const isExpired = sessionState === "expired";
  const isRefreshing = sessionState === "refreshing";
  const hasSession = sessionState !== "idle";

  const userDisplay =
    userData ?? (decoded?.payload as AuthResponse["user"] | null);

  return (
    <div id="oauth" className="mt-12">
      <h3 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
        {t("auth.oauthTitle")}
      </h3>

      <div className="mt-4 space-y-6 text-gray-600 text-base leading-relaxed">
        <div>
          <p>{t.rich("auth.oauthDesc1", renderHtmlText)}</p>
          <p className="mt-2">{t("auth.oauthDesc2")}</p>
        </div>

        <div>
          <p className="font-semibold text-gray-600 mb-3">
            {t("auth.oauthVersionCompareTitle")}
          </p>
          <p className="mb-3 text-gray-500">{t("auth.oauthVersionCompareIntro")}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <p className="font-semibold text-gray-700 mb-2 text-xs">
                {t("auth.oauthV1Title")}{" "}
                <span className="font-normal text-gray-400">{t("auth.oauthV1Era")}</span>
              </p>
              <ul className="space-y-2 text-xs text-gray-600">
                <li className="flex gap-2">
                  <span className="shrink-0 text-gray-400">—</span>
                  <span>{t.rich("auth.oauthV1Item1", renderHtmlText)}</span>
                </li>
                <li className="flex gap-2">
                  <span className="shrink-0 text-gray-400">—</span>
                  <span>{t("auth.oauthV1Item2")}</span>
                </li>
                <li className="flex gap-2">
                  <span className="shrink-0 text-gray-400">—</span>
                  <span>{t.rich("auth.oauthV1Item3", renderHtmlText)}</span>
                </li>
                <li className="flex gap-2">
                  <span className="shrink-0 text-gray-400">—</span>
                  <span>{t("auth.oauthV1Item4")}</span>
                </li>
              </ul>
            </div>

            <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
              <p className="font-semibold text-blue-700 mb-2 text-xs">
                {t("auth.oauthV2Title")}{" "}
                <span className="font-normal text-blue-400">{t("auth.oauthV2Era")}</span>
              </p>
              <ul className="space-y-2 text-xs text-blue-800">
                <li className="flex gap-2">
                  <span className="shrink-0 text-blue-400">—</span>
                  <span>{t.rich("auth.oauthV2Item1", renderHtmlText)}</span>
                </li>
                <li className="flex gap-2">
                  <span className="shrink-0 text-blue-400">—</span>
                  <span>{t.rich("auth.oauthV2Item2", renderHtmlText)}</span>
                </li>
                <li className="flex gap-2">
                  <span className="shrink-0 text-blue-400">—</span>
                  <span>{t.rich("auth.oauthV2Item3", renderHtmlText)}</span>
                </li>
                <li className="flex gap-2">
                  <span className="shrink-0 text-blue-400">—</span>
                  <span>{t.rich("auth.oauthV2Item4", renderHtmlText)}</span>
                </li>
              </ul>
            </div>
          </div>

          <br />

          <p className="font-semibold text-gray-600 mb-3">{t("auth.oauthWhyRetiredTitle")}</p>

          <p className="text-gray-600 mb-3">{t("auth.oauthWhyRetiredDesc")}</p>
        </div>

        <div>
          <p className="font-semibold text-gray-600 mb-3">{t("auth.oauthCredentialsTitle")}</p>
          <p className="mb-3 text-gray-500">{t("auth.oauthCredentialsIntro")}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex items-center gap-2 mb-1">
                <code className="text-xs font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
                  CLIENT_ID
                </code>
                <span className="text-xs text-gray-400">{t("auth.oauthGeneratedByGoogle")}</span>
              </div>
              <p className="text-xs text-gray-600">
                {t.rich("auth.oauthClientIdDesc", oauthRichText)}
              </p>
            </div>

            <div className="p-3 border border-red-200 rounded-lg bg-red-50">
              <div className="flex items-center gap-2 mb-1">
                <code className="text-xs font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded">
                  CLIENT_SECRET
                </code>
                <span className="text-xs text-gray-400">{t("auth.oauthGeneratedByGoogle")}</span>
              </div>
              <p className="text-xs text-gray-600">
                {t.rich("auth.oauthClientSecretDesc", oauthRichText)}
              </p>
            </div>

            <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex items-center gap-2 mb-1">
                <code className="text-xs font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">
                  REDIRECT_URI
                </code>
                <span className="text-xs text-gray-400">{t("auth.oauthRedirectUriOwner")}</span>
              </div>
              <p className="text-xs text-gray-600">
                {t.rich("auth.oauthRedirectUriDesc", oauthRichText)}
              </p>
            </div>

            <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex items-center gap-2 mb-1">
                <code className="text-xs font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                  code
                </code>
                <span className="text-xs text-gray-400">{t("auth.oauthGeneratedByGoogle")}</span>
              </div>
              <p className="text-xs text-gray-600">
                {t.rich("auth.oauthCodeDesc", oauthRichText)}
              </p>
            </div>

            <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex items-center gap-2 mb-1">
                <code className="text-xs font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                  access_token
                </code>
                <span className="text-xs text-gray-400">{t("auth.oauthGeneratedByGoogle")}</span>
              </div>
              <p className="text-xs text-gray-600">
                {t.rich("auth.oauthAccessTokenDesc", oauthRichText)}
              </p>
            </div>

            <div className="p-3 border border-red-200 rounded-lg bg-red-50">
              <div className="flex items-center gap-2 mb-1">
                <code className="text-xs font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded">
                  refresh_token
                </code>
                <span className="text-xs text-gray-400">{t("auth.oauthGeneratedByGoogle")}</span>
              </div>
              <p className="text-xs text-gray-600">
                {t.rich("auth.oauthRefreshTokenDesc", oauthRichText)}
              </p>
            </div>
          </div>
        </div>

        <div>
          <p className="font-semibold text-gray-600 mb-3">{t("auth.oauthFlowTitle")}</p>
          <div className="space-y-2">
            {[
              {
                id: "step1",
                actor: t("auth.oauthActorUser"),
                color: "bg-violet-100 text-violet-800 border-violet-200",
                dot: "bg-violet-400",
                text: t("auth.oauthFlowStep1"),
              },
              {
                id: "step2",
                actor: t("auth.oauthActorApp"),
                color: "bg-orange-100 text-orange-800 border-orange-200",
                dot: "bg-orange-400",
                text: t.rich("auth.oauthFlowStep2", renderHtmlText),
              },
              {
                id: "step3",
                actor: t("auth.oauthActorGoogle"),
                color: "bg-blue-100 text-blue-800 border-blue-200",
                dot: "bg-blue-400",
                text: t("auth.oauthFlowStep3"),
              },
              {
                id: "step4",
                actor: t("auth.oauthActorUser"),
                color: "bg-violet-100 text-violet-800 border-violet-200",
                dot: "bg-violet-400",
                text: t("auth.oauthFlowStep4"),
              },
              {
                id: "step5",
                actor: t("auth.oauthActorGoogle"),
                color: "bg-blue-100 text-blue-800 border-blue-200",
                dot: "bg-blue-400",
                text: t.rich("auth.oauthFlowStep5", renderHtmlText),
              },
              {
                id: "step6",
                actor: t("auth.oauthActorApp"),
                color: "bg-orange-100 text-orange-800 border-orange-200",
                dot: "bg-orange-400",
                text: t.rich("auth.oauthFlowStep6", renderHtmlText),
              },
              {
                id: "step7",
                actor: t("auth.oauthActorGoogle"),
                color: "bg-blue-100 text-blue-800 border-blue-200",
                dot: "bg-blue-400",
                text: t.rich("auth.oauthFlowStep7", renderHtmlText),
              },
              {
                id: "step8",
                actor: t("auth.oauthActorApp"),
                color: "bg-orange-100 text-orange-800 border-orange-200",
                dot: "bg-orange-400",
                text: t("auth.oauthFlowStep8"),
              },
            ].map((step, i) => (
              <div
                key={step.id}
                className={`flex gap-3 p-3 border rounded-lg ${step.color}`}
              >
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${step.dot}`}
                  >
                    {i + 1}
                  </span>
                </div>
                <div className="min-w-0">
                  <span className="font-semibold text-xs">{step.actor} — </span>
                  <span className="text-xs">{step.text}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="font-semibold text-gray-600 mb-3">{t("auth.oauthServerExchangeTitle")}</p>

        <p className="text-gray-600 mb-3">
          {t.rich("auth.oauthServerExchangeDesc", renderHtmlText)}
        </p>
      </div>

      <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded text-sm text-amber-900">
        <div className="p-4 bg-amber-50 border border-amber-200 rounded text-sm text-amber-900">
          <div className="flex items-start gap-2">
            <Info className="mt-1 shrink-0" />
            <p className="text-sm leading-relaxed">
              {t.rich("auth.oauthDemoWarning", renderHtmlText)}
            </p>
          </div>
        </div>

        <p className="mt-3 font-bold">{t("auth.howToUseLabel")}</p>
        <p className="mt-2">{t("auth.oauthHowToUseDesc")}</p>

        <div className="mt-4 flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <p className="font-semibold text-amber-800">{t("auth.oauthStep1Title")}</p>
            <p className="mt-1 text-xs text-amber-700">{t("auth.oauthStep1Desc")}</p>

            <div className="mt-3 flex flex-col gap-2">
              <Button
                type="primary"
                onClick={handleAuthenticate}
                disabled={authStatus === "loading" || !!session?.user}
                className="w-full"
              >
                {authStatus === "loading" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t("auth.oauthAuthenticatingButton")}
                  </>
                ) : (
                  <>
                    <Fingerprint className="w-4 h-4" />
                    {t("auth.oauthAuthButton")}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 border rounded-lg bg-gray-50">
          <div className="flex items-center gap-2 mb-1">
            <Server className="w-4 h-4 text-gray-400" />
            <p className="text-sm font-semibold text-gray-700">{t("auth.commonCredentialsLabel")}</p>
          </div>
          <p className="text-xs text-gray-400 mb-3">{t("auth.commonCredentialsHint")}</p>

          {!userDisplay ? (
            <p className="text-xs text-gray-400 italic">{t("auth.commonLoginToSeeCredentials")}</p>
          ) : (
            <ul className="space-y-2">
              <li className="flex justify-between gap-2 p-2 bg-white border rounded text-xs">
                <div className="flex items-start gap-2 p-2 bg-white  rounded text-xs">
                  <KeyRound className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                  <div className="min-w-0 space-y-1">
                    <p className="font-medium text-gray-700">
                      {t("auth.commonNameLabel")}{" "}
                      <span className="font-normal">{userDisplay.name}</span>
                    </p>
                    <p className="text-gray-500">
                      {t("auth.commonEmailLabel")}{" "}
                      <span className="font-mono">{userDisplay.email}</span>
                    </p>
                  </div>
                </div>
                {session?.user?.image ? (
                  <Image
                    width={52}
                    height={52}
                    src={session.user.image}
                    alt={session.user.name ?? t("auth.commonNameLabel")}
                    className="rounded-full shrink-0"
                  />
                ) : (
                  <div
                    aria-hidden="true"
                    className="w-[52px] h-[52px] rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm font-semibold shrink-0"
                  >
                    {(session?.user?.name ?? "?").charAt(0).toUpperCase()}
                  </div>
                )}
              </li>
            </ul>
          )}
        </div>

        <div className="p-4 border rounded-lg bg-gray-50">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-4 h-4 text-gray-400" />
            <p className="text-sm font-semibold text-gray-700">{t("auth.oauthIdTokenPanelTitle")}</p>
          </div>
          <p className="text-xs text-gray-400 mb-3">{t("auth.oauthIdTokenPanelHint")}</p>

          {!decoded ? (
            <p className="text-xs text-gray-400 italic">{t("auth.commonLoginToSeeDecodedToken")}</p>
          ) : (
            <div className="space-y-3">
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  {t("auth.commonRawTokenLabel")}
                </p>
                <div className="bg-white border rounded p-2 font-mono text-[10px] break-all leading-5 select-all">
                  <span className="text-red-500">{decoded.parts[0]}</span>
                  <span className="text-gray-300">.</span>
                  <span className="text-blue-500">{decoded.parts[1]}</span>
                  <span className="text-gray-300">.</span>
                  <span className="text-green-500">{decoded.parts[2]}</span>
                </div>
                <div className="flex gap-3 mt-1 text-[9px] font-semibold">
                  <span className="text-red-400">■ {t("auth.commonHeaderLabel").toUpperCase()}</span>
                  <span className="text-blue-400">■ {t("auth.commonPayloadLabel").toUpperCase()}</span>
                  <span className="text-green-400">■ {t("auth.commonSignatureLabel").toUpperCase()}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-[10px]">
                <div>
                  <p className="font-bold text-red-500 mb-1 uppercase tracking-wide">
                    {t("auth.commonHeaderLabel")}
                  </p>
                  <pre className="bg-red-50 border border-red-100 rounded p-2 text-red-800 overflow-auto leading-relaxed whitespace-pre-wrap">
                    {JSON.stringify(decoded.header, null, 2)}
                  </pre>
                </div>
                <div>
                  <p className="font-bold text-blue-500 mb-1 uppercase tracking-wide">
                    {t("auth.commonPayloadLabel")}
                  </p>
                  <pre className="bg-blue-50 border border-blue-100 rounded p-2 text-blue-800 overflow-auto leading-relaxed whitespace-pre-wrap">
                    {formatPayloadForDisplay(decoded.payload)}
                  </pre>
                </div>
                <div>
                  <p className="font-bold text-green-500 mb-1 uppercase tracking-wide">
                    {t("auth.commonSignatureLabel")}
                  </p>
                  <pre className="bg-green-50 border border-green-100 rounded p-2 text-green-800 overflow-auto leading-relaxed whitespace-pre-wrap">
                    {`HMACSHA256(\n  base64(header)\n  + "."\n  + base64(payload),\n  secret\n)`}
                  </pre>
                  <p className="mt-1 text-[9px] text-gray-400 leading-relaxed">
                    {t("auth.commonSignatureHint")}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {hasSession && (
        <div
          className={`mt-4 p-4 border rounded text-sm transition-colors ${getSessionBannerClass(isRefreshing, isExpired, isExpiring)}`}
        >
          {isRefreshing && (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin shrink-0" />
              <div>
                <p className="font-bold">{t("auth.oauthSessionRefreshingTitle")}</p>
                <p className="text-xs mt-0.5 opacity-80">{t("auth.oauthSessionRefreshingDesc")}</p>
              </div>
            </div>
          )}

          {isExpired && !isRefreshing && (
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <div>
                <p className="font-bold">{t("auth.oauthSessionExpiredTitle")}</p>
                <p className="text-xs mt-0.5 opacity-80">{t("auth.oauthSessionExpiredDesc")}</p>
              </div>
            </div>
          )}

          {isActive && (
            <>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle
                    className={`w-4 h-4 shrink-0 ${isExpiring ? "text-orange-600" : "text-green-600"}`}
                  />
                  <strong>
                    {isExpiring
                      ? t("auth.jwtSessionExpiringBadge")
                      : t("auth.jwtSessionActiveBadge")}
                  </strong>
                </div>
                <span
                  className={`font-mono font-bold text-lg ${isExpiring ? "text-orange-600" : "text-amber-700"}`}
                >
                  {timeLeft}s
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <p>
                  {t.rich("auth.oauthSessionExpiresIn", {
                    ...renderHtmlText,
                    seconds: timeLeft,
                    count: (c) => (
                      <SessionExpiresCount chunks={c} isExpiring={isExpiring} />
                    ),
                  })}
                </p>

                <div className="mt-3 space-y-1.5">
                  <p className="font-semibold">{t("auth.oauthHowSessionWorksTitle")}</p>
                  <div className="grid grid-cols-1 gap-1.5">
                    <div className="flex gap-2 p-2 bg-white/50 rounded">
                      <span className="shrink-0 font-bold text-amber-600">🔑</span>
                      <div>
                        <p className="font-medium">{t("auth.oauthSessionIdTokenTitle")}</p>
                        <p className="opacity-75">
                          {t.rich("auth.oauthSessionIdTokenDesc", renderHtmlText)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 p-2 bg-white/50 rounded">
                      <span className="shrink-0 font-bold text-amber-600">🍪</span>
                      <div>
                        <p className="font-medium">{t("auth.oauthSessionCookieTitle")}</p>
                        <p className="opacity-75">
                          {t.rich("auth.oauthSessionCookieDesc", renderHtmlText)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 p-2 bg-white/50 rounded">
                      <span className="shrink-0 font-bold text-amber-600">🔄</span>
                      <div>
                        <p className="font-medium">{t("auth.oauthSessionRefreshTitle")}</p>
                        <p className="opacity-75">
                          {t.rich("auth.oauthSessionRefreshDesc", renderHtmlText)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 p-2 bg-white/50 rounded">
                      <span className="shrink-0 font-bold text-amber-600">🌐</span>
                      <div>
                        <p className="font-medium">{t("auth.oauthSessionRestoreTitle")}</p>
                        <p className="opacity-75">{t("auth.oauthSessionRestoreDesc")}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 p-2 bg-white/50 rounded">
                      <span className="shrink-0 font-bold text-amber-600">⚡</span>
                      <div>
                        <p className="font-medium">
                          {t("auth.oauthSessionCountdownTitle", { seconds: timeLeft })}
                        </p>
                        <p className="opacity-75">{t("auth.oauthSessionCountdownDesc")}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-current/20 rounded text-xs font-medium hover:bg-white/80 transition-colors cursor-pointer"
                  >
                    <XCircle className="w-3 h-3" />
                    {t("auth.commonLogoutButton")}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
