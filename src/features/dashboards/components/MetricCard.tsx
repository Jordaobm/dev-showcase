import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";

export type MetricStatus = "normal" | "warning" | "critical";
export type MetricTrend = "up" | "down" | "stable";

interface MetricCardProps {
  title: string;
  value: string;
  unit?: string;
  icon: LucideIcon;
  accentClassName: string;
  status: MetricStatus;
  statusLabel: string;
  trend?: MetricTrend;
  trendLabel?: string;
  subtitle?: string;
  invertTrend?: boolean;
}

const STATUS_STYLES: Record<MetricStatus, { border: string; surface: string; dot: string }> = {
  normal: { border: "border-border", surface: "", dot: "bg-emerald-500" },
  warning: {
    border: "border-amber-500/60",
    surface: "bg-amber-500/5",
    dot: "bg-amber-500",
  },
  critical: {
    border: "border-destructive/60",
    surface: "bg-destructive/5",
    dot: "bg-destructive",
  },
};

export const MetricCard = ({
  title,
  value,
  unit,
  icon: Icon,
  accentClassName,
  status,
  statusLabel,
  trend,
  trendLabel,
  subtitle,
  invertTrend = false,
}: MetricCardProps) => {
  const styles = STATUS_STYLES[status];
  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendIsGood = trend
    ? invertTrend
      ? trend === "down"
      : trend === "up"
    : false;
  const trendColor =
    !trend || trend === "stable"
      ? "text-muted-foreground"
      : trendIsGood
        ? "text-emerald-600 dark:text-emerald-400"
        : "text-destructive";

  return (
    <Card className={cn("border-2", styles.border, styles.surface)}>
      <CardContent className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-muted p-2.5">
              <Icon size={22} className={accentClassName} />
            </div>
            <span className="select-none text-sm text-muted-foreground">
              {title}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <span className={cn("size-2 rounded-full animate-pulse", styles.dot)} />
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
              {statusLabel}
            </span>
          </div>
        </div>

        <div>
          <div className="flex items-baseline gap-1.5">
            <span className={cn("text-5xl font-bold tabular-nums", accentClassName)}>
              {value}
            </span>
            {unit && <span className="text-base text-muted-foreground">{unit}</span>}
          </div>
          {subtitle && (
            <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>

        {trend && trendLabel && (
          <div className={cn("flex items-center gap-1 text-xs", trendColor)}>
            <TrendIcon size={13} />
            <span>{trendLabel}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
