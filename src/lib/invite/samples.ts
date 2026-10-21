import { createContact, createEvent } from "./defaults";
import { inviteDataSchema, type InviteData, type InviteType } from "./schema";

/**
 * Sample data used for template demos, the builder's starting point and
 * the Phase 1 `/i/[slug]` pages. (From Phase 2, `/i/[slug]` reads the database.)
 */
const weddingSample: InviteData = inviteDataSchema.parse({
  type: "wedding",
  language: "en",
  topLine: { enabled: true, text: "॥ श्री गणेशाय नमः ॥" },
  names: { first: "Priya", second: "Rahul", firstAlt: "प्रिया", secondAlt: "राहुल" },
  tagline: "Two hearts, one beautiful journey",
  message:
    "With joy in our hearts and the blessings of our elders, we invite you to celebrate the beginning of our forever.",
  families: {
    first: { parents: "Mrs. Anita & Mr. Suresh Sharma", grandparents: "Smt. Kamla Devi & Late Shri Ram Prasad Sharma" },
    second: { parents: "Mrs. Meera & Mr. Vikram Malhotra", grandparents: "Smt. Shanti & Shri Hari Om Malhotra" },
  },
  events: [
    createEvent("haldi", {
      id: "evt-haldi",
      date: "2027-02-12",
      time: "10:00",
      venueName: "Sharma Residence",
      address: "24, Civil Lines, Jaipur, Rajasthan",
      note: "Wear yellow!",
    }),
    createEvent("mehendi", {
      id: "evt-mehendi",
      date: "2027-02-12",
      time: "17:00",
      venueName: "The Garden Courtyard",
      address: "Rambagh Palace, Bhawani Singh Rd, Jaipur",
      note: "Shades of green",
    }),
    createEvent("sangeet", {
      id: "evt-sangeet",
      date: "2027-02-13",
      time: "19:30",
      venueName: "Durbar Hall",
      address: "Rambagh Palace, Bhawani Singh Rd, Jaipur",
      note: "Indo-western glam",
    }),
    createEvent("wedding", {
      id: "evt-wedding",
      date: "2027-02-14",
      time: "19:00",
      venueName: "Rambagh Palace",
      address: "Bhawani Singh Rd, Rambagh, Jaipur, Rajasthan 302005",
      mapUrl: "https://maps.google.com/?q=Rambagh+Palace+Jaipur",
      note: "Traditional attire",
    }),
  ],
  coverPhoto: { id: "cover", src: "/samples/couple-cover.svg", alt: "Priya and Rahul" },
  gallery: [1, 2, 3, 4, 5, 6].map((n) => ({ id: `g${n}`, src: `/samples/moment-${n}.svg`, alt: `Moment ${n}` })),
  rsvp: { enabled: true, deadline: "2027-02-01" },
  contacts: [
    createContact({ id: "c1", name: "Suresh Sharma", phone: "9876543210" }),
    createContact({ id: "c2", name: "Vikram Malhotra", phone: "9123456780" }),
  ],
});

const birthdaySample: InviteData = inviteDataSchema.parse({
  type: "birthday",
  language: "en",
  topLine: { enabled: false, text: "" },
  names: { first: "Aarav", second: "", firstAlt: "आरव", secondAlt: "" },
  tagline: "Aarav is turning 5!",
  message: "Join us for cake, games and lots of fun.",
  families: { first: { parents: "Neha & Rohit Verma", grandparents: "" }, second: { parents: "", grandparents: "" } },
  events: [
    createEvent("birthday", {
      id: "evt-bday",
      date: "2027-01-23",
      time: "16:00",
      venueName: "Funky Monkeys Play Centre",
      address: "Phoenix Marketcity, Kurla, Mumbai",
      note: "Superhero costumes welcome",
    }),
  ],
  coverPhoto: { id: "cover", src: "/samples/couple-cover.svg", alt: "Aarav" },
  gallery: [],
  contacts: [createContact({ id: "c1", name: "Neha Verma", phone: "9988776655" })],
});

export function getSampleInvite(type: InviteType = "wedding"): InviteData {
  return structuredClone(type === "birthday" ? birthdaySample : weddingSample);
}

/** Phase 1 stand-in for the database: slug → invite record. */
export interface SampleInviteRecord {
  slug: string;
  templateId: string;
  isPaid: boolean;
  data: InviteData;
}

export const sampleInvites: SampleInviteRecord[] = [
  { slug: "rahul-weds-priya", templateId: "floral-pastel", isPaid: true, data: weddingSample },
  {
    slug: "priya-rahul-hindi",
    templateId: "floral-pastel",
    isPaid: true,
    data: { ...weddingSample, language: "bilingual" },
  },
  { slug: "demo-unpaid", templateId: "floral-pastel", isPaid: false, data: weddingSample },
];

export function findSampleInvite(slug: string): SampleInviteRecord | null {
  return sampleInvites.find((s) => s.slug === slug) ?? null;
}
