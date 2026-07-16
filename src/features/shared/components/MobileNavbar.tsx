"use client";

import { ChevronRight, Code2, Menu, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { Button } from "./Button";
import { SearchResults } from "./SearchResults";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { useDemoSearch } from "@/features/shared/hooks/useDemoSearch";
import { LanguageSwitcher } from "./LanguageSwitcher";

export const MobileNavbar = () => {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { isBelowBreakpoint } = useBreakpoint();
  const searchResults = useDemoSearch(searchQuery);

  const closeSearch = () => {
    setSearchQuery("");
    setIsOpen(false);
  };

  const isHomePage =
    pathname === "/" || pathname.endsWith("/pt-BR") || pathname.endsWith("/en");

  if (!isBelowBreakpoint) return null;

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
    setIsOpen(false);
  };

  const navigateToSection = (sectionId: string) => {
    if (isHomePage) {
      scrollToSection(sectionId);
    } else {
      router.push("/");
      setTimeout(() => scrollToSection(sectionId), 500);
    }
  };

  const scrollToTop = () => {
    if (isHomePage) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      router.push("/");
    }
    setIsOpen(false);
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
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="absolute top-0 left-0 right-0 z-50"
        style={{
          display: "flex",
          justifyContent: "center",
          paddingTop: "40px",
          paddingBottom: "20px",
        }}
      >
        <nav
          className="px-6 py-4"
          style={{
            width: "calc(100% - 32px)",
            borderRadius: "16px",
            background: "#fff",
          }}
        >
          <div className="flex items-center justify-between gap-4 min-w-0">
            <Link
              href="/"
              onClick={handleLogoClick}
              className="flex items-center gap-3 group cursor-pointer min-w-0"
            >
              <motion.div
                className="p-2.5 rounded-xl premium-button overflow-hidden shrink-0"
                style={{
                  background: "linear-gradient(135deg, #DC2626, #B91C1C)",
                  boxShadow:
                    "0 4px 16px rgba(220, 38, 38, 0.3), 0 0 24px rgba(220, 38, 38, 0.2)",
                }}
                whileHover={{ scale: 1.05 }}
              >
                <Code2 className="w-6 h-6 text-white relative z-10" />
              </motion.div>
              <div className="min-w-0">
                <p className="text-lg tracking-tight font-medium truncate">
                  {t("shared.header.dev")}{" "}
                  <span style={{ color: "var(--premium-red)" }}>
                    {t("shared.header.showcase")}
                  </span>
                </p>
                <p className="text-xs text-gray-500 m-0 p-0 text-left truncate">
                  {t("shared.header.premiumPortifolio")}
                </p>
              </div>
            </Link>

            <div className="flex items-center gap-3 flex-shrink-0">
              <LanguageSwitcher />
              <motion.button
                onClick={() => setIsOpen(!isOpen)}
                aria-label={
                  isOpen
                    ? t("shared.header.closeMenu")
                    : t("shared.header.openMenu")
                }
                aria-expanded={isOpen}
                aria-controls="mobile-nav-panel"
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                whileTap={{ scale: 0.95 }}
              >
                {isOpen ? (
                  <X className="w-6 h-6 text-gray-700" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-700" />
                )}
              </motion.button>
            </div>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="mobile-nav-panel"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-24 left-0 right-0 z-40"
            style={{
              display: "flex",
              justifyContent: "center",
              paddingTop: "10px",
              paddingBottom: "10px",
            }}
          >
            <div
              className="px-6 py-4 w-full space-y-2"
              style={{
                borderRadius: "16px",
                top: "-20px",
                position: "relative",
                background: "#fff",
                marginLeft: "1rem",
                marginRight: "1rem",
              }}
            >
              <div className="relative mb-2 mt-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t("shared.header.inputSearchPlaceholder")}
                    className="w-full pl-11 pr-4 py-2.5 rounded-full bg-gray-50 border-2 border-transparent
                             focus:outline-none focus:bg-white focus:border-[var(--premium-red)]
                             transition-colors duration-300 text-sm"
                  />
                </div>

                {searchQuery.trim() && (
                  <SearchResults
                    results={searchResults}
                    onSelect={closeSearch}
                  />
                )}
              </div>

              <Link
                href="/#featured"
                onClick={(e) => handleSectionNavClick(e, "featured")}
                className="block w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:text-[var(--premium-red)] hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
              >
                {t("shared.header.showcases")}
              </Link>
              <Link
                href="/#showcase"
                onClick={(e) => handleSectionNavClick(e, "showcase")}
                className="block w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:text-[var(--premium-red)] hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
              >
                {t("shared.header.categories")}
              </Link>
              <Link
                href="/sobre"
                onClick={() => setIsOpen(false)}
                className="block w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:text-[var(--premium-red)] hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
              >
                {t("shared.header.about")}
              </Link>

              <Button
                type="primary"
                href="/#featured"
                onClick={() => navigateToSection("featured")}
                className="w-full mt-4 h-13"
              >
                {t("shared.header.exploreShowcase")}
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
