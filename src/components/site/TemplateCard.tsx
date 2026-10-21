import Image from "next/image";
import Link from "next/link";
import { LinkButton } from "@/components/ui/Button";
import type { TemplateManifest } from "@/templates/types";

export function TemplateCard({ t }: { t: TemplateManifest }) {
  return (
    <article className="group overflow-hidden rounded-card bg-white shadow-soft ring-1 ring-ivory-300/70 transition hover:-translate-y-1 hover:shadow-lifted">
      <Link href={`/templates/${t.id}`} className="relative block aspect-[3/4] overflow-hidden bg-ivory-100">
        <Image src={t.thumbnail} alt={`${t.name} template preview`} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover transition duration-500 group-hover:scale-[1.03]" unoptimized />
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-wine-700">
          {t.tier}
        </span>
      </Link>
      <div className="p-5">
        <h3 className="font-serif text-2xl font-semibold text-ink-900">{t.name}</h3>
        <p className="mt-1 text-sm text-ink-500">{t.description}</p>
        <div className="mt-3 flex gap-1.5">
          {t.palettes.map((p) => (
            <span key={p.id} title={p.name} className="size-5 rounded-full ring-2 ring-white" style={{ background: `linear-gradient(135deg, ${p.colors.bg} 50%, ${p.colors.primary} 50%)` }} />
          ))}
        </div>
        <div className="mt-5 flex gap-2">
          <LinkButton href={`/templates/${t.id}`} variant="secondary" size="sm">
            Live demo
          </LinkButton>
          <LinkButton href={`/create/${t.id}`} size="sm">
            Use this template
          </LinkButton>
        </div>
      </div>
    </article>
  );
}
