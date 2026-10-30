import type { SceneCue } from "@/lib/scene-cues";

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

/** Background for the wash layer: soft colour from three edges, plus beam and glow. */
export function washBackground(cue: SceneCue): string {
  const [a, b, c] = cue.wash;
  const parts: string[] = [];
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
