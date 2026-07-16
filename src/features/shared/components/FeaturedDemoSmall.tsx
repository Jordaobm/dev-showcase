"use client";

import { motion } from "motion/react";
import { ArrowRight, Star, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { DemoEntry } from "@/registry/types";
import { useTranslations } from "next-intl";
import { resolveText } from "@/features/shared/utils/resolveText";

interface FeaturedDemoSmallProps {
  demo: DemoEntry;
  imageUrl?: string;
  index: number;
}

export const FeaturedDemoSmall = ({
  demo,
  imageUrl,
  index,
}: Readonly<FeaturedDemoSmallProps>) => {
  const t = useTranslations();

  const tagList = resolveText(t, demo.tags)
    .split(",")
    .map((tag) => tag.trim());

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      className="group h-full"
    >
      <Link href={`/showcase/${demo.id}`} className="block h-full">
        <motion.div
          className="relative overflow-hidden rounded-3xl bg-white p-8 cursor-pointer h-full flex flex-col glass-reflection card-inner-glow"
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
            y: -10,
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
          <div className="absolute top-6 right-6 flex items-center gap-2 z-20">
            {demo.status === "live" && (
              <div
                className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white"
                style={{
                  background: "linear-gradient(135deg, #16A34A, #15803D)",
                }}
              >
                <Zap className="w-3 h-3" />
                {t("shared.components.live")}
              </div>
            )}
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
              style={{
                background: "linear-gradient(135deg, #DC2626, #B91C1C)",
                color: "white",
                boxShadow: "0 4px 12px rgba(220, 38, 38, 0.3)",
                position: "relative",
              }}
            >
              <Star className="w-3 h-3 fill-white" />
              {t("shared.components.featured")}
            </div>
          </div>

          <motion.div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 50% 0%, rgba(220, 38, 38, 0.1), transparent 60%)",
            }}
          />
          <motion.div
            className="absolute -inset-0.5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none -z-10"
            style={{
              background:
                "linear-gradient(135deg, rgba(220, 38, 38, 0.25), rgba(6, 182, 212, 0.12))",
              filter: "blur(10px)",
            }}
          />

          <div className="mb-6 relative">
            <motion.div
              className="relative w-full h-48 rounded-2xl overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #F9FAFB, #F3F4F6)",
                boxShadow:
                  "0 4px 16px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 1)",
              }}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.4 }}
            >
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={resolveText(t, demo.name)}
                  fill
                  sizes="(min-width: 1280px) 33vw, 100vw"
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-200 to-gray-300" />
                </div>
              )}
            </motion.div>
          </div>

          <div className="flex-1 flex flex-col relative z-10">
            <div
              className="inline-block self-start px-3 py-1 rounded-full mb-3 text-xs font-medium"
              style={{
                background: "rgba(255, 255, 255, 0.6)",
                border: "1px solid rgba(0, 0, 0, 0.06)",
                color: "var(--premium-red)",
              }}
            >
              {resolveText(t, demo.category)}
            </div>
            <h3 className="text-2xl mb-3 font-medium group-hover:text-[var(--premium-red)] transition-colors duration-300">
              {resolveText(t, demo.name)}
            </h3>
            <h4 className="text-gray-600 mb-6 leading-relaxed flex-1 text-sm">
              {resolveText(t, demo.description)}
            </h4>
            <div className="flex flex-wrap gap-2 mb-6 shrink-0">
              {tagList.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-lg text-xs font-medium backdrop-blur-sm"
                  style={{
                    background: "rgba(255, 255, 255, 0.6)",
                    border: "1px solid rgba(0, 0, 0, 0.05)",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
            <motion.div
              className="inline-flex items-center gap-2 text-[var(--premium-red)] text-sm font-medium opacity-0 group-hover:opacity-100"
              initial={{ x: -10 }}
              animate={{ x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <span>
                {demo.status === "live"
                  ? t("shared.components.demoPreview")
                  : t("shared.components.viewShowCase")}
              </span>
              <ArrowRight className="w-4 h-4" />
            </motion.div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
};
