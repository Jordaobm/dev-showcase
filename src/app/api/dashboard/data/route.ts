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

const lerp = (a: number, b: number, t: number): number => a + t * (b - a);

const rampProgress = (tick: number, ticks: number) => {
  if (tick >= ticks - 1) return { p0: 1, p1: 1 };

  const OVERLAP = 0.15;
  const progress = tick / (ticks - 1);

  return {
    p0: Math.max(0, progress - OVERLAP),
    p1: Math.min(1, progress + OVERLAP),
  };
};

const rampValue = (
  interval: number,
  timestamp: number,
  events: ScenarioEvent[] | undefined,
  idleMin: number,
  idleMax: number,
  peakMin: number,
  peakMax: number,
): number => {
  const TICK = 4;

  let p0 = 0;
  let p1 = 0;

  const event = events?.filter((e) => e.start <= timestamp).at(-1);
  const start = event?.start;
  const end = event?.end;

  if (start && timestamp >= start) {
    const tick = Math.min(Math.floor((timestamp - start) / interval), TICK - 1);

    ({ p0, p1 } = rampProgress(tick, TICK));
  }

  if (end && timestamp >= end) {
    const descendTicks = Math.floor((timestamp - end) / interval);

    if (descendTicks < TICK) {
      const descendingTick = TICK - 1 - descendTicks;

      ({ p0, p1 } = rampProgress(descendingTick, TICK));
    } else {
      p0 = 0;
      p1 = 0;
    }
  }

  const min = lerp(idleMin, peakMin, p0);
  const max = lerp(idleMax, peakMax, p1);

  const value = randomValue(timestamp, interval, min, max);
  const noiseAmplitude = Math.abs(max - min) * 0.15;
  const noise = randomValue(
    timestamp + 9999,
    interval,
    -noiseAmplitude,
    noiseAmplitude,
  );

  return value + noise;
};

const worstOf = (idleMid: number, candidates: number[]): number =>
  candidates.reduce(
    (worst, candidate) =>
      Math.abs(candidate - idleMid) > Math.abs(worst - idleMid)
        ? candidate
        : worst,
    idleMid,
  );

const clampPercent = (value: number): number =>
  Math.max(0, Math.min(100, value));
const clampMin0 = (value: number): number => Math.max(0, value);

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

  const cpuEvents = scenarioData?.data?.cpu?.events;
  const memEvents = scenarioData?.data?.memory?.events;
  const reqEvents = scenarioData?.data?.requests?.events;

  return Array.from({ length }, (_, index) => {
    const timestamp = timeStart + interval * (index + 1);

    const cpu = clampPercent(
      worstOf(5, [
        rampValue(interval, timestamp, cpuEvents, 0, 10, 80, 100),
        rampValue(interval, timestamp, reqEvents, 0, 10, 90, 100),
      ]),
    );

    const mem = clampPercent(
      worstOf(30, [
        rampValue(interval, timestamp, memEvents, 20, 40, 90, 100),
        rampValue(interval, timestamp, reqEvents, 20, 40, 80, 100),
      ]),
    );

    const reqsPerMinute = clampMin0(
      worstOf(150, [
        rampValue(interval, timestamp, reqEvents, 100, 200, 500, 1000), // pico de tráfego: sobe
        rampValue(interval, timestamp, cpuEvents, 100, 200, 10, 20), // CPU saturada: throughput desaba
        rampValue(interval, timestamp, memEvents, 100, 200, 0, 5), // memória saturada: desaba mais ainda
      ]),
    );

    const lat = clampMin0(
      worstOf(75, [
        rampValue(interval, timestamp, cpuEvents, 60, 90, 700, 999),
        rampValue(interval, timestamp, memEvents, 60, 90, 700, 999),
        rampValue(interval, timestamp, reqEvents, 60, 90, 700, 999),
      ]),
    );

    const error = clampPercent(
      worstOf(1, [
        rampValue(interval, timestamp, cpuEvents, 0, 2, 40, 100),
        rampValue(interval, timestamp, memEvents, 0, 2, 90, 100),
        rampValue(interval, timestamp, reqEvents, 0, 2, 90, 100),
      ]),
    );

    const success = clampPercent(100 - error);

    const availability = clampPercent(
      worstOf(99.95, [
        rampValue(interval, timestamp, cpuEvents, 99.9, 100, 97, 99), // CPU sozinha degrada, mas raramente derruba
        rampValue(interval, timestamp, memEvents, 99.9, 100, 90, 95), // memória é o cenário mais próximo de outage real
        rampValue(interval, timestamp, reqEvents, 99.9, 100, 95, 98),
      ]),
    );

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
