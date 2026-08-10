"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ScenarioMode, ScenarioState } from "../services/api";

export interface ScenarioOption {
  mode: Exclude<ScenarioMode, "none">;
  icon: LucideIcon;
  label: string;
  description: string;
}

interface SimulationPanelProps {
  value: ScenarioState;
  onChange: (value: ScenarioState) => void;
  getNow: () => number;
  title: string;
  activeLabel: string;
  idleLabel: string;
  hint: string;
  activateLabel: string;
  deactivateLabel: string;
  options: ScenarioOption[];
}

export const SimulationPanel = ({
  value,
  onChange,
  getNow,
  title,
  activeLabel,
  idleLabel,
  hint,
  activateLabel,
  deactivateLabel,
  options,
}: SimulationPanelProps) => {
  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-5 w-1 rounded-full bg-destructive" />
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          </div>
          {value?.selected !== "none" ? (
            <span className="flex items-center gap-1.5 rounded-full border border-destructive/30 bg-destructive/10 px-2.5 py-1 text-xs text-destructive">
              <AlertTriangle size={11} />
              {activeLabel}
            </span>
          ) : (
            <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={11} />
              {idleLabel}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {options.map((opt) => {
            const Icon = opt.icon;
            const isActive = value?.selected === opt.mode;
            return (
              <button
                key={opt.mode}
                type="button"
                onClick={() => {
                  const events = value?.data?.[opt.mode]?.events ?? [];
                  const nextEvents = isActive
                    ? events.map((event, index) =>
                        index === events.length - 1
                          ? { ...event, end: getNow() }
                          : event,
                      )
                    : [...events, { start: getNow() }];

                  onChange({
                    selected: isActive ? "none" : opt.mode,
                    data: {
                      ...value?.data,
                      [opt.mode]: { events: nextEvents },
                    },
                  });
                }}
                aria-pressed={isActive}
                className={cn(
                  "cursor-pointer rounded-lg border-2 p-4 text-left transition-all duration-200",
                  isActive
                    ? "border-destructive/60 bg-destructive/5"
                    : "border-border hover:border-foreground/25 hover:bg-muted/50",
                )}
              >
                <div className="mb-2 flex items-center justify-between">
                  <div
                    className={cn(
                      "rounded-md p-1.5",
                      isActive ? "bg-background" : "bg-muted",
                    )}
                  >
                    <Icon
                      size={16}
                      className={
                        isActive ? "text-destructive" : "text-muted-foreground"
                      }
                    />
                  </div>
                  {isActive && (
                    <span className="size-2 animate-pulse rounded-full bg-destructive" />
                  )}
                </div>
                <p
                  className={cn(
                    "mb-1 text-sm font-medium",
                    isActive ? "text-destructive" : "text-foreground",
                  )}
                >
                  {opt.label}
                </p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {opt.description}
                </p>
                <div
                  className={cn(
                    "mt-3 rounded-md px-2.5 py-1 text-center text-xs font-medium transition-all",
                    isActive
                      ? "border border-destructive/40 bg-destructive/10 text-destructive"
                      : "bg-foreground text-background",
                  )}
                >
                  {isActive ? deactivateLabel : activateLabel}
                </div>
              </button>
            );
          })}
        </div>

        <p className="text-center text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
};
