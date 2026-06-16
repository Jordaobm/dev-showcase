"use client";

import { useTranslations } from "next-intl";
import { DemoPageLayout } from "@/features/shared/components/DemoPageLayout";
import { JWTTokenSection } from "../components/JWTTokenSection";
import { OAuthSection } from "../components/OAuth";
import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { SessionProvider } from "../hooks/useSession";
import { TOTPSection } from "../components/TOTP";
import { MagicLinkSection } from "../components/MagicLink";
import { WebAuthnAPISection } from "../components/WebAuthnAPISection";

const FEATURES = [
  {
    label: "JWT (JSON Web Token)",
    id: "jwttoken",
    done: true,
  },
  {
    label: "OAuth 2.0",
    id: "oauth",
    done: true,
  },
  {
    label: "TOTP",
    id: "totp",
    done: true,
  },
  {
    label: "Magic Link",
    id: "magiclink",
    done: true,
  },
  {
    label: "WebAuthn (Passkeys)",
    id: "pwa-web-authn-api",
    done: true,
  },
] as { label: string; id: string | null; done: boolean }[];

export const AuthDemo = () => {
  const t = useTranslations();

  return (
    <DemoPageLayout
      name={t("auth.name")}
      description={t("auth.shortDescription")}
      summaryLabel={t("auth.summary")}
      features={FEATURES}
    >
      <SessionProvider>
        <JWTTokenSection />
        <NextAuthSessionProvider>
          <OAuthSection />
        </NextAuthSessionProvider>
        <TOTPSection />
        <MagicLinkSection />
        <WebAuthnAPISection />
      </SessionProvider>
    </DemoPageLayout>
  );
};
