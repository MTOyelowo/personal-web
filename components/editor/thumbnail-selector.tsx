"use client";

import { ChangeEventHandler, FC, useState } from "react";
import { FiImage } from "react-icons/fi";
import Image from "next/image";

interface Props {
  initialValue?: string;
  onChange(file: File): void;
}

const ThumbnailSelector: FC<Props> = ({ initialValue, onChange }) => {
  const [preview, setPreview] = useState(() => initialValue || "");

  const handleChange: ChangeEventHandler<HTMLInputElement> = ({ target }) => {
    const { files } = target;
    if (!files) return;
    const file = files[0];
    setPreview(URL.createObjectURL(file));
    onChange(file);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        Thumbnail
      </label>
      <input
        type="file"
        hidden
        accept="image/jpg, image/png, image/jpeg, image/webp"
        id="thumbnail-input"
        onChange={handleChange}
      />
      <label htmlFor="thumbnail-input" className="cursor-pointer block">
        {preview ? (
          <div className="relative w-48 aspect-video rounded-lg overflow-hidden border border-gray-200 hover:border-gray-400 transition-colors">
            <Image
              src={preview}
              fill
              sizes="192px"
              alt="Thumbnail preview"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center">
              <span className="text-white text-xs font-medium opacity-0 hover:opacity-100 transition-opacity">
                Change
              </span>
            </div>
          </div>
        ) : (
          <div className="w-48 aspect-video border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-gray-400 hover:text-gray-500 transition-colors">
            <FiImage size={24} />
            <span className="text-xs mt-1">Select thumbnail</span>
          </div>
        )}
      </label>
    </div>
  );
};

export default ThumbnailSelector;
