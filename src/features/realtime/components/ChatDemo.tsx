"use client";

import { useTranslations } from "next-intl";
import { SessionProvider, useSession } from "../hooks/useSession";
import { ChatAuthGate } from "./ChatAuthGate";
import { ChatWorkspace } from "./ChatWorkspace";

const ChatDemoBody = () => {
  const { isLoggedIn, initialized } = useSession();

  return (
    <div className="rounded-3xl border border-gray-200 shadow-sm overflow-hidden h-[640px] bg-white">
      {initialized && (isLoggedIn ? <ChatWorkspace /> : <ChatAuthGate />)}
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
