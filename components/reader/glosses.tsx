"use client";

import { RefObject, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { blockOf } from "@/lib/reader/blocks";
import { parseLabel } from "@/lib/scene-cues";

interface GlossInfo {
  el: HTMLElement;
  term: string;
  definition: string;
  block: Element | null;
}

interface Props {
  storyRef: RefObject<HTMLDivElement | null>;
  wrapperRef: RefObject<HTMLDivElement | null>;
  activeBlock: Element | null;
}

const WIDE_QUERY = "(min-width: 1320px)";

/**
 * Meanings for glossed terms: a margin column beside the story on wide
 * screens, and a sheet from the bottom of the screen everywhere else.
 */
export default function Glosses({ storyRef, wrapperRef, activeBlock }: Props) {
  const [glosses, setGlosses] = useState<GlossInfo[]>([]);
  const [open, setOpen] = useState<GlossInfo | null>(null);
  const [highlight, setHighlight] = useState<number | null>(null);
  const noteRefs = useRef<(HTMLDivElement | null)[]>([]);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Find the glossed terms and make them keyboard reachable
  useEffect(() => {
    const story = storyRef.current;
    if (!story) return;
    const found = Array.from(story.querySelectorAll<HTMLElement>("[data-gloss]"))
      .map((el, i) => {
        const definition = parseLabel(el.dataset.gloss, 500);
        if (!definition) return null;
        const term = parseLabel(el.dataset.glossTerm, 60) ?? el.textContent?.trim() ?? "";
        el.tabIndex = 0;
        el.setAttribute("role", "button");
        el.setAttribute("aria-describedby", `gloss-note-${i}`);
        el.dataset.glossIndex = String(i);
        return { el, term, definition, block: blockOf(el, story) };
      })
      .filter((g): g is GlossInfo => g !== null);
    setGlosses(found);
  }, [storyRef]);

  // Stack the margin notes beside their terms without overlapping
  const layout = useCallback(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper || !matchMedia(WIDE_QUERY).matches) return;
    const origin = wrapper.getBoundingClientRect().top;
    let last = -Infinity;
    glosses.forEach((g, i) => {
      const note = noteRefs.current[i];
      if (!note) return;
      const y = Math.max(g.el.getBoundingClientRect().top - origin - 3, last + 14);
      note.style.top = `${y}px`;
      last = y + note.offsetHeight;
    });
  }, [glosses, wrapperRef]);

  useLayoutEffect(() => {
    layout();
    const story = storyRef.current;
    const wrapper = wrapperRef.current;
    if (!story || !wrapper) return;
    // The wrapper changes size when the prompt above the story closes
    const observer = new ResizeObserver(layout);
    observer.observe(story);
    observer.observe(wrapper);
    addEventListener("resize", layout);
    document.fonts?.ready.then(layout);
    return () => {
      observer.disconnect();
      removeEventListener("resize", layout);
    };
  }, [layout, storyRef, wrapperRef]);

  // Open on click, Enter or Space
  useEffect(() => {
    const story = storyRef.current;
    if (!story || !glosses.length) return;
    let timer: ReturnType<typeof setTimeout>;
    const activate = (target: EventTarget | null) => {
      const el = (target as Element | null)?.closest<HTMLElement>("[data-gloss-index]");
      if (!el) return false;
      const index = Number(el.dataset.glossIndex);
      const gloss = glosses[index];
      if (!gloss) return false;
      if (matchMedia(WIDE_QUERY).matches) {
        setHighlight(index);
        clearTimeout(timer);
        timer = setTimeout(() => setHighlight(null), 2400);
      } else {
        setOpen(gloss);
      }
      return true;
    };
    const onClick = (e: MouseEvent) => {
      if (activate(e.target)) e.stopPropagation();
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "Enter" || e.key === " ") && activate(e.target)) e.preventDefault();
    };
    story.addEventListener("click", onClick);
    story.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(timer);
      story.removeEventListener("click", onClick);
      story.removeEventListener("keydown", onKey);
    };
  }, [glosses, storyRef]);

  // Close the sheet on Escape or a click elsewhere
  useEffect(() => {
    if (!open) return;
    sheetRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    const onClick = (e: MouseEvent) => {
      if (!sheetRef.current?.contains(e.target as Node)) setOpen(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, [open]);

  if (!glosses.length) return null;

  return (
    <>
      <div className="reader-notes" aria-hidden="true">
        {glosses.map((g, i) => (
          <div
            key={i}
            id={`gloss-note-${i}`}
            ref={(el) => {
              noteRefs.current[i] = el;
            }}
            className={`reader-note${g.block === activeBlock ? " on" : ""}${highlight === i ? " hl" : ""}`}
          >
            <b>{g.term}</b>
            {g.definition}
          </div>
        ))}
      </div>
      {open && (
        <div
          ref={sheetRef}
          role="dialog"
          aria-label={`Meaning of ${open.term}`}
          tabIndex={-1}
          className="reader-sheet bg-background text-foreground border border-border"
        >
          <b>{open.term}</b>
          {open.definition}
          <button
            type="button"
            onClick={() => {
              setOpen(null);
              open.el.focus();
            }}
            className="reader-sheet-close"
          >
            Close
          </button>
        </div>
      )}
    </>
  );
}
