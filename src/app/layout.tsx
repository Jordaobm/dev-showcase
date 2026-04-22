import { Inter } from "next/font/google";
import { getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { MotionConfig } from "motion/react";
import { OfflineDetector } from "./_components/OfflineDetector";
import "./globals.css";
import { ReactQueryProvider } from "@/features/shared/providers/ReactQueryProvider";

const inter = Inter({ subsets: ["latin"] });

const RootLayout = async ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const messages = await getMessages();

  return (
    <html lang="pt-BR">
      <head>
        <meta name="theme-color" content="#DC2626" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js');
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
