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
  useAboutInfoItems,
  useCreateAboutInfoItem,
  useUpdateAboutInfoItem,
  useDeleteAboutInfoItem,
  type AboutInfoItemData,
} from "@/hooks/query/useAbout";

/* ── Config ───────────────────────────────────────────────── */

const ICON_OPTIONS = ["mail", "map-pin", "phone", "github", "globe", "link"];

interface InfoForm {
  label: string;
  value: string;
  href: string;
  iconKey: string;
  order: number;
}

const emptyForm: InfoForm = {
  label: "",
  value: "",
  href: "",
  iconKey: "mail",
  order: 0,
};

const columns: TableColumn<AboutInfoItemData>[] = [
  {
    header: "#",
    render: (item) => <span className="text-gray-500">{item.order}</span>,
  },
  {
    header: "Label",
    render: (item) => (
      <span className="font-medium text-gray-900">{item.label}</span>
    ),
  },
  {
    header: "Value",
    render: (item) => (
      <span className="text-gray-600 truncate max-w-xs block">
        {item.value}
      </span>
    ),
  },
  {
    header: "Icon",
    hiddenBelow: "md",
    render: (item) => <span className="text-gray-400">{item.iconKey}</span>,
  },
];

/* ── Component ────────────────────────────────────────────── */

const InfoTab: FC = () => {
  const { data, isLoading } = useAboutInfoItems();
  const createMutation = useCreateAboutInfoItem();
  const updateMutation = useUpdateAboutInfoItem();
  const deleteMutation = useDeleteAboutInfoItem();

  return (
    <CrudTableTab<AboutInfoItemData, InfoForm>
      entityName="Info Item"
      items={data}
      isLoading={isLoading}
      createMutation={createMutation}
      updateMutation={updateMutation}
      deleteMutation={deleteMutation}
      emptyForm={emptyForm}
      getId={(item) => item.id}
      getLabel={(item) => item.label}
      validate={(form) =>
        !form.label || !form.value ? "Label and value are required" : null
      }
      itemToForm={(item) => ({
        label: item.label,
        value: item.value,
        href: item.href ?? "",
        iconKey: item.iconKey,
        order: item.order,
      })}
      columns={columns}
      renderFormFields={(form, setForm) => (
        <>
          <FieldRow>
            <InputField
              label="Label"
              required
              value={form.label}
              onChange={(v) => setForm({ ...form, label: v })}
              placeholder="e.g. Location, Email"
            />
            <SelectField
              label="Icon"
              value={form.iconKey}
              onChange={(v) => setForm({ ...form, iconKey: v })}
              options={ICON_OPTIONS}
            />
          </FieldRow>

          <InputField
            label="Value"
            required
            value={form.value}
            onChange={(v) => setForm({ ...form, value: v })}
          />

          <FieldRow>
            <InputField
              label="Link (optional)"
              value={form.href}
              onChange={(v) => setForm({ ...form, href: v })}
              placeholder="mailto:... or https://..."
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

export default InfoTab;
