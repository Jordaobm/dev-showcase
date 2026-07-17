import { redirect } from "@/i18n/navigation";
import { ShowcasePage } from "@/features/shared/pages/ShowcasePage";
import { registry } from "@/registry/index";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { resolveText } from "@/features/shared/utils/resolveText";
import { routing } from "@/i18n/routing";

export const generateStaticParams = () => {
  return routing.locales.flatMap((locale) =>
    registry.map((demo) => ({ locale, id: demo.id })),
  );
};

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) => {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const demo = registry.find((d) => d.id === id);
  if (!demo) return {};

  const t = await getTranslations();
  const demoName = resolveText(t, demo.name);
  const demoDescription = resolveText(t, demo.description);

  return {
    title: demoName,
    description: demoDescription,
    alternates: { canonical: `/showcase/${id}` },
    openGraph: { title: demoName, description: demoDescription },
    twitter: {
      card: "summary_large_image",
      title: demoName,
      description: demoDescription,
    },
  };
};

const Page = async ({
  params,
}: Readonly<{
  params: Promise<{ locale: string; id: string }>;
}>) => {
  const { locale, id } = await params;
  setRequestLocale(locale);

  if (!registry.some((d) => d.id === id)) redirect({ href: "/", locale });
  return <ShowcasePage id={id} />;
};

export default Page;
