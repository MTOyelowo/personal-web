import type { FC, JSX, ReactNode } from "react";
import Link from "next/link";
import { FiPlus } from "react-icons/fi";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    href: string;
  };
  children?: ReactNode;
}

const PageHeader: FC<PageHeaderProps> = ({
  title,
  description,
  action,
  children,
}): JSX.Element => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        {children}
        {action && (
          <Link
            href={action.href}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            <FiPlus size={16} />
            {action.label}
          </Link>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
