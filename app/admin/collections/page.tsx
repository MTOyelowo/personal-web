"use client";

import { FC, JSX, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiEdit2, FiTrash2, FiFolder } from "react-icons/fi";
import PageHeader from "@/components/admin/page-header";
import ConfirmDialog from "@/components/admin/confirm-dialog";
import EmptyState from "@/components/admin/empty-state";
import Spinner from "@/components/ui/spinner";
import {
  useAdminCollections,
  useDeleteCollection,
  useAdminCategories,
} from "@/hooks/query/useAdmin";
import toast from "react-hot-toast";

const AdminCollectionsPage: FC = (): JSX.Element => {
  const router = useRouter();
  const [categoryFilter, setCategoryFilter] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const { data: collections, isLoading } = useAdminCollections(
    categoryFilter || undefined,
  );
  const { data: categories } = useAdminCategories();
  const deleteMutation = useDeleteCollection();

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success("Collection deleted");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete collection");
    }
  };

  return (
    <div>
      <PageHeader
        title="Collections"
        description="Group related posts into collections."
        action={{
          label: "New Collection",
          href: "/admin/collections/create",
        }}
      />

      {/* Category filter */}
      <div className="mb-6">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
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

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size={28} />
        </div>
      ) : !collections || collections.length === 0 ? (
        <EmptyState
          icon={<FiFolder size={24} />}
          title="No collections"
          description="Create a collection to group related posts together."
          action={{
            label: "Create Collection",
            onClick: () => router.push("/admin/collections/create"),
          }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map((col) => (
            <div
              key={col.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-gray-300 transition-colors"
            >
              {/* Cover */}
              {col.coverUrl ? (
                <div className="h-32 bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={col.coverUrl}
                    alt={col.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-32 bg-linear-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <FiFolder size={32} className="text-gray-300" />
                </div>
              )}

              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {col.title}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {col.category.name} · {col._count.items} items
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Link
                      href={`/admin/collections/${col.id}/edit`}
                      className="p-1.5 text-gray-400 hover:text-gray-900 transition-colors"
                      title="Edit"
                    >
                      <FiEdit2 size={14} />
                    </Link>
                    <button
                      onClick={() =>
                        setDeleteTarget({ id: col.id, title: col.title })
                      }
                      className="p-1.5 text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
                {col.description && (
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                    {col.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Collection"
        message={`Delete "${deleteTarget?.title}" and remove all its items? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default AdminCollectionsPage;
