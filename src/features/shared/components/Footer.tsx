"use client";

import { Link, useRouter, usePathname } from "@/i18n/navigation";
import type { MouseEvent as ReactMouseEvent } from "react";
import { Code2, GitBranch, Users, Mail } from "lucide-react";
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

  const linkClass =
    "flex items-center gap-2 py-1 text-sm text-gray-600 transition-colors hover:text-[var(--premium-red)]";

  const builtWith = [
    t("shared.technologies.react"),
    t("shared.technologies.nextjs"),
    t("shared.technologies.tailwind"),
    t("shared.technologies.framer"),
  ].join(", ");

  return (
    <footer
      className="relative px-6 pt-16 pb-10"
      style={{
        borderTop: "1px solid rgba(0, 0, 0, 0.05)",
        background: "linear-gradient(180deg, #f8f9fa 0%, #eceef1 100%)",
        boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.9)",
      }}
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 grid grid-cols-1 gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Link
              href="/"
              onClick={handleLogoClick}
              className="group inline-flex cursor-pointer items-center gap-3"
            >
              <div
                className="flex h-11 w-11 items-center justify-center rounded-xl"
                style={{
                  background: "linear-gradient(135deg, #DC2626, #B91C1C)",
                  boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.35)",
                }}
              >
                <Code2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="whitespace-nowrap text-lg font-medium tracking-tight">
                  {t("shared.footer.dev")}{" "}
                  <span style={{ color: "var(--premium-red)" }}>
                    {t("shared.footer.showcase")}
                  </span>
                </p>
                <p className="text-xs text-gray-500">
                  {t("shared.footer.premiumPortfolio")}
                </p>
              </div>
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-relaxed text-gray-600">
              {t("shared.footer.description")}
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold text-gray-900">
              {t("shared.footer.quickLinks")}
            </h2>
            <nav aria-label={t("shared.footer.quickLinks")}>
              <Link
                href="/#featured"
                onClick={(e) => handleSectionNavClick(e, "featured")}
                className={linkClass}
              >
                {t("shared.footer.featuredShowcases")}
              </Link>
              <Link
                href="/#showcase"
                onClick={(e) => handleSectionNavClick(e, "showcase")}
                className={linkClass}
              >
                {t("shared.footer.allCategories")}
              </Link>
              <Link href="/sobre" className={linkClass}>
                {t("shared.footer.about")}
              </Link>
            </nav>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold text-gray-900">
              {t("shared.footer.letsConnect")}
            </h2>
            <nav aria-label={t("shared.footer.letsConnect")}>
              <a
                href={SOCIAL_LINKS.github}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                <GitBranch className="h-4 w-4 text-gray-400" />
                {t("shared.social.github")}
              </a>
              <a
                href={SOCIAL_LINKS.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                <Users className="h-4 w-4 text-gray-400" />
                {t("shared.social.linkedin")}
              </a>
              <a href={SOCIAL_LINKS.emailHref} className={linkClass}>
                <Mail className="h-4 w-4 text-gray-400" />
                {SOCIAL_LINKS.email}
              </a>
            </nav>
          </div>
        </div>

        <div
          className="flex flex-col gap-2 pt-6 text-sm text-gray-500 md:flex-row md:items-center md:justify-between"
          style={{ borderTop: "1px solid rgba(0, 0, 0, 0.06)" }}
        >
          <p>{t("shared.footer.copyright")}</p>
          <p>
            {t("shared.footer.builtWith")} {builtWith}
          </p>
        </div>
      </div>
    </footer>
  );
};
