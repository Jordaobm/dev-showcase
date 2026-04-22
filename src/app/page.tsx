import type { Metadata } from "next";
import { HomePage } from "@/features/shared/pages/HomePage";

const TITLE = "Dev Showcase | Jordão Beghetto Massariol";
const DESCRIPTION =
  "Um showcase técnico onde cada implementação demonstra uma competência real de engenharia de software. Arquitetura, performance, segurança, PWAs, Browser APIs, renderização 3D e muito mais, reunidos em experiências interativas.";

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
