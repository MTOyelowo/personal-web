import { Editor } from "@tiptap/react";

export const getFocusedEditor = (editor: Editor) => {
  return editor.chain().focus();
};

export const validateUrl = (url: string): string => {
  if (!url.trim()) return "";
  let finalUrl = url.trim();
  if (!/^https?:\/\//i.test(finalUrl)) {
    finalUrl = "http://" + finalUrl;
  }
  return finalUrl;
};
