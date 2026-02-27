"use client";

import { FC, useState } from "react";
import { BsYoutube } from "react-icons/bs";
import ToolbarButton from "./toolbar-button";

interface Props {
  onSubmit(url: string): void;
}

const EmbedYoutube: FC<Props> = ({ onSubmit }) => {
  const [url, setUrl] = useState("");
  const [visible, setVisible] = useState(false);

  const handleSubmit = () => {
    if (!url.trim()) return hideForm();
    onSubmit(url);
    setUrl("");
    hideForm();
  };

  const hideForm = () => setVisible(false);
  const showForm = () => setVisible(true);

  return (
    <div
      onKeyDown={({ key }) => {
        if (key === "Escape") hideForm();
      }}
      className="relative"
    >
      <ToolbarButton
        onClick={visible ? hideForm : showForm}
        title="Embed YouTube"
      >
        <BsYoutube />
      </ToolbarButton>
      {visible && (
        <div className="absolute top-full mt-2 right-0 z-50">
          <div className="flex gap-2 bg-white rounded-lg shadow-lg border border-gray-200 p-3">
            <input
              type="text"
              className="rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent w-64"
              placeholder="https://youtube.com/watch?v=..."
              autoFocus
              value={url}
              onChange={({ target }) => setUrl(target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
            <button
              type="button"
              onClick={handleSubmit}
              className="px-3 py-2 bg-gray-900 text-white rounded-md text-xs font-medium hover:bg-gray-800 transition-colors cursor-pointer"
            >
              Embed
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmbedYoutube;
