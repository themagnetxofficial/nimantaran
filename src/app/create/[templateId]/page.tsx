import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Builder } from "@/components/builder/Builder";
import { allTemplates, getManifest } from "@/templates/registry";

export const metadata: Metadata = { title: "Create your invite", robots: { index: false } };

export function generateStaticParams() {
  return allTemplates.map((t) => ({ templateId: t.id }));
}

export default function CreatePage({ params }: PageProps<"/create/[templateId]">) {
  return (
    <Suspense fallback={<div className="grid min-h-dvh place-items-center text-sm text-ink-500">Loading builder…</div>}>
      <CreateBuilder params={params} />
    </Suspense>
  );
}

async function CreateBuilder({ params }: Pick<PageProps<"/create/[templateId]">, "params">) {
  const { templateId } = await params;
  if (!getManifest(templateId)) notFound();
  return <Builder templateId={templateId} />;
}
