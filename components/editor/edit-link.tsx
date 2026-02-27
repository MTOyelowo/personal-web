"use client";

import { FC, useCallback, useState } from "react";
import { BsBoxArrowUpRight, BsPencilSquare } from "react-icons/bs";
import { BiUnlink } from "react-icons/bi";
import { Editor, useEditorState } from "@tiptap/react";
import LinkForm, { LinkOption } from "./link-form";

interface Props {
  editor: Editor;
}

const EditLink: FC<Props> = ({ editor }) => {
  const [showEditForm, setShowEditForm] = useState(false);

  const { isLinkActive, linkHref } = useEditorState({
    editor,
    selector: (ctx) => ({
      isLinkActive: ctx.editor.isActive("link"),
      linkHref: ctx.editor.getAttributes("link").href as string | undefined,
    }),
  });

  const handleOnLinkOpenClick = useCallback(() => {
    const { href } = editor.getAttributes("link");
    if (href) window.open(href, "_blank");
  }, [editor]);

  const handleLinkEditClick = () => setShowEditForm(true);

  const handleUnlinkClick = () => {
    editor.commands.unsetLink();
    setShowEditForm(false);
  };

  const handleSubmit = ({ url, openInNewTab }: LinkOption) => {
    editor
      .chain()
      .focus()
      .unsetLink()
      .setLink({ href: url, target: openInNewTab ? "_blank" : "" })
      .run();
    setShowEditForm(false);
  };

  const getInitialState = useCallback((): LinkOption => {
    const { href, target } = editor.getAttributes("link");
    return { url: href || "", openInNewTab: !!target };
  }, [editor]);

  if (!isLinkActive) return null;

  return (
    <div className="flex items-center gap-1 px-3 py-1.5 border-b border-gray-200 bg-blue-50">
      <span className="text-xs text-blue-700 font-medium mr-1">Link:</span>
      <span className="text-xs text-blue-600 truncate max-w-48">
        {linkHref}
      </span>
      <div className="flex items-center gap-0.5 ml-auto">
        <button
          type="button"
          onClick={handleOnLinkOpenClick}
          className="p-1 rounded hover:bg-blue-100 text-blue-600 transition-colors cursor-pointer"
          title="Open link"
        >
          <BsBoxArrowUpRight size={12} />
        </button>
        <button
          type="button"
          onClick={handleLinkEditClick}
          className="p-1 rounded hover:bg-blue-100 text-blue-600 transition-colors cursor-pointer"
          title="Edit link"
        >
          <BsPencilSquare size={12} />
        </button>
        <button
          type="button"
          onClick={handleUnlinkClick}
          className="p-1 rounded hover:bg-blue-100 text-red-500 transition-colors cursor-pointer"
          title="Remove link"
        >
          <BiUnlink size={12} />
        </button>
      </div>
      {showEditForm && (
        <div className="absolute top-full left-0 mt-1 z-50">
          <LinkForm
            visible={showEditForm}
            onSubmit={handleSubmit}
            initialState={getInitialState()}
          />
        </div>
      )}
    </div>
  );
};

export default EditLink;
