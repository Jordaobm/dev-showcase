"use client";

import { Button } from "@/features/shared/components/Button";
import { useMutation } from "@tanstack/react-query";
import {
  CheckCircle,
  Fingerprint,
  KeyRound,
  Loader2,
  Server,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import {
  finishAuth,
  finishRegister,
  initAuth,
  initRegister,
  IRequestFinishAuth,
  IRequestFinishRegister,
  IRequestInit,
  IResponseFinish,
} from "../services/api";
import { AxiosError, AxiosResponse } from "axios";
import { base64urlToUint8Array } from "@/features/shared/utils/base64urlToUint8Array";
import { arrayBufferToBase64url } from "@/features/shared/utils/arrayBufferToBase64url";
import { renderHtmlText } from "@/features/shared/utils/renderHtmlText";
import type { OperationStatus } from "../types/OperationStatus";

interface LastOperation {
  type: "webauthn.create" | "webauthn.get";
  credentialId: string;
  challenge: string;
  origin: string;
  timestamp: string;
}

export const WebAuthnAPISection = () => {
  const t = useTranslations();
  const [username, setUsername] = useState("");
  const [registerStatus, setRegisterStatus] =
    useState<OperationStatus>("idle");
  const [authStatus, setAuthStatus] = useState<OperationStatus>("idle");
  const [credentials, setCredentials] = useState<IResponseFinish[]>([]);
  const [lastOperation, setLastOperation] = useState<LastOperation | null>(
    null,
  );
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    setIsSupported(
      typeof window !== "undefined" &&
        !!window.PublicKeyCredential &&
        !!navigator.credentials,
    );
  }, []);

  const { mutateAsync: mutateInitRegister } = useMutation<
    AxiosResponse,
    AxiosError,
    IRequestInit
  >({
    mutationFn: initRegister,
  });

  const { mutateAsync: mutateFinishRegister } = useMutation<
    AxiosResponse<IResponseFinish>,
    AxiosError,
    IRequestFinishRegister
  >({
    mutationFn: finishRegister,
  });

  const { mutateAsync: mutateInitAuth } = useMutation<
    AxiosResponse,
    AxiosError,
    void
  >({
    mutationFn: initAuth,
  });

  const { mutateAsync: mutateFinishAuth } = useMutation<
    AxiosResponse<IResponseFinish>,
    AxiosError,
    IRequestFinishAuth
  >({
    mutationFn: finishAuth,
  });

  const handleRegister = async () => {
    setRegisterStatus("loading");
    try {
      const { data: registerOptions } = await mutateInitRegister({ username });

      const credential = await navigator.credentials.create({
        publicKey: {
          ...registerOptions,
          challenge: base64urlToUint8Array(registerOptions.challenge),
          user: {
            ...registerOptions.user,
            id: base64urlToUint8Array(registerOptions.user.id),
          },
        },
      });

      if (!credential) {
        throw new Error("Não foi possivel criar a credencial");
      }

      if (!(credential instanceof PublicKeyCredential)) {
        throw new TypeError("Credencial inválida");
      }

      const attestation =
        credential.response as AuthenticatorAttestationResponse;

      const { data: registerResult } = await mutateFinishRegister({
        username,
        id: String(credential.id),
        response: {
          clientDataJSON: arrayBufferToBase64url(attestation.clientDataJSON),
          attestationObject: arrayBufferToBase64url(
            attestation.attestationObject,
          ),
          publicKey: arrayBufferToBase64url(attestation.getPublicKey()!),
          publicKeyAlgorithm: attestation.getPublicKeyAlgorithm(),
          transports: attestation.getTransports(),
        },
      });

      setCredentials((prev) => [...prev, registerResult]);
      setRegisterStatus("success");
      setUsername("");
    } catch {
      setRegisterStatus("error");
    }
  };

  const handleAuthenticate = async () => {
    setAuthStatus("loading");

    try {
      const { data: authOptions } = await mutateInitAuth();

      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: base64urlToUint8Array(authOptions.challenge),
          allowCredentials: [],
          rpId: authOptions?.rpId,
          timeout: authOptions?.timeout,
        },
      });

      if (!credential) {
        throw new Error("Não foi possivel obter a credencial");
      }

      if (!(credential instanceof PublicKeyCredential)) {
        throw new TypeError("Credencial inválida");
      }

      const assertion = credential.response as AuthenticatorAssertionResponse;

      const { data: authResult } = await mutateFinishAuth({
        id: String(credential.id),
        response: {
          clientDataJSON: arrayBufferToBase64url(assertion.clientDataJSON),
          authenticatorData: arrayBufferToBase64url(
            assertion.authenticatorData,
          ),
          signature: arrayBufferToBase64url(assertion.signature),
        },
      });

      if (!authResult.verified) throw new Error("Assinatura inválida");

      setLastOperation({
        type: "webauthn.get",
        credentialId: authResult.credentialId,
        challenge: authResult.clientData.challenge,
        origin: authResult.clientData.origin,
        timestamp: new Date().toISOString(),
      });

      setAuthStatus("success");
    } catch {
      setAuthStatus("error");
    }
  };

  return (
    <div id="pwa-web-authn-api" className="mt-12">
      <h3 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
        {t("auth.webAuthnTitle")}
      </h3>

      <div className="text-gray-600">
        <p>{t.rich("auth.webAuthnDesc1", renderHtmlText)}</p>
        <br />
        <p>{t("auth.webAuthnDesc2")}</p>
        <br />
        <p>{t.rich("auth.webAuthnDesc3", renderHtmlText)}</p>
        <br />
        <p>{t.rich("auth.webAuthnDesc4", renderHtmlText)}</p>
        <br />
        <p>{t("auth.webAuthnDesc5")}</p>
      </div>

      <h4 className="mt-8 text-lg font-semibold text-gray-700">
        {t("auth.webAuthnQATitle")}
      </h4>

      <div className="mt-4 space-y-6">
        <div className="border-l-2 border-red-200 pl-4">
          <p className="font-semibold text-gray-800">
            {t("auth.webAuthnQ1")}
          </p>
          <p className="mt-2 text-gray-600">
            {t.rich("auth.webAuthnA1", renderHtmlText)}
          </p>
        </div>
        <div className="border-l-2 border-red-200 pl-4">
          <p className="font-semibold text-gray-800">
            {t("auth.webAuthnQ2")}
          </p>
          <p className="mt-2 text-gray-600">{t("auth.webAuthnA2")}</p>
        </div>
        <div className="border-l-2 border-red-200 pl-4">
          <p className="font-semibold text-gray-800">
            {t("auth.webAuthnQ3")}
          </p>
          <p className="mt-2 text-gray-600">{t("auth.webAuthnA3")}</p>
        </div>
        <div className="border-l-2 border-red-200 pl-4">
          <p className="font-semibold text-gray-800">
            {t("auth.webAuthnQ4")}
          </p>
          <p className="mt-2 text-gray-600">
            {t.rich("auth.webAuthnA4", renderHtmlText)}
          </p>
        </div>
        <div className="border-l-2 border-red-200 pl-4">
          <p className="font-semibold text-gray-800">
            {t("auth.webAuthnQ5")}
          </p>
          <p className="mt-2 text-gray-600">{t("auth.webAuthnA5")}</p>
        </div>
        <div className="border-l-2 border-red-200 pl-4">
          <p className="font-semibold text-gray-800">
            {t("auth.webAuthnQ6")}
          </p>
          <p className="mt-2 text-gray-600">
            {t.rich("auth.webAuthnA6", renderHtmlText)}
          </p>
        </div>
        <div className="border-l-2 border-red-200 pl-4">
          <p className="font-semibold text-gray-800">
            {t("auth.webAuthnQ7")}
          </p>
          <p className="mt-2 text-gray-600">
            {t.rich("auth.webAuthnA7", renderHtmlText)}
          </p>
        </div>
      </div>

      <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded text-sm text-amber-900">
        <p className="font-bold">{t("auth.howToUseLabel")}</p>
        <p className="mt-2">{t("auth.webAuthnHowToUseDesc")}</p>

        <div className="mt-4 flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <p className="font-semibold text-amber-800">
              {t("auth.webAuthnStep1Title")}
            </p>
            <p className="mt-1 text-xs text-amber-700">
              {t("auth.webAuthnStep1Desc")}
            </p>

            <div className="mt-3 flex flex-col gap-2">
              <input
                type="text"
                aria-label={t("auth.webAuthnUsernameFieldLabel")}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t("auth.webAuthnUsernamePlaceholder")}
                className="w-full px-3 py-2 bg-white border-2 border-amber-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-red-400 transition-colors placeholder:text-gray-400"
              />
              <Button
                type="primary"
                onClick={handleRegister}
                disabled={
                  !isSupported ||
                  !username.trim() ||
                  registerStatus === "loading"
                }
                className="w-full"
              >
                {registerStatus === "loading" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t("auth.webAuthnRegisteringButton")}
                  </>
                ) : (
                  <>
                    <Fingerprint className="w-4 h-4" />
                    {t("auth.webAuthnRegisterButton")}
                  </>
                )}
              </Button>
            </div>

            {!isSupported && (
              <div className="mt-2 flex items-center gap-1.5 text-amber-700 text-xs">
                <XCircle className="w-3.5 h-3.5" />
                <span>{t("auth.webAuthnUnsupportedMessage")}</span>
              </div>
            )}
            {registerStatus === "success" && (
              <div className="mt-2 flex items-center gap-1.5 text-green-700 text-xs">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{t("auth.webAuthnStatusRegistered")}</span>
              </div>
            )}
            {registerStatus === "error" && (
              <div className="mt-2 flex items-center gap-1.5 text-red-700 text-xs">
                <XCircle className="w-3.5 h-3.5" />
                <span>{t("auth.webAuthnStatusError")}</span>
              </div>
            )}
          </div>

          <div className="hidden md:block w-px bg-amber-200" />
          <div className="md:hidden h-px bg-amber-200" />

          <div className="flex-1">
            <p className="font-semibold text-amber-800">
              {t("auth.webAuthnStep2Title")}
            </p>
            <p className="mt-1 text-xs text-amber-700">
              {t("auth.webAuthnStep2Desc")}
            </p>

            <div className="mt-3">
              <Button
                type="primary"
                onClick={handleAuthenticate}
                disabled={
                  !isSupported ||
                  credentials.length === 0 ||
                  authStatus === "loading"
                }
                className="w-full"
              >
                {authStatus === "loading" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t("auth.webAuthnAuthenticatingButton")}
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    {t("auth.webAuthnAuthButton")}
                  </>
                )}
              </Button>
            </div>

            {authStatus === "success" && (
              <div className="mt-2 flex items-center gap-1.5 text-green-700 text-xs">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{t("auth.webAuthnStatusAuthenticated")}</span>
              </div>
            )}
            {authStatus === "error" && (
              <div className="mt-2 flex items-center gap-1.5 text-red-700 text-xs">
                <XCircle className="w-3.5 h-3.5" />
                <span>{t("auth.webAuthnStatusError")}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 border rounded-lg bg-gray-50">
          <div className="flex items-center gap-2 mb-1">
            <Server className="w-4 h-4 text-gray-400" />
            <p className="text-sm font-semibold text-gray-700">
              {t("auth.webAuthnServerTitle")}
            </p>
          </div>
          <p className="text-xs text-gray-400 mb-3">
            {t("auth.webAuthnServerCredentials")}
          </p>

          {credentials.length === 0 ? (
            <p className="text-xs text-gray-400 italic">
              {t("auth.webAuthnServerEmpty")}
            </p>
          ) : (
            <ul className="space-y-2">
              {credentials.map((cred) => (
                <li
                  key={cred.credentialId}
                  className="flex items-start gap-2 p-2 bg-white border rounded text-xs"
                >
                  <KeyRound className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium text-gray-700">
                      {cred.clientData.challenge}
                    </p>
                    <p className="text-gray-400 font-mono truncate">
                      id: {cred.credentialId.slice(0, 28)}…
                    </p>
                    <p className="text-gray-400">{cred.verified}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="p-4 border rounded-lg bg-gray-50">
          <p className="text-sm font-semibold text-gray-700 mb-3">
            {t("auth.webAuthnServerLastOp")}
          </p>

          {!lastOperation ? (
            <p className="text-xs text-gray-400 italic">
              {t("auth.webAuthnServerNoOp")}
            </p>
          ) : (
            <pre className="text-xs text-gray-600 font-mono bg-white border rounded p-3 overflow-x-auto leading-relaxed">
              {JSON.stringify(lastOperation, null, 2)}
            </pre>
          )}
        </div>
      </div>

      <div className="mt-4 p-4 border rounded-lg">
        <p className="text-sm text-gray-600 mb-3">
          {t("auth.methodsTitle")}
        </p>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>{t.rich("auth.webAuthnMethod1", renderHtmlText)}</li>
          <li>{t.rich("auth.webAuthnMethod2", renderHtmlText)}</li>
        </ul>
      </div>
    </div>
  );
};
