"use client";

import { FC, MouseEventHandler, ReactNode } from "react";

interface Props {
  children: ReactNode;
  active?: boolean;
  disabled?: boolean;
  title?: string;
  onMouseDown?: MouseEventHandler<HTMLButtonElement>;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

const ToolbarButton: FC<Props> = ({
  children,
  active,
  disabled,
  title,
  onMouseDown,
  onClick,
}) => {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={onMouseDown}
      onClick={onClick}
      disabled={disabled}
      className={`p-1.5 rounded text-base transition-colors cursor-pointer ${
        active
          ? "bg-gray-900 text-white"
          : "text-gray-600 hover:bg-gray-200 hover:text-gray-900"
      } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
    >
      {children}
    </button>
  );
};

export default ToolbarButton;
