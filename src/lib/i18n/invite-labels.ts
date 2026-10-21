import type { EventKind, InviteLanguage, InviteType } from "@/lib/invite/schema";

/**
 * Fixed text that appears on invitation pages (not user-entered).
 * Templates must never hard-code these strings: use `useInvite().t(key)` so
 * the invite switches between English, Hindi and bilingual automatically.
 */
const labels = {
  tapToOpen: { en: "Tap to open", hi: "खोलने के लिए स्पर्श करें" },
  youAreInvited: { en: "You are cordially invited", hi: "आप सादर आमंत्रित हैं" },
  dear: { en: "Dear", hi: "प्रिय" },
  weds: { en: "weds", hi: "संग" },
  and: { en: "&", hi: "एवं" },
  saveTheDate: { en: "Save the Date", hi: "शुभ तिथि" },
  togetherWithFamilies: {
    en: "Together with their families",
    hi: "अपने परिवारों के आशीर्वाद सहित",
  },
  withBlessingsOf: { en: "With the blessings of", hi: "आशीर्वाद" },
  inviteYou: { en: "request the pleasure of your company", hi: "आपकी गरिमामयी उपस्थिति की कामना करते हैं" },
  countdown: { en: "Counting down", hi: "उलटी गिनती" },
  days: { en: "Days", hi: "दिन" },
  hours: { en: "Hours", hi: "घंटे" },
  minutes: { en: "Minutes", hi: "मिनट" },
  seconds: { en: "Seconds", hi: "सेकंड" },
  itsToday: { en: "The celebration is today!", hi: "शुभ दिन आ गया!" },
  celebrated: { en: "Thank you for celebrating with us", hi: "हमारे साथ उत्सव मनाने के लिए धन्यवाद" },
  events: { en: "Celebrations", hi: "कार्यक्रम" },
  venue: { en: "Venue", hi: "स्थान" },
  directions: { en: "Directions", hi: "रास्ता देखें" },
  addToCalendar: { en: "Add to calendar", hi: "कैलेंडर में जोड़ें" },
  dressCode: { en: "Note", hi: "विशेष" },
  gallery: { en: "Moments", hi: "यादें" },
  rsvp: { en: "Kindly RSVP", hi: "कृपया अपनी उपस्थिति बताएं" },
  rsvpBy: { en: "Please respond by", hi: "कृपया उत्तर दें" },
  contact: { en: "For any queries", hi: "संपर्क करें" },
  footerThanks: { en: "We look forward to celebrating with you", hi: "आपके आगमन की प्रतीक्षा रहेगी" },
  withLove: { en: "With love", hi: "सप्रेम" },
  bridesFamily: { en: "Bride's family", hi: "वधू पक्ष" },
  groomsFamily: { en: "Groom's family", hi: "वर पक्ष" },
  hostFamily: { en: "Hosted by", hi: "निवेदक" },
  turnsAge: { en: "is celebrating a birthday", hi: "का जन्मदिन" },
  newHome: { en: "invite you to bless their new home", hi: "आपको अपने नए घर में आमंत्रित करते हैं" },
} as const;

export type LabelKey = keyof typeof labels;

/** A label resolved for the invite's language. `sub` is set only for bilingual invites. */
export interface ResolvedLabel {
  main: string;
  sub?: string;
  /** BCP-47 language of `main`, so CSS can pick the right font */
  lang: "en" | "hi";
}

export function resolveLabel(key: LabelKey, language: InviteLanguage): ResolvedLabel {
  const l = labels[key];
  if (language === "hi") return { main: l.hi, lang: "hi" };
  if (language === "bilingual") return { main: l.hi, sub: l.en, lang: "hi" };
  return { main: l.en, lang: "en" };
}

/** Plain string version, e.g. for aria-labels. Bilingual returns "हिन्दी / English". */
export function labelText(key: LabelKey, language: InviteLanguage): string {
  const r = resolveLabel(key, language);
  return r.sub ? `${r.main} / ${r.sub}` : r.main;
}

const eventNames: Record<Exclude<EventKind, "custom">, { en: string; hi: string }> = {
  haldi: { en: "Haldi", hi: "हल्दी" },
  mehendi: { en: "Mehendi", hi: "मेहंदी" },
  sangeet: { en: "Sangeet", hi: "संगीत" },
  tilak: { en: "Tilak", hi: "तिलक" },
  wedding: { en: "Wedding", hi: "शुभ विवाह" },
  reception: { en: "Reception", hi: "प्रीतिभोज" },
  engagement: { en: "Engagement", hi: "सगाई" },
  birthday: { en: "Birthday Party", hi: "जन्मदिन समारोह" },
  griha_pravesh: { en: "Griha Pravesh", hi: "गृह प्रवेश" },
  puja: { en: "Puja", hi: "पूजा" },
};

export const eventKindOptions: Array<{ value: EventKind; label: string }> = [
  ...Object.entries(eventNames).map(([value, n]) => ({ value: value as EventKind, label: `${n.en} · ${n.hi}` })),
  { value: "custom", label: "Custom…" },
];

export function eventLabel(kind: EventKind, customName: string, language: InviteLanguage): ResolvedLabel {
  if (kind === "custom" || customName) return { main: customName || "Celebration", lang: /[ऀ-ॿ]/.test(customName) ? "hi" : "en" };
  const n = eventNames[kind];
  if (language === "hi") return { main: n.hi, lang: "hi" };
  if (language === "bilingual") return { main: n.en, sub: n.hi, lang: "en" };
  return { main: n.en, lang: "en" };
}

/** Labels for the two "sides" depending on the invite type. */
export function familySideLabels(type: InviteType): { first: LabelKey; second: LabelKey | null } {
  if (type === "wedding" || type === "engagement") return { first: "bridesFamily", second: "groomsFamily" };
  return { first: "hostFamily", second: null };
}

/** Builder-facing labels for the name fields per invite type. */
export function nameFieldLabels(type: InviteType): { first: string; second: string | null } {
  switch (type) {
    case "wedding":
    case "engagement":
      return { first: "Bride's name", second: "Groom's name" };
    case "birthday":
      return { first: "Birthday person's name", second: null };
    case "housewarming":
      return { first: "Host family (e.g. The Sharma Family)", second: null };
    default:
      return { first: "Host name(s)", second: null };
  }
}
