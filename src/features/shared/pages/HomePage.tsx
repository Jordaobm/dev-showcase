"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Button } from "@/features/shared/components/Button";
import { Navbar } from "@/features/shared/components/Navbar";
import { MobileNavbar } from "@/features/shared/components/MobileNavbar";
import { Footer } from "@/features/shared/components/Footer";
import { DemoCard } from "@/features/shared/components/DemoCard";
import { FeaturedDemoLarge } from "@/features/shared/components/FeaturedDemoLarge";
import { FeaturedDemoSmall } from "@/features/shared/components/FeaturedDemoSmall";
import { CategoryFilter } from "@/features/shared/components/CategoryFilter";
import { registry } from "@/registry/index";
import { Sparkles, ArrowDown, ChevronRight, Zap } from "lucide-react";
import { useTranslations } from "next-intl";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import backgroundImage from "@/features/shared/assets/background.webp";

export const HomePage = () => {
  const t = useTranslations();
  const { isBelowBreakpoint } = useBreakpoint();

  const [selectedCategory, setSelectedCategory] = useState("All");
  const heroRef = useRef<HTMLElement>(null);

  const isMobile = isBelowBreakpoint;

  const { scrollYProgress: heroScrollProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroY = useTransform(heroScrollProgress, [0, 1], [0, 0]);
  const heroOpacity = useTransform(heroScrollProgress, [0, 1], [1, 0]);
  const heroScale = useTransform(
    heroScrollProgress,
    [0, 1],
    isMobile ? [1, 1] : [1, 0.9],
  );

  const categories = [
    "All",
    ...Array.from(new Set(registry.map((demo) => demo.category))),
  ];

  const filteredDemos = registry.filter(
    (demo) => selectedCategory === "All" || demo.category === selectedCategory,
  );

  const featuredDemos = registry.filter((demo) => demo.featured);
  const mainFeatured = featuredDemos[0];
  const secondaryFeatured = featuredDemos.slice(1, 3);

  const liveCount = registry.filter((d) => d.status === "live").length;
  const totalCount = registry.length;

  return (
    <div className="min-h-screen showroom-environment">
      <Navbar />
      <MobileNavbar />

      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="light-beam" style={{ left: "20%" }} />
        <div className="light-beam" style={{ left: "50%" }} />
        <div className="light-beam" style={{ left: "80%" }} />
      </div>

      <main>
        <motion.section
          ref={heroRef}
          className="relative pt-40 pb-32 overflow-hidden"
          style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
        >
        <div className="spotlight-beam" />

        <div
          className="absolute inset-0 -z-10 hidden xl:block"
          style={{
            background: `
              radial-gradient(ellipse at 50% 30%, rgba(255, 255, 255, 0.8), transparent 60%),
              radial-gradient(ellipse at 20% 0%, rgba(220, 38, 38, 0.08), transparent 50%),
              radial-gradient(ellipse at 80% 100%, rgba(6, 182, 212, 0.06), transparent 50%)
            `,
          }}
        />

        <div className="absolute inset-0 -z-20 xl:hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={backgroundImage.src}
            alt="Banner Dev Showcase"
            className="w-full h-full object-cover"
          />
          <div
            className="absolute inset-0 backdrop-blur-md"
            style={{ background: "rgba(12, 10, 10, 0.62)" }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-6">
          <div className="grid xl:grid-cols-2 gap-16 items-center">
            <div className="relative z-10">
              <motion.div
                initial={{ y: 30 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 backdrop-blur-sm"
                style={{
                  background: "rgba(255, 255, 255, 0.7)",
                  border: "1px solid rgba(255, 255, 255, 0.4)",
                  boxShadow:
                    "0 4px 12px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.9)",
                }}
              >
                <Sparkles
                  className="w-4 h-4"
                  style={{ color: "var(--premium-red)" }}
                />
                <span className="text-sm font-medium">
                  {t("shared.home.badgeFastText")}
                </span>
              </motion.div>

              <motion.h1
                data-testid="hero-heading"
                initial={{ y: 30 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-[32px] sm:text-[52px] leading-tight mb-6 font-semibold text-white xl:text-foreground"
              >
                {t("shared.home.badgeFirstTitle")}
                <br /> {t("shared.home.badgeSecondTitle")}{" "}
                <span
                  style={{
                    background: "linear-gradient(135deg, #DC2626, #B91C1C)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {t("shared.home.badgeThirdTitle")}
                </span>
              </motion.h1>

              <motion.h2
                initial={{ y: 30 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-[16px] sm:text-[22px] text-xl text-white/80 xl:text-gray-600 mb-6 leading-relaxed max-w-xl"
              >
                {t("shared.home.badgeDescription")}
              </motion.h2>

              <motion.div
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, delay: 0.45 }}
                className="flex-wrap sm:flex-nowrap flex items-center gap-6 mb-10"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-white"
                    style={{
                      background: "linear-gradient(135deg, #16A34A, #15803D)",
                    }}
                  >
                    <Zap className="w-3.5 h-3.5" />
                    {liveCount} {t("shared.home.live")}
                  </div>
                </div>
                <div className="text-sm text-white/70 xl:text-gray-500">
                  {totalCount} {t("shared.home.totalDemos")}
                </div>
                <div className="text-sm text-white/70 xl:text-gray-500">
                  {totalCount - liveCount} {t("shared.home.comingSoon")}
                </div>
              </motion.div>

              <motion.div
                initial={{ y: 30 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="flex-col sm:flex-row flex items-center gap-4"
              >
                <Button
                  type="primary"
                  size="lg"
                  onClick={() =>
                    document
                      .getElementById("featured")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="w-full sm:w-fit"
                >
                  <span>{t("shared.home.exploreShowcase")}</span>
                  <ChevronRight className="w-5 h-5" />
                </Button>

                <Button
                  type="secondary"
                  size="lg"
                  href="/sobre"
                  className="w-full sm:w-fit backdrop-blur-sm"
                >
                  {t("shared.home.meetAuthor")}
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </motion.div>
            </div>

            <motion.div
              initial={{ x: 50 }}
              animate={{ x: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="hidden xl:block relative"
            >
              <div className="relative rounded-3xl overflow-hidden floor-reflection">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={backgroundImage.src}
                  alt="Banner Dev Showcase"
                  className="w-full h-auto"
                  style={{
                    filter: "drop-shadow(0 20px 60px rgba(220, 38, 38, 0.3))",
                  }}
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, transparent 50%)",
                  }}
                />
              </div>

              <div
                className="absolute -inset-4 rounded-3xl -z-10"
                style={{
                  background:
                    "radial-gradient(ellipse, rgba(220, 38, 38, 0.3), transparent 70%)",
                  filter: "blur(40px)",
                  opacity: 0.65,
                }}
              />
            </motion.div>
          </div>
        </div>

        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm text-gray-400 font-medium">
              {t("shared.home.scrollToExplore")}
            </span>
            <ArrowDown className="w-5 h-5 text-gray-400" />
          </div>
        </motion.div>
      </motion.section>

      <section id="featured" className="py-32 px-6 relative">
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, rgba(248, 249, 250, 0.5) 100%)",
          }}
        />

        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16 text-center"
          >
            <span
              className="text-[12px] sm:text-sm font-semibold"
              style={{ color: "var(--premium-red)" }}
            >
              {t("shared.home.featuredShowcases")}
            </span>
            <h1 className="text-[22px] sm:text-6xl font-semibold mb-0 sm:mb-4">
              {t("shared.home.featuredTitle")}{" "}
              <span style={{ color: "var(--premium-red)" }}>
                {t("shared.home.featuredTitleRed")}
              </span>
            </h1>
            <h2 className="text-[16px] sm:text-xl text-gray-600 max-w-2xl mx-auto">
              {t("shared.home.featuredDescription")}
            </h2>
          </motion.div>

          <div className="grid xl:grid-cols-3 gap-8">
            <div className="mb-8 xl:mb-0 xl:col-span-2">
              {mainFeatured && (
                <FeaturedDemoLarge
                  demo={mainFeatured}
                  imageUrl={mainFeatured.imageUrl}
                />
              )}
            </div>
            <div className="flex flex-col gap-8">
              {secondaryFeatured.map((demo, index) => (
                <div key={demo.id} className="xl:flex-1 xl:min-h-0">
                  <FeaturedDemoSmall
                    demo={demo}
                    imageUrl={demo.imageUrl}
                    index={index}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="showcase" className="py-32 px-6 relative">
        <div
          className="absolute inset-0 -z-10"
          style={{
            background: `
              linear-gradient(180deg, rgba(248, 249, 250, 0.5) 0%, rgba(245, 245, 243, 0.8) 100%),
              repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.01) 2px, rgba(0, 0, 0, 0.01) 4px)
            `,
          }}
        />

        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16  text-center"
          >
            <span
              className="text-[12px] sm:text-sm font-semibold text-center mb-2"
              style={{ color: "var(--premium-red)" }}
            >
              {t("shared.home.exploreAllProjects")}
            </span>
            <h1 className="text-[22px] sm:text-6xl  font-semibold text-center mb-0 sm:mb-4">
              {t("shared.home.exploreAllTitle")}
            </h1>
            <h2 className="text-[16px] sm:text-xl text-gray-600 mb-12 text-center">
              {t("shared.home.exploreAllDescription")}
            </h2>

            <CategoryFilter
              categories={categories}
              selected={selectedCategory}
              onSelect={setSelectedCategory}
            />
          </motion.div>

          <div
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
            data-testid="demo-grid"
          >
            {filteredDemos.map((demo, index) => (
              <DemoCard key={demo.id} demo={demo} index={index} />
            ))}
          </div>

          {filteredDemos.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <p className="text-xl text-gray-500">
                {t("shared.home.noDemosFound")}
              </p>
            </motion.div>
          )}
        </div>
      </section>
      </main>

      <Footer />
    </div>
  );
};
