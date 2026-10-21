import type { InviteType } from "@/lib/invite/schema";
import { floralPastelManifest } from "./floral-pastel/manifest";
import type { TemplateDefinition, TemplateManifest, TemplatePalette } from "./types";

/**
 * ─── Template registry ─────────────────────────────────────────
 * To add a template:
 *   1. create src/templates/<id>/index.tsx and manifest.ts
 *   2. put its artwork in public/templates/<id>/
 *   3. add ONE entry below.
 * Nothing else in the app needs to change.
 *
 * Only manifests are imported eagerly (they are tiny). Components are loaded
 * with dynamic import so each invite page only downloads its own template.
 */
export const templateRegistry: Record<string, TemplateDefinition> = {
  [floralPastelManifest.id]: {
    manifest: floralPastelManifest,
    load: () => import("./floral-pastel"),
  },
};

export const allTemplates: TemplateManifest[] = Object.values(templateRegistry).map((t) => t.manifest);

export function getTemplate(id: string): TemplateDefinition | null {
  return templateRegistry[id] ?? null;
}

export function getManifest(id: string): TemplateManifest | null {
  return templateRegistry[id]?.manifest ?? null;
}

export function templatesForCategory(category: InviteType | "all"): TemplateManifest[] {
  return category === "all" ? allTemplates : allTemplates.filter((t) => t.categories.includes(category));
}

/** Picks the palette the user chose, falling back to the template default. */
export function resolvePalette(manifest: TemplateManifest, paletteId: string): TemplatePalette {
  return (
    manifest.palettes.find((p) => p.id === paletteId) ??
    manifest.palettes.find((p) => p.id === manifest.defaultPaletteId) ??
    manifest.palettes[0]
  );
}
