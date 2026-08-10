"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useLocale } from "next-intl";
import type { IMetric } from "../services/api";

type AvailabilityTier = "good" | "degraded" | "critical";

interface AvailabilityTimelineProps {
  title: string;
  data: IMetric[];
  legend: Record<AvailabilityTier, string>;
  segments?: number;
}

const TIER_COLOR: Record<AvailabilityTier, string> = {
  good: "bg-emerald-500",
  degraded: "bg-amber-400",
  critical: "bg-destructive",
};

const getTier = (value: number): AvailabilityTier => {
  if (value < 99) return "critical";
  if (value < 99.5) return "degraded";
  return "good";
};

export const AvailabilityTimeline = ({
  title,
  data,
  legend,
  segments = 60,
}: AvailabilityTimelineProps) => {
  const locale = useLocale();
  const current = data[data.length - 1];

  const bucketSize = Math.max(1, Math.ceil(data.length / segments));
  const buckets = [];
  for (let i = 0; i < data.length; i += bucketSize) {
    const slice = data.slice(i, i + bucketSize);
    const worst = Math.min(...slice.map((point) => point.availability));
    buckets.push({
      tier: getTier(worst),
      value: worst,
      timestamp: slice[slice.length - 1].timestamp,
    });
  }

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "h-5 w-1 rounded-full",
                TIER_COLOR[getTier(current?.availability ?? 100)],
              )}
            />
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          </div>
          {current && (
            <span className="text-sm font-medium tabular-nums text-foreground">
              {current.availability.toFixed(3)}%
            </span>
          )}
        </div>

        <div className="flex h-8 items-stretch gap-0.5">
          {buckets.map((bucket) => (
            <div
              key={bucket.timestamp}
              title={`${new Date(bucket.timestamp).toLocaleTimeString(locale, {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })} · ${bucket.value.toFixed(2)}%`}
              className={cn("flex-1 rounded-sm", TIER_COLOR[bucket.tier])}
            />
          ))}
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {(Object.keys(legend) as AvailabilityTier[]).map((tier) => (
            <span key={tier} className="flex items-center gap-1.5">
              <span className={cn("size-2 rounded-full", TIER_COLOR[tier])} />
              {legend[tier]}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
