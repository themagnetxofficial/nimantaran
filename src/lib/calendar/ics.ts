import { eventStart } from "@/lib/invite/datetime";
import type { InviteEvent } from "@/lib/invite/schema";

/** Default duration when an event has no end time. */
const DEFAULT_DURATION_MS = 3 * 60 * 60 * 1000;

const toIcsDate = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

const escapeIcs = (s: string) => s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\;");

export interface CalendarEventInput {
  event: InviteEvent;
  title: string;
  description: string;
  url?: string;
}

function timing(event: InviteEvent) {
  const start = eventStart(event);
  if (!start) return null;
  const allDay = !event.time;
  const end = new Date(start.getTime() + (allDay ? 24 * 60 * 60 * 1000 : DEFAULT_DURATION_MS));
  return { start, end, allDay };
}

function location(event: InviteEvent) {
  return [event.venueName, event.address].filter(Boolean).join(", ");
}

/** Builds an .ics file (works with Apple Calendar, Outlook, Google). */
export function buildIcs({ event, title, description, url }: CalendarEventInput): string | null {
  const t = timing(event);
  if (!t) return null;
  const dates = t.allDay
    ? [`DTSTART;VALUE=DATE:${event.date.replace(/-/g, "")}`, `DTEND;VALUE=DATE:${toIcsDate(t.end).slice(0, 8)}`]
    : [`DTSTART:${toIcsDate(t.start)}`, `DTEND:${toIcsDate(t.end)}`];
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Nimantran//Invite//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${event.id}@nimantran`,
    `DTSTAMP:${toIcsDate(new Date())}`,
    ...dates,
    `SUMMARY:${escapeIcs(title)}`,
    `DESCRIPTION:${escapeIcs(description + (url ? `\n${url}` : ""))}`,
    `LOCATION:${escapeIcs(location(event))}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

/** Google Calendar "add event" link — the best option on Android. */
export function googleCalendarUrl({ event, title, description, url }: CalendarEventInput): string | null {
  const t = timing(event);
  if (!t) return null;
  const fmt = (d: Date) => (t.allDay ? toIcsDate(d).slice(0, 8) : toIcsDate(d));
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${fmt(t.start)}/${fmt(t.end)}`,
    details: description + (url ? `\n${url}` : ""),
    location: location(event),
    ctz: "Asia/Kolkata",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
