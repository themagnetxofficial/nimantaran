"use client";

import { slugSchema, type InviteData } from "@/lib/invite/schema";
import { sampleInvites } from "@/lib/invite/samples";
import { siteConfig } from "@/config/site";
import { Field, TextInput } from "@/components/ui/Field";

const RESERVED = new Set(["admin", "api", "app", "create", "dashboard", "login", "preview", "templates", "nimantran", "help", "support"]);

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function suggestSlug(d: InviteData) {
  const { first, second } = d.names;
  switch (d.type) {
    case "wedding":
      return slugify(second && first ? `${second}-weds-${first}` : first || second);
    case "engagement":
      return slugify(`${first}-${second}-engagement`);
    case "birthday":
      return slugify(`${first}-birthday`);
    case "housewarming":
      return slugify(`${first}-griha-pravesh`);
    default:
      return slugify(`${first}-celebration`);
  }
}

/**
 * Phase 1: validates the format locally. Phase 2 adds a live, rate-limited
 * availability check against the database.
 */
export function SlugField({ slug, data, onChange }: { slug: string; data: InviteData; onChange: (s: string) => void }) {
  const parsed = slugSchema.safeParse(slug);
  let message: { text: string; ok: boolean } | null = null;
  if (slug) {
    if (!parsed.success) message = { text: parsed.error.issues[0].message, ok: false };
    else if (RESERVED.has(parsed.data) || sampleInvites.some((s) => s.slug === parsed.data)) message = { text: "This link is already taken", ok: false };
    else message = { text: "Looks good! (Availability is confirmed when you publish)", ok: true };
  }
  const suggestion = suggestSlug(data);
  const host = siteConfig.url.replace(/^https?:\/\//, "");

  return (
    <Field label="Your invite link" error={message && !message.ok ? message.text : undefined} hint={message?.ok ? message.text : "Lowercase letters, numbers and hyphens"}>
      {(a) => (
        <div>
          <div className="flex items-stretch overflow-hidden rounded-xl border border-ivory-300 bg-ivory-100 focus-within:border-gold-400 focus-within:ring-4 focus-within:ring-gold-300/30">
            <span className="hidden items-center pl-3.5 text-sm text-ink-500 sm:flex">{host}/i/</span>
            <TextInput
              {...a}
              value={slug}
              onChange={(e) => onChange(slugify(e.target.value.replace(/\s/g, "-")) + (e.target.value.endsWith("-") ? "-" : ""))}
              placeholder={suggestion || "rahul-weds-priya"}
              className="rounded-none border-0 bg-white shadow-none focus:ring-0"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
            />
          </div>
          {suggestion && suggestion !== slug && (
            <button type="button" onClick={() => onChange(suggestion)} className="mt-2 text-xs font-semibold text-wine-600 underline-offset-2 hover:underline">
              Use “{suggestion}”
            </button>
          )}
        </div>
      )}
    </Field>
  );
}
