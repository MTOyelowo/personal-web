"use client";

import Image from "next/image";
import type { QuoteBackground, GradientBackground } from "../types";
import type { FC, JSX } from "react";

interface Props {
  backgrounds: QuoteBackground[];
  gradients: GradientBackground[];
  activeId: string;
  onSelect: (id: string) => void;
}

const BackgroundPicker: FC<Props> = ({
  backgrounds,
  gradients,
  activeId,
  onSelect,
}): JSX.Element => {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 gap-2">
      {/* Image backgrounds */}
      {backgrounds.map((bg) => {
        const isActive = bg.id === activeId;

        return (
          <button
            key={bg.id}
            onClick={() => onSelect(bg.id)}
            aria-label={`Switch background: ${bg.alt}`}
            className={`
              relative aspect-square w-full rounded-lg overflow-hidden
              transition-all duration-300 cursor-pointer
              ${
                isActive
                  ? "ring-2 ring-white scale-[1.03]"
                  : "opacity-50 hover:opacity-90 hover:scale-[1.03]"
              }
            `}
          >
            <Image
              src={bg.src}
              alt={bg.alt}
              fill
              sizes="80px"
              className="object-cover"
            />
          </button>
        );
      })}

      {/* Gradient backgrounds */}
      {gradients.map((g) => {
        const isActive = g.id === activeId;

        return (
          <button
            key={g.id}
            onClick={() => onSelect(g.id)}
            aria-label={`Switch background: ${g.label}`}
            className={`
              relative aspect-square w-full rounded-lg overflow-hidden
              transition-all duration-300 cursor-pointer
              ${
                isActive
                  ? "ring-2 ring-white scale-[1.03]"
                  : "opacity-50 hover:opacity-90 hover:scale-[1.03]"
              }
            `}
          >
            <div
              className="absolute inset-0"
              style={{ background: g.gradient }}
            />
          </button>
        );
      })}
    </div>
  );
};

export default BackgroundPicker;
