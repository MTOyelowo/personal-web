"use client";

import { FC, JSX, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { FiArrowLeft, FiSave, FiEye } from "react-icons/fi";
import {
  useAdminCategories,
  useAdminCollections,
} from "@/hooks/query/useAdmin";
import Editor from "@/components/editor";
import ThumbnailSelector from "@/components/editor/thumbnail-selector";
import PostPreview from "@/components/editor/post-preview";
import Spinner from "@/components/ui/spinner";
import toast from "react-hot-toast";
import axios from "axios";

const EditPostPage: FC = (): JSX.Element => {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const { data: categories } = useAdminCategories();
  const { data: collections } = useAdminCollections();

  const [loading, setLoading] = useState(true);
  const [postId, setPostId] = useState("");
  const [title, setTitle] = useState("");
  const [postSlug, setPostSlug] = useState("");
  const [meta, setMeta] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [collectionId, setCollectionId] = useState("");
  const [originalCollectionId, setOriginalCollectionId] = useState("");
  const [originalCollectionItemId, setOriginalCollectionItemId] = useState("");
  const [tags, setTags] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [existingThumbnail, setExistingThumbnail] = useState("");
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axios.get(`/api/posts/${slug}`);
        if (res.data.success) {
          const post = res.data.data;
          setPostId(post.id);
          setTitle(post.title);
          setPostSlug(post.slug);
          setMeta(post.meta);
          setContent(post.content);
          setCategoryId(post.categoryId || "");
          setTags(post.tags?.join(", ") || "");
          setExistingThumbnail(post.thumbnailUrl || "");
          // Load existing collection membership
          if (post.collectionItems?.length > 0) {
            const ci = post.collectionItems[0];
            setCollectionId(ci.collectionId);
            setOriginalCollectionId(ci.collectionId);
            setOriginalCollectionItemId(ci.id);
          }
        }
      } catch {
        toast.error("Failed to load post");
        router.push("/admin/posts");
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !postSlug || !meta || !content || !categoryId) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSaving(true);
    try {
      // Upload new thumbnail if one was selected
      let thumbnail: { url: string; publicId: string } | undefined;
      if (thumbnailFile) {
        const formData = new FormData();
        formData.append("image", thumbnailFile);
        const uploadRes = await axios.post("/api/images", formData);
        if (uploadRes.data.success) {
          thumbnail = {
            url: uploadRes.data.data.src,
            publicId: uploadRes.data.data.publicId,
          };
        }
      }

      const res = await axios.patch(`/api/posts/${postId}`, {
        title,
        slug: postSlug,
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
        // Handle collection changes
        try {
          if (collectionId !== originalCollectionId) {
            // Remove from old collection if it existed
            if (originalCollectionId && originalCollectionItemId) {
              await axios.delete(
                `/api/collections/${originalCollectionId}/items?itemId=${originalCollectionItemId}`,
              );
            }
            // Add to new collection if one was selected
            if (collectionId) {
              await axios.post(`/api/collections/${collectionId}/items`, {
                postId,
              });
            }
          }
        } catch {
          toast.error("Post saved but collection update failed");
        }
        toast.success("Post updated!");
        router.push("/admin/posts");
      }
    } catch (err: unknown) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.error
          ? err.response.data.error
          : "Failed to update post";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size={28} />
      </div>
    );
  }

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
        <h1 className="text-2xl font-bold text-gray-900">Edit Post</h1>
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
            onChange={(e) => setTitle(e.target.value)}
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
            value={postSlug}
            onChange={(e) => setPostSlug(e.target.value)}
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
            placeholder="Comma-separated tags"
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
        <ThumbnailSelector
          initialValue={existingThumbnail}
          onChange={(file) => setThumbnailFile(file)}
        />

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
            {saving ? "Saving..." : "Save Changes"}
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
          thumbnailFile
            ? URL.createObjectURL(thumbnailFile)
            : existingThumbnail || undefined
        }
        onClose={() => setShowPreview(false)}
      />
    </div>
  );
};

export default EditPostPage;
