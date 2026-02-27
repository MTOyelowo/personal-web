"use client";

import { FC } from "react";
import Image from "next/image";
import CheckMark from "@/components/common/check-mark";

interface Props {
  src: string;
  selected?: boolean;
  onClick?(): void;
}

const GalleryImage: FC<Props> = ({ src, selected, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="relative rounded-lg overflow-hidden cursor-pointer group aspect-square"
    >
      <Image
        src={src}
        fill
        sizes="200px"
        alt="gallery"
        className="object-cover group-hover:scale-105 transition-transform duration-200"
      />
      <div className="absolute top-1.5 left-1.5">
        <CheckMark visible={selected || false} />
      </div>
    </div>
  );
};

export default GalleryImage;
