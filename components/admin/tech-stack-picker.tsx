"use client";

import { FC, useState, useRef, useEffect, useCallback, useMemo } from "react";
import { FiSearch, FiX, FiPlus } from "react-icons/fi";
import {
  searchTechOptions,
  getTechOption,
  type TechOption,
} from "@/lib/tech-options";

/* ── Types ────────────────────────────────────────────────── */

export interface TechEntry {
  label: string;
  icon: string; // key from tech-options or "" for custom
}

interface TechStackPickerProps {
  items: TechEntry[];
  onChange: (items: TechEntry[]) => void;
}

/* ── Component ────────────────────────────────────────────── */

const TechStackPicker: FC<TechStackPickerProps> = ({ items, onChange }) => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const results = useMemo(
    () =>
      searchTechOptions(query).filter(
        (opt) => !items.some((item) => item.icon === opt.key),
      ),
    [query, items],
  );

  const showCustomAdd =
    query.trim().length > 0 &&
    !results.some((r) => r.label.toLowerCase() === query.trim().toLowerCase());

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setHighlightIndex(0);
    setOpen(true);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const addOption = useCallback(
    (opt: TechOption) => {
      onChange([...items, { label: opt.label, icon: opt.key }]);
      setQuery("");
      setOpen(false);
      inputRef.current?.focus();
    },
    [items, onChange],
  );

  const addCustom = useCallback(() => {
    const label = query.trim();
    if (!label) return;
    if (items.some((item) => item.label.toLowerCase() === label.toLowerCase()))
      return;
    onChange([...items, { label, icon: "" }]);
    setQuery("");
    setOpen(false);
    inputRef.current?.focus();
  }, [items, onChange, query]);

  const removeItem = useCallback(
    (index: number) => {
      onChange(items.filter((_, i) => i !== index));
    },
    [items, onChange],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const total = results.length + (showCustomAdd ? 1 : 0);

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) => (prev + 1) % total);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) => (prev - 1 + total) % total);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightIndex < results.length) {
        addOption(results[highlightIndex]);
      } else if (showCustomAdd) {
        addCustom();
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Tech Stack
      </label>

      {/* Selected items */}
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {items.map((item, i) => {
            const opt = item.icon ? getTechOption(item.icon) : null;
            return (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-lg text-sm text-gray-700"
              >
                {opt && (
                  <opt.Icon size={14} className="text-gray-500 shrink-0" />
                )}
                {item.label}
                <button
                  onClick={() => removeItem(i)}
                  className="text-gray-400 hover:text-red-600 cursor-pointer ml-0.5"
                >
                  <FiX size={12} />
                </button>
              </span>
            );
          })}
        </div>
      )}

      {/* Search input */}
      <div className="relative">
        <div className="relative">
          <FiSearch
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search technologies..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
          />
        </div>

        {/* Dropdown */}
        {open && (results.length > 0 || showCustomAdd) && (
          <div
            ref={dropdownRef}
            className="absolute z-20 mt-1 w-full max-h-56 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg"
          >
            {results.slice(0, 30).map((opt, i) => (
              <button
                key={opt.key}
                onClick={() => addOption(opt)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors cursor-pointer ${
                  i === highlightIndex
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <opt.Icon size={16} className="text-gray-500 shrink-0" />
                <span>{opt.label}</span>
              </button>
            ))}

            {showCustomAdd && (
              <button
                onClick={addCustom}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors cursor-pointer border-t border-gray-100 ${
                  highlightIndex === results.length
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <FiPlus size={16} className="text-gray-400 shrink-0" />
                <span>
                  Add &quot;<strong>{query.trim()}</strong>&quot; as custom
                </span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TechStackPicker;
