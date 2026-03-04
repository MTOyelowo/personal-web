"use client";

import { FC, JSX, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiArrowLeft, FiSave, FiEye } from "react-icons/fi";
import {
  useAdminCategories,
  useAdminCollections,
} from "@/hooks/query/useAdmin";
import Editor from "@/components/editor";
import ThumbnailSelector from "@/components/editor/thumbnail-selector";
import PostPreview from "@/components/editor/post-preview";
import toast from "react-hot-toast";
import axios from "axios";

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();

const CreatePostPage: FC = (): JSX.Element => {
  const router = useRouter();
  const { data: categories } = useAdminCategories();
  const { data: collections } = useAdminCollections();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [meta, setMeta] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [collectionId, setCollectionId] = useState("");
  const [tags, setTags] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    // Auto-generate slug from title if slug hasn't been manually edited
    if (!slug || slug === slugify(title)) {
      setSlug(slugify(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug || !meta || !content || !categoryId) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSaving(true);
    try {
      // Upload thumbnail to Vercel Blob if provided
      let thumbnail: { url: string; blobPath: string } | undefined;
      if (thumbnailFile) {
        const formData = new FormData();
        formData.append("image", thumbnailFile);
        const uploadRes = await axios.post("/api/images", formData);
        if (uploadRes.data.success) {
          thumbnail = {
            url: uploadRes.data.data.src,
            blobPath: uploadRes.data.data.blobPath,
          };
        }
      }

      const res = await axios.post("/api/posts", {
        title,
        slug,
        meta,
        content,
        categoryId,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        thumbnail,
      });

      if (res.data.success) {
        // Add post to collection if one was selected
        if (collectionId) {
          try {
            await axios.post(`/api/collections/${collectionId}/items`, {
              postId: res.data.data.id,
            });
          } catch {
            toast.error("Post created but failed to add to collection");
          }
        }
        toast.success("Post created!");
        router.push("/admin/posts");
      }
    } catch (err: unknown) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.error
          ? err.response.data.error
          : "Failed to create post";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <Link
          href="/admin/posts"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4"
        >
          <FiArrowLeft size={14} />
          Back to Posts
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Create Post</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Enter post title"
            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
        </div>

        {/* Slug */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Slug <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="post-url-slug"
            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
        </div>

        {/* Meta */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Meta / Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={meta}
            onChange={(e) => setMeta(e.target.value)}
            placeholder="Short description for SEO and previews"
            rows={2}
            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
          />
        </div>

        {/* Category */}
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

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Tags
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Comma-separated tags, e.g. love, nature, hope"
            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
        </div>

        {/* Collection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Collection
          </label>
          <select
            value={collectionId}
            onChange={(e) => setCollectionId(e.target.value)}
            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            <option value="">None</option>
            {collections?.map((col) => (
              <option key={col.id} value={col.id}>
                {col.title} ({col.category.name})
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-400 mt-1">
            Optionally add this post to a collection.
          </p>
        </div>

        {/* Thumbnail */}
        <ThumbnailSelector onChange={(file) => setThumbnailFile(file)} />

        {/* Content — Tiptap Rich Text Editor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Content <span className="text-red-500">*</span>
          </label>
          <Editor
            value={content}
            onChange={(html) => setContent(html)}
            placeholder="Write your post content..."
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors cursor-pointer"
          >
            <FiSave size={16} />
            {saving ? "Creating..." : "Create Post"}
          </button>
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <FiEye size={16} />
            Preview
          </button>
          <Link
            href="/admin/posts"
            className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>

      <PostPreview
        open={showPreview}
        title={title}
        meta={meta}
        content={content}
        category={categories?.find((c) => c.id === categoryId)?.name || ""}
        tags={tags}
        thumbnailUrl={
          thumbnailFile ? URL.createObjectURL(thumbnailFile) : undefined
        }
        onClose={() => setShowPreview(false)}
      />
    </div>
  );
};

export default CreatePostPage;
