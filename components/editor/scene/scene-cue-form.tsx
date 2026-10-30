"use client";

import { FC, ReactNode } from "react";
import { FiX } from "react-icons/fi";
import {
  type SceneCue,
  type SceneEffect,
  BPM_MAX,
  BPM_MIN,
  SCENE_EFFECTS,
  SOUND_LAYERS,
  WEEKDAYS,
  lightPhase,
  parseBpm,
  parseDay,
  parseLabel,
  toCueId,
  toLongHex,
} from "@/lib/scene-cues";

interface Props {
  cue: SceneCue;
  onChange(attributes: Partial<SceneCue>): void;
}

const inputClass =
  "w-full text-sm border border-gray-200 rounded-md px-2 py-1 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900";

const Field: FC<{ label: string; children: ReactNode }> = ({
  label,
  children,
}) => (
  <label className="flex flex-col gap-1 text-xs text-gray-500">
    {label}
    {children}
  </label>
);

const ClearButton: FC<{ onClick(): void; label: string }> = ({
  onClick,
  label,
}) => (
  <button
    type="button"
    onClick={onClick}
    title={label}
    aria-label={label}
    className="p-1 rounded text-gray-400 hover:bg-gray-200 hover:text-gray-900 cursor-pointer"
  >
    <FiX size={12} />
  </button>
);

const ColorField: FC<{
  label: string;
  value: string | null;
  emptyLabel?: string;
  onChange(value: string | null): void;
}> = ({ label, value, emptyLabel = "Default", onChange }) => (
  <Field label={label}>
    <span className="flex items-center gap-1.5">
      <input
        type="color"
        value={toLongHex(value ?? "#ffffff")}
        onChange={(e) => onChange(e.target.value)}
        className={`h-7 w-9 shrink-0 cursor-pointer rounded border border-gray-200 bg-white ${value ? "" : "opacity-40"}`}
      />
      <span className="text-gray-700 font-mono">{value ?? emptyLabel}</span>
      {value && (
        <ClearButton onClick={() => onChange(null)} label={`Clear ${label}`} />
      )}
    </span>
  </Field>
);

const LevelField: FC<{
  label: string;
  value: number | null;
  onChange(value: number | null): void;
}> = ({ label, value, onChange }) => (
  <Field label={label}>
    <span className="flex items-center gap-1.5">
      <input
        type="range"
        min={0}
        max={1}
        step={0.05}
        value={value ?? 0}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`w-full accent-gray-900 ${value === null ? "opacity-40" : ""}`}
      />
      <span className="w-16 shrink-0 text-right text-gray-700 font-mono">
        {value === null ? "Default" : value.toFixed(2)}
      </span>
      {value !== null && (
        <ClearButton onClick={() => onChange(null)} label={`Reset ${label}`} />
      )}
    </span>
  </Field>
);

const Group: FC<{ title: string; children: ReactNode }> = ({
  title,
  children,
}) => (
  <fieldset className="border-t border-gray-200 pt-3">
    <legend className="pr-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
      {title}
    </legend>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {children}
    </div>
  </fieldset>
);

/** Edits every cue of one scene. Changes apply to the document immediately. */
const SceneCueForm: FC<Props> = ({ cue, onChange }) => {
  const wash: (string | null)[] = [0, 1, 2].map((i) => cue.wash[i] ?? null);

  const setWash = (index: number, color: string | null) => {
    const next = [...wash];
    next[index] = color;
    onChange({ wash: next.filter((c): c is string => c !== null) });
  };

  const toggleEffect = (effect: SceneEffect, on: boolean) => {
    const next = on
      ? [...cue.effects, effect]
      : cue.effects.filter((e) => e !== effect);
    onChange({ effects: next });
  };

  const setSound = (layer: keyof SceneCue["sound"], level: number) => {
    const next = { ...cue.sound };
    if (level > 0) next[layer] = level;
    else delete next[layer];
    onChange({ sound: next });
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-gray-50 text-gray-700 font-sans not-italic">
      <Group title="Scene">
        <Field label="Cue id">
          <input
            key={cue.cue}
            className={inputClass}
            defaultValue={cue.cue ?? ""}
            placeholder="taxi"
            onBlur={(e) => {
              const id = toCueId(e.target.value);
              e.target.value = id ?? "";
              onChange({ cue: id });
            }}
          />
        </Field>
        <Field label="Name in the score">
          <input
            className={inputClass}
            value={cue.name ?? ""}
            placeholder="The yellow taxi"
            maxLength={80}
            onChange={(e) => onChange({ name: parseLabel(e.target.value) })}
          />
        </Field>
        <Field label="Time of day">
          <input
            className={inputClass}
            value={cue.time ?? ""}
            placeholder="Morning, Jos"
            maxLength={40}
            onChange={(e) => onChange({ time: parseLabel(e.target.value, 40) })}
          />
          <span className="text-gray-400">
            {lightPhase(cue.time)
              ? `Light: ${lightPhase(cue.time)}`
              : "Words like morning, sunset or night also set the light"}
          </span>
        </Field>
        <Field label="Set on a weekday">
          <select
            className={inputClass}
            value={cue.day ?? ""}
            onChange={(e) => onChange({ day: parseDay(e.target.value) })}
          >
            <option value="">Any day</option>
            {WEEKDAYS.map((d) => (
              <option key={d} value={d}>
                {d[0].toUpperCase() + d.slice(1)}
              </option>
            ))}
          </select>
          <span className="text-gray-400">
            Read on that day, the scene is warmer
          </span>
        </Field>
      </Group>

      <Group title="Page">
        <ColorField
          label="Paper"
          value={cue.bg}
          onChange={(bg) => onChange({ bg })}
        />
        <ColorField
          label="Ink"
          value={cue.ink}
          onChange={(ink) => onChange({ ink })}
        />
        <label className="flex items-center gap-2 text-sm self-end pb-1">
          <input
            type="checkbox"
            checked={cue.dark}
            onChange={(e) => onChange({ dark: e.target.checked })}
            className="accent-gray-900"
          />
          Night scene (dark treatment)
        </label>
      </Group>

      <Group title="Light">
        {wash.map((color, i) => (
          <ColorField
            key={i}
            label={`Wash ${i + 1}`}
            value={color}
            emptyLabel="None"
            onChange={(c) => setWash(i, c)}
          />
        ))}
        <LevelField
          label="Wash opacity"
          value={cue.washOpacity}
          onChange={(washOpacity) => onChange({ washOpacity })}
        />
        <ColorField
          label="Glow from below"
          value={cue.glow}
          emptyLabel="None"
          onChange={(glow) => onChange({ glow })}
        />
        <LevelField
          label="Vignette"
          value={cue.vignette}
          onChange={(vignette) => onChange({ vignette })}
        />
      </Group>

      <Group title="Painter">
        <ColorField
          label="Stroke this scene leaves"
          value={cue.stroke}
          emptyLabel="None"
          onChange={(stroke) => onChange({ stroke })}
        />
        <LevelField
          label="Canvas opacity"
          value={cue.canvasOpacity}
          onChange={(canvasOpacity) => onChange({ canvasOpacity })}
        />
      </Group>

      <Group title="Effects">
        {SCENE_EFFECTS.map((effect) => (
          <label key={effect.id} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={cue.effects.includes(effect.id)}
              onChange={(e) => toggleEffect(effect.id, e.target.checked)}
              className="accent-gray-900"
            />
            {effect.label}
          </label>
        ))}
      </Group>

      <Group title="Sound">
        {SOUND_LAYERS.map((layer) => (
          <LevelField
            key={layer.id}
            label={layer.label}
            value={cue.sound[layer.id] ?? null}
            onChange={(level) => setSound(layer.id, level ?? 0)}
          />
        ))}
        <Field label={`Heartbeat tempo (${BPM_MIN} to ${BPM_MAX} bpm)`}>
          <input
            key={cue.bpm}
            type="number"
            min={BPM_MIN}
            max={BPM_MAX}
            className={inputClass}
            defaultValue={cue.bpm ?? ""}
            placeholder="80"
            onBlur={(e) => {
              const bpm = parseBpm(e.target.value);
              e.target.value = bpm === null ? "" : String(bpm);
              onChange({ bpm });
            }}
          />
        </Field>
      </Group>
    </div>
  );
};

export default SceneCueForm;
