"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { SessionProvider, useSession } from "../hooks/useSession";
import { ChatAuthGate } from "./ChatAuthGate";
import { ChatWorkspace } from "./ChatWorkspace";

const RESET_TOKEN_PARAM = "resetToken";

const removeResetTokenFromUrl = () => {
  const url = new URL(window.location.href);
  if (!url.searchParams.has(RESET_TOKEN_PARAM)) return;
  url.searchParams.delete(RESET_TOKEN_PARAM);
  window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
};

const ChatDemoBody = () => {
  const { isLoggedIn, initialized } = useSession();
  const urlToken = useSearchParams().get(RESET_TOKEN_PARAM);

  // O token vive no estado, não na URL: assim a tela não depende de a URL ser
  // limpa corretamente (router.replace não limpa a query em produção).
  const [resetToken, setResetToken] = useState<string | null>(urlToken);
  if (urlToken && urlToken !== resetToken) setResetToken(urlToken);

  useEffect(() => {
    if (urlToken) removeResetTokenFromUrl();
  }, [urlToken]);

  const showAuthGate = !isLoggedIn || !!resetToken;

  return (
    <div className="rounded-3xl border border-gray-200 shadow-sm overflow-hidden h-[640px] bg-white">
      {initialized &&
        (showAuthGate ? (
          <ChatAuthGate
            resetToken={resetToken}
            onResetFinished={() => setResetToken(null)}
          />
        ) : (
          <ChatWorkspace />
        ))}
    </div>
  );
};

export const ChatDemo = () => {
  const t = useTranslations("realtime");

  return (
    <div className="mt-12" id="chat-demo">
      <h3 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
        {t("chatDemoTitle")}
      </h3>
      <p className="mt-2 text-gray-600">{t("chatDemoIntro")}</p>

      <div className="mt-4">
        <SessionProvider>
          <ChatDemoBody />
        </SessionProvider>
      </div>
    </div>
  );
};
