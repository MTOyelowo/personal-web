"use client";

import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { mapStory, type StoryMap } from "@/lib/reader/blocks";
import { SceneSound, describeSound } from "@/lib/reader/sound";
import { strokeStyle, washBackground } from "@/lib/reader/stage";
import { WEEKDAYS, type Weekday } from "@/lib/scene-cues";
import Motes from "./motes";
import Glosses from "./glosses";
import ScoreStrip from "./score-strip";
import "./immersive-reader.css";

interface Props {
  className?: string;
  /** Known on the server, so the prompt is part of the first paint. */
  hasScenes: boolean;
  children: ReactNode;
}

type Mode = "unset" | "immersive" | "plain";

/** Where the reader's eye is assumed to be: 40% down the screen. */
const READING_LINE = 0.4;
/** Scroll speed, in px per ms, above which scene changes wait. */
const SKIM_SPEED = 2.2;
/** How long a new scene must hold the reading line before it plays. */
const SETTLE_MS = 700;
const MODE_KEY = "reader-mode";

interface WashLayer {
  background: string;
  opacity: number;
}

function readStoredMode(): Mode | "sound" | null {
  try {
    const v = localStorage.getItem(MODE_KEY);
    return v === "immersive" || v === "sound" || v === "plain" ? v : null;
  } catch {
    return null;
  }
}

function storeMode(mode: Mode | "sound") {
  try {
    localStorage.setItem(MODE_KEY, mode);
  } catch {
    // Storage can be blocked; the reader just asks again next time
  }
}

/**
 * Plays a story's scenes as it is read: page colours, a soft wash of light,
 * the Painter's accumulating strokes, a vignette and ambient sound, all
 * driven by the scene under a reading line 40% down the screen. Also shows
 * the meanings of glossed terms. The story itself stays server-rendered;
 * this only reads its markup.
 */
export default function ImmersiveReader({
  className,
  hasScenes: hasScenesOnServer,
  children,
}: Props) {
  const storyRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const soundRef = useRef<SceneSound | null>(null);

  const [map, setMap] = useState<StoryMap | null>(null);
  const [mode, setMode] = useState<Mode>("unset");
  const [scene, setScene] = useState<number | null>(null);
  const [activeBlock, setActiveBlock] = useState<Element | null>(null);
  const [skimming, setSkimming] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const [soundError, setSoundError] = useState(false);
  const [volume, setVolume] = useState(0.6);
  const [showScore, setShowScore] = useState(true);
  const [painted, setPainted] = useState<number[]>([]);
  const [wash, setWash] = useState<[WashLayer, WashLayer]>([
    { background: "none", opacity: 0 },
    { background: "none", opacity: 0 },
  ]);
  const [pulseKey, setPulseKey] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  /** The reader's own weekday, known only in the browser. */
  const [today, setToday] = useState<Weekday | null>(null);

  const live = useRef({
    scene: null as number | null,
    pending: null as number | null,
    pendingAt: 0,
    velocity: 0,
    activeBlock: null as Element | null,
    front: 0,
  });

  const immersive = mode === "immersive";
  const scenes = map?.scenes ?? [];
  const cue = scene !== null ? (scenes[scene]?.cue ?? null) : null;
  const pulsed = pulseKey > 0;

  /* ---------- set up ---------- */

  useEffect(() => {
    if (!storyRef.current) return;
    const story = mapStory(storyRef.current);
    setMap(story);
    setReduceMotion(matchMedia("(prefers-reduced-motion: reduce)").matches);
    setToday(WEEKDAYS[new Date().getDay()]);
    if (!story.scenes.length) return;
    const stored = readStoredMode();
    if (stored) setMode(stored === "plain" ? "plain" : "immersive");
  }, []);

  useEffect(() => {
    return () => {
      soundRef.current?.destroy();
      soundRef.current = null;
    };
  }, []);

  /* ---------- scenes ---------- */

  const applyScene = useCallback(
    (index: number, withStage: boolean) => {
      const c = map?.scenes[index]?.cue;
      if (!c) return;
      live.current.scene = index;
      setScene(index);
      if (!withStage) return;
      const back = live.current.front === 0 ? 1 : 0;
      live.current.front = back;
      const onItsDay = c.day !== null && c.day === WEEKDAYS[new Date().getDay()];
      setWash((layers) => {
        const next: [WashLayer, WashLayer] = [{ ...layers[0] }, { ...layers[1] }];
        const opacity = c.washOpacity ?? 0.6;
        next[back] = {
          background: washBackground(c, onItsDay),
          // A scene set to silence keeps its stillness even on its day
          opacity: onItsDay && opacity > 0 ? Math.min(1, opacity + 0.12) : opacity,
        };
        next[back === 0 ? 1 : 0].opacity = 0;
        return next;
      });
      if (c.stroke) {
        setPainted((p) => (p.includes(index) ? p : [...p, index]));
      }
      if (c.effects.includes("pulse")) setPulseKey((k) => k + 1);
    },
    [map],
  );

  // Reading line: the block crossing 40% down the screen
  useEffect(() => {
    if (!map?.blocks.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          live.current.activeBlock = entry.target;
          setActiveBlock(entry.target);
          const s = map.sceneOf.get(entry.target);
          if (s === undefined || s === live.current.scene) {
            live.current.pending = null;
          } else if (s !== live.current.pending) {
            live.current.pending = s;
            live.current.pendingAt = performance.now();
          }
        }
      },
      { rootMargin: `-${READING_LINE * 100}% 0px -${99 - READING_LINE * 100}% 0px` },
    );
    map.blocks.forEach((b) => observer.observe(b));
    return () => observer.disconnect();
  }, [map]);

  // Skim detection, and settle into a new scene once reading slows
  useEffect(() => {
    if (!map?.scenes.length || mode === "unset") return;
    let lastY = scrollY;
    let lastT = performance.now();
    const onScroll = () => {
      const t = performance.now();
      const v = Math.abs(scrollY - lastY) / Math.max(1, t - lastT);
      live.current.velocity = live.current.velocity * 0.6 + v * 0.4;
      lastY = scrollY;
      lastT = t;
    };
    const timer = setInterval(() => {
      const l = live.current;
      l.velocity *= 0.75;
      const skim = l.velocity > SKIM_SPEED;
      setSkimming(skim);
      if (l.pending !== null && !skim && performance.now() - l.pendingAt > SETTLE_MS) {
        const next = l.pending;
        l.pending = null;
        applyScene(next, mode === "immersive");
      }
    }, 150);
    addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearInterval(timer);
      removeEventListener("scroll", onScroll);
    };
  }, [map, mode, applyScene]);

  // The site theme as it was before immersion took over
  const siteTheme = useRef<{ dark: boolean; light: boolean; scheme: string } | null>(null);

  const restoreSite = useCallback(() => {
    const root = document.documentElement;
    root.classList.remove("reader-bg", "reader-ink", "reader-dark");
    root.style.removeProperty("--scene-bg");
    root.style.removeProperty("--scene-ink");
    const theme = siteTheme.current;
    if (theme) {
      root.classList.toggle("dark", theme.dark);
      root.classList.toggle("light", theme.light);
      root.style.colorScheme = theme.scheme;
      siteTheme.current = null;
    }
  }, []);

  // Page colours: the scene's paper and ink replace the site's own colours
  useEffect(() => {
    const root = document.documentElement;
    if (!immersive || !cue) {
      restoreSite();
      return;
    }
    // Theme variants (logo, prose) follow the scene, not the site setting
    siteTheme.current ??= {
      dark: root.classList.contains("dark"),
      light: root.classList.contains("light"),
      scheme: root.style.colorScheme,
    };
    const body = getComputedStyle(document.body);
    const set = (name: string, cls: string, value: string | null, from: string) => {
      if (!value) {
        root.classList.remove(cls);
        return;
      }
      if (!root.classList.contains(cls)) {
        // Start from the site's current colour so the change fades in
        root.style.setProperty(name, from);
        root.classList.add(cls);
        getComputedStyle(root).getPropertyValue(name);
      }
      root.style.setProperty(name, value);
    };
    set("--scene-bg", "reader-bg", cue.bg, body.backgroundColor);
    set("--scene-ink", "reader-ink", cue.ink, body.color);
    root.classList.toggle("reader-dark", cue.dark);
    if (cue.bg) {
      root.classList.toggle("dark", cue.dark);
      root.classList.toggle("light", !cue.dark);
      root.style.colorScheme = cue.dark ? "dark" : "light";
    }
  }, [immersive, cue, restoreSite]);

  // Leaving the page hands the site its own colours and theme back
  useEffect(() => restoreSite, [restoreSite]);

  /* ---------- sound ---------- */

  useEffect(() => {
    soundRef.current?.setScene(immersive && cue ? cue.sound : {}, cue?.bpm ?? null);
  }, [immersive, cue]);

  const toggleSound = (on: boolean) => {
    if (on) {
      soundRef.current ??= new SceneSound();
      soundRef.current.setVolume(volume);
      if (!soundRef.current.start()) {
        setSoundError(true);
        return;
      }
      soundRef.current.setScene(immersive && cue ? cue.sound : {}, cue?.bpm ?? null);
    } else {
      soundRef.current?.stop();
    }
    setSoundError(false);
    setSoundOn(on);
  };

  /* ---------- controls ---------- */

  const start = (choice: Mode | "sound") => {
    storeMode(choice);
    const next: Mode = choice === "plain" ? "plain" : "immersive";
    setMode(next);
    const l = live.current;
    const first = (l.activeBlock && map?.sceneOf.get(l.activeBlock)) ?? 0;
    l.pending = null;
    applyScene(first, next === "immersive");
    if (choice === "sound") toggleSound(true);
  };

  // A stored choice starts the reader without the prompt
  useEffect(() => {
    if (mode !== "unset" && live.current.scene === null && map?.scenes.length) {
      const l = live.current;
      applyScene((l.activeBlock && map.sceneOf.get(l.activeBlock)) ?? 0, mode === "immersive");
    }
  }, [mode, map, applyScene]);

  const toggleImmersion = () => {
    const next: Mode = immersive ? "plain" : "immersive";
    storeMode(next);
    setMode(next);
    if (next === "immersive" && live.current.scene !== null) {
      applyScene(live.current.scene, true);
    }
  };

  /* ---------- render ---------- */

  const hasScenes = scenes.length > 0;
  const started = hasScenes && mode !== "unset";
  const showPrompt = (map ? hasScenes : hasScenesOnServer) && mode === "unset";
  const todayName = today ? today[0].toUpperCase() + today.slice(1) : null;
  const storyIsToday = !!today && scenes.some((s) => s.cue.day === today);
  const silent = cue?.effects.includes("silent") ?? false;
  const strokeOpacity = immersive
    ? Math.max(cue?.canvasOpacity ?? 0.2, pulsed ? 0.22 : 0)
    : 0;

  let status: string;
  if (!immersive) status = "Immersion off";
  else if (silent) status = "Silence, on purpose";
  else if (soundError) status = "Sound is not available in this browser";
  else if (soundOn) status = `Sound: ${(cue && describeSound(cue.sound)) || "quiet"}`;
  else status = "Sound off";
  if (skimming && started) status += " · holding while you skim";

  return (
    <div ref={wrapperRef} className="relative">
      {showPrompt && (
        <div
          data-nosnippet
          className="reader-prompt not-prose mb-10 rounded-xl border border-border bg-muted/40 p-5 font-space-grotesk">
          <p className="text-base text-foreground mb-1">
            This story is scored for reading.
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Colour, light and sound follow the scenes as you read, and each
            scene leaves a stroke of colour behind. Sound is generated in your
            browser and kept low. You can change anything later.
          </p>
          {storyIsToday && (
            <p className="text-sm text-foreground mb-4">
              Today is a {todayName}, like the day in this story.
            </p>
          )}
          <div className="flex flex-wrap gap-2 text-sm">
            <button
              type="button"
              onClick={() => start("sound")}
              className="px-4 py-2 rounded-full bg-foreground text-background font-medium cursor-pointer"
            >
              Read with sound
            </button>
            <button
              type="button"
              onClick={() => start("immersive")}
              className="px-4 py-2 rounded-full border border-border text-foreground cursor-pointer hover:bg-muted"
            >
              Read in silence
            </button>
            <button
              type="button"
              onClick={() => start("plain")}
              className="px-4 py-2 rounded-full text-muted-foreground underline underline-offset-4 cursor-pointer"
            >
              Plain text
            </button>
          </div>
        </div>
      )}

      <div ref={storyRef} className={`reader-story ${className ?? ""}`}>
        {children}
      </div>

      <Glosses storyRef={storyRef} wrapperRef={wrapperRef} activeBlock={activeBlock} />

      {hasScenes && (
        <div className="reader-layers" aria-hidden="true">
          {wash.map((layer, i) => (
            <div
              key={i}
              className="reader-layer reader-wash"
              style={{
                background: layer.background,
                opacity: immersive ? layer.opacity : 0,
              }}
            />
          ))}
          <div
            key={pulseKey}
            className="reader-layer reader-strokes"
            style={{ opacity: strokeOpacity }}
          >
            {painted.map((index, order) => (
              <div
                key={index}
                className={`reader-stroke${pulsed && !reduceMotion ? " pulse" : ""}`}
                style={{
                  ...strokeStyle(index, scenes[index].cue.stroke!),
                  animationDelay: pulsed ? `${(1 + order * 1.1).toFixed(1)}s` : undefined,
                }}
              />
            ))}
          </div>
          <div
            className="reader-layer reader-vignette"
            style={{ opacity: immersive ? (cue?.vignette ?? 0) : 0 }}
          />
          <Motes
            on={immersive && !reduceMotion && !!cue?.effects.includes("motes")}
          />
          <div className="reader-backdrop" style={{ opacity: immersive && cue?.bg ? 1 : 0 }} />
        </div>
      )}

      {started && map && showScore && (
        <ScoreStrip scenes={scenes} story={map.root} readingLine={READING_LINE} />
      )}

      {started && (
        <div className="reader-dock not-prose font-space-grotesk bg-background/85 text-foreground border border-border">
          {showScore && cue && scene !== null && (
            <div className="reader-dock-scene">
              <span className="text-muted-foreground">
                Scene {scene + 1} of {scenes.length} ·
              </span>{" "}
              {cue.name ?? cue.cue ?? "Untitled"}
              {cue.time && <span className="text-muted-foreground"> · {cue.time}</span>}
              {cue.day && cue.day === today && (
                <span className="text-muted-foreground"> · {todayName}, like today</span>
              )}
            </div>
          )}
          <div className="reader-dock-status text-muted-foreground" aria-live="polite">
            {status}
          </div>
          <div className="reader-dock-controls">
            <button type="button" aria-pressed={immersive} onClick={toggleImmersion}>
              Immersion
            </button>
            <button
              type="button"
              aria-pressed={soundOn}
              onClick={() => toggleSound(!soundOn)}
              disabled={!immersive}
            >
              Sound
            </button>
            {soundOn && (
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                aria-label="Volume"
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setVolume(v);
                  soundRef.current?.setVolume(v);
                }}
              />
            )}
            <button
              type="button"
              aria-pressed={showScore}
              onClick={() => setShowScore((s) => !s)}
            >
              Score
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
