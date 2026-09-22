"use client";

import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, Eye, EyeOff, Loader2, XCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { z } from "zod";
import { Button } from "@/features/shared/components/Button";
import {
  ApiError,
  forgotPassword,
  login as apiLogin,
  register as apiRegister,
  resetPassword,
} from "../services/api";
import { useSession } from "../hooks/useSession";

type TranslateFn = ReturnType<typeof useTranslations>;
type OperationStatus = "idle" | "loading" | "success" | "error";

const buildRegisterSchema = (t: TranslateFn) =>
  z.object({
    username: z
      .string()
      .min(1, t("chatAuthValidationUsernameRequired"))
      .regex(/^\S+$/, t("chatAuthValidationUsernameNoSpaces")),
    email: z
      .string()
      .min(1, t("chatAuthValidationEmailRequired"))
      .email(t("chatAuthValidationEmailInvalid")),
    password: z
      .string()
      .min(4, t("chatAuthValidationPasswordMin"))
      .regex(/[a-zA-Z]/, t("chatAuthValidationPasswordLetter"))
      .regex(/\d/, t("chatAuthValidationPasswordNumber"))
      .regex(/[^a-zA-Z0-9]/, t("chatAuthValidationPasswordSymbol")),
  });

const buildLoginSchema = (t: TranslateFn) =>
  z.object({
    email: z
      .string()
      .min(1, t("chatAuthValidationEmailRequired"))
      .email(t("chatAuthValidationEmailInvalid")),
    password: z.string().min(1, t("chatAuthValidationPasswordRequired")),
  });

const buildForgotSchema = (t: TranslateFn) =>
  z.object({
    email: z
      .string()
      .min(1, t("chatAuthValidationEmailRequired"))
      .email(t("chatAuthValidationEmailInvalid")),
  });

const buildResetSchema = (t: TranslateFn) =>
  z.object({
    newPassword: z
      .string()
      .min(4, t("chatAuthValidationPasswordMin"))
      .regex(/[a-zA-Z]/, t("chatAuthValidationPasswordLetter"))
      .regex(/\d/, t("chatAuthValidationPasswordNumber"))
      .regex(/[^a-zA-Z0-9]/, t("chatAuthValidationPasswordSymbol")),
  });

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

const inputClass = (hasError: boolean) =>
  `w-full px-3 py-2 bg-white border-2 rounded-lg text-sm text-gray-700 focus:outline-none transition-colors placeholder:text-gray-400 ${
    hasError
      ? "border-red-400 focus:border-red-500"
      : "border-gray-200 focus:border-red-400"
  }`;

export const ChatAuthGate = () => {
  const t = useTranslations("realtime");
  const { applySession } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const resetToken = searchParams.get("resetToken");

  const [view, setView] = useState<"credentials" | "forgot" | "reset">(
    resetToken ? "reset" : "credentials",
  );
  const [showPassword, setShowPassword] = useState(false);

  const registerSchema = useMemo(() => buildRegisterSchema(t), [t]);
  const loginSchema = useMemo(() => buildLoginSchema(t), [t]);
  const forgotSchema = useMemo(() => buildForgotSchema(t), [t]);
  const resetSchema = useMemo(() => buildResetSchema(t), [t]);

  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [forgotEmail, setForgotEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [registerStatus, setRegisterStatus] = useState<OperationStatus>("idle");
  const [loginStatus, setLoginStatus] = useState<OperationStatus>("idle");
  const [forgotStatus, setForgotStatus] = useState<OperationStatus>("idle");
  const [resetStatus, setResetStatus] = useState<OperationStatus>("idle");

  const [registerErrors, setRegisterErrors] = useState<Partial<Record<string, string>>>({});
  const [registerTouched, setRegisterTouched] = useState<Record<string, boolean>>({});
  const [loginErrors, setLoginErrors] = useState<Partial<Record<string, string>>>({});
  const [loginTouched, setLoginTouched] = useState<Record<string, boolean>>({});
  const [forgotTouched, setForgotTouched] = useState(false);
  const [resetTouched, setResetTouched] = useState(false);
  const [registerErrorCode, setRegisterErrorCode] = useState<string | undefined>();
  const [loginErrorCode, setLoginErrorCode] = useState<string | undefined>();
  const [resetErrorCode, setResetErrorCode] = useState<string | undefined>();

  const { mutateAsync: mutateRegister } = useMutation({ mutationFn: apiRegister });
  const { mutateAsync: mutateLogin } = useMutation({ mutationFn: apiLogin });
  const { mutateAsync: mutateForgot } = useMutation({ mutationFn: forgotPassword });
  const { mutateAsync: mutateReset } = useMutation({ mutationFn: resetPassword });

  const invalidRegister = !registerSchema.safeParse(registerData).success;
  const invalidLogin = !loginSchema.safeParse(loginData).success;
  const forgotErrors = extractFieldErrors(forgotSchema, { email: forgotEmail });
  const invalidForgot = !forgotSchema.safeParse({ email: forgotEmail }).success;
  const resetErrors = extractFieldErrors(resetSchema, { newPassword });
  const invalidReset = !resetSchema.safeParse({ newPassword }).success;

  const handleRegister = async () => {
    try {
      setRegisterStatus("loading");
      const user = await mutateRegister(registerData);
      applySession(user);
      setRegisterStatus("success");
    } catch (error) {
      setRegisterErrorCode(error instanceof ApiError ? error.code : undefined);
      setRegisterStatus("error");
    }
  };

  const handleLogin = async () => {
    try {
      setLoginStatus("loading");
      const user = await mutateLogin(loginData);
      applySession(user);
      setLoginStatus("success");
    } catch (error) {
      setLoginErrorCode(error instanceof ApiError ? error.code : undefined);
      setLoginStatus("error");
    }
  };

  const handleForgot = async () => {
    setForgotTouched(true);
    if (invalidForgot) return;

    try {
      setForgotStatus("loading");
      await mutateForgot(forgotEmail);
      setForgotStatus("success");
    } catch {
      setForgotStatus("error");
    }
  };

  const handleResetPassword = async () => {
    setResetTouched(true);
    if (invalidReset || !resetToken) return;

    try {
      setResetStatus("loading");
      await mutateReset({ token: resetToken, newPassword });
      setResetStatus("success");
    } catch (error) {
      setResetErrorCode(error instanceof ApiError ? error.code : undefined);
      setResetStatus("error");
    }
  };

  const goToLogin = () => {
    setView("credentials");
    setResetStatus("idle");
    setNewPassword("");
    router.replace(pathname);
  };

  const registerErrorMessage = (code: string | undefined) => {
    if (code === "email_taken") return t("chatAuthRegisterErrorEmailTaken");
    return t("chatAuthGenericError");
  };

  const loginErrorMessage = (code: string | undefined) => {
    if (code === "invalid_credentials") return t("chatAuthLoginErrorInvalid");
    return t("chatAuthGenericError");
  };

  const resetErrorMessage = (code: string | undefined) => {
    if (code === "invalid_or_expired_token") return t("chatAuthResetErrorInvalidToken");
    return t("chatAuthGenericError");
  };

  return (
    <div className="h-full flex items-center justify-center overflow-y-auto p-6 md:p-10 bg-gray-50">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-6">
          <h4 className="text-xl font-bold text-gray-900">{t("chatAuthTitle")}</h4>
          <p className="mt-1 text-sm text-gray-500">{t("chatAuthSubtitle")}</p>
        </div>

        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          {view === "reset" ? (
            <div className="max-w-md mx-auto">
              {resetStatus === "success" ? (
                <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-green-800">
                      {t("chatAuthResetSuccessTitle")}
                    </p>
                    <p className="text-xs text-green-700 mt-0.5">
                      {t("chatAuthResetSuccessDesc")}
                    </p>
                    <button
                      type="button"
                      onClick={goToLogin}
                      className="mt-2 text-xs font-medium text-green-800 hover:underline"
                    >
                      {t("chatAuthResetGoToLoginButton")}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="font-semibold text-amber-800">{t("chatAuthResetTitle")}</p>
                  <p className="mt-1 text-xs text-amber-700">{t("chatAuthResetDesc")}</p>
                  <div className="mt-3 flex flex-col gap-2">
                    <div>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          aria-label={t("chatAuthNewPasswordLabel")}
                          value={newPassword}
                          onChange={(e) => {
                            setNewPassword(e.target.value);
                            setResetTouched(true);
                          }}
                          placeholder={t("chatAuthNewPasswordPlaceholder")}
                          className={
                            inputClass(!!(resetTouched && resetErrors.newPassword)) + " pr-9"
                          }
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((s) => !s)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          aria-label={t("chatAuthTogglePasswordLabel")}
                        >
                          {showPassword ? (
                            <EyeOff className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      {resetTouched && resetErrors.newPassword && (
                        <p className="mt-1 text-xs text-red-600">
                          {resetErrors.newPassword}
                        </p>
                      )}
                    </div>
                    <Button
                      type="primary"
                      className="w-full"
                      disabled={resetStatus === "loading"}
                      onClick={handleResetPassword}
                    >
                      {resetStatus === "loading" ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {t("chatAuthResettingButton")}
                        </>
                      ) : (
                        t("chatAuthResetButton")
                      )}
                    </Button>
                    {resetStatus === "error" && (
                      <div className="flex items-center gap-1.5 text-red-700 text-xs">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>{resetErrorMessage(resetErrorCode)}</span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ) : view === "forgot" ? (
            <div className="max-w-md mx-auto">
              <button
                type="button"
                onClick={() => {
                  setView("credentials");
                  setForgotStatus("idle");
                }}
                className="text-xs font-medium text-amber-700 hover:underline mb-4"
              >
                {t("chatAuthForgotBackLink")}
              </button>

              {forgotStatus === "success" ? (
                <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-green-800">
                      {t("chatAuthForgotSuccessTitle")}
                    </p>
                    <p className="text-xs text-green-700 mt-0.5">
                      {t("chatAuthForgotSuccessDesc", { email: forgotEmail })}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <p className="font-semibold text-amber-800">{t("chatAuthForgotTitle")}</p>
                  <p className="mt-1 text-xs text-amber-700">{t("chatAuthForgotDesc")}</p>
                  <div className="mt-3 flex flex-col gap-2">
                    <div>
                      <input
                        type="email"
                        aria-label={t("chatAuthEmailLabel")}
                        value={forgotEmail}
                        onChange={(e) => {
                          setForgotEmail(e.target.value);
                          setForgotTouched(true);
                        }}
                        placeholder={t("chatAuthEmailPlaceholder")}
                        className={inputClass(!!(forgotTouched && forgotErrors.email))}
                      />
                      {forgotTouched && forgotErrors.email && (
                        <p className="mt-1 text-xs text-red-600">{forgotErrors.email}</p>
                      )}
                    </div>
                    <Button
                      type="primary"
                      className="w-full"
                      disabled={forgotStatus === "loading"}
                      onClick={handleForgot}
                    >
                      {forgotStatus === "loading" ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {t("chatAuthSendingButton")}
                        </>
                      ) : (
                        t("chatAuthForgotButton")
                      )}
                    </Button>
                    {forgotStatus === "error" && (
                      <div className="flex items-center gap-1.5 text-red-700 text-xs">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>{t("chatAuthGenericError")}</span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <p className="font-semibold text-amber-800">
                  {t("chatAuthRegisterStepTitle")}
                </p>
                <p className="mt-1 text-xs text-amber-700">
                  {t("chatAuthRegisterStepDesc")}
                </p>

                <div className="mt-3 flex flex-col gap-2">
                  <div>
                    <input
                      type="text"
                      aria-label={t("chatAuthUsernameLabel")}
                      value={registerData.username}
                      onChange={(e) => {
                        const next = { ...registerData, username: e.target.value };
                        setRegisterData(next);
                        setRegisterTouched((p) => ({ ...p, username: true }));
                        setRegisterErrors(extractFieldErrors(registerSchema, next));
                      }}
                      placeholder={t("chatAuthUsernamePlaceholder")}
                      className={inputClass(
                        !!(registerTouched.username && registerErrors.username),
                      )}
                    />
                    {registerTouched.username && registerErrors.username && (
                      <p className="mt-1 text-xs text-red-600">
                        {registerErrors.username}
                      </p>
                    )}
                  </div>
                  <div>
                    <input
                      type="email"
                      aria-label={t("chatAuthEmailLabel")}
                      value={registerData.email}
                      onChange={(e) => {
                        const next = { ...registerData, email: e.target.value };
                        setRegisterData(next);
                        setRegisterTouched((p) => ({ ...p, email: true }));
                        setRegisterErrors(extractFieldErrors(registerSchema, next));
                      }}
                      placeholder={t("chatAuthEmailPlaceholder")}
                      className={inputClass(
                        !!(registerTouched.email && registerErrors.email),
                      )}
                    />
                    {registerTouched.email && registerErrors.email && (
                      <p className="mt-1 text-xs text-red-600">{registerErrors.email}</p>
                    )}
                  </div>
                  <div>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        aria-label={t("chatAuthPasswordLabel")}
                        value={registerData.password}
                        onChange={(e) => {
                          const next = { ...registerData, password: e.target.value };
                          setRegisterData(next);
                          setRegisterTouched((p) => ({ ...p, password: true }));
                          setRegisterErrors(extractFieldErrors(registerSchema, next));
                        }}
                        placeholder={t("chatAuthPasswordPlaceholder")}
                        className={inputClass(
                          !!(registerTouched.password && registerErrors.password),
                        ) + " pr-9"}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        aria-label={t("chatAuthTogglePasswordLabel")}
                      >
                        {showPassword ? (
                          <EyeOff className="w-3.5 h-3.5" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                    {registerTouched.password && registerErrors.password && (
                      <p className="mt-1 text-xs text-red-600">
                        {registerErrors.password}
                      </p>
                    )}
                  </div>
                  <Button
                    type="primary"
                    onClick={handleRegister}
                    disabled={invalidRegister || registerStatus === "loading"}
                    className="w-full"
                  >
                    {registerStatus === "loading" ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {t("chatAuthRegisteringButton")}
                      </>
                    ) : (
                      t("chatAuthRegisterButton")
                    )}
                  </Button>
                </div>

                {registerStatus === "success" && (
                  <div className="mt-2 flex items-center gap-1.5 text-green-700 text-xs">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{t("chatAuthRegisterSuccess")}</span>
                  </div>
                )}
                {registerStatus === "error" && (
                  <div className="mt-2 flex items-center gap-1.5 text-red-700 text-xs">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>{registerErrorMessage(registerErrorCode)}</span>
                  </div>
                )}
              </div>

              <div className="hidden md:block w-px bg-amber-200" />
              <div className="md:hidden h-px bg-amber-200" />

              <div className="flex-1">
                <p className="font-semibold text-amber-800">
                  {t("chatAuthLoginStepTitle")}
                </p>
                <p className="mt-1 text-xs text-amber-700">{t("chatAuthLoginStepDesc")}</p>

                <div className="mt-3 flex flex-col gap-2">
                  <div>
                    <input
                      type="email"
                      aria-label={t("chatAuthEmailLabel")}
                      value={loginData.email}
                      onChange={(e) => {
                        const next = { ...loginData, email: e.target.value };
                        setLoginData(next);
                        setLoginTouched((p) => ({ ...p, email: true }));
                        setLoginErrors(extractFieldErrors(loginSchema, next));
                      }}
                      placeholder={t("chatAuthEmailPlaceholder")}
                      className={inputClass(!!(loginTouched.email && loginErrors.email))}
                    />
                    {loginTouched.email && loginErrors.email && (
                      <p className="mt-1 text-xs text-red-600">{loginErrors.email}</p>
                    )}
                  </div>
                  <div>
                    <input
                      type={showPassword ? "text" : "password"}
                      aria-label={t("chatAuthPasswordLabel")}
                      value={loginData.password}
                      onChange={(e) => {
                        const next = { ...loginData, password: e.target.value };
                        setLoginData(next);
                        setLoginTouched((p) => ({ ...p, password: true }));
                        setLoginErrors(extractFieldErrors(loginSchema, next));
                      }}
                      placeholder={t("chatAuthPasswordPlaceholder")}
                      className={inputClass(
                        !!(loginTouched.password && loginErrors.password),
                      )}
                    />
                    {loginTouched.password && loginErrors.password && (
                      <p className="mt-1 text-xs text-red-600">{loginErrors.password}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setView("forgot")}
                    className="self-start text-[11px] text-[var(--premium-red)] hover:underline font-medium"
                  >
                    {t("chatAuthForgotLink")}
                  </button>
                  <Button
                    type="primary"
                    onClick={handleLogin}
                    disabled={invalidLogin || loginStatus === "loading"}
                    className="w-full"
                  >
                    {loginStatus === "loading" ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {t("chatAuthLoggingInButton")}
                      </>
                    ) : (
                      t("chatAuthLoginButton")
                    )}
                  </Button>
                </div>

                {loginStatus === "error" && (
                  <div className="mt-2 flex items-center gap-1.5 text-red-700 text-xs">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>{loginErrorMessage(loginErrorCode)}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
