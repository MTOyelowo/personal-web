"use client";

import { FC } from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import toast from "react-hot-toast";
import Spinner from "@/components/ui/spinner";
import FormCard from "@/components/admin/form-card";
import ConfirmDialog from "@/components/admin/confirm-dialog";
import {
  InputField,
  TextareaField,
  NumberField,
  FieldRow,
} from "@/components/admin/form-field";
import { useCrudState } from "@/hooks/common/useCrudState";
import {
  useWorkExperiences,
  useCreateWorkExperience,
  useUpdateWorkExperience,
  useDeleteWorkExperience,
  type WorkExperienceData,
} from "@/hooks/query/useAbout";

/* ── Types ────────────────────────────────────────────────── */

interface ExperienceForm {
  company: string;
  position: string;
  dateRange: string;
  descriptions: string;
  order: number;
}

const emptyForm: ExperienceForm = {
  company: "",
  position: "",
  dateRange: "",
  descriptions: "",
  order: 0,
};

/* ── Component ────────────────────────────────────────────── */

const ExperienceTab: FC = () => {
  const { data: experiences, isLoading } = useWorkExperiences();
  const createMutation = useCreateWorkExperience();
  const updateMutation = useUpdateWorkExperience();
  const deleteMutation = useDeleteWorkExperience();

  const {
    editing,
    isNew,
    form,
    setForm,
    deleteTarget,
    setDeleteTarget,
    startNew,
    startEdit,
    cancelEdit,
  } = useCrudState<WorkExperienceData, ExperienceForm>({
    items: experiences,
    emptyForm,
    getId: (e) => e.id,
    itemToForm: (e) => ({
      company: e.company,
      position: e.position,
      dateRange: e.dateRange,
      descriptions: e.descriptions.join("\n"),
      order: e.order,
    }),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size={28} />
      </div>
    );
  }

  /* ── Handlers ──────────────────────────────────────────── */

  const handleSave = async () => {
    if (!form.company || !form.position || !form.dateRange) {
      toast.error("Company, position, and date range are required");
      return;
    }
    try {
      const payload = {
        company: form.company,
        position: form.position,
        dateRange: form.dateRange,
        descriptions: form.descriptions
          .split("\n")
          .map((d) => d.trim())
          .filter(Boolean),
        order: form.order,
      };
      if (isNew) {
        await createMutation.mutateAsync(payload);
        toast.success("Experience created");
      } else if (editing) {
        await updateMutation.mutateAsync({ id: editing, ...payload });
        toast.success("Experience updated");
      }
      cancelEdit();
    } catch {
      toast.error("Failed to save experience");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success("Experience deleted");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete experience");
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  /* ── Render ────────────────────────────────────────────── */

  return (
    <div>
      {/* New button */}
      {!editing && (
        <div className="flex justify-end mb-4">
          <button
            onClick={startNew}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
          >
            + New Experience
          </button>
        </div>
      )}

      {/* Form */}
      {editing && (
        <FormCard
          title={isNew ? "New Experience" : "Edit Experience"}
          onClose={cancelEdit}
          onSave={handleSave}
          isSaving={isSaving}
          saveLabel={isNew ? "Create" : "Update"}
        >
          <FieldRow>
            <InputField
              label="Company"
              required
              value={form.company}
              onChange={(v) => setForm({ ...form, company: v })}
            />
            <InputField
              label="Position"
              required
              value={form.position}
              onChange={(v) => setForm({ ...form, position: v })}
            />
          </FieldRow>

          <FieldRow>
            <InputField
              label="Date Range"
              required
              value={form.dateRange}
              onChange={(v) => setForm({ ...form, dateRange: v })}
              placeholder="e.g. Jun 2023 – May 2024"
            />
            <NumberField
              label="Order"
              value={form.order}
              onChange={(v) => setForm({ ...form, order: v })}
            />
          </FieldRow>

          <TextareaField
            label="Descriptions (one per line)"
            value={form.descriptions}
            onChange={(v) => setForm({ ...form, descriptions: v })}
            rows={6}
          />
        </FormCard>
      )}

      {/* Card list */}
      {experiences && experiences.length > 0 ? (
        <div className="space-y-3">
          {experiences.map((exp) => (
            <div
              key={exp.id}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900">{exp.company}</h4>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {exp.position} · {exp.dateRange}
                  </p>
                  <ul className="mt-2 space-y-1">
                    {exp.descriptions.slice(0, 2).map((d, i) => (
                      <li
                        key={i}
                        className="text-xs text-gray-400 truncate max-w-lg"
                      >
                        • {d}
                      </li>
                    ))}
                    {exp.descriptions.length > 2 && (
                      <li className="text-xs text-gray-300">
                        +{exp.descriptions.length - 2} more
                      </li>
                    )}
                  </ul>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => startEdit(exp.id)}
                    className="p-2 text-gray-400 hover:text-gray-900 cursor-pointer"
                    title="Edit"
                  >
                    <FiEdit2 size={16} />
                  </button>
                  <button
                    onClick={() =>
                      setDeleteTarget({ id: exp.id, label: exp.company })
                    }
                    className="p-2 text-gray-400 hover:text-red-600 cursor-pointer"
                    title="Delete"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !editing && (
          <div className="text-center py-12 text-gray-400">
            No work experience yet. Click &quot;New Experience&quot; to get
            started.
          </div>
        )
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Experience"
        message={`Delete "${deleteTarget?.label}" experience? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default ExperienceTab;
