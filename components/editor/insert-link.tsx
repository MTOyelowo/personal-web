"use client";

import { FC, useState } from "react";
import { BsLink45Deg } from "react-icons/bs";
import ToolbarButton from "./toolbar-button";
import LinkForm, { LinkOption } from "./link-form";

interface Props {
  onSubmit(link: LinkOption): void;
}

const InsertLink: FC<Props> = ({ onSubmit }) => {
  const [visible, setVisible] = useState(false);

  const handleSubmit = (link: LinkOption) => {
    if (!link.url.trim()) return hideForm();
    onSubmit(link);
    hideForm();
  };

  const hideForm = () => setVisible(false);
  const showForm = () => setVisible(true);

  return (
    <div
      onKeyDown={({ key }) => {
        if (key === "Escape") hideForm();
      }}
      className="relative"
    >
      <ToolbarButton
        onClick={visible ? hideForm : showForm}
        title="Insert Link"
      >
        <BsLink45Deg />
      </ToolbarButton>
      {visible && (
        <div className="absolute top-full mt-2 right-0 z-50">
          <LinkForm visible={visible} onSubmit={handleSubmit} />
        </div>
      )}
    </div>
  );
};

export default InsertLink;
