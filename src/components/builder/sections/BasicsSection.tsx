"use client";

import { Field, Segmented, Select, Switch, TextArea, TextInput } from "@/components/ui/Field";
import { nameFieldLabels } from "@/lib/i18n/invite-labels";
import { LIMITS, type InviteLanguage, type InviteType } from "@/lib/invite/schema";
import type { SectionProps } from "../types";

const typeOptions: Array<{ value: InviteType; label: string }> = [
  { value: "wedding", label: "Wedding" },
  { value: "engagement", label: "Engagement" },
  { value: "birthday", label: "Birthday" },
  { value: "housewarming", label: "Housewarming (Griha Pravesh)" },
  { value: "other", label: "Other celebration" },
];

const languageOptions: Array<{ value: InviteLanguage; label: string }> = [
  { value: "en", label: "English" },
  { value: "hi", label: "हिन्दी" },
  { value: "bilingual", label: "Both" },
];

export function BasicsSection({ data, update, errorFor }: SectionProps) {
  const labels = nameFieldLabels(data.type);
  const showAlt = data.language !== "en";

  return (
    <>
      <Field label="What are you celebrating?">
        {(a) => (
          <Select {...a} value={data.type} onChange={(e) => update((d) => void (d.type = e.target.value as InviteType))}>
            {typeOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        )}
      </Field>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold text-ink-700">Invite language</span>
        <Segmented label="Invite language" value={data.language} options={languageOptions} onChange={(v) => update((d) => void (d.language = v))} />
        <p className="text-xs text-ink-500">Changes headings like “Celebrations” / “कार्यक्रम”. Your own text stays exactly as you type it.</p>
      </div>

      <div className="flex flex-col gap-3 rounded-xl bg-ivory-100 p-4">
        <Switch
          label="Top blessing line"
          description="Shown at the very top, e.g. ॥ श्री गणेशाय नमः ॥"
          checked={data.topLine.enabled}
          onChange={(v) => update((d) => void (d.topLine.enabled = v))}
        />
        {data.topLine.enabled && (
          <TextInput
            aria-label="Top blessing line text"
            lang="hi"
            value={data.topLine.text}
            maxLength={LIMITS.shortText}
            onChange={(e) => update((d) => void (d.topLine.text = e.target.value))}
          />
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={labels.first} error={errorFor("names.first")}>
          {(a) => <TextInput {...a} value={data.names.first} maxLength={LIMITS.name} autoComplete="off" onChange={(e) => update((d) => void (d.names.first = e.target.value))} />}
        </Field>
        {labels.second && (
          <Field label={labels.second} error={errorFor("names.second")}>
            {(a) => <TextInput {...a} value={data.names.second} maxLength={LIMITS.name} autoComplete="off" onChange={(e) => update((d) => void (d.names.second = e.target.value))} />}
          </Field>
        )}
        {showAlt && (
          <Field label={`${labels.first} in Hindi`} hint="Optional, e.g. प्रिया">
            {(a) => <TextInput {...a} lang="hi" value={data.names.firstAlt} maxLength={LIMITS.name} onChange={(e) => update((d) => void (d.names.firstAlt = e.target.value))} />}
          </Field>
        )}
        {showAlt && labels.second && (
          <Field label={`${labels.second} in Hindi`} hint="Optional, e.g. राहुल">
            {(a) => <TextInput {...a} lang="hi" value={data.names.secondAlt} maxLength={LIMITS.name} onChange={(e) => update((d) => void (d.names.secondAlt = e.target.value))} />}
          </Field>
        )}
      </div>

      <Field label="Tagline" hint="A short line under the names">
        {(a) => <TextInput {...a} value={data.tagline} maxLength={LIMITS.shortText} placeholder="Two hearts, one beautiful journey" onChange={(e) => update((d) => void (d.tagline = e.target.value))} />}
      </Field>
      <Field label="Invitation message" hint={`${data.message.length}/${LIMITS.longText}`}>
        {(a) => (
          <TextArea {...a} value={data.message} maxLength={LIMITS.longText} placeholder="With the blessings of our elders, we invite you…" onChange={(e) => update((d) => void (d.message = e.target.value))} />
        )}
      </Field>
    </>
  );
}
