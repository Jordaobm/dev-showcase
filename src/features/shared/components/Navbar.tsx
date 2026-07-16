"use client";

import { ChevronRight, Code2, Search } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { Button } from "./Button";
import { SearchResults } from "./SearchResults";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { useDemoSearch } from "@/features/shared/hooks/useDemoSearch";
import { LanguageSwitcher } from "./LanguageSwitcher";

export const Navbar = () => {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const { isBelowBreakpoint } = useBreakpoint();

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchResults = useDemoSearch(searchQuery);

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery("");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isHomePage =
    pathname === "/" || pathname.endsWith("/pt-BR") || pathname.endsWith("/en");

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
    sectionId: string,
  ) => {
    if (isModifiedClick(e)) return;

    e.preventDefault();
    navigateToSection(sectionId);
  };

  const scrollToTop = () => {
    if (isHomePage) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      router.push("/");
    }
  };

  const handleLogoClick = (e: ReactMouseEvent<HTMLAnchorElement>) => {
    if (isModifiedClick(e)) return;

    e.preventDefault();
    scrollToTop();
  };

  if (isBelowBreakpoint) return null;

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        display: "flex",
        justifyContent: "center",
        paddingTop: "20px",
        paddingBottom: "20px",
      }}
    >
      <nav
        className="px-6 py-4"
        style={{
          width: "var(--container-7xl, 80rem)",
          borderRadius: "16px",
          background: "#fff",
        }}
      >
        <div className="flex items-center justify-between gap-8">
          <Link
            aria-label="Link Home"
            href="/"
            onClick={handleLogoClick}
            data-testid="navbar-logo"
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
                {t("shared.header.dev")}{" "}
                <span style={{ color: "var(--premium-red)" }}>
                  {t("shared.header.showcase")}
                </span>
              </p>
              <p className="text-xs text-gray-500 m-0 p-0 text-left">
                {t("shared.header.premiumPortifolio")}
              </p>
            </div>
          </Link>

          <div className="flex-1 max-w-sm relative" ref={searchContainerRef}>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
              <input
                aria-label="Input Demo"
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                placeholder={t("shared.header.inputSearchPlaceholder")}
                className="w-full pl-11 pr-12 py-2.5 rounded-full bg-white/60 border-2 border-white/40 focus:outline-none focus:bg-white focus:border-[var(--premium-red)] transition-colors duration-300 backdrop-blur-sm text-sm"
                style={{
                  boxShadow:
                    "0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
                }}
              />
              <kbd className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">
                ⌘K
              </kbd>
            </div>

            {isSearchOpen && searchQuery.trim() && (
              <SearchResults results={searchResults} onSelect={closeSearch} />
            )}
          </div>

          <div className="flex items-center gap-8 flex-shrink-0">
            <div className="flex items-center gap-6">
              <Link
                aria-label="Link Showcases"
                href="/#featured"
                onClick={(e) => handleSectionNavClick(e, "featured")}
                className="text-sm font-medium text-gray-700 hover:text-[var(--premium-red)] transition-colors cursor-pointer py-2"
              >
                {t("shared.header.showcases")}
              </Link>
              <Link
                aria-label="Link Categories"
                href="/#showcase"
                onClick={(e) => handleSectionNavClick(e, "showcase")}
                className="text-sm font-medium text-gray-700 hover:text-[var(--premium-red)] transition-colors cursor-pointer py-2"
              >
                {t("shared.header.categories")}
              </Link>
              <Link
                aria-label="Link About"
                href="/sobre"
                className="text-sm font-medium text-gray-700 hover:text-[var(--premium-red)] transition-colors cursor-pointer py-2"
              >
                {t("shared.header.about")}
              </Link>
            </div>

            <LanguageSwitcher />

            <Button
              type="primary"
              href="/#featured"
              onClick={() => navigateToSection("featured")}
              className="whitespace-nowrap flex-shrink-0"
            >
              {t("shared.header.exploreShowcase")}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>
    </motion.header>
  );
};
