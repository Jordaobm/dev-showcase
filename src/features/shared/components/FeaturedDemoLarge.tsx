"use client";

import type { DemoEntry } from "@/registry/types";
import { ChevronRight, Sparkles, Star, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { resolveText } from "@/features/shared/utils/resolveText";
import { Button } from "./Button";

interface FeaturedDemoLargeProps {
  demo: DemoEntry;
  imageUrl?: string;
}

export const FeaturedDemoLarge = ({
  demo,
  imageUrl,
}: Readonly<FeaturedDemoLargeProps>) => {
  const t = useTranslations();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
      className="group h-full"
    >
      <Link href={`/showcase/${demo.id}`} className="block h-full">
        <motion.div
          className="relative overflow-hidden rounded-[32px] cursor-pointer h-full min-h-[520px]"
          style={{
            boxShadow: `
              0 2px 4px rgba(0, 0, 0, 0.03),
              0 8px 16px rgba(0, 0, 0, 0.06),
              0 20px 40px rgba(0, 0, 0, 0.09),
              0 32px 64px rgba(0, 0, 0, 0.12)
            `,
            border: "1px solid rgba(255, 255, 255, 0.6)",
          }}
          whileHover={{
            y: -16,
            scale: 1.01,
            borderColor: "var(--premium-red)",
            borderWidth: "2px",
            boxShadow: `
              0 2px 4px rgba(0, 0, 0, 0.03),
              0 8px 16px rgba(0, 0, 0, 0.06),
              0 20px 40px rgba(0, 0, 0, 0.09),
              0 32px 64px rgba(0, 0, 0, 0.12),
              0 0 12px rgba(220, 38, 38, 0.15)
            `,
            transition: { duration: 0.5, ease: "easeOut" },
          }}
        >
          <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={resolveText(t, demo.name)}
                fill
                sizes="(min-width: 1280px) 66vw, 100vw"
                className="object-cover"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #F9FAFB, #F3F4F6)",
                }}
              >
                <Sparkles className="w-16 h-16 text-gray-300" />
              </div>
            )}
          </div>

          <div
            className="absolute inset-0"
            style={{
              background: `
                linear-gradient(180deg,
                  rgba(0, 0, 0, 0.85) 0%,
                  rgba(0, 0, 0, 0.55) 30%,
                  rgba(0, 0, 0, 0.85) 60%,
                  rgba(0, 0, 0, 0.98) 100%)
              `,
            }}
          />

          <div className="absolute top-6 left-6 right-6 z-20 flex flex-wrap items-center justify-end gap-2">
            {demo.status === "live" && (
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white whitespace-nowrap"
                style={{
                  background: "linear-gradient(135deg, #16A34A, #15803D)",
                }}
              >
                <Zap className="w-3 h-3" />
                {t("shared.components.liveDemo")}
              </div>
            )}
            <motion.div
              className="flex items-center gap-2 px-5 py-2.5 rounded-full premium-button whitespace-nowrap"
              style={{
                background: "linear-gradient(135deg, #DC2626, #B91C1C)",
                boxShadow:
                  "0 8px 24px rgba(220, 38, 38, 0.4), 0 0 32px rgba(220, 38, 38, 0.3)",
              }}
              whileHover={{ scale: 1.05 }}
            >
              <Star className="w-4 h-4 text-white fill-white" />
              <span className="text-white text-sm font-medium">
                {t("shared.components.featured")}
              </span>
            </motion.div>
          </div>

          <motion.div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none"
            style={{
              background: `
                radial-gradient(circle at 30% 20%, rgba(220, 38, 38, 0.25), transparent 50%),
                radial-gradient(circle at 70% 80%, rgba(6, 182, 212, 0.18), transparent 50%)
              `,
            }}
          />

          <div className="relative z-10 h-full flex flex-col justify-end p-10 sm:p-12">
            <div
              className="inline-block self-start px-4 py-2 rounded-full mb-6 text-sm font-medium backdrop-blur-sm"
              style={{
                background: "rgba(255, 255, 255, 0.15)",
                border: "1px solid rgba(255, 255, 255, 0.25)",
                color: "white",
                marginTop: "2rem",
              }}
            >
              {resolveText(t, demo.category)}
            </div>

            <h3 className="text-[20px] sm:text-4xl mb-5 font-medium text-white group-hover:text-[var(--premium-red)] transition-colors duration-300 leading-tight">
              {resolveText(t, demo.name)}
            </h3>
            <h4 className="text-[16px] sm:text-lg text-gray-200 mb-8 leading-relaxed max-w-xl">
              {resolveText(t, demo.description)}
            </h4>

            <div className="flex flex-wrap gap-2 mb-10">
              {resolveText(t, demo.tags)
                .split(",")
                .map((tech) => tech.trim())
                .map((tech) => (
                  <span
                    key={tech}
                    className="px-4 py-2 rounded-xl backdrop-blur-sm font-medium text-sm text-white"
                    style={{
                      background: "rgba(255, 255, 255, 0.12)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                    }}
                  >
                    {tech}
                  </span>
                ))}
            </div>

            <Button
              type="primary"
              className="flex-shrink-0"
              customStyle={{
                width: "100%",
                height: "52px",
              }}
            >
              {demo.status === "live"
                ? t("shared.components.tryDemoLive")
                : t("shared.components.viewShowCase")}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
};
