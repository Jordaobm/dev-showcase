"use client";

import { motion } from "motion/react";
import { ArrowRight, Code, Zap } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import type { DemoEntry } from "@/registry/types";
import { resolveText } from "@/features/shared/utils/resolveText";

interface DemoCardProps {
  demo: DemoEntry;
  index: number;
}

export const DemoCard = ({ demo, index }: Readonly<DemoCardProps>) => {
  const t = useTranslations();

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
    >
      <Link href={`/showcase/${demo.id}`} data-testid="demo-card">
        <motion.div
          className="group relative overflow-hidden rounded-3xl bg-white p-8 cursor-pointer h-full glass-reflection card-inner-glow"
          style={{
            boxShadow: `
              0 1px 2px rgba(0, 0, 0, 0.02),
              0 4px 8px rgba(0, 0, 0, 0.04),
              0 12px 24px rgba(0, 0, 0, 0.06),
              0 20px 40px rgba(0, 0, 0, 0.08),
              inset 0 1px 0 rgba(255, 255, 255, 0.8)
            `,
            border: "1px solid rgba(255, 255, 255, 0.5)",
          }}
          whileHover={{
            y: -12,
            scale: 1.02,
            borderColor: "var(--premium-red)",
            borderWidth: "2px",
            boxShadow: `
              0 1px 2px rgba(0, 0, 0, 0.02),
              0 4px 8px rgba(0, 0, 0, 0.04),
              0 12px 24px rgba(0, 0, 0, 0.06),
              0 20px 40px rgba(0, 0, 0, 0.08),
              inset 0 1px 0 rgba(255, 255, 255, 0.8),
              0 0 10px rgba(220, 38, 38, 0.12)
            `,
            transition: { duration: 0.4, ease: "easeOut" },
          }}
        >
          {demo.status === "live" && (
            <div className="absolute top-5 right-5 z-20">
              <span
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-white"
                style={{
                  background: "linear-gradient(135deg, #16A34A, #15803D)",
                }}
              >
                <Zap className="w-3 h-3" />
                {t("shared.components.live")}
              </span>
            </div>
          )}

          {demo.status === "coming-soon" && (
            <div className="absolute top-5 right-5 z-20">
              <span
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-white"
                style={{
                  background: "linear-gradient(135deg, #ababab, #686868)",
                }}
              >
                <Zap className="w-3 h-3" />
                {t("shared.components.comingSoon")}
              </span>
            </div>
          )}

          <motion.div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 50% -20%, rgba(220, 38, 38, 0.12), transparent 60%)",
            }}
          />

          <motion.div
            className="absolute -inset-0.5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none -z-10"
            style={{
              background:
                "linear-gradient(135deg, rgba(220, 38, 38, 0.3), rgba(6, 182, 212, 0.15))",
              filter: "blur(12px)",
            }}
          />

          <div className="relative z-10 h-full flex flex-col">
            <motion.div
              className="flex justify-center align-middle w-15 h-15 inline-flex p-4 rounded-2xl mb-5 transition-all duration-300 group-hover:scale-110"
              style={{
                background: "linear-gradient(135deg, #F9FAFB, #F3F4F6)",
                boxShadow:
                  "0 4px 12px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 1)",
              }}
            >
              <Code className="w-7 h-7 text-gray-700" />
            </motion.div>

            <h3 className="text-2xl mb-3 font-medium group-hover:text-[var(--premium-red)] transition-colors duration-300">
              {resolveText(t, demo.name)}
            </h3>
            <h4 className="text-gray-600 mb-6 leading-relaxed text-base">
              {resolveText(t, demo.description)}
            </h4>

            <div className="flex flex-wrap gap-2 mb-6">
              {resolveText(t, demo.tags)
                .split(",")
                .map((tag) => tag.trim())
                .map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm"
                    style={{
                      background: "rgba(255, 255, 255, 0.6)",
                      border: "1px solid rgba(0, 0, 0, 0.06)",
                      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.04)",
                    }}
                  >
                    {tag}
                  </span>
                ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
              <div className="text-sm text-gray-500 font-medium">
                {t(demo.category)}
              </div>
              <motion.div
                className="flex items-center gap-2 text-[var(--premium-red)] opacity-0 group-hover:opacity-100"
                initial={{ x: -10 }}
                animate={{ x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <span className="text-sm font-medium">
                  {demo.status === "live"
                    ? t("shared.components.tryDemo")
                    : t("shared.components.explore")}
                </span>
                <ArrowRight className="w-4 h-4" />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
};
