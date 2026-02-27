"use client";

import { FiAlignLeft, FiAlignCenter, FiAlignRight } from "react-icons/fi";
import type { TextAlign } from "../types";
import type { FC, JSX } from "react";

interface Props {
  value: TextAlign;
  onChange: (alignment: TextAlign) => void;
}

const alignments: {
  value: TextAlign;
  icon: typeof FiAlignLeft;
  label: string;
}[] = [
  { value: "left", icon: FiAlignLeft, label: "Align left" },
  { value: "center", icon: FiAlignCenter, label: "Align center" },
  { value: "right", icon: FiAlignRight, label: "Align right" },
];

const AlignmentPicker: FC<Props> = ({ value, onChange }): JSX.Element => {
  return (
    <div className="flex items-center gap-1 rounded-lg bg-white/10 p-1">
      {alignments.map(({ value: align, icon: Icon, label }) => (
        <button
          key={align}
          onClick={() => onChange(align)}
          aria-label={label}
          className={`
            p-2 rounded-md transition-all duration-200 cursor-pointer
            ${
              value === align
                ? "bg-white/20 text-white"
                : "text-white/40 hover:text-white/70"
            }
          `}
        >
          <Icon className="w-4 h-4" />
        </button>
      ))}
    </div>
  );
};

export default AlignmentPicker;
