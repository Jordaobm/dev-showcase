import type { Metadata } from "next";
import { AboutPage } from "@/features/about/pages/AboutPage";

const TITLE = "Sobre | Jordão Beghetto Massariol";
const DESCRIPTION =
  "Desenvolvedor de software com cinco anos de experiência no mercado, atuando em arquitetura de aplicações para os setores público e privado, além de liderança técnica. Trajetória, formação e stack técnico completos.";

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
