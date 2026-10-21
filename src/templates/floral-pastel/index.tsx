"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, type CSSProperties } from "react";
import { familySideLabels } from "@/lib/i18n/invite-labels";
import { formatShortDate, mainEvent } from "@/lib/invite/datetime";
import type { InviteData } from "@/lib/invite/schema";
import { cn } from "@/lib/utils/cn";
import {
  ContactList,
  Countdown,
  EventCard,
  Gallery,
  L,
  MusicToggle,
  OpenIntro,
  Reveal,
  RsvpForm,
  useInvite,
} from "../shared";
import type { TemplateProps } from "../types";
import s from "./floral-pastel.module.css";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Fixed (not random) so server and client render the same markup.
const PETALS = [
  { left: 6, dur: 13, delay: 0, drift: 50, b: false },
  { left: 18, dur: 16, delay: 4, drift: -30, b: true },
  { left: 30, dur: 12, delay: 7, drift: 40, b: false },
  { left: 44, dur: 17, delay: 2, drift: -50, b: true },
  { left: 57, dur: 14, delay: 9, drift: 30, b: false },
  { left: 69, dur: 15, delay: 5, drift: -40, b: false },
  { left: 81, dur: 13, delay: 11, drift: 35, b: true },
  { left: 92, dur: 18, delay: 3, drift: -25, b: false },
];

const isCouple = (d: InviteData) => d.type === "wedding" || d.type === "engagement";

function initials(d: InviteData) {
  const a = d.names.first.trim()[0] ?? "";
  const b = isCouple(d) ? (d.names.second.trim()[0] ?? "") : "";
  return (a + (b ? `&${b}` : "")).toUpperCase() || "♥";
}

/** A name in the script font, with the Devanagari version for Hindi/bilingual invites. */
function DisplayName({ name, alt, className }: { name: string; alt: string; className?: string }) {
  const { data } = useInvite();
  const showAlt = data.language !== "en" && alt;
  if (data.language === "hi" && alt) {
    return (
      <span lang="hi" className={cn("block font-hindi text-5xl leading-tight", className)}>
        {alt}
      </span>
    );
  }
  return (
    <span className={cn("block", className)}>
      <span className="block font-script text-6xl leading-[1.15] sm:text-7xl">{name || "Your Name"}</span>
      {showAlt && (
        <span lang="hi" className="mt-1 block font-hindi text-2xl opacity-80">
          {alt}
        </span>
      )}
    </span>
  );
}

function SectionTitle({ k }: { k: Parameters<typeof L>[0]["k"] }) {
  const { assets } = useInvite();
  return (
    <div className="mb-8 flex flex-col items-center gap-3 text-center">
      <L k={k} as="h2" className="font-serif text-4xl text-inv-primary" subClassName="font-sans text-xs uppercase tracking-[0.3em]" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={assets.divider} alt="" aria-hidden className="h-5 w-48" />
    </div>
  );
}

export default function FloralPastel({ data, mode }: TemplateProps) {
  const { assets, opened, guestName } = useInvite();
  const root = useRef<HTMLDivElement>(null);
  const couple = isCouple(data);
  const main = mainEvent(data);
  const sides = familySideLabels(data.type);
  const joiner = data.language === "hi" ? "संग" : "&";

  // Parallax + hero entrance. Everything is cleaned up automatically by useGSAP.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        if (!opened) gsap.set("[data-hero]", { autoAlpha: 0, y: 24 });
        gsap.utils.toArray<HTMLElement>("[data-speed]").forEach((el) => {
          gsap.to(el, {
            yPercent: Number(el.dataset.speed) * 100,
            ease: "none",
            scrollTrigger: { trigger: "[data-hero-section]", start: "top top", end: "bottom top", scrub: true },
          });
        });
      });
      return () => mm.revert();
    },
    // runs once on mount; `opened` is only read for the initial state
    { scope: root, dependencies: [] },
  );

  // In the builder, content changes height → recalculate scroll positions.
  useEffect(() => {
    if (mode !== "preview") return;
    const id = setTimeout(() => ScrollTrigger.refresh(), 250);
    return () => clearTimeout(id);
  }, [data, mode]);

  const animateOpen = (overlay: HTMLDivElement) => {
    const q = gsap.utils.selector(overlay);
    const tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });
    tl.to(q("[data-tap-hint]"), { autoAlpha: 0, duration: 0.25 })
      .to(q("[data-seal]"), { scale: 1.18, duration: 0.18, ease: "power1.out" }, 0)
      .to(q("[data-seal]"), { scale: 0, autoAlpha: 0, rotate: 25, duration: 0.35, ease: "back.in(2)" })
      .to(q("[data-flap]"), { rotateX: 180, duration: 0.8, transformPerspective: 1000 }, "-=0.05")
      .set(q("[data-flap]"), { zIndex: 1 }, "-=0.4")
      .to(q("[data-card]"), { yPercent: -58, duration: 0.9, ease: "power3.out" }, "-=0.15")
      .to(q("[data-envelope]"), { y: 60, scale: 1.06, duration: 0.9, ease: "power2.out" }, "<")
      .to(overlay, { autoAlpha: 0, duration: 0.6, ease: "power1.out" }, "+=0.35")
      .to(root.current?.querySelectorAll("[data-hero]") ?? [], { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.12, ease: "power3.out" }, "-=0.35");
    return tl.then();
  };

  const paperStyle = { "--paper-texture": `url(${assets.paperTexture})` } as CSSProperties;

  return (
    <div ref={root} className={cn(s.paper, "relative overflow-x-clip font-serif")} style={paperStyle}>
      {/* ── Tap-to-open envelope ───────────────────────── */}
      <OpenIntro animateOpen={animateOpen} className={s.paper}>
        <div className="absolute inset-0" style={paperStyle}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={assets.floralTopLeft} alt="" className="absolute -left-8 -top-8 w-56 opacity-90" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={assets.floralTopRight} alt="" className="absolute -right-8 -top-8 w-56 opacity-90" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={assets.floralBottom} alt="" className="absolute -bottom-4 left-1/2 w-[130%] max-w-xl -translate-x-1/2 opacity-90" />
        </div>
        <div className="relative flex h-full flex-col items-center justify-center gap-10 px-6">
          {guestName ? (
            <p className="text-center text-inv-muted">
              <L k="dear" subClassName="hidden" /> <span className="font-script text-3xl text-inv-primary">{guestName}</span>
            </p>
          ) : (
            <L k="youAreInvited" as="p" className="text-center text-lg italic text-inv-muted" subClassName="text-xs not-italic" />
          )}
          <div className={s.envelopeFloat}>
            <div data-envelope className={s.envelope}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={assets.envelopeBack} alt="" className={s.layer} style={{ zIndex: 0 }} />
              <div data-card className={cn(s.card, "flex flex-col items-center justify-start pt-[8%] text-center")} style={{ zIndex: 2 }}>
                <p className="text-[10px] uppercase tracking-[0.3em] text-inv-muted">
                  <L k="saveTheDate" subClassName="hidden" />
                </p>
                <p className="mt-1 font-script text-3xl leading-tight text-inv-primary">
                  {data.names.first || "Your Name"}
                  {couple && data.names.second && ` ${joiner} ${data.names.second}`}
                </p>
                {main && <p className="mt-1 text-xs tracking-widest text-inv-muted">{formatShortDate(main.date, data.language)}</p>}
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={assets.envelopeFront} alt="" className={s.layer} style={{ zIndex: 3 }} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img data-flap src={assets.envelopeFlap} alt="" className={cn(s.layer, s.flap)} style={{ zIndex: 4 }} />
              <div data-seal className={s.seal} style={{ zIndex: 5 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={assets.waxSeal} alt="" className="size-full drop-shadow-md" />
                <span className="absolute inset-0 grid place-items-center font-serif text-[clamp(0.8rem,4vw,1.15rem)] font-semibold italic text-[#fbe3e6]">
                  {initials(data)}
                </span>
              </div>
            </div>
          </div>
          <p data-tap-hint className={cn(s.pulse, "text-sm uppercase tracking-[0.3em] text-inv-primary")}>
            <L k="tapToOpen" subClassName="tracking-normal normal-case" />
          </p>
        </div>
      </OpenIntro>

      {/* ── Falling petals ─────────────────────────────── */}
      <div className={s.petals} aria-hidden>
        {PETALS.map((p, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={p.b ? assets.petalB : assets.petalA}
            alt=""
            className={s.petal}
            style={{ left: `${p.left}%`, "--dur": `${p.dur}s`, "--delay": `${p.delay}s`, "--drift": `${p.drift}px` } as CSSProperties}
          />
        ))}
      </div>

      <main className="relative z-[2] mx-auto max-w-xl">
        {/* ── Hero ─────────────────────────────────────── */}
        <header data-hero-section className="relative flex min-h-dvh flex-col items-center overflow-hidden px-6 pb-36 pt-16 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img data-speed="0.15" src={assets.leavesBack} alt="" aria-hidden className="pointer-events-none absolute inset-0 size-full" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img data-speed="-0.25" src={assets.floralTopLeft} alt="" aria-hidden className="pointer-events-none absolute -left-10 -top-10 w-52 sm:w-64" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img data-speed="-0.25" src={assets.floralTopRight} alt="" aria-hidden className="pointer-events-none absolute -right-10 -top-10 w-52 sm:w-64" />

          <div className="relative flex flex-col items-center">
            {data.topLine.enabled && data.topLine.text && (
              <p data-hero lang="hi" className="font-hindi text-base text-inv-accent">
                {data.topLine.text}
              </p>
            )}
            {guestName && (
              <p data-hero className="mt-4 text-inv-muted">
                <L k="dear" subClassName="hidden" /> <span className="font-semibold text-inv-primary">{guestName}</span>,
              </p>
            )}

            {data.coverPhoto && (
              <div data-hero className="relative mt-6 w-48 sm:w-56">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={data.coverPhoto.src}
                  alt={data.coverPhoto.alt || "Cover photo"}
                  className={cn(s.arch, "aspect-[300/420] w-full object-cover")}
                  fetchPriority="high"
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={assets.archFrame} alt="" aria-hidden className="pointer-events-none absolute -inset-3 h-[calc(100%+1.5rem)] w-[calc(100%+1.5rem)]" />
              </div>
            )}

            <L
              k={couple ? "togetherWithFamilies" : "youAreInvited"}
              as="p"
              className="mt-8 text-sm uppercase tracking-[0.25em] text-inv-muted"
              subClassName="tracking-[0.2em]"
            />

            <h1 data-hero className="mt-4 text-inv-primary">
              <DisplayName name={data.names.first} alt={data.names.firstAlt} />
              {couple && (
                <>
                  <span className="my-1 block font-serif text-3xl italic text-inv-accent">{joiner}</span>
                  <DisplayName name={data.names.second} alt={data.names.secondAlt} />
                </>
              )}
            </h1>

            {data.tagline && (
              <p data-hero className="mt-5 max-w-xs text-xl italic text-inv-text/80">
                {data.tagline}
              </p>
            )}
            {main && (
              <p data-hero className="mt-6 border-y border-inv-accent/40 px-6 py-2 text-sm uppercase tracking-[0.3em] text-inv-text">
                {formatShortDate(main.date, data.language)}
              </p>
            )}
          </div>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img data-speed="0.1" src={assets.floralBottom} alt="" aria-hidden className="pointer-events-none absolute -bottom-2 left-1/2 w-[120%] max-w-2xl -translate-x-1/2" />
        </header>

        {/* ── Message & families ───────────────────────── */}
        {(data.message || data.families.first.parents || data.families.second.parents) && (
          <section className="px-6 py-16 text-center">
            {data.message && (
              <Reveal>
                <p className="mx-auto max-w-md text-xl leading-relaxed text-inv-text/90">{data.message}</p>
              </Reveal>
            )}
            <div className={cn("mt-12 grid gap-10", sides.second && data.families.second.parents && "sm:grid-cols-2")}>
              {(
                [
                  ["first", sides.first],
                  ["second", sides.second],
                ] as const
              ).map(([key, label], i) => {
                const fam = data.families[key];
                if (!label || !fam.parents) return null;
                return (
                  <Reveal key={key} delay={i * 120}>
                    <L k={label} as="h3" className="text-xs uppercase tracking-[0.3em] text-inv-accent" subClassName="tracking-[0.2em]" />
                    <p className="mt-3 text-2xl text-inv-primary">{fam.parents}</p>
                    {fam.grandparents && (
                      <p className="mt-3 text-sm text-inv-muted">
                        <L k="withBlessingsOf" subClassName="hidden" />: {fam.grandparents}
                      </p>
                    )}
                  </Reveal>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Countdown ────────────────────────────────── */}
        {main && (
          <section className="px-6 py-12">
            <Reveal className="rounded-[2rem] bg-inv-surface/80 px-4 py-10 text-center shadow-[0_20px_50px_-30px_rgba(80,30,40,0.4)] ring-1 ring-inv-accent/20">
              <L k="countdown" as="p" className="mb-6 text-xs uppercase tracking-[0.3em] text-inv-muted" subClassName="tracking-[0.2em]" />
              <Countdown
                className="text-inv-primary"
                unitClassName="bg-inv-bg/70 ring-1 ring-inv-accent/25"
                labelClassName="font-sans text-inv-muted"
              />
            </Reveal>
          </section>
        )}

        {/* ── Events ───────────────────────────────────── */}
        {data.events.length > 0 && (
          <section className="px-6 py-16">
            <SectionTitle k="events" />
            <div className="flex flex-col gap-8">
              {data.events.map((ev, i) => (
                <Reveal key={ev.id} delay={(i % 2) * 80}>
                  <EventCard
                    event={ev}
                    ornament={
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={assets.sprig} alt="" aria-hidden className="mx-auto -mt-12 mb-2 h-12 w-32" />
                    }
                    classNames={{
                      root: "rounded-[1.75rem] bg-inv-surface/90 px-6 pb-8 pt-10 mt-6 ring-1 ring-inv-accent/25 shadow-[0_20px_50px_-30px_rgba(80,30,40,0.35)]",
                      title: "text-inv-primary",
                      date: "font-sans uppercase tracking-[0.15em] text-xs text-inv-muted",
                      venue: "text-inv-text",
                      address: "font-sans text-inv-muted",
                      note: "text-inv-accent",
                      button: "bg-inv-primary text-inv-on-primary font-sans",
                    }}
                  />
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {/* ── Gallery ──────────────────────────────────── */}
        {data.gallery.length > 0 && (
          <section className="px-4 py-16">
            <SectionTitle k="gallery" />
            <Reveal>
              <Gallery photos={data.gallery} itemClassName="ring-1 ring-inv-accent/20" />
            </Reveal>
          </section>
        )}

        {/* ── RSVP ─────────────────────────────────────── */}
        {data.rsvp.enabled && (
          <section className="px-6 py-16">
            <SectionTitle k="rsvp" />
            <Reveal>
              <RsvpForm
                classNames={{
                  root: "font-sans text-inv-text",
                  input: "border-inv-accent/30 focus:ring-inv-primary/30 placeholder:text-inv-muted/70",
                  choice: "border-inv-accent/30 bg-inv-surface/60",
                  choiceActive: "border-inv-primary bg-inv-primary text-inv-on-primary",
                  submit: "bg-inv-primary text-inv-on-primary",
                }}
              />
            </Reveal>
          </section>
        )}

        {/* ── Contacts ─────────────────────────────────── */}
        {data.contacts.some((c) => c.name || c.phone) && (
          <section className="px-6 py-12 text-center">
            <L k="contact" as="h2" className="mb-6 text-xs uppercase tracking-[0.3em] text-inv-muted" subClassName="tracking-[0.2em]" />
            <ContactList className="text-inv-primary" buttonClassName="font-sans ring-1 ring-inv-primary/40 text-inv-primary" />
          </section>
        )}

        {/* ── Footer ───────────────────────────────────── */}
        <footer className="relative overflow-hidden px-6 pb-40 pt-16 text-center">
          <Reveal>
            <L k="footerThanks" as="p" className="text-lg italic text-inv-muted" subClassName="not-italic text-sm" />
            <p className="mt-4 font-script text-5xl text-inv-primary">
              {data.names.first}
              {couple && data.names.second && ` ${joiner} ${data.names.second}`}
            </p>
          </Reveal>
          <p className="relative z-10 mt-10 font-sans text-[11px] uppercase tracking-[0.25em] text-inv-muted/80">
            Made with ♥ on Nimantran
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={assets.floralBottom} alt="" aria-hidden loading="lazy" className="pointer-events-none absolute -bottom-4 left-1/2 w-[120%] max-w-2xl -translate-x-1/2" />
        </footer>
      </main>

      <MusicToggle className="bg-inv-surface/90 text-inv-primary ring-1 ring-inv-accent/30" />
    </div>
  );
}
