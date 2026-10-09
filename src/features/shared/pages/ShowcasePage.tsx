"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import dynamic from "next/dynamic";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { registry } from "@/registry/index";
import { Navbar } from "@/features/shared/components/Navbar";
import { MobileNavbar } from "@/features/shared/components/MobileNavbar";
import { Footer } from "@/features/shared/components/Footer";
import { ComingSoon } from "@/features/shared/components/ComingSoon";
import { ShowroomStage } from "@/features/shared/components/ShowroomStage";
import { resolveText } from "@/features/shared/utils/resolveText";
import { getDemoIcon } from "@/features/shared/utils/demoIcons";

const DEMO_COMPONENTS = Object.fromEntries(
  registry
    .filter((entry) => entry.component)
    .map((entry) => [entry.id, dynamic(entry.component!, { ssr: false })]),
);

const PANEL_SHADOW =
  "0 1px 2px rgba(0, 0, 0, 0.03), 0 8px 24px rgba(0, 0, 0, 0.06)";

const splitList = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

interface ShowcasePageProps {
  id: string;
}

export const ShowcasePage = ({ id }: Readonly<ShowcasePageProps>) => {
  const demo = registry.find((d) => d.id === id)!;
  const t = useTranslations();

  const currentIndex = registry.findIndex((d) => d.id === id);
  const prevDemo = registry[currentIndex - 1];
  const nextDemo = registry[currentIndex + 1];

  const DemoComponent = DEMO_COMPONENTS[demo.id] ?? null;
  const isLive = demo.status === "live";

  const specColumns = [
    {
      title: t("shared.components.technologies"),
      items: splitList(resolveText(t, demo.technologies)),
    },
    {
      title: t("shared.components.architecture"),
      items: splitList(resolveText(t, demo.architecture)),
    },
    {
      title: t("shared.components.keyConcepts"),
      items: splitList(resolveText(t, demo.concepts)),
    },
  ];

  return (
    <div className="min-h-screen showroom-environment px-6">
      <Navbar />
      <MobileNavbar />

      <main className="mx-auto max-w-6xl pt-32 pb-24">
        <header className="grid items-center gap-10 md:grid-cols-[1fr_280px]">
          <div>
            <Link
              href="/"
              className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors duration-300 hover:text-[var(--premium-red)]"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("shared.components.backToShowcase")}
            </Link>

            <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium">
              <span style={{ color: "var(--premium-red)" }}>
                {resolveText(t, demo.category)}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 ${
                  isLive ? "text-green-700" : "text-gray-500"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    isLive ? "bg-green-600" : "bg-gray-400"
                  }`}
                />
                {isLive
                  ? t("shared.components.liveDemo")
                  : t("shared.components.comingSoon")}
              </span>
            </div>

            <h1 className="mb-4 text-3xl font-semibold leading-tight sm:text-5xl">
              {resolveText(t, demo.name)}
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-gray-600 sm:text-lg">
              {resolveText(t, demo.description)}
            </p>

            {demo.longDescription && (
              <details className="group/about mt-6 max-w-2xl">
                <summary className="cursor-pointer text-sm font-medium text-[var(--premium-red)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--premium-red)]">
                  {t("shared.components.aboutDemo")}
                </summary>
                <p className="mt-3 leading-relaxed text-gray-600">
                  {resolveText(t, demo.longDescription)}
                </p>
              </details>
            )}
          </div>

          <div
            className="group hidden overflow-hidden rounded-3xl border border-gray-200/70 md:block"
            style={{ boxShadow: PANEL_SHADOW }}
          >
            <ShowroomStage icon={getDemoIcon(demo.id)} active={isLive} />
          </div>
        </header>

        <section className="mt-14" aria-labelledby="demo-area-heading">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <h2 id="demo-area-heading" className="text-lg font-semibold">
              {isLive
                ? t("shared.components.interactiveDemoArea")
                : t("shared.components.demoArea")}
            </h2>
            <p className="text-sm text-gray-500">
              {isLive
                ? t("shared.components.interactiveDemoAreaDescription")
                : t("shared.components.demoAreaDescription")}
            </p>
          </div>

          {DemoComponent ? (
            <div
              className="rounded-[32px] border border-gray-200/70 bg-white p-4 sm:p-8"
              style={{ boxShadow: PANEL_SHADOW }}
            >
              <DemoComponent />
            </div>
          ) : (
            <ComingSoon demoName={demo.name} />
          )}
        </section>

        <section className="mt-16" aria-labelledby="tech-sheet-heading">
          <h2 id="tech-sheet-heading" className="mb-4 text-lg font-semibold">
            {t("shared.components.technicalSheet")}
          </h2>
          <div
            className="grid divide-y divide-gray-100 rounded-3xl border border-gray-200/70 bg-white md:grid-cols-3 md:divide-x md:divide-y-0"
            style={{ boxShadow: PANEL_SHADOW }}
          >
            {specColumns.map((column) => (
              <div key={column.title} className="p-6 sm:p-8">
                <h3 className="mb-4 text-sm font-semibold text-gray-900">
                  {column.title}
                </h3>
                <ul className="space-y-2 text-sm leading-relaxed text-gray-600">
                  {column.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <nav
          aria-label="Demos"
          className="mt-16 grid gap-6 border-t border-gray-200/70 pt-8 md:grid-cols-2"
        >
          {prevDemo && (
            <Link href={`/showcase/${prevDemo.id}`} className="group block">
              <span className="mb-1 flex items-center gap-2 text-sm text-gray-500">
                <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
                {t("shared.components.previousDemo")}
              </span>
              <span className="text-lg font-medium transition-colors group-hover:text-[var(--premium-red)]">
                {resolveText(t, prevDemo.name)}
              </span>
            </Link>
          )}
          {nextDemo && (
            <Link
              href={`/showcase/${nextDemo.id}`}
              className="group block md:col-start-2 md:text-right"
            >
              <span className="mb-1 flex items-center gap-2 text-sm text-gray-500 md:justify-end">
                {t("shared.components.nextDemo")}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
              <span className="text-lg font-medium transition-colors group-hover:text-[var(--premium-red)]">
                {resolveText(t, nextDemo.name)}
              </span>
            </Link>
          )}
        </nav>
      </main>

      <Footer />
    </div>
  );
};
