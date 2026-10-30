"use client";

import { FC, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { viewerExtensions } from "./viewer-extensions";

interface Props {
  content: string;
  className?: string;
}

/**
 * Read-only TipTap viewer — renders HTML content safely without
 * dangerouslySetInnerHTML by using the same extensions as the editor.
 */
const RichTextViewer: FC<Props> = ({ content, className = "" }) => {
  const editor = useEditor({
    extensions: viewerExtensions,
    content,
    editable: false,
    editorProps: {
      attributes: {
        class: className,
      },
    },
    immediatelyRender: false,
  });

  // Sync content when the prop changes (useEditor only uses content for initial creation)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) return null;

  return <EditorContent editor={editor} />;
};

export default RichTextViewer;
