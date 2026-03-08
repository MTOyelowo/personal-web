"use client";

import { useRef, useEffect, useState } from "react";
import { FiDownload } from "react-icons/fi";

const poemLines = [
  "I am like bamboo. I am like gold. I am like diamond",
  "I am like the rock underneath the waterfall",
  "I am a dreamer just like everyone else",
  "But I dream not for myself",
  "I dream for those around me",
  "For I know that in the realization of their dreams",
  "lies the realization of my dreams and a fulfilment of my potential",
  "And proudly, I am...",
  "A Nomad of Dreams",
];

const skills = [
  {
    label: "Frontend Engineering",
    items: ["JavaScript", "TypeScript", "React", "React Native", "Next.js"],
  },
  { label: "Backend Engineering", items: ["Node.js", "GoLang"] },
  {
    label: "Writing",
    items: ["Poetry", "Short Stories", "Plays", "Articles", "Content Writing"],
  },
  { label: "Fashion Design", items: ["African Male Wears"] },
];

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [focusedLines, setFocusedLines] = useState<number[]>([]);
  const [expandedSkill, setExpandedSkill] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const lines =
        containerRef.current.querySelectorAll<HTMLSpanElement>(".poem-line");
      const vh = window.innerHeight;
      const start = vh * 0.3;
      const end = vh * 0.7;
      const focused: number[] = [];
      lines.forEach((line, i) => {
        const rect = line.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        if (center >= start && center <= end) focused.push(i);
      });
      setFocusedLines(focused);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-purple-500/5 blur-3xl" />
      <div className="absolute top-40 -right-32 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl" />
      <div className="absolute bottom-20 left-1/3 w-64 h-64 rounded-full bg-indigo-500/5 blur-3xl" />

      <div className="max-w-5xl mx-auto px-4 pt-16 pb-8">
        {/* Name */}
        <div className="flex flex-col items-center">
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground font-space-grotesk">
            Mayowa Taofeeq
          </p>
          <h1 className="text-7xl sm:text-8xl md:text-9xl font-bold tracking-tight text-foreground font-space-grotesk mt-2">
            OYELOWO
          </h1>
        </div>

        {/* Bio + Skills */}
        <div className="mt-12 flex flex-col md:flex-row gap-10 md:gap-16 items-start">
          {/* Bio */}
          <div className="md:w-1/2">
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed font-space-grotesk">
              A Nomad of Dreams, seeking to bring about positive change through
              Software, Writing, and Fashion.
            </p>
            <a
              href="/cv/mayowa-taofeeq-oyelowo-resume.pdf"
              download
              className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-full border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors font-space-grotesk"
            >
              <FiDownload className="w-4 h-4" />
              Download CV
            </a>
          </div>

          {/* Skills */}
          <div className="md:w-1/2">
            <div className="space-y-1">
              {skills.map((skill, i) => (
                <div key={i} className="border-b border-border">
                  <button
                    onClick={() =>
                      setExpandedSkill(expandedSkill === i ? null : i)
                    }
                    className="w-full flex items-center justify-between py-3 text-left group"
                  >
                    <span className="text-sm font-medium text-foreground font-space-grotesk group-hover:text-muted-foreground transition-colors">
                      {skill.label}
                    </span>
                    <span
                      className={`text-xs text-muted-foreground transition-transform duration-200 ${
                        expandedSkill === i ? "rotate-180" : ""
                      }`}
                    >
                      ▼
                    </span>
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      expandedSkill === i ? "max-h-40 pb-3" : "max-h-0"
                    }`}
                  >
                    <div className="flex flex-wrap gap-2">
                      {skill.items.map((item, j) => (
                        <span
                          key={j}
                          className="px-3 py-1 text-xs rounded-full bg-muted text-muted-foreground font-space-grotesk"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Poem */}
        <div ref={containerRef} className="mt-20 mb-8">
          <p className="text-center text-xl md:text-2xl leading-loose font-space-grotesk">
            {poemLines.map((line, i) => (
              <span
                key={i}
                className={`poem-line block transition-colors duration-500 ${
                  focusedLines.includes(i)
                    ? "text-foreground"
                    : "text-muted-foreground/30"
                }`}
              >
                {line}
              </span>
            ))}
          </p>
        </div>
      </div>
    </section>
  );
}
