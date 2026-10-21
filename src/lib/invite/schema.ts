import { z } from "zod";

/**
 * ─── InviteData ────────────────────────────────────────────────
 * The single source of truth for what an invitation contains.
 * The SAME schema is used for:
 *   • builder form validation (client)
 *   • API / server action validation (server, Phase 2)
 *   • the `invites.data` jsonb column in Postgres
 *
 * Templates only ever read this data; they never own it. That is why the
 * user can switch templates without losing anything.
 *
 * Bump `INVITE_SCHEMA_VERSION` when the shape changes in a breaking way
 * and add a migration in `migrate.ts`.
 */
export const INVITE_SCHEMA_VERSION = 1;

export const LIMITS = {
  name: 80,
  shortText: 120,
  longText: 600,
  events: 12,
  gallery: 10,
  contacts: 4,
} as const;

/** Removes control characters and trims. React already escapes HTML on render. */
const cleanText = (max: number) =>
  z
    .string()
    .max(max * 2) // generous pre-trim limit so a pasted space-padded string isn't rejected
    .transform((s) => s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim())
    .pipe(z.string().max(max));

const optionalUrl = z
  .string()
  .trim()
  .max(2048)
  .refine((v) => v === "" || /^https?:\/\//i.test(v), "Must start with http:// or https://");

/** Photos can be https URLs (Supabase Storage) or, in Phase 1 local drafts, data: URLs. */
const imageSrc = z
  .string()
  .max(3_000_000)
  .refine((v) => /^https?:\/\//i.test(v) || v.startsWith("/") || v.startsWith("data:image/"), "Invalid image");

export const inviteTypeSchema = z.enum(["wedding", "engagement", "birthday", "housewarming", "other"]);
export type InviteType = z.infer<typeof inviteTypeSchema>;

export const languageSchema = z.enum(["en", "hi", "bilingual"]);
export type InviteLanguage = z.infer<typeof languageSchema>;

export const eventKindSchema = z.enum([
  "haldi",
  "mehendi",
  "sangeet",
  "tilak",
  "wedding",
  "reception",
  "engagement",
  "birthday",
  "griha_pravesh",
  "puja",
  "custom",
]);
export type EventKind = z.infer<typeof eventKindSchema>;

export const photoSchema = z.object({
  id: z.string().max(64),
  src: imageSrc,
  alt: cleanText(LIMITS.shortText).default(""),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  /** Supabase Storage path, so we can delete the file later (Phase 2) */
  storagePath: z.string().max(512).optional(),
});
export type Photo = z.infer<typeof photoSchema>;

export const eventSchema = z.object({
  id: z.string().max(64),
  kind: eventKindSchema,
  /** Used when kind === "custom" (or to override the default label) */
  customName: cleanText(LIMITS.name).default(""),
  /** YYYY-MM-DD, interpreted in Indian Standard Time */
  date: z.string().regex(/^(\d{4}-\d{2}-\d{2})?$/, "Use a valid date").default(""),
  /** HH:mm (24h), IST */
  time: z.string().regex(/^(\d{2}:\d{2})?$/, "Use a valid time").default(""),
  venueName: cleanText(LIMITS.shortText).default(""),
  address: cleanText(LIMITS.longText).default(""),
  mapUrl: optionalUrl.default(""),
  note: cleanText(LIMITS.shortText).default(""),
});
export type InviteEvent = z.infer<typeof eventSchema>;

const familySideSchema = z.object({
  parents: cleanText(LIMITS.shortText).default(""),
  grandparents: cleanText(LIMITS.shortText).default(""),
});

export const contactSchema = z.object({
  id: z.string().max(64),
  name: cleanText(LIMITS.name).default(""),
  /** Indian mobile, stored as 10 digits (we add +91 when dialling) or full E.164 */
  phone: z
    .string()
    .trim()
    .regex(/^(\+?\d{10,14})?$/, "Enter a 10-digit mobile number")
    .default(""),
  whatsapp: z.boolean().default(true),
});
export type InviteContact = z.infer<typeof contactSchema>;

export const musicSchema = z.object({
  source: z.enum(["none", "library", "upload"]).default("none"),
  /** id from the built-in music library (Phase 4) */
  trackId: z.string().max(64).default(""),
  /** final playable URL (library file or uploaded file) */
  url: z.string().max(2048).default(""),
  title: cleanText(LIMITS.shortText).default(""),
  /** user confirmed they own the rights to an uploaded track */
  rightsConfirmed: z.boolean().default(false),
});

export const inviteDataSchema = z.object({
  version: z.literal(INVITE_SCHEMA_VERSION).default(INVITE_SCHEMA_VERSION),
  type: inviteTypeSchema.default("wedding"),
  language: languageSchema.default("en"),

  topLine: z
    .object({
      enabled: z.boolean().default(true),
      text: cleanText(LIMITS.shortText).default("॥ श्री गणेशाय नमः ॥"),
    })
    .default({ enabled: true, text: "॥ श्री गणेशाय नमः ॥" }),

  /**
   * Main names. For weddings/engagements: first + second person.
   * For birthday: first = birthday person. For housewarming: first = host family.
   * `*Alt` are optional names in a second script (e.g. Devanagari) for bilingual invites.
   */
  names: z
    .object({
      first: cleanText(LIMITS.name).default(""),
      second: cleanText(LIMITS.name).default(""),
      firstAlt: cleanText(LIMITS.name).default(""),
      secondAlt: cleanText(LIMITS.name).default(""),
    })
    .default({ first: "", second: "", firstAlt: "", secondAlt: "" }),

  tagline: cleanText(LIMITS.shortText).default(""),
  message: cleanText(LIMITS.longText).default(""),

  families: z
    .object({
      /** bride's side / host family */
      first: familySideSchema.default({ parents: "", grandparents: "" }),
      /** groom's side */
      second: familySideSchema.default({ parents: "", grandparents: "" }),
    })
    .default({ first: { parents: "", grandparents: "" }, second: { parents: "", grandparents: "" } }),

  events: z.array(eventSchema).max(LIMITS.events).default([]),

  coverPhoto: photoSchema.nullable().default(null),
  gallery: z.array(photoSchema).max(LIMITS.gallery).default([]),

  music: musicSchema.default({ source: "none", trackId: "", url: "", title: "", rightsConfirmed: false }),

  rsvp: z
    .object({
      enabled: z.boolean().default(true),
      /** YYYY-MM-DD */
      deadline: z.string().regex(/^(\d{4}-\d{2}-\d{2})?$/).default(""),
    })
    .default({ enabled: true, deadline: "" }),

  contacts: z.array(contactSchema).max(LIMITS.contacts).default([]),

  design: z
    .object({
      /** must be one of the active template's palette ids; falls back to its default */
      paletteId: z.string().max(40).default(""),
    })
    .default({ paletteId: "" }),
});

/** Fully-parsed invite data (all defaults applied). */
export type InviteData = z.infer<typeof inviteDataSchema>;

/**
 * Stricter rules that must pass before an invite can be published.
 * Drafts may be incomplete; published invites may not.
 */
export const publishableInviteSchema = inviteDataSchema.superRefine((d, ctx) => {
  if (!d.names.first) ctx.addIssue({ code: "custom", path: ["names", "first"], message: "Add the main name" });
  if ((d.type === "wedding" || d.type === "engagement") && !d.names.second)
    ctx.addIssue({ code: "custom", path: ["names", "second"], message: "Add the second name" });
  if (d.events.length === 0) ctx.addIssue({ code: "custom", path: ["events"], message: "Add at least one event" });
  d.events.forEach((e, i) => {
    if (!e.date) ctx.addIssue({ code: "custom", path: ["events", i, "date"], message: "Event date is required" });
    if (!e.venueName) ctx.addIssue({ code: "custom", path: ["events", i, "venueName"], message: "Venue is required" });
    if (e.kind === "custom" && !e.customName)
      ctx.addIssue({ code: "custom", path: ["events", i, "customName"], message: "Name this event" });
  });
  if (d.music.source === "upload" && d.music.url && !d.music.rightsConfirmed)
    ctx.addIssue({ code: "custom", path: ["music", "rightsConfirmed"], message: "Confirm you have rights to this music" });
});

/** Slug rules shared by the builder and the server. */
export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "At least 3 characters")
  .max(60, "At most 60 characters")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and single hyphens");

/** RSVP submission from a guest (used by the RSVP form now and the server in Phase 5). */
export const rsvpSubmissionSchema = z.object({
  name: cleanText(LIMITS.name).pipe(z.string().min(1, "Please enter your name")),
  phone: z
    .string()
    .trim()
    .regex(/^(\+?\d{10,14})?$/, "Enter a valid mobile number")
    .default(""),
  attending: z.boolean(),
  guestCount: z.number().int().min(0).max(20).default(1),
  eventsAttending: z.array(z.string().max(64)).max(LIMITS.events).default([]),
  message: cleanText(300).default(""),
});
export type RsvpSubmission = z.infer<typeof rsvpSubmissionSchema>;
