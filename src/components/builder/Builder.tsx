"use client";

import { produce } from "immer";
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { Logo } from "@/components/site/Logo";
import { Button } from "@/components/ui/Button";
import { createEmptyInvite } from "@/lib/invite/defaults";
import { loadLocalDraft, saveLocalDraft, type LocalDraft } from "@/lib/invite/draft-storage";
import { getSampleInvite } from "@/lib/invite/samples";
import { publishableInviteSchema, slugSchema } from "@/lib/invite/schema";
import { cn } from "@/lib/utils/cn";
import { getManifest } from "@/templates/registry";
import { PhonePreview } from "./PhonePreview";
import { SlugField, suggestSlug } from "./SlugField";
import { StepSection } from "./StepSection";
import { BasicsSection } from "./sections/BasicsSection";
import { DesignSection } from "./sections/DesignSection";
import { EventsSection } from "./sections/EventsSection";
import { FamiliesSection } from "./sections/FamiliesSection";
import { MusicSection } from "./sections/MusicSection";
import { PhotosSection } from "./sections/PhotosSection";
import { RsvpContactsSection } from "./sections/RsvpContactsSection";
import type { ErrorFor, Updater } from "./types";

const STEPS = [
  { id: "basics", title: "Basics", subtitle: "Occasion, language, names & link", prefixes: ["names", "slug"] },
  { id: "families", title: "Families", subtitle: "Parents & blessings", prefixes: ["families"] },
  { id: "events", title: "Events", subtitle: "Haldi, Mehendi, Wedding…", prefixes: ["events"] },
  { id: "photos", title: "Photos", subtitle: "Cover photo & gallery", prefixes: ["coverPhoto", "gallery"] },
  { id: "music", title: "Music", subtitle: "Background music", prefixes: ["music"] },
  { id: "rsvp", title: "RSVP & Contacts", subtitle: "Responses & phone numbers", prefixes: ["rsvp", "contacts"] },
  { id: "design", title: "Design", subtitle: "Template & colours", prefixes: ["design"] },
] as const;

type StepId = (typeof STEPS)[number]["id"];

const noopSubscribe = () => () => {};
const DESKTOP = "(min-width: 1024px)";
function subscribeDesktop(cb: () => void) {
  const mql = window.matchMedia(DESKTOP);
  mql.addEventListener("change", cb);
  return () => mql.removeEventListener("change", cb);
}

/** Renders the builder only in the browser, because drafts live in localStorage. */
export function Builder({ templateId }: { templateId: string }) {
  const isClient = useSyncExternalStore(noopSubscribe, () => true, () => false);
  if (!isClient) {
    return <div className="grid min-h-dvh place-items-center text-sm text-ink-500">Loading builder…</div>;
  }
  return <BuilderInner initialTemplateId={templateId} />;
}

function initialDraft(templateId: string): LocalDraft {
  const saved = loadLocalDraft();
  if (saved) return { ...saved, templateId };
  return { templateId, slug: "", data: getSampleInvite("wedding"), updatedAt: Date.now() };
}

function BuilderInner({ initialTemplateId }: { initialTemplateId: string }) {
  const [draft, setDraft] = useState<LocalDraft>(() => initialDraft(initialTemplateId));
  const [openStep, setOpenStep] = useState<StepId | null>("basics");
  const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");
  const [replay, setReplay] = useState(0);
  const [saveState, setSaveState] = useState<"saved" | "saving" | "error">("saved");
  const [showAllErrors, setShowAllErrors] = useState(false);
  const [publishNote, setPublishNote] = useState<string | null>(null);

  const manifest = getManifest(draft.templateId);
  const isDesktop = useSyncExternalStore(subscribeDesktop, () => window.matchMedia(DESKTOP).matches, () => false);

  const update: Updater = useCallback((recipe) => {
    setSaveState("saving");
    setDraft((d) => ({ ...d, data: produce(d.data, recipe), updatedAt: Date.now() }));
  }, []);

  const setSlug = (slug: string) => {
    setSaveState("saving");
    setDraft((d) => ({ ...d, slug, updatedAt: Date.now() }));
  };

  // Auto-save to localStorage (debounced). Phase 3 also saves to the database when logged in.
  useEffect(() => {
    const id = setTimeout(() => setSaveState(saveLocalDraft(draft) ? "saved" : "error"), 600);
    return () => clearTimeout(id);
  }, [draft]);

  const switchTemplate = (id: string) => {
    setDraft((d) => ({ ...d, templateId: id }));
    // Update the URL without navigating, so nothing re-mounts and no data is lost.
    window.history.replaceState(null, "", `/create/${id}`);
  };

  // Validation (same Zod schema the server will use).
  const issues = useMemo(() => {
    const map = new Map<string, string>();
    const r = publishableInviteSchema.safeParse(draft.data);
    if (!r.success) for (const i of r.error.issues) if (!map.has(i.path.join("."))) map.set(i.path.join("."), i.message);
    const s = slugSchema.safeParse(draft.slug);
    if (!s.success) map.set("slug", draft.slug ? s.error.issues[0].message : "Choose your invite link");
    return map;
  }, [draft.data, draft.slug]);

  const errorFor: ErrorFor = useCallback(
    (path) => {
      const msg = issues.get(path);
      if (!msg) return undefined;
      // Before "Publish" is pressed, only show format errors (e.g. a wrong phone number), not "required" ones.
      return showAllErrors || /(mapUrl|phone)$/.test(path) ? msg : undefined;
    },
    [issues, showAllErrors],
  );

  const issuesInStep = (prefixes: readonly string[]) =>
    showAllErrors ? [...issues.keys()].filter((k) => prefixes.some((p) => k === p || k.startsWith(`${p}.`))).length : 0;

  const onPublish = () => {
    setShowAllErrors(true);
    if (issues.size > 0) {
      const firstKey = [...issues.keys()][0];
      const step = STEPS.find((s) => s.prefixes.some((p) => firstKey === p || firstKey.startsWith(`${p}.`)));
      if (step) setOpenStep(step.id);
      setMobileTab("edit");
      setPublishNote(`${issues.size} thing${issues.size > 1 ? "s" : ""} to fix before publishing.`);
      return;
    }
    setPublishNote("Everything looks perfect! Publishing goes live in Phase 2.");
  };

  const resetTo = (kind: "blank" | "sample") => {
    if (!confirm(kind === "blank" ? "Clear everything and start blank?" : "Replace your details with sample data?")) return;
    const data = kind === "blank" ? createEmptyInvite(draft.data.type) : getSampleInvite(draft.data.type);
    setDraft((d) => ({ ...d, data, updatedAt: Date.now() }));
    setShowAllErrors(false);
    setPublishNote(null);
  };

  const sectionProps = { data: draft.data, update, errorFor };

  return (
    <div className="flex h-dvh flex-col bg-ivory-100">
      {/* Top bar */}
      <header className="z-20 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-ivory-300/70 bg-ivory-50/95 px-3 backdrop-blur sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <Logo className="[&>span]:hidden sm:[&>span]:inline" />
          <span className="hidden truncate rounded-full bg-ivory-200 px-3 py-1 text-xs font-semibold text-ink-700 md:inline">{manifest?.name}</span>
          <span className="text-xs text-ink-500" aria-live="polite">
            {saveState === "saving" ? "Saving…" : saveState === "error" ? "⚠ Not saved (storage full)" : "✓ Saved on this device"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <a href="/preview" target="_blank" rel="noopener" className="hidden rounded-full px-3 py-2 text-sm font-medium text-wine-700 hover:bg-wine-700/5 sm:inline-flex">
            Full-screen preview ↗
          </a>
          <Button size="sm" onClick={onPublish}>
            Publish
          </Button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Form */}
        <div className={cn("min-h-0 flex-1 overflow-y-auto", mobileTab === "preview" && "hidden lg:block")}>
          <div className="mx-auto flex max-w-2xl flex-col gap-3 px-3 pb-28 pt-5 sm:px-6 lg:pb-12">
            {publishNote && (
              <div role="status" className={cn("rounded-xl px-4 py-3 text-sm font-medium", issues.size ? "bg-wine-500/10 text-wine-700" : "bg-emerald-50 text-emerald-800")}>
                {publishNote}
              </div>
            )}
            {STEPS.map((step, i) => (
              <StepSection
                key={step.id}
                index={i + 1}
                title={step.title}
                subtitle={step.subtitle}
                open={openStep === step.id}
                onToggle={() => setOpenStep((s) => (s === step.id ? null : step.id))}
                issues={issuesInStep(step.prefixes)}
              >
                {step.id === "basics" && (
                  <>
                    <BasicsSection {...sectionProps} />
                    <SlugField slug={draft.slug} data={draft.data} onChange={setSlug} />
                    {showAllErrors && issues.get("slug") && <p className="-mt-3 text-xs text-wine-600">{issues.get("slug")}</p>}
                  </>
                )}
                {step.id === "families" && <FamiliesSection {...sectionProps} />}
                {step.id === "events" && <EventsSection {...sectionProps} />}
                {step.id === "photos" && <PhotosSection {...sectionProps} />}
                {step.id === "music" && <MusicSection {...sectionProps} />}
                {step.id === "rsvp" && <RsvpContactsSection {...sectionProps} />}
                {step.id === "design" && <DesignSection {...sectionProps} templateId={draft.templateId} onTemplateChange={switchTemplate} />}
              </StepSection>
            ))}
            <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs text-ink-500">
              <button type="button" className="hover:text-wine-700" onClick={() => resetTo("sample")}>
                Fill with sample data
              </button>
              <button type="button" className="hover:text-wine-700" onClick={() => resetTo("blank")}>
                Start blank
              </button>
              {!draft.slug && suggestSlug(draft.data) && <span>Tip: set your invite link in Basics</span>}
            </div>
          </div>
        </div>

        {/* Preview */}
        <aside
          className={cn(
            "min-h-0 shrink-0 flex-col items-center border-l border-ivory-300/70 bg-[radial-gradient(circle_at_top,var(--color-ivory-50),var(--color-ivory-200))] lg:flex lg:w-[440px] lg:gap-3 lg:py-5 xl:w-[500px]",
            mobileTab === "preview" ? "flex w-full" : "hidden",
          )}
          aria-label="Live preview"
        >
          <div className="hidden items-center gap-2 lg:flex">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">Live preview</span>
            <button type="button" onClick={() => setReplay((r) => r + 1)} className="rounded-full px-3 py-1 text-xs font-semibold text-wine-700 ring-1 ring-wine-700/20 hover:bg-wine-700/5">
              ↺ Replay intro
            </button>
          </div>
          {/* Only one iframe is ever mounted, so phones don't load a hidden preview. */}
          {isDesktop ? (
            <div className="min-h-0 flex-1">
              <PhonePreview variant="phone" templateId={draft.templateId} data={draft.data} replaySignal={replay} />
            </div>
          ) : (
            mobileTab === "preview" && (
              <div className="size-full pb-16">
                <PhonePreview variant="full" templateId={draft.templateId} data={draft.data} replaySignal={replay} />
              </div>
            )
          )}
        </aside>
      </div>

      {/* Mobile Edit / Preview toggle */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex justify-center p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden">
        <div role="tablist" aria-label="Builder view" className="flex rounded-full bg-wine-900 p-1 shadow-lifted">
          {(["edit", "preview"] as const).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={mobileTab === t}
              onClick={() => setMobileTab(t)}
              className={cn("rounded-full px-6 py-2.5 text-sm font-semibold capitalize transition", mobileTab === t ? "bg-gold-400 text-wine-900" : "text-ivory-100")}
            >
              {t}
            </button>
          ))}
          {mobileTab === "preview" && (
            <button type="button" onClick={() => setReplay((r) => r + 1)} className="rounded-full px-4 text-sm text-ivory-100" aria-label="Replay intro">
              ↺
            </button>
          )}
        </div>
      </nav>
    </div>
  );
}
