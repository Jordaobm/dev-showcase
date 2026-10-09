"use client";

import { motion } from "motion/react";
import { ArrowRight, Star, Zap } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { DemoEntry } from "@/registry/types";
import { useTranslations } from "next-intl";
import { resolveText } from "@/features/shared/utils/resolveText";
import { getDemoIcon } from "@/features/shared/utils/demoIcons";
import { ShowroomStage } from "./ShowroomStage";

const MAX_VISIBLE_TAGS = 4;

interface FeaturedDemoCardProps {
  demo: DemoEntry;
  index: number;
}

export const FeaturedDemoCard = ({
  demo,
  index,
}: Readonly<FeaturedDemoCardProps>) => {
  const t = useTranslations();

  const tagList = resolveText(t, demo.tags)
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
  const visibleTags = tagList.slice(0, MAX_VISIBLE_TAGS);
  const hiddenTagsCount = tagList.length - visibleTags.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      className="group h-full"
    >
      <Link href={`/showcase/${demo.id}`} className="block h-full">
        <motion.article
          className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-white border border-gray-200/70 transition-colors duration-300 hover:border-[var(--premium-red)]"
          style={{
            boxShadow:
              "0 1px 2px rgba(0, 0, 0, 0.03), 0 8px 24px rgba(0, 0, 0, 0.06)",
          }}
          whileHover={{ y: -6, transition: { duration: 0.3, ease: "easeOut" } }}
        >
          <ShowroomStage icon={getDemoIcon(demo.id)} active>
            <div className="absolute top-4 right-4 flex items-center gap-2">
              {demo.status === "live" && (
                <div
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-white"
                  style={{
                    background: "linear-gradient(135deg, #16A34A, #15803D)",
                  }}
                >
                  <Zap className="w-3 h-3" />
                  {t("shared.components.live")}
                </div>
              )}
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-white"
                style={{
                  background: "linear-gradient(135deg, #DC2626, #B91C1C)",
                  boxShadow: "0 4px 12px rgba(220, 38, 38, 0.3)",
                }}
              >
                <Star className="w-3 h-3 fill-white" />
                {t("shared.components.featured")}
              </div>
            </div>
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
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-50 border border-gray-200/80 text-gray-700"
                >
                  {tag}
                </span>
              ))}
              {hiddenTagsCount > 0 && (
                <span className="px-2.5 py-1 rounded-lg text-xs font-medium text-gray-500">
                  +{hiddenTagsCount}
                </span>
              )}
            </div>

            <div className="inline-flex items-center gap-2 border-t border-gray-100 pt-4 text-sm font-medium text-[var(--premium-red)]">
              <span>
                {demo.status === "live"
                  ? t("shared.components.demoPreview")
                  : t("shared.components.viewShowCase")}
              </span>
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </div>
          </div>
        </motion.article>
      </Link>
    </motion.div>
  );
};
