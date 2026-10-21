"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { useInvite } from "./runtime";

interface Props {
  /** The template's intro artwork (envelope, doors, gift box…). */
  children: ReactNode;
  /**
   * Plays the template's opening animation on the overlay element and
   * resolves when finished. Use GSAP or anything else; only animate
   * transform/opacity. Not called when the user prefers reduced motion.
   */
  animateOpen: (overlay: HTMLDivElement) => Promise<unknown>;
  className?: string;
}

/**
 * The full-screen "Tap to open" intro shared by all templates.
 * The tap is a real user gesture, so it is also where music is allowed to start.
 * While closed, page scrolling is locked.
 */
export function OpenIntro({ children, animateOpen, className }: Props) {
  const { open, opened } = useInvite();
  const ref = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<"closed" | "opening" | "done">(opened ? "done" : "closed");

  useEffect(() => {
    if (phase === "done") return;
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    window.scrollTo(0, 0);
    return () => {
      root.style.overflow = prev;
    };
  }, [phase]);

  const onOpen = async () => {
    if (phase !== "closed" || !ref.current) return;
    open(); // starts music inside the gesture
    setPhase("opening");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    try {
      if (!reduce) await animateOpen(ref.current);
    } finally {
      setPhase("done");
    }
  };

  if (phase === "done") return null;

  return (
    <div
      ref={ref}
      role="button"
      tabIndex={0}
      aria-label="Open the invitation"
      onClick={onOpen}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onOpen())}
      className={cn(
        "fixed inset-0 z-50 cursor-pointer select-none overflow-hidden outline-none",
        phase === "opening" && "pointer-events-none",
        className,
      )}
    >
      {children}
    </div>
  );
}
