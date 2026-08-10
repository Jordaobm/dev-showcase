"use client";

import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";
import { useLocale } from "next-intl";
import { useEffect, useState } from "react";
import type { TimeRange } from "../services/api";

interface TimeOption {
  value: TimeRange;
  label: string;
}

interface DashboardHeaderProps {
  liveLabel: string;
  timeRangeLabel: string;
  timeRange: TimeRange;
  onTimeRangeChange: (value: TimeRange) => void;
  timeOptions: TimeOption[];
}

const useSystemClock = () => {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return now;
};

export const DashboardHeader = ({
  liveLabel,
  timeRangeLabel,
  timeRange,
  onTimeRangeChange,
  timeOptions,
}: DashboardHeaderProps) => {
  const locale = useLocale();
  const clock = useSystemClock();

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex flex-col items-start justify-between gap-4 px-5 py-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-600 dark:text-emerald-400">
            <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
            <span>{liveLabel}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm font-medium tabular-nums text-foreground">
            <Clock size={14} className="text-muted-foreground" aria-hidden />
            <span suppressHydrationWarning>
              {clock?.toLocaleTimeString(locale, {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              }) ?? "--:--:--"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="sr-only">{timeRangeLabel}</span>
          <div className="flex gap-0.5 rounded-lg bg-muted p-0.5">
            {timeOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onTimeRangeChange(opt.value)}
                aria-pressed={timeRange === opt.value}
                className={cn(
                  "cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium transition-all duration-150",
                  timeRange === opt.value
                    ? "bg-foreground text-background shadow-sm"
                    : "text-muted-foreground hover:bg-background hover:text-foreground",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
