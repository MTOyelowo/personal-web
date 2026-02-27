"use client";

import { ChangeEventHandler, FC, useCallback, useState } from "react";
import Image from "next/image";
import { AiOutlineCloudUpload } from "react-icons/ai";
import ModalContainer, {
  ModalProps,
} from "@/components/common/modal-container";
import Gallery from "./gallery";

export interface ImageSelectionResult {
  src: string;
  altText: string;
}

interface Props extends ModalProps {
  images: { src: string }[];
  uploading?: boolean;
  onFileSelect(image: File): void;
  onSelect(result: ImageSelectionResult): void;
}

const GalleryModal: FC<Props> = ({
  visible,
  images,
  uploading,
  onClose,
  onFileSelect,
  onSelect,
}) => {
  const [selectedImage, setSelectedImage] = useState("");
  const [altText, setAltText] = useState("");

  const handleClose = useCallback(() => {
    setSelectedImage("");
    setAltText("");
    onClose?.();
  }, [onClose]);

  const handleOnImageChange: ChangeEventHandler<HTMLInputElement> = ({
    target,
  }) => {
    const { files } = target;
    if (!files) return;
    const file = files[0];
    if (!file.type.startsWith("image")) return;
    onFileSelect(file);
    // Reset the input so same file can be re-selected
    target.value = "";
  };

  const handleSelection = () => {
    if (!selectedImage) return handleClose();
    onSelect({ src: selectedImage, altText });
    handleClose();
  };

  return (
    <ModalContainer visible={visible} onClose={handleClose}>
      <div className="max-w-4xl w-full mx-4 bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">Image Gallery</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-lg leading-none cursor-pointer"
          >
            &times;
          </button>
        </div>

        <div className="flex">
          {/* Gallery grid */}
          <div className="flex-1 max-h-[450px] overflow-y-auto p-4">
            <Gallery
              images={images}
              onSelect={(src) => setSelectedImage(src)}
              uploading={uploading}
              selectedImage={selectedImage}
            />
          </div>

          {/* Sidebar: upload + selection */}
          <div className="w-64 border-l border-gray-100 p-4 flex flex-col gap-3">
            <div>
              <input
                onChange={handleOnImageChange}
                hidden
                type="file"
                id="gallery-image-input"
                accept="image/*"
              />
              <label htmlFor="gallery-image-input">
                <div className="w-full border-2 border-dashed border-gray-300 text-gray-500 flex items-center justify-center gap-2 px-3 py-2.5 cursor-pointer rounded-lg hover:border-gray-400 hover:text-gray-600 transition-colors">
                  <AiOutlineCloudUpload size={18} />
                  <span className="text-sm font-medium">Upload Image</span>
                </div>
              </label>
            </div>

            {selectedImage && (
              <>
                <div className="relative aspect-video bg-gray-50 rounded-lg overflow-hidden">
                  <Image
                    src={selectedImage}
                    fill
                    sizes="256px"
                    alt="Selected preview"
                    className="object-contain"
                  />
                </div>

                <textarea
                  placeholder="Alt text (optional)"
                  value={altText}
                  onChange={({ target }) => setAltText(target.value)}
                  className="w-full resize-none p-2.5 text-sm bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent h-20"
                />

                <button
                  onClick={handleSelection}
                  className="w-full px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  Select Image
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </ModalContainer>
  );
};

export default GalleryModal;
