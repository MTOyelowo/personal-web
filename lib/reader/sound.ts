import { SOUND_LAYERS, type SoundLayer } from "@/lib/scene-cues";

/**
 * Ambient sound for immersive scenes, synthesised with the Web Audio API so
 * there are no files to load. Nothing is created until start() is called
 * from a user gesture.
 */

type Levels = Partial<Record<SoundLayer, number>>;

/** Loudness of each layer at level 1, balanced by ear. */
const BASE: Record<SoundLayer, number> = {
  engine: 0.9,
  wind: 0.7,
  rain: 0.6,
  rumble: 0.9,
  room: 0.6,
  street: 0.5,
  drone: 0.8,
  pad: 0.7,
  thunder: 0.9,
  clinks: 0.35,
  okada: 0.45,
  heart: 1,
  crackle: 0.35,
  crickets: 0.08,
};

/** Seconds between occasional events, [min, max]. */
const GAPS = {
  thunder: [14, 38],
  clinks: [1.2, 5],
  okada: [7, 18],
  crackle: [0.04, 0.22],
  crickets: [0.5, 1.3],
} as const;

type EventLayer = keyof typeof GAPS;

const LABELS = Object.fromEntries(
  SOUND_LAYERS.map((l) => [l.id, l.label.toLowerCase()]),
) as Record<SoundLayer, string>;

/** The loudest layers in a scene, e.g. "rain, wind, distant thunder". */
export function describeSound(levels: Levels): string {
  return (Object.keys(levels) as SoundLayer[])
    .filter((l) => (levels[l] ?? 0) >= 0.1)
    .sort((a, b) => (levels[b] ?? 0) - (levels[a] ?? 0))
    .slice(0, 3)
    .map((l) => LABELS[l])
    .join(", ");
}

export class SceneSound {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private buses = {} as Record<SoundLayer, GainNode>;
  private next: Partial<Record<EventLayer | "heart", number>> = {};
  private levels: Levels = {};
  private bpm = 80;
  private volume = 0.6;
  private on = false;
  private timer: ReturnType<typeof setInterval> | null = null;

  private readonly onVisibility = () => {
    if (!this.ctx) return;
    if (document.hidden) this.ctx.suspend();
    else if (this.on) this.ctx.resume();
  };

  /** Starts or resumes sound. Returns false when Web Audio is unavailable. */
  start(): boolean {
    try {
      if (!this.ctx) this.build();
      this.ctx!.resume();
      this.on = true;
      this.master!.gain.setTargetAtTime(this.volume, this.ctx!.currentTime, 0.4);
      return true;
    } catch (error) {
      console.warn("Scene sound unavailable", error);
      return false;
    }
  }

  stop() {
    if (!this.ctx || !this.master) return;
    this.on = false;
    this.master.gain.setTargetAtTime(0, this.ctx.currentTime, 0.3);
    setTimeout(() => {
      if (!this.on) this.ctx?.suspend();
    }, 1200);
  }

  setScene(levels: Levels, bpm: number | null) {
    this.levels = levels;
    this.bpm = bpm ?? 80;
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    for (const layer of Object.keys(this.buses) as SoundLayer[]) {
      this.buses[layer].gain.setTargetAtTime(
        (levels[layer] ?? 0) * BASE[layer],
        now,
        layer === "heart" ? 0.8 : 1.5,
      );
    }
  }

  setVolume(volume: number) {
    this.volume = volume;
    if (this.ctx && this.master && this.on) {
      this.master.gain.setTargetAtTime(volume, this.ctx.currentTime, 0.1);
    }
  }

  destroy() {
    if (this.timer) clearInterval(this.timer);
    document.removeEventListener("visibilitychange", this.onVisibility);
    this.ctx?.close();
    this.ctx = null;
  }

  /* ---------- graph ---------- */

  private gain(value = 0) {
    const g = this.ctx!.createGain();
    g.gain.value = value;
    return g;
  }

  private filter(type: BiquadFilterType, frequency: number, q?: number) {
    const f = this.ctx!.createBiquadFilter();
    f.type = type;
    f.frequency.value = frequency;
    if (q !== undefined) f.Q.value = q;
    return f;
  }

  private lfo(frequency: number, depth: number, param: AudioParam) {
    const o = this.ctx!.createOscillator();
    o.frequency.value = frequency;
    const g = this.gain(depth);
    o.connect(g);
    g.connect(param);
    o.start();
  }

  private noise() {
    const s = this.ctx!.createBufferSource();
    s.buffer = this.noiseBuffer;
    s.loop = true;
    s.start(0, Math.random() * 3);
    return s;
  }

  private chain(...nodes: AudioNode[]) {
    for (let i = 0; i < nodes.length - 1; i++) nodes[i].connect(nodes[i + 1]);
    return nodes[nodes.length - 1];
  }

  private bus(layer: SoundLayer) {
    const g = this.gain(0);
    g.connect(this.master!);
    this.buses[layer] = g;
    return g;
  }

  private build() {
    const AC =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new AC();
    this.ctx = ctx;
    this.master = this.gain(0);
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    this.master.connect(comp);
    comp.connect(ctx.destination);

    const len = ctx.sampleRate * 4;
    this.noiseBuffer = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = this.noiseBuffer.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;

    {
      const out = this.bus("engine");
      const lp = this.filter("lowpass", 170, 0.9);
      const g = this.gain(0.22);
      [46, 47.3].forEach((f, i) => {
        const o = ctx.createOscillator();
        o.type = "sawtooth";
        o.frequency.value = f;
        this.lfo(0.13 + i * 0.04, 2.2, o.frequency);
        o.connect(g);
        o.start();
      });
      this.chain(g, lp, out);
    }
    {
      const out = this.bus("wind");
      const bp = this.filter("bandpass", 460, 0.7);
      const g = this.gain(0.55);
      this.chain(this.noise(), bp, g, out);
      this.lfo(0.06, 260, bp.frequency);
      this.lfo(0.09, 0.25, g.gain);
    }
    {
      const out = this.bus("rain");
      const g1 = this.gain(0.32);
      const g2 = this.gain(0.45);
      this.chain(
        this.noise(),
        this.filter("highpass", 900),
        this.filter("lowpass", 7000),
        g1,
        out,
      );
      this.chain(this.noise(), this.filter("lowpass", 450), g2, out);
      this.lfo(0.05, 0.1, g1.gain);
    }
    this.chain(
      this.noise(),
      this.filter("lowpass", 100),
      this.gain(1.4),
      this.bus("rumble"),
    );
    this.chain(
      this.noise(),
      this.filter("lowpass", 320),
      this.gain(0.22),
      this.bus("room"),
    );
    {
      const out = this.bus("street");
      const g = this.gain(0.2);
      this.chain(this.noise(), this.filter("bandpass", 1100, 0.5), g, out);
      this.lfo(0.17, 0.07, g.gain);
    }
    {
      const out = this.bus("drone");
      const lp = this.filter("lowpass", 420);
      const voices: [number, number, OscillatorType][] = [
        [65.41, 0.22, "sine"],
        [65.95, 0.22, "sine"],
        [98, 0.07, "triangle"],
        [97.4, 0.07, "triangle"],
      ];
      for (const [f, a, type] of voices) {
        const o = ctx.createOscillator();
        o.type = type;
        o.frequency.value = f;
        const g = this.gain(a);
        o.connect(g);
        g.connect(lp);
        o.start();
      }
      this.chain(lp, out);
    }
    {
      const out = this.bus("pad");
      const lp = this.filter("lowpass", 1500);
      [196, 261.63, 329.63, 392, 493.88].forEach((f, i) => {
        const o = ctx.createOscillator();
        o.type = "sine";
        o.frequency.value = f;
        const g = this.gain(0.045);
        this.lfo(0.05 + i * 0.021, 0.03, g.gain);
        o.connect(g);
        g.connect(lp);
        o.start();
      });
      this.chain(lp, out);
    }
    (["thunder", "clinks", "okada", "heart", "crackle", "crickets"] as const).forEach(
      (layer) => this.bus(layer),
    );

    this.timer = setInterval(() => this.tick(), 120);
    document.addEventListener("visibilitychange", this.onVisibility);
    this.setScene(this.levels, this.bpm);
  }

  /* ---------- occasional events ---------- */

  private envelope(g: GainNode, t: number, attack: number, peak: number, decay: number) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
  }

  private play(layer: EventLayer, t: number, second = false) {
    const ctx = this.ctx!;
    const out = this.buses[layer];
    switch (layer) {
      case "thunder": {
        const s = ctx.createBufferSource();
        s.buffer = this.noiseBuffer;
        const lp = this.filter("lowpass", 300);
        lp.frequency.setValueAtTime(320, t);
        lp.frequency.exponentialRampToValueAtTime(80, t + 6);
        const g = this.gain(0);
        this.chain(s, lp, g, out);
        this.envelope(g, t, 1.2, 1, 5.5);
        s.start(t, Math.random() * 2);
        s.stop(t + 8);
        break;
      }
      case "clinks": {
        [1, 1.97].forEach((m, i) => {
          const o = ctx.createOscillator();
          o.frequency.value = (2700 + Math.random() * 700) * m;
          const g = this.gain(0);
          this.chain(o, g, out);
          this.envelope(g, t, 0.003, i ? 0.12 : 0.3, 0.45);
          o.start(t);
          o.stop(t + 0.6);
        });
        if (!second && Math.random() < 0.35) this.play("clinks", t + 0.13, true);
        break;
      }
      case "okada": {
        const dur = 3.6;
        const o = ctx.createOscillator();
        const o2 = ctx.createOscillator();
        const bp = this.filter("bandpass", 700, 1.2);
        const g = this.gain(0);
        const g2 = this.gain(0.25);
        o.type = "sawtooth";
        o.frequency.setValueAtTime(112, t);
        o.frequency.linearRampToValueAtTime(86, t + dur);
        o2.type = "square";
        o2.frequency.setValueAtTime(224, t);
        o2.frequency.linearRampToValueAtTime(172, t + dur);
        o.connect(bp);
        o2.connect(g2);
        g2.connect(bp);
        this.chain(bp, g, out);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.5, t + dur * 0.45);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.start(t);
        o2.start(t);
        o.stop(t + dur + 0.1);
        o2.stop(t + dur + 0.1);
        break;
      }
      case "crackle": {
        const s = ctx.createBufferSource();
        s.buffer = this.noiseBuffer;
        const g = this.gain(0);
        this.chain(s, this.filter("highpass", 1500 + Math.random() * 2500), g, out);
        this.envelope(g, t, 0.002, 0.2 + Math.random() * 0.8, 0.01 + Math.random() * 0.03);
        s.start(t, Math.random() * 3);
        s.stop(t + 0.07);
        break;
      }
      case "crickets": {
        const o = ctx.createOscillator();
        o.frequency.value = 4200 + Math.random() * 300;
        const g = this.gain(0);
        this.chain(o, g, out);
        g.gain.setValueAtTime(0, t);
        for (let i = 0; i < 3; i++) {
          const s = t + i * 0.055;
          g.gain.setValueAtTime(0, s);
          g.gain.linearRampToValueAtTime(0.6, s + 0.008);
          g.gain.linearRampToValueAtTime(0, s + 0.032);
        }
        o.start(t);
        o.stop(t + 0.22);
        break;
      }
    }
  }

  private thump(t: number, amp: number) {
    const o = this.ctx!.createOscillator();
    o.frequency.setValueAtTime(62, t);
    o.frequency.exponentialRampToValueAtTime(36, t + 0.14);
    const g = this.gain(0);
    this.chain(o, g, this.buses.heart);
    this.envelope(g, t, 0.008, amp, 0.2);
    o.start(t);
    o.stop(t + 0.3);
  }

  private tick() {
    const ctx = this.ctx;
    if (!ctx || ctx.state !== "running") return;
    const now = ctx.currentTime;
    const ahead = now + 0.4;
    for (const layer of Object.keys(GAPS) as EventLayer[]) {
      if ((this.levels[layer] ?? 0) < 0.02) {
        this.next[layer] = 0;
        continue;
      }
      const [min, max] = GAPS[layer];
      if (!this.next[layer]) this.next[layer] = now + 0.3 + Math.random() * Math.min(min, 4);
      while (this.next[layer]! < ahead) {
        this.play(layer, this.next[layer]!);
        this.next[layer]! += min + Math.random() * (max - min);
      }
    }
    if ((this.levels.heart ?? 0) >= 0.02) {
      const beat = 60 / this.bpm;
      if (!this.next.heart || this.next.heart < now) this.next.heart = now + 0.1;
      while (this.next.heart < ahead) {
        this.thump(this.next.heart, 0.9);
        this.thump(this.next.heart + Math.min(0.3, beat * 0.36), 0.55);
        this.next.heart += beat;
      }
    } else {
      this.next.heart = 0;
    }
  }
}
