"use client";

import { motion } from "motion/react";
import { Clock, GitBranch, Bell } from "lucide-react";
import { useTranslations } from "next-intl";
import { SOCIAL_LINKS } from "@/lib/social-links";

interface ComingSoonProps {
  demoName: string;
}

const ComingSoonHighlight = ({
  chunks,
}: Readonly<{ chunks: React.ReactNode }>) => {
  return <strong className="text-gray-700">{chunks}</strong>;
};

export const ComingSoon = ({ demoName }: Readonly<ComingSoonProps>) => {
  const t = useTranslations();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-[32px] p-16 text-center"
      style={{
        background:
          "linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(249, 250, 251, 0.8))",
        border: "2px dashed rgba(220, 38, 38, 0.2)",
        boxShadow:
          "0 8px 32px rgba(0, 0, 0, 0.08), inset 0 2px 0 rgba(255, 255, 255, 1)",
      }}
    >
      <motion.div
        className="inline-flex p-6 rounded-3xl mb-8"
        style={{
          background: "white",
          boxShadow:
            "0 8px 24px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 1)",
        }}
        animate={{ rotate: [0, -5, 5, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <Clock className="w-12 h-12 text-gray-400" />
      </motion.div>

      <h3 className="text-3xl mb-3 font-semibold">
        {t("shared.components.comingSoon")}
      </h3>
      <p className="text-lg text-gray-500 max-w-lg mx-auto leading-relaxed mb-8">
        {t.rich("shared.components.comingSoonDescription", {
          name: t(demoName),
          b: (chunks) => <ComingSoonHighlight chunks={chunks} />,
        })}
      </p>

      <div className="flex items-center justify-center gap-4 flex-wrap">
        <a
          href={SOCIAL_LINKS.githubRepo}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-6 py-3 rounded-2xl font-medium text-sm transition-transform hover:scale-105"
          style={{
            background: "rgba(255, 255, 255, 0.8)",
            border: "1px solid rgba(0, 0, 0, 0.08)",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.06)",
          }}
        >
          <GitBranch className="w-4 h-4" />
          {t("shared.components.followOnGitHub")}
        </a>
        <div
          className="flex items-center gap-2 px-6 py-3 rounded-2xl font-medium text-sm text-gray-500"
          style={{
            background: "rgba(255, 255, 255, 0.5)",
            border: "1px solid rgba(0, 0, 0, 0.05)",
          }}
        >
          <Bell className="w-4 h-4" />
          {t("shared.components.moreDemosAddedRegularly")}
        </div>
      </div>
    </motion.div>
  );
};
