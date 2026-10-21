"use client";

import type { InviteEvent } from "@/lib/invite/schema";
import { cn } from "@/lib/utils/cn";
import { L } from "./Label";

export function mapsUrl(event: Pick<InviteEvent, "mapUrl" | "venueName" | "address">) {
  if (event.mapUrl) return event.mapUrl;
  const q = [event.venueName, event.address].filter(Boolean).join(", ");
  return q ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}` : null;
}

export function MapButton({ event, className }: { event: InviteEvent; className?: string }) {
  const href = mapsUrl(event);
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-transform active:scale-95",
        className,
      )}
    >
      <svg aria-hidden viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z" />
        <circle cx="12" cy="9.5" r="2.5" />
      </svg>
      <L k="directions" subClassName="hidden" />
    </a>
  );
}
