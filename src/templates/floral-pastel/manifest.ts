import type { TemplateManifest } from "../types";

const dir = "/templates/floral-pastel";

export const floralPastelManifest: TemplateManifest = {
  id: "floral-pastel",
  name: "Floral Pastel",
  description: "A wax-sealed envelope opens to a soft blush card with falling petals and watercolour florals.",
  categories: ["wedding", "engagement", "birthday", "housewarming", "other"],
  tier: "basic",
  thumbnail: `${dir}/thumbnail.svg`,
  defaultPaletteId: "blush",
  palettes: [
    {
      id: "blush",
      name: "Blush",
      colors: {
        bg: "#fbf1ee",
        surface: "#fffaf8",
        primary: "#9c4a5a",
        accent: "#b89363",
        text: "#4a2e35",
        muted: "#8c7378",
        onPrimary: "#fffaf8",
      },
    },
    {
      id: "sage",
      name: "Sage",
      colors: {
        bg: "#eef2ea",
        surface: "#fbfcf8",
        primary: "#5d7458",
        accent: "#b3926a",
        text: "#33402f",
        muted: "#7a8774",
        onPrimary: "#fbfcf8",
      },
    },
    {
      id: "ivory-gold",
      name: "Ivory & Gold",
      colors: {
        bg: "#f8f2e6",
        surface: "#fffdf7",
        primary: "#8a6a2f",
        accent: "#c49b4f",
        text: "#3f3220",
        muted: "#8c7d64",
        onPrimary: "#fffdf7",
      },
    },
  ],
  features: ["gallery", "music", "multipleEvents", "rsvp", "countdown", "coverPhoto", "families"],
  assets: {
    paperTexture: `${dir}/paper-texture.svg`,
    envelopeBack: `${dir}/envelope-back.svg`,
    envelopeFront: `${dir}/envelope-front.svg`,
    envelopeFlap: `${dir}/envelope-flap.svg`,
    waxSeal: `${dir}/wax-seal.svg`,
    floralTopLeft: `${dir}/floral-top-left.svg`,
    floralTopRight: `${dir}/floral-top-right.svg`,
    leavesBack: `${dir}/leaves-back.svg`,
    floralBottom: `${dir}/floral-bottom.svg`,
    archFrame: `${dir}/arch-frame.svg`,
    divider: `${dir}/divider.svg`,
    petalA: `${dir}/petal-a.svg`,
    petalB: `${dir}/petal-b.svg`,
    sprig: `${dir}/sprig.svg`,
  },
};
