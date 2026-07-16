"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { ArrowLeft, ArrowRight, Code2 } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { registry } from "@/registry/index";
import { Navbar } from "@/features/shared/components/Navbar";
import { MobileNavbar } from "@/features/shared/components/MobileNavbar";
import { Footer } from "@/features/shared/components/Footer";
import { ComingSoon } from "@/features/shared/components/ComingSoon";
import { SOCIAL_LINKS } from "@/lib/social-links";
import { resolveText } from "@/features/shared/utils/resolveText";

const DEMO_COMPONENTS = Object.fromEntries(
  registry
    .filter((entry) => entry.component)
    .map((entry) => [entry.id, dynamic(entry.component!, { ssr: false })]),
);

interface ShowcasePageProps {
  id: string;
}

export const ShowcasePage = ({ id }: Readonly<ShowcasePageProps>) => {
  const demo = registry.find((d) => d.id === id)!;
  const t = useTranslations();
  const { scrollY } = useScroll();

  const heroY = useTransform(scrollY, [0, 400], [0, 120]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.8]);

  const currentIndex = registry.findIndex((d) => d.id === id);
  const prevDemo = registry[currentIndex - 1];
  const nextDemo = registry[currentIndex + 1];

  const DemoComponent = DEMO_COMPONENTS[demo.id] ?? null;

  return (
    <div className="min-h-screen showroom-environment px-6">
      <Navbar />
      <MobileNavbar />

      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div
          className="ambient-orb"
          style={{
            width: "500px",
            height: "500px",
            background:
              "radial-gradient(circle, rgba(220, 38, 38, 0.12), transparent)",
            top: "10%",
            right: "10%",
          }}
        />
      </div>

      <motion.section
        className="relative pt-32 pb-24 overflow-hidden"
        style={{ y: heroY, opacity: heroOpacity }}
      >
        <div className="spotlight-beam" />

        <div className="absolute inset-0 -z-10" />

        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ x: -20 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm hover:bg-white/80 transition-colors duration-300"
              style={{
                background: "rgba(255, 255, 255, 0.6)",
                border: "1px solid rgba(255, 255, 255, 0.4)",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
              }}
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">
                {t("shared.components.backToShowcase")}
              </span>
            </Link>
          </motion.div>
          <motion.div
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex items-center gap-3 mb-6 flex-wrap"
          >
            <span
              className="inline-block px-4 py-2 rounded-full backdrop-blur-sm font-medium"
              style={{
                background: "rgba(220, 38, 38, 0.1)",
                border: "1px solid rgba(220, 38, 38, 0.2)",
                color: "var(--premium-red)",
              }}
            >
              {resolveText(t, demo.category)}
            </span>
            {demo.status === "live" ? (
              <span
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full font-medium text-white text-sm"
                style={{
                  background: "linear-gradient(135deg, #16A34A, #15803D)",
                }}
              >
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                {t("shared.components.liveDemo")}
              </span>
            ) : (
              <span
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full font-medium text-sm"
                style={{
                  background: "rgba(107, 114, 128, 0.1)",
                  border: "1px solid rgba(107, 114, 128, 0.2)",
                  color: "#6B7280",
                }}
              >
                {t("shared.components.comingSoon")}
              </span>
            )}
          </motion.div>
          <motion.h1
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-3xl sm:text-7xl mb-6 font-medium"
          >
            {resolveText(t, demo.name)}
          </motion.h1>
          <motion.p
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-sm sm:text-2xl text-gray-600 mb-8 max-w-3xl leading-relaxed"
          >
            {resolveText(t, demo.longDescription ?? demo.description)}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-wrap gap-3"
          >
            {resolveText(t, demo.tags)
              .split(",")
              .map((tag) => (
                <span
                  key={tag}
                  className="px-4 py-2 rounded-xl backdrop-blur-sm font-medium"
                  style={{
                    background: "rgba(255, 255, 255, 0.7)",
                    border: "1px solid rgba(255, 255, 255, 0.4)",
                    boxShadow:
                      "0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
                  }}
                >
                  {tag}
                </span>
              ))}
          </motion.div>
          <section className="py-16 relative">
            <div
              className="absolute inset-0 -z-10"
              style={{
                background:
                  "linear-gradient(180deg, transparent 0%, rgba(248, 249, 250, 0.5) 100%)",
              }}
            />

            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-3 gap-8">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="p-8 rounded-3xl bg-white glass-reflection card-inner-glow"
                  style={{
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.5)",
                  }}
                >
                  <h2
                    className="text-xl mb-6 font-semibold"
                    style={{ color: "var(--premium-red)" }}
                  >
                    {t("shared.components.technologies")}
                  </h2>
                  <ul className="space-y-3">
                    {resolveText(t, demo.technologies)
                      .split(",")
                      .map((tech) => (
                        <li key={tech} className="flex items-center gap-3">
                          <div
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ background: "var(--premium-red)" }}
                          />
                          <span className="text-gray-700 font-medium">
                            {tech}
                          </span>
                        </li>
                      ))}
                  </ul>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="p-8 rounded-3xl bg-white glass-reflection card-inner-glow"
                  style={{
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.5)",
                  }}
                >
                  <h2
                    className="text-xl mb-6 font-semibold"
                    style={{ color: "var(--tech-cyan)" }}
                  >
                    {t("shared.components.architecture")}
                  </h2>
                  <ul className="space-y-3">
                    {resolveText(t, demo.architecture)
                      .split(",")
                      .map((tech) => (
                        <li key={tech} className="flex items-center gap-3">
                          <div
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ background: "var(--tech-cyan)" }}
                          />
                          <span className="text-gray-700 font-medium">
                            {tech}
                          </span>
                        </li>
                      ))}
                  </ul>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="p-8 rounded-3xl bg-white glass-reflection card-inner-glow"
                  style={{
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.5)",
                  }}
                >
                  <h2 className="text-xl mb-6 font-semibold">
                    {t("shared.components.keyConcepts")}
                  </h2>
                  <ul className="space-y-3">
                    {resolveText(t, demo.concepts)
                      .split(",")
                      .map((concept) => (
                        <li key={concept} className="flex items-center gap-3">
                          <div
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ background: "rgba(0, 0, 0, 0.97)" }}
                          />
                          <span className="text-gray-700 font-medium">
                            {concept}
                          </span>
                        </li>
                      ))}
                  </ul>
                </motion.div>
              </div>
            </div>
          </section>
          <section className="py-24">
            <div className="max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="mb-10"
              >
                <h2 className="text-4xl font-semibold mb-2 flex items-center gap-3">
                  {demo.status === "live" ? (
                    <>
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ background: "#16A34A" }}
                      />
                      {t("shared.components.interactiveDemoArea")}
                    </>
                  ) : (
                    <>
                      <span className="w-3 h-3 rounded-full bg-gray-300" />
                      {t("shared.components.demoArea")}
                    </>
                  )}
                </h2>
                <p className="text-gray-500">
                  {demo.status === "live"
                    ? t("shared.components.interactiveDemoAreaDescription")
                    : t("shared.components.demoAreaDescription")}
                </p>
              </motion.div>

              {DemoComponent ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  <DemoComponent />
                </motion.div>
              ) : (
                <ComingSoon demoName={demo.name} />
              )}
            </div>
          </section>
          {demo.status === "live" && (
            <section className="pb-8">
              <div className="max-w-6xl mx-auto">
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="flex items-center justify-center"
                >
                  <a
                    href={`${SOCIAL_LINKS.githubRepo}/tree/main/src/features`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 py-3 rounded-2xl text-sm font-medium transition-transform hover:scale-105"
                    style={{
                      background: "rgba(255, 255, 255, 0.8)",
                      border: "1px solid rgba(0, 0, 0, 0.08)",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.06)",
                    }}
                  >
                    <Code2 className="w-4 h-4 text-gray-500" />
                    {t("shared.components.sourceCode")}
                  </a>
                </motion.div>
              </div>
            </section>
          )}
          <section className="py-20">
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-2 gap-8">
                {prevDemo && (
                  <Link href={`/showcase/${prevDemo.id}`}>
                    <motion.div
                      className="p-8 rounded-3xl bg-white group cursor-pointer glass-reflection card-inner-glow"
                      style={{
                        boxShadow: `0 4px 12px rgba(0,0,0,0.06), 0 12px 24px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)`,
                        border: "1px solid rgba(255,255,255,0.5)",
                      }}
                      whileHover={{ y: -6, scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex items-center gap-3 text-gray-500 mb-3">
                        <ArrowLeft className="w-5 h-5" />
                        <span className="text-sm font-medium">
                          {t("shared.components.previousDemo")}
                        </span>
                      </div>
                      <h2 className="text-2xl mb-2 font-medium group-hover:text-[var(--premium-red)] transition-colors">
                        {resolveText(t, prevDemo.name)}
                      </h2>
                      <p className="text-gray-600 leading-relaxed text-sm">
                        {resolveText(t, prevDemo.description)}
                      </p>
                    </motion.div>
                  </Link>
                )}

                {nextDemo && (
                  <Link href={`/showcase/${nextDemo.id}`}>
                    <motion.div
                      className="p-8 rounded-3xl bg-white group cursor-pointer glass-reflection card-inner-glow md:text-right"
                      style={{
                        boxShadow: `0 4px 12px rgba(0,0,0,0.06), 0 12px 24px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)`,
                        border: "1px solid rgba(255,255,255,0.5)",
                      }}
                      whileHover={{ y: -6, scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex items-center justify-end gap-3 text-gray-500 mb-3">
                        <span className="text-sm font-medium">
                          {t("shared.components.nextDemo")}
                        </span>
                        <ArrowRight className="w-5 h-5" />
                      </div>
                      <h2 className="text-2xl mb-2 font-medium group-hover:text-[var(--premium-red)] transition-colors">
                        {resolveText(t, nextDemo.name)}
                      </h2>
                      <p className="text-gray-600 leading-relaxed text-sm">
                        {resolveText(t, nextDemo.description)}
                      </p>
                    </motion.div>
                  </Link>
                )}
              </div>
            </div>
          </section>
        </div>
      </motion.section>

      <Footer />
    </div>
  );
};
