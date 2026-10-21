"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface Props {
  index: number;
  title: string;
  subtitle: string;
  open: boolean;
  onToggle: () => void;
  issues?: number;
  children: ReactNode;
}

/** One collapsible step of the builder form. */
export function StepSection({ index, title, subtitle, open, onToggle, issues = 0, children }: Props) {
  const panelId = `step-panel-${index}`;
  return (
    <section className={cn("rounded-card bg-white ring-1 transition-shadow", open ? "shadow-soft ring-gold-300/70" : "ring-ivory-300/80")}>
      <h2>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          className="flex w-full items-center gap-4 rounded-card px-5 py-4 text-left"
        >
          <span
            className={cn(
              "grid size-9 shrink-0 place-items-center rounded-full text-sm font-bold",
              open ? "bg-wine-700 text-ivory-50" : "bg-ivory-200 text-wine-700",
            )}
          >
            {index}
          </span>
          <span className="flex-1">
            <span className="block font-serif text-xl font-semibold text-ink-900">{title}</span>
            <span className="block text-xs text-ink-500">{subtitle}</span>
          </span>
          {issues > 0 && (
            <span className="rounded-full bg-wine-500/10 px-2 py-0.5 text-[11px] font-semibold text-wine-600">
              {issues} to fix
            </span>
          )}
          <svg viewBox="0 0 20 20" className={cn("size-5 text-ink-500 transition-transform", open && "rotate-180")} aria-hidden>
            <path d="m5 8 5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </h2>
      {open && (
        <div id={panelId} className="flex flex-col gap-5 border-t border-ivory-200 px-5 pb-6 pt-5">
          {children}
        </div>
      )}
    </section>
  );
}
