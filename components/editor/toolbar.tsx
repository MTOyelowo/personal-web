"use client";

import { FC } from "react";
import { Editor } from "@tiptap/react";
import {
  BsTypeBold,
  BsTypeItalic,
  BsTypeUnderline,
  BsTypeStrikethrough,
  BsListOl,
  BsListUl,
  BsBlockquoteLeft,
  BsCode,
  BsCodeSquare,
} from "react-icons/bs";
import { RiSuperscript, RiSubscript } from "react-icons/ri";
import { getFocusedEditor } from "./editor-utils";
import ToolbarButton from "./toolbar-button";
import InsertLink from "./insert-link";
import EmbedYoutube from "./embed-youtube";
import { BsImageFill } from "react-icons/bs";
import { LinkOption } from "./link-form";

interface Props {
  editor: Editor | null;
  onOpenGallery?(): void;
}

const Divider = () => <div className="w-px h-6 bg-gray-200 mx-0.5 shrink-0" />;

const Toolbar: FC<Props> = ({ editor, onOpenGallery }) => {
  if (!editor) return null;

  const headingOptions = [
    { label: "Paragraph", value: 0 },
    { label: "Heading 1", value: 1 },
    { label: "Heading 2", value: 2 },
    { label: "Heading 3", value: 3 },
  ] as const;

  const getActiveHeading = (): number => {
    for (let i = 1; i <= 3; i++) {
      if (editor.isActive("heading", { level: i })) return i;
    }
    return 0;
  };

  const handleHeadingChange = (value: number) => {
    if (value === 0) {
      getFocusedEditor(editor).setParagraph().run();
    } else {
      getFocusedEditor(editor)
        .toggleHeading({ level: value as 1 | 2 | 3 })
        .run();
    }
  };

  const handleLinkSubmit = ({ url, openInNewTab }: LinkOption) => {
    const chain = getFocusedEditor(editor);
    if (openInNewTab) {
      chain.setLink({ href: url, target: "_blank" }).run();
    } else {
      chain.setLink({ href: url }).run();
    }
  };

  const handleYoutubeSubmit = (url: string) => {
    editor.commands.setYoutubeVideo({ src: url });
  };

  return (
    <div className="flex items-center flex-wrap gap-0.5 px-3 py-2 border-b border-gray-200 bg-gray-50">
      {/* Heading Dropdown */}
      <select
        value={getActiveHeading()}
        onChange={(e) => handleHeadingChange(Number(e.target.value))}
        className="text-sm border border-gray-200 rounded-md px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 mr-1 cursor-pointer"
      >
        {headingOptions.map(({ label, value }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      <Divider />

      {/* Text Formatting */}
      <ToolbarButton
        active={editor.isActive("bold")}
        onClick={() => getFocusedEditor(editor).toggleBold().run()}
        title="Bold"
      >
        <BsTypeBold />
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("italic")}
        onClick={() => getFocusedEditor(editor).toggleItalic().run()}
        title="Italic"
      >
        <BsTypeItalic />
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("underline")}
        onClick={() => getFocusedEditor(editor).toggleUnderline().run()}
        title="Underline"
      >
        <BsTypeUnderline />
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("strike")}
        onClick={() => getFocusedEditor(editor).toggleStrike().run()}
        title="Strikethrough"
      >
        <BsTypeStrikethrough />
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("superscript")}
        onClick={() => getFocusedEditor(editor).toggleSuperscript().run()}
        title="Superscript"
      >
        <RiSuperscript />
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("subscript")}
        onClick={() => getFocusedEditor(editor).toggleSubscript().run()}
        title="Subscript"
      >
        <RiSubscript />
      </ToolbarButton>

      <Divider />

      {/* Block Formatting */}
      <ToolbarButton
        active={editor.isActive("blockquote")}
        onClick={() => getFocusedEditor(editor).toggleBlockquote().run()}
        title="Blockquote"
      >
        <BsBlockquoteLeft />
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("code")}
        onClick={() => getFocusedEditor(editor).toggleCode().run()}
        title="Inline Code"
      >
        <BsCode />
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("codeBlock")}
        onClick={() => getFocusedEditor(editor).toggleCodeBlock().run()}
        title="Code Block"
      >
        <BsCodeSquare />
      </ToolbarButton>

      <Divider />

      {/* Links */}
      <InsertLink onSubmit={handleLinkSubmit} />

      {/* Lists */}
      <ToolbarButton
        active={editor.isActive("orderedList")}
        onClick={() => getFocusedEditor(editor).toggleOrderedList().run()}
        title="Ordered List"
      >
        <BsListOl />
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("bulletList")}
        onClick={() => getFocusedEditor(editor).toggleBulletList().run()}
        title="Bullet List"
      >
        <BsListUl />
      </ToolbarButton>

      <Divider />

      {/* Embeds */}
      <EmbedYoutube onSubmit={handleYoutubeSubmit} />
      <ToolbarButton onClick={onOpenGallery} title="Insert Image">
        <BsImageFill />
      </ToolbarButton>
    </div>
  );
};

export default Toolbar;
