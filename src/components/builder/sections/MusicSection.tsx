"use client";

import type { SectionProps } from "../types";

// The music library and uploads arrive in Phase 4. The data shape already exists.
export function MusicSection({ data }: SectionProps) {
  return (
    <div className="rounded-xl bg-ivory-100 p-4 text-sm text-ink-700">
      <p className="font-semibold">Background music is coming soon.</p>
      <p className="mt-1 text-ink-500">
        You’ll be able to pick a royalty-free track from our library or upload your own. Music only starts after a guest taps “open”, and there is always a mute button.
      </p>
      <p className="mt-2 text-xs text-ink-500">Current: {data.music.source === "none" ? "No music" : data.music.title || "Custom track"}</p>
    </div>
  );
}
