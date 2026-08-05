import { handleApiError } from "@/lib/apiError";
import { NextRequest, NextResponse } from "next/server";

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

export interface ScenarioEvent {
  start: number;
  end?: number;
}

const randomValue = (
  timestamp: number,
  interval: number,
  min = 0,
  max = 100,
): number => {
  let seed = Math.floor(timestamp / interval);
  seed ^= seed >>> 16;
  seed = Math.imul(seed, 0x45d9f3b);
  seed ^= seed >>> 16;

  const hash = seed >>> 0;
  const random = hash / 0xffffffff;

  return min + random * (max - min);
};

const progressiveGenerate = (
  interval: number,
  timestamp: number,
  events?: ScenarioEvent[],
) => {
  const TICK = 4;
  const STEP = 100 / TICK;
  const OVERLAP = STEP * 0.8;
  const NOISE = 6;

  let min = 1;
  let max = 10;

  const event = events?.filter((e) => e.start <= timestamp).at(-1);
  const start = event?.start;
  const end = event?.end;

  if (start && timestamp >= start) {
    const tick = Math.min(Math.floor((timestamp - start) / interval), TICK - 1);

    min = Math.max(0, tick * STEP - OVERLAP);
    max = Math.min(100, (tick + 1) * STEP + OVERLAP);
  }

  if (end && timestamp >= end) {
    const tick = Math.min(Math.floor((timestamp - end) / interval), TICK - 1);

    const descendingTick = TICK - 1 - tick;

    min = Math.max(0, descendingTick * STEP - OVERLAP);
    max = Math.min(100, (descendingTick + 1) * STEP + OVERLAP);
  }

  const value = randomValue(timestamp, interval, min, max);

  const noise = randomValue(timestamp + 9999, interval, -NOISE, NOISE);

  return Math.max(0, Math.min(100, value + noise));
};

interface ScenarioData {
  selected?: string;
  data?: {
    cpu?: { events?: ScenarioEvent[] };
    mem?: { events?: ScenarioEvent[] };
    requests?: { events?: ScenarioEvent[] };
  };
}

const generateMetrics = (
  elapsedTime: number,
  interval: number,
  scenarioData: ScenarioData | undefined,
): IMetric[] => {
  const length = elapsedTime / interval;
  const timeStart = Date.now() - elapsedTime;

  return Array.from({ length }, (_, index) => {
    const timestamp = timeStart + interval * (index + 1);

    return {
      cpu: progressiveGenerate(
        interval,
        timestamp,
        scenarioData?.data?.cpu?.events,
      ),
      mem: 0,
      lat: 0,
      success: 0,
      error: 0,
      reqsPerMinute: 0,
      availability: 0,
      timestamp,
      date: new Date(timestamp).toISOString(),
    };
  });
};

export const POST = async (request: NextRequest) => {
  try {
    const { elapsedTime, interval, scenarioData } = await request.json();

    const data = generateMetrics(
      Number(elapsedTime),
      Number(interval),
      scenarioData,
    );

    return NextResponse.json(data);
  } catch (error) {
    return handleApiError(error, "dashboard/data", 400);
  }
};
