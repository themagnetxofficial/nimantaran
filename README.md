# Nimantran: personalised digital invitations

Customers pick an animated template, fill in a form with a live preview, pay, and get a shareable
invitation website such as `nimantran.in/i/rahul-weds-priya`.

**Stack:** Next.js 16 (App Router, Cache Components) · TypeScript · Tailwind CSS v4 · GSAP + ScrollTrigger · Zod ·
Supabase (Phase 2) · Razorpay (Phase 6) · Vercel

## Run it locally

```bash
npm install
cp .env.example .env.local   # nothing needs filling in for Phase 1
npm run dev                  # http://localhost:3000
```

| URL | What it is |
| --- | --- |
| `/` | Temporary home page (the full landing page comes in Phase 7) |
| `/templates` | Template gallery |
| `/templates/floral-pastel` | Full-screen live demo with sample data |
| `/create/floral-pastel` | The builder: form plus live phone preview, auto-saved in your browser |
| `/preview` | Your saved draft, full screen (also what the builder's phone frame shows) |
| `/i/rahul-weds-priya` | A "published" sample invite (English) |
| `/i/priya-rahul-hindi` | The same invite, bilingual |
| `/i/demo-unpaid` | Unpaid invite: shows the watermark and is not indexed |

Other scripts: `npm run build` (production build), `npm run lint`, `node scripts/generate-floral-assets.mjs`
(regenerates the Floral Pastel artwork).

## How the code is organised

```
src/
  app/                       routes (see table above)
    (site)/                  pages with the site header/footer
    (invite)/                full-screen invite pages: /i/[slug], /templates/[id], /preview
    create/[templateId]/     the builder
  components/
    builder/                 builder UI (steps, sections, phone preview, slug field)
    site/  ui/               app UI building blocks (buttons, fields, logo…)
  config/                    site.ts (name/URL), pricing.ts (all prices in one place)
  lib/
    invite/schema.ts         ★ InviteData type + Zod schema (form, server and DB all use this)
    invite/defaults.ts       empty invite / new event helpers, safe parsing
    invite/samples.ts        sample data (stands in for the database until Phase 2)
    invite/datetime.ts       IST date/time helpers (formats by hand so server and browser match)
    i18n/invite-labels.ts    English/Hindi labels used on invite pages
    calendar/ics.ts          .ics + Google Calendar links
    media/upload.ts          browser photo compression (switches to Supabase upload in Phase 2)
  templates/
    types.ts                 TemplateManifest / TemplateProps
    registry.ts              ★ the list of all templates
    TemplateRenderer.tsx     renders any invite through its template (+ watermark)
    shared/                  Countdown, EventCard, MapButton, AddToCalendar, Gallery,
                             MusicToggle, RsvpForm, OpenIntro, Reveal, ContactList…
    floral-pastel/           index.tsx (component) + manifest.ts + CSS module
public/templates/<id>/       one file per visual layer (swap for AI artwork later)
```

### Adding a template

1. Create `src/templates/<id>/index.tsx` (default-export a component that takes `{ data, mode }`) and `manifest.ts`.
2. Put each artwork layer in `public/templates/<id>/` and list it in `manifest.assets`.
3. Add one entry to `src/templates/registry.ts`.

### Replacing artwork

Every visual layer is its own file, for example `public/templates/floral-pastel/envelope-flap.svg`.
To use real artwork, drop in a PNG/WebP with the same proportions and update the path in that template's
`manifest.ts` (`assets`). Names, dates and Hindi text are always real HTML on top, never baked into images.
