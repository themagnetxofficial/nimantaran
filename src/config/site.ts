export const siteConfig = {
  name: "Nimantran",
  tagline: "Beautiful digital invitations, made in minutes",
  description:
    "Create a personalised, animated invitation website for your wedding, engagement, birthday or housewarming and share it on WhatsApp.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
} as const;

/** Absolute URL helper, e.g. absoluteUrl("/i/rahul-weds-priya") */
export function absoluteUrl(path = "/") {
  return new URL(path, siteConfig.url).toString();
}
