import { parseInviteData } from "./defaults";
import type { InviteData } from "./schema";

/**
 * Local (not logged in) draft storage. From Phase 2/3 logged-in users'
 * drafts are saved to the database instead; this stays as the fallback.
 */
export interface LocalDraft {
  templateId: string;
  slug: string;
  data: InviteData;
  updatedAt: number;
}

const KEY = "nimantran:draft:v1";

export function loadLocalDraft(): LocalDraft | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<LocalDraft>;
    if (typeof parsed.templateId !== "string") return null;
    return {
      templateId: parsed.templateId,
      slug: typeof parsed.slug === "string" ? parsed.slug : "",
      data: parseInviteData(parsed.data),
      updatedAt: typeof parsed.updatedAt === "number" ? parsed.updatedAt : Date.now(),
    };
  } catch {
    return null;
  }
}

/** Returns false if the browser refused (e.g. storage full because of large photos). */
export function saveLocalDraft(draft: LocalDraft): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(draft));
    return true;
  } catch {
    return false;
  }
}

export function clearLocalDraft() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
