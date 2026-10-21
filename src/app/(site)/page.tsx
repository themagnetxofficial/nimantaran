import { LinkButton } from "@/components/ui/Button";
import { Ornament } from "@/components/site/Ornament";
import { TemplateCard } from "@/components/site/TemplateCard";
import { allTemplates } from "@/templates/registry";

// Phase 1 home. The full premium landing page is built in Phase 7.
export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="mx-auto flex max-w-6xl flex-col items-center px-4 pb-16 pt-16 text-center sm:pt-24">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-600">Digital invitations · Made in India</p>
          <h1 className="mt-5 max-w-3xl font-serif text-5xl font-semibold leading-[1.05] text-wine-800 sm:text-7xl">
            Invitations as beautiful as your celebration
          </h1>
          <Ornament className="mt-6" />
          <p className="mt-6 max-w-xl text-lg text-ink-700">
            Pick an animated template, add your details, and share your own invitation website on WhatsApp in minutes.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <LinkButton href="/create/floral-pastel" size="lg">
              Create your invite
            </LinkButton>
            <LinkButton href="/i/rahul-weds-priya" variant="secondary" size="lg">
              See a live sample
            </LinkButton>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4">
        <h2 className="mb-8 text-center font-serif text-4xl font-semibold text-ink-900">Templates</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {allTemplates.map((t) => (
            <TemplateCard key={t.id} t={t} />
          ))}
        </div>
      </section>
    </>
  );
}
