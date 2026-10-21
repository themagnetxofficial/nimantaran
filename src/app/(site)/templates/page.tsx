import type { Metadata } from "next";
import { Ornament } from "@/components/site/Ornament";
import { TemplateCard } from "@/components/site/TemplateCard";
import { allTemplates } from "@/templates/registry";

export const metadata: Metadata = { title: "Templates" };

// Category filters are added in Phase 7 once all templates exist.
export default function TemplatesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <div className="mb-10 flex flex-col items-center text-center">
        <h1 className="font-serif text-5xl font-semibold text-wine-800">Choose your template</h1>
        <Ornament className="mt-4" />
        <p className="mt-4 text-ink-500">Every template is fully animated and works beautifully on phones.</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {allTemplates.map((t) => (
          <TemplateCard key={t.id} t={t} />
        ))}
      </div>
    </div>
  );
}
