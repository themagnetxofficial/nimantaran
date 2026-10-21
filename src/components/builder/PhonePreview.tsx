"use client";

import { useEffect, useRef, useState } from "react";
import type { InviteData } from "@/lib/invite/schema";
import { isPreviewMessage, type PreviewMessage } from "@/lib/preview-messages";
import { cn } from "@/lib/utils/cn";

interface Props {
  templateId: string;
  data: InviteData;
  replaySignal: number;
  /** "phone" shows a device frame (desktop); "full" fills the screen (mobile Preview tab) */
  variant: "phone" | "full";
}

/**
 * The live preview runs the real template inside an <iframe> (/preview), so it
 * behaves exactly like a guest's phone: real mobile width, scrolling, fixed
 * layers and ScrollTrigger all work. Data is sent with postMessage.
 */
export function PhonePreview({ templateId, data, replaySignal, variant }: Props) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== location.origin || e.source !== frame.current?.contentWindow) return;
      if (isPreviewMessage(e.data) && e.data.type === "nimantran:ready") setReady(true);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // Send data (debounced a little so typing stays smooth).
  useEffect(() => {
    if (!ready) return;
    const id = setTimeout(() => {
      frame.current?.contentWindow?.postMessage({ type: "nimantran:update", templateId, data } satisfies PreviewMessage, location.origin);
    }, 120);
    return () => clearTimeout(id);
  }, [ready, templateId, data]);

  useEffect(() => {
    if (!ready || replaySignal === 0) return;
    frame.current?.contentWindow?.postMessage({ type: "nimantran:replay" } satisfies PreviewMessage, location.origin);
  }, [ready, replaySignal]);

  const iframe = (
    <iframe ref={frame} src="/preview" title="Live invitation preview" className="size-full border-0 bg-ivory-50" />
  );

  if (variant === "full") return <div className="size-full">{iframe}</div>;

  return (
    <div
      className={cn(
        "relative mx-auto aspect-[9/19.5] h-full max-h-[820px] min-h-[560px] rounded-[3rem] bg-ink-900 p-3 shadow-lifted ring-1 ring-black/40",
      )}
    >
      <div className="absolute left-1/2 top-5 z-10 h-6 w-24 -translate-x-1/2 rounded-full bg-black" aria-hidden />
      <div className="size-full overflow-hidden rounded-[2.4rem] bg-ivory-50">{iframe}</div>
    </div>
  );
}
