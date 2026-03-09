"use client";

import type { FC, ReactNode } from "react";
import { FiX, FiSave } from "react-icons/fi";
import Spinner from "@/components/ui/spinner";

interface FormCardProps {
  title: string;
  onClose: () => void;
  onSave: () => void;
  isSaving: boolean;
  saveLabel?: string;
  children: ReactNode;
}

const FormCard: FC<FormCardProps> = ({
  title,
  onClose,
  onSave,
  isSaving,
  saveLabel = "Save",
  children,
}) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <button
        onClick={onClose}
        className="p-2 text-gray-400 hover:text-gray-600 cursor-pointer"
      >
        <FiX size={18} />
      </button>
    </div>

    <div className="space-y-4">{children}</div>

    <div className="flex justify-end gap-3 pt-6">
      <button
        onClick={onClose}
        className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
      >
        Cancel
      </button>
      <button
        onClick={onSave}
        disabled={isSaving}
        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors cursor-pointer disabled:opacity-50"
      >
        {isSaving ? <Spinner size={16} /> : <FiSave size={16} />}
        {isSaving ? "Saving..." : saveLabel}
      </button>
    </div>
  </div>
);

export default FormCard;
