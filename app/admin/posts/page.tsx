"use client";

import { FC, JSX, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiFileText,
  FiChevronLeft,
  FiChevronRight,
  FiStar,
  FiAward,
} from "react-icons/fi";
import PageHeader from "@/components/admin/page-header";
import ConfirmDialog from "@/components/admin/confirm-dialog";
import EmptyState from "@/components/admin/empty-state";
import Spinner from "@/components/ui/spinner";
import {
  useAdminPosts,
  useDeletePost,
  useAdminCategories,
  useTogglePostField,
} from "@/hooks/query/useAdmin";
import toast from "react-hot-toast";

const AdminPostsPage: FC = (): JSX.Element => {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const limit = 20;
  const { data, isLoading } = useAdminPosts(
    page,
    limit,
    search || undefined,
    categoryFilter || undefined,
  );
  const { data: categories } = useAdminCategories();
  const deleteMutation = useDeletePost();
  const toggleMutation = useTogglePostField();

  const handleToggle = async (id: string, field: "featured" | "editorPick") => {
    try {
      const result = await toggleMutation.mutateAsync({ id, field });
      const label = field === "featured" ? "Featured" : "Editor's Pick";
      const enabled = result[field];
      toast.success(`${label} ${enabled ? "enabled" : "disabled"}`);
    } catch {
      toast.error("Failed to update post");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success("Post deleted");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete post");
    }
  };

  return (
    <div>
      <PageHeader
        title="Posts"
        description="Manage your articles, poems, stories, and more."
        action={{ label: "New Post", href: "/admin/posts/create" }}
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
          <FiSearch
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search posts..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
        </form>
        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gray-900"
        >
          <option value="">All categories</option>
          {categories?.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Posts table */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size={28} />
        </div>
      ) : !data || data.posts.length === 0 ? (
        <EmptyState
          icon={<FiFileText size={24} />}
          title="No posts found"
          description={
            search
              ? "Try adjusting your search or filters."
              : "Create your first post to get started."
          }
          action={
            !search
              ? {
                  label: "Create Post",
                  onClick: () => router.push("/admin/posts/create"),
                }
              : undefined
          }
        />
      ) : (
        <>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left px-5 py-3 font-medium text-gray-500">
                      Title
                    </th>
                    <th className="text-left px-5 py-3 font-medium text-gray-500 hidden md:table-cell">
                      Category
                    </th>
                    <th className="text-left px-5 py-3 font-medium text-gray-500 hidden lg:table-cell">
                      Date
                    </th>
                    <th className="text-left px-5 py-3 font-medium text-gray-500 hidden lg:table-cell">
                      Stats
                    </th>
                    <th className="text-left px-5 py-3 font-medium text-gray-500 hidden md:table-cell">
                      Status
                    </th>
                    <th className="text-right px-5 py-3 font-medium text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.posts.map((post) => (
                    <tr
                      key={post.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate max-w-xs">
                            {post.title}
                          </p>
                          <p className="text-xs text-gray-400 truncate max-w-xs mt-0.5">
                            {post.meta}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell">
                        <span className="inline-flex px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                          {post.category?.name ?? "—"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 hidden lg:table-cell">
                        {new Date(post.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-5 py-3.5 text-gray-400 hidden lg:table-cell">
                        {post._count.comments}c · {post._count.likes}l
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleToggle(post.id, "featured")}
                            title={
                              post.featured
                                ? "Remove from Featured"
                                : "Mark as Featured"
                            }
                            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                              post.featured
                                ? "bg-amber-100 text-amber-600 hover:bg-amber-200"
                                : "bg-gray-50 text-gray-300 hover:text-amber-500 hover:bg-amber-50"
                            }`}
                          >
                            <FiStar size={14} />
                          </button>
                          <button
                            onClick={() => handleToggle(post.id, "editorPick")}
                            title={
                              post.editorPick
                                ? "Remove from Editor's Picks"
                                : "Mark as Editor's Pick"
                            }
                            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                              post.editorPick
                                ? "bg-indigo-100 text-indigo-600 hover:bg-indigo-200"
                                : "bg-gray-50 text-gray-300 hover:text-indigo-500 hover:bg-indigo-50"
                            }`}
                          >
                            <FiAward size={14} />
                          </button>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/posts/${post.slug}/edit`}
                            className="p-2 text-gray-400 hover:text-gray-900 transition-colors"
                            title="Edit"
                          >
                            <FiEdit2 size={16} />
                          </Link>
                          <button
                            onClick={() =>
                              setDeleteTarget({
                                id: post.id,
                                title: post.title,
                              })
                            }
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-500">
                Page {data.pagination.page} of {data.pagination.totalPages} ·{" "}
                {data.pagination.total} total
              </p>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="p-2 text-gray-400 hover:text-gray-900 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                >
                  <FiChevronLeft size={18} />
                </button>
                <button
                  disabled={page >= data.pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="p-2 text-gray-400 hover:text-gray-900 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                >
                  <FiChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Post"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default AdminPostsPage;
