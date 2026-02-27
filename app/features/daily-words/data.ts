import type { ColorOption, GradientBackground } from "./types";

/**
 * Gradient backgrounds used as fallbacks when no images are available
 * for a daily word. Also available as extra choices alongside images.
 */
export const FALLBACK_GRADIENTS: GradientBackground[] = [
  {
    id: "grad-1",
    gradient: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
    label: "Deep Ocean",
  },
  {
    id: "grad-2",
    gradient: "linear-gradient(135deg, #232526, #414345)",
    label: "Charcoal",
  },
  {
    id: "grad-3",
    gradient: "linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)",
    label: "Midnight Blue",
  },
  {
    id: "grad-4",
    gradient: "linear-gradient(135deg, #2d1b69, #11998e)",
    label: "Aurora",
  },
  {
    id: "grad-5",
    gradient: "linear-gradient(135deg, #141e30, #243b55)",
    label: "Night Sky",
  },
  {
    id: "grad-6",
    gradient: "linear-gradient(135deg, #0d0d0d, #434343)",
    label: "Onyx",
  },
];

/**
 * Color options for quote text.
 */
export const quoteColors: ColorOption[] = [
  { name: "White", value: "#ffffff" },
  { name: "Cream", value: "#fef3c7" },
  { name: "Sky", value: "#bae6fd" },
  { name: "Mint", value: "#a7f3d0" },
  { name: "Lavender", value: "#c4b5fd" },
  { name: "Rose", value: "#fda4af" },
];

/**
 * Color options for author / source text.
 */
export const authorColors: ColorOption[] = [
  { name: "White 70%", value: "rgba(255,255,255,0.7)" },
  { name: "Cream", value: "#fde68a" },
  { name: "Sky", value: "#7dd3fc" },
  { name: "Mint", value: "#6ee7b7" },
  { name: "Lavender", value: "#a78bfa" },
  { name: "Rose", value: "#fb7185" },
];
