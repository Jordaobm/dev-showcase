import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Inter } from "next/font/google";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { MotionConfig } from "motion/react";
import { OfflineDetector } from "../_components/OfflineDetector";
import "../globals.css";
import { ReactQueryProvider } from "@/features/shared/providers/ReactQueryProvider";
import { getSiteUrl } from "@/lib/site-url";
import { routing } from "@/i18n/routing";

const inter = Inter({ subsets: ["latin"] });

const SITE_DESCRIPTION =
  "Um showcase técnico onde cada implementação demonstra uma competência real de engenharia de software. Arquitetura, performance, segurança, PWAs, Browser APIs, renderização 3D e muito mais, reunidos em experiências interativas.";

export const generateMetadata = async (): Promise<Metadata> => {
  const siteUrl = getSiteUrl();

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: "Dev Showcase | Jordão Beghetto Massariol",
      template: "%s | Dev Showcase",
    },
    description: SITE_DESCRIPTION,
    openGraph: {
      type: "website",
      siteName: "Dev Showcase",
      title: "Dev Showcase | Jordão Beghetto Massariol",
      description: SITE_DESCRIPTION,
    },
    twitter: {
      card: "summary_large_image",
      title: "Dev Showcase | Jordão Beghetto Massariol",
      description: SITE_DESCRIPTION,
    },
  };
};

export const generateStaticParams = () => {
  return routing.locales.map((locale) => ({ locale }));
};

const RootLayout = async ({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) => {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        <meta name="theme-color" content="#DC2626" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <script
          dangerouslySetInnerHTML={{
            __html:
              process.env.NODE_ENV === "production"
                ? `
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js');
      }
    `
                : `
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(function (registrations) {
          registrations.forEach(function (registration) { registration.unregister(); });
        });
      }
    `,
          }}
        />
      </head>
      <body className={`${inter.className} antialiased`}>
        <ReactQueryProvider>
          <NextIntlClientProvider messages={messages}>
            <MotionConfig reducedMotion="user">
              <OfflineDetector />
              {children}
            </MotionConfig>
          </NextIntlClientProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
};

export default RootLayout;
