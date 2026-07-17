import { redirect } from "@/i18n/navigation";

const CatchAll = async ({
  params,
}: Readonly<{
  params: Promise<{ locale: string }>;
}>) => {
  const { locale } = await params;
  redirect({ href: "/", locale });
};

export default CatchAll;
