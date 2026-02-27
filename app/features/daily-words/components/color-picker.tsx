"use client";

import type { ColorOption } from "../types";
import type { FC, JSX } from "react";

interface Props {
  label: string;
  colors: ColorOption[];
  activeValue: string;
  onSelect: (value: string) => void;
}

const ColorPicker: FC<Props> = ({
  label,
  colors,
  activeValue,
  onSelect,
}): JSX.Element => {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[11px] uppercase tracking-widest text-white/50 font-space-grotesk">
        {label}
      </span>

      <div className="flex items-center gap-2">
        {colors.map((color) => {
          const isActive = color.value === activeValue;

          return (
            <button
              key={color.value}
              onClick={() => onSelect(color.value)}
              aria-label={`Set ${label.toLowerCase()} to ${color.name}`}
              title={color.name}
              className={`
                w-6 h-6 rounded-full border-2 transition-all duration-200 cursor-pointer
                ${
                  isActive
                    ? "border-white scale-110"
                    : "border-transparent hover:scale-110 hover:border-white/30"
                }
              `}
              style={{ backgroundColor: color.value }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ColorPicker;
