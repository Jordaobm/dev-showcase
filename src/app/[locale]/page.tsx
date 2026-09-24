import type { Metadata } from "next";
import { HomePage } from "@/features/shared/pages/HomePage";

const TITLE = "Dev Showcase | Jordão Beghetto Massariol";
const DESCRIPTION =
  "Portfólio técnico de Jordão Beghetto Massariol, desenvolvedor de software pleno fullstack. Demos funcionais de autenticação, PWA, APIs do navegador, dados offline e 3D, com o código aberto no GitHub.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

const Page = () => {
  return <HomePage />;
};

export default Page;
