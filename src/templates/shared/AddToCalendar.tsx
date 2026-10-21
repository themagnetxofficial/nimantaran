"use client";

import { useId, useState } from "react";
import { buildIcs, googleCalendarUrl, type CalendarEventInput } from "@/lib/calendar/ics";
import { cn } from "@/lib/utils/cn";
import { L } from "./Label";

interface Props extends CalendarEventInput {
  className?: string;
  menuClassName?: string;
}

/** "Add to calendar" with two choices: Google Calendar (Android) or an .ics file (iPhone/Outlook). */
export function AddToCalendar({ className, menuClassName, ...input }: Props) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const google = googleCalendarUrl(input);
  if (!google) return null;

  const downloadIcs = () => {
    const ics = buildIcs(input);
    if (!ics) return;
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${input.title.replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-") || "event"}.ics`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setOpen(false);
  };

  return (
    <div className="relative inline-block">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-transform active:scale-95",
          className,
        )}
      >
        <svg aria-hidden viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
          <path d="M3.5 10h17M8 3v4M16 3v4" />
        </svg>
        <L k="addToCalendar" subClassName="hidden" />
      </button>
      {open && (
        <div
          id={menuId}
          className={cn(
            "absolute left-1/2 top-full z-20 mt-2 w-48 -translate-x-1/2 overflow-hidden rounded-xl bg-white text-left text-sm text-neutral-800 shadow-lg ring-1 ring-black/5",
            menuClassName,
          )}
        >
          <a
            href={google}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="block px-4 py-3 hover:bg-neutral-50"
          >
            Google Calendar
          </a>
          <button type="button" onClick={downloadIcs} className="block w-full px-4 py-3 text-left hover:bg-neutral-50">
            Apple / Outlook (.ics)
          </button>
        </div>
      )}
    </div>
  );
}
