"use client";

import { FC, useState } from "react";
import { BsImageFill } from "react-icons/bs";
import ToolbarButton from "./toolbar-button";

interface Props {
  onSubmit(data: { src: string; alt: string }): void;
}

const InsertImage: FC<Props> = ({ onSubmit }) => {
  const [src, setSrc] = useState("");
  const [alt, setAlt] = useState("");
  const [visible, setVisible] = useState(false);

  const handleSubmit = () => {
    if (!src.trim()) return hideForm();
    onSubmit({ src, alt });
    setSrc("");
    setAlt("");
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
        title="Insert Image"
      >
        <BsImageFill />
      </ToolbarButton>
      {visible && (
        <div className="absolute top-full mt-2 right-0 z-50">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 w-80 space-y-2">
            <input
              type="text"
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="Image URL"
              autoFocus
              value={src}
              onChange={({ target }) => setSrc(target.value)}
            />
            <input
              type="text"
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="Alt text (optional)"
              value={alt}
              onChange={({ target }) => setAlt(target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
            <div className="text-right">
              <button
                type="button"
                onClick={handleSubmit}
                className="px-3 py-1.5 bg-gray-900 text-white rounded-md text-xs font-medium hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Insert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InsertImage;
