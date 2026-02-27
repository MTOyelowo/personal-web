import type { JSX } from "react";

const Separator = (): JSX.Element => {
  return (
    <div className="flex lg:hidden w-[70%] bg-gray-200 h-1 rounded-full mx-auto my-8" />
  );
};

export default Separator;
