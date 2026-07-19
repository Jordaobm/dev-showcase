"use client";

import { motion } from "motion/react";
import { Link, useRouter, usePathname } from "@/i18n/navigation";
import type { MouseEvent as ReactMouseEvent } from "react";
import {
  Code2,
  ChevronRight,
  GitBranch,
  Users,
  Mail,
  Cpu,
  Zap,
  Database,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { SOCIAL_LINKS } from "@/lib/social-links";

export const Footer = () => {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();

  const isHomePage = pathname === "/";

  const scrollToTop = () => {
    if (isHomePage) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      router.push("/");
    }
  };

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
  };

  const navigateToSection = (sectionId: string) => {
    if (isHomePage) {
      scrollToSection(sectionId);
    } else {
      router.push("/");
      setTimeout(() => scrollToSection(sectionId), 500);
    }
  };

  const isModifiedClick = (e: ReactMouseEvent<HTMLAnchorElement>) =>
    e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button === 1;

  const handleSectionNavClick = (
    e: ReactMouseEvent<HTMLAnchorElement>,
    sectionId: string
  ) => {
    if (isModifiedClick(e)) return;

    e.preventDefault();
    navigateToSection(sectionId);
  };

  const handleLogoClick = (e: ReactMouseEvent<HTMLAnchorElement>) => {
    if (isModifiedClick(e)) return;

    e.preventDefault();
    scrollToTop();
  };

  return (
    <footer
      className="py-16 px-6 relative"
      style={{
        borderTop: "1px solid rgba(0, 0, 0, 0.05)",
        background:
          "linear-gradient(180deg, transparent 0%, rgba(248, 249, 250, 0.5) 100%)",
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-16 mb-12">
          <div className="col-span-1 flex flex-col items-center xl:items-start text-center xl:text-left">
            <Link
              href="/"
              onClick={handleLogoClick}
              className="flex items-center gap-3 group flex-shrink-0 cursor-pointer"
            >
              <motion.div
                className="p-2.5 rounded-xl premium-button overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, #DC2626, #B91C1C)",
                  boxShadow:
                    "0 4px 16px rgba(220, 38, 38, 0.3), 0 0 24px rgba(220, 38, 38, 0.2)",
                }}
                whileHover={{ scale: 1.05 }}
              >
                <Code2 className="w-6 h-6 text-white relative z-10" />
              </motion.div>
              <div>
                <p className="text-lg tracking-tight font-medium whitespace-nowrap">
                  {t("shared.footer.dev")}{" "}
                  <span style={{ color: "var(--premium-red)" }}>
                    {t("shared.footer.showcase")}
                  </span>
                </p>
                <p className="text-xs text-gray-500 m-0 p-0 text-center xl:text-left">
                  {t("shared.footer.premiumPortfolio")}
                </p>
              </div>
            </Link>

            <p className="text-sm text-gray-600 leading-relaxed max-w-xs mt-4 mx-auto xl:mx-0">
              {t("shared.footer.description")}
            </p>
          </div>

          <div className="flex flex-col items-center xl:items-start text-center xl:text-left">
            <h2 className="font-bold text-sm mb-4">
              {t("shared.footer.quickLinks")}
            </h2>
            <nav
              className="space-y-2.5"
              aria-label={t("shared.footer.quickLinks")}
            >
              <Link
                href="/#featured"
                onClick={(e) => handleSectionNavClick(e, "featured")}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors flex items-center justify-center xl:justify-start gap-2 py-1"
              >
                {t("shared.footer.featuredShowcases")}{" "}
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>
              <Link
                href="/#showcase"
                onClick={(e) => handleSectionNavClick(e, "showcase")}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors flex items-center justify-center xl:justify-start gap-2 py-1"
              >
                {t("shared.footer.allCategories")}{" "}
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>
              <Link
                href="/sobre"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors flex items-center justify-center xl:justify-start gap-2 py-1"
              >
                {t("shared.footer.about")}{" "}
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>
            </nav>
          </div>

          <div className="flex flex-col items-center xl:items-start text-center xl:text-left">
            <h2 className="font-bold text-sm mb-4">
              {t("shared.footer.builtWith")}
            </h2>
            <nav
              className="space-y-2.5"
              aria-label={t("shared.footer.builtWith")}
            >
              <div className="text-sm text-gray-600 flex items-center justify-center xl:justify-start gap-2">
                <Code2 className="w-4 h-4 text-gray-400" />
                {t("shared.technologies.react")}
              </div>
              <div className="text-sm text-gray-600 flex items-center justify-center xl:justify-start gap-2">
                <Zap className="w-4 h-4 text-gray-400" />
                {t("shared.technologies.nextjs")}
              </div>
              <div className="text-sm text-gray-600 flex items-center justify-center xl:justify-start gap-2">
                <Cpu className="w-4 h-4 text-gray-400" />
                {t("shared.technologies.tailwind")}
              </div>
              <div className="text-sm text-gray-600 flex items-center justify-center xl:justify-start gap-2">
                <Database className="w-4 h-4 text-gray-400" />
                {t("shared.technologies.framer")}
              </div>
            </nav>
          </div>

          <div className="flex flex-col items-center xl:items-start text-center xl:text-left">
            <h2 className="font-bold text-sm mb-4">
              {t("shared.footer.letsConnect")}
            </h2>
            <nav
              className="space-y-2.5"
              aria-label={t("shared.footer.letsConnect")}
            >
              <a
                href={SOCIAL_LINKS.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors flex items-center justify-center xl:justify-start gap-2 py-1"
              >
                <GitBranch className="w-4 h-4 text-gray-400" />
                {t("shared.social.github")}
              </a>
              <a
                href={SOCIAL_LINKS.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors flex items-center justify-center xl:justify-start gap-2 py-1"
              >
                <Users className="w-4 h-4 text-gray-400" />
                {t("shared.social.linkedin")}
              </a>
              <a
                href={SOCIAL_LINKS.emailHref}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors flex items-center justify-center xl:justify-start gap-2 py-1"
              >
                <Mail className="w-4 h-4 text-gray-400" />
                {SOCIAL_LINKS.email}
              </a>
            </nav>
          </div>
        </div>

        <div
          className="pt-8 text-center text-sm text-gray-500"
          style={{ borderTop: "1px solid rgba(0, 0, 0, 0.05)" }}
        >
          <p>{t("shared.footer.copyright")}</p>
        </div>
      </div>
    </footer>
  );
};
