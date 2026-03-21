export const MINERALS = {
  malachite: {
    hex: "#2D6A4F",
    dark: "#2D6A4F",
    light: "#52B788",
    label: "Malachite",
    category: "Etiquette & Presence",
  },
  lapis: {
    hex: "#1B4F8A",
    dark: "#1B4F8A",
    light: "#4A90D9",
    label: "Lapis Lazuli",
    category: "Strategic Communication",
  },
  tigersEye: {
    hex: "#8B5E0A",
    dark: "#8B5E0A",
    light: "#D4A017",
    label: "Tiger's Eye",
    category: "Financial Acumen",
  },
  amethyst: {
    hex: "#5B3F8A",
    dark: "#5B3F8A",
    light: "#9B72CF",
    label: "Amethyst",
    category: "Leadership & Influence",
  },
  obsidian: {
    hex: "#1C1C22",
    dark: "#1C1C22",
    light: "#6B6B7A",
    label: "Obsidian",
    category: "Executive Presence",
  },
  roseQuartz: {
    hex: "#8B4A5A",
    dark: "#8B4A5A",
    light: "#D4849A",
    label: "Rose Quartz",
    category: "Emotional Intelligence",
  },
} as const;

export const TOKENS = {
  void: "#000000",
  obsidian: "#09090b",
  onyx: "#111114",
  charcoal: "#1c1c22",
  graphite: "#2a2a33",
  mist: "rgba(255,255,255,0.06)",
  hairline: "rgba(255,255,255,0.08)",
  subtle: "rgba(255,255,255,0.18)",
  muted: "rgba(255,255,255,0.38)",
  body: "rgba(255,255,255,0.72)",
  bright: "rgba(255,255,255,0.92)",
} as const;

export type MineralKey = keyof typeof MINERALS;

// Hub StatusBar: Simplified 3-tier public badge.
// NOTE: The Account Page uses the detailed 6-mineral rank system (MINERALS above).
// These two systems coexist intentionally — do not conflate them.
export const MINERAL_GRADES = {
  quartz:  { label: 'Quartz',  color: '#C4B5A0', minXp: 0 },
  emerald: { label: 'Emerald', color: '#52B788', minXp: 1000 },
  diamond: { label: 'Diamond', color: '#B9D6F2', minXp: 5000 },
} as const;

export type MineralGradeKey = keyof typeof MINERAL_GRADES;
