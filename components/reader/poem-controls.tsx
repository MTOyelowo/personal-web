"use client";

import { useEffect, useState } from "react";
import { setReadParam } from "@/lib/reader/read-mode";
import "./poem.css";

const STILL_KEY = "poem-still";

interface Props {
  /** The link asked for still text (?read=still). */
  initialStill?: boolean;
}

/**
 * The "Still text" toggle for poem mode. The motion itself is pure CSS;
 * this only sets data-poem-still on <html>, remembered per browser, and
 * keeps ?read=still in the address bar so a shared link opens the same way.
 */
export default function PoemControls({ initialStill = false }: Props) {
  const [still, setStill] = useState(initialStill);

  useEffect(() => {
    if (initialStill) return;
    try {
      // Restoring a stored preference after hydration
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStill(localStorage.getItem(STILL_KEY) === "1");
    } catch {
      // Storage can be blocked; the poem just moves
    }
  }, [initialStill]);

  useEffect(() => {
    const root = document.documentElement;
    root.toggleAttribute("data-poem-still", still);
    setReadParam(still ? "still" : null);
    return () => root.removeAttribute("data-poem-still");
  }, [still]);

  const toggle = () => {
    const next = !still;
    setStill(next);
    try {
      localStorage.setItem(STILL_KEY, next ? "1" : "0");
    } catch {
      // Storage can be blocked; the choice lasts for this visit
    }
  };

  return (
    <div className="poem-controls not-prose flex justify-end mb-6 font-space-grotesk">
      <button
        type="button"
        aria-pressed={still}
        onClick={toggle}
        className="text-xs px-3 py-1 rounded-full border border-border text-muted-foreground hover:text-foreground cursor-pointer"
      >
        Still text
      </button>
    </div>
  );
}
