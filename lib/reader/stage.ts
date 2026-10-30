import { type LightPhase, type SceneCue, lightPhase } from "@/lib/scene-cues";

/** Where the sun sits and the colour of its light, for each time of day. */
const SKY: Record<LightPhase, { at: string; color: string }> = {
  dawn: { at: "0% 35%", color: "rgba(255,200,180,.45)" },
  morning: { at: "8% 0%", color: "rgba(255,236,190,.45)" },
  midday: { at: "50% -10%", color: "rgba(255,250,232,.4)" },
  afternoon: { at: "92% 0%", color: "rgba(255,214,150,.4)" },
  evening: { at: "100% 30%", color: "rgba(250,180,120,.4)" },
  sunset: { at: "100% 72%", color: "rgba(240,140,90,.45)" },
  dusk: { at: "50% 110%", color: "rgba(150,120,180,.4)" },
  night: { at: "50% -20%", color: "rgba(70,90,140,.35)" },
};

/** Hex colour (already validated) to rgba(). */
export function rgba(hex: string, alpha: number): string {
  let h = hex.replace("#", "");
  if (h.length === 3) h = [...h].map((c) => c + c).join("");
  const n = parseInt(h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}

/** Small deterministic PRNG, so a scene's stroke lands in the same place on every visit. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Background for the wash layer: soft colour from three edges, light from
 * the time of day, and the beam and glow. `onItsDay` adds a warm light from
 * above when the reader is reading on the scene's own weekday.
 */
export function washBackground(cue: SceneCue, onItsDay = false): string {
  const [a, b, c] = cue.wash;
  const parts: string[] = [];
  if (onItsDay) {
    parts.push(
      "radial-gradient(75% 60% at 50% -5%, rgba(255,205,120,.5) 0%, rgba(255,205,120,0) 70%)",
    );
  }
  if (cue.glow) {
    parts.push(
      `radial-gradient(95% 55% at 50% 112%, ${rgba(cue.glow, 0.9)} 0%, ${rgba(cue.glow, 0)} 72%)`,
    );
  }
  if (cue.effects.includes("beam")) {
    parts.push(
      "linear-gradient(118deg, rgba(255,246,214,0) 14%, rgba(255,243,205,.75) 30%, rgba(255,246,214,0) 48%)",
    );
  }
  const phase = lightPhase(cue.time);
  if (phase) {
    const { at, color } = SKY[phase];
    parts.push(`radial-gradient(85% 70% at ${at}, ${color} 0%, rgba(0,0,0,0) 70%)`);
  }
  if (a) {
    parts.push(`radial-gradient(55% 48% at 6% 14%, ${rgba(a, 1)} 0%, ${rgba(a, 0)} 70%)`);
  }
  if (b) {
    parts.push(`radial-gradient(46% 52% at 96% 40%, ${rgba(b, 1)} 0%, ${rgba(b, 0)} 70%)`);
  }
  if (c) {
    parts.push(`radial-gradient(72% 46% at 28% 104%, ${rgba(c, 1)} 0%, ${rgba(c, 0)} 72%)`);
  }
  return parts.join(",") || "none";
}

/** Size, place and colour of the stroke a scene leaves, alternating sides. */
export function strokeStyle(index: number, color: string) {
  const r = seeded(index * 7919 + 31);
  const w = 24 + r() * 26;
  const h = 11 + r() * 14;
  const left = index % 2 === 0 ? -w * 0.35 + r() * 12 : 100 - w * 0.65 - r() * 12;
  const top = 3 + r() * 80;
  const rotate = ((r() - 0.5) * 44).toFixed(1);
  return {
    width: `${w}vw`,
    height: `${h}vh`,
    left: `${left}vw`,
    top: `${top}vh`,
    transform: `rotate(${rotate}deg)`,
    background: `radial-gradient(closest-side, ${rgba(color, 0.9)}, ${rgba(color, 0.5)} 50%, ${rgba(color, 0)} 100%)`,
  };
}
