import type { InviteData } from "@/lib/invite/schema";

/** Messages exchanged between the builder and the preview <iframe>. */
export type PreviewMessage =
  | { type: "nimantran:ready" }
  | { type: "nimantran:update"; templateId: string; data: InviteData }
  | { type: "nimantran:replay" };

export function isPreviewMessage(v: unknown): v is PreviewMessage {
  return typeof v === "object" && v !== null && typeof (v as { type?: unknown }).type === "string" && (v as { type: string }).type.startsWith("nimantran:");
}
