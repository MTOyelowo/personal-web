"use client";

import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { mapStory, type StoryMap } from "@/lib/reader/blocks";
import { SceneSound, describeSound } from "@/lib/reader/sound";
import { strokeStyle, washBackground } from "@/lib/reader/stage";
import { WEEKDAYS, type Weekday } from "@/lib/scene-cues";
import { type ReadMode, setReadParam } from "@/lib/reader/read-mode";
import { FiSliders, FiX } from "react-icons/fi";
import Motes from "./motes";
import Glosses from "./glosses";
import ScoreStrip from "./score-strip";
import "./immersive-reader.css";

interface Props {
  className?: string;
  /** Known on the server, so the prompt is part of the first paint. */
  hasScenes: boolean;
  /** Reading mode from the link (?read=), which skips the prompt. */
  initialRead?: ReadMode | null;
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
const DOCK_KEY = "reader-dock-open";

function modeFromLink(read: ReadMode | null | undefined): Mode {
  if (read === "plain") return "plain";
  if (read === "sound" || read === "silence") return "immersive";
  return "unset";
}

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
  initialRead = null,
  children,
}: Props) {
  const storyRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const soundRef = useRef<SceneSound | null>(null);

  const [map, setMap] = useState<StoryMap | null>(null);
  // A mode from the link starts the reader without the prompt
  const [mode, setMode] = useState<Mode>(() => modeFromLink(initialRead));
  /** A ?read=sound link waits for one tap: browsers block sound until then. */
  const [soundInvite, setSoundInvite] = useState(initialRead === "sound");
  const [dockOpen, setDockOpen] = useState(false);
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
    try {
      setDockOpen(localStorage.getItem(DOCK_KEY) === "1");
    } catch {
      // Storage can be blocked; the dock just starts closed
    }
    if (!story.scenes.length) return;
    // The link's mode wins over the reader's remembered choice
    const stored = modeFromLink(initialRead) === "unset" ? readStoredMode() : null;
    if (stored) setMode(stored === "plain" ? "plain" : "immersive");
  }, [initialRead]);

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

  // Reading line: the block crossing 40% down the screen. Reading speed is
  // measured here too, from how far apart crossed blocks sit and how fast
  // they cross, so nothing reads the scroll position while scrolling (that
  // forced a layout on every scroll event and stuttered on phones).
  useEffect(() => {
    if (!map?.blocks.length) return;
    const tops = new Map<Element, number>();
    const measure = new ResizeObserver(() => {
      const offset = scrollY;
      for (const b of map.blocks) tops.set(b, b.getBoundingClientRect().top + offset);
    });
    measure.observe(map.root);
    let lastTop: number | null = null;
    let lastAt = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const top = tops.get(entry.target);
          const now = performance.now();
          if (top !== undefined && lastTop !== null) {
            const v = Math.abs(top - lastTop) / Math.max(16, now - lastAt);
            live.current.velocity = live.current.velocity * 0.6 + v * 0.4;
          }
          if (top !== undefined) {
            lastTop = top;
            lastAt = now;
          }
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
    return () => {
      observer.disconnect();
      measure.disconnect();
    };
  }, [map]);

  // Skim detection, and settle into a new scene once reading slows
  useEffect(() => {
    if (!map?.scenes.length || mode === "unset") return;
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
    return () => clearInterval(timer);
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

  /**
   * Scene colours change in one step, and a full-screen layer holding the
   * old paper fades out on top. Fading the colour variables themselves
   * restyled the whole page on every frame, which stuttered on phones.
   */
  const paperRef = useRef<HTMLDivElement>(null);
  const shownPaper = useRef<string | null>(null);
  const inkTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const fadeFromPaper = (color: string) => {
    const el = paperRef.current;
    if (!el) return;
    el.style.transition = "none";
    el.style.backgroundColor = color;
    el.style.opacity = "1";
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        el.style.transition = "";
        el.style.opacity = "0";
      }),
    );
  };

  // Page colours: the scene's paper and ink replace the site's own colours
  useEffect(() => {
    const root = document.documentElement;
    clearTimeout(inkTimer.current);
    if (!immersive || !cue) {
      restoreSite();
      shownPaper.current = null;
      return;
    }
    // Theme variants (logo, prose) follow the scene, not the site setting
    siteTheme.current ??= {
      dark: root.classList.contains("dark"),
      light: root.classList.contains("light"),
      scheme: root.style.colorScheme,
    };
    // Reading computed colours forces a restyle, so only on first takeover
    const previous =
      shownPaper.current ?? getComputedStyle(document.body).backgroundColor;
    const wasDark = root.classList.contains("reader-dark");

    if (cue.bg) {
      if (previous !== cue.bg) fadeFromPaper(previous);
      root.style.setProperty("--scene-bg", cue.bg);
      root.classList.add("reader-bg");
      shownPaper.current = cue.bg;
    } else {
      root.classList.remove("reader-bg");
      shownPaper.current = null;
    }

    const applyInk = () => {
      if (cue.ink) {
        root.style.setProperty("--scene-ink", cue.ink);
        root.classList.add("reader-ink");
      } else {
        root.classList.remove("reader-ink");
      }
      root.classList.toggle("reader-dark", cue.dark);
      if (cue.bg) {
        root.classList.toggle("dark", cue.dark);
        root.classList.toggle("light", !cue.dark);
        root.style.colorScheme = cue.dark ? "dark" : "light";
      }
    };
    // Between day and night, switch the ink halfway through the fade, so the
    // text stays readable against both the old and the new paper
    if (cue.bg && wasDark !== cue.dark && shownPaper.current) {
      inkTimer.current = setTimeout(applyInk, reduceMotion ? 250 : 1100);
    } else {
      applyInk();
    }
  }, [immersive, cue, restoreSite, reduceMotion]);

  // Leaving the page hands the site its own colours and theme back
  useEffect(
    () => () => {
      clearTimeout(inkTimer.current);
      restoreSite();
    },
    [restoreSite],
  );

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

  const acceptSoundInvite = () => {
    setSoundInvite(false);
    toggleSound(true);
  };

  const toggleDock = useCallback((open: boolean) => {
    setDockOpen(open);
    try {
      localStorage.setItem(DOCK_KEY, open ? "1" : "0");
    } catch {
      // Storage can be blocked; the choice lasts for this visit
    }
  }, []);

  // The address bar carries the current mode, so copying or sharing the link
  // opens the story the same way
  const linkMode: ReadMode | null =
    mode === "unset" ? null : !immersive ? "plain" : soundOn || soundInvite ? "sound" : "silence";
  useEffect(() => {
    if (linkMode && scenes.length) setReadParam(linkMode);
  }, [linkMode, scenes.length]);

  useEffect(() => {
    if (!dockOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") toggleDock(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [dockOpen, toggleDock]);

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
          <div ref={paperRef} className="reader-layer reader-paper" />
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

      {started && immersive && soundInvite && !soundOn && (
        <div className="reader-sound-invite not-prose font-space-grotesk bg-background text-foreground border border-border">
          <button type="button" onClick={acceptSoundInvite} className="reader-sound-invite-on">
            Turn on sound
          </button>
          <button
            type="button"
            onClick={() => setSoundInvite(false)}
            aria-label="Read without sound"
            className="reader-sound-invite-off"
          >
            <FiX />
          </button>
        </div>
      )}

      {started && !dockOpen && (
        <button
          type="button"
          onClick={() => toggleDock(true)}
          aria-expanded={false}
          aria-controls="reader-dock"
          title="Reading controls"
          className="reader-dock-toggle not-prose bg-background text-foreground border border-border"
        >
          <FiSliders aria-hidden="true" />
          <span className="sr-only">Reading controls</span>
        </button>
      )}

      {started && dockOpen && (
        <div
          id="reader-dock"
          role="region"
          aria-label="Reading controls"
          className="reader-dock not-prose font-space-grotesk bg-background/95 text-foreground border border-border"
        >
          <button
            type="button"
            onClick={() => toggleDock(false)}
            aria-label="Hide reading controls"
            className="reader-dock-close"
          >
            <FiX aria-hidden="true" />
          </button>
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
