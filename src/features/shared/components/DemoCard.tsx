"use client";

import { motion } from "motion/react";
import { ArrowRight, Zap } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import type { DemoEntry } from "@/registry/types";
import { resolveText } from "@/features/shared/utils/resolveText";
import { getDemoIcon } from "@/features/shared/utils/demoIcons";
import { ShowroomStage } from "./ShowroomStage";

const MAX_VISIBLE_TAGS = 3;

interface DemoCardProps {
  demo: DemoEntry;
  index: number;
}

export const DemoCard = ({ demo, index }: Readonly<DemoCardProps>) => {
  const t = useTranslations();
  const isLive = demo.status === "live";

  const tagList = resolveText(t, demo.tags)
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
  const visibleTags = tagList.slice(0, MAX_VISIBLE_TAGS);
  const hiddenTagsCount = tagList.length - visibleTags.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.06 }}
      className="h-full"
    >
      <Link
        href={`/showcase/${demo.id}`}
        data-testid="demo-card"
        className="group block h-full"
      >
        <article
          className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-white border border-gray-200/70 transition-[transform,border-color] duration-300 hover:border-[var(--premium-red)] motion-safe:hover:-translate-y-1.5"
          style={{
            boxShadow:
              "0 1px 2px rgba(0, 0, 0, 0.03), 0 8px 24px rgba(0, 0, 0, 0.06)",
          }}
        >
          <ShowroomStage icon={getDemoIcon(demo.id)} active={isLive}>
            <span
              className="absolute top-4 right-4 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium text-white"
              style={{
                background: isLive
                  ? "linear-gradient(135deg, #16A34A, #15803D)"
                  : "linear-gradient(135deg, #ababab, #686868)",
              }}
            >
              <Zap className="h-3 w-3" />
              {isLive
                ? t("shared.components.live")
                : t("shared.components.comingSoon")}
            </span>
          </ShowroomStage>

          <div className="flex flex-1 flex-col p-6">
            <span
              className="mb-2 text-xs font-semibold"
              style={{ color: "var(--premium-red)" }}
            >
              {resolveText(t, demo.category)}
            </span>
            <h3 className="mb-2 text-xl font-semibold transition-colors duration-300 group-hover:text-[var(--premium-red)]">
              {resolveText(t, demo.name)}
            </h3>
            <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-gray-600">
              {resolveText(t, demo.description)}
            </p>

            <div className="mt-auto flex flex-wrap gap-2 pb-5">
              {visibleTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-lg border border-gray-200/80 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-700"
                >
                  {tag}
                </span>
              ))}
              {hiddenTagsCount > 0 && (
                <span className="px-2.5 py-1 text-xs font-medium text-gray-500">
                  +{hiddenTagsCount}
                </span>
              )}
            </div>

            <div className="inline-flex items-center gap-2 border-t border-gray-100 pt-4 text-sm font-medium text-[var(--premium-red)]">
              <span>
                {isLive
                  ? t("shared.components.tryDemo")
                  : t("shared.components.explore")}
              </span>
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  );
};
