import { useTranslations } from "next-intl";

export const WebSocketSection = () => {
  const t = useTranslations("realtime");

  const paragraphs = [1, 2, 3, 4, 5, 6, 7] as const;

  return (
    <div className="mt-12" id="websocket">
      <h3 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
        {t("websocketTitle")}
      </h3>

      <div className="mt-4 space-y-3 text-gray-600 text-base leading-relaxed">
        {paragraphs.map((n) => (
          <p key={n}>{t(`websocketParagraph${n}`)}</p>
        ))}
      </div>
    </div>
  );
};
