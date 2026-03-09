"use client";

import { FC, useState } from "react";
import { FiX, FiEdit2, FiTrash2 } from "react-icons/fi";
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
  useProjects,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
  type ProjectData,
  type ProjectGithubLink,
  type ProjectTechItem,
} from "@/hooks/query/useAbout";

/* ── Types ────────────────────────────────────────────────── */

interface ProjectForm {
  title: string;
  description: string;
  image: string;
  liveUrl: string;
  githubLinks: ProjectGithubLink[];
  techStack: ProjectTechItem[];
  contributor: boolean;
  order: number;
}

const emptyForm: ProjectForm = {
  title: "",
  description: "",
  image: "",
  liveUrl: "",
  githubLinks: [],
  techStack: [],
  contributor: false,
  order: 0,
};

/* ── Component ────────────────────────────────────────────── */

const ProjectsTab: FC = () => {
  const { data: projects, isLoading } = useProjects();
  const createMutation = useCreateProject();
  const updateMutation = useUpdateProject();
  const deleteMutation = useDeleteProject();

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
  } = useCrudState<ProjectData, ProjectForm>({
    items: projects,
    emptyForm,
    getId: (p) => p.id,
    itemToForm: (p) => ({
      title: p.title,
      description: p.description,
      image: p.image ?? "",
      liveUrl: p.liveUrl,
      githubLinks: p.githubLinks as ProjectGithubLink[],
      techStack: p.techStack as ProjectTechItem[],
      contributor: p.contributor,
      order: p.order,
    }),
  });

  // Sub-form state for adding github links / tech items
  const [githubLabel, setGithubLabel] = useState("");
  const [githubHref, setGithubHref] = useState("");
  const [techLabel, setTechLabel] = useState("");
  const [techIcon, setTechIcon] = useState("");

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size={28} />
      </div>
    );
  }

  /* ── Handlers ──────────────────────────────────────────── */

  const handleSave = async () => {
    if (!form.title || !form.description) {
      toast.error("Title and description are required");
      return;
    }
    try {
      if (isNew) {
        await createMutation.mutateAsync({
          ...form,
          image: form.image || null,
          imageBlobPath: null,
        });
        toast.success("Project created");
      } else if (editing) {
        await updateMutation.mutateAsync({ id: editing, ...form });
        toast.success("Project updated");
      }
      cancelEdit();
    } catch {
      toast.error("Failed to save project");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success("Project deleted");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete project");
    }
  };

  const addGithubLink = () => {
    if (!githubLabel || !githubHref) return;
    setForm((f) => ({
      ...f,
      githubLinks: [...f.githubLinks, { label: githubLabel, href: githubHref }],
    }));
    setGithubLabel("");
    setGithubHref("");
  };

  const removeGithubLink = (i: number) =>
    setForm((f) => ({
      ...f,
      githubLinks: f.githubLinks.filter((_, idx) => idx !== i),
    }));

  const addTechItem = () => {
    if (!techLabel) return;
    setForm((f) => ({
      ...f,
      techStack: [...f.techStack, { label: techLabel, icon: techIcon }],
    }));
    setTechLabel("");
    setTechIcon("");
  };

  const removeTechItem = (i: number) =>
    setForm((f) => ({
      ...f,
      techStack: f.techStack.filter((_, idx) => idx !== i),
    }));

  /* ── Render ────────────────────────────────────────────── */

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div>
      {/* New button */}
      {!editing && (
        <div className="flex justify-end mb-4">
          <button
            onClick={startNew}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
          >
            + New Project
          </button>
        </div>
      )}

      {/* Form */}
      {editing && (
        <FormCard
          title={isNew ? "New Project" : "Edit Project"}
          onClose={cancelEdit}
          onSave={handleSave}
          isSaving={isSaving}
          saveLabel={isNew ? "Create" : "Update"}
        >
          <FieldRow>
            <InputField
              label="Title"
              required
              value={form.title}
              onChange={(v) => setForm({ ...form, title: v })}
            />
            <InputField
              label="Live URL"
              value={form.liveUrl}
              onChange={(v) => setForm({ ...form, liveUrl: v })}
            />
          </FieldRow>

          <TextareaField
            label="Description"
            required
            value={form.description}
            onChange={(v) => setForm({ ...form, description: v })}
            rows={3}
          />

          <FieldRow>
            <InputField
              label="Image URL"
              value={form.image}
              onChange={(v) => setForm({ ...form, image: v })}
              placeholder="/images/project.png"
            />
            <div className="flex items-end gap-4">
              <NumberField
                label="Order"
                value={form.order}
                onChange={(v) => setForm({ ...form, order: v })}
              />
              <label className="flex items-center gap-2 cursor-pointer pb-2">
                <input
                  type="checkbox"
                  checked={form.contributor}
                  onChange={(e) =>
                    setForm({ ...form, contributor: e.target.checked })
                  }
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Contributor</span>
              </label>
            </div>
          </FieldRow>

          {/* GitHub Links sub-form */}
          <TagListEditor
            label="GitHub Links"
            items={form.githubLinks}
            renderTag={(link) => (
              <>
                <span className="px-2 py-1 bg-gray-100 rounded">
                  {link.label}
                </span>
                <span className="truncate">{link.href}</span>
              </>
            )}
            onRemove={removeGithubLink}
            addRow={
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={githubLabel}
                  onChange={(e) => setGithubLabel(e.target.value)}
                  placeholder="Label"
                  className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                />
                <input
                  type="text"
                  value={githubHref}
                  onChange={(e) => setGithubHref(e.target.value)}
                  placeholder="https://github.com/..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                />
                <button
                  onClick={addGithubLink}
                  className="px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  Add
                </button>
              </div>
            }
          />

          {/* Tech Stack sub-form */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tech Stack
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {form.techStack.map((tech, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-sm text-gray-700"
                >
                  {tech.label}
                  <button
                    onClick={() => removeTechItem(i)}
                    className="text-gray-400 hover:text-red-600 cursor-pointer"
                  >
                    <FiX size={12} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={techLabel}
                onChange={(e) => setTechLabel(e.target.value)}
                placeholder="Technology name"
                className="w-40 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              />
              <input
                type="text"
                value={techIcon}
                onChange={(e) => setTechIcon(e.target.value)}
                placeholder="Icon path (optional)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              />
              <button
                onClick={addTechItem}
                className="px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                Add
              </button>
            </div>
          </div>
        </FormCard>
      )}

      {/* Project list table */}
      {projects && projects.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-5 py-3 font-medium text-gray-500">
                  #
                </th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">
                  Title
                </th>
                <th className="text-left px-5 py-3 font-medium text-gray-500 hidden md:table-cell">
                  Tech
                </th>
                <th className="text-left px-5 py-3 font-medium text-gray-500 hidden lg:table-cell">
                  Role
                </th>
                <th className="text-right px-5 py-3 font-medium text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {projects.map((project) => (
                <tr
                  key={project.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-5 py-3.5 text-gray-500">{project.order}</td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm font-medium text-gray-900">
                      {project.title}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {(project.techStack as ProjectTechItem[])
                        .slice(0, 3)
                        .map((t, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 text-xs bg-gray-100 rounded text-gray-600"
                          >
                            {t.label}
                          </span>
                        ))}
                      {(project.techStack as ProjectTechItem[]).length > 3 && (
                        <span className="text-xs text-gray-400">
                          +{(project.techStack as ProjectTechItem[]).length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 hidden lg:table-cell text-gray-500">
                    {project.contributor ? "Contributor" : "Owner"}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => startEdit(project.id)}
                        className="p-2 text-gray-400 hover:text-gray-900 transition-colors cursor-pointer"
                        title="Edit"
                      >
                        <FiEdit2 size={16} />
                      </button>
                      <button
                        onClick={() =>
                          setDeleteTarget({
                            id: project.id,
                            label: project.title,
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
      ) : (
        !editing && (
          <div className="text-center py-12 text-gray-400">
            No projects yet. Click &quot;New Project&quot; to get started.
          </div>
        )
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Project"
        message={`Delete "${deleteTarget?.label}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

/* ── Tag list editor helper (local) ──────────────────────── */

function TagListEditor<T>({
  label,
  items,
  renderTag,
  onRemove,
  addRow,
}: {
  label: string;
  items: T[];
  renderTag: (item: T) => React.ReactNode;
  onRemove: (i: number) => void;
  addRow: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      {items.map((item, i) => (
        <div
          key={i}
          className="flex items-center gap-2 mb-2 text-sm text-gray-600"
        >
          {renderTag(item)}
          <button
            onClick={() => onRemove(i)}
            className="p-1 text-gray-400 hover:text-red-600 cursor-pointer"
          >
            <FiX size={14} />
          </button>
        </div>
      ))}
      {addRow}
    </div>
  );
}

export default ProjectsTab;
