"use client";

import { useEffect, useState } from "react";

const SECTIONS = [
  { id: "hero", label: "Intro" },
  { id: "about-info", label: "About" },
  { id: "social-links", label: "Socials" },
  { id: "work-experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "contact", label: "Contact" },
] as const;

export default function AboutSectionNav() {
  const [activeId, setActiveId] = useState<string>("hero");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the entry with the largest intersection ratio
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: [0, 0.25, 0.5] },
    );

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <nav
      className="sticky top-14 z-30 w-full bg-background/80 backdrop-blur-md border-b border-border"
      aria-label="About page sections"
    >
      <div className="max-w-4xl mx-auto flex items-center gap-1 px-4 py-2 overflow-x-auto scrollbar-hide">
        {SECTIONS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => scrollTo(id)}
            className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border transition-all duration-150 cursor-pointer ${
              activeId === id
                ? "bg-foreground text-background border-foreground"
                : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </nav>
  );
}
