import type { PaletteEntry } from "./types";

// ── Design tokens (mirrors CSS variables in globals.css) ──────────────────────
export const T = {
  sand:           "var(--sand)",
  sandDark:       "var(--sand-dark)",
  terracotta:     "var(--terracotta)",
  terracottaDark: "var(--terracotta-dark)",
  olive:          "var(--olive)",
  sea:            "var(--sea)",
  seaLight:       "var(--sea-light)",
  ink:            "var(--ink)",
  inkLight:       "var(--ink-light)",
  mist:           "var(--mist)",
  white:          "var(--white)",
  cream:          "var(--cream)",
} as const;

// ── Freemium limits ───────────────────────────────────────────────────────────
export const LIMITS = {
  free: { exportsPerDay: 1, palettes: 1, watermark: true  },
  pro:  { exportsPerDay: Infinity, palettes: 4, watermark: false },
};

// ── Colour palettes ───────────────────────────────────────────────────────────
export const PALETTES: Record<string, PaletteEntry> = {
  terracotta: { primary: "#C4693A", bg: "#FAF7F2", name: "Terracotta" },
  sea:        { primary: "#2C5F6E", bg: "#F0F5F7", name: "Mediterranean Blue", proOnly: true },
  olive:      { primary: "#6B7A4A", bg: "#F5F7F0", name: "Olive Grove",        proOnly: true },
  noir:       { primary: "#1A1A18", bg: "#F5F0E8", name: "Ink & Sand",         proOnly: true },
};

// ── Nav route map ─────────────────────────────────────────────────────────────
export const NAV_LINKS = [
  { href: "/",                label: "Studio"       },
  { href: "/studio/qrmenu",  label: "QR Menu"      },
  { href: "/studio/social",  label: "Social Posts"  },
  { href: "/studio/airbnb",  label: "Welcome PDF"  },
  { href: "/studio/branding",label: "Branding"     },
] as const;

export const FOOTER_LINKS = NAV_LINKS.slice(1);
