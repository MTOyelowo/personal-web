"use client";

import { FC, JSX, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { FiArrowLeft, FiSave, FiImage, FiX } from "react-icons/fi";
import {
  useAdminCategories,
  useCreateCollection,
} from "@/hooks/query/useAdmin";
import ImagePickerModal from "@/components/common/image-picker-modal";
import toast from "react-hot-toast";

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();

const CreateCollectionPage: FC = (): JSX.Element => {
  const router = useRouter();
  const { data: categories } = useAdminCategories();
  const createMutation = useCreateCollection();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [showCoverPicker, setShowCoverPicker] = useState(false);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slug || slug === slugify(title)) {
      setSlug(slugify(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug || !categoryId) {
      toast.error("Title, slug, and category are required");
      return;
    }

    try {
      await createMutation.mutateAsync({
        title,
        slug,
        description: description || undefined,
        coverUrl: coverUrl || undefined,
        categoryId,
      });
      toast.success("Collection created!");
      router.push("/admin/collections");
    } catch {
      toast.error("Failed to create collection");
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link
          href="/admin/collections"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4"
        >
          <FiArrowLeft size={14} />
          Back to Collections
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Create Collection</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="e.g. Love Poems"
            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Slug <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="love-poems"
            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            <option value="">Select a category</option>
            {categories?.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A brief description of this collection"
            rows={3}
            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Cover Image
          </label>

          {coverUrl ? (
            <div className="relative w-full max-w-xs aspect-video rounded-lg overflow-hidden border border-gray-200 mb-2 group">
              <Image
                src={coverUrl}
                fill
                sizes="320px"
                alt="Cover preview"
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => setCoverUrl("")}
                className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <FiX size={14} />
              </button>
            </div>
          ) : null}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowCoverPicker(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <FiImage size={16} />
              {coverUrl ? "Change Image" : "Browse Gallery"}
            </button>
            <input
              type="url"
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              placeholder="or paste image URL..."
              className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>

          <ImagePickerModal
            visible={showCoverPicker}
            onClose={() => setShowCoverPicker(false)}
            onSelect={(src) => setCoverUrl(src)}
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors cursor-pointer"
          >
            <FiSave size={16} />
            {createMutation.isPending ? "Creating..." : "Create Collection"}
          </button>
          <Link
            href="/admin/collections"
            className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
};

export default CreateCollectionPage;
