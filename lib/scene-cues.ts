/**
 * The cue model for immersive scenes. A scene is a block of the story that
 * sets the page's colours, light, Painter stroke and ambient sound while it
 * is being read. Cues are stored as data attributes on the scene's
 * <section>, so every value is validated here when the HTML is parsed:
 * the reader writes them into inline styles.
 */

export const SOUND_LAYERS = [
  { id: "engine", label: "Taxi engine" },
  { id: "wind", label: "Wind" },
  { id: "rain", label: "Rain" },
  { id: "rumble", label: "Low rumble" },
  { id: "thunder", label: "Distant thunder" },
  { id: "room", label: "Room tone" },
  { id: "clinks", label: "Glass on glass" },
  { id: "okada", label: "Okada passing" },
  { id: "street", label: "Street air" },
  { id: "heart", label: "Heartbeat" },
  { id: "drone", label: "Drone" },
  { id: "crackle", label: "Fire" },
  { id: "pad", label: "Memory chord" },
  { id: "crickets", label: "Crickets" },
] as const;

export type SoundLayer = (typeof SOUND_LAYERS)[number]["id"];

export const SCENE_EFFECTS = [
  { id: "beam", label: "Light beam" },
  { id: "motes", label: "Dust motes" },
  { id: "pulse", label: "Strokes pulse" },
  { id: "silent", label: "Silence, on purpose" },
] as const;

export type SceneEffect = (typeof SCENE_EFFECTS)[number]["id"];

export interface SceneCue {
  /** Stable id for the scene, e.g. "taxi". */
  cue: string | null;
  /** Short name shown in the score, e.g. "The yellow taxi". */
  name: string | null;
  /** Time-of-day label, e.g. "Morning, Jos". */
  time: string | null;
  /** Page background colour. */
  bg: string | null;
  /** Text colour. */
  ink: string | null;
  /** Scene is set at night: the reader switches to its dark treatment. */
  dark: boolean;
  /** Up to three soft colours washed in from the page edges. */
  wash: string[];
  washOpacity: number | null;
  /** Colour this scene leaves on the Painter's canvas. Null leaves none. */
  stroke: string | null;
  /** How visible the accumulated canvas is during this scene. */
  canvasOpacity: number | null;
  /** Warm light rising from the bottom of the page, e.g. firelight. */
  glow: string | null;
  vignette: number | null;
  /** Heartbeat tempo, used when the heart layer is playing. */
  bpm: number | null;
  effects: SceneEffect[];
  /** Level of each ambient layer, 0 to 1. Missing layers are silent. */
  sound: Partial<Record<SoundLayer, number>>;
}

const HEX_REGEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;
const SOUND_IDS = new Set<string>(SOUND_LAYERS.map((l) => l.id));
const EFFECT_IDS = new Set<string>(SCENE_EFFECTS.map((e) => e.id));

export const BPM_MIN = 40;
export const BPM_MAX = 180;

export function parseHex(value: string | null | undefined): string | null {
  const v = value?.trim();
  return v && HEX_REGEX.test(v) ? v.toLowerCase() : null;
}

/** Expands #abc to #aabbcc, the only form <input type="color"> accepts. */
export function toLongHex(hex: string): string {
  return hex.length === 4
    ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
    : hex;
}

/** Lowercase letters, digits and hyphens, so a cue id is safe anywhere. */
export function toCueId(value: string | null | undefined): string | null {
  const v = (value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return v || null;
}

export function parseLabel(
  value: string | null | undefined,
  max = 80,
): string | null {
  const v = value?.replace(/\s+/g, " ").trim().slice(0, max);
  return v || null;
}

/** A level between 0 and 1, rounded to two places. */
export function parseLevel(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.round(Math.min(1, Math.max(0, n)) * 100) / 100;
}

export function parseBpm(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return null;
  const n = Math.round(Number(value));
  if (!Number.isFinite(n)) return null;
  return Math.min(BPM_MAX, Math.max(BPM_MIN, n));
}

export function parseWash(value: string | null | undefined): string[] {
  return (value ?? "")
    .split(/[\s,]+/)
    .map(parseHex)
    .filter((c): c is string => c !== null)
    .slice(0, 3);
}

export function parseEffects(value: string | null | undefined): SceneEffect[] {
  const ids = (value ?? "").split(/\s+/).filter((e) => EFFECT_IDS.has(e));
  return [...new Set(ids)] as SceneEffect[];
}

/** Parses "engine:0.55 wind:0.35" into levels, dropping unknown layers. */
export function parseSound(
  value: string | null | undefined,
): Partial<Record<SoundLayer, number>> {
  const sound: Partial<Record<SoundLayer, number>> = {};
  for (const pair of (value ?? "").split(/\s+/)) {
    const [id, level] = pair.split(":");
    const n = parseLevel(level);
    if (SOUND_IDS.has(id) && n !== null && n > 0) {
      sound[id as SoundLayer] = n;
    }
  }
  return sound;
}

export function serializeSound(
  sound: Partial<Record<SoundLayer, number>> | null | undefined,
): string | null {
  const pairs = SOUND_LAYERS.filter((l) => (sound?.[l.id] ?? 0) > 0).map(
    (l) => `${l.id}:${sound![l.id]}`,
  );
  return pairs.length ? pairs.join(" ") : null;
}
