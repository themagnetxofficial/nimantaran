"use client";

import { Button } from "@/components/ui/Button";
import { Field, Select, TextArea, TextInput } from "@/components/ui/Field";
import { eventKindOptions, eventLabel } from "@/lib/i18n/invite-labels";
import { createEvent } from "@/lib/invite/defaults";
import { LIMITS, type EventKind } from "@/lib/invite/schema";
import type { SectionProps } from "../types";

export function EventsSection({ data, update, errorFor }: SectionProps) {
  const move = (i: number, dir: -1 | 1) =>
    update((d) => {
      const j = i + dir;
      if (j < 0 || j >= d.events.length) return;
      [d.events[i], d.events[j]] = [d.events[j], d.events[i]];
    });

  return (
    <>
      {errorFor("events") && <p className="text-sm text-wine-600">{errorFor("events")}</p>}
      <ol className="flex flex-col gap-4">
        {data.events.map((ev, i) => (
          <li key={ev.id} className="rounded-xl bg-ivory-100 p-4">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h3 className="font-serif text-lg font-semibold text-wine-700">
                {i + 1}. {eventLabel(ev.kind, ev.customName, "en").main}
              </h3>
              <div className="flex gap-1">
                <IconBtn label="Move up" disabled={i === 0} onClick={() => move(i, -1)}>
                  ↑
                </IconBtn>
                <IconBtn label="Move down" disabled={i === data.events.length - 1} onClick={() => move(i, 1)}>
                  ↓
                </IconBtn>
                <IconBtn label="Remove event" onClick={() => update((d) => void d.events.splice(i, 1))}>
                  ✕
                </IconBtn>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Event">
                {(a) => (
                  <Select {...a} value={ev.kind} onChange={(e) => update((d) => void (d.events[i].kind = e.target.value as EventKind))}>
                    {eventKindOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
              <Field label={ev.kind === "custom" ? "Event name" : "Custom name (optional)"} error={errorFor(`events.${i}.customName`)}>
                {(a) => (
                  <TextInput {...a} value={ev.customName} maxLength={LIMITS.name} placeholder={ev.kind === "custom" ? "e.g. Cocktail Night" : "Leave empty to use default"} onChange={(e) => update((d) => void (d.events[i].customName = e.target.value))} />
                )}
              </Field>
              <Field label="Date" error={errorFor(`events.${i}.date`)}>
                {(a) => <TextInput {...a} type="date" value={ev.date} onChange={(e) => update((d) => void (d.events[i].date = e.target.value))} />}
              </Field>
              <Field label="Time" hint="Indian Standard Time">
                {(a) => <TextInput {...a} type="time" value={ev.time} onChange={(e) => update((d) => void (d.events[i].time = e.target.value))} />}
              </Field>
              <Field label="Venue name" error={errorFor(`events.${i}.venueName`)} className="sm:col-span-2">
                {(a) => <TextInput {...a} value={ev.venueName} maxLength={LIMITS.shortText} onChange={(e) => update((d) => void (d.events[i].venueName = e.target.value))} />}
              </Field>
              <Field label="Address" className="sm:col-span-2">
                {(a) => <TextArea {...a} rows={2} className="min-h-0" value={ev.address} maxLength={LIMITS.longText} onChange={(e) => update((d) => void (d.events[i].address = e.target.value))} />}
              </Field>
              <Field label="Google Maps link (optional)" hint="Open Google Maps → Share → Copy link" error={errorFor(`events.${i}.mapUrl`)} className="sm:col-span-2">
                {(a) => <TextInput {...a} type="url" inputMode="url" value={ev.mapUrl} placeholder="https://maps.app.goo.gl/…" onChange={(e) => update((d) => void (d.events[i].mapUrl = e.target.value.trim()))} />}
              </Field>
              <Field label="Dress code / note (optional)" className="sm:col-span-2">
                {(a) => <TextInput {...a} value={ev.note} maxLength={LIMITS.shortText} placeholder="e.g. Wear yellow!" onChange={(e) => update((d) => void (d.events[i].note = e.target.value))} />}
              </Field>
            </div>
          </li>
        ))}
      </ol>
      <Button
        variant="secondary"
        disabled={data.events.length >= LIMITS.events}
        onClick={() => update((d) => void d.events.push(createEvent(d.events.length === 0 ? "wedding" : "custom")))}
      >
        + Add event
      </Button>
    </>
  );
}

function IconBtn({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="grid size-8 place-items-center rounded-full bg-white text-sm text-ink-700 ring-1 ring-ivory-300 hover:text-wine-700 disabled:opacity-30"
    >
      {children}
    </button>
  );
}
