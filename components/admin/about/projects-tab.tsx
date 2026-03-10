"use client";

import { FC, useRef, useState } from "react";
import Image from "next/image";
import { FiX, FiEdit2, FiTrash2, FiUpload, FiImage } from "react-icons/fi";
import TechStackPicker from "@/components/admin/tech-stack-picker";
import toast from "react-hot-toast";
import Spinner from "@/components/ui/spinner";
import FormCard from "@/components/admin/form-card";
import ConfirmDialog from "@/components/admin/confirm-dialog";
import {
  InputField,
  NumberField,
  FieldRow,
} from "@/components/admin/form-field";
import { useCrudState } from "@/hooks/common/useCrudState";
import { useQueryClient } from "@tanstack/react-query";
import dynamic from "next/dynamic";

const Editor = dynamic(() => import("@/components/editor"), { ssr: false });

import {
  useProjects,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
  useUploadProjectImage,
  useDeleteProjectImage,
  type ProjectData,
  type ProjectImageData,
  type ProjectGithubLink,
  type ProjectTechItem,
} from "@/hooks/query/useAbout";

/* ── Types ────────────────────────────────────────────────── */

interface ProjectForm {
  title: string;
  description: string;
  liveUrl: string;
  githubLinks: ProjectGithubLink[];
  techStack: ProjectTechItem[];
  contributor: boolean;
  order: number;
}

const emptyForm: ProjectForm = {
  title: "",
  description: "",
  liveUrl: "",
  githubLinks: [],
  techStack: [],
  contributor: false,
  order: 0,
};

/* ── Component ────────────────────────────────────────────── */

const ProjectsTab: FC = () => {
  const queryClient = useQueryClient();
  const { data: projects, isLoading } = useProjects();
  const createMutation = useCreateProject();
  const updateMutation = useUpdateProject();
  const deleteMutation = useDeleteProject();
  const uploadImageMutation = useUploadProjectImage();
  const deleteImageMutation = useDeleteProjectImage();

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
      liveUrl: p.liveUrl,
      githubLinks: p.githubLinks as ProjectGithubLink[],
      techStack: p.techStack as ProjectTechItem[],
      contributor: p.contributor,
      order: p.order,
    }),
  });

  // Sub-form state for adding github links
  const [githubLabel, setGithubLabel] = useState("");
  const [githubHref, setGithubHref] = useState("");
  const [deleteImageTarget, setDeleteImageTarget] = useState<{
    id: string;
    projectId: string;
    label: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Current project being edited (for image management)
  const editingProject =
    editing && !isNew ? projects?.find((p) => p.id === editing) : null;

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
          images: [],
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

  const handleImageUpload = async (files: FileList) => {
    if (!editing || isNew) return;

    const existingCount = editingProject?.images?.length ?? 0;
    const uploads = Array.from(files).map((file, i) =>
      uploadImageMutation
        .mutateAsync({
          projectId: editing,
          file,
          order: existingCount + i,
        })
        .then(() => ({ name: file.name, ok: true as const }))
        .catch(() => ({ name: file.name, ok: false as const })),
    );

    const results = await Promise.all(uploads);

    const succeeded = results.filter((r) => r.ok).length;
    const failed = results.filter((r) => !r.ok);

    if (succeeded > 0) {
      toast.success(`Uploaded ${succeeded} image${succeeded > 1 ? "s" : ""}`);
    }
    failed.forEach((r) => toast.error(`Failed to upload "${r.name}"`));

    // Invalidate once after all uploads complete
    queryClient.invalidateQueries({ queryKey: ["about", "projects"] });
  };

  const handleDeleteImage = async () => {
    if (!deleteImageTarget) return;
    try {
      await deleteImageMutation.mutateAsync({
        projectId: deleteImageTarget.projectId,
        imageId: deleteImageTarget.id,
      });
      toast.success("Image deleted");
      setDeleteImageTarget(null);
    } catch {
      toast.error("Failed to delete image");
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <Editor
              value={form.description}
              onChange={(html) => setForm((f) => ({ ...f, description: html }))}
              placeholder="Describe the project — features, technologies, technical highlights…"
            />
          </div>

          <FieldRow>
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

          {/* Image Gallery (only for existing projects) */}
          {!isNew && editingProject && (
            <ImageGallerySection
              images={editingProject.images ?? []}
              projectId={editingProject.id}
              isUploading={uploadImageMutation.isPending}
              fileInputRef={fileInputRef}
              onUpload={handleImageUpload}
              onDeleteImage={(img) =>
                setDeleteImageTarget({
                  id: img.id,
                  projectId: editingProject.id,
                  label: img.alt || img.url.split("/").pop() || "image",
                })
              }
            />
          )}

          {isNew && (
            <div className="rounded-lg border border-dashed border-gray-300 p-4 text-center text-sm text-gray-400">
              <FiImage className="mx-auto mb-1" size={20} />
              Save the project first, then you can upload images.
            </div>
          )}

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

          {/* Tech Stack picker */}
          <TechStackPicker
            items={form.techStack}
            onChange={(techStack) => setForm((f) => ({ ...f, techStack }))}
          />
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
                <th className="text-left px-5 py-3 font-medium text-gray-500 hidden sm:table-cell">
                  Images
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
                  <td className="px-5 py-3.5 hidden sm:table-cell">
                    <div className="flex items-center -space-x-2">
                      {(project.images ?? []).slice(0, 3).map((img) => (
                        <div
                          key={img.id}
                          className="w-8 h-8 rounded border-2 border-white overflow-hidden relative"
                        >
                          <Image
                            src={img.url}
                            alt={img.alt}
                            fill
                            className="object-cover"
                            sizes="32px"
                          />
                        </div>
                      ))}
                      {(project.images ?? []).length > 3 && (
                        <span className="w-8 h-8 rounded border-2 border-white bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                          +{project.images.length - 3}
                        </span>
                      )}
                      {(!project.images || project.images.length === 0) && (
                        <span className="text-xs text-gray-400">None</span>
                      )}
                    </div>
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

      <ConfirmDialog
        open={!!deleteImageTarget}
        title="Delete Image"
        message={`Delete image "${deleteImageTarget?.label}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDeleteImage}
        onCancel={() => setDeleteImageTarget(null)}
      />
    </div>
  );
};

/* ── Image Gallery Section ───────────────────────────────── */

function ImageGallerySection({
  images,
  isUploading,
  fileInputRef,
  onUpload,
  onDeleteImage,
}: {
  images: ProjectImageData[];
  projectId: string;
  isUploading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onUpload: (files: FileList) => void;
  onDeleteImage: (img: ProjectImageData) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Images ({images.length})
      </label>

      {/* Image thumbnails grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mb-3">
        {images.map((img) => (
          <div
            key={img.id}
            className="relative group aspect-video rounded-lg overflow-hidden border border-gray-200 bg-gray-50"
          >
            <Image
              src={img.url}
              alt={img.alt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 33vw, 20vw"
            />
            <button
              onClick={() => onDeleteImage(img)}
              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              title="Remove image"
            >
              <FiX size={12} />
            </button>
            {img.alt && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] px-1.5 py-0.5 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                {img.alt}
              </div>
            )}
          </div>
        ))}

        {/* Upload button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="aspect-video rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors cursor-pointer disabled:opacity-50"
        >
          {isUploading ? (
            <Spinner size={16} />
          ) : (
            <>
              <FiUpload size={16} />
              <span className="text-[10px]">Upload</span>
            </>
          )}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            onUpload(e.target.files);
            e.target.value = "";
          }
        }}
      />
    </div>
  );
}

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
