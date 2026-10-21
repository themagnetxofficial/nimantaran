import { inviteDataSchema, type EventKind, type InviteContact, type InviteData, type InviteEvent, type InviteType } from "./schema";

export const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

export function createEvent(kind: EventKind = "wedding", overrides: Partial<InviteEvent> = {}): InviteEvent {
  return {
    id: createId(),
    kind,
    customName: "",
    date: "",
    time: "",
    venueName: "",
    address: "",
    mapUrl: "",
    note: "",
    ...overrides,
  };
}

export function createContact(overrides: Partial<InviteContact> = {}): InviteContact {
  return { id: createId(), name: "", phone: "", whatsapp: true, ...overrides };
}

const defaultEventKind: Record<InviteType, EventKind> = {
  wedding: "wedding",
  engagement: "engagement",
  birthday: "birthday",
  housewarming: "griha_pravesh",
  other: "custom",
};

/** A blank invite with all defaults applied and one starter event. */
export function createEmptyInvite(type: InviteType = "wedding"): InviteData {
  const data = inviteDataSchema.parse({ type });
  data.events = [createEvent(defaultEventKind[type])];
  if (type === "birthday" || type === "other") data.topLine.enabled = false;
  return data;
}

/**
 * Safely turns unknown stored JSON (localStorage, database) into valid InviteData.
 * Invalid/unknown fields are dropped instead of crashing the page.
 */
export function parseInviteData(raw: unknown): InviteData {
  const result = inviteDataSchema.safeParse(raw);
  if (result.success) return result.data;
  // Best effort: keep what is valid, reset the rest.
  const base = createEmptyInvite();
  if (raw && typeof raw === "object") {
    const merged = { ...base, ...(raw as Record<string, unknown>) };
    const retry = inviteDataSchema.safeParse(merged);
    if (retry.success) return retry.data;
  }
  return base;
}
