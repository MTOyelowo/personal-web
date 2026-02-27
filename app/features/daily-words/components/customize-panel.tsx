"use client";

import { useState } from "react";
import { FiSliders, FiX } from "react-icons/fi";
import type { TextAlign, ColorOption } from "../types";
import AlignmentPicker from "./alignment-picker";
import ColorPicker from "./color-picker";
import type { FC, JSX } from "react";

interface Props {
  textAlign: TextAlign;
  onTextAlignChange: (align: TextAlign) => void;
  quoteColor: string;
  onQuoteColorChange: (color: string) => void;
  authorColor: string;
  onAuthorColorChange: (color: string) => void;
  quoteColors: ColorOption[];
  authorColors: ColorOption[];
}

const CustomizePanel: FC<Props> = ({
  textAlign,
  onTextAlignChange,
  quoteColor,
  onQuoteColorChange,
  authorColor,
  onAuthorColorChange,
  quoteColors,
  authorColors,
}): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Close customization" : "Customize quote"}
        className="
          flex items-center gap-2 px-3 py-2 rounded-full
          bg-white/10 backdrop-blur-md text-white/80
          hover:bg-white/20 hover:text-white
          transition-all duration-200 cursor-pointer text-xs font-space-grotesk
        "
      >
        {isOpen ? (
          <FiX className="w-3.5 h-3.5" />
        ) : (
          <FiSliders className="w-3.5 h-3.5" />
        )}
        {isOpen ? "Close" : "Customize"}
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div
          className="
            absolute bottom-full mb-3 right-0
            w-[260px] p-4 rounded-xl
            bg-black/70 backdrop-blur-xl border border-white/10
            flex flex-col gap-4 shadow-2xl z-30
            animate-in fade-in slide-in-from-bottom-2 duration-200
          "
        >
          {/* Text alignment */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] uppercase tracking-widest text-white/50 font-space-grotesk">
              Text Alignment
            </span>
            <AlignmentPicker value={textAlign} onChange={onTextAlignChange} />
          </div>

          {/* Quote color */}
          <ColorPicker
            label="Quote Color"
            colors={quoteColors}
            activeValue={quoteColor}
            onSelect={onQuoteColorChange}
          />

          {/* Author color */}
          <ColorPicker
            label="Author Color"
            colors={authorColors}
            activeValue={authorColor}
            onSelect={onAuthorColorChange}
          />
        </div>
      )}
    </div>
  );
};

export default CustomizePanel;
