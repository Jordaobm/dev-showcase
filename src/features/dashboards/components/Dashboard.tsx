"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpDown,
  CheckCircle2,
  Cpu,
  MemoryStick,
  Timer,
  XCircle,
  Zap,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { DATA_INTERVAL_MS, getData } from "../services/api";
import type { IMetric, ScenarioState, TimeRange } from "../services/api";
import { AvailabilityTimeline } from "./AvailabilityTimeline";
import { DashboardHeader } from "./DashboardHeader";
import { MetricCard } from "./MetricCard";
import type { MetricStatus, MetricTrend } from "./MetricCard";
import { MetricChart } from "./MetricChart";
import { SimulationPanel } from "./SimulationPanel";

const TIME_RANGES: TimeRange[] = ["1m", "5m", "10m", "15m", "30m", "1h"];
const HISTORY_LOOKBACK = 10;

const METRIC_ACCENTS = {
  cpu: "text-blue-600 dark:text-blue-400",
  mem: "text-green-600 dark:text-green-400",
  error: "text-orange-600 dark:text-orange-400",
  reqsPerMinute: "text-red-600 dark:text-red-400",
  lat: "text-violet-600 dark:text-violet-400",
  success: "text-teal-600 dark:text-teal-400",
} as const;

const getStatus = (value: number, warn: number, crit: number): MetricStatus => {
  if (value >= crit) return "critical";
  if (value >= warn) return "warning";
  return "normal";
};

const getInverseStatus = (
  value: number,
  warn: number,
  crit: number,
): MetricStatus => {
  if (value <= crit) return "critical";
  if (value <= warn) return "warning";
  return "normal";
};

const getTrend = (
  current: number,
  previous: number | undefined,
  threshold: number,
): MetricTrend => {
  if (previous === undefined) return "stable";
  if (current > previous + threshold) return "up";
  if (current < previous - threshold) return "down";
  return "stable";
};

export const Dashboard = () => {
  const t = useTranslations("dashboards");
  const [timeRange, setTimeRange] = useState<TimeRange>("1m");
  const [scenarioData, setScenarioData] = useState<ScenarioState>({
    selected: "none",
    data: {
      cpu: { events: [] },
      memory: { events: [] },
      requests: { events: [] },
    },
  });

  const { data, isError } = useQuery({
    queryKey: ["dashboards"],
    queryFn: () => getData(timeRange, scenarioData),
    refetchInterval: DATA_INTERVAL_MS,
  });

  const history = useMemo<IMetric[]>(() => data?.data ?? [], [data]);
  const current = history[history.length - 1];
  const previous = history[history.length - 1 - HISTORY_LOOKBACK];

  const timeOptions = TIME_RANGES.map((value) => ({
    value,
    label: t(`timeRange.${value}`),
  }));

  const scenarioOptions = [
    {
      mode: "cpu" as const,
      icon: Cpu,
      label: t("scenario.cpu.label"),
      description: t("scenario.cpu.description"),
    },
    {
      mode: "memory" as const,
      icon: MemoryStick,
      label: t("scenario.memory.label"),
      description: t("scenario.memory.description"),
    },
    {
      mode: "requests" as const,
      icon: Zap,
      label: t("scenario.requests.label"),
      description: t("scenario.requests.description"),
    },
  ];

  const statusLabel = (status: MetricStatus) =>
    status === "critical"
      ? t("status.critical")
      : status === "warning"
        ? t("status.warning")
        : t("status.normal");

  const trendLabel = (trend: MetricTrend) =>
    trend === "up"
      ? t("trend.up")
      : trend === "down"
        ? t("trend.down")
        : t("trend.stable");

  return (
    <div className="mt-12 space-y-6" id="dashboard">
      <h3 className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-2xl font-bold text-transparent">
        {t("dashboardTitle")}
      </h3>

      <DashboardHeader
        liveLabel={t("live")}
        timeRangeLabel={t("timeRangeLabel")}
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        timeOptions={timeOptions}
      />

      {isError && (
        <p className="text-sm text-destructive">{t("dashboardError")}</p>
      )}

      {!isError && !current && (
        <p className="text-sm text-muted-foreground">{t("dashboardLoading")}</p>
      )}

      {current &&
        (() => {
          const cpuStatus = getStatus(current.cpu, 70, 85);
          const memStatus = getStatus(current.mem, 75, 90);
          const latStatus = getStatus(current.lat, 300, 800);
          const successStatus = getInverseStatus(current.success, 98, 95);
          const errorStatus = getStatus(current.error, 2, 5);
          const reqsStatus = getStatus(current.reqsPerMinute, 300, 450);
          const cpuTrend = getTrend(current.cpu, previous?.cpu, 2);
          const memTrend = getTrend(current.mem, previous?.mem, 2);
          const latTrend = getTrend(current.lat, previous?.lat, 20);

          return (
            <>
              <section>
                <h4 className="mb-4 text-sm font-semibold text-foreground">
                  {t("kpiSectionTitle")}
                </h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <MetricCard
                    title={t("metrics.cpu")}
                    value={current.cpu.toFixed(1)}
                    unit="%"
                    icon={Cpu}
                    accentClassName={METRIC_ACCENTS.cpu}
                    status={cpuStatus}
                    statusLabel={statusLabel(cpuStatus)}
                    trend={cpuTrend}
                    trendLabel={trendLabel(cpuTrend)}
                    invertTrend
                  />
                  <MetricCard
                    title={t("metrics.mem")}
                    value={current.mem.toFixed(1)}
                    unit="%"
                    icon={MemoryStick}
                    accentClassName={METRIC_ACCENTS.mem}
                    status={memStatus}
                    statusLabel={statusLabel(memStatus)}
                    trend={memTrend}
                    trendLabel={trendLabel(memTrend)}
                    invertTrend
                  />
                  <MetricCard
                    title={t("metrics.error")}
                    value={current.error.toFixed(2)}
                    unit="%"
                    icon={XCircle}
                    accentClassName={METRIC_ACCENTS.error}
                    status={errorStatus}
                    statusLabel={statusLabel(errorStatus)}
                    subtitle={t("metrics.errorSubtitle")}
                  />
                  <MetricCard
                    title={t("metrics.reqsPerMinute")}
                    value={Math.round(current.reqsPerMinute).toString()}
                    icon={ArrowUpDown}
                    accentClassName={METRIC_ACCENTS.reqsPerMinute}
                    status={reqsStatus}
                    statusLabel={statusLabel(reqsStatus)}
                    subtitle={t("metrics.reqsPerMinuteSubtitle")}
                  />
                  <MetricCard
                    title={t("metrics.lat")}
                    value={current.lat.toFixed(0)}
                    unit="ms"
                    icon={Timer}
                    accentClassName={METRIC_ACCENTS.lat}
                    status={latStatus}
                    statusLabel={statusLabel(latStatus)}
                    trend={latTrend}
                    trendLabel={trendLabel(latTrend)}
                    invertTrend
                  />
                  <MetricCard
                    title={t("metrics.success")}
                    value={current.success.toFixed(2)}
                    unit="%"
                    icon={CheckCircle2}
                    accentClassName={METRIC_ACCENTS.success}
                    status={successStatus}
                    statusLabel={statusLabel(successStatus)}
                    subtitle={t("metrics.successSubtitle")}
                  />
                </div>
              </section>

              <section>
                <h4 className="mb-4 text-sm font-semibold text-foreground">
                  {t("chartsSectionTitle")}
                </h4>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  <MetricChart
                    title={t("metrics.cpu")}
                    data={history}
                    dataKey="cpu"
                    unit="%"
                    domain={[0, 100]}
                    formatValue={(v) => v.toFixed(1)}
                    accentClassName={METRIC_ACCENTS.cpu}
                  />
                  <MetricChart
                    title={t("metrics.mem")}
                    data={history}
                    dataKey="mem"
                    unit="%"
                    domain={[0, 100]}
                    formatValue={(v) => v.toFixed(1)}
                    accentClassName={METRIC_ACCENTS.mem}
                  />
                  <MetricChart
                    title={t("metrics.error")}
                    data={history}
                    dataKey="error"
                    unit="%"
                    domain={[0, 100]}
                    formatValue={(v) => v.toFixed(2)}
                    accentClassName={METRIC_ACCENTS.error}
                  />
                  <MetricChart
                    title={t("metrics.reqsPerMinute")}
                    data={history}
                    dataKey="reqsPerMinute"
                    domain={[0, "auto"]}
                    formatValue={(v) => String(Math.round(v))}
                    accentClassName={METRIC_ACCENTS.reqsPerMinute}
                  />
                  <MetricChart
                    title={t("metrics.lat")}
                    data={history}
                    dataKey="lat"
                    unit="ms"
                    domain={[0, "auto"]}
                    formatValue={(v) => String(Math.round(v))}
                    accentClassName={METRIC_ACCENTS.lat}
                  />
                  <MetricChart
                    title={t("metrics.success")}
                    data={history}
                    dataKey="success"
                    unit="%"
                    domain={[85, 100]}
                    formatValue={(v) => v.toFixed(2)}
                    accentClassName={METRIC_ACCENTS.success}
                  />
                </div>
              </section>

              <AvailabilityTimeline
                title={t("availabilityTitle")}
                data={history}
                legend={{
                  good: t("availability.good"),
                  degraded: t("availability.degraded"),
                  critical: t("availability.critical"),
                }}
              />

              <section>
                <SimulationPanel
                  value={scenarioData}
                  onChange={(data) => setScenarioData(data)}
                  title={t("scenario.title")}
                  activeLabel={t("scenario.active")}
                  idleLabel={t("scenario.idle")}
                  hint={t("scenario.hint")}
                  activateLabel={t("scenario.activate")}
                  deactivateLabel={t("scenario.deactivate")}
                  options={scenarioOptions}
                />
              </section>
            </>
          );
        })()}
    </div>
  );
};
