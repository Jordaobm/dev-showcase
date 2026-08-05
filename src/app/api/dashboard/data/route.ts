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
    const descendElapsed = timestamp - end;
    const descendTicks = Math.floor(descendElapsed / interval);

    if (descendTicks < TICK) {
      const descendingTick = TICK - 1 - descendTicks;

      min = Math.max(0, descendingTick * STEP - OVERLAP);
      max = Math.min(100, (descendingTick + 1) * STEP + OVERLAP);
    } else {
      min = 1;
      max = 10;
    }
  }

  const value = randomValue(timestamp, interval, min, max);

  const noise = randomValue(timestamp + 9999, interval, -NOISE, NOISE);

  return Math.max(0, Math.min(100, value + noise));
};

const scaleIntensity = (
  intensity: number,
  idle: number,
  peak: number,
): number => idle + (intensity / 100) * (peak - idle);

interface ScenarioData {
  selected?: string;
  data?: {
    cpu?: { events?: ScenarioEvent[] };
    memory?: { events?: ScenarioEvent[] };
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

    const cpuIntensity = progressiveGenerate(
      interval,
      timestamp,
      scenarioData?.data?.cpu?.events,
    );
    const memIntensity = progressiveGenerate(
      interval,
      timestamp,
      scenarioData?.data?.memory?.events,
    );
    const reqIntensity = progressiveGenerate(
      interval,
      timestamp,
      scenarioData?.data?.requests?.events,
    );

    const cpu = cpuIntensity;
    const mem = scaleIntensity(memIntensity, 32, 96);
    const reqsPerMinute = scaleIntensity(reqIntensity, 110, 560);

    const latStress = Math.max(
      cpuIntensity * 0.9,
      memIntensity * 0.6,
      reqIntensity * 0.5,
    );
    const lat = scaleIntensity(latStress, 40, 940);

    const errorStress = Math.max(
      cpuIntensity * 0.8,
      memIntensity * 0.5,
      reqIntensity * 0.3,
    );
    const error = scaleIntensity(errorStress, 0.2, 12.2);
    const success = Math.max(0, 100 - error);

    const availabilityStress = Math.max(
      cpuIntensity * 0.25,
      memIntensity * 0.9,
      reqIntensity * 0.15,
    );
    const availability = scaleIntensity(availabilityStress, 99.98, 94.98);

    return {
      cpu,
      mem,
      lat,
      success,
      error,
      reqsPerMinute,
      availability,
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
