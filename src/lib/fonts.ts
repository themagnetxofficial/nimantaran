import {
  Cormorant_Garamond,
  Great_Vibes,
  Manrope,
  Noto_Serif_Devanagari,
  Tiro_Devanagari_Hindi,
} from "next/font/google";

/**
 * All fonts are self-hosted by next/font (no request to Google at runtime).
 * Fonts with `preload: false` are only downloaded by the browser when a page
 * actually uses them (e.g. Devanagari only loads for Hindi invites).
 */
export const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

export const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-great-vibes",
  display: "swap",
  preload: false,
});

export const tiroHindi = Tiro_Devanagari_Hindi({
  subsets: ["devanagari", "latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-tiro-hindi",
  display: "swap",
  preload: false,
});

export const notoDevanagari = Noto_Serif_Devanagari({
  subsets: ["devanagari"],
  variable: "--font-noto-devanagari",
  display: "swap",
  preload: false,
});

export const fontVariables = [
  manrope.variable,
  cormorant.variable,
  greatVibes.variable,
  tiroHindi.variable,
  notoDevanagari.variable,
].join(" ");
