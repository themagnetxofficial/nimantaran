"use client";

import { cn } from "@/lib/utils/cn";
import { useInvite } from "./runtime";

/** Floating mute/unmute button. Only appears after the intro is opened and if music is set. */
export function MusicToggle({ className }: { className?: string }) {
  const { music, opened } = useInvite();
  if (!music.available || !opened) return null;
  return (
    <button
      type="button"
      onClick={music.toggle}
      aria-pressed={music.playing}
      aria-label={music.playing ? "Mute music" : "Play music"}
      className={cn(
        "fixed bottom-4 right-4 z-40 grid size-12 place-items-center rounded-full shadow-lg backdrop-blur transition-transform active:scale-90",
        className,
      )}
    >
      {music.playing ? (
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
          <path d="M4 9v6h4l5 4V5L8 9H4Z" />
          <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
          <path d="M4 9v6h4l5 4V5L8 9H4Z" />
          <path d="m17 9 5 6M22 9l-5 6" />
        </svg>
      )}
    </button>
  );
}
