"use client";

import { FC, JSX, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  FiArrowLeft,
  FiSave,
  FiTrash2,
  FiPlus,
  FiArrowUp,
  FiArrowDown,
  FiImage,
  FiX as FiXIcon,
} from "react-icons/fi";
import {
  useAdminCategories,
  useUpdateCollection,
} from "@/hooks/query/useAdmin";
import Spinner from "@/components/ui/spinner";
import ConfirmDialog from "@/components/admin/confirm-dialog";
import ImagePickerModal from "@/components/common/image-picker-modal";
import Image from "next/image";
import toast from "react-hot-toast";
import axios from "axios";

interface CollectionItem {
  id: string;
  order: number;
  post: {
    id: string;
    title: string;
    slug: string;
  };
}

const EditCollectionPage: FC = (): JSX.Element => {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { data: categories } = useAdminCategories();
  const updateMutation = useUpdateCollection();

  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [items, setItems] = useState<CollectionItem[]>([]);
  const [removeTarget, setRemoveTarget] = useState<CollectionItem | null>(null);
  const [showCoverPicker, setShowCoverPicker] = useState(false);

  // Post search for adding to collection
  const [postSearch, setPostSearch] = useState("");
  const [postResults, setPostResults] = useState<
    Array<{ id: string; title: string; slug: string }>
  >([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const fetchCollection = async () => {
      try {
        const res = await axios.get(`/api/collections/${id}`);
        if (res.data.success) {
          const col = res.data.data;
          setTitle(col.title);
          setSlug(col.slug);
          setDescription(col.description || "");
          setCoverUrl(col.coverUrl || "");
          setCategoryId(col.categoryId);
          setItems(
            col.items?.sort(
              (a: CollectionItem, b: CollectionItem) => a.order - b.order,
            ) || [],
          );
        }
      } catch {
        toast.error("Failed to load collection");
        router.push("/admin/collections");
      } finally {
        setLoading(false);
      }
    };
    fetchCollection();
  }, [id, router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug || !categoryId) {
      toast.error("Title, slug, and category are required");
      return;
    }
    try {
      await updateMutation.mutateAsync({
        id,
        title,
        slug,
        description: description || undefined,
        coverUrl: coverUrl || undefined,
        categoryId,
      });
      toast.success("Collection updated!");
    } catch {
      toast.error("Failed to update collection");
    }
  };

  const searchPosts = async () => {
    if (!postSearch.trim()) return;
    setSearching(true);
    try {
      const res = await axios.get(
        `/api/posts?search=${encodeURIComponent(postSearch)}&limit=10`,
      );
      if (res.data.success) {
        const existingPostIds = new Set(items.map((item) => item.post.id));
        setPostResults(
          res.data.data.posts
            .filter((p: { id: string }) => !existingPostIds.has(p.id))
            .map((p: { id: string; title: string; slug: string }) => ({
              id: p.id,
              title: p.title,
              slug: p.slug,
            })),
        );
      }
    } catch {
      toast.error("Search failed");
    } finally {
      setSearching(false);
    }
  };

  const addPostToCollection = async (postId: string) => {
    try {
      const res = await axios.post(`/api/collections/${id}/items`, { postId });
      if (res.data.success) {
        // Refresh items
        const colRes = await axios.get(`/api/collections/${id}`);
        setItems(
          colRes.data.data.items?.sort(
            (a: CollectionItem, b: CollectionItem) => a.order - b.order,
          ) || [],
        );
        setPostResults((prev) => prev.filter((p) => p.id !== postId));
        toast.success("Post added");
      }
    } catch {
      toast.error("Failed to add post");
    }
  };

  const removeItem = async () => {
    if (!removeTarget) return;
    try {
      await axios.delete(
        `/api/collections/${id}/items?itemId=${removeTarget.id}`,
      );
      setItems((prev) => prev.filter((item) => item.id !== removeTarget.id));
      toast.success("Post removed");
      setRemoveTarget(null);
    } catch {
      toast.error("Failed to remove post");
    }
  };

  const moveItem = async (index: number, direction: "up" | "down") => {
    const newItems = [...items];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newItems.length) return;

    [newItems[index], newItems[swapIndex]] = [
      newItems[swapIndex],
      newItems[index],
    ];

    // Update order values
    const reordered = newItems.map((item, i) => ({ ...item, order: i }));
    setItems(reordered);

    // Persist
    try {
      await axios.patch(`/api/collections/${id}/items`, {
        items: reordered.map((item) => ({ id: item.id, order: item.order })),
      });
    } catch {
      toast.error("Failed to reorder");
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
          href="/admin/collections"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4"
        >
          <FiArrowLeft size={14} />
          Back to Collections
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Collection</h1>
      </div>

      {/* Collection details form */}
      <form onSubmit={handleSave} className="space-y-6 mb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Slug <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>
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
                <FiXIcon size={14} />
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

        <button
          type="submit"
          disabled={updateMutation.isPending}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors cursor-pointer"
        >
          <FiSave size={16} />
          {updateMutation.isPending ? "Saving..." : "Save Details"}
        </button>
      </form>

      {/* Collection items */}
      <div className="border-t border-gray-200 pt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Collection Items
        </h2>

        {/* Items list */}
        {items.length > 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 mb-6 overflow-hidden">
            <ul className="divide-y divide-gray-100">
              {items.map((item, index) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs text-gray-400 w-6 text-center shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-sm text-gray-900 truncate">
                      {item.post.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => moveItem(index, "up")}
                      disabled={index === 0}
                      className="p-1.5 text-gray-400 hover:text-gray-900 disabled:opacity-20 transition-colors cursor-pointer disabled:cursor-not-allowed"
                      title="Move up"
                    >
                      <FiArrowUp size={14} />
                    </button>
                    <button
                      onClick={() => moveItem(index, "down")}
                      disabled={index === items.length - 1}
                      className="p-1.5 text-gray-400 hover:text-gray-900 disabled:opacity-20 transition-colors cursor-pointer disabled:cursor-not-allowed"
                      title="Move down"
                    >
                      <FiArrowDown size={14} />
                    </button>
                    <button
                      onClick={() => setRemoveTarget(item)}
                      className="p-1.5 text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                      title="Remove"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-sm text-gray-400 mb-6">
            No items in this collection yet. Search for posts to add below.
          </p>
        )}

        {/* Add posts */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Add Posts
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={postSearch}
              onChange={(e) => setPostSearch(e.target.value)}
              placeholder="Search for posts to add..."
              className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  searchPosts();
                }
              }}
            />
            <button
              type="button"
              onClick={searchPosts}
              disabled={searching}
              className="px-4 py-2.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer disabled:opacity-50"
            >
              {searching ? "..." : "Search"}
            </button>
          </div>

          {postResults.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <ul className="divide-y divide-gray-100">
                {postResults.map((post) => (
                  <li
                    key={post.id}
                    className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-sm text-gray-700 truncate">
                      {post.title}
                    </span>
                    <button
                      onClick={() => addPostToCollection(post.id)}
                      className="p-1.5 text-gray-400 hover:text-green-600 transition-colors cursor-pointer shrink-0"
                      title="Add to collection"
                    >
                      <FiPlus size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={!!removeTarget}
        title="Remove from Collection"
        message={`Remove "${removeTarget?.post.title}" from this collection?`}
        confirmLabel="Remove"
        variant="danger"
        onConfirm={removeItem}
        onCancel={() => setRemoveTarget(null)}
      />
    </div>
  );
};

export default EditCollectionPage;
