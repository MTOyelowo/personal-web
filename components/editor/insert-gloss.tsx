"use client";

import { FC, useState } from "react";
import { Editor } from "@tiptap/react";
import { BsTranslate } from "react-icons/bs";
import ToolbarButton from "./toolbar-button";
import { getFocusedEditor } from "./editor-utils";
import { GLOSS_DEFINITION_MAX } from "./extensions/gloss";

interface Props {
  editor: Editor;
}

const inputClass =
  "w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent";

/** Toolbar control for adding, editing or removing a gloss on the selection. */
const InsertGloss: FC<Props> = ({ editor }) => {
  const [visible, setVisible] = useState(false);
  const [definition, setDefinition] = useState("");
  const [term, setTerm] = useState("");
  const active = editor.isActive("gloss");

  const showForm = () => {
    // Nothing to gloss without a selection or an existing gloss
    if (!editor.isActive("gloss") && editor.state.selection.empty) return;
    const attrs = editor.getAttributes("gloss");
    setDefinition(attrs.definition ?? "");
    setTerm(attrs.term ?? "");
    setVisible(true);
  };
  const hideForm = () => setVisible(false);

  const handleApply = () => {
    if (!definition.trim()) return hideForm();
    const chain = getFocusedEditor(editor);
    if (active) chain.extendMarkRange("gloss");
    chain.setGloss({ definition, term: term || null }).run();
    hideForm();
  };

  const handleRemove = () => {
    getFocusedEditor(editor).unsetGloss().run();
    hideForm();
  };

  return (
    <div
      onKeyDown={({ key }) => {
        if (key === "Escape") hideForm();
      }}
      className="relative"
    >
      <ToolbarButton
        active={active}
        onClick={visible ? hideForm : showForm}
        title="Gloss: add a meaning to the selected term"
      >
        <BsTranslate />
      </ToolbarButton>
      {visible && (
        <div className="absolute top-full mt-2 right-0 z-50 rounded-lg p-3 bg-white shadow-lg border border-gray-200 w-80 flex flex-col gap-2">
          <textarea
            className={`${inputClass} min-h-20`}
            placeholder="Meaning, e.g. Hausa: boy, child."
            autoFocus
            maxLength={GLOSS_DEFINITION_MAX}
            value={definition}
            onChange={({ target }) => setDefinition(target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleApply();
              }
            }}
          />
          <input
            type="text"
            className={inputClass}
            placeholder="Label (optional, defaults to the selected text)"
            maxLength={60}
            value={term}
            onChange={({ target }) => setTerm(target.value)}
          />
          <div className="flex items-center justify-end gap-2">
            {active && (
              <button
                type="button"
                onClick={handleRemove}
                className="px-3 py-1 rounded-md text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Remove
              </button>
            )}
            <button
              type="button"
              onClick={handleApply}
              className="px-3 py-1 bg-gray-900 text-white rounded-md text-xs font-medium hover:bg-gray-800 transition-colors cursor-pointer"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InsertGloss;
