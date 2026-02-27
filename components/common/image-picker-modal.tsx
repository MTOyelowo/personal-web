"use client";

import {
  ChangeEventHandler,
  FC,
  useCallback,
  useEffect,
  useState,
} from "react";
import Image from "next/image";
import { AiOutlineCloudUpload } from "react-icons/ai";
import ModalContainer from "@/components/common/modal-container";
import Gallery from "@/components/editor/gallery/gallery";
import axios from "axios";

interface Props {
  visible: boolean;
  onClose(): void;
  onSelect(src: string): void;
}

const ImagePickerModal: FC<Props> = ({ visible, onClose, onSelect }) => {
  const [images, setImages] = useState<{ src: string }[]>([]);
  const [selectedImage, setSelectedImage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const fetchImages = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/images");
      if (data.success) setImages(data.data);
    } catch {
      // gallery will just be empty
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (visible && !loaded) {
      fetchImages();
    }
  }, [visible, loaded, fetchImages]);

  const handleClose = useCallback(() => {
    setSelectedImage("");
    onClose();
  }, [onClose]);

  const handleFileChange: ChangeEventHandler<HTMLInputElement> = async ({
    target,
  }) => {
    const { files } = target;
    if (!files) return;
    const file = files[0];
    if (!file.type.startsWith("image")) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const { data } = await axios.post("/api/images", formData);
      if (data.success) {
        setImages((prev) => [data.data, ...prev]);
        setSelectedImage(data.data.src);
      }
    } catch {
      // upload failed
    } finally {
      setUploading(false);
    }
    target.value = "";
  };

  const handleSelection = () => {
    if (!selectedImage) return handleClose();
    onSelect(selectedImage);
    handleClose();
  };

  return (
    <ModalContainer visible={visible} onClose={handleClose}>
      <div className="max-w-4xl w-full mx-4 bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">Select Image</h3>
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

          {/* Sidebar */}
          <div className="w-64 border-l border-gray-100 p-4 flex flex-col gap-3">
            <div>
              <input
                onChange={handleFileChange}
                hidden
                type="file"
                id="image-picker-input"
                accept="image/*"
              />
              <label htmlFor="image-picker-input">
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

                <button
                  onClick={handleSelection}
                  className="w-full px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  Use This Image
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </ModalContainer>
  );
};

export default ImagePickerModal;
