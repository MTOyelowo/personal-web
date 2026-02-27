"use client";

import { FC } from "react";
import { BsCardImage } from "react-icons/bs";
import GalleryImage from "./gallery-image";

interface Props {
  images: { src: string }[];
  onSelect(src: string): void;
  uploading?: boolean;
  selectedImage: string;
}

const Gallery: FC<Props> = ({
  images,
  onSelect,
  uploading = false,
  selectedImage = "",
}) => {
  return (
    <div className="grid grid-cols-4 gap-2">
      {uploading && (
        <div className="aspect-square flex flex-col items-center justify-center bg-gray-100 text-gray-400 rounded-lg animate-pulse">
          <BsCardImage size={40} />
          <p className="text-xs mt-1">Uploading...</p>
        </div>
      )}
      {images.map(({ src }, index) => (
        <GalleryImage
          key={index}
          src={src}
          selected={selectedImage === src}
          onClick={() => onSelect(src)}
        />
      ))}
      {!uploading && images.length === 0 && (
        <div className="col-span-4 py-12 text-center text-gray-400 text-sm">
          No images yet. Upload one to get started.
        </div>
      )}
    </div>
  );
};

export default Gallery;
