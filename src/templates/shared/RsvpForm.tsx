"use client";

import { useState, type FormEvent } from "react";
import { eventLabel } from "@/lib/i18n/invite-labels";
import { formatShortDate } from "@/lib/invite/datetime";
import { rsvpSubmissionSchema } from "@/lib/invite/schema";
import { cn } from "@/lib/utils/cn";
import { L } from "./Label";
import { useInvite } from "./runtime";

export interface RsvpFormClassNames {
  root?: string;
  input?: string;
  choice?: string;
  choiceActive?: string;
  submit?: string;
}

/**
 * Guest RSVP form. Validates with the shared Zod schema.
 * Saving to the database is wired in Phase 5 via `runtime.submitRsvp`.
 */
export function RsvpForm({ classNames = {} }: { classNames?: RsvpFormClassNames }) {
  const { data, mode, guestName, submitRsvp } = useInvite();
  const [attending, setAttending] = useState<boolean | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [demo, setDemo] = useState(false);

  if (!data.rsvp.enabled) return null;
  const lang = data.language;
  const multipleEvents = data.events.length > 1;

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = rsvpSubmissionSchema.safeParse({
      name: fd.get("name"),
      phone: fd.get("phone") ?? "",
      attending: attending ?? undefined,
      guestCount: attending ? Number(fd.get("guestCount") || 1) : 0,
      eventsAttending: fd.getAll("events").map(String),
      message: fd.get("message") ?? "",
    });
    if (attending === null) return setError("Please choose if you can attend");
    if (!parsed.success) return setError(parsed.error.issues[0]?.message ?? "Please check the form");
    setError(null);
    setStatus("sending");
    try {
      if (submitRsvp && mode === "live") await submitRsvp(parsed.data);
      else setDemo(true);
      setStatus("done");
    } catch {
      setStatus("error");
      setError("Could not send. Please try again.");
    }
  };

  if (status === "done") {
    return (
      <div className={cn("text-center", classNames.root)} role="status">
        <p className="font-serif text-2xl">{attending ? "Thank you! We can't wait to see you 🌸" : "Thank you for letting us know 🙏"}</p>
        {demo && <p className="mt-2 text-xs opacity-70">Preview only: responses are saved once the invite is live.</p>}
      </div>
    );
  }

  const input = cn("w-full rounded-lg border bg-white/70 px-4 py-3 text-base outline-none focus:ring-2", classNames.input);

  return (
    <form onSubmit={onSubmit} className={cn("mx-auto flex w-full max-w-sm flex-col gap-3 text-left", classNames.root)} noValidate>
      {data.rsvp.deadline && (
        <p className="text-center text-sm opacity-80">
          <L k="rsvpBy" subClassName="hidden" />: {formatShortDate(data.rsvp.deadline, lang)}
        </p>
      )}
      <label className="sr-only" htmlFor="rsvp-name">Your name</label>
      <input id="rsvp-name" name="name" required maxLength={80} defaultValue={guestName ?? ""} placeholder="Your name" autoComplete="name" className={input} />
      <label className="sr-only" htmlFor="rsvp-phone">Mobile number (optional)</label>
      <input id="rsvp-phone" name="phone" inputMode="tel" maxLength={14} placeholder="Mobile number (optional)" autoComplete="tel" className={input} />

      <fieldset className="grid grid-cols-2 gap-2">
        <legend className="sr-only">Will you attend?</legend>
        {[
          { v: true, label: "Joyfully accept" },
          { v: false, label: "Regretfully decline" },
        ].map((o) => (
          <button
            key={String(o.v)}
            type="button"
            aria-pressed={attending === o.v}
            onClick={() => setAttending(o.v)}
            className={cn("rounded-lg border px-3 py-3 text-sm transition-colors", classNames.choice, attending === o.v && classNames.choiceActive)}
          >
            {o.label}
          </button>
        ))}
      </fieldset>

      {attending && (
        <>
          <label className="text-sm" htmlFor="rsvp-count">
            Number of guests (including you)
          </label>
          <select id="rsvp-count" name="guestCount" defaultValue="1" className={input}>
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          {multipleEvents && (
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-1 text-sm">Which celebrations will you attend?</legend>
              {data.events.map((ev) => (
                <label key={ev.id} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="events" value={ev.id} defaultChecked className="size-4 accent-current" />
                  {eventLabel(ev.kind, ev.customName, lang).main}
                </label>
              ))}
            </fieldset>
          )}
        </>
      )}

      <label className="sr-only" htmlFor="rsvp-msg">Message (optional)</label>
      <textarea id="rsvp-msg" name="message" rows={3} maxLength={300} placeholder="Leave a blessing or message (optional)" className={input} />

      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
      <button type="submit" disabled={status === "sending"} className={cn("mt-1 rounded-full px-6 py-3 font-medium transition-transform active:scale-95 disabled:opacity-60", classNames.submit)}>
        {status === "sending" ? "Sending…" : "Send RSVP"}
      </button>
    </form>
  );
}
