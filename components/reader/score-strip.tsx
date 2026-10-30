"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { StoryScene } from "@/lib/reader/blocks";

interface Props {
  scenes: StoryScene[];
  story: HTMLElement;
  /** Fraction of the viewport height where the reading line sits. */
  readingLine: number;
}

interface Segment {
  top: number;
  height: number;
  background: string;
  silent: boolean;
  title: string;
}

const pct = (n: number) => `${n * 100}%`;

/** The whole score on the right edge: one segment per scene, click to jump. */
export default function ScoreStrip({ scenes, story, readingLine }: Props) {
  const [segments, setSegments] = useState<Segment[]>([]);
  const markerRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);

  const build = useCallback(() => {
    const H = document.documentElement.scrollHeight;
    const absTop = (el: Element) => el.getBoundingClientRect().top + scrollY;
    const end = absTop(story) + story.offsetHeight;
    const strokes: string[] = [];
    setSegments(
      scenes.map(({ el, cue }, i) => {
        const top = absTop(el);
        const bottom = i < scenes.length - 1 ? absTop(scenes[i + 1].el) : end;
        // A pulsing scene is the Painter at work: show every stroke so far
        const background =
          cue.effects.includes("pulse") && strokes.length > 1
            ? `linear-gradient(${strokes.join(",")})`
            : (cue.stroke ?? cue.wash[0] ?? "currentColor");
        if (cue.stroke) strokes.push(cue.stroke);
        return {
          top: top / H,
          height: Math.max(0.0035, (bottom - top) / H - 0.0015),
          background,
          silent: cue.effects.includes("silent"),
          title: cue.name ?? cue.cue ?? `Scene ${i + 1}`,
        };
      }),
    );
  }, [scenes, story]);

  useLayoutEffect(() => {
    // Fires once on observe, which does the first build
    const observer = new ResizeObserver(build);
    observer.observe(story);
    addEventListener("resize", build);
    return () => {
      observer.disconnect();
      removeEventListener("resize", build);
    };
  }, [build, story]);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const H = document.documentElement.scrollHeight;
      if (markerRef.current) {
        markerRef.current.style.top = pct((scrollY + innerHeight * readingLine) / H);
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("scroll", onScroll);
    };
  }, [readingLine]);

  const jump = (e: React.MouseEvent) => {
    const r = stripRef.current!.getBoundingClientRect();
    const f = (e.clientY - r.top) / r.height;
    const H = document.documentElement.scrollHeight;
    scrollTo({ top: Math.max(0, f * H - innerHeight * readingLine) });
  };

  return (
    <div
      ref={stripRef}
      className="reader-strip"
      onClick={jump}
      title="The score: click to jump"
      aria-hidden="true"
    >
      {segments.map((s, i) => (
        <div
          key={i}
          className={`reader-seg${s.silent ? " silent" : ""}`}
          title={s.title}
          style={{
            top: pct(s.top),
            height: pct(s.height),
            background: s.silent ? undefined : s.background,
          }}
        />
      ))}
      <div ref={markerRef} className="reader-marker" />
    </div>
  );
}
