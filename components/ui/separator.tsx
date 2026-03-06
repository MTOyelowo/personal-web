import type { JSX } from "react";

const Separator = (): JSX.Element => {
  return (
    <div className="flex lg:hidden w-[70%] bg-gray-200 dark:bg-gray-700 h-1 rounded-full mx-auto my-4 sm:my-6" />
  );
};

export default Separator;
