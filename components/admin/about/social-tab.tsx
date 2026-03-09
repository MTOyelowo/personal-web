"use client";

import { FC } from "react";
import CrudTableTab, {
  type TableColumn,
} from "@/components/admin/crud-table-tab";
import {
  InputField,
  SelectField,
  NumberField,
  FieldRow,
} from "@/components/admin/form-field";
import {
  useSocialLinks,
  useCreateSocialLink,
  useUpdateSocialLink,
  useDeleteSocialLink,
  type SocialLinkData,
} from "@/hooks/query/useAbout";

/* ── Config ───────────────────────────────────────────────── */

const ICON_OPTIONS = [
  "github",
  "facebook",
  "instagram",
  "x-twitter",
  "linkedin",
  "youtube",
  "tiktok",
  "globe",
];

interface SocialForm {
  platform: string;
  href: string;
  iconKey: string;
  order: number;
}

const emptyForm: SocialForm = {
  platform: "",
  href: "",
  iconKey: "github",
  order: 0,
};

const columns: TableColumn<SocialLinkData>[] = [
  {
    header: "#",
    render: (item) => <span className="text-gray-500">{item.order}</span>,
  },
  {
    header: "Platform",
    render: (item) => (
      <span className="font-medium text-gray-900">{item.platform}</span>
    ),
  },
  {
    header: "URL",
    render: (item) => (
      <span className="text-gray-600 truncate max-w-xs block">{item.href}</span>
    ),
  },
  {
    header: "Icon",
    hiddenBelow: "md",
    render: (item) => <span className="text-gray-400">{item.iconKey}</span>,
  },
];

/* ── Component ────────────────────────────────────────────── */

const SocialTab: FC = () => {
  const { data, isLoading } = useSocialLinks();
  const createMutation = useCreateSocialLink();
  const updateMutation = useUpdateSocialLink();
  const deleteMutation = useDeleteSocialLink();

  return (
    <CrudTableTab<SocialLinkData, SocialForm>
      entityName="Social Link"
      items={data}
      isLoading={isLoading}
      createMutation={createMutation}
      updateMutation={updateMutation}
      deleteMutation={deleteMutation}
      emptyForm={emptyForm}
      getId={(item) => item.id}
      getLabel={(item) => item.platform}
      validate={(form) =>
        !form.platform || !form.href ? "Platform and URL are required" : null
      }
      itemToForm={(item) => ({
        platform: item.platform,
        href: item.href,
        iconKey: item.iconKey,
        order: item.order,
      })}
      columns={columns}
      renderFormFields={(form, setForm) => (
        <>
          <FieldRow>
            <InputField
              label="Platform"
              required
              value={form.platform}
              onChange={(v) => setForm({ ...form, platform: v })}
              placeholder="e.g. GitHub, Twitter"
            />
            <SelectField
              label="Icon"
              value={form.iconKey}
              onChange={(v) => setForm({ ...form, iconKey: v })}
              options={ICON_OPTIONS}
            />
          </FieldRow>

          <FieldRow>
            <InputField
              label="URL"
              required
              value={form.href}
              onChange={(v) => setForm({ ...form, href: v })}
              placeholder="https://..."
            />
            <NumberField
              label="Order"
              value={form.order}
              onChange={(v) => setForm({ ...form, order: v })}
            />
          </FieldRow>
        </>
      )}
    />
  );
};

export default SocialTab;
