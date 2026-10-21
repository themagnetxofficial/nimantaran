import type { InviteData, InviteEvent, InviteLanguage } from "./schema";

/** All event dates/times are entered and shown in Indian Standard Time. */
const IST_OFFSET = "+05:30";

/** Converts an event's IST date + time to a real Date (null if no date). */
export function eventStart(e: Pick<InviteEvent, "date" | "time">): Date | null {
  if (!e.date) return null;
  const d = new Date(`${e.date}T${e.time || "00:00"}:00${IST_OFFSET}`);
  return Number.isNaN(d.getTime()) ? null : d;
}

/*
 * Dates are formatted by hand (not Intl) so the server and every browser
 * produce exactly the same text. Different ICU versions format dates slightly
 * differently, which would cause React hydration mismatches.
 */
const MONTHS = {
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  hi: ["जनवरी", "फ़रवरी", "मार्च", "अप्रैल", "मई", "जून", "जुलाई", "अगस्त", "सितंबर", "अक्तूबर", "नवंबर", "दिसंबर"],
};
const WEEKDAYS = {
  en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  hi: ["रविवार", "सोमवार", "मंगलवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार"],
};

const scriptFor = (language: InviteLanguage) => (language === "hi" ? "hi" : "en");

function parts(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  if (!y || !m || !d) return null;
  return { y, m, d, weekday: new Date(Date.UTC(y, m - 1, d)).getUTCDay() };
}

/** "Sunday, 14 February 2027" / "रविवार, 14 फ़रवरी 2027" */
export function formatEventDate(e: Pick<InviteEvent, "date">, language: InviteLanguage): string {
  const p = e.date ? parts(e.date) : null;
  if (!p) return "";
  const l = scriptFor(language);
  return `${WEEKDAYS[l][p.weekday]}, ${p.d} ${MONTHS[l][p.m - 1]} ${p.y}`;
}

/** "14 February 2027" — compact form for heroes */
export function formatShortDate(date: string, language: InviteLanguage): string {
  const p = date ? parts(date) : null;
  if (!p) return "";
  return `${p.d} ${MONTHS[scriptFor(language)][p.m - 1]} ${p.y}`;
}

/** "7:30 PM" / "शाम 7:30 बजे" */
export function formatEventTime(e: Pick<InviteEvent, "time">, language: InviteLanguage): string {
  if (!e.time) return "";
  const [h, m] = e.time.split(":").map(Number);
  const h12 = h % 12 || 12;
  const mm = String(m).padStart(2, "0");
  if (scriptFor(language) === "hi") {
    const period = h >= 4 && h < 12 ? "सुबह" : h >= 12 && h < 16 ? "दोपहर" : h >= 16 && h < 20 ? "शाम" : "रात";
    return `${period} ${h12}:${mm} बजे`;
  }
  return `${h12}:${mm} ${h < 12 ? "AM" : "PM"}`;
}

/**
 * The event the countdown and hero date should point at:
 * the event matching the invite type (e.g. the Wedding), else the earliest dated event.
 */
export function mainEvent(data: Pick<InviteData, "type" | "events">): InviteEvent | null {
  const preferredKind: Partial<Record<InviteData["type"], InviteEvent["kind"]>> = {
    wedding: "wedding",
    engagement: "engagement",
    birthday: "birthday",
    housewarming: "griha_pravesh",
  };
  const kind = preferredKind[data.type];
  const dated = data.events.filter((e) => e.date);
  const match = kind ? dated.find((e) => e.kind === kind) : undefined;
  if (match) return match;
  return [...dated].sort((a, b) => (eventStart(a)?.getTime() ?? 0) - (eventStart(b)?.getTime() ?? 0))[0] ?? null;
}
