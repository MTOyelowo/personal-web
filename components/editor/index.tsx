"use client";

import { FC, useCallback, useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Youtube from "@tiptap/extension-youtube";
import Image from "@tiptap/extension-image";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import Toolbar from "./toolbar";
import EditLink from "./edit-link";
import GalleryModal, { ImageSelectionResult } from "./gallery/gallery-modal";
import axios from "axios";

interface Props {
  value?: string;
  onChange?(html: string): void;
  placeholder?: string;
}

const Editor: FC<Props> = ({
  value = "",
  onChange,
  placeholder = "Start writing...",
}) => {
  const [images, setImages] = useState<{ src: string }[]>([]);
  const [showGallery, setShowGallery] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Fetch all images from Vercel Blob on mount
  const fetchImages = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/images");
      if (data.success) setImages(data.data);
    } catch {
      // silently fail — gallery will just be empty
    }
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const { data } = await axios.post("/api/images", formData);
      if (data.success) {
        setImages((prev) => [data.data, ...prev]);
      }
    } catch {
      // upload failed — uploading indicator will clear
    } finally {
      setUploading(false);
    }
  };

  const handleImageSelection = (result: ImageSelectionResult) => {
    editor
      ?.chain()
      .focus()
      .setImage({ src: result.src, alt: result.altText })
      .run();
  };
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { HTMLAttributes: { class: "list-disc ml-4" } },
        orderedList: { HTMLAttributes: { class: "list-decimal ml-4" } },
        code: {
          HTMLAttributes: {
            class:
              "bg-gray-100 text-gray-800 rounded px-1.5 py-0.5 text-sm font-mono",
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
            class: "border-l-4 border-gray-300 pl-4 italic text-gray-600 my-3",
          },
        },
        heading: {
          HTMLAttributes: { class: "font-bold" },
        },
      }),
      Underline,
      Link.configure({
        autolink: false,
        linkOnPaste: false,
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline hover:text-blue-800",
        },
      }),
      Placeholder.configure({ placeholder }),
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
    content: value,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "tiptap-editor outline-none px-4 py-3 min-h-[400px] text-sm",
      },
    },
    immediatelyRender: false,
  });

  // Sync external value changes (e.g. when loading existing post data)
  useEffect(() => {
    if (editor && value && editor.getHTML() !== value) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      <Toolbar editor={editor} onOpenGallery={() => setShowGallery(true)} />
      <div className="relative">
        {editor && <EditLink editor={editor} />}
        <EditorContent editor={editor} />
      </div>
      <GalleryModal
        visible={showGallery}
        images={images}
        uploading={uploading}
        onClose={() => setShowGallery(false)}
        onFileSelect={handleImageUpload}
        onSelect={handleImageSelection}
      />
    </div>
  );
};

export default Editor;
