"use client";

import { createContext, use, useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import { resolveLabel, type LabelKey, type ResolvedLabel } from "@/lib/i18n/invite-labels";
import type { InviteData, RsvpSubmission } from "@/lib/invite/schema";
import type { TemplateManifest, TemplateMode, TemplatePalette } from "../types";

/**
 * Everything a template needs besides the invite data: labels in the right
 * language, the chosen palette/artwork, music controls, guest greeting, etc.
 * Templates read it with `useInvite()`.
 */
export interface InviteRuntime {
  data: InviteData;
  mode: TemplateMode;
  manifest: TemplateManifest;
  palette: TemplatePalette;
  /** manifest assets merged with the palette's overrides */
  assets: Record<string, string>;
  t: (key: LabelKey) => ResolvedLabel;
  /** e.g. "Sharma Family" when opened through a personalised guest link */
  guestName: string | null;
  /** true once the guest tapped the intro */
  opened: boolean;
  open: () => void;
  music: {
    available: boolean;
    playing: boolean;
    toggle: () => void;
  };
  /** Wired to the server in Phase 5. Undefined = demo mode (nothing is saved). */
  submitRsvp?: (rsvp: RsvpSubmission) => Promise<void>;
}

const InviteContext = createContext<InviteRuntime | null>(null);

export function useInvite(): InviteRuntime {
  const ctx = use(InviteContext);
  if (!ctx) throw new Error("useInvite() must be used inside <InviteProvider>");
  return ctx;
}

interface ProviderProps {
  data: InviteData;
  mode: TemplateMode;
  manifest: TemplateManifest;
  palette: TemplatePalette;
  guestName?: string | null;
  submitRsvp?: InviteRuntime["submitRsvp"];
  /** Start in the opened state (skips the intro), e.g. for screenshots. */
  initiallyOpened?: boolean;
  children: ReactNode;
}

export function InviteProvider({
  data,
  mode,
  manifest,
  palette,
  guestName = null,
  submitRsvp,
  initiallyOpened = false,
  children,
}: ProviderProps) {
  const [opened, setOpened] = useState(initiallyOpened);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const musicUrl = data.music.source !== "none" ? data.music.url : "";

  /** Must be called directly inside a tap/click handler so browsers allow audio. */
  const play = useCallback(() => {
    if (!musicUrl) return;
    if (!audioRef.current || audioRef.current.src !== new URL(musicUrl, location.href).href) {
      audioRef.current?.pause();
      const audio = new Audio(musicUrl);
      audio.loop = true;
      audio.preload = "none";
      audio.volume = 0.6;
      audio.addEventListener("play", () => setPlaying(true));
      audio.addEventListener("pause", () => setPlaying(false));
      audioRef.current = audio;
    }
    audioRef.current.play().catch(() => setPlaying(false));
  }, [musicUrl]);

  const toggle = useCallback(() => {
    const a = audioRef.current;
    if (a && !a.paused) a.pause();
    else play();
  }, [play]);

  const open = useCallback(() => {
    setOpened(true);
    play();
  }, [play]);

  const value = useMemo<InviteRuntime>(
    () => ({
      data,
      mode,
      manifest,
      palette,
      assets: { ...manifest.assets, ...palette.assets },
      t: (key) => resolveLabel(key, data.language),
      guestName,
      opened,
      open,
      music: { available: Boolean(musicUrl), playing, toggle },
      submitRsvp,
    }),
    [data, mode, manifest, palette, guestName, opened, open, musicUrl, playing, toggle, submitRsvp],
  );

  return <InviteContext value={value}>{children}</InviteContext>;
}
