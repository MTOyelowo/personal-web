"use client";

import { FC, useState } from "react";
import { validateUrl } from "./editor-utils";

export type LinkOption = {
  url: string;
  openInNewTab: boolean;
};

const defaultLink: LinkOption = {
  url: "",
  openInNewTab: false,
};

interface Props {
  visible: boolean;
  onSubmit(link: LinkOption): void;
  initialState?: LinkOption;
}

const LinkForm: FC<Props> = ({ visible, onSubmit, initialState }) => {
  const [link, setLink] = useState<LinkOption>(
    () => initialState ?? { ...defaultLink },
  );

  const handleSubmit = () => {
    onSubmit({ ...link, url: validateUrl(link.url) });
    resetForm();
  };

  const resetForm = () => {
    setLink({ ...defaultLink });
  };

  if (!visible) return null;

  return (
    <div className="rounded-lg p-3 bg-white shadow-lg border border-gray-200 w-72">
      <input
        type="text"
        className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
        placeholder="https://example.com"
        autoFocus
        value={link.url}
        onChange={({ target }) => setLink({ ...link, url: target.value })}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleSubmit();
          }
        }}
      />
      <div className="flex items-center gap-2 mt-2">
        <input
          type="checkbox"
          id="link-new-tab"
          checked={link.openInNewTab}
          onChange={({ target }) =>
            setLink({ ...link, openInNewTab: target.checked })
          }
          className="rounded border-gray-300"
        />
        <label className="text-xs text-gray-500" htmlFor="link-new-tab">
          Open in new tab
        </label>
        <div className="flex-1 text-right">
          <button
            type="button"
            onClick={handleSubmit}
            className="px-3 py-1 bg-gray-900 text-white rounded-md text-xs font-medium hover:bg-gray-800 transition-colors cursor-pointer"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default LinkForm;
