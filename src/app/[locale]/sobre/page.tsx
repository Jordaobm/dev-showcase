import type { Metadata } from "next";
import { AboutPage } from "@/features/about/pages/AboutPage";

const TITLE = "Sobre | Jordão Beghetto Massariol";
const DESCRIPTION =
  "Desenvolvedor de software pleno fullstack — Java, Spring Boot, Node.js, PostgreSQL, React e TypeScript. Trajetória, experiência, formação e stack técnico.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/sobre" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/sobre",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

const Page = () => {
  return <AboutPage />;
};

export default Page;
