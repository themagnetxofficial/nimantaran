"use client";

import { Button } from "@/components/ui/Button";
import { Field, Switch, TextInput } from "@/components/ui/Field";
import { createContact } from "@/lib/invite/defaults";
import { LIMITS } from "@/lib/invite/schema";
import type { SectionProps } from "../types";

export function RsvpContactsSection({ data, update, errorFor }: SectionProps) {
  return (
    <>
      <div className="flex flex-col gap-4 rounded-xl bg-ivory-100 p-4">
        <Switch label="Collect RSVPs" description="Guests can tell you if they’re coming and how many" checked={data.rsvp.enabled} onChange={(v) => update((d) => void (d.rsvp.enabled = v))} />
        {data.rsvp.enabled && (
          <Field label="Reply by (optional)">
            {(a) => <TextInput {...a} type="date" value={data.rsvp.deadline} onChange={(e) => update((d) => void (d.rsvp.deadline = e.target.value))} />}
          </Field>
        )}
      </div>

      <div>
        <h3 className="mb-1 text-sm font-semibold text-ink-700">Contact numbers</h3>
        <p className="mb-3 text-xs text-ink-500">Guests can call or WhatsApp these people.</p>
        <ul className="flex flex-col gap-3">
          {data.contacts.map((c, i) => (
            <li key={c.id} className="grid gap-3 rounded-xl bg-ivory-100 p-4 sm:grid-cols-2">
              <Field label="Name">
                {(a) => <TextInput {...a} value={c.name} maxLength={LIMITS.name} onChange={(e) => update((d) => void (d.contacts[i].name = e.target.value))} />}
              </Field>
              <Field label="Mobile number" error={errorFor(`contacts.${i}.phone`)}>
                {(a) => (
                  <TextInput
                    {...a}
                    type="tel"
                    inputMode="tel"
                    value={c.phone}
                    placeholder="98765 43210"
                    maxLength={16}
                    onChange={(e) => update((d) => void (d.contacts[i].phone = e.target.value.replace(/[^\d+]/g, "")))}
                  />
                )}
              </Field>
              <div className="flex items-center justify-between gap-4 sm:col-span-2">
                <label className="flex items-center gap-2 text-sm text-ink-700">
                  <input type="checkbox" className="size-4 accent-wine-700" checked={c.whatsapp} onChange={(e) => update((d) => void (d.contacts[i].whatsapp = e.target.checked))} />
                  Show WhatsApp button
                </label>
                <button type="button" onClick={() => update((d) => void d.contacts.splice(i, 1))} className="text-sm text-ink-500 hover:text-wine-700">
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
        <Button variant="secondary" className="mt-3" disabled={data.contacts.length >= LIMITS.contacts} onClick={() => update((d) => void d.contacts.push(createContact()))}>
          + Add contact
        </Button>
      </div>
    </>
  );
}
