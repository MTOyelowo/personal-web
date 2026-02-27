"use client";

import { FC } from "react";
import { BsCheckLg } from "react-icons/bs";

interface Props {
  visible: boolean;
}

const CheckMark: FC<Props> = ({ visible }) => {
  if (!visible) return null;

  return (
    <div className="bg-gray-900/70 p-1.5 text-white rounded-full backdrop-blur-sm">
      <BsCheckLg size={12} />
    </div>
  );
};

export default CheckMark;
