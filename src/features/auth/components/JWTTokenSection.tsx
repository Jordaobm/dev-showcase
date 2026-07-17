"use client";

import { Button } from "@/features/shared/components/Button";
import { useMutation } from "@tanstack/react-query";
import {
  CheckCircle,
  Fingerprint,
  Info,
  KeyRound,
  Loader2,
  RefreshCw,
  Server,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { z } from "zod";
import { AxiosError, AxiosResponse } from "axios";
import { auth, AuthResponse, register, UserData } from "../services/api";
import { formatPayloadForDisplay } from "@/features/shared/utils/decodeJWT";
import { renderHtmlText } from "@/features/shared/utils/renderHtmlText";
import { getSessionBannerClass } from "@/features/shared/utils/getSessionBannerClass";
import { useSession } from "../hooks/useSession";
import type { OperationStatus } from "../types/OperationStatus";

type TranslateFn = ReturnType<typeof useTranslations>;

const buildCredentialsSchema = (t: TranslateFn) => {
  return z.object({
    email: z
      .string()
      .min(1, t("auth.jwtValidationEmailRequired"))
      .email(t("auth.jwtValidationEmailInvalid")),
    password: z
      .string()
      .min(4, t("auth.jwtValidationPasswordMin"))
      .regex(/[a-zA-Z]/, t("auth.jwtValidationPasswordLetter"))
      .regex(/\d/, t("auth.jwtValidationPasswordNumber"))
      .regex(/[^a-zA-Z0-9]/, t("auth.jwtValidationPasswordSymbol")),
  });
};

const buildRegisterSchema = (t: TranslateFn) => {
  return buildCredentialsSchema(t).extend({
    name: z.string().min(1, t("auth.jwtValidationNameRequired")),
  });
};

type RegisterSchema = ReturnType<typeof buildRegisterSchema>;
type AuthSchema = ReturnType<typeof buildCredentialsSchema>;
type RegisterErrors = Partial<Record<keyof z.infer<RegisterSchema>, string>>;
type AuthErrors = Partial<Record<keyof z.infer<AuthSchema>, string>>;

const resolveRegisterErrorMessage = (
  code: string | undefined,
  t: TranslateFn,
) => {
  if (code === "email_taken") return t("auth.jwtRegisterErrorEmailTaken");
  return t("auth.jwtRegisterErrorGeneric");
};

const resolveAuthErrorMessage = (code: string | undefined, t: TranslateFn) => {
  if (code === "invalid_credentials") {
    return t("auth.jwtAuthErrorInvalidCredentials");
  }
  return t("auth.jwtAuthErrorGeneric");
};

const SessionExpiresCount = ({
  chunks,
  isExpiring,
}: Readonly<{ chunks: ReactNode; isExpiring: boolean }>) => {
  return (
    <strong className={isExpiring ? "text-orange-700" : undefined}>
      {chunks}
    </strong>
  );
};

const extractFieldErrors = <T extends z.ZodTypeAny>(
  schema: T,
  data: unknown,
): Partial<Record<string, string>> => {
  const result = schema.safeParse(data);
  if (result.success) return {};
  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as string;
    if (field && !errors[field]) errors[field] = issue.message;
  }
  return errors;
};

export const JWTTokenSection = () => {
  const t = useTranslations();
  const {
    user,
    decoded,
    timeLeft,
    isActive,
    isExpiring,
    isExpired,
    isRefreshing,
    hasSession,
    applyNewSession,
    logout,
    refresh,
  } = useSession();

  const registerSchema = useMemo(() => buildRegisterSchema(t), [t]);
  const authSchema = useMemo(() => buildCredentialsSchema(t), [t]);

  const [registerData, setRegisterData] = useState<UserData>({} as UserData);
  const [authData, setAuthData] = useState<UserData>({} as UserData);
  const [registerStatus, setRegisterStatus] = useState<OperationStatus>("idle");
  const [authStatus, setAuthStatus] = useState<OperationStatus>("idle");
  const [registerErrors, setRegisterErrors] = useState<RegisterErrors>({});
  const [registerTouched, setRegisterTouched] = useState<Record<string, boolean>>({});
  const [authErrors, setAuthErrors] = useState<AuthErrors>({});
  const [authTouched, setAuthTouched] = useState<Record<string, boolean>>({});

  const { mutateAsync: mutateRegister, error: errorRegister } = useMutation<
    AxiosResponse,
    AxiosError<{ error: string }>,
    UserData
  >({ mutationFn: register });

  const { mutateAsync: mutateAuth, error: errorAuth } = useMutation<
    AxiosResponse<AuthResponse>,
    AxiosError<{ error: string }>,
    UserData
  >({ mutationFn: auth });

  const handleRegister = async () => {
    try {
      setRegisterStatus("loading");
      await mutateRegister(registerData);
      setRegisterStatus("success");
    } catch {
      setRegisterStatus("error");
    }
  };

  const handleAuthenticate = async () => {
    try {
      setAuthStatus("loading");
      const result = await mutateAuth(authData);
      const { user: userData, accessToken: at } = result.data;
      applyNewSession(at, userData);
      setAuthStatus("success");
    } catch {
      setAuthStatus("error");
    }
  };

  const invalidRegister = !registerSchema.safeParse(registerData).success;
  const invalidAuth = !authSchema.safeParse(authData).success;

  const userDisplay = user ?? (decoded?.payload as AuthResponse["user"] | null);
  const createdAtDisplay =
    userDisplay?.createdAt ??
    ((userDisplay as Record<string, unknown>)?.created_at as
      | string
      | undefined);

  return (
    <div id="jwttoken" className="mt-12">
      <h3 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
        {t("auth.jwtTitle")}
      </h3>

      <div className="text-gray-600">
        <p>{t.rich("auth.jwtDesc1", renderHtmlText)}</p>
        <br />
        <p>{t.rich("auth.jwtDesc2", renderHtmlText)}</p>
        <br />
        <p>{t("auth.jwtPartsIntro")}</p>
        <ul className="mt-2 space-y-1 list-disc list-inside">
          <li>{t.rich("auth.jwtPartHeader", renderHtmlText)}</li>
          <li>{t.rich("auth.jwtPartPayload", renderHtmlText)}</li>
          <li>{t.rich("auth.jwtPartSignature", renderHtmlText)}</li>
        </ul>
        <br />
        <p>{t("auth.jwtDesc3")}</p>
        <br />
        <p className="font-medium text-gray-700">{t("auth.jwtRefreshTitle")}</p>
        <p className="mt-1">{t.rich("auth.jwtRefreshDesc1", renderHtmlText)}</p>
        <p className="mt-2">{t.rich("auth.jwtRefreshDesc2", renderHtmlText)}</p>
        <br />
        <p className="font-medium text-gray-700">{t("auth.jwtRotationTitle")}</p>
        <p className="mt-1">{t.rich("auth.jwtRotationDesc1", renderHtmlText)}</p>
        <p className="mt-2">{t("auth.jwtRotationDesc2")}</p>
      </div>

      <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded text-sm text-amber-900">
        <div className="p-4 bg-amber-50 border border-amber-200 rounded text-sm text-amber-900">
          <div className="flex items-start gap-2">
            <Info className="mt-1 shrink-0" />
            <p className="text-sm leading-relaxed">
              {t.rich("auth.jwtDemoWarning", renderHtmlText)}
            </p>
          </div>
        </div>

        <p className="mt-3 font-bold" id="autenticacao">
          {t("auth.howToUseLabel")}
        </p>
        <p className="mt-2">{t("auth.jwtHowToUseDesc")}</p>

        <div className="mt-4 flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <p className="font-semibold text-amber-800">{t("auth.jwtStep1Title")}</p>
            <p className="mt-1 text-xs text-amber-700">{t("auth.jwtStep1Desc")}</p>

            <div className="mt-3 flex flex-col gap-2">
              <div>
                <input
                  type="text"
                  aria-label={t("auth.jwtNameFieldLabel")}
                  value={registerData?.name ?? ""}
                  disabled={!!userDisplay}
                  onChange={(e) => {
                    const next = { ...registerData, name: e.target.value };
                    setRegisterData(next);
                    setRegisterTouched((prev) => ({ ...prev, name: true }));
                    setRegisterErrors(extractFieldErrors(registerSchema, next) as RegisterErrors);
                  }}
                  placeholder={t("auth.jwtNamePlaceholder")}
                  className={`w-full px-3 py-2 bg-white border-2 rounded-lg text-sm text-gray-700 focus:outline-none transition-colors placeholder:text-gray-400 ${
                    registerTouched.name && registerErrors.name
                      ? "border-red-400 focus:border-red-500"
                      : "border-amber-200 focus:border-red-400"
                  }`}
                />
                {registerTouched.name && registerErrors.name && (
                  <p className="mt-1 text-xs text-red-600">{registerErrors.name}</p>
                )}
              </div>
              <div>
                <input
                  type="email"
                  aria-label={t("auth.jwtRegisterEmailFieldLabel")}
                  value={registerData?.email ?? ""}
                  disabled={!!userDisplay}
                  onChange={(e) => {
                    const next = { ...registerData, email: e.target.value };
                    setRegisterData(next);
                    setRegisterTouched((prev) => ({ ...prev, email: true }));
                    setRegisterErrors(extractFieldErrors(registerSchema, next) as RegisterErrors);
                  }}
                  placeholder={t("auth.jwtRegisterEmailPlaceholder")}
                  className={`w-full px-3 py-2 bg-white border-2 rounded-lg text-sm text-gray-700 focus:outline-none transition-colors placeholder:text-gray-400 ${
                    registerTouched.email && registerErrors.email
                      ? "border-red-400 focus:border-red-500"
                      : "border-amber-200 focus:border-red-400"
                  }`}
                />
                {registerTouched.email && registerErrors.email && (
                  <p className="mt-1 text-xs text-red-600">{registerErrors.email}</p>
                )}
              </div>
              <div>
                <input
                  type="password"
                  aria-label={t("auth.jwtPasswordFieldLabel")}
                  value={registerData?.password ?? ""}
                  disabled={!!userDisplay}
                  onChange={(e) => {
                    const next = { ...registerData, password: e.target.value };
                    setRegisterData(next);
                    setRegisterTouched((prev) => ({ ...prev, password: true }));
                    setRegisterErrors(extractFieldErrors(registerSchema, next) as RegisterErrors);
                  }}
                  placeholder={t("auth.jwtPasswordPlaceholder")}
                  className={`w-full px-3 py-2 bg-white border-2 rounded-lg text-sm text-gray-700 focus:outline-none transition-colors placeholder:text-gray-400 ${
                    registerTouched.password && registerErrors.password
                      ? "border-red-400 focus:border-red-500"
                      : "border-amber-200 focus:border-red-400"
                  }`}
                />
                {registerTouched.password && registerErrors.password && (
                  <p className="mt-1 text-xs text-red-600">{registerErrors.password}</p>
                )}
              </div>
              <Button
                type="primary"
                onClick={handleRegister}
                disabled={invalidRegister || registerStatus === "loading" || !!userDisplay}
                className="w-full"
              >
                {registerStatus === "loading" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t("auth.jwtRegisteringButton")}
                  </>
                ) : (
                  <>
                    <Fingerprint className="w-4 h-4" />
                    {t("auth.jwtRegisterButton")}
                  </>
                )}
              </Button>
            </div>

            {registerStatus === "success" && (
              <div className="mt-2 flex items-center gap-1.5 text-green-700 text-xs">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{t("auth.jwtRegisterSuccess")}</span>
              </div>
            )}
            {registerStatus === "error" && (
              <div className="mt-2 flex items-center gap-1.5 text-red-700 text-xs">
                <XCircle className="w-3.5 h-3.5" />
                <span>
                  {resolveRegisterErrorMessage(
                    errorRegister?.response?.data?.error,
                    t,
                  )}
                </span>
              </div>
            )}
          </div>

          <div className="hidden md:block w-px bg-amber-200" />
          <div className="md:hidden h-px bg-amber-200" />

          <div className="flex-1">
            <p className="font-semibold text-amber-800">{t("auth.jwtStep2Title")}</p>
            <p className="mt-1 text-xs text-amber-700">{t("auth.jwtStep2Desc")}</p>

            <div className="mt-3 flex flex-col gap-2">
              <div>
                <input
                  type="email"
                  aria-label={t("auth.jwtAuthEmailFieldLabel")}
                  value={authData?.email ?? ""}
                  disabled={!!userDisplay}
                  onChange={(e) => {
                    const next = { ...authData, email: e.target.value };
                    setAuthData(next);
                    setAuthTouched((prev) => ({ ...prev, email: true }));
                    setAuthErrors(extractFieldErrors(authSchema, next) as AuthErrors);
                  }}
                  placeholder={t("auth.jwtAuthEmailPlaceholder")}
                  className={`w-full px-3 py-2 bg-white border-2 rounded-lg text-sm text-gray-700 focus:outline-none transition-colors placeholder:text-gray-400 ${
                    authTouched.email && authErrors.email
                      ? "border-red-400 focus:border-red-500"
                      : "border-amber-200 focus:border-red-400"
                  }`}
                />
                {authTouched.email && authErrors.email && (
                  <p className="mt-1 text-xs text-red-600">{authErrors.email}</p>
                )}
              </div>
              <div>
                <input
                  type="password"
                  aria-label={t("auth.jwtAuthPasswordFieldLabel")}
                  value={authData?.password ?? ""}
                  disabled={!!userDisplay}
                  onChange={(e) => {
                    const next = { ...authData, password: e.target.value };
                    setAuthData(next);
                    setAuthTouched((prev) => ({ ...prev, password: true }));
                    setAuthErrors(extractFieldErrors(authSchema, next) as AuthErrors);
                  }}
                  placeholder={t("auth.jwtAuthPasswordPlaceholder")}
                  className={`w-full px-3 py-2 bg-white border-2 rounded-lg text-sm text-gray-700 focus:outline-none transition-colors placeholder:text-gray-400 ${
                    authTouched.password && authErrors.password
                      ? "border-red-400 focus:border-red-500"
                      : "border-amber-200 focus:border-red-400"
                  }`}
                />
                {authTouched.password && authErrors.password && (
                  <p className="mt-1 text-xs text-red-600">{authErrors.password}</p>
                )}
              </div>
              <Button
                type="primary"
                onClick={handleAuthenticate}
                disabled={invalidAuth || authStatus === "loading" || !!userDisplay}
                className="w-full"
              >
                {authStatus === "loading" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t("auth.jwtAuthenticatingButton")}
                  </>
                ) : (
                  <>
                    <Fingerprint className="w-4 h-4" />
                    {t("auth.jwtAuthButton")}
                  </>
                )}
              </Button>
            </div>

            {authStatus === "success" && (
              <div className="mt-2 flex items-center gap-1.5 text-green-700 text-xs">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{t("auth.jwtAuthSuccess")}</span>
              </div>
            )}
            {authStatus === "error" && (
              <div className="mt-2 flex items-center gap-1.5 text-red-700 text-xs">
                <XCircle className="w-3.5 h-3.5" />
                <span>
                  {resolveAuthErrorMessage(errorAuth?.response?.data?.error, t)}
                </span>
              </div>
            )}
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
              <li className="flex items-start gap-2 p-2 bg-white border rounded text-xs">
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
                  <p className="text-gray-500">
                    {t("auth.commonCreatedAtLabel")}{" "}
                    <span className="font-mono text-[10px]">
                      {createdAtDisplay ?? "—"}
                    </span>
                  </p>
                  <p className="text-gray-500">
                    {t("auth.commonIdLabel")} <span className="font-mono">{userDisplay.id}</span>
                  </p>
                </div>
              </li>
            </ul>
          )}
        </div>

        <div className="p-4 border rounded-lg bg-gray-50">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-4 h-4 text-gray-400" />
            <p className="text-sm font-semibold text-gray-700">{t("auth.jwtDecodedPanelTitle")}</p>
          </div>
          <p className="text-xs text-gray-400 mb-3">{t("auth.jwtTokenStructureHint")}</p>

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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[10px]">
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
                <p className="font-bold">{t("auth.jwtSessionRefreshingTitle")}</p>
                <p className="text-xs mt-0.5 opacity-80">{t("auth.jwtSessionRefreshingDesc")}</p>
              </div>
            </div>
          )}

          {isExpired && !isRefreshing && (
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <div>
                <p className="font-bold">{t("auth.jwtSessionExpiredTitle")}</p>
                <p className="text-xs mt-0.5 opacity-80">{t("auth.jwtSessionExpiredDesc")}</p>
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
                  {t.rich("auth.jwtSessionExpiresIn", {
                    ...renderHtmlText,
                    seconds: timeLeft,
                    count: (c) => (
                      <SessionExpiresCount chunks={c} isExpiring={isExpiring} />
                    ),
                  })}
                </p>

                <div className="mt-3 space-y-1.5">
                  <p className="font-semibold">{t("auth.jwtHowRefreshWorksTitle")}</p>
                  <div className="grid grid-cols-1 gap-1.5">
                    <div className="flex gap-2 p-2 bg-white/50 rounded">
                      <span className="shrink-0 font-bold text-amber-600">🔑</span>
                      <div>
                        <p className="font-medium">{t("auth.jwtRefreshAccessTokenTitle")}</p>
                        <p className="opacity-75">
                          {t.rich("auth.jwtRefreshAccessTokenDesc", renderHtmlText)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 p-2 bg-white/50 rounded">
                      <span className="shrink-0 font-bold text-amber-600">🍪</span>
                      <div>
                        <p className="font-medium">{t("auth.jwtRefreshCookieTitle")}</p>
                        <p className="opacity-75">
                          {t.rich("auth.jwtRefreshCookieDesc", renderHtmlText)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 p-2 bg-white/50 rounded">
                      <span className="shrink-0 font-bold text-amber-600">🔄</span>
                      <div>
                        <p className="font-medium">{t("auth.jwtRotationTitle")}</p>
                        <p className="opacity-75">{t("auth.jwtRefreshRotationDesc")}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 p-2 bg-white/50 rounded">
                      <span className="shrink-0 font-bold text-amber-600">🌐</span>
                      <div>
                        <p className="font-medium">{t("auth.jwtSilentRefreshTitle")}</p>
                        <p className="opacity-75">{t("auth.jwtSilentRefreshDesc")}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 p-2 bg-white/50 rounded">
                      <span className="shrink-0 font-bold text-amber-600">⚡</span>
                      <div>
                        <p className="font-medium">
                          {t("auth.jwtCountdownTitle", { seconds: timeLeft })}
                        </p>
                        <p className="opacity-75">
                          {t.rich("auth.jwtCountdownDesc", renderHtmlText)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={refresh}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-current/20 rounded text-xs font-medium hover:bg-white/80 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    {t("auth.jwtManualRefreshButton")}
                  </button>
                  <button
                    onClick={logout}
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
