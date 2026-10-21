import type { ComponentType } from "react";
import type { InviteData, InviteType } from "@/lib/invite/schema";

export type TemplateMode = "preview" | "live";

/** Props every template component receives. */
export interface TemplateProps {
  data: InviteData;
  mode: TemplateMode;
}

export type TemplateComponent = ComponentType<TemplateProps>;

/** CSS colour values. They become `--inv-*` CSS variables on the template root. */
export interface PaletteColors {
  bg: string;
  surface: string;
  primary: string;
  accent: string;
  text: string;
  muted: string;
  onPrimary: string;
}

export interface TemplatePalette {
  id: string;
  name: string;
  colors: PaletteColors;
  /** Optional artwork overrides for this palette (same keys as manifest.assets) */
  assets?: Record<string, string>;
}

export type TemplateFeature = "gallery" | "music" | "multipleEvents" | "rsvp" | "countdown" | "coverPhoto" | "families";

export interface TemplateManifest {
  id: string;
  name: string;
  description: string;
  categories: InviteType[];
  tier: "basic" | "premium";
  thumbnail: string;
  palettes: TemplatePalette[];
  defaultPaletteId: string;
  features: TemplateFeature[];
  /**
   * Every visual layer used by the template. Swap artwork by replacing the
   * file in `public/templates/<id>/` (or pointing a key at a new .webp/.png).
   */
  assets: Record<string, string>;
}

/** Used by the registry: manifest + a lazy loader for the component (code-split). */
export interface TemplateDefinition {
  manifest: TemplateManifest;
  load: () => Promise<{ default: TemplateComponent }>;
}
