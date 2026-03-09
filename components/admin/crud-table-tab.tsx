"use client";

import { type ReactNode, useState } from "react";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import toast from "react-hot-toast";
import Spinner from "@/components/ui/spinner";
import ConfirmDialog from "@/components/admin/confirm-dialog";
import FormCard from "@/components/admin/form-card";

/* ── Column definition ───────────────────────────────────── */

export interface TableColumn<TItem> {
  header: string;
  render: (item: TItem) => ReactNode;
  hiddenBelow?: "md" | "lg"; // responsive hide
}

/* ── Minimal mutation interface (avoids strict generic variance) */

interface MutationLike<TVariables> {
  isPending: boolean;
  mutateAsync: (variables: TVariables) => Promise<unknown>;
}

/* ── Props ────────────────────────────────────────────────── */

export interface CrudTableTabProps<TItem, TForm> {
  entityName: string;

  /* Data */
  items: TItem[] | undefined;
  isLoading: boolean;

  /* Mutations – only depends on isPending + mutateAsync */
  createMutation: MutationLike<TForm>;
  updateMutation: MutationLike<TForm & { id: string }>;
  deleteMutation: MutationLike<string>;

  /* Form config */
  emptyForm: TForm;
  itemToForm: (item: TItem) => TForm;
  validate: (form: TForm) => string | null;

  /* Item accessors */
  getId: (item: TItem) => string;
  getLabel: (item: TItem) => string;

  /* Display */
  columns: TableColumn<TItem>[];
  renderFormFields: (
    form: TForm,
    setForm: React.Dispatch<React.SetStateAction<TForm>>,
  ) => ReactNode;
}

/* ── Component ────────────────────────────────────────────── */

export default function CrudTableTab<TItem, TForm>({
  entityName,
  items,
  isLoading,
  createMutation,
  updateMutation,
  deleteMutation,
  emptyForm,
  itemToForm,
  validate,
  getId,
  getLabel,
  columns,
  renderFormFields,
}: CrudTableTabProps<TItem, TForm>) {
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [form, setForm] = useState<TForm>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    label: string;
  } | null>(null);

  /* ── State helpers ─────────────────────────────────────── */

  const startNew = () => {
    setEditing("new");
    setForm(emptyForm);
  };

  const startEdit = (id: string) => {
    const item = items?.find((i) => getId(i) === id);
    if (!item) return;
    setEditing(id);
    setForm(itemToForm(item));
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm(emptyForm);
  };

  const isNew = editing === "new";
  const isSaving = createMutation.isPending || updateMutation.isPending;

  /* ── Handlers ──────────────────────────────────────────── */

  const handleSave = async () => {
    const error = validate(form);
    if (error) {
      toast.error(error);
      return;
    }
    try {
      if (isNew) {
        await createMutation.mutateAsync(form);
        toast.success(`${entityName} created`);
      } else if (editing) {
        await updateMutation.mutateAsync({ id: editing, ...form });
        toast.success(`${entityName} updated`);
      }
      cancelEdit();
    } catch {
      toast.error(`Failed to save ${entityName.toLowerCase()}`);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success(`${entityName} deleted`);
      setDeleteTarget(null);
    } catch {
      toast.error(`Failed to delete ${entityName.toLowerCase()}`);
    }
  };

  /* ── Render ────────────────────────────────────────────── */

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size={28} />
      </div>
    );
  }

  const hiddenClass = (col: TableColumn<TItem>) =>
    col.hiddenBelow ? `hidden ${col.hiddenBelow}:table-cell` : "";

  return (
    <div>
      {/* New button */}
      {!editing && (
        <div className="flex justify-end mb-4">
          <button
            onClick={startNew}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <FiPlus size={16} /> New {entityName}
          </button>
        </div>
      )}

      {/* Form card */}
      {editing && (
        <FormCard
          title={isNew ? `New ${entityName}` : `Edit ${entityName}`}
          onClose={cancelEdit}
          onSave={handleSave}
          isSaving={isSaving}
          saveLabel={isNew ? "Create" : "Update"}
        >
          {renderFormFields(form, setForm)}
        </FormCard>
      )}

      {/* Table */}
      {items && items.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                {columns.map((col) => (
                  <th
                    key={col.header}
                    className={`text-left px-5 py-3 font-medium text-gray-500 ${hiddenClass(col)}`}
                  >
                    {col.header}
                  </th>
                ))}
                <th className="text-right px-5 py-3 font-medium text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => (
                <tr
                  key={getId(item)}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {columns.map((col) => (
                    <td
                      key={col.header}
                      className={`px-5 py-3.5 ${hiddenClass(col)}`}
                    >
                      {col.render(item)}
                    </td>
                  ))}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => startEdit(getId(item))}
                        className="p-2 text-gray-400 hover:text-gray-900 cursor-pointer"
                        title="Edit"
                      >
                        <FiEdit2 size={16} />
                      </button>
                      <button
                        onClick={() =>
                          setDeleteTarget({
                            id: getId(item),
                            label: getLabel(item),
                          })
                        }
                        className="p-2 text-gray-400 hover:text-red-600 cursor-pointer"
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
      ) : (
        !editing && (
          <div className="text-center py-12 text-gray-400">
            No {entityName.toLowerCase()}s yet. Click &quot;New {entityName}
            &quot; to get started.
          </div>
        )
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title={`Delete ${entityName}`}
        message={`Delete "${deleteTarget?.label}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
