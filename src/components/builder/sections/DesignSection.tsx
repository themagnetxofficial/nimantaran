"use client";

import { allTemplates, getManifest, resolvePalette } from "@/templates/registry";
import { cn } from "@/lib/utils/cn";
import type { SectionProps } from "../types";

interface Props extends SectionProps {
  templateId: string;
  onTemplateChange: (id: string) => void;
}

export function DesignSection({ data, update, templateId, onTemplateChange }: Props) {
  const manifest = getManifest(templateId);
  const active = manifest ? resolvePalette(manifest, data.design.paletteId) : null;

  return (
    <>
      <div>
        <h3 className="mb-2 text-sm font-semibold text-ink-700">Template</h3>
        <p className="mb-3 text-xs text-ink-500">Switch anytime. All your details are kept.</p>
        <div className="grid grid-cols-3 gap-3">
          {allTemplates.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onTemplateChange(t.id)}
              aria-pressed={t.id === templateId}
              className={cn("overflow-hidden rounded-xl text-left ring-2 transition", t.id === templateId ? "ring-wine-700" : "ring-transparent hover:ring-gold-300")}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={t.thumbnail} alt="" className="aspect-[3/4] w-full object-cover" />
              <span className="block bg-white px-2 py-1.5 text-xs font-semibold text-ink-700">{t.name}</span>
            </button>
          ))}
        </div>
      </div>

      {manifest && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-ink-700">Colour palette</h3>
          <div role="radiogroup" aria-label="Colour palette" className="flex flex-wrap gap-3">
            {manifest.palettes.map((p) => (
              <button
                key={p.id}
                type="button"
                role="radio"
                aria-checked={active?.id === p.id}
                onClick={() => update((d) => void (d.design.paletteId = p.id))}
                className={cn("flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-4 text-sm ring-2 transition", active?.id === p.id ? "ring-wine-700" : "ring-ivory-300 hover:ring-gold-300")}
              >
                <span className="size-7 rounded-full ring-1 ring-black/10" style={{ background: `linear-gradient(135deg, ${p.colors.bg} 0 50%, ${p.colors.primary} 50% 100%)` }} />
                {p.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
