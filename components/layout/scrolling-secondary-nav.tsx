"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Link from "next/link";
import { useRef, useEffect } from "react";

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
  const { data: items } = useQuery<NavItem[]>({
    queryKey: ["nav-items"],
    queryFn: async () => {
      const res = await axios.get("/api/nav-items");
      return res.data.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const pausedRef = useRef(false);

  useEffect(() => {
    const step = () => {
      const el = scrollRef.current;
      if (el && !pausedRef.current) {
        el.scrollLeft += 0.5;
        const halfWidth = el.scrollWidth / 2;
        if (el.scrollLeft >= halfWidth) {
          el.scrollLeft -= halfWidth;
        }
      }
      animationRef.current = requestAnimationFrame(step);
    };

    animationRef.current = requestAnimationFrame(step);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  if (!items || items.length === 0) return null;

  const displayItems = [...items, ...items];

  return (
    <nav
      className="relative w-full overflow-hidden bg-muted/40 border-b border-border"
      aria-label="Explore topics"
      onMouseEnter={() => {
        pausedRef.current = true;
      }}
      onMouseLeave={() => {
        pausedRef.current = false;
      }}
    >
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-linear-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-linear-to-l from-background to-transparent z-10 pointer-events-none" />

      <div
        ref={scrollRef}
        className="flex items-center gap-4 px-6 py-2 overflow-x-hidden whitespace-nowrap"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
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
    </nav>
  );
}
