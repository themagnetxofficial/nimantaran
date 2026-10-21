import type { InviteData } from "@/lib/invite/schema";

/** Mutate a draft copy of the data (powered by immer), e.g. update(d => { d.tagline = "Hi" }) */
export type Updater = (recipe: (draft: InviteData) => void) => void;

/** Returns the validation message for a path like "events.0.date", if any. */
export type ErrorFor = (path: string) => string | undefined;

export interface SectionProps {
  data: InviteData;
  update: Updater;
  errorFor: ErrorFor;
}
