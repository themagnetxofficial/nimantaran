import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { InviteLoading } from "@/components/site/InviteLoading";
import { getSampleInvite } from "@/lib/invite/samples";
import { allTemplates, getManifest } from "@/templates/registry";
import { TemplateRenderer } from "@/templates/TemplateRenderer";

export function generateStaticParams() {
  return allTemplates.map((t) => ({ id: t.id }));
}

export async function generateMetadata({ params }: PageProps<"/templates/[id]">): Promise<Metadata> {
  const { id } = await params;
  const m = getManifest(id);
  return m ? { title: `${m.name} – Live demo`, description: m.description } : { title: "Template not found" };
}

/** Full-screen live demo of a template with sample data. */
export default function TemplateDemoPage({ params }: PageProps<"/templates/[id]">) {
  return (
    <Suspense fallback={<InviteLoading />}>
      <Demo params={params} />
    </Suspense>
  );
}

async function Demo({ params }: Pick<PageProps<"/templates/[id]">, "params">) {
  const { id } = await params;
  const manifest = getManifest(id);
  if (!manifest) notFound();
  const data = getSampleInvite(manifest.categories[0]);

  return (
    <>
      <TemplateRenderer templateId={id} data={data} mode="preview" isPaid />
      <div className="fixed inset-x-0 bottom-0 z-[70] flex justify-center p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-2 rounded-full bg-wine-900/90 p-1.5 pl-4 text-sm text-ivory-50 shadow-lifted backdrop-blur">
          <span className="hidden font-medium sm:inline">{manifest.name}</span>
          <Link href="/templates" className="rounded-full px-3 py-2 hover:bg-white/10">
            All templates
          </Link>
          <Link href={`/create/${id}`} className="rounded-full bg-gold-400 px-4 py-2 font-semibold text-wine-900">
            Use this template
          </Link>
        </div>
      </div>
    </>
  );
}
