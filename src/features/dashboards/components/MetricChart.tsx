"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useLocale } from "next-intl";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { IMetric } from "../services/api";

type MetricKey = keyof Omit<IMetric, "timestamp" | "date">;

interface MetricChartProps {
  title: string;
  data: IMetric[];
  dataKey: MetricKey;
  unit?: string;
  domain?: [number | "auto", number | "auto"];
  formatValue?: (value: number) => string;
  accentClassName?: string;
}

const DEFAULT_FORMAT = (value: number) => String(Math.round(value));

interface ChartTooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
  unit?: string;
  formatValue: (value: number) => string;
}

const ChartTooltip = ({
  active,
  payload,
  label,
  unit,
  formatValue,
}: ChartTooltipProps) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md">
      <div className="mb-0.5 text-muted-foreground">{label}</div>
      <div className="font-bold">
        {formatValue(payload[0].value)}
        {unit && (
          <span className="ml-0.5 font-normal text-muted-foreground">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
};

export const MetricChart = ({
  title,
  data,
  dataKey,
  unit,
  domain,
  formatValue = DEFAULT_FORMAT,
  accentClassName = "text-foreground",
}: MetricChartProps) => {
  const locale = useLocale();

  const chartData = data.map((point) => ({
    time: new Date(point.timestamp).toLocaleTimeString(locale, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
    value: point[dataKey],
  }));

  const lastValue = chartData[chartData.length - 1]?.value;
  const gradientId = `dashboards-chart-${dataKey}`;

  return (
    <Card size="sm">
      <CardHeader className="flex items-center justify-between">
        <CardTitle>{title}</CardTitle>
        {lastValue !== undefined && (
          <span className="rounded-md bg-muted px-2 py-0.5 text-xs tabular-nums text-muted-foreground">
            {formatValue(lastValue)}
            {unit && <span className="ml-0.5 text-muted-foreground/70">{unit}</span>}
          </span>
        )}
      </CardHeader>
      <CardContent className={cn("h-36", accentClassName)}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="currentColor" stopOpacity={0.3} />
                <stop offset="95%" stopColor="currentColor" stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 9, fill: "var(--muted-foreground)" }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={domain ?? ["auto", "auto"]}
              tick={{ fontSize: 9, fill: "var(--muted-foreground)" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              content={<ChartTooltip unit={unit} formatValue={formatValue} />}
              cursor={{ stroke: "currentColor", strokeWidth: 1, strokeDasharray: "4 4" }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="currentColor"
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              dot={false}
              activeDot={{ r: 4, fill: "currentColor", strokeWidth: 0 }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
