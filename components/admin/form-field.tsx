"use client";

import type { FC } from "react";

const INPUT_CLASS =
  "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10";

/* ── Label ───────────────────────────────────────────────── */

const FieldLabel: FC<{ label: string; required?: boolean }> = ({
  label,
  required,
}) => (
  <label className="block text-sm font-medium text-gray-700 mb-1">
    {label}
    {required && "*"}
  </label>
);

/* ── Text Input ──────────────────────────────────────────── */

interface InputFieldProps {
  label: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const InputField: FC<InputFieldProps> = ({
  label,
  required,
  value,
  onChange,
  placeholder,
  className,
}) => (
  <div className={className}>
    <FieldLabel label={label} required={required} />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={INPUT_CLASS}
    />
  </div>
);

/* ── Number Input ────────────────────────────────────────── */

interface NumberFieldProps {
  label: string;
  required?: boolean;
  value: number;
  onChange: (value: number) => void;
  widthClass?: string;
}

export const NumberField: FC<NumberFieldProps> = ({
  label,
  required,
  value,
  onChange,
  widthClass = "w-24",
}) => (
  <div>
    <FieldLabel label={label} required={required} />
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className={`${widthClass} px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10`}
    />
  </div>
);

/* ── Textarea ────────────────────────────────────────────── */

interface TextareaFieldProps {
  label: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  mono?: boolean;
  hint?: string;
}

export const TextareaField: FC<TextareaFieldProps> = ({
  label,
  required,
  value,
  onChange,
  placeholder,
  rows = 4,
  mono,
  hint,
}) => (
  <div>
    <FieldLabel label={label} required={required} />
    {hint && <p className="text-xs text-gray-500 mb-2">{hint}</p>}
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={`${INPUT_CLASS} resize-none${mono ? " font-mono" : ""}`}
    />
  </div>
);

/* ── Select ──────────────────────────────────────────────── */

interface SelectFieldProps {
  label: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}

export const SelectField: FC<SelectFieldProps> = ({
  label,
  required,
  value,
  onChange,
  options,
}) => (
  <div>
    <FieldLabel label={label} required={required} />
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={INPUT_CLASS}
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);

/* ── Row helpers ─────────────────────────────────────────── */

export const FieldRow: FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
);
