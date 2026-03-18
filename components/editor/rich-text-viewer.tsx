"use client";

import { FC, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Youtube from "@tiptap/extension-youtube";
import Image from "@tiptap/extension-image";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";

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
    extensions: [
      StarterKit.configure({
        bulletList: { HTMLAttributes: { class: "list-disc ml-4" } },
        orderedList: { HTMLAttributes: { class: "list-decimal ml-4" } },
        code: {
          HTMLAttributes: {
            class:
              "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded px-1.5 py-0.5 text-sm font-mono",
          },
        },
        codeBlock: {
          HTMLAttributes: {
            class:
              "bg-gray-900 text-gray-100 rounded-lg p-4 text-sm font-mono my-3 overflow-x-auto",
          },
        },
        blockquote: {
          HTMLAttributes: {
            class:
              "border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic text-gray-600 dark:text-gray-400 my-3",
          },
        },
        heading: {
          HTMLAttributes: { class: "font-bold" },
        },
      }),
      Underline,
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          class:
            "text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300",
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
      Youtube.configure({
        HTMLAttributes: {
          class: "aspect-video w-full rounded-lg my-3",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "mx-auto rounded-lg my-3 max-w-full",
        },
      }),
      Superscript,
      Subscript,
    ],
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
