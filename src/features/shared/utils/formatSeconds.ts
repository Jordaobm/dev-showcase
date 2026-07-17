import { useTranslations } from "next-intl";

type Translator = ReturnType<typeof useTranslations>;

export const formatSeconds = (seconds: number | undefined, t: Translator) => {
  if (seconds === undefined || !Number.isFinite(seconds)) {
    return t("shared.time.notMeasured");
  }

  const totalSeconds = Math.max(0, Math.round(seconds));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  const parts = [
    days > 0 && t("shared.time.days", { count: days }),
    hours > 0 && t("shared.time.hours", { count: hours }),
    minutes > 0 && t("shared.time.minutes", { count: minutes }),
    (secs > 0 || totalSeconds === 0) && t("shared.time.seconds", { count: secs }),
  ].filter((part): part is string => Boolean(part));

  if (parts.length === 1) return parts[0];

  const last = parts[parts.length - 1];
  const rest = parts.slice(0, -1);
  return `${rest.join(", ")} ${t("shared.time.and")} ${last}`;
};
