"use client";

import { FC } from "react";
import { useWorkExperiences } from "@/hooks/query/useAbout";
import Spinner from "@/components/ui/spinner";

const WorkExperience: FC = () => {
  const { data: experiences, isLoading } = useWorkExperiences();

  if (isLoading) {
    return (
      <section className="flex items-center justify-center py-16">
        <Spinner size={28} />
      </section>
    );
  }

  if (!experiences || experiences.length === 0) {
    return null;
  }

  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground font-space-grotesk">
            Experience
          </h2>
          <div className="flex-1 h-px bg-border" />
        </div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-0 md:left-6 top-0 bottom-0 w-px bg-border" />

          <div className="space-y-12">
            {experiences.map((exp, i) => (
              <div key={i} className="relative pl-8 md:pl-16">
                {/* Timeline dot */}
                <div className="absolute left-0 md:left-6 top-1.5 -translate-x-1/2 w-3 h-3 rounded-full border-2 border-foreground bg-background" />

                {/* Date badge */}
                <div className="inline-block px-3 py-1 mb-3 text-xs font-medium rounded-full bg-muted text-muted-foreground font-space-grotesk">
                  {exp.dateRange}
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-foreground font-space-grotesk">
                  {exp.company}
                </h3>
                <p className="text-sm uppercase tracking-wider text-muted-foreground mt-1 mb-4 font-space-grotesk">
                  {exp.position}
                </p>

                <ul className="space-y-2">
                  {exp.descriptions.map((desc, j) => (
                    <li
                      key={j}
                      className="flex items-start gap-3 text-sm text-muted-foreground leading-relaxed font-space-grotesk"
                    >
                      <span className="mt-2 w-1 h-1 rounded-full bg-muted-foreground shrink-0" />
                      {desc}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WorkExperience;
