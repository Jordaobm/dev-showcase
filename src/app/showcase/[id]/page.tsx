import { redirect } from "next/navigation";
import { ShowcasePage } from "@/features/shared/pages/ShowcasePage";
import { registry } from "@/registry/index";
import { getTranslations } from "next-intl/server";
import { resolveText } from "@/features/shared/utils/resolveText";

export const generateStaticParams = async () => {
  return registry.map((demo) => ({ id: demo.id }));
};

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
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
  params: Promise<{ id: string }>;
}>) => {
  const { id } = await params;
  if (!registry.some((d) => d.id === id)) redirect("/");
  return <ShowcasePage id={id} />;
};

export default Page;
