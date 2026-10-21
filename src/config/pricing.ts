/**
 * Pricing lives in ONE place. Amounts are in rupees.
 * (Razorpay works in paise; convert with `toPaise` on the server in Phase 6.)
 */
export type PlanId = "basic" | "premium" | "premium_plus";

export interface Plan {
  id: PlanId;
  name: string;
  price: number;
  description: string;
  features: string[];
  /** Which template tiers this plan can publish */
  allowsTiers: Array<"basic" | "premium">;
  guestLinks: boolean;
  rsvpDashboard: boolean;
}

export const plans: Record<PlanId, Plan> = {
  basic: {
    id: "basic",
    name: "Basic",
    price: 499,
    description: "Any basic template, all essentials",
    features: ["Basic templates", "Unlimited edits", "WhatsApp sharing", "Countdown, map & calendar"],
    allowsTiers: ["basic"],
    guestLinks: false,
    rsvpDashboard: false,
  },
  premium: {
    id: "premium",
    name: "Premium",
    price: 999,
    description: "Every template, music & gallery",
    features: ["All templates", "Background music", "Photo gallery", "Everything in Basic"],
    allowsTiers: ["basic", "premium"],
    guestLinks: false,
    rsvpDashboard: false,
  },
  premium_plus: {
    id: "premium_plus",
    name: "Premium + Guests",
    price: 1499,
    description: "Personalised guest links & RSVP dashboard",
    features: ["Everything in Premium", "Personalised guest links", "RSVP dashboard & CSV export"],
    allowsTiers: ["basic", "premium"],
    guestLinks: true,
    rsvpDashboard: true,
  },
};

export const toPaise = (rupees: number) => Math.round(rupees * 100);

export const formatINR = (rupees: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(rupees);
