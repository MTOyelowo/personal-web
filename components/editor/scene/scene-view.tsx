"use client";

import { FC, useState } from "react";
import {
  NodeViewContent,
  NodeViewWrapper,
  ReactNodeViewRenderer,
  type NodeViewProps,
} from "@tiptap/react";
import { BsFilm } from "react-icons/bs";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { Scene } from "../extensions/scene";
import type { SceneCue } from "@/lib/scene-cues";
import SceneCueForm from "./scene-cue-form";

const Swatch: FC<{ color: string | null; title: string }> = ({
  color,
  title,
}) =>
  color ? (
    <span
      title={`${title}: ${color}`}
      className="inline-block h-3 w-3 rounded-full border border-black/10"
      style={{ backgroundColor: color }}
    />
  ) : null;

/**
 * Editor view of a scene: a labelled frame tinted with the scene's paper and
 * ink, with a panel for editing its cues.
 */
const SceneView: FC<NodeViewProps> = ({
  node,
  editor,
  getPos,
  updateAttributes,
  selected,
}) => {
  const cue = node.attrs as SceneCue;
  const [open, setOpen] = useState(false);

  const removeScene = () => {
    const pos = getPos();
    if (typeof pos !== "number") return;
    editor
      .chain()
      .focus()
      .command(({ tr }) => {
        tr.replaceWith(pos, pos + node.nodeSize, node.content);
        return true;
      })
      .run();
  };

  return (
    <NodeViewWrapper
      as="section"
      className={`my-4 rounded-lg border border-dashed overflow-hidden ${
        selected ? "border-gray-900" : "border-gray-300"
      }`}
      style={{
        backgroundColor: cue.bg ?? undefined,
        color: cue.ink ?? undefined,
      }}
    >
      <div
        contentEditable={false}
        className="flex flex-wrap items-center gap-2 px-3 py-1.5 bg-gray-100 border-b border-gray-200 text-xs text-gray-600 font-sans select-none"
      >
        <BsFilm className="shrink-0" />
        <span className="font-semibold text-gray-900">
          {cue.name ?? cue.cue ?? "Untitled scene"}
        </span>
        {cue.time && <span>{cue.time}</span>}
        <span className="flex items-center gap-1">
          <Swatch color={cue.bg} title="Paper" />
          <Swatch color={cue.ink} title="Ink" />
          {cue.wash.map((c, i) => (
            <Swatch key={i} color={c} title={`Wash ${i + 1}`} />
          ))}
          {cue.stroke && (
            <span
              title={`Stroke: ${cue.stroke}`}
              className="inline-block h-1.5 w-6 rounded-full"
              style={{ backgroundColor: cue.stroke }}
            />
          )}
        </span>
        <span className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded hover:bg-gray-200 hover:text-gray-900 cursor-pointer"
          >
            Cues {open ? <FiChevronUp /> : <FiChevronDown />}
          </button>
          <button
            type="button"
            onClick={removeScene}
            title="Remove the scene and keep its text"
            className="px-2 py-0.5 rounded hover:bg-gray-200 hover:text-gray-900 cursor-pointer"
          >
            Remove scene
          </button>
        </span>
      </div>
      {open && (
        <div contentEditable={false} className="border-b border-gray-200">
          <SceneCueForm cue={cue} onChange={updateAttributes} />
        </div>
      )}
      <NodeViewContent className="px-3 py-1" />
    </NodeViewWrapper>
  );
};

/** The scene node with its editor view; the viewer uses the plain node. */
export const EditorScene = Scene.extend({
  addNodeView() {
    return ReactNodeViewRenderer(SceneView);
  },
});

export default SceneView;
