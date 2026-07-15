"use client";

import { motion } from "motion/react";
import {
  Briefcase,
  GraduationCap,
  MapPin,
  Mail,
  Users,
  GitBranch,
  ChevronRight,
  Layers,
  Server,
  Database,
  Wrench,
  Sparkles,
  Download,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Navbar } from "@/features/shared/components/Navbar";
import { MobileNavbar } from "@/features/shared/components/MobileNavbar";
import { Footer } from "@/features/shared/components/Footer";
import { SOCIAL_LINKS } from "@/lib/social-links";

interface TimelineItem {
  type: "work" | "education";
  period: string;
  title: string;
  org: string;
  desc: string;
  tags: string[];
}

interface SkillGroup {
  label: string;
  items: string[];
}

const SKILL_ICONS = [Layers, Server, Database, Wrench];

const EXPERIENCE_YEARS = "5+";
const PROJECTS_DEVELOPED = "23+";
const SUSTAINED_PROJECTS = "6+";

const CARD_SHADOW = `
  0 2px 4px rgba(0, 0, 0, 0.03),
  0 6px 12px rgba(0, 0, 0, 0.04),
  inset 0 1px 0 rgba(255, 255, 255, 0.6)
`;

const CARD_BORDER = "1px solid rgba(255, 255, 255, 0.5)";
const WORK_COLOR = "#dc2626";
const EDUCATION_COLOR = "#4b5563";

const TimelineDot = ({
  type,
  isCurrent,
}: Readonly<{
  type: "work" | "education";
  isCurrent: boolean;
}>) => {
  const isWork = type === "work";
  return (
    <div className="relative w-[30px] h-[30px] shrink-0">
      {isCurrent && isWork && (
        <>
          <div className="absolute inset-0 rounded-full bg-red-600 animate-ripple" />
          <div className="absolute inset-0 rounded-full bg-red-600 animate-ripple-delay" />
        </>
      )}

      <motion.div
        whileHover={{ scale: 1.1 }}
        className="relative z-10 w-[30px] h-[30px] rounded-full flex items-center justify-center"
        style={{
          background: isWork ? WORK_COLOR : "#ffffff",
          border: `2px solid ${isWork ? WORK_COLOR : EDUCATION_COLOR}`,
          boxShadow: isWork
            ? "0 0 0 5px rgba(220,38,38,0.08), 0 0 18px rgba(220,38,38,0.4)"
            : "0 0 0 5px rgba(75,85,99,0.08), 0 0 14px rgba(75,85,99,0.25)",
        }}
      >
        {isWork ? (
          <Briefcase className="w-3.5 h-3.5 text-white" />
        ) : (
          <GraduationCap
            className="w-3.5 h-3.5"
            style={{ color: EDUCATION_COLOR }}
          />
        )}
      </motion.div>
    </div>
  );
};

const TimelineCardBody = ({
  item,
  accent,
}: Readonly<{
  item: TimelineItem;
  accent: string;
}>) => {
  return (
    <motion.div
      data-testid="timeline-item"
      className="rounded-3xl p-6 bg-white glass-reflection card-inner-glow"
      style={{ boxShadow: CARD_SHADOW, border: CARD_BORDER }}
      whileHover={{
        y: -4,
        borderColor: accent,
        transition: { duration: 0.3, ease: "easeOut" },
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1.5 mb-3">
        <div>
          <h3 className="text-[17px] font-semibold leading-snug">
            {item.title}
          </h3>
          <p className="text-sm font-medium mt-0.5" style={{ color: accent }}>
            {item.org}
          </p>
        </div>
        <span className="text-[12px] text-gray-400 shrink-0 mt-0.5 tabular-nums">
          {item.period}
        </span>
      </div>

      <p className="text-gray-600 text-[14px] leading-relaxed mb-4">
        {item.desc}
      </p>

      <div className="flex flex-wrap gap-2">
        {item.tags.map((tag) => (
          <span
            key={tag}
            className="px-3 py-1 rounded-full text-xs font-medium"
            style={{
              background: `${accent}14`,
              border: `1px solid ${accent}26`,
              color: accent,
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    </motion.div>
  );
};

const TimelineList = ({
  items,
  lineColor,
  mirrored = false,
}: Readonly<{
  items: TimelineItem[];
  lineColor: string;
  mirrored?: boolean;
}>) => {
  return (
    <div className="relative">
      <div
        className={`absolute top-[15px] bottom-[15px] w-px left-3.5 ${
          mirrored ? "xl:left-auto xl:right-3.5" : ""
        }`}
        style={{
          background: `linear-gradient(to bottom, transparent, ${lineColor} 6%, ${lineColor}40 94%, transparent)`,
        }}
      />

      <div className="flex flex-col gap-8">
        {items.map((item, i) => {
          const accent = item.type === "work" ? WORK_COLOR : EDUCATION_COLOR;
          return (
            <motion.div
              key={`${item.title}-${item.period}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: (i % 4) * 0.05 }}
              className={`flex gap-8 ${mirrored ? "xl:flex-row-reverse" : ""}`}
            >
              <div className="flex items-start pt-[22px] shrink-0">
                <TimelineDot type={item.type} isCurrent={i === 0} />
              </div>
              <div className="flex-1 min-w-0">
                <TimelineCardBody item={item} accent={accent} />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export const AboutPage = () => {
  const t = useTranslations();

  const timeline = t.raw("about.timeline") as TimelineItem[];
  const workItems = timeline.filter((item) => item.type === "work");
  const educationItems = timeline.filter((item) => item.type === "education");
  const skills = t.raw("about.skills") as SkillGroup[];

  const stats = [
    { n: EXPERIENCE_YEARS, label: t("about.stats.experience") },
    { n: PROJECTS_DEVELOPED, label: t("about.stats.liveDemos") },
    { n: SUSTAINED_PROJECTS, label: t("about.stats.showcases") },
  ];

  return (
    <div className="min-h-screen showroom-environment">
      <Navbar />
      <MobileNavbar />

      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <motion.div
          className="ambient-orb"
          style={{
            width: "500px",
            height: "500px",
            background:
              "radial-gradient(circle, rgba(220, 38, 38, 0.12), transparent)",
            top: "10%",
            right: "10%",
          }}
          animate={{ x: [0, 30, 0], y: [0, 40, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <main>
        <section className="relative max-w-6xl mx-auto px-6 pt-40 pb-20 overflow-hidden">
          <div className="spotlight-beam" />

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 backdrop-blur-sm"
            style={{
              background: "rgba(255, 255, 255, 0.7)",
              border: "1px solid rgba(255, 255, 255, 0.4)",
              boxShadow:
                "0 4px 12px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.9)",
            }}
          >
            <Sparkles
              className="w-4 h-4"
              style={{ color: "var(--premium-red)" }}
            />
            <span className="text-sm font-medium">
              {t("about.hero.eyebrow")}
            </span>
          </motion.div>

          <motion.h1
            data-testid="hero-heading"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-[32px] sm:text-[52px] lg:text-[64px] leading-tight font-semibold mb-6"
          >
            {t("about.hero.firstName")}{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #DC2626, #B91C1C)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {t("about.hero.lastName")}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[16px] sm:text-[20px] text-gray-600 leading-relaxed max-w-2xl mb-10"
          >
            {t("about.hero.manifesto")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center gap-3 mb-14"
          >
            <a
              href="/Jordao_Beghetto_Massariol_CV.pdf"
              download="Jordao_Beghetto_Massariol_CV.pdf"
              data-testid="cv-download-link"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium text-white premium-button overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #DC2626, #B91C1C)",
                boxShadow:
                  "0 4px 16px rgba(220, 38, 38, 0.3), 0 0 20px rgba(220, 38, 38, 0.15)",
              }}
            >
              <Download className="w-4 h-4" />
              {t("about.hero.downloadResume")}
            </a>
            <a
              href={SOCIAL_LINKS.emailHref}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm text-gray-700 backdrop-blur-sm hover:text-black transition-colors"
              style={{
                background: "rgba(255, 255, 255, 0.7)",
                border: "1px solid rgba(0, 0, 0, 0.06)",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
              }}
            >
              <Mail
                className="w-4 h-4"
                style={{ color: "var(--premium-red)" }}
              />
              {SOCIAL_LINKS.email}
            </a>
            <a
              href={SOCIAL_LINKS.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm text-gray-700 backdrop-blur-sm hover:text-black transition-colors"
              style={{
                background: "rgba(255, 255, 255, 0.7)",
                border: "1px solid rgba(0, 0, 0, 0.06)",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
              }}
            >
              <Users
                className="w-4 h-4"
                style={{ color: "var(--premium-red)" }}
              />
              {t("shared.social.linkedin")}
            </a>
            <a
              href={SOCIAL_LINKS.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm text-gray-700 backdrop-blur-sm hover:text-black transition-colors"
              style={{
                background: "rgba(255, 255, 255, 0.7)",
                border: "1px solid rgba(0, 0, 0, 0.06)",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
              }}
            >
              <GitBranch
                className="w-4 h-4"
                style={{ color: "var(--premium-red)" }}
              />
              {t("shared.social.github")}
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
          >
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="min-w-0 rounded-2xl p-4 sm:p-6 bg-white glass-reflection card-inner-glow"
                style={{ boxShadow: CARD_SHADOW, border: CARD_BORDER }}
              >
                <div
                  className="text-3xl sm:text-4xl font-semibold leading-none mb-2"
                  style={{ color: "var(--premium-red)" }}
                >
                  {s.n}
                </div>
                <div className="text-[13px] text-gray-500 leading-snug">
                  {s.label}
                </div>
              </motion.div>
            ))}
          </motion.div>

          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <MapPin className="w-3.5 h-3.5 text-red-500" />
            {t("about.hero.location")}
          </div>
        </section>

        <section className="py-32 px-6 relative">
          <div
            className="absolute inset-0 -z-10"
            style={{
              background:
                "linear-gradient(180deg, transparent 0%, rgba(248, 249, 250, 0.5) 100%)",
            }}
          />

          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-16 text-center"
            >
              <span
                className="text-[12px] sm:text-sm font-semibold"
                style={{ color: "var(--premium-red)" }}
              >
                {t("about.timelineSection.eyebrow")}
              </span>
              <h2 className="text-[22px] sm:text-6xl font-semibold mb-0 sm:mb-4">
                {t("about.timelineSection.titlePlain")}{" "}
                <span style={{ color: "var(--premium-red)" }}>
                  {t("about.timelineSection.titleHighlight")}
                </span>
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-12 gap-y-16">
              <div>
                <h3
                  className="text-[12px] sm:text-sm font-semibold uppercase tracking-wide mb-8"
                  style={{ color: WORK_COLOR }}
                >
                  {t("about.timelineSection.workLabel")}
                </h3>
                <TimelineList items={workItems} lineColor={WORK_COLOR} />
              </div>

              <div>
                <h3
                  className="text-[12px] sm:text-sm font-semibold uppercase tracking-wide mb-8 xl:text-right"
                  style={{ color: EDUCATION_COLOR }}
                >
                  {t("about.timelineSection.educationLabel")}
                </h3>
                <TimelineList
                  items={educationItems}
                  lineColor={EDUCATION_COLOR}
                  mirrored
                />
              </div>
            </div>
          </div>
        </section>

        <section className="py-32 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-16 text-center"
            >
              <span
                className="text-[12px] sm:text-sm font-semibold"
                style={{ color: "var(--premium-red)" }}
              >
                {t("about.skillsSection.eyebrow")}
              </span>
              <h2 className="text-[22px] sm:text-6xl font-semibold mb-0 sm:mb-4">
                {t("about.skillsSection.titlePlain")}{" "}
                <span style={{ color: "var(--premium-red)" }}>
                  {t("about.skillsSection.titleHighlight")}
                </span>
              </h2>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {skills.map((cat, i) => {
                const Icon = SKILL_ICONS[i % SKILL_ICONS.length];
                return (
                  <motion.div
                    key={cat.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    className="rounded-3xl p-6 bg-white glass-reflection card-inner-glow"
                    style={{ boxShadow: CARD_SHADOW, border: CARD_BORDER }}
                    whileHover={{
                      y: -6,
                      scale: 1.02,
                      borderColor: "var(--premium-red)",
                      transition: { duration: 0.3, ease: "easeOut" },
                    }}
                  >
                    <div className="flex items-center gap-3 mb-5">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                        style={{
                          background:
                            "linear-gradient(135deg, #F9FAFB, #F3F4F6)",
                          boxShadow:
                            "0 4px 12px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 1)",
                        }}
                      >
                        <Icon className="w-4 h-4 text-red-600" />
                      </div>
                      <span className="font-semibold text-sm">{cat.label}</span>
                    </div>

                    <ul className="flex flex-col gap-2.5">
                      {cat.items.map((item) => (
                        <li
                          key={item}
                          className="flex items-center gap-2 text-[13px] text-gray-600"
                        >
                          <ChevronRight className="w-3 h-3 text-red-400 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-32 px-6 relative">
          <div
            className="absolute inset-0 -z-10"
            style={{
              background:
                "linear-gradient(180deg, transparent 0%, rgba(248, 249, 250, 0.5) 100%)",
            }}
          />
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-16 text-center"
            >
              <span
                className="text-[12px] sm:text-sm font-semibold"
                style={{ color: "var(--premium-red)" }}
              >
                {t("about.contactSection.eyebrow")}
              </span>
              <h2 className="text-[22px] sm:text-6xl font-semibold mb-0 sm:mb-4">
                {t("about.contactSection.titlePlain")}{" "}
                <span style={{ color: "var(--premium-red)" }}>
                  {t("about.contactSection.titleHighlight")}
                </span>
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="max-w-xl mx-auto rounded-3xl p-10 bg-white glass-reflection card-inner-glow"
              style={{ boxShadow: CARD_SHADOW, border: CARD_BORDER }}
            >
              <p className="text-gray-600 text-sm leading-relaxed mb-8 text-left">
                {t("about.contactSection.description")}
              </p>

              <div className="flex flex-col gap-4">
                <a
                  href={SOCIAL_LINKS.emailHref}
                  className="flex items-center gap-3 text-sm text-gray-600 hover:text-black transition-colors py-1"
                >
                  <Mail className="w-4 h-4 text-red-600 shrink-0" />
                  {SOCIAL_LINKS.email}
                </a>
                <a
                  href={SOCIAL_LINKS.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-gray-600 hover:text-black transition-colors py-1"
                >
                  <Users className="w-4 h-4 text-red-600 shrink-0" />
                  {SOCIAL_LINKS.linkedin.replace(/^https?:\/\//, "")}
                </a>
                <a
                  href={SOCIAL_LINKS.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-gray-600 hover:text-black transition-colors py-1"
                >
                  <GitBranch className="w-4 h-4 text-red-600 shrink-0" />
                  {SOCIAL_LINKS.github.replace(/^https?:\/\//, "")}
                </a>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
