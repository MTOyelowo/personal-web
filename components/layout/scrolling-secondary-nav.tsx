"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useScrollDirection } from "@/hooks/common/useScrollDirection";

interface NavItem {
  label: string;
  href: string;
  type: "tag" | "post" | "category" | "collection";
}

const typeStyles: Record<NavItem["type"], string> = {
  tag: "text-blue-600 dark:text-blue-400",
  post: "text-foreground",
  category: "text-orange-600 dark:text-orange-400",
  collection: "text-purple-600 dark:text-purple-400",
};

export default function ScrollingSecondaryNav() {
  const pathname = usePathname();
  const { isVisible, isAtTop } = useScrollDirection({
    threshold: 10,
    hideDelay: 3000,
  });
  const { data: items } = useQuery<NavItem[]>({
    queryKey: ["nav-items"],
    queryFn: async () => {
      const res = await axios.get("/api/nav-items");
      return res.data.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const trackRef = useRef<HTMLDivElement>(null);

  // The marquee is a CSS animation, which replaced a per-frame JavaScript
  // loop that forced a layout every frame. Its duration keeps the old pace
  // of 30px a second whatever the width.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const observer = new ResizeObserver(() => {
      const seconds = Math.max(10, track.scrollWidth / 2 / 30);
      track.style.setProperty("--marquee-duration", `${seconds}s`);
    });
    observer.observe(track);
    return () => observer.disconnect();
  }, [items]);

  // Don't render on the about page — it has its own section nav
  if (pathname === "/about") return null;

  if (!items || items.length === 0) return null;

  const displayItems = [...items, ...items];

  return (
    <nav
      className={`sticky top-0 z-30 w-full overflow-hidden bg-muted/40 border-b border-border transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
      aria-label="Explore topics"
    >
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-linear-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-linear-to-l from-background to-transparent z-10 pointer-events-none" />

      <div className="nav-marquee overflow-x-hidden" style={{ scrollbarWidth: "none" }}>
        {/* Drifts only at the top of the page. While reading further down,
            a running animation made every scroll frame on phones stutter. */}
        <div
          ref={trackRef}
          className={`nav-marquee-track flex w-max items-center gap-4 px-6 py-2 whitespace-nowrap${isAtTop ? "" : " is-paused"}`}
        >
          {displayItems.map((item, index) => (
          <Link
            key={`${item.href}-${index}`}
            href={item.href}
            className={`
              shrink-0 text-xs font-medium
              px-3 py-1.5 rounded-full
              border border-border
              hover:bg-muted hover:scale-95
              transition-all duration-150
              ${typeStyles[item.type]}
            `}
          >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
