import { api } from "@/features/shared/services/api";

export type TimeRange = "1m" | "5m" | "10m" | "15m" | "30m" | "1h";

export type ScenarioMode = "none" | "cpu" | "memory" | "requests";

export interface ScenarioEvent {
  start: number;
  end?: number;
}

export interface ScenarioState {
  selected: ScenarioMode;
  data: Record<Exclude<ScenarioMode, "none">, { events: ScenarioEvent[] }>;
}

export interface IMetric {
  cpu: number;
  mem: number;
  lat: number;
  success: number;
  error: number;
  reqsPerMinute: number;
  availability: number;
  timestamp: number;
  date?: string;
}

const TIME_RANGE_SECONDS: Record<TimeRange, number> = {
  "1m": 60,
  "5m": 300,
  "10m": 600,
  "15m": 900,
  "30m": 1800,
  "1h": 3600,
};

export const DATA_INTERVAL_MS = 5000;

export const getData = async (
  timeRange: TimeRange,
  scenarioData: ScenarioState,
) => {
  const response = await api().post<IMetric[]>("/dashboard/data", {
    elapsedTime: TIME_RANGE_SECONDS[timeRange] * 1000,
    interval: DATA_INTERVAL_MS,
    scenarioData,
  });

  const metrics = response.data;
  const last = metrics[metrics.length - 1];
  // O servidor gera os timestamps da série com o próprio relógio; se o relógio do
  // cliente estiver dessincronizado (comum fora do ambiente de dev, onde cliente e
  // servidor são a mesma máquina), a rampa de simulação quebra: `start`/`end` são
  // marcados com Date.now() do cliente e comparados a timestamps do servidor em
  // rampValue (route.ts). Esse offset corrige a leitura de "agora" para o relógio
  // do servidor antes de qualquer novo evento ser registrado.
  const serverOffsetMs = last ? last.timestamp - Date.now() : 0;

  return { data: metrics, serverOffsetMs };
};
