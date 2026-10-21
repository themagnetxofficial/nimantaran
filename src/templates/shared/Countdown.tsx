"use client";

import { useSyncExternalStore } from "react";
import { eventStart, mainEvent } from "@/lib/invite/datetime";
import { cn } from "@/lib/utils/cn";
import { L } from "./Label";
import { useInvite } from "./runtime";

// A tiny shared 1-second clock. `null` on the server so SSR markup is stable.
const listeners = new Set<() => void>();
let now = 0;
let timer: ReturnType<typeof setInterval> | undefined;
function subscribe(cb: () => void) {
  listeners.add(cb);
  if (!timer) {
    now = Date.now();
    timer = setInterval(() => {
      now = Date.now();
      listeners.forEach((l) => l());
    }, 1000);
  }
  return () => {
    listeners.delete(cb);
    if (listeners.size === 0) {
      clearInterval(timer);
      timer = undefined;
    }
  };
}
const getSnapshot = () => {
  if (!now) now = Date.now();
  return now;
};
const getServerSnapshot = () => null;

interface Props {
  className?: string;
  /** classes for each number box */
  unitClassName?: string;
  numberClassName?: string;
  labelClassName?: string;
}

export function Countdown({ className, unitClassName, numberClassName, labelClassName }: Props) {
  const { data } = useInvite();
  const current = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const target = mainEvent(data);
  const start = target ? eventStart(target) : null;
  if (!start) return null;

  const diff = current === null ? null : start.getTime() - current;

  if (diff !== null && diff <= 0) {
    const pastDay = diff < -24 * 60 * 60 * 1000;
    return <L k={pastDay ? "celebrated" : "itsToday"} as="p" className={cn("text-center", className)} />;
  }

  const parts =
    diff === null
      ? null
      : {
          days: Math.floor(diff / 86_400_000),
          hours: Math.floor((diff / 3_600_000) % 24),
          minutes: Math.floor((diff / 60_000) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        };

  const units = ["days", "hours", "minutes", "seconds"] as const;

  return (
    <div className={cn("flex justify-center gap-2 sm:gap-4", className)} role="timer" aria-live="off">
      {units.map((u) => (
        <div key={u} className={cn("flex min-w-16 flex-col items-center rounded-xl px-2 py-3", unitClassName)}>
          <span className={cn("font-serif text-3xl tabular-nums leading-none", numberClassName)}>
            {parts ? String(parts[u]).padStart(2, "0") : "--"}
          </span>
          <L k={u} className={cn("mt-1.5 text-[0.65rem] uppercase tracking-[0.18em]", labelClassName)} subClassName="hidden" />
        </div>
      ))}
    </div>
  );
}
