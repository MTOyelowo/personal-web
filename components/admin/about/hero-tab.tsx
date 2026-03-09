"use client";

import { FC, useRef, useState, useCallback } from "react";
import { FiPlus, FiTrash2, FiSave, FiFileText, FiUpload } from "react-icons/fi";
import toast from "react-hot-toast";
import Spinner from "@/components/ui/spinner";
import {
  InputField,
  TextareaField,
  FieldRow,
} from "@/components/admin/form-field";
import {
  useAboutContent,
  useUpdateAboutContent,
  useUploadCv,
} from "@/hooks/query/useAbout";

/* ── Types ────────────────────────────────────────────────── */

interface HeroForm {
  firstName: string;
  lastName: string;
  subtitle: string;
  bio: string;
  poemLines: string;
  skills: { label: string; items: string }[];
}

/* ── Component ────────────────────────────────────────────── */

const HeroTab: FC = () => {
  const { data: about, isLoading } = useAboutContent();
  const updateMutation = useUpdateAboutContent();
  const uploadCvMutation = useUploadCv();
  const cvInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<HeroForm | null>(null);

  const initForm = useCallback(() => {
    if (!about) return;
    setForm({
      firstName: about.firstName,
      lastName: about.lastName,
      subtitle: about.subtitle,
      bio: about.bio,
      poemLines: about.poemLines.join("\n"),
      skills: about.skills.map((s) => ({
        label: s.label,
        items: s.items.join(", "),
      })),
    });
  }, [about]);

  if (about && !form) initForm();

  if (isLoading || !form) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size={28} />
      </div>
    );
  }

  /* ── Handlers ──────────────────────────────────────────── */

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({
        firstName: form.firstName,
        lastName: form.lastName,
        subtitle: form.subtitle,
        bio: form.bio,
        poemLines: form.poemLines
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean),
        skills: form.skills.map((s) => ({
          label: s.label,
          items: s.items
            .split(",")
            .map((i) => i.trim())
            .filter(Boolean),
        })),
      });
      toast.success("About content saved");
    } catch {
      toast.error("Failed to save");
    }
  };

  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadCvMutation.mutateAsync(file);
      toast.success("CV uploaded successfully");
    } catch {
      toast.error("Failed to upload CV");
    }
  };

  const updateField = <K extends keyof HeroForm>(key: K, value: HeroForm[K]) =>
    setForm((f) => (f ? { ...f, [key]: value } : f));

  const addSkill = () =>
    setForm((f) =>
      f ? { ...f, skills: [...f.skills, { label: "", items: "" }] } : f,
    );

  const removeSkill = (i: number) =>
    setForm((f) =>
      f ? { ...f, skills: f.skills.filter((_, idx) => idx !== i) } : f,
    );

  const updateSkill = (i: number, field: "label" | "items", value: string) =>
    setForm((f) => {
      if (!f) return f;
      const skills = [...f.skills];
      skills[i] = { ...skills[i], [field]: value };
      return { ...f, skills };
    });

  /* ── Render ────────────────────────────────────────────── */

  return (
    <div className="space-y-8">
      {/* Name */}
      <Section title="Name">
        <FieldRow>
          <InputField
            label="First Name"
            value={form.firstName}
            onChange={(v) => updateField("firstName", v)}
          />
          <InputField
            label="Last Name"
            value={form.lastName}
            onChange={(v) => updateField("lastName", v)}
          />
        </FieldRow>
      </Section>

      {/* Subtitle & Bio */}
      <Section title="Subtitle & Bio">
        <InputField
          label="Subtitle"
          value={form.subtitle}
          onChange={(v) => updateField("subtitle", v)}
          placeholder="e.g. A Nomad of Dreams..."
        />
        <TextareaField
          label="Bio"
          value={form.bio}
          onChange={(v) => updateField("bio", v)}
          placeholder="Short bio text..."
          rows={3}
        />
      </Section>

      {/* Poem */}
      <Section title="Poem Lines">
        <TextareaField
          label="Poem Lines"
          value={form.poemLines}
          onChange={(v) => updateField("poemLines", v)}
          rows={10}
          mono
          hint="One line per row. These appear in the scroll-reveal poem section."
        />
      </Section>

      {/* Skills */}
      <Section
        title="Skills"
        action={
          <button
            onClick={addSkill}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <FiPlus size={14} /> Add Skill
          </button>
        }
      >
        <div className="space-y-3">
          {form.skills.map((skill, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-3 rounded-lg bg-gray-50"
            >
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={skill.label}
                  onChange={(e) => updateSkill(i, "label", e.target.value)}
                  placeholder="Skill category (e.g. Frontend)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                />
                <input
                  type="text"
                  value={skill.items}
                  onChange={(e) => updateSkill(i, "items", e.target.value)}
                  placeholder="Items (comma separated)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                />
              </div>
              <button
                onClick={() => removeSkill(i)}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
              >
                <FiTrash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </Section>

      {/* CV Upload */}
      <Section title="CV / Resume">
        {about?.cvUrl && (
          <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-green-50 border border-green-200">
            <FiFileText size={18} className="text-green-600" />
            <a
              href={about.cvUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-green-800 underline truncate"
            >
              Current CV
            </a>
          </div>
        )}
        <input
          ref={cvInputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleCvUpload}
          className="hidden"
        />
        <button
          onClick={() => cvInputRef.current?.click()}
          disabled={uploadCvMutation.isPending}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
        >
          {uploadCvMutation.isPending ? (
            <Spinner size={16} />
          ) : (
            <FiUpload size={16} />
          )}
          {uploadCvMutation.isPending ? "Uploading..." : "Upload CV"}
        </button>
      </Section>

      {/* Save */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors cursor-pointer disabled:opacity-50"
        >
          {updateMutation.isPending ? (
            <Spinner size={16} />
          ) : (
            <FiSave size={16} />
          )}
          {updateMutation.isPending ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

/* ── Section helper (local) ──────────────────────────────── */

const Section: FC<{
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, action, children }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {action}
    </div>
    <div className="space-y-4">{children}</div>
  </div>
);

export default HeroTab;
