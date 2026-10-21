"use client";

import { lazy, Suspense, type CSSProperties, type LazyExoticComponent } from "react";
import type { InviteData } from "@/lib/invite/schema";
import { getTemplate, resolvePalette, templateRegistry } from "./registry";
import { InviteProvider, type InviteRuntime } from "./shared/runtime";
import { PreviewWatermark } from "./shared/Watermark";
import type { TemplateComponent, TemplateMode, TemplatePalette } from "./types";

// One lazy (code-split) component per template, created once at module load.
const lazyTemplates: Record<string, LazyExoticComponent<TemplateComponent>> = Object.fromEntries(
  Object.entries(templateRegistry).map(([id, def]) => [id, lazy(def.load)]),
);

export function paletteStyle(palette: TemplatePalette): CSSProperties {
  const c = palette.colors;
  return {
    "--inv-bg": c.bg,
    "--inv-surface": c.surface,
    "--inv-primary": c.primary,
    "--inv-accent": c.accent,
    "--inv-text": c.text,
    "--inv-muted": c.muted,
    "--inv-on-primary": c.onPrimary,
  } as CSSProperties;
}

interface Props {
  templateId: string;
  data: InviteData;
  mode: TemplateMode;
  /** false → visible "Preview – Nimantran" watermark. Decided by the server. */
  isPaid: boolean;
  guestName?: string | null;
  initiallyOpened?: boolean;
  submitRsvp?: InviteRuntime["submitRsvp"];
}

/** Renders any invite through its template. Used by /i/[slug], demos and the builder preview. */
export function TemplateRenderer({ templateId, data, mode, isPaid, guestName, initiallyOpened, submitRsvp }: Props) {
  const def = getTemplate(templateId);
  const Template = lazyTemplates[templateId];
  if (!def || !Template) {
    return <p className="p-10 text-center">This template is not available.</p>;
  }
  const palette = resolvePalette(def.manifest, data.design.paletteId);

  return (
    <InviteProvider
      data={data}
      mode={mode}
      manifest={def.manifest}
      palette={palette}
      guestName={guestName}
      initiallyOpened={initiallyOpened}
      submitRsvp={submitRsvp}
    >
      <div style={paletteStyle(palette)} className="min-h-dvh bg-inv-bg text-inv-text">
        <Suspense fallback={<div className="grid min-h-dvh place-items-center text-sm text-inv-muted">Opening invitation…</div>}>
          <Template data={data} mode={mode} />
        </Suspense>
        {!isPaid && <PreviewWatermark />}
      </div>
    </InviteProvider>
  );
}
