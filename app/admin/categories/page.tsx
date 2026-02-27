"use client";

import { FC, JSX, useState } from "react";
import { FiEdit2, FiTrash2, FiCheck, FiX, FiTag, FiPlus } from "react-icons/fi";
import PageHeader from "@/components/admin/page-header";
import ConfirmDialog from "@/components/admin/confirm-dialog";
import EmptyState from "@/components/admin/empty-state";
import Spinner from "@/components/ui/spinner";
import {
  useAdminCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/hooks/query/useAdmin";
import toast from "react-hot-toast";

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();

interface EditingState {
  id: string;
  name: string;
  slug: string;
  description: string;
}

const AdminCategoriesPage: FC = (): JSX.Element => {
  const { data: categories, isLoading } = useAdminCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const [editing, setEditing] = useState<EditingState | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const handleCreate = async () => {
    if (!newName || !newSlug) {
      toast.error("Name and slug are required");
      return;
    }
    try {
      await createMutation.mutateAsync({
        name: newName,
        slug: newSlug,
        description: newDescription || undefined,
      });
      toast.success("Category created");
      setNewName("");
      setNewSlug("");
      setNewDescription("");
      setShowCreate(false);
    } catch {
      toast.error("Failed to create category");
    }
  };

  const handleUpdate = async () => {
    if (!editing) return;
    try {
      await updateMutation.mutateAsync({
        id: editing.id,
        name: editing.name,
        slug: editing.slug,
        description: editing.description,
      });
      toast.success("Category updated");
      setEditing(null);
    } catch {
      toast.error("Failed to update category");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success("Category deleted");
      setDeleteTarget(null);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to delete category";
      toast.error(message);
    }
  };

  return (
    <div>
      <PageHeader
        title="Categories"
        description="Organize your posts and collections by category."
      >
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
        >
          <FiPlus size={16} />
          Add Category
        </button>
      </PageHeader>

      {/* Create form */}
      {showCreate && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            New Category
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Name
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => {
                  setNewName(e.target.value);
                  if (!newSlug || newSlug === slugify(newName)) {
                    setNewSlug(slugify(e.target.value));
                  }
                }}
                placeholder="e.g. Poetry"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Slug
              </label>
              <input
                type="text"
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value)}
                placeholder="poetry"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Description (optional)
            </label>
            <input
              type="text"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="A short description of this category"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={createMutation.isPending}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors cursor-pointer"
            >
              <FiCheck size={14} />
              {createMutation.isPending ? "Creating..." : "Create"}
            </button>
            <button
              onClick={() => {
                setShowCreate(false);
                setNewName("");
                setNewSlug("");
                setNewDescription("");
              }}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Categories list */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size={28} />
        </div>
      ) : !categories || categories.length === 0 ? (
        <EmptyState
          icon={<FiTag size={24} />}
          title="No categories"
          description="Create your first category to organize content."
          action={{
            label: "Add Category",
            onClick: () => setShowCreate(true),
          }}
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-5 py-3 font-medium text-gray-500">
                  Name
                </th>
                <th className="text-left px-5 py-3 font-medium text-gray-500 hidden md:table-cell">
                  Slug
                </th>
                <th className="text-left px-5 py-3 font-medium text-gray-500 hidden lg:table-cell">
                  Description
                </th>
                <th className="text-center px-5 py-3 font-medium text-gray-500">
                  Posts
                </th>
                <th className="text-center px-5 py-3 font-medium text-gray-500 hidden md:table-cell">
                  Collections
                </th>
                <th className="text-right px-5 py-3 font-medium text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.map((cat) =>
                editing?.id === cat.id ? (
                  <tr key={cat.id} className="bg-blue-50/30">
                    <td className="px-5 py-2">
                      <input
                        type="text"
                        value={editing.name}
                        onChange={(e) =>
                          setEditing({ ...editing, name: e.target.value })
                        }
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-900"
                      />
                    </td>
                    <td className="px-5 py-2 hidden md:table-cell">
                      <input
                        type="text"
                        value={editing.slug}
                        onChange={(e) =>
                          setEditing({ ...editing, slug: e.target.value })
                        }
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-900"
                      />
                    </td>
                    <td className="px-5 py-2 hidden lg:table-cell">
                      <input
                        type="text"
                        value={editing.description}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            description: e.target.value,
                          })
                        }
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-900"
                      />
                    </td>
                    <td className="px-5 py-2 text-center text-gray-400">
                      {cat._count.posts}
                    </td>
                    <td className="px-5 py-2 text-center text-gray-400 hidden md:table-cell">
                      {cat._count.collections}
                    </td>
                    <td className="px-5 py-2">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={handleUpdate}
                          disabled={updateMutation.isPending}
                          className="p-2 text-green-600 hover:text-green-700 transition-colors cursor-pointer"
                          title="Save"
                        >
                          <FiCheck size={16} />
                        </button>
                        <button
                          onClick={() => setEditing(null)}
                          className="p-2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                          title="Cancel"
                        >
                          <FiX size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr
                    key={cat.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-5 py-3.5 font-medium text-gray-900">
                      {cat.name}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 hidden md:table-cell">
                      {cat.slug}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 hidden lg:table-cell">
                      {cat.description || "—"}
                    </td>
                    <td className="px-5 py-3.5 text-center text-gray-500">
                      {cat._count.posts}
                    </td>
                    <td className="px-5 py-3.5 text-center text-gray-500 hidden md:table-cell">
                      {cat._count.collections}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() =>
                            setEditing({
                              id: cat.id,
                              name: cat.name,
                              slug: cat.slug,
                              description: cat.description || "",
                            })
                          }
                          className="p-2 text-gray-400 hover:text-gray-900 transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button
                          onClick={() =>
                            setDeleteTarget({ id: cat.id, name: cat.name })
                          }
                          disabled={
                            cat._count.posts > 0 || cat._count.collections > 0
                          }
                          className="p-2 text-gray-400 hover:text-red-600 disabled:opacity-30 disabled:hover:text-gray-400 transition-colors cursor-pointer disabled:cursor-not-allowed"
                          title={
                            cat._count.posts > 0 || cat._count.collections > 0
                              ? "Cannot delete: has posts or collections"
                              : "Delete"
                          }
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Category"
        message={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default AdminCategoriesPage;
