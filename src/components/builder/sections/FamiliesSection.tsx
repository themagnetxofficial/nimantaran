"use client";

import { Field, TextInput } from "@/components/ui/Field";
import { LIMITS } from "@/lib/invite/schema";
import type { SectionProps } from "../types";

export function FamiliesSection({ data, update }: SectionProps) {
  const couple = data.type === "wedding" || data.type === "engagement";
  const sides = couple
    ? ([
        ["first", "Bride's family"],
        ["second", "Groom's family"],
      ] as const)
    : ([["first", "Host family"]] as const);

  return (
    <>
      {sides.map(([key, title]) => (
        <fieldset key={key} className="flex flex-col gap-4 rounded-xl bg-ivory-100 p-4">
          <legend className="float-left mb-1 font-serif text-lg font-semibold text-wine-700">{title}</legend>
          <Field label="Parents' names" hint="e.g. Mrs. Anita & Mr. Suresh Sharma">
            {(a) => <TextInput {...a} value={data.families[key].parents} maxLength={LIMITS.shortText} onChange={(e) => update((d) => void (d.families[key].parents = e.target.value))} />}
          </Field>
          <Field label="With blessings of (optional)" hint="Grandparents or elders">
            {(a) => (
              <TextInput {...a} value={data.families[key].grandparents} maxLength={LIMITS.shortText} onChange={(e) => update((d) => void (d.families[key].grandparents = e.target.value))} />
            )}
          </Field>
        </fieldset>
      ))}
    </>
  );
}
